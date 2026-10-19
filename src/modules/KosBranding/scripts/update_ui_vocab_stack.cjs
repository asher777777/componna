const fs = require('fs');
const path = require('path');

// 1. Update brandAiContract.ts
const brandAiContractPath = path.resolve('src/modules/kosai-engine/modelsAiService/brandAiContract.ts');
let brandAiContent = fs.readFileSync(brandAiContractPath, 'utf8');

if (!brandAiContent.includes('generateBrandUiVocabulary')) {
  brandAiContent = brandAiContent.replace(
    "import { KosaiContractResult } from './types';",
    "import { KosaiContractResult } from './types';\nimport { BrandUiVocabulary } from '../../../core/contracts';"
  );
  
  const vocabMethod = `
  /**
   * Generates microcopy and UI vocabulary (CTAs, placeholders, section headings) matching Brand DNA.
   * Capped to 1000 output tokens.
   */
  async generateBrandUiVocabulary(
    prompt: string,
    options?: {
      apiKey?: string;
      tenantId?: string;
      systemInstruction?: string;
    }
  ): Promise<KosaiContractResult<BrandUiVocabulary>> {
    return executeKosaiAi<BrandUiVocabulary>('KosBranding', prompt, {
      model: 'gemini-3.8-flash-lite',
      systemInstruction: options?.systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.6,
      maxOutputTokens: 1000,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },
};`;

  brandAiContent = brandAiContent.replace(/};\s*$/, vocabMethod + '\n');
  fs.writeFileSync(brandAiContractPath, brandAiContent, 'utf8');
  console.log('Updated brandAiContract.ts');
}

// 2. Update brandPrompts.ts
const brandPromptsPath = path.resolve('src/modules/KosBranding/prompts/brandPrompts.ts');
let brandPromptsContent = fs.readFileSync(brandPromptsPath, 'utf8');

if (!brandPromptsContent.includes('BUILD_BRAND_UI_VOCABULARY_PROMPT')) {
  const promptFunction = `
/**
 * פרומפט ליצירה ודיוק של שפת ממשק, כפתורים, פלייסהולדרים וכותרות אזורים (Brand UI Vocabulary)
 * מבוסס על ה-Brand DNA, קהל היעד, לשון הפנייה (מגדר/רבים), והטון הייחודי של הטננט
 */
export function BUILD_BRAND_UI_VOCABULARY_PROMPT(
  brand: BrandDna
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'קופירייטר מיקרו-קופי, מומחה UX וקריאות לפעולה (CRO)');
  const name = brand.identity?.companyName || 'העסק';
  const slogan = brand.identity?.slogan || '';
  const purpose = brand.identity?.organizationPurpose || '';
  const gender = brand.voice?.genderAddressing || 'plural';
  const sector = brand.voice?.sectorCompliance || 'general';
  const uvp = brand.audience?.mainUvp || '';
  const tone = \`\${brand.voice?.personality?.formality || 3}/5 רשמיות, \${brand.voice?.personality?.warmth || 4}/5 חמימות, \${brand.voice?.personality?.energy || 4}/5 אנרגיה\`;
  const powerWords = (brand.voice?.powerWords || []).join(', ');

  const genderInstructions = gender === 'female'
    ? 'לשון נקבה יחיד בלבד ("את מוזמנת", "בואי נתחיל", "השאירי פרטים", "דברי איתנו", "שמך המלא")'
    : gender === 'male'
    ? 'לשון זכר יחיד בלבד ("אתה מוזמן", "בוא נתחיל", "השאר פרטים", "דבר איתנו")'
    : 'לשון רבים ("אתם מוזמנים", "בואו נתחיל", "השאירו פרטים", "צרו קשר")';

  const userPrompt = \`צור ערכת מיקרו-קופי ושפת ממשק משתמש (Brand UI Vocabulary) מנצחת ומדויקת להפליא עבור המותג "\${name}".

נתוני המיתוג של הטננט:
- שם המותג: \${name}
- סלוגן: \${slogan}
- מהות הארגון / תחום פעילות: \${purpose}
- הצעת ערך ייחודית (UVP): \${uvp}
- פנייה מגדרית נדרשת: \${genderInstructions}
- מגזר / תאימות תרבותית: \${sector}
- טמפרמנט וטון: \${tone}
- מילות כוח וערכים מובילים: \${powerWords || 'איכות, מקצוענות, שקט נפשי'}

הנחיות קריטיות:
1. התאמה קפדנית ללשון הפנייה (\${genderInstructions}) - אסור בשום אופן לפנות בלשון זכר כאשר הוגדרה פנייה נשית!
2. הימנע מכל קלישאה גנרית שחוקה כמו "הפלטפורמה המובילה", "למה לבחור בנו?", "התחל עכשיו", "השאירו פרטים"!
3. כל כפתור, פלייסהולדר וכותרת אזור חייבים להישמע מקצועיים, מעוצבים וטבעיים לתחום הפעילות של המותג.

החזר אך ורק אובייקט JSON תקין (ללא markdown) במבנה המדויק הבא:
{
  "primaryCta": "כפתור פעולה ראשי ממוקד ומניע לפעולה בשפת המותג",
  "secondaryCta": "כפתור פעולה משני (למשל מידע נוסף / ייעוץ אישי)",
  "whatsappCta": "כפתור פנייה ב-WhatsApp מותאם מגדרית",
  "contactCta": "כפתור יצירת קשר או השארת פרטים",
  "formSubmitText": "טקסט כפתור שליחת טופס",
  "namePlaceholder": "פלייסהולדר לשדה שם",
  "phonePlaceholder": "פלייסהולדר לשדה טלפון",
  "emailPlaceholder": "פלייסהולדר לשדה אימייל",
  "messagePlaceholder": "פלייסהולדר לשדה הודעה / פירוט הצורך",
  "sectionHeadings": {
    "heroTitle": "כותרת ראשית סוחפת להדליין של ה-Hero",
    "heroSubtitle": "כותרת משנה חדה ל-Hero המשקפת את ה-UVP",
    "aboutHeading": "כותרת אזור אודות (לא בנאלית)",
    "aboutSubtitle": "כותרת משנה לאזור אודות",
    "advantagesHeading": "כותרת אזור יתרונות / למה דווקא אנחנו",
    "advantagesSubtitle": "כותרת משנה לאזור יתרונות",
    "painPointsHeading": "כותרת אזור מענה לאתגרים / כאבים",
    "painPointsSubtitle": "כותרת משנה לאזור אתגרים",
    "targetAudiencesHeading": "כותרת אזור קהלי יעד / למי זה מתאים",
    "targetAudiencesSubtitle": "כותרת משנה לאזור קהלי יעד",
    "faqHeading": "כותרת אזור שאלות ותשובות",
    "faqSubtitle": "כותרת משנה לאזור שאלות ותשובות",
    "contactHeading": "כותרת אזור יצירת קשר ופנייה",
    "contactSubtitle": "כותרת משנה לאזור יצירת קשר",
    "communityHeading": "כותרת אזור קהילה / מרחב שותפים",
    "communitySubtitle": "כותרת משנה לאזור קהילה",
    "testimonialsHeading": "כותרת אזור המלצות ועדויות",
    "testimonialsSubtitle": "כותרת משנה לאזור המלצות",
    "galleryHeading": "כותרת אזור גלריה / עשייה מהשטח",
    "gallerySubtitle": "כותרת משנה לאזור גלריה"
  }
}\`.trim();

  return { systemContext, userPrompt };
}
`;

  brandPromptsContent += '\n' + promptFunction;
  fs.writeFileSync(brandPromptsPath, brandPromptsContent, 'utf8');
  console.log('Updated brandPrompts.ts');
}

// 3. Update promptToKosai.ts
const promptToKosaiPath = path.resolve('src/modules/KosBranding/kosai/promptToKosai.ts');
let promptToKosaiContent = fs.readFileSync(promptToKosaiPath, 'utf8');

if (!promptToKosaiContent.includes('dispatchBrandUiVocabularyToKosai')) {
  promptToKosaiContent = promptToKosaiContent.replace(
    'BUILD_AUDIENCE_AND_PERSONAS_FROM_ESSENCE_PROMPT,\n}',
    'BUILD_AUDIENCE_AND_PERSONAS_FROM_ESSENCE_PROMPT,\n  BUILD_BRAND_UI_VOCABULARY_PROMPT,\n}'
  );

  const dispatchFunction = `
/**
 * מפיק ערכת שפת ממשק, כפתורים וכותרות (Brand UI Vocabulary) מותאמת אישית מתוך קולקציית המיתוג
 */
export async function dispatchBrandUiVocabularyToKosai(
  brand: BrandDna,
  options?: KosaiBrandDispatchOptions
): Promise<any> {
  const { systemContext, userPrompt } = BUILD_BRAND_UI_VOCABULARY_PROMPT(brand);
  const result = await kosaiBrandContract.generateBrandUiVocabulary(userPrompt, {
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
    systemInstruction: systemContext,
  });
  return result.data;
}
`;

  promptToKosaiContent += '\n' + dispatchFunction;
  fs.writeFileSync(promptToKosaiPath, promptToKosaiContent, 'utf8');
  console.log('Updated promptToKosai.ts');
}
