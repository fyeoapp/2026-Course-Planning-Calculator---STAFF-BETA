// Page wiring: sidebar links, saved program choice and startup.

const SAVED_PROGRAM_KEY = 'tmu_selected_program_v1';

function saveProgramChoice() {
    const val = byId('programSelect').value;
    try {
        if (val) localStorage.setItem(SAVED_PROGRAM_KEY, val);
    } catch (e) { /* storage unavailable; the choice just isn't remembered */ }
}

// Re-select the last program chosen on this device, if it still exists.
function restoreSavedProgram() {
    let saved = null;
    try {
        saved = localStorage.getItem(SAVED_PROGRAM_KEY);
    } catch (e) { /* storage unavailable */ }
    if (!saved || !PROGRAMS[saved]) return;
    byId('programSelect').value = saved;
    updateAdmitYearsForProgram(saved);
}

// Sidebar buttons declare their destination with data-href.
function initExternalLinks() {
    document.querySelectorAll('button[data-href]').forEach(btn => {
        btn.addEventListener('click', () => window.open(btn.dataset.href, '_blank'));
    });
}

// FYEng Mobile App: open the chosen store, then reset to the placeholder.
function initStorePicker() {
    const sel = byId('fyengStore');
    sel.addEventListener('change', function() {
        if (this.value) window.open(this.value, '_blank');
        this.value = '';
    });
}

function initProgramSelect() {
    byId('programSelect').addEventListener('change', function() {
        updateAdmitYearsForProgram(this.value);
        saveProgramChoice();
    });
}

// The checklist is re-rendered for each program, so listen on its container.
function initChecklist() {
    byId('step3').addEventListener('change', event => {
        if (event.target.matches('input[type="checkbox"]')) onChecklistChange();
    });
}

// The status pill is for developers: add ?debug to the URL to see it.
function initDebugBar() {
    if (!/[?&]debug\b/.test(window.location.search)) {
        document.querySelector('.debug-bar').classList.add('hidden');
    }
}

// Expand collapsed result sections so they appear in the printout.
function initPrint() {
    window.addEventListener('beforeprint', () => {
        document.querySelectorAll('#eligibleCourses details').forEach(d => { d.open = true; });
    });
}

initHistoryNavigation();
initExternalLinks();
initStorePicker();
initProgramSelect();
initChecklist();
initDebugBar();
initPrint();
updateNavigation();
document.addEventListener('DOMContentLoaded', () => {
    initCurricula();
    restoreSavedProgram();
});
