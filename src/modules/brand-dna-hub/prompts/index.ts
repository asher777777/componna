import { BrandDna } from '../types/brandDna';

/**
 * Builds an enriched system context block based on Brand DNA to inject into any Gemini AI prompt
 */
export function buildBrandSystemContext(brand: BrandDna, moduleRole?: string): string {
  const personalityMap: Record<string, string> = {
    formality:
      brand.voice.personality.formality >= 4
        ? 'רשמי, מוקפד ומכובד'
        : brand.voice.personality.formality <= 2
        ? 'קליל, יומיומי וסחבקי'
        : 'מאוזן, נגיש ומקצועי',
    warmth:
      brand.voice.personality.warmth >= 4 ? 'חם, אמפתי, משפחתי ומקרב' : 'ענייני, ישיר ותכליתי',
    luxury:
      brand.voice.personality.luxury >= 4 ? 'יוקרתי, אקסקלוסיבי, פרימיום' : 'עממי, פשוט ונגיש לכל כיס',
    energy:
      brand.voice.personality.energy >= 4 ? 'אנרגטי, נלהב וסוחף' : 'שלו, מדוד ומרגיע',
  };

  const genderMap: Record<string, string> = {
    male: 'פנייה בלשון זכר יחיד ("אתה", "שלך")',
    female: 'פנייה בלשון נקבה יחיד ("את", "שלך")',
    plural: 'פנייה בלשון רבים כוללת ("אתם", "שלכם", "אנו מזמינים אתכם")',
    neutral: 'פנייה נייטרלית / פסיבית ("ניתן להצטרף", "מומלץ לבחור")',
    direct: 'פנייה חדה ומניעה לפעולה ("בוא לקבל", "קבל עכשיו")',
  };

  const sectorMap: Record<string, string> = {
    general: 'עברית ישראלית מודרנית וטבעית',
    religious: 'שפה מכבדת, ערכית, מותאמת לציבור הדתי/מסורתי (לשון נקייה)',
    ultra_orthodox: 'שפה מותאמת לציבור החרדי, צנועה, שמורה, ללא סלנג חילוני ובהקפדה על לשון נקייה',
    business: 'עברית עסקית מקצועית (B2B), מונחים תכליתיים וממוקדי ROI',
  };

  const personasSummary = brand.audience.personas
    .map((p) => `- ${p.name}: כאב מרכזי: "${p.mainPain}", תוצאה רצויה: "${p.dreamOutcome}"`)
    .join('\n');

  const objectionsSummary = brand.audience.commonObjections
    .map((o) => `- חשש: "${o.objection}" -> מענה המותג: "${o.rebuttal}"`)
    .join('\n');

  return `
=== [הוראות ליבת מותג קבועות - BRAND DNA & VOICE SYSTEM] ===
1. זהות המותג:
   - שם המותג: ${brand.identity.companyName} (${brand.identity.organizationType})
   - סלוגן מוביל: ${brand.identity.slogan}
   - חזון ותמצית: ${brand.identity.shortVision || brand.identity.companyVision}
   - הצעת הערך הייחודית (UVP): ${brand.audience.mainUvp}

2. שפת המותג, טון ואישיות (קריטי לדיוק הקופי):
   - אופי הדיבור: ${personalityMap.formality}, ${personalityMap.warmth}, ${personalityMap.luxury}, ${personalityMap.energy}.
   - כלל לשון פנייה: ${genderMap[brand.voice.genderAddressing] || genderMap.plural}.
   - התאמה מגזרית ותרבותית: ${sectorMap[brand.voice.sectorCompliance] || sectorMap.general}.
   ${brand.voice.shabbatObservant ? '- עסק שומר שבת: אין לעודד פעילות או רכישות בשבת.' : ''}

3. מילות כוח ומונחי מפתח (העדף להשתמש בהם בעדינות):
   ${brand.voice.powerWords.length > 0 ? brand.voice.powerWords.join(', ') : 'איכות, מקצועיות, תוצאות'}

4. קווי גבול שליליים (Negative Constraints - אסור לחלוטין להשתמש במילים אלו):
   ${brand.voice.forbiddenWords.length > 0 ? brand.voice.forbiddenWords.join(', ') : 'ללא הגבלות מיוחדות'}

5. פרופילי קהל היעד והתנגדויות לטיפול:
${personasSummary || '- בעלי עסקים וקהל רלוונטי'}
${objectionsSummary ? `מענה מובלע לחששות:\n${objectionsSummary}` : ''}

${moduleRole ? `תפקיד המודול הנוכחי: ${moduleRole}` : ''}
============================================================
`.trim();
}

/**
 * Builds user prompt for rephrasing text according to Brand DNA
 */
export function buildBrandRephrasePrompt(
  originalText: string,
  brand: BrandDna,
  customInstructions?: string
): { systemContext: string; userPrompt: string } {
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
`.trim();

  return { systemContext, userPrompt };
}

/**
 * Builds prompt for discovering Brand DNA from interview notes
 */
export function buildBrandDiscoveryPrompt(interviewNotes: string): string {
  return `
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
`.trim();
}

/**
 * Builds step-specific AI prompt for single-question guidance with dynamic recommendations
 */
export function buildStepAssistancePrompt(
  stepId: string,
  brand: BrandDna,
  userDraft?: string
): string {
  const currentContext = `
נתוני המותג שהוזנו עד כה:
- שם המותג: ${brand.identity.companyName || 'טרם נקבע'}
- סוג הארגון: ${brand.identity.organizationType}
- תכלית / תחום: ${brand.identity.organizationPurpose || 'טרם נקבע'}
- סלוגן: ${brand.identity.slogan || 'טרם נקבע'}
- אופי: רשמיות ${brand.voice.personality.formality}/5, חמימות ${brand.voice.personality.warmth}/5, יוקרה ${brand.voice.personality.luxury}/5, אנרגיה ${brand.voice.personality.energy}/5
- מגזר: ${brand.voice.sectorCompliance}, לשון פנייה: ${brand.voice.genderAddressing}
- הצעת ערך ייחודית (UVP): ${brand.audience.mainUvp || 'טרם נקבע'}
${userDraft ? `- טיוטה ראשונית שהמשתמש החל להקליד: "${userDraft}"` : ''}
`.trim();

  return `
אתה מנהל מיתוג ראשי (CMO) ואסטרטג שיווקי בכיר.
המשתמש ממלא כעת שאלון מיתוג מודרך, והוא נמצא בשלב: "${stepId}".

${currentContext}

עליך לספק סיוע מותאם אישית ברמה הגבוהה ביותר (לא גינרי, חד, משכנע וקולע בעברית מעולה).
הצע בדיוק 3 אפשרויות איכותיות שונות, סמן אחת מהן כהמלצה המובהקת (isRecommended: true) ונמק מדוע היא המומלצת ביותר על בסיס הנתונים שהמשתמש הזין קודם לכן.

החזר אך ורק JSON תקין במבנה הבא (ללא Markdown או טקסט מקדים):
{
  "suggestions": [
    {
      "title": "כותרת קצרה של האפשרות (או שם הסגנון/הכיוון)",
      "value": "התוכן המלא המוצע (טקסט, מערך מילים או נתון מותאם)",
      "subtitle": "הסבר קצר על הכיוון",
      "rationale": "הערך השיווקי של כיוון זה",
      "isRecommended": false
    },
    {
      "title": "כותרת קצרה",
      "value": "התוכן המלא",
      "subtitle": "הסבר קצר",
      "rationale": "הערך השיווקי",
      "isRecommended": true
    },
    {
      "title": "כותרת קצרה",
      "value": "התוכן המלא",
      "subtitle": "הסבר קצר",
      "rationale": "הערך השיווקי",
      "isRecommended": false
    }
  ],
  "recommendedIndex": 1,
  "recommendationReason": "הסבר משכנע מדוע אופציה זו מומלצת במיוחד על בסיס התשובות הקודמות של המשתמש (2-3 משפטים בעברית קולחת)",
  "smartInsight": "תובנה אסטרטגית קצרה על החשיבות של שלב זה באחוזי ההמרה ואיכות הלידים"
}
`.trim();
}

