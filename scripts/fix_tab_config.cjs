const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/StandaloneView.tsx', 'utf8');

c = c.replace(/\{ id: 'trust', label: '6.*?', icon: ShieldCheck \},/, '{ id: \'trust\', label: \'6. אמינות וסליקה\', icon: ShieldCheck },\n    { id: \'market\', label: \'7. מחקר שוק ומתחרים (AI)\', icon: Globe },');

fs.writeFileSync('src/modules/brand-dna-hub/StandaloneView.tsx', c);
