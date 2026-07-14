const fs = require('fs');

// Load JSON files
const springCourses = JSON.parse(fs.readFileSync('spring_26-27.json', 'utf8'));
const summerCourses = JSON.parse(fs.readFileSync('summer_26-27.json', 'utf8'));

// Simulate user completed courses — change these to test different scenarios
const completedCourses = ['MTH140', 'MTH141', 'PCS125'];

const completedSet = new Set(
   completedCourses.map(c => c.toUpperCase().replace(/\s+/g, ''))
);

function normalizeCode(s) {
   return (s || '').toUpperCase().replace(/\s+/g, '');
}


function checkPrereqs(prereqs) {
   if (!prereqs || prereqs.length === 0) return true;
   return prereqs.every(req => {
       if (Array.isArray(req)) {
           return req.some(r => completedSet.has(normalizeCode(r)));
       }
       return completedSet.has(normalizeCode(req));
   });
}

function getEligible(courseList, label) {
   const eligible = [];
   for (const course of courseList) {
       const code = normalizeCode(course.anchor_text);
       if (completedSet.has(code)) continue;
       const prereqsMet = checkPrereqs(course.prereqs);
       console.log(`[${label}] ${course.anchor_text} | prereqs: ${JSON.stringify(course.prereqs)} | met: ${prereqsMet}`);
       if (prereqsMet) {
           eligible.push(course.anchor_text);
       }
   }
   return eligible;
}

console.log('\nCompleted courses:', [...completedSet]);
console.log('\n--- Spring ---');
const springEligible = getEligible(springCourses, 'SPRING');
console.log('\nSpring eligible:', springEligible);

console.log('\n--- Summer ---');
const summerEligible = getEligible(summerCourses, 'SUMMER');
console.log('\nSummer eligible:', summerEligible);
