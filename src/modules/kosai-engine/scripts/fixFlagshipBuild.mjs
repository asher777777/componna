import fs from 'fs';

let bo = fs.readFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', 'utf8');

bo = bo.replace(
  /if \(step === 'planning'\) setGenerationStep\('מתכנן אסטרטגיה עסקית לעמוד\.\.\.'\);\n\s*if \(step === 'content'\) setGenerationStep\('כותב קופירייטינג ממיר ותוכן SEO\.\.\.'\);\n\s*if \(step === 'designing'\) setGenerationStep\('מעצב ומסדר בלוקים ותמונות\.\.\.'\);\n\s*if \(step === 'finalizing'\) setGenerationStep\('מסיים והופך את העמוד לזמין\.\.\.'\);/g,
  `setGenerationStep(step.statusText || step.stepTitle || 'מייצר עמוד...');`
);

fs.writeFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', bo);
