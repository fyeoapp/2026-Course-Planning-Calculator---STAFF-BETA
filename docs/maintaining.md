# Maintaining the calculator

Everything you need to keep the calculator accurate and to change it safely.
For how the code is built, see [architecture.md](architecture.md).

---

## Contents

- [Setup](#setup)
- [Data reference](#data-reference)
  - [`data/courses.js`](#datacoursesjs--course-catalog)
  - [`data/programs.js`](#dataprogramsjs--curricula)
  - [`data/spring-summer.js`](#dataspring-summerjs--springsummer-offerings)
  - [Where the data comes from](#where-the-data-comes-from)
- [Yearly update runbook](#yearly-update-runbook)
- [Recipes](#recipes)
- [Checking your changes](#checking-your-changes)
- [Code conventions](#code-conventions)
- [Git workflow and deploying](#git-workflow-and-deploying)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)

---

## Setup

| You need | For |
|---|---|
| A web browser | Running the site: open `index.html` |
| A text editor | Editing anything |
| [Node.js](https://nodejs.org) (optional) | `node scripts/check-data.js` |
| Git | Committing and sharing changes |

```sh
git clone https://github.com/juderozario08/2026-Course-Planning-Calculator---STAFF-BETA.git
cd 2026-Course-Planning-Calculator---STAFF-BETA
open index.html
```

There's no install, build or server. Edit a file, then hard-refresh the browser
(**⌘⇧R** / **Ctrl+Shift+R**). Add `?debug` to the URL (`index.html?debug`) to
show the status pill, which shows which program and year were loaded.

---

## Data reference

Almost every routine change is a data change in one of these three files. You
rarely need to touch `js/`.

### `data/courses.js` — course catalog

Every course is defined **exactly once**, keyed by its code with no space.
The file also holds the settings used to build Outline links.

```js
// Outline links point to the course's page in this TMU calendar year.
const CALENDAR_YEAR = '2026-2027';

// Calendar URL path for each course subject.
const SUBJECT_PATHS = {
    AER: 'aerospace',
    MTH: 'mathematics',
    ...
};

const COURSES = {
    CEN100: { title: 'Introduction to Engineering' },
    MTH240: {
        title: 'Calculus II',
        prereqs: 'MTH 140',
        antireqs: 'MTH 310 and MTH 231',
        description: 'Integration techniques, improper integrals, ...',
    },
    CHE316: { title: 'Unit Operations Laboratory I', noOutline: true },
    ...
};
```

| Field | Required | Used for |
|---|---|---|
| `title` | yes | Shown after the code in the checklist and results |
| `prereqs` | no | **Drives eligibility.** Copy it word for word from the calendar course page. Omit if there are none. |
| `coreqs`, `antireqs`, `customRequisites` | no | Reference only. Copied from the calendar; not checked. |
| `description` | no | Reference only |
| `noOutline` | no | `true` when the course has no page in the current calendar. Hides its Outline link and excludes it from results. |

Rules:

- Keep entries in **alphabetical order** by code.
- Leave a field out rather than writing `'None'`.
- **Two-term capstones** are split into part A and part B entries (`COE70A`,
  `COE70B`); the calendar writes them as `COE 70A/B`. Part B's Outline link
  goes to the part-A page.
- **Placeholders** stand for "pick from a table" requirements:
  `CORE_ELECTIVES` (title "Core electives") and `CHE___` (title "Core Elective
  (see Table I)"). They appear as checkboxes but never in results.

**Outline links** are built as:

```
https://www.torontomu.ca/calendar/<CALENDAR_YEAR>/courses/<SUBJECT_PATHS[subject]>/<SUBJECT>/<number>/
MTH140 → https://www.torontomu.ca/calendar/2026-2027/courses/mathematics/MTH/140/
```

A course with a **new subject prefix** needs a `SUBJECT_PATHS` entry. Copy
the path from any link to that subject's courses on a calendar page. Without
one, the course has no Outline link and is left out of results.

### `data/programs.js` — curricula

Each program has a list of **versions**. A version is one curriculum and the
admit years it applies to.

```js
const PROGRAMS = {
    'Aerospace Engineering': [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024],
            semesters: [ ... ],
        },
        {
            years: [2026],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '6th Semester (Stream Electives)', courses: [
                        'AER626 (Aircraft stream elective)', 'AER699 (Avionics stream elective)'
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

- **The key is the dropdown label.** Use the full name:
  `'Aerospace Engineering'`. Options with their own upper-year courses are
  separate programs, e.g. `'Civil Engineering (Structural Option)'`.
- **Each admit year may appear in only one version** of a program.
- A year not listed in any version isn't offered. Aerospace and Mechatronics
  currently have no 2025, for example.
- `semesters` is an ordered list of headed groups. `title` is shown as the
  heading, so use whatever is clearest: `'7th Semester (Liberal Studies)'`,
  `'2nd Semester (Civil Group)'`.
- A course entry is a code, optionally followed by a note that's added after
  the title **for this program only**:
  `'AER626 (Aircraft stream elective)'` → "AER626 Applied Finite Elements
  (Aircraft stream elective)".
- The same code may appear in several groups (Undeclared lists `CPS125` under
  several program groups).

Current coverage:

| Program | Versions (admit years) |
|---|---|
| Aerospace Engineering | 2019–2024 · 2026 |
| Biomedical Engineering | 2019–2026 |
| Chemical Engineering (Co-op) | 2019–2025 · 2026 |
| Civil Engineering | 2019–2025 · 2026 |
| Civil Engineering (Structural Option) | 2026 |
| Computer Engineering | 2019–2025 · 2026 |
| Computer Engineering (Software Engineering Option) | 2026 |
| Electrical Engineering | 2019–2025 · 2026 |
| Industrial Engineering | 2026 |
| Mechanical Engineering | 2026 |
| Mechatronics Engineering | 2019–2024 · 2026 |
| Undeclared Engineering | 2026 |

### `data/spring-summer.js` — Spring/Summer offerings

The courses offered in the FEAS **Spring/Summer transition session**. These
are listed first in the results, with their term.

```js
const SPRING_SUMMER = {
    session: 'Spring/Summer 2026',          // shown on the results page
    spring: ['AER222', 'BME100', ...],      // May–June
    summer: ['ELE202', 'MTE401', ...],      // July–August
    osms:   ['EMS201', ...],                // Management Sciences option (spring)
};
```

- The lists are **faculty-wide**: any engineering student may take a listed
  course if they meet its prerequisites.
- A course in both `spring` and `summer` is labelled "Spring or Summer".
- Every code must exist in `courses.js`.

### Where the data comes from

| Data | Source |
|---|---|
| Curricula (`programs.js`) | Program pages: `https://www.torontomu.ca/calendar/<YYYY-YYYY>/programs/feas/<slug>/` |
| Titles and requisites (`courses.js`) | Course pages: the course's Outline link |
| Spring/Summer offerings | **"Significant Dates & Courses"** on the [Engineering Transition Program page](https://www.torontomu.ca/engineering-architectural-science/programs/undergraduate-programs/transition-program/) |

Program page slugs:

| Program | `<slug>` |
|---|---|
| Aerospace | `aerospace` |
| Biomedical | `biomedical_eng` |
| Chemical | `chemical` |
| Civil (+ Structural Option) | `civil` |
| Computer (+ Software Engineering Option) | `computer_eng` |
| Electrical | `electrical` |
| Industrial | `industrial` |
| Mechanical | `mechanical` |
| Mechatronics | `mechatronics-engineering` |
| Undeclared | `undeclared_eng` |

On each program page, read the **"Full-Time, Four-Year Program"** section and
any **"… Option"** sections. Watch for notes such as *"Revised curriculum
begins 2026-2027 for students admitted Fall 2023 and after"* or *"Last offered
2026-2027 to students admitted Fall 2022"*. They tell you which admit years a
change applies to.

---

## Yearly update runbook

Do this when the new undergraduate calendar is published (usually spring),
and again when the new transition-session course list is posted. The example
moves from 2026-2027 to **2027-2028**.

**1. Branch**

```sh
git switch main && git pull
git switch -c update-2027
```

**2. Curricula.** For each program, open its new calendar page and compare it
with that program's latest version in `data/programs.js`.

- **Unchanged?** Add `2027` to the latest version's `years`. That's all.
- **Changed?** Copy the latest version, set `years: [2027]`, and edit the copy.
  Leave older versions alone; earlier students still follow them.
- **New program or option?** See [Add a program or option](#add-a-program-or-option).

**3. Courses.** Add every new course to `data/courses.js`, with its title and
prerequisites from its calendar page. If a course has a new code, add it as a
new course (see [A course got a new code](#a-course-got-a-new-code)).

**4. Prerequisites.** Prerequisites can change between calendars. Spot-check
the courses students use most: first- and second-year courses, and everything
on the Spring/Summer list.

**5. Calendar year for links.** In `data/courses.js` set
`CALENDAR_YEAR = '2027-2028'`. Open a few Outline links to confirm they load.
If a course has been dropped from the calendar, add `noOutline: true` to it.

**6. Spring/Summer offerings.** When the new transition session is posted,
replace the `spring`, `summer` and `osms` lists in `data/spring-summer.js`
and set `session: 'Spring/Summer 2027'`.

**7. Year shown on the page:**

| File | Change |
|---|---|
| `js/curriculum.js` | `DEFAULT_YEAR = '2027'` (pre-selected admit year) |
| `index.html` | Page `<title>`, header title and `<h1>`: "Engineering **2027-2028** Course Planning Calculator" |
| `index.html` | Significant Dates Calendar link: `/calendar/2027-2028/dates/` |
| `index.html` | "Any additional Spring/Summer supports" link (currently a 2025 news post) |

Catch anything else with: `grep -rn 2026 index.html js/ data/courses.js data/spring-summer.js`.

**8. Check**, then **commit and open a pull request** (see
[Checking your changes](#checking-your-changes) and
[Git workflow](#git-workflow-and-deploying)).

---

## Recipes

### A new intake year, curriculum unchanged

```diff
 'Biomedical Engineering': [
     {
-        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
+        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027],
```

### The curriculum changed

Copy the latest version, give the copy only the new year(s), and edit it:

```js
'Electrical Engineering': [
    { years: [2019, 2020, ..., 2025], semesters: [ /* old */ ] },
    { years: [2026],                  semesters: [ /* new */ ] },
],
```

If the calendar says a revision also applies to earlier intakes, move those
years into the new version too. Each year can only be in one version.

### Add a new course

1. Add it to `data/courses.js` in alphabetical order:
   ```js
   MTE712: {
       title: 'Sensor Fusion',
       prereqs: 'MTH 410, MTH 510, MTE 751',
   },
   ```
2. Reference `'MTE712'` in the right semester in `data/programs.js`.
3. If its subject prefix is new, add it to `SUBJECT_PATHS`.

### A course was renamed

Change its `title` in `data/courses.js`. **Titles are shared by every program
and year,** so all of them show the new name. That's normally right, since
it's the same course.

### A course got a new code

Add the new code as a new course and use it in the new curriculum version.
Keep the old code, because older versions still use it. Mark the old code
`noOutline: true` once it's no longer in the calendar.
(Example: CHE316 → CHE315 in 2026.)

### A code in the data is a typo

If the code doesn't exist in any calendar (no course page), it's a data
error. Fix it in **every** version that uses it, and remove the bad entry from
`courses.js` once nothing uses it. (Example: MTE713 → MEC713.)

### A note that only applies in one program

Put it after the code: `'CPS688 (group option)'`, `'AER627 (core elective)'`.

### Add a program or option

Add a new key to `PROGRAMS`. The dropdown sorts alphabetically, so position
doesn't matter. For an option sharing the early years with its main program,
copy those semesters:

```js
'Civil Engineering (Structural Option)': [
    {
        years: [2026],
        semesters: [
            // 1st–4th semester: same as Civil Engineering
            // 5th–8th semester: option-specific
        ],
    },
],
```

Renaming a program changes its dropdown label, and the next visit won't
restore a previously saved choice of the old name. That's harmless.

### Remove a program or year

Delete the key, or remove the year from `years`. Delete a version whose
`years` becomes empty.

### Change the Spring/Summer course-load limit

`MAX_RECOMMENDED_COURSES` at the top of `js/eligibility.js`. The fixed
guidance text in Step 5 is in `index.html`.

### Change sidebar or header links

Edit `index.html`. Link buttons use `data-href="…"`; `main.js` opens any
`button[data-href]` in a new tab, so no JavaScript changes are needed.

### Change wording on the page

| Text | Where |
|---|---|
| Step 1, Step 2, Step 5 text and headings | `index.html` |
| Step 3 heading and instructions | `CHECKLIST_INTRO` in `js/curriculum.js` |
| Results headings, messages, notes | `resultsHtml()` in `js/eligibility.js` |
| Dropdown placeholders | `PROGRAM_PLACEHOLDER`, `YEAR_PLACEHOLDER` in `js/curriculum.js` |

### Change colours

Edit the tokens in `:root` at the top of `css/styles.css`. Keep them in line
with the CEN100 Assignment Calculator.

---

## Checking your changes

Screenshots of every step, taken from a real run, are in the
[user guide](user-guide.md). Use them to compare what you see.

### 1. Validate the data (needs Node)

```sh
node scripts/check-data.js
```

It reports syntax errors in the data files, course codes missing from
`courses.js`, admit years listed in more than one version, badly formed
course entries, and Spring/Summer codes that don't exist. Success prints
something like `✓ Data OK (12 programs, 288 courses).`

### 2. Click through in a browser

Open `index.html?debug`, hard-refresh, and keep the console open (**⌥⌘J** in
Chrome, **⌥⌘K** in Firefox). Red errors usually mean a typo in a data file,
and the dropdowns will be empty.

For each program and year you changed: pick it, press Continue, compare the
checklist with the calendar, tick a few semesters, and press Calculate.

### 3. Full manual test checklist

Run this before merging any change to `js/` or `css/`. Use a fresh private
window.

| # | Do | Expect |
|---|---|---|
| 1 | Load the page | No status pill (without `?debug`); program list shows full names |
| 2 | Click **No** | Step 1 stays, red "consult your program department" message, no Back button |
| 3 | Click **Yes** | Step 2; message gone; "Program" highlighted |
| 4 | Browser Back, then Forward | Step 1, then Step 2; never leaves the site |
| 5 | Pick Mechanical Engineering, Continue | Year list shows only 2026; checklist shows "0 of 61 courses selected" |
| 6 | **Select all** on semesters 1 and 2 | "12 of 61"; buttons change to **Clear**; Clear unticks |
| 7 | ← Back, then Continue | Ticks still there |
| 8 | Refresh the page, Yes, Continue | Mechanical pre-selected; ticks still there |
| 9 | Calculate | 8 Spring courses eligible (MEC 323, MTH 425, PCS 213, EES 512, MEC 309, MEC 311, MTH 410, MTH 510), each with a Spring label and "Prerequisites met"; "You qualify for 8" course-load warning; "Other courses" collapsed |
| 10 | Click an **Outline** link | Correct calendar page opens in a new tab; checkbox not ticked |
| 11 | Browser Back, Clear semester 1, Calculate | "Can't take yet" group with "Still needs:" lines, e.g. MTH 425 still needs MTH 140, MTH 141 |
| 12 | Print / save as PDF | Preview shows only results and guidance; "Other courses" expanded |
| 13 | Try a few other programs and years | Results appear; no `CORE_ELECTIVES` or `CHE___` in results; no console errors |
| 14 | Narrow the window to phone width | Sidebar below; Back above the title; course codes never split across lines |
| 15 | Open `index.html?debug` | Status pill shows, e.g. "Rendering: Mechanical Engineering:2026" |

---

## Code conventions

- 4-space indentation, single quotes, semicolons.
- **No frameworks, build step or modules.** Add plain functions to the most
  fitting `js/` file. A new script needs a `<script>` tag in `index.html` in
  the right order (data first, `main.js` last).
- **Data in `data/`, logic in `js/`.** Never hardcode course lists in JS.
- Only `main.js` runs code at load time. Other files define constants and
  functions.
- Wrap all `localStorage`/`sessionStorage` access in `try/catch`.
- Rendered HTML must only contain text from our own data files, never
  anything a user typed.
- Styles live only in `css/styles.css`, using the `:root` tokens.
- Don't rename element IDs listed in
  [architecture.md → Page structure](architecture.md#page-structure-indexhtml).
- Keep commits focused, e.g. data updates separate from styling.

---

## Git workflow and deploying

### Repositories

| Repository | Role |
|---|---|
| `fyeoapp/2026-Course-Planning-Calculator---STAFF-BETA` | **Upstream**, owned by FYEO. GitHub Pages publishes the live site from its **`intelli`** branch at https://fyeoapp.github.io/2026-Course-Planning-Calculator---STAFF-BETA/ |
| `juderozario08/2026-Course-Planning-Calculator---STAFF-BETA` | **Fork**, where this version of the codebase is developed. Not published. |

> **Note:** upstream's `intelli` branch is a separately developed version of
> the planner, with its own Python generators and data folders. This fork was
> branched from upstream `main` and restructured, so its history and layout
> differ from `intelli`. Getting this version live means agreeing with the
> upstream maintainers how to bring the two together. It's not a simple merge.

### Day-to-day

```sh
git switch main && git pull
git switch -c <short-description>     # e.g. update-2027, fix-print-layout
# ...edit, check...
git add -A && git commit -m "Describe the change"
git push -u origin <short-description>
gh pr create --base main               # review, then merge into main
```

- Keep data and code changes in separate commits.
- Run `node scripts/check-data.js` and the relevant manual checks before
  opening a PR.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Dropdowns are empty | Syntax error in a data file | `node scripts/check-data.js`, or read the console error's line number |
| Old version still showing | Browser cache | Hard-refresh: ⌘⇧R / Ctrl+Shift+R |
| A program is missing from the dropdown | Missing or misspelled key in `programs.js` | Check the key and run the checker |
| A year is missing for a program | Not in any version's `years` | Add it to the right version |
| A course shows `??` or only its code | Not in `courses.js` | Add it; the checker lists these |
| A course never appears in results | No calendar page (`noOutline`), unknown subject, or it's a placeholder | Add its `SUBJECT_PATHS` entry, or check `noOutline` |
| An upper-year course is never eligible | Its `prereqs` are wrong or reference a course not in the checklist | Compare with the calendar course page |
| Outline link gives "page not found" | Course dropped from the calendar, or wrong `SUBJECT_PATHS` | Add `noOutline: true`, or fix the path |
| Ticks or saved program not remembered | Browser blocks storage (e.g. strict private mode) | Expected; the page still works without it |
| Browser Back leaves the site | You're on Step 1 (there's nothing before it) | Expected |

---

## Known limitations

- **Only prerequisites are checked.** Corequisites, antirequisites and
  program restrictions aren't.
- **Spring/Summer offerings are last year's list** until the new one is
  posted, and upper-year courses only run with sufficient enrolment. The
  results tell students this.
- **Courses without a calendar page** (`noOutline`) are never suggested,
  because their requisites are unknown.
- **Placeholders** (`CORE_ELECTIVES`, `CHE___`) can't be assessed. Students
  need to check the relevant elective table.
- **Ticks aren't shared** between tabs or devices, by design.
