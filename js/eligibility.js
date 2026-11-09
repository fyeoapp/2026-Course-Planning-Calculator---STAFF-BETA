// Spring/Summer eligibility (Step 3 -> Steps 4 & 5).
//
// Prerequisite text from the calendar, e.g.
//   'CEN 199 and (EES 512 or MTE 401)'
//   'COE 528, MTH 514 and [(COE 501, ELE 632) or (COE 691, CPS 688)]'
// is parsed into a tree of { all: [...] } / { any: [...] } / { code } nodes.
// Commas and "and" mean all-of, "or" means any-of, and "and" binds tighter
// than "or". Brackets ( ) and [ ] group.

// Show a course-load reminder when more Spring/Summer courses than this qualify.
const MAX_RECOMMENDED_COURSES = 2;

function normalizeCode(s) {
    return (s || '').toUpperCase().replace(/\s+/g, '');
}

// 'MTH141' -> 'MTH 141'; anything else is returned unchanged.
function formatCourseCode(code) {
    return code.replace(/^([A-Z]{3})(\d{2}[0-9A-Z])$/, '$1 $2');
}

function tokenizePrereqs(text) {
    return text.toUpperCase().match(/[A-Z]{3} ?\d{2}[0-9A-Z]|\bAND\b|\bOR\b|[()[\],]/g) || [];
}

// Parse prerequisite text into a tree, or null when there are none.
function parsePrereqs(text) {
    const tokens = tokenizePrereqs(text || '');
    let pos = 0;

    function parseAny() {
        const items = [parseAll()];
        while (tokens[pos] === 'OR') {
            pos++;
            items.push(parseAll());
        }
        return items.length === 1 ? items[0] : { any: items };
    }

    function parseAll() {
        const items = [parseTerm()];
        while (pos < tokens.length && !['OR', ')', ']'].includes(tokens[pos])) {
            // Separators (",", "and", ", and") join terms; adjacent codes count too.
            while (tokens[pos] === ',' || tokens[pos] === 'AND') pos++;
            if (pos >= tokens.length || ['OR', ')', ']'].includes(tokens[pos])) break;
            items.push(parseTerm());
        }
        return items.length === 1 ? items[0] : { all: items };
    }

    function parseTerm() {
        const token = tokens[pos++];
        if (token === '(' || token === '[') {
            const node = parseAny();
            pos++; // closing bracket
            return node;
        }
        return { code: normalizeCode(token) };
    }

    return tokens.length ? parseAny() : null;
}

// The smallest set of courses still needed to satisfy `node`.
function missingCourses(node, completed) {
    if (!node) return [];
    if (node.code) return completed.has(node.code) ? [] : [node.code];
    if (node.all) return [...new Set(node.all.flatMap(n => missingCourses(n, completed)))];
    return node.any
        .map(n => missingCourses(n, completed))
        .reduce((best, m) => (m.length < best.length ? m : best));
}

// Courses that can be judged: real catalog courses with a calendar page, so
// placeholders (CORE_ELECTIVES) and courses without known requisites are skipped.
function isAssessable(code) {
    const course = COURSES[code];
    return Boolean(course && !course.noOutline && courseOutlineUrl(code));
}

function springSummerCourses(program) {
    return new Set([
        ...SPRING_SUMMER.allPrograms,
        ...(SPRING_SUMMER.byProgram[program] || []),
    ]);
}

// Sort every unticked checklist course into eligible / not yet.
function assessCourses(program) {
    const inputs = [...document.querySelectorAll('#step3 input[type="checkbox"]')];
    const completed = new Set(inputs.filter(i => i.checked).map(i => normalizeCode(i.value)));
    const offered = springSummerCourses(program);
    const seen = new Set();
    const results = [];

    inputs.forEach(input => {
        const code = normalizeCode(input.value);
        if (completed.has(code) || seen.has(code) || !isAssessable(code)) return;
        seen.add(code);
        const prereqs = COURSES[code].prereqs || '';
        const missing = missingCourses(parsePrereqs(prereqs), completed);
        results.push({ code, prereqs, missing, springSummer: offered.has(code) });
    });

    return {
        springSummer: results.filter(r => r.springSummer && r.missing.length === 0),
        notYet: results.filter(r => r.springSummer && r.missing.length > 0)
            .sort((a, b) => a.missing.length - b.missing.length),
        otherEligible: results.filter(r => !r.springSummer && r.missing.length === 0),
    };
}

function resultRowHtml(result) {
    const title = COURSES[result.code].title;
    let reason;
    if (result.missing.length) {
        reason = 'Still needs: ' + result.missing.map(formatCourseCode).join(', ');
    } else if (result.prereqs) {
        reason = 'Prerequisites met: ' + result.prereqs;
    } else {
        reason = 'No prerequisites';
    }
    return '<li class="result-row">' +
        '<div class="result-main"><span class="course-code">' + formatCourseCode(result.code) + '</span> ' + title +
        outlineLinkHtml(result.code) + '</div>' +
        '<div class="result-reason' + (result.missing.length ? ' is-missing' : '') + '">' + reason + '</div>' +
        '</li>';
}

function resultListHtml(results) {
    return '<ul class="result-list">' + results.map(resultRowHtml).join('') + '</ul>';
}

function resultsHtml(assessment) {
    const { springSummer, notYet, otherEligible } = assessment;
    let html = '';

    html += '<h3 class="result-heading">Offered in Spring/Summer and you\'re eligible</h3>';
    if (springSummer.length) {
        html += resultListHtml(springSummer);
    } else {
        html += '<p class="result-empty">None of your program\'s Spring/Summer courses are available to you yet. ' +
            'Check the courses below or speak with your program advisor.</p>';
    }

    if (springSummer.length > MAX_RECOMMENDED_COURSES) {
        html += '<div class="load-warning">You qualify for ' + springSummer.length + ' Spring/Summer courses, ' +
            'but they run in a compressed 6-week format. Take no more than ' + MAX_RECOMMENDED_COURSES +
            ' per term.</div>';
    }

    if (notYet.length) {
        html += '<h3 class="result-heading">Spring/Summer courses you can\'t take yet</h3>';
        html += resultListHtml(notYet);
    }

    if (otherEligible.length) {
        html += '<details class="result-more"><summary>Other courses you meet the prerequisites for (' +
            otherEligible.length + ')</summary>' +
            '<p class="result-note">These aren\'t listed as Spring/Summer offerings in the calendar. ' +
            'Check the Spring/Summer timetable before planning around them.</p>' +
            resultListHtml(otherEligible) + '</details>';
    }

    html += '<div class="button-row no-print"><button onclick="window.print()">Print / save as PDF</button></div>';
    return html;
}

function calculateEligibility() {
    const assessment = assessCourses(currentSelection.program);
    byId('eligibleCourses').innerHTML = resultsHtml(assessment);
    goToStep(4);
}
