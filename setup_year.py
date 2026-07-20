"""One-shot maintainer refresh for a planning year (safe JSON steps by default).

Default (recommended yearly data refresh):
  1. Transition spring offerings
  2. Transition summer offerings
  3. Admit-year course requisites for that year
  4. Curriculum manifest rebuild

Layouts stay separate on purpose — `annual_calendar_generator.py` overwrites
manual HTML edits and should be run deliberately, not bundled into the default.

Examples:
    python3 setup_year.py                      # uses planningDefaults.transitionYear
    python3 setup_year.py --year 2027
    python3 setup_year.py --year 2027 --yes
    python3 setup_year.py --year 2027 --only transition
    python3 setup_year.py --year 2027 --only requisites
    python3 setup_year.py --year 2027 --only manifest
    python3 setup_year.py --year 2027 --steps transition,requisites
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "programs_config.json"

ALL_STEPS = ("transition", "requisites", "manifest")
STEP_HELP = {
    "transition": "Scrape spring + summer transition offerings for the year",
    "requisites": "Scrape Course_requisites/requisites_<year>.json",
    "manifest": "Rebuild curriculum_manifest.json from layout files on disk",
}


def default_year() -> int:
    try:
        cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        y = cfg.get("planningDefaults", {}).get("transitionYear")
        if y is not None:
            return int(y)
    except Exception:
        pass
    return 2026


def parse_steps(only: str | None, steps: str | None) -> list[str]:
    if only and steps:
        raise SystemExit("Use either --only or --steps, not both.")
    if only:
        name = only.strip().lower()
        if name not in ALL_STEPS:
            raise SystemExit(f"Unknown step {only!r}. Choose from: {', '.join(ALL_STEPS)}")
        return [name]
    if steps:
        chosen = []
        for part in steps.split(","):
            name = part.strip().lower()
            if not name:
                continue
            if name not in ALL_STEPS:
                raise SystemExit(f"Unknown step {name!r}. Choose from: {', '.join(ALL_STEPS)}")
            if name not in chosen:
                chosen.append(name)
        if not chosen:
            raise SystemExit("--steps was empty.")
        return chosen
    return list(ALL_STEPS)


def run_script(args: list[str]) -> None:
    cmd = [sys.executable, str(ROOT / args[0]), *args[1:]]
    print(f"\n>>> {' '.join(cmd)}")
    subprocess.run(cmd, check=True, cwd=ROOT)


def run_transition(year: int, yes: bool) -> None:
    extra = ["--yes"] if yes else []
    for season in ("spring", "summer"):
        run_script(["transition_courses_generator.py", "--season", season, "--year", str(year), *extra])


def run_requisites(year: int, yes: bool) -> None:
    extra = ["--yes"] if yes else []
    run_script(["course_requisites_generator.py", "--year", str(year), *extra])


def run_manifest() -> None:
    run_script(["build_curriculum_manifest.py"])


def print_manual_reminders(year: int) -> None:
    print(
        f"""
--- Manual follow-ups (not automated) ---
• Layouts: if you need new Programs/* HTML for {year}, run separately:
    python3 annual_calendar_generator.py --year {year}
  (destructive to manual edits — review carefully)
• Point the app at new transition files if the planning year changed:
    index.html fetches Transition_courses/spring/spring_*.json and summer_*.json
• Update programs_config.json planningDefaults if {year} is the new default
• Review course_aliases.json for renames
"""
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Refresh transition offerings + admit-year requisites + manifest for a year. "
            "Layout regeneration is intentionally NOT included by default."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Steps:\n"
            + "\n".join(f"  {name:12} {desc}" for name, desc in STEP_HELP.items())
            + "\n\nLayouts remain a separate command: annual_calendar_generator.py"
        ),
    )
    parser.add_argument(
        "--year",
        type=int,
        default=None,
        help=f"Planning / calendar start year (default: {default_year()} from programs_config.json)",
    )
    parser.add_argument(
        "--only",
        choices=list(ALL_STEPS),
        help="Run a single step",
    )
    parser.add_argument(
        "--steps",
        help=f"Comma-separated subset of: {','.join(ALL_STEPS)} (default: all)",
    )
    parser.add_argument(
        "--yes",
        "-y",
        action="store_true",
        help="Pass --yes through to scrapers (skip overwrite prompts)",
    )
    args = parser.parse_args()

    year = args.year if args.year is not None else default_year()
    steps = parse_steps(args.only, args.steps)

    print(f"setup_year.py — year={year} steps={','.join(steps)}")
    for step in steps:
        if step == "transition":
            run_transition(year, args.yes)
        elif step == "requisites":
            run_requisites(year, args.yes)
        elif step == "manifest":
            run_manifest()

    print("\nDone.")
    print_manual_reminders(year)


if __name__ == "__main__":
    main()
