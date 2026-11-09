// Small DOM helpers shared by the other scripts.

function byId(id) {
    return document.getElementById(id);
}

function show(id) {
    byId(id).classList.remove('hidden');
}

function hide(id) {
    byId(id).classList.add('hidden');
}

function isVisible(id) {
    return !byId(id).classList.contains('hidden');
}

// Update the status pill shown above the layout.
function setDebug(text) {
    const el = byId('debugInfo');
    if (el) el.textContent = text;
}

// Replace a <select>'s options with a placeholder followed by `values`.
function fillSelect(select, placeholder, values) {
    select.innerHTML = '';
    select.appendChild(new Option(placeholder, ''));
    values.forEach(v => select.appendChild(new Option(v, v)));
}
