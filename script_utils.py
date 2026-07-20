"""Shared helpers for maintainer scripts (overwrite confirmation, etc.)."""

from __future__ import annotations

from pathlib import Path

LAYOUT_OVERWRITE_WARNING = """
WARNING: This will OVERWRITE existing layout HTML file(s).

Layout files in this repo are not raw calendar scrapes. Maintainers have applied
manual edits directly in the HTML, for example:

  • Removing checkboxes from pass/fail courses (CEN 199, BME 100) so students
    cannot incorrectly mark them as completed prerequisites
  • Removing checkboxes from work-term or multi-term courses (WKT, COE 70A/B,
    ELE 70A/B) that should not be selected like regular courses
  • Adding course links or checkboxes for offerings missing from the calendar
    layout but needed for eligibility (some electives / transition-only courses)
  • Fixing broken or outdated calendar URLs (especially Programs_old 2010–2015)
  • Tweaking stream/option panels for multi-path programs (Computer, Civil,
    Electrical, Mechanical, etc.)

Re-running a layout generator rebuilds the entire file from the live calendar
and discards those manual edits. Programs_old layouts should not be regenerated
without a full review.
""".strip()

JSON_OVERWRITE_WARNING = """
WARNING: This will OVERWRITE existing JSON file(s).

Re-running will replace previously scraped course/requisite data with a fresh
scrape from the TMU website. Any hand-edited JSON entries will be lost.
""".strip()

MANIFEST_OVERWRITE_NOTE = """
Refreshing curriculum_manifest.json (safe): this only re-lists layout files
already on disk. It does not modify any layout HTML.
""".strip()


def existing_paths(paths: list[str | Path]) -> list[Path]:
    return [Path(p) for p in paths if Path(p).is_file()]


def confirm_overwrite(
    paths: list[str | Path],
    *,
    reason: str,
    force: bool = False,
) -> bool:
    """Prompt y/n before overwriting files that already exist."""
    found = existing_paths(paths)
    if not found or force:
        return True

    print(reason)
    print("\nFiles that already exist and would be overwritten:")
    for path in found:
        print(f"  - {path}")
    answer = input("\nContinue? [y/N]: ").strip().lower()
    return answer in {"y", "yes"}
