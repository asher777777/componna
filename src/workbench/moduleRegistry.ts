import React from 'react';

const BrandDnaHubStandaloneView = React.lazy(() =>
  import('../modules/KosBranding').then((m) => ({ default: m.BrandDnaHubStandaloneView }))
);
const KosPayStandaloneView = React.lazy(() =>
  import('../modules/KosPay').then((m) => ({ default: m.KesherPaymentsStandaloneView }))
);
const KosWhatsUpStandaloneView = React.lazy(() =>
  import('../modules/KosWhatsUp').then((m) => ({ default: m.KosWhatsUpStandaloneView }))
);
const KosTogetherStandaloneView = React.lazy(() =>
  import('../modules/KosTogether').then((m) => ({ default: m.CrmGroupsHubStandaloneView }))
);
const KosFormsStandaloneView = React.lazy(() =>
  import('../modules/KosForms').then((m) => ({ default: m.KSFStandaloneView }))
);
const KosConnectorStandaloneView = React.lazy(() =>
  import('../modules/KosConnector').then((m) => ({ default: m.DbConnectorHubStandaloneView }))
);
const KosClientPlatformStandaloneView = React.lazy(() =>
  import('../modules/KosClientPlatform').then((m) => ({ default: m.ClientReceiverPlatformStandaloneView }))
);
const KosCrmStandaloneView = React.lazy(() =>
  import('../modules/KosCrm').then((m) => ({ default: m.CrmAnalyticsStandaloneView }))
);
const KosWebAiStandaloneView = React.lazy(() =>
  import('../modules/KosWebAi').then((m) => ({ default: m.PageBuilderStandaloneView }))
);
const KoSeoPowerEnginStandaloneView = React.lazy(() =>
  import('../modules/KoSeoPowerEngin').then((m) => ({ default: m.KoSeoPowerEnginStandaloneView }))
);
const KosAuthStandaloneView = React.lazy(() =>
  import('../modules/KosAuth').then((m) => ({ default: m.AuthPortalStandaloneView }))
);
const KosFlowPlayerStandaloneView = React.lazy(() =>
  import('../modules/KosFlowPlayer').then((m) => ({ default: m.FlowPlayerEngineStandaloneView }))
);
const KosCloudStoreStandaloneView = React.lazy(() =>
  import('../modules/KosCloudStore').then((m) => ({ default: m.KosCloudStoreStandaloneView }))
);
const KosDataStandaloneView = React.lazy(() =>
  import('../modules/KosData').then((m) => ({ default: m.DbCollectionsHubStandaloneView }))
);
const KosTemplateStandaloneView = React.lazy(() =>
  import('../modules/KosTemplate').then((m) => ({ default: m.TemplateStandaloneView }))
);
const KosCampaignsStandaloneView = React.lazy(() =>
  import('../modules/KosCampaigns').then((m) => ({ default: m.AmbassadorCampaignsStandaloneView }))
);
const KosAiStandaloneView = React.lazy(() =>
  import('../modules/KosAi').then((m) => ({ default: m.KosaiStandaloneView }))
);
const KosMailStandaloneView = React.lazy(() =>
  import('../modules/KosMail').then((m) => ({ default: m.KosunAmStandaloneView }))
);
const KosBoardStandaloneView = React.lazy(() =>
  import('../modules/KosBoard').then((m) => ({ default: m.KosunBoardComposerStandaloneView }))
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

// Register KosAccess UI capabilities eagerly for universal accessibility toolbar
import '../modules/KosAccess';

const KosAccessStandaloneView = React.lazy(() =>
  import('../modules/KosAccess').then((m) => ({ default: m.KosAccessStandaloneView }))
);

// Register KosLive UI capabilities eagerly for universal living page rendering & concierge
import '../modules/KosLive';

const KosLiveStandaloneView = React.lazy(() =>
  import('../modules/KosLive').then((m) => ({ default: m.KosLiveStandaloneView }))
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
    id: 'KosLivePage',
    name: 'KosLivePage - עמודים חיים ואוואטרים אינטראקטיביים',
    description: 'סטודיו הפקות ומנוע עמודים חיים: הפיכת עמודים, תוכן ומוצרים לסרטוני אווטאר אינטראקטיביים עם פיצול החלטות, שכבות ממשק וסוכן שיחה קולי מבוסס AI.',
    component: KosLiveStandaloneView,
    route: '/koslivepage',
    collectionPrefix: 'mod_kos_live_',
  },
  {
    id: 'KosLive',
    name: 'KosLive',
    description: 'הפניה ישירה למנוע עמודים חיים KosLive',
    component: KosLiveStandaloneView,
    route: '/koslive',
    collectionPrefix: 'mod_kos_live_',
  },
  {
    id: 'KosAccess',
    name: 'KosAccess - נגישות אתרים וחוקי משרד התקשורת',
    description: 'מערכת נגישות מלאה לפי תקן ת"י 5568, תקנות שוויון זכויות ו-WCAG 2.2 AA. כולל סרגל נגישות צף לכל סוגי המסכים, הקראה קולית, סרגל קריאה, ניהול הצהרת נגישות וטיפול בפניות גולשים.',
    component: KosAccessStandaloneView,
    route: '/KosAccess',
    collectionPrefix: 'mod_kos_access_',
  },
  {
    id: 'KosSubscribed',
    name: 'KosSubscribed - ניהול מנויי תוכן, חבילות ומבחנים',
    description: 'מכירת מנויים לתצוגת תוכן, יצירת חבילות חודשיות והנחות, שידוך אנשי קשר, עמודי תשלום וטפסי מבחנים המחוברים בחוזה ל-CRM.',
    component: KosSubscribedStandaloneView,
    route: '/KosSubscribed',
    collectionPrefix: 'crm_subscription_',
  },
  {
    id: 'KosTikTok',
    name: 'KosTikTok - פרסום סרטונים, לידים ומעקב המרות',
    description: 'חיבור חשבונות TikTok ב-OAuth 2.0, פרסום ישיר של סרטונים, קליטת לידים מטפסים ממומנים ומעקב המרות Events API.',
    component: KosTikTokStandaloneView,
    route: '/KosTikTok',
    collectionPrefix: 'mod_kos_tiktok_',
  },
  {
    id: 'KosTube',
    name: 'KosTube - חיבור יוטיוב וקידום SEO מבוסס AI',
    description: 'סנכרון ערוץ יוטיוב, המרת סרטונים למאמרי עומק ב-AI ויצירת עמודי SEO מקודמים בגוגל עם סכמת נתונים עשירה.',
    component: KosTubeStandaloneView,
    route: '/KosTube',
    collectionPrefix: 'mod_kos_tube_',
  },
  {
    id: 'KosTenantProvisioner',
    name: 'KosTenantProvisioner - ניהול סאב-דומיינים והטענת רכיבים',
    description: 'הקמת סאב-דומיינים מבודדים 100%, הטענת רכיבים מודולריים, ניהול שמות משתמש וסיסמאות לפי חוקי KOSUN26.',
    component: KosTenantProvisionerStandaloneView,
    route: '/tenant-provisioner',
    collectionPrefix: 'sys_tenants_',
    isSystemModule: true,
  },
  {
    id: 'KosBoard',
    name: 'KosBoard - מחולל מערכות ולוחות בקרה AI',
    description: 'חיבור רכיבי המערכת באמצעות Gemini AI לייצור לוחות בקרה ומערכות מותאמות אישית המשודכות לסאב-דומיינים של משתמשים.',
    component: KosBoardStandaloneView,
    route: '/KosBoard',
    collectionPrefix: 'mod_kosun_board_',
  },
  {
    id: 'kosun-board-composer',
    name: 'KosBoard (Legacy Route)',
    description: 'תאימות לנתיב board-composer',
    component: KosBoardStandaloneView,
    route: '/board-composer',
    collectionPrefix: 'mod_kosun_board_',
  },
  {
    id: 'KosMail',
    name: 'KosMail - דיוור ואוטומציה חכמה',
    description: 'מערכת דיוור, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות חכמות.',
    component: KosMailStandaloneView,
    route: '/KosMail',
    collectionPrefix: 'mod_kosun_am_',
  },
  {
    id: 'kosun-am',
    name: 'KosMail (Legacy Route)',
    description: 'תאימות לנתיב kosun-am',
    component: KosMailStandaloneView,
    route: '/kosun-am',
    collectionPrefix: 'mod_kosun_am_',
  },
  {
    id: 'KosAi',
    name: 'KosAi - מנוע בינה מלאכותית חכם',
    description: 'מנוע בינה מלאכותית לשליטה בעריכה, ממשק ועיצוב, מותאם במדויק ל-Brand DNA.',
    component: KosAiStandaloneView,
    route: '/KosAi',
    collectionPrefix: 'mod_kosai_',
  },
  {
    id: 'kosai-engine',
    name: 'KosAi (Legacy Route)',
    description: 'תאימות לנתיב kosai-engine',
    component: KosAiStandaloneView,
    route: '/kosai-engine',
    collectionPrefix: 'mod_kosai_',
  },
  {
    id: 'KosBranding',
    name: 'KosBranding - מרכז הזהות והמיתוג',
    description: 'הלב והזהות העסקית שלכם: אפיון טון דיבור, קהלי יעד וסנכרון מלא של שפת המותג לכל הרכיבים.',
    component: BrandDnaHubStandaloneView,
    route: '/brand-dna',
    collectionPrefix: 'brand_dna_',
  },
  {
    id: 'KosPay',
    name: 'KosPay - פתרונות סליקה ותשלומים',
    description: 'מערכת סליקה מאובטחת: אשראי, ביט והפקת קבלות וחשבוניות אוטומטיות.',
    component: KosPayStandaloneView,
    route: '/KosPay',
    collectionPrefix: 'kesher_',
  },
  {
    id: 'kesher-payments-hub',
    name: 'KosPay (Legacy Route)',
    description: 'תאימות לנתיב kesher-payments',
    component: KosPayStandaloneView,
    route: '/kesher-payments',
    collectionPrefix: 'kesher_',
  },
  {
    id: 'KosWhatsUp',
    name: 'KosWhatsUp - מרכז וואטסאפ ובוטים AI',
    description: 'מרכז וואטסאפ מקיף: סנכרון אוטומטי, בוטים חכמים, סטטוסים, שיגור מתקדם וניהול קבוצות.',
    component: KosWhatsUpStandaloneView,
    route: '/whatsapp-hub',
    collectionPrefix: 'kos_whatsup_',
  },
  {
    id: 'whatsapp-green-api-hub',
    name: 'KosWhatsUp (Legacy Route)',
    description: 'תאימות לנתיב whatsapp-green-api-hub',
    component: KosWhatsUpStandaloneView,
    route: '/whatsapp-hub',
    collectionPrefix: 'kos_whatsup_',
  },
  {
    id: 'KosTogether',
    name: 'KosTogether - קהילות וקבוצות CRM',
    description: 'מערכת ניהול קהילות, קבוצות חכמות, מעגן צף, מודאלים במסך מלא ואינטגרציה מודולרית מלאה.',
    component: KosTogetherStandaloneView,
    route: '/crm-groups',
    collectionPrefix: 'crm_groups',
  },
  {
    id: 'crm-groups-hub',
    name: 'KosTogether (Legacy Route)',
    description: 'תאימות למזהה crm-groups-hub',
    component: KosTogetherStandaloneView,
    route: '/crm-groups',
    collectionPrefix: 'crm_groups',
  },
  {
    id: 'KosForms',
    name: 'KosForms - מחולל טפסים ושאלונים חכמים',
    description: 'מערכת טפסים שלביים (שאלה אחת בלבד בכל שלב), הקראה קולית ובידוד מודולרי מלא.',
    component: KosFormsStandaloneView,
    route: '/KosForms',
    collectionPrefix: 'mod_forms',
  },
  {
    id: 'ksf',
    name: 'KosForms (KSF Route)',
    description: 'תאימות לנתיב ksf',
    component: KosFormsStandaloneView,
    route: '/ksf',
    collectionPrefix: 'mod_forms',
  },
  {
    id: 'smart-form-builder',
    name: 'KosForms (Legacy Route)',
    description: 'תאימות לנתיב smart-forms',
    component: KosFormsStandaloneView,
    route: '/smart-forms',
    collectionPrefix: 'mod_forms',
  },
  {
    id: 'KosConnector',
    name: 'KosConnector - מחולל אינטגרציות וחיבורים',
    description: 'סנכרון חכם ואמין לכלל המודולים עם מסד נתונים אחוד ואנליזה חכמה מבוססת AI.',
    component: KosConnectorStandaloneView,
    route: '/KosConnector',
    collectionPrefix: '',
  },
  {
    id: 'db-connector-hub',
    name: 'KosConnector (Legacy Route)',
    description: 'תאימות לנתיב db-connector',
    component: KosConnectorStandaloneView,
    route: '/db-connector',
    collectionPrefix: '',
  },
  {
    id: 'KosClientPlatform',
    name: 'KosClientPlatform - קליטת לקוחות ואזור אישי',
    description: 'פלטפורמת אזור אישי יוקרתית הכוללת אימות, ניווט דינמי והפעלה חלקה של רכיבים.',
    component: KosClientPlatformStandaloneView,
    route: '/KosClientPlatform',
    collectionPrefix: 'client_',
  },
  {
    id: 'client-platform',
    name: 'KosClientPlatform (Legacy Route)',
    description: 'תאימות לנתיב client-platform',
    component: KosClientPlatformStandaloneView,
    route: '/client-platform',
    collectionPrefix: 'client_',
  },
  {
    id: 'KosCrm',
    name: 'KosCrm - ניהול לקוחות, לידים ואנליטיקה',
    description: 'לוח בקרה חכם המציג תוצאות בזמן אמת, כרטיס לקוח 360, פילוחים וניהול לידים.',
    component: KosCrmStandaloneView,
    route: '/KosCrm',
    collectionPrefix: 'mod_crm_',
  },
  {
    id: 'crm-analytics',
    name: 'KosCrm (Legacy Route)',
    description: 'תאימות לנתיב crm-analytics',
    component: KosCrmStandaloneView,
    route: '/crm-analytics',
    collectionPrefix: 'mod_crm_',
  },
  {
    id: 'KosWebAi',
    name: 'KosWebAi - בונה אתרים ואינטראקציה דיגיטלית',
    description: 'KosWebAi - Building Your Digital Interaction (בונה לך אינטראקציה דיגיטלית)',
    component: KosWebAiStandaloneView,
    route: '/KosWebAi',
    collectionPrefix: 'mod_pagebuilder_',
  },
  {
    id: 'KosAuth',
    name: 'KosAuth - שער התחברות מאובטח',
    description: 'מערכת הרשמה והתחברות מתקדמת עם גישה מאובטחת לכל אזורי המערכת.',
    component: KosAuthStandaloneView,
    route: '/KosAuth',
    collectionPrefix: 'mod_auth_',
  },
  {
    id: 'auth-portal',
    name: 'KosAuth (Legacy Route)',
    description: 'תאימות לנתיב auth-portal',
    component: KosAuthStandaloneView,
    route: '/auth-portal',
    collectionPrefix: 'mod_auth_',
  },
  {
    id: 'KosFlowPlayer',
    name: 'KosFlowPlayer - נגן אינטראקטיבי חכם',
    description: 'נגן מתקדם המשלב אינטראקציות חכמות, סוכן שיחה קולי ופיצול החלטות.',
    component: KosFlowPlayerStandaloneView,
    route: '/KosFlowPlayer',
    collectionPrefix: 'sdo_player_',
  },
  {
    id: 'flow-player-engine',
    name: 'KosFlowPlayer (Legacy Route)',
    description: 'תאימות לנתיב flow-player-engine',
    component: KosFlowPlayerStandaloneView,
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
    name: 'KosCloudStore (Legacy Route)',
    description: 'תאימות לנתיב media-gallery-hub',
    component: KosCloudStoreStandaloneView,
    route: '/media-gallery-hub',
    collectionPrefix: 'sdo_media_',
  },
  {
    id: 'KosData',
    name: 'KosData - ניהול מאגרי מידע וקולקציות',
    description: 'סייר נתונים וקולקציות לשליטה מדויקת בזמן אמת.',
    component: KosDataStandaloneView,
    route: '/KosData',
    collectionPrefix: '',
  },
  {
    id: 'db-collections-hub',
    name: 'KosData (Legacy Route)',
    description: 'תאימות לנתיב db-collections',
    component: KosDataStandaloneView,
    route: '/db-collections',
    collectionPrefix: '',
  },
  {
    id: 'KosTemplate',
    name: 'KosTemplate - שלד רכיב מודולרי',
    description: 'תבנית בסיס להקמת מודולים חדשים במערכת KOS.',
    component: KosTemplateStandaloneView,
    route: '/KosTemplate',
    collectionPrefix: 'mod_template_',
  },
  {
    id: 'KosCampaigns',
    name: 'KosCampaigns - ניהול קמפיינים ושגרירים',
    description: 'מערכת גיוס המונים וקמפיינים חכמה עם יעדי גיוס והתראות חיות.',
    component: KosCampaignsStandaloneView,
    route: '/KosCampaigns',
    collectionPrefix: 'mod_campaigns_',
  },
  {
    id: 'ambassador-campaigns-hub',
    name: 'KosCampaigns (Legacy Route)',
    description: 'תאימות לנתיב ambassador-campaigns',
    component: KosCampaignsStandaloneView,
    route: '/ambassador-campaigns',
    collectionPrefix: 'mod_campaigns_',
  },
  {
    id: 'KoSeoPowerEngin',
    name: 'KoSeoPowerEngin - מנוע SEO, גוגל קונסול ואנליטיקס',
    description: 'מפתח אב אחוד לכל הדומיין והסאב-דומיינים, מעקב ביצועי חיפוש אורגני (GSC), גוגל אנליטיקס 4 (GA4) ואימות DNS.',
    component: KoSeoPowerEnginStandaloneView,
    route: '/KoSeoPowerEngin',
    collectionPrefix: 'sys_koseo_',
  },
];
