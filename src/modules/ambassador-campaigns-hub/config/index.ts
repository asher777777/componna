/**
 * Configuration & Collection Registry for Ambassador Campaigns Hub
 */

import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { DonationTier, DrawerConfig } from '../types';

export const MODULE_ID = 'ambassador-campaigns-hub';
export const MODULE_PREFIX = 'mod_campaigns_';

export const DEFAULT_COLLECTIONS = {
  CAMPAIGNS: SYSTEM_COLLECTIONS.CAMPAIGNS || 'mod_campaigns',
  AMBASSADORS: SYSTEM_COLLECTIONS.CAMPAIGN_AMBASSADORS || 'mod_campaign_ambassadors',
  DONATIONS: SYSTEM_COLLECTIONS.CAMPAIGN_DONATIONS || 'mod_campaign_donations',
  CONTACTS: SYSTEM_COLLECTIONS.CONTACTS || 'contacts',
  GROUPS: SYSTEM_COLLECTIONS.GROUPS || 'crm_groups',
  PAGES: SYSTEM_COLLECTIONS.PAGES || 'mod_pages_documents',
} as const;

export const DEFAULT_TIERS: DonationTier[] = [
  { id: 'tier-1', name: 'שותף לדרך', amount: 180, monthlyAmount: 180, description: 'שותפות ישירה בבניית הקהילה והשגת היעד', color: '#3b82f6' },
  { id: 'tier-2', name: 'תומך פעיל', amount: 360, monthlyAmount: 360, description: 'תמיכה משמעותית בפעילות השנתית', color: '#10b981', isDefault: true, popular: true },
  { id: 'tier-3', name: 'ידיד נאמן', amount: 770, monthlyAmount: 770, description: 'זכות שותפות מורחבת וציון שם בלוח התורמים', color: '#8b5cf6' },
  { id: 'tier-4', name: 'פטרון הקהילה', amount: 1800, monthlyAmount: 1800, description: 'הקדשה מיוחדת וחסות על יעדי הקהילה', color: '#f59e0b' }
];

export const DEFAULT_DRAWER_CONFIG: DrawerConfig = {
  theme: 'light',
  whatsapp_enabled: true,
  whatsapp_success_message: 'שלום {שם מלא}, תודה רבה על תרומתך בסך ₪{סכום} עבור {שם קמפיין}! תזכו למצוות ולברכה.',
  whatsapp_pending_message: 'שלום {שם מלא}, שמנו לב שהתחלת תרומה בסך ₪{סכום} עבור {שם קמפיין} אך התהליך טרם הושלם. לחץ כאן להשלמת התרומה: {קישור לתשלום}',
  direct_bit_phone: '050-0000000',
  receipt_prefix: 'REC-',
};
