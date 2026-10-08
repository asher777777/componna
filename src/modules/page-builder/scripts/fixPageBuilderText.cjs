const fs = require('fs');

function replaceInFile(file, from, to) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(new RegExp(from, 'g'), to);
  fs.writeFileSync(file, content, 'utf8');
}

replaceInFile('src/modules/page-builder/PageBuilderRenderer.tsx', 'Kosun Page Builder', 'Kosun Web');
replaceInFile('src/modules/page-builder/components/LivePreviewFrame.tsx', 'Kosun Page Builder', 'Kosun Web');
replaceInFile('src/modules/page-builder/index.ts', 'יוצר עמודים ואתרים אוטונומי ב-AI', 'Kosun Web (קושאן וואב)');
