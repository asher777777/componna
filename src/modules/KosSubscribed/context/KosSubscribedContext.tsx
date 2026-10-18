import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useTenantScope } from '../../../core/tenant';
import { eventBus } from '../../../core/bridge/EventBus';
import {
  CrmSubscriptionsContract,
  PageBuilderContract,
  FormBuilderContract,
  KesherPaymentContract,
  BrandDnaContract,
  AiTextAssistantContract,
  CrmSubscriberContactRecord,
  SubscriptionPackageItem,
  SubscriptionDiscountCoupon,
  SubscriptionQuizItem,
  SubscriptionAnalyticsSummary,
  ContentSubscriptionStatus,
  ContactContentSubscription,
  ContactQuizSubmission,
  SubscriberPermissions,
  SubscriberUserRole,
} from '../../../core/contracts';
import {
  KosSubscribedTab,
  KosSubscribedModalMode,
  SubscriberFilterState,
} from '../types';
import { KosSubscribedService } from '../services/kosSubscribedService';
import { generatePackageCopyWithAi } from '../api/functionsApi';

interface KosSubscribedContextValue {
  tenantId: string;
  activeTab: KosSubscribedTab;
  setActiveTab: (tab: KosSubscribedTab) => void;
  modalMode: KosSubscribedModalMode;
  setModalMode: (mode: KosSubscribedModalMode) => void;
  contacts: CrmSubscriberContactRecord[];
  packages: SubscriptionPackageItem[];
  coupons: SubscriptionDiscountCoupon[];
  quizzes: SubscriptionQuizItem[];
  analytics: SubscriptionAnalyticsSummary;
  filter: SubscriberFilterState;
  setFilter: React.Dispatch<React.SetStateAction<SubscriberFilterState>>;
  filteredContacts: CrmSubscriberContactRecord[];
  selectedContact: CrmSubscriberContactRecord | null;
  setSelectedContact: (c: CrmSubscriberContactRecord | null) => void;
  editingPackage: SubscriptionPackageItem | null;
  setEditingPackage: (pkg: SubscriptionPackageItem | null) => void;
  editingCoupon: SubscriptionDiscountCoupon | null;
  setEditingCoupon: (cpn: SubscriptionDiscountCoupon | null) => void;
  editingQuiz: SubscriptionQuizItem | null;
  setEditingQuiz: (quiz: SubscriptionQuizItem | null) => void;
  activeQuizForAttempt: SubscriptionQuizItem | null;
  setActiveQuizForAttempt: (quiz: SubscriptionQuizItem | null) => void;
  isLoading: boolean;
  isBusy: boolean;
  error: string | null;
  notification: string | null;
  clearError: () => void;
  notify: (msg: string) => void;
  refreshAll: () => Promise<void>;
  assignPackageToContact: (params: {
    contactId: string;
    packageId: string;
    discountCode?: string;
    customDiscountAmount?: number;
    status?: ContentSubscriptionStatus;
    paymentMethod?: string;
    notes?: string;
  }) => Promise<ContactContentSubscription | null>;
  updateSubscriptionStatus: (
    contactId: string,
    subscriptionId: string,
    updates: Partial<ContactContentSubscription>
  ) => Promise<boolean>;
  removeSubscription: (contactId: string, subscriptionId: string) => Promise<boolean>;
  updateSubscriberPermissions: (
    contactId: string,
    permissions: Partial<SubscriberPermissions>,
    subscriberRole?: SubscriberUserRole
  ) => Promise<boolean>;
  processLivePayment: (params: {
    contactId: string;
    contactName: string;
    contactPhone?: string;
    contactEmail?: string;
    subscriptionId?: string;
    packageId: string;
    packageName: string;
    amount: number;
    discountCode?: string;
  }) => Promise<boolean>;
  savePackage: (
    pkg: Partial<SubscriptionPackageItem> & { name: string; price: number }
  ) => Promise<SubscriptionPackageItem | null>;
  deletePackage: (packageId: string) => Promise<boolean>;
  generatePaymentPage: (pkg: SubscriptionPackageItem) => Promise<string | null>;
  generateAiCopyForPackage: (params: {
    packageName: string;
    price: number;
    billingCycle: string;
  }) => Promise<{ description: string; features: string[] }>;
  saveCoupon: (
    coupon: Partial<SubscriptionDiscountCoupon> & { code: string; discountValue: number }
  ) => Promise<SubscriptionDiscountCoupon | null>;
  deleteCoupon: (couponId: string) => Promise<boolean>;
  saveQuiz: (
    quiz: Partial<SubscriptionQuizItem> & { title: string }
  ) => Promise<SubscriptionQuizItem | null>;
  deleteQuiz: (quizId: string) => Promise<boolean>;
  submitQuizAttempt: (params: {
    contactId: string;
    quiz: SubscriptionQuizItem;
    selectedAnswers: Record<string, number>;
  }) => Promise<ContactQuizSubmission | null>;
}

const DEFAULT_ANALYTICS: SubscriptionAnalyticsSummary = {
  totalSubscribers: 0,
  activeSubscribers: 0,
  trialSubscribers: 0,
  pastDueSubscribers: 0,
  canceledSubscribers: 0,
  mrr: 0,
  arr: 0,
  totalCollectedRevenue: 0,
  averageRevenuePerUser: 0,
  quizPassRate: 0,
  revenueByPackage: [],
};

const KosSubscribedContext = createContext<KosSubscribedContextValue | null>(null);

export const KosSubscribedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();

  const [activeTab, setActiveTab] = useState<KosSubscribedTab>('subscribers');
  const [modalMode, setModalMode] = useState<KosSubscribedModalMode>('none');
  const [contacts, setContacts] = useState<CrmSubscriberContactRecord[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackageItem[]>([]);
  const [coupons, setCoupons] = useState<SubscriptionDiscountCoupon[]>([]);
  const [quizzes, setQuizzes] = useState<SubscriptionQuizItem[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalyticsSummary>(DEFAULT_ANALYTICS);

  const [filter, setFilter] = useState<SubscriberFilterState>({
    search: '',
    status: 'all',
    packageId: 'all',
  });

  const [selectedContact, setSelectedContact] = useState<CrmSubscriberContactRecord | null>(null);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackageItem | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<SubscriptionDiscountCoupon | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<SubscriptionQuizItem | null>(null);
  const [activeQuizForAttempt, setActiveQuizForAttempt] = useState<SubscriptionQuizItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const service = useMemo(() => {
    return new KosSubscribedService(
      () => getCapability<CrmSubscriptionsContract>('crm-subscriptions'),
      () => getCapability<PageBuilderContract>('page-builder'),
      () => getCapability<FormBuilderContract>('form-builder'),
      () => getCapability<KesherPaymentContract>('kesher-payment')
    );
  }, [getCapability]);

  const notify = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const bundle = await service.fetchDashboardBundle();
      setContacts(bundle.contacts);
      setPackages(bundle.packages);
      setCoupons(bundle.coupons);
      setQuizzes(bundle.quizzes);
      setAnalytics(bundle.analytics);
    } catch (err: any) {
      setError(err?.message || 'שגיאה בטעינת נתוני המנויים מחוזה ה-CRM');
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    // Allow CrmAnalyticsHostBridge a brief tick to register on mount if needed
    const timer = setTimeout(() => {
      refreshAll();
    }, 50);
    return () => clearTimeout(timer);
  }, [refreshAll, tenantId]);

  useEffect(() => {
    const unsub1 = eventBus.subscribe('crm:subscription:updated', () => {
      refreshAll();
    });
    const unsub2 = eventBus.subscribe('crm:subscription:package_saved', () => {
      refreshAll();
    });
    const unsub3 = eventBus.subscribe('crm:contact:updated', () => {
      refreshAll();
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [refreshAll]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const subs = c.contentSubscriptions || [];
      if (filter.search.trim()) {
        const q = filter.search.trim().toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchPkg = subs.some((s) => s.packageName.toLowerCase().includes(q));
        if (!matchName && !matchPhone && !matchEmail && !matchPkg) return false;
      }

      if (filter.status !== 'all') {
        if (filter.status === 'unsubscribed') {
          if (subs.length > 0) return false;
        } else {
          if (!subs.some((s) => s.status === filter.status)) return false;
        }
      }

      if (filter.packageId !== 'all') {
        if (!subs.some((s) => s.packageId === filter.packageId)) return false;
      }

      return true;
    });
  }, [contacts, filter]);

  const assignPackageToContact = useCallback(
    async (params: {
      contactId: string;
      packageId: string;
      discountCode?: string;
      customDiscountAmount?: number;
      status?: ContentSubscriptionStatus;
      paymentMethod?: string;
      notes?: string;
    }) => {
      setIsBusy(true);
      setError(null);
      try {
        const res = await service.assignPackageToContact(params);
        await refreshAll();
        notify('החבילה שודכה לאיש הקשר ונשמרה ב-CRM בהצלחה');
        return res;
      } catch (err: any) {
        setError(err?.message || 'שגיאה בשידוך חבילה לאיש הקשר');
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const updateSubscriptionStatus = useCallback(
    async (
      contactId: string,
      subscriptionId: string,
      updates: Partial<ContactContentSubscription>
    ) => {
      setIsBusy(true);
      try {
        const ok = await service.updateSubscriptionStatus(contactId, subscriptionId, updates);
        await refreshAll();
        notify('סטטוס המנוי עודכן בכרטיס איש הקשר');
        return ok;
      } catch (err: any) {
        setError(err?.message || 'שגיאה בעדכון סטטוס המנוי');
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const removeSubscription = useCallback(
    async (contactId: string, subscriptionId: string) => {
      setIsBusy(true);
      try {
        const ok = await service.removeSubscription(contactId, subscriptionId);
        await refreshAll();
        notify('המנוי הוסר מכרטיס איש הקשר');
        return ok;
      } catch (err: any) {
        setError(err?.message || 'שגיאה במחיקת המנוי');
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const updateSubscriberPermissions = useCallback(
    async (
      contactId: string,
      permissions: Partial<SubscriberPermissions>,
      subscriberRole?: SubscriberUserRole
    ) => {
      setIsBusy(true);
      try {
        const ok = await service.updateSubscriberPermissions(contactId, permissions, subscriberRole);
        await refreshAll();
        notify('הרשאות המנוי נשמרו ועודכנו בהצלחה');
        return ok;
      } catch (err: any) {
        setError(err?.message || 'שגיאה בעדכון הרשאות המנוי');
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const processLivePayment = useCallback(
    async (params: {
      contactId: string;
      contactName: string;
      contactPhone?: string;
      contactEmail?: string;
      subscriptionId?: string;
      packageId: string;
      packageName: string;
      amount: number;
      discountCode?: string;
    }) => {
      setIsBusy(true);
      setError(null);
      try {
        const res = await service.processLiveSubscriptionPayment(params);
        if (!res.success) {
          setError(res.error || 'התשלום לא הושלם');
          return false;
        }
        await refreshAll();
        notify(`התשלום על סך ₪${params.amount} נקלט בהצלחה (${res.transactionId})`);
        return true;
      } catch (err: any) {
        setError(err?.message || 'שגיאה בביצוע סליקת מנוי');
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const savePackage = useCallback(
    async (pkg: Partial<SubscriptionPackageItem> & { name: string; price: number }) => {
      setIsBusy(true);
      setError(null);
      try {
        const saved = await service.savePackage(pkg);
        await refreshAll();
        notify(`החבילה "${saved.name}" נשמרה בהצלחה`);
        return saved;
      } catch (err: any) {
        setError(err?.message || 'שגיאה בשמירת החבילה');
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const deletePackage = useCallback(
    async (packageId: string) => {
      setIsBusy(true);
      try {
        const ok = await service.deletePackage(packageId);
        await refreshAll();
        notify('החבילה נמחקה');
        return ok;
      } catch (err: any) {
        setError(err?.message || 'שגיאה במחיקת החבילה');
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const generatePaymentPage = useCallback(
    async (pkg: SubscriptionPackageItem) => {
      setIsBusy(true);
      setError(null);
      try {
        const brandContract = getCapability<BrandDnaContract>('brand-dna');
        const brandDna = brandContract?.getBrandDna?.() || null;
        const res = await service.generatePaymentPageForPackage(pkg, brandDna);
        if (!res.success) {
          setError(res.error || 'שגיאה ביצירת עמוד תשלום');
          return null;
        }
        await refreshAll();
        notify(`עמוד תשלום לחבילה "${pkg.name}" נוצר בהצלחה: ${res.pageUrl}`);
        return res.pageUrl;
      } catch (err: any) {
        setError(err?.message || 'שגיאה ביצירת עמוד תשלום');
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [service, getCapability, refreshAll, notify]
  );

  const generateAiCopyForPackage = useCallback(
    async (params: { packageName: string; price: number; billingCycle: string }) => {
      const aiAssistant = getCapability<AiTextAssistantContract>('ai-text-assistant');
      const brandContract = getCapability<BrandDnaContract>('brand-dna');
      const brandDna = brandContract?.getBrandDna?.() || null;
      return generatePackageCopyWithAi(aiAssistant, { ...params, brandDna });
    },
    [getCapability]
  );

  const saveCoupon = useCallback(
    async (coupon: Partial<SubscriptionDiscountCoupon> & { code: string; discountValue: number }) => {
      setIsBusy(true);
      setError(null);
      try {
        const saved = await service.saveCoupon(coupon);
        await refreshAll();
        notify(`קופון ההנחה ${saved.code} נשמר בהצלחה`);
        return saved;
      } catch (err: any) {
        setError(err?.message || 'שגיאה בשמירת הקופון');
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const deleteCoupon = useCallback(
    async (couponId: string) => {
      setIsBusy(true);
      try {
        const ok = await service.deleteCoupon(couponId);
        await refreshAll();
        notify('הקופון נמחק');
        return ok;
      } catch (err: any) {
        setError(err?.message || 'שגיאה במחיקת הקופון');
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const saveQuiz = useCallback(
    async (quiz: Partial<SubscriptionQuizItem> & { title: string }) => {
      setIsBusy(true);
      setError(null);
      try {
        const saved = await service.saveQuizAndSyncForm(quiz);
        await refreshAll();
        notify(`טופס המבחן "${saved.title}" נוצר וסונכרן בהצלחה`);
        return saved;
      } catch (err: any) {
        setError(err?.message || 'שגיאה בשמירת טופס המבחן');
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const deleteQuiz = useCallback(
    async (quizId: string) => {
      setIsBusy(true);
      try {
        const ok = await service.deleteQuiz(quizId);
        await refreshAll();
        notify('טופס המבחן נמחק');
        return ok;
      } catch (err: any) {
        setError(err?.message || 'שגיאה במחיקת המבחן');
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  const submitQuizAttempt = useCallback(
    async (params: {
      contactId: string;
      quiz: SubscriptionQuizItem;
      selectedAnswers: Record<string, number>;
    }) => {
      setIsBusy(true);
      setError(null);
      try {
        const result = await service.submitContactQuizAttempt(params);
        await refreshAll();
        if (result) {
          notify(
            `המבחן הוגש! ציון: ${result.score}% (${result.passed ? 'עבר בהצלחה' : 'טרם עבר את סף המעבר'})`
          );
        }
        return result;
      } catch (err: any) {
        setError(err?.message || 'שגיאה בהגשת המבחן');
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [service, refreshAll, notify]
  );

  return (
    <KosSubscribedContext.Provider
      value={{
        tenantId,
        activeTab,
        setActiveTab,
        modalMode,
        setModalMode,
        contacts,
        packages,
        coupons,
        quizzes,
        analytics,
        filter,
        setFilter,
        filteredContacts,
        selectedContact,
        setSelectedContact,
        editingPackage,
        setEditingPackage,
        editingCoupon,
        setEditingCoupon,
        editingQuiz,
        setEditingQuiz,
        activeQuizForAttempt,
        setActiveQuizForAttempt,
        isLoading,
        isBusy,
        error,
        notification,
        clearError,
        notify,
        refreshAll,
        assignPackageToContact,
        updateSubscriptionStatus,
        removeSubscription,
        updateSubscriberPermissions,
        processLivePayment,
        savePackage,
        deletePackage,
        generatePaymentPage,
        generateAiCopyForPackage,
        saveCoupon,
        deleteCoupon,
        saveQuiz,
        deleteQuiz,
        submitQuizAttempt,
      }}
    >
      {children}
    </KosSubscribedContext.Provider>
  );
};

export function useKosSubscribedContext(): KosSubscribedContextValue {
  const ctx = useContext(KosSubscribedContext);
  if (!ctx) {
    throw new Error('useKosSubscribedContext must be used within a KosSubscribedProvider');
  }
  return ctx;
}
