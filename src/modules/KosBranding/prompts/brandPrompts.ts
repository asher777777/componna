import { BrandDna } from '../types/brandDna';

/**
 * פרומפט ליצירת פסקת מיתוג דחוסה ומרוכזת (250-300 מילים - "מועט המחזיק את המרובה")
 * מבוסס על קולקציית ה-Brand DNA
 */
export function BUILD_BRAND_SUMMARY_PARAGRAPH_PROMPT(brand: BrandDna): string {
  const name = brand.identity.companyName || 'העסק';
  const purpose = brand.identity.organizationPurpose || '';
  const slogan = brand.identity.slogan || '';
  const uvp = brand.audience.mainUvp || '';
  const vision = brand.identity.shortVision || brand.identity.companyVision || '';
  const audiences = (brand.audience.targetAudiences || []).join(', ');
  const powers = (brand.voice.powerWords || []).join(', ');
  const tone = `${brand.voice.personality.formality}/5 רשמיות, ${brand.voice.personality.warmth}/5 חמימות, ${brand.voice.personality.energy}/5 אנרגיה`;
  const personas = (brand.audience.personas || []).map(p => `${p.name} (כאב: ${p.mainPain}, תוצאה: ${p.dreamOutcome})`).join('; ');
  const objections = (brand.audience.commonObjections || []).map(o => `${o.objection} -> ${o.rebuttal}`).join('; ');

  return `חבר פסקת תמצית מותג (Brand Essence) דחוסה, עמוקה ומנוסחת ברמת קופירייטינג עילית.

נתוני המותג מקולקציית ה-CRM וה-DNA:
- שם: ${name}
- תחום ותכלית: ${purpose}
- סלוגן: ${slogan}
- בידול ו-UVP: ${uvp}
- חזון: ${vision}
- קהלי יעד: ${audiences}
- אישיות שפה: ${tone}
- מילות עוצמה: ${powers}
- פרסונות: ${personas}
- מענה לחששות: ${objections}

כללי חובה:
1. אורך מדויק: בין 250 ל-300 מילים בלבד! (לא פחות מ-250 ולא יותר מ-300 מילים).
2. סגנון: תוכן מרוכז ודחוס המבטא "מועט המחזיק את המרובה" – ללא קלישאות, מדויק, רהוט ומרתק.
3. מבנה: פסקה רציפה אחת או שתיים ללא כותרות ביניים.

החזר JSON בלבד במבנה הבא:
{
  "summaryParagraph": "פסקת התוכן המלאה בין 250 ל-300 מילים...",
  "wordCount": 275
}`.trim();
}

/**
 * פרומפט לחילוץ Brand DNA משיחת אפיון
 */
export function BUILD_BRAND_DISCOVERY_PROMPT(interviewNotes: string): string {
  return `נתח שיחת אפיון זו וחלץ Brand DNA מלא ב-JSON בלבד:
"${interviewNotes}"

החזר JSON לפי המבנה:
{
  "identity": {
    "companyName": "שם",
    "organizationType": "חברה/עסק",
    "organizationPurpose": "תכלית",
    "slogan": "סלוגן",
    "companyVision": "חזון מפורט",
    "shortVision": "חזון קצר"
  },
  "voice": {
    "personality": {"formality": 3, "warmth": 4, "luxury": 3, "energy": 4},
    "genderAddressing": "plural",
    "sectorCompliance": "general",
    "powerWords": ["מילה1", "מילה2", "מילה3"],
    "forbiddenWords": []
  },
  "audience": {
    "mainUvp": "בידול עיקרי",
    "targetAudiences": ["קהל 1", "קהל 2"],
    "personas": [{"id": "p-1", "name": "שם", "roleOrProfile": "פרופיל", "mainPain": "כאב", "dreamOutcome": "תוצאה"}],
    "commonObjections": [{"id": "o-1", "objection": "חשש", "rebuttal": "מענה"}]
  },
  "designTokens": {
    "primaryColor": "#6366f1",
    "secondaryColor": "#0ea5e9"
  },
  "trust": {
    "refundPolicySummary": "מדיניות החזר",
    "securityBadgeText": "סליקה מאובטחת"
  }
}`.trim();
}

/**
 * פרומפט לשכתוב תוכן בהתאם לטון המותג
 */
export function BUILD_BRAND_REPHRASE_PROMPT(
  originalText: string,
  brand: BrandDna,
  customInstructions?: string
): { systemContext: string; userPrompt: string } {
  const systemContext = `אתה קופירייטר המותג עבור ${brand.identity.companyName}.
סגנון: ${brand.voice.personality.formality >= 4 ? 'רשמי ומכובד' : 'קליל ומקרב'}, לשון ${brand.voice.genderAddressing}.
מילות מפתח: ${brand.voice.powerWords.join(', ')}.
בידול: ${brand.audience.mainUvp}.`;

  const userPrompt = `שכתב ושפר את הטקסט הבא שיתאים במדויק לשפת המותג:
"${originalText}"
${customInstructions ? `דגש נוסף: ${customInstructions}` : ''}
החזר אך ורק את הטקסט המשופר ללא הסברים או הקדמות.`.trim();

  return { systemContext, userPrompt };
}

/**
 * פרומפט לסיוע שלב בשאלון מיתוג מודרך
 */
export function BUILD_STEP_ASSISTANCE_PROMPT(
  stepId: string,
  brand: BrandDna,
  userDraft?: string
): string {
  return `אתה מומחה מיתוג המלווה שאלון מודרך בשלב "${stepId}".
מותג: ${brand.identity.companyName || 'עסק'}, תכלית: ${brand.identity.organizationPurpose || 'שירות'}, בידול: ${brand.audience.mainUvp || ''}
${userDraft ? `טיוטת משתמש: "${userDraft}"` : ''}

הצע בדיוק 3 אפשרויות שונות ב-JSON בלבד:
{
  "suggestions": [
    {"title": "כיוון 1", "value": "תוכן", "subtitle": "הסבר", "rationale": "ערך", "isRecommended": false},
    {"title": "כיוון 2", "value": "תוכן", "subtitle": "הסבר", "rationale": "ערך", "isRecommended": true},
    {"title": "כיוון 3", "value": "תוכן", "subtitle": "הסבר", "rationale": "ערך", "isRecommended": false}
  ],
  "recommendedIndex": 1,
  "recommendationReason": "נימוק קצר לבחירה",
  "smartInsight": "תובנה עסקית קצרה"
}`.trim();
}

/**
 * פרומפט לאסטרטגיות תוכן (עמוד שירות ועמוד מכירה)
 */
export function BUILD_CONTENT_STRATEGIES_PROMPT(brand: BrandDna): string {
  return `צור 2 אסטרטגיות תוכן (עמוד שירות ועמוד מכירה) עבור ${brand.identity.companyName} (${brand.identity.organizationPurpose}):
UVP: ${brand.audience.mainUvp}
החזר מערך JSON בלבד:
[
  {
    "id": "strat_service",
    "type": "service_page",
    "title": "עמוד שירות וסמכות",
    "targetAudience": "${brand.audience.targetAudiences[0] || 'לקוחות'}",
    "heroHeadline": "כותרת ראשית",
    "heroSubheadline": "כותרת משנה",
    "coreValuePoints": ["תועלת 1", "תועלת 2", "תועלת 3"],
    "callToAction": "קביעת שיחה",
    "objectionKiller": "מענה לחשש",
    "persuasiveClosing": "סגירה רגשית",
    "createdAt": "${new Date().toISOString()}"
  },
  {
    "id": "strat_sales",
    "type": "sales_page",
    "title": "עמוד מכירה ישירה",
    "targetAudience": "${brand.audience.targetAudiences[0] || 'לקוחות'}",
    "heroHeadline": "כותרת מכירה",
    "heroSubheadline": "כותרת משנה",
    "coreValuePoints": ["תועלת 1", "תועלת 2", "תועלת 3"],
    "callToAction": "הזמן עכשיו",
    "pricingHook": "מחיר השקה בלעדי",
    "objectionKiller": "אחריות מלאה",
    "persuasiveClosing": "הנעה מיידית לפעולה",
    "createdAt": "${new Date().toISOString()}"
  }
]`.trim();
}
