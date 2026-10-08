import fs from 'fs';

let config = fs.readFileSync('src/modules/control-center-hub/config/index.ts', 'utf8');

const kosaiBlock = `  {
    id: 'kosai-engine',
    name: 'מנוע KOSAI AI Engine',
    shortTitle: 'מנוע KOSAI AI',
    description: 'מנוע AI חכם לבניית עמודים, עיצוב אוטומטי, ותקשורת עם שאר רכיבי המערכת',
    route: '/kosai-engine',
    category: 'ai_automation',
    categoryTitle: 'אוטומציה ו-AI',
    pipelineStage: 'engage',
    pipelineStageTitle: '2. מעורבות והמרה',
    collectionName: 'mod_kosai_rules',
    iconName: 'Bot',
    badge: 'חדש',
    colorScheme: {
      from: 'from-purple-600',
      to: 'to-indigo-600',
      border: 'border-purple-500/40',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/20',
      bgHover: 'hover:bg-purple-950/30',
    },
    features: ['הזרקת Brand DNA', 'בנייה מונחית צ׳אט', 'שינוי עיצוב גלובלי', 'הגדרת רכיבי קידום SEO'],
    actionLabel: 'הגדר מנוע AI',
  },
`;

if (!config.includes("id: 'kosai-engine'")) {
  config = config.replace(/export const MODULE_CATALOG: ControlCenterModuleItem\[\] = \[/, `export const MODULE_CATALOG: ControlCenterModuleItem[] = [\n${kosaiBlock}`);
  fs.writeFileSync('src/modules/control-center-hub/config/index.ts', config);
}
