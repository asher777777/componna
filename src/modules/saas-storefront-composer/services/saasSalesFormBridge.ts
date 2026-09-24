import { SmartFormDefinition, FormStep } from '../../smart-form-builder/types';
import { CartItem, BillingInterval, TenantCustomerInfo, TenantRecord } from '../types';
import { StorefrontService } from './storefrontService';

export const SAAS_PROPOSAL_FORM_STORAGE_PREFIX = 'saas_proposal_form_';

/**
 * Specialized discovery question layers per module.
 * Psychologically engineered to convey authority, increase urgency, and extract precise client requirements.
 */
const MODULE_SPECIFIC_DISCOVERY_STEPS: Record<string, FormStep[]> = {
  // 1. Page Builder / Landing Pages
  'page-builder': [
    {
      id: 'step_page_builder_style',
      order: 10,
      title: 'מהו הסגנון והאווירה העיצובית המובילה של עמודי הנחיתה?',
      subtitle: 'עורך הדפים יותאם מראש עם פלטת צבעים, טיפוגרפיה ורכיבי המרה תואמים',
      fieldType: 'single_choice',
      iconName: 'Layout',
      required: true,
      mappingKey: 'page_builder_visual_style',
      options: [
        { 
          id: 'style_luxury_dark', 
          label: 'יוקרתי וסמכותי (Luxury Dark & Gold)', 
          value: 'luxury_dark', 
          description: 'רקעים עמוקים, ניגודיות אלגנטית ומראה פרימיום סוחף', 
          iconName: 'Crown' 
        },
        { 
          id: 'style_clean_tech', 
          label: 'הייטק נקי ומודרני (Minimalist Clean Tech)', 
          value: 'clean_tech', 
          description: 'עיצוב מינימליסטי, גווני כחול/אפור, ממוקד אמון והמרות מהירות', 
          iconName: 'Sparkles' 
        },
        { 
          id: 'style_dynamic_action', 
          label: 'אנרגטי ודינמי (High-Converting Sales Focus)', 
          value: 'dynamic_action', 
          description: 'כותרות ענק, כפתורי הנעה לפעולה בולטים ודגש על דחיפות', 
          iconName: 'Zap' 
        },
        { 
          id: 'style_warm_consulting', 
          label: 'חם, אנושי ומזמין (Warm Consulting & Services)', 
          value: 'warm_consulting', 
          description: 'גוונים רכים, תמונות מותג ודגש על ליווי אישי ומקצועי', 
          iconName: 'Heart' 
        },
      ],
    },
    {
      id: 'step_page_builder_goal',
      order: 11,
      title: 'מהי מטרת ההמרה הראשית של דף הנחיתה?',
      subtitle: 'נגדיר מראש את המשפך והטפסים שישולבו בעמוד',
      fieldType: 'single_choice',
      iconName: 'Target',
      required: true,
      mappingKey: 'page_builder_conversion_goal',
      options: [
        { 
          id: 'goal_qual_leads', 
          label: 'איסוף לידים מסוננים ואיכותיים (Multi-Step Quiz)', 
          value: 'qualified_leads', 
          description: 'שאלון סינון חכם שמעביר רק לידים חמים ובשלים לסגירה', 
          iconName: 'Sliders' 
        },
        { 
          id: 'goal_direct_whatsapp', 
          label: 'מעבר ישיר לשיחת סגירה ב-WhatsApp', 
          value: 'direct_whatsapp', 
          description: 'כפתור מהיר הפותח שיחה אישית עם פרטי המוצר/השירות', 
          iconName: 'MessageSquare' 
        },
        { 
          id: 'goal_online_checkout', 
          label: 'רכישה אונליין וסליקה מיידית (Bit / אשראי)', 
          value: 'direct_purchase', 
          description: 'טופס רכישה מאובטח עם חשבונית אוטומטית כחוק', 
          iconName: 'CreditCard' 
        },
        { 
          id: 'goal_calendar_booking', 
          label: 'תיאום פגישות אוטומטי ביומן (Calendar Booking)', 
          value: 'calendar_booking', 
          description: 'חיבור ליומן ותיאום שיחת ייעוץ בלחיצת כפתור', 
          iconName: 'Calendar' 
        },
      ],
    },
  ],

  // 2. CRM & Analytics
  'crm-analytics': [
    {
      id: 'step_crm_scale',
      order: 12,
      title: 'מהו היקף מאגר הלקוחות וקצב כניסת הלידים בעסק?',
      subtitle: 'נכין עבורך את מבנה הטבלאות, הסינונים והאינדקסים המותאמים ביותר',
      fieldType: 'single_choice',
      iconName: 'TrendingUp',
      required: true,
      mappingKey: 'crm_contacts_scale',
      options: [
        { 
          id: 'scale_starter', 
          label: 'עד 1,000 אנשי קשר (עסק צומח)', 
          value: 'under_1k', 
          description: 'מעקב פשוט, כרטיס לקוח מרוכז ומענה מהיר לכל פניה', 
          iconName: 'User' 
        },
        { 
          id: 'scale_growth', 
          label: '1,000 עד 10,000 אנשי קשר (עסק פעיל)', 
          value: '1k_10k', 
          description: 'סגמנטציה חכמה לפי תגיות, ניהול סטטוסים ודוחות המרה', 
          iconName: 'Users' 
        },
        { 
          id: 'scale_enterprise', 
          label: 'מעל 10,000 אנשי קשר ומאגרים גדולים (Scale & Enterprise)', 
          value: '10k_plus', 
          description: 'ייצוא וייבוא מאקסל, פילוחים מורכבים ודשבורד מנהלים מתקדם', 
          iconName: 'ShieldCheck' 
        },
      ],
    },
    {
      id: 'step_crm_lead_sources',
      order: 13,
      title: 'מהם מקורות התנועה והלידים העיקריים שלכם?',
      subtitle: 'נגדיר תיוג אוטומטי למקורות אלה בכרטיס הלקוח',
      fieldType: 'single_choice',
      iconName: 'Users',
      required: true,
      mappingKey: 'crm_lead_channels',
      options: [
        { 
          id: 'src_social_ads', 
          label: 'קמפיינים ממומנים (Facebook, Instagram, TikTok)', 
          value: 'paid_social', 
          description: 'קליטה ישירה מדפי נחיתה ומשפכים שיווקיים', 
          iconName: 'Zap' 
        },
        { 
          id: 'src_google_search', 
          label: 'חיפוש גוגל וקידום אורגני (Google Ads / SEO)', 
          value: 'google_search', 
          description: 'תנועת חיפוש ממוקדת של לקוחות שמחפשים פתרון מיידי', 
          iconName: 'Globe' 
        },
        { 
          id: 'src_direct_whatsapp', 
          label: 'פניות ישירות בוואטסאפ והמלצות מפה לאוזן', 
          value: 'direct_referrals', 
          description: 'קשר אישי מבוסס אמון וסגירות טלפוניות/דיגיטליות', 
          iconName: 'MessageSquare' 
        },
        { 
          id: 'src_omnichannel', 
          label: 'משולב רב-ערוצי (Omnichannel Funnel)', 
          value: 'omnichannel', 
          description: 'שילוב כלל הערוצים עם ייחוס המרות (Attribution) מדויק', 
          iconName: 'Layers' 
        },
      ],
    },
  ],

  // 3. AI Video Producer Studio
  'video-producer-studio': [
    {
      id: 'step_video_studio_type',
      order: 14,
      title: 'איזה סוגי סרטוני AI ואווטארים נדרשים עבור העסק?',
      subtitle: 'סטודיו הווידאו יוגדר מראש עם תבניות תסריט ואווטארים מתאימים בעברית',
      fieldType: 'single_choice',
      iconName: 'Film',
      required: true,
      mappingKey: 'video_studio_purpose',
      options: [
        { 
          id: 'vid_presenter', 
          label: 'אווטאר פרזנטור מדבר להסבר על שירותים ומוצרים', 
          value: 'avatar_presenter', 
          description: 'פרזנטור אנושי וירטואלי המציג את העסק במקצועיות שיא', 
          iconName: 'Crown' 
        },
        { 
          id: 'vid_social_reels', 
          label: 'סרטוני רילס, TikTok ושורטס שיווקיים', 
          value: 'social_reels', 
          description: 'סרטונים קצרים, קצביים וממירים לחשיפה מהירה ברשתות', 
          iconName: 'Zap' 
        },
        { 
          id: 'vid_courses_training', 
          label: 'קורסים דיגיטליים והדרכות לקוחות מובנות', 
          value: 'courses_training', 
          description: 'הפקת שיעורים והסברים מלאים ללא צורך בימי צילום ועריכה', 
          iconName: 'GraduationCap' 
        },
        { 
          id: 'vid_personalized_service', 
          label: 'סרטוני ברוכים הבאים ותודה מותאמים אישית', 
          value: 'personalized_onboarding', 
          description: 'השארת רושם בלתי נשכח על כל לקוח חדש שנרשם למערכת', 
          iconName: 'Sparkles' 
        },
      ],
    },
  ],

  // 4. Smart Multi-Step Form Builder
  'smart-form-builder': [
    {
      id: 'step_smart_forms_focus',
      order: 15,
      title: 'אילו טפסים חכמים תרצו להפעיל באתר ובמשפכים?',
      subtitle: 'בונה הטפסים יספק תבניות מוכנות עם לוגיקה מותאמת',
      fieldType: 'single_choice',
      iconName: 'Sliders',
      required: true,
      mappingKey: 'smart_form_structure',
      options: [
        { 
          id: 'form_multistep_qual', 
          label: 'שאלוני אבחון רב-שלביים (Multi-Step Micro-Quiz)', 
          value: 'multistep_diagnostic', 
          description: 'חוויה אינטראקטיבית המעלה את יחס ההמרה ב-40% בממוצע', 
          iconName: 'Sliders' 
        },
        { 
          id: 'form_price_calc', 
          label: 'מחשבון הצעת מחיר אינטראקטיבי דינמי', 
          value: 'price_calculator', 
          description: 'הלקוח בוחר מאפיינים ומקבל אומדן מותאם במקום', 
          iconName: 'TrendingUp' 
        },
        { 
          id: 'form_instant_lead', 
          label: 'טופס ליד מהיר עם אימות טלפון וסנכרון ישיר', 
          value: 'instant_lead', 
          description: 'איסוף מהיר של שם, נייד ומייל ללא שדות מיותרים', 
          iconName: 'CheckCircle2' 
        },
        { 
          id: 'form_onboarding_docs', 
          label: 'טופס קליטת לקוח והעלאת קבצים ומסמכים', 
          value: 'onboarding_upload', 
          description: 'איסוף מסודר של חומרים, תמונות והסכמים מלקוחות', 
          iconName: 'ShieldCheck' 
        },
      ],
    },
  ],

  // 5. WhatsApp & Green-API Automation
  'whatsapp-green-api-hub': [
    {
      id: 'step_whatsapp_hub_goal',
      order: 16,
      title: 'מהו יעד האוטומציה המרכזי שלכם ב-WhatsApp?',
      subtitle: 'מרכז הוואטסאפ יותאם לתהליכי העבודה היומיומיים של העסק',
      fieldType: 'single_choice',
      iconName: 'MessageSquare',
      required: true,
      mappingKey: 'whatsapp_automation_goal',
      options: [
        { 
          id: 'wa_instant_lead_alert', 
          label: 'מענה מיידי לכל ליד חדש + התראה למנהל', 
          value: 'instant_lead_response', 
          description: 'שליחת הודעת וואטסאפ ללקוח תוך 5 שניות מקבלת הטופס', 
          iconName: 'Zap' 
        },
        { 
          id: 'wa_broadcast_groups', 
          label: 'דיוור הודעות ועדכונים לרשימות תפוצה וקבוצות', 
          value: 'broadcast_marketing', 
          description: 'שליחת הודעות שיווקיות, מבצעים ועדכונים ברישיון מאושר', 
          iconName: 'Users' 
        },
        { 
          id: 'wa_order_receipts', 
          label: 'אישורי רכישה, קבלות וקישורי כניסה אוטומטיים', 
          value: 'order_receipts', 
          description: 'משלוח פרטי התחברות וקבלת מס ישירות לוואטסאפ של הרוכש', 
          iconName: 'ShieldCheck' 
        },
        { 
          id: 'wa_service_bot', 
          label: 'בוט שירות לקוחות וניתוב שאלות נפוצות', 
          value: 'service_bot', 
          description: 'מענה אוטומטי 24/7 לשאלות לקוחות עם אפשרות העברה לנציג', 
          iconName: 'Cpu' 
        },
      ],
    },
  ],

  // 6. Payments & Billing Hub
  'kesher-payments-hub': [
    {
      id: 'step_payments_hub_model',
      order: 17,
      title: 'איזה מודל סליקה וחשבונאות תרצו להפעיל?',
      subtitle: 'נכין את החיבור לסליקה מהירה והפקת חשבוניות מס ירוקות',
      fieldType: 'single_choice',
      iconName: 'CreditCard',
      required: true,
      mappingKey: 'payments_model_preference',
      options: [
        { 
          id: 'pay_complete_suite', 
          label: 'סליקה מלאה (אשראי, Bit, Apple Pay) + חשבוניות מס אוטומטיות', 
          value: 'complete_suite', 
          description: 'פתרון All-in-One עם הפקת קבלות וחשבוניות EasyCount כחוק', 
          iconName: 'Crown' 
        },
        { 
          id: 'pay_subscriptions', 
          label: 'מנויים חודשיים והוראות קבע באשראי (Recurring)', 
          value: 'recurring_billing', 
          description: 'חיוב מחזורי חודשי או שנתי אוטומטי ללא התעסקות ידנית', 
          iconName: 'TrendingUp' 
        },
        { 
          id: 'pay_one_time_quick', 
          label: 'תשלומים חד-פעמיים מהירים לעמודי נחיתה ומבצעים', 
          value: 'one_time_express', 
          description: 'חוויית רכישה בלחיצה אחת להגדלת אחוז הסגירה', 
          iconName: 'Zap' 
        },
      ],
    },
  ],

  // 7. Brand DNA & Identity Hub
  'brand-dna-hub': [
    {
      id: 'step_brand_dna_tone',
      order: 18,
      title: 'מהו טון הדיבור ושפת המותג שיוזרקו ל-AI בכל המערכת?',
      subtitle: 'כל מחוללי התוכן, התסריטים והטפסים יישרו קו לפי זהות זו',
      fieldType: 'single_choice',
      iconName: 'Sparkles',
      required: true,
      mappingKey: 'brand_dna_tone_voice',
      options: [
        { 
          id: 'tone_executive_gold', 
          label: 'סמכותי, יוקרתי ועסקי מוביל שוק (Executive Authority)', 
          value: 'executive_authority', 
          description: 'שפה מדויקת, מכובדת ומשדרת עוצמה וביטחון פיננסי', 
          iconName: 'Crown' 
        },
        { 
          id: 'tone_innovative_tech', 
          label: 'חדשני, טכנולוגי ופורץ דרך (Tech Disruptor)', 
          value: 'tech_disruptor', 
          description: 'קצב מהיר, ממוקד תוצאות, AI ואוטומציה מתקדמת', 
          iconName: 'Cpu' 
        },
        { 
          id: 'tone_warm_empathy', 
          label: 'חם, אכפתי ומלווה בגובה העיניים (Warm & Empathetic)', 
          value: 'warm_empathy', 
          description: 'מייצר קרבה אישית, אמפתיה ואמון עמוק מול הלקוח', 
          iconName: 'Heart' 
        },
        { 
          id: 'tone_engaging_fun', 
          label: 'קליל, יצירתי ושנון (Engaging & Playful)', 
          value: 'engaging_playful', 
          description: 'שפה צעירה וקולחת המושכת תשומת לב במדיה חברתית', 
          iconName: 'Sparkles' 
        },
      ],
    },
  ],

  // 8. Flow Player Engine (Interactive Video)
  'flow-player-engine': [
    {
      id: 'step_flow_player_mechanic',
      order: 19,
      title: 'אילו שכבות אינטראקטיביות תרצו להציג על גבי הווידאו?',
      subtitle: 'הנגן האינטראקטיבי יהפוך כל סרטון למכונת המרות אקטיבית',
      fieldType: 'single_choice',
      iconName: 'PlayCircle',
      required: true,
      mappingKey: 'flow_player_mechanic',
      options: [
        { 
          id: 'mech_invideo_cta', 
          label: 'כפתורי רכישה ו-CTA צפים בזמן אמת על הווידאו', 
          value: 'invideo_cta', 
          description: 'הצופה לוחץ על המוצר תוך כדי הנגינה ועובר מיד לסליקה', 
          iconName: 'PlayCircle' 
        },
        { 
          id: 'mech_lead_gate', 
          label: 'חסימת וידאו וקליטת ליד לפני המשך הצפייה (Lead Gate)', 
          value: 'lead_gate', 
          description: 'הצופה מזין פרטים כדי לצפות בחלק המרתק של הסרטון', 
          iconName: 'Lock' 
        },
        { 
          id: 'mech_branching_funnel', 
          label: 'פיצול עלילה ובחירת מסלול מותאם אישית (Branching Video)', 
          value: 'branching_funnel', 
          description: 'הצופה בוחר לאן להתקדם ומקבל סרטון מותאם לתשובותיו', 
          iconName: 'Layers' 
        },
      ],
    },
  ],

  // 9. CRM Groups & Communities
  'crm-groups-hub': [
    {
      id: 'step_crm_groups_structure',
      order: 20,
      title: 'מהו אופי ניהול הקהילות והקבוצות המבוקש בעסק?',
      subtitle: 'סביבת העבודה תותאם לניהול חברים, קמפיינים ופעילות קבוצתית',
      fieldType: 'single_choice',
      iconName: 'Users',
      required: true,
      mappingKey: 'crm_groups_model',
      options: [
        { 
          id: 'grp_vip_club', 
          label: 'מועדון לקוחות VIP ותוכנית נאמנות', 
          value: 'vip_club', 
          description: 'פילוח לקוחות פרימיום, תגמולים והטבות בלעדיות', 
          iconName: 'Crown' 
        },
        { 
          id: 'grp_ambassadors', 
          label: 'דפי שגרירים וגיוס שותפים / תרומות', 
          value: 'ambassadors_fundraising', 
          description: 'עמודי נחיתה אישיים לכל שגריר עם מעקב גיוס בזמן אמת', 
          iconName: 'Users' 
        },
        { 
          id: 'grp_knowledge_community', 
          label: 'קהילת ידע ומינויים עם תוכן סגור', 
          value: 'knowledge_community', 
          description: 'אזור חברים עם עדכונים, הדרכות ותקשורת קבוצתית', 
          iconName: 'GraduationCap' 
        },
      ],
    },
  ],

  // 10. Universal Media Gallery Hub
  'media-gallery-hub': [
    {
      id: 'step_media_hub_focus',
      order: 21,
      title: 'מהם נפחי המדיה וסוגי הקבצים המרכזיים בשימוש?',
      subtitle: 'מרכז המדיה יוגדר עם מהירות CDN ואופטימיזציה מקסימלית',
      fieldType: 'single_choice',
      iconName: 'Image',
      required: true,
      mappingKey: 'media_hub_focus',
      options: [
        { 
          id: 'med_web_images', 
          label: 'תמונות וגרפיקות HD לדפי נחיתה ומכירה', 
          value: 'web_images', 
          description: 'המרת WebP אוטומטית, דחיסה חכמה וטעינת עמודים בפחות מ-0.8 שניות', 
          iconName: 'Image' 
        },
        { 
          id: 'med_video_audio', 
          label: 'סרטוני וידאו כבדים וקבצי שמע/פודקאסטים', 
          value: 'video_audio_heavy', 
          description: 'סטרימינג מהיר בענן ללא עומס על השרת המקומי', 
          iconName: 'Film' 
        },
        { 
          id: 'med_rich_catalog', 
          label: 'קטלוג מוצרים רחב עם אלפי קבצים ומסמכים', 
          value: 'rich_catalog', 
          description: 'סידור בתיקיות, תיוג חכם וחיפוש קבצים מהיר', 
          iconName: 'ShoppingBag' 
        },
      ],
    },
  ],
};

export class SaasSalesFormBridge {
  /**
   * Generates a fully-structured, psychologically persuasive SmartFormDefinition
   * tailored specifically to the modules in the customer's cart.
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

    // Base Discovery Step 1: Industry
    const stepIndustry: FormStep = {
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
        { id: 'opt_services', label: 'נותני שירותים מקצועיים, ייעוץ וקליניקות', value: 'professional_services', description: 'עורכי דין, יועצים, מטפלים וסוכנויות', iconName: 'Briefcase' },
        { id: 'opt_commerce', label: 'מסחר, מותגים וקמעונאות', value: 'ecommerce_retail', description: 'קטלוגים, גלריות מדיה וטפסי הזמנה', iconName: 'ShoppingBag' },
        { id: 'opt_education', label: 'קורסים, קהילות והדרכה', value: 'education_creators', description: 'נגני וידאו אינטראקטיביים וקהילות', iconName: 'GraduationCap' },
        { id: 'opt_other', label: 'ענף אחר / ארגון מיוחד', value: 'other', description: 'התאמה מלאה לפי מפרט אישי', iconName: 'Sparkles' },
      ],
    };

    // Base Discovery Step 2: Main Business Growth Goal
    const stepGoal: FormStep = {
      id: 'step_goal',
      order: 2,
      title: 'מהו היעד המרכזי שתרצו להשיג עם המערכת?',
      subtitle: 'נתמקד באופטימיזציית ההמרה של הרכיבים לפי יעד זה',
      fieldType: 'single_choice',
      iconName: 'Target',
      required: true,
      mappingKey: 'primary_goal',
      options: [
        { id: 'goal_leads', label: 'מקסום איסוף לידים והמרות מהירות', value: 'max_leads', description: 'טפסים חכמים, חיבור ל-WhatsApp ודפי נחיתה', iconName: 'TrendingUp' },
        { id: 'goal_video', label: 'הפקת סרטונים ואווטארים שיווקיים ב-AI', value: 'video_marketing', description: 'סטודיו הפקה מתקדם עם HeyGen ו-AI', iconName: 'Film' },
        { id: 'goal_crm', label: 'ניהול לקוחות 360 ואוטומציות סגירה', value: 'crm_scale', description: 'כרטיס לקוח מועשר, פילוחים וייצוא נתונים', iconName: 'Users' },
        { id: 'goal_full_platform', label: 'הקמת פלטפורמה שלמה ומותג דיגיטלי מוביל', value: 'full_suite', description: 'שילוב כלל הרכיבים תחת סאב-דומיין ייחודי', iconName: 'Crown' },
      ],
    };

    // Module-Specific Tailored Discovery Steps (Injected according to items in cart!)
    const moduleDiscoverySteps: FormStep[] = [];
    const processedModules = new Set<string>();

    cart.forEach(item => {
      if (processedModules.has(item.moduleId)) return;
      processedModules.add(item.moduleId);

      const specificSteps = MODULE_SPECIFIC_DISCOVERY_STEPS[item.moduleId];
      if (specificSteps && specificSteps.length > 0) {
        moduleDiscoverySteps.push(...specificSteps);
      }
    });

    // Subdomain Step
    const stepSubdomain: FormStep = {
      id: 'step_subdomain',
      order: 30,
      title: 'אימות כתובת הסאב-דומיין המבוקשת',
      subtitle: `סביבת העבודה והרכיבים יופעלו ישירות תחת הכתובת הייעודית ברשת`,
      fieldType: 'text',
      iconName: 'Globe',
      placeholder: subdomain || 'your-brand',
      defaultValue: subdomain,
      required: true,
      mappingKey: 'requested_subdomain',
      helperText: `הכתובת המלאה תהיה: [המילה שבחרת].${baseDomain} (ניתן להקליד בעברית והמערכת תתרגם לאנגלית אוטומטית)`,
    };

    // Contact Details
    const stepContact: FormStep = {
      id: 'step_contact_name',
      order: 31,
      title: 'פרטי איש הקשר ושם העסק',
      subtitle: 'הפרטים יופיעו על גבי מסמך ההצעה, ההסכם וחשבונית המס הרשמית',
      fieldType: 'text',
      iconName: 'User',
      placeholder: 'ישראל ישראלי | חברת דוגמה בע״מ',
      defaultValue: customerInfo?.fullName ? `${customerInfo.fullName} | ${customerInfo.businessName || ''}` : '',
      required: true,
      mappingKey: 'conta_name',
    };

    // Phone / WhatsApp
    const stepPhone: FormStep = {
      id: 'step_phone',
      order: 32,
      title: 'מספר טלפון ו-WhatsApp לעדכונים',
      subtitle: 'למשלוח פרטי התחברות, קישור כניסה ואישור ההזמנה המיידי',
      fieldType: 'phone',
      iconName: 'Phone',
      placeholder: '050-1234567',
      defaultValue: customerInfo?.phone || '',
      required: true,
      mappingKey: 'conta_phone',
    };

    // Email
    const stepEmail: FormStep = {
      id: 'step_email',
      order: 33,
      title: 'כתובת דוא״ל למשלוח מסמך ההסכם וההצעה',
      subtitle: 'העתק רשמי עם פירוט החבילה והקבלה יישלח ישירות למייל',
      fieldType: 'email',
      iconName: 'Mail',
      placeholder: 'name@business.co.il',
      defaultValue: customerInfo?.email || '',
      required: true,
      mappingKey: 'email',
    };

    // Psychological Agreement & Instant Workspace Activation
    const stepAgreement: FormStep = {
      id: 'step_agreement',
      order: 34,
      title: `אישור הצעת המחיר (${totalMonthly} ₪ לחודש${annualSavingsText})`,
      subtitle: `חבילה נבחרת: ${moduleNames} | מסלול: ${planText}`,
      fieldType: 'single_choice',
      iconName: 'ShieldCheck',
      required: true,
      mappingKey: 'proposal_accepted',
      options: [
        { 
          id: 'agree_instant', 
          label: 'מאשר את הצעת המחיר ומעוניין בהפעלה מיידית של הסאב-דומיין 🚀', 
          value: 'confirmed_instant', 
          description: `הקצאה אוטומטית של סאב-דומיין, מסד נתונים מבודד ופתיחת כלל הרכיבים`,
          iconName: 'CheckCircle2' 
        },
        { 
          id: 'agree_call', 
          label: 'מעוניין בשיחת ייעוץ קצרה עם מומחה לפני החיוב', 
          value: 'request_consultation', 
          description: 'נציג טכנולוגי בכיר יחזור אליך בהקדם לתיאום וליווי אישי',
          iconName: 'PhoneCall' 
        },
      ],
    };

    // Assemble all steps and re-index their order sequentially (1, 2, 3...)
    const rawSteps: FormStep[] = [
      stepIndustry,
      stepGoal,
      ...moduleDiscoverySteps,
      stepSubdomain,
      stepContact,
      stepPhone,
      stepEmail,
      stepAgreement,
    ];

    const sortedSteps = rawSteps.map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));

    return {
      id: formId,
      title: customTitle || `אישור הצעת מחיר והזמנת שירותים (${totalMonthly} ₪ לחודש)`,
      slug: `proposal-${formId}`,
      description: `הצעת מחיר מותאמת אישית עבור סאב-דומיין ${subdomain ? `${subdomain}.${baseDomain}` : baseDomain} הכוללת ${cart.length} רכיבים פעילים.`,
      category: 'הצעות מחיר והזמנות SaaS',
      tone: 'executive_luxury',
      toneDescription: 'יוקרתי, עסקי, ממוקד אמון וממקסם המרות',
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
        enableVoiceInput: true,
      },
      completion: {
        title: 'הצעת המחיר אושרה בהצלחה! 🚀',
        subtitle: `סביבת העבודה שלך מוקמת כעת תחת הסאב-דומיין המבוקש. מסמך ההזמנה ופרטי הגישה נשלחים בוואטסאפ ובמייל.`,
        iconName: 'Sparkles',
        showRedirectButton: true,
        redirectButtonText: 'מעבר ללוח הבקרה והשקת הסאב-דומיין',
        redirectUrl: '/checkout',
        autoRedirectSeconds: 0,
      },
      steps: sortedSteps,
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
   * Extracts customer & domain info from completed form submission answers,
   * including any module-specific discovery responses.
   */
  static extractTenantInfoFromSubmission(answers: Record<string, any>, fallbackSubdomain = ''): {
    customerInfo: TenantCustomerInfo;
    subdomain: string;
    industry: string;
    primaryGoal: string;
    isConfirmed: boolean;
    discoveryAnswers: Record<string, any>;
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

    // Collect all discovery answers for rich CRM & metadata mapping
    const discoveryAnswers: Record<string, any> = {};
    const standardKeys = new Set(['conta_name', 'step_contact_name', 'conta_phone', 'step_phone', 'email', 'step_email', 'requested_subdomain', 'step_subdomain', 'proposal_accepted', 'step_agreement', 'business_industry', 'step_industry', 'primary_goal', 'step_goal']);

    Object.entries(answers).forEach(([k, v]) => {
      if (!standardKeys.has(k) && v !== undefined && v !== null && v !== '') {
        discoveryAnswers[k] = v;
      }
    });

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
      discoveryAnswers,
    };
  }
}
