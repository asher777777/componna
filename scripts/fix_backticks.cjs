const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', 'utf8');

c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$/g, '$');

fs.writeFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', c);
