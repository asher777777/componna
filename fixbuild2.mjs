import fs from 'fs';

let svc = fs.readFileSync('src/modules/ambassador-campaigns-hub/services/campaignBrandIntegrationService.ts', 'utf8');
svc = svc.replace(/import \{ eventBus \} from '..\/..\/..\/core\/bridge\/eventBus';/g, "import { EventBus as eventBus } from '../../../core/bridge/EventBus';");
fs.writeFileSync('src/modules/ambassador-campaigns-hub/services/campaignBrandIntegrationService.ts', svc);

let dna = fs.readFileSync('src/modules/brand-dna-hub/types/brandDna.ts', 'utf8');
if (!dna.includes('ecosystem: {')) {
  dna = dna.replace(
    /export const DEFAULT_BRAND_DNA: BrandDna = \{/,
    `export const DEFAULT_BRAND_DNA: BrandDna = {
  ecosystem: { modules: [], integrationPoints: {} },`
  );
  fs.writeFileSync('src/modules/brand-dna-hub/types/brandDna.ts', dna);
}

console.log('Fixed properly!');
