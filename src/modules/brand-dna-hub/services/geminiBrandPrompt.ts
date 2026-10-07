import { BrandDna } from '../types/brandDna';
import {
  buildBrandSystemContext,
  buildBrandRephrasePrompt,
  buildBrandDiscoveryPrompt,
  buildStepAssistancePrompt,
} from '../prompts';

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
  error?: string;
}



/**
 * Call Gemini AI to improve text with brand voice
 */
export async function rephraseTextWithBrandAi(
  originalText: string,
  apiKey: string,
  brand: BrandDna,
  customInstructions?: string
): Promise<{ success: boolean; text?: string; error?: string }> {
  if (!apiKey) {
    return { success: false, error: 'לא הוגדר מפתח Google Gemini API' };
  }
  if (!originalText || !originalText.trim()) {
    return { success: false, error: 'לא סופק טקסט לעריכה' };
  }

  try {
    const systemContext = buildBrandSystemContext(brand, 'קופירייטר שיווקי בכיר המשדרג טקסט לעמוד או לטופס');
    const userPrompt = `
אנא שכתב ושפר את הטקסט הבא כך שיתאים ב-100% ל-DNA של המותג ולשפת המותג המוגדרת:

טקסט מקורי:
"""
${originalText}
"""

${customInstructions ? `דגשים מיוחדים של המשתמש: ${customInstructions}` : ''}

הנחיות פלט:
1. החזר אך ורק את הטקסט המשופר והקולע, ללא הקדמות ("הנה התוצאה:"), ללא הערות וללא מרכאות מסביב.
2. הקפד על עברית מושלמת, רהוטה וזורמת התואמת את הטון והמגזר.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemContext}\n\n${userPrompt}` }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `שגיאת שרת: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!resultText) {
      throw new Error('לא התקבלה תשובה מ-Gemini');
    }

    return { success: true, text: resultText };
  } catch (err: any) {
    return { success: false, error: err.message || 'שגיאה בעריכת הטקסט' };
  }
}

/**
 * Generate full Brand DNA from a short interview summary using Gemini
 */
export async function generateBrandDnaFromInterview(
  interviewNotes: string,
  apiKey: string
): Promise<{ success: boolean; brandDna?: Partial<BrandDna>; error?: string }> {
  if (!apiKey) {
    return { success: false, error: 'לא הוגדר מפתח Google Gemini API' };
  }

  try {
    const prompt = `
אתה אסטרטג מיתוג בכיר ומנהל קריאייטיב.
לפניך סיכום שיחת ראיון עם בעל עסק או מנהל ארגון:
"""
${interviewNotes}
"""

עליך לנתח את השיחה ולחלץ מבנה Brand DNA מלא ומקצועי בעברית, בפורמט JSON תקני בלבד.

סכמת ה-JSON הנדרשת (החזר אך ורק JSON חוקי ללא שום טקסט נוסף או תגיות Markdown):
{
  "identity": {
    "companyName": "שם החברה/העסק",
    "organizationType": "חברה",
    "organizationPurpose": "פירוט המטרה העסקית",
    "memberCount": "עד 10",
    "slogan": "סלוגן קליט ומשכנע",
    "companyVision": "חזון מפורט ומעורר השראה (2-3 פסקאות)",
    "shortVision": "תמצית חזון במשפט אחד (עד 15 מילים)"
  },
  "voice": {
    "personality": {
      "formality": 3,
      "warmth": 4,
      "luxury": 3,
      "energy": 4
    },
    "genderAddressing": "plural",
    "sectorCompliance": "general",
    "powerWords": ["מילה1", "מילה2", "מילה3", "מילה4", "מילה5"],
    "forbiddenWords": ["מילה_אסורה1", "מילה_אסורה2"]
  },
  "audience": {
    "mainUvp": "הצעת הערך הייחודית והבידול המשמעותי",
    "targetAudiences": ["קהל יעד 1", "קהל יעד 2", "קהל יעד 3"],
    "personas": [
      {
        "id": "p-1",
        "name": "שם הפרסונה (לדוגמה: יעל, מנהלת שיווק)",
        "roleOrProfile": "תיאור הפרופיל והרקע",
        "mainPain": "הכאב או האתגר המרכזי שלה",
        "dreamOutcome": "התוצאה המושלמת שהיא רוצה להשיג"
      }
    ],
    "commonObjections": [
      {
        "id": "o-1",
        "objection": "התנגדות או חשש נפוץ",
        "rebuttal": "המענה המרגיע והמשכנע של המותג"
      }
    ]
  },
  "designTokens": {
    "primaryColor": "#6366f1",
    "secondaryColor": "#0ea5e9",
    "backgroundColor": "#0f172a",
    "textColor": "#f8fafc",
    "textColorH1": "#ffffff",
    "textColorH2": "#94a3b8",
    "buttonBgColor": "#6366f1",
    "buttonTextColor": "#ffffff",
    "fontFamily": "Heebo, sans-serif",
    "borderRadius": "md",
    "buttonStyle": "gradient"
  },
  "trust": {
    "refundPolicySummary": "החזר כספי מלא תוך 14 יום ללא שאלות",
    "securityBadgeText": "סליקה מאובטחת בתקן PCI-DSS ובהצפנת SSL 256-bit"
  }
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `שגיאת שרת: ${response.statusText}`);
    }

    const data = await response.json();
    let jsonStr = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    }

    const parsedDna = JSON.parse(jsonStr);
    return { success: true, brandDna: parsedDna };
  } catch (err: any) {
    console.error('Brand Discovery AI error:', err);
    return { success: false, error: err.message || 'שגיאה בפענוח ה-DNA משיחה' };
  }
}

/**
 * Intelligent, context-aware fallback suggestions if Gemini API is unavailable or offline
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
            title: 'פתרון מקצה לקצה עם שקט נפשי',
            value: `ליווי מקיף ופתרונות מתקדמים המאפשרים ללקוחותינו לצמוח בביטחון מלא ובשקט נפשי מקסימלי.`,
            subtitle: 'פנייה הוליסטית המחברת תועלת רגשית ומעשית',
            rationale: 'התאמה מושלמת למיתוג המכוון למערכות יחסים ארוכות טווח',
            isRecommended: true,
          },
          {
            title: 'חדשנות וצמיחה מהירה',
            value: `הובלת שינוי וצמיחה מואצת באמצעות טכנולוגיה, ידע מתקדם וכלים דיגיטליים פורצי דרך.`,
            subtitle: 'טון דינמי ומניע לפעולה',
            rationale: 'מתאים לקהל יעד יזמי וצומח',
            isRecommended: false,
          },
        ],
      };

    case 'step_identity_slogan':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `סלוגן המשלב "חדשנות" ו"שקט נפשי" תואם את ציפיות הלקוחות של "${company}" ומקנה תחושת ביטחון.`,
        smartInsight: 'סלוגן קצר (3-5 מילים) נטמע בזיכרון ב-80% יותר מסלוגנים ארוכים ומסורבלים.',
        suggestions: [
          {
            title: 'קלאסי ומשכנע',
            value: 'חדשנות, איכות וצמיחה מתמדת',
            subtitle: 'סלוגן יציב ומכובד שמתאים לכל הפלטפורמות',
            rationale: 'פונה למכנה המשותף הרחב ביותר בעולם העסקי',
            isRecommended: true,
          },
          {
            title: 'ממוקד שקט נפשי',
            value: 'המומחיות שלנו, השקט הנפשי שלך',
            subtitle: 'דגש על הסרת דאגות מהלקוח',
            rationale: 'חזק במיוחד בעמודי נחיתה ושיחות מכירה',
            isRecommended: false,
          },
          {
            title: 'קצר וקולע לפעולה',
            value: 'תוצאות מדברות. שירות מנצח.',
            subtitle: 'משפטים קצרים וחזקים',
            rationale: 'מותאם למודעות קצרות, סושיאל וסטטוסים בווטסאפ',
            isRecommended: false,
          },
        ],
      };

    case 'step_identity_vision':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `חזון המתמקד בהפיכה לעוגן מרכזי בתחום מעניק למותג "${company}" מעמד של סמכות ענפית.`,
        smartInsight: 'חזון מעורר השראה מחבר את הצוות ומעלה את הנכונות של לקוחות לשלם מחירי פרימיום.',
        suggestions: [
          {
            title: 'חזון מנהיגות ענפית',
            value: `להוביל את התחום בישראל תוך יצירת סטנדרט חדש של מקצועיות, שקיפות ויחס אישי המעניק ערך מתמשך לכל לקוח.`,
            subtitle: 'משדר גודל, אופק ומחויבות בלתי מתפשרת',
            rationale: 'בונה מעמד של מותג מוביל שלא ניתן להתעלם ממנו',
            isRecommended: true,
          },
          {
            title: 'חזון טכנולוגי ואוטומטי',
            value: `להנגיש את מיטב הפתרונות והכלים המתקדמים ביותר, המאפשרים לכל לקוח לחסוך זמן יקר ולהשיג מקסימום תוצאות.`,
            subtitle: 'מיקוד ביעילות, חיסכון וקידמה',
            rationale: 'מתאים למותגים הממוקדים בחיסכון במשאבים',
            isRecommended: false,
          },
          {
            title: 'חזון קהילתי ואנושי',
            value: `להיות בית מקצועי חם ובטוח המלווה כל לקוח יד ביד לאורך כל הדרך עם הקשבה מלאה ואחריות אמיתית.`,
            subtitle: 'דגש על חום אנושי, זמינות ואכפתיות',
            rationale: 'מתאים לעסקים שנותנים שירות אינטימי ואישי',
            isRecommended: false,
          },
        ],
      };

    case 'step_voice_personality':
      return {
        success: true,
        recommendedIndex: 1,
        recommendationReason: `שילוב של רשמיות מאוזנת (3/5) יחד עם חמימות גבוהה (4/5) ואנרגיה חיובית (4/5) מייצר אחוזי סגירה מעולים בקרב לקוחות בישראל.`,
        smartInsight: 'טון דיבור עקבי בכל נקודות המגע (צ׳אט, וידאו, דף נחיתה) מעלה את האמון פי 3.',
        suggestions: [
          {
            title: 'סמכותי ואקסקלוסיבי (Corporate Luxury)',
            value: { formality: 4, warmth: 3, luxury: 5, energy: 3 },
            subtitle: 'רשמי 4, חם 3, יוקרתי 5, אנרגטי 3',
            rationale: 'משדר פרימיום, יציבות ומעמד גבוה למותגי יוקרה ו-B2B',
            isRecommended: false,
          },
          {
            title: 'נגיש, חם ומקצועי (Recommended Balance)',
            value: { formality: 3, warmth: 4, luxury: 3, energy: 4 },
            subtitle: 'רשמי 3, חם 4, יוקרתי 3, אנרגטי 4',
            rationale: 'האיזון המושלם: מקצועי מספיק כדי לעורר כבוד, וחם מספיק כדי שלא ירגיש מנוכר',
            isRecommended: true,
          },
          {
            title: 'צעיר, סחבקי וסוחף (Direct & Energetic)',
            value: { formality: 2, warmth: 5, luxury: 2, energy: 5 },
            subtitle: 'רשמי 2, חם 5, יוקרתי 2, אנרגטי 5',
            rationale: 'קליל, עממי ומדבר בגובה העיניים לקהל צעיר או סושיאל ישיר',
            isRecommended: false,
          },
        ],
      };

    case 'step_voice_sector':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `פנייה בלשון רבים כוללת ("אתם", "שלכם") יוצרת שוויון ומזמינה כל מבקר להרגיש רצוי, ללא מגדר ספציפי.`,
        smartInsight: 'פנייה בלשון רבים מגדילה את ההמרות בעמודי נחיתה כי היא אינה מדירה נשים או גברים.',
        suggestions: [
          {
            title: 'פנייה כוללת בלשון רבים (ממלכתי ומכליל)',
            value: { genderAddressing: 'plural', sectorCompliance: 'general', shabbatObservant: false },
            subtitle: 'פנייה כגון: "אנו מזמינים אתכם להצטרף", "השירות מותאם עבורכם"',
            rationale: 'מתאים ל-95% מדפי הנחיתה והשירותים הדיגיטליים',
            isRecommended: true,
          },
          {
            title: 'מותאם למגזר הדתי/חרדי ושומר שבת',
            value: { genderAddressing: 'plural', sectorCompliance: 'religious', shabbatObservant: true },
            subtitle: 'לשון נקייה, שפה מכבדת ועסק סגור בשבתות ומועדי ישראל',
            rationale: 'קריטי לבניית אמון בקרב הציבור הדתי והמסורתי',
            isRecommended: false,
          },
          {
            title: 'פנייה חדה וישירה לפעולה (B2B Direct)',
            value: { genderAddressing: 'direct', sectorCompliance: 'business', shabbatObservant: false },
            subtitle: 'מונחים עסקיים ממוקדי ROI ופנייה חדה כגון: "קבל עכשיו הצעה"',
            rationale: 'חזק במיוחד למגזר העסקי ומכירות ישירות',
            isRecommended: false,
          },
        ],
      };

    case 'step_voice_words':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `מילות כוח כמו "שקט נפשי", "ביטחון" ו"מומחיות" מפיגות חששות ומחזקות את תפיסת הערך של "${company}".`,
        smartInsight: 'שימוש במילות כוח ממוקדות מקצר את תהליך קבלת ההחלטה של הלקוח.',
        suggestions: [
          {
            title: 'מילות ביטחון ואמון פרימיום',
            value: {
              powerWords: ['איכות', 'שקט נפשי', 'מומחיות', 'תוצאות מוכחות', 'ליווי אישי'],
              forbiddenWords: ['זול', 'חלטורה', 'מבצע אחרון בהחלט', 'פשוט מדי'],
            },
            subtitle: 'מילים המרגיעות את הלקוח ומבססות יוקרה',
            rationale: 'מגן על המותג מפני שחיקת מחירים ותפיסה עממית מדי',
            isRecommended: true,
          },
          {
            title: 'מילות מהירות וחדשנות טכנולוגית',
            value: {
              powerWords: ['מדויק', 'מתקדם', 'מיידי', 'אוטומציה', 'צמיחה', 'פתרון חכם'],
              forbiddenWords: ['מסובך', 'איטי', 'בירוקרטיה', 'סבלנות'],
            },
            subtitle: 'מילים המשדרות קצב מהיר, זמינות וטכנולוגיה',
            rationale: 'מעולה למוצרים דיגיטליים, מערכות SaaS וכלים חכמים',
            isRecommended: false,
          },
          {
            title: 'מילות שותפות ויחס אנושי',
            value: {
              powerWords: ['שותפים לדרך', 'הקשבה', 'מסירות', 'מענה אמיתי', 'אכפתיות'],
              forbiddenWords: ['רובוטי', 'קר', 'לפי התקנון בלבד', 'אין מענה'],
            },
            subtitle: 'הדגשת היחס האנושי מול הלקוח',
            rationale: 'בונה קהילה ונאמנות לקוחות לאורך זמן',
            isRecommended: false,
          },
        ],
      };

    case 'step_audience_uvp':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `הצעת ערך המשלבת טכנולוגיה מתקדמת עם ליווי אנושי מעניקה למותג "${company}" בידול שמתחרים מתקשים להעתיק.`,
        smartInsight: 'הצעת ערך (UVP) חזקה עונה על השאלה: "למה לקנות דווקא ממך, עכשיו?" במשפט אחד בהיר.',
        suggestions: [
          {
            title: 'בידול היברידי: טכנולוגיה + יחס אישי',
            value: `פתרון מקיף מקצה לקצה המשלב טכנולוגיה עילית עם ליווי אנושי מסור ומקצועי, כדי שתוכל ליהנות משקט נפשי מלא.`,
            subtitle: 'החיבור שבין מקצועיות טכנולוגית לביטחון אנושי',
            rationale: 'פותר את החשש של לקוחות מלהישאר לבד מול מערכת ממוחשבת',
            isRecommended: true,
          },
          {
            title: 'בידול מהירות וחיסכון בזמן',
            value: `הדרך המהירה והפשוטה ביותר להשיג תוצאות מעולות במינימום זמן ומאמץ, ללא בירוקרטיה מיותרת.`,
            subtitle: 'דגש על קלות תפעול ומהירות הגעה ליעד',
            rationale: 'ממיר מצוין בעלי עסקים עמוסים שאין להם זמן להתעסק בפרטים',
            isRecommended: false,
          },
          {
            title: 'בידול ביטחון ואחריות מלאה',
            value: `מומחיות מוכחת ואחריות מלאה על שביעות הרצון שלך, עם מענה ישיר ומחויבות אמיתית לתוצאות.`,
            subtitle: 'הסרת הסיכון הנתפס מכתפי הלקוח',
            rationale: 'מתאים לעסקאות יקרות הדורשות אמון עמוק',
            isRecommended: false,
          },
        ],
      };

    case 'step_audience_target':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `פילוח מדורג (עסקים קטנים-בינוניים, מנהלי קהילות, יזמים) מאפשר לבנות מסעות לקוח ספציפיים לכל מגזר.`,
        smartInsight: 'מותג שמנסה לפנות ל"כולם" בסוף לא מדבר אל אף אחד. פילוח מדויק מעלה את יחס ההמרה.',
        suggestions: [
          {
            title: 'מגזר עסקי וקהילתי מגוון',
            value: ['בעלי עסקים קטנים ובינוניים', 'מנהלי קהילות וארגונים', 'יזמים ומשווקים דיגיטליים'],
            subtitle: 'פילוח המכסה מקבלי החלטות עם תקציב ויכולת פעולה',
            rationale: 'מאפשר כתיבת עמודי נחיתה ייעודיים לכל סוג לקוח',
            isRecommended: true,
          },
          {
            title: 'לקוחות B2B ומנהלי כספים/תפעול',
            value: ['מנכ״לים וסמנכ״לי תפעול', 'מנהלי רכש ומשאבי אנוש', 'חברות צומחות'],
            subtitle: 'פילוח לארגונים מבוססים ומחלקות ייעודיות',
            rationale: 'עסקאות בהיקפים כספיים גבוהים יותר',
            isRecommended: false,
          },
          {
            title: 'פרילנסרים ועוסקים עצמאיים',
            value: ['עוסקים מורשים ופטורים', 'יועצים ומטפלים', 'נותני שירותים פרטיים'],
            subtitle: 'קהל רחב המחפש פתרונות מהירים בעלויות נגישות',
            rationale: 'קצב רכישה מהיר והחלטות עצמאיות',
            isRecommended: false,
          },
        ],
      };

    case 'step_audience_persona':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `הגדרת "דן בעל העסק" כפרסונה ראשית מייצגת את הלקוח שחווה חוסר זמן ופיזור כלים – הבעיה שהמותג "${company}" פותר בצורה הטובה ביותר.`,
        smartInsight: 'דף נחיתה שמדבר ישירות לכאב של הפרסונה מקבל עד פי 4 פניות ממוקדות.',
        suggestions: [
          {
            title: 'פרסונת בעל עסק עצמאי (דן)',
            value: [
              {
                id: 'p-1',
                name: 'דן, בעל עסק עצמאי',
                roleOrProfile: 'מנהל פעילות צומחת ללא מחלקת שיווק פנימית',
                mainPain: 'חוסר זמן, פיזור בין כלים שונים ותחושת עומס ניהולי',
                dreamOutcome: 'פלטפורמה שמנהלת את הכל בצורה מסודרת ומגדילה הכנסות בשקט נפשי',
              },
            ],
            subtitle: 'כאב: עומס ופיזור | חלום: שקט נפשי וצמיחה',
            rationale: 'מייצג את פלח השוק הגדול ביותר של לקוחות משלמים',
            isRecommended: true,
          },
          {
            title: 'פרסונת מנהלת קהילה/ארגון (שרה)',
            value: [
              {
                id: 'p-2',
                name: 'שרה, מנהלת קהילה ופעילות',
                roleOrProfile: 'מובילה פעילות עם מאות חברים ושותפים',
                mainPain: 'קושי לשמור על קשר אישי, מעקב אחר הרשמות ואמינות',
                dreamOutcome: 'כלים דיגיטליים שמשקפים את החזון ומחברים את האנשים בקלות',
              },
            ],
            subtitle: 'כאב: אובדן קשר אישי | חלום: סדר ואמון',
            rationale: 'פונה לעמותות, ארגונים חברתיים ומנהלי קבוצות',
            isRecommended: false,
          },
        ],
      };

    case 'step_audience_objections':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `החשש מ"האם זה מתאים גם לעסק בגודל שלי" והחשש מ"זמן הטמעה" הן שתי ההתנגדויות הראשונות שעולות בכל תחום שירותי.`,
        smartInsight: 'מענה מוקדם לחשש בוט או בדף הסליקה מונע נטישה של למעלה מ-25% מהרוכשים.',
        suggestions: [
          {
            title: 'מענה לחשש מגודל העסק ומזמן עד תוצאות',
            value: [
              {
                id: 'o-1',
                objection: 'האם זה מתאים גם לעסק קטן או פעילות צנועה?',
                rebuttal: 'בהחלט. המערכת מודולרית וצומחת יחד איתך, ללא עלויות הקמה מיותרות.',
              },
              {
                id: 'o-2',
                objection: 'כמה זמן ומאמץ ייקח לי לראות תוצאות בשטח?',
                rebuttal: 'תוך מספר דקות מרגע ההגדרה כל הכלים והדפים מוכנים לפעולה מיידית.',
              },
            ],
            subtitle: 'פירוק התנגדות מחיר ומורכבות',
            rationale: 'הסרת חסמי הכניסה העיקריים כבר ברושם הראשוני',
            isRecommended: true,
          },
          {
            title: 'מענה לחשש מתמיכה טכנית ואבטחת נתונים',
            value: [
              {
                id: 'o-3',
                objection: 'מה קורה אם אסתבך או אזדקק לעזרה טכנית?',
                rebuttal: 'אנחנו מספקים ליווי אישי ותמיכה מהירה בווטסאפ ובדוא"ל בכל שלב.',
              },
              {
                id: 'o-4',
                objection: 'האם המידע שלי ושל הלקוחות שלי מאובטח?',
                rebuttal: 'הנתונים מוצפנים לפי התקנים המחמירים ביותר (SSL 256-bit ו-PCI-DSS).',
              },
            ],
            subtitle: 'ביטחון טכנולוגי ואבטחת מידע',
            rationale: 'קריטי לשירותים מקוונים ודפי תשלום',
            isRecommended: false,
          },
        ],
      };

    case 'step_design_tokens':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `אינדיגו מלכותי (#6366F1) ותכלת שמיים (#0EA5E9) עם רקע כהה משדרים טכנולוגיה, אמינות ויוקרה עדכנית לשנת 2026.`,
        smartInsight: 'צבע כחול/אינדיגו מקושר פסיכולוגית לביטחון ואמינות פיננסית בקרב 85% מהאוכלוסייה.',
        suggestions: [
          {
            title: 'אינדיגו מודרני וטכנולוגי (Modern Tech Indigo)',
            value: {
              primaryColor: '#6366f1',
              secondaryColor: '#0ea5e9',
              backgroundColor: '#0f172a',
              textColor: '#f8fafc',
              textColorH1: '#ffffff',
              textColorH2: '#94a3b8',
              buttonBgColor: '#6366f1',
              buttonTextColor: '#ffffff',
              fontFamily: 'Heebo, sans-serif',
              borderRadius: 'md',
              buttonStyle: 'gradient',
            },
            subtitle: 'שילוב אינדיגו עמוק, תכלת זוהר ורקע כהה פרימיום',
            rationale: 'המראה המוביל של עולם ה-SaaS והסטארטאפים',
            isRecommended: true,
          },
          {
            title: 'אמרלד יוקרתי ועוצמתי (Royal Emerald)',
            value: {
              primaryColor: '#059669',
              secondaryColor: '#10b981',
              backgroundColor: '#064e3b',
              textColor: '#ecfdf5',
              textColorH1: '#ffffff',
              textColorH2: '#a7f3d0',
              buttonBgColor: '#059669',
              buttonTextColor: '#ffffff',
              fontFamily: 'Assistant, sans-serif',
              borderRadius: 'lg',
              buttonStyle: 'solid',
            },
            subtitle: 'גווני ירוק עמוקים המשדרים שגשוג, צמיחה וביטחון',
            rationale: 'מעולה לעסקים פיננסיים, נדל״ן ובריאות',
            isRecommended: false,
          },
          {
            title: 'סגול פרימיום וזוהר (Electric Violet)',
            value: {
              primaryColor: '#8b5cf6',
              secondaryColor: '#d946ef',
              backgroundColor: '#180828',
              textColor: '#faf5ff',
              textColorH1: '#ffffff',
              textColorH2: '#e9d5ff',
              buttonBgColor: '#8b5cf6',
              buttonTextColor: '#ffffff',
              fontFamily: 'Rubik, sans-serif',
              borderRadius: 'full',
              buttonStyle: 'gradient',
            },
            subtitle: 'סגול ומג׳נטה תוססים המשדרים קריאייטיב, דיגיטל ו-AI',
            rationale: 'מתאים במיוחד לעולמות המדיה, הווידאו והעיצוב',
            isRecommended: false,
          },
        ],
      };

    case 'step_trust_checkout':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `הצגת מדיניות החזרים ברורה והצהרת תקן PCI-DSS מעלה את שיעור השלמת הרכישה בסליקה ביותר מ-30%.`,
        smartInsight: 'לקוחות לא מהססים בגלל המחיר – הם מהססים בגלל הפחד להישאר ללא מענה לאחר התשלום.',
        suggestions: [
          {
            title: 'אמון מלא: החזר 14 יום + תקן אבטחה מחמיר',
            value: {
              refundPolicySummary: 'החזר כספי מלא תוך 14 יום בהתאם לחוק הגנת הצרכן ללא אותיות קטנות.',
              securityBadgeText: 'סליקה מאובטחת בתקן PCI-DSS ובהצפנת SSL 256-bit',
              whatsappSupportNumber: brand.trust.whatsappSupportNumber || '0501234567',
              contactEmail: brand.trust.contactEmail || 'contact@mybrand.co.il',
              contactPhone: brand.trust.contactPhone || '03-1234567',
              officeAddress: brand.trust.officeAddress || 'דרך מנחם בגין 144, תל אביב',
            },
            subtitle: 'שקיפות מלאה המספקת שקט מוחלט לרוכשים',
            rationale: 'חובה לכל דף מכירה שרוצה מקסימום סגירות',
            isRecommended: true,
          },
          {
            title: 'אמון שירותי: מענה מהיר בווטסאפ לכל שאלה',
            value: {
              refundPolicySummary: 'ביטול נוח בלחיצת כפתור או פנייה ישירה לצוות התמיכה.',
              securityBadgeText: 'רכישה מוגנת באחריות וליווי אישי של הצוות',
              whatsappSupportNumber: brand.trust.whatsappSupportNumber || '0501234567',
            },
            subtitle: 'דגש על נגישות התמיכה והקשר האנושי המהיר',
            rationale: 'מעולה ללקוחות שמעדיפים קשר ישיר ומענה מהיר',
            isRecommended: false,
          },
        ],
      };

    default:
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: 'המלצה מותאמת לפרופיל המותג הנוכחי.',
        suggestions: [
          {
            title: 'הצעה מומלצת',
            value: userDraft || company,
            subtitle: 'אפשרות מותאמת',
            isRecommended: true,
          },
        ],
      };
  }
}

/**
 * Generate AI assistance tailored to a specific step in the single-question wizard
 */
export async function generateStepAiAssistance(
  stepId: string,
  brand: BrandDna,
  apiKey: string,
  userDraft?: string
): Promise<StepAiAssistanceResult> {
  // If no API key provided, immediately return intelligent smart fallback
  if (!apiKey || !apiKey.trim()) {
    return generateSmartFallbackSuggestions(stepId, brand, userDraft);
  }

  try {
    const prompt = buildStepAssistancePrompt(stepId, brand, userDraft);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini step assistance returned status ${response.status}, falling back to smart defaults`);
      return generateSmartFallbackSuggestions(stepId, brand, userDraft);
    }

    const data = await response.json();
    let jsonStr = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length > 0) {
      return {
        success: true,
        suggestions: parsed.suggestions,
        recommendedIndex: typeof parsed.recommendedIndex === 'number' ? parsed.recommendedIndex : 0,
        recommendationReason: parsed.recommendationReason || 'מומלץ עבורך על בסיס נתוני המותג הקודמים',
        smartInsight: parsed.smartInsight || '',
      };
    }

    return generateSmartFallbackSuggestions(stepId, brand, userDraft);
  } catch (err) {
    console.warn('Error during generateStepAiAssistance, falling back to smart defaults:', err);
    return generateSmartFallbackSuggestions(stepId, brand, userDraft);
  }
}

