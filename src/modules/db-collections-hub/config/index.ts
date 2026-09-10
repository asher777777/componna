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
  // 1. SDO Video Producer Studio
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

  // 2. Flow Player Engine Collections
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

  // 3. Media Gallery Collections
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

  // 4. Page Builder Collections
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

  // 5. CRM & Analytics Collections
  {
    id: 'mod_crm_leads',
    name: 'לידים ואנשי קשר (CRM Leads)',
    description: 'רשימת לידים, פילוח קהילות, סטטוסים ותגיות',
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
  {
    id: 'mod_crm_interactions',
    name: 'אינטראקציות לקוחות (Interactions)',
    description: 'תיעוד פניות, שיחות, הודעות ומפגשים',
    category: 'crm',
    icon: 'FileText',
  },

  // 6. Client Receiver Platform
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

  // 7. Auth Portal & Users
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

  // 8. Template & System Collections
  {
    id: 'settings',
    name: 'הגדרות מערכת (System Settings)',
    description: 'הגדרות גלובליות של הפרויקט, חיבורי DB וסביבה',
    category: 'system',
    icon: 'Settings',
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
