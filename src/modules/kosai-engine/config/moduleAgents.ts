import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { KosaiRule, KosaiCapability } from '../types';

export interface ModuleAgentMeta {
  moduleId: string;
  routes: string[];
  name: string;
  roleBadge: string;
  roleDescription: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  enabledCapabilities: KosaiCapability[];
  allowedDataSources: string[];
  systemPrompt: string;
}

export const MODULE_AGENTS_MAP: Record<string, ModuleAgentMeta> = {
  'crm-analytics': {
    moduleId: 'crm-analytics',
    routes: ['/crm-analytics', '/crm-groups'],
    name: 'סוכן CRM, ניתוח נתונים ולקוחות',
    roleBadge: 'סוכן CRM ואנליטיקה',
    roleDescription: 'ניתוח לקוחות, ניהול לידים, קבוצות ותרשימים',
    welcomeMessage: 'שלום! אני סוכן ה-CRM והאנליטיקה של קושאן. אני מחובר לכל מאגרי הלקוחות, העסקאות והקבוצות שלך. אני יכול לעזור לך לייצר גרפים מותאמים אישית, לפלח לקוחות, לנתח מגמות מכירה ולנהל קהילות. מה תרצה לבדוק היום?',
    inputPlaceholder: 'איך קושאן יכול לעזור בניהול ה-CRM והלקוחות?',
    enabledCapabilities: ['CREATE_CRM_CHART', 'DEEP_RESEARCH', 'WHATSAPP_AUTOMATION'],
    allowedDataSources: [
      SYSTEM_COLLECTIONS.CONTACTS,
      'crm_groups',
      SYSTEM_COLLECTIONS.KESHER_TRANSACTIONS,
      SYSTEM_COLLECTIONS.SMART_FORMS
    ],
    systemPrompt: `אתה סוכן ה-CRM, הנתונים והאנליטיקה של קושאן.
תפקידך לסייע בניהול קשרי לקוחות, פילוח קהילות וקבוצות, מעקב עסקאות, והפקת גרפים אנליטיים בזמן אמת.
כאשר המשתמש מבקש לנתח, להציג תרשים, או לייצר גרף חדש ב-CRM, הפעל את הפעולה CREATE_CRM_CHART עם שדות מתאימים.`
  },
  'page-builder': {
    moduleId: 'page-builder',
    routes: ['/page-builder', '/builder'],
    name: 'מעצב ועורך האתר (Page Builder)',
    roleBadge: 'מעצב ועורך האתר',
    roleDescription: 'עיצוב, עריכת תוכן, הוספת סקשנים והתאמת מיתוג',
    welcomeMessage: 'היי! אני קושאן AI. העוזר והשותף החכם שלך לעיצוב ועריכת האתר. מחובר כעת ל-Brand DNA. מה נרצה לעצב או לעדכן היום?',
    inputPlaceholder: 'איך קושאן יכול לעזור בעיצוב האתר?',
    enabledCapabilities: ['ADD_SECTION', 'UPDATE_SECTION', 'UPDATE_GLOBAL_SETTINGS', 'UPDATE_SEO'],
    allowedDataSources: [SYSTEM_COLLECTIONS.PAGES, SYSTEM_COLLECTIONS.BRAND_DNA_DOC, SYSTEM_COLLECTIONS.MEDIA_ITEMS],
    systemPrompt: `אתה מעצב ועורך האתר של קושאן (Page Builder). תפקידך להוסיף סקשנים, לעדכן תוכן, ולעצב עמודים מודרניים.`
  },
  'whatsapp-green-api-hub': {
    moduleId: 'whatsapp-green-api-hub',
    routes: ['/whatsapp-hub', '/whatsapp'],
    name: 'סוכן וואטסאפ ואוטומציות',
    roleBadge: 'סוכן וואטסאפ ואוטומציות',
    roleDescription: 'שירות לקוחות, הודעות אוטומטיות ובוטים',
    welcomeMessage: 'שלום! אני סוכן הוואטסאפ של קושאן. אני כאן לעזור לך לנהל הודעות, להגדיר בוטים אוטומטיים, לסנכרן קבוצות ולייעל את התקשורת מול הלקוחות. במה נתמקד?',
    inputPlaceholder: 'איך קושאן יכול לעזור באוטומציות וואטסאפ?',
    enabledCapabilities: ['WHATSAPP_AUTOMATION', 'DEEP_RESEARCH'],
    allowedDataSources: ['wa_bot_chats', SYSTEM_COLLECTIONS.CONTACTS],
    systemPrompt: `אתה סוכן הוואטסאפ והאוטומציות של קושאן. תפקידך לנסח תבניות הודעה, להגדיר בוטים וסנכרון פניות.`
  },
  'smart-form-builder': {
    moduleId: 'smart-form-builder',
    routes: ['/smart-forms', '/smart-form'],
    name: 'סוכן טפסים חכמים',
    roleBadge: 'סוכן טפסים חכמים',
    roleDescription: 'אפיון טפסים, שאלונים ואיסוף לידים',
    welcomeMessage: 'שלום! אני סוכן הטפסים החכמים של קושאן. אני יכול לעזור לך לבנות שאלונים ממירים, להגדיר שדות ליד ולחבר אותם ישירות ל-CRM. איזה טופס נרצה ליצור?',
    inputPlaceholder: 'איך קושאן יכול לעזור בבניית טופס חכם?',
    enabledCapabilities: ['ADD_SECTION', 'DEEP_RESEARCH'],
    allowedDataSources: [SYSTEM_COLLECTIONS.SMART_FORMS, SYSTEM_COLLECTIONS.CONTACTS],
    systemPrompt: `אתה סוכן הטפסים החכמים של קושאן. תפקידך לעזור בבניית טפסים, שאלונים וסנכרון לידים.`
  },
  'media-gallery-hub': {
    moduleId: 'media-gallery-hub',
    routes: ['/media-gallery-hub', '/media-gallery'],
    name: 'סוכן ספריית מדיה',
    roleBadge: 'סוכן ספריית מדיה',
    roleDescription: 'ניהול קבצים, הפקת תמונות ועיבוד ויזואלי',
    welcomeMessage: 'שלום! אני סוכן המדיה של קושאן. אני יכול לסייע לך בארגון ספריית המדיה, יצירת תמונות מותאמות למותג בעזרת AI ועריכת תכנים ויזואליים. מה נרצה לעשות?',
    inputPlaceholder: 'איך קושאן יכול לעזור בספריית המדיה?',
    enabledCapabilities: ['IMAGE_GENERATION', 'VIDEO_GENERATION'],
    allowedDataSources: [SYSTEM_COLLECTIONS.MEDIA_ITEMS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC],
    systemPrompt: `אתה סוכן המדיה והוויז'ואל של קושאן.`
  },
  'brand-dna-hub': {
    moduleId: 'brand-dna-hub',
    routes: ['/brand-dna', '/brand'],
    name: 'סוכן מיתוג וזהות עסקית',
    roleBadge: 'סוכן Brand DNA',
    roleDescription: 'שפת מותג, ערכים, טון דיבור וקהלי יעד',
    welcomeMessage: 'שלום! אני סוכן ה-Brand DNA של קושאן. אני כאן לעזור לך לדייק את המסרים, לבנות קהלי יעד, לנסח סלוגנים ולהבטיח שכל חלקי המערכת מדברים בקול המותג שלך.',
    inputPlaceholder: 'איך קושאן יכול לעזור בשפת המותג?',
    enabledCapabilities: ['UPDATE_GLOBAL_SETTINGS', 'DEEP_RESEARCH'],
    allowedDataSources: [SYSTEM_COLLECTIONS.BRAND_DNA_DOC],
    systemPrompt: `אתה סוכן ה-Brand DNA והזהות העסקית של קושאן.`
  },
  'kesher-payments-hub': {
    moduleId: 'kesher-payments-hub',
    routes: ['/kesher-payments', '/payments'],
    name: 'סוכן קופה וסליקה',
    roleBadge: 'סוכן קופה וסליקה',
    roleDescription: 'עסקאות, קבלות, תשלומים ומעקב פיננסי',
    welcomeMessage: 'שלום! אני סוכן הסליקה והקופה של קושאן. אני מחובר לנתוני העסקאות והחשבוניות ויכול לעזור לך לבדוק תשלומים, להפיק קבלות ולעקוב אחר הכנסות. מה לבדוק עבורך?',
    inputPlaceholder: 'איך קושאן יכול לעזור בניהול תשלומים ועסקאות?',
    enabledCapabilities: ['DEEP_RESEARCH'],
    allowedDataSources: [SYSTEM_COLLECTIONS.KESHER_TRANSACTIONS, SYSTEM_COLLECTIONS.CONTACTS],
    systemPrompt: `אתה סוכן הסליקה והקופה של קושאן.`
  },
  'kosun-am': {
    moduleId: 'kosun-am',
    routes: ['/kosun-am'],
    name: 'סוכן דיוור ואוטומציה שיווקית',
    roleBadge: 'סוכן דיוור ומיילים',
    roleDescription: 'קמפיינים, ניוזלטרים ואוטומציות תפוצה',
    welcomeMessage: 'שלום! אני סוכן הדיוור של קושאן (KOSUN AM). אני יכול לעזור לך לנסח ניוזלטרים ממירים, לבנות מסעות לקוח ואוטומציות מייל חכמות. על איזה קמפיין עובדים היום?',
    inputPlaceholder: 'איך קושאן יכול לעזור בקמפיין המייל הבא שלך?',
    enabledCapabilities: ['DEEP_RESEARCH'],
    allowedDataSources: [SYSTEM_COLLECTIONS.CONTACTS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC],
    systemPrompt: `אתה סוכן הדיוור והשיווק במייל של קושאן.`
  },
  'public-site': {
    moduleId: 'public-site',
    routes: ['/p/', '/page/', '/preview/'],
    name: 'נציג שירות ומכירות',
    roleBadge: 'שירות, שיווק ומכירות',
    roleDescription: 'מצב צפייה: שירות לקוחות והכוונה דיגיטלית',
    welcomeMessage: 'שלום וברוכים הבאים לקושאן! אני כאן לענות על כל שאלה בנוגע לשירותים, המוצרים ופתרונות הפלטפורמה שלנו. איך אוכל לסייע לך היום?',
    inputPlaceholder: 'במה נוכל לסייע לך היום?',
    enabledCapabilities: [],
    allowedDataSources: [SYSTEM_COLLECTIONS.PAGES, SYSTEM_COLLECTIONS.BRAND_DNA_DOC],
    systemPrompt: `אתה נציג שירות הלקוחות והמכירות הדיגיטלי של קושאן עבור מבקרים באתר.`
  }
};

/**
 * Resolves the active module based on current pathname, hash, and auth status
 */
export function resolveActiveModule(pathname?: string, isLoggedIn: boolean = false): ModuleAgentMeta {
  const windowUrl = typeof window !== 'undefined' ? (window.location.pathname + window.location.hash) : '';
  const cleanPath = ((pathname || windowUrl) || '').toLowerCase();

  // If visiting public landing pages
  if (cleanPath.startsWith('/p/') || cleanPath.startsWith('/page/') || cleanPath.startsWith('/preview/')) {
    return MODULE_AGENTS_MAP['public-site'];
  }

  // Priority check for CRM & Analytics routes
  if (cleanPath.includes('crm-analytics') || cleanPath.includes('crm-groups')) {
    return MODULE_AGENTS_MAP['crm-analytics'];
  }

  // Check each registered module by route prefix
  for (const meta of Object.values(MODULE_AGENTS_MAP)) {
    if (meta.moduleId === 'public-site' || meta.moduleId === 'crm-analytics') continue;
    if (meta.routes.some(r => cleanPath.includes(r.toLowerCase()))) {
      return meta;
    }
  }

  // If user is not logged in and on root, default to public visitor
  if (!isLoggedIn && (cleanPath === '/' || cleanPath === '')) {
    return MODULE_AGENTS_MAP['public-site'];
  }

  // Default fallback for backoffice is page-builder
  return MODULE_AGENTS_MAP['page-builder'];
}

/**
 * Creates a default KosaiRule instance from a module metadata definition
 */
export function createDefaultRuleForModule(meta: ModuleAgentMeta): KosaiRule {
  return {
    id: `default_rule_${meta.moduleId}`,
    name: meta.name,
    moduleId: meta.moduleId,
    slugPattern: meta.routes[0] || '',
    systemPromptAddon: meta.systemPrompt,
    isActive: true,
    enabledCapabilities: meta.enabledCapabilities,
    allowedDataSources: meta.allowedDataSources,
    toneOfVoice: { professionalism: 65, detail: 50, creativity: 50 },
    createdAt: Date.now()
  };
}
