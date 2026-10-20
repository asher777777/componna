import fs from 'node:fs';

const path = 'src/modules/KosWebAi/types/sectionConfigs.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '  customImageOverride?: string; // דריסת תמונה מותאמת לאזור או לעמוד\n}',
  `  customImageOverride?: string; // דריסת תמונה מותאמת לאזור או לעמוד
  sectionHeightMode?: 'auto' | 'compact' | 'medium' | 'tall' | 'custom'; // עיצוב גובה הליסטינג
  customSectionHeight?: number; // גובה מותאם אישית בפיקסלים (e.g. 400-1200)
}`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Added height properties to sectionConfigs.ts');
