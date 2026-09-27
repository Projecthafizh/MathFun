const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const extraFunction = `
function closeMobileMenu() {
    const mobileNav = getElement("mobileNav");
    if (mobileNav) {
        mobileNav.classList.remove("show");
    }
    const menuToggle = getElement("menuToggle");
    if (menuToggle) {
        const icon = menuToggle.querySelector("span");
        if (icon) {
            icon.textContent = "☰";
        }
    }
}
window.closeMobileMenu = closeMobileMenu;
`;

if (!code.includes('closeMobileMenu')) {
    code = code.replace('/* =========================================================\r\n   SELESAI', extraFunction + '\n/* =========================================================\r\n   SELESAI');
    code = code.replace('/* =========================================================\n   SELESAI', extraFunction + '\n/* =========================================================\n   SELESAI');
    fs.writeFileSync('script.js', code, 'utf8');
    console.log("Added closeMobileMenu");
}
