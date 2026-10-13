const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', 'utf8');

c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$/g, '$');

fs.writeFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', c);
