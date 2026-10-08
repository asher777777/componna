import fs from 'fs';

let file = fs.readFileSync('src/modules/page-builder/PageBuilderEditor.tsx', 'utf8');

file = file.replace(/  useEffect\(\(\) => \{\n      document\.documentElement\.classList\.add\('dark'\);/, `  useEffect(() => {\n    if (isDarkMode) {\n      document.documentElement.classList.add('dark');`);

fs.writeFileSync('src/modules/page-builder/PageBuilderEditor.tsx', file);
