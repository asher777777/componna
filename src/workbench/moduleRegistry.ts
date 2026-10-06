import React from 'react';

const ControlCenterStandaloneView = React.lazy(() =>
  import('../modules/control-center-hub').then((m) => ({ default: m.ControlCenterStandaloneView }))
);
const SaasStorefrontComposerStandaloneView = React.lazy(() =>
  import('../modules/saas-storefront-composer').then((m) => ({ default: m.SaasStorefrontComposerStandaloneView }))
);
const BrandDnaHubStandaloneView = React.lazy(() =>
  import('../modules/brand-dna-hub').then((m) => ({ default: m.BrandDnaHubStandaloneView }))
);
const KesherPaymentsStandaloneView = React.lazy(() =>
  import('../modules/kesher-payments-hub').then((m) => ({ default: m.KesherPaymentsStandaloneView }))
);
const WhatsAppGreenApiStandaloneView = React.lazy(() =>
  import('../modules/whatsapp-green-api-hub').then((m) => ({ default: m.WhatsAppGreenApiStandaloneView }))
);
const CrmGroupsHubStandaloneView = React.lazy(() =>
  import('../modules/crm-groups-hub').then((m) => ({ default: m.CrmGroupsHubStandaloneView }))
);
const SmartFormBuilderStandaloneView = React.lazy(() =>
  import('../modules/smart-form-builder').then((m) => ({ default: m.SmartFormBuilderStandaloneView }))
);
const VideoProducerStudioView = React.lazy(() =>
  import('../modules/video-producer-studio').then((m) => ({ default: m.VideoProducerStudioView }))
);
const DbConnectorHubStandaloneView = React.lazy(() =>
  import('../modules/db-connector-hub').then((m) => ({ default: m.DbConnectorHubStandaloneView }))
);
const ClientReceiverPlatformStandaloneView = React.lazy(() =>
  import('../modules/client-receiver-platform').then((m) => ({ default: m.ClientReceiverPlatformStandaloneView }))
);
const CrmAnalyticsStandaloneView = React.lazy(() =>
  import('../modules/crm-analytics').then((m) => ({ default: m.CrmAnalyticsStandaloneView }))
);
const PageBuilderStandaloneView = React.lazy(() =>
  import('../modules/page-builder').then((m) => ({ default: m.PageBuilderStandaloneView }))
);
const AuthPortalStandaloneView = React.lazy(() =>
  import('../modules/auth-portal').then((m) => ({ default: m.AuthPortalStandaloneView }))
);
const FlowPlayerEngineStandaloneView = React.lazy(() =>
  import('../modules/flow-player-engine').then((m) => ({ default: m.FlowPlayerEngineStandaloneView }))
);
const MediaGalleryHubStandaloneView = React.lazy(() =>
  import('../modules/media-gallery-hub').then((m) => ({ default: m.MediaGalleryHubStandaloneView }))
);
const DbCollectionsHubStandaloneView = React.lazy(() =>
  import('../modules/db-collections-hub').then((m) => ({ default: m.DbCollectionsHubStandaloneView }))
);
const TemplateStandaloneView = React.lazy(() =>
  import('../modules/_template').then((m) => ({ default: m.TemplateStandaloneView }))
);

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  route: string;
  collectionPrefix: string;
}

export const REGISTERED_MODULES: ModuleDefinition[] = [
  {
    id: 'control-center-hub',
    name: 'מרכז השליטה והבקרה (Control Center Hub)',
    description: 'לוח בקרה מרכזי בסטנדרט יוקרתי לניהול, ניטור והפעלת כל רכיבי המערכת בממשק אחיד עם 5 סוגי פריסות',
    component: ControlCenterStandaloneView,
    route: '/control-center',
    collectionPrefix: 'mod_ctrlcenter_',
  },
  {
    id: 'saas-storefront-composer',
    name: 'חנות רכיבים, סאב-דומיינים ו-SaaS (Storefront)',
    description: 'חנות מרקטפלייס לאורחים: בחירת רכיבים, התנסות חיה (Sandbox), סליקה, ובחירת סאב-דומיין מיידי (GoDaddy DNS) ללא שכפול שרתים',
    component: SaasStorefrontComposerStandaloneView,
    route: '/saas-storefront',
    collectionPrefix: 'sys_storefront_',
  },
  {
    id: 'brand-dna-hub',
    name: 'מרכז מיתוג גלובלי (Brand DNA & AI)',
    description: 'ה-DNA של המערכת: זהות עסקית, אישיות וטון דיבור, פרופילי פרסונות, Design Tokens וסנכרון הנחיות לכל מודולי ה-AI',
    component: BrandDnaHubStandaloneView,
    route: '/brand-dna',
    collectionPrefix: 'brand_dna_',
  },
  {
    id: 'kesher-payments-hub',
    name: 'סליקה והפקת מסמכים (קשר & איזי קאונט Hub)',
    description: 'סליקת אשראי, ביט, הוראות קבע, הפקת קבלות וחשבוניות לפי קוד מסמך (320/405/400), סנכרון תקבולים והגדרות מסוף',
    component: KesherPaymentsStandaloneView,
    route: '/kesher-payments',
    collectionPrefix: 'kesher_',
  },
  {
    id: 'whatsapp-green-api-hub',
    name: 'וואטסאפ ואוטומציה (GREEN-API Hub)',
    description: 'מרכז וואטסאפ מקיף: אימות QR/הודעה, סנכרון Webhook, שליחת מדיה/סקרים/כפתורים, ניהול קבוצות והיסטוריית שיחות',
    component: WhatsAppGreenApiStandaloneView,
    route: '/whatsapp-hub',
    collectionPrefix: 'wa_',
  },
  {
    id: 'crm-groups-hub',
    name: 'ניהול קהילות וקבוצות CRM (Groups & Communities Hub)',
    description: 'מערכת רב-שכבתית לניהול קהילות, סגמנטציה חכמה (Smart Groups), עמודי שגרירים, גיוס כספי וייבוא מתקדם מוואטסאפ',
    component: CrmGroupsHubStandaloneView,
    route: '/crm-groups',
    collectionPrefix: 'crm_groups',
  },
  {
    id: 'smart-form-builder',
    name: 'בונה הטפסים החכם (Smart Form Builder)',
    description: 'מחולל טפסים רב-שלביים יוקרתיים ב-AI, שלב-אחר-שלב, תת-קולקציות וחיבור ישיר לאנליטיקה ול-CRM',
    component: SmartFormBuilderStandaloneView,
    route: '/smart-forms',
    collectionPrefix: 'mod_forms',
  },
  {
    id: 'video-producer-studio',
    name: 'סטודיו וידאו ואווטאר (SDO Video Producer & HeyGen)',
    description: 'אשף תסריטים ב-Gemini, הפקת סרטוני אווטאר עם HeyGen v3, ציר סצנות, טלפרומפטר וסנכרון מלא לגלריית המדיה',
    component: VideoProducerStudioView,
    route: '/video-producer',
    collectionPrefix: 'sdo_video_',
  },
  {
    id: 'db-connector-hub',
    name: 'מרכז חיבור וסנכרון DB (Universal Connector)',
    description: 'סנכרון מרכזי של כלל המודולים למסד נתונים Firebase ו-Storage יחיד, פענוח חכם של מפתח JSON ב-Gemini',
    component: DbConnectorHubStandaloneView,
    route: '/db-connector',
    collectionPrefix: '',
  },
  {
    id: 'client-platform',
    name: 'פלטפורמת מקלט לקוח (Client Platform Shell)',
    description: 'שלד לקוח מלא עם אימות, טבלת סימון והפעלה של רכיבים, סלאגים מותאמים וניווט דינמי',
    component: ClientReceiverPlatformStandaloneView,
    route: '/client-platform',
    collectionPrefix: 'client_',
  },
  {
    id: 'crm-analytics',
    name: 'אנליטיקה ודוחות CRM (Analytics)',
    description: 'לוח בקרה מתקדם, גרפים אינטראקטיביים, פילוח קהילות ותגיות, וטבלה דינמית עם ייצוא לאקסל',
    component: CrmAnalyticsStandaloneView,
    route: '/crm-analytics',
    collectionPrefix: 'mod_crm_',
  },
  {
    id: 'page-builder',
    name: 'יוצר העמודים והאתרים (Page Builder)',
    description: 'מערכת ויזואלית מלאה לבנייה, עריכה, עיצוב וסידור דפים עם אזורי עריכה ותצוגה דואליים',
    component: PageBuilderStandaloneView,
    route: '/page-builder',
    collectionPrefix: 'mod_pagebuilder_',
  },
  {
    id: 'auth-portal',
    name: 'פורטל אימות וכניסה למערכת',
    description: 'מערכת התחברות ורישום משתמשים, אימות Google, אימות אנונימי וניהול פרופילים ב-Firestore',
    component: AuthPortalStandaloneView,
    route: '/auth-portal',
    collectionPrefix: 'mod_auth_',
  },
  {
    id: 'flow-player-engine',
    name: 'מנוע נגן זרימה אינטראקטיבי',
    description: 'נגן וידאו אינטראקטיבי עם סנכרון שכבות UI, זיהוי כוונות קוליות ורישום טלמטריה',
    component: FlowPlayerEngineStandaloneView,
    route: '/flow-player-engine',
    collectionPrefix: 'sdo_player_',
  },
  {
    id: 'media-gallery-hub',
    name: 'מנהל מדיה וגלריה אוניברסלי',
    description: 'העלאה מרובה, גלריית סרטונים/תמונות/שמע, המרת פורמט תמונות והורדה מרובה',
    component: MediaGalleryHubStandaloneView,
    route: '/media-gallery-hub',
    collectionPrefix: 'sdo_media_',
  },
  {
    id: 'db-collections-hub',
    name: 'מנהל קולקציות ומאגר נתונים (Firestore)',
    description: 'סייר קולקציות מלא, עריכת מסמכים, ניהול מפתחות פיירבייס ושמירה ישירה בזמן אמת',
    component: DbCollectionsHubStandaloneView,
    route: '/db-collections',
    collectionPrefix: '',
  },
  {
    id: 'template',
    name: 'מודול תבנית בסיסי',
    description: 'תבנית שלד מלאה עם 10 שכבות להעתקה ובדיקה',
    component: TemplateStandaloneView,
    route: '/template',
    collectionPrefix: 'mod_template_',
  },
];
