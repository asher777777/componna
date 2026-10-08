const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/types/brandDna.ts', 'utf8');

c = c.replace(/BrandEcosystem,/, 'BrandEcosystem,\n  FlagshipProduct,');

fs.writeFileSync('src/modules/brand-dna-hub/types/brandDna.ts', c);
