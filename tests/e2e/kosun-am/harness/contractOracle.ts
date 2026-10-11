/**
 * Contract Oracle & Specification Engine for KOSUN AM ("קושאן מייל אוטומטי")
 * 
 * Authoritative ground truth derived strictly from:
 * - c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
 * - c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
 * - c:\comona\src\core\contracts\index.ts
 * - c:\comona\src\core\contracts\collections.ts
 * - c:\comona\src\core\connection\tenantApiKeys.ts
 * - c:\comona\.gemini\config\skills\cashwan-branding\SKILL.md
 */

export const KOSUN_AM_CONTRACTS = {
  MODULE_ID: 'kosun-am',
  DISPLAY_NAME_HE: 'קושאן מייל אוטומטי',
  DISPLAY_NAME_EN: 'KOSUN AM',
  COLLECTION_PREFIX: 'mod_kosun_am_',
  COLLECTIONS: {
    CAMPAIGNS: 'mod_kosun_am_campaigns',
    TEMPLATES: 'mod_kosun_am_templates',
    AUTOMATIONS: 'mod_kosun_am_automations',
    LOGS: 'mod_kosun_am_logs',
  },
  SYSTEM_COLLECTION_KEYS: {
    CAMPAIGNS: 'KOSUN_AM_CAMPAIGNS',
    TEMPLATES: 'KOSUN_AM_TEMPLATES',
    AUTOMATIONS: 'KOSUN_AM_AUTOMATIONS',
    LOGS: 'KOSUN_AM_LOGS',
  },
  AUTHORIZED_GEMINI_MODELS: [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.8-flash-lite',
  ],
  AUTHORIZED_PROVIDERS: ['resend', 'sendgrid', 'smtp_proxy', 'mock'],
  REQUIRED_12_LAYERS: [
    'types/index.ts',
    'config/index.ts',
    'context/ModuleContext.tsx',
    'hooks/useKosunAmData.ts',
    'hooks/useKosunAmActions.ts',
    'services/emailFirestoreService.ts',
    'services/emailDispatchService.ts',
    'services/kosaiEmailAiService.ts',
    'api/functionsApi.ts',
    'prompts/index.ts',
    'routes/ModuleRoutes.tsx',
    'components/KosunAmMainView.tsx',
    'components/EmailEditorModal.tsx',
    'components/AutomationBuilderView.tsx',
    'components/CampaignListCard.tsx',
    'components/DeliveryLogsDrawer.tsx',
    'StandaloneView.tsx',
    'index.ts',
    'README.md',
    '.gemini/rules.md',
    '.gemini/skills.md',
    'scripts/.gitkeep',
  ],
  SPEC_README_CHAPTERS: [
    'פרק 1: פרטים כלליים',
    'פרק 2: מבנה נתוני Firestore',
    'פרק 3: ממשק משתמש ומסכים',
    'פרק 4: ניתובים פנימיים',
    'פרק 5: שכבת API ופונקציות ענן',
    'פרק 6: פרומפטים והגדרות AI',
    'פרק 7: חוקי אבטחה של פיירבייס',
    'פרק 8: משתני סביבה נדרשים',
  ],
  INTERNAL_ROUTES: ['', 'new', ':id', 'templates', 'automations', 'logs'],
  BRANDING: {
    FONT_FAMILY: 'Heebo',
    RTL_WRAPPER: '<div dir="rtl" style="text-align: right;">',
    TOP_NAV_ONLY: true,
    NO_SIDEBAR: true,
    COLLAPSIBLE_STATS: true,
    ZERO_TEXTUAL_EMOJIS: true,
    ENTITY_PHRASES: [
      'קושאן דואג שהמייל יגיע ליעד',
      'קושאן מכין את הקמפיין הבא שלך',
      'קושאן',
    ],
  },
  TOKEN_RATES: {
    'gemini-3.8-flash': {
      inputRatePer1M: 0.15,
      outputRatePer1M: 0.60,
      ilsExchangeRate: 3.75,
    },
    'gemini-3.5-flash': {
      inputRatePer1M: 0.10,
      outputRatePer1M: 0.40,
      ilsExchangeRate: 3.75,
    },
    'gemini-3.8-flash-lite': {
      inputRatePer1M: 0.075,
      outputRatePer1M: 0.30,
      ilsExchangeRate: 3.75,
    },
  },
};

/**
 * Derives scoped collection path strictly per Multi-Tenant invariant
 */
export function deriveScopedCollectionPath(collectionName: string, tenantId?: string): string {
  const cleanTenant = (tenantId || '').trim().toLowerCase() || '_master';
  return `tenants/${cleanTenant}/${collectionName}`;
}

/**
 * Calculates token cost according to official Gemini Cost Tracking contract
 */
export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number,
  modelName: string = 'gemini-3.8-flash'
): { costUsd: number; costIls: number; formattedUsd: string; formattedIls: string } {
  const rates = (KOSUN_AM_CONTRACTS.TOKEN_RATES as any)[modelName] || KOSUN_AM_CONTRACTS.TOKEN_RATES['gemini-3.8-flash'];
  const inputCost = (Math.max(0, inputTokens) / 1_000_000) * rates.inputRatePer1M;
  const outputCost = (Math.max(0, outputTokens) / 1_000_000) * rates.outputRatePer1M;
  const costUsd = Number((inputCost + outputCost).toFixed(6));
  const costIls = Number((costUsd * rates.ilsExchangeRate).toFixed(6));
  return {
    costUsd,
    costIls,
    formattedUsd: `$${costUsd.toFixed(4)}`,
    formattedIls: `₪${costIls.toFixed(4)}`,
  };
}

/**
 * Template variable interpolation engine
 */
export function interpolateVariables(template: string, variables: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = variables[key];
    if (val === undefined || val === null) return '';
    return String(val);
  });
}

/**
 * Emojis detector: detects textual unicode emojis to verify Zero Textual Emojis branding compliance
 */
export function containsTextualEmojis(text: string): boolean {
  if (!text) return false;
  // Regex covering standard pictorial and supplemental emojis
  const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
  return emojiRegex.test(text);
}

/**
 * Anti-spam and unsubscribe footer validator
 */
export function validateUnsubscribeCompliance(htmlBody: string): { compliant: boolean; hasUnsubscribe: boolean } {
  if (!htmlBody) return { compliant: false, hasUnsubscribe: false };
  const lower = htmlBody.toLowerCase();
  const hasUnsubscribe = lower.includes('unsubscribe') || lower.includes('הסרה') || lower.includes('להסרה מהרשימה');
  return {
    compliant: hasUnsubscribe,
    hasUnsubscribe,
  };
}
