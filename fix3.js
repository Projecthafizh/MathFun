const fs = require('fs');
const jsMatch = fs.readFileSync('script.js', 'utf8').match(/getElement\(['"]([^'"]+)['"]\)/g) || [];
const htmlData = fs.readFileSync('index.html', 'utf8');

const s = new Set();
jsMatch.forEach(m => s.add(m.match(/['"]([^'"]+)['"]/)[1]));

const missing = [];
s.forEach(id => {
    if (!htmlData.includes('id="' + id + '"')) {
        missing.push(id);
    }
});

console.log('Missing IDs in HTML:', missing.join(', '));
