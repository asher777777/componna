const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error('File not found:', fullPath);
    return false;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  content = content.replace(regex, replacement);
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Successfully updated:', filePath);
    return true;
  } else {
    console.warn('Pattern not found in:', filePath);
    return false;
  }
}

console.log('--- Cleaning services section from KosWebAi ---');

// 1. sectionRegistry.tsx
replaceInFile(
  'src/modules/KosWebAi/registry/sectionRegistry.tsx',
  /import\s*\{\s*ServicesGridSection\s*\}\s*from\s*'\.\.\/sections\/services\/ServicesGridSection';\r?\n?/,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/registry/sectionRegistry.tsx',
  /import\s*\{\s*ServicesGridEditor\s*\}\s*from\s*'\.\.\/sections\/services\/ServicesGridEditor';\r?\n?/,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/registry/sectionRegistry.tsx',
  /\s*services:\s*\{[\s\S]*?defaultConfig:\s*\{[\s\S]*?items:\s*\[[\s\S]*?\]\s*\}\s*\},?\r?\n/m,
  '\n'
);

// 2. pageBuilder.types.ts
replaceInFile(
  'src/modules/KosWebAi/types/pageBuilder.types.ts',
  /\s*\|\s*'services'\r?\n?/,
  ''
);

// 3. sectionConfigs.ts
replaceInFile(
  'src/modules/KosWebAi/types/sectionConfigs.ts',
  /export\s+interface\s+ServiceItem\s*\{[\s\S]*?\}\r?\n*/m,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/types/sectionConfigs.ts',
  /export\s+interface\s+ServicesSectionConfig\s+extends\s+BaseSectionConfig\s*\{[\s\S]*?\}\r?\n*/m,
  ''
);

// 4. prompts/index.ts
replaceInFile(
  'src/modules/KosWebAi/prompts/index.ts',
  /2\.\s*"services":[\s\S]*?statLabel\}\]\r?\n?/m,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/prompts/index.ts',
  /\s*-\s*For services, provide unique icons[^\r\n]*\r?\n?/,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/prompts/index.ts',
  /services\s*\(bento\)\s*->\s*/g,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/prompts/index.ts',
  /services\s*->\s*/g,
  ''
);

// 5. aiPageGenerator.ts
replaceInFile(
  'src/modules/KosWebAi/services/aiPageGenerator.ts',
  /'services',\s*/g,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/services/aiPageGenerator.ts',
  /if\s*\(clean\.includes\('feat'\)[\s\S]*?return\s*'services';\r?\n?/,
  "if (clean.includes('feat') || clean.includes('serv') || clean.includes('solut') || clean.includes('problem') || clean.includes('benefit') || clean.includes('advant')) return 'richContent';\n"
);
replaceInFile(
  'src/modules/KosWebAi/services/aiPageGenerator.ts',
  /return\s*'services';\r?\n?\s*\};/m,
  "return 'richContent';\n    };"
);
replaceInFile(
  'src/modules/KosWebAi/services/aiPageGenerator.ts',
  /\s*if\s*\(sectionType\s*===\s*'services'\s*&&[\s\S]*?\}\s*\}\r?\n/m,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/services/aiPageGenerator.ts',
  /sectionType:\s*'services',\s*stepTitle:\s*'כרטיסי ערך ויתרונות תחרותיים \(Services Grid\)'[\s\S]*?\}\s*\},?\r?\n\s*\{/m,
  `sectionType: 'richContent',
          stepTitle: 'תוכן עשיר ויתרונות (Rich Content)',
          statusText: 'מבליט את היתרונות הייחודיים שהופכים את ההצעה לבלתי ניתנת לסירוב...',
          data: {
            title: 'למה כולם בוחרים בנו?',
            subtitle: 'ארבעה יתרונות ברורים שמביאים תוצאות אמיתיות',
            layout: 'highlight-box',
            content: 'אנו מציעים מעטפת מקצועית מלאה המשלבת טכנולוגיה מתקדמת, תוצאות מוכחות בשטח וליווי אישי רציף.',
          },
        },
        {`
);
replaceInFile(
  'src/modules/KosWebAi/services/aiPageGenerator.ts',
  /sectionType:\s*'services',\s*stepTitle:\s*'סל השירותים המקומי \(Services\)'[\s\S]*?\}\s*\},?\r?\n\s*\{/m,
  `sectionType: 'richContent',
          stepTitle: 'תוכן ומומחיות מקומית (Rich Content)',
          statusText: 'מפרט תחומי התמחות ומענה מהיר...',
          data: {
            title: 'השירותים והמענה שאנחנו מספקים',
            subtitle: 'פתרון מותאם אישית לכל לקוח עם אחריות מלאה',
            layout: 'two-columns',
            content: 'אנו מעניקים שירות מקצועי, אמין ומהיר בכל אזור הפעילות עם ניסיון של שנים ושביעות רצון מוכחת.',
          },
        },
        {`
);
replaceInFile(
  'src/modules/KosWebAi/services/aiPageGenerator.ts',
  /sectionType:\s*'services',\s*stepTitle:\s*'הקמת רשת יתרונות ושירותים \(Services Grid\)'[\s\S]*?\}\s*\},?\r?\n\s*\{/m,
  `sectionType: 'richContent',
        stepTitle: 'הקמת אזור תוכן וערך מרכזי (Rich Content)',
        statusText: 'מרכיב פסקאות ערך ומומחיות להעברת המסר המדויק...',
        data: {
          title: 'למה לבחור דווקא בנו?',
          subtitle: 'ארבעה עמודי תווך שהופכים אותנו לבחירה הטבעית של לקוחותינו',
          layout: 'highlight-box',
          content: 'מקצועיות ומומחיות מוכחת, מענה מהיר וזמינות גבוהה, טכנולוגיה וחדשנות מתקדמת, ושקיפות ואחריות מלאה לאורך כל הדרך.',
        },
      },
      {`
);

// 6. aiSectionEnhancerService.ts
replaceInFile(
  'src/modules/KosWebAi/services/aiSectionEnhancerService.ts',
  /\s*\}\s*else\s+if\s*\(sectionType\s*===\s*'services'\)\s*\{[\s\S]*?\}\s*\)\s*;\r?\n/m,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/services/aiSectionEnhancerService.ts',
  /\s*\}\s*else\s+if\s*\(sectionType\s*===\s*'services'\)\s*\{[\s\S]*?changes\.push\('השירות המוביל הודגש בכרטיס Bento רחב'\);\s*\}\s*\}/m,
  ''
);

// 7. pageBlueprints.ts
replaceInFile(
  'src/modules/KosWebAi/blueprints/pageBlueprints.ts',
  /'services',\s*/g,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/blueprints/pageBlueprints.ts',
  /'services-1',\s*/g,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/blueprints/pageBlueprints.ts',
  /'geo-services',\s*/g,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/blueprints/pageBlueprints.ts',
  /'comm-benefits',\s*/g,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/blueprints/pageBlueprints.ts',
  /\s*'services-1':\s*\{[\s\S]*?\},\r?\n/m,
  '\n'
);
replaceInFile(
  'src/modules/KosWebAi/blueprints/pageBlueprints.ts',
  /\s*'geo-services':\s*\{[\s\S]*?\},\r?\n/m,
  '\n'
);
replaceInFile(
  'src/modules/KosWebAi/blueprints/pageBlueprints.ts',
  /\s*'comm-benefits':\s*\{[\s\S]*?\},\r?\n/m,
  '\n'
);

// 8. PageBuilderStandaloneView.tsx
replaceInFile(
  'src/modules/KosWebAi/PageBuilderStandaloneView.tsx',
  /\s*'services',\r?\n/g,
  '\n'
);
replaceInFile(
  'src/modules/KosWebAi/PageBuilderStandaloneView.tsx',
  /\s*services:\s*\{\s*\.\.\.SECTION_REGISTRY\.services\.defaultConfig,\s*id:\s*'services'\s*\},\r?\n/m,
  '\n'
);
replaceInFile(
  'src/modules/KosWebAi/PageBuilderStandaloneView.tsx',
  /sections:\s*\[\s*'hero',\s*'services',/g,
  "sections: ['hero', 'richContent',"
);

// 9. pageBuilderFirestore.ts
replaceInFile(
  'src/modules/KosWebAi/services/pageBuilderFirestore.ts',
  /'services-1',\s*/g,
  ''
);
replaceInFile(
  'src/modules/KosWebAi/services/pageBuilderFirestore.ts',
  /\s*'services-1':\s*\{[\s\S]*?\},\r?\n/m,
  '\n'
);

// 10. KosWebAiHostBridge.tsx
replaceInFile(
  'src/modules/KosWebAi/components/KosWebAiHostBridge.tsx',
  /type:\s*'services',/g,
  "type: 'richContent',"
);

console.log('--- Cleaning finished ---');
