import { BrandDna } from '../types/brandDna';
import {
  buildBrandSystemContext,
  buildBrandRephrasePrompt,
  buildBrandDiscoveryPrompt,
} from '../prompts';

export { buildBrandSystemContext };


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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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
