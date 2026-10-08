import fs from 'fs';

let pbe = fs.readFileSync('src/modules/page-builder/PageBuilderEditor.tsx', 'utf8');
pbe = pbe.replace(/seoInfo/g, 'seoSettings');
fs.writeFileSync('src/modules/page-builder/PageBuilderEditor.tsx', pbe);

let brand = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');
brand = brand.replace(/identity\.flagshipProducts as string\[\]/g, '(identity.flagshipProducts || []).map(p => typeof p === "string" ? p : p.name)');
brand = brand.replace(/identity\.flagshipProducts \|\| \[\]/g, '(identity.flagshipProducts || []).map(p => typeof p === "string" ? p : p.name)');
fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', brand);
