const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', 'utf8');

c = c.replace(/const \{ tenantId \} = useTenantScope\(\);\\n  const \{ brandDna \} = useBrandDna\(\);/, 'const { tenantId } = useTenantScope();\n  const { brandDna } = useBrandDna();');

fs.writeFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', c);
