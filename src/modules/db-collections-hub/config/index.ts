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
  // 1. Flow Player Engine Collections
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

  // 2. Media Gallery Collections
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

  // 3. Template & System Collections
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
    description: 'יומני אירועים ומערכת',
    category: 'system',
    icon: 'FileText',
  },
  {
    id: 'users',
    name: 'משתמשים והרשאות (Users)',
    description: 'פרופילי משתמשים והגדרות גישה',
    category: 'system',
    icon: 'Users',
  },
  {
    id: 'settings',
    name: 'הגדרות מערכת (System Settings)',
    description: 'הגדרות גלובליות של הפרויקט והסביבה',
    category: 'system',
    icon: 'Settings',
  },
];
