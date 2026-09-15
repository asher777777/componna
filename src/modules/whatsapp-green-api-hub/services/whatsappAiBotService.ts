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
   * Generates AI response using Google Gemini API
   */
  public static async generateAiResponse(params: {
    apiKey: string;
    botConfig: WhatsAppAiBotConfig;
    userMessage: string;
    chatHistory?: { role: 'user' | 'model'; text: string }[];
  }): Promise<{ replyText: string; buttons: { buttonId: string; buttonText: string }[] }> {
    const { apiKey, botConfig, userMessage, chatHistory = [] } = params;

    if (!apiKey || !apiKey.trim()) {
      return {
        replyText: '⚠️ לא הוגדר מפתח Google AI (Gemini) במערכת. אנא הגדר את המפתח ברכיב הסנכרון וההגדרות.',
        buttons: botConfig.interactiveButtons.map((b) => ({
          buttonId: b.buttonId,
          buttonText: b.buttonText,
        })),
      };
    }

    const contents = [
      ...chatHistory.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const modelName = botConfig.model || 'gemini-3.6-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

    const systemInstruction = {
      role: 'user',
      parts: [
        {
          text: `SYSTEM INSTRUCTIONS:\n${botConfig.systemPrompt}\nהשב בעברית קולחת, תמציתית ונעימה לוואטסאפ.`,
        },
      ],
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
          generationConfig: {
            temperature: botConfig.temperature ?? 0.7,
            maxOutputTokens: 600,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Google AI Error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'שלום, קיבלתי את הודעתך!';

      const buttons = botConfig.interactiveButtons.slice(0, 3).map((b) => ({
        buttonId: b.buttonId,
        buttonText: b.buttonText,
      }));

      return {
        replyText: rawText.trim(),
        buttons,
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
