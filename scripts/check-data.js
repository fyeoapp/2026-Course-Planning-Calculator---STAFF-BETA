#!/usr/bin/env node
// Sanity-check data/courses.js, data/programs.js and data/spring-summer.js.
// Usage: node scripts/check-data.js
//
// Reports:
//   - syntax errors in the data files
//   - course codes used in programs.js that are missing from courses.js
//   - admit years listed in more than one version of the same program
//   - programs.js entries that aren't in the expected 'CODE' or 'CODE (note)' form
//   - spring-summer.js course codes that don't exist

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const ctx = {};
try {
    vm.runInNewContext(read('data/courses.js') + read('data/programs.js') + read('data/spring-summer.js') +
        ';this.COURSES = COURSES; this.PROGRAMS = PROGRAMS; this.SPRING_SUMMER = SPRING_SUMMER;', ctx);
} catch (e) {
    console.error('Could not load the data files: ' + e.message);
    process.exit(1);
}

const problems = [];
for (const [program, versions] of Object.entries(ctx.PROGRAMS)) {
    const seenYears = new Set();
    for (const version of versions) {
        for (const year of version.years) {
            if (seenYears.has(year)) problems.push(`${program}: ${year} is listed in more than one version`);
            seenYears.add(year);
        }
        for (const semester of version.semesters) {
            for (const entry of semester.courses) {
                if (!/^\S+( \(.+\))?$/.test(entry)) {
                    problems.push(`${program} "${semester.title}": '${entry}' should look like 'CODE' or 'CODE (note)'`);
                }
                const code = entry.split(' ')[0];
                if (!ctx.COURSES[code]) {
                    problems.push(`${program} "${semester.title}": ${code} is missing from data/courses.js`);
                }
            }
        }
    }
}

for (const list of ['spring', 'summer', 'osms']) {
    for (const code of ctx.SPRING_SUMMER[list] || []) {
        if (!ctx.COURSES[code]) problems.push(`spring-summer.js ${list}: ${code} is missing from data/courses.js`);
    }
}

if (problems.length) {
    problems.forEach(p => console.log('✗ ' + p));
    console.log(`\n${problems.length} problem(s) found.`);
    process.exit(1);
}
const programCount = Object.keys(ctx.PROGRAMS).length;
const courseCount = Object.keys(ctx.COURSES).length;
console.log(`✓ Data OK (${programCount} programs, ${courseCount} courses).`);
