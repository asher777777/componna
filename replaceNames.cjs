const fs = require('fs');
const path = require('path');

const dir = 'src';

const regexps = [
  { re: /Smart Pro Digital/gi, rep: 'Cashwan' },
  { re: /סמארט פרו דיגיטאל/g, rep: 'קושאן' },
  { re: /Componna/gi, rep: 'Cashwan' },
  { re: /קומפונה/g, rep: 'קושאן' },
  { re: /componna/gi, rep: 'cashwan' } // handles lowercase
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const {re, rep} of regexps) {
        if (re.test(content)) {
          content = content.replace(re, rep);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDir(dir);
console.log('Global rename done.');
