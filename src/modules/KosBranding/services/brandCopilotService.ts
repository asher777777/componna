import { BrandDna } from '../types/brandDna';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import {
  dispatchBrandSummaryParagraphToKosai,
  dispatchBrandDiscoveryToKosai,
  dispatchBrandRephraseToKosai,
  dispatchStepAssistanceToKosai,
  dispatchContentStrategiesToKosai,
  dispatchEntityItemToKosai,
} from '../kosai/promptToKosai';
import { buildBrandSystemContext } from '../prompts';

export { buildBrandSystemContext };

export interface StepAiSuggestion {
  title: string;
  value: any;
  subtitle?: string;
  rationale?: string;
  isRecommended?: boolean;
}

export interface StepAiAssistanceResult {
  success: boolean;
  suggestions: StepAiSuggestion[];
  recommendedIndex: number;
  recommendationReason: string;
  smartInsight?: string;
  isLiveAi?: boolean;
  liveModel?: string;
  error?: string;
}

export function resolveGeminiApiKey(providedKey?: string): string {
  if (providedKey && providedKey.trim()) return providedKey.trim();
  return getModuleGeminiKey('KosBranding');
}

export const AUTHORIZED_BRAND_MODEL = 'gemini-3.8-flash-lite';
export const NOT_IN_BASKET_MESSAGE = 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.';

/**
 * מפיק פסקת תמצית מותג דחוסה ומרוכזת (250-300 מילים - "מועט המחזיק את המרובה") מתוך קולקציית המיתוג
 */
export async function generateBrandSummaryParagraph(
  brand: BrandDna,
  apiKey?: string
): Promise<{ success: boolean; paragraph: string; wordCount: number; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const res = await dispatchBrandSummaryParagraphToKosai(brand, { apiKey: activeKey });
    if (res && res.summaryParagraph) {
      return {
        success: true,
        paragraph: res.summaryParagraph,
        wordCount: res.wordCount || res.summaryParagraph.trim().split(/\s+/).length,
      };
    }
  } catch (err: any) {
    console.warn('[brandCopilotService] KOSAI summary paragraph failed, using heuristic fallback:', err);
  }

  // מנגנון חלופי דחוס מקומי באפס טוקנים (Zero-Token Heuristic Paragraph Engine)
  const company = brand.identity.companyName || 'העסק המוביל';
  const purpose = brand.identity.organizationPurpose || 'מתן שירותים ופתרונות מקצועיים מקיפים';
  const slogan = brand.identity.slogan || 'איכות, מקצוענות וצמיחה מתמדת';
  const uvp = brand.audience.mainUvp || 'מעטפת שירות אישית וחדשנית המעניקה שקט נפשי מלא ותוצאות מוכחות';
  const audiences = (brand.audience.targetAudiences || []).join(', ') || 'עסקים ולקוחות פרטיים';
  const powerWords = (brand.voice.powerWords || []).join(', ') || 'אמינות, מקצוענות, תוצאות';

  const fallbackText = `${company} פועלת מתוך שליחות עסקית ברורה ובלתי מתפשרת להוביל את תחום ה${purpose}, תוך הצבת סטנדרט חדש של איכות, אמינות וחדשנות דיגיטלית מתקדמת. תחת המוטו המוביל "${slogan}", המותג מבסס את מעמדו כשותף אסטרטגי מהימן עבור ${audiences}, המבקשים לא רק מענה מקצועי נקודתי אלא מעטפת שלמה ומדויקת המעניקה שקט נפשי מלא ותוצאות מוחשיות לאורך זמן. הצעת הערך הייחודית של המותג (UVP) מתמקדת ב${uvp}, המשלבת מומחיות מעמיקה, יחס אישי בלתי אמצעי ותהליכי עבודה מהירים וסדורים המבטיחים ביצוע ללא פשרות. שפת המותג מעוגנת בערכי ליבה של ${powerWords}, ומאופיינת בדיאלוג ישיר, בגובה העיניים, המשלב סמכות מקצועית בלתי מעורערת לצד חמימות ונגישות אנושית מקרבת. במציאות דיגיטלית המשתנה בקצב מהיר, ${company} מחויבת להעניק לכל לקוח ושותף דרך חוויית שירות הוליסטית, המשלבת טכנולוגיה חכמה עם ליווי אנושי מוקפד, המייצרת ביטחון מוחלט ומובילה לצמיחה עסקית מתמדת. המותג מנטרל מראש כל חשש באמצעות שקיפות מלאה, מדיניות אחריות מחמירה ומחויבות בלתי מתפשרת להצלחת הלקוח בכל נקודת מגע לאורך המסע המשותף. שילוב זה של ראייה רחבה, ביצוע מדויק ותפיסה שיווקית מתקדמת הופך את ${company} לבחירה הטבעית והמובילה בשוק עבור אלו שאינם מתפשרים על פחות מהטוב ביותר.`;

  const wordCount = fallbackText.trim().split(/\s+/).length;

  return {
    success: true,
    paragraph: fallbackText,
    wordCount,
  };
}

/**
 * שכתוב טקסט לפי שפת המותג
 */
export async function rephraseTextWithBrandAi(
  originalText: string,
  apiKey: string,
  brand: BrandDna,
  customInstructions?: string
): Promise<{ success: boolean; text?: string; modelUsed?: string; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const text = await dispatchBrandRephraseToKosai(originalText, brand, customInstructions, { apiKey: activeKey });
    return {
      success: true,
      text,
      modelUsed: AUTHORIZED_BRAND_MODEL,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || NOT_IN_BASKET_MESSAGE,
    };
  }
}

/**
 * חילוץ Brand DNA מלא מתמלול ראיון
 */
export async function generateBrandDnaFromInterview(
  interviewNotes: string,
  apiKey?: string
): Promise<{ success: boolean; brandDna?: Partial<BrandDna>; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const brandDna = await dispatchBrandDiscoveryToKosai(interviewNotes, { apiKey: activeKey });
    return {
      success: true,
      brandDna,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || NOT_IN_BASKET_MESSAGE,
    };
  }
}

/**
 * סיוע מותאם לשלב בשאלון המיתוג
 */
export async function generateStepAiAssistance(
  stepId: string,
  brand: BrandDna,
  userDraft?: string,
  apiKey?: string
): Promise<StepAiAssistanceResult> {
  const activeKey = resolveGeminiApiKey(apiKey);
  if (!activeKey) {
    return generateSmartFallbackSuggestions(stepId, brand, userDraft);
  }

  try {
    const data = await dispatchStepAssistanceToKosai(stepId, brand, userDraft, { apiKey: activeKey });
    if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      return {
        success: true,
        suggestions: data.suggestions,
        recommendedIndex: data.recommendedIndex ?? 0,
        recommendationReason: data.recommendationReason || 'הצעה זו מדויקת ומתאימה ביותר לפרופיל המותג.',
        smartInsight: data.smartInsight,
        isLiveAi: true,
        liveModel: AUTHORIZED_BRAND_MODEL,
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] Step assistance live AI failed, falling back:', err);
  }

  return generateSmartFallbackSuggestions(stepId, brand, userDraft);
}

/**
 * יצירת אסטרטגיות תוכן (עמודי שירות ומכירה)
 */
export async function generateBrandContentStrategies(
  brand: BrandDna,
  apiKey?: string
): Promise<{ success: boolean; strategies: any[]; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const strategies = await dispatchContentStrategiesToKosai(brand, { apiKey: activeKey });
    if (Array.isArray(strategies) && strategies.length > 0) {
      return {
        success: true,
        strategies,
      };
    }
  } catch (err: any) {
    console.warn('[brandCopilotService] Content strategies live AI failed, falling back:', err);
  }

  // Fallback strategies
  const company = brand.identity.companyName || 'העסק';
  const fallbackStrategies = [
    {
      id: 'strat_service',
      type: 'service_page',
      title: `עמוד שירות וסמכות - ${company}`,
      targetAudience: brand.audience.targetAudiences[0] || 'לקוחות איכותיים',
      heroHeadline: `פתרונות מקצועיים ומוכחים מבית ${company}`,
      heroSubheadline: brand.audience.mainUvp || 'מעטפת מקצועית מלאה ושקט נפשי מתמיד',
      coreValuePoints: ['אמינות וניסיון מוכח', 'ליווי אישי מקצה לקצה', 'תוצאות ממוקדות מטרה'],
      callToAction: 'לתיאום שיחת היכרות וייעוץ',
      objectionKiller: 'ללא התחייבות מראש, עם אחריות מלאה על שביעות הרצון.',
      persuasiveClosing: 'הצטרף למעגל הלקוחות המרוצים שלנו עוד היום.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'strat_sales',
      type: 'sales_page',
      title: `עמוד מכירה והשקה - ${company}`,
      targetAudience: brand.audience.targetAudiences[0] || 'רוכשים ישירים',
      heroHeadline: `קבל גישה מלאה לשירותי ${company} בתנאי השקה בלעדיים`,
      heroSubheadline: 'הזדמנות מוגבלת לשדרג את העסק שלך עם תוצאות מיידיות',
      coreValuePoints: ['מחיר השקה מיוחד', 'מענה מהיר ומיידי', 'ערך מוסף ללא תחרות'],
      callToAction: 'הבטח את מקומך עכשיו',
      pricingHook: 'הנחה מיוחדת לנרשמים השבוע בלבד',
      objectionKiller: 'אחריות החזר כספי מלאה במידה ואינך מרוצה.',
      persuasiveClosing: 'המבצע לזמן מוגבל - הבטח את מקומך כעת.',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    success: true,
    strategies: fallbackStrategies,
  };
}

/**
 * יצירת פרסונה בודדת מותאמת ל-DNA
 */
export async function generateAiPersona(brand: BrandDna, apiKey?: string): Promise<any> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const prompt = `צור פרסונת לקוח מדויקת עבור ${brand.identity.companyName} (${brand.identity.organizationPurpose}).
החזר JSON בלבד:
{"id":"p_${Date.now()}","name":"שם מלא","roleOrProfile":"תפקיד או רקע","mainPain":"כאב מרכזי","dreamOutcome":"תוצאת חלום"}`;

  try {
    return await dispatchEntityItemToKosai(prompt, { apiKey: activeKey });
  } catch {
    return {
      id: `p_${Date.now()}`,
      name: 'דניאל, בעל עסק',
      roleOrProfile: 'מחפש פתרון אמין ומהיר לחסכון בזמן',
      mainPain: 'חוסר בזמן ועומס במשימות שגרתיות',
      dreamOutcome: 'מערכת מסודרת שמעניקה שקט נפשי מלא',
    };
  }
}

/**
 * יצירת התנגדות ומענה מותאם
 */
export async function generateAiObjection(brand: BrandDna, apiKey?: string): Promise<any> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const prompt = `צור התנגדות לקוח נפוצה ומענה משכנע עבור ${brand.identity.companyName}.
החזר JSON בלבד:
{"id":"o_${Date.now()}","objection":"החשש או השאלה","rebuttal":"המענה המרגיע והמשכנע של המותג"}`;

  try {
    return await dispatchEntityItemToKosai(prompt, { apiKey: activeKey });
  } catch {
    return {
      id: `o_${Date.now()}`,
      objection: 'האם השירות באמת מתאים לעסק בסדר הגודל שלי?',
      rebuttal: 'המערכת והשירות מודולריים ומותאמים אישית החל מעסקים קטנים ועד חברות גדולות.',
    };
  }
}

/**
 * יצירת מוצר דגל מותאם למותג
 */
export async function generateAiFlagshipProduct(idea: string, brand: BrandDna, apiKey?: string): Promise<any> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const prompt = `צור כרטיס מוצר דגל מוביל עבור ${brand.identity.companyName}.
רעיון בסיסי: ${idea || brand.identity.organizationPurpose}
החזר JSON בלבד:
{"title":"שם המוצר","subtitle":"תת כותרת משכנעת","description":"תיאור קצר וממיר","price":990,"benefits":["יתרון 1","יתרון 2","יתרון 3"]}`;

  try {
    return await dispatchEntityItemToKosai(prompt, { apiKey: activeKey });
  } catch {
    return {
      title: 'חבילת הדגל המנצחת',
      subtitle: 'מעטפת שלמה להשגת תוצאות מהירות',
      description: `המוצר המוביל של ${brand.identity.companyName} הכולל יישום מלא ותמיכה אישית.`,
      price: 1500,
      benefits: ['הטמעה מהירה', 'ליווי אישי מומחה', 'תוצאות מובטחות'],
    };
  }
}

/**
 * יצירת חבילות עסקיות מומלצות
 */
export async function generateAiBusinessPackages(brand: BrandDna, apiKey?: string): Promise<any[]> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const prompt = `צור 3 חבילות שירות (בסיס, מתקדם, VIP) עבור ${brand.identity.companyName}.
החזר מערך JSON בלבד:
[
  {"name":"חבילת פתיחה","price":490,"features":["תכונה 1","תכונה 2"],"recommended":false},
  {"name":"חבילת צמיחה Pro","price":990,"features":["תכונה 1","תכונה 2","תכונה 3"],"recommended":true},
  {"name":"מעטפת VIP מלאה","price":1990,"features":["תכונה 1","תכונה 2","תכונה 3","תכונה 4"],"recommended":false}
]`;

  try {
    return await dispatchEntityItemToKosai(prompt, { apiKey: activeKey });
  } catch {
    return [
      { name: 'בסיס', price: 490, features: ['שירות בסיסי', 'תמיכה באימייל'], recommended: false },
      { name: 'פרו מומלץ', price: 990, features: ['כל תכונות הבסיס', 'מענה בוואטסאפ', 'עדכונים שוטפים'], recommended: true },
      { name: 'VIP מותאם', price: 1990, features: ['מעטפת מלאה', 'זמינות גבוהה', 'ליווי אישי מותאם'], recommended: false },
    ];
  }
}

/**
 * יצירת פריטי אקו-סיסטם
 */
export async function generateAiEcosystemItems(
  brand: BrandDna,
  category: string,
  currentItems: string[],
  apiKey?: string
): Promise<string[]> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const prompt = `הצע 3 פריטים נוספים לקטגוריה "${category}" עבור המותג ${brand.identity.companyName}.
פריטים קיימים: ${currentItems.join(', ')}
החזר מערך JSON של מחרוזות בלבד: ["פריט 1", "פריט 2", "פריט 3"]`;

  try {
    const res = await dispatchEntityItemToKosai(prompt, { apiKey: activeKey });
    if (Array.isArray(res)) return res;
  } catch {}

  return ['פתרון דיגיטלי מתקדם', 'שירות ליווי מותאם אישית', 'מערך הדרכה והכשרה'];
}

/**
 * הרצת סוכן חקר שוק
 */
export async function runMarketResearchAgent(brand: BrandDna, apiKey?: string): Promise<any> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const prompt = `בצע ניתוח שוק ותחרות תמציתי עבור ${brand.identity.companyName} (${brand.identity.organizationPurpose}).
החזר JSON בלבד:
{
  "marketTrends": ["מגמה 1", "מגמה 2"],
  "competitorGaps": ["פער 1 בתחרות שניתן לנצל", "פער 2"],
  "recommendedAction": "ההמלצה החמה ביותר לצמיחה בחודש הקרוב"
}`;

  try {
    return await dispatchEntityItemToKosai(prompt, { apiKey: activeKey });
  } catch {
    return {
      marketTrends: ['עלייה בביקוש לפתרונות מהירים ואוטומטיים', 'חשיבות עליונה לחוויית שירות אישית'],
      competitorGaps: ['רוב המתחרים אינם מציעים ליווי היברידי (טכנולוגי + אנושי)', 'חוסר בשקיפות ומחירים ברורים'],
      recommendedAction: 'הדגש את המעטפת השלמה ואת המענה האנושי המהיר כבידול מובהק.',
    };
  }
}

/**
 * סריקת מותג מתוך אתר או קישור
 */
export async function scrapeBrandFromUrlOrSocial(
  targetUrl: string,
  apiKey?: string
): Promise<{
  success: boolean;
  extractedBrand?: Partial<BrandDna>;
  positioningQuestions?: string[];
  summary?: string;
  error?: string;
}> {
  const activeKey = resolveGeminiApiKey(apiKey);
  if (!targetUrl || !targetUrl.trim()) {
    return { success: false, error: 'יש להזין כתובת אתר או קישור לפייסבוק' };
  }

  const cleanUrl = targetUrl.trim();
  const domainGuess = cleanUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[\/?#]/)[0];

  const prompt = `אתה מומחה חילוץ מותג וסורק תוכן דיגיטלי.
קיבלת קישור לאתר אינטרנט או עמוד פייסבוק עסקי:
כתובת URL: "${cleanUrl}"

אנא נתח את מהות העסק המיוצגת בקישור זה, את תחום הפעילות וההקשר העסקי, וחלץ:
1. נתוני Brand DNA משוערכים (שם, תכלית, סלוגן, חזון, טון דיבור, מילות כוח, קהלי יעד, והצעת ערך ייחודית UVP).
2. 3 שאלות מיצוב חדות וממוקדות שיעזרו לבעל העסק לחדד את המיתוג שלו במערכת.
3. סיכום תמציתי של מהות המותג שזוהתה.

החזר אך ורק אובייקט JSON תקין ללא שום טקסט מסביב:
{
  "summary": "סיכום תמציתי של מהות המותג",
  "positioningQuestions": [
    "שאלה 1 לחידוד המיצוב",
    "שאלה 2 לחידוד המיצוב",
    "שאלה 3 לחידוד המיצוב"
  ],
  "extractedBrand": {
    "identity": {
      "companyName": "שם המותג",
      "organizationType": "חברה",
      "organizationPurpose": "תכלית ותחום עיסוק",
      "memberCount": "עד 10",
      "slogan": "סלוגן קליט",
      "companyVision": "חזון מותג",
      "shortVision": "תמצית חזון במשפט אחד"
    },
    "voice": {
      "personality": { "formality": 3, "warmth": 4, "luxury": 3, "energy": 4 },
      "genderAddressing": "plural",
      "sectorCompliance": "general",
      "powerWords": ["מובילות", "איכות", "שירות", "ביטחון"],
      "forbiddenWords": ["חובבני"]
    },
    "audience": {
      "mainUvp": "הצעת הערך הייחודית",
      "targetAudiences": ["קהל 1", "קהל 2"]
    }
  }
}`;

  try {
    const parsed = await dispatchEntityItemToKosai(prompt, { apiKey: activeKey });
    if (parsed && typeof parsed === 'object') {
      return {
        success: true,
        summary: parsed.summary || `נותח בהצלחה: ${domainGuess}`,
        extractedBrand: parsed.extractedBrand || parsed,
        positioningQuestions: Array.isArray(parsed.positioningQuestions) ? parsed.positioningQuestions : [
          'מה היתרון המרכזי ביותר שמבדיל אתכם ממתחרים אחרים ברשת?',
          'האם האתר פונה לקהל עסקי (B2B) או לצרכנים פרטיים (B2C)?',
          'מהו המוצר או השירות הרווחי ביותר שתרצו להציב בפרונט של המותג?'
        ],
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] scrapeBrandFromUrlOrSocial live AI fallback:', err);
  }

  // 0-token intelligent fallback
  return {
    success: true,
    summary: `נותח על בסיס הכתובת: ${domainGuess}`,
    extractedBrand: {
      identity: {
        companyName: domainGuess.split('.')[0].toUpperCase(),
        organizationPurpose: `שירותים מקצועיים ופתרונות מקיפים מתוך ${cleanUrl}`,
        slogan: 'איכות, מקצועיות ושירות ללא פשרות',
        companyVision: 'להיות הכתובת המובילה בתחום תוך מתן ערך מרבי לכל לקוח.',
        shortVision: 'שירות מתקדם המותאם אישית לצרכים שלך.',
        organizationType: 'חברה',
        memberCount: 'עד 10',
        logoUrl: '',
      },
      voice: {
        personality: { formality: 3, warmth: 4, luxury: 3, energy: 4 },
        genderAddressing: 'plural',
        sectorCompliance: 'general',
        shabbatObservant: false,
        powerWords: ['איכות', 'מובילות', 'ביטחון', 'מקצועיות', 'תוצאות'],
        forbiddenWords: ['חובבני', 'זול', 'אולי'],
      },
      audience: {
        mainUvp: 'מענה מקיף ומקצועי המשלב ידע מעמיק ושירות אישי.',
        targetAudiences: ['לקוחות פרטיים', 'עסקים וחברות', 'מקבלי החלטות'],
        personas: [],
        commonObjections: [
          { id: 'o-1', objection: 'האם השירות מתאים בדיוק עבורי?', rebuttal: 'אנו מתאימים את המעטפת באופן אישי ומדויק לכל צורך.' }
        ],
      },
    },
    positioningQuestions: [
      'מה היתרון המרכזי ביותר שמבדיל אתכם ממתחרים אחרים ברשת?',
      'האם האתר פונה לקהל עסקי (B2B) או לצרכנים פרטיים (B2C)?',
      'מהו המוצר או השירות הרווחי ביותר שתרצו להציב בפרונט של המותג?',
    ],
  };
}

/**
 * הצעות ברירת מחדל חכמות באפס טוקנים עבור כל שלב
 */
export function generateSmartFallbackSuggestions(
  stepId: string,
  brand: BrandDna,
  userDraft?: string
): StepAiAssistanceResult {
  const company = brand.identity.companyName?.trim() || userDraft?.trim() || 'העסק שלך';
  const purpose = brand.identity.organizationPurpose?.trim() || 'מתן שירותים ופתרונות מקצועיים';

  switch (stepId) {
    case 'step_identity_name':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `על בסיס התחום "${purpose}", שם מקצועי וממוקד סמכות יוצר אמון מיידי במפגש הראשון עם הלקוח.`,
        smartInsight: 'שם מותג מדויק חוסך אלפי שקלים בהסברים שיווקיים ומעביר מסר ברור.',
        suggestions: [
          {
            title: 'סמכותי ומוביל',
            value: company,
            subtitle: 'פנייה ישירה המבטאת מובילות ומקצוענות',
            rationale: 'יוצר נוכחות חזקה וביטחון בקרב מקבלי החלטות',
            isRecommended: true,
          },
          {
            title: 'חדשני ודיגיטלי',
            value: `${company} טק`,
            subtitle: 'שילוב ניחוח טכנולוגי ומתקדם',
            rationale: 'מתאים במיוחד לעסקים המציעים שירותים אוטומטיים ופתרונות ענן',
            isRecommended: false,
          },
          {
            title: 'אישי וערכי',
            value: `${company} פלוס`,
            subtitle: 'הדגשת היחס האישי והערך המוסף',
            rationale: 'מחבר רגשית לקוחות המחפשים שותף אמין לטווח ארוך',
            isRecommended: false,
          },
        ],
      };

    case 'step_identity_purpose':
      return {
        success: true,
        recommendedIndex: 1,
        recommendationReason: `עבור המותג "${company}", ניסוח תכלית המשלב תוצאה עסקית לצד ליווי אישי מניב את יחס ההמרה הגבוה ביותר.`,
        smartInsight: 'תכלית ברורה מונעת בלבול ומאפשרת ללקוח להבין תוך 3 שניות מה הוא מקבל.',
        suggestions: [
          {
            title: 'ממוקד תוצאות ומקצועיות',
            value: `מתן פתרונות מקיפים ומתקדמים בתחום ${purpose}, המבטיחים מקצועיות ללא פשרות ותוצאות מוכחות.`,
            subtitle: 'דגש על איכות ביצוע ואמינות טכנית',
            rationale: 'משדר יציבות ורמת שירות גבוהה',
            isRecommended: false,
          },
          {
            title: 'מוכוון צמיחה ושקט נפשי',
            value: `הענקת מעטפת ליווי הוליסטית בתחום ${purpose}, המשלבת חדשנות, חיסכון בזמן ושקט נפשי מלא לעסק.`,
            subtitle: 'שילוב בין תועלת מעשית לביטחון רגשי',
            rationale: 'מבדל אותך כשותף אסטרטגי ולא רק כספק שירות',
            isRecommended: true,
          },
          {
            title: 'מהיר, נגיש ודיגיטלי',
            value: `הנגשת שירותי ${purpose} מתקדמים בקלות, במהירות ובמחירים שקופים המתאימים לכל עסק.`,
            subtitle: 'דגש על פשטות, מהירות ושקיפות',
            rationale: 'פונה ללקוחות המחפשים יעילות ומענה מהיר',
            isRecommended: false,
          },
        ],
      };

    default:
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: 'הצעה זו מותאמת באופן מדויק על בסיס נתוני המותג הקיימים.',
        smartInsight: 'דיוק המסרים יוצר אחידות ועוצמה בכל נקודות המפגש עם הלקוח.',
        suggestions: [
          {
            title: 'הכיוון המוביל',
            value: company,
            subtitle: 'התאמה מלאה לפרופיל העסק',
            rationale: 'מחזק את הבידול והסמכות בשוק',
            isRecommended: true,
          },
          {
            title: 'כיוון אלטרנטיבי',
            value: `${company} - איכות ללא פשרות`,
            subtitle: 'דגש על אמינות ושירות',
            rationale: 'מתאים לקהל מסורתי המחפש ביטחון',
            isRecommended: false,
          },
        ],
      };
  }
}
