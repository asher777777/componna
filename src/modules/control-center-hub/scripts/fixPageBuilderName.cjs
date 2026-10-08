const fs = require('fs');

const file = 'src/modules/control-center-hub/config/index.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /name: 'יוצר העמודים והאתרים \(Page Builder\)',/g,
  `name: 'Kosun Web (קושאן וואב)',`
);
content = content.replace(
  /shortTitle: 'עמודי נחיתה ואתרים',/g,
  `shortTitle: 'Kosun Web',`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Updated config');
