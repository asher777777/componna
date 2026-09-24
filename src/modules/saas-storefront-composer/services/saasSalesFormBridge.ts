import { SmartFormDefinition, FormStep } from '../../smart-form-builder/types';
import { CartItem, BillingInterval, TenantCustomerInfo, TenantRecord } from '../types';
import { StorefrontService } from './storefrontService';

export const SAAS_PROPOSAL_FORM_STORAGE_PREFIX = 'saas_proposal_form_';

export class SaasSalesFormBridge {
  /**
   * Generates a fully-structured SmartFormDefinition for a SaaS sales proposal & order form
   */
  static generateProposalFormDefinition(params: {
    cart: CartItem[];
    billingPlan: BillingInterval;
    totalMonthly: number;
    subdomain?: string;
    baseDomain: string;
    customerInfo?: Partial<TenantCustomerInfo>;
    customTitle?: string;
  }): SmartFormDefinition {
    const { cart, billingPlan, totalMonthly, subdomain = '', baseDomain, customerInfo, customTitle } = params;
    
    const formId = `proposal_${Date.now().toString(36)}`;
    const moduleNames = cart.map(c => c.name).join(', ') || 'חבילת מודולים מותאמת';
    const planText = billingPlan === 'annual' ? 'מנוי שנתי (חיסכון 20%)' : 'מנוי חודשי גמיש';
    const annualSavingsText = billingPlan === 'annual' ? ` (כולל 20% הנחה שנתית)` : '';

    const steps: FormStep[] = [
      // 1. Business Profile & Industry
      {
        id: 'step_industry',
        order: 1,
        title: 'מהו תחום הפעילות המרכזי של העסק?',
        subtitle: 'המידע יסייע לנו להתאים את תצורת המודולים והעמודים בצורה המדויקת ביותר',
        fieldType: 'single_choice',
        iconName: 'Building2',
        required: true,
        mappingKey: 'business_industry',
        options: [
          { id: 'opt_tech', label: 'הייטק, SaaS ושירותים דיגיטליים', value: 'tech_saas', description: 'דפי נחיתה מהירים, משפכי וידאו ו-CRM', iconName: 'Cpu' },
          { id: 'opt_services', label: 'נותני שירותים מקצועיים וייעוץ', value: 'professional_services', description: 'עורכי דין, יועצים, רואי חשבון וסוכנויות', iconName: 'Briefcase' },
          { id: 'opt_commerce', label: 'מסחר, מותגים וקמעונאות', value: 'ecommerce_retail', description: 'קטלוגים, גלריות מדיה וטפסי הזמנה', iconName: 'ShoppingBag' },
          { id: 'opt_education', label: 'קורסים, קהילות והדרכה', value: 'education_creators', description: 'נגני וידאו אינטראקטיביים וקהילות', iconName: 'GraduationCap' },
          { id: 'opt_other', label: 'ענף אחר / ארגון מיוחד', value: 'other', description: 'התאמה מלאה לפי מפרט אישי', iconName: 'Sparkles' },
        ],
      },

      // 2. Main Goal
      {
        id: 'step_goal',
        order: 2,
        title: 'מהו היעד המרכזי שתרצו להשיג עם המערכת?',
        subtitle: 'נתמקד באופטימיזציית ההמרה של הרכיבים לפי יעד זה',
        fieldType: 'single_choice',
        iconName: 'Target',
        required: true,
        mappingKey: 'primary_goal',
        options: [
          { id: 'goal_leads', label: 'מקסום איסוף לידים והמרות', value: 'max_leads', description: 'טפסים חכמים, חיבור ל-WhatsApp ודפי נחיתה', iconName: 'TrendingUp' },
          { id: 'goal_video', label: 'הפקת סרטונים ואווטארים שיווקיים', value: 'video_marketing', description: 'סטודיו הפקה מתקדם עם HeyGen ו-AI', iconName: 'Film' },
          { id: 'goal_crm', label: 'ניהול לקוחות 360 ואוטומציות', value: 'crm_scale', description: 'כרטיס לקוח מועשר, פילוחים וייצוא נתונים', iconName: 'Users' },
          { id: 'goal_full_platform', label: 'הקמת פלטפורמה שלמה ומותג דיגיטלי', value: 'full_suite', description: 'שילוב כלל הרכיבים תחת סאב-דומיין ייחודי', iconName: 'Crown' },
        ],
      },

      // 3. Subdomain Confirmation
      {
        id: 'step_subdomain',
        order: 3,
        title: 'אימות כתובת הסאב-דומיין המבוקשת',
        subtitle: `האתר והרכיבים יופעלו ישירות תחת הכתובת הייעודית ברשת`,
        fieldType: 'text',
        iconName: 'Globe',
        placeholder: subdomain || 'your-brand',
        defaultValue: subdomain,
        required: true,
        mappingKey: 'requested_subdomain',
        helperText: `הכתובת המלאה תהיה: [המילה שבחרת].${baseDomain}`,
      },

      // 4. Contact & Business Details
      {
        id: 'step_contact_name',
        order: 4,
        title: 'פרטי איש הקשר ושם העסק',
        subtitle: 'הפרטים יופיעו על גבי מסמך ההצעה וההסכם הרשמי',
        fieldType: 'text',
        iconName: 'User',
        placeholder: 'ישראל ישראלי | חברת דוגמה בע״מ',
        defaultValue: customerInfo?.fullName ? `${customerInfo.fullName} | ${customerInfo.businessName || ''}` : '',
        required: true,
        mappingKey: 'conta_name',
      },

      // 5. Phone & WhatsApp
      {
        id: 'step_phone',
        order: 5,
        title: 'מספר טלפון ו-WhatsApp לעדכונים',
        subtitle: 'למשלוח קישור גישה ישיר ואימות חשבון מנהל',
        fieldType: 'phone',
        iconName: 'Phone',
        placeholder: '050-1234567',
        defaultValue: customerInfo?.phone || '',
        required: true,
        mappingKey: 'conta_phone',
      },

      // 6. Email
      {
        id: 'step_email',
        order: 6,
        title: 'כתובת דוא״ל למשלוח מסמך ההסכם וההצעה',
        subtitle: 'העתק רשמי יישלח מיד עם אישור ההזמנה',
        fieldType: 'email',
        iconName: 'Mail',
        placeholder: 'name@business.co.il',
        defaultValue: customerInfo?.email || '',
        required: true,
        mappingKey: 'email',
      },

      // 7. Summary and Agreement Sign-Off
      {
        id: 'step_agreement',
        order: 7,
        title: `אישור הצעת המחיר (${totalMonthly} ₪ לחודש${annualSavingsText})`,
        subtitle: `חבילה נבחרת: ${moduleNames} | מסלול: ${planText}`,
        fieldType: 'single_choice',
        iconName: 'ShieldCheck',
        required: true,
        mappingKey: 'proposal_accepted',
        options: [
          { 
            id: 'agree_instant', 
            label: 'מאשר את הצעת המחיר ומעוניין בהפעלה מיידית', 
            value: 'confirmed_instant', 
            description: `הקצאה אוטומטית של סאב-דומיין ופתיחת סביבת העבודה`,
            iconName: 'CheckCircle2' 
          },
          { 
            id: 'agree_call', 
            label: 'מעוניין בשיחת ייעוץ קצרה עם מומחה לפני החיוב', 
            value: 'request_consultation', 
            description: 'נציג טכנולוגי יחזור אליך בהקדם לתיאום',
            iconName: 'PhoneCall' 
          },
        ],
      },
    ];

    return {
      id: formId,
      title: customTitle || `אישור הצעת מחיר (${totalMonthly} ₪ לחודש)`,
      slug: `proposal-${formId}`,
      description: `הצעת מחיר מותאמת אישית עבור סאב-דומיין ${subdomain ? `${subdomain}.${baseDomain}` : baseDomain} הכוללת ${cart.length} רכיבים פעילים.`,
      category: 'הצעות מחיר והזמנות SaaS',
      tone: 'executive_luxury',
      toneDescription: 'יוקרתי, עסקי, ברור ומזמין להמרה',
      status: 'published',
      isCrmSyncEnabled: true,
      crmDefaultTags: [
        'הצעת מחיר SaaS 📑',
        `מסלול: ${planText}`,
        ...cart.map(c => `רכיב: ${c.name}`),
      ],
      crmDefaultCommunity: 'הצעות מחיר ודיירי סאב-דומיין',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: {
        primaryColor: '#6366f1',
        accentColor: '#f59e0b',
        backgroundColor: '#09090b',
        textColor: '#ffffff',
        cardBackground: '#111116',
        borderRadius: 'xl',
        showProgressBar: true,
        showStepNumbers: true,
        luxuryBorder: true,
        buttonStyle: 'gradient',
        displayMode: 'standard_card',
      },
      completion: {
        title: 'הצעת המחיר אושרה בהצלחה! 🚀',
        subtitle: `סביבת העבודה שלך מוקמת כעת תחת הסאב-דומיין המבוקש. מסמך ההזמנה נשמר במערכת.`,
        iconName: 'Sparkles',
        showRedirectButton: true,
        redirectButtonText: 'מעבר לסיום התשלום והשקת הסאב-דומיין',
        redirectUrl: '/checkout',
        autoRedirectSeconds: 0,
      },
      steps,
    };
  }

  /**
   * Saves or caches a proposal form definition
   */
  static saveProposalForm(formDef: SmartFormDefinition): void {
    try {
      localStorage.setItem(`${SAAS_PROPOSAL_FORM_STORAGE_PREFIX}${formDef.id}`, JSON.stringify(formDef));
      localStorage.setItem('saas_latest_active_proposal_id', formDef.id);
    } catch (e) {
      console.warn('[SaasSalesFormBridge] Failed saving proposal form:', e);
    }
  }

  /**
   * Loads the latest proposal form or by ID
   */
  static loadProposalForm(formId?: string): SmartFormDefinition | null {
    try {
      const targetId = formId || localStorage.getItem('saas_latest_active_proposal_id');
      if (!targetId) return null;
      const raw = localStorage.getItem(`${SAAS_PROPOSAL_FORM_STORAGE_PREFIX}${targetId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  /**
   * Extracts customer & domain info from completed form submission answers
   */
  static extractTenantInfoFromSubmission(answers: Record<string, any>, fallbackSubdomain = ''): {
    customerInfo: TenantCustomerInfo;
    subdomain: string;
    industry: string;
    primaryGoal: string;
    isConfirmed: boolean;
  } {
    const rawName = (answers.conta_name || answers.step_contact_name || '').toString();
    const parts = rawName.split('|').map((s: string) => s.trim());
    const fullName = parts[0] || 'לקוח חדש';
    const businessName = parts[1] || parts[0] || 'עסק דיגיטלי';

    const phone = (answers.conta_phone || answers.step_phone || '').toString();
    const email = (answers.email || answers.step_email || '').toString();
    const subInput = (answers.requested_subdomain || answers.step_subdomain || fallbackSubdomain || '').toString();
    const cleanSub = subInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    const industry = (answers.business_industry || answers.step_industry || 'general').toString();
    const primaryGoal = (answers.primary_goal || answers.step_goal || 'growth').toString();
    const agreementAnswer = (answers.proposal_accepted || answers.step_agreement || '').toString();
    const isConfirmed = agreementAnswer === 'confirmed_instant';

    return {
      customerInfo: {
        fullName,
        businessName,
        phone,
        email,
      },
      subdomain: cleanSub || fallbackSubdomain,
      industry,
      primaryGoal,
      isConfirmed,
    };
  }
}
