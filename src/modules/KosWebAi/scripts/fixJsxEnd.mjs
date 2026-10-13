import fs from 'fs';

let file = fs.readFileSync('src/modules/KosWebAi/PageBuilderEditor.tsx', 'utf8');

file = file.replace(/        <\/div>\n    \n  \);\n\};\n$/, `      </div>\n    </>\n  );\n};\n`);

fs.writeFileSync('src/modules/KosWebAi/PageBuilderEditor.tsx', file);
