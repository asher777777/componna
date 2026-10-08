import fs from 'fs';

let config = fs.readFileSync('src/modules/control-center-hub/config/index.ts', 'utf8');
config = config.replace(/category: 'ai_automation',/, "category: 'core',");
fs.writeFileSync('src/modules/control-center-hub/config/index.ts', config);
