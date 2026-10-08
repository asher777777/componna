const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/types/brandDna.ts', 'utf8');

const servicesList = `services: [
      'מערכת CRM לאנליטיקה ולניהול לקוחות',
      'פורטל התחברות ואזור אישי ללקוחות',
      'אוטומציות וואטסאפ ושירות לקוחות חכם',
      'בניית דפי נחיתה ומערכת טפסים חכמים',
      'חנות דיגיטלית חכמה (SaaS Storefront)',
      'ניהול קהילות וקבוצות (Community Hub)',
      'פתרונות סליקה וקבלות (Payments Hub)',
      'ניהול שגרירים ותוכניות שותפים'
    ]`;

c = c.replace(/services:\s*\[\],/, servicesList);

fs.writeFileSync('src/modules/brand-dna-hub/types/brandDna.ts', c);
