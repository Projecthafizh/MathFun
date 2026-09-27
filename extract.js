const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const clicks = content.match(/onclick="([^"]+)"/g) || [];
const functionsCalled = new Set();

clicks.forEach(c => {
    // Extract everything inside onclick=""
    const attr = c.match(/onclick="([^"]+)"/)[1];
    // Split by bracket or semicolon to get function names
    const parts = attr.split(/[;|\(| ]+/);
    parts.forEach(p => {
        if(p && !['return', 'false', 'true', "'home'", "'hasil'", "'tentang'", "'addition'", "'subtraction'", "'multiplication'", "'division'", "'random'", "'choose'", '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(p)) {
            if (/^[a-zA-Z_]\w*$/.test(p)) {
                 functionsCalled.add(p);
            }
        }
    });
});

console.log(Array.from(functionsCalled).join(', '));
