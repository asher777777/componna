const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/types/brandDna.ts', 'utf8');

c = c.replace(/BrandDnaContract,/, 'BrandDnaContract,\n  BrandEcosystem,\n  BusinessPackage,');

c = c.replace(/ecosystem: \{[\s\S]*?communities: \[\],/, 'ecosystem: {\n    services: [],\n    products: [],\n    annualEvents: [],\n    communities: [],\n    businessPackages: [],');

fs.writeFileSync('src/modules/brand-dna-hub/types/brandDna.ts', c);
