const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\ROBERTO CARLOS\\Documents\\GitHub\\Clubes_Exitus\\frontend\\src\\PortalFamiliar.tsx', 'utf8');

let curly = 0;
let paren = 0;
let bracket = 0;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') curly++;
    if (content[i] === '}') curly--;
    if (content[i] === '(') paren++;
    if (content[i] === ')') paren--;
    if (content[i] === '[') bracket++;
    if (content[i] === ']') bracket--;
}

console.log(`Curly: ${curly}, Paren: ${paren}, Bracket: ${bracket}`);
