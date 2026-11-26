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
  MARKET_RESEARCH: 'kos_branding_market_research', // קולקציית מחקר שוק וסריקות אתרים (מחקר שוק)
  
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

  // 15. KosProjects ("קושאן פרויקטים" - Projects, Workplans, Gantt & Vendors)
  PROJECTS: 'kos_projects',
  PROJECT_TASKS: 'kos_project_tasks',
  PROJECT_BLUEPRINTS: 'kos_project_blueprints',
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

/**
 * Complete canonical list of Contact collection fields for CRM mapping dropdowns (labels only, grouped).
 */
export const CANONICAL_CRM_CONTACT_FIELDS: Array<{ value: string; label: string; group: string }> = [
  // 1. פרטי זיהוי ואישיים
  { value: KOSUN_CRM_FIELD_KEYS.NAME, label: 'שם מלא', group: 'פרטי קשר וזיהוי' },
  { value: KOSUN_CRM_FIELD_KEYS.FAMILY, label: 'שם משפחה', group: 'פרטי קשר וזיהוי' },
  { value: KOSUN_CRM_FIELD_KEYS.PHONE, label: 'טלפון נייד (וואטסאפ)', group: 'פרטי קשר וזיהוי' },
  { value: KOSUN_CRM_FIELD_KEYS.WORK_PHONE, label: 'טלפון עבודה', group: 'פרטי קשר וזיהוי' },
  { value: KOSUN_CRM_FIELD_KEYS.EMAIL, label: 'דואר אלקטרוני', group: 'פרטי קשר וזיהוי' },
  { value: KOSUN_CRM_FIELD_KEYS.GOV_ID, label: 'תעודת זהות / ח.פ', group: 'פרטי קשר וזיהוי' },
  { value: KOSUN_CRM_FIELD_KEYS.GENDER, label: 'מגדר', group: 'פרטי קשר וזיהוי' },
  { value: KOSUN_CRM_FIELD_KEYS.BIRTH_DATE, label: 'תאריך לידה', group: 'פרטי קשר וזיהוי' },
  { value: KOSUN_CRM_FIELD_KEYS.WEBSITE, label: 'אתר אינטרנט', group: 'פרטי קשר וזיהוי' },

  // 2. עסק וכתובת
  { value: KOSUN_CRM_FIELD_KEYS.COMPANY, label: 'שם חברה / ארגון', group: 'עסק וכתובת' },
  { value: KOSUN_CRM_FIELD_KEYS.ROLE, label: 'תפקיד', group: 'עסק וכתובת' },
  { value: KOSUN_CRM_FIELD_KEYS.CITY, label: 'עיר', group: 'עסק וכתובת' },
  { value: KOSUN_CRM_FIELD_KEYS.STREET, label: 'כתובת / רחוב', group: 'עסק וכתובת' },

  // 3. קהילות, פילוח ומקור (KosTogether)
  { value: KOSUN_CRM_FIELD_KEYS.COMMUNITY, label: 'קהילה משויכת', group: 'קהילות ופילוח' },
  { value: KOSUN_CRM_FIELD_KEYS.SEGMENT, label: 'פלח / סגמנט', group: 'קהילות ופילוח' },
  { value: KOSUN_CRM_FIELD_KEYS.TAGS, label: 'תגיות שיוך', group: 'קהילות ופילוח' },
  { value: KOSUN_CRM_FIELD_KEYS.SOURCE, label: 'מקור הגעה', group: 'קהילות ופילוח' },
  { value: KOSUN_CRM_FIELD_KEYS.TYPE, label: 'סוג רשומה (ליד / איש קשר)', group: 'קהילות ופילוח' },
  { value: KOSUN_CRM_FIELD_KEYS.STATUS, label: 'סטטוס איש קשר', group: 'קהילות ופילוח' },

  // 4. תשלומים, בנק וצ'קים (Kesher / Nedarim)
  { value: 'payment_amount', label: 'סכום לתשלום (שדה סליקה)', group: 'תשלומים, בנק וצ׳קים' },
  { value: 'donation_amount', label: 'סכום תרומה', group: 'תשלומים, בנק וצ׳קים' },
  { value: 'donation_type', label: 'אופן תשלום (חד פעמי / הוראת קבע)', group: 'תשלומים, בנק וצ׳קים' },
  { value: 'dedication_note', label: 'הקדשה לתרומה / תשלום', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.TOTAL_SPENT, label: 'סך הכל תשלומים / תרומות', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.ORDER_COUNT, label: 'מספר עסקאות / הזמנות', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.LAST_ORDER_DATE, label: 'תאריך עסקה אחרונה', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.BILLING_CUSTOMER_ID, label: 'מזהה לקוח לחיוב', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.BANK_NAME, label: 'שם בנק', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.BANK_BRANCH, label: 'מספר סניף בנק', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.BANK_ACCOUNT, label: 'מספר חשבון בנק', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.BANK_OWNER, label: 'שם בעל החשבון', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.BANK_AUTH, label: 'אסמכתא / הרשאה בנקאית', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.CHECK_NUMBER, label: 'מספר צ׳ק', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.CHECK_BANK, label: 'בנק הצ׳ק', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.CHECK_BRANCH, label: 'סניף הצ׳ק', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.CHECK_ACCOUNT, label: 'חשבון הצ׳ק', group: 'תשלומים, בנק וצ׳קים' },
  { value: KOSUN_CRM_FIELD_KEYS.CHECK_PAYEE, label: 'לפקודת (צ׳ק)', group: 'תשלומים, בנק וצ׳קים' },

  // 5. קמפיינים ושגרירים
  { value: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_ID, label: 'מזהה קמפיין', group: 'קמפיינים ושגרירים' },
  { value: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_TITLE, label: 'שם קמפיין', group: 'קמפיינים ושגרירים' },
  { value: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_AMOUNT, label: 'סכום בקמפיין', group: 'קמפיינים ושגרירים' },
  { value: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_ROLE, label: 'תפקיד בקמפיין', group: 'קמפיינים ושגרירים' },
  { value: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_GOAL, label: 'יעד גיוס', group: 'קמפיינים ושגרירים' },
  { value: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_RAISED, label: 'סכום שגויס', group: 'קמפיינים ושגרירים' },
  { value: KOSUN_CRM_FIELD_KEYS.AMBASSADOR_URL, label: 'קישור שגריר', group: 'קמפיינים ושגרירים' },

  // 6. מנויים והערות
  { value: KOSUN_CRM_FIELD_KEYS.SUBSCRIPTIONS, label: 'מנויי מערכת', group: 'מנויים והערות' },
  { value: KOSUN_CRM_FIELD_KEYS.CONTENT_SUBSCRIPTIONS, label: 'מנויי תוכן', group: 'מנויים והערות' },
  { value: KOSUN_CRM_FIELD_KEYS.NOTES, label: 'הערות / תוכן פנייה', group: 'מנויים והערות' },
];

