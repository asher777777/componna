export type BrandingActionType =
  | 'open_ai_wizard'
  | 'open_scraper'
  | 'open_strategy'
  | 'trigger_market_agent'
  | 'run_market_agent'
  | 'save_brand_dna'
  | 'edit_core_services'
  | 'switch_branding_tab'
  | 'switch_tab'
  | 'navigate'
  | 'custom_event';

export interface BrandingActionOption {
  type: BrandingActionType;
  label: string;
  description: string;
  defaultPayload?: string;
}

export const BRANDING_ACTION_OPTIONS: BrandingActionOption[] = [
  {
    type: 'open_ai_wizard',
    label: 'אשף גילוי AI מלא (Wizard)',
    description: 'פותח את אשף 5 השלבים האוטומטי לגילוי ואפיון המותג',
  },
  {
    type: 'open_scraper',
    label: 'סריקת מותג מ-URL / רשתות',
    description: 'פותח מודאל חילוץ נתונים מאתר קיים או עמוד פייסבוק',
  },
  {
    type: 'open_strategy',
    label: 'אסטרטגיית תוכן AI',
    description: 'מייצר תוכנית תוכן חודשית, רעיונות לפוסטים ומסרים שיווקיים',
  },
  {
    type: 'trigger_market_agent',
    label: 'הפעלת סוכן מחקר שוק (AI Agent)',
    description: 'סורק מתחרים, מאתר הזדמנויות בידול ומציע אסטרטגיה',
  },
  {
    type: 'save_brand_dna',
    label: 'שמירת Brand DNA (Firestore)',
    description: 'שומר את כל שינויי המיתוג ישירות למסד הנתונים של הדייר',
  },
  {
    type: 'edit_core_services',
    label: 'עריכת שירותי ליבה ומוצרים',
    description: 'פותח עורך מורחב לחבילות, מוצר דגל ומחירונים',
  },
  {
    type: 'switch_branding_tab',
    label: 'מעבר לטאב מיתוג ייעודי',
    description: 'מעביר ישירות לטאב (זהות, שפה, קהל, שירותים וכו׳)',
    defaultPayload: 'identity',
  },
  {
    type: 'navigate',
    label: 'ניווט לעמוד פנימי במערכת',
    description: 'מעבר לקישור פנימי במערכת (כגון /dashboard, /KosTube)',
    defaultPayload: '/brand-dna',
  },
  {
    type: 'custom_event',
    label: 'שיגור אירוע מותאם (CustomEvent)',
    description: 'משגר אירוע לחלון עבור אינטגרציה מותאמת אישית',
    defaultPayload: 'brand_custom_action',
  },
];

export interface BrandingDataFieldOption {
  key: string;
  label: string;
  group: 'זהות' | 'שפה וטון' | 'קהלי יעד' | 'שירותים' | 'עיצוב' | 'אמינות';
}

export const BRANDING_DATA_FIELDS: BrandingDataFieldOption[] = [
  { key: 'identity.companyName', label: 'שם החברה / מותג', group: 'זהות' },
  { key: 'identity.slogan', label: 'סלוגן עסקי', group: 'זהות' },
  { key: 'identity.shortVision', label: 'חזון קצר וממוקד', group: 'זהות' },
  { key: 'identity.logoUrl', label: 'כתובת לוגו', group: 'זהות' },
  { key: 'identity.brandSummaryParagraph', label: 'פסקת תמצית מותג', group: 'זהות' },
  { key: 'voice.genderAddressing', label: 'פנייה מגדרית', group: 'שפה וטון' },
  { key: 'voice.personality', label: 'טמפרמנט ואישיות', group: 'שפה וטון' },
  { key: 'voice.powerWords', label: 'מילות כוח ורגש', group: 'שפה וטון' },
  { key: 'voice.forbiddenWords', label: 'מילים אסורות', group: 'שפה וטון' },
  { key: 'audience.mainUvp', label: 'הצעת ערך ייחודית (UVP)', group: 'קהלי יעד' },
  { key: 'audience.targetAudiences', label: 'רשימת קהלי יעד', group: 'קהלי יעד' },
  { key: 'audience.personas', label: 'פרסונות לקוח מוגדרות', group: 'קהלי יעד' },
  { key: 'ecosystem.services', label: 'שירותי ליבה', group: 'שירותים' },
  { key: 'ecosystem.flagshipProduct', label: 'מוצר דגל מוביל', group: 'שירותים' },
  { key: 'designTokens.primaryColor', label: 'צבע ראשי', group: 'עיצוב' },
  { key: 'designTokens.secondaryColor', label: 'צבע משני', group: 'עיצוב' },
  { key: 'designTokens.fontFamily', label: 'גופן מערכת', group: 'עיצוב' },
  { key: 'trust.guarantees', label: 'הבטחות שירות וסליקה', group: 'אמינות' },
  { key: 'trust.cancellationPolicy', label: 'מדיניות ביטולים', group: 'אמינות' },
];
