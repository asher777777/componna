const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/StandaloneView.tsx', 'utf8');
c = c.replace(/Globe,/, 'Globe,\n  Layers,');
c = c.replace(/\{ id: 'ecosystem', label: '4. מבנה שירותים', icon: Target \},/, 
  '{ id: \'ecosystem\', label: \'4. מבנה שירותים\', icon: Layers },');
c = c.replace(/4\. שפה חזותית/, '5. שפה חזותית');
c = c.replace(/5\. אמינות וסליקה/, '6. אמינות וסליקה');
fs.writeFileSync('src/modules/brand-dna-hub/StandaloneView.tsx', c);
