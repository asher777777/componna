export type {
  OrganizationType,
  GenderAddressing,
  SectorCompliance,
  BorderRadiusStyle,
  ButtonStyleType,
  PersonaItem,
  ObjectionItem,
  BrandIdentity,
  BrandVoice,
  BrandAudience,
  BrandDesignTokens,
  BrandTrustAndCheckout,
  BrandDna,
  BrandDnaContract,
} from '../../../core/contracts';

import type { BrandDna } from '../../../core/contracts';


export const DEFAULT_BRAND_DNA: BrandDna = {
  identity: {
    companyName: 'קמונה פתרונות דיגיטליים',
    organizationType: 'חברה',
    organizationPurpose: 'כספית - מתן שירותים ופתרונות דיגיטליים מתקדמים',
    memberCount: 'עד 10',
    slogan: 'חדשנות, איכות וצמיחה מתמדת',
    companyVision: 'להוביל את תחום השירותים והפתרונות הדיגיטליים תוך מתן יחס אישי, מקצועיות ללא פשרות, וערך אמיתי ומתמשך לכל לקוח ושותף לדרך.',
    shortVision: 'שירותים דיגיטליים מתקדמים המניעים תוצאות ומעניקים שקט נפשי.',
    logoUrl: '',
    vibeImages: [],
  },
  voice: {
    personality: {
      formality: 3,
      warmth: 4,
      luxury: 3,
      energy: 4,
    },
    genderAddressing: 'plural',
    sectorCompliance: 'general',
    powerWords: ['איכות', 'שקט נפשי', 'מומחיות', 'תוצאות מוכחות', 'ליווי אישי'],
    forbiddenWords: ['זול', 'פשוט', 'מבצע אחרון בהחלט', 'חלטורה'],
    shabbatObservant: false,
  },
  audience: {
    mainUvp: 'פתרון מקיף מקצה לקצה המשלב טכנולוגיה עילית עם ליווי אנושי מסור ומקצועי.',
    targetAudiences: ['בעלי עסקים קטנים ובינוניים', 'מנהלי קהילות וארגונים', 'יזמים ומשווקים'],
    personas: [
      {
        id: 'p-1',
        name: 'דן, בעל עסק עצמאי',
        roleOrProfile: 'מנהל פעילות צומחת ללא מחלקת שיווק פנימית',
        mainPain: 'חוסר זמן, פיזור בין כלים שונים ותחושת חוסר סדר במכירות ובגבייה',
        dreamOutcome: 'פלטפורמה אחת שמנהלת את הכל אוטומטית ומגדילה את ההכנסות במינימום מאמץ',
      },
      {
        id: 'p-2',
        name: 'שרה, מנהלת קהילה ועמותה',
        roleOrProfile: 'מובילה פעילות חברתית עם מאות חברים ומתנדבים',
        mainPain: 'קושי לגייס משאבים, לשמור על קשר אישי עם כולם ולייצר אמינות',
        dreamOutcome: 'כלים דיגיטליים שמשקפים את החזון, אוספים תרומות ומחברים את האנשים',
      },
    ],
    commonObjections: [
      {
        id: 'o-1',
        objection: 'האם זה מתאים גם לעסק קטן כמו שלי?',
        rebuttal: 'בהחלט. המערכת מודולרית ומותאמת לגדול יחד איתך, ללא עלויות הקמה מיותרות.',
      },
      {
        id: 'o-2',
        objection: 'כמה זמן ייקח לי להתחיל לראות תוצאות?',
        rebuttal: 'תוך מספר דקות מרגע הגדרת ה-DNA כל הכלים והדפים מוכנים לפעולה מיידית.',
      },
    ],
  },
  designTokens: {
    primaryColor: '#6366f1',
    secondaryColor: '#0ea5e9',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    textColorH1: '#ffffff',
    textColorH2: '#94a3b8',
    buttonBgColor: '#6366f1',
    buttonTextColor: '#ffffff',
    fontFamily: 'Heebo, sans-serif',
    borderRadius: 'md',
    buttonStyle: 'gradient',
  },
  trust: {
    legalEntityId: '516000000',
    contactPhone: '03-1234567',
    contactEmail: 'contact@mybrand.co.il',
    officeAddress: 'דרך מנחם בגין 144, תל אביב',
    refundPolicySummary: 'החזר כספי מלא תוך 14 יום בהתאם לחוק הגנת הצרכן ללא אותיות קטנות.',
    securityBadgeText: 'סליקה מאובטחת בתקן PCI-DSS ובהצפנת SSL 256-bit',
    whatsappSupportNumber: '0501234567',
  },
};

export interface ContentStrategyItem {
  id: string;
  type: 'service_page' | 'sales_page' | 'lead_magnet' | 'pricing_tier';
  title: string;
  targetAudience: string;
  heroHeadline: string;
  heroSubheadline: string;
  coreValuePoints: string[];
  callToAction: string;
  pricingHook?: string;
  objectionKiller?: string;
  persuasiveClosing: string;
  createdAt: string;
  savedToCollection?: boolean;
}
