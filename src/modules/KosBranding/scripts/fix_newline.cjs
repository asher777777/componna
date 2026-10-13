const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', 'utf8');

c = c.replace(/const \{ tenantId \} = useTenantScope\(\);\\n  const \{ brandDna \} = useBrandDna\(\);/, 'const { tenantId } = useTenantScope();\n  const { brandDna } = useBrandDna();');

fs.writeFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', c);
