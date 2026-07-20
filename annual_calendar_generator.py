"""Scrape TMU calendar pages and generate modern curriculum layout HTML (Programs/).

WARNING: Re-running overwrites existing layout files and removes manual edits
made directly in the HTML (checkbox tweaks, added courses, URL fixes, etc.).
See script_utils.LAYOUT_OVERWRITE_WARNING and README maintainer notes.

Examples:
    python3 annual_calendar_generator.py --year 2027
    python3 annual_calendar_generator.py --year 2027 --program Computer
    python3 annual_calendar_generator.py --year 2027 --yes
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from script_utils import LAYOUT_OVERWRITE_WARNING, confirm_overwrite

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "programs_config.json"


def load_programs_config() -> dict:
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def programs_for_generator(config: dict, program_id: str | None) -> dict[str, str]:
    """Map calendar display name → URL slug for selected program(s)."""
    selected = []
    for program in config["programs"]:
        if program_id is None or program["id"] == program_id:
            selected.append(program)
    if program_id and not selected:
        raise ValueError(f"Unknown program id: {program_id}")
    return {p["calendarName"]: p["calendarSlug"] for p in selected}


def layout_output_path(program_id: str, calendar_year: int) -> Path:
    return ROOT / "Programs" / program_id / f"{program_id}-{calendar_year}_layout.html"


def save_program_layouts_flat(programs_list: dict[str, str], calendar_year: int) -> list[Path]:
    """Generate layout HTML for each program. Returns paths written."""
    calendar_link = f"https://www.torontomu.ca/calendar/{calendar_year}-{calendar_year + 1}/programs/feas/"
    semester_range_pattern = re.compile(
        r"((1st\s*&\s*2nd)|(3rd\s*&\s*4th)|(5th\s*&\s*6th)|(7th\s*&\s*8th))\s*Semester",
        re.IGNORECASE,
    )
    semester_pattern = re.compile(
        r"(1st|2nd|3rd|4th|5th|6th|7th|8th)\s+Semester",
        re.IGNORECASE,
    )

    written: list[Path] = []

    for program, url_slug in programs_list.items():
        try:
            response = requests.get(f"{calendar_link}{url_slug}", timeout=(5, 10))
            response.raise_for_status()
        except Exception as e:
            print(f"Error fetching data for program '{program}' at URL: {calendar_link}{url_slug}")
            print(e)
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        all_panels = soup.find_all("div", class_=["panel", "panel-default"])

        final_parts = []
        panel_counter = 0
        common_panel_index = None

        program_keywords = f"{program.split(' ')[0]}.*{program.split(' ')[-1]}"
        program_pattern = re.compile(program_keywords, re.IGNORECASE)
        common_pattern = re.compile("common.*first", re.IGNORECASE)

        for panel in all_panels:
            for img in panel.select("p img[src]"):
                img.decompose()

            heading_zone = panel.find("div", class_="panel-heading")
            panel_body = panel.find("div", class_="panel-body")
            if not heading_zone or not panel_body:
                continue

            body_text = panel_body.get_text(" ", strip=True)
            is_valid_course_panel = (
                semester_range_pattern.search(body_text)
                and len(semester_pattern.findall(body_text)) >= 2
                and panel_body.find("a", class_="qTipCourse")
            )
            if not is_valid_course_panel:
                continue

            heading_text = heading_zone.get_text(strip=True)
            if common_panel_index is None and (
                common_pattern.search(heading_text) or program_pattern.search(heading_text)
            ):
                common_panel_index = panel_counter

            for a_tag in panel_body.find_all("a", class_="qTipCourse"):
                if a_tag.find_parent("small") or re.compile(".*WKT.*", re.IGNORECASE).search(a_tag.text):
                    continue

                course_code = a_tag.get_text(strip=True)
                checkbox = soup.new_tag("input", type="checkbox", value=course_code)
                checkbox["class"] = "course-checkbox"
                checkbox["data-panel-owner"] = str(panel_counter)

                label = soup.new_tag("label")
                label.append(checkbox)

                new_a = soup.new_tag("a", href=a_tag.get("href"))
                new_a["class"] = a_tag.get("class", [])
                new_a.string = course_code

                label.append(new_a)
                a_tag.replace_with(label)

            for ul in panel_body.find_all("ul"):
                ul["style"] = "list-style: none; padding-left: 0; margin: 0;"

            # Drop TMU calendar jQuery popover leftovers — they need $ / addCoursePopover
            # from the live calendar site and only spam the console in our iframe.
            for script in list(panel_body.find_all("script")):
                text = script.get_text() or ""
                if "addCoursePopover" in text or "$(document)" in text or "jQuery" in text:
                    script.decompose()

            base_url = "http://torontomu.ca"
            for tag in panel_body.find_all(href=True):
                href = tag.get("href")
                if not href or href.startswith(("#", "mailto:", "http://", "https://")):
                    continue
                tag["href"] = urljoin(base_url, href)

            panel_html = f"""
           <div class="panel panel-default" data-panel-container-id="{panel_counter}">
               <div class="panel-heading"><h4>{heading_text}</h4></div>
               <div class="panel-body">
                   {panel_body.decode_contents()}
               </div>
           </div>
           """
            final_parts.append(panel_html)
            panel_counter += 1

        protected_idx = common_panel_index if common_panel_index is not None else 0
        script_tag = f"""
       <script>
       document.addEventListener("DOMContentLoaded", () => {{
           const protectedIndex = {protected_idx};

           document.addEventListener("change", (e) => {{
               if (!e.target.classList.contains('course-checkbox') || !e.target.checked) return;

               const currentPanel = parseInt(e.target.dataset.panelOwner);

               if (currentPanel !== protectedIndex) {{
                   document.querySelectorAll(".course-checkbox").forEach(cb => {{
                       const targetPanel = parseInt(cb.dataset.panelOwner);
                       if (targetPanel !== protectedIndex && targetPanel !== currentPanel) {{
                           cb.checked = false;
                       }}
                   }});

                   if(window.parent && window.parent.document) {{
                      window.parent.document.querySelectorAll('button[data-semester]').forEach(btn => {{
                          const semAttr = btn.getAttribute('data-semester');
                          if(semAttr && !semAttr.startsWith('panel-' + currentPanel + '-')) {{
                              btn.textContent = 'Select All';
                          }}
                      }});
                   }}
               }}
           }});
       }});
       </script>
       """
        final_parts.append(script_tag)

        combined_html = "".join(final_parts)
        inner_soup = BeautifulSoup(combined_html, "html.parser")
        legible_html = inner_soup.prettify()

        program_name = program.split(" ")[0]
        out_path = layout_output_path(program_name, calendar_year)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        with open(out_path, "w", encoding="utf-8") as html_file:
            html_file.write(f"<!--This file was generated using {Path(__file__).name} -->\n")
            html_file.write("<!DOCTYPE html>\n")
            html_file.write('<meta charset="UTF-8">\n')
            html_file.write('<base target="_blank">\n')
            html_file.write('<div class="scoped bootstrap" style="padding: 20px;">\n')
            html_file.write(
                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">\n'
            )
            html_file.write(legible_html)
            html_file.write("</div>")

        written.append(out_path)
        print(f"Successfully created file: {out_path} (from program '{program}')")

    return written


def refresh_manifest(quiet: bool = True) -> None:
    cmd = [sys.executable, str(ROOT / "build_curriculum_manifest.py")]
    if quiet:
        cmd.append("--quiet")
    subprocess.run(cmd, check=True, cwd=ROOT)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate modern curriculum layout HTML under Programs/.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=LAYOUT_OVERWRITE_WARNING,
    )
    parser.add_argument("--year", type=int, required=True, help="Calendar start year (e.g. 2027 for 2027-2028)")
    parser.add_argument(
        "--program",
        help="Program id to generate (e.g. Computer). Omit to generate all programs in programs_config.json.",
    )
    parser.add_argument(
        "--yes", "-y",
        action="store_true",
        help="Skip overwrite confirmation prompt",
    )
    parser.add_argument(
        "--no-refresh-manifest",
        action="store_true",
        help="Do not rebuild curriculum_manifest.json after generation",
    )
    args = parser.parse_args()

    config = load_programs_config()
    programs_list = programs_for_generator(config, args.program)
    target_paths = [
        layout_output_path(program.split(" ")[0], args.year)
        for program in programs_list
    ]

    if not confirm_overwrite(target_paths, reason=LAYOUT_OVERWRITE_WARNING, force=args.yes):
        print("Cancelled.")
        return

    save_program_layouts_flat(programs_list, args.year)

    if not args.no_refresh_manifest:
        refresh_manifest()
        print("Refreshed curriculum_manifest.json")


if __name__ == "__main__":
    main()
