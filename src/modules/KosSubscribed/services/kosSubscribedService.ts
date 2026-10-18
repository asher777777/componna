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
  PageBuilderContract,
  FormBuilderContract,
  KesherPaymentContract,
  BrandDna,
} from '../../../core/contracts';

/**
 * KosSubscribed Service Layer
 *
 * STRICT MONOPOLY COMPLIANCE (KOSUN26):
 * This service holds ZERO direct database collections and ZERO dummy/mock data.
 * All data operations (contacts, subscriptions, packages, coupons, quizzes, analytics)
 * are delegated 100% through the `CrmSubscriptionsContract` owned by `crm-analytics`
 * under the current subdomain tenant scope.
 */
export class KosSubscribedService {
  constructor(
    private getCrmContract: () => CrmSubscriptionsContract | null,
    private getPageBuilderContract?: () => PageBuilderContract | null,
    private getFormBuilderContract?: () => FormBuilderContract | null,
    private getKesherContract?: () => KesherPaymentContract | null
  ) {}

  private requireCrmContract(): CrmSubscriptionsContract {
    const contract = this.getCrmContract();
    if (!contract) {
      throw new Error('חוזה ה-CRM והאנליטיקה (crm-subscriptions) אינו זמין כעת.');
    }
    return contract;
  }

  async fetchDashboardBundle(): Promise<{
    contacts: CrmSubscriberContactRecord[];
    packages: SubscriptionPackageItem[];
    coupons: SubscriptionDiscountCoupon[];
    quizzes: SubscriptionQuizItem[];
    analytics: SubscriptionAnalyticsSummary;
  }> {
    const contract = this.getCrmContract();
    if (!contract) {
      return {
        contacts: [],
        packages: [],
        coupons: [],
        quizzes: [],
        analytics: {
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
        },
      };
    }

    const [contacts, packages, coupons, quizzes, analytics] = await Promise.all([
      contract.getSubscriberContacts(),
      contract.getPackages(),
      contract.getCoupons(),
      contract.getQuizzes(),
      contract.getAnalyticsSummary(),
    ]);

    return { contacts, packages, coupons, quizzes, analytics };
  }

  async assignPackageToContact(params: {
    contactId: string;
    packageId: string;
    discountCode?: string;
    customDiscountAmount?: number;
    status?: ContentSubscriptionStatus;
    paymentMethod?: string;
    transactionId?: string;
    receiptUrl?: string;
    notes?: string;
  }): Promise<ContactContentSubscription | null> {
    return this.requireCrmContract().assignPackageToContact(params);
  }

  async updateSubscriptionStatus(
    contactId: string,
    subscriptionId: string,
    updates: Partial<ContactContentSubscription>
  ): Promise<boolean> {
    return this.requireCrmContract().updateContactSubscriptionStatus(
      contactId,
      subscriptionId,
      updates
    );
  }

  async removeSubscription(contactId: string, subscriptionId: string): Promise<boolean> {
    return this.requireCrmContract().removeContactSubscription(contactId, subscriptionId);
  }

  async updateSubscriberPermissions(
    contactId: string,
    permissions: Partial<SubscriberPermissions>,
    subscriberRole?: SubscriberUserRole
  ): Promise<boolean> {
    const contract = this.requireCrmContract();
    if (contract.updateSubscriberPermissions) {
      return contract.updateSubscriberPermissions(contactId, permissions, subscriberRole);
    }
    return false;
  }

  async recordSubscriptionPayment(params: {
    contactId: string;
    subscriptionId: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    receiptUrl?: string;
  }): Promise<boolean> {
    return this.requireCrmContract().recordContactSubscriptionPayment(params);
  }

  async processLiveSubscriptionPayment(params: {
    contactId: string;
    contactName: string;
    contactPhone?: string;
    contactEmail?: string;
    subscriptionId?: string;
    packageId: string;
    packageName: string;
    amount: number;
    discountCode?: string;
  }): Promise<{ success: boolean; transactionId?: string; receiptUrl?: string; error?: string }> {
    const kesher = this.getKesherContract?.();
    if (!kesher || !kesher.isConfigured()) {
      return {
        success: false,
        error: 'מסוף הסליקה (Kesher) אינו מוגדר בסאב-דומיין זה.',
      };
    }

    const payRes = await kesher.processPayment({
      amount: params.amount,
      clientName: params.contactName,
      phone: params.contactPhone,
      email: params.contactEmail,
      paymentMethod: 'credit_card',
      description: `מנוי תוכן: ${params.packageName}`,
      documentType: 320,
    });

    if (!payRes.success) {
      return { success: false, error: payRes.error || 'שגיאה בביצוע הסליקה' };
    }

    const transactionId = payRes.transactionId;
    const receiptUrl = payRes.receiptUrl;

    if (params.subscriptionId) {
      await this.recordSubscriptionPayment({
        contactId: params.contactId,
        subscriptionId: params.subscriptionId,
        amount: params.amount,
        paymentMethod: 'כרטיס אשראי (Kesher)',
        transactionId,
        receiptUrl,
      });
    } else {
      await this.assignPackageToContact({
        contactId: params.contactId,
        packageId: params.packageId,
        discountCode: params.discountCode,
        status: 'active',
        paymentMethod: 'כרטיס אשראי (Kesher)',
        transactionId,
        receiptUrl,
      });
    }

    return { success: true, transactionId, receiptUrl };
  }

  async savePackage(
    pkg: Partial<SubscriptionPackageItem> & { name: string; price: number }
  ): Promise<SubscriptionPackageItem> {
    return this.requireCrmContract().savePackage(pkg);
  }

  async deletePackage(packageId: string): Promise<boolean> {
    return this.requireCrmContract().deletePackage(packageId);
  }

  async generatePaymentPageForPackage(
    pkg: SubscriptionPackageItem,
    brandDna?: BrandDna | null
  ): Promise<{ success: boolean; pageUrl: string; pageId: string; error?: string }> {
    const pageBuilder = this.getPageBuilderContract?.();
    if (!pageBuilder) {
      return {
        success: false,
        pageId: '',
        pageUrl: '',
        error: 'חוזה בונה העמודים (page-builder) אינו זמין כעת.',
      };
    }

    const cycleLabel =
      pkg.billingCycle === 'monthly'
        ? 'מנוי חודשי מתחדש'
        : pkg.billingCycle === 'annual'
        ? 'מנוי שנתי מוזל'
        : 'תשלום חד פעמי';

    const res = await pageBuilder.createPageFromProduct({
      product: {
        id: pkg.id,
        nameAndSlogan: `${pkg.name} — ₪${pkg.price} (${cycleLabel})`,
        shortDescription: pkg.description,
        longDescription: `${pkg.description}\n\n${pkg.features.map((f) => `• ${f}`).join('\n')}`,
        imageUrl: '',
        painPointSolved: pkg.description,
        competitiveAdvantage: pkg.features.join(', '),
        targetAudience: '',
      },
      brandDna: brandDna || null,
    });

    if (res.success) {
      await this.savePackage({
        ...pkg,
        linkedPaymentPageId: res.pageId,
        linkedPaymentPageSlug: res.slug,
        linkedPaymentPageUrl: res.publicUrl,
      });
      return {
        success: true,
        pageId: res.pageId,
        pageUrl: res.publicUrl,
      };
    }

    return {
      success: false,
      pageId: '',
      pageUrl: '',
      error: res.error || 'לא ניתן היה לייצר עמוד תשלום',
    };
  }

  async saveCoupon(
    coupon: Partial<SubscriptionDiscountCoupon> & { code: string; discountValue: number }
  ): Promise<SubscriptionDiscountCoupon> {
    return this.requireCrmContract().saveCoupon(coupon);
  }

  async deleteCoupon(couponId: string): Promise<boolean> {
    return this.requireCrmContract().deleteCoupon(couponId);
  }

  async validateCoupon(code: string, packageId?: string) {
    return this.requireCrmContract().validateCoupon(code, packageId);
  }

  async saveQuizAndSyncForm(
    quizInput: Partial<SubscriptionQuizItem> & { title: string }
  ): Promise<SubscriptionQuizItem> {
    const formBuilder = this.getFormBuilderContract?.();
    let ksfFormId = quizInput.ksfFormId;

    if (formBuilder?.saveForm && quizInput.questions && quizInput.questions.length > 0) {
      try {
        const ksfFields = [
          {
            label: 'שם מלא של הנבחן',
            type: 'text',
            map_to: 'kosun_crm_name',
            required: true,
            step: 1,
          },
          {
            label: 'טלפון נייד (לשמירת הציון בכרטיס איש הקשר)',
            type: 'tel',
            map_to: 'kosun_crm_phone',
            required: true,
            step: 1,
          },
          ...quizInput.questions.map((q, idx) => ({
            label: `${idx + 1}. ${q.questionText}`,
            type: 'select',
            map_to: `quiz_q_${idx + 1}`,
            options: q.options.join(','),
            required: true,
            step: idx + 2,
          })),
        ];

        const savedForm = await formBuilder.saveForm({
          id: ksfFormId || `ksf_quiz_${Date.now()}`,
          title: `טופס מבחן: ${quizInput.title}`,
          category: 'quiz',
          config: {
            enabled: true,
            form_type: 'standard',
            submit_button_text: 'הגש מבחן ובדוק ציון',
            save_to_crm: true,
            standard_success_message: 'המבחן הוגש בהצלחה והציון נשמר בכרטיס איש הקשר!',
            fields: ksfFields,
          },
        });
        if (savedForm?.id) {
          ksfFormId = savedForm.id;
        }
      } catch (err) {
        console.warn('[KosSubscribedService] KSF form sync notice:', err);
      }
    }

    const savedQuiz = await this.requireCrmContract().saveQuiz({
      ...quizInput,
      ksfFormId,
    });

    if (savedQuiz.packageId) {
      const packages = await this.requireCrmContract().getPackages();
      const targetPkg = packages.find((p) => p.id === savedQuiz.packageId);
      if (targetPkg) {
        await this.requireCrmContract().savePackage({
          ...targetPkg,
          linkedQuizFormId: savedQuiz.id,
          linkedQuizFormTitle: savedQuiz.title,
          passingScorePercent: savedQuiz.passingScore,
        });
      }
    }

    return savedQuiz;
  }

  async deleteQuiz(quizId: string): Promise<boolean> {
    return this.requireCrmContract().deleteQuiz(quizId);
  }

  async submitContactQuizAttempt(params: {
    contactId: string;
    quiz: SubscriptionQuizItem;
    selectedAnswers: Record<string, number>;
  }): Promise<ContactQuizSubmission | null> {
    let earnedPoints = 0;
    let totalPoints = 0;

    params.quiz.questions.forEach((q) => {
      const pts = Number(q.points) || 10;
      totalPoints += pts;
      if (params.selectedAnswers[q.id] === q.correctOptionIndex) {
        earnedPoints += pts;
      }
    });

    const scorePercent =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercent >= (params.quiz.passingScore || 75);

    const savedQuiz = await this.requireCrmContract().saveQuiz({
      ...params.quiz,
      submissionsCount: (params.quiz.submissionsCount || 0) + 1,
    });

    return this.requireCrmContract().recordContactQuizSubmission(params.contactId, {
      quizId: savedQuiz.id,
      quizTitle: savedQuiz.title,
      packageId: savedQuiz.packageId,
      score: scorePercent,
      passingScore: savedQuiz.passingScore,
      passed,
      answers: params.selectedAnswers,
    });
  }

  async checkContentAccess(
    contactId: string,
    packageId: string,
    requiredMinQuizScore?: number
  ) {
    return this.requireCrmContract().checkContactContentAccess(
      contactId,
      packageId,
      requiredMinQuizScore
    );
  }
}
