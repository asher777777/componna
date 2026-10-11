const fs = require('fs');
const file = 'src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/value: \\\`₪\\\$\\{totalCostIls\\.toFixed\\(4\\)\\}\\\`/g, 'value: `₪${totalCostIls.toFixed(4)}`');
// Wait, my regex might miss it if the characters are escaped weirdly.
// Let's just do a simpler string replace.
content = content.replace('value: \\`₪\\${totalCostIls.toFixed(4)}\\`', 'value: `₪${totalCostIls.toFixed(4)}`');

fs.writeFileSync(file, content, 'utf8');
