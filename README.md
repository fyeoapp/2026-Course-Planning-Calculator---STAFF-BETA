# TMU Engineering Course Planning Calculator

A static web tool for Toronto Metropolitan University (TMU) Faculty of Engineering and Architectural Science students and staff. It helps students identify which courses they may be eligible to take based on completed coursework, program curriculum, and **admit-year** calendar requisites.

Supports three planning modes:

- **Fall** — courses offered in odd semesters (1st, 3rd, 5th, 7th)
- **Winter** — courses offered in even semesters (2nd, 4th, 6th, 8th)
- **Spring/Summer (Transition)** — compressed transition-term offerings scraped from the Engineering Transition Program page

---

## Quick start

This project is a static site (HTML + JSON + generated layout files). Run a local HTTP server so the browser can fetch curriculum and requisites data:

```bash
cd /path/to/2026-Course-Planning-Calculator---STAFF-BETA
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000/index.html
```

> Opening `index.html` directly via `file://` may fail when the app tries to load JSON or layout files due to browser security restrictions. Use a local server.

### Deploying to the web (minimal public tree)

Do **not** serve the whole git repo from GitHub Pages. Maintainer scripts (`.py`), README, `Retired_scripts/`, etc. would be downloadable by anyone who guesses the URL.

**Production deploy (recommended):** GitHub Actions builds a runtime-only tree and publishes **only** that to Pages.

1. In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions** (not “Deploy from a branch”). Until you flip this, GitHub keeps publishing the **entire branch** and `/setup_year.py` will still download.
2. Push to `main` or `intelli` (or run the **Deploy GitHub Pages** workflow manually under the Actions tab).

The workflow (`.github/workflows/deploy-pages.yml`) runs:

```bash
python3 build_public.py --clean --out public
```

…then deploys the `public/` folder. That folder is gitignored and never needs to be committed.

**What gets hosted**

| Included | Purpose |
|----------|---------|
| `index.html` | Calculator UI |
| `curriculum_manifest.json` | Program / year / layout index |
| `course_aliases.json` | Code equivalences |
| `Assets/` | Logos |
| `Programs/`, `Programs_old/` | Curriculum layout HTML |
| `Course_requisites/` | Admit-year prereq/coreq JSON |
| `Transition_courses/` | Spring/summer offerings |

**Not** hosted: all `*.py` generators, `README.md`, `Retired_scripts/`, `Programs_misc/`, `course_correction.html`, `programs_config.json`, `__pycache__/`.

Local preview of the same tree:

```bash
python3 build_public.py --clean
python3 -m http.server 8000 --directory public
```

Full-repo `python3 -m http.server` is fine for development only. After data refreshes on `main`, the Actions deploy updates the live site automatically.

> Note: on a **public** GitHub repo, source files are still visible on github.com. Pages only controls what is on the **website**. Use a private repo if maintainer tooling must not be visible at all.

### Python dependencies (maintainers only)

Generator scripts require:

```bash
pip install requests beautifulsoup4
```

---

## Using the calculator

1. Confirm you are in **good academic standing**.
2. Choose the semester you are planning for: **Fall**, **Winter**, or **Spring/Summer (Transition)**.
3. Select your **program** and **admit year**.
4. For admit years **2010–2015**, choose a program stream/option when prompted (e.g. Computer Software vs. Regular).
5. On the curriculum checklist, mark courses you have **already completed**.
6. Click **Calculate Eligibility** to see suggested courses for that term.

### Important notes (results screen)

After eligibility results, students see an **Important Notes** yellow box:

- **All terms:** curriculum-change disclaimer (consult department if unsure).
- **Spring/Summer only:** additional note that courses run in a six-week compressed format and to consult the department on a manageable load.

Corequisites are scraped into the data files but are **not** shown as warnings on results.

### How eligibility works (high level)

- **Completed courses** come from checkboxes on the student's curriculum layout.
- **Prerequisites** come from `Course_requisites/requisites_<admitYear>.json` (the student's admit-year calendar), for Fall, Winter, **and** Transition.
- **Corequisites** are stored in the requisites JSON but are not shown or enforced in the student UI.
- **Antirequisites** not used in our calculations
- **Course aliases** (`course_aliases.json`) let renamed/equivalent codes count toward prereqs across admit years (e.g. CPS 125 ↔ CPS 188).
- **Fall/Winter** candidate courses are drawn from checkbox courses under the relevant odd/even semester blocks on the layout. Liberal studies tables and open-ended elective groups are not expanded automatically.
- **Spring/Summer (Transition)** candidate courses come from scraped transition *offerings* JSON and must also appear on the student's active curriculum panel(s). Transition JSON does not supply prereq rules. This dual filter can miss courses that exist on transition JSON but not on the program calendar (e.g. CHE 474).

---

## Repository layout

```
.
├── index.html                              # Main calculator app
├── course_correction.html                  # Staff tool for layout/course fixes / Work in Progress
├── course_aliases.json                     # Cross-year course code equivalences
├── programs_config.json                    # Program labels + calendar slugs (maintainer-edited)
├── curriculum_manifest.json                # Generated index of layout files (used by index.html)
│
├── Programs/                               # Curriculum layouts, admit years 2016+
├── Programs_old/                           # Curriculum layouts, admit years 2010–2015
├── Programs_misc/                          # Legacy JSON curriculum snapshots
│
├── Transition_courses/                     # Scraped spring/summer transition offerings
├── Course_requisites/                      # Admit-year prereq/coreq scrapes (all seasons)
│
├── build_curriculum_manifest.py            # Scans layout folders → curriculum_manifest.json
├── script_utils.py                         # Shared overwrite confirmation for generators
├── transition_courses_generator.py         # Builds Transition_courses/*.json
├── course_requisites_generator.py          # Builds Course_requisites/requisites_<year>.json
├── legacy_course_requisites_generator.py   # Legacy 2010–2015 calendar requisites parser
├── setup_year.py                           # One-shot safe yearly refresh (orchestrator)
├── build_public.py                         # Builds runtime-only tree for Pages (used by Actions)
├── .github/workflows/deploy-pages.yml      # Deploys public/ to GitHub Pages
├── annual_calendar_generator.py            # Builds Programs/* layout HTML
│
├── Assets/                                 # Logos and static images
└── Retired_scripts/                        # Older tooling + reference-only old generator
```

### Root files

- **`index.html`** — Main application. Loads `curriculum_manifest.json` at startup to populate program/year dropdowns and resolve layout file paths (including legacy stream/option pickers).
- **`course_correction.html`** — Separate maintainer-facing form for reviewing or correcting course/layout data. (Work in Progress)
- **`course_aliases.json`** — Manual map of equivalent course codes used during prereq checks when admit-year layouts use older codes than the current calendar.
- **`programs_config.json`** — Maintainer-edited program list (display labels, calendar URL slugs, default planning years). Used by `build_curriculum_manifest.py` and `annual_calendar_generator.py`.
- **`curriculum_manifest.json`** — **Generated** index of which layout files exist under `Programs/` and `Programs_old/`. Built by scanning disk; does not modify any layout HTML. Used by `index.html` for dropdowns and layout paths.

### Data folders

- **`Programs/`** — Generated HTML curriculum checklists for admit years **2016–2026**. Each file is named like `Programs/<Program>/<Program>-<Year>_layout.html`, with optional suffixes for streams/options (e.g. `_software_engineering_option_layout.html`).
- **`Programs_old/`** — Generated HTML curriculum checklists for admit years **2010–2015**. May include stream-specific files and `common_to_*` shared blocks. Course links use `/calendar/<year>-<year+1>/` paths.
- **`Programs_misc/`** — Older JSON curriculum representations (semester-grouped course lists). Retained for reference; the live app loads HTML layouts from `Programs/` and `Programs_old/`.
- **`Transition_courses/`** — Scraped transition *offerings* for Spring/Summer mode, e.g. `spring/spring_2026.json` and `summer/summer_2026.json`. These files list which courses are offered; prereq/coreq fields are empty placeholders. Eligibility always loads requisites from `Course_requisites/` for the student's admit year.
- **`Course_requisites/`** — Per admit-year requisites (`requisites_<year>.json`) used by Fall, Winter, **and** Transition eligibility. A 2014 admit is checked against the 2014–2015 calendar; a 2024 admit against 2024–2025. Years **2010–2015** come from legacy `pg*.html` subject pages; **2016+** from modern course pages.
- **`Assets/`** — Static assets such as the FYEO logo shown in the app header.

### Generator scripts

| Script | Purpose | Output |
|--------|---------|--------|
| `build_curriculum_manifest.py` | Scans `Programs/` + `Programs_old/` and writes the manifest | `curriculum_manifest.json` |
| `transition_courses_generator.py` | Scrapes Engineering Transition Program spring/summer sections | `Transition_courses/spring/*.json`, `Transition_courses/summer/*.json` |
| `course_requisites_generator.py` | Scrapes admit-year prereqs/coreqs (modern 2016+ or legacy 2010–2015) | `Course_requisites/requisites_<year>.json` |
| `legacy_course_requisites_generator.py` | Legacy calendar page parser used by the requisites generator for 2010–2015 | (called internally) |
| `setup_year.py` | Runs the safe yearly refresh steps (transition + requisites + manifest) | Same as the scripts it calls |
| `annual_calendar_generator.py` | Scrapes the TMU calendar and builds modern curriculum layouts | `Programs/<Program>/...` |

All generator scripts support `--help`. Layout and JSON generators prompt **y/n** before overwriting existing files (use `--yes` to skip). See **Why re-running layout generators is risky** below.

### `setup_year.py` — what it runs under the hood

`setup_year.py` does not scrape anything itself. It shells out to the other scripts. If you omit `--year`, it uses `planningDefaults.transitionYear` from `programs_config.json`. Passing `--yes` / `-y` forwards `--yes` to each scraper that supports it (skips overwrite prompts).

| You run | Under the hood |
|---------|----------------|
| `python3 setup_year.py --year 2027` | `transition_courses_generator.py --season spring --year 2027`<br>`transition_courses_generator.py --season summer --year 2027`<br>`course_requisites_generator.py --year 2027`<br>`build_curriculum_manifest.py` |
| `python3 setup_year.py --year 2027 --yes` | Same four commands as above, but each scraper gets `--yes` |
| `python3 setup_year.py --year 2027 --only transition` | Spring + summer transition scrapers only |
| `python3 setup_year.py --year 2027 --only requisites` | `course_requisites_generator.py --year 2027` only |
| `python3 setup_year.py --year 2027 --only manifest` | `build_curriculum_manifest.py` only |
| `python3 setup_year.py --year 2027 --steps requisites,manifest` | Requisites + manifest only (any comma-separated subset of `transition,requisites,manifest`) |

Layouts are **not** included. Run `annual_calendar_generator.py` separately when you intentionally want new `Programs/*` HTML.

For admit years **2010–2015**, `course_requisites_generator.py` routes to `legacy_course_requisites_generator.py`, which scrapes the old `/calendar/YYYY-YYYY/pg*.html#…` subject pages linked from `Programs_old/` (one fetch per page, many courses per page).

Example maintainer commands:

```bash
python3 setup_year.py --year 2027
python3 setup_year.py --year 2027 --yes
python3 setup_year.py --year 2027 --only transition
python3 setup_year.py --year 2027 --steps requisites,manifest

# Same steps by hand:
python3 transition_courses_generator.py --season spring --year 2027
python3 transition_courses_generator.py --season summer --year 2027
python3 course_requisites_generator.py --year 2027
python3 build_curriculum_manifest.py

# Layouts stay separate (destructive to manual HTML edits)
python3 annual_calendar_generator.py --year 2027 --program Computer
python3 annual_calendar_generator.py --year 2027
```

### Transition courses scraper — what `--year` actually does

`--year` is **not** just the output filename. The script:

1. Fetches TMU’s live [Engineering Transition Program](https://www.torontomu.ca/engineering-architectural-science/programs/undergraduate-programs/transition-program/) page.
2. Looks for an accordion heading matching `"<Season> <year> … Engineering … Transition"` (e.g. `Spring 2026`).
3. Scrapes whatever course links appear in **that** section only (offerings — no per-course requisites).
4. Writes `Transition_courses/<season>/<season>_<year>.json`.

**The script does not decide which courses are offered** — it only copies what TMU has published. Before running:

- Open the transition page and confirm the Spring/Summer block for that year exists.
- If the heading isn’t there yet, the script will fail with `Could not find a section matching …`.

After scraping a new year, update `index.html` (currently hardcoded to `spring_2026.json` / `summer_2026.json`) so the calculator loads the new files. Also ensure `Course_requisites/requisites_<admitYear>.json` exists for each admit year you support.

### Other

- **`Retired_scripts/`** — Previous bundler/index generators, an older HTML app, and **`old_annual_calendar_generator.py`** (reference only — do not re-run; see manual edits note below).

---

## Maintainer notes

### Curriculum manifest (safe to regenerate)

`build_curriculum_manifest.py` **only reads** `Programs/` and `Programs_old/` and writes `curriculum_manifest.json`. It does not delete or change any layout HTML. Re-run it whenever layout files are added, removed, or renamed — including after `annual_calendar_generator.py` finishes (that script refreshes the manifest automatically unless you pass `--no-refresh-manifest`).

Legacy vs modern calendars are inferred from folder location:

- `Programs_old/` → `"calendar": "legacy"` (2010–2015 layouts, stream/option files parsed from filenames)
- `Programs/` → `"calendar": "modern"` (2016+ layouts)

### Why re-running layout generators is risky (manual edits)

Layout HTML files (`Programs/`, `Programs_old/`) are **not** pure calendar scrapes. After initial generation, maintainers edit them directly in the repo. Re-running a layout generator **replaces the entire file** with a fresh scrape and **discards** those edits.

Common manual edits that would be lost:

- **Removing checkboxes** from courses that should not be selectable as “completed prerequisites” — e.g. pass/fail courses (CEN 199, BME 100), work-term courses (WKT), or multi-term courses (COE 70A/B, ELE 70A/B)
- **Adding course links or checkboxes** for offerings missing from the calendar layout but needed for eligibility (some electives, transition-only courses)
- **Fixing broken calendar URLs** (especially `Programs_old` 2010–2015 links)
- **Adjusting stream/option panels** for multi-path programs (Computer, Civil, Electrical, Mechanical)
- **Stripping leftover TMU scripts** — the live calendar injects jQuery `addCoursePopover(...)` snippets; they are useless in this app (no `$` loaded) and only produce console errors. The modern layout generator strips them on scrape; existing files were cleaned the same way. Do **not** remove the vanilla panel-clearing `<script>` at the bottom of multi-panel layouts.

The manifest builder does **not** cause any of this — it only lists files. The risk is specifically from re-running **`annual_calendar_generator.py`** (or the retired old generator in `Retired_scripts/`).

`Programs_old/` layouts especially should **not** be regenerated without a full review. That generator is kept as reference only.

### After generating a layout — review and hand-fix

The calendar scrape is a starting point, not a finished UI. After `annual_calendar_generator.py` (or any layout refresh), open the new `Programs/<Program>/<Program>-<Year>_layout.html` and expect to edit it by hand.

**Formatting**

- Spacing and headings often need cleanup. Insert `<br>` (or small structural tweaks) where semester blocks, notes, or columns run together.
- Do not rely on the generator to produce polished layout HTML.

**Duplicate semester / curriculum blocks**

TMU sometimes publishes **two versions of the same semester** on one calendar page — e.g. an older “7th & 8th Semester” block (“last offered … to students admitted Fall 2021 and before”) and a revised block (“first offered … to students admitted Fall 2022 and after”). The scraper will pull **both** into the layout HTML.

When you see that:

1. **Consult staff** on which block belongs in *this* admit-year file (or whether both should stay for a transition year).
2. **Manually remove** the incorrect block from the layout HTML — delete its surrounding `div` / section in the file, not just hide it with CSS.
3. Re-check checkboxes and course links in what remains so eligibility still matches the intended curriculum.

Leaving both copies in place confuses students and can double-count or offer the wrong elective counts (e.g. “three courses from Table I” vs “two”).

**Note:** Duplicate headings are not always identical course lists — they are separate curriculum versions that share the same semester labels. The app scopes each Select All control to a single heading instance, but the preferred long-term fix is still to remove the version that does not apply to that admit year.

**Shared third-year courses across Regular and Options (common bug)**

Programs with options (for example Mechanical with a Mechatronics option) often list 5th and 6th semester courses only under the Regular panel, even when the option follows the same third-year curriculum. Because those checkboxes are owned by the Regular panel, selecting any Option-year course clears the Regular panel — and students in the option effectively cannot keep third-year courses selected.

After generating or editing such a layout, maintainers must choose one of these hand-fixes:

1. **Preferred:** Move the shared 5th/6th semester blocks into the **common** panel (`data-panel-container-id="0"`) and set every course checkbox in those blocks to `data-panel-owner="0"`; or
2. **Alternative:** Duplicate those third-year courses into the option panel with that option’s `data-panel-owner`, and keep class / Fall–Winter tagging consistent.

Do not leave shared third-year courses listed only under Regular when an option also requires them.

### Manual fixes still required in some cases

The app will **not** automatically suggest every course a student might realistically take. Common gaps:

- Courses offered in transition JSON but **not linked** on the program layout (e.g. some electives)
- Courses listed only under **liberal studies tables** or open-ended elective text (no checkbox)
- Retired or renamed courses that fail to scrape (404) — they may appear with empty prereqs

For these, maintainers can:

1. Add the course link/checkbox to the relevant layout HTML in `Programs/` or `Programs_old/`, and/or
2. Add equivalences to `course_aliases.json`, and/or
3. Add a targeted special case in `index.html` (avoid broad auto-unlock rules)

Developer notes for this behavior are also documented inline above the eligibility logic in `index.html`.

### Updating for a new calendar year

**Safe data refresh** (one command):

```bash
python3 setup_year.py --year <YYYY>
```

That runs transition spring + summer, `Course_requisites/requisites_<YYYY>.json`, and the curriculum manifest. Use `--only` / `--steps` to run a subset.

**Still separate on purpose:**

1. **Layouts** — `python3 annual_calendar_generator.py --year <YYYY>` (overwrites manual HTML edits; do not bundle into the default refresh). **Then** review the HTML: fix formatting (`<br>` etc.) and remove duplicate semester blocks after staff confirm which curriculum version to keep (see above).
2. **App config** — update `programs_config.json` planning defaults and `index.html` transition JSON paths if the planning year changed.
3. **Aliases** — review `course_aliases.json` for renames.
4. Keep older `Course_requisites/requisites_*.json` files for prior admit years (do not delete them when adding a new year).

### Known limitations

- Antirequisites are scraped but not enforced in eligibility logic.
- Eligibility uses **admit-year** requisites from `Course_requisites/` (legacy scrape for 2010–2015, modern for 2016+). If a pre-2016 file is missing, the app falls back to 2016 as a last resort.
- ~40+ legacy or retired course codes may fail to scrape and will have empty prereq data.
- Multi-stream programs (Computer, Civil, Mechanical, etc.): if only common-year (panel 0) courses are checked, eligibility includes all option panels; once a course is checked in an option panel, results lock to that option (+ common). Fall/Winter uses semester checkboxes from those same active panels.

---

## Programs supported

Aerospace, Biomedical, Chemical, Civil, Computer, Electrical, Industrial, Mechanical, and Mechatronics Engineering — with admit years from **2010** through **2026** depending on program.

---

## License / attribution

Internal TMU Engineering staff beta tool. Confirm deployment and data-refresh ownership with the maintaining team before publishing changes.
