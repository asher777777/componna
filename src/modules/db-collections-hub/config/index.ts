import { CollectionMetadata, FirebaseCredentialsConfig } from '../types';

export const DEFAULT_ENV_CREDENTIALS: FirebaseCredentialsConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)',
};

export const PREDEFINED_COLLECTIONS: CollectionMetadata[] = [
  // 1. CRM, Contacts & Community Collections
  {
    id: 'contacts',
    name: 'אנשי קשר ולידים ראשיים (Contacts & CRM)',
    description: 'מאגר אנשי הקשר והלידים המרכזי של הדייר, פילוחי קהילות, תגיות ופרטי תקשורת',
    category: 'crm',
    icon: 'Users',
  },
  {
    id: 'crm_groups',
    name: 'קבוצות וקהילות חכמות (Smart Groups & Communities)',
    description: 'קבוצות חכמות, קהילות דייר, יעדי גיוס, חוקי סינון דינמיים ופילוחי לקוחות',
    category: 'crm',
    icon: 'Users',
  },
  {
    id: 'crm_interactions',
    name: 'אינטראקציות ותיעוד לקוח (CRM Interactions)',
    description: 'תיעוד שיחות טלפוניות, הודעות, הערכות AI והיסטוריית קשר',
    category: 'crm',
    icon: 'FileText',
  },
  {
    id: 'crm_chat_messages',
    name: 'הודעות צ׳אט CRM (Chat Messages)',
    description: 'תכתובות לקוח, צ׳אט פנימי ומסרים ישירים',
    category: 'crm',
    icon: 'MessageSquare',
  },
  {
    id: 'mod_crm_leads',
    name: 'לידים ייעודיים (CRM Leads)',
    description: 'לידים בתהליך משפך, מקורות הגעה וסטטוסי מכירה',
    category: 'crm',
    icon: 'Users',
  },
  {
    id: 'mod_crm_campaigns',
    name: 'קמפיינים שיווקיים (CRM Campaigns)',
    description: 'מעקב ביצועי קמפיינים, יחסי המרה ונתוני חשיפה',
    category: 'crm',
    icon: 'BarChart3',
  },

  // 2. Financials & EasyCount Transactions (קשר & איזיקאונט)
  {
    id: 'kesher_transactions',
    name: 'עסקאות וסליקה (Kesher Transactions)',
    description: 'עסקאות אשראי, קבלות דיגיטליות, חשבוניות מס ותרומות לפי סעיף 46',
    category: 'payments',
    icon: 'CreditCard',
  },
  {
    id: 'kesher_receipt_glossary',
    name: 'מילון סעיפי קבלה (Receipt Glossary)',
    description: 'סעיפי תקציב, קודי הכנסה ומילון קבלות מותאם',
    category: 'payments',
    icon: 'FileText',
  },
  {
    id: 'kesher_standing_orders',
    name: 'הוראות קבע ותשלומים חוזרים (Standing Orders)',
    description: 'הוראות קבע פעילות, מעקב חיובים חודשיים והרשאות',
    category: 'payments',
    icon: 'CreditCard',
  },

  // 3. Smart Form Builder (טפסים חכמים)
  {
    id: 'mod_forms',
    name: 'טפסים חכמים ושאלונים (Smart Forms)',
    description: 'מבנה טפסים רב-שלביים, הגדרות עיצוב יוקרתי, שדות דינמיים וטריגרים',
    category: 'forms',
    icon: 'CheckSquare',
  },
  {
    id: 'submissions',
    name: 'הגשות טפסים ופניות (Form Submissions)',
    description: 'נתוני מילוי טפסים, תשובות משתמשים וסנכרון לידים ל-CRM',
    category: 'forms',
    icon: 'CheckSquare',
  },

  // 4. WhatsApp Green API & AI Bots
  {
    id: 'whatsapp_ai_bots',
    name: 'בוטים וסוכני AI (WhatsApp AI Bots)',
    description: 'הגדרות סוכני שיחה, הנחיות מותג, מודלי שפה והתנהגות מענה',
    category: 'whatsapp',
    icon: 'MessageSquare',
  },
  {
    id: 'wa_chats',
    name: 'שיחות וואטסאפ (WhatsApp Chats)',
    description: 'ערוצי שיחה פעילים עם לקוחות דרך Green API',
    category: 'whatsapp',
    icon: 'MessageSquare',
  },
  {
    id: 'wa_messages',
    name: 'הודעות וואטסאפ (WhatsApp Messages)',
    description: 'היסטוריית הודעות נכנסות ויוצאות, סטטוסי מסירה וזמנים',
    category: 'whatsapp',
    icon: 'Send',
  },
  {
    id: 'wa_bot_chats',
    name: 'שיחות בוט AI פעילות (Bot Conversations)',
    description: 'לוג שיחות מנוהלות ע״י מנוע הבינה המלאכותית',
    category: 'whatsapp',
    icon: 'Sparkles',
  },
  {
    id: 'wa_statuses',
    name: 'סטטוסי שיחה ותורים (Chat Statuses)',
    description: 'סטטוסי שיחות, ניתוב נציגים ותורים פעילים',
    category: 'whatsapp',
    icon: 'Activity',
  },

  // 5. Video Producer Studio
  {
    id: 'sdo_video_projects',
    name: 'פרויקטי וידאו ותסריטים (Video Projects)',
    description: 'פרויקטי וידאו, תסריטים, מבנה סצנות, פרומפטים והגדרות אווטאר',
    category: 'video_studio',
    icon: 'Film',
  },
  {
    id: 'sdo_video_scenes',
    name: 'סצנות וידאו מרונדרות (Video Scenes)',
    description: 'סצנות ערוכות, קבצי וידאו מוכנים וקטעי קריינות מופקים',
    category: 'video_studio',
    icon: 'Video',
  },
  {
    id: 'sdo_video_generation_jobs',
    name: 'משימות רינדור (Generation Jobs)',
    description: 'סטטוס משימות רינדור ב-HeyGen, Google Veo ו-Imagen 3',
    category: 'video_studio',
    icon: 'Sparkles',
  },

  // 6. Flow Player Engine
  {
    id: 'sdo_player_campaign_configs',
    name: 'קונפיגורציית קמפיינים (Flow Player)',
    description: 'מצבי וידאו אינטראקטיביים, טריגרים קוליים, שכבות ומעברים',
    category: 'flow_player',
    icon: 'PlayCircle',
  },
  {
    id: 'sdo_player_session_events',
    name: 'אירועי סשן נגן (Session Events)',
    description: 'אירועי צפייה, לחיצות, אינטראקציות קוליות ומעברים בזמן אמת',
    category: 'flow_player',
    icon: 'Activity',
  },
  {
    id: 'sdo_player_telemetry',
    name: 'טלמטריה ונתוני שימוש (Telemetry)',
    description: 'לוגים טכניים, ביצועי טעינת וידאו וסטטיסטיקות שימוש',
    category: 'flow_player',
    icon: 'Gauge',
  },
  {
    id: 'presenters',
    name: 'פרזנטורים וסוכנים (Presenters)',
    description: 'הגדרות דמויות AI, קולות ומאפייני פרזנטציה',
    category: 'flow_player',
    icon: 'UserCheck',
  },

  // 7. Media Gallery Collections
  {
    id: 'sdo_media_items',
    name: 'קבצי מדיה וגלריה (Media Items)',
    description: 'סרטוני וידאו, תמונות, הקלטות קוליות ומטא-דאטה מ-Storage',
    category: 'media',
    icon: 'Image',
  },
  {
    id: 'sdo_media_folders',
    name: 'תיקיות מדיה (Media Folders)',
    description: 'מבנה תיקיות וחלוקת קטגוריות לקבצי מדיה',
    category: 'media',
    icon: 'Folder',
  },
  {
    id: 'sdo_media_tags',
    name: 'תגיות מדיה (Media Tags)',
    description: 'תיוגים וקטלוג חכם של נכסי מדיה',
    category: 'media',
    icon: 'Tag',
  },

  // 8. Page Builder Collections
  {
    id: 'mod_pagebuilder_pages',
    name: 'דפים ואתרים (Page Builder Pages)',
    description: 'דפי נחיתה ואתרים מעוצבים, מבנה בלוקים והגדרות SEO',
    category: 'page_builder',
    icon: 'Layout',
  },
  {
    id: 'mod_pagebuilder_components',
    name: 'רכיבי עמוד (Page Components)',
    description: 'ספריית רכיבים ובלוקים מותאמים לעריכה ויזואלית',
    category: 'page_builder',
    icon: 'Layers',
  },
  {
    id: 'mod_pagebuilder_templates',
    name: 'תבניות דפים (Page Templates)',
    description: 'תבניות מוכנות מראש לבניית דפים מהירה',
    category: 'page_builder',
    icon: 'FolderArchive',
  },

  // 9. Client Receiver Platform
  {
    id: 'client_platform_configs',
    name: 'קונפיגורציית מקלט לקוח (Platform Config)',
    description: 'הגדרות שלד הלקוח, מיתוג וסלאגים מותאמים',
    category: 'client_platform',
    icon: 'Smartphone',
  },
  {
    id: 'client_components',
    name: 'רכיבי לקוח מופעלים (Client Components)',
    description: 'טבלת סימון והפעלה של רכיבים בממשק הלקוח',
    category: 'client_platform',
    icon: 'Layers',
  },
  {
    id: 'client_user_sessions',
    name: 'סשנים של לקוחות (User Sessions)',
    description: 'יומני שימוש וסשנים פעילים בפלטפורמת הלקוח',
    category: 'client_platform',
    icon: 'Activity',
  },

  // 10. Auth Portal & Users
  {
    id: 'users',
    name: 'משתמשים וחשבונות (Users)',
    description: 'פרופילי משתמשים, הרשאות ניהול ונתוני התחברות',
    category: 'auth',
    icon: 'Users',
  },
  {
    id: 'auth_profiles',
    name: 'פרופילי אימות (Auth Profiles)',
    description: 'הגדרות אימות מורחבות, סנכרון Google וטלפון',
    category: 'auth',
    icon: 'UserCheck',
  },
  {
    id: 'auth_audit_logs',
    name: 'יומני אבטחה וכניסה (Audit Logs)',
    description: 'תיעוד כניסות, שינויי הרשאות ואירועי אבטחה',
    category: 'auth',
    icon: 'ShieldCheck',
  },

  // 11. SaaS Tenants, Orders & Customer Subscriptions
  {
    id: 'tenants',
    name: 'דיירים ולקוחות מערכת (SaaS Tenants & Subdomains)',
    description: 'רישומי כל הדיירים והלקוחות: סאב-דומיינים, רכיבים מורשים שנרכשו, מיתוג וסטטוס פעילות',
    category: 'system',
    icon: 'Globe',
  },
  {
    id: 'saas_orders',
    name: 'הזמנות ורכישות רכיבים (Orders & Subscriptions)',
    description: 'תיעוד כל העסקאות והמודולים שנרכשו: פרטי לקוח, סל מוצרים, חותמת זמן ומחירים',
    category: 'payments',
    icon: 'CreditCard',
  },

  // 12. System, Brand DNA & Platform Infrastructure
  {
    id: 'settings',
    name: 'הגדרות מותג ודייר (Tenant Brand DNA)',
    description: 'קולקציית הגדרות הדייר: מסמך brand_dna (זהות, צבעים, לוגו, קול וערכים)',
    category: 'system',
    icon: 'Settings',
  },
  {
    id: 'system_settings',
    name: 'תשתיות מערכת גלובליות (Global Platform Settings)',
    description: 'קונפיגורציית תשתית מערכתית: מפתחות Firebase, חיבורי AI ומאגרי מידע',
    category: 'system',
    icon: 'Settings',
  },
  {
    id: 'content_strategies',
    name: 'אסטרטגיות תוכן ומכירה AI (Content Strategies)',
    description: 'אסטרטגיות תוכן ועמודי מכירה/שירות שנוצרו על בסיס Brand DNA ונשמרו לשימוש חוזר',
    category: 'system',
    icon: 'Sparkles',
  },
  {
    id: 'mod_template_items',
    name: 'פריטי תבנית (Template Items)',
    description: 'קולקציית ברירת המחדל של מודול התבנית',
    category: 'system',
    icon: 'Layers',
  },
  {
    id: 'mod_template_logs',
    name: 'לוגים כלליים (Template Logs)',
    description: 'יומני אירועים ומערכת של מודול התבנית',
    category: 'system',
    icon: 'FileText',
  },
];
