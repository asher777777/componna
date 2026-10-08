const fs = require('fs');
const p = 'src/main.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/Smart Pro Digital\\|סמארט פרו דיגיטאל\\|Componna\\|קומפונה/g, 'Smart Pro Digital|סמארט פרו דיגיטאל|Componna|קומפונה|Comona|קומאנה|Cashwan|קושאן');

fs.writeFileSync(p, c);
console.log('main.tsx updated with Kosun purge rules');
