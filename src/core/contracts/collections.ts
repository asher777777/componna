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
  
  // 2. Marketing & Landing Pages
  PAGES: 'mod_pages_documents',
  PAGE_TEMPLATES: 'mod_pages_templates',
  PAGE_ANALYTICS: 'mod_pages_analytics',
  
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
  
  // 8. Settings & Brand DNA
  SETTINGS: 'settings',
  BRAND_DNA_DOC: 'brand_dna',
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
