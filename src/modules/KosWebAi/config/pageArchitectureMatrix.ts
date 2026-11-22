import { SectionType } from '../types/pageBuilder.types';
import { BrandDna, KOSUN_CRM_FIELD_KEYS } from '../../../core/contracts';

export type MatrixPageTypeId =
  | 'homepage'
  | 'landing'
  | 'pillar_article'
  | 'blog_hub'
  | 'service_solution'
  | 'event_webinar'
  | 'crowdfunding_campaign'
  | 'course_academy'
  | 'pricing_plans'
  | 'about_contact';

export interface MatrixPageTypeDefinition {
  id: MatrixPageTypeId;
  orderNumber: number;
  titleHe: string;
  shortTitleHe: string;
  subtitleHe: string;
  essenceAndFlow: string;
  hasHeader: boolean;
  sections: SectionType[];
  recommendedSchemaType: 'Organization' | 'ProfessionalService' | 'Product' | 'Article' | 'Event' | 'Course' | 'LocalBusiness';
  iconName: string;
  badge?: string;
  hasPaymentCheckout?: boolean;
  hasCrmForm?: boolean;
}

/**
 * Canonical 10-Page Matrix derived from page_architecture_ui_sections_matrix.md
 * Ordered top-to-bottom for optimal conversion, UX flow, and GEO/SEO 2026.4.
 */
export const PAGE_ARCHITECTURE_MATRIX: MatrixPageTypeDefinition[] = [
  {
    id: 'homepage',
    orderNumber: 1,
    titleHe: '1. עמוד בית (Homepage)',
    shortTitleHe: 'עמוד בית',
    subtitleHe: 'מרכז ניווט, מיצוב סמכות (E-E-A-T) והפניה למסלולי עומק',
    essenceAndFlow:
      'תפיסת קשב ב-Hero -> הוכחת אמון מהירה (לוגואים ומספרים) -> הצגת קטגוריות/שירותי ליבה -> הוכחה חברתית (המלצות/וידאו) -> תוכן עדכני -> הנעה לפעולה ויצירת קשר.',
    hasHeader: true,
    sections: [
      'header',
      'hero',
      'logoMarquee',
      'statsBento',
      'dynamicCategories',
      'dynamicListing',
      'articlesListing',
      'kosvidio',
      'testimonials',
      'community',
      'livePosts',
      'geoLocal',
      'faq',
      'contact',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'Organization',
    iconName: 'Home',
    badge: 'ראשי וסמכות',
    hasCrmForm: true,
  },
  {
    id: 'landing',
    orderNumber: 2,
    titleHe: '2. עמוד נחיתה (Landing Page)',
    shortTitleHe: 'עמוד נחיתה',
    subtitleHe: 'מכונת המרה ממוקדת פעולה אחת ללא הסחות דעת (ללא תפריט ניווט)',
    essenceAndFlow:
      'הבטחת ערך חדה וויז׳ואל/וידאו קצר -> הזדהות עם הכאב והצגת הפתרון (לפני/אחרי) -> דחיפות (טיימר) -> הוכחה חברתית והסרת התנגדויות -> טופס המרה ממוקד.',
    hasHeader: false,
    sections: [
      'hero',
      'tiktokHero',
      'logoMarquee',
      'statsBento',
      'timer',
      'videoEngagement',
      'beforeAfter',
      'testimonials',
      'faq',
      'landingSection',
      'smartForm',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'ProfessionalService',
    iconName: 'Zap',
    badge: 'הכי ממיר',
    hasCrmForm: true,
  },
  {
    id: 'pillar_article',
    orderNumber: 3,
    titleHe: '3. עמוד תוכן / מאמר עומק (Pillar Article)',
    shortTitleHe: 'מאמר עומק (SEO/GEO)',
    subtitleHe: 'מגנט SEO וציטוטים למנועי AI (GEO / Answer-First)',
    essenceAndFlow:
      'כותרת ומטא-דאטה של מחבר מומחה -> תוכן עניינים ותקציר ישיר (Answer-First) -> גוף מאמר עשיר המשולב בווידאו/אודיו ותובנות -> המלצות ומאמרים קשורים -> הנעה עדינה לפעולה.',
    hasHeader: true,
    sections: [
      'header',
      'hero',
      'articlesListing',
      'richContent',
      'futureContent2027',
      'kosvidio',
      'flowPlayer',
      'mainContent',
      'community',
      'faq',
      'smartForm',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'Article',
    iconName: 'FileText',
    badge: 'מגנט AI וגוגל',
    hasCrmForm: true,
  },
  {
    id: 'blog_hub',
    orderNumber: 4,
    titleHe: '4. עמוד ארכיון בלוג / מרכז ידע (Knowledge Hub)',
    shortTitleHe: 'מרכז ידע ובלוג',
    subtitleHe: 'ארגון תוכן לפי אשכולות נושא (Topic Clusters) וביסוס מומחיות',
    essenceAndFlow:
      'כותרת וחיפוש -> סינון לפי קטגוריות נושא -> מאמר מוביל -> גריד מאמרים ותכני וידאו/פודקאסט -> הרשמה לעדכונים וקהילה.',
    hasHeader: true,
    sections: [
      'header',
      'hero',
      'dynamicCategories',
      'dynamicListing',
      'articlesListing',
      'videoGallery',
      'futureContent2027',
      'community',
      'livePosts',
      'smartForm',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'Organization',
    iconName: 'BookOpen',
    hasCrmForm: true,
  },
  {
    id: 'service_solution',
    orderNumber: 5,
    titleHe: '5. עמוד שירות / פתרון מקצועי (Service Page)',
    shortTitleHe: 'שירות / פתרון',
    subtitleHe: 'פירוט ערך השירות, תהליך העבודה והוכחת תוצאות',
    essenceAndFlow:
      'הגדרת הפתרון וקהל היעד -> נתוני הצלחה ושותפים -> פירוט מעמיק של השירות (תוכן עשיר + הדגמות לפני/אחרי) -> לקוחות ממליצים -> שאלות נפוצות -> טופס פנייה חכם.',
    hasHeader: true,
    sections: [
      'header',
      'hero',
      'logoMarquee',
      'statsBento',
      'imageListing',
      'richContent',
      'kosvidio',
      'beforeAfter',
      'pricing',
      'testimonials',
      'geoLocal',
      'faq',
      'smartForm',
      'contact',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'ProfessionalService',
    iconName: 'Compass',
    hasPaymentCheckout: true,
    hasCrmForm: true,
  },
  {
    id: 'event_webinar',
    orderNumber: 6,
    titleHe: '6. עמוד אירוע / וובינר / כנס (Event Page)',
    shortTitleHe: 'אירוע / וובינר',
    subtitleHe: 'יצירת דחיפות, הצגת לו"ז ודוברים והבטחת הרשמה והגעה',
    essenceAndFlow:
      'כותרת ופרטי מועד/מיקום -> ספירה לאחור -> תוכן האירוע ודוברים -> מיקום גיאוגרפי -> טופס אישור הגעה (RSVP) והוספה ליומן.',
    hasHeader: true,
    sections: [
      'header',
      'hero',
      'logoMarquee',
      'timer',
      'eventsListing',
      'richContent',
      'kosvidio',
      'testimonials',
      'geoLocal',
      'faq',
      'eventRsvp',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'Event',
    iconName: 'Calendar',
    hasCrmForm: true,
  },
  {
    id: 'crowdfunding_campaign',
    orderNumber: 7,
    titleHe: '7. עמוד קמפיין גיוס המונים / תרומות (Campaign)',
    shortTitleHe: 'קמפיין גיוס',
    subtitleHe: 'רתימה רגשית, שקיפות בזמן אמת והנעה לתרומה מיידית',
    essenceAndFlow:
      'כותרת קמפיין ויעד כספי -> ספירה לאחור ומדדי אימפקט -> סיפור הקמפיין בווידאו ותמונות -> מדרגות תרומה/תשורות -> לוח תורמים חיים ואנליטיקה -> שאלות נפוצות.',
    hasHeader: false,
    sections: [
      'campaignHeader',
      'hero',
      'tiktokHero',
      'statsBento',
      'timer',
      'imageListing',
      'videoGallery',
      'richContent',
      'videoEngagement',
      'campaignTiers',
      'campaignDonors',
      'testimonials',
      'community',
      'liveAnalytics',
      'faq',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'Organization',
    iconName: 'Heart',
    badge: 'גיוס וסליקה',
    hasPaymentCheckout: true,
    hasCrmForm: true,
  },
  {
    id: 'course_academy',
    orderNumber: 8,
    titleHe: '8. עמוד קורס / הכשרה דיגיטלית (Course & Academy)',
    shortTitleHe: 'קורס / הכשרה',
    subtitleHe: 'מכירת ידע, הצגת סילבוס ותוצאות בוגרים',
    essenceAndFlow:
      'הצגת ההבטחה המקצועית ובאנר הקורס -> נתוני השמה/הצלחה -> סילבוס מפורט וטעימות וידאו -> תוצאות בוגרים (לפני/אחרי והמלצות) -> מסלולי מחיר והרשמה.',
    hasHeader: true,
    sections: [
      'header',
      'hero',
      'logoMarquee',
      'statsBento',
      'timer',
      'videoGallery',
      'kosvidioGallery',
      'richContent',
      'kosvidio',
      'flowPlayer',
      'beforeAfter',
      'mainContent',
      'pricing',
      'testimonials',
      'community',
      'faq',
      'smartForm',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'Course',
    iconName: 'GraduationCap',
    hasPaymentCheckout: true,
    hasCrmForm: true,
  },
  {
    id: 'pricing_plans',
    orderNumber: 9,
    titleHe: '9. עמוד תמחור וחבילות (Pricing & Plans)',
    shortTitleHe: 'תמחור וחבילות',
    subtitleHe: 'השוואה שקופה בין מסלולים והקלה על קבלת החלטת רכישה',
    essenceAndFlow:
      'כותרת ממוקדת ערך -> טבלת השוואת מחירים ומסלולים -> לוגואים של לקוחות משלמים -> המלצות ממוקדות ROI -> שאלות נפוצות על חיוב וביטול -> יצירת קשר.',
    hasHeader: true,
    sections: [
      'header',
      'hero',
      'logoMarquee',
      'statsBento',
      'pricing',
      'testimonials',
      'faq',
      'smartForm',
      'contact',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'Product',
    iconName: 'CreditCard',
    badge: 'סליקה ישירה',
    hasPaymentCheckout: true,
    hasCrmForm: true,
  },
  {
    id: 'about_contact',
    orderNumber: 10,
    titleHe: '10. עמוד אודות ויצירת קשר (About & Contact)',
    shortTitleHe: 'אודות ויצירת קשר',
    subtitleHe: 'אימות יישות (Entity Verification) עבור גולשים ומנועי AI, ונגישות לפנייה',
    essenceAndFlow:
      'סיפור הארגון והחזון -> נתוני שקיפות ואימפקט -> הצגת הצוות והקהילה -> מיקום פיזי ומפות הגעה -> טופס יצירת קשר ופרטי התקשרות רשמיים.',
    hasHeader: true,
    sections: [
      'header',
      'hero',
      'logoMarquee',
      'statsBento',
      'imageListing',
      'richContent',
      'kosvidio',
      'testimonials',
      'community',
      'geoLocal',
      'faq',
      'contact',
      'decorativeDivider',
    ],
    recommendedSchemaType: 'Organization',
    iconName: 'Users',
    hasCrmForm: true,
  },
];

export function getMatrixPageType(id: MatrixPageTypeId): MatrixPageTypeDefinition {
  return PAGE_ARCHITECTURE_MATRIX.find((p) => p.id === id) || PAGE_ARCHITECTURE_MATRIX[1];
}

// ============================================================================
// CRM Standard Field Catalog (Synced with KOSUN_CRM_FIELD_KEYS)
// ============================================================================

export interface CrmFormFieldSpec {
  crmFieldKey: string;
  labelHe: string;
  inputType: 'text' | 'tel' | 'email' | 'textarea' | 'number';
  autocomplete: string;
  required: boolean;
  defaultSelected?: boolean;
}

export const STANDARD_CRM_FORM_FIELDS: CrmFormFieldSpec[] = [
  {
    crmFieldKey: KOSUN_CRM_FIELD_KEYS.NAME,
    labelHe: 'שם מלא',
    inputType: 'text',
    autocomplete: 'name',
    required: true,
    defaultSelected: true,
  },
  {
    crmFieldKey: KOSUN_CRM_FIELD_KEYS.PHONE,
    labelHe: 'טלפון נייד',
    inputType: 'tel',
    autocomplete: 'tel',
    required: true,
    defaultSelected: true,
  },
  {
    crmFieldKey: KOSUN_CRM_FIELD_KEYS.EMAIL,
    labelHe: 'דוא"ל',
    inputType: 'email',
    autocomplete: 'email',
    required: false,
    defaultSelected: true,
  },
  {
    crmFieldKey: KOSUN_CRM_FIELD_KEYS.COMPANY,
    labelHe: 'שם חברה / ארגון',
    inputType: 'text',
    autocomplete: 'organization',
    required: false,
  },
  {
    crmFieldKey: KOSUN_CRM_FIELD_KEYS.ROLE,
    labelHe: 'תפקיד',
    inputType: 'text',
    autocomplete: 'organization-title',
    required: false,
  },
  {
    crmFieldKey: KOSUN_CRM_FIELD_KEYS.CITY,
    labelHe: 'עיר מגורים',
    inputType: 'text',
    autocomplete: 'address-level2',
    required: false,
  },
  {
    crmFieldKey: KOSUN_CRM_FIELD_KEYS.GOV_ID,
    labelHe: 'ת.ז. / ח.פ. (לחשבונית או תרומה)',
    inputType: 'text',
    autocomplete: 'off',
    required: false,
  },
  {
    crmFieldKey: KOSUN_CRM_FIELD_KEYS.NOTES,
    labelHe: 'הערות / פירוט פנייה',
    inputType: 'textarea',
    autocomplete: 'off',
    required: false,
    defaultSelected: true,
  },
];

// ============================================================================
// One-Question-at-a-Time Dynamic Intake Engine
// ============================================================================

export type IntakeQuestionId =
  | 'topic_and_goal'
  | 'grounding_sources'
  | 'hero_media'
  | 'pricing_and_checkout'
  | 'event_datetime_location'
  | 'campaign_goal_tiers'
  | 'geo_location_details'
  | 'crm_form_fields'
  | 'seo_geo_focus';

export interface IntakeQuestionStep {
  id: IntakeQuestionId;
  relatedSections: SectionType[];
  badgeHe: string;
  questionHe: string;
  helperTipHe: string;
  isHardFactRequired: boolean;
  recommendedImageSpec?: {
    width: number;
    height: number;
    aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
    labelHe: string;
  };
}

/**
 * Builds pre-filled English/Hebrew visual prompt with exact dimensions for the Hero / Header Gallery creator.
 */
export function buildPreFilledHeroImagePrompt(
  topic: string,
  pageType: MatrixPageTypeDefinition,
  brandDna?: BrandDna | null
): {
  prompt: string;
  width: number;
  height: number;
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
} {
  const company = brandDna?.identity?.companyName || 'המותג';
  const primaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';
  const stylePreset = brandDna?.designTokens?.defaultStylePreset || 'modern';
  const cleanTopic = topic?.trim() || pageType.shortTitleHe;

  const isVertical = pageType.id === 'landing' && pageType.sections.includes('tiktokHero');
  const aspectRatio: '16:9' | '4:3' | '1:1' | '9:16' = isVertical ? '9:16' : '16:9';
  const width = isVertical ? 1080 : 1600;
  const height = isVertical ? 1920 : 900;

  const prompt = `תמונת אווירה מקצועית באיכות פרימיום עבור ${company} בנושא "${cleanTopic}" (${pageType.shortTitleHe}), סגנון ${stylePreset}, תאורה קולנועית נקייה, שילוב עדין של צבע המותג (${primaryColor}), קומפוזיציה מאוזנת להדר אתר במידות ${width}x${height} (${aspectRatio}), ללא טקסט על התמונה.`;

  return { prompt, width, height, aspectRatio };
}

/**
 * Generates the exact ordered list of "one question at a time" steps
 * strictly tailored to the sections present in the chosen page type.
 */
export function buildIntakeQuestionsForPage(
  pageType: MatrixPageTypeDefinition,
  selectedSections: SectionType[]
): IntakeQuestionStep[] {
  const has = (types: SectionType[]) => types.some((t) => selectedSections.includes(t));
  const steps: IntakeQuestionStep[] = [];

  // 1. Always start with Topic & Main Value
  steps.push({
    id: 'topic_and_goal',
    relatedSections: ['hero', 'richContent'],
    badgeHe: 'מיקוד העמוד',
    questionHe: `מה הנושא המדויק וההבטחה המרכזית של ה${pageType.shortTitleHe}?`,
    helperTipHe: 'כתוב משפט אחד ברור: מה הגולש מקבל כאן ומה הפעולה שאתה רוצה שיעשה בסוף הקריאה.',
    isHardFactRequired: true,
  });

  // 2. Grounding sources (PDF / DOCX / URL / Text) for Information Gain
  steps.push({
    id: 'grounding_sources',
    relatedSections: ['richContent', 'faq', 'statsBento', 'mainContent'],
    badgeHe: 'מקורות מידע אמיתיים (GEO)',
    questionHe: 'רוצה להעלות מסמך (PDF/DOCX), לסרוק אתר קיים או להדביק חומר גלם?',
    helperTipHe:
      'לפי פרוטוקול 2026.4, נתונים אמיתיים מהשטח (Information Gain) מונעים תוכן גנרי ומגדילים משמעותית ציטוטים במנועי AI וגוגל. שלב זה אופציונלי.',
    isHardFactRequired: false,
  });

  // 3. Hero / Header Image with pre-filled dimensions & prompt
  if (has(['hero', 'campaignHeader', 'tiktokHero'])) {
    steps.push({
      id: 'hero_media',
      relatedSections: ['hero', 'campaignHeader', 'tiktokHero'],
      badgeHe: 'תמונת הדר ראשית',
      questionHe: 'איזו תמונה תופיע בראש העמוד (Hero / Header)?',
      helperTipHe:
        'תוכל להעלות תמונה מהמחשב, לבחור מגלריית המדיה או לייצר תמונה חדשה ב-AI — הפרומפט והמידות המדויקות כבר מוכנים עבורך.',
      isHardFactRequired: false,
      recommendedImageSpec: {
        width: 1600,
        height: 900,
        aspectRatio: '16:9',
        labelHe: 'רוחב מלא להדר (1600x900px • 16:9)',
      },
    });
  }

  // 4. Event Date, Time & Location (Hard Facts)
  if (has(['eventRsvp', 'timer', 'eventsListing']) && pageType.id === 'event_webinar') {
    steps.push({
      id: 'event_datetime_location',
      relatedSections: ['eventRsvp', 'timer', 'geoLocal'],
      badgeHe: 'נתוני חובה לאירוע',
      questionHe: 'מתי ואיפה מתקיים האירוע או הוובינר?',
      helperTipHe: 'תאריך, שעות, כתובת מדויקת או קישור זום — נתונים אלו מוזרקים לטיימר, ל-RSVP ולסכמת Event של גוגל.',
      isHardFactRequired: true,
    });
  }

  // 5. Campaign Goal & Tiers (Hard Facts)
  if (has(['campaignHeader', 'campaignTiers'])) {
    steps.push({
      id: 'campaign_goal_tiers',
      relatedSections: ['campaignHeader', 'campaignTiers'],
      badgeHe: 'נתוני חובה לקמפיין וסליקה',
      questionHe: 'מה יעד הגיוס הכספי ומדרגות התרומה (כולל פרמטרי קשר)?',
      helperTipHe: 'הזן סכום יעד מדויק, סכום שנאסף עד כה, ומדרגות תרומה (סעיף 46 / קבלת תרומה 405).',
      isHardFactRequired: true,
    });
  }

  // 6. Pricing & Kesher Checkout Parameters (Hard Facts)
  if (has(['pricing'])) {
    steps.push({
      id: 'pricing_and_checkout',
      relatedSections: ['pricing'],
      badgeHe: 'מחירון וסליקה (קשר)',
      questionHe: 'מה שמות החבילות, המחירים והגדרות הסליקה בעמוד?',
      helperTipHe: 'מחירים אמיתיים חייבים להגיע ממך. נגדיר גם סוג מסמך חשבונאי (חשבונית מס קבלה 320 / קבלה 400) ותשלומים.',
      isHardFactRequired: true,
    });
  }

  // 7. Geo / Local SEO (Hard Facts if geoLocal is included)
  if (has(['geoLocal']) && pageType.id !== 'event_webinar') {
    steps.push({
      id: 'geo_location_details',
      relatedSections: ['geoLocal'],
      badgeHe: 'מיקוד גיאוגרפי (Local SEO)',
      questionHe: 'באילו ערים ואזורי שירות העסק פועל בעמוד זה?',
      helperTipHe: 'מסייע לגוגל ולמנועי AI להציג את העסק בחיפושים מקומיים ולמלא סכמת LocalBusiness.',
      isHardFactRequired: false,
    });
  }

  // 8. CRM Form Fields Mapping
  if (has(['smartForm', 'landingSection', 'contact', 'eventRsvp'])) {
    steps.push({
      id: 'crm_form_fields',
      relatedSections: ['smartForm', 'landingSection', 'contact', 'eventRsvp'],
      badgeHe: 'חיבור שדות ל-CRM',
      questionHe: 'אילו שדות הטופס יאסוף וישלח ישירות לכרטיס הלקוח ב-CRM?',
      helperTipHe:
        'כל שדה ממופה אוטומטית למזהה התקני ב-CRM (`kosun_crm_*`) וכולל תגיות נגישות (`autocomplete`) למוכנות לסוכני AI.',
      isHardFactRequired: false,
    });
  }

  // 9. SEO / GEO 2026.4 Focus (Keywords + Author Entity)
  steps.push({
    id: 'seo_geo_focus',
    relatedSections: ['richContent', 'faq'],
    badgeHe: 'אופטימיזציית SEO & GEO 2026.4',
    questionHe: 'מי המומחה החתום על התוכן ומה השאלה המרכזית שתרצו ש-AI וגוגל יצטטו?',
    helperTipHe:
      'פרוטוקול 2026.4 דורש סכמת Person/Organization ותשובת Answer-First חדה (40–60 מילים) לשאיבה ב-ChatGPT, Gemini וגוגל.',
    isHardFactRequired: false,
  });

  return steps;
}
