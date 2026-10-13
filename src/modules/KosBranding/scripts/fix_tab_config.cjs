const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/StandaloneView.tsx', 'utf8');

c = c.replace(/\{ id: 'trust', label: '6.*?', icon: ShieldCheck \},/, '{ id: \'trust\', label: \'6. אמינות וסליקה\', icon: ShieldCheck },\n    { id: \'market\', label: \'7. מחקר שוק ומתחרים (AI)\', icon: Globe },');

fs.writeFileSync('src/modules/KosBranding/StandaloneView.tsx', c);
