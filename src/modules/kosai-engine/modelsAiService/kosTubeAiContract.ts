/**
 * KOSAI AI Monopoly - KosTube AI Contract
 * KOSUN26 Gate 3: Monopoly enforcement.
 * All YouTube & Video SEO generation requests MUST route through this contract.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';

export type KosTubeAiMode = 'eco' | 'balanced' | 'deep';

export interface KosTubeAiGenerationInput {
  video: {
    youtubeVideoId?: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    viewCount?: number;
    likeCount?: number;
    publishedAt?: string;
  };
  channelTitle?: string;
  customText?: string;
  mode?: KosTubeAiMode; // default: 'eco'
  includeBrand?: boolean; // default: true
  brandDna?: any;
  options?: {
    apiKey?: string;
    tenantId?: string;
    skipCache?: boolean;
  };
}

export interface KosTubeAiTakeawayItem {
  title: string;
  text: string;
}

export interface KosTubeAiGeneratedData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  focusKeywords: string[];
  tags: string[];
  h1: string;
  executiveSummary: string;
  keyTakeaways: Array<KosTubeAiTakeawayItem | string>;
  articleContent: string;
  faqs: Array<{ question: string; answer: string }>;
  callToAction?: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  };
}

export const kosTubeAiContract = {
  /**
   * Generates high-impact Video SEO page content adhering strictly to token-efficiency,
   * tenant branding rules, exactly 5 FAQs, and optional direct-text transcription.
   */
  async generateVideoSeoContent(
    input: KosTubeAiGenerationInput
  ): Promise<KosaiContractResult<KosTubeAiGeneratedData>> {
    const mode = input.mode || 'eco';
    const includeBrand = input.includeBrand !== false; // default true
    const { video, channelTitle = 'ערוץ יוטיוב', customText = '', brandDna, options } = input;

    // 1. Model resolution according to cost mode - Standardized exclusively on the 3 Gemini 3.8 variations
    let model = 'gemini-3.8-flash-lite';
    if (mode === 'balanced') {
      model = 'gemini-3.8-flash';
    } else if (mode === 'deep') {
      model = 'gemini-3.8-pro';
    }

    // 2. Token-saving input optimization: Truncate noisy description to 400 chars
    const rawDesc = customText && customText.trim().length > 10
      ? customText.trim().slice(0, 1500)
      : (video.description || '').trim().slice(0, 400);

    const brandName = brandDna?.identity?.companyName || 'העסק שלנו';
    const brandVision = brandDna?.identity?.companyVision || brandDna?.identity?.shortVision || '';
    const brandSlogan = brandDna?.identity?.slogan || '';
    const brandUvp = brandDna?.audience?.mainUvp || '';
    const targetAudience = brandDna?.audience?.targetAudiences?.map((a: any) => a.name || a.title || a).join(', ') || '';
    const brandServices = brandDna?.ecosystem?.services?.map((s: any) => s.name || s.title || s).join(', ') || '';
    const brandPersonality = brandDna?.voice?.personality;
    const toneOfVoice = brandDna?.voice?.toneOfVoice || brandDna?.voice?.tone || '';
    const powerWords = brandDna?.voice?.powerWords?.join(', ');
    const forbiddenWords = brandDna?.voice?.forbiddenWords?.join(', ');
    const genderAddressing = brandDna?.voice?.genderAddressing || 'רבים';

    const brandInstructions = includeBrand
      ? `=== חוק בעלות הטננט והמיתוג של KOSUN26: ===
העמוד שייך בלעדית לטננט "${brandName}". הסרטון מאת "${channelTitle}" משמש כהשראה ותוכן מקור.
השפה, התובנות, הדגשים וה-CTA חייבים לייצג במדויק את שפת המותג של "${brandName}".
- שם העסק והמותג: "${brandName}"
${brandSlogan ? `- סלוגן המותג: "${brandSlogan}"` : ''}
${brandVision ? `- חזון: "${brandVision}"` : ''}
${brandUvp ? `- ערך ייחודי (UVP): "${brandUvp}"` : ''}
${targetAudience ? `- קהל היעד: "${targetAudience}"` : ''}
${toneOfVoice ? `- טון וסגנון המותג: "${toneOfVoice}"` : ''}
${brandServices ? `- שירותים מרכזיים: "${brandServices}"` : ''}
- סגנון פנייה: בלשון ${genderAddressing}${brandPersonality ? `, רשמיות ${brandPersonality.formality}/5, חמימות ${brandPersonality.warmth}/5` : ''}.
${powerWords ? `- מילות כוח שמומלץ לשלב: ${powerWords}` : ''}
${forbiddenWords ? `- מילים אסורות: ${forbiddenWords}` : ''}`
      : `=== הנחיות כתיבה כלליות: ===
כתוב כעורך תוכן ומומחה וידאו דיגיטלי אובייקטיבי, מרתק וסמכותי.`;

    const prompt = `אתה מומחה בכיר ל-AI-SEO, קופירייטינג ממוקד ואסטרטגיית תוכן וידאו.
עליך לנתח את הסרטון המצורף ולהפיק חבילת תוכן מובנית ומדויקת (בדיוק כמו ביצירת עמוד שירות), המוזרקת ישירות לאזורים הייעודיים של KWB (כותרת, נגן, תובנות, שאלות-תשובות ו-CTA).
אין צורך במאמר ארוך או ב-HTML חופשי. התמקד בנתונים תמציתיים, חדים ומנצחים.

${brandInstructions}

נתוני המקור:
- כותרת הסרטון: "${video.title || 'ללא כותרת'}"
- תיאור/תקציר מקור: "${rawDesc || 'תוכן וידאו מקצועי'}"
- ערוץ מקור: "${channelTitle}"
- מזהה וידאו: "${video.youtubeVideoId || ''}"
${customText ? `- תוכן/תמלול מצורף: "${customText.slice(0, 1000)}"` : ''}

הנחיות חובה:
1. סלאג (Slug): סלאג SEO קצר, ענייני ומנצח באנגלית בלבד באותיות קטנות ומקפים (kebab-case, לדוגמה: "struggles-self-control-tanya" או "${(video.youtubeVideoId || 'clip').toLowerCase().replace(/[^a-z0-9]/g, '')}"). ללא המילה "kosvidio" וללא קידומת /p/.
2. כותרת ראשית (h1): כותרת שיווקית וממוקדת שמבליטה את הערך המרכזי.
3. תמצית מנהלים (executiveSummary): 2-3 משפטים ממוקדים על מהות הסרטון והערך לצופה.
4. תובנות מפתח (keyTakeaways): 4-5 תובנות מפתח סוחפות וחדות הנלמדות מהוידאו.
   *** דגש קריטי על כותרות התובנות ***:
   עבור כל תובנה חובה לתת אובייקט עם שני שדות:
   - "title": כותרת מעניינת, סוחפת ומסקרנת (2 עד 5 מילים) התואמת במדויק את הטון, הסגנון והאווירה של מותג הטננט "${brandName}" (איסור מוחלט על שמות גנריים כמו "תובנה 1", "תובנה מרכזית 2" וכו'!).
   - "text": הסבר תמציתי ומעשי (1-2 משפטים) המציג את התובנה המעשית והערך לצופה.
5. שאלות ותשובות (faqs): בדיוק 5 שאלות ותשובות נפוצות, מעמיקות ובעלות ערך חיפוש אמיתי.
6. הנעה לפעולה (callToAction): כותרת, תת-כותרת וטקסט כפתור המניעים ליצירת קשר עם "${brandName}".
7. אפס תגובות מזויפות: אין לייצר תגובות, התגובות מגיעות מהגולשים.

החזר אך ורק JSON תקין במבנה המדויק הבא:
{
  "metaTitle": "כותרת מטא מושכת בין 50 ל-60 תווים כולל מילת מפתח עיקרית${includeBrand ? ` ומותג ${brandName}` : ''}",
  "metaDescription": "תיאור מטא מנצח באורך 140-160 תווים שגורם להקליק",
  "slug": "${(video.youtubeVideoId || 'video-clip').toLowerCase().replace(/[^a-z0-9]/g, '')}",
  "focusKeywords": ["מילת מפתח 1", "מילת מפתח 2", "מילת מפתח 3", "מילת מפתח 4"],
  "tags": ["תגית 1", "תגית 2", "תגית 3", "תגית 4", "תגית 5", "תגית 6"],
  "h1": "כותרת ראשית מרשימה וממוקדת",
  "executiveSummary": "תמצית קצרה וקולעת של 2-3 משפטים על התובנות המרכזיות בוידאו",
  "keyTakeaways": [
    {
      "title": "כותרת ראשונה סוחפת ומסקרנת לפי שפת המותג ${brandName}",
      "text": "הסבר מעשי ותמציתי של 1-2 משפטים על התובנה"
    },
    {
      "title": "כותרת שנייה מעניינת ומעצימה",
      "text": "הסבר מעשי ותמציתי"
    },
    {
      "title": "כותרת שלישית חדה וממוקדת",
      "text": "הסבר מעשי ותמציתי"
    },
    {
      "title": "כותרת רביעית מעוררת השראה",
      "text": "הסבר מעשי ותמציתי"
    }
  ],
  "articleContent": "",
  "faqs": [
    {"question": "שאלה נפוצה ראשונה בנושא הוידאו?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה שנייה?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה שלישית?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה רביעית?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה חמישית?", "answer": "תשובה מקיפה וממוקדת"}
  ],
  "callToAction": {
    "title": "${includeBrand ? `רוצים להעמיק בנושא עם ${brandName}?` : 'אהבתם את התוכן והתובנות? פנו לקבלת מידע נוסף'}",
    "subtitle": "${includeBrand ? 'פנו אלינו ונשמח ללוות אתכם באופן אישי ומקצועי' : 'הצטרפו לקהילה וקבלו עדכונים שוטפים'}",
    "buttonText": "צרו קשר עכשיו",
    "buttonLink": "#sec-cta"
  }
}`;

    const systemInstruction = includeBrand
      ? `אתה מומחה ה-SEO והתוכן המוביל. כתוב בקולו של המותג "${brandName}", תוך שמירה מוחלטת על חוקי המיתוג של KOSUN26. שמור על תוכן תמציתי ומדויק להזרקה באזורי KWB ובדיוק 5 שאלות ותשובות. החזר אך ורק תשובת JSON תקינה ומדויקת.`
      : `אתה מומחה תוכן ו-SEO דיגיטלי. כתוב סקירה אובייקטיבית וסמכותית, תוכן מובנה ובדיוק 5 שאלות ותשובות. החזר אך ורק תשובת JSON תקינה ומדויקת.`;

    const cacheKey = `kosvidio_${video.youtubeVideoId || 'custom'}_${mode}_${includeBrand ? 'brand' : 'nobrand'}`;

    return executeKosaiAi<KosTubeAiGeneratedData>('KosTube', prompt, {
      model,
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.7,
      cacheKey,
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },
};
