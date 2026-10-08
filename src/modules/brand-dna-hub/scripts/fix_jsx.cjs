const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', 'utf8');

c = c.replace(/\{isCreatingPage && \(/, '<>\n            {isCreatingPage && (');
c = c.replace(/צור עמוד נחיתה אוטומטי למוצר \(AI\)\n            <\/button>\n           \)\}/, 'צור עמוד נחיתה אוטומטי למוצר (AI)\n            </button>\n            </>\n           )}');

fs.writeFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', c);
