import React from 'react';
import {
  Layout,
  TrendingUp,
  Table,
  Zap,
  Navigation,
  Grid,
  Layers,
  Building2,
  Sliders,
  Target,
  Palette,
  ShieldCheck,
  Globe,
  Sparkles,
  Box,
} from 'lucide-react';
import { DashboardSectionType, DashboardSectionConfig } from '../types';

// Sections (Views)
import { DashboardHeaderSection } from './header/DashboardHeaderSection';
import { DashboardStatsSection } from './stats/DashboardStatsSection';
import { DashboardTableSection } from './table/DashboardTableSection';
import { DashboardQuickActionsSection } from './quickActions/DashboardQuickActionsSection';
import { DashboardFloatingDockSection } from './floatingDock/DashboardFloatingDockSection';
import { CommandMatrixSection } from './commandMatrix/CommandMatrixSection';
import { DashboardSlotWidgetSection } from './slotWidget/DashboardSlotWidgetSection';

// Branding Sections (Views)
import { BrandingIdentitySection } from './branding/identity/BrandingIdentitySection';
import { BrandingVoiceSection } from './branding/voice/BrandingVoiceSection';
import { BrandingAudienceSection } from './branding/audience/BrandingAudienceSection';
import { BrandingEcosystemSection } from './branding/ecosystem/BrandingEcosystemSection';
import { BrandingDesignTokensSection } from './branding/designTokens/BrandingDesignTokensSection';
import { BrandingTrustSection } from './branding/trust/BrandingTrustSection';
import { BrandingMarketSection } from './branding/market/BrandingMarketSection';
import { BrandingOverviewSection } from './branding/overview/BrandingOverviewSection';

// Editors
import { DashboardHeaderEditor } from './header/DashboardHeaderEditor';
import { DashboardStatsEditor } from './stats/DashboardStatsEditor';
import { DashboardTableEditor } from './table/DashboardTableEditor';
import { DashboardQuickActionsEditor } from './quickActions/DashboardQuickActionsEditor';
import { DashboardFloatingDockEditor } from './floatingDock/DashboardFloatingDockEditor';
import { CommandMatrixEditor } from './commandMatrix/CommandMatrixEditor';
import { DashboardSlotWidgetEditor } from './slotWidget/DashboardSlotWidgetEditor';

// Branding Editors
import { BrandingIdentityEditor } from './branding/identity/BrandingIdentityEditor';
import { BrandingVoiceEditor } from './branding/voice/BrandingVoiceEditor';
import { BrandingAudienceEditor } from './branding/audience/BrandingAudienceEditor';
import { BrandingEcosystemEditor } from './branding/ecosystem/BrandingEcosystemEditor';
import { BrandingDesignTokensEditor } from './branding/designTokens/BrandingDesignTokensEditor';
import { BrandingTrustEditor } from './branding/trust/BrandingTrustEditor';
import { BrandingMarketEditor } from './branding/market/BrandingMarketEditor';
import { BrandingOverviewEditor } from './branding/overview/BrandingOverviewEditor';

export interface DashboardSectionDefinition {
  type: DashboardSectionType;
  name: string;
  category: 'header' | 'metrics' | 'data' | 'actions' | 'navigation' | 'matrix' | 'embeds' | 'branding';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  viewComponent: React.ComponentType<{ config: any; [key: string]: any }>;
  editorComponent: React.ComponentType<{ config: any; onChange: (updated: any) => void }>;
  defaultConfig: DashboardSectionConfig;
}

export const DASHBOARD_SECTIONS_REGISTRY: Partial<Record<DashboardSectionType, DashboardSectionDefinition>> & Record<string, DashboardSectionDefinition> = {
  header: {
    type: 'header',
    name: 'הדר וברכת פתיחה',
    category: 'header',
    description: 'ברכה מותאמת אישית, תאריך עברי/לועזי, תג דייר וכפתורי פעולה עליונים.',
    icon: Layout,
    viewComponent: DashboardHeaderSection,
    editorComponent: DashboardHeaderEditor,
    defaultConfig: {
      greetingPrefix: 'שלום וברוך הבא',
      showDateRange: true,
      showTenantBadge: true,
      primaryActionText: 'פעולה חדשה',
      primaryActionUrl: '#',
      subtitle: 'לוח בקרה מעודכן וסנכרון נתונים',
    },
  },
  stats: {
    type: 'stats',
    name: 'כרטיסי מדדים ו-KPI',
    category: 'metrics',
    description: 'מדדי ביצוע, הכנסות, מנויים, פניות ושיחות וואטסאפ עם אחוזי שינוי.',
    icon: TrendingUp,
    viewComponent: DashboardStatsSection,
    editorComponent: DashboardStatsEditor,
    defaultConfig: {
      columns: 4,
      stats: [
        { id: 'st-1', label: 'הכנסות החודש', value: '₪24,000', change: '+12%', isPositive: true, icon: 'TrendingUp', color: 'emerald' },
        { id: 'st-2', label: 'אנשי קשר חדשים', value: '88', change: '+5%', isPositive: true, icon: 'Users', color: 'indigo' },
      ],
    },
  },
  table: {
    type: 'table',
    name: 'טבלת נתונים מסונכרנת',
    category: 'data',
    description: 'טבלת רשומות מחוברת לקולקציית דייר, חיפוש, מיון, ייצוא ופגינציה.',
    icon: Table,
    viewComponent: DashboardTableSection,
    editorComponent: DashboardTableEditor,
    defaultConfig: {
      title: 'רשומות אחרונות',
      subtitle: 'סנכרון ישיר מקולקציית הדייר',
      collectionName: 'contacts',
      columns: [
        { key: 'name', label: 'שם', sortable: true, type: 'text' },
        { key: 'phone', label: 'טלפון', sortable: false, type: 'text' },
        { key: 'date', label: 'תאריך', sortable: true, type: 'date' },
        { key: 'status', label: 'סטטוס', sortable: true, type: 'badge' },
      ],
      showSearch: true,
      showExport: true,
      pageSize: 5,
    },
  },
  quickActions: {
    type: 'quickActions',
    name: 'כפתורי פעולה מהירים',
    category: 'actions',
    description: 'קיצורי דרך מהירים לפעולות נפוצות, סליקה, וואטסאפ, טפסים ועמודים.',
    icon: Zap,
    viewComponent: DashboardQuickActionsSection,
    editorComponent: DashboardQuickActionsEditor,
    defaultConfig: {
      title: 'פעולות מהירות',
      layout: 'row',
      buttons: [
        { id: 'b-1', label: 'איש קשר חדש', icon: 'UserPlus', variant: 'primary', actionType: 'navigate', target: '/contacts' },
        { id: 'b-2', label: 'הפקת חיוב', icon: 'Receipt', variant: 'secondary', actionType: 'navigate', target: '/kesher-payments' },
      ],
    },
  },
  floatingDock: {
    type: 'floatingDock',
    name: 'מעגן צף (Cashwan Floating Dock)',
    category: 'navigation',
    description: 'מעגן ניווט יוקרתי צף תחתון או צדדי עם גישה לכל מודולי הדייר.',
    icon: Navigation,
    viewComponent: DashboardFloatingDockSection,
    editorComponent: DashboardFloatingDockEditor,
    defaultConfig: {
      dockPosition: 'bottom',
      showLabels: true,
      items: [
        { id: 'fd-1', label: 'דשבורד', icon: 'LayoutDashboard', targetUrl: '/dashboard' },
        { id: 'fd-2', label: 'לקוחות', icon: 'Users', targetUrl: '/contacts' },
        { id: 'fd-3', label: 'סליקה', icon: 'CreditCard', targetUrl: '/kesher-payments' },
        { id: 'fd-4', label: 'וואטסאפ', icon: 'MessageCircle', targetUrl: '/whatsapp-hub' },
      ],
    },
  },
  commandMatrix: {
    type: 'commandMatrix',
    name: 'מטריצת פקודות ורכיבים',
    category: 'matrix',
    description: 'גריד אריחי רכיבים מודולריים המפרק את מרכז השליטה למודולים עצמאיים.',
    icon: Grid,
    viewComponent: CommandMatrixSection,
    editorComponent: CommandMatrixEditor,
    defaultConfig: {
      title: 'מרכז שליטה ורכיבי מערכת',
      subtitle: 'גישה ישירה ומודולרית לכל יכולות הדייר',
      columns: 3,
      items: [
        { id: 'cm-1', title: 'אנליטיקה ו-CRM', subtitle: 'ניהול לידים וכרטיסי לקוח', icon: 'Users', moduleId: 'crm-analytics', targetUrl: '/crm-analytics', badge: 'פעיל' },
        { id: 'cm-2', title: 'סליקה וחיובים', subtitle: 'עסקאות אשראי והוראות קבע', icon: 'CreditCard', moduleId: 'kesher-payments-hub', targetUrl: '/kesher-payments', badge: 'פעיל' },
        { id: 'cm-3', title: 'וואטסאפ אוטומציות', subtitle: 'בוטים, שיגור וסטטוסים', icon: 'MessageCircle', moduleId: 'KosWhatsUp', targetUrl: '/whatsapp-hub', badge: 'פעיל' },
      ],
    },
  },
  slotWidget: {
    type: 'slotWidget',
    name: 'ווידג׳ט מוטמע (Capability Slot)',
    category: 'embeds',
    description: 'הטמעת ממשק מוכן מרכיב שכן דרך חוזה הליבה ללא תלות הדדית.',
    icon: Layers,
    viewComponent: DashboardSlotWidgetSection,
    editorComponent: DashboardSlotWidgetEditor,
    defaultConfig: {
      slotName: 'form-renderer',
      title: 'טופס לידים מוטמע',
      props: {},
    },
  },

  // =========================================================================
  // BRANDING SECTIONS (KosBranding Dashboard Adaptation - Cashwan Rule 7)
  // =========================================================================
  brandingIdentity: {
    type: 'brandingIdentity',
    name: 'זהות עסקית וליבה (Identity)',
    category: 'branding',
    description: 'לוגו, שם המותג, סלוגן, חזון עסקי וכפתורי פעולה לאשף גילוי AI וסורק תוכן.',
    icon: Building2,
    viewComponent: BrandingIdentitySection,
    editorComponent: BrandingIdentityEditor,
    defaultConfig: {
      companyName: 'המותג שלך',
      slogan: 'הצעת ערך מרכזית וסלוגן עסקי מנצח',
      orgType: 'חברה בע״מ',
      primaryPurpose: 'מתן פתרונות דיגיטליים וטכנולוגיים מתקדמים',
      primaryButtonText: 'הפעל אשף גילוי AI',
      primaryButtonAction: 'open_ai_wizard',
      secondaryButtonText: 'סרוק אתר (Scraper)',
      secondaryButtonAction: 'open_scraper',
    },
  },
  brandingVoice: {
    type: 'brandingVoice',
    name: 'שפת מותג וטון דיבור (Voice)',
    category: 'branding',
    description: 'אופן פנייה ללקוח, תאימות מגזר ושפה, סטטוס שבת, מילות כוח ומטריצת טמפרמנט.',
    icon: Sliders,
    viewComponent: BrandingVoiceSection,
    editorComponent: BrandingVoiceEditor,
    defaultConfig: {
      title: 'שפת מותג, טון דיבור וערכים',
      genderAddressing: 'plural',
      sectorCompliance: 'business',
      shabbatObservant: true,
      powerWords: ['צמיחה', 'תוצאות', 'דיגיטל', 'חדשנות'],
      forbiddenWords: ['זול', 'אולי', 'בלתי אפשרי'],
      formality: 3,
      warmth: 4,
      humor: 2,
      energy: 3,
      empathy: 4,
      primaryButtonText: 'צור אסטרטגיית תוכן',
      primaryButtonAction: 'open_strategy',
      secondaryButtonText: 'סרוק סגנון קיים',
      secondaryButtonAction: 'open_scraper',
    },
  },
  brandingAudience: {
    type: 'brandingAudience',
    name: 'קהלי יעד ובידול (Audience)',
    category: 'branding',
    description: 'הצעת ערך ייחודית (UVP), תגיות קהלי יעד, פרסונות מפתח ומענה להתנגדויות לקוח.',
    icon: Target,
    viewComponent: BrandingAudienceSection,
    editorComponent: BrandingAudienceEditor,
    defaultConfig: {
      title: 'קהלי יעד, פרסונות ובידול (UVP)',
      mainUvp: 'פתרון מקיף ואוטונומי החוסך שעות עבודה יקרות ומגדיל את יחס ההמרה בעסק',
      targetAudiences: ['בעלי עסקים קטנים', 'מנהלי שיווק דיגיטלי', 'יועצים עצמאיים'],
      personas: [
        { name: 'יוסי כהן', role: 'מנכ״ל עסק משפחתי', painPoints: 'חוסר זמן לניהול לידים', aspirations: 'אוטומציה מלאה' },
      ],
      commonObjections: [
        { objection: 'זה יקר לי מדי', rebuttal: 'החזר ההשקעה מושג כבר בחודש הראשון מתוך חיסכון בשעות עבודה' },
      ],
      primaryButtonText: 'חלץ קהלים ופרסונות (AI)',
      primaryButtonAction: 'open_ai_wizard',
      secondaryButtonText: 'סרוק מתחרים',
      secondaryButtonAction: 'open_scraper',
    },
  },
  brandingEcosystem: {
    type: 'brandingEcosystem',
    name: 'מבנה שירותים ואקוסיסטם (Ecosystem)',
    category: 'branding',
    description: 'סל שירותי ליבה, מוצר דגל מוביל, חבילות עסקיות, אירועים קהילתיים ומודלי תמחור.',
    icon: Layers,
    viewComponent: BrandingEcosystemSection,
    editorComponent: BrandingEcosystemEditor,
    defaultConfig: {
      title: 'מבנה שירותים, מוצרי דגל ואקוסיסטם',
      services: ['ייעוץ שיווקי ואסטרטגי', 'בניית דפי נחיתה ומערכות CRM', 'אוטומציות WhatsApp חכמות'],
      products: [
        { id: '1', name: 'חבילת צמיחה מלאה', price: '₪2,900/חודש', description: 'כלים, אוטומציה וליווי אישי', badge: 'הכי נמכר' },
        { id: '2', name: 'הטמעת בוט AI', price: '₪1,400', description: 'בוט אוטונומי לשיחות ומכירות' },
      ],
      annualEvents: ['כנס עסקים שנתי', 'סדנת מכירות רבעונית'],
      communities: ['קהילת וואטסאפ לבעלי עסקים VIP'],
      primaryButtonText: 'הפק חבילות עסקיות (AI)',
      primaryButtonAction: 'open_ai_wizard',
      secondaryButtonText: 'סרוק מחירונים',
      secondaryButtonAction: 'open_scraper',
    },
  },
  brandingDesignTokens: {
    type: 'brandingDesignTokens',
    name: 'שפה חזותית וצבעים (Design Tokens)',
    category: 'branding',
    description: 'פלטת צבעי המותג (Primary/Secondary), גופן מוביל, רדיוס פינות ותצוגה חיה של לחצן.',
    icon: Palette,
    viewComponent: BrandingDesignTokensSection,
    editorComponent: BrandingDesignTokensEditor,
    defaultConfig: {
      title: 'שפה חזותית, צבעים וטיפוגרפיה',
      primaryColor: '#6366f1',
      secondaryColor: '#0ea5e9',
      backgroundColor: '#0f172a',
      fontFamily: 'Heebo, sans-serif',
      borderRadius: 'rounded-xl',
      buttonStyle: 'מלא עם צל (Solid)',
      primaryButtonText: 'חלץ צבעים מאתר (Scraper)',
      primaryButtonAction: 'open_scraper',
    },
  },
  brandingTrust: {
    type: 'brandingTrust',
    name: 'אמינות וסליקה בטוחה (Trust & Legal)',
    category: 'branding',
    description: 'פרטי התקשרות ותמיכה, ח.פ, ימי ביטול עסקה כחוק, ותעודות אבטחת תשלום.',
    icon: ShieldCheck,
    viewComponent: BrandingTrustSection,
    editorComponent: BrandingTrustEditor,
    defaultConfig: {
      title: 'אמינות, תאימות משפטית וסליקה בטוחה',
      legalEntityId: '515000000',
      supportPhone: '03-1234567',
      supportEmail: 'support@brand.co.il',
      cancellationPolicyDays: 14,
      guaranteeHeadline: '100% שביעות רצון מובטחת | אפשרות ביטול בהתאם לחוק הגנת הצרכן',
      sslCertified: true,
      legalAddress: 'רחוב הבונים 4, תל אביב',
      primaryButtonText: 'סנכרן תנאי שירות (AI)',
      primaryButtonAction: 'open_strategy',
    },
  },
  brandingMarket: {
    type: 'brandingMarket',
    name: 'מחקר שוק ומתחרים (Market Agent)',
    category: 'branding',
    description: 'סוכן AI אוטונומי המנתח מגמות שוק, מתחרים מרכזיים והזדמנויות בידול עסקיות.',
    icon: Globe,
    viewComponent: BrandingMarketSection,
    editorComponent: BrandingMarketEditor,
    defaultConfig: {
      title: 'סוכן מחקר שוק, מתחרים ובידול (AI)',
      topInsight: 'זוהתה הזדמנות בידול במענה ממוקד לעסקים בינוניים הדורשים אוטומציה היברידית',
      competitors: ['מתחרה א׳ בע״מ', 'חברת פתרונות דיגיטליים ב׳', 'סוכנות שיווק ג׳'],
      opportunities: [
        { title: 'חבילת מנוי חודשי', impact: 'גבוה (MRR יציב)', recommendation: 'להשיק חבילת ריטיינר קבועה' },
        { title: 'שירות תמיכה 24/7', impact: 'בינוני', recommendation: 'שילוב בוט מענה אוטומטי ללידים בלילה' },
      ],
      primaryButtonText: 'הפעל סוכן מחקר שוק (AI)',
      primaryButtonAction: 'run_market_agent',
      secondaryButtonText: 'סרוק מתחרה חדש',
      secondaryButtonAction: 'open_scraper',
    },
  },
  brandingOverview: {
    type: 'brandingOverview',
    name: 'מבט-על ושלמות מותג (Brand Overview)',
    category: 'branding',
    description: 'מדד שלמות ה-Brand DNA באחוזים, רשימת המלצות להשלמה וקיצורי דרך לכלל האזורים.',
    icon: Sparkles,
    viewComponent: BrandingOverviewSection,
    editorComponent: BrandingOverviewEditor,
    defaultConfig: {
      title: 'מבט-על: שלמות אפיון המותג והמלצות AI',
      completenessScore: 85,
      statusText: 'אפיון המותג מוכן לשיגור פעילות מלאה',
      recommendations: [
        'הגדר את פלטת הצבעים המדויקת של המותג',
        'הוסף 2 מוצרי דגל עם תמחור מוגדר',
        'חבר את מספר הח.פ והכתובת המשפטית לתחתית העמודים',
      ],
      primaryButtonText: 'הפעל אשף גילוי AI',
      primaryButtonAction: 'open_ai_wizard',
      secondaryButtonText: 'סרוק אתר קיים',
      secondaryButtonAction: 'open_scraper',
    },
  },
};
