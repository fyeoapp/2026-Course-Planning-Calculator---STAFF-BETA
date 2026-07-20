"""Scrape admit-year course requisites from legacy TMU calendars (2010–2015).

Legacy layouts in Programs_old/ link to subject pages like:

    http://torontomu.ca/calendar/2014-2015/pg3350.html#307716

Those pages list many courses; each course block has subject + catalog number
spans and a cnCoursePrereq field. This script collects codes from layouts for
the given year, fetches each unique page once, and writes the same schema as
the modern scraper:

    Course_requisites/requisites_<year>.json

Usually invoked via course_requisites_generator.py when --year is 2010–2015:

    python3 course_requisites_generator.py --year 2014
    python3 course_requisites_generator.py --years 2010-2015 --yes
"""

from __future__ import annotations

import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
LAYOUT_ROOT = ROOT / "Programs_old"

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "FYEO-Course-Planning-Calculator/1.0 (legacy requisites scraper)"
})

COURSE_CODE_RE = re.compile(r"^([A-Z]{2,4})\s*(\d{2,3}[A-Z]?(?:/[A-Z])?)$", re.I)
YEAR_IN_LAYOUT_RE = re.compile(r"-(\d{4})(?:_|_layout\.html)")
LEGACY_PAGE_RE = re.compile(
    r"^(https?://(?:www\.)?torontomu\.ca)/calendar/(\d{4}-\d{4})/(pg\d+\.html)(?:#(.*))?$",
    re.I,
)
LABEL_PREFIX_RE = re.compile(
    r"^(Prerequisites?|Co-?Requisites?|Antirequisites?|Custom Requisites?)\s*:\s*",
    re.I,
)


def calendar_span(year: int) -> str:
    return f"{year}-{year + 1}"


def normalize_code(text: str) -> str:
    return re.sub(r"\s+", "", (text or "").upper())


def format_code(text: str) -> str:
    raw = re.sub(r"\s+", " ", (text or "").strip())
    m = COURSE_CODE_RE.match(raw.upper())
    if m:
        return f"{m.group(1).upper()} {m.group(2).upper()}"
    spaced = re.sub(r"^([A-Z]{2,4})(\d)", r"\1 \2", normalize_code(raw))
    return spaced


def layout_year(path: Path) -> int | None:
    m = YEAR_IN_LAYOUT_RE.search(path.name)
    return int(m.group(1)) if m else None


def parse_req_text(text: str) -> list:
    """Parse 'A and B or C' style requisite text into the app's JSON shape."""
    text = (text or "").strip()
    text = LABEL_PREFIX_RE.sub("", text).strip()
    if not text or text.lower() == "none":
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
            cleaned = [normalize_code(c) for c in or_choices if c.strip()]
            # Drop tokens that are not course-like
            cleaned = [c for c in cleaned if COURSE_CODE_RE.match(format_code(c))]
            if cleaned:
                parsed.append(cleaned if len(cleaned) > 1 else cleaned[0])
        else:
            course = normalize_code(part)
            if COURSE_CODE_RE.match(format_code(course)):
                parsed.append(course)
    return parsed


def normalize_legacy_url(href: str, year: int) -> tuple[str, str] | None:
    """Return (page_url_without_fragment, fragment_id) or None."""
    if not href:
        return None
    href = href.strip()
    if href.startswith("//"):
        href = "https:" + href
    if href.startswith("/"):
        href = urljoin("https://www.torontomu.ca", href)
    if href.startswith("http://torontomu.ca"):
        href = "https://www.torontomu.ca" + href[len("http://torontomu.ca"):]
    if href.startswith("http://www.torontomu.ca"):
        href = "https://www.torontomu.ca" + href[len("http://www.torontomu.ca"):]

    # Relative pgNNNN.html#id on a calendar page
    if re.match(r"^pg\d+\.html", href, re.I):
        href = f"https://www.torontomu.ca/calendar/{calendar_span(year)}/{href}"

    m = LEGACY_PAGE_RE.match(href)
    if not m:
        # Allow missing host already handled; try softer match
        path = urlparse(href).path
        frag = urlparse(href).fragment
        pm = re.search(r"/(pg\d+\.html)$", path, re.I)
        if not pm:
            return None
        page = f"https://www.torontomu.ca/calendar/{calendar_span(year)}/{pm.group(1)}"
        return page, frag or ""

    page = f"https://www.torontomu.ca/calendar/{m.group(2)}/{m.group(3)}"
    return page, (m.group(4) or "")


def collect_legacy_targets(year: int) -> dict[str, dict]:
    """
    Map normalize(code) -> {anchor_text, page_url, fragment, sources}
    from Programs_old layouts for that year.
    """
    targets: dict[str, dict] = {}
    if not LAYOUT_ROOT.is_dir():
        return targets

    for path in sorted(LAYOUT_ROOT.rglob("*_layout.html")):
        if layout_year(path) != year:
            continue
        soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
        rel = str(path.relative_to(ROOT))
        for a in soup.select("a.qTipCourse"):
            code = normalize_code(a.get_text(strip=True))
            if not code:
                continue
            parsed = normalize_legacy_url(a.get("href") or "", year)
            if not parsed:
                continue
            page, frag = parsed
            existing = targets.get(code)
            if not existing:
                targets[code] = {
                    "anchor_text": format_code(a.get_text(strip=True)),
                    "page_url": page,
                    "fragment": frag,
                    "sources": [rel],
                }
            elif rel not in existing["sources"]:
                existing["sources"].append(rel)
                # Prefer a URL that includes a fragment if we didn't have one
                if not existing.get("fragment") and frag:
                    existing["page_url"] = page
                    existing["fragment"] = frag

    print(
        f"Collected {len(targets)} legacy course targets for {calendar_span(year)} "
        f"from Programs_old layouts."
    )
    return targets


def _field_kind(el) -> str | None:
    eid = (el.get("id") or "").lower()
    text = el.get_text(" ", strip=True)
    low = text.lower()
    if eid.endswith("cncourseprereq") or low.startswith("prerequisite"):
        return "prereqs"
    if "coreq" in eid or low.startswith("co-requisite") or low.startswith("corequisite"):
        return "coreqs"
    if "antireq" in eid or low.startswith("antirequisite"):
        return "antireqs"
    if low.startswith("custom requisite"):
        return "custom_reqs"
    return None


def parse_legacy_page(soup: BeautifulSoup, page_url: str) -> dict[str, dict]:
    """Parse all courses on a legacy subject page -> normalize(code) -> requisites row."""
    by_code: dict[str, dict] = {}
    by_fragment: dict[str, dict] = {}

    for a in soup.select("a[name]"):
        frag = a.get("name") or ""
        nxt_name = a.find_next("a", attrs={"name": True})

        subject = None
        number = None
        title = ""
        reqs = {"prereqs": [], "coreqs": [], "antireqs": [], "custom_reqs": []}

        for el in a.next_elements:
            if el is nxt_name:
                break
            if not getattr(el, "get", None):
                continue
            classes = el.get("class") or []
            if "course-code" in classes:
                txt = el.get_text(" ", strip=True)
                if subject is None:
                    subject = txt
                elif number is None:
                    number = txt
            elif "course-title" in classes and not title:
                title = el.get_text(" ", strip=True)
            elif "course-prereq" in classes:
                kind = _field_kind(el)
                if kind:
                    parsed = parse_req_text(el.get_text(" ", strip=True))
                    if parsed:
                        reqs[kind] = parsed

        if not subject or not number:
            continue
        code_key = normalize_code(f"{subject}{number}")
        if not COURSE_CODE_RE.match(format_code(code_key)):
            continue

        url = f"{page_url}#{frag}" if frag else page_url
        row = {
            "anchor_text": format_code(f"{subject} {number}"),
            "url": url,
            "title": title,
            "prereqs": reqs["prereqs"],
            "coreqs": reqs["coreqs"],
            "antireqs": reqs["antireqs"],
            "custom_reqs": reqs["custom_reqs"],
            "fragment": frag,
        }
        by_code[code_key] = row
        if frag:
            by_fragment[frag] = row

    return {"by_code": by_code, "by_fragment": by_fragment}


def scrape_legacy_requisites(year: int, delay_s: float = 0.15) -> list[dict]:
    if year < 2010 or year > 2015:
        raise ValueError(f"Legacy scraper only supports 2010–2015 (got {year})")

    targets = collect_legacy_targets(year)
    if not targets:
        print(f"No Programs_old layout courses found for {year}.")
        return []

    pages: dict[str, list[str]] = {}
    for code, meta in targets.items():
        pages.setdefault(meta["page_url"], []).append(code)

    page_cache: dict[str, dict] = {}
    failures: list[tuple[str, str]] = []

    for idx, (page_url, codes) in enumerate(sorted(pages.items()), start=1):
        try:
            resp = SESSION.get(page_url, timeout=(5, 25))
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            page_cache[page_url] = parse_legacy_page(soup, page_url)
            print(f"[{idx}/{len(pages)}] parsed {page_url} ({len(page_cache[page_url]['by_code'])} courses)")
        except Exception as e:
            failures.append((page_url, str(e)))
            print(f"[{idx}/{len(pages)}] FAIL {page_url}: {e}")
            page_cache[page_url] = {"by_code": {}, "by_fragment": {}}
        time.sleep(delay_s)

    extracted: list[dict] = []
    missing: list[str] = []

    for code, meta in sorted(targets.items(), key=lambda kv: kv[0]):
        parsed = page_cache.get(meta["page_url"], {})
        row = None
        frag = meta.get("fragment") or ""
        if frag and frag in parsed.get("by_fragment", {}):
            row = parsed["by_fragment"][frag]
        elif code in parsed.get("by_code", {}):
            row = parsed["by_code"][code]

        if not row:
            missing.append(code)
            extracted.append({
                "id": len(extracted) + 1,
                "anchor_text": meta["anchor_text"],
                "url": f"{meta['page_url']}#{frag}" if frag else meta["page_url"],
                "prereqs": [],
                "coreqs": [],
                "antireqs": [],
                "custom_reqs": [],
            })
            continue

        extracted.append({
            "id": len(extracted) + 1,
            "anchor_text": row["anchor_text"],
            "url": row["url"],
            "prereqs": row["prereqs"],
            "coreqs": row["coreqs"],
            "antireqs": row["antireqs"],
            "custom_reqs": row["custom_reqs"],
        })

    if missing:
        print(f"{len(missing)} courses had no match on their legacy page (empty prereqs):")
        for code in missing[:20]:
            print(f"  - {code}")
        if len(missing) > 20:
            print(f"  ... and {len(missing) - 20} more")

    if failures:
        print(f"{len(failures)} page fetches failed.")

    return extracted
