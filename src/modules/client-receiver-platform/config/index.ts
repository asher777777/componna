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
    id: 'db-collections-hub',
    defaultTitle: 'סייר קולקציות ומאגר נתונים',
    defaultSlug: '/db-explorer',
    description: 'סייר ועורך מסמכי Firestore ישיר בזמן אמת',
    iconName: 'Database',
    requiredKeys: []
  }
];

export const DEFAULT_CLIENT_PLATFORM_SETTINGS = {
  clientId: 'client_demo_77',
  clientName: 'עוצמה דיגיטלית בע"מ',
  logoUrl: '',
  primaryColor: '#6366f1',
  modules: {
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
    'media-gallery-hub': {
      moduleId: 'media-gallery-hub',
      isEnabled: false,
      customSlug: '/media',
      customTitle: 'גלריית מדיה',
      requiredRole: 'editor' as const,
      thirdPartyKeys: {},
      collectionPrefix: 'sdo_media_'
    }
  },
  updatedAt: new Date().toISOString()
};
