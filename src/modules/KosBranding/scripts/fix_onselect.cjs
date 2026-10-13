const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', 'utf8');

c = c.replace(/onSelect=\{\(url\) => \{/, 'onSelectMedia={(items: any[]) => {');
c = c.replace(/updateField\('imageUrl', url\);/, 'if (items && items[0]) updateField(\'imageUrl\', items[0].url);');

fs.writeFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', c);
