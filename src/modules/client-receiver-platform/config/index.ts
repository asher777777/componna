export interface MasterModuleMetadata {
  id: string;
  defaultTitle: string;
  defaultSlug: string;
  description: string;
  iconName: string;
  requiredKeys: {
    key: string;
    label: string;
    description: string;
    isSecret: boolean;
  }[];
}

export const MASTER_AVAILABLE_MODULES: MasterModuleMetadata[] = [
  {
    id: 'video-producer-studio',
    defaultTitle: 'סטודיו וידאו ואווטאר (HeyGen & Studio)',
    defaultSlug: '/video-producer',
    description: 'אשף תסריטים ב-Gemini, הפקת סרטוני אווטאר עם HeyGen v3, ציר סצנות, טלפרומפטר וסנכרון מלא לגלריית המדיה',
    iconName: 'Film',
    requiredKeys: [
      { key: 'heygenApiKey', label: 'מפתח HeyGen API', description: 'להפקת סרטוני אווטאר והנפשה', isSecret: true },
      { key: 'geminiApiKey', label: 'מפתח Google Gemini API', description: 'למחולל התסריטים ועיבוד טקסט חכם', isSecret: true }
    ]
  },
  {
    id: 'db-connector-hub',
    defaultTitle: 'מרכז חיבור וסנכרון DB (Universal Connector)',
    defaultSlug: '/db-connector',
    description: 'סנכרון מרכזי של כלל המודולים למסד נתונים Firebase ו-Storage יחיד, פענוח חכם של מפתח JSON ב-Gemini',
    iconName: 'Cpu',
    requiredKeys: [
      { key: 'projectId', label: 'Firebase Project ID', description: 'מזהה פרויקט Firebase', isSecret: false },
      { key: 'apiKey', label: 'Firebase Web API Key', description: 'מפתח Web API של Firebase', isSecret: true }
    ]
  },
  {
    id: 'crm-analytics',
    defaultTitle: 'אנליטיקה ו-CRM',
    defaultSlug: '/crm-analytics',
    description: 'לוח תובנות מתקדם, כרטיס לקוח 360 AI, גרפים אינטראקטיביים וייצוא לאקסל',
    iconName: 'TrendingUp',
    requiredKeys: [
      { key: 'geminiApiKey', label: 'מפתח Google Gemini AI', description: 'לסיכום פרופיל 360 ומחולל הודעות', isSecret: true },
      { key: 'whatsappWebhook', label: 'WhatsApp Webhook URL', description: 'לסנכרון שיחות והודעות', isSecret: false }
    ]
  },
  {
    id: 'page-builder',
    defaultTitle: 'יוצר עמודים ואתרים',
    defaultSlug: '/page-builder',
    description: 'מערכת ויזואלית לבנייה, עריכה, עיצוב וסידור דפי נחיתה ואתרים',
    iconName: 'Layout',
    requiredKeys: [
      { key: 'customDomain', label: 'דומיין מותאם אישית', description: 'כתובת לפרסום הדפים', isSecret: false }
    ]
  },
  {
    id: 'auth-portal',
    defaultTitle: 'פורטל אימות וכניסה למערכת',
    defaultSlug: '/auth-portal',
    description: 'מערכת התחברות ורישום משתמשים, אימות Google, אימות אנונימי וניהול פרופילים ב-Firestore',
    iconName: 'Shield',
    requiredKeys: [
      { key: 'authDomain', label: 'Auth Domain', description: 'דומיין אימות של Firebase', isSecret: false }
    ]
  },
  {
    id: 'flow-player-engine',
    defaultTitle: 'נגן וידאו אינטראקטיבי',
    defaultSlug: '/flow-player',
    description: 'נגן וידאו אינטראקטיבי עם שכבות מידע וזיהוי כוונות קוליות',
    iconName: 'PlayCircle',
    requiredKeys: [
      { key: 'telemetryEndpoint', label: 'שרת טלמטריה', description: 'כתובת לרישום אירועי צפייה', isSecret: false }
    ]
  },
  {
    id: 'media-gallery-hub',
    defaultTitle: 'מנהל מדיה וגלריה',
    defaultSlug: '/media-gallery',
    description: 'העלאת תמונות וסרטונים, המרת פורמטים וניהול אחסון ענן',
    iconName: 'Image',
    requiredKeys: [
      { key: 'storageBucket', label: 'Cloud Storage Bucket', description: 'שם דלי האחסון לקבצים', isSecret: false }
    ]
  },
  {
    id: 'db-collections-hub',
    defaultTitle: 'סייר קולקציות ומאגר נתונים',
    defaultSlug: '/db-explorer',
    description: 'סייר ועורך מסמכי Firestore ישיר בזמן אמת',
    iconName: 'Database',
    requiredKeys: []
  },
  {
    id: 'template',
    defaultTitle: 'מודול תבנית בסיסי',
    defaultSlug: '/template',
    description: 'תבנית שלד מלאה עם 10 שכבות להעתקה ובדיקה',
    iconName: 'Layers',
    requiredKeys: []
  }
];

export const DEFAULT_CLIENT_PLATFORM_SETTINGS = {
  clientId: 'client_demo_77',
  clientName: 'עוצמה דיגיטלית בע"מ',
  logoUrl: '',
  primaryColor: '#6366f1',
  modules: {
    'video-producer-studio': {
      moduleId: 'video-producer-studio',
      isEnabled: true,
      customSlug: '/video-producer',
      customTitle: 'סטודיו וידאו ואווטאר',
      requiredRole: 'editor' as const,
      thirdPartyKeys: {},
      collectionPrefix: 'sdo_video_'
    },
    'db-connector-hub': {
      moduleId: 'db-connector-hub',
      isEnabled: true,
      customSlug: '/db-connector',
      customTitle: 'סנכרון DB מרכזי',
      requiredRole: 'admin' as const,
      thirdPartyKeys: {},
      collectionPrefix: ''
    },
    'crm-analytics': {
      moduleId: 'crm-analytics',
      isEnabled: true,
      customSlug: '/crm-analytics',
      customTitle: 'אנליטיקה ו-CRM',
      requiredRole: 'viewer' as const,
      thirdPartyKeys: {},
      collectionPrefix: 'mod_crm_'
    },
    'page-builder': {
      moduleId: 'page-builder',
      isEnabled: true,
      customSlug: '/pages',
      customTitle: 'עמודי נחיתה',
      requiredRole: 'editor' as const,
      thirdPartyKeys: {},
      collectionPrefix: 'mod_pagebuilder_'
    },
    'auth-portal': {
      moduleId: 'auth-portal',
      isEnabled: false,
      customSlug: '/auth',
      customTitle: 'פורטל כניסה',
      requiredRole: 'viewer' as const,
      thirdPartyKeys: {},
      collectionPrefix: 'mod_auth_'
    },
    'flow-player-engine': {
      moduleId: 'flow-player-engine',
      isEnabled: true,
      customSlug: '/flow-player',
      customTitle: 'נגן וידאו אינטראקטיבי',
      requiredRole: 'viewer' as const,
      thirdPartyKeys: {},
      collectionPrefix: 'sdo_player_'
    },
    'media-gallery-hub': {
      moduleId: 'media-gallery-hub',
      isEnabled: true,
      customSlug: '/media',
      customTitle: 'גלריית מדיה',
      requiredRole: 'editor' as const,
      thirdPartyKeys: {},
      collectionPrefix: 'sdo_media_'
    },
    'db-collections-hub': {
      moduleId: 'db-collections-hub',
      isEnabled: false,
      customSlug: '/db-explorer',
      customTitle: 'סייר קולקציות',
      requiredRole: 'admin' as const,
      thirdPartyKeys: {},
      collectionPrefix: ''
    },
    'template': {
      moduleId: 'template',
      isEnabled: false,
      customSlug: '/template',
      customTitle: 'מודול תבנית',
      requiredRole: 'viewer' as const,
      thirdPartyKeys: {},
      collectionPrefix: 'mod_template_'
    }
  },
  updatedAt: new Date().toISOString()
};
