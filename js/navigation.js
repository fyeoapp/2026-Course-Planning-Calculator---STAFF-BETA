// Step-to-step navigation:
//   1 Standing -> 2 Program -> 3 Courses -> 4 Results (step4 + step5 cards)
//
// Every forward move is pushed onto browser history, so the browser's Back
// button and the page's own Back button both step back through the planner.

let currentStep = 1;

// Show `step` and hide the others.
function showStep(step) {
    currentStep = step;
    ['step1', 'step2', 'step3', 'step4', 'step5'].forEach(hide);
    if (step === 4) {
        show('step4');
        show('step5');
    } else {
        show('step' + step);
    }
    updateNavigation();
    window.scrollTo(0, 0);
}

// Move forward to `step` and record it so Back can return.
function goToStep(step) {
    showStep(step);
    history.pushState({ step }, '');
}

// Step 1: answer to "Is your academic standing clear?"
function standingCheck(isClear) {
    if (isClear) {
        hide('contactDept');
        goToStep(2);
    } else {
        // Stay on step 1 so the student can read the advice or change their answer.
        show('contactDept');
    }
}

// Step 2 -> Step 3: render the selected program's curriculum.
function showCourses() {
    const program = byId('programSelect').value;
    const admitYear = byId('admitYearSelect').value;

    if (!program) {
        alert('Please select your program from the dropdown before continuing.');
        return;
    }

    if (!renderCurriculum(program, admitYear)) renderCurriculumNotFound(program, admitYear);
    goToStep(3);
}

// Sync the Back button and stepper with the current step.
function updateNavigation() {
    byId('backButton').classList.toggle('hidden', currentStep === 1);
    document.querySelectorAll('#stepper li').forEach(li => {
        const n = Number(li.dataset.step);
        li.classList.toggle('active', n === currentStep);
        li.classList.toggle('done', n < currentStep);
    });
}

// The page's Back button behaves exactly like the browser's.
function goBack() {
    history.back();
}

// A step can only be shown again if its content still exists (it won't after
// a page reload, e.g. when the browser's Forward button is used).
function canShowStep(step) {
    if (step === 3) return Boolean(byId('step3').innerHTML.trim());
    if (step === 4) return Boolean(byId('eligibleCourses').innerHTML.trim());
    return true;
}

function initHistoryNavigation() {
    history.replaceState({ step: 1 }, '');
    window.addEventListener('popstate', function(event) {
        const step = (event.state && event.state.step) || 1;
        showStep(canShowStep(step) ? step : 1);
    });
}
