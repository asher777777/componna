const fs = require('fs');
const p = 'src/modules/kosai-engine/context/KosaiContext.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/import\('\.\.\/services\/kosaiFirestoreService'\)\.then\(\(\{ kosaiRulesService \}\) => \{/g, 'Promise.resolve({ kosaiRulesService }).then(({ kosaiRulesService }) => {');

fs.writeFileSync(p, c);
console.log('KosaiContext Patched');
