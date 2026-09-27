const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// Section IDs replacements
code = code.replace(/"setupSection"/g, '"setup"');
code = code.replace(/"quizSection"/g, '"quiz"');
code = code.replace(/"resultSection"/g, '"result"');
code = code.replace(/"homeSection"/g, '"home"');
code = code.replace(/"historySection"/g, '"hasil"');
code = code.replace(/"aboutSection"/g, '"tentang"');

// Modal replacements
code = code.replace(/"modalOverlay"/g, '"quitModal"');
code = code.replace(/function closeModal\(\)/g, 'function closeQuitModal()');
code = code.replace(/closeModal\(\)/g, 'closeQuitModal()');

// Additional missing functions
const extraFunctions = `

/* =========================================================
   EXTRA MISSING FUNCTIONS
   ========================================================= */

function scrollToOperations() {
    const ops = getElement("operations");
    if (ops) {
        ops.scrollIntoView({ behavior: 'smooth' });
    }
}
window.scrollToOperations = scrollToOperations;

function openOperation(operation) {
    selectOperation(operation);
}
window.openOperation = openOperation;

function showResultDetails() {
    showSection("resultDetails");
}
window.showResultDetails = showResultDetails;

window.closeQuitModal = closeQuitModal;
`;

if (!code.includes('showResultDetails')) {
    code = code.replace('/* =========================================================\r\n   SELESAI', extraFunctions + '\n/* =========================================================\r\n   SELESAI');
    code = code.replace('/* =========================================================\n   SELESAI', extraFunctions + '\n/* =========================================================\n   SELESAI');
}

fs.writeFileSync('script.js', code, 'utf8');
console.log("Fixtures applied successfully to script.js");
