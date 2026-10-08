import fs from 'fs';

let registry = fs.readFileSync('src/workbench/moduleRegistry.ts', 'utf8');

const importStatement = `const KosaiEngineStandaloneView = React.lazy(() =>\n  import('../modules/kosai-engine').then((m) => ({ default: m.KosaiStandaloneView }))\n);\n`;

if (!registry.includes('KosaiEngineStandaloneView')) {
  // Insert import
  registry = registry.replace(/export interface ModuleDefinition/, importStatement + '\nexport interface ModuleDefinition');

  const moduleDef = `  {
    id: 'kosai-engine',
    name: 'KOSAI AI Engine',
    description: 'מנוע AI מרכזי לשליטה בעריכה, ממשק ועיצוב עם תמיכה בחוקים דינמיים ו-Brand DNA',
    component: KosaiEngineStandaloneView,
    route: '/kosai-engine',
    collectionPrefix: 'mod_kosai_',
  },\n`;

  // Insert into array
  registry = registry.replace(/export const REGISTERED_MODULES: ModuleDefinition\[\] = \[/, `export const REGISTERED_MODULES: ModuleDefinition[] = [\n${moduleDef}`);
  
  fs.writeFileSync('src/workbench/moduleRegistry.ts', registry);
}
