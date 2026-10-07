const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/BrandIdentitySection.tsx', 'utf8');

const replacement = `        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl.length > 1024 * 1024 * 2) {
             alert('התמונה גדולה מידי, אנא העלה תמונה קטנה מ-1MB');
             setIsExtractingColors(false);
             return;
          }
          handleProcessLogoUrl(dataUrl);
        };`;

c = c.replace(/const reader = new FileReader\(\);[\s\S]*?img\.src = dataUrl;\s*\};/, replacement);
fs.writeFileSync('src/modules/brand-dna-hub/components/BrandIdentitySection.tsx', c);
