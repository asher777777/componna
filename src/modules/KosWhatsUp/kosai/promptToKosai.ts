/**
 * ============================================================================
 * ⚠️ אזהרת שומר הסף (KOSUN26 GATE 3 - AI MONOPOLY) ⚠️
 * כל פרומפט בקובץ זה נשלח אך ורק לחוזה עם KOSAI הנמצא בתיקייה:
 * src/modules/kosai-engine/modelsAiService/whatsUpAiContract.ts
 * אין לשלוח לג'מיני בשום אופן ישירות! חל איסור מוחלט על שימוש ב-fetch מקומי!
 * ============================================================================
 */

import { BrandDna } from '../../../core/contracts';
import { kosaiWhatsUpContract } from '../../kosai-engine/modelsAiService';

export type WhatsAppStatusTone = 'chasidic' | 'marketing' | 'official' | 'warm' | 'viral';

/**
 * בונה פסקת מיתוג דחוסה של 250 עד 300 מילים ("מעט המחזיק את המרובה").
 * מחליף העברת אובייקטי JSON מנופחים ומספק לג'מיני 100% מהזהות העסקית במינימום טוקנים.
 */
export function buildDenseBrandContext(brandDna?: BrandDna | null): string {
  if (!brandDna) return '';

  const company = brandDna.identity?.companyName || 'קושאן';
  const slogan = brandDna.identity?.slogan ? `"${brandDna.identity.slogan}"` : 'כל אדם זה נכס';
  const purpose = brandDna.identity?.organizationPurpose || 'פתרונות דיגיטליים, אוטומציות ושירותי ערך מובילים';
  const uvp = brandDna.audience?.mainUvp || 'שירות אישי, חדשנות ומהירות תגובה ללא פשרות';
  const audiences = brandDna.audience?.targetAudiences?.join(', ') || 'לקוחות עסקיים ופרטיים איכותיים';
  const powerWords = brandDna.voice?.powerWords?.join(', ') || 'אמינות, מקצועיות, חדשנות, צמיחה, הצלחה';
  const tone = (brandDna.voice as any)?.tone || 'אדיב, סמכותי, ענייני, חם ומניע לפעולה';
  const phone = brandDna.trust?.contactPhone || '052-6968008';
  const whatsapp = brandDna.trust?.whatsappSupportNumber || phone;
  const address = brandDna.trust?.officeAddress || 'מרכז עסקים ראשי';
  const openingHours = (brandDna.trust as any)?.openingHours?.join(', ') || 'א׳-ה׳ 09:00-18:00';

  return `
מותג: ${company} (סלוגן מוביל: ${slogan}).
ייעוד ופעילות: ${purpose}. המותג פועל במצוינות ובסטנדרט הגבוה ביותר ומספק ${uvp}.
קהל יעד מרכזי: ${audiences}.
שפת המותג וטון דיבור: התקשורת מתנהלת בעברית טבעית, שוטפת, בגובה העיניים, בנימה: ${tone}.
מילות מפתח וערכי ליבה: ${powerWords}.
עוגני שירות ואמינות: שירות לקוחות זמין ומהיר, מענה אישי, אחריות מלאה על שביעות רצון.
פרטי התקשרות וזמינות: מוקד טלפוני (${phone}), ערוץ WhatsApp ישיר (${whatsapp}), שעות פעילות (${openingHours}), כתובת ומשרדים (${address}).
הנחיית שיחה קריטית בוואטסאפ: מענה קצר וממוקד (עד 60 מילים להודעה), ללא ניסוחים רובוטיים או פסקאות ענק, שמירה על חמימות ישראלית, וסיום בשאלה מנחה להמשך התקדמות השיחה.
`.trim();
}

/**
 * שער שרת מקומי (Server First Gate):
 * בודק האם הודעת הלקוח בוואטסאפ שואלת שאלת שו"ת סטנדרטית (מיקום, שעות, טלפון, ברכה).
 * אם יש התאמה – מחזיר מענה מוכן ב-0 טוקנים וב-0 שניות!
 */
export function tryMatchLocalFaq(messageText: string, brandDna?: BrandDna | null): string | null {
  if (!messageText || !messageText.trim()) return null;
  const text = messageText.trim().toLowerCase();
  const company = brandDna?.identity?.companyName || 'קושאן';
  const phone = brandDna?.trust?.contactPhone || '052-6968008';
  const whatsapp = brandDna?.trust?.whatsappSupportNumber || phone;
  const address = brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';
  const openingHours = (brandDna?.trust as any)?.openingHours?.join(', ') || 'א׳-ה׳ 09:00-18:00';

  // 1. ברכות בסיסיות (שלום, היי, בוקר טוב)
  if (/^(שלום|היי|הייי|הלו|אהלן|בוקר טוב|צהריים טובים|ערב טוב)$/i.test(text)) {
    return `שלום וברכה! הגעתם לשירות הדיגיטלי של ${company}. איך נוכל לסייע לכם היום?`;
  }

  // 2. שעות פעילות
  if (/(שעות פעילות|שעות פתיחה|מתי פתוח|מתי אתם עובדים|זמני קבלת קהל)/i.test(text)) {
    return `שעות הפעילות של ${company} הן: ${openingHours}. נשמח לעמוד לרשותכם!`;
  }

  // 3. כתובת ומיקום פיזי
  if (/(איפה אתם|איפה אתם יושבים|מה הכתובת|דרכי הגעה|איך מגיעים|מיקום המשרד)/i.test(text)) {
    return `משרדי ${company} ממוקמים בכתובת: ${address}. לניווט ותיאום פגישה השב כאן.`;
  }

  // 4. טלפון ונציג אנושי
  if (/(טלפון שלכם|מספר טלפון|לדבר עם נציג|שיחה עם נציג|נציג אנושי|תתקשרו אלי)/i.test(text)) {
    return `נציגי ${company} זמינים בטלפון: ${phone} או בוואטסאפ זה (${whatsapp}). השאירו שם ומהות הפנייה ונחזור אליכם בהקדם!`;
  }

  return null;
}

// ----------------------------------------------------------------------------
// 1. Prompt Builders (Optimized, Lean & Token Efficient)
// ----------------------------------------------------------------------------

export const GENERATE_BOT_REPLY_PROMPT = (context: {
  userMessage: string;
  chatHistorySummary?: string;
  botRole?: string;
}) => `
${context.chatHistorySummary ? `הקשר שיחה קודם:\n${context.chatHistorySummary}\n\n` : ''}
הודעת לקוח: "${context.userMessage}"

הנחיות מענה:
1. ענה בעברית טבעית, אדיבה וישירה.
2. הגבל את התשובה ל-1 עד 3 משפטים קצרים (עד 50 מילים בלבד!).
3. סיים בשאלה מנחה קצרה או הנעה לפעולה.
`.trim();

export const GENERATE_STATUS_ENHANCE_PROMPT = (context: {
  originalText: string;
  tone: WhatsAppStatusTone;
}) => {
  const toneDesc = {
    chasidic: 'סגנון תורני חסידי מאיר, לשון נקייה וברכת הצלחה',
    marketing: 'שיווקי, פאנצ׳י, כותרת בולטת, אימוג׳ים מתאימים והנעה לפעולה',
    official: 'רשמי, מנומס, מכובד ומסודר',
    warm: 'אישי, חם, מחבר ומעודד',
    viral: 'קצר במיוחד (עד 100 תווים), אימוג׳י קולע ופאנץ׳ חזק',
  }[context.tone];

  return `
לטש ושפר את סטטוס הוואטסאפ הבא:
"${context.originalText}"

דגשים:
- טון מבוקש: ${toneDesc}.
- שמור על המסר המקורי, שפר זרימה ועיצוב וואטסאפ (*הדגשה*, אימוג'י).
- החזר אך ורק את הטקסט המשופר ללא הקדמות וללא מרכאות.
`.trim();
};

export const GENERATE_STATUS_VARIATIONS_PROMPT = (context: {
  topic: string;
  tone: WhatsAppStatusTone;
}) => `
כתוב 3 סטטוסים שונים לוואטסאפ בעברית בנושא: "${context.topic}".
טון: ${context.tone}.

החזר אך ורק מערך JSON תקני (ללא markdown):
[
  {"id": "v1", "title": "קצר ופאנצ'י", "text": "תוכן..."},
  {"id": "v2", "title": "עשיר ומחבר", "text": "תוכן..."},
  {"id": "v3", "title": "הנעה לפעולה", "text": "תוכן..."}
]
`.trim();

// ----------------------------------------------------------------------------
// 2. Dispatchers Sending Prompts to KOSAI whatsUpAiContract Monopoly Contract
// ----------------------------------------------------------------------------

export async function dispatchBotReplyToKosai(
  params: {
    userMessage: string;
    chatHistory?: { role: 'user' | 'model'; text: string }[];
    brandDna?: BrandDna | null;
    systemInstructionAddon?: string;
  },
  options?: { apiKey?: string; tenantId?: string; model?: string }
): Promise<string> {
  // 1. Zero-Token Check
  const localMatch = tryMatchLocalFaq(params.userMessage, params.brandDna);
  if (localMatch) {
    return localMatch;
  }

  // 2. Rolling History Window (last 3 messages only to save tokens)
  const recentHistory = (params.chatHistory || [])
    .slice(-3)
    .map(h => `${h.role === 'user' ? 'לקוח' : 'נציג'}: ${h.text}`)
    .join('\n');

  const denseContext = buildDenseBrandContext(params.brandDna);
  const combinedSystemInstruction = [
    denseContext,
    params.systemInstructionAddon
  ].filter(Boolean).join('\n\n');

  const prompt = GENERATE_BOT_REPLY_PROMPT({
    userMessage: params.userMessage,
    chatHistorySummary: recentHistory,
  });

  const res = await kosaiWhatsUpContract.generateBotReply(
    prompt,
    combinedSystemInstruction,
    {
      apiKey: options?.apiKey,
      tenantId: options?.tenantId,
      model: options?.model || 'gemini-3.8-flash-lite',
      maxOutputTokens: 200,
    }
  );

  return res.data;
}

export async function dispatchStatusEnhanceToKosai(
  params: {
    originalText: string;
    tone?: WhatsAppStatusTone;
    brandDna?: BrandDna | null;
  },
  options?: { apiKey?: string; tenantId?: string; model?: string }
): Promise<string> {
  const denseContext = buildDenseBrandContext(params.brandDna);
  const prompt = GENERATE_STATUS_ENHANCE_PROMPT({
    originalText: params.originalText,
    tone: params.tone || 'marketing',
  });

  const res = await kosaiWhatsUpContract.enhanceStatus(
    prompt,
    denseContext,
    {
      apiKey: options?.apiKey,
      tenantId: options?.tenantId,
      model: options?.model || 'gemini-3.8-flash-lite',
    }
  );

  return res.data;
}

export async function dispatchStatusVariationsToKosai(
  params: {
    topic: string;
    tone?: WhatsAppStatusTone;
    brandDna?: BrandDna | null;
  },
  options?: { apiKey?: string; tenantId?: string; model?: string }
): Promise<any[]> {
  const denseContext = buildDenseBrandContext(params.brandDna);
  const prompt = GENERATE_STATUS_VARIATIONS_PROMPT({
    topic: params.topic,
    tone: params.tone || 'marketing',
  });

  const res = await kosaiWhatsUpContract.generateStatusVariations(
    prompt,
    denseContext,
    {
      apiKey: options?.apiKey,
      tenantId: options?.tenantId,
      model: options?.model || 'gemini-3.8-flash-lite',
    }
  );

  try {
    const raw = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.variations)) return raw.variations;
  } catch {}
  return [];
}
