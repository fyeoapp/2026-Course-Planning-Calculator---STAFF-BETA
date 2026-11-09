// Program curricula. Course titles come from data/courses.js.
//
// Each program lists one or more curriculum versions. A version applies to
// every admit year in its `years` list, so a new intake year with an
// unchanged curriculum is a one-number change. Add a new version only when
// the curriculum actually changes.
//
// Course entries are course codes. Anything after the code is appended to the
// course title, e.g. 'AER626 (Aircraft stream elective)' renders as
// "AER626 Applied Finite Elements (Aircraft stream elective)".

const PROGRAMS = {
    'Aerospace Engineering': [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'AER222', 'CPS125', 'ECN801', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'AER309', 'AER316', 'AER318', 'AER320', 'CMN432', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'AER403', 'AER404', 'AER416', 'AER423', 'EES512', 'MTH410'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'AER504', 'AER507', 'AER520', 'EES612', 'MTH510'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'AER509', 'AER606', 'AER615', 'AER621', 'AER622'
                    ]
                },
                {
                    title: '6th Semester (Stream Electives)', courses: [
                        'AER626', 'AER699', 'AER721'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies & Stream Requirements)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507', 'AER715', 'AER716', 'AER722',
                        'EES508', 'AER723', 'AER821'
                    ]
                },
                {
                    title: '7th Semester (Stream Electives / Core Electives)', courses: [
                        'AER817', 'AER827', 'AER850'
                    ]
                },
                {
                    title: '8th Semester (Required & Design Projects)', courses: [
                        'AER710', 'CEN800', 'AER627', 'AER818', 'AER870', 'CEN810', 'AER814', 'AER822',
                        'AER813'
                    ]
                },
            ],
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
                    title: '2nd Semester (Required)', courses: [
                        'AER222', 'CPS125', 'ECN801', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'AER309', 'AER316', 'AER318', 'AER320', 'CMN432', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'AER403', 'AER404', 'AER416', 'AER423', 'EES512', 'MTH410'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'AER504', 'AER507', 'AER520', 'EES612', 'MTH510'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'AER509', 'AER606', 'AER615', 'AER621', 'AER622'
                    ]
                },
                {
                    title: '6th Semester (Stream Electives)', courses: [
                        'AER626 (Aircraft stream elective)', 'AER699 (Avionics stream elective)',
                        'AER721 (Spacecraft stream elective)'
                    ]
                },
                {
                    title: '7th Semester (Liberal studies & stream reqs)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507', 'AER715', 'AER716', 'AER722',
                        'EES508', 'AER723', 'AER821'
                    ]
                },
                {
                    title: '7th Semester (Stream Electives / Core Electives)', courses: [
                        'AER817', 'AER827', 'AER850'
                    ]
                },
                {
                    title: '8th Semester (Required & design projects)', courses: [
                        'AER710', 'CEN800', 'AER627 (core elective)', 'AER818 (core elective)',
                        'AER870 (core elective)', 'CEN810 (core elective)', 'AER814', 'AER822',
                        'AER813'
                    ]
                },
            ],
        },
    ],
    'Biomedical Engineering': [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'BME100', 'CPS188', 'ECN801', 'ELE202', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'BLG143', 'BME229', 'BME323', 'BME328', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'BLG601', 'BME406', 'BME423', 'BME434', 'CMN432'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'BLG701', 'BME501', 'BME506', 'BME516', 'BME532', 'BME538'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'BME632', 'BME634', 'BME639', 'BME674', 'MTH410'
                    ]
                },
                {
                    title: '7th Semester (Required & Liberal Studies)', courses: [
                        'BME70A', 'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '7th Semester (Core Electives / Options)', courses: [
                        'BME703', 'BME704', 'BME705', 'BME714', 'BME772', 'BME777'
                    ]
                },
                {
                    title: '8th Semester (Capstone & Core Electives)', courses: [
                        'BME70B', 'CEN800', 'BME802', 'BME803', 'BME809', 'BME872', 'BME804', 'BME808',
                        'CEN810'
                    ]
                },
            ],
        },
    ],
    'Chemical Engineering (Co-op)': [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CHE200', 'CHY211', 'CPS125', 'ECN801', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CHE204', 'CHE217', 'CHY224', 'EES512', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CHE214', 'CHE215', 'CHE220', 'CHY203', 'CMN432'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'CHE307', 'CHE308', 'CHE318', 'CHE331', 'CHE338'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'CHE309', 'CHE312', 'CHE316', 'CHE319', 'CHE617'
                    ]
                },
                {
                    title: '7th Semester (Required & Electives)', courses: [
                        'CHE44A', 'CHE413', 'CHE415', 'CHE430', 'ENG503', 'GEO702', 'HST701', 'PHL709',
                        'POL507'
                    ]
                },
                {
                    title: '8th Semester (Required & Core Electives)', courses: [
                        'CEN800', 'CHE44B', 'CHE___'
                    ]
                },
            ],
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
                    title: '2nd Semester (Required)', courses: [
                        'CHE200', 'CHY211', 'CPS125', 'ECN801', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CHE204', 'CHE217', 'CHY224', 'EES512', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CHE214', 'CHE215', 'CHE220', 'CHY203', 'CMN432'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'CHE307', 'CHE308', 'CHE318', 'CHE331', 'CHE338'
                    ]
                },
                {
                    title: '5th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'CHE309', 'CHE312', 'CHE315', 'CHE319', 'CHE617'
                    ]
                },
                {
                    title: '7th Semester (Required)', courses: [
                        'CHE44A', 'CHE413', 'CHE415', 'CHE430'
                    ]
                },
                {
                    title: '8th Semester (Required & Core Electives)', courses: [
                        'CEN800', 'CHE44B', 'CHE___'
                    ]
                },
            ],
        },
    ],
    'Civil Engineering': [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CPS125', 'CVL207', 'ECN801', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CVL320', 'CVL323', 'CVL405', 'MEC522', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CMN432', 'CVL316', 'CVL420', 'CVL423', 'CVL434', 'CVL502'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'CVL352', 'CVL400', 'CVL500', 'CVL533', 'MTH510'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'CVL354', 'CVL602', 'CVL609', 'CVL735', 'CVL742'
                    ]
                },
                {
                    title: '7th Semester (Required / Streams)', courses: [
                        'CVL650', 'CVL71A', 'CVL72A'
                    ]
                },
                {
                    title: '7th & 8th Semester (Core Electives / Streams)', courses: [
                        'CVL903', 'CVL920', 'CVL902', 'CVL910', 'CVL901', 'CVL914'
                    ]
                },
                {
                    title: '8th Semester (Required & Notes)', courses: [
                        'CEN800', 'CVL300', 'CVL736', 'CVL71B', 'CVL72B'
                    ]
                },
            ],
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
                    title: '2nd Semester (Required)', courses: [
                        'CPS125', 'CVL207', 'ECN801', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CVL320', 'CVL323', 'CVL405', 'MEC522', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CMN432', 'CVL316', 'CVL420', 'CVL423', 'CVL434', 'CVL502'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'CVL352', 'CVL400', 'CVL500', 'CVL533', 'MTH510'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'CVL354', 'CVL602', 'CVL609', 'CVL735', 'CVL742'
                    ]
                },
                {
                    title: '7th Semester (Required / Streams)', courses: [
                        'CVL650', 'CVL71A', 'CVL72A'
                    ]
                },
                {
                    title: '7th & 8th Semester (Core Electives / Streams)', courses: [
                        'CVL903', 'CVL920', 'CVL902', 'CVL910', 'CVL901', 'CVL914'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '8th Semester (Required & Notes)', courses: [
                        'CEN800', 'CVL300', 'CVL736', 'CVL71B', 'CVL72B'
                    ]
                },
            ],
        },
    ],
    'Civil Engineering (Structural Option)': [
        {
            years: [2026],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CPS125', 'CVL207', 'ECN801', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CVL320', 'CVL323', 'CVL405', 'MEC522', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CMN432', 'CVL316', 'CVL420', 'CVL423', 'CVL434', 'CVL502'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'CVL313', 'CVL500', 'CVL533', 'CVL600', 'MTH510'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'CVL312', 'CVL410', 'CVL411', 'CVL609', 'CVL742'
                    ]
                },
                {
                    title: '7th Semester (Required)', courses: [
                        'CVL70A', 'CVL904', 'CVL905', 'CVL908'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '8th Semester (Required)', courses: [
                        'CEN800', 'CVL70B', 'CVL300', 'CVL906', 'CVL914'
                    ]
                },
            ],
        },
    ],
    'Computer Engineering': [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'ELE202', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'COE318', 'COE328', 'ELE302', 'MTH425', 'PCS224'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CMN432', 'COE428', 'COE528', 'ELE404', 'MTH314'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'COE501', 'COE538', 'ELE532', 'MEC511', 'MTH514'
                    ]
                },
                {
                    title: '6th Semester (Required & Group)', courses: [
                        'COE608', 'COE628', 'ELE632', 'ELE635 (group option)', 'ELE639 (group option)',
                        'CPS688 (group option)'
                    ]
                },
                {
                    title: '7th Semester (Required)', courses: [
                        'COE70A', 'COE758', 'COE768'
                    ]
                },
                {
                    title: '8th Semester (Capstone & Core)', courses: [
                        'CEN800', 'COE70B', 'CORE_ELECTIVES (see Table II)'
                    ]
                },
            ],
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
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'ELE202', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'COE318', 'COE328', 'ELE302', 'MTH425', 'PCS224'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CMN432', 'COE428', 'COE528', 'ELE404', 'MTH314'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'COE501', 'COE538', 'ELE532', 'MEC511', 'MTH514'
                    ]
                },
                {
                    title: '6th Semester (Required & Group)', courses: [
                        'COE608', 'COE628', 'ELE632', 'ELE635 (group option)', 'ELE639 (group option)',
                        'CPS688 (group option)'
                    ]
                },
                {
                    title: '7th Semester (Required)', courses: [
                        'COE70A'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '7th Semester (Core Electives)', courses: [
                        'CORE_ELECTIVES (see Table I)'
                    ]
                },
                {
                    title: '8th Semester (Capstone & Core)', courses: [
                        'CEN800', 'COE70B', 'CORE_ELECTIVES (see Table II)'
                    ]
                },
            ],
        },
    ],
    'Computer Engineering (Software Engineering Option)': [
        {
            years: [2026],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'ELE202', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'COE318', 'COE328', 'ELE302', 'MTH425', 'PCS224'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CMN432', 'COE428', 'COE528', 'ELE404', 'MTH314'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'CPS510', 'COE538', 'ELE532', 'MEC511', 'MTH514'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'COE608', 'COE628', 'CPS688', 'COE691', 'COE692'
                    ]
                },
                {
                    title: '7th Semester (Required)', courses: [
                        'COE70A', 'COE768', 'CPS714'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '7th Semester (Core Electives)', courses: [
                        'CORE_ELECTIVES (see Table III)'
                    ]
                },
                {
                    title: '8th Semester (Capstone & Core)', courses: [
                        'CEN800', 'COE70B', 'CORE_ELECTIVES (see Table IV)'
                    ]
                },
            ],
        },
    ],
    'Electrical Engineering': [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'ELE202', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'COE318', 'COE328', 'ELE302', 'MTH425', 'PCS224'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CMN432', 'COE428', 'COE528', 'ELE404', 'MTH314'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'COE501', 'COE538', 'ELE532', 'MEC511', 'MTH514'
                    ]
                },
                {
                    title: '6th Semester (Required / Group Options)', courses: [
                        'COE608', 'COE628', 'ELE632', 'ELE635', 'ELE637', 'ELE639'
                    ]
                },
                {
                    title: '7th Semester (Capstone & Required)', courses: [
                        'ELE70A', 'ELE758', 'ELE768'
                    ]
                },
                {
                    title: '8th Semester (Capstone & Core)', courses: [
                        'CEN800', 'ELE70B', 'CORE_ELECTIVES (see Table II)'
                    ]
                },
            ],
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
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'ELE202', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'COE318', 'COE328', 'ELE302', 'MTH425', 'PCS224'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'CMN432', 'COE428', 'ELE401', 'ELE404', 'MTH314'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'COE538', 'ELE531', 'ELE532', 'ELE754', 'MTH514'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'ELE632', 'ELE635', 'ELE637', 'ELE639', 'MEC511'
                    ]
                },
                {
                    title: '7th Semester (Capstone)', courses: [
                        'ELE70A'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '7th Semester (Core Electives)', courses: [
                        'CORE_ELECTIVES (see Table I)'
                    ]
                },
                {
                    title: '8th Semester (Capstone & Core)', courses: [
                        'CEN800', 'ELE70B', 'CORE_ELECTIVES (see Table II)'
                    ]
                },
            ],
        },
    ],
    'Industrial Engineering': [
        {
            years: [2026],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'MEC222', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CMN432', 'MEC323', 'MEC325', 'MTH425', 'PCS213'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'EES512', 'MEC309', 'MEC311', 'MEC322', 'MTH410'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'IND303', 'IND405', 'IND508', 'IND605', 'MEC516', 'MTH510'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'IND300', 'IND400', 'IND600', 'IND604', 'IND712', 'PSY209'
                    ]
                },
                {
                    title: '7th Semester (Required)', courses: [
                        'IND70A', 'IND708', 'IND710'
                    ]
                },
                {
                    title: '7th Semester (Required Group / Options)', courses: [
                        'IND713', 'IND810', 'IND820'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '8th Semester (Required & Group 1 Options)', courses: [
                        'CEN800', 'IND70B', 'CEN810', 'IND719', 'IND816', 'IND832', 'IND833'
                    ]
                },
            ],
        },
    ],
    'Mechanical Engineering': [
        {
            years: [2026],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'MEC222', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CMN432', 'MEC323', 'MEC325', 'MTH425', 'PCS213'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'EES512', 'MEC309', 'MEC311', 'MEC322', 'MTH410'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'EES612', 'MEC430', 'MEC514', 'MEC516', 'MTH510', 'MTL300'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'MEC411', 'MEC613', 'MEC616', 'MEC701', 'MEC709', 'MEC721'
                    ]
                },
                {
                    title: '7th Semester (Required Group)', courses: [
                        'MEC722 (group option)', 'MEC723 (group option)', 'MEC734 (group option)'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '7th Semester (Core Electives)', courses: [
                        'MEC431', 'MEC531', 'MEC617', 'MEC626', 'MEC713', 'MEC740', 'MEC751', 'MEC813',
                        'MEC817', 'MTL700'
                    ]
                },
                {
                    title: '8th Semester (Required)', courses: [
                        'CEN800', 'MEC825'
                    ]
                },
                {
                    title: '8th Semester (Core Electives)', courses: [
                        'CEN810', 'MEC809', 'MEC810', 'MEC811', 'MEC816', 'MEC832', 'MEC850'
                    ]
                },
            ],
        },
    ],
    'Mechatronics Engineering': [
        {
            years: [2019, 2020, 2021, 2022, 2023, 2024],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'MEC222', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CMN432', 'MEC323', 'MEC325', 'MTE301', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'MEC311', 'MEC322', 'MEC511', 'MTE401', 'MTH410'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'EES612', 'MEC713', 'MTE501', 'MTE502', 'MTH510'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'MEC709', 'MTE601', 'MTE602', 'MTE603', 'MTE604', 'MTE751'
                    ]
                },
                {
                    title: '7th Semester (Capstone & Core)', courses: [
                        'MTE70A', 'MTE701', 'MEC617'
                    ]
                },
                {
                    title: '8th Semester (Capstone & Options)', courses: [
                        'CEN800', 'MTE70B', 'MTE801', 'MTE811', 'MTE812', 'MTE819', 'MTE882', 'MTE888'
                    ]
                },
            ],
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
                    title: '2nd Semester (Required)', courses: [
                        'CPS188', 'ECN801', 'MEC222', 'MTH240', 'MTL200', 'PCS125'
                    ]
                },
                {
                    title: '3rd Semester (Required)', courses: [
                        'CMN432', 'MEC323', 'MEC325', 'MTE301', 'MTH425'
                    ]
                },
                {
                    title: '4th Semester (Required)', courses: [
                        'MEC311', 'MEC322', 'MEC511', 'MTE401', 'MTH410'
                    ]
                },
                {
                    title: '5th Semester (Required)', courses: [
                        'EES612', 'MEC713', 'MTE501', 'MTE502', 'MTH510'
                    ]
                },
                {
                    title: '6th Semester (Required)', courses: [
                        'MEC709', 'MTE601', 'MTE602', 'MTE603', 'MTE604', 'MTE751'
                    ]
                },
                {
                    title: '7th Semester (Required)', courses: [
                        'MTE70A', 'MTE701'
                    ]
                },
                {
                    title: '7th Semester (Core Electives)', courses: [
                        'MEC617', 'MTE711', 'MTE712', 'MTE792', 'MTE829'
                    ]
                },
                {
                    title: '7th Semester (Liberal Studies)', courses: [
                        'ENG503', 'GEO702', 'HST701', 'PHL709', 'POL507'
                    ]
                },
                {
                    title: '8th Semester (Required)', courses: [
                        'CEN800', 'MTE70B', 'MTE801'
                    ]
                },
                {
                    title: '8th Semester (Core Electives)', courses: [
                        'CEN810', 'MTE811', 'MTE812', 'MTE819', 'MTE882', 'MTE888'
                    ]
                },
            ],
        },
    ],
    'Undeclared Engineering': [
        {
            years: [2026],
            semesters: [
                {
                    title: '1st Semester (Required)', courses: [
                        'CEN100', 'CEN199', 'CHY102', 'MTH140', 'MTH141', 'PCS211'
                    ]
                },
                {
                    title: '2nd Semester (Required)', courses: [
                        'ECN801', 'MTH240', 'PCS125'
                    ]
                },
                {
                    title: '2nd Semester (Aerospace Group)', courses: [
                        'AER222', 'CPS125', 'MTL200'
                    ]
                },
                {
                    title: '2nd Semester (Biomedical Group)', courses: [
                        'BME100', 'CPS188', 'ELE202'
                    ]
                },
                {
                    title: '2nd Semester (Chemical Group)', courses: [
                        'CHE200', 'CHY211', 'CPS125'
                    ]
                },
                {
                    title: '2nd Semester (Civil Group)', courses: [
                        'CPS125', 'CVL207', 'MTL200'
                    ]
                },
                {
                    title: '2nd Semester (Computer & Electrical Group)', courses: [
                        'CPS188', 'ELE202'
                    ]
                },
                {
                    title: '2nd Semester (Industrial, Mechanical & Mechatronics Group)', courses: [
                        'CPS188', 'MEC222', 'MTL200'
                    ]
                },
            ],
        },
    ],
};
