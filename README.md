# Engineering Spring/Summer Course Planning Calculator

A static web page for TMU engineering students. It walks them through:

1. **Standing** – is their academic standing clear?
2. **Program** – their program and admit year
3. **Courses** – a checklist of their curriculum, where they tick what they've completed
4. **Results** – which courses they're eligible to take in Spring/Summer, plus course-load guidance

There is no backend, no database and no build step. It's plain HTML, CSS and
JavaScript, so anyone who can edit a text file can keep it up to date.

---

## Contents

- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [How the page works](#how-the-page-works)
- [The data files](#the-data-files)
- [How eligibility is calculated](#how-eligibility-is-calculated)
- [Yearly update checklist](#yearly-update-checklist)
- [Recipes for common changes](#recipes-for-common-changes)
- [Checking your changes](#checking-your-changes)
- [Code conventions](#code-conventions)
- [Git workflow and deploying](#git-workflow-and-deploying)
- [Known limitations](#known-limitations)

---

## Quick start

You only need a web browser.

```sh
git clone https://github.com/juderozario08/2026-Course-Planning-Calculator---STAFF-BETA.git
cd 2026-Course-Planning-Calculator---STAFF-BETA
open index.html     # or just double-click index.html
```

Everything works when the page is opened straight from disk. After editing a
file, refresh the page. If the browser still shows the old version, hard-refresh
with **⌘⇧R** (Mac) or **Ctrl+Shift+R** (Windows) to skip its cache.

Optional: install [Node.js](https://nodejs.org) to use the data checker
(`node scripts/check-data.js`, see [Checking your changes](#checking-your-changes)).

---

## Project structure

```
index.html              Page markup (header, sidebar, the four steps)
css/styles.css          All styling
assets/fyeo-logo.png    Header logo

data/                   ← the files you'll edit most
  courses.js            Course catalog: every course defined once
  programs.js           Every program's curriculum, per admit year

js/                     Page logic (rarely needs changing)
  dom.js                Small helpers: byId, show/hide, setDebug, fillSelect
  curriculum.js         Fills the dropdowns, renders the Step 3 checklist
  eligibility.js        Parses prerequisites, works out eligible courses
  navigation.js         Moving between steps, Back button, step indicator
  main.js               Startup: sidebar links, app-store picker, saved program

scripts/check-data.js   Validates the data files (optional, needs Node)
```

---

## How the page works

`index.html` loads these scripts **in this order** at the bottom of the page:

```
data/courses.js → data/programs.js → js/dom.js → js/curriculum.js
→ js/eligibility.js → js/navigation.js → js/main.js
```

They are ordinary `<script>` tags, not ES modules, and share global variables
(`COURSES`, `PROGRAMS`, `byId`, …). Later files use things defined in earlier
ones, so keep this order. Modules or `fetch()`-ing JSON would break opening
the page from disk (`file://`), which staff rely on.

The flow:

1. On load, `main.js` calls `initCurricula()`, which fills the **program**
   dropdown from the keys of `PROGRAMS` (alphabetically) and the **admit year**
   dropdown from all years found in `PROGRAMS`.
2. Picking a program limits the year dropdown to that program's years
   (`updateAdmitYearsForProgram`).
3. **Continue** calls `showCourses()`, which looks up the curriculum version
   containing that year and renders one checkbox per course.
4. **Calculate** calls `calculateEligibility()`, which compares the ticked
   courses against each unticked course's prerequisites (from `COURSES`).

The grey pill above the title (`#debugInfo`) shows what was loaded, e.g.
`Rendering: Computer:2026`. It's handy when checking data changes.

---

## The data files

### `data/courses.js` — the course catalog

Every course appears **exactly once**, keyed by its code with no space:

```js
const COURSES = {
    CEN100: { title: 'Introduction to Engineering' },
    MTH240: {
        title: 'Calculus II',
        prereqs: 'MTH 140',
        antireqs: 'MTH 310 and MTH 231',
        description: 'Integration techniques, improper integrals, ...',
    },
    ...
};
```

| Field | Required | Used for |
|---|---|---|
| `title` | yes | Shown after the code in the checklist |
| `prereqs` | no | **Drives eligibility.** Free text, see [below](#how-eligibility-is-calculated) |
| `coreqs`, `antireqs`, `customRequisites`, `description` | no | Reference only; not currently shown on the page |
| `noOutline` | no | `true` hides the "Outline" link when the calendar has no page for the course |

- Leave a field out rather than writing `'None'`.
- Every course in the checklist gets an **Outline** link to its TMU calendar
  page, built from two settings at the top of `courses.js`:

  ```js
  const CALENDAR_YEAR = '2026-2027';
  const SUBJECT_PATHS = { MTH: 'mathematics', CHE: 'chemical-engineering', ... };
  // MTH140 -> https://www.torontomu.ca/calendar/2026-2027/courses/mathematics/MTH/140/
  ```

  Part-B capstones (e.g. `COE70B`) link to the part-A page, which is how the
  calendar lists them. A course with a **new subject prefix** needs an entry in
  `SUBJECT_PATHS`. Copy the path from any link to that subject's courses on a
  calendar page. Without it the course just has no link.
- Keep entries in alphabetical order by code so they're easy to find.
- Two-term capstones are split into part A and part B entries, e.g. `COE70A`
  and `COE70B`. The calendar writes them as `COE 70A/B`.
- A few **placeholders** stand for "pick from a table" requirements:
  `CORE_ELECTIVES` (title "Core electives") and `CHE___` (title "Core
  Elective (see Table I)"). They render as normal checkboxes.

### `data/programs.js` — curricula

Each program has a list of **versions**. A version is one curriculum, plus
the admit years it applies to:

```js
const PROGRAMS = {
    Aerospace: [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024],   // old curriculum
            semesters: [ ... ],
        },
        {
            years: [2026],                                  // revised curriculum
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                ...
            ],
        },
    ],
    ...
};
```

Rules:

- **The program key is the dropdown label.** `Civil (Structural Option)` is a
  separate key because options have their own upper-year courses. Keys with
  spaces or brackets need quotes: `'Civil (Structural Option)': [ ... ]`.
- **Each admit year may appear in only one version of a program.**
- Years that are missing are simply not offered. For example, Aerospace
  currently has no 2025 entry.
- `semesters` is an ordered list of headed groups. The `title` is shown as a
  heading, so it can be anything useful: `'7th Semester (Liberal Studies)'`,
  `'2nd Semester (Civil Group)'`, …
- A course entry is a code, optionally followed by a note in brackets, which
  is added after the title **for this program only**:

  ```js
  'AER626 (Aircraft stream elective)'
  // renders as: AER626 Applied Finite Elements (Aircraft stream elective)
  ```

- The same code may appear in more than one group (e.g. Undeclared lists
  `CPS125` under several program groups).

### Where the data comes from

The TMU undergraduate calendar, one page per program:

```
https://www.torontomu.ca/calendar/<YYYY-YYYY>/programs/feas/<program>/
```

| Program | `<program>` slug |
|---|---|
| Aerospace | `aerospace` |
| Biomedical | `biomedical_eng` |
| Chemical | `chemical` |
| Civil (+ Structural Option) | `civil` |
| Computer (+ Software Engineering Option) | `computer_eng` |
| Electrical | `electrical` |
| Industrial | `industrial` |
| Mechanical | `mechanical` |
| Undeclared | `undeclared_eng` |
| Mechatronics | find it from the calendar's Programs page |

Read each page's **"Full-Time, Four-Year Program"** section, plus any
**"… Option"** sections. Watch for notes such as *"Revised curriculum begins
2026-2027 for students admitted Fall 2023 and after"*. They tell you which
admit years a change applies to.

---

## How eligibility is calculated

For every course the student did **not** tick (`js/eligibility.js`):

1. Look up its `prereqs` text in `COURSES`.
2. Pull out every course code in it (`MTH 140`, `CPS125`, …).
3. If the text contains `or` (or `/`), **any one** completed prerequisite is
   enough. Otherwise **all** must be completed.
4. If there's no `prereqs` text at all:
   - 100- and 200-level courses are treated as eligible;
   - **300-level and above are never suggested.**
5. If nothing qualifies, a few fallback first-year rules apply (e.g. MTH140
   done → suggest MTH141).

Writing `prereqs`:

```js
prereqs: 'MTH 140 and MTH 141'          // both required
prereqs: 'PCS 110 or PCS 125 or PCS 130'  // any one
prereqs: 'CPS 188, ELE 202, MTH 240'     // all (no "or")
```

The parser is simple. A mixed string like `'CEN 199 and (EES 512 or MTE 401)'`
contains `or`, so it's treated as "any one of the three". If a course needs
exact logic, simplify the text to what you want it to check.

> **Why this matters when adding courses:** a new upper-year course with no
> `prereqs` will never appear as eligible. Copy its prerequisites from the
> course's calendar page when you add it.

---

## Yearly update checklist

When the new calendar is published (e.g. 2027-2028):

1. **Create a branch:** `git checkout -b update-2027`.
2. **For each program**, open its calendar page (see the URL pattern above)
   and compare it with that program's latest version in `data/programs.js`:
   - **No changes?** Add the new year to the latest version's `years` list.
     That's the whole change for that program.
   - **Changes?** Copy the latest version, set `years: [2027]`, and edit the
     copy (see [the curriculum-change recipe](#the-curriculum-changed)).
   - Don't edit older versions. Students admitted earlier still follow them.
3. **New courses?** Add each one to `data/courses.js` with its title and
   `prereqs` (see [Add a new course](#add-a-new-course)).
4. **New programs or options?** See
   [Add a program or option](#add-a-program-or-option).
5. **Update the year shown on the page:**

   | File | What to change |
   |---|---|
   | `js/curriculum.js` | `DEFAULT_YEAR` (the year pre-selected in the dropdown) |
   | `data/courses.js` | `CALENDAR_YEAR` (used by every "Outline" link), e.g. `'2027-2028'` |
   | `index.html` | Page `<title>`, the header title and the `<h1>`: "Engineering **2026-2027** Course Planning Calculator" |
   | `index.html` | "Significant Dates Calendar" link: `/calendar/2026-2027/dates/` |
   | `index.html` | "Any additional Spring/Summer supports" link (currently a 2025 news post) |

   Search for the old year to catch everything: `grep -rn 2026 index.html js/ data/courses.js`.

   After changing `CALENDAR_YEAR`, open a few Outline links to confirm they
   load. If a course has been dropped from the new calendar, its link will
   404; add `noOutline: true` to that course.
6. **Check your changes** (next sections), then commit and open a pull request.

---

## Recipes for common changes

### A new intake year, curriculum unchanged

Add the year to the version that applies:

```diff
 Biomedical: [
     {
-        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
+        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027],
```

### The curriculum changed

Copy the program's latest version, give it only the new year(s), and edit the
copy. Leave the old version alone so earlier students keep their curriculum:

```js
Electrical: [
    { years: [2019, 2020, ..., 2025], semesters: [ /* old */ ] },
    { years: [2026],                  semesters: [ /* new */ ] },
],
```

If the calendar says a revision also applies to earlier intakes (*"for
students admitted Fall 2024 and after"*), decide whether those years need the
new version too. If so, move them over, and remember each year can only be
in one version.

### Add a new course

1. Add it to `data/courses.js` in alphabetical order, copying the title and
   prerequisites from its calendar course page:
   ```js
   MTH410: {
       title: 'Statistics',
       prereqs: 'MTH 141 and MTH 240',
   },
   ```
2. Reference `'MTH410'` in the relevant semester in `data/programs.js`.

### A course was renamed

Change its `title` in `data/courses.js`. **Titles are shared by every program
and year**, so all of them will show the new name. That's normally right,
since it's the same course.

### A course got a new code

Treat it as a **new course**. Add the new code to `courses.js` and use it in
the new curriculum version. Keep the old code, because older versions still
use it. (Example: CHE316 → CHE315 in 2026.)

### A note that only applies in one program

Put it after the code instead of in the title:
`'CPS688 (group option)'`, `'AER627 (core elective)'`.

### Add a program or option

Add a new key to `PROGRAMS` (any position; the dropdown sorts
alphabetically). For an option that shares the early years with its main
program, copy those semesters across:

```js
'Civil (Structural Option)': [
    {
        years: [2026],
        semesters: [
            // 1st–4th semester: same as Civil
            // 5th–8th semester: option-specific
        ],
    },
],
```

### Remove a program or year

Delete the program key, or remove the year from its `years` list. It
disappears from the dropdowns automatically. If a version ends up with an
empty `years` list, delete that version too.

### Change sidebar links or page text

Edit `index.html`. Sidebar link buttons use `data-href="…"`; `main.js` makes
any `button[data-href]` open its URL in a new tab, so no JavaScript changes are
needed.

---

## Checking your changes

1. **Validate the data** (needs Node):
   ```sh
   node scripts/check-data.js
   ```
   It reports syntax errors, codes missing from `courses.js`, years listed
   twice, and badly formed entries. It should print `✓ Data OK`.
2. **Open `index.html`** (hard-refresh if it was already open) and for each program you touched:
   - pick the program and every year you changed, press Continue, and check
     the checklist against the calendar;
   - tick a few courses and press Calculate to make sure results appear.
3. **Open the browser console** (⌥⌘J in Chrome) and check there are no red
   errors. A typo in a data file (missing comma or quote) usually shows up
   here as a `SyntaxError` with a line number, and the dropdowns will be empty.

---

## Code conventions

- 4-space indentation, single quotes, semicolons.
- No frameworks, no build step, no modules. New code goes in the most fitting
  `js/` file as plain functions. If you add a new script, add a `<script>` tag
  in `index.html` in the right order.
- Keep data in `data/` and logic in `js/`. Don't hardcode course lists in JS.
- Styles live only in `css/styles.css`. Colours are CSS variables at the top
  (`--header-bg`, `--yellow`, `--blue`, …) and match the CEN100 Assignment
  Calculator, so keep the two looking alike.
- Element IDs used by the scripts (`step1`–`step5`, `programSelect`,
  `admitYearSelect`, `eligibleCourses`, `backButton`, `stepper`,
  `debugInfo`, `fyengStore`) must stay as they are.

---

## Git workflow and deploying

1. Branch from `main`: `git checkout -b <short-description>`.
2. Make focused commits, e.g. data updates separate from styling changes.
3. Push and open a pull request for review.
4. Once merged to `main`, the hosted site updates. If it's served with GitHub
   Pages, give it a minute or two.

---

## Known limitations

- **Upper-year courses without `prereqs` are never suggested.** Many courses
  added for 2026 (e.g. ELE401, ELE531, most Mechanical courses) don't have
  prerequisites entered yet.
- **Placeholders can appear in results**, e.g. `CORE_ELECTIVES`, because they
  are treated like courses.
- **The prerequisite parser is basic.** It doesn't understand brackets or
  mixed and/or logic (see above).
- **Answering "No" to the standing question has no Back button.** The
  student must reload the page.
- **The saved program isn't restored.** The last chosen program is saved in
  `localStorage` (`tmu_selected_program_v1`), but the dropdown is rebuilt
  after it's restored, so it doesn't stick.
- **Browser Back leaves the page.** Pressing the browser's Back button leaves
  the site instead of going back a step. Students should use the page's own
  ← Back button.
