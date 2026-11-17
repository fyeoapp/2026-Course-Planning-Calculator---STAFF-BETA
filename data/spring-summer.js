// Courses offered in the FEAS Spring/Summer transition session.
//
// Source: the FEAS "Spring/Summer 2027 Undergraduate Course Offerings" sheet
// (revised 16/11/2026), posted under "Significant Dates & Courses" on the
// Engineering Transition Program page (the "Spring/Summer Engineering
// Transition Program" sidebar link):
// https://www.torontomu.ca/engineering-architectural-science/programs/undergraduate-programs/transition-program/
//
// The lists are faculty-wide: any engineering student may take a listed
// course if they meet its prerequisites. Upper-year courses run "subject to
// sufficient enrolments". Update all three lists each year from that page.

const SPRING_SUMMER = {
    // Which session these lists were copied from.
    session: 'Spring/Summer 2027',

    // Spring term: May 5 to June 19, 2027 (exams June 22-26).
    // ASC 203 (Architectural Science) is also offered but is not in any engineering
    // curriculum, so it is left out. CHY 211 runs with the CHY 113 lab.
    spring: [
        'AER222', 'BME100', 'CEN100', 'CHY211', 'CHE200', 'CPS125', 'CPS188', 'CVL207', 'ELE202',
        'MEC222', 'MTH140', 'MTH141', 'MTH240', 'MTL200', 'PCS211', 'AER309', 'AER318', 'AER320',
        'AER509', 'AER520', 'BME323', 'BME328', 'BME639', 'BME674', 'CHE308', 'CHE312', 'CHE338',
        'CHE474', 'COE318', 'COE328', 'CPS688', 'CVL320', 'CVL500', 'EES512', 'EES612', 'ELE302',
        'ELE639', 'IND832', 'MEC309', 'MEC311', 'MEC323', 'MEC430', 'MEC511', 'MEC522', 'MEC701',
        'MEC709', 'MEC832', 'MTE301', 'MTE401', 'MTE501', 'MTE502', 'MTH410', 'MTH425', 'MTH510',
        'MTH514', 'PCS213', 'PCS224'
    ],

    // Summer term: June 28 to August 11, 2027 (exams August 12-13).
    summer: [
        'ELE202', 'MTH240', 'PCS125', 'AER316', 'AER403', 'AER423', 'AER606', 'BME406', 'BME423',
        'BME516', 'BME632', 'CHE215', 'CHE220', 'COE428', 'COE528', 'CVL316', 'CVL410', 'CVL411',
        'CVL420', 'CVL502', 'ELE404', 'ELE632', 'ELE635', 'IND400', 'IND605', 'MEC511', 'MEC516',
        'MTE603', 'MTE604', 'MTE751', 'MTH314', 'MTH425'
    ],

    // Optional Specialization in Management Sciences, run alongside spring.
    osms: [
        'EMS201', 'EMS202', 'EMS204', 'EMS301', 'EMS303', 'EMS304'
    ],
};
