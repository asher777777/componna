const fs = require('fs');
const p = 'src/modules/saas-storefront-composer/services/storefrontService.ts';
let c = fs.readFileSync(p, 'utf8');

c = "import { ensureDefaultFirebaseApp } from '../../../services/firebaseAuth';\n" + c;
c = c.replace(/const \{ ensureDefaultFirebaseApp \} = await import\('..\/..\/..\/services\/firebaseAuth'\);/g, '');

fs.writeFileSync(p, c);
console.log('storefrontService Patched');
