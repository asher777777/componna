import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai';
import { BrandDna } from '../../brand-dna-hub/types/brandDna';

export interface WhatsAppBotButton {
  buttonId: string;
  buttonText: string;
  actionType: 'prompt' | 'message' | 'link';
  actionValue?: string;
}

export interface WhatsAppAiBotConfig {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  isActive: boolean;
  triggerType: 'all' | 'keyword' | 'welcome';
  triggerKeywords: string[];
  systemPrompt: string;
  model: string;
  temperature: number;
  interactiveButtons: WhatsAppBotButton[];
  autoGenerateButtons: boolean;
  createdAt: number;
}

export type StatusTone = 'chasidic' | 'marketing' | 'official' | 'warm' | 'viral';

export interface StatusVariation {
  id: string;
  title: string;
  text: string;
  category: string;
}

export const STATUS_TONE_LABELS: Record<StatusTone, { label: string; icon: string; desc: string }> = {
  chasidic: { label: 'תורני / חסידי', icon: '✡️', desc: 'חיזוק, פתגמים חסידיים, מוסר ופסוקים' },
  marketing: { label: 'שיווקי ומשכנע', icon: '🚀', desc: 'הנעה חזקה לפעולה, הטבות ומבצעים' },
  official: { label: 'רשמי ומכובד', icon: '👔', desc: 'ניסוח עסקי, קהילתי ומנומס' },
  warm: { label: 'חם וידידותי', icon: '😊', desc: 'נימה אישית, נעימה ומחברת' },
  viral: { label: 'קצר וקולע', icon: '⚡', desc: 'סטורי פאנצ׳י עד 120 תווים עם אימוג׳י' },
};

export const STATUS_PRESETS = [
  {
    id: 'chasidic_sukkot',
    label: 'דבר תורה חסידי לסוכות',
    icon: '🌿',
    defaultTopic: 'דבר תורה חסידי לחג הסוכות על קדושת האושפיזין ואחדות ישראל תחת צלא דמהימנותא',
    tone: 'chasidic' as StatusTone,
  },
  {
    id: 'chasidic_parasha',
    label: 'פתגם חסידי ופרשת שבוע',
    icon: '📜',
    defaultTopic: 'ווארט חסידי קצר ומאיר לפרשת השבוע עם מסר מעשי לעבודת השם ושמחה',
    tone: 'chasidic' as StatusTone,
  },
  {
    id: 'flash_sale',
    label: 'מבצע בזק והנחה מיוחדת',
    icon: '🛍️',
    defaultTopic: 'מבצע מיוחד ל-24 שעות הקרובות עם הנחה בלעדית לצופי הסטטוס בוואטסאפ',
    tone: 'marketing' as StatusTone,
  },
  {
    id: 'community_news',
    label: 'עדכון חשוב לקהילה',
    icon: '📢',
    defaultTopic: 'הודעה ועדכון חשוב לקהילה על פעילות חדשה, זמני פתיחה או אירוע קרוב',
    tone: 'official' as StatusTone,
  },
  {
    id: 'value_tip',
    label: 'טיפ מקצועי וערך מוסף',
    icon: '💡',
    defaultTopic: 'טיפ מקצועי יומי קצר ומנצח שחוסך זמן וכסף בתחום שלנו',
    tone: 'warm' as StatusTone,
  },
  {
    id: 'event_invite',
    label: 'הזמנה לאירוע / שיעור',
    icon: '🎟️',
    defaultTopic: 'הזמנה אישית להשתתף באירוע / שיעור / כנס מרתק שיתקיים השבוע',
    tone: 'warm' as StatusTone,
  },
];

export const DEFAULT_AI_BOTS: WhatsAppAiBotConfig[] = [
  {
    id: 'bot_customer_service',
    name: 'בוט שירות לקוחות ומכירות',
    role: 'נציג שירות ומידע חכם',
    avatarIcon: 'Sparkles',
    isActive: true,
    triggerType: 'all',
    triggerKeywords: ['היי', 'שלום', 'עזרה', 'מחיר', 'מידע'],
    systemPrompt: `אתה נציג שירות לקוחות ודיגיטל בכיר ומקצועי של מערכת Comona.
תפקידך להעניק מענה אדיב, מהיר, מדויק ותמציתי בעברית בוואטסאפ.
שמור על נימה שירותית, עניינית, עם אימוג'י במידה.
אם הלקוח שואל על מחיר או מוצרים - ענה בקצרה והצע לו לבחור באחד הכפתורים מטה.`,
    model: 'gemini-3.6-flash',
    temperature: 0.7,
    interactiveButtons: [
      { buttonId: 'btn_pricing', buttonText: '💰 קבלת הצעת מחיר', actionType: 'prompt', actionValue: 'מה המחיר של המערכת?' },
      { buttonId: 'btn_human_agent', buttonText: '📞 שיחה עם נציג', actionType: 'message', actionValue: 'נציג שירות יחזור אליך בהקדם!' },
      { buttonId: 'btn_faq', buttonText: 'ℹ️ שאלות נפוצות', actionType: 'prompt', actionValue: 'ספר לי על היכולות העיקריות שלכם' },
    ],
    autoGenerateButtons: true,
    createdAt: Date.now(),
  },
  {
    id: 'bot_tech_support',
    name: 'בוט תמיכה טכנית',
    role: 'תומך טכני אוטומטי',
    avatarIcon: 'ShieldCheck',
    isActive: false,
    triggerType: 'keyword',
    triggerKeywords: ['תקלה', 'לא עובד', 'שגיאה', 'עזרה טכנית', 'סנכרון'],
    systemPrompt: `אתה מומחה תמיכה טכנית של Comona. עזור ללקוח לפתור בעיות חיבור, סנכרון והגדרות באופן ברור ויעיל.`,
    model: 'gemini-3.6-flash',
    temperature: 0.4,
    interactiveButtons: [
      { buttonId: 'btn_reboot', buttonText: '🔄 בדיקת סטטוס מופע', actionType: 'prompt', actionValue: 'כיצד מאתחלים את המופע?' },
      { buttonId: 'btn_support_agent', buttonText: '🛠 פתיחת קריאת שירות', actionType: 'message', actionValue: 'קריאת שירות נפתחה בהצלחה.' },
    ],
    autoGenerateButtons: false,
    createdAt: Date.now(),
  },
];

/**
 * Resolves any custom / UI model alias into a valid, live Google AI Studio API model
 * Standardized across Comona (Video Studio, Avatar Creator, Brand DNA).
 */
export function getValidGeminiModel(requestedModel?: string): string {
  if (!requestedModel) return 'gemini-3.6-flash';
  const clean = requestedModel.toLowerCase().trim();

  if (clean.includes('3.8-flash') || clean === 'gemini-3.8-flash') return 'gemini-3.8-flash';
  if (clean.includes('3.7-flash') || clean === 'gemini-3.7-flash') return 'gemini-3.7-flash';
  if (clean.includes('3.6-flash') || clean === 'gemini-3.6-flash') return 'gemini-3.6-flash';
  if (clean.includes('3.5-flash-lite')) return 'gemini-3.5-flash-lite';
  if (clean.includes('3.5-flash')) return 'gemini-3.5-flash';
  if (clean.includes('pro')) return 'gemini-3.1-pro-preview';
  if (clean.includes('lite')) return 'gemini-3.5-flash-lite';

  return 'gemini-3.6-flash';
}

/**
 * Helper to construct Brand DNA Guidelines text block
 */
function buildBrandDnaPromptBlock(brandDna?: BrandDna | null): string {
  if (!brandDna) return '';

  const { identity, voice, audience, trust } = brandDna;
  const formalityNames = ['מאוד קליל וחברי', 'קליל', 'מאוזן ומקצועי', 'רשמי', 'רשמי ומוקפד מאוד'];
  const formalityText = formalityNames[(voice?.personality?.formality || 3) - 1] || 'מאוזן';

  return `
========================================
🔥 MANDATORY BRAND DNA & VOICE GUIDELINES (מרכז מיתוג גלובלי):
- Company Name: ${identity?.companyName || 'המותג'}
- Brand Slogan: ${identity?.slogan || ''}
- Company Purpose / Vision: ${identity?.companyVision || identity?.organizationPurpose || ''}
- Unique Value Proposition (UVP): ${audience?.mainUvp || ''}
- Brand Voice Tone: רמת רשמיות ${voice?.personality?.formality || 3}/5 (${formalityText}), חמימות ${voice?.personality?.warmth || 4}/5, אנרגיה ${voice?.personality?.energy || 4}/5.
- Gender / Audience Addressing: ${voice?.genderAddressing || 'plural'} (למשל: פנייה בלשון רבים / ניטרלית בהתאם למותג)
- Sector Compliance: ${voice?.sectorCompliance || 'general'}
- MANDATORY POWER WORDS (יש לשלב באופן טבעי אם מתאים): ${(voice?.powerWords || []).join(', ') || ''}
- FORBIDDEN WORDS (אסור בתכלית האיסור להשתמש במילים אלו!): ${(voice?.forbiddenWords || []).join(', ') || ''}
- Trust & Contact: טלפון/וואטסאפ: ${trust?.whatsappSupportNumber || trust?.contactPhone || ''}
========================================
`;
}

export class WhatsAppAiBotService {
  private static STORAGE_KEY = 'comona_whatsapp_ai_bots';

  public static getStoredBots(): WhatsAppAiBotConfig[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load stored AI bots:', e);
    }
    return DEFAULT_AI_BOTS;
  }

  public static saveBots(bots: WhatsAppAiBotConfig[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bots));
    } catch (e) {
      console.error('Failed to save AI bots:', e);
    }
  }

  /**
   * Resilient Gemini API Caller using Comona's Next-Gen 3.x Flash/Pro model hierarchy
   */
  public static async callGeminiApi(params: {
    apiKey: string;
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    preferredModel?: string;
    maxOutputTokens?: number;
    brandDna?: BrandDna | null;
  }): Promise<{ text: string; costReport: TokenUsageReport }> {
    const {
      apiKey,
      prompt,
      systemInstruction,
      temperature = 0.7,
      preferredModel,
      maxOutputTokens = 1000,
      brandDna,
    } = params;

    if (!apiKey || !apiKey.trim()) {
      throw new Error('לא הוגדר מפתח Google AI (Gemini) במערכת. אנא הגדר את המפתח בחיבורי המערכת.');
    }

    const cleanKey = apiKey.trim();
    const primaryModel = getValidGeminiModel(preferredModel);

    // Comona Next-Gen Gemini 3.x Flash/Pro Fallback Chain
    const modelsToTry = [
      primaryModel,
      'gemini-3.6-flash',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-pro-preview',
    ];

    const uniqueModels = Array.from(new Set(modelsToTry));
    let lastError: any = null;

    const brandDnaBlock = buildBrandDnaPromptBlock(brandDna);
    const combinedSystemInstruction = [
      systemInstruction,
      brandDnaBlock
    ].filter(Boolean).join('\n\n');

    for (const model of uniqueModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

        const bodyPayload: any = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        };

        if (combinedSystemInstruction) {
          bodyPayload.system_instruction = {
            role: 'user',
            parts: [{ text: combinedSystemInstruction }],
          };
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            const promptTokens = data.usageMetadata?.promptTokenCount || 200;
            const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 150;
            const costReport = calculateGeminiCost({
              model,
              promptTokens,
              candidatesTokens,
            });
            return { text, costReport };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = new Error(errData?.error?.message || `Google API Error (${res.status} ${res.statusText})`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('לא התקבלה תשובה משירות ה-AI של Google Gemini.');
  }

  /**
   * Enhances / Polishes existing WhatsApp status or message text
   */
  public static async enhanceStatusText(params: {
    apiKey: string;
    originalText: string;
    tone?: StatusTone;
    preferredModel?: string;
    brandDna?: BrandDna | null;
  }): Promise<{ text: string; costReport?: TokenUsageReport }> {
    const { apiKey, originalText, tone = 'marketing', preferredModel, brandDna } = params;

    const toneInstruction = {
      chasidic: 'בסגנון תורני חסידי מאיר ומחזק, עם פתגם חסידי / פסוק מתאים, לשון נקייה ומכובדת, וברכת הצלחה.',
      marketing: 'בסגנון שיווקי מושך, פאנצ׳י, עם כותרת בולטת, נקודות מפתח ברורות, אימוג׳ים מתאימים והנעה לפעולה (CTA) ברורה.',
      official: 'בסגנון רשמי, מנומס, מכובד, בהיר ומסודר המתאים להודעה לקהילה או ללקוחות עסקיים.',
      warm: 'בסגנון חם, אישי, מעודד ומחבר עם נימה נעימה ורגשית.',
      viral: 'בסגנון קצר במיוחד, ויראלי וקולע לסטורי (עד 120 תווים), עם אימוג׳י מדויקים ופאנץ׳ חזק.',
    }[tone];

    const prompt = `אתה מומחה קופירייטינג ושיווק בוואטסאפ (WhatsApp Story & Status Copywriter).
קח את הטקסט הבא שכתב המשתמש, שפר ולטש אותו בצורה מקצועית:
"${originalText}"

דגשים:
1. ${toneInstruction}
2. שמור על המסר המקורי של המשתמש אך הפוך אותו למרתק וקריא פי כמה.
3. השתמש בעיצוב וואטסאפ מתאים (כגון הדגשות *כוכביות* או מקפים).
4. החזר אך ורק את הטקסט המשופר המוכן לפרסום בעברית, ללא הערות, ללא מרכאות מסביב וללא הסברים.`;

    const res = await this.callGeminiApi({
      apiKey,
      prompt,
      systemInstruction: 'אתה מומחה לכתיבת סטטוסים והודעות וואטסאפ בעברית קולחת ומדויקת.',
      temperature: 0.7,
      preferredModel,
      brandDna,
    });

    return { text: res.text, costReport: res.costReport };
  }

  /**
   * Generates 3 distinct status variations from topic or preset
   */
  public static async generateStatusVariations(params: {
    apiKey: string;
    topic: string;
    tone?: StatusTone;
    preferredModel?: string;
    brandDna?: BrandDna | null;
  }): Promise<{ variations: StatusVariation[]; costReport?: TokenUsageReport }> {
    const { apiKey, topic, tone = 'chasidic', preferredModel, brandDna } = params;

    const prompt = `כתוב 3 גרסאות שונות של סטטוס לוואטסאפ (WhatsApp Story) בעברית בנושא: "${topic}".
הטון המבוקש הוא: ${STATUS_TONE_LABELS[tone].label} (${STATUS_TONE_LABELS[tone].desc}).

פורמט התשובה המבוקש (JSON בלבד):
[
  {
    "id": "v1",
    "title": "גרסה 1: קצר ופאנצ׳י",
    "text": "תוכן הסטטוס..."
  },
  {
    "id": "v2",
    "title": "גרסה 2: עשיר ומחבר",
    "text": "תוכן הסטטוס..."
  },
  {
    "id": "v3",
    "title": "גרסה 3: הנעה חזקה לפעולה",
    "text": "תוכן הסטטוס..."
  }
]

דרישות:
- החזר JSON תקני בלבד ללא Markdown backticks מסביב.
- כל סטטוס חייב להכיל אימוג'ים מתאימים ומבנה קריא.`;

    try {
      const res = await this.callGeminiApi({
        apiKey,
        prompt,
        systemInstruction: 'אתה מחולל סטטוסים לוואטסאפ בעברית המחזיר אך ורק מערך JSON תקני.',
        temperature: 0.8,
        preferredModel,
        brandDna,
      });

      const cleaned = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const variations = parsed.map((item: any, idx: number) => ({
          id: item.id || `v_${idx + 1}`,
          title: item.title || `אפשרות ${idx + 1}`,
          text: item.text || item.content || '',
          category: topic,
        }));
        return { variations, costReport: res.costReport };
      }
    } catch (err) {
      console.warn('Fallback parsing JSON variations failed, falling back to single generate:', err);
    }

    // Fallback single generation if JSON parsing failed
    const singleRes = await this.callGeminiApi({
      apiKey,
      prompt: `כתוב סטטוס וואטסאפ מרתק בעברית בנושא: "${topic}". טון: ${STATUS_TONE_LABELS[tone].label}. החזר רק את הטקסט המוכן.`,
      preferredModel,
      brandDna,
    });

    return {
      variations: [
        {
          id: 'v1',
          title: 'הצעה מובילה',
          text: singleRes.text,
          category: topic,
        },
      ],
      costReport: singleRes.costReport,
    };
  }

  /**
   * Generates AI response for chatbot interactive simulator
   */
  public static async generateAiResponse(params: {
    apiKey: string;
    botConfig: WhatsAppAiBotConfig;
    userMessage: string;
    chatHistory?: { role: 'user' | 'model'; text: string }[];
    brandDna?: BrandDna | null;
  }): Promise<{ replyText: string; buttons: { buttonId: string; buttonText: string }[]; costReport?: TokenUsageReport }> {
    const { apiKey, botConfig, userMessage, chatHistory = [], brandDna } = params;

    if (!apiKey || !apiKey.trim()) {
      return {
        replyText: '⚠️ לא הוגדר מפתח Google AI (Gemini) במערכת. אנא הגדר את המפתח ברכיב הסנכרון וההגדרות.',
        buttons: botConfig.interactiveButtons.map((b) => ({
          buttonId: b.buttonId,
          buttonText: b.buttonText,
        })),
      };
    }

    const historyContext = chatHistory
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'לקוח' : 'נציג'}: ${h.text}`)
      .join('\n');

    const prompt = `${historyContext ? `היסטוריית שיחה:\n${historyContext}\n\n` : ''}הודעת הלקוח: "${userMessage}"\n\nהשב ללקוח בעברית טבעית, תמציתית ונעימה לוואטסאפ:`;

    try {
      const res = await this.callGeminiApi({
        apiKey,
        prompt,
        systemInstruction: `SYSTEM INSTRUCTIONS:\n${botConfig.systemPrompt}\nהשב בעברית קולחת, תמציתית ונעימה לוואטסאפ.`,
        temperature: botConfig.temperature ?? 0.7,
        preferredModel: botConfig.model || 'gemini-3.6-flash',
        brandDna,
      });

      const buttons = botConfig.interactiveButtons.slice(0, 3).map((b) => ({
        buttonId: b.buttonId,
        buttonText: b.buttonText,
      }));

      return {
        replyText: res.text.trim(),
        buttons,
        costReport: res.costReport,
      };
    } catch (err: any) {
      console.error('Gemini generate error:', err);
      return {
        replyText: `שלום! עקב תקלה זמנית בחיבור ל-AI: ${err.message || 'לא ניתן לעבד כרגע'}.\nאנו לשירותך תמיד.`,
        buttons: botConfig.interactiveButtons.slice(0, 3).map((b) => ({
          buttonId: b.buttonId,
          buttonText: b.buttonText,
        })),
      };
    }
  }
}
