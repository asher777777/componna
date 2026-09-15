export type OrganizationType = 'חברה' | 'עמותה' | 'שותפות' | 'עוסק מורשה' | 'עוסק פטור' | 'אחר';

export type GenderAddressing = 'male' | 'female' | 'plural' | 'neutral' | 'direct';

export type SectorCompliance = 'general' | 'religious' | 'ultra_orthodox' | 'business';

export type BorderRadiusStyle = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type ButtonStyleType = 'solid' | 'gradient' | 'outline' | 'glass';

export interface PersonaItem {
  id: string;
  name: string;
  roleOrProfile: string;
  mainPain: string;
  dreamOutcome: string;
}

export interface ObjectionItem {
  id: string;
  objection: string;
  rebuttal: string;
}

export interface BrandIdentity {
  companyName: string;
  organizationType: OrganizationType;
  organizationPurpose: string;
  memberCount: string;
  slogan: string;
  companyVision: string;
  shortVision: string;
  logoUrl?: string;
  vibeImages?: string[];
}

export interface BrandVoice {
  personality: {
    formality: number; // 1 (קליל וחברי) עד 5 (רשמי ומוקפד)
    warmth: number;    // 1 (ענייני וממוקד) עד 5 (חם ומשפחתי)
    luxury: number;    // 1 (עממי ונגיש) עד 5 (יוקרתי ובלעדי)
    energy: number;    // 1 (שלו ומרגיע) עד 5 (אנרגטי וסוחף)
  };
  genderAddressing: GenderAddressing;
  sectorCompliance: SectorCompliance;
  powerWords: string[];
  forbiddenWords: string[];
  shabbatObservant: boolean;
}

export interface BrandAudience {
  mainUvp: string; // Unique Value Proposition
  targetAudiences: string[];
  personas: PersonaItem[];
  commonObjections: ObjectionItem[];
}

export interface BrandDesignTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  textColorH1: string;
  textColorH2: string;
  buttonBgColor: string;
  buttonTextColor: string;
  fontFamily: string;
  borderRadius: BorderRadiusStyle;
  buttonStyle: ButtonStyleType;
}

export interface BrandTrustAndCheckout {
  legalEntityId: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  refundPolicySummary: string;
  securityBadgeText: string;
  securityBadgeImageUrl?: string;
  whatsappSupportNumber?: string;
}

export interface BrandDna {
  identity: BrandIdentity;
  voice: BrandVoice;
  audience: BrandAudience;
  designTokens: BrandDesignTokens;
  trust: BrandTrustAndCheckout;
  updatedAt?: string;
}

export const DEFAULT_BRAND_DNA: BrandDna = {
  identity: {
    companyName: 'הארגון המוביל',
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
