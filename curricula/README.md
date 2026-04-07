StudyPlanner — local testing notes

Purpose
- The StudyPlanner HTML loads per-program curriculum JSON files from the same folder (e.g. `Aerospace-2026.json`).

Quick test (macOS / zsh)
1. If you prefer not to run a server and want to open the HTML directly (file://), generate an embedded bundle first:
   cd /Users/camdenhampe/curricula
   python3 generate_bundle.py

   This writes `curricula.bundle.js` which the HTML will load when opened locally and make all curricula available without a server.

2. Or, start a simple static server (recommended):
   python3 -m http.server 8000

3. Open the planner in your browser:
   http://localhost:8000/StudyPlanner%20-%20v0.7.html
   Or, if you generated a bundle, you can also open the HTML file directly in the browser (double-click / file://).

Filename expectations
- Each curriculum file must be named exactly as `<Program>-<Year>.json` where `Program` is the option value used by the program dropdown (for example `Aerospace`, `Biomedical`, `Computer`, etc.) and `Year` is the admit year (e.g. `2026`).
- The JSON shape expected is an array of groups, e.g.:
  [
    { "title": "First Year - Fall", "courses": [ { "code": "CEN100", "title": "Introduction to ..." }, ... ] },
    ...
  ]

Troubleshooting
- If the planner shows the static checklist instead of your program's curriculum, check the browser console for a fetch error (likely file not found or CORS when opening via file://). Serving via HTTP (step 2 above) resolves this.
- If filenames don't match (spacing/case), either rename the JSON files or modify the HTML loader logic to map names.

Next steps you can ask me to do
- Add a small index.json listing available program-year files and make the loader use it.
- Add graceful UI messages when no curriculum file is found.
- Normalize program names (e.g., spaces/case) so filenames can be more flexible.
