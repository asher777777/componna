import fs from 'fs';

// 1. Fix EventBus
let svc = fs.readFileSync('src/modules/ambassador-campaigns-hub/services/campaignBrandIntegrationService.ts', 'utf8');
svc = svc.replace(/EventBus/g, 'eventBus');
fs.writeFileSync('src/modules/ambassador-campaigns-hub/services/campaignBrandIntegrationService.ts', svc);

// 2. Fix BrandEcosystemSection.tsx updateBrandDna
let eco = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');
eco = eco.replace(/const \{ brandDna, updateBrandDna \} = useBrandDna\(\);/g, 'const { brandDna, setFullBrandDna } = useBrandDna();');
eco = eco.replace(/updateBrandDna\(/g, 'setFullBrandDna(');
fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', eco);

console.log("Fixed!");
