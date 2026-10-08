const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/types/brandDna.ts', 'utf8');

c = c.replace(/    \]\n    products: \[\],/, '    ],\n    products: [],');

fs.writeFileSync('src/modules/brand-dna-hub/types/brandDna.ts', c);
