import { FirebaseApp } from 'firebase/app';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  CrmSubscriptionsContract,
  CrmSubscriberContactRecord,
  ContactContentSubscription,
  ContactQuizSubmission,
  SubscriptionPackageItem,
  SubscriptionDiscountCoupon,
  SubscriptionQuizItem,
  SubscriptionAnalyticsSummary,
  ContentSubscriptionStatus,
  SubscriberPermissions,
  SubscriberUserRole,
  SYSTEM_COLLECTIONS,
  KOSUN_CRM_FIELD_KEYS,
} from '../../../core/contracts';
import { getTenantCollectionPath, resolveCurrentTenantId } from '../../../core/tenant/tenantResolver';
import { eventBus } from '../../../core/bridge/EventBus';

export function createCrmSubscriptionsContract(options: {
  db?: Firestore;
  firebaseApp?: FirebaseApp;
  tenantId?: string;
  getScopedCollectionPath?: (collectionName: string) => string;
}): CrmSubscriptionsContract {
  const resolveTenant = () => options.tenantId || resolveCurrentTenantId();
  const resolveScopedPath = (colName: string) => {
    const tId = resolveTenant();
    if (options.getScopedCollectionPath) {
      return options.getScopedCollectionPath(colName);
    }
    return getTenantCollectionPath(colName, tId);
  };

  const getPackages = async (): Promise<SubscriptionPackageItem[]> => {
    if (!options.db) return [];
    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_PACKAGES);
    const snap = await getDocs(collection(options.db, colPath));
    const items: SubscriptionPackageItem[] = [];
    snap.forEach((d) => items.push({ ...(d.data() as SubscriptionPackageItem), id: d.id }));
    return items;
  };

  const savePackage = async (
    pkgInput: Partial<SubscriptionPackageItem> & { name: string; price: number }
  ): Promise<SubscriptionPackageItem> => {
    if (!options.db) {
      throw new Error('חיבור למסד הנתונים (Firestore) אינו זמין.');
    }
    const tId = resolveTenant();
    const current = await getPackages();
    const now = new Date().toISOString();
    const id = pkgInput.id || `pkg_${Date.now()}`;
    const existing = current.find((p) => p.id === id);

    const saved: SubscriptionPackageItem = {
      id,
      name: pkgInput.name,
      description: pkgInput.description ?? existing?.description ?? '',
      price: Number(pkgInput.price),
      originalPrice:
        pkgInput.originalPrice !== undefined
          ? Number(pkgInput.originalPrice)
          : existing?.originalPrice,
      discountPercent:
        pkgInput.discountPercent !== undefined
          ? Number(pkgInput.discountPercent)
          : existing?.discountPercent,
      billingCycle: pkgInput.billingCycle || existing?.billingCycle || 'monthly',
      trialDays:
        pkgInput.trialDays !== undefined ? Number(pkgInput.trialDays) : (existing?.trialDays ?? 0),
      features: pkgInput.features || existing?.features || [],
      contentItems: pkgInput.contentItems || existing?.contentItems || [],
      linkedPaymentPageId: pkgInput.linkedPaymentPageId ?? existing?.linkedPaymentPageId,
      linkedPaymentPageSlug: pkgInput.linkedPaymentPageSlug ?? existing?.linkedPaymentPageSlug,
      linkedPaymentPageUrl: pkgInput.linkedPaymentPageUrl ?? existing?.linkedPaymentPageUrl,
      linkedQuizFormId: pkgInput.linkedQuizFormId ?? existing?.linkedQuizFormId,
      linkedQuizFormTitle: pkgInput.linkedQuizFormTitle ?? existing?.linkedQuizFormTitle,
      passingScorePercent: pkgInput.passingScorePercent ?? existing?.passingScorePercent ?? 75,
      badgeText: pkgInput.badgeText ?? existing?.badgeText,
      isPopular: pkgInput.isPopular ?? existing?.isPopular ?? false,
      isActive: pkgInput.isActive ?? existing?.isActive ?? true,
      subscribersCount: pkgInput.subscribersCount ?? existing?.subscribersCount ?? 0,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_PACKAGES);
    await setDoc(doc(options.db, colPath, id), saved, { merge: true });

    eventBus.emit('crm:subscription:package_saved', {
      packageId: id,
      name: saved.name,
      tenantId: tId,
    });

    return saved;
  };

  const deletePackage = async (packageId: string): Promise<boolean> => {
    if (!options.db) return false;
    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_PACKAGES);
    await deleteDoc(doc(options.db, colPath, packageId));
    return true;
  };

  const getCoupons = async (): Promise<SubscriptionDiscountCoupon[]> => {
    if (!options.db) return [];
    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_COUPONS);
    const snap = await getDocs(collection(options.db, colPath));
    const items: SubscriptionDiscountCoupon[] = [];
    snap.forEach((d) => items.push({ ...(d.data() as SubscriptionDiscountCoupon), id: d.id }));
    return items;
  };

  const saveCoupon = async (
    couponInput: Partial<SubscriptionDiscountCoupon> & { code: string; discountValue: number }
  ): Promise<SubscriptionDiscountCoupon> => {
    if (!options.db) {
      throw new Error('חיבור למסד הנתונים (Firestore) אינו זמין.');
    }
    const current = await getCoupons();
    const id = couponInput.id || `cpn_${Date.now()}`;
    const existing = current.find((c) => c.id === id);

    const saved: SubscriptionDiscountCoupon = {
      id,
      code: couponInput.code.trim().toUpperCase(),
      description: couponInput.description ?? existing?.description ?? '',
      discountType: couponInput.discountType || existing?.discountType || 'percentage',
      discountValue: Number(couponInput.discountValue),
      applicablePackageIds:
        couponInput.applicablePackageIds || existing?.applicablePackageIds || [],
      maxUses:
        couponInput.maxUses !== undefined ? Number(couponInput.maxUses) : existing?.maxUses,
      usedCount: couponInput.usedCount ?? existing?.usedCount ?? 0,
      validUntil: couponInput.validUntil ?? existing?.validUntil,
      isActive: couponInput.isActive ?? existing?.isActive ?? true,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_COUPONS);
    await setDoc(doc(options.db, colPath, id), saved, { merge: true });

    return saved;
  };

  const deleteCoupon = async (couponId: string): Promise<boolean> => {
    if (!options.db) return false;
    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_COUPONS);
    await deleteDoc(doc(options.db, colPath, couponId));
    return true;
  };

  const validateCoupon = async (code: string, packageId?: string) => {
    const clean = code.trim().toUpperCase();
    const coupons = await getCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === clean && c.isActive);
    if (!found) {
      return { valid: false, error: 'קוד הקופון לא נמצא או שאינו פעיל' };
    }
    if (found.maxUses && found.usedCount >= found.maxUses) {
      return { valid: false, error: 'קוד הקופון הגיע למכסת השימושים המקסימלית' };
    }
    if (
      packageId &&
      found.applicablePackageIds.length > 0 &&
      !found.applicablePackageIds.includes(packageId)
    ) {
      return { valid: false, error: 'קופון זה אינו תקף עבור החבילה שנבחרה' };
    }
    return { valid: true, coupon: found };
  };

  const getQuizzes = async (): Promise<SubscriptionQuizItem[]> => {
    if (!options.db) return [];
    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_QUIZZES);
    const snap = await getDocs(collection(options.db, colPath));
    const items: SubscriptionQuizItem[] = [];
    snap.forEach((d) => items.push({ ...(d.data() as SubscriptionQuizItem), id: d.id }));
    return items;
  };

  const saveQuiz = async (
    quizInput: Partial<SubscriptionQuizItem> & { title: string }
  ): Promise<SubscriptionQuizItem> => {
    if (!options.db) {
      throw new Error('חיבור למסד הנתונים (Firestore) אינו זמין.');
    }
    const current = await getQuizzes();
    const now = new Date().toISOString();
    const id = quizInput.id || `quiz_${Date.now()}`;
    const existing = current.find((q) => q.id === id);

    const saved: SubscriptionQuizItem = {
      id,
      title: quizInput.title,
      description: quizInput.description ?? existing?.description ?? '',
      packageId: quizInput.packageId ?? existing?.packageId,
      packageName: quizInput.packageName ?? existing?.packageName,
      passingScore: Number(quizInput.passingScore ?? existing?.passingScore ?? 75),
      ksfFormId: quizInput.ksfFormId ?? existing?.ksfFormId,
      questions: quizInput.questions || existing?.questions || [],
      submissionsCount: quizInput.submissionsCount ?? existing?.submissionsCount ?? 0,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_QUIZZES);
    await setDoc(doc(options.db, colPath, id), saved, { merge: true });

    return saved;
  };

  const deleteQuiz = async (quizId: string): Promise<boolean> => {
    if (!options.db) return false;
    const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_QUIZZES);
    await deleteDoc(doc(options.db, colPath, quizId));
    return true;
  };

  const getSubscriberContacts = async (): Promise<CrmSubscriberContactRecord[]> => {
    if (!options.db) return [];
    const contactsColPath = resolveScopedPath(SYSTEM_COLLECTIONS.CONTACTS);
    const snap = await getDocs(collection(options.db, contactsColPath));
    const records: CrmSubscriberContactRecord[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.status === 'trashed') return;
      const id = docSnap.id;
      const name = d[KOSUN_CRM_FIELD_KEYS.NAME] || d.conta_name || '';
      const phone = d[KOSUN_CRM_FIELD_KEYS.PHONE] || d.conta_phone || '';
      const email = d[KOSUN_CRM_FIELD_KEYS.EMAIL] || d.email || '';
      const contentSubscriptions: ContactContentSubscription[] =
        d[KOSUN_CRM_FIELD_KEYS.CONTENT_SUBSCRIPTIONS] || d.content_subscriptions || [];
      const quizResults: ContactQuizSubmission[] =
        d[KOSUN_CRM_FIELD_KEYS.QUIZ_RESULTS] || d.quiz_results || [];
      const subSpent = contentSubscriptions.reduce(
        (acc, s) => acc + (Number(s.finalAmount) || 0),
        0
      );

      records.push({
        id,
        name,
        phone,
        email,
        company: d[KOSUN_CRM_FIELD_KEYS.COMPANY] || d.company_name || '',
        city: d[KOSUN_CRM_FIELD_KEYS.CITY] || d.mh_crm_city || '',
        tags: d[KOSUN_CRM_FIELD_KEYS.TAGS] || d.tags || [],
        totalSpent: Math.max(
          Number(d.total_spent || d[KOSUN_CRM_FIELD_KEYS.TOTAL_SPENT] || 0),
          subSpent
        ),
        contentSubscriptions,
        quizResults,
        lastPaymentDate: contentSubscriptions[0]?.startDate || d.last_order_date,
        rawContact: d,
      });
    });

    return records;
  };

  const persistContactSubscriptionsToCrm = async (
    contactId: string,
    subscriptions: ContactContentSubscription[],
    quizResults: ContactQuizSubmission[],
    extraTags?: string[],
    addedSpent?: number
  ) => {
    if (!options.db) {
      throw new Error('חיבור למסד הנתונים (Firestore) אינו זמין.');
    }

    const contactsColPath = resolveScopedPath(SYSTEM_COLLECTIONS.CONTACTS);
    const ref = doc(options.db, contactsColPath, contactId);
    const snap = await getDoc(ref);
    const existingData = snap.exists() ? snap.data() : {};
    const currentTags: string[] =
      existingData.tags || existingData[KOSUN_CRM_FIELD_KEYS.TAGS] || [];
    const nextTags = extraTags
      ? Array.from(new Set([...currentTags, ...extraTags]))
      : currentTags;
    const currentSpent = Number(
      existingData.total_spent || existingData[KOSUN_CRM_FIELD_KEYS.TOTAL_SPENT] || 0
    );
    const nextSpent = addedSpent ? currentSpent + addedSpent : currentSpent;

    await setDoc(
      ref,
      {
        [KOSUN_CRM_FIELD_KEYS.CONTENT_SUBSCRIPTIONS]: subscriptions,
        content_subscriptions: subscriptions,
        [KOSUN_CRM_FIELD_KEYS.QUIZ_RESULTS]: quizResults,
        quiz_results: quizResults,
        [KOSUN_CRM_FIELD_KEYS.TAGS]: nextTags,
        tags: nextTags,
        [KOSUN_CRM_FIELD_KEYS.TOTAL_SPENT]: nextSpent,
        total_spent: nextSpent,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    eventBus.emit('crm:contact:updated', { id: contactId });
  };

  const getContactSubscriptions = async (contactId: string) => {
    const all = await getSubscriberContacts();
    const found = all.find((c) => c.id === contactId);
    return {
      subscriptions: found?.contentSubscriptions || [],
      quizResults: found?.quizResults || [],
    };
  };

  const assignPackageToContact = async (params: {
    contactId: string;
    packageId: string;
    discountCode?: string;
    customDiscountAmount?: number;
    status?: ContentSubscriptionStatus;
    paymentMethod?: string;
    transactionId?: string;
    receiptUrl?: string;
    notes?: string;
  }): Promise<ContactContentSubscription | null> => {
    const tId = resolveTenant();
    const [contacts, packages, coupons] = await Promise.all([
      getSubscriberContacts(),
      getPackages(),
      getCoupons(),
    ]);

    const contact = contacts.find((c) => c.id === params.contactId);
    const pkg = packages.find((p) => p.id === params.packageId);
    if (!contact || !pkg) return null;

    let discountAmount = Number(params.customDiscountAmount || 0);
    const appliedCode = params.discountCode?.trim().toUpperCase();

    if (appliedCode) {
      const matchedCoupon = coupons.find((c) => c.code.toUpperCase() === appliedCode && c.isActive);
      if (matchedCoupon) {
        if (matchedCoupon.discountType === 'percentage') {
          discountAmount = Math.round((pkg.price * matchedCoupon.discountValue) / 100);
        } else {
          discountAmount = matchedCoupon.discountValue;
        }
        await saveCoupon({
          ...matchedCoupon,
          usedCount: (matchedCoupon.usedCount || 0) + 1,
        });
      }
    }

    const finalAmount = Math.max(0, pkg.price - discountAmount);
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];

    const nextDate = new Date(now);
    if (pkg.billingCycle === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (pkg.billingCycle === 'annual') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    const nextBillingDate =
      pkg.billingCycle === 'one_time' ? undefined : nextDate.toISOString().split('T')[0];

    const newSub: ContactContentSubscription = {
      id: `sub_${Date.now()}`,
      contactId: contact.id,
      contactName: contact.name,
      contactEmail: contact.email,
      contactPhone: contact.phone,
      packageId: pkg.id,
      packageName: pkg.name,
      billingCycle: pkg.billingCycle,
      basePrice: pkg.price,
      discountCode: appliedCode,
      discountAmount,
      finalAmount,
      status: params.status || 'active',
      startDate,
      nextBillingDate,
      paymentMethod: params.paymentMethod || '',
      lastTransactionId: params.transactionId,
      receiptUrl: params.receiptUrl,
      paymentPageUrl: pkg.linkedPaymentPageUrl,
      quizFormId: pkg.linkedQuizFormId,
      notes: params.notes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const nextSubs = [newSub, ...(contact.contentSubscriptions || [])];
    await persistContactSubscriptionsToCrm(
      contact.id,
      nextSubs,
      contact.quizResults || [],
      ['מנוי תוכן', pkg.name],
      finalAmount
    );

    eventBus.emit('crm:subscription:updated', {
      contactId: contact.id,
      subscriptionId: newSub.id,
      packageId: pkg.id,
      status: newSub.status,
      tenantId: tId,
    });

    return newSub;
  };

  const updateContactSubscriptionStatus = async (
    contactId: string,
    subscriptionId: string,
    updates: Partial<ContactContentSubscription>
  ): Promise<boolean> => {
    const tId = resolveTenant();
    const contacts = await getSubscriberContacts();
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return false;

    let targetPkgId = '';
    let targetStatus = updates.status || 'active';

    const nextSubs = (contact.contentSubscriptions || []).map((s) => {
      if (s.id !== subscriptionId) return s;
      targetPkgId = s.packageId;
      targetStatus = updates.status || s.status;
      return {
        ...s,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });

    await persistContactSubscriptionsToCrm(contactId, nextSubs, contact.quizResults || []);

    eventBus.emit('crm:subscription:updated', {
      contactId,
      subscriptionId,
      packageId: targetPkgId,
      status: targetStatus,
      tenantId: tId,
    });

    return true;
  };

  const removeContactSubscription = async (
    contactId: string,
    subscriptionId: string
  ): Promise<boolean> => {
    const contacts = await getSubscriberContacts();
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return false;

    const nextSubs = (contact.contentSubscriptions || []).filter((s) => s.id !== subscriptionId);
    await persistContactSubscriptionsToCrm(contactId, nextSubs, contact.quizResults || []);
    return true;
  };

  const recordContactSubscriptionPayment = async (params: {
    contactId: string;
    subscriptionId: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    receiptUrl?: string;
  }): Promise<boolean> => {
    const contacts = await getSubscriberContacts();
    const contact = contacts.find((c) => c.id === params.contactId);
    if (!contact) return false;

    const nextSubs = (contact.contentSubscriptions || []).map((s) => {
      if (s.id !== params.subscriptionId) return s;
      return {
        ...s,
        status: 'active' as ContentSubscriptionStatus,
        paymentMethod: params.paymentMethod,
        lastTransactionId: params.transactionId,
        receiptUrl: params.receiptUrl || s.receiptUrl,
        updatedAt: new Date().toISOString(),
      };
    });

    await persistContactSubscriptionsToCrm(
      params.contactId,
      nextSubs,
      contact.quizResults || [],
      ['מנוי משלם'],
      params.amount
    );
    return true;
  };

  const recordContactQuizSubmission = async (
    contactId: string,
    submission: Omit<ContactQuizSubmission, 'id' | 'submittedAt'>
  ): Promise<ContactQuizSubmission | null> => {
    const contacts = await getSubscriberContacts();
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return null;

    const newSubmission: ContactQuizSubmission = {
      ...submission,
      id: `qr_${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    const nextQuizzes = [newSubmission, ...(contact.quizResults || [])];
    const nextSubs = (contact.contentSubscriptions || []).map((s) => {
      if (submission.packageId && s.packageId === submission.packageId) {
        return {
          ...s,
          quizScore: submission.score,
          quizPassed: submission.passed,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    await persistContactSubscriptionsToCrm(
      contactId,
      nextSubs,
      nextQuizzes,
      submission.passed ? [`עבר מבחן: ${submission.quizTitle}`] : undefined
    );

    return newSubmission;
  };

  const checkContactContentAccess = async (
    contactId: string,
    packageId: string,
    requiredMinQuizScore?: number
  ) => {
    const { subscriptions, quizResults } = await getContactSubscriptions(contactId);
    const activeSub = subscriptions.find(
      (s) => s.packageId === packageId && (s.status === 'active' || s.status === 'trial')
    );

    if (!activeSub) {
      return {
        hasAccess: false,
        reason: 'אין מנוי פעיל לחבילה זו עבור איש הקשר',
      };
    }

    if (requiredMinQuizScore && requiredMinQuizScore > 0) {
      const bestScore = Math.max(
        activeSub.quizScore || 0,
        ...quizResults
          .filter((q) => !q.packageId || q.packageId === packageId)
          .map((q) => q.score)
      );
      if (bestScore < requiredMinQuizScore) {
        return {
          hasAccess: false,
          reason: `נדרש ציון מבחן מינימלי של ${requiredMinQuizScore}% לפתיחת תוכן זה (ציון נוכחי: ${
            bestScore > 0 ? bestScore + '%' : 'טרם נבחן'
          })`,
          subscription: activeSub,
        };
      }
    }

    return {
      hasAccess: true,
      subscription: activeSub,
    };
  };

  const getAnalyticsSummary = async (): Promise<SubscriptionAnalyticsSummary> => {
    const [contacts, packages] = await Promise.all([getSubscriberContacts(), getPackages()]);
    const allSubs = contacts.flatMap((c) => c.contentSubscriptions || []);
    const allQuizzes = contacts.flatMap((c) => c.quizResults || []);

    const activeSubs = allSubs.filter((s) => s.status === 'active');
    const trialSubs = allSubs.filter((s) => s.status === 'trial');
    const pastDueSubs = allSubs.filter((s) => s.status === 'past_due');
    const canceledSubs = allSubs.filter((s) => s.status === 'canceled');

    const mrr = activeSubs.reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + (Number(s.finalAmount) || 0);
      if (s.billingCycle === 'annual') return sum + Math.round((Number(s.finalAmount) || 0) / 12);
      return sum;
    }, 0);

    const arr = mrr * 12;
    const totalCollectedRevenue = allSubs
      .filter((s) => s.status === 'active' || s.status === 'past_due')
      .reduce((sum, s) => sum + (Number(s.finalAmount) || 0), 0);

    const subscribersWithAnySub = contacts.filter(
      (c) => (c.contentSubscriptions || []).length > 0
    ).length;

    const averageRevenuePerUser =
      subscribersWithAnySub > 0 ? Math.round(totalCollectedRevenue / subscribersWithAnySub) : 0;

    const passedQuizzes = allQuizzes.filter((q) => q.passed).length;
    const quizPassRate =
      allQuizzes.length > 0 ? Math.round((passedQuizzes / allQuizzes.length) * 100) : 0;

    const revenueByPackage = packages.map((pkg) => {
      const pkgSubs = allSubs.filter(
        (s) => s.packageId === pkg.id && (s.status === 'active' || s.status === 'trial')
      );
      const monthlyRevenue = pkgSubs.reduce((sum, s) => {
        if (s.billingCycle === 'monthly') return sum + s.finalAmount;
        if (s.billingCycle === 'annual') return sum + Math.round(s.finalAmount / 12);
        return sum + s.finalAmount;
      }, 0);

      return {
        packageId: pkg.id,
        packageName: pkg.name,
        subscribersCount: pkgSubs.length,
        monthlyRevenue,
      };
    });

    return {
      totalSubscribers: allSubs.length,
      activeSubscribers: activeSubs.length,
      trialSubscribers: trialSubs.length,
      pastDueSubscribers: pastDueSubs.length,
      canceledSubscribers: canceledSubs.length,
      mrr,
      arr,
      totalCollectedRevenue,
      averageRevenuePerUser,
      quizPassRate,
      revenueByPackage,
    };
  };

  const updateSubscriberPermissions = async (
    contactId: string,
    permissions: Partial<SubscriberPermissions>,
    subscriberRole?: SubscriberUserRole
  ): Promise<boolean> => {
    if (!options.db) return false;
    const tId = resolveTenant();
    const contactRef = doc(options.db, resolveScopedPath(SYSTEM_COLLECTIONS.CONTACTS), contactId);

    const defaultPermissions: SubscriberPermissions = {
      canAccessLockedContent: true,
      canTakeQuizzes: true,
      canViewReceipts: true,
      canEditPages: false,
      canUseAiGenerators: false,
      canAccessAdminPanel: false,
    };

    const mergedPermissions: SubscriberPermissions = {
      ...defaultPermissions,
      ...permissions,
      canEditPages: false,
      canUseAiGenerators: false,
      canAccessAdminPanel: false,
    };

    const role = subscriberRole || 'content_subscriber';

    await setDoc(
      contactRef,
      {
        subscriberRole: role,
        permissions: mergedPermissions,
        isContentSubscriber: true,
        tags: ['מנוי תוכן', role],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Also update tenant-scoped user doc if exists
    try {
      const userRef = doc(options.db, 'tenants', tId, 'users', contactId);
      await setDoc(
        userRef,
        {
          role: 'subscriber',
          subscriberRole: role,
          permissions: mergedPermissions,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch {}

    eventBus.emit('crm:contact:updated', { id: contactId, subscriberRole: role, permissions: mergedPermissions });
    return true;
  };

  return {
    getSubscriberContacts,
    getContactSubscriptions,
    assignPackageToContact,
    updateContactSubscriptionStatus,
    removeContactSubscription,
    updateSubscriberPermissions,
    recordContactSubscriptionPayment,
    recordContactQuizSubmission,
    checkContactContentAccess,
    getPackages,
    savePackage,
    deletePackage,
    getCoupons,
    saveCoupon,
    deleteCoupon,
    validateCoupon,
    getQuizzes,
    saveQuiz,
    deleteQuiz,
    getAnalyticsSummary,
  };
}
