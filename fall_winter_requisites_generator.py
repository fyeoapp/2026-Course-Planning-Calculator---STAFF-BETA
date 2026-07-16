"""Scrape current-calendar requisites for Fall/Winter planning.

Collects unique course codes from Programs/ and Programs_old/ layout files,
resolves each to a 2026–2027 (or chosen year) course page URL, scrapes
prerequisites / corequisites / antirequisites / custom requisites, and writes:

    Fall_Winter_courses/requisites_<year>.json

Re-run this script when the annual calendar is updated so Fall/Winter
eligibility stays current. Transition scrapes are separate
(transition_courses_generator.py) and are not modified here.

Example:
    python3 fall_winter_requisites_generator.py
    python3 fall_winter_requisites_generator.py --year 2026
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
LAYOUT_ROOTS = [ROOT / "Programs", ROOT / "Programs_old"]
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


def parse_requisites(requisites_block):
    """Same shape as transition_courses_generator.parse_requisites."""
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

    def parse_req_text(p_tag):
        if not p_tag:
            return []
        text = p_tag.get_text(separator=" ", strip=True)
        if text.lower() == "none" or not text:
            return []

        text = text.replace("(", "").replace(")", "")
        and_parts = re.split(r"\band\b|,", text, flags=re.IGNORECASE)
        parsed = []
        for part in and_parts:
            part = part.strip()
            if not part:
                continue
            if re.search(r"\bor\b", part, flags=re.IGNORECASE):
                or_choices = re.split(r"\bor\b", part, flags=re.IGNORECASE)
                cleaned = [c.strip().replace(" ", "") for c in or_choices if c.strip()]
                if cleaned:
                    parsed.append(cleaned)
            else:
                course = part.replace(" ", "")
                if course:
                    parsed.append(course)
        return parsed

    for div in requisites_block.find_all(class_="requisites"):
        heading = div.find("h3")
        if not heading:
            continue
        key = key_map.get(heading.get_text(strip=True))
        if not key:
            continue
        result[key] = parse_req_text(div.find("p"))
    return result


def normalize_code(text: str) -> str:
    return re.sub(r"\s+", "", (text or "").upper())


def format_code(text: str) -> str:
    raw = re.sub(r"\s+", " ", (text or "").strip())
    m = COURSE_CODE_RE.match(raw.upper().replace("  ", " "))
    if m:
        return f"{m.group(1).upper()} {m.group(2).upper()}"
    spaced = re.sub(r"^([A-Z]{2,4})(\d)", r"\1 \2", normalize_code(raw))
    return spaced


def calendar_span(year: int) -> str:
    return f"{year}-{year + 1}"


def to_fetch_url(href: str, year: int) -> str | None:
    """Normalize a layout href into a fetchable current-calendar course URL."""
    if not href:
        return None
    href = href.strip()
    if href.startswith("//"):
        href = "https:" + href
    if href.startswith("/"):
        href = urljoin("https://www.torontomu.ca", href)

    m = MODERN_COURSES_RE.match(href)
    if m:
        host, _old_span, rest = m.group(1), m.group(2), m.group(3)
        # Prefer www + https; drop .html for cleaner directory URL used by transition scrape
        rest = rest.replace(".html", "/")
        if not rest.endswith("/"):
            rest += "/"
        return f"https://www.torontomu.ca/content/ryerson/calendar/{calendar_span(year)}/courses/{rest}"

    return None


def build_subject_slug_map(code_to_url: dict[str, str]) -> dict[str, str]:
    """Map subject prefix (AER, CEN, …) → department slug from known modern URLs."""
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


def collect_layout_courses(year: int) -> dict[str, dict]:
    """
    Return {NORMALIZED_CODE: {anchor_text, url, sources}} preferring modern URLs.
    """
    courses: dict[str, dict] = {}
    pending_old: dict[str, str] = {}  # code -> sample old href (for invent later)

    for layout_root in LAYOUT_ROOTS:
        if not layout_root.is_dir():
            continue
        for path in sorted(layout_root.rglob("*_layout.html")):
            soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
            for a in soup.select("a.qTipCourse"):
                anchor = format_code(a.get_text(strip=True))
                key = normalize_code(anchor)
                if not key:
                    continue
                href = a.get("href") or ""
                modern = to_fetch_url(href, year)
                rel = str(path.relative_to(ROOT))
                if modern:
                    existing = courses.get(key)
                    if not existing or "/calendar/" + calendar_span(year) not in existing.get("url", ""):
                        courses[key] = {
                            "anchor_text": anchor,
                            "url": modern,
                            "sources": [rel],
                        }
                    elif rel not in existing["sources"]:
                        existing["sources"].append(rel)
                else:
                    pending_old.setdefault(key, href)

    subject_slugs = build_subject_slug_map({k: v["url"] for k, v in courses.items()})

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

    print(f"Collected {len(courses)} unique course URLs for {calendar_span(year)} "
          f"({invented} invented from subject slug for old-calendar-only codes).")
    still_missing = [k for k in pending_old if k not in courses]
    if still_missing:
        print(f"Skipped {len(still_missing)} codes with no resolvable {calendar_span(year)} URL "
              f"(sample: {still_missing[:10]})")
    return courses


def fetch_requisites(url: str) -> dict:
    resp = SESSION.get(url, timeout=(5, 20))
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    block = soup.find(class_="requisitesBlock")
    return parse_requisites(block)


def scrape_requisites(year: int, delay_s: float = 0.15) -> list[dict]:
    collected = collect_layout_courses(year)
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


def save_requisites(courses: list[dict], year: int) -> Path:
    out_dir = ROOT / "Fall_Winter_courses"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"requisites_{year}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=4)
    print(f"Saved {len(courses)} courses → {out_path}")
    return out_path


def main():
    parser = argparse.ArgumentParser(description="Scrape Fall/Winter course requisites.")
    parser.add_argument("--year", type=int, default=2026, help="Calendar start year (default 2026)")
    parser.add_argument("--delay", type=float, default=0.15, help="Delay between requests (seconds)")
    args = parser.parse_args()

    courses = scrape_requisites(args.year, delay_s=args.delay)
    save_requisites(courses, args.year)


if __name__ == "__main__":
    main()
