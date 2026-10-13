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
  
  // 6. WhatsApp Green API
  WHATSAPP_CHATS: 'wa_chats',
  WHATSAPP_MESSAGES: 'wa_messages',
  WHATSAPP_BOT_RULES: 'wa_bot_rules',
  WHATSAPP_AI_BOTS: 'whatsapp_ai_bots',
  WHATSAPP_BOT_CHATS: 'wa_bot_chats',
  WHATSAPP_STATUSES: 'wa_statuses',
  WHATSAPP_TEMPLATES: 'wa_templates',
  
  // 7. Video Producer Studio & Flow Player
  VIDEO_PROJECTS: 'sdo_video_projects',
  VIDEO_SCENES: 'sdo_video_scenes',
  PLAYER_CAMPAIGNS: 'sdo_player_campaign_configs',
  PLAYER_EVENTS: 'sdo_player_session_events',
  
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

  // 11. מנויים וסליקת SaaS
  SUBSCRIPTIONS: 'kosun_crm_subscriptions',
  BILLING_CUSTOMER_ID: 'kosun_crm_billing_customer_id',

  // 12. זמני מערכת
  CREATED_AT: 'kosun_crm_created_at',
  UPDATED_AT: 'kosun_crm_updated_at',
} as const;

export type KosunCrmFieldKey = typeof KOSUN_CRM_FIELD_KEYS[keyof typeof KOSUN_CRM_FIELD_KEYS];

