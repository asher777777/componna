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

export interface KosTubeAiGeneratedData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  focusKeywords: string[];
  tags: string[];
  h1: string;
  executiveSummary: string;
  keyTakeaways: string[];
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

    // 1. Model resolution according to cost mode
    let model = 'gemini-2.5-flash-lite';
    let wordLimit = 'עד 300 מילים (תמציתי ומדויק לחיסכון מרבי בטוקנים)';
    if (mode === 'balanced') {
      model = 'gemini-2.5-flash';
      wordLimit = '400-500 מילים (מאמר מאוזן ומקיף)';
    } else if (mode === 'deep') {
      model = 'gemini-2.5-pro';
      wordLimit = '650-800 מילים (ניתוח עומק מקצועי ומפורט)';
    }

    // 2. Token-saving input optimization: Truncate noisy description to 400 chars
    const rawDesc = customText && customText.trim().length > 10
      ? customText.trim().slice(0, 1500)
      : (video.description || '').trim().slice(0, 400);

    const brandName = brandDna?.identity?.companyName || 'העסק שלנו';
    const brandVision = brandDna?.identity?.companyVision || brandDna?.identity?.shortVision || '';
    const brandUvp = brandDna?.audience?.mainUvp || '';
    const targetAudience = brandDna?.audience?.targetAudiences?.map((a: any) => a.name || a.title || a).join(', ') || '';
    const brandServices = brandDna?.ecosystem?.services?.map((s: any) => s.name || s.title || s).join(', ') || '';
    const brandPersonality = brandDna?.voice?.personality;
    const powerWords = brandDna?.voice?.powerWords?.join(', ');
    const forbiddenWords = brandDna?.voice?.forbiddenWords?.join(', ');
    const genderAddressing = brandDna?.voice?.genderAddressing || 'רבים';

    const brandInstructions = includeBrand
      ? `=== חוק בעלות הטננט והמיתוג של KOSUN26 (כלל ברזל מחייב): ===
העמוד שייך באופן בלעדי לעסק/הטננט "${brandName}"!
הסרטון ביוטיוב (מאת "${channelTitle}") משמש כחומר גלם והשראה מקצועית.
מותר לתת קרדיט קצר בתוך גוף המאמר למקור הוידאו ("קרדיט מקור לוידאו: ${channelTitle}"), אך כל המאמר, הניתוח המקצועי, הטון, השפה, התובנות, והקריאה לפעולה (CTA) חייבים לייצג ב-100% את המותג והעסק "${brandName}" ואת שירותיו.

פרטי המותג והעסק של הטננט:
- שם העסק: "${brandName}"
${brandVision ? `- חזון ומהות העסק: "${brandVision}"` : ''}
${brandUvp ? `- הצעת ערך ייחודית (UVP): "${brandUvp}"` : ''}
${targetAudience ? `- קהל היעד של העסק: "${targetAudience}"` : ''}
${brandServices ? `- שירותים ומוצרים מרכזיים: "${brandServices}"` : ''}
- סגנון וטון דיבור (Voice & Tone): פנייה בלשון ${genderAddressing}${brandPersonality ? `, רשמיות ${brandPersonality.formality}/5, חמימות ${brandPersonality.warmth}/5, אנרגיה ${brandPersonality.energy}/5` : ''}.
${powerWords ? `- מילות כוח שיש לשלב: ${powerWords}` : ''}
${forbiddenWords ? `- מילים שאסור להשתמש בהן: ${forbiddenWords}` : ''}`
      : `=== הנחיות כתיבה כלליות (ללא חיבור למיתוג ספציפי): ===
כתוב כעורך תוכן ומומחה וידאו דיגיטלי אובייקטיבי וסמכותי.
התמקד בערך המקצועי של הוידאו, בתובנות המרכזיות ובמענה מדויק לכוונת החיפוש (Search Intent) של הגולשים.`;

    const prompt = `אתה מומחה בכיר לקידום אתרים, AI-SEO, וקופירייטינג לוידאו (Google SEO & AI Search Specialist).
המשימה שלך היא לקחת סרטון מיוטיוב או טקסט תוכן מצורף ולהפיק עבורו חבילת תוכן מובנית ומנצחת תחת תבנית "Kosvidio".

${brandInstructions}

נתוני המקור:
- כותרת: "${video.title || 'ללא כותרת'}"
- תיאור/תוכן מקור: "${rawDesc || 'תוכן וידאו מקצועי'}"
- ערוץ מקור: "${channelTitle}"
- מזהה וידאו: "${video.youtubeVideoId || ''}"
${customText ? `- תוכן/תמלול מותאם שהודבק ישירות: "${customText.slice(0, 1000)}"` : ''}

הוראות מפתח ליצירת התוכן:
1. סלאג (Slug): חובה שיהיה "kosvidio" או יתחיל ב-"kosvidio-" באותיות קטנות באנגלית (לדוגמה: "kosvidio-${(video.youtubeVideoId || 'clip').toLowerCase().replace(/[^a-z0-9]/g, '')}").
2. אורך מאמר עיקרי: ${wordLimit}. המאמר יולבש ישירות בתוך אזור תוכן אודות (About section) של בונה העמודים KWB. המאמר חייב לכלול כותרות H2 ו-H3, נקודות תובנה וסיכום.
3. שאלות ותשובות (FAQs): חובה לייצר בדיוק 5 שאלות ותשובות נפוצות, מקצועיות ורלוונטיות ביותר לגולשים ומנועי חיפוש.
4. תגיות (Tags): 6-8 תוויות עדינות ומדויקות ב-SEO.
5. אין להמציא תגובות מזויפות! התגובות מנוהלות אורגנית על ידי הגולשים בעמוד.
${includeBrand ? `6. קריאה לפעולה (Call to Action): חייבת להניע לפנות ישירות ל-"${brandName}".` : `6. קריאה לפעולה: הנעה לשתף את הסרטון ולצפות בתכנים נוספים.`}

החזר אך ורק JSON תקין במבנה המדויק הבא:
{
  "metaTitle": "כותרת מטא מושכת בין 50 ל-60 תווים כולל מילת מפתח עיקרית${includeBrand ? ` ומותג ${brandName}` : ''}",
  "metaDescription": "תיאור מטא מנצח באורך 140-160 תווים שגורם לגולש להקליק",
  "slug": "kosvidio",
  "focusKeywords": ["מילת מפתח 1", "מילת מפתח 2", "מילת מפתח 3", "מילת מפתח 4"],
  "tags": ["תגית 1", "תגית 2", "תגית 3", "תגית 4", "תגית 5", "תגית 6"],
  "h1": "כותרת ראשית מרשימה וממוקדת למאמר",
  "executiveSummary": "על הסרטון בכמה מילים - תיאור קצר וקולע של 2-3 משפטים על התובנות המרכזיות בוידאו",
  "keyTakeaways": [
    "תובנת מפתח ראשונה וחשובה מהוידאו",
    "תובנת מפתח שנייה",
    "תובנת מפתח שלישית",
    "תובנת מפתח רביעית"
  ],
  "articleContent": "מאמר עומק ומקצועי בעברית (בפורמט Markdown הכולל כותרות H2, H3, פסקאות מנומקות וקרדיט מקור ל-${channelTitle}).",
  "faqs": [
    {"question": "שאלה נפוצה ראשונה בנושא הוידאו?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה שנייה?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה שלישית?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה רביעית?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה חמישית?", "answer": "תשובה מקיפה וממוקדת"}
  ],
  "callToAction": {
    "title": "${includeBrand ? `רוצים לקחת את הידע הזה צעד קדימה עם ${brandName}?` : 'אהבתם את התוכן והתובנות? פנו לקבלת מידע נוסף'}",
    "subtitle": "${includeBrand ? 'פנו אלינו ונשמח לבנות עבורכם תוכנית עבודה מותאמת אישית' : 'הצטרפו לקהילה וקבלו עדכונים שוטפים'}",
    "buttonText": "צרו קשר עכשיו",
    "buttonLink": "#contact"
  }
}`;

    const systemInstruction = includeBrand
      ? `אתה מומחה ה-SEO והתוכן המוביל. כתוב בקולו של המותג "${brandName}", תוך שמירה מוחלטת על חוקי המיתוג של KOSUN26. שמור על אורך של ${wordLimit} ובדיוק 5 שאלות ותשובות. החזר אך ורק תשובת JSON תקינה ומדויקת.`
      : `אתה מומחה תוכן ו-SEO דיגיטלי. כתוב סקירה אובייקטיבית וסמכותית באורך של ${wordLimit} ובדיוק 5 שאלות ותשובות. החזר אך ורק תשובת JSON תקינה ומדויקת.`;

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
