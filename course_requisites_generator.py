"""Scrape course requisites for a given admit/calendar year.

Used by Fall, Winter, and Spring/Summer (Transition) eligibility so prereq/
coreq checks follow the student's admit-year calendar — not only the current
planning year's course pages.

  • 2016+  — modern calendar course pages (Programs/ + transition codes)
  • 2010–2015 — legacy calendar subject pages (Programs_old/) via
    legacy_course_requisites_generator.py

Writes:

    Course_requisites/requisites_<year>.json

Examples:
    python3 course_requisites_generator.py --year 2024
    python3 course_requisites_generator.py --year 2014
    python3 course_requisites_generator.py --years 2010-2015 --yes
    python3 course_requisites_generator.py --years 2016-2026 --yes
"""

from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from script_utils import JSON_OVERWRITE_WARNING, confirm_overwrite

ROOT = Path(__file__).resolve().parent
LAYOUT_ROOTS = [ROOT / "Programs", ROOT / "Programs_old"]
TRANSITION_JSONS = [
    ROOT / "Transition_courses" / "spring" / "spring_2026.json",
    ROOT / "Transition_courses" / "summer" / "summer_2026.json",
]
OUT_DIR = ROOT / "Course_requisites"

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "FYEO-Course-Planning-Calculator/1.0 (requisites scraper)"
})

COURSE_CODE_RE = re.compile(r"^([A-Z]{2,4})\s*(\d{2,3}[A-Z]?(?:/[A-Z])?)$", re.I)
MODERN_COURSES_RE = re.compile(
    r"^(https?://(?:www\.)?torontomu\.ca)/content/ryerson/calendar/"
    r"(\d{4}-\d{4})/courses/(.+)$",
    re.I,
)
YEAR_IN_LAYOUT_RE = re.compile(r"-(\d{4})(?:_|_layout\.html)")
# Labels sometimes jammed into Custom Requisites, e.g.
# "Prerequisites: BME 100 and …; Antirequisite; MEC 323"
CUSTOM_LABEL_RE = re.compile(
    r"(Prerequisites?|Co-?Requisites?|Antirequisites?)\s*:?\s*",
    re.I,
)
COURSE_TOKEN_RE = re.compile(r"^[A-Z]{2,4}\d{2,4}[A-Z]?(?:/[A-Z])?$")


def normalize_code(text: str) -> str:
    return re.sub(r"\s+", "", (text or "").upper())


def format_code(text: str) -> str:
    raw = re.sub(r"\s+", " ", (text or "").strip())
    m = COURSE_CODE_RE.match(raw.upper().replace("  ", " "))
    if m:
        return f"{m.group(1).upper()} {m.group(2).upper()}"
    spaced = re.sub(r"^([A-Z]{2,4})(\d)", r"\1 \2", normalize_code(raw))
    return spaced


def _is_course_token(code: str) -> bool:
    """Accept normal catalog codes (incl. rare 4-digit antireqs like CV8505)."""
    c = normalize_code(code)
    if not c:
        return False
    if COURSE_CODE_RE.match(format_code(c)):
        return True
    return bool(COURSE_TOKEN_RE.match(c))


def _parse_and_clause(text: str) -> list:
    """Parse one AND-group: 'A and B or C, D' → [A, [B,C], D].

    Nested arrays mean OR of single courses. Used for both simple requisites and
    each branch of a top-level (group) or (group) expression.
    """
    text = (text or "").replace("(", "").replace(")", "")
    text = text.replace(";", " ")
    and_parts = re.split(r"\band\b|,", text, flags=re.IGNORECASE)
    parsed: list = []
    for part in and_parts:
        part = part.strip()
        if not part:
            continue
        if re.search(r"\bor\b", part, flags=re.IGNORECASE):
            or_choices = re.split(r"\bor\b", part, flags=re.IGNORECASE)
            cleaned = [
                normalize_code(c)
                for c in or_choices
                if _is_course_token(c)
            ]
            if cleaned:
                parsed.append(cleaned if len(cleaned) > 1 else cleaned[0])
        else:
            course = normalize_code(part)
            if _is_course_token(course):
                parsed.append(course)
    return parsed


def parse_req_list_text(text: str):
    """Parse requisite text into the app's JSON shape.

    Shapes:
      - list: AND of course codes / OR-pairs, e.g. ["A", ["B","C"]]
      - {"or": [group, group, ...]}: OR of AND-groups, for calendar text like
        "(A, B, C) or (D, E, F)".

    Important: do NOT strip parentheses before detecting top-level group ORs.
    Older logic removed () first, then split on commas, which turned
    "(A, B, PCS 224) or (CEN 199, C, D)" into a single AND-list with a bogus
    ["PCS224","CEN199"] OR at the path boundary (see MEC 511 2010–2020).
    """
    text = (text or "").strip()
    text = re.sub(
        r"^(Prerequisites?|Co-?Requisites?|Antirequisites?)\s*:?\s*",
        "",
        text,
        flags=re.I,
    ).strip()
    if not text or text.lower() == "none":
        return []

    # Top-level OR of parenthesized AND-groups: ( ... ) or ( ... )
    if re.search(r"\)\s*or\s*\(", text, flags=re.IGNORECASE):
        chunks = re.split(r"\)\s*or\s*\(", text, flags=re.IGNORECASE)
        groups = []
        for i, chunk in enumerate(chunks):
            chunk = chunk.strip()
            if i == 0:
                chunk = re.sub(r"^\(+", "", chunk)
            if i == len(chunks) - 1:
                chunk = re.sub(r"\)+\s*$", "", chunk)
            group = _parse_and_clause(chunk)
            if group:
                groups.append(group)
        if len(groups) >= 2:
            return {"or": groups}
        if len(groups) == 1:
            return groups[0]

    return _parse_and_clause(text)


def promote_embedded_custom_requisites(result: dict, custom_text: str) -> None:
    """Promote Custom Requisites that embed Prerequisites:/Antirequisites:/etc.

    Some calendar pages set Prerequisites/Antirequisites to "None" and put the
    real rules only under Custom Requisites. Without promotion, eligibility sees
    empty prereqs and incorrectly treats the course as unrestricted.
    """
    custom_text = (custom_text or "").strip()
    if not custom_text or custom_text.lower() == "none":
        result["custom_reqs"] = []
        return

    if not CUSTOM_LABEL_RE.search(custom_text):
        result["custom_reqs"] = parse_req_list_text(custom_text)
        return

    # "AntirequisiteCV8505" / "Antirequisite; MEC 323" → separable labels
    softened = re.sub(
        r"(?i)(Prerequisites?|Co-?Requisites?|Antirequisites?)(?=[A-Z]{2,4}\d)",
        r"\1: ",
        custom_text,
    )
    softened = re.sub(
        r"(?i)(Prerequisites?|Co-?Requisites?|Antirequisites?)\s*;\s*",
        r"\1: ",
        softened,
    )

    pieces = CUSTOM_LABEL_RE.split(softened)
    promoted = False
    i = 1
    while i < len(pieces):
        label = pieces[i].strip().lower()
        body = pieces[i + 1] if i + 1 < len(pieces) else ""
        compact = re.sub(r"[^a-z]", "", label)
        if compact.startswith("prereq"):
            key = "prereqs"
        elif compact.startswith("coreq"):
            key = "coreqs"
        elif compact.startswith("antireq"):
            key = "antireqs"
        else:
            i += 2
            continue

        parsed = parse_req_list_text(body)
        if parsed:
            # Structured heading said None → fill from custom. If already filled
            # (rare), keep existing structured values.
            if not result[key]:
                result[key] = parsed
            promoted = True
        i += 2

    result["custom_reqs"] = [] if promoted else parse_req_list_text(custom_text)


def parse_requisites(requisites_block):
    result = {
        "prereqs": [],
        "coreqs": [],
        "antireqs": [],
        "custom_reqs": [],
    }
    if not requisites_block:
        return result

    key_map = {
        "Prerequisites": "prereqs",
        "Co-Requisites": "coreqs",
        "Antirequisites": "antireqs",
        "Custom Requisites": "custom_reqs",
    }

    custom_raw = None
    for div in requisites_block.find_all(class_="requisites"):
        heading = div.find("h3")
        if not heading:
            continue
        key = key_map.get(heading.get_text(strip=True))
        if not key:
            continue
        p_tag = div.find("p")
        text = p_tag.get_text(separator=" ", strip=True) if p_tag else ""
        if key == "custom_reqs":
            custom_raw = text
        else:
            result[key] = parse_req_list_text(text)

    if custom_raw is not None:
        promote_embedded_custom_requisites(result, custom_raw)

    return result


def calendar_span(year: int) -> str:
    return f"{year}-{year + 1}"


def to_fetch_url(href: str, year: int) -> str | None:
    if not href:
        return None
    href = href.strip()
    if href.startswith("//"):
        href = "https:" + href
    if href.startswith("/"):
        href = urljoin("https://www.torontomu.ca", href)

    m = MODERN_COURSES_RE.match(href)
    if m:
        rest = m.group(3).replace(".html", "/")
        if not rest.endswith("/"):
            rest += "/"
        return f"https://www.torontomu.ca/content/ryerson/calendar/{calendar_span(year)}/courses/{rest}"
    return None


def build_subject_slug_map(code_to_url: dict[str, str]) -> dict[str, str]:
    subject_slugs: dict[str, str] = {}
    for code, url in code_to_url.items():
        m = COURSE_CODE_RE.match(format_code(code))
        if not m:
            continue
        subject = m.group(1).upper()
        path_m = re.search(r"/courses/([^/]+)/", url)
        if path_m and subject not in subject_slugs:
            subject_slugs[subject] = path_m.group(1)
    return subject_slugs


def invent_url_from_slug(code: str, subject_slugs: dict[str, str], year: int) -> str | None:
    m = COURSE_CODE_RE.match(format_code(code))
    if not m:
        return None
    subject, number = m.group(1).upper(), m.group(2).upper()
    slug = subject_slugs.get(subject)
    if not slug:
        return None
    return (
        f"https://www.torontomu.ca/content/ryerson/calendar/{calendar_span(year)}"
        f"/courses/{slug}/{subject}/{number}/"
    )


def layout_year(path: Path) -> int | None:
    m = YEAR_IN_LAYOUT_RE.search(path.name)
    return int(m.group(1)) if m else None


def add_course(courses: dict, pending_old: dict, anchor: str, href: str, year: int, source: str) -> None:
    key = normalize_code(anchor)
    if not key:
        return
    modern = to_fetch_url(href, year)
    if modern:
        existing = courses.get(key)
        if not existing or calendar_span(year) not in existing.get("url", ""):
            courses[key] = {
                "anchor_text": format_code(anchor),
                "url": modern,
                "sources": [source],
            }
        elif source not in existing["sources"]:
            existing["sources"].append(source)
    else:
        pending_old.setdefault(key, href or "")


def collect_courses_for_year(year: int) -> dict[str, dict]:
    """Courses from that year's layouts + transition offering codes."""
    courses: dict[str, dict] = {}
    pending_old: dict[str, str] = {}

    for layout_root in LAYOUT_ROOTS:
        if not layout_root.is_dir():
            continue
        for path in sorted(layout_root.rglob("*_layout.html")):
            if layout_year(path) != year:
                continue
            soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
            rel = str(path.relative_to(ROOT))
            for a in soup.select("a.qTipCourse"):
                add_course(courses, pending_old, a.get_text(strip=True), a.get("href") or "", year, rel)

    # Ensure transition offerings are covered even when missing from a given admit layout
    for json_path in TRANSITION_JSONS:
        if not json_path.is_file():
            continue
        try:
            data = json.loads(json_path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"Warning: could not read {json_path}: {e}")
            continue
        rel = str(json_path.relative_to(ROOT))
        for row in data:
            add_course(
                courses,
                pending_old,
                row.get("anchor_text") or "",
                row.get("url") or "",
                year,
                rel,
            )

    subject_slugs = build_subject_slug_map({k: v["url"] for k, v in courses.items()})
    # Seed common slugs if layouts for this year are sparse
    subject_slugs.setdefault("CHE", "chemical-engineering")
    subject_slugs.setdefault("COE", "computer-engineering")
    subject_slugs.setdefault("MTH", "mathematics")
    subject_slugs.setdefault("CEN", "common-engineering")
    subject_slugs.setdefault("ELE", "electrical-engineering")
    subject_slugs.setdefault("CVL", "civil-engineering")
    subject_slugs.setdefault("MEC", "mechanical-engineering")
    subject_slugs.setdefault("AER", "aerospace")
    subject_slugs.setdefault("BME", "biomedical-engineering")
    subject_slugs.setdefault("IND", "industrial-engineering")
    subject_slugs.setdefault("CPS", "computer-science")
    subject_slugs.setdefault("PCS", "physics")
    subject_slugs.setdefault("CHY", "chemistry")
    subject_slugs.setdefault("ECN", "economics")
    subject_slugs.setdefault("CMN", "communication")
    subject_slugs.setdefault("EES", "electrical-engineering")
    subject_slugs.setdefault("MTL", "mechanical-engineering")

    invented = 0
    for key, old_href in pending_old.items():
        if key in courses:
            continue
        url = invent_url_from_slug(key, subject_slugs, year)
        if not url:
            continue
        courses[key] = {
            "anchor_text": format_code(key),
            "url": url,
            "sources": ["invented_from_subject_slug", old_href],
        }
        invented += 1

    # Invent URLs for transition codes that had modern URLs remapped already —
    # pending_old only has non-modern. Transition codes with remapped URLs are in courses.
    print(
        f"Collected {len(courses)} unique course URLs for {calendar_span(year)} "
        f"({invented} invented from subject slug)."
    )
    still_missing = [k for k in pending_old if k not in courses]
    if still_missing:
        print(
            f"Skipped {len(still_missing)} codes with no resolvable URL "
            f"(sample: {still_missing[:10]})"
        )
    return courses


def fetch_requisites(url: str) -> dict:
    resp = SESSION.get(url, timeout=(5, 20))
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    block = soup.find(class_="requisitesBlock")
    return parse_requisites(block)


def scrape_requisites(year: int, delay_s: float = 0.15) -> list[dict]:
    if year <= 2015:
        from legacy_course_requisites_generator import scrape_legacy_requisites

        return scrape_legacy_requisites(year, delay_s=delay_s)

    collected = collect_courses_for_year(year)
    extracted: list[dict] = []
    failures: list[tuple[str, str]] = []

    for idx, key in enumerate(sorted(collected.keys()), start=1):
        meta = collected[key]
        url = meta["url"]
        try:
            reqs = fetch_requisites(url)
        except Exception as e:
            failures.append((meta["anchor_text"], f"{url} | {e}"))
            print(f"[{idx}/{len(collected)}] FAIL {meta['anchor_text']}: {e}")
            continue

        extracted.append({
            "id": len(extracted) + 1,
            "anchor_text": meta["anchor_text"],
            "url": url,
            "prereqs": reqs["prereqs"],
            "coreqs": reqs["coreqs"],
            "antireqs": reqs["antireqs"],
            "custom_reqs": reqs["custom_reqs"],
        })
        if idx % 25 == 0 or idx == len(collected):
            print(f"[{idx}/{len(collected)}] scraped {meta['anchor_text']}")
        time.sleep(delay_s)

    if failures:
        print(f"\n{len(failures)} courses failed to scrape:")
        for code, err in failures[:20]:
            print(f"  - {code}: {err}")
        if len(failures) > 20:
            print(f"  ... and {len(failures) - 20} more")

    return extracted


def output_path(year: int) -> Path:
    return OUT_DIR / f"requisites_{year}.json"


def save_requisites(courses: list[dict], year: int) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = output_path(year)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=4)
    print(f"Saved {len(courses)} courses → {out_path}")
    return out_path


def parse_years(args) -> list[int]:
    if args.years:
        years: list[int] = []
        for part in args.years.split(","):
            text = part.strip()
            if not text:
                continue
            if "-" in text:
                start_s, end_s = text.split("-", 1)
                start, end = int(start_s), int(end_s)
                if end < start:
                    raise ValueError(f"Invalid --years range: {text}")
                years.extend(range(start, end + 1))
            else:
                years.append(int(text))
        return years
    return [args.year]


def main():
    parser = argparse.ArgumentParser(
        description="Scrape admit-year course requisites into Course_requisites/requisites_<year>.json",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Eligibility (Fall/Winter/Transition) loads requisites for the student's "
            "admit year from these files.\n\n" + JSON_OVERWRITE_WARNING
        ),
    )
    parser.add_argument("--year", type=int, default=2026, help="Single calendar start year (default 2026)")
    parser.add_argument(
        "--years",
        help="Year list or range instead of --year (e.g. 2016-2026 or 2022,2023,2024)",
    )
    parser.add_argument("--delay", type=float, default=0.12, help="Delay between requests (seconds)")
    parser.add_argument("--yes", "-y", action="store_true", help="Skip overwrite confirmation prompt")
    args = parser.parse_args()

    years = parse_years(args)
    targets = [output_path(y) for y in years]
    if not confirm_overwrite(targets, reason=JSON_OVERWRITE_WARNING, force=args.yes):
        print("Cancelled.")
        return

    for year in years:
        print(f"\n=== Scraping requisites for {calendar_span(year)} ===")
        courses = scrape_requisites(year, delay_s=args.delay)
        save_requisites(courses, year)


if __name__ == "__main__":
    main()
