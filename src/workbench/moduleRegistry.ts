import React from 'react';

const BrandDnaHubStandaloneView = React.lazy(() =>
  import('../modules/KosBranding').then((m) => ({ default: m.BrandDnaHubStandaloneView }))
);
const KesherPaymentsStandaloneView = React.lazy(() =>
  import('../modules/kesher-payments-hub').then((m) => ({ default: m.KesherPaymentsStandaloneView }))
);
const KosWhatsUpStandaloneView = React.lazy(() =>
  import('../modules/KosWhatsUp').then((m) => ({ default: m.KosWhatsUpStandaloneView }))
);
const WhatsAppGreenApiStandaloneView = KosWhatsUpStandaloneView;
const KosTogetherStandaloneView = React.lazy(() =>
  import('../modules/KosTogether').then((m) => ({ default: m.CrmGroupsHubStandaloneView }))
);
const SmartFormBuilderStandaloneView = React.lazy(() =>
  import('../modules/KSF').then((m) => ({ default: m.KSFStandaloneView }))
);
const KSFStandaloneView = React.lazy(() =>
  import('../modules/KSF').then((m) => ({ default: m.KSFStandaloneView }))
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
  import('../modules/KosWebAi').then((m) => ({ default: m.PageBuilderStandaloneView }))
);
const AuthPortalStandaloneView = React.lazy(() =>
  import('../modules/auth-portal').then((m) => ({ default: m.AuthPortalStandaloneView }))
);
const FlowPlayerEngineStandaloneView = React.lazy(() =>
  import('../modules/flow-player-engine').then((m) => ({ default: m.FlowPlayerEngineStandaloneView }))
);
const KosCloudStoreStandaloneView = React.lazy(() =>
  import('../modules/KosCloudStore').then((m) => ({ default: m.KosCloudStoreStandaloneView }))
);
const MediaGalleryHubStandaloneView = KosCloudStoreStandaloneView;
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

const KosunAmModule = React.lazy(() =>
  import('../modules/kosun-am').then((m) => ({ default: m.KosunAmStandaloneView }))
);

const KosunBoardComposerStandaloneView = React.lazy(() =>
  import('../modules/kosun-board-composer').then((m) => ({ default: m.KosunBoardComposerStandaloneView }))
);

const KosTenantProvisionerStandaloneView = React.lazy(() =>
  import('../modules/KosTenantProvisioner').then((m) => ({ default: m.KosTenantProvisionerStandaloneView }))
);

const KosTubeStandaloneView = React.lazy(() =>
  import('../modules/KosTube').then((m) => ({ default: m.KosTubeStandaloneView }))
);

const KosTikTokStandaloneView = React.lazy(() =>
  import('../modules/KosTikTok').then((m) => ({ default: m.StandaloneView }))
);

const KosSubscribedStandaloneView = React.lazy(() =>
  import('../modules/KosSubscribed').then((m) => ({ default: m.KosSubscribedStandaloneView }))
);

// Register KosDesBuilder UI capabilities eagerly for universal dashboard rendering
import '../modules/KosDesBuilder';

const KosDesBuilderStandaloneView = React.lazy(() =>
  import('../modules/KosDesBuilder').then((m) => ({ default: m.KosDesBuilderStandaloneView }))
);

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  route: string;
  collectionPrefix: string;
  isSystemModule?: boolean;
}

export const REGISTERED_MODULES: ModuleDefinition[] = [
  {
    id: 'KosSubscribed',
    name: 'קושאן Subscribed - ניהול מנויי תוכן, חבילות ומבחנים',
    description: 'מכירת מנויים לתצוגת תוכן, יצירת חבילות חודשיות והנחות, שידוך אנשי קשר, עמודי תשלום וטפסי מבחנים המחוברים בחוזה ל-CRM.',
    component: KosSubscribedStandaloneView,
    route: '/KosSubscribed',
    collectionPrefix: 'crm_subscription_',
  },
  {
    id: 'KosTikTok',
    name: 'קושאן TikTok - פרסום סרטונים, לידים ומעקב המרות',
    description: 'חיבור חשבונות TikTok ב-OAuth 2.0, פרסום ישיר של סרטונים, קליטת לידים מטפסים ממומנים ומעקב המרות Events API.',
    component: KosTikTokStandaloneView,
    route: '/KosTikTok',
    collectionPrefix: 'mod_kos_tiktok_',
  },
  {
    id: 'KosTube',
    name: 'קושאן Tube - חיבור יוטיוב וקידום SEO מבוסס AI',
    description: 'סנכרון ערוץ יוטיוב, המרת סרטונים למאמרי עומק ב-AI ויצירת עמודי SEO מקודמים בגוגל עם סכמת נתונים עשירה.',
    component: KosTubeStandaloneView,
    route: '/KosTube',
    collectionPrefix: 'mod_kos_tube_',
  },
  {
    id: 'KosTenantProvisioner',
    name: 'ניהול סאב-דומיינים והטענת רכיבים',
    description: 'הקמת סאב-דומיינים מבודדים 100%, הטענת רכיבים מודולריים, ניהול שמות משתמש וסיסמאות לפי חוקי KOSUN26.',
    component: KosTenantProvisionerStandaloneView,
    route: '/tenant-provisioner',
    collectionPrefix: 'sys_tenants_',
    isSystemModule: true,
  },
  {
    id: 'KosDesBuilder',
    name: 'KosDesBuilder - מעצב לוחות בקרה ועמודי מנהל',
    description: 'עיצוב והגדרת לוחות בקרה דינמיים, טבלאות נתונים, מדדי KPI ותפריטים צפים תחת טננט מנג׳ר בלבד.',
    component: KosDesBuilderStandaloneView,
    route: '/KosDesBuilder',
    collectionPrefix: 'mod_kos_des_',
    isSystemModule: true,
  },
  {
    id: 'kosun-board-composer',
    name: 'קושאן בורד - מחולל מערכות AI',
    description: 'חיבור רכיבי המערכת באמצעות Gemini AI לייצור לוחות בקרה ומערכות מותאמות אישית המשודכות לסאב-דומיינים של משתמשים.',
    component: KosunBoardComposerStandaloneView,
    route: '/board-composer',
    collectionPrefix: 'mod_kosun_board_',
  },
  {
    id: 'kosun-am',
    name: 'קושאן מייל אוטומטי',
    description: 'מערכת דיוור, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות חכמות',
    component: KosunAmModule,
    route: '/kosun-am',
    collectionPrefix: 'mod_kosun_am_',
  },
  {
    id: 'kosai-engine',
    name: 'קשואן AI - מנוע חכם (Kosai Engine)',
    description: 'מנוע בינה מלאכותית המוביל שלנו לשליטה בעריכה, ממשק ועיצוב. מותאם במדויק ל-Brand DNA לתוצאות מוכחות ואיכות ללא פשרות.',
    component: KosaiEngineStandaloneView,
    route: '/kosai-engine',
    collectionPrefix: 'mod_kosai_',
  },
  {
    id: 'KosBranding',
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
    id: 'KosWhatsUp',
    name: 'KosWhatsUp',
    description: 'KOSUN WhatsApp Hub - מרכז וואטסאפ מקיף: סנכרון אוטומטי, בוטים חכמים, סטטוסים, שיגור מתקדם וניהול קבוצות ברמה המקצועית ביותר.',
    component: KosWhatsUpStandaloneView,
    route: '/whatsapp-hub',
    collectionPrefix: 'kos_whatsup_',
  },
  {
    id: 'whatsapp-green-api-hub',
    name: 'KosWhatsUp (Legacy Route)',
    description: 'KOSUN WhatsApp Hub - תאימות לנתיב קודם',
    component: KosWhatsUpStandaloneView,
    route: '/whatsapp-hub',
    collectionPrefix: 'kos_whatsup_',
  },
  {
    id: 'KosTogether',
    name: 'KosTogether',
    description: 'KOSUN Communities Hub - מערכת ניהול קהילות, קבוצות חכמות, מעגן צף, מודאלים במסך מלא ואינטגרציית מודולרית מלאה.',
    component: KosTogetherStandaloneView,
    route: '/crm-groups',
    collectionPrefix: 'crm_groups',
  },
  {
    id: 'crm-groups-hub',
    name: 'KosTogether (Legacy Route)',
    description: 'KOSUN Communities Hub - תאימות מלאה למזהה crm-groups-hub ולנתיבי קהילות.',
    component: KosTogetherStandaloneView,
    route: '/crm-groups',
    collectionPrefix: 'crm_groups',
  },
  {
    id: 'ksf',
    name: 'KSF',
    description: 'KOSUN Smart Forms - מערכת טפסים שלביים (שאלה אחת בלבד בכל שלב), תפריט צף, הקראה קולית ובידוד מודולרי מלא.',
    component: KSFStandaloneView,
    route: '/ksf',
    collectionPrefix: 'mod_forms',
  },
  {
    id: 'smart-form-builder',
    name: 'KSF (Legacy Route)',
    description: 'הפניה ישירה למערכת KSF.',
    component: KSFStandaloneView,
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
    id: 'KosWebAi',
    name: 'KWB',
    description: 'KosWebBulider - Building Your Digital Interaction (בונה לך אינטראקציה דיגיטלית)',
    component: PageBuilderStandaloneView,
    route: '/KosWebAi',
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
    id: 'KosCloudStore',
    name: 'KosCloudStore - כספת ענן ומדיה',
    description: 'כספת ענן מודולרית מתקדמת לאחסון, ניהול, סטודיו עריכת תמונות ומסמכים, הסרת רקע מבוססת AI והמרת פורמטים.',
    component: KosCloudStoreStandaloneView,
    route: '/KosCloudStore',
    collectionPrefix: 'sdo_media_',
  },
  {
    id: 'media-gallery-hub',
    name: 'KosCloudStore (Gallery)',
    description: 'ספריית ענן ומדיה לניהול חכם של תמונות, וידאו, שמע ומסמכים.',
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
