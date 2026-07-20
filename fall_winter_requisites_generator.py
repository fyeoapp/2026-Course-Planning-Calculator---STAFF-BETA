"""Deprecated wrapper — use course_requisites_generator.py instead.

Admit-year requisites (Fall, Winter, and Transition) now live in:

    Course_requisites/requisites_<year>.json

This file forwards to course_requisites_generator.py for backwards compatibility.
"""

from __future__ import annotations

import runpy
import sys
from pathlib import Path

print(
    "Note: fall_winter_requisites_generator.py is deprecated.\n"
    "      Use: python3 course_requisites_generator.py --year <YYYY>\n",
    file=sys.stderr,
)
runpy.run_path(str(Path(__file__).resolve().parent / "course_requisites_generator.py"), run_name="__main__")
