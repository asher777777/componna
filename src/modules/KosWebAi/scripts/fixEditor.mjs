import fs from 'fs';

let file = fs.readFileSync('src/modules/KosWebAi/PageBuilderEditor.tsx', 'utf8');

file = file.replace(/  useEffect\(\(\) => \{\n      document\.documentElement\.classList\.add\('dark'\);/, `  useEffect(() => {\n    if (isDarkMode) {\n      document.documentElement.classList.add('dark');`);

fs.writeFileSync('src/modules/KosWebAi/PageBuilderEditor.tsx', file);
