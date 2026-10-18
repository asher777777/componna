import { SYSTEM_COLLECTIONS } from '../../../core/contracts';

/**
 * KosSubscribed Configuration
 * Data Monopoly Note: All collections are owned exclusively by CRM Analytics
 * under the active subdomain tenant scope (useTenantScope).
 */
export const KOS_SUBSCRIBED_CONFIG = {
  moduleId: 'KosSubscribed',
  displayNameHe: 'KosSubscribed - ניהול מנויי תוכן, חבילות ומבחנים',
  route: '/KosSubscribed',
  crmCapabilityName: 'crm-subscriptions',
  crmCollections: {
    contacts: SYSTEM_COLLECTIONS.CONTACTS,
    packages: SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_PACKAGES,
    coupons: SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_COUPONS,
    quizzes: SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_QUIZZES,
  },
} as const;
