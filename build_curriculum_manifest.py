"""Build curriculum_manifest.json by scanning layout files on disk.

Reads program labels and calendar slugs from programs_config.json, scans
Programs/ (modern, 2016+) and Programs_old/ (legacy, 2010–2015), and writes
curriculum_manifest.json for index.html and other tools.

This script only reads layout folders and writes the manifest. It does not
modify, delete, or regenerate any layout HTML.

Examples:
    python3 build_curriculum_manifest.py
    python3 build_curriculum_manifest.py --quiet
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "programs_config.json"
MANIFEST_PATH = ROOT / "curriculum_manifest.json"

LAYOUT_FILE_RE = re.compile(r"^([A-Za-z]+)-(\d{4})(?:_(.+))?_layout\.html$")


def load_programs_config() -> dict:
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def suffix_to_layout(suffix: str | None, filename: str) -> dict | None:
    if suffix and suffix.startswith("common_to"):
        return None
    if suffix is None:
        return {"id": "base", "label": "Regular Program", "file": filename}
    layout_id = suffix
    label = suffix.replace("_", " ").strip().title()
    return {"id": layout_id, "label": label, "file": filename}


def sort_layouts(layouts: list[dict]) -> list[dict]:
    return sorted(layouts, key=lambda item: (0 if item["id"] == "base" else 1, item["label"].lower()))


def scan_layout_root(root: Path, calendar: str, layout_dir: str) -> dict[str, dict[str, dict]]:
    """Return {programId: {year: {calendar, layoutDir, layouts}}}."""
    discovered: dict[str, dict[str, dict]] = {}
    if not root.is_dir():
        return discovered

    for program_dir in sorted(root.iterdir()):
        if not program_dir.is_dir():
            continue
        program_id = program_dir.name
        for path in sorted(program_dir.glob("*_layout.html")):
            match = LAYOUT_FILE_RE.match(path.name)
            if not match:
                continue
            file_program, year, suffix = match.group(1), match.group(2), match.group(3)
            if file_program != program_id:
                continue
            layout = suffix_to_layout(suffix, path.name)
            if layout is None:
                continue

            discovered.setdefault(program_id, {}).setdefault(year, {
                "calendar": calendar,
                "layoutDir": layout_dir,
                "layouts": [],
            })
            year_entry = discovered[program_id][year]
            if any(existing["file"] == layout["file"] for existing in year_entry["layouts"]):
                continue
            year_entry["layouts"].append(layout)

    for program_id in discovered:
        for year in discovered[program_id]:
            discovered[program_id][year]["layouts"] = sort_layouts(
                discovered[program_id][year]["layouts"]
            )
    return discovered


def merge_program_years(*maps: dict[str, dict[str, dict]]) -> dict[str, dict[str, dict]]:
    merged: dict[str, dict[str, dict]] = {}
    for source in maps:
        for program_id, years in source.items():
            merged.setdefault(program_id, {}).update(years)
    return merged


def build_manifest() -> dict:
    config = load_programs_config()
    modern = scan_layout_root(ROOT / "Programs", "modern", "Programs")
    legacy = scan_layout_root(ROOT / "Programs_old", "legacy", "Programs_old")
    scanned = merge_program_years(modern, legacy)

    programs_out = []
    for program_cfg in config["programs"]:
        program_id = program_cfg["id"]
        years = scanned.get(program_id, {})
        programs_out.append({
            "id": program_id,
            "label": program_cfg["label"],
            "calendarName": program_cfg.get("calendarName", program_cfg["label"]),
            "calendarSlug": program_cfg["calendarSlug"],
            "years": dict(sorted(years.items(), key=lambda item: int(item[0]), reverse=True)),
        })

    return {
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "planningDefaults": config.get("planningDefaults", {}),
        "programs": programs_out,
    }


def write_manifest(manifest: dict, quiet: bool = False) -> Path:
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")
    if not quiet:
        program_count = len(manifest["programs"])
        year_count = sum(len(p["years"]) for p in manifest["programs"])
        print(f"Wrote {MANIFEST_PATH} ({program_count} programs, {year_count} program-years)")
    return MANIFEST_PATH


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scan Programs/ and Programs_old/ and write curriculum_manifest.json.",
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Suppress summary output",
    )
    args = parser.parse_args()

    manifest = build_manifest()
    write_manifest(manifest, quiet=args.quiet)


if __name__ == "__main__":
    main()
