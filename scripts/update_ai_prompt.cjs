const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', 'utf8');

const updatedPrompt = `const userPrompt = \`Based on our Brand DNA and Target Audiences, assemble 3 highly recommended "Business Packages" (חבילות פתרונות ושירותים) that we can offer to businesses. 
Our core components and capabilities include:
1. מערכת CRM לאנליטיקה ולניהול לקוחות
2. אזור אישי ממותג ללקוחות (Auth Portal)
3. אוטומציות וואטסאפ למוקד שירות חכם (WhatsApp API)
4. בניית דפי נחיתה ומערכת טפסים חכמים להמרות
5. חנות דיגיטלית חכמה (SaaS Storefront)
6. ניהול קהילות וקבוצות (Community Hub)
7. פתרונות סליקה, הצעות מחיר וקבלות (Payments Hub)
8. ניהול שגרירים ותוכניות שותפים (Ambassadors)

Your task is to assemble these components into 3 cohesive, high-value packages tailored for our target audiences.
Focus ONLY on business solutions and business outcomes, not software or technical terms (e.g. use "מערכת לשימור לקוחות", not "CRM Analytics").
Do not output technical component names, just the business value of the package.

Return ONLY a valid JSON object with EXACTLY this key:
{
  "packages": [
    {
      "name": "שם החבילה",
      "description": "תיאור החבילה ומה היא כוללת (איזה רכיבים שולבו)",
      "painPointsAddressed": "נקודות הכאב המרכזיות שזה פותר",
      "competitiveAdvantage": "היתרון שלנו על פני המתחרים בפתרון זה",
      "targetAudience": "סוג הלקוח האידיאלי (הקהל אליו החבילה פונה)",
      "callToAction": "הצעה עסקית והנעה לפעולה מנוסחת לפי סוג הקהל"
    }
  ]
}\`;`;

c = c.replace(/const userPrompt = `Based on our Brand DNA[\s\S]*?\]\n\}\`;/, updatedPrompt);

fs.writeFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', c);
