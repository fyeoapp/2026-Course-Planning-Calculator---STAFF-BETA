// Courses offered in the condensed Spring/Summer term (May-July).
//
// Source: the "Transition Programs" section of each program's page in the TMU
// calendar (see CALENDAR_YEAR in data/courses.js). The calendar notes these
// run "subject to adequate enrolment".
//
// The eligibility results list these courses first. Other courses a student
// qualifies for are shown separately, with a reminder to check the timetable.

const SPRING_SUMMER = {
    // First-year transition program, Phase II: offered to every program.
    allPrograms: [
        'AER222', 'BME100', 'CHE200', 'CHY211', 'CPS125', 'CPS188', 'CVL207', 'ELE202',
        'MEC222', 'MTH240', 'MTL200', 'PCS125'
    ],

    // Extra upper-year offerings for specific programs. Keys must match the
    // program names in data/programs.js.
    byProgram: {
        'Aerospace Engineering': ['EES512', 'MTH410'],
        'Computer Engineering': ['ELE635', 'ELE639'],
        'Computer Engineering (Software Engineering Option)': ['ELE635', 'ELE639'],
        'Electrical Engineering': ['ELE635', 'ELE639'],
        // Industrial students can also take CMN 432 through The Chang School.
        'Industrial Engineering': ['MTH425', 'MEC323', 'MEC311', 'CMN432'],
        'Mechanical Engineering': ['MTH425', 'MEC323', 'MEC311'],
        'Mechatronics Engineering': ['MTH425', 'MEC323', 'MEC311'],
    },
};
