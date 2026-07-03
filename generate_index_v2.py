#!/usr/bin/env python3
"""
Scans the current directory for files named <Program>-<Year>.json and writes an
`index.json` manifest listing available programs and years.

Run from the `curricula` folder:
    python3 generate_index.py

This will overwrite `index.json` with the discovered files.
"""
import os, re, json

relative_path = "./Programs"

pattern = re.compile(r"^([A-Za-z]+)-([0-9]{4})\.json$")

def main():
    manifest = {}
    
    for folder in os.listdir(relative_path):
        
        for course in os.listdir(os.path.join(relative_path, folder)):
            m = pattern.match(course)
            if not m:
                continue
            prog, year = m.group(1), m.group(2)
            manifest.setdefault(prog, set()).add(year)

    out = []
    for prog in sorted(manifest.keys()):
        years = sorted(manifest[prog], reverse=True)
        out.append({"program": prog, "years": years})

    with open('index_v2.json', 'w', encoding='utf-8') as f:
        
        json.dump(out, f, indent=2)
    print('Wrote index_v2.json with', len(out), 'program(s)')

if __name__ == '__main__':
    main()