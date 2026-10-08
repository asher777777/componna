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
const AmbassadorCampaignsStandaloneView = React.lazy(() =>
  import('../modules/ambassador-campaigns-hub').then((m) => ({ default: m.AmbassadorCampaignsStandaloneView }))
);

const KosaiEngineStandaloneView = React.lazy(() =>
  import('../modules/kosai-engine').then((m) => ({ default: m.KosaiStandaloneView }))
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
    id: 'kosai-engine',
    name: 'קשואן AI - מנוע חכם (Kosai Engine)',
    description: 'מנוע בינה מלאכותית המוביל שלנו לשליטה בעריכה, ממשק ועיצוב. מותאם במדויק ל-Brand DNA לתוצאות מוכחות ואיכות ללא פשרות.',
    component: KosaiEngineStandaloneView,
    route: '/kosai-engine',
    collectionPrefix: 'mod_kosai_',
  },
  {
    id: 'control-center-hub',
    name: 'קשואן Control - מרכז השליטה והבקרה',
    description: 'לוח בקרה מרכזי בסטנדרט יוקרתי, המעניק לכם שקט נפשי ושליטה מלאה בכל רכיבי המערכת בממשק אחיד ומקצועי.',
    component: ControlCenterStandaloneView,
    route: '/control-center',
    collectionPrefix: 'mod_ctrlcenter_',
  },
  {
    id: 'saas-storefront-composer',
    name: 'קשואן Storefront - החנות הדיגיטלית',
    description: 'מרקטפלייס מתקדם המציע ללקוחות שלכם התנסות חיה, סליקה מהירה ובחירת סאב-דומיין. שירות ברמת איכות ומומחיות הגבוהה ביותר.',
    component: SaasStorefrontComposerStandaloneView,
    route: '/saas-storefront',
    collectionPrefix: 'sys_storefront_',
  },
  {
    id: 'brand-dna-hub',
    name: 'קשואן DNA - מרכז הזהות והמיתוג',
    description: 'הלב והזהות העסקית שלכם: אפיון טון דיבור, קהלי יעד וסנכרון מלא של שפת המותג לכל הרכיבים, להבטחת ליווי אישי ועקביות.',
    component: BrandDnaHubStandaloneView,
    route: '/brand-dna',
    collectionPrefix: 'brand_dna_',
  },
  {
    id: 'kesher-payments-hub',
    name: 'קשואן Pay - פתרונות סליקה',
    description: 'מערכת סליקה מאובטחת המעניקה לכם וללקוחותיכם שקט נפשי מושלם: אשראי, ביט והפקת קבלות וחשבוניות אוטומטיות.',
    component: KesherPaymentsStandaloneView,
    route: '/kesher-payments',
    collectionPrefix: 'kesher_',
  },
  {
    id: 'whatsapp-green-api-hub',
    name: 'קשואן אוטומציות - שירות לקוחות WhatsApp',
    description: 'מרכז וואטסאפ מקיף עם תוצאות מוכחות: סנכרון אוטומטי, שליחת מדיה, סקרים וניהול קבוצות ברמה המקצועית ביותר.',
    component: WhatsAppGreenApiStandaloneView,
    route: '/whatsapp-hub',
    collectionPrefix: 'wa_',
  },
  {
    id: 'crm-groups-hub',
    name: 'קשואן קהילות - ניהול קבוצות ו-CRM',
    description: 'מערכת מתקדמת לניהול קהילות המעניקה ליווי אישי. סגמנטציה חכמה, ניהול קבוצות וסנכרון מלא לפעילות הארגון שלכם.',
    component: CrmGroupsHubStandaloneView,
    route: '/crm-groups',
    collectionPrefix: 'crm_groups',
  },
  {
    id: 'smart-form-builder',
    name: 'קשואן Forms - מחולל טפסים חכמים',
    description: 'יצירת טפסים יוקרתיים בעזרת AI. כלים מתקדמים המספקים חוויה מקצועית למשתמשים ואינטגרציה חלקה להגדלת ההמרות.',
    component: SmartFormBuilderStandaloneView,
    route: '/smart-forms',
    collectionPrefix: 'mod_forms',
  },
  {
    id: 'video-producer-studio',
    name: 'קשואן Studio - סטודיו הפקות וידאו',
    description: 'אולפן הפקות מתקדם: אשף תסריטים, סרטוני אווטאר וטלפרומפטר איכותי, שמבטיחים מומחיות ונראות מקצועית בכל סרטון.',
    component: VideoProducerStudioView,
    route: '/video-producer',
    collectionPrefix: 'sdo_video_',
  },
  {
    id: 'db-connector-hub',
    name: 'קשואן Connector - מחולל אינטגרציות',
    description: 'סנכרון חכם ואמין לכלל המודולים, המעניק לכם שקט נפשי עם מסד נתונים אחוד, ואנליזה חכמה מבוססת AI.',
    component: DbConnectorHubStandaloneView,
    route: '/db-connector',
    collectionPrefix: '',
  },
  {
    id: 'client-platform',
    name: 'קשואן Onboarding - קליטת לקוחות',
    description: 'פלטפורמת אזור אישי יוקרתית הכוללת אימות, ניווט דינמי והפעלה חלקה של רכיבים - המקרינה מומחיות מרגע ההרשמה.',
    component: ClientReceiverPlatformStandaloneView,
    route: '/client-platform',
    collectionPrefix: 'client_',
  },
  {
    id: 'crm-analytics',
    name: 'קשואן Analytics - ניתוח נתונים ו-CRM',
    description: 'לוח בקרה חכם המציג לכם תוצאות מוכחות בזמן אמת. גרפים, פילוחים וייצוא נתונים בקליק, לשליטה מלאה בעסק.',
    component: CrmAnalyticsStandaloneView,
    route: '/crm-analytics',
    collectionPrefix: 'mod_crm_',
  },
  {
    id: 'page-builder',
    name: 'קשואן Builder - בונה עמודים ודפי נחיתה',
    description: 'מערכת ויזואלית חכמה לבניית דפים יוקרתיים, להצגת המומחיות והאיכות הבלתי מתפשרת שלכם מול קהל הלקוחות.',
    component: PageBuilderStandaloneView,
    route: '/page-builder',
    collectionPrefix: 'mod_pagebuilder_',
  },
  {
    id: 'auth-portal',
    name: 'קשואן Auth - שער התחברות מאובטח',
    description: 'מערכת הרשמה והתחברות מתקדמת, המבטיחה לכם שקט נפשי מוחלט עם גישה מאובטחת לכל אזורי המערכת.',
    component: AuthPortalStandaloneView,
    route: '/auth-portal',
    collectionPrefix: 'mod_auth_',
  },
  {
    id: 'flow-player-engine',
    name: 'קשואן Flow - נגן תהליכים אינטראקטיבי',
    description: 'נגן מתקדם המשלב אינטראקציות חכמות וזיהוי קולי, ומספק חווית משתמש מרשימה התורמת להשגת תוצאות מוכחות.',
    component: FlowPlayerEngineStandaloneView,
    route: '/flow-player-engine',
    collectionPrefix: 'sdo_player_',
  },
  {
    id: 'media-gallery-hub',
    name: 'קשואן Gallery - ניהול מדיה מתקדם',
    description: 'ספריית מדיה איכותית לניהול חכם של תמונות, וידאו ושמע, כדי שתמיד תשדרו ללקוחות איכות ומקצועיות ברמה הגבוהה ביותר.',
    component: MediaGalleryHubStandaloneView,
    route: '/media-gallery-hub',
    collectionPrefix: 'sdo_media_',
  },
  {
    id: 'db-collections-hub',
    name: 'קשואן Data - ניהול מאגרי מידע',
    description: 'סייר נתונים לשליטה מדויקת, המבטיח סדר מופתי, מקצועיות ושקט נפשי בניהול הרשומות המורכבות ביותר שלכם.',
    component: DbCollectionsHubStandaloneView,
    route: '/db-collections',
    collectionPrefix: '',
  },
  {
    id: 'template',
    name: 'קשואן Template - שלד רכיב',
    description: 'תבנית בסיס איכותית המיועדת להקמת מודולים חדשים, תוך שמירה על סטנדרט המצוינות שאתם מכירים.',
    component: TemplateStandaloneView,
    route: '/template',
    collectionPrefix: 'mod_template_',
  },
  {
    id: 'ambassador-campaigns-hub',
    name: 'קשואן שגרירים - ניהול קמפיינים וגיוס',
    description: 'מערכת גיוס המונים חכמה, המעניקה ליווי אישי לכל שגריר עם יעדי גיוס והתראות חיות להשגת תוצאות מוכחות ומרשימות.',
    component: AmbassadorCampaignsStandaloneView,
    route: '/ambassador-campaigns',
    collectionPrefix: 'mod_campaigns_',
  }
];
