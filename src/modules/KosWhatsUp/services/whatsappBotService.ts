import { TokenUsageReport } from '../../../core/ai';
import { BrandDna, SYSTEM_COLLECTIONS } from '../../../core/contracts';
import { collection, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { kosaiWhatsUpContract } from '../../kosai-engine/modelsAiService';
import {
  buildDenseBrandContext,
  dispatchBotReplyToKosai,
  dispatchStatusEnhanceToKosai,
  dispatchStatusVariationsToKosai,
  WhatsAppStatusTone,
} from '../kosai/promptToKosai';

export interface WhatsAppBotButton {
  buttonId: string;
  buttonText: string;
  actionType: 'prompt' | 'message' | 'link';
  actionValue?: string;
}

export type WhatsAppBotConfig = WhatsAppAiBotConfig;

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
  conversationGoal?: string;
  landingPagesCatalog?: Array<{ title: string; url: string; category?: string }>;
  sendContactCardOnClose?: boolean;
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
  chasidic: { label: 'תורני / חסידי', icon: 'BookOpen', desc: 'חיזוק, פתגמים חסידיים, מוסר ופסוקים' },
  marketing: { label: 'שיווקי ומשכנע', icon: 'Megaphone', desc: 'הנעה חזקה לפעולה, הטבות ומבצעים' },
  official: { label: 'רשמי ומכובד', icon: 'ShieldCheck', desc: 'ניסוח עסקי, קהילתי ומנומס' },
  warm: { label: 'חם וידידותי', icon: 'Sparkles', desc: 'נימה אישית, נעימה ומחברת' },
  viral: { label: 'קצר וקולע', icon: 'Zap', desc: 'סטורי תמציתי עד 120 תווים ללא אימוג׳י' },
};

export const STATUS_PRESETS = [
  {
    id: 'chasidic_sukkot',
    label: 'דבר תורה חסידי לסוכות',
    icon: 'Layers',
    defaultTopic: 'דבר תורה חסידי לחג הסוכות על קדושת האושפיזין ואחדות ישראל תחת צלא דמהימנותא',
    tone: 'chasidic' as StatusTone,
  },
  {
    id: 'chasidic_parasha',
    label: 'פתגם חסידי ופרשת שבוע',
    icon: 'BookOpen',
    defaultTopic: 'ווארט חסידי קצר ומאיר לפרשת השבוע עם מסר מעשי לעבודת השם ושמחה',
    tone: 'chasidic' as StatusTone,
  },
  {
    id: 'flash_sale',
    label: 'מבצע בזק והנחה מיוחדת',
    icon: 'ShoppingBag',
    defaultTopic: 'מבצע מיוחד ל-24 שעות הקרובות עם הנחה בלעדית לצופי הסטטוס בוואטסאפ',
    tone: 'marketing' as StatusTone,
  },
  {
    id: 'community_news',
    label: 'עדכון חשוב לקהילה',
    icon: 'Megaphone',
    defaultTopic: 'הודעה ועדכון חשוב לקהילה על פעילות חדשה, זמני פתיחה או אירוע קרוב',
    tone: 'official' as StatusTone,
  },
  {
    id: 'value_tip',
    label: 'טיפ מקצועי וערך מוסף',
    icon: 'Lightbulb',
    defaultTopic: 'טיפ מקצועי יומי קצר ומנצח שחוסך זמן וכסף בתחום שלנו',
    tone: 'warm' as StatusTone,
  },
  {
    id: 'event_invite',
    label: 'הזמנה לאירוע / שיעור',
    icon: 'Ticket',
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
שמור על נימה שירותית, עניינית, ללא שימוש באימוג'י כלל.
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
    systemPrompt: `אתה מומחה תמיכה טכנית של Kosun. עזור ללקוח לפתור בעיות חיבור, סנכרון והגדרות באופן ברור ויעיל ללא שימוש באימוג'י.`,
    model: 'gemini-3.8-flash',
    temperature: 0.4,
    interactiveButtons: [
      { buttonId: 'btn_reboot', buttonText: 'בדיקת סטטוס מופע', actionType: 'prompt', actionValue: 'כיצד מאתחלים את המופע?' },
      { buttonId: 'btn_support_agent', buttonText: 'פתיחת קריאת שירות', actionType: 'message', actionValue: 'קריאת שירות נפתחה בהצלחה.' },
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

export class WhatsAppBotService {
  private static STORAGE_KEY = 'kosun_whatsup_ai_bots';

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
      const colName = SYSTEM_COLLECTIONS.KOS_WHATSUP_AI_BOTS;
      const collectionPath = tenantId ? `tenants/${tenantId}/${colName}` : colName;
      
      // Update each bot
      for (const bot of bots) {
        const docRef = doc(db, collectionPath, bot.id);
        batch.set(docRef, bot, { merge: true });
      }
      
      await batch.commit();
    } catch (err) {
      console.error('Failed to sync bots to Firestore:', err);
    }
  }

  public static async loadBotsFromFirestore(db: any, tenantId?: string): Promise<WhatsAppAiBotConfig[]> {
    if (!db) return [];
    try {
      const colName = SYSTEM_COLLECTIONS.KOS_WHATSUP_AI_BOTS;
      const collectionPath = tenantId ? `tenants/${tenantId}/${colName}` : colName;
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
      const colName = SYSTEM_COLLECTIONS.KOS_WHATSUP_AI_BOTS;
      const collectionPath = tenantId ? `tenants/${tenantId}/${colName}` : colName;
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
   * AI Assistant Caller routed securely through KOSAI ModelsAiService monopoly
   * Follows Kosun Module Monopoly: Sibling modules never call Gemini directly from browser.
   */
  public static async callGeminiApi(params: {
    apiKey?: string;
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    preferredModel?: string;
    maxOutputTokens?: number;
    cachedContentId?: string;
    brandDna?: BrandDna | null;
  }): Promise<{ text: string; cachedContentId?: string; costReport: TokenUsageReport }> {
    const {
      prompt,
      systemInstruction,
      temperature = 0.6,
      brandDna,
    } = params;

    const denseContext = buildDenseBrandContext(brandDna);
    const combinedSystemInstruction = [
      denseContext,
      systemInstruction,
    ].filter(Boolean).join('\n\n');

    const result = await kosaiWhatsUpContract.generateBotReply(
      prompt,
      combinedSystemInstruction,
      {
        apiKey: params.apiKey,
        model: params.preferredModel || 'gemini-3.8-flash-lite',
        temperature,
        maxOutputTokens: params.maxOutputTokens || 250,
      }
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'שירות הבינה המלאכותית עמוס כעת, אנא נסה שוב בעוד מספר רגעים.');
    }

    return {
      text: result.data,
      cachedContentId: params.cachedContentId,
      costReport: result.costReport,
    };
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
    const text = await dispatchStatusEnhanceToKosai(
      {
        originalText: params.originalText,
        tone: params.tone as any,
        brandDna: params.brandDna,
      },
      {
        apiKey: params.apiKey,
        model: params.preferredModel || 'gemini-3.8-flash-lite',
      }
    );

    return { text };
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
    const variations = await dispatchStatusVariationsToKosai(
      {
        topic: params.topic,
        tone: params.tone as any,
        brandDna: params.brandDna,
      },
      {
        apiKey: params.apiKey,
        model: params.preferredModel || 'gemini-3.8-flash-lite',
      }
    );

    if (Array.isArray(variations) && variations.length > 0) {
      return {
        variations: variations.map((item: any, idx: number) => ({
          id: item.id || `v_${idx + 1}`,
          title: item.title || `אפשרות ${idx + 1}`,
          text: item.text || item.content || '',
          category: params.topic,
        })),
      };
    }

    return {
      variations: [
        {
          id: 'v1',
          title: 'הצעה מובילה',
          text: `סטטוס וואטסאפ איכותי בנושא ${params.topic}`,
          category: params.topic,
        },
      ],
    };
  }

  /**
   * Generates AI response for chatbot interactive simulator
   * First checks Zero-Token Local FAQ matcher!
   */
  public static async generateAiResponse(params: {
    apiKey: string;
    botConfig: WhatsAppAiBotConfig;
    userMessage: string;
    chatHistory?: { role: 'user' | 'model'; text: string }[];
    cachedContentId?: string;
    brandDna?: BrandDna | null;
    tenantId?: string;
  }): Promise<{ replyText: string; buttons: { buttonId: string; buttonText: string }[]; cachedContentId?: string; costReport?: TokenUsageReport }> {
    const { apiKey, botConfig, userMessage, chatHistory = [], cachedContentId, brandDna, tenantId } = params;

    const replyText = await dispatchBotReplyToKosai(
      {
        userMessage,
        chatHistory,
        brandDna,
        systemInstructionAddon: botConfig.systemPrompt,
      },
      {
        apiKey,
        tenantId,
        model: botConfig.model || 'gemini-3.8-flash-lite',
      }
    );

    const buttons = botConfig.interactiveButtons.slice(0, 3).map((b) => ({
      buttonId: b.buttonId,
      buttonText: b.buttonText,
    }));

    return {
      replyText: replyText.trim(),
      buttons,
      cachedContentId,
    };
  }
}

export const WhatsAppAiBotService = WhatsAppBotService;

