/**
 * Global Core Collections Registry (מילון קולקציות מערכתי אחוד)
 * 
 * Strict Single Source of Truth for all Firestore collection names across the workspace.
 * Prevents typos, cross-module desyncs, and hardcoded collection strings.
 */

export const SYSTEM_COLLECTIONS = {
  // 1. Core Tenant & CRM
  CONTACTS: 'contacts',
  GROUPS: 'crm_groups',
  INTERACTIONS: 'crm_interactions',
  CHAT_MESSAGES: 'crm_chat_messages',
  CRM_SUBSCRIPTION_PACKAGES: 'crm_subscription_packages',
  CRM_SUBSCRIPTION_COUPONS: 'crm_subscription_coupons',
  CRM_SUBSCRIPTION_QUIZZES: 'crm_subscription_quizzes',
  
  // 2. Marketing & Landing Pages (KosWebAi Monopoly)
  PAGES: 'kos_web_ai_documents',
  PAGE_TEMPLATES: 'kos_web_ai_templates',
  PAGE_ANALYTICS: 'kos_web_ai_analytics',
  
  // 3. Smart Forms
  SMART_FORMS: 'mod_forms',
  SUBMISSIONS: 'submissions', // used as subcollection under form
  
  // 4. Media & Drive Vault
  MEDIA_ITEMS: 'sdo_media_items',
  MEDIA_FOLDERS: 'sdo_media_folders',
  
  // 5. Kesher & EasyCount Financials
  KESHER_TRANSACTIONS: 'kesher_transactions',
  KESHER_GLOSSARY: 'kesher_receipt_glossary',
  KESHER_STANDING_ORDERS: 'kesher_standing_orders',
  
  // 6. WhatsApp (KosWhatsUp Monopoly)
  KOS_WHATSUP_CHATS: 'kos_whatsup_chats',
  KOS_WHATSUP_MESSAGES: 'kos_whatsup_messages',
  KOS_WHATSUP_BOT_RULES: 'kos_whatsup_bot_rules',
  KOS_WHATSUP_AI_BOTS: 'kos_whatsup_ai_bots',
  KOS_WHATSUP_BOT_CHATS: 'kos_whatsup_bot_chats',
  KOS_WHATSUP_STATUSES: 'kos_whatsup_statuses',
  KOS_WHATSUP_TEMPLATES: 'kos_whatsup_templates',
  KOS_WHATSUP_AUTOMATIONS: 'kos_whatsup_automations',
  KOS_WHATSUP_SCHEDULED_REMINDERS: 'scheduled_reminders',
  // Backward compatibility aliases
  WHATSAPP_CHATS: 'kos_whatsup_chats',
  WHATSAPP_MESSAGES: 'kos_whatsup_messages',
  WHATSAPP_BOT_RULES: 'kos_whatsup_bot_rules',
  WHATSAPP_AI_BOTS: 'kos_whatsup_ai_bots',
  WHATSAPP_BOT_CHATS: 'kos_whatsup_bot_chats',
  WHATSAPP_STATUSES: 'kos_whatsup_statuses',
  WHATSAPP_TEMPLATES: 'kos_whatsup_templates',
  WHATSAPP_AUTOMATIONS: 'kos_whatsup_automations',
  SCHEDULED_REMINDERS: 'scheduled_reminders',
  
  // 7. Video Producer Studio & Flow Player (Legacy & KosLive Unified)
  VIDEO_PROJECTS: 'sdo_video_projects',
  VIDEO_SCENES: 'sdo_video_scenes',
  PLAYER_CAMPAIGNS: 'sdo_player_campaign_configs',
  PLAYER_EVENTS: 'sdo_player_session_events',
  KOS_LIVE_PROJECTS: 'kos_live_projects',
  KOS_LIVE_CAMPAIGNS: 'kos_live_campaigns',
  KOS_LIVE_ANALYTICS: 'kos_live_analytics',
  KOS_LIVE_SESSIONS: 'kos_live_sessions',
  
  // 8. Settings & Brand DNA (KosBranding Monopoly)
  SETTINGS: 'settings',
  BRAND_DNA_DOC: 'kos_branding_dna',
  KOS_BRANDING: 'kos_branding_dna',
  KOS_BRANDING_TO: 'kos_branding_to', // קולקציית מיתוג ייעודית לקהילות (KosBrandingTo)
  
  // 9. Ambassador Campaigns & Crowdfunding
  CAMPAIGNS: 'mod_campaigns',
  CAMPAIGN_AMBASSADORS: 'mod_campaign_ambassadors',
  CAMPAIGN_DONATIONS: 'mod_campaign_donations',

  // 10. KOSUN AM ("קושאן מייל אוטומטי" - Smart Email & Automations)
  MOD_KOSUN_AM_CAMPAIGNS: 'mod_kosun_am_campaigns',
  MOD_KOSUN_AM_TEMPLATES: 'mod_kosun_am_templates',
  MOD_KOSUN_AM_AUTOMATIONS: 'mod_kosun_am_automations',
  MOD_KOSUN_AM_LOGS: 'mod_kosun_am_logs',
  KOSUN_AM_CAMPAIGNS: 'mod_kosun_am_campaigns',
  KOSUN_AM_TEMPLATES: 'mod_kosun_am_templates',
  KOSUN_AM_AUTOMATIONS: 'mod_kosun_am_automations',
  KOSUN_AM_LOGS: 'mod_kosun_am_logs',

  // 11. KosTube ("קושאן טיוב" - YouTube AI Channel SEO & Pages)
  KOS_TUBE_CHANNELS: 'mod_kos_tube_channels',
  KOS_TUBE_VIDEOS: 'mod_kos_tube_videos',
  KOS_TUBE_PAGES: 'mod_kos_tube_pages',

  // 12. KosTikTok ("קושאן טיקטוק" - TikTok Integration, Publishing & Marketing)
  KOS_TIKTOK_ACCOUNTS: 'mod_kos_tiktok_accounts',
  KOS_TIKTOK_POSTS: 'mod_kos_tiktok_posts',
  KOS_TIKTOK_VIDEOS: 'mod_kos_tiktok_videos',
  KOS_TIKTOK_LEADS: 'mod_kos_tiktok_leads',
  KOS_TIKTOK_EVENTS: 'mod_kos_tiktok_events',

  // 13. KosDesBuilder ("קושאן דשבורד בילדר" - Dashboard UI Builder Monopoly)
  DASHBOARD_PAGES: 'mod_kos_des_dashboards',
  DASHBOARD_TEMPLATES: 'mod_kos_des_templates',

  // 14. KosAccess ("קושאן נגישות" - Accessibility Toolbar & Compliance)
  KOS_ACCESS_SETTINGS: 'mod_kos_access_settings',
  KOS_ACCESS_DECLARATIONS: 'mod_kos_access_declarations',
  KOS_ACCESS_FEEDBACK: 'mod_kos_access_feedback',
} as const;

export type SystemCollectionKey = keyof typeof SYSTEM_COLLECTIONS;
export type SystemCollectionName = typeof SYSTEM_COLLECTIONS[SystemCollectionKey];

/**
 * Global Platform Level Collections (Non-tenant collections for Root/SaaS marketplace)
 */
export const GLOBAL_PLATFORM_COLLECTIONS = {
  TENANTS: 'sys_tenants',
  CATALOG: 'sys_storefront_catalog',
  SETTINGS: 'sys_storefront_settings',
  ORDERS: 'sys_storefront_orders',
  USERS: 'sys_users',
} as const;

/**
 * Comprehensive KOSUN CRM Field Keys (מילון שדות מלא ותקני לקולקציית ה-CRM)
 * Prefix: kosun_crm_
 */
export const KOSUN_CRM_FIELD_KEYS = {
  // 1. פרטי זיהוי ואישיים
  NAME: 'kosun_crm_name',
  PHONE: 'kosun_crm_phone',
  WORK_PHONE: 'kosun_crm_work_phone',
  EMAIL: 'kosun_crm_email',
  FAMILY: 'kosun_crm_family', // f_m
  GENDER: 'kosun_crm_gender',
  BIRTH_DATE: 'kosun_crm_birth_date',
  WEBSITE: 'kosun_crm_website',

  // 2. זיהוי ממשלתי / מס
  GOV_ID: 'kosun_crm_gov_id', // tg1 / tz / vat

  // 3. מיקום וכתובת
  CITY: 'kosun_crm_city', // mh_crm_city
  STREET: 'kosun_crm_street', // mh_crm_street

  // 4. עסק ותפקיד
  COMPANY: 'kosun_crm_company', // company_name
  ROLE: 'kosun_crm_role', // job_title

  // 5. פילוח, קהילות ומקור
  TAGS: 'kosun_crm_tags', // tags, tg2, tg3
  COMMUNITY: 'kosun_crm_community', // community, mh_crm_community
  SEGMENT: 'kosun_crm_segment',
  SOURCE: 'kosun_crm_source', // lead_source
  TYPE: 'kosun_crm_type', // contact_type ('contact' | 'lead')
  STATUS: 'kosun_crm_status', // 'active' | 'trashed'

  // 6. פרטי בנק, צ'קים ותשלומים (Kesher & Financials)
  BANK_NAME: 'kosun_crm_bank_name',
  BANK_BRANCH: 'kosun_crm_bank_branch',
  BANK_ACCOUNT: 'kosun_crm_bank_account',
  BANK_OWNER: 'kosun_crm_bank_owner',
  BANK_AUTH: 'kosun_crm_bank_auth',
  CHECK_NUMBER: 'kosun_crm_check_number',
  CHECK_BANK: 'kosun_crm_check_bank',
  CHECK_BRANCH: 'kosun_crm_check_branch',
  CHECK_ACCOUNT: 'kosun_crm_check_account',
  CHECK_PAYEE: 'kosun_crm_check_payee',
  TOTAL_SPENT: 'kosun_crm_total_spent',
  ORDER_COUNT: 'kosun_crm_order_count',
  LAST_ORDER_DATE: 'kosun_crm_last_order_date',
  PAYMENTS: 'kosun_crm_payments',

  // 7. קמפיינים ושגרירים
  CAMPAIGN_ID: 'kosun_crm_campaign_id',
  CAMPAIGN_TITLE: 'kosun_crm_campaign_title',
  CAMPAIGN_AMOUNT: 'kosun_crm_campaign_amount',
  CAMPAIGN_ROLE: 'kosun_crm_campaign_role',
  CAMPAIGN_GOAL: 'kosun_crm_campaign_goal',
  CAMPAIGN_RAISED: 'kosun_crm_campaign_raised',
  AMBASSADOR_URL: 'kosun_crm_ambassador_url',

  // 8. טפסים והגשות
  LAST_FORM_NAME: 'kosun_crm_last_form_name',
  LAST_FORM_PAGE: 'kosun_crm_last_form_page',
  LAST_FORM_DATE: 'kosun_crm_last_form_date',
  FORM_SUBMISSIONS: 'kosun_crm_form_submissions',

  // 9. הערות
  NOTES: 'kosun_crm_notes',

  // 10. AI ותובנות חכמות
  AI_SENTIMENT: 'kosun_crm_ai_sentiment',
  AI_TEMPERATURE: 'kosun_crm_ai_temperature',
  AI_SUMMARY: 'kosun_crm_ai_summary',
  AI_NEXT_ACTION: 'kosun_crm_ai_next_action',
  AI_INTERACTIONS: 'kosun_crm_ai_interactions',

  // 11. מנויים וסליקת SaaS ותוכן (KosSubscribed)
  SUBSCRIPTIONS: 'kosun_crm_subscriptions',
  CONTENT_SUBSCRIPTIONS: 'kosun_crm_content_subscriptions',
  QUIZ_RESULTS: 'kosun_crm_quiz_results',
  BILLING_CUSTOMER_ID: 'kosun_crm_billing_customer_id',

  // 12. זמני מערכת
  CREATED_AT: 'kosun_crm_created_at',
  UPDATED_AT: 'kosun_crm_updated_at',
} as const;

export type KosunCrmFieldKey = typeof KOSUN_CRM_FIELD_KEYS[keyof typeof KOSUN_CRM_FIELD_KEYS];

