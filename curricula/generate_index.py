#!/usr/bin/env python3
"""
Scans the current directory for files named <Program>-<Year>.json and writes an
`index.json` manifest listing available programs and years.

Run from the `curricula` folder:
    python3 generate_index.py

This will overwrite `index.json` with the discovered files.
"""
import os
import re
import json

pattern = re.compile(r"^([A-Za-z]+)-([0-9]{4})\.json$")

def main():
    files = os.listdir('.')
    manifest = {}
    for fn in files:
        m = pattern.match(fn)
        if not m:
            continue
        prog, year = m.group(1), m.group(2)
        manifest.setdefault(prog, set()).add(year)

    # Build list sorted by program name
    out = []
    for prog in sorted(manifest.keys()):
        years = sorted(manifest[prog], reverse=True)
        out.append({"program": prog, "years": years})

    with open('index.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2)
    print('Wrote index.json with', len(out), 'program(s)')

if __name__ == '__main__':
    main()
