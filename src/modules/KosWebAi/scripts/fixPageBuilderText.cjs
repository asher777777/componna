const fs = require('fs');

function replaceInFile(file, from, to) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(new RegExp(from, 'g'), to);
  fs.writeFileSync(file, content, 'utf8');
}

replaceInFile('src/modules/KosWebAi/PageBuilderRenderer.tsx', 'Kosun Page Builder', 'Kosun Web');
replaceInFile('src/modules/KosWebAi/components/LivePreviewFrame.tsx', 'Kosun Page Builder', 'Kosun Web');
replaceInFile('src/modules/KosWebAi/index.ts', 'יוצר עמודים ואתרים אוטונומי ב-AI', 'Kosun Web (קושאן וואב)');
