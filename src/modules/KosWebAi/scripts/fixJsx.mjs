import fs from 'fs';

let file = fs.readFileSync('src/modules/KosWebAi/PageBuilderEditor.tsx', 'utf8');

file = file.replace(/    return \(\n    \n      <KosaiChatDrawer \/>/, `    return (\n    <>\n      <KosaiChatDrawer />`);

file = file.replace(/    <\/div>\n  \);\n\};\n$/, `    </div>\n    </>\n  );\n};\n`);

fs.writeFileSync('src/modules/KosWebAi/PageBuilderEditor.tsx', file);
