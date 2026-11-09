// Course catalog: every course is defined once here, keyed by course code.
//
//   title             shown next to the code in the checklist
//   prereqs           free text parsed by parsePrereqs() in js/eligibility.js,
//                     e.g. 'MTH 140 and MTH 141' or 'PCS 110 or PCS 125'.
//                     Omit when there are none.
//   coreqs, antireqs, customRequisites, description   optional reference info
//   noOutline         true when the TMU calendar has no page for the course,
//                     so no "Outline" link is shown

// "Outline" links point to the course's page in this TMU calendar year:
//   https://www.torontomu.ca/calendar/<CALENDAR_YEAR>/courses/<subject path>/<SUBJECT>/<number>/
const CALENDAR_YEAR = '2026-2027';

// Calendar URL path for each course subject (e.g. MTH -> mathematics).
const SUBJECT_PATHS = {
    AER: 'aerospace',
    BLG: 'biology',
    BME: 'biomedical-engineering',
    CEN: 'common-engineering',
    CHE: 'chemical-engineering',
    CHY: 'chemistry',
    CMN: 'communication',
    COE: 'computer-engineering',
    CPS: 'computer-science',
    CVL: 'civil-engineering',
    ECN: 'economics',
    EES: 'electrical-engineering',
    ELE: 'electrical-engineering',
    EMS: 'engineering-management-science',
    ENG: 'english',
    GEO: 'geography',
    HST: 'history',
    IND: 'industrial-engineering',
    MEC: 'mechanical-engineering',
    MTE: 'mechatronics',
    MTH: 'mathematics',
    MTL: 'mechanical-engineering',
    PCS: 'physics',
    PHL: 'philosophy',
    POL: 'politics-and-public-administration',
    PSY: 'psychology',
};

const COURSES = {
    AER222: { title: 'Engineering Design and Graphical Communication' },
    AER309: {
        title: 'Basic Thermodynamics',
        prereqs: 'CPS 125 and MTH 240 and PCS 211',
        description: 'Introductory thermodynamics: systems and properties, first/second law, entropy, thermodynamic cycles, control volume analysis and gas power systems. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    AER316: {
        title: 'Fluid Mechanics',
        prereqs: 'MTH 240 and PCS 125 and PCS 211',
    },
    AER318: {
        title: 'Dynamics',
        prereqs: 'AER 222 and MTH 141 and MTH 240 and PCS 211',
        description: 'Particles and rigid bodies: kinematics and kinetics, planar motion, equations of motion, work and energy, impulse and momentum, applications to mechanical linkages. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    AER320: {
        title: 'Statics and Intro to Strength of Materials',
        prereqs: 'AER 222 and MTH 141 and MTH 240 and MTL 200 and PCS 211',
        description: 'Rigid body equilibrium, trusses, frames, method of joints/sections, introduction to strength of materials: stress, strain, bending, shear and beam analysis. Weekly Contact: Lab: 1 hr; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    AER403: {
        title: 'Mechanisms and Vibrations',
        prereqs: 'AER 318 and MTH 425',
    },
    AER404: {
        title: 'Intro to Aerospace Engineering Design',
        prereqs: 'AER 222 and AER 318 and AER 320 and CEN 100',
    },
    AER416: {
        title: 'Flight Mechanics',
        prereqs: 'AER 316',
    },
    AER423: {
        title: 'Thermodynamics and Heat Transfer',
        prereqs: 'AER 309 and AER 316',
    },
    AER504: {
        title: 'Aerodynamics',
        prereqs: 'AER 416 and CEN 199 and CMN 432 and MTH 425',
    },
    AER507: {
        title: 'Materials and Manufacturing',
        prereqs: 'AER 320 and AER 423 and CEN 100',
    },
    AER509: {
        title: 'Control Systems',
        prereqs: 'AER 403 and CMN 432 and EES 612',
        description: 'System modelling, time-domain/time-response analysis, open/closed loop analysis, stability (Routh, root locus, Bode), frequency response, control design methods. Weekly Contact: Lab: 1.5 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    AER520: {
        title: 'Stress Analysis',
        prereqs: 'AER 320 and CEN 199 and CMN 432 and MTH 410 and MTH 425',
        description: 'Torsion, shear and bending moment analysis, combined loading, deflections (Castigliano), strain/stress transformation and Mohr\'s circle, experimental stress analysis. Weekly Contact: Lab: 1 hr; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    AER606: {
        title: 'Component Design and Material Selection',
        prereqs: 'AER 404, AER 507, AER 520, ECN 801',
    },
    AER615: {
        title: 'Aircraft Performance',
        prereqs: 'AER 504',
        description: 'Aircraft performance and safety standards, takeoff/landing performance, range-payload analysis, climb/cruise performance, flight planning and automatic flight control systems. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    AER621: {
        title: 'Aerospace Structural Design',
        prereqs: 'AER 404 and AER 504 and AER 507 and AER 520 and CMN 432 and ECN 801',
    },
    AER622: {
        title: 'Gas Dynamics',
        prereqs: 'AER 423 and AER 504',
    },
    AER626: {
        title: 'Applied Finite Elements',
        prereqs: 'AER 520 and CPS 125 and MTH 510',
    },
    AER627: {
        title: 'Introduction to Space Robotics',
        prereqs: 'AER 403',
    },
    AER699: {
        title: 'Aerospace Sensors',
        prereqs: 'EES 512 and MTH 425',
    },
    AER710: {
        title: 'Propulsion',
        prereqs: 'AER 622',
    },
    AER715: {
        title: 'Avionics and Systems',
        prereqs: 'AER 416 and AER 509 and MTH 410',
    },
    AER716: {
        title: 'Aircraft Stability and Control',
        prereqs: 'AER 320 and AER 509 and AER 615',
    },
    AER721: {
        title: 'Orbital Dynamics',
        prereqs: 'AER 403 and MTH 510',
        coreqs: 'AER 622',
    },
    AER722: {
        title: 'Aeroelasticity',
        prereqs: 'AER 403 and AER 621',
    },
    AER723: {
        title: 'Introduction to Space Systems Design',
        prereqs: 'AER 509 and AER 606 and MTH 510',
    },
    AER813: {
        title: 'Space Systems Design Project',
        prereqs: 'AER721 and AER723',
    },
    AER814: {
        title: 'Aircraft Design Project',
        prereqs: 'AER 626, AER 715, AER716, and AER 722',
    },
    AER817: {
        title: 'Systems Engineering',
        prereqs: 'AER 606 and MTH 410',
    },
    AER818: {
        title: 'Manufacturing Management',
        prereqs: 'AER 507 and ECN 801',
    },
    AER821: {
        title: 'Spacecraft Attitude Dynamics and Control',
        prereqs: 'AER 509 and AER 721',
    },
    AER822: {
        title: 'Avionics Design Project',
        prereqs: 'AER 699, AER 715, AER 716, and EES 508',
    },
    AER827: {
        title: 'Composite Materials',
        prereqs: 'AER 507 and AER 520',
    },
    AER850: {
        title: 'Introduction to Machine Learning',
        prereqs: 'CPS 125, MTH 425, MTH 410',
    },
    AER870: { title: 'Aerospace Engineering Thesis' },
    BLG143: { title: 'Biology I' },
    BLG601: {
        title: 'Physiology',
        prereqs: 'BLG 143 and (CEN 100 or PCS 229)',
        antireqs: 'BLG 600',
    },
    BLG701: {
        title: 'Anatomy',
        prereqs: 'BLG 143 and (CEN 100 or PCS 229)',
        antireqs: 'BLG 700',
    },
    BME100: {
        title: 'Introduction to Biomedical Engineering',
        description: 'Terminology of the medical profession; anatomy and physiology overview; exposure to medical equipment and small animal handling; seminars from guest speakers. Graded pass/fail. Lab: 1 hr. Lecture: 1 hr. GPA weight 1.0.',
    },
    BME229: {
        title: 'Biomedical Physics',
        prereqs: 'BME 100, CHY 102, CPS 188, ELE 202, MTH 240, PCS 125, PCS 211',
    },
    BME323: {
        title: 'Statics and Mechanics of Materials',
        prereqs: 'BME 100, CHY 102, CPS 188, ELE 202, MTH 240, PCS 125, PCS 211',
        antireqs: 'MEC 323',
        description: 'Statics: rigid body equilibrium, two- and three-force members, trusses, frames and machines. Mechanics of materials: introductory stress and strain, Hooke\'s Law, axial and torsional loading, and statically indeterminate problems. Weekly Contact: Lab: 1 hr; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    BME328: {
        title: 'Digital Systems',
        prereqs: 'CPS 188, ELE 202, MTH 240',
        description: 'Fundamentals of digital logic and modern digital system design including Boolean algebra, combinational and sequential logic, CAD tools and hardware description languages, and implementation on CPLDs/FPGAs. Laboratory work uses CAD tools to design and simulate basic digital circuits. Weekly Contact: Lab: 3 hrs; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 2.',
    },
    BME406: {
        title: 'Biomechanics',
        prereqs: 'BME 323',
        coreqs: 'BLG 601',
    },
    BME423: {
        title: 'Biomaterials',
        prereqs: 'BLG 143 and BME 323',
    },
    BME434: {
        title: 'Circuits, Devices, and Sensors',
        prereqs: 'ELE 202 and (MTH 312 or MTH 425)',
    },
    BME501: {
        title: 'Bioinformatics',
        prereqs: 'BLG 601 and CEN 199 and (MTH 312 or MTH 425)',
        antireqs: 'CPS 501',
    },
    BME506: {
        title: 'Introduction to Software',
        prereqs: 'BME 328 and CEN 199',
        antireqs: 'COE 318',
    },
    BME516: {
        title: 'Fluid Mechanics',
        prereqs: 'BME 229, BME 406, BME 423, CEN 199, (MTH 312 or MTH425)',
        antireqs: 'MEC 516',
    },
    BME532: {
        title: 'Signals and Systems I',
        prereqs: 'CEN 199, BME 434',
        antireqs: 'ELE 532',
    },
    BME538: {
        title: 'Microprocessor Systems',
        prereqs: 'BME 328 and CEN 199',
        antireqs: 'COE 538',
    },
    BME632: {
        title: 'Signals and Systems II',
        prereqs: 'BME 532, CEN 199',
        antireqs: 'ELE 632',
    },
    BME634: {
        title: 'Electrical Machines and Actuators',
        prereqs: 'BME 434 and CEN 199',
    },
    BME639: {
        title: 'Control Systems and Bio-Robotics',
        prereqs: 'BME 532, CEN 199',
        antireqs: 'ELE 639',
        description: 'System modelling, simulation and classical controller design for linear time-invariant systems; stability (Routh-Hurwitz), root locus, Bode and Nyquist methods; introduction to state-space representation and basic feedback design. Lab experiments use modular servo-systems integrated with MATLAB/Simulink. Weekly Contact: Lab: 1.5 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    BME674: {
        title: 'Biomedical Instrumentation',
        prereqs: 'BLG 601, BLG 701, BME 506, BME 538, CEN 199',
        coreqs: 'BME 532',
        description: 'Application and design of medical instrumentation for signals from living tissue: transduction, sensors, amplification, signal processing, electrodes and biopotential amplifiers, non-invasive measurement techniques, and electrical safety. Design labs and a final design project using circuit simulation tools. Weekly Contact: Lab: 2 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    BME703: {
        title: 'Tissue Engineering',
        prereqs: 'BLG 601 and BLG 701',
    },
    BME704: {
        title: 'Radiation Therapy Devices',
        prereqs: 'BME 229 and BME 674 and MTH 410',
    },
    BME705: {
        title: 'Rehabilitation Engineering',
        prereqs: 'BLG 601, BME 639, and BME 634',
    },
    BME70A: {
        title: 'Biomedical Engineering Capstone Design (part A)',
        prereqs: 'BME 501, BME 516, BME 632, BME 639, BME 674, BME 634, MTH 410',
    },
    BME70B: {
        title: 'Biomedical Engineering Capstone Design (part B)',
        prereqs: 'BME 501, BME 516, BME 632, BME 639, BME 674, BME 634, MTH 410',
    },
    BME714: {
        title: 'Medical Robotics',
        prereqs: 'BME 634, BME 674, and BME 639',
    },
    BME772: {
        title: 'Biomedical Signal Analysis',
        prereqs: 'BLG 601 and BLG 701 and BME 632 and BME 639',
        antireqs: 'ELE 772',
    },
    BME777: {
        title: 'Emerging Topics in Biomedical Engineering',
        prereqs: 'BLG 601, BLG 701, BME 406, BME 423, BME 501, BME 506, BME 516, BME 632, BME 639, BME 674, BME 634, and MTH 410',
    },
    BME802: {
        title: 'Human-Computer Interaction',
        prereqs: 'BME 506, BME 639, BME 674 and BME 634',
    },
    BME803: {
        title: 'Cardiovascular Biomechanics',
        prereqs: 'BME 516, BME 406, BME 639 and BME 634',
    },
    BME804: {
        title: 'Design of Bio-MEMS',
        prereqs: 'BME 423 and BME 674 and BME 634',
    },
    BME808: {
        title: 'Computations in Genetic Engineering',
        prereqs: 'BME 501 and BME 532 and MTH 410',
    },
    BME809: {
        title: 'Biomedical Systems Modelling',
        prereqs: 'BLG 601 and BLG 701 and BME 229 and BME 639',
    },
    BME872: {
        title: 'Biomedical Image Analysis',
        prereqs: 'BME 229 and BME 632',
    },
    CEN100: {
        title: 'Introduction to Engineering',
        customRequisites: 'Available only to Engineering and Engineering Special students.',
    },
    CEN199: { title: 'Writing Skills' },
    CEN800: { title: 'Law and Ethics in Engineering Practice' },
    CEN810: { title: 'Selected Topics in Engineering' },
    CHE200: {
        title: 'Chemical Engineering Fundamentals',
        prereqs: 'CHY 102',
        description: 'Fundamentals and principles of chemical engineering; analysis and synthesis of chemical and biochemical processes; material and energy balances for reacting and non-reacting systems; recycle and by-pass systems; phase equilibrium; and combustion. Weekly Contact: Lecture: 4 hrs; Tutorial: 2 hrs. GPA Weight: 1.00. Course Count: 1.00; Billing Units: 1.',
    },
    CHE204: {
        title: 'Thermodynamics I',
        prereqs: 'CHE 200, CHY 211, MTH 141, MTH 240',
    },
    CHE214: {
        title: 'Thermodynamics II',
        prereqs: 'CHE 204',
    },
    CHE215: {
        title: 'Process Measurements',
        prereqs: 'CHE 217, EES 512, PCS 125',
    },
    CHE217: {
        title: 'Fluid Mechanics',
        prereqs: 'CHE 200, MTH 141, MTH 240, PCS 211',
    },
    CHE220: {
        title: 'Heat Transfer',
        prereqs: 'CHE 217, MTH 425',
    },
    CHE307: {
        title: 'Chemical Engineering Materials',
        prereqs: 'CEN 199 and CHY 224',
    },
    CHE308: {
        title: 'Mass Transfer',
        prereqs: 'CEN 199 and CHE 214 and CHE 220',
        description: 'Mass transfer fundamentals including molecular and convective mass transfer, diffusion, mass transfer coefficients, interphase mass transfer and applications such as distillation. Weekly Contact: Lecture: 3 hrs; Tutorial: 2 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CHE309: {
        title: 'Introductory Bioengineering',
        prereqs: 'CEN 199 and CHE 200 and CHY 224',
    },
    CHE312: {
        title: 'Chemical Reaction Engineering',
        prereqs: 'CHE 318',
        description: 'Chemical kinetics, rate laws, kinetics in batch and flow systems, reactor design for ideal reactors and networks, non-isothermal reactors, and catalytic reactors. Weekly Contact: Lecture: 3 hrs; Tutorial: 2 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CHE315: {
        title: 'Unit Operations Laboratory I',
        prereqs: 'CHE 215 and CHE 318 and CHE 331',
    },
    CHE316: { title: 'Unit Operations Laboratory I', noOutline: true },
    CHE318: {
        title: 'Separation Processes',
        coreqs: 'CHE 308',
    },
    CHE319: {
        title: 'Process Modeling and Simulation',
        prereqs: 'CHE 318 and CHE 338',
        coreqs: 'CHE 312',
        description: 'Mathematical modelling and simulation of processes: conservation equations, solution techniques for ODEs/PDEs, Laplace transforms, transfer functions, dynamic behaviour, and use of software to simulate process dynamics. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs; Tutorial: 1 hr. GPA Weight: 1.00; Billing Units: 1.',
    },
    CHE331: {
        title: 'Engineering Statistics and Probabilities',
        prereqs: 'CEN 199 and CPS 125 and MTH 425',
    },
    CHE338: {
        title: 'Chemical Engineering Computations',
        prereqs: 'CEN 199, CHE 200, CHE 214, CHE 220, CPS 125',
        description: 'Introduction to numerical methods for chemical engineering problems: numerical errors, root-finding, linear and nonlinear algebraic solvers, interpolation, least-squares fitting, numerical integration/differentiation, and solution of ODEs/PDEs. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs; Tutorial: 1 hr. GPA Weight: 1.00; Billing Units: 1.',
    },
    CHE413: {
        title: 'Chemical Engineering Equipment Design',
        prereqs: 'CHE 307, ECN 801',
        coreqs: 'CHE 415, CHE 430',
    },
    CHE415: {
        title: 'Unit Operations Laboratory II',
        prereqs: 'CHE 315, CHE 318',
        coreqs: 'CHE 430',
    },
    CHE430: {
        title: 'Process Control',
        prereqs: 'CHE 312, CHE 318, CHE 319',
    },
    CHE44A: {
        title: 'Plant Design (multi-term)',
        prereqs: 'CHE 617',
        coreqs: 'CHE 413 and CHE 415',
    },
    CHE44B: {
        title: 'Plant Design (continued)',
        prereqs: 'CHE 617',
        coreqs: 'CHE 413 and CHE 415',
    },
    CHE474: {
        title: 'Nanotechnology and Its Applications',
        prereqs: 'CHE 307',
        description: 'Principles of nanotechnology and applications in chemical engineering: nanostructured materials, manufacturing methods, characterization, properties and toxicological effects; applications in electronics, energy and other technologies. Weekly Contact: Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CHE617: {
        title: 'Chemical Process Safety & Loss Prevention',
        prereqs: 'CHE 307 or CHE 318',
    },
    CHE___: { title: 'Core Elective (see Table I)' },
    CHY102: {
        title: 'General Chemistry',
        antireqs: 'CHY 103 or CHY 104 or CHY 123 or CHY 182 or CHY 183',
    },
    CHY203: {
        title: 'Instrumental Methods of Analysis',
        prereqs: 'CHE 200, CHY 102, CHY 211, CPS 125, PCS 125, PCS 211, MTH 140, MTH 141, and MTH 240',
        antireqs: 'CHY 213',
    },
    CHY211: {
        title: 'General Chemistry Laboratory',
        prereqs: 'CHY 102',
        antireqs: 'CHY 113, CHY 123',
    },
    CHY224: {
        title: 'Organic Chemistry',
        prereqs: 'CHY 102 and CHY 211',
        antireqs: 'CHY 142, CHY 152, CHY 200',
    },
    CMN432: {
        title: 'Communication in the Engineering Professions',
        customRequisites: 'Available only to students in the Engineering program',
    },
    COE318: {
        title: 'Software Systems',
        prereqs: 'CHY 102, CPS 188, ELE 202, MTH 240, PCS 211',
        description: 'Software development cycle: requirements analysis, specification, implementation, testing, debugging and integration. Object-oriented decomposition into classes and modules. Weekly Contact: Lab: 2 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    COE328: {
        title: 'Digital Systems',
        prereqs: 'CPS 188, ELE 202, MTH 240',
        description: 'Digital logic and system design, CAD tools and HDL, implementation technologies (CPLDs/FPGAs), combinational and sequential circuits, CPU datapath and control units. Weekly Contact: Lab: 3 hrs; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 2.',
    },
    COE428: {
        title: 'Engineering Algorithms and Data Structures',
        prereqs: 'COE 318',
        coreqs: 'MTH 314',
    },
    COE501: {
        title: 'Electromagnetism',
        prereqs: 'MTH 312 or MTH 425',
        antireqs: 'ELE 401',
    },
    COE528: {
        title: 'Object Oriented Eng Analysis and Design',
        prereqs: 'COE 318',
    },
    COE538: {
        title: 'Microprocessor Systems',
        prereqs: 'CEN 199 and COE 328 and ELE 404 and MTH 314',
    },
    COE608: {
        title: 'Computer Organization and Architecture',
        prereqs: 'CEN 199 and COE 328 and COE 538',
    },
    COE628: {
        title: 'Operating Systems',
        prereqs: 'CEN 199 and COE 318 and COE 428',
        customRequisites: 'This course previously coded as COE 518.',
    },
    COE691: {
        title: 'Software Requirement Analysis and SPEC',
        prereqs: 'COE 428, COE 528, CPS 510',
        customRequisites: 'Available only to students in Computer Engineering - Software Engineering Option',
    },
    COE692: {
        title: 'Software Design and Architecture',
        prereqs: 'COE 428, COE 528, CPS 510',
    },
    COE70A: {
        title: 'Computer Engineering Capstone Design (part A)',
        prereqs: 'COE 528, COE 608, COE 628, MEC 511, MTH 514 and [(COE 501, ELE 632, ELE 635, and ELE 639) or (COE 501, CPS 688, ELE 632, and ELE 635) or (COE 501, ELE 632, ELE 639, and CPS 688) or ( COE 691, COE 692, CPS 688, and ELE 532)]',
    },
    COE70B: {
        title: 'Computer Engineering Capstone Design (part B)',
        prereqs: 'COE 528, COE 608, COE 628, MEC 511, MTH 514 and [(COE 501, ELE 632, ELE 635, and ELE 639) or (COE 501, CPS 688, ELE 632, and ELE 635) or (COE 501, ELE 632, ELE 639, and CPS 688) or ( COE 691, COE 692, CPS 688, and ELE 532)]',
    },
    COE758: {
        title: 'Digital Systems Engineering',
        prereqs: '(COE 538 or ELE 538) and COE 608',
    },
    COE768: {
        title: 'Computer Networks',
        prereqs: '(COE 538 or ELE 538) and ELE 532',
    },
    CORE_ELECTIVES: { title: 'Core electives' },
    CPS125: {
        title: 'Digital Computation and Programming',
        antireqs: 'CPS188',
        description: 'Introduces concepts, theory and practice of computer programming using the C programming language. Topics include program structure, control flow, standard libraries, functions, arrays, pointers, sorting, matrix operations, strings, dynamic storage, structures and file I/O. Weekly Contact: Lab: 2 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CPS188: {
        title: 'Computer Programming Fundamentals',
        antireqs: 'CPS125',
        description: 'Foundational C programming course for engineering students covering program organisation, data types, selection/repetition, libraries, functions, arrays, pointers, recursion, dynamic storage, structures and I/O. Weekly Contact: Lab: 2 hrs; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CPS510: {
        title: 'Database Systems I',
        prereqs: 'CPS 305 or (COE 428 and COE 528)',
        antireqs: 'ITM 500',
    },
    CPS688: {
        title: 'Advanced Algorithms',
        prereqs: 'COE 428',
        antireqs: 'CPS 616',
        description: 'Algorithms with an engineering emphasis: divide-and-conquer, graph decompositions, greedy algorithms, dynamic programming, linear programming and reductions, NP-completeness and coping strategies, and quantum algorithms. Weekly Contact: Lab: 2 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CPS714: {
        title: 'Software Project Management',
        prereqs: 'CPS 406 or (COE 691 and COE 692)',
        antireqs: 'ITM 750',
    },
    CVL207: {
        title: 'Graphics',
        description: 'Descriptive geometry and modern drafting tools: orthographic/auxiliary views, intersections, developments, pictorial drawing; 2D and 3D CAD (AutoCAD) for civil engineering; structural drafting for steel, concrete and timber. Weekly Contact: Lab: 2 hrs; Lecture: 2 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CVL300: {
        title: 'Environmental Science and Impact Assessment',
        prereqs: 'CEN 100 and CHY 102',
    },
    CVL312: {
        title: 'Computer Aided Structural Analysis',
        prereqs: 'CEN 199, CVL 313 and MTH 510',
    },
    CVL313: {
        title: 'Structural Analysis',
        prereqs: 'CEN 199 and CVL 420',
    },
    CVL316: {
        title: 'Transportation Engineering',
        prereqs: 'MTH 425',
    },
    CVL320: {
        title: 'Strength of Materials I',
        prereqs: 'CEN 100, MTH 141, MTH 240, MTL 200, PCS 125, PCS 211',
        description: 'Analysis of trusses, frames, beams, arches and cables; reactions, shear force and bending moment diagrams; stress and strain; Hooke\'s law and generalized elasticity relations; strain measurement and rosette analysis. Laboratory work included. Weekly Contact: Lab: 3 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CVL323: {
        title: 'Fundamentals of Surveying',
        prereqs: 'CVL 207 and MTH 240 and PCS 125',
    },
    CVL352: {
        title: 'Geomatics Measurement Techniques',
        prereqs: 'CEN 199 and CVL 323',
    },
    CVL354: {
        title: 'Remote Sensing and Image Analysis',
        prereqs: 'CEN 199, CVL 405, PCS 125',
    },
    CVL400: {
        title: 'Hydrology and Water Resources',
        prereqs: 'CEN 199, CVL 405, CVL 502, MTL 200, PCS 125',
    },
    CVL405: {
        title: 'Probability and Statistics for Engineers',
        prereqs: 'CPS 125 and MTH 141 and MTH 240',
    },
    CVL410: {
        title: 'Structural Concrete Design I',
        prereqs: 'CEN 199 and CVL 500',
    },
    CVL411: {
        title: 'Structural Steel Design',
        prereqs: 'CEN 199, CVL 313 and CVL 500',
    },
    CVL420: {
        title: 'Strength of Materials II',
        prereqs: 'CVL 320',
    },
    CVL423: {
        title: 'Geology for Engineers',
        prereqs: 'CHY 102 and PCS 125 and PCS 211',
    },
    CVL434: {
        title: 'Geotechnical Properties of Soils',
        prereqs: 'CVL 320',
    },
    CVL500: {
        title: 'Introduction to Structural Design',
        prereqs: 'CEN 199, CVL 420',
        description: 'Types of structures; loads and load factors; properties and behaviour of structural steel, reinforced concrete and timber; design of beams, slabs and short columns; design for ultimate and serviceability limit states. Weekly Contact: Lecture: 3 hrs; Tutorial: 2 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    CVL502: {
        title: 'Hydraulic Engineering',
        prereqs: 'MEC 522',
    },
    CVL533: {
        title: 'Concrete Materials',
        prereqs: 'CEN 199 and CVL 320',
    },
    CVL600: {
        title: 'Foundation Engineering',
        prereqs: 'CEN 199 and CVL 434',
    },
    CVL602: {
        title: 'Municipal Engineering',
        prereqs: 'CEN199, CVL400, CVL502',
    },
    CVL609: {
        title: 'Civil Engineering Systems',
        prereqs: 'CEN 199, CVL 405, ECN 801, MTH 510',
    },
    CVL650: {
        title: 'Satellite Positioning for Civil Engineers',
        prereqs: 'CVL 352 and CVL 405',
    },
    CVL70A: {
        title: 'Structural Capstone Design Project (part A)',
        prereqs: 'CVL 312, CVL 313, CVL 410, CVL 411, CVL 600, CVL 609',
    },
    CVL70B: {
        title: 'Structural Capstone Design Project (part B)',
        prereqs: 'CVL 312, CVL 313, CVL 410, CVL 411, CVL 600, CVL 609',
    },
    CVL71A: {
        title: 'Environment Capstone Design Project (part A)',
        prereqs: 'CVL 400 and CVL 602',
    },
    CVL71B: {
        title: 'Environment Capstone Design Project (part B)',
        prereqs: 'CVL 400 and CVL 602',
    },
    CVL72A: {
        title: 'Transportation Capstone Design Project (part A)',
        prereqs: 'CVL 316 and CVL 735',
    },
    CVL72B: {
        title: 'Transportation Capstone Design Project (part B)',
        prereqs: 'CVL 316 and CVL 735',
    },
    CVL735: {
        title: 'Highway Design',
        prereqs: 'CEN 199 and CVL 323',
    },
    CVL736: {
        title: 'Geospatial Information Systems',
        prereqs: 'CVL 352',
    },
    CVL742: {
        title: 'Project Management',
        prereqs: 'ECN 801',
        antireqs: 'EMS 304 and IND 713',
    },
    CVL901: {
        title: 'Municipal Solid Waste Management',
        prereqs: 'CVL 602',
    },
    CVL902: {
        title: 'Traffic Operations and Management',
        prereqs: 'CVL 316',
        antireqs: 'CV8401',
    },
    CVL903: {
        title: 'Water Resources Engineering',
        prereqs: 'CVL 400 and CVL 502',
    },
    CVL904: {
        title: 'Structural Concrete Design II',
        prereqs: 'CVL 410',
        antireqs: 'CV8307',
    },
    CVL905: {
        title: 'Bridge Design and Construction',
        prereqs: 'CVL 411',
        antireqs: 'CV8308',
    },
    CVL906: {
        title: 'Renovation/Repair of Existing Structures',
        prereqs: 'CVL 410 and CVL 533',
        antireqs: 'CV8303',
    },
    CVL908: {
        title: 'Structural Building Systems',
        prereqs: 'CVL 312, CVL 410, CVL 411',
        coreqs: 'CVL 904',
    },
    CVL910: {
        title: 'Transportation Planning',
        prereqs: 'CVL 316',
    },
    CVL914: {
        title: 'Pavement Materials and Design',
        prereqs: 'CVL 434',
    },
    CVL920: {
        title: 'Water and Wastewater Treatment',
        prereqs: 'CVL 602',
    },
    ECN801: {
        title: 'Principles of Engineering Economics',
        customRequisites: 'Available only to Bachelor of Engineering students',
    },
    EES508: {
        title: 'Digital Systems',
        prereqs: 'EES 512 and CEN 199',
    },
    EES512: {
        title: 'Electric Circuits',
        prereqs: 'MTH 140 and MTH 141',
        description: 'One-semester lecture/lab course covering basic electric circuit parameters and laws: sources, resistive circuits, DC analysis, capacitance and inductance, transient responses, AC phasors, reactance/impedance, resonance, and real/complex power in reactive loads. Weekly Contact: Lecture: 3 hrs; Tutorial: 2 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    EES612: {
        title: 'Electric Machines and Actuators',
        prereqs: 'CEN 199 and (EES 512 or MTE 401)',
        description: 'Covers DC and AC machines, transformer applications, motor characteristics and drives, power electronic converters (H-bridges, PWM), interfacing and control of DC servo/stepper and AC induction/synchronous machines, and basic speed/torque control techniques. Weekly Contact: Lab: 2 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    ELE202: {
        title: 'Electric Circuit Analysis',
        prereqs: 'MTH 140 and MTH 141',
        description: 'Introductory one-semester course in circuit analysis: resistive circuits, circuit theorems, energy storage elements, transient responses, sinusoidal steady-state, and AC power concepts. Weekly Contact: Lab: 1.5 hrs; Lecture: 4 hrs; Tutorial: 0.5 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    ELE302: {
        title: 'Electric Networks',
        prereqs: 'CHY 102, MTH 140, MTH 141, PCS 125, PCS 211, CPS 188, ELE 202, MTH 240',
        coreqs: 'MTH 312 or MTH 425',
    },
    ELE401: {
        title: 'Electric and Magnetic Fields',
        prereqs: 'MTH 312 or MTH 425',
        antireqs: 'COE 501',
    },
    ELE404: {
        title: 'Electronic Circuits I',
        prereqs: 'ELE 302 and (MTH 312 or MTH 425) and PCS 224',
    },
    ELE531: {
        title: 'Electromagnetics',
        prereqs: 'ELE 401 and CEN 199',
    },
    ELE532: {
        title: 'Signals and Systems I',
        prereqs: 'CEN 199, COE 428, ELE 404, MTH 314',
    },
    ELE632: {
        title: 'Signals and Systems II',
        prereqs: 'ELE 532',
    },
    ELE635: {
        title: 'Communication Systems',
        prereqs: 'ELE 532 and MTH 514 and CEN 199',
    },
    ELE637: {
        title: 'Energy Conservation',
        prereqs: 'ELE 302 and ELE 531',
    },
    ELE639: {
        title: 'Control Systems',
        prereqs: 'ELE 532 and CEN 199',
        description: 'Introductory control theory: modelling, simulation, transfer functions, block diagrams, time- and frequency-domain analysis, Routh-Hurwitz, Root Locus, Bode/Nyquist methods, and classical controller design (lead/lag, PID). Labs use DSP-based servomotor systems and MATLAB/Simulink. Weekly Contact: Lab: 1.5 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    ELE70A: {
        title: 'Electrical Engineering Capstone Design (part A)',
        prereqs: 'COE 538, ELE 504, ELE 632, ELE 635, ELE 637, ELE 639, MEC 511',
    },
    ELE70B: {
        title: 'Electrical Engineering Capstone Design (part B)',
        prereqs: 'COE 538, ELE 504, ELE 632, ELE 635, ELE 637, ELE 639, MEC 511',
    },
    ELE754: {
        title: 'Power Electronics',
        prereqs: 'ELE 404',
    },
    ELE758: { title: 'Electrical Systems / Digital Systems Engineering', noOutline: true },
    ELE768: { title: 'Networks/Advanced Topics', noOutline: true },
    EMS201: {
        title: 'Entrepreneurship and Innovation Management',
        description: 'Illustrates how managers implement innovation in their areas of responsibility. Covers leadership, entrepreneurial thinking, creativity, and approaches to managing change for new ventures or intra-company innovation. Weekly Contact: Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    EMS202: {
        title: 'Operations Management',
        description: 'Topics include productivity; competitiveness and strategy; quality management; product and service design; process selection; design of work systems; learning curves; inventory management; MRP, JIT; maintenance and reliability; and an introduction to supply chain management. Weekly Contact: Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    EMS204: {
        title: 'Organization Design and Dynamics',
        description: 'Develops theoretical understanding of organizational behaviour and interpersonal skills for productive team work. Topics include motivation, job design, perception and diversity, communication, team dynamics, leadership, industrial relations and legislation, power and organizational culture. Weekly Contact: Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    EMS301: {
        title: 'Management Information Systems',
        prereqs: 'EMS 201',
        description: 'Algorithm analysis/design, data structures, searching/sorting, recursion and list processing. Coverage of database systems from a systems analyst perspective and enterprise resource planning (ERP) concepts from business and technical viewpoints. This course is not available to Computer Science students. Weekly Contact: Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    EMS303: {
        title: 'Managerial Accounting',
        prereqs: 'CHE 411 or ECN 801',
        description: 'Review of accounting principles and reporting for internal management use. Topics include budgets, standards and variance analysis, performance measures such as ROI and residual income, and management control techniques. Weekly Contact: Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    EMS304: {
        title: 'Project Management',
        prereqs: 'EMS 204',
        antireqs: 'CVL 742, IND 713, MEC 713',
        description: 'Fundamentals of project management using a life-cycle approach: project screening and selection, evaluation methods, structures, management and control, scheduling, resource management, life-cycle costing, computer support for project management, and project termination. Weekly Contact: Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    ENG503: {
        title: 'Science Fiction (Liberal Studies)',
        customRequisites: 'Not available for credit to ACS English Option, BA English, English-Philosophy and English-History double major program students.',
    },
    GEO702: {
        title: 'Technology and the Contemporary Environment',
        antireqs: 'GEO 703',
        customRequisites: 'Not available to Occupational and Public Health - Occupational Health and Safety option nor Public Health and Safety option students.',
    },
    HST701: { title: 'Scientific Technology and Modern Society' },
    IND300: {
        title: 'Introduction to Management',
        prereqs: 'MTH 141, MTH 240, CPS 188, CMN 432, CEN 199',
    },
    IND303: {
        title: 'Work Measurement, Analysis and Design',
        prereqs: 'CEN 199, CMN 432, CPS 188, ECN 801, MTH 410, PCS 211',
    },
    IND400: {
        title: 'Facilities Design',
        prereqs: 'CEN 199, CMN 432, ECN 801, IND 303, MEC 322, MTH 425',
    },
    IND405: {
        title: 'Introduction to Data Science and Analytics',
        prereqs: 'CEN 199, CMN 432, CPS 188, MTH 410',
    },
    IND508: {
        title: 'Operations Research I',
        prereqs: 'CMN 432, CPS 188, ECN 801, MTH 410',
    },
    IND600: {
        title: 'Systems Modeling and Simulation',
        prereqs: 'MEC 325 and IND 508',
    },
    IND604: {
        title: 'Operations Research II',
        prereqs: 'MEC 325, IND 508, MTH 510',
    },
    IND605: {
        title: 'Experimental Design and Quality Assurance',
        prereqs: 'CMN 432, CPS 188, PCS 211, MTH 410',
    },
    IND606: { title: 'Experimental Design and Quality Assurance', noOutline: true },
    IND708: {
        title: 'Information Systems',
        prereqs: 'CMN 432, IND 300, IND 400, IND 405, PSY 209',
    },
    IND70A: {
        title: 'Industrial Systems Design (part A)',
        prereqs: 'CMN 432, EES 512 IND 300, IND 400, IND 405, IND 600, IND 604, IND 605, IND 712, MEC 323, MEC 309, MEC 516, PSY 209',
    },
    IND70B: {
        title: 'Industrial Systems Design (part B)',
        prereqs: 'CMN 432, EES 512 IND 300, IND 400, IND 405, IND 600, IND 604, IND 605, IND 712, MEC 323, MEC 309, MEC 516, PSY 209',
    },
    IND710: {
        title: 'Production and Inventory Systems',
        prereqs: 'CMN 432, IND 400, IND 604, IND 300, PSY 209',
    },
    IND712: {
        title: 'Industrial Ergonomics',
        prereqs: 'CMN 432, ECN 801, MEC 325, PCS 211',
    },
    IND713: {
        title: 'Project Management',
        prereqs: 'CMN 432, ECN 801, MTH 510',
    },
    IND719: { title: 'Big Data Analytics Tools' },
    IND810: {
        title: 'Flexible Manufacturing Systems',
        prereqs: 'CMN 432, ECN 801, MEC 322, MTH 510',
    },
    IND816: {
        title: 'Service Operations Management',
        prereqs: 'CMN 432, IND 300, IND 400, IND 405, IND 600, IND 604, IND 605, PSY 209',
    },
    IND820: {
        title: 'Big Data Analytics Project',
        prereqs: 'IND 405 or MTH 642',
    },
    IND832: {
        title: 'Reliability and Decision Analysis',
        prereqs: 'MEC 325, MTH 410, MTH 510',
        description: 'Analytical approaches to reliability engineering (reliability functions, failure data, system reliability, design for reliability, maintenance) and decision analysis (decision trees, value of information, risk assessment, utility theory, multi-objective decision-making). Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    IND833: {
        title: 'Financial Engineering',
        prereqs: 'ECN 801, IND 604, MTH 410, MTH 425, MTH 510',
    },
    MEC222: {
        title: 'Engineering Graphical Communication',
        description: 'Technical drawing to Canadian/international standards: orthographic views, sectioning, dimensioning, tolerancing, assemblies, parts lists, free-hand sketching and CAD labs. Weekly Contact: Lab: 2 hrs; Lecture: 2 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC309: {
        title: 'Basic Thermodynamics',
        prereqs: 'MTH 240, MTL 200 and PCS 211',
        description: 'Introductory thermodynamics: systems and properties, first and second laws, entropy, control-volume analysis, pure substances, ideal gas model, thermodynamic cycles (Otto, Diesel, Brayton), and efficiencies. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs; Tutorial: 1 hr. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC311: {
        title: 'Dynamics',
        prereqs: 'PCS 211, MTH 141, MTH 240',
        description: 'Particles and rigid bodies in motion: kinematics and kinetics, work and energy, impulse and momentum, vibrating systems and practical applications such as clutches and brakes. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC322: {
        title: 'Manufacturing Fundamentals',
        prereqs: 'CEN 100, MTL 200, MEC 222, and CPS 188',
    },
    MEC323: {
        title: 'Statics and Mechanics of Materials',
        prereqs: 'PCS 211, MTH 240, MTH 141',
        description: 'Rigid body equilibrium, two- and three-force members, trusses, frames and machines; mechanics of materials topics including stress/strain, Hooke\'s Law, axial/torsional loading and statically indeterminate problems. Weekly Contact: Lab: 1 hr; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC325: {
        title: 'Introduction to Engineering Design',
        prereqs: 'MEC 222, CEN 100, MTL 200',
    },
    MEC411: {
        title: 'Mechanics of Machines',
        prereqs: 'MEC 311, MEC 322, MEC 323, MEC 325, CEN 199',
    },
    MEC430: {
        title: 'Solid Mechanics I',
        prereqs: 'CEN 199, MEC 323, MTL 200, MTH 425',
        description: 'Stress and strain analysis, stress transformation, principal stresses, Mohr\'s Circle, flexural analysis, beams and shafts design, columns and buckling (Euler), and related applied topics. Weekly Contact: Lab: 1.5 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC431: {
        title: 'Advanced Manufacturing',
        prereqs: 'CMN 432, MEC 322, MEC 323, MEC 325, MTH 425',
    },
    MEC511: {
        title: 'Thermodynamics and Fluids',
        prereqs: 'CEN 199 and CHY 102 and PCS 211 and (CPS 125 or CPS 188) and (ELE 202 or MTE 301) and (PCS 224 or MEC 323) and (MTH 312 or MTH 425)',
        description: 'Scope of thermodynamics and fluid flow: energy, heat and work, first and second laws, properties of substances, control-mass and control-volume analysis, entropy, conservation equations for fluid flow and one-dimensional flow applications. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC514: {
        title: 'Applied Thermodynamics',
        prereqs: 'MEC 309, MEC 311, CMN 432',
    },
    MEC516: {
        title: 'Fluid Mechanics I',
        prereqs: 'CEN 199, MEC 311, MTH 425, PCS 213',
    },
    MEC522: {
        title: 'Fluid Mechanics',
        prereqs: 'MTH 141, PCS 211, CPS 125, CVL 207, MTH 240 and MTL 200',
        description: 'Fluid properties and statics, manometry, forces on submerged planes, continuity, energy and momentum equations, one-dimensional flow in conduits, dimensional analysis and model testing. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC531: {
        title: 'Solid Mechanics II',
        prereqs: 'MEC 430 and MTL 300',
    },
    MEC613: {
        title: 'Machine Design I',
        prereqs: 'MEC 311, MEC 325, MEC 430, CMN 432, CEN 199',
    },
    MEC616: {
        title: 'Fluid Mechanics II',
        prereqs: 'MEC 325, MEC 516, ECN 801, CMN 432',
    },
    MEC617: {
        title: 'Manufacturing System Control',
        prereqs: 'MEC 222, MEC 325, (EES 512 or MTE 401), MEC 709',
    },
    MEC626: {
        title: 'Applied Finite Elements',
        prereqs: 'MEC 325, MEC 411, MEC 701, and MTH 510',
    },
    MEC701: {
        title: 'Heat Transfer',
        prereqs: 'MEC 309 and MEC 516',
        description: 'Fundamental course in heat transfer covering conduction, convection and radiation; analytical, graphical and numerical solutions for steady and unsteady conduction; convection analysis and heat exchanger theory and design. (2 hr. Lab every other week) Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC709: {
        title: 'Control Systems',
        prereqs: '(EES 512 or MTE 401) and MEC 311 and MEC 325 and MTH 425',
        description: 'Mathematical models of physical control systems; open and closed-loop analysis, block diagram algebra, stability analysis (Bode, Routh-Hurwitz, Root Locus) and introduction to compensator design (lead/lag). Weekly Contact: Lab: 1 hr; Lecture: 3 hrs; Tutorial: 1 hr. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC713: {
        title: 'Project Management',
        prereqs: 'CMN 432 and ECN 801 and (MTH 510 or MTE 401)',
        antireqs: 'EMS 304, CVL 742',
    },
    MEC721: {
        title: 'Vibrations',
        prereqs: 'CMN 432, MEC 311, MEC 325, MTH 425',
    },
    MEC722: {
        title: 'Thermal Systems Design',
        prereqs: 'CMN 432, MTH 410, MEC 325, ECN 801, MEC 701, MEC 616, MTH 510',
    },
    MEC723: {
        title: 'Mechanical Systems Design',
        prereqs: 'CMN 432, MTH 410, ECN 801, MTH 510 and MEC 613',
    },
    MEC734: {
        title: 'Design for Manufacturing',
        prereqs: 'CMN 432, MTH 410, MEC 325, ECN 801 and MEC 322',
    },
    MEC740: {
        title: 'Environmental Control in Buildings',
        prereqs: 'MEC 701, MEC 325, MEC 323',
    },
    MEC751: {
        title: 'Measurements, Sensors and Instruments',
        prereqs: 'MEC 309, MEC 322, MEC 709, EES 612',
    },
    MEC809: {
        title: 'Integrated Manufacturing',
        prereqs: 'MEC 322, MEC 325, MEC 309, MEC 411, MEC 709',
    },
    MEC810: {
        title: 'Thermal Power Generation',
        prereqs: 'MEC 616, MEC 701, MTH 510',
    },
    MEC811: {
        title: 'Machine Design II',
        prereqs: 'MEC 613, MEC 721, MTH 510',
    },
    MEC813: {
        title: 'Flexible Manufacturing Systems',
        prereqs: 'MEC 322, MTH 510, CMN 432, ECN 801',
    },
    MEC816: {
        title: 'Topics in Manufacturing Engineering',
        prereqs: 'ECN 801, CMN 432, MEC 411, MEC 322',
    },
    MEC817: {
        title: 'Combustion Engineering',
        prereqs: 'MEC 701, MEC 616',
    },
    MEC825: {
        title: 'Mechanical Design',
        prereqs: 'MEC 411 and MEC 430 and (MEC 722 or MEC 723 or MEC 734 or MEC 830)',
    },
    MEC832: {
        title: 'Reliability and Decision Analysis',
        prereqs: 'MEC 325, MTH 410, MTH 510',
        description: 'Analytical approaches to reliability engineering and decision analysis: reliability functions, failure data analysis, system reliability, maintenance, decision trees, value of information, risk assessment and multi-objective decision making. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MEC850: {
        title: 'Environmental Impact of Thermal Systems',
        prereqs: 'MEC 514, MEC 616',
    },
    MTE301: {
        title: 'Programming for Mechatronics Engineering',
        prereqs: 'CPS 188',
        description: 'Programming for digital computation in mechatronics: C/C++, MATLAB/Simulink and Python basics, program structure, OOP, GUIs, algorithm analysis, recursion and basic data structures. Weekly Contact: Lab: 2 hrs; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTE401: {
        title: 'Analysis of Electric Circuits',
        prereqs: 'MTH 140 and MTH 141 and PCS 125',
    },
    MTE501: {
        title: 'Signals and Systems for Mechatronics Engineering',
        prereqs: 'CEN 199, MTH 425, MTE 401, MTE 301',
        description: 'Continuous- and discrete-time signals and systems, LTI system representations, convolution, Fourier analysis, Laplace and Z-transforms, sampling and frequency-domain analysis. Weekly Contact: Lab: 2 hrs; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTE502: {
        title: 'Microprocessor Systems',
        prereqs: 'MEC 325, MTE 301, MTH 425',
        description: 'Introduces microprocessor-based systems: digital logic review, microprocessor architectures (8/16/32-bit), assembly and high-level languages, I/O, memory, interrupts, peripheral devices and case studies. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTE601: {
        title: 'Machine Mechanics and Design',
        prereqs: 'CMN 432, MEC 311, MEC 323, CEN 199',
    },
    MTE602: {
        title: 'Introduction to Robotics',
        prereqs: 'MTH 141, MTH 240, MTH 425, MTH 510, MEC 311, MEC 323',
    },
    MTE603: {
        title: 'Computer Structures and Real-Time Systems',
        prereqs: 'CPS 188, MTE 301 and MTE 502',
    },
    MTE604: {
        title: 'Electromechanical System Modelling and Design',
        prereqs: 'CMN 432, MEC 311, MEC 325, MEC 323, CEN 199, MTE 501, EES 612',
        coreqs: 'MTE 601, MTE 751',
    },
    MTE701: {
        title: 'Real-Time Digital Control Systems Design',
        prereqs: 'MTE 301, MTE 502, MEC 709, MTE 603, MTE 501, MTE 604',
    },
    MTE70A: {
        title: 'Mechatronics Capstone Design (part A)',
        prereqs: 'MTE 601, MTE 751, MTE 604, MTE 603',
    },
    MTE70B: {
        title: 'Mechatronics Capstone Design (part B)',
        prereqs: 'MTE 601, MTE 751, MTE 604, MTE 603',
    },
    MTE711: {
        title: 'Fundamentals of Microelectromechanical Systems',
        prereqs: 'PCS 125, MEC 323, MEC 325, MEC 322, MTE 301, EES 612, MTE 502, MTE 751, MTE 604',
    },
    MTE712: {
        title: 'Sensor Fusion',
        prereqs: 'MTH 410, MTH 510, MTE 751',
    },
    MTE751: {
        title: 'Measurements, Sensors and Instruments',
        prereqs: 'MEC 511, MEC 322, EES 612',
    },
    MTE792: {
        title: 'Digital Signal Processing',
        prereqs: '(ELE 632 or MTE 501) and (COE 538 or ELE 538 or MTE 502)',
    },
    MTE801: {
        title: 'Hardware in the Loop and RCP',
        prereqs: 'MTE 301, EES 612, MTE 501, MTE 502, MEC 709, MTE 751, MTE 604, MTE 603, MTE 701',
    },
    MTE811: {
        title: 'Design of Modern Control Systems',
        prereqs: 'MEC 709 and MTE 501',
    },
    MTE812: {
        title: 'Autonomous Robots and Vehicles',
        prereqs: '(ELE 719 or MTE 602) and MTE 701',
    },
    MTE819: {
        title: 'Control of Robotic Manipulators',
        prereqs: '(ELE 719 or MTE 602) and MEC 709',
    },
    MTE829: {
        title: 'System Models and Identification',
        prereqs: 'ELE 639 or MEC 709',
    },
    MTE882: {
        title: 'Introduction to Digital Image Processing',
        prereqs: 'ELE 632 or MTE 501',
    },
    MTE888: {
        title: 'Intelligent Systems',
        prereqs: '(ELE 632 or MTE 501) and (MEC 733 or MTE 502)',
    },
    MTH140: {
        title: 'Calculus I',
        antireqs: 'MTH 207 and MTH 131, Available only to Engineering and Engineering Special Students.',
        description: 'Limits, continuity, differentiation, extrema, curve sketching, definite/indefinite integrals, Fundamental Theorem of Calculus, areas and volumes, transcendental functions. Weekly Contact: Lab: 2 hrs; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTH141: {
        title: 'Linear Algebra',
        antireqs: 'MTH 108',
        customRequisites: 'Available only to Engineering and Engineering Special students.',
        description: 'Euclidean spaces, matrices, determinants, linear systems, linear transformations, bases and dimensions, eigenvalues, vector spaces and applications. Weekly Contact: Lab: 1 hr; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTH240: {
        title: 'Calculus II',
        prereqs: 'MTH 140',
        antireqs: 'MTH 310 and MTH 231',
        customRequisites: 'Available only to Engineering and Engineering Special Students.',
        description: 'Integration techniques, improper integrals, partial derivatives, sequences and series, power series, first-order differential equations and applications. Weekly Contact: Lab: 1 hr; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTH314: {
        title: 'Discrete Mathematics for Engineers',
        prereqs: 'MTH 141 and MTH 240',
        antireqs: 'MTH 110',
    },
    MTH410: {
        title: 'Statistics',
        prereqs: 'MTH 141 and MTH 240',
        antireqs: 'MTH 304, MTH 380 and MTH 404',
        description: 'Statistical methods including discrete and continuous distributions, confidence intervals, hypothesis testing, correlation and simple linear regression. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTH425: {
        title: 'Differential Equations and Vector Calculus',
        prereqs: 'MTH 140 and MTH 141 and MTH 240',
        antireqs: 'MTH 312, MTH 330, MTH 430 and MTH350',
        description: 'Review of ODEs, higher-order linear equations, Laplace transforms, vector calculus (grad, div, curl), line/surface/multiple integrals and fundamental theorems (Green, Stokes, Divergence). Weekly Contact: Lab: 2 hrs; Lecture: 4 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTH510: {
        title: 'Numerical Analysis',
        prereqs: 'MTH 141 and MTH 240',
        antireqs: 'MTH 501',
        description: 'Numerical methods: Taylor error, solution of nonlinear equations, LU decomposition, iterative linear solvers, eigenvalues, interpolation, numerical integration and numerical ODE solvers. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTH514: {
        title: 'Probability and Stochastic Processes',
        prereqs: 'MTH 312 or MTH 425',
        description: 'Probability theory and stochastic processes, random variables, transforms, joint/marginal distributions, stochastic processes (stationarity, ergodicity), power spectral density and applications. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTL200: {
        title: 'Materials Science Fundamentals',
        prereqs: 'CHY 102',
        description: 'Atomic structure, bonding, crystallinity, defects, diffusion, phase diagrams, structures of metals/polymers/ceramics, corrosion and thermal/electrical material properties. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    MTL300: {
        title: 'Materials Science II',
        prereqs: 'MTL 200',
    },
    MTL700: {
        title: 'Materials Selection for Engineering Design',
        prereqs: 'MEC 325 and MTL 300',
    },
    PCS125: {
        title: 'Physics: Waves and Fields',
        customRequisites: 'Available only to Engineering students.',
    },
    PCS211: {
        title: 'Physics: Mechanics',
        customRequisites: 'Available only to Engineering students.',
        description: 'Vector forces, free body diagrams, equilibrium, centre of mass, kinematics, Newtonian dynamics, work and energy, momentum and angular momentum. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs; Tutorial: 1 hr. GPA Weight: 1.00; Billing Units: 1.',
    },
    PCS213: {
        title: 'Physics: Light and Modern Physics',
        prereqs: 'PCS 125',
        description: 'Ray and wave models of light; reflection, refraction, interference, diffraction and polarization; Planck\'s hypothesis, Bohr model, photoelectric effect, uncertainty principle, Schrodinger equation, nuclear properties and radioactivity. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs. GPA Weight: 1.00; Billing Units: 1.',
    },
    PCS224: {
        title: 'Solid State Physics',
        prereqs: 'PCS 110 or PCS 125 or PCS 130',
        description: 'Quantum nature of solids, band theory of metals and semiconductors, conduction processes, p-n junctions, transistors and other solid-state devices. Weekly Contact: Lab: 1 hr; Lecture: 3 hrs; Tutorial: 1 hr. GPA Weight: 1.00; Billing Units: 1.',
    },
    PHL709: { title: 'Religion, Science and Philosophy' },
    POL507: { title: 'Power, Change and Technology' },
    PSY209: { title: 'Industrial Psychology' },
};
