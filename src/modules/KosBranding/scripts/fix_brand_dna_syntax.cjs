const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/types/brandDna.ts', 'utf8');

c = c.replace(/    \]\n    products: \[\],/, '    ],\n    products: [],');

fs.writeFileSync('src/modules/KosBranding/types/brandDna.ts', c);
