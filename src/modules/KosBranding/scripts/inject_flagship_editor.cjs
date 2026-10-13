const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/components/BrandEcosystemSection.tsx', 'utf8');

if (!c.includes('FlagshipProductsEditor')) {
  c = c.replace(/import \{ generateAiEcosystemItems, generateAiBusinessPackages \} from '\.\.\/services\/geminiBrandPrompt';/, 
    'import { generateAiEcosystemItems, generateAiBusinessPackages } from \'../services/geminiBrandPrompt\';\nimport { FlagshipProductsEditor } from \'./FlagshipProductsEditor\';');
    
  c = c.replace(/<ArrayEditor\s+title="מוצרי דגל"[\s\S]*?\/>/, '<FlagshipProductsEditor />');
  
  fs.writeFileSync('src/modules/KosBranding/components/BrandEcosystemSection.tsx', c);
}
