import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai';
import { BrandDna } from '../../../core/contracts';
import { collection, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { functionsApi } from '../api/functionsApi';
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
  matchMode?: 'contains' | 'exact' | 'startsWith';
  kosaiRuleId?: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  interactiveButtons: WhatsAppBotButton[];
  autoGenerateButtons: boolean;
  knowledgeBase?: {
    type: 'pdf' | 'collection' | 'url' | 'none';
    source: string;
  };
  createdAt: number;
}

/**
 * Normalizes text for matching by removing invisible Unicode marks, RTL/LTR marks,
 * Hebrew Niqqud, punctuation, and extraneous spacing.
 */
export function normalizeTextForMatching(text: string): string {
  if (!text) return '';
  return text
    // Remove invisible unicode characters, bidirectional control, zero-width spaces
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    // Remove Hebrew Niqqud
    .replace(/[\u0591-\u05C7]/g, '')
    // Replace non-breaking spaces with standard space
    .replace(/\u00A0/g, ' ')
    .toLowerCase()
    .trim();
}

/**
 * Splits and flattens keyword lists (handles comma, semicolon, newline delimiters)
 */
export function flattenKeywords(keywords: string[] | string): string[] {
  if (!keywords) return [];
  const list = Array.isArray(keywords) ? keywords : [String(keywords)];
  const result: string[] = [];
  for (const item of list) {
    if (typeof item === 'string') {
      const parts = item.split(/[,;\n\t]+/).map(p => p.trim()).filter(Boolean);
      result.push(...parts);
    }
  }
  return result;
}

/**
 * Smart Keyword Matching Helper for WhatsApp AI Agents
 * Normalizes text, handles punctuation, and matches by contains / exact / startsWith.
 */
export function checkKeywordMatch(
  messageText: string,
  keywords: string[] = [],
  matchMode: 'contains' | 'exact' | 'startsWith' = 'contains'
): { isMatch: boolean; matchedKeyword?: string } {
  if (!messageText || !keywords) {
    return { isMatch: false };
  }

  const normMsg = normalizeTextForMatching(messageText);
  if (!normMsg) return { isMatch: false };

  // Strip punctuation for clean tokenization
  const strippedMsg = normMsg.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'״׳]/g, ' ');
  const msgWords = strippedMsg.split(/\s+/).filter(Boolean);
  const flattened = flattenKeywords(keywords);

  for (const rawKw of flattened) {
    const normKw = normalizeTextForMatching(rawKw);
    if (!normKw) continue;

    const strippedKw = normKw.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'״׳]/g, ' ').trim();
    if (!strippedKw) continue;

    if (matchMode === 'exact') {
      // 1. Direct equality
      if (normMsg === normKw || strippedMsg === strippedKw) {
        return { isMatch: true, matchedKeyword: rawKw };
      }
      // 2. Single-word token in message
      if (msgWords.includes(strippedKw)) {
        return { isMatch: true, matchedKeyword: rawKw };
      }
      // 3. Multi-word phrase boundary matching
      const boundaryRegex = new RegExp(`(^|\\s)${strippedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
      if (boundaryRegex.test(strippedMsg)) {
        return { isMatch: true, matchedKeyword: rawKw };
      }
    } else if (matchMode === 'startsWith') {
      if (normMsg.startsWith(normKw) || strippedMsg.startsWith(strippedKw)) {
        return { isMatch: true, matchedKeyword: rawKw };
      }
    } else {
      // Default: 'contains'
      if (normMsg.includes(normKw) || strippedMsg.includes(strippedKw)) {
        return { isMatch: true, matchedKeyword: rawKw };
      }
    }
  }

  return { isMatch: false };
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
    systemPrompt: `אתה נציג שירות לקוחות ודיגיטל בכיר ומקצועי של מערכת Kosun.
תפקידך להעניק מענה אדיב, מהיר, מדויק ותמציתי בעברית בוואטסאפ.
שמור על נימה שירותית, עניינית, עם אימוג'י במידה.
אם הלקוח שואל על מחיר או מוצרים - ענה בקצרה והצע לו לבחור באחד הכפתורים מטה.`,
    model: 'gemini-3.8-flash',
    temperature: 0.7,
    interactiveButtons: [
      { buttonId: 'btn_pricing', buttonText: 'קבלת הצעת מחיר', actionType: 'prompt', actionValue: 'מה המחיר של המערכת?' },
      { buttonId: 'btn_human_agent', buttonText: 'שיחה עם נציג', actionType: 'message', actionValue: 'נציג שירות יחזור אליך בהקדם!' },
      { buttonId: 'btn_faq', buttonText: 'שאלות נפוצות', actionType: 'prompt', actionValue: 'ספר לי על היכולות העיקריות שלכם' },
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
    systemPrompt: `אתה מומחה תמיכה טכנית של Kosun. עזור ללקוח לפתור בעיות חיבור, סנכרון והגדרות באופן ברור ויעיל.`,
    model: 'gemini-3.8-flash',
    temperature: 0.4,
    interactiveButtons: [
      { buttonId: 'btn_reboot', buttonText: 'בדיקת סטטוס מופע', actionType: 'prompt', actionValue: 'כיצד מאתחלים את המופע?' },
      { buttonId: 'btn_support_agent', buttonText: '🛠 פתיחת קריאת שירות', actionType: 'message', actionValue: 'קריאת שירות נפתחה בהצלחה.' },
    ],
    autoGenerateButtons: false,
    createdAt: Date.now(),
  },
];

export const OFFICIAL_GEMINI_MODELS = [
  'gemini-3.8-flash',      // 1st choice: Frontier speed & intelligence
  'gemini-3.5-flash',      // 2nd choice: Ultra-stable GA workhorse
  'gemini-3.8-flash-lite', // 3rd choice: High-speed lite
  'gemini-3.5-flash-lite', // 4th choice: Budget fallback
  'gemini-2.5-flash',      // 5th choice: Legacy account compatibility
] as const;

/**
 * Resolves any custom / UI model alias into a valid, live Google AI Studio API model
 * strictly complying with google-ai-studio-gemini SKILL.md.
 */
export function getValidGeminiModel(requestedModel?: string): string {
  if (!requestedModel) return 'gemini-3.8-flash';
  const clean = requestedModel.toLowerCase().trim();

  // Sanitize 3.6 hallucination
  if (clean.includes('3.6')) return 'gemini-3.8-flash';
  if (clean.includes('pro')) return 'gemini-3.1-pro';
  if (clean.includes('3.8-flash-lite')) return 'gemini-3.8-flash-lite';
  if (clean.includes('3.8')) return 'gemini-3.8-flash';
  if (clean.includes('3.5-flash-lite')) return 'gemini-3.5-flash-lite';
  if (clean.includes('3.5')) return 'gemini-3.5-flash';
  if (clean.includes('2.5')) return 'gemini-2.5-flash';

  // Deprecated/shut down models (1.5, 2.0) default to 2026 workhorse
  return 'gemini-3.8-flash';
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
  private static STORAGE_KEY = 'kosun_whatsapp_ai_bots';

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

  public static async saveBotsToFirestore(db: any, bots: WhatsAppAiBotConfig[], tenantId?: string): Promise<void> {
    if (!db) return;
    try {
      const batch = writeBatch(db);
      const collectionPath = tenantId ? `tenants/${tenantId}/whatsapp_ai_bots` : 'whatsapp_ai_bots';
      
      // Update each bot
      for (const bot of bots) {
        const docRef = doc(db, collectionPath, bot.id);
        batch.set(docRef, bot, { merge: true });
      }
      
      // Optional: Delete bots that were removed
      // (Skipping for now to avoid accidental deletions of old bots)
      
      await batch.commit();
    } catch (err) {
      console.error('Failed to sync bots to Firestore:', err);
    }
  }

  public static async loadBotsFromFirestore(db: any, tenantId?: string): Promise<WhatsAppAiBotConfig[]> {
    if (!db) return [];
    try {
      const collectionPath = tenantId ? `tenants/${tenantId}/whatsapp_ai_bots` : 'whatsapp_ai_bots';
      const coll = collection(db, collectionPath);
      const snap = await getDocs(coll);
      if (snap.empty) return [];
      
      const bots: WhatsAppAiBotConfig[] = [];
      snap.forEach((d: any) => bots.push(d.data() as WhatsAppAiBotConfig));
      
      // Sort by creation time if available
      return bots.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (err) {
      console.error('Failed to load bots from Firestore:', err);
      return [];
    }
  }

  public static async deleteBotFromFirestore(db: any, botId: string, tenantId?: string): Promise<void> {
    if (!db) return;
    try {
      const collectionPath = tenantId ? `tenants/${tenantId}/whatsapp_ai_bots` : 'whatsapp_ai_bots';
      const docRef = doc(db, collectionPath, botId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete bot from Firestore:', err);
    }
  }

  /**
   * Syncs active Kosai Agents configured with WhatsApp Triggers into WhatsApp AI Bots
   */
  public static async syncKosaiAgentsToWhatsApp(db: any, tenantId?: string): Promise<WhatsAppAiBotConfig[]> {
    if (!db) return [];
    try {
      const rulesPath = tenantId ? `tenants/${tenantId}/mod_kosai_rules` : 'mod_kosai_rules';
      const rulesColl = collection(db, rulesPath);
      const rulesSnap = await getDocs(rulesColl);
      
      const kosaiBots: WhatsAppAiBotConfig[] = [];
      rulesSnap.forEach((docSnap: any) => {
        const rule = docSnap.data();
        if (rule?.isActive && rule?.whatsappTrigger?.enabled) {
          const trigger = rule.whatsappTrigger;
          const botConfig: WhatsAppAiBotConfig = {
            id: `kosai_${rule.id}`,
            name: trigger.botDisplayName || rule.name || 'סוכן קושאן AI',
            role: 'סוכן אוטונומי מחובר לקושאן AI',
            avatarIcon: 'Bot',
            isActive: true,
            triggerType: trigger.triggerType || 'keyword',
            triggerKeywords: trigger.keywords || [],
            matchMode: trigger.matchMode || 'contains',
            kosaiRuleId: rule.id,
            systemPrompt: rule.systemPromptAddon || 'אתה נציג שירות ומכירות אינטליגנטי של קושאן.',
            model: 'gemini-3.8-flash',
            temperature: (rule.toneOfVoice?.creativity ?? 50) / 100,
            interactiveButtons: [
              { buttonId: 'btn_more_info', buttonText: 'מידע נוסף', actionType: 'prompt', actionValue: 'פרט עוד בבקשה' },
              { buttonId: 'btn_human_rep', buttonText: 'שיחה עם נציג', actionType: 'message', actionValue: 'נציג יחזור אליך בהקדם.' }
            ],
            autoGenerateButtons: false,
            createdAt: rule.createdAt || Date.now()
          };
          kosaiBots.push(botConfig);
        }
      });

      if (kosaiBots.length > 0) {
        await this.saveBotsToFirestore(db, kosaiBots, tenantId);
      }
      return kosaiBots;
    } catch (err) {
      console.error('Failed to sync Kosai Agents to WhatsApp:', err);
      return [];
    }
  }

  /**
   * AI Assistant Caller routed securely through Cloud Functions (functionsApi)
   * Follows Kosun Module Monopoly: Sibling modules never call Gemini directly from browser.
   */
  public static async callGeminiApi(params: {
    apiKey?: string;
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    preferredModel?: string;
    maxOutputTokens?: number;
    brandDna?: BrandDna | null;
  }): Promise<{ text: string; costReport: TokenUsageReport }> {
    const {
      prompt,
      systemInstruction,
      temperature = 0.7,
      brandDna,
    } = params;

    const brandDnaBlock = buildBrandDnaPromptBlock(brandDna);
    const combinedSystemInstruction = [
      systemInstruction,
      brandDnaBlock
    ].filter(Boolean).join('\n\n');

    // Secure call through functionsApi with fallback
    const result = await functionsApi.callAiAssistant({
      prompt,
      systemInstruction: combinedSystemInstruction,
      temperature,
      preferredModel: params.preferredModel,
      apiKey: params.apiKey,
      brandDna
    });

    if (result.error || !result.text) {
      throw new Error(result.error || 'שירות הבינה המלאכותית עמוס כעת, אנא נסה שוב בעוד מספר רגעים.');
    }

    const costReport = result.costReport || calculateGeminiCost({
      model: 'gemini-3.8-flash',
      promptTokens: 200,
      candidatesTokens: 150
    });

    return { text: result.text, costReport };
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

    const effectiveApiKey = (apiKey && apiKey.trim()) ||
      getModuleGeminiKey('whatsapp-green-api-hub') ||
      getModuleGeminiKey('kosai-engine') ||
      getModuleGeminiKey('page-builder') ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      '';

    if (!effectiveApiKey) {
      return {
        replyText: '⚠️ לא הוגדר מפתח Google AI (Gemini) במערכת. אנא הגדר את המפתח ברכיב הסנכרון וההגדרות (סמל המפתח).',
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
        apiKey: effectiveApiKey,
        prompt,
        systemInstruction: `SYSTEM INSTRUCTIONS:\n${botConfig.systemPrompt}\nהשב בעברית קולחת, תמציתית ונעימה לוואטסאפ.`,
        temperature: botConfig.temperature ?? 0.7,
        preferredModel: botConfig.model || 'gemini-2.5-flash',
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
