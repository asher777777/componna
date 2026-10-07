const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/BrandIdentitySection.tsx', 'utf8');

const downsizeCode = `        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result;
          
          // Downsize the image to avoid QuotaExceededError
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 300;
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const resizedDataUrl = canvas.toDataURL('image/png', 0.8);
            handleProcessLogoUrl(resizedDataUrl);
          };
          img.src = dataUrl;
        };`;

c = c.replace(/const reader = new FileReader\(\);\s*reader\.onload = async \(event\) => \{\s*const dataUrl = event\.target\?\.result as string;\s*handleProcessLogoUrl\(dataUrl\);\s*\};/, downsizeCode);

fs.writeFileSync('src/modules/brand-dna-hub/components/BrandIdentitySection.tsx', c);
