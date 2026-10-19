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

  // שאיבת כל האקוסיסטם המלא של הטננט (שירותים, מוצרי דגל, קהילות, אמון)
  const services = (brand.ecosystem?.services || [])
    .map((s: any) =>
      typeof s === 'string'
        ? s
        : `${s?.nameAndSlogan || ''}: ${s?.shortDescription || ''} (מענה: ${s?.painPointSolved || ''}, בידול: ${s?.competitiveAdvantage || ''})`
    )
    .filter(Boolean)
    .join(' | ');

  const products = (brand.ecosystem?.products || [])
    .map((p: any) =>
      typeof p === 'string'
        ? p
        : `${p?.name || ''}: ${p?.shortDescription || ''} (מחיר: ${p?.price || ''})`
    )
    .filter(Boolean)
    .join(' | ');

  const communities = (brand.ecosystem?.communities || [])
    .map((c: any) => (typeof c === 'string' ? c : c?.name || ''))
    .filter(Boolean)
    .join(' | ');

  const events = (brand.ecosystem?.annualEvents || [])
    .map((e: any) => (typeof e === 'string' ? e : e?.name || ''))
    .filter(Boolean)
    .join(' | ');

  const trust = [
    brand.trust?.refundPolicySummary ? `מדיניות החזר: ${brand.trust.refundPolicySummary}` : '',
    brand.trust?.securityBadgeText ? `אבטחה: ${brand.trust.securityBadgeText}` : '',
    brand.trust?.officeAddress ? `כתובת: ${brand.trust.officeAddress}` : '',
    brand.trust?.contactPhone ? `טלפון: ${brand.trust.contactPhone}` : '',
  ].filter(Boolean).join('; ');

  return `חבר פסקת תמצית מותג (Brand Essence) דחוסה, עמוקה ומנוסחת ברמת קופירייטינג עילית.
פסקת תמצית זו מהווה "מועט המחזיק את המרובה" – עליה לכלול בצורה חכמה ומלוכדת את כל נתוני המותג והאקוסיסטם של הארגון מבלי להחסיר אף נתון ליבה.

נתוני המותג המלאים מקולקציית הטננט:
- שם המותג: ${name}
- תכלית ומהות הארגון: ${purpose}
- סלוגן מוביל: ${slogan}
- בידול שוק ו-UVP: ${uvp}
- חזון עסקי: ${vision}
- קהלי יעד מרכזיים: ${audiences}
- אישיות וטון הדיבור: ${tone}
- מילות עוצמה וערכי ליבה: ${powers}
- פרסונות לקוח: ${personas || 'קהל לקוחות מגוון'}
- התנגדויות ומענה המותג: ${objections || 'מענה מלא ושקט נפשי'}
- שירותים מרכזיים ומעטפת הפעילות: ${services || 'מגוון שירותי פרימיום'}
- מוצרי דגל וחבילות: ${products || 'פתרונות מובילים'}
- קהילות ואירועים: ${[communities, events].filter(Boolean).join(' | ') || 'פעילות קהילתית ענפה'}
- עקרונות אמון וביטחון: ${trust || 'אמינות ושקיפות מלאה'}

כללי חובה:
1. אורך מדויק: בין 250 ל-300 מילים בלבד! (לא פחות מ-250 ולא יותר מ-300 מילים).
2. הכללה חכמה: שלב בטבעיות את כל נתוני הליבה (השירותים, המוצרים, הכאבים, הקהלים והבידול) לתוך נרטיב קולח ומהודק, מבלי להשמיט שום תחום פעילות.
3. סגנון: קופירייטינג מעצים, רהוט, בעל סמכות מקצועית וחמימות, ללא קלישאות חלולות.
4. מבנה: פסקה רציפה ומלוכדת (עד 2 פסקאות קצרות) ללא כותרות ביניים.

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
export function BUILD_BRAND_SYSTEM_CONTEXT(brand: BrandDna, moduleRole: string = 'אסטרטג מותג, מומחה SEO/AIO וקופירייטר בכיר'): string {
  const { identity, voice, audience, trust } = brand;
  const company = identity?.companyName || 'העסק';
  const summary = brand.brandSummaryParagraph?.trim() || generateDeterministicBrandSummary(brand);
  const purpose = identity?.organizationPurpose || '';
  const slogan = identity?.slogan || '';
  const vision = identity?.companyVision || identity?.shortVision || '';
  const uvp = audience?.mainUvp || '';
  const audiences = (audience?.targetAudiences || []).join(', ');
  const personas = (audience?.personas || []).map((p) => `${p.name} (כאב: ${p.mainPain}, יעד: ${p.dreamOutcome})`).join('; ');

  const isFemale = voice?.genderAddressing === 'female';
  const addressingInstruction = isFemale
    ? 'פנייה מגדרית קריטית: חובה לכתוב בפנייה ישירה ומעצימה בלשון נקבה בלבד (נשים, אחיות, גלי, תוכלי, עבורך, בואי, מרחב נשי) בחמימות, אמפתיה וכבוד עמוק.'
    : voice?.genderAddressing === 'male'
      ? 'פנייה מגדרית: פנייה בלשון זכר.'
      : 'פנייה מגדרית: לשון רבים/פנייה משולבת ומכבדת.';

  const personalityInfo = voice?.personality
    ? `מדדי אישיות המותג: רשמיות ${voice.personality.formality}/5, חמימות ${voice.personality.warmth}/5, יוקרה ${voice.personality.luxury}/5, אנרגיה ${voice.personality.energy}/5.`
    : '';

  const sectorInfo = voice?.sectorCompliance && voice.sectorCompliance !== 'general'
    ? `רגישות מגזרית/ערכית: ${voice.sectorCompliance}.`
    : voice?.shabbatObservant
      ? 'רגישות מגזרית: שמירת שבת ומסורת ישראל, כבוד לעולם התורה והערכים היהודיים.'
      : '';

  return [
    `אתה פועל בתפקיד "${moduleRole}" עבור המותג "${company}".`,
    `תמצית המותג והחזון (Brand Essence):`,
    summary,
    purpose ? `תכלית ויעוד הארגון: ${purpose}` : '',
    slogan ? `סלוגן רשמי: "${slogan}"` : '',
    vision ? `חזון מעמיק: ${vision}` : '',
    uvp ? `הצעת ערך ייחודית (UVP): ${uvp}` : '',
    audiences ? `קהלי יעד מוגדרים: ${audiences}` : '',
    personas ? `פרסונות ליבה: ${personas}` : '',
    addressingInstruction,
    personalityInfo,
    sectorInfo,
    voice?.powerWords?.length ? `מילות עוצמה ומפתח חובה לשילוב טבעי: ${voice.powerWords.join(', ')}.` : '',
    voice?.forbiddenWords?.length ? `מילים וביטויים אסורים לשימוש: ${voice.forbiddenWords.join(', ')}.` : '',
    `\nדגש איכות עליון - קופירייטינג בטוב טעם (Taste & Brand Distinction):`,
    `1. כל כותרת, תגית, משפט ותיאור חייבים להיות מנוסחים בעברית רהוטה, עשירה ומעוררת השראה, התואמת ב-100% את רוח המותג ואת הגדרות המיתוג שלו.`,
    `2. איסור מוחלט על כותרות גנריות, מכניות ומנוכרות!`,
    `   - חל איסור מוחלט להשתמש בקלישאות שחוקות כמו: "למה לבחור בנו?", "היתרונות והמעלות של השירות", "היתרונות והמעלות של המוצר", "נקודות הכאב שלנו", "קהלי היעד שלנו", "מוצר מנצח", "חבילה מובילה".`,
    `   - במקום זאת, נסח כותרות ותגיות מלאות נשמה, יופי, בידול וחיבור אנושי המשקפות בטוב טעם את השליחות של ${company}.`,
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

===SECTION_HEADINGS===
ABOUT_SUBTITLE: [תגית/סאב-טייטל מעודן לאזור האודות, לדוגמה: "מפגש חי עם פנימיות התורה" או "החיבור הפנימי שלך"]
ABOUT_HEADING: [כותרת ראשית מעצימה לאזור האודות, לדוגמה: "לצלול אל מעיינות החכמה והנפש"]
PAIN_POINTS_SUBTITLE: [תגית מעודנת לאזור האתגרים והמענה, לדוגמה: "עוגן בתוך שגרת החול" או "מענה לעומס היומיומי"]
PAIN_POINTS_HEADING: [כותרת ראשית חמה ומלאת אמפתיה, ללא המילים 'נקודות כאב', לדוגמה: "האתגרים שאנו פוגשות ופותרות יחד"]
TARGET_AUDIENCES_SUBTITLE: [תגית מזמינה לאזור ההתאמה, לדוגמה: "המרחב שמחכה לך"]
TARGET_AUDIENCES_HEADING: [כותרת ראשית מחבקת לקהל היעד, לדוגמה: "למי נתפר המסע הייחודי הזה?"]
ADVANTAGES_SUBTITLE: [תגית יוקרתית ומעודנת (חל איסור מוחלט על 'למה לבחור בנו?'), לדוגמה: "הבשורה שלנו עבורך" או "עוגנים של שקט וביטחון"]
ADVANTAGES_HEADING: [כותרת ראשית מעצימה ומנוסחת בטוב טעם (חל איסור מוחלט על 'היתרונות והמעלות של השירות/המוצר'), לדוגמה: "המעלות והעוצמה הייחודית של המרחב שלנו"]
FAQ_SUBTITLE: [תגית לאזור השאלות, לדוגמה: "בגובה העיניים וברוגע"]
FAQ_HEADING: [כותרת ראשית לאזור השאלות והתשובות, לדוגמה: "כל מה שחשוב לך לדעת לקראת היציאה לדרך"]
CONTACT_SUBTITLE: [תגית לאזור יצירת הקשר, לדוגמה: "צעד ראשון של התחדשות"]
CONTACT_HEADING: [כותרת ראשית מזמינה ומחבקת, לדוגמה: "מוזמנת לפתוח דלת וליצור איתנו קשר אישי"]

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
SLUG: [סלאג קצר ותמציתי באנגלית באותיות קטנות בלבד המייצג את המוצר בלבד כגון smart-crm, ללא שם החברה וללא שום קידומת]
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

===SECTION_HEADINGS===
ABOUT_SUBTITLE: [תגית/סאב-טייטל מעודן לאזור האודות, לדוגמה: "מפגש חי עם פנימיות התורה" או "החיבור הפנימי שלך"]
ABOUT_HEADING: [כותרת ראשית מעצימה לאזור האודות, לדוגמה: "לצלול אל מעיינות החכמה והנפש"]
PAIN_POINTS_SUBTITLE: [תגית מעודנת לאזור האתגרים והמענה, לדוגמה: "עוגן בתוך שגרת החול" או "מענה לעומס היומיומי"]
PAIN_POINTS_HEADING: [כותרת ראשית חמה ומלאת אמפתיה, ללא המילים 'נקודות כאב', לדוגמה: "האתגרים שאנו פוגשות ופותרות יחד"]
TARGET_AUDIENCES_SUBTITLE: [תגית מזמינה לאזור ההתאמה, לדוגמה: "המרחב שמחכה לך"]
TARGET_AUDIENCES_HEADING: [כותרת ראשית מחבקת לקהל היעד, לדוגמה: "למי נתפר המסע הייחודי הזה?"]
ADVANTAGES_SUBTITLE: [תגית יוקרתית ומעודנת (חל איסור מוחלט על 'למה לבחור בנו?'), לדוגמה: "הבשורה שלנו עבורך" או "עוגנים של שקט וביטחון"]
ADVANTAGES_HEADING: [כותרת ראשית מעצימה ומנוסחת בטוב טעם (חל איסור מוחלט על 'היתרונות והמעלות של השירות/המוצר'), לדוגמה: "המעלות והעוצמה הייחודית של המרחב שלנו"]
FAQ_SUBTITLE: [תגית לאזור השאלות, לדוגמה: "בגובה העיניים וברוגע"]
FAQ_HEADING: [כותרת ראשית לאזור השאלות והתשובות, לדוגמה: "כל מה שחשוב לך לדעת לקראת היציאה לדרך"]
CONTACT_SUBTITLE: [תגית לאזור יצירת הקשר, לדוגמה: "צעד ראשון של התחדשות"]
CONTACT_HEADING: [כותרת ראשית מזמינה ומחבקת, לדוגמה: "מוזמנת לפתוח דלת וליצור איתנו קשר אישי"]

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
SLUG: [סלאג קצר ותמציתי באנגלית באותיות קטנות בלבד המייצג את השירות בלבד כגון executive-concierge, ללא שם החברה וללא שום קידומת]
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

/**
 * פרומפט לגזירה וחישוב של קהלי יעד, הצעת ערך (UVP), פרסונות והתנגדויות מתוך פסקת תמצית המותג (Brand Essence)
 */
export function BUILD_AUDIENCE_AND_PERSONAS_FROM_ESSENCE_PROMPT(
  brand: BrandDna
): { systemContext: string; userPrompt: string } {
  const systemContext = BUILD_BRAND_SYSTEM_CONTEXT(brand, 'אסטרטג שיווק, פילוח קהלים ופסיכולוגיית צרכנים');
  const essence = brand.brandSummaryParagraph || brand.identity.companyVision || brand.identity.organizationPurpose || '';
  const company = brand.identity.companyName || 'המותג';

  const userPrompt = `נתח לעומק את פסקת תמצית המותג (Brand Essence) ואת כלל נתוני המותג של "${company}", וגזור מתוכם אפיון מלא ומנצח עבור:
1. הצעת ערך ייחודית (UVP) חדה, משכנעת ובלתי ניתנת לערעור.
2. 3 עד 5 קהלי יעד ראשיים (סגמנטים ברורים וספציפיים).
3. 2 עד 3 פרסונות לקוח מפורטות ועמוקות (שם ופרופיל, תפקיד/רקע, כאב מרכזי שמשאיר אותו ער בלילה, והתוצאה החלומית שתגרום לו להרגיש הצלחה מוחלטת).
4. 3 עד 4 התנגדויות או חששות נפוצים של לקוחות, לצד מענה מרגיע, סמכותי ומשכנע בשפת המותג.

פסקת תמצית המותג (Brand Essence):
"${essence}"

מהות, תכלית וסלוגן:
${brand.identity.organizationPurpose || ''} | ${brand.identity.slogan || ''}

החזר אך ורק אובייקט JSON תקין במבנה הבא:
{
  "mainUvp": "הצעת ערך ייחודית מנצחת...",
  "targetAudiences": ["קהל 1", "קהל 2", "קהל 3"],
  "personas": [
    {
      "name": "שם ופרופיל הפרסונה (לדוגמה: יעל, מנהלת שיווק בעמותה)",
      "roleOrProfile": "תפקיד או רקע קצר",
      "mainPain": "הכאב או האתגר המרכזי שמשאיר אותה ערה בלילה",
      "dreamOutcome": "התוצאה החלומית שתגרום לה להרגיש ניצחון מוחלט"
    }
  ],
  "commonObjections": [
    {
      "objection": "החשש או השאלה של הלקוח בגוף ראשון",
      "rebuttal": "המענה המרגיע, המוסמך והמשכנע של המותג"
    }
  ]
}`.trim();

  return { systemContext, userPrompt };
}




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
  const tone = `${brand.voice?.personality?.formality || 3}/5 רשמיות, ${brand.voice?.personality?.warmth || 4}/5 חמימות, ${brand.voice?.personality?.energy || 4}/5 אנרגיה`;
  const powerWords = (brand.voice?.powerWords || []).join(', ');

  const genderInstructions = gender === 'female'
    ? 'לשון נקבה יחיד בלבד ("את מוזמנת", "בואי נתחיל", "השאירי פרטים", "דברי איתנו", "שמך המלא")'
    : gender === 'male'
    ? 'לשון זכר יחיד בלבד ("אתה מוזמן", "בוא נתחיל", "השאר פרטים", "דבר איתנו")'
    : 'לשון רבים ("אתם מוזמנים", "בואו נתחיל", "השאירו פרטים", "צרו קשר")';

  const userPrompt = `צור ערכת מיקרו-קופי ושפת ממשק משתמש (Brand UI Vocabulary) מנצחת ומדויקת להפליא עבור המותג "${name}".

נתוני המיתוג של הטננט:
- שם המותג: ${name}
- סלוגן: ${slogan}
- מהות הארגון / תחום פעילות: ${purpose}
- הצעת ערך ייחודית (UVP): ${uvp}
- פנייה מגדרית נדרשת: ${genderInstructions}
- מגזר / תאימות תרבותית: ${sector}
- טמפרמנט וטון: ${tone}
- מילות כוח וערכים מובילים: ${powerWords || 'איכות, מקצוענות, שקט נפשי'}

הנחיות קריטיות:
1. התאמה קפדנית ללשון הפנייה (${genderInstructions}) - אסור בשום אופן לפנות בלשון זכר כאשר הוגדרה פנייה נשית!
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
  },
  "categoryTitles": {
    "articles": "שם ייחודי ומזמין למרכז המאמרים והידע בשפת המותג",
    "events": "שם לקטגוריית הכנסים, הסדנאות והאירועים",
    "courses": "שם לקורסים, ההכשרות או מסלולי הלימוד",
    "videos": "שם לפודקאסט, ערוץ הוידאו או השידורים החיים",
    "community": "שם לקהילה, מועדון החברים או מרחב השותפים",
    "services": "שם לקטלוג השירותים והפתרונות המקצועיים",
    "posts": "שם למאגר הפוסטים והעדכונים השוטפים",
    "fundraising": "שם לקמפיינים, גיוס תרומות ושותפות",
    "checkout": "שם לחנות, המוצרים ומרכז הרכישה"
  },
  "categoryDescriptions": {
    "articles": "תיאור קצר ומסקרן בשפת המותג לעולם המאמרים והתוכן",
    "events": "תיאור קצר לאירועים ולמפגשים הקרובים",
    "courses": "תיאור קצר למסלולי ההכשרה והקורסים",
    "videos": "תיאור קצר לפודקאסטים ולסרטונים",
    "community": "תיאור קצר להטבות הקהילה ולמעגלי השיח",
    "services": "תיאור קצר למעטפת השירותים והפתרונות",
    "posts": "תיאור קצר לפוסטים ולעדכונים",
    "fundraising": "תיאור קצר לעשייה ולשותפות הקהילתית",
    "checkout": "תיאור קצר לרכישה מאובטחת של מוצרים וחבילות"
  }
}`.trim();

  return { systemContext, userPrompt };
}
