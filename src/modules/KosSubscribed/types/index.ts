import {
  SubscriptionBillingCycle,
  ContentSubscriptionStatus,
  SubscriptionContentItem,
  SubscriptionPackageItem,
  SubscriptionDiscountCoupon,
  SubscriptionQuizQuestion,
  SubscriptionQuizItem,
  ContactQuizSubmission,
  ContactContentSubscription,
  CrmSubscriberContactRecord,
  SubscriptionAnalyticsSummary,
  SubscriberPermissions,
  SubscriberUserRole,
} from '../../../core/contracts';

export type {
  SubscriptionBillingCycle,
  ContentSubscriptionStatus,
  SubscriptionContentItem,
  SubscriptionPackageItem,
  SubscriptionDiscountCoupon,
  SubscriptionQuizQuestion,
  SubscriptionQuizItem,
  ContactQuizSubmission,
  ContactContentSubscription,
  CrmSubscriberContactRecord,
  SubscriptionAnalyticsSummary,
  SubscriberPermissions,
  SubscriberUserRole,
};

export type KosSubscribedTab =
  | 'subscribers' // לשונית מנויים ומעקב אנשי קשר (ברירת מחדל מודגשת)
  | 'packages'    // חבילות חודשיות והנחות/קופונים
  | 'quizzes'     // טפסים של מבחנים ושאלונים
  | 'content'     // תצוגת תוכן נעולה למנויים (Paywall Preview)
  | 'analytics';  // אנליטיקה ומעקב תשלומים

export type KosSubscribedModalMode =
  | 'none'
  | 'assign-package'
  | 'edit-package'
  | 'edit-coupon'
  | 'create-quiz'
  | 'take-quiz'
  | 'payment-terminal'
  | 'edit-permissions'
  | 'subscriber-portal';

export interface SubscriberFilterState {
  search: string;
  status: 'all' | 'active' | 'trial' | 'past_due' | 'paused' | 'canceled' | 'unsubscribed';
  packageId: string;
}
