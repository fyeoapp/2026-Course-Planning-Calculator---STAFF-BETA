"""Scrapes Engineering Transition Program spring/summer course *offerings*
from the TMU website and writes them under Transition_courses/.

Eligibility prereqs/coreqs are NOT taken from these files. The calculator
loads admit-year rules from Course_requisites/requisites_<admitYear>.json
(see course_requisites_generator.py). This scraper only records which
courses are offered in Spring/Summer for the planning year.

Important — what --year does:
  • Selects which accordion block to scrape on TMU's live transition page
    (heading must match e.g. "Spring 2026 … Engineering … Transition").
  • Sets the output filename: Transition_courses/<season>/<season>_<year>.json

The script does NOT define which courses are offered. It only copies whatever
TMU currently publishes on:
  https://www.torontomu.ca/.../transition-program/

Before running, open that page and confirm a matching "Spring/Summer <YEAR>"
section exists. If the heading is missing, the script exits with no data.

After scraping a new year, update index.html (or planningDefaults.transitionYear)
so the calculator loads the new JSON files.

Examples:
    python3 transition_courses_generator.py --season spring --year 2026
    python3 transition_courses_generator.py --season summer --year 2026
    python3 transition_courses_generator.py --season spring --year 2026 --yes
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

from script_utils import JSON_OVERWRITE_WARNING, confirm_overwrite

ROOT = Path(__file__).resolve().parent
TRANSITION_URL = (
    "https://www.torontomu.ca/engineering-architectural-science/programs/"
    "undergraduate-programs/transition-program/"
)


def output_path(season: str, transition_year: str | int) -> Path:
    season = season.strip().lower()
    year = str(transition_year).strip()
    return ROOT / "Transition_courses" / season / f"{season}_{year}.json"


def extract_courses(season: str, transition_year: str | int) -> Path | None:
    """Extract offering list for the given season and transition year."""
    season = season.strip().lower()
    transition_year = str(transition_year).strip()

    if season not in {"spring", "summer"}:
        raise ValueError(f"Invalid season: {season}. Use spring or summer.")

    response = requests.get(TRANSITION_URL, timeout=(5, 15))
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    heading = rf"{season}\s+{transition_year}.*Engineering.*Architectural Science Transition"
    extracted_data = []

    header_text = soup.find(string=re.compile(heading, re.IGNORECASE))
    if not header_text:
        print(f"Could not find a section matching: {heading}")
        return None

    header_link = header_text.find_parent("a")
    if not header_link:
        print("Found heading but could not locate associated link.")
        return None

    href = header_link.get("href")
    if not href:
        print("Header link does not contain an href attribute.")
        return None

    target_container = soup.find(id=href.replace("#", ""))
    if not target_container:
        print("Found heading, but could not resolve the associated schedule container.")
        return None

    for idx, course in enumerate(target_container.find_all("a", class_="qTipCourse"), start=1):
        href_course = course.get("href", "") or ""
        url = f"https://www.torontomu.ca{href_course.replace('.html', '/')}"
        # Offerings only — requisites come from Course_requisites/ by admit year.
        extracted_data.append({
            "id": idx,
            "anchor_text": course.get_text(strip=True),
            "url": url,
            "raw_html_snippet": str(course),
            "prereqs": [],
            "coreqs": [],
            "antireqs": [],
            "custom_reqs": [],
        })

    print(f"Successfully extracted {len(extracted_data)} course offerings.")

    out_path = output_path(season, transition_year)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(extracted_data, f, ensure_ascii=False, indent=4)

    print(f"Saved data to {out_path}")
    return out_path


TRANSITION_SCRAPE_NOTE = """
What gets scraped:
  Course *offerings* come ONLY from TMU's live Engineering Transition Program
  page (see TRANSITION_URL). The --year flag picks the accordion section whose
  heading matches "<Season> <year> … Transition" — it does not invent offerings.

  Requisites are intentionally left empty here. The calculator applies
  Course_requisites/requisites_<admitYear>.json for prereq/coreq checks.

  Check the TMU page yourself before running. If that section is not published
  yet, the script will fail with "Could not find a section matching …".

  index.html currently loads hardcoded paths like spring_2026.json — after
  scraping a different year, point the app at the new filenames.
""".strip()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape spring/summer transition offerings to Transition_courses/*.json",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"{TRANSITION_SCRAPE_NOTE}\n\n{JSON_OVERWRITE_WARNING}",
    )
    parser.add_argument("--season", required=True, choices=["spring", "summer"], help="Transition season")
    parser.add_argument(
        "--year",
        required=True,
        help=(
            "Transition year: must match a published heading on TMU's transition "
            "page (e.g. 2026 for 'Spring 2026 …') and sets the output filename"
        ),
    )
    parser.add_argument("--yes", "-y", action="store_true", help="Skip overwrite confirmation prompt")
    args = parser.parse_args()

    target = output_path(args.season, args.year)
    if not confirm_overwrite([target], reason=JSON_OVERWRITE_WARNING, force=args.yes):
        print("Cancelled.")
        return

    extract_courses(args.season, args.year)


if __name__ == "__main__":
    main()
