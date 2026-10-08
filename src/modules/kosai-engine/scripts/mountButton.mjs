import fs from 'fs';

let file = fs.readFileSync('src/modules/page-builder/PageBuilderEditor.tsx', 'utf8');

const newImports = `import { FloatingCopilotButton } from './components/FloatingCopilotButton';\n`;

file = file.replace(/import \{ CopilotChatDrawer \} from '\.\/components\/CopilotChatDrawer';/, match => match + '\n' + newImports);

file = file.replace(/<CopilotChatDrawer \/>/, `<CopilotChatDrawer />\n      <FloatingCopilotButton />`);

fs.writeFileSync('src/modules/page-builder/PageBuilderEditor.tsx', file);
