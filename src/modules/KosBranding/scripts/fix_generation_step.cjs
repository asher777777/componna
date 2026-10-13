const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', 'utf8');

c = c.replace(/if \(step === 'planning'\) setGenerationStep\('מתכנן אסטרטגיה עסקית לעמוד\.\.\.'\);\n          if \(step === 'content'\) setGenerationStep\('כותב קופירייטינג ממיר ותוכן SEO\.\.\.'\);\n          if \(step === 'designing'\) setGenerationStep\('מעצב ומסדר בלוקים ותמונות\.\.\.'\);\n          if \(step === 'finalizing'\) setGenerationStep\('מסיים והופך את העמוד לזמין\.\.\.'\);/, 'setGenerationStep(step.statusText || \\'מייצר עמוד...\\');');

fs.writeFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', c);
