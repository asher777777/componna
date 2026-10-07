import fs from 'fs';

let file = fs.readFileSync('src/modules/page-builder/PageBuilderEditor.tsx', 'utf8');

const imports = `import { BuilderCopilotProvider } from './context/BuilderCopilotContext';
import { CopilotChatDrawer } from './components/CopilotChatDrawer';
`;

file = file.replace(/import \{ PageBuilderConfig.*?from '\.\/types\/pageBuilder\.types';/, match => match + '\n' + imports);

const returnWrapper = `  return (
    <BuilderCopilotProvider config={config} setConfig={setConfig}>
      <CopilotChatDrawer />
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white select-none transition-colors duration-300">`;

file = file.replace(/return \(\s*<div className="flex flex-col min-h-screen bg-slate-50 dark:bg-\[#09090b\] text-slate-900 dark:text-white select-none transition-colors duration-300">/, returnWrapper);

// Close the wrapper at the very bottom
file = file.replace(/<\/div>\s*\);\s*\};\s*$/, `    </div>\n    </BuilderCopilotProvider>\n  );\n};\n`);

// But wait, the bottom might have more lines. Let's look for the final `);\n};`
fs.writeFileSync('src/modules/page-builder/PageBuilderEditor.tsx', file);
