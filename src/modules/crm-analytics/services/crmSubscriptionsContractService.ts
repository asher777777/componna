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
  SYSTEM_COLLECTIONS,
  KOSUN_CRM_FIELD_KEYS,
} from '../../../core/contracts';
import { getTenantCollectionPath, getTenantStorageKey, resolveCurrentTenantId } from '../../../core/tenant/tenantResolver';
import { eventBus } from '../../../core/bridge/EventBus';
import { generateMockCrmData } from './crmAnalyticsService';

const DEFAULT_PACKAGES: SubscriptionPackageItem[] = [
  {
    id: 'pkg_vip_monthly',
    name: 'מסלול פרימיום - גישה מלאה לתוכן (חודשי)',
    description: 'גישה מלאה לכל ספריית הוידאו, מאמרי העומק, הקורסים הדיגיטליים ומבחני ההסמכה של הארגון.',
    price: 149,
    originalPrice: 199,
    discountPercent: 25,
    billingCycle: 'monthly',
    trialDays: 7,
    features: [
      'גישה חופשית לכל שיעורי הוידאו והקורסים',
      'פתיחת מאמרי עומק ותכנים נעולים למנויים',
      'גישה למבחני הסמכה ותעודת סיום דיגיטלית',
      'תמיכה ישירה בוואטסאפ ובמייל',
    ],
    contentItems: [
      {
        id: 'cnt_1',
        title: 'קורס הדגל: אוטומציה וצמיחה עסקית ב-2026',
        type: 'course',
        description: 'סדרת פרקים מעשית להטמעת מערכות חכמות בארגון.',
        previewText: 'פרק 1 פתוח לצפייה: מבוא לארכיטקטורת צמיחה ומנויים...',
        lockedBodyText: 'תוכן מלא למנויים פעילים: 12 שעות הדרכה מוקלטות, קבצי עבודה להורדה וליווי מעשי צעד אחר צעד.',
        requiredMinQuizScore: 70,
      },
      {
        id: 'cnt_2',
        title: 'מאסטרקלאס: בניית משפכי תוכן ממירים',
        type: 'video',
        description: 'הקלטת סדנה מלאה לבניית חווית לקוח סגורה.',
        previewText: 'תקציר הסדנה: כיצד להפוך מבקרים למנויים משלמים קבועים...',
        lockedBodyText: 'הקלטה מלאה באיכות 4K + מצגת הסדנה ותבניות מוכנות להעתקה.',
      },
    ],
    passingScorePercent: 75,
    badgeText: 'הנמכר ביותר',
    isPopular: true,
    isActive: true,
    subscribersCount: 3,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'pkg_pro_annual',
    name: 'מסלול שנתי VIP + ליווי והסמכה',
    description: 'מנוי שנתי מוזל הכולל גישה לכלל התכנים, המבחנים, הקהילה הסגורה ומפגשי מנטורינג חודשיים.',
    price: 1290,
    originalPrice: 1788,
    discountPercent: 28,
    billingCycle: 'annual',
    trialDays: 14,
    features: [
      'כל הטבות מסלול הפרימיום החודשי',
      'חיסכון של מעל 28% בתשלום שנתי',
      'פתיחת כל מבחני ההסמכה המתקדמים',
      'גישה להורדת חומרי עזר ותבניות פרימיום',
    ],
    contentItems: [
      {
        id: 'cnt_3',
        title: 'ספריית תבניות ופרוטוקולים למנויי VIP',
        type: 'download',
        description: 'ערכת מסמכים, תסריטים ונהלים מוכנים להטמעה מידית.',
        previewText: 'רשימת הקבצים בערכה: תסריטי מכירה, אוטומציות וואטסאפ ודפי נחיתה...',
        lockedBodyText: 'קישורי הורדה ישירים לכל 25 התבניות והמדריכים המקצועיים של המערכת.',
        requiredMinQuizScore: 80,
      },
    ],
    passingScorePercent: 80,
    badgeText: 'חיסכון מקסימלי',
    isPopular: false,
    isActive: true,
    subscribersCount: 2,
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'pkg_starter_monthly',
    name: 'חבילת בסיס - תכני מבוא ומבחני רמה',
    description: 'חבילה חודשית נגישה לצפייה בתכני הבסיס וביצוע מבחני הערכה תקופתיים.',
    price: 69,
    originalPrice: 89,
    discountPercent: 22,
    billingCycle: 'monthly',
    trialDays: 0,
    features: [
      'גישה למאמרי המבוא ושיעורי הבסיס',
      'אפשרות לגשת למבחן רמה בסיסי',
      'עדכונים שוטפים במייל',
    ],
    contentItems: [
      {
        id: 'cnt_4',
        title: 'מדריך יסודות: צעדים ראשונים במערכת',
        type: 'article',
        description: 'מאמר מקיף להתחלה מהירה ונכונה.',
        previewText: 'הקדמה: 3 העקרונות החשובים ביותר להצלחה...',
        lockedBodyText: 'המאמר המלא כולל דוגמאות מעשיות, צילומי מסך ורשימת תיוג לביצוע.',
      },
    ],
    passingScorePercent: 60,
    isPopular: false,
    isActive: true,
    subscribersCount: 1,
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
];

const DEFAULT_COUPONS: SubscriptionDiscountCoupon[] = [
  {
    id: 'cpn_welcome20',
    code: 'WELCOME20',
    description: '20% הנחה למצטרפים חדשים לכל חבילות התוכן',
    discountType: 'percentage',
    discountValue: 20,
    applicablePackageIds: [],
    maxUses: 100,
    usedCount: 14,
    validUntil: '2027-12-31',
    isActive: true,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'cpn_vip50',
    code: 'VIP50',
    description: '50 ₪ הנחה קבועה לשידוך איש קשר ממועדון הלקוחות',
    discountType: 'fixed',
    discountValue: 50,
    applicablePackageIds: ['pkg_vip_monthly', 'pkg_pro_annual'],
    maxUses: 50,
    usedCount: 6,
    validUntil: '2027-06-30',
    isActive: true,
    createdAt: '2026-09-05T10:00:00.000Z',
  },
];

const DEFAULT_QUIZZES: SubscriptionQuizItem[] = [
  {
    id: 'quiz_cert_1',
    title: 'מבחן הסמכה: שליטה בתכני הפרימיום',
    description: 'מבחן שלבי לבדיקת הבנת החומר ופתיחת תעודת הסמכה ותכני מתקדמים למנויים.',
    packageId: 'pkg_vip_monthly',
    packageName: 'מסלול פרימיום - גישה מלאה לתוכן (חודשי)',
    passingScore: 75,
    questions: [
      {
        id: 'q1',
        questionText: 'מהו היתרון המרכזי של ניהול מנויי תוכן תחת כרטיס איש הקשר ב-CRM?',
        options: [
          'ריכוז של 100% מנתוני התשלומים, החבילותוציוני המבחנים במקום אחד ללא כפילויות',
          'שמירת קבצים בתיקיות נפרדות ללא קשר ללקוח',
          'חסימת גישה למנהל הסאב-דומיין',
          'אין צורך במעקב תשלומים כלל',
        ],
        correctOptionIndex: 0,
        points: 35,
      },
      {
        id: 'q2',
        questionText: 'כיצד מתבצע שידוך חבילת מנוי לאיש קשר בסאב-דומיין?',
        options: [
          'באמצעות בחירת איש קשר, שיוך חבילה, הזנת קופון הנחה במידת הצורך ויצירת קישור לתשלום',
          'רק על ידי כתיבת קוד ידני בשרת',
          'ללא חיבור למערכת הסליקה',
          'רק דרך טננט המאסטר הראשי',
        ],
        correctOptionIndex: 0,
        points: 35,
      },
      {
        id: 'q3',
        questionText: 'מה קורה כאשר מנוי עובר בהצלחה את ציון הסף במבחן החבילה?',
        options: [
          'הציון מתועד בכרטיס איש הקשר ב-CRM ונפתחת לו הגישה לתכנים המתקדמים בחבילה',
          'המנוי מתבטל אוטומטית',
          'נמחקת היסטוריית התשלומים',
          'הטופס נסגר ללא תיעוד',
        ],
        correctOptionIndex: 0,
        points: 30,
      },
    ],
    submissionsCount: 4,
    createdAt: '2026-09-08T10:00:00.000Z',
    updatedAt: '2026-09-16T10:00:00.000Z',
  },
];

function readLocalTenantJson<T>(tenantId: string, keySuffix: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const storageKey = getTenantStorageKey(keySuffix, tenantId);
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {}
  return fallback;
}

function writeLocalTenantJson<T>(tenantId: string, keySuffix: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const storageKey = getTenantStorageKey(keySuffix, tenantId);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {}
}

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

  // Seed default subscriptions on mock contacts if local cache is empty
  const ensureDefaultSubscriberContacts = (): CrmSubscriberContactRecord[] => {
    const tId = resolveTenant();
    const cached = readLocalTenantJson<CrmSubscriberContactRecord[] | null>(
      tId,
      'crm_subscriber_contacts_v1',
      null
    );
    if (cached && cached.length > 0) {
      return cached;
    }

    const baseMocks = generateMockCrmData();
    const enriched: CrmSubscriberContactRecord[] = baseMocks.map((c, idx) => {
      const id = c.id || `c_${idx + 1}`;
      const name = c.kosun_crm_name || c.conta_name || 'איש קשר';
      const phone = c.kosun_crm_phone || c.conta_phone || '';
      const email = c.kosun_crm_email || c.email || '';

      let contentSubscriptions: ContactContentSubscription[] =
        c.kosun_crm_content_subscriptions || c.content_subscriptions || [];
      let quizResults: ContactQuizSubmission[] =
        c.kosun_crm_quiz_results || c.quiz_results || [];

      if (idx === 0 && contentSubscriptions.length === 0) {
        contentSubscriptions = [
          {
            id: 'sub_init_1',
            contactId: id,
            contactName: name,
            contactEmail: email,
            contactPhone: phone,
            packageId: 'pkg_vip_monthly',
            packageName: 'מסלול פרימיום - גישה מלאה לתוכן (חודשי)',
            billingCycle: 'monthly',
            basePrice: 199,
            discountCode: 'VIP50',
            discountAmount: 50,
            finalAmount: 149,
            status: 'active',
            startDate: '2026-09-01',
            nextBillingDate: '2026-11-01',
            paymentMethod: 'כרטיס אשראי (4580)',
            lastTransactionId: 'KSH-99201',
            quizPassed: true,
            quizScore: 95,
            notes: 'מנוי VIP פעיל עם גישה לכל הקורסים',
            createdAt: '2026-09-01T10:00:00.000Z',
            updatedAt: '2026-10-01T10:00:00.000Z',
          },
        ];
        quizResults = [
          {
            id: 'qr_init_1',
            quizId: 'quiz_cert_1',
            quizTitle: 'מבחן הסמכה: שליטה בתכני הפרימיום',
            packageId: 'pkg_vip_monthly',
            score: 95,
            passingScore: 75,
            passed: true,
            submittedAt: '2026-09-12T14:30:00.000Z',
          },
        ];
      } else if (idx === 1 && contentSubscriptions.length === 0) {
        contentSubscriptions = [
          {
            id: 'sub_init_2',
            contactId: id,
            contactName: name,
            contactEmail: email,
            contactPhone: phone,
            packageId: 'pkg_pro_annual',
            packageName: 'מסלול שנתי VIP + ליווי והסמכה',
            billingCycle: 'annual',
            basePrice: 1788,
            discountCode: 'WELCOME20',
            discountAmount: 498,
            finalAmount: 1290,
            status: 'active',
            startDate: '2026-08-15',
            nextBillingDate: '2027-08-15',
            paymentMethod: 'הוראת קבע אשראי',
            lastTransactionId: 'KSH-88412',
            quizPassed: true,
            quizScore: 88,
            createdAt: '2026-08-15T09:00:00.000Z',
            updatedAt: '2026-08-15T09:00:00.000Z',
          },
        ];
        quizResults = [
          {
            id: 'qr_init_2',
            quizId: 'quiz_cert_1',
            quizTitle: 'מבחן הסמכה: שליטה בתכני הפרימיום',
            packageId: 'pkg_pro_annual',
            score: 88,
            passingScore: 80,
            passed: true,
            submittedAt: '2026-08-20T11:15:00.000Z',
          },
        ];
      } else if (idx === 2 && contentSubscriptions.length === 0) {
        contentSubscriptions = [
          {
            id: 'sub_init_3',
            contactId: id,
            contactName: name,
            contactEmail: email,
            contactPhone: phone,
            packageId: 'pkg_vip_monthly',
            packageName: 'מסלול פרימיום - גישה מלאה לתוכן (חודשי)',
            billingCycle: 'monthly',
            basePrice: 149,
            discountAmount: 0,
            finalAmount: 149,
            status: 'past_due',
            startDate: '2026-07-10',
            nextBillingDate: '2026-10-10',
            paymentMethod: 'ביט / אשראי',
            quizPassed: false,
            quizScore: 60,
            notes: 'ממתין לחידוש אמצעי תשלום',
            createdAt: '2026-07-10T12:00:00.000Z',
            updatedAt: '2026-10-10T12:00:00.000Z',
          },
        ];
      }

      const subSpent = contentSubscriptions.reduce((acc, s) => acc + (Number(s.finalAmount) || 0), 0);

      return {
        id,
        name,
        phone,
        email,
        company: c.kosun_crm_company || c.company_name || '',
        city: c.kosun_crm_city || c.mh_crm_city || '',
        tags: c.kosun_crm_tags || c.tags || [],
        totalSpent: Math.max(Number(c.total_spent || 0), subSpent),
        contentSubscriptions,
        quizResults,
        lastPaymentDate: contentSubscriptions[0]?.startDate || c.last_order_date,
        rawContact: c as Record<string, any>,
      };
    });

    writeLocalTenantJson(tId, 'crm_subscriber_contacts_v1', enriched);
    return enriched;
  };

  const getPackages = async (): Promise<SubscriptionPackageItem[]> => {
    const tId = resolveTenant();
    const localPackages = readLocalTenantJson<SubscriptionPackageItem[]>(
      tId,
      'crm_sub_packages_v1',
      DEFAULT_PACKAGES
    );

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_PACKAGES);
        const snap = await getDocs(collection(options.db, colPath));
        if (!snap.empty) {
          const items: SubscriptionPackageItem[] = [];
          snap.forEach((d) => items.push({ ...(d.data() as SubscriptionPackageItem), id: d.id }));
          writeLocalTenantJson(tId, 'crm_sub_packages_v1', items);
          return items;
        }
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore getPackages notice:', err);
      }
    }

    return localPackages;
  };

  const savePackage = async (
    pkgInput: Partial<SubscriptionPackageItem> & { name: string; price: number }
  ): Promise<SubscriptionPackageItem> => {
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
      originalPrice: pkgInput.originalPrice !== undefined ? Number(pkgInput.originalPrice) : existing?.originalPrice,
      discountPercent: pkgInput.discountPercent !== undefined ? Number(pkgInput.discountPercent) : existing?.discountPercent,
      billingCycle: pkgInput.billingCycle || existing?.billingCycle || 'monthly',
      trialDays: pkgInput.trialDays !== undefined ? Number(pkgInput.trialDays) : (existing?.trialDays ?? 0),
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

    const nextList = existing
      ? current.map((p) => (p.id === id ? saved : p))
      : [saved, ...current];
    writeLocalTenantJson(tId, 'crm_sub_packages_v1', nextList);

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_PACKAGES);
        await setDoc(doc(options.db, colPath, id), saved, { merge: true });
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore savePackage notice:', err);
      }
    }

    eventBus.emit('crm:subscription:package_saved', {
      packageId: id,
      name: saved.name,
      tenantId: tId,
    });

    return saved;
  };

  const deletePackage = async (packageId: string): Promise<boolean> => {
    const tId = resolveTenant();
    const current = await getPackages();
    const nextList = current.filter((p) => p.id !== packageId);
    writeLocalTenantJson(tId, 'crm_sub_packages_v1', nextList);

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_PACKAGES);
        await deleteDoc(doc(options.db, colPath, packageId));
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore deletePackage notice:', err);
      }
    }
    return true;
  };

  const getCoupons = async (): Promise<SubscriptionDiscountCoupon[]> => {
    const tId = resolveTenant();
    const localCoupons = readLocalTenantJson<SubscriptionDiscountCoupon[]>(
      tId,
      'crm_sub_coupons_v1',
      DEFAULT_COUPONS
    );

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_COUPONS);
        const snap = await getDocs(collection(options.db, colPath));
        if (!snap.empty) {
          const items: SubscriptionDiscountCoupon[] = [];
          snap.forEach((d) => items.push({ ...(d.data() as SubscriptionDiscountCoupon), id: d.id }));
          writeLocalTenantJson(tId, 'crm_sub_coupons_v1', items);
          return items;
        }
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore getCoupons notice:', err);
      }
    }

    return localCoupons;
  };

  const saveCoupon = async (
    couponInput: Partial<SubscriptionDiscountCoupon> & { code: string; discountValue: number }
  ): Promise<SubscriptionDiscountCoupon> => {
    const tId = resolveTenant();
    const current = await getCoupons();
    const id = couponInput.id || `cpn_${Date.now()}`;
    const existing = current.find((c) => c.id === id);

    const saved: SubscriptionDiscountCoupon = {
      id,
      code: couponInput.code.trim().toUpperCase(),
      description: couponInput.description ?? existing?.description ?? '',
      discountType: couponInput.discountType || existing?.discountType || 'percentage',
      discountValue: Number(couponInput.discountValue),
      applicablePackageIds: couponInput.applicablePackageIds || existing?.applicablePackageIds || [],
      maxUses: couponInput.maxUses !== undefined ? Number(couponInput.maxUses) : existing?.maxUses,
      usedCount: couponInput.usedCount ?? existing?.usedCount ?? 0,
      validUntil: couponInput.validUntil ?? existing?.validUntil,
      isActive: couponInput.isActive ?? existing?.isActive ?? true,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    const nextList = existing
      ? current.map((c) => (c.id === id ? saved : c))
      : [saved, ...current];
    writeLocalTenantJson(tId, 'crm_sub_coupons_v1', nextList);

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_COUPONS);
        await setDoc(doc(options.db, colPath, id), saved, { merge: true });
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore saveCoupon notice:', err);
      }
    }

    return saved;
  };

  const deleteCoupon = async (couponId: string): Promise<boolean> => {
    const tId = resolveTenant();
    const current = await getCoupons();
    const nextList = current.filter((c) => c.id !== couponId);
    writeLocalTenantJson(tId, 'crm_sub_coupons_v1', nextList);

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_COUPONS);
        await deleteDoc(doc(options.db, colPath, couponId));
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore deleteCoupon notice:', err);
      }
    }
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
    const tId = resolveTenant();
    const localQuizzes = readLocalTenantJson<SubscriptionQuizItem[]>(
      tId,
      'crm_sub_quizzes_v1',
      DEFAULT_QUIZZES
    );

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_QUIZZES);
        const snap = await getDocs(collection(options.db, colPath));
        if (!snap.empty) {
          const items: SubscriptionQuizItem[] = [];
          snap.forEach((d) => items.push({ ...(d.data() as SubscriptionQuizItem), id: d.id }));
          writeLocalTenantJson(tId, 'crm_sub_quizzes_v1', items);
          return items;
        }
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore getQuizzes notice:', err);
      }
    }

    return localQuizzes;
  };

  const saveQuiz = async (
    quizInput: Partial<SubscriptionQuizItem> & { title: string }
  ): Promise<SubscriptionQuizItem> => {
    const tId = resolveTenant();
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

    const nextList = existing
      ? current.map((q) => (q.id === id ? saved : q))
      : [saved, ...current];
    writeLocalTenantJson(tId, 'crm_sub_quizzes_v1', nextList);

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_QUIZZES);
        await setDoc(doc(options.db, colPath, id), saved, { merge: true });
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore saveQuiz notice:', err);
      }
    }

    return saved;
  };

  const deleteQuiz = async (quizId: string): Promise<boolean> => {
    const tId = resolveTenant();
    const current = await getQuizzes();
    const nextList = current.filter((q) => q.id !== quizId);
    writeLocalTenantJson(tId, 'crm_sub_quizzes_v1', nextList);

    if (options.db) {
      try {
        const colPath = resolveScopedPath(SYSTEM_COLLECTIONS.CRM_SUBSCRIPTION_QUIZZES);
        await deleteDoc(doc(options.db, colPath, quizId));
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore deleteQuiz notice:', err);
      }
    }
    return true;
  };

  const getSubscriberContacts = async (): Promise<CrmSubscriberContactRecord[]> => {
    const tId = resolveTenant();
    const localContacts = ensureDefaultSubscriberContacts();

    if (options.db) {
      try {
        const contactsColPath = resolveScopedPath(SYSTEM_COLLECTIONS.CONTACTS);
        const snap = await getDocs(collection(options.db, contactsColPath));
        if (!snap.empty) {
          const mapById = new Map<string, CrmSubscriberContactRecord>();
          localContacts.forEach((lc) => mapById.set(lc.id, lc));

          snap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d.status === 'trashed') return;
            const id = docSnap.id;
            const existingLocal = mapById.get(id);
            const name = d[KOSUN_CRM_FIELD_KEYS.NAME] || d.conta_name || existingLocal?.name || 'איש קשר';
            const phone = d[KOSUN_CRM_FIELD_KEYS.PHONE] || d.conta_phone || existingLocal?.phone || '';
            const email = d[KOSUN_CRM_FIELD_KEYS.EMAIL] || d.email || existingLocal?.email || '';
            const contentSubscriptions: ContactContentSubscription[] =
              d[KOSUN_CRM_FIELD_KEYS.CONTENT_SUBSCRIPTIONS] ||
              d.content_subscriptions ||
              existingLocal?.contentSubscriptions ||
              [];
            const quizResults: ContactQuizSubmission[] =
              d[KOSUN_CRM_FIELD_KEYS.QUIZ_RESULTS] ||
              d.quiz_results ||
              existingLocal?.quizResults ||
              [];
            const subSpent = contentSubscriptions.reduce(
              (acc, s) => acc + (Number(s.finalAmount) || 0),
              0
            );

            mapById.set(id, {
              id,
              name,
              phone,
              email,
              company: d[KOSUN_CRM_FIELD_KEYS.COMPANY] || d.company_name || existingLocal?.company || '',
              city: d[KOSUN_CRM_FIELD_KEYS.CITY] || d.mh_crm_city || existingLocal?.city || '',
              tags: d[KOSUN_CRM_FIELD_KEYS.TAGS] || d.tags || existingLocal?.tags || [],
              totalSpent: Math.max(Number(d.total_spent || d[KOSUN_CRM_FIELD_KEYS.TOTAL_SPENT] || 0), subSpent),
              contentSubscriptions,
              quizResults,
              lastPaymentDate: contentSubscriptions[0]?.startDate || d.last_order_date,
              rawContact: d,
            });
          });

          const merged = Array.from(mapById.values());
          writeLocalTenantJson(tId, 'crm_subscriber_contacts_v1', merged);
          return merged;
        }
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore getSubscriberContacts notice:', err);
      }
    }

    return localContacts;
  };

  const persistContactSubscriptionsToCrm = async (
    contactId: string,
    subscriptions: ContactContentSubscription[],
    quizResults: ContactQuizSubmission[],
    extraTags?: string[],
    addedSpent?: number
  ) => {
    const tId = resolveTenant();
    const list = await getSubscriberContacts();
    const updatedList = list.map((c) => {
      if (c.id !== contactId) return c;
      const mergedTags = extraTags
        ? Array.from(new Set([...(c.tags || []), ...extraTags]))
        : c.tags;
      return {
        ...c,
        tags: mergedTags,
        totalSpent: addedSpent ? c.totalSpent + addedSpent : c.totalSpent,
        contentSubscriptions: subscriptions,
        quizResults,
      };
    });
    writeLocalTenantJson(tId, 'crm_subscriber_contacts_v1', updatedList);

    if (options.db) {
      try {
        const contactsColPath = resolveScopedPath(SYSTEM_COLLECTIONS.CONTACTS);
        const ref = doc(options.db, contactsColPath, contactId);
        const snap = await getDoc(ref);
        const existingData = snap.exists() ? snap.data() : {};
        const currentTags: string[] = existingData.tags || existingData[KOSUN_CRM_FIELD_KEYS.TAGS] || [];
        const nextTags = extraTags
          ? Array.from(new Set([...currentTags, ...extraTags]))
          : currentTags;
        const currentSpent = Number(existingData.total_spent || existingData[KOSUN_CRM_FIELD_KEYS.TOTAL_SPENT] || 0);
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
      } catch (err) {
        console.warn('[CrmSubscriptionsContract] Firestore persistContactSubscriptionsToCrm notice:', err);
      }
    }

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
    let appliedCode = params.discountCode?.trim().toUpperCase();

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
      paymentMethod: params.paymentMethod || 'אשראי / הוראת קבע',
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
        lastTransactionId: params.transactionId || `TXN-${Date.now()}`,
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
          reason: `נדרש ציון מבחן מינימלי של ${requiredMinQuizScore}% לפתיחת תוכן זה (ציון נוכחי: ${bestScore > 0 ? bestScore + '%' : 'טרם נבחן'})`,
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
      allQuizzes.length > 0 ? Math.round((passedQuizzes / allQuizzes.length) * 100) : 100;

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

  return {
    getSubscriberContacts,
    getContactSubscriptions,
    assignPackageToContact,
    updateContactSubscriptionStatus,
    removeContactSubscription,
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
