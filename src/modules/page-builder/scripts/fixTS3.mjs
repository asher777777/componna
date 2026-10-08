import fs from 'fs';

let pbe = fs.readFileSync('src/modules/page-builder/PageBuilderEditor.tsx', 'utf8');
pbe = pbe.replace(/seoInfo:/g, 'seoSettings:');
fs.writeFileSync('src/modules/page-builder/PageBuilderEditor.tsx', pbe);

let brand = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');
brand = brand.replace(/identity\.flagshipProducts as any/g, 'identity.flagshipProducts as string[]');
fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', brand);
