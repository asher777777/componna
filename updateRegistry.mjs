import fs from 'fs';

let file = fs.readFileSync('src/modules/page-builder/registry/sectionRegistry.tsx', 'utf8');

// Insert imports
const imports = `import { CustomHtmlView } from '../sections/customHtml/CustomHtmlView';
import { CustomHtmlEditor } from '../sections/customHtml/CustomHtmlEditor';
`;

// Insert the imports right after the FlowPlayerEditor import
file = file.replace(/import \{ FlowPlayerEditor \} from '\.\.\/sections\/flowPlayer\/FlowPlayerEditor';/, match => match + '\n' + imports);

// Replace the customHtml block
const newCustomHtml = `  customHtml: {
    type: 'customHtml',
    name: 'קוד AI מותאם אישית',
    category: 'content',
    description: 'אזור שנבנה אוטומטית על ידי ה-AI באמצעות HTML/Tailwind',
    icon: LayoutTemplate,
    viewComponent: CustomHtmlView as any,
    editorComponent: CustomHtmlEditor as any,
    defaultConfig: {
      type: 'customHtml',
      visible: true,
      rawHtmlTemplate: '',
    },
  },`;

file = file.replace(/customHtml: \{[\s\S]*?rawHtmlTemplate: '',\n    \},\n  \},/m, newCustomHtml);

fs.writeFileSync('src/modules/page-builder/registry/sectionRegistry.tsx', file);
