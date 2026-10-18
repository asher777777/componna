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

/**
 * מייצר פסקת תמצית מותג דטרמיניסטית ואיכותית מתוך נתוני ה-DNA
 */
export function generateDeterministicBrandSummary(brand: BrandDna): string {
  const name = brand.identity?.companyName || 'העסק';
  const type = brand.identity?.organizationType || 'חברה';
  const purpose = brand.identity?.organizationPurpose || 'מתן שירותים ופתרונות מקצועיים';
  const slogan = brand.identity?.slogan ? ` בסימן "${brand.identity.slogan}"` : '';
  const uvp = brand.audience?.mainUvp ? ` הייחוד המרכזי הינו ${brand.audience.mainUvp}.` : '';
  const audiences = brand.audience?.targetAudiences?.length
    ? ` הפעילות מיועדת בראש ובראשונה ל${brand.audience.targetAudiences.join(', ')}.`
    : '';
  const vision = brand.identity?.shortVision || brand.identity?.companyVision ? ` חזון המותג: ${brand.identity?.shortVision || brand.identity?.companyVision}.` : '';

  return `${name} הינו ${type} הפועל בתחום ${purpose}${slogan}.${uvp}${audiences}${vision}`.trim();
}

/**
 * בונה הקשר מערכתי ממוקד וחסכוני בטוקנים על בסיס פסקת תמצית המותג המסכמת (Brand Essence)
 */
export function BUILD_BRAND_SYSTEM_CONTEXT(brand: BrandDna, moduleRole: string = 'שיווק, תוכן ומיתוג'): string {
  const company = brand.identity?.companyName || 'העסק';
  const summary = brand.brandSummaryParagraph?.trim() || generateDeterministicBrandSummary(brand);

  return [
    `תפקידך: "${moduleRole}" עבור "${company}".`,
    `תמצית מותג מסכמת (Brand Essence):`,
    summary,
    brand.voice?.powerWords?.length ? `מילות מפתח מנחות: ${brand.voice.powerWords.join(', ')}.` : '',
    brand.voice?.forbiddenWords?.length ? `מילים אסורות: ${brand.voice.forbiddenWords.join(', ')}.` : '',
  ].filter(Boolean).join('\n');
}

/**
 * פרומפט ליצירת מוצר דגל מלא (FlagshipProduct) בפורמט טקסט מובנה וחסכוני בטוקנים (ללא בזבוז JSON או אייקונים)
 * כולל: 6 נקודות כאב, 3 קהלי יעד, 6 יתרונות תחרותיים, 10 שאלות ותשובות, ונתוני SEO וקידום AI
 */
export function BUILD_FLAGSHIP_PRODUCT_PROMPT(
  idea: string,
  brand: BrandDna
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'אסטרטג מוצרי דגל, מומחה SEO/AIO וקופירייטר בכיר');
  const userPrompt = `בהתבסס על תמצית המותג ועל הרעיון שהזין המשתמש:
"${idea}"

צור פרופיל מוצר דגל שלם, עשיר, ייחודי ומעמיק בעברית רהוטה.
אין צורך לציין אייקונים (המערכת תקצה אייקונים כברירת מחדל).
חובה לכתוב תוכן מגוון, שונה ומובחן לכל סעיף – חל איסור מוחלט על חזרות, העתקות או כפילויות של תוכן בין השדות!

החזר את התשובה אך ורק בפורמט הטקסט המובנה הבא, עם התגיות המדויקות:

===NAME_AND_SLOGAN===
[שם המוצר + סלוגן מושך ומדויק]

===SHORT_DESCRIPTION===
[תיאור קצר וקולע ב-1-2 משפטים שמסביר את המוצר והתועלת המיידית שלו]

===LONG_DESCRIPTION===
[תיאור ארוך, עשיר ומפורט (4-6 משפטים) המספר את סיפור המוצר, החוויה והערך העמוק שהוא מעניק]

===PAIN_POINTS===
1. [כותרת קצרה של נקודת כאב 1] | [פירוט מעמיק ב-2 משפטים כיצד המוצר פותר את הכאב הזה]
2. [כותרת נקודת כאב שונה 2] | [פירוט מעמיק ב-2 משפטים]
3. [כותרת נקודת כאב שונה 3] | [פירוט מעמיק ב-2 משפטים]
4. [כותרת נקודת כאב שונה 4] | [פירוט מעמיק ב-2 משפטים]
5. [כותרת נקודת כאב שונה 5] | [פירוט מעמיק ב-2 משפטים]
6. [כותרת נקודת כאב שונה 6] | [פירוט מעמיק ב-2 משפטים]

===TARGET_AUDIENCES===
1. [קהל יעד ספציפי 1] | [פירוט מעמיק למה המוצר מתאים לו ומה התועלת עבורו]
2. [קהל יעד שונה 2] | [פירוט מעמיק]
3. [קהל יעד שונה 3] | [פירוט מעמיק]

===COMPETITIVE_ADVANTAGES===
1. [יתרון תחרותי ייחודי 1] | [פירוט המעלה על פני כל חלופה אחרת]
2. [יתרון תחרותי שונה 2] | [פירוט המעלה]
3. [יתרון תחרותי שונה 3] | [פירוט המעלה]
4. [יתרון תחרותי שונה 4] | [פירוט המעלה]
5. [יתרון תחרותי שונה 5] | [פירוט המעלה]
6. [יתרון תחרותי שונה 6] | [פירוט המעלה]

===FAQS===
1. [שאלה נפוצה 1 בנושא מהות המוצר?] | [תשובה מפורטת, מרגיעה ומשכנעת]
2. [שאלה נפוצה 2 בנושא התאמה?] | [תשובה מפורטת]
3. [שאלה נפוצה 3 בנושא מחיר ועלויות?] | [תשובה מפורטת]
4. [שאלה נפוצה 4 בנושא לוחות זמנים?] | [תשובה מפורטת]
5. [שאלה נפוצה 5 בנושא תהליך העבודה?] | [תשובה מפורטת]
6. [שאלה נפוצה 6 בנושא תמיכה ושירות?] | [תשובה מפורטת]
7. [שאלה נפוצה 7 בנושא בידול ממתחרים?] | [תשובה מפורטת]
8. [שאלה נפוצה 8 בנושא אחריות ובטחון?] | [תשובה מפורטת]
9. [שאלה נפוצה 9 בנושא תוצאות צפויות?] | [תשובה מפורטת]
10. [שאלה נפוצה 10 בנושא צעדים ראשונים?] | [תשובה מפורטת]

===SEO===
SLUG: english-seo-slug-for-product
META_TITLE: כותרת מטא לגוגל (עד 60 תווים)
META_DESCRIPTION: תיאור מטא שיווקי לגוגל (עד 160 תווים)
KEYWORDS: מילת מפתח 1, מילת מפתח 2, מילת מפתח 3, מילת מפתח 4
AI_SUMMARY: תמצית ידע עובדתית ב-3 משפטים שמנועי AI יצטטו ישירות לגבי המוצר
AI_QUESTIONS: שאלה 1? | שאלה 2? | שאלה 3? | שאלה 4? | שאלה 5?`.trim();

  return { systemContext, userPrompt };
}

/**
 * פרומפט ליצירת שירות מרכזי מלא (CoreService) בפורמט טקסט מובנה וחסכוני בטוקנים
 * כולל: 6 נקודות כאב שהשירות פותר, 3 קהלי יעד, 6 יתרונות תחרותיים, 10 שאלות ותשובות, ונתוני SEO/AIO
 */
export function BUILD_CORE_SERVICE_PROMPT(
  idea: string,
  brand: BrandDna
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'אסטרטג שירותים עסקיים, מומחה SEO/AIO וקופירייטר בכיר');
  const userPrompt = `בהתבסס על תמצית המותג ועל שירות היעד שהזין המשתמש:
"${idea}"

צור פרופיל שירות מרכזי (Core Service) שלם, עשיר, ייחודי ומעמיק בעברית רהוטה.
אין צורך לציין אייקונים (המערכת תקצה אייקונים כברירת מחדל).
חובה לכתוב תוכן מגוון, שונה ומובחן לכל סעיף – חל איסור מוחלט על חזרות, העתקות או כפילויות של תוכן בין השדות!

החזר את התשובה אך ורק בפורמט הטקסט המובנה הבא, עם התגיות המדויקות:

===NAME_AND_SLOGAN===
[שם השירות + סלוגן מושך ומדויק]

===SHORT_DESCRIPTION===
[תיאור קצר וקולע ב-1-2 משפטים שמסביר את השירות והתועלת המיידית שלו]

===LONG_DESCRIPTION===
[תיאור ארוך, עשיר ומפורט (4-6 משפטים) עבור אזור התוכן/אודות בעמוד הנחיתה, המספר את סיפור השירות, החוויה והערך העמוק שהוא מעניק]

===PAIN_POINTS===
1. [כותרת קצרה של נקודת כאב 1 שהשירות פותר] | [פירוט מעמיק ב-2 משפטים כיצד השירות פותר את הכאב הזה]
2. [כותרת נקודת כאב שונה 2] | [פירוט מעמיק ב-2 משפטים]
3. [כותרת נקודת כאב שונה 3] | [פירוט מעמיק ב-2 משפטים]
4. [כותרת נקודת כאב שונה 4] | [פירוט מעמיק ב-2 משפטים]
5. [כותרת נקודת כאב שונה 5] | [פירוט מעמיק ב-2 משפטים]
6. [כותרת נקודת כאב שונה 6] | [פירוט מעמיק ב-2 משפטים]

===TARGET_AUDIENCES===
1. [קהל יעד ספציפי 1 לשירות] | [פירוט מעמיק למה השירות מתאים לו ומה התועלת עבורו]
2. [קהל יעד שונה 2] | [פירוט מעמיק]
3. [קהל יעד שונה 3] | [פירוט מעמיק]

===COMPETITIVE_ADVANTAGES===
1. [יתרון תחרותי ייחודי 1 של השירות] | [פירוט המעלה על פני כל חלופה אחרת בשוק]
2. [יתרון תחרותי שונה 2] | [פירוט המעלה]
3. [יתרון תחרותי שונה 3] | [פירוט המעלה]
4. [יתרון תחרותי שונה 4] | [פירוט המעלה]
5. [יתרון תחרותי שונה 5] | [פירוט המעלה]
6. [יתרון תחרותי שונה 6] | [פירוט המעלה]

===FAQS===
1. [שאלה נפוצה 1 בנושא מהות השירות?] | [תשובה מפורטת, מרגיעה ומשכנעת]
2. [שאלה נפוצה 2 בנושא התאמה?] | [תשובה מפורטת]
3. [שאלה נפוצה 3 בנושא מחיר ועלויות?] | [תשובה מפורטת]
4. [שאלה נפוצה 4 בנושא לוחות זמנים?] | [תשובה מפורטת]
5. [שאלה נפוצה 5 בנושא תהליך העבודה?] | [תשובה מפורטת]
6. [שאלה נפוצה 6 בנושא תמיכה ושירות?] | [תשובה מפורטת]
7. [שאלה נפוצה 7 בנושא בידול ממתחרים?] | [תשובה מפורטת]
8. [שאלה נפוצה 8 בנושא אחריות ובטחון?] | [תשובה מפורטת]
9. [שאלה נפוצה 9 בנושא תוצאות צפויות?] | [תשובה מפורטת]
10. [שאלה נפוצה 10 בנושא צעדים ראשונים?] | [תשובה מפורטת]

===SEO===
SLUG: english-seo-slug-for-service
META_TITLE: כותרת מטא לגוגל (עד 60 תווים)
META_DESCRIPTION: תיאור מטא שיווקי לגוגל (עד 160 תווים)
KEYWORDS: מילת מפתח 1, מילת מפתח 2, מילת מפתח 3, מילת מפתח 4
AI_SUMMARY: תמצית ידע עובדתית ב-3 משפטים שמנועי AI יצטטו ישירות לגבי השירות
AI_QUESTIONS: שאלה 1? | שאלה 2? | שאלה 3? | שאלה 4? | שאלה 5?`.trim();

  return { systemContext, userPrompt };
}

/**
 * פרומפט ליצירת חבילות שירות לעסקים (Business Packages) לפי החוזה של BrandEcosystemSection
 */
export function BUILD_BUSINESS_PACKAGES_PROMPT(
  brand: BrandDna
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'אסטרטג פיתוח עסקי וחבילות שירות');
  const userPrompt = `בהתבסס על ה-Brand DNA של "${brand.identity?.companyName || 'המותג'}" וקהלי היעד שלו, הרכב 3 חבילות פתרונות ושירותים מומלצות (Business Packages).
התמקד אך ורק בפתרונות ובתוצאות עבור הלקוח בשפה של המותג.

החזר אך ורק אובייקט JSON תקין עם המבנה המדויק הבא:
{
  "packages": [
    {
      "name": "שם החבילה",
      "description": "תיאור החבילה ומה היא כוללת",
      "painPointsAddressed": "נקודות הכאב המרכזיות שהחבילה פותרת",
      "competitiveAdvantage": "היתרון הייחודי שלנו בפתרון זה",
      "targetAudience": "סוג הלקוח או הקהל האידיאלי לחבילה זו",
      "callToAction": "הצעה והנעה לפעולה מנוסחת היטב"
    }
  ]
}`.trim();

  return { systemContext, userPrompt };
}

/**
 * פרומפט להצעת פריטי אקו-סיסטם חדשים (שירותים, אירועי שיא, קהילות)
 */
export function BUILD_ECOSYSTEM_ITEMS_PROMPT(
  brand: BrandDna,
  category: string,
  currentItems: string[]
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'יועץ פיתוח אקו-סיסטם ושירותים');
  const userPrompt = `בהתבסס על ה-Brand DNA של "${brand.identity?.companyName || 'המותג'}", הצע 3 פריטים חדשים ורלוונטיים ביותר עבור הקטגוריה "${category}".
אל תחזור על פריטים שכבר קיימים: ${currentItems.join(', ') || 'אין עדיין'}.

החזר אך ורק אובייקט JSON תקין במבנה הבא:
{
  "items": ["פריט חדש 1", "פריט חדש 2", "פריט חדש 3"]
}`.trim();

  return { systemContext, userPrompt };
}

/**
 * פרומפט ליצירת פרסונת לקוח חדשה לפי החוזה של TargetAudienceSection
 */
export function BUILD_PERSONA_PROMPT(
  brand: BrandDna
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'חוקר קהלי יעד ופרסונות');
  const existingNames = (brand.audience?.personas || []).map((p) => p.name).join(', ');
  const userPrompt = `בהתבסס על ה-Brand DNA של "${brand.identity?.companyName || 'המותג'}", צור פרסונת לקוח קצה חדשה, אותנטית ומדויקת.
${existingNames ? `אל תחזור על פרסונות קיימות: ${existingNames}` : ''}

החזר אך ורק אובייקט JSON תקין עם השדות הבאים:
{
  "name": "שם הפרסונה וגיל/סטטוס קצר",
  "role": "תפקיד, רקע או פרופיל מאפיין",
  "roleOrProfile": "תפקיד, רקע או פרופיל מאפיין",
  "pain": "נקודת הכאב או הקושי המרכזי שמטריד אותה",
  "mainPain": "נקודת הכאב או הקושי המרכזי שמטריד אותה",
  "dream": "תוצאת החלום והשינוי שהיא מבקשת להשיג",
  "dreamOutcome": "תוצאת החלום והשינוי שהיא מבקשת להשיג"
}`.trim();

  return { systemContext, userPrompt };
}

/**
 * פרומפט ליצירת התנגדות לקוח ומענה מנצח לפי החוזה של TargetAudienceSection
 */
export function BUILD_OBJECTION_PROMPT(
  brand: BrandDna
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'מומחה מכירות וטיפול בהתנגדויות');
  const existingObj = (brand.audience?.commonObjections || []).map((o) => o.objection).join(' | ');
  const userPrompt = `בהתבסס על ה-Brand DNA של "${brand.identity?.companyName || 'המותג'}", צור התנגדות או חשש נפוץ של לקוח מתעניין, לצד מענה מרגיע, אמין ומשכנע בשפת המותג.
${existingObj ? `אל תחזור על התנגדויות קיימות: ${existingObj}` : ''}

החזר אך ורק אובייקט JSON תקין עם השדות הבאים:
{
  "objection": "החשש או ההתנגדות של הלקוח בגוף ראשון",
  "rebuttal": "המענה המשכנע והמרגיע של המותג"
}`.trim();

  return { systemContext, userPrompt };
}

/**
 * פרומפט לסוכן מחקר שוק ומתחרים לפי החוזה של MarketResearchAgentSection
 */
export function BUILD_MARKET_RESEARCH_PROMPT(
  brand: BrandDna
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'אנליסט מחקר שוק ואסטרטגיה תחרותית');
  const userPrompt = `בצע ניתוח שוק, מגמות ומתחרים מעמיק בעברית עבור המותג "${brand.identity?.companyName || 'המותג'}" (${brand.identity?.organizationPurpose || ''}).

החזר אך ורק אובייקט JSON תקין עם המבנה המדויק הבא:
{
  "marketTrends": ["מגמה 1 בשוק", "מגמה 2 בשוק", "מגמה 3 בשוק"],
  "competitors": [
    { "name": "סוג/שם מתחרה 1", "strengths": "נקודות חוזק", "weaknesses": "פערים וחולשות", "pricingTier": "גבוה / בינוני / נמוך" },
    { "name": "סוג/שם מתחרה 2", "strengths": "נקודות חוזק", "weaknesses": "פערים וחולשות", "pricingTier": "גבוה / בינוני / נמוך" }
  ],
  "competitiveness": "פסקה המנתחת את היתרון התחרותי שלנו ואת הפערים בשוק שנוכל למנף",
  "pricingRecommendations": "פסקה עם המלצות תמחור אסטרטגיות בהתאם להצעת הערך שלנו",
  "designLanguageRecommendations": "פסקה עם המלצות לשפה עיצובית, צבעים ואווירה כדי לבלוט בשוק",
  "actionableUpdates": {
    "slogan": "הצעה לסלוגן משודרג ומדויק",
    "primaryColor": "${brand.designTokens?.primaryColor || '#6366f1'}",
    "newService": "הצעה לשירות חדש שכדאי להוסיף לאקו-סיסטם"
  }
}`.trim();

  return { systemContext, userPrompt };
}

