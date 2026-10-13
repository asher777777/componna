const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/types/brandDna.ts', 'utf8');

c = c.replace(/BrandEcosystem,/, 'BrandEcosystem,\n  FlagshipProduct,');

fs.writeFileSync('src/modules/KosBranding/types/brandDna.ts', c);
