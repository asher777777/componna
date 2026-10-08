const fs = require('fs');
const path = require('path');

const dirs = ['src', 'public'];

const regexps = [
  { re: /Cashwan/g, rep: 'Kosun' },
  { re: /cashwan/g, rep: 'kosun' }
];

function processDir(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md') || fullPath.endsWith('.html') || fullPath.endsWith('.json'))) {
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

for (const d of dirs) {
  processDir(d);
}

// Also check root files
const rootFiles = ['index.html', 'package.json', 'README.md'];
for (const rf of rootFiles) {
  if (fs.existsSync(rf)) {
    let content = fs.readFileSync(rf, 'utf8');
    let changed = false;
    for (const {re, rep} of regexps) {
      if (re.test(content)) {
        content = content.replace(re, rep);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(rf, content, 'utf8');
      console.log('Updated root file: ' + rf);
    }
  }
}

console.log('Renamed Cashwan to Kosun globally.');
