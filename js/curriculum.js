// Step 2 dropdowns and the Step 3 course checklist, built from PROGRAMS
// (data/programs.js) and COURSES (data/courses.js).

const DEFAULT_YEAR = '2026';

// Ticked courses are kept for the browser tab (sessionStorage), so going back
// or refreshing doesn't lose them, and nothing is left on shared computers.
const TICKED_KEY_PREFIX = 'tmu_completed_courses_v1:';

// The program and admit year whose checklist is on screen.
const currentSelection = { program: '', year: '' };

const PROGRAM_PLACEHOLDER = '-- Choose your program --';
const YEAR_PLACEHOLDER = '-- Select admit year --';

const CHECKLIST_INTRO =
    '<h2>Curriculum Required Courses</h2>' +
    '<p>Select all courses completed with a D- or higher, or approved credit.</p>' +
    '<p class="muted">Not sure if you’ve ever been issued a credit and/or Course Substitution/Directive? Refer to your Advisement Report or reach out to your program department.</p>';

// Admit years with a curriculum for `program`, newest first, as strings.
function yearsFor(program) {
    const years = (PROGRAMS[program] || []).flatMap(version => version.years);
    return years.sort((a, b) => b - a).map(String);
}

// Every admit year offered by any program, newest first.
function allYears() {
    const years = new Set(Object.keys(PROGRAMS).flatMap(yearsFor));
    return [...years].sort((a, b) => b - a);
}

// The semesters for program/year, or null when there is no such curriculum.
function curriculumFor(program, year) {
    const version = (PROGRAMS[program] || []).find(v => v.years.includes(Number(year)));
    return version ? version.semesters : null;
}

function populateProgramSelect() {
    const programSel = byId('programSelect');
    programSel.innerHTML = '';
    programSel.appendChild(new Option(PROGRAM_PLACEHOLDER, ''));
    Object.keys(PROGRAMS).sort().forEach(program => {
        programSel.appendChild(new Option(program, program));
    });

    fillSelect(byId('admitYearSelect'), YEAR_PLACEHOLDER, allYears());
    byId('admitYearSelect').value = DEFAULT_YEAR;
}

// Limit the admit-year dropdown to the years available for `program`.
function updateAdmitYearsForProgram(program) {
    const yearSel = byId('admitYearSelect');
    if (!program) {
        fillSelect(yearSel, YEAR_PLACEHOLDER, allYears());
        yearSel.value = DEFAULT_YEAR;
        return;
    }
    const years = yearsFor(program);
    fillSelect(yearSel, YEAR_PLACEHOLDER, years);
    yearSel.value = years.includes(DEFAULT_YEAR) ? DEFAULT_YEAR : (years[0] || '');
}

// 'AER626 (Aircraft stream elective)' -> code 'AER626' and the name
// 'Applied Finite Elements (Aircraft stream elective)'.
function parseCourseEntry(entry) {
    const [, code, note] = entry.match(/^(\S+)(?: (.*))?$/);
    const course = COURSES[code];
    const name = [course && course.title, note].filter(Boolean).join(' ');
    return { code, name };
}

// The course's page in the TMU calendar, or null when there isn't one
// (placeholders, unknown subjects, courses marked noOutline).
function courseOutlineUrl(code) {
    const course = COURSES[code];
    const subject = code.slice(0, 3);
    const number = code.slice(3);
    if (!course || course.noOutline || !SUBJECT_PATHS[subject] || !/^\d\d[\dAB]$/.test(number)) return null;
    // Two-term capstones (e.g. COE70A/COE70B) share one page under part A.
    const page = number.replace(/B$/, 'A');
    return `https://www.torontomu.ca/calendar/${CALENDAR_YEAR}/courses/${SUBJECT_PATHS[subject]}/${subject}/${page}/`;
}

function outlineLinkHtml(code) {
    const url = courseOutlineUrl(code);
    if (!url) return '';
    return ' <a class="outline-link" href="' + url + '" target="_blank" rel="noopener">Outline</a>';
}

function curriculumChecklistHtml(semesters) {
    let html = CHECKLIST_INTRO;
    semesters.forEach(semester => {
        html += '<div class="semester-head"><h3 class="group-title">' + semester.title + '</h3>' +
            '<button type="button" class="select-all" onclick="toggleSemester(this)">Select all</button></div>';
        html += '<div class="course-grid">';
        semester.courses.map(parseCourseEntry).forEach(({ code, name }) => {
            html += '<label><input type="checkbox" value="' + code + '">' +
                '<span class="course-name"><span class="course-code">' + code + '</span> ' + name + '</span>' +
                outlineLinkHtml(code) + '</label>';
        });
        html += '</div>';
    });
    html += '<p class="selection-count" id="selectionCount"></p>';
    html += '<div class="button-row"><button onclick="calculateEligibility()">Calculate Spring/Summer Eligibility</button></div>';
    return html;
}

// Render the checklist for program/year into Step 3.
// Returns false when there is no curriculum for that combination.
function renderCurriculum(program, admitYear) {
    const semesters = curriculumFor(program, admitYear);
    if (!semesters) return false;
    setDebug('Rendering: ' + program + ':' + admitYear);
    currentSelection.program = program;
    currentSelection.year = admitYear;
    byId('step3').innerHTML = curriculumChecklistHtml(semesters);
    restoreTickedCourses();
    updateChecklistStatus();
    return true;
}

function checklistInputs() {
    return [...document.querySelectorAll('#step3 input[type="checkbox"]')];
}

// "Select all" ticks every course in that semester; if they're all ticked
// already, it clears them instead.
function toggleSemester(button) {
    const inputs = [...button.closest('.semester-head').nextElementSibling.querySelectorAll('input')];
    const tickAll = inputs.some(i => !i.checked);
    inputs.forEach(i => { i.checked = tickAll; });
    onChecklistChange();
}

function onChecklistChange() {
    updateChecklistStatus();
    saveTickedCourses();
}

// Refresh the "N of M selected" line and each semester's toggle label.
function updateChecklistStatus() {
    const inputs = checklistInputs();
    const count = byId('selectionCount');
    if (count) {
        const ticked = inputs.filter(i => i.checked).length;
        count.textContent = ticked + ' of ' + inputs.length + ' courses selected';
    }
    document.querySelectorAll('#step3 .select-all').forEach(button => {
        const grid = button.closest('.semester-head').nextElementSibling;
        const allTicked = [...grid.querySelectorAll('input')].every(i => i.checked);
        button.textContent = allTicked ? 'Clear' : 'Select all';
    });
}

function tickedStorageKey() {
    return TICKED_KEY_PREFIX + currentSelection.program + ':' + currentSelection.year;
}

function saveTickedCourses() {
    const ticked = checklistInputs().filter(i => i.checked).map(i => i.value);
    try {
        sessionStorage.setItem(tickedStorageKey(), JSON.stringify(ticked));
    } catch (e) { /* storage unavailable (e.g. blocked); ticks just aren't remembered */ }
}

function restoreTickedCourses() {
    let ticked = [];
    try {
        ticked = JSON.parse(sessionStorage.getItem(tickedStorageKey()) || '[]');
    } catch (e) { /* storage unavailable or corrupt; start with nothing ticked */ }
    const set = new Set(ticked);
    checklistInputs().forEach(i => { i.checked = set.has(i.value); });
}

function renderCurriculumNotFound(program, admitYear) {
    const years = yearsFor(program);
    let msg = '<div class="warning">No curriculum was found for ' + program + ' (' + admitYear + ').';
    if (years.length) {
        msg += '<br>Available admit years for this program: ' + years.join(', ') + '.</div>';
    } else {
        msg += '<br>This program has no curricula listed.</div>';
    }
    byId('step3').innerHTML = '<h2>Curriculum Not Found</h2>' + msg +
        '<div class="button-row"><button onclick="window.location.reload()">Retry</button></div>';
    setDebug('No curriculum for ' + program + ':' + admitYear);
}

// Show a course's details in an alert. Not currently wired to any button;
// kept for the "info" buttons styled by `.info-btn`.
function showCourseInfo(code) {
    const info = COURSES[code];
    if (!info) { alert('No additional info for ' + code); return; }
    const msg = formatCourseCode(code) + ' - ' + info.title + '\n\n' + (info.description || '') +
        '\n\nPrerequisites: ' + (info.prereqs || 'None') +
        '\nCo-Requisites: ' + (info.coreqs || 'None') +
        '\nAntirequisites: ' + (info.antireqs || 'None');
    alert(msg);
}

function initCurricula() {
    populateProgramSelect();
    setDebug('Curricula loaded. Select your program.');
}
