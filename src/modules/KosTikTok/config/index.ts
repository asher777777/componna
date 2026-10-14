export const KOS_TIKTOK_CONFIG = {
  MODULE_ID: 'KosTikTok',
  MODULE_NAME_HE: 'קושאן TikTok - אינטגרציית טיקטוק, פרסום תוכן ולידים',
  MODULE_SUBTITLE_HE: 'חיבור חשבונות יוצרים, פרסום סרטונים, קליטת לידים ממומנים ומעקב המרות',
  COLLECTION_PREFIX: 'mod_kos_tiktok_',
  
  // TikTok Official API Endpoints
  API_BASE_URL: 'https://open.tiktokapis.com',
  BUSINESS_API_BASE_URL: 'https://business-api.tiktok.com/open_api/v1.3',
  AUTH_URL: 'https://www.tiktok.com/v2/auth/authorize/',
  
  // Standard Scopes
  SCOPES: [
    'user.info.basic',
    'user.info.profile',
    'user.info.stats',
    'video.list',
    'video.publish',
    'video.upload'
  ],
  
  DEFAULT_VIDEO_PRIVACY: 'PUBLIC_TO_EVERYONE' as const,
  DEFAULT_FALLBACK_COVER: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80',
};

export const PLEASANT_KOS_TIKTOK_ERROR_HE = 'שירות הקישור ל-TikTok אינו זמין כעת. אנא נסה שנית בעוד מספר רגעים.';
