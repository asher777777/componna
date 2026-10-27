/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 2: Configuration, Audience Catalog & Dynamic Module Introspection Engine
 */

import { TargetAudience, DynamicModuleCapability, ModuleActionDescriptor, ModuleKpiDescriptor } from '../types';
import type { ModuleDefinition } from '../../../workbench/moduleRegistry';

export const MODULE_COLLECTION_PREFIX = 'mod_kosun_board_';
export const CUSTOM_DASHBOARDS_COLLECTION = 'custom_dashboards';

export const TARGET_AUDIENCES: TargetAudience[] = [
  {
    id: 'ecommerce',
    name: 'חנויות מסחר ואי-קומרס',
    category: 'מסחר ומכירות',
    description: 'עסקים המוכרים מוצרים פיזיים או דיגיטליים, הדורשים מעקב סליקה, קמפיינים שיווקיים ושירות לקוחות מהיר.',
    iconName: 'ShoppingBag',
    recommendedModuleIds: ['kesher-payments-hub', 'kosun-am', 'whatsapp-green-api-hub', 'crm-analytics'],
    businessGoals: ['הגדלת המרות סליקה', 'שימור לקוחות אוטומטי', 'שיווק מבוסס עגלות נטושות'],
    defaultTone: 'ממוקד מכירות, אנרגטי, ומניע לפעולה',
  },
  {
    id: 'clinics_health',
    name: 'קליניקות ומטפלים',
    category: 'בריאות ושירותים',
    description: 'מטפלים, רופאים וקליניקות הזקוקים לטפסי קבלה רפואיים, תזכורות בוואטסאפ וניהול מבוקר של מטופלים.',
    iconName: 'Stethoscope',
    recommendedModuleIds: ['smart-form-builder', 'whatsapp-green-api-hub', 'crm-groups-hub', 'kesher-payments-hub'],
    businessGoals: ['צמצום ביטולי פגישות', 'קליטת מטופלים דיגיטלית', 'שירות אישי ומכבד'],
    defaultTone: 'אמפתי, מקצועי, מסודר ומרגיע',
  },
  {
    id: 'real_estate',
    name: 'סוכנויות נדל"ן ויזמות',
    category: 'נדל"ן ונכסים',
    description: 'מתווכים, יזמים ומשווקי נדל"ן הדורשים דפי נחיתה לפרויקטים, סרטוני וידאו, וקליטת לידים מסיבית.',
    iconName: 'Building2',
    recommendedModuleIds: ['KosWebAi', 'video-producer-studio', 'crm-analytics', 'whatsapp-green-api-hub'],
    businessGoals: ['הצגת נכסים יוקרתית', 'סינון לידים איכותיים', 'מעקב מכירות שקוף'],
    defaultTone: 'יוקרתי, סמכותי, בטוח ומעורר אמון',
  },
  {
    id: 'fitness_coaches',
    name: 'מאמני כושר ומועדונים',
    category: 'כושר ואורח חיים',
    description: 'מאמנים ומועדוני כושר הזקוקים לקהילות פעילות, סליקת מנויים חודשית וסרטוני הדרכה שבועיים.',
    iconName: 'Dumbbell',
    recommendedModuleIds: ['kesher-payments-hub', 'crm-groups-hub', 'video-producer-studio', 'kosun-am'],
    businessGoals: ['שימור מתאמנים גבוה', 'חידוש מנויים אוטומטי', 'תקשורת שוטפת בקבוצות'],
    defaultTone: 'מוטיבציוני, דינמי, חם ומעצים',
  },
  {
    id: 'non_profit',
    name: 'עמותות וגיוס המונים',
    category: 'קהילה וחסד',
    description: 'ארגונים ללא כוונת רווח, שגרירי גיוס, עמודי תרומות ממותגים והוקרת תורמים במייל ובוואטסאפ.',
    iconName: 'HeartHandshake',
    recommendedModuleIds: ['ambassador-campaigns-hub', 'kesher-payments-hub', 'kosun-am', 'KosWebAi'],
    businessGoals: ['עמידה ביעדי קמפיין גיוס', 'רתימת שגרירים פעילים', 'הכרת תודה אישית לתורמים'],
    defaultTone: 'ערכי, מחבר, מעורר השראה ומלא הערכה',
  },
  {
    id: 'digital_courses',
    name: 'מכללות ויוצרי קורסים',
    category: 'חינוך והדרכה',
    description: 'מרצים, מורים ויוצרי ידע המנהלים הרשמות לקורסים, נגני שיעורים אינטראקטיביים ותקשורת שוטפת.',
    iconName: 'GraduationCap',
    recommendedModuleIds: ['flow-player-engine', 'KosWebAi', 'smart-form-builder', 'kosun-am'],
    businessGoals: ['אחוזי סיום קורס גבוהים', 'הרשמות מהירות לסילבוס', 'חוויית למידה חלקה'],
    defaultTone: 'מלמד, מעצים, בהיר ומסקרן',
  },
  {
    id: 'service_pros',
    name: 'נותני שירותים מקצועיים',
    category: 'שירותים פיננסיים וייעוץ',
    description: 'עורכי דין, רואי חשבון ויועצים עסקיים הזקוקים לכרטיס ביקור יוקרתי, חתימות על טפסים וסליקה מהירה.',
    iconName: 'Briefcase',
    recommendedModuleIds: ['KosWebAi', 'smart-form-builder', 'kesher-payments-hub', 'crm-analytics'],
    businessGoals: ['תדמית מקצועית יוקרתית', 'אוטומציה של איסוף מסמכים', 'גבייה מהירה ללא עיכובים'],
    defaultTone: 'מדויק, עסקי, אמין ואלגנטי',
  },
];

/**
 * Rich base knowledge for existing core modules.
 * Used to enrich discovered modules with ready-to-use actions and KPIs.
 */
const MODULE_KNOWLEDGE_BASE: Record<string, Partial<DynamicModuleCapability>> = {
  'kosun-am': {
    category: 'marketing',
    iconName: 'Mail',
    primaryCollections: ['mod_kosun_am_campaigns', 'mod_kosun_am_subscribers', 'mod_kosun_am_automations'],
    actions: [
      { id: 'am_new_campaign', label: 'קמפיין מייל חדש', description: 'ניסוח ושליחת דיוור מעוצב', iconName: 'Send', targetRoute: '/kosun-am/campaigns/new', actionType: 'navigate', badge: 'שיווק' },
      { id: 'am_new_automation', label: 'בניית אוטומציה', description: 'שרשרת הודעות לפי טריגרים', iconName: 'GitBranch', targetRoute: '/kosun-am/automations/new', actionType: 'navigate' },
      { id: 'am_view_contacts', label: 'רשימת תפוצה', description: 'ניהול נמענים וסגמנטים', iconName: 'Users', targetRoute: '/kosun-am/subscribers', actionType: 'navigate' },
    ],
    kpis: [
      { id: 'kpi_am_subscribers', label: 'נמענים פעילים', collectionName: 'mod_kosun_am_subscribers', calculationType: 'count', iconName: 'Users', suffix: ' רשומים', description: 'סה״כ נמענים ברשימות' },
      { id: 'kpi_am_campaigns', label: 'קמפיינים שנשלחו', collectionName: 'mod_kosun_am_campaigns', calculationType: 'count', iconName: 'MailCheck', suffix: ' קמפיינים', description: 'הודעות דוא״ל שנשלחו החודש' },
    ],
  },
  'whatsapp-green-api-hub': {
    category: 'communication',
    iconName: 'MessageSquare',
    primaryCollections: ['wa_chats', 'wa_messages', 'wa_templates'],
    actions: [
      { id: 'wa_send_broadcast', label: 'שליחת הודעת וואטסאפ', description: 'שליחה מרוכזת לנמענים', iconName: 'SendHorizontal', targetRoute: '/whatsapp-hub', actionType: 'navigate', badge: 'וואטסאפ' },
      { id: 'wa_templates', label: 'תבניות הודעה', description: 'ניהול תבניות מהירות', iconName: 'FileText', targetRoute: '/whatsapp-hub', actionType: 'navigate' },
    ],
    kpis: [
      { id: 'kpi_wa_chats', label: 'שיחות וואטסאפ פעילות', collectionName: 'wa_chats', calculationType: 'count', iconName: 'MessageSquare', suffix: ' שיחות', description: 'שיחות פעילות בזמן אמת' },
    ],
  },
  'kesher-payments-hub': {
    category: 'sales',
    iconName: 'CreditCard',
    primaryCollections: ['kesher_transactions', 'kesher_invoices', 'kesher_products'],
    actions: [
      { id: 'pay_create_link', label: 'קישור לתשלום מהיר', description: 'הפקת דף סליקה מאובטח', iconName: 'Link', targetRoute: '/kesher-payments', actionType: 'navigate', badge: 'סליקה' },
      { id: 'pay_invoices', label: 'הפקת חשבונית/קבלה', description: 'מסמכים חשבונאיים ירוקים', iconName: 'Receipt', targetRoute: '/kesher-payments', actionType: 'navigate' },
    ],
    kpis: [
      { id: 'kpi_pay_volume', label: 'סה״כ הכנסות סליקה', collectionName: 'kesher_transactions', calculationType: 'sum', fieldToSum: 'amount', iconName: 'TrendingUp', prefix: '₪', description: 'מחזור עסקאות מאושר' },
      { id: 'kpi_pay_count', label: 'עסקאות שאושרו', collectionName: 'kesher_transactions', calculationType: 'count', iconName: 'CheckCircle', suffix: ' עסקאות', description: 'כמות תשלומים שהושלמו' },
    ],
  },
  'smart-form-builder': {
    category: 'operations',
    iconName: 'ClipboardList',
    primaryCollections: ['mod_forms', 'mod_forms_submissions'],
    actions: [
      { id: 'form_create', label: 'טופס חכם חדש', description: 'בניית טופס איסוף לידים', iconName: 'PlusCircle', targetRoute: '/smart-forms', actionType: 'navigate', badge: 'טפסים' },
      { id: 'form_submissions', label: 'צפייה בלידים שהתקבלו', description: 'רשימת תגובות מהטפסים', iconName: 'Inbox', targetRoute: '/smart-forms', actionType: 'navigate' },
    ],
    kpis: [
      { id: 'kpi_form_leads', label: 'לידים מטפסים', collectionName: 'mod_forms_submissions', calculationType: 'count', iconName: 'Inbox', suffix: ' פניות', description: 'פניות חדשות שנאספו' },
    ],
  },
  'KosWebAi': {
    category: 'content',
    iconName: 'Layout',
    primaryCollections: ['pages', 'mod_pagebuilder_pages'],
    actions: [
      { id: 'page_edit_home', label: 'עריכת דף הבית', description: 'עריכה ויזואלית ב-Bento Grid', iconName: 'Edit3', targetRoute: '/KosWebAi', actionType: 'navigate', badge: 'אתר' },
      { id: 'page_new_landing', label: 'דף נחיתה חדש', description: 'יצירת עמוד קמפיין ממוקד', iconName: 'FilePlus', targetRoute: '/KosWebAi', actionType: 'navigate' },
    ],
    kpis: [
      { id: 'kpi_pages_count', label: 'עמודים מפורסמים', collectionName: 'pages', calculationType: 'count', iconName: 'Globe', suffix: ' דפים', description: 'דפי נחיתה פעילים ברשת' },
    ],
  },
  'crm-analytics': {
    category: 'operations',
    iconName: 'BarChart3',
    primaryCollections: ['mod_crm_contacts', 'mod_crm_deals'],
    actions: [
      { id: 'crm_analytics_view', label: 'דוח ביצועים מקיף', description: 'ניתוח עסקאות והמרות', iconName: 'PieChart', targetRoute: '/crm-analytics', actionType: 'navigate' },
    ],
    kpis: [
      { id: 'kpi_crm_contacts', label: 'אנשי קשר ב-CRM', collectionName: 'mod_crm_contacts', calculationType: 'count', iconName: 'Contact', suffix: ' לקוחות', description: 'מאגר לקוחות מתועד' },
    ],
  },
  'ambassador-campaigns-hub': {
    category: 'marketing',
    iconName: 'Award',
    primaryCollections: ['mod_campaigns_list', 'mod_campaigns_donations'],
    actions: [
      { id: 'amb_new_campaign', label: 'קמפיין גיוס חדש', description: 'הגדרת יעד ודף שגרירים', iconName: 'Flag', targetRoute: '/ambassador-campaigns', actionType: 'navigate', badge: 'קמפיין' },
    ],
    kpis: [
      { id: 'kpi_amb_raised', label: 'סכום גיוס מצטבר', collectionName: 'mod_campaigns_donations', calculationType: 'sum', fieldToSum: 'amount', iconName: 'Sparkles', prefix: '₪', description: 'תרומות שנאספו' },
    ],
  },
  'video-producer-studio': {
    category: 'content',
    iconName: 'Video',
    primaryCollections: ['sdo_video_projects'],
    actions: [
      { id: 'video_new_script', label: 'הפקת תסריט וידאו AI', description: 'יצירת וידאו שיווקי באווטאר', iconName: 'Clapperboard', targetRoute: '/video-producer', actionType: 'navigate' },
    ],
    kpis: [
      { id: 'kpi_video_count', label: 'סרטונים שהופקו', collectionName: 'sdo_video_projects', calculationType: 'count', iconName: 'Film', suffix: ' סרטונים', description: 'סרטוני הדרכה ומכירות' },
    ],
  },
};

/**
 * Requirement ב:
 * "הרכיב זה צריך ליישם סקיל שכל רכיב חדש שנכנס למערכת מופיע ומקבל ביטוי"
 *
 * Dynamically converts ANY module in REGISTERED_MODULES into a rich DynamicModuleCapability.
 * If a new module is added by developers tomorrow, it is discovered automatically,
 * gets default intelligent actions, KPI bindings, and AI recognition without hardcoding!
 */
export function resolveDynamicModuleCapabilities(modules: ModuleDefinition[]): DynamicModuleCapability[] {
  return modules.map((mod) => {
    const known = MODULE_KNOWLEDGE_BASE[mod.id];
    
    // Fallback actions and KPIs generated intelligently from module metadata
    const defaultActions: ModuleActionDescriptor[] = known?.actions || [
      {
        id: `${mod.id}_open`,
        label: `פתח את ${mod.name}`,
        description: `כניסה ישירה לניהול רכיב ${mod.name}`,
        iconName: 'ExternalLink',
        targetRoute: mod.route,
        actionType: 'navigate',
      },
    ];

    const fallbackCollection = mod.collectionPrefix ? `${mod.collectionPrefix}items` : `${mod.id}_data`;
    const defaultKpis: ModuleKpiDescriptor[] = known?.kpis || [
      {
        id: `kpi_${mod.id}_records`,
        label: `פעילות ב-${mod.name}`,
        collectionName: fallbackCollection,
        calculationType: 'count',
        iconName: 'Activity',
        suffix: ' רשומות',
        description: `רשומות פעילות בקולקציית ${mod.name}`,
      },
    ];

    return {
      moduleId: mod.id,
      moduleName: mod.name,
      description: mod.description,
      route: mod.route,
      collectionPrefix: mod.collectionPrefix,
      iconName: known?.iconName || 'Cpu',
      category: known?.category || 'operations',
      primaryCollections: known?.primaryCollections || [fallbackCollection],
      actions: defaultActions,
      kpis: defaultKpis,
    };
  });
}
