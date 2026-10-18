import React from 'react';
import { SectionType } from '../types/pageBuilder.types';

// Display Views
import { HeroSection } from '../sections/hero/HeroSection';
import { TestimonialsSection } from '../sections/testimonials/TestimonialsSection';
import { LogoMarqueeSection } from '../sections/logoMarquee/LogoMarqueeSection';
import { StatsBentoSection } from '../sections/statsBento/StatsBentoSection';
import { BeforeAfterSection } from '../sections/beforeAfter/BeforeAfterSection';
import { GeoLocalSection } from '../sections/geoLocal/GeoLocalSection';
import { CourseBannerSection } from '../sections/courseBanner/CourseBannerSection';
import { CampaignHeaderSection } from '../sections/campaign/CampaignHeaderSection';
import { CampaignTiersSection } from '../sections/campaign/CampaignTiersSection';
import { CampaignDonorsSection } from '../sections/campaign/CampaignDonorsSection';
import { VideoGallerySection } from '../sections/videoGallery/VideoGallerySection';
import { ImageListingSection } from '../sections/imageListing/ImageListingSection';
import { FaqSection } from '../sections/faq/FaqSection';
import { TimerSection } from '../sections/timer/TimerSection';
import { PricingSection } from '../sections/pricing/PricingSection';
import { RichContentSection } from '../sections/richContent/RichContentSection';
import { CommunitySection } from '../sections/community/CommunitySection';
import { LivePostsGridSection } from '../sections/livePosts/LivePostsGridSection';
import { LandingSection } from '../sections/landing/LandingSection';
import { ContactSection } from '../sections/contact/ContactSection';
import { SmartFormSection } from '../sections/smartForm/SmartFormSection';
import { FlowPlayerSection } from '../sections/flowPlayer/FlowPlayerSection';
import { HeaderSection } from '../sections/header/HeaderSection';
import { KosvidioSection } from '../sections/kosvidio/KosvidioSection';
import { KosvidioGallerySection } from '../sections/kosvidioGallery/KosvidioGallerySection';
import { TiktokHeroSection } from '../sections/tiktokHero/TiktokHeroSection';
import { DynamicListingSection } from '../sections/dynamicListing/DynamicListingSection';
import { FutureContentSection } from '../sections/futureContent/FutureContentSection';

// Editors
import { HeaderEditor } from '../sections/header/HeaderEditor';
import { KosvidioEditor } from '../sections/kosvidio/KosvidioEditor';
import { KosvidioGalleryEditor } from '../sections/kosvidioGallery/KosvidioGalleryEditor';
import { TiktokHeroEditor } from '../sections/tiktokHero/TiktokHeroEditor';
import { DynamicListingEditor } from '../sections/dynamicListing/DynamicListingEditor';
import { FutureContentEditor } from '../sections/futureContent/FutureContentEditor';
import { HeroEditor } from '../sections/hero/HeroEditor';
import { TestimonialsEditor } from '../sections/testimonials/TestimonialsEditor';
import { LogoMarqueeEditor } from '../sections/logoMarquee/LogoMarqueeEditor';
import { StatsBentoEditor } from '../sections/statsBento/StatsBentoEditor';
import { BeforeAfterEditor } from '../sections/beforeAfter/BeforeAfterEditor';
import { GeoLocalEditor } from '../sections/geoLocal/GeoLocalEditor';
import { CourseBannerEditor } from '../sections/courseBanner/CourseBannerEditor';
import { CampaignHeaderEditor } from '../sections/campaign/CampaignHeaderEditor';
import { CampaignTiersEditor } from '../sections/campaign/CampaignTiersEditor';
import { CampaignDonorsEditor } from '../sections/campaign/CampaignDonorsEditor';
import { VideoGalleryEditor } from '../sections/videoGallery/VideoGalleryEditor';
import { ImageListingEditor } from '../sections/imageListing/ImageListingEditor';
import { FaqSectionEditor } from '../sections/faq/FaqSectionEditor';
import { TimerEditor } from '../sections/timer/TimerEditor';
import { PricingEditor } from '../sections/pricing/PricingEditor';
import { RichContentEditor } from '../sections/richContent/RichContentEditor';
import { CommunityEditor } from '../sections/community/CommunityEditor';
import { LivePostsGridEditor } from '../sections/livePosts/LivePostsGridEditor';
import { LandingEditor } from '../sections/landing/LandingEditor';
import { ContactEditor } from '../sections/contact/ContactEditor';
import { SmartFormEditor } from '../sections/smartForm/SmartFormEditor';
import { FlowPlayerEditor } from '../sections/flowPlayer/FlowPlayerEditor';
import { CustomHtmlView } from '../sections/customHtml/CustomHtmlView';
import { CustomHtmlEditor } from '../sections/customHtml/CustomHtmlEditor';
import { LiveAnalyticsSection } from '../sections/liveAnalytics/LiveAnalyticsSection';
import { LiveAnalyticsEditor } from '../sections/liveAnalytics/LiveAnalyticsEditor';
import { EventRsvpSection } from '../sections/eventRsvp/EventRsvpSection';
import { EventRsvpEditor } from '../sections/eventRsvp/EventRsvpEditor';


// Icons
import {
  LayoutTemplate,
  Grid,
  LayoutGrid,
  GraduationCap,
  Target,
  Heart,
  Users,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Clock,
  CreditCard,
  FileText,
  MessageCircle,
  Calendar,
  Send,
  Phone,
  Sparkles,
  Star,
  Layers,
  TrendingUp,
  SlidersHorizontal,
  MapPin,
  Menu,
  Activity,
  BarChart3,
  CalendarCheck2,
  Smartphone,
} from 'lucide-react';

export interface SectionDefinition {
  type: SectionType;
  name: string;
  category: 'headers' | 'content' | 'social_proof' | 'marketing' | 'media' | 'campaign' | 'contact' | 'forms';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  viewComponent: React.ComponentType<{ config: any; [key: string]: any }>;
  editorComponent: React.ComponentType<{ config: any; onChange: (updated: any) => void }>;
  defaultConfig: any;
}

export const SECTION_REGISTRY: Record<SectionType, SectionDefinition> = {
  header: {
    type: 'header',
    name: 'תפריט ראשי (Header)',
    category: 'headers',
    description: 'תפריט עליון מודרני, לוגו מותג, פריסות שונות ותפריט דינמי',
    icon: Menu,
    viewComponent: HeaderSection,
    editorComponent: HeaderEditor,
    defaultConfig: {
      type: 'header',
      visible: true,
      anchorId: 'header',
      layout: 'capsule-floating',
      sticky: true,
      useBrandLogo: true,
      showLogoText: true,
      menuMode: 'dynamic-tenant',
      showLoginButton: true,
      showCtaButton: true,
      ctaButtonText: 'התחל עכשיו',
      ctaButtonUrl: '#contact',
      showWhatsApp: false,
      showPhone: false,
      desktopMenuDisplay: 'links',
      customLinks: [],
    },
  },
  hero: {
    type: 'hero',
    name: 'אזור ראשי 2.0 (Hero)',
    category: 'headers',
    description: 'כותרת ענקית, באדג׳ הכרזה, הוכחה חברתית (Avatars), כפתורי פעולה ומסגרת Showcase',
    icon: LayoutTemplate,
    viewComponent: HeroSection,
    editorComponent: HeroEditor,
    defaultConfig: {
      type: 'hero',
      visible: true,
      anchorId: 'hero',
      title: 'הפלטפורמה המובילה לניהול קהילות ודפי נחיתה',
      subtitle: 'חדש! גרסה 2.0 זמינה כעת',
      description: 'עצבו, ערכו ופרסמו דפי אינטרנט מתקדמים בקלות, במהירות ובהתאמה מלאה למובייל.',
      imageSrc: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      layout: 'bento-hero',
      heroStyle: 'mesh-glow',
      buttonsVisible: true,
      primaryButton: { text: 'התחל עכשיו בחינם', url: '#pricing', target: '_self' },
      secondaryButton: { text: 'צפה בהדגמה חיה', url: '#testimonials', target: '_self' },
      announcementBadge: { text: 'שחרור רשמי של גרסת 2026 זמין כעת', url: '#about' },
      socialProofAvatars: {
        visible: true,
        ratingText: 'מדורג 4.9/5 על ידי יותר מ-1,200+ לקוחות',
        starsCount: 5,
        avatars: [
          { id: '1', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
          { id: '2', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
          { id: '3', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
        ],
      },
      backgroundColor: 'transparent',
    },
  },

  liveAnalytics: {
    type: 'liveAnalytics',
    name: 'אנליטיקס וביצועי דף חיים (Live Analytics)',
    category: 'marketing',
    description: 'הצגת מדדי צפיות, מבקרים, המרות ותנועה ממנועי AI ומגוגל בזמן אמת',
    icon: Activity,
    viewComponent: LiveAnalyticsSection as any,
    editorComponent: LiveAnalyticsEditor as any,
    defaultConfig: {
      type: 'liveAnalytics',
      visible: true,
      anchorId: 'analytics',
      title: 'מדדי ביצועים ואנליטיקס בזמן אמת',
      subtitle: 'נתוני צפייה, אינטראקציה ותנועה ממנועי AI ומגוגל',
      adminOnly: false,
      displayStyle: 'bento',
      showViews: true,
      showUniqueVisitors: true,
      showCtaClicks: true,
      showLeads: true,
      showConversionRate: true,
      showTrafficSources: true,
      showAiTrafficBadge: true,
      showGa4StatusBadge: true,
      customBadgeText: 'Live Telemetry Active',
    },
  },

  testimonials: {
    type: 'testimonials',
    name: 'המלצות וביקורות לקוחות 2.0',
    category: 'social_proof',
    description: 'כרטיסי המלצה עם כוכבי דירוג, ציונים, תגיות לקוח מאומת וסיכום ביקורות',
    icon: Star,
    viewComponent: TestimonialsSection,
    editorComponent: TestimonialsEditor,
    defaultConfig: {
      type: 'testimonials',
      visible: true,
      anchorId: 'testimonials',
      title: 'מה הלקוחות שלנו מספרים?',
      subtitle: 'ביקורות מאומתות',
      description: 'ההצלחה שלכם היא המדד האמיתי למקצועיות שלנו.',
      showRatingSummary: true,
      overallRating: 4.9,
      totalReviewsCount: '250+ ביקורות בגוגל וברשת',
      trustBadgeText: 'לקוחות מאומתים 100%',
      backgroundColor: 'transparent',
      items: [
        {
          id: '1',
          name: 'רועי שפירא',
          role: 'מנכ״ל ומייסד',
          company: 'סטודיו קריאייטיב',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          rating: 5,
          content: '״המערכת שינתה לנו את כל תהליך העבודה! תוך פחות מיום אחד העלינו דף נחיתה מושלם שייצר לנו עשרות לידים איכותיים.״',
          isVerified: true,
          badge: 'לקוח VIP',
        },
        {
          id: '2',
          name: 'מיכל אברהמי',
          role: 'מנהלת שיווק וקהילה',
          company: 'עמותת שותפים לדרך',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
          rating: 5,
          content: '״החיבור לוואטסאפ ול-CRM עובד בצורה חלקה ומופלאה. הכל ברור, בעברית מלאה וברמת גימור שאין באף מערכת אחרת.״',
          isVerified: true,
          badge: 'קנייה מאומתת',
        },
      ],
    },
  },

  logoMarquee: {
    type: 'logoMarquee',
    name: 'שורת שותפים ולוגואים נעה',
    category: 'social_proof',
    description: 'קרוסלת לוגואים נעה בלולאה אינסופית להצגת מותגים, שותפים ולקוחות',
    icon: Layers,
    viewComponent: LogoMarqueeSection,
    editorComponent: LogoMarqueeEditor,
    defaultConfig: {
      type: 'logoMarquee',
      visible: true,
      anchorId: 'partners',
      title: 'נבחר על ידי הארגונים והחברות המובילות במשק',
      grayscale: false,
      backgroundColor: '#08080a',
      logos: [
        { id: '1', name: 'Google Partner', logoUrl: 'https://cdn.worldvectorlogo.com/logos/google-g-2015.svg' },
        { id: '2', name: 'Microsoft Azure', logoUrl: 'https://cdn.worldvectorlogo.com/logos/microsoft-5.svg' },
        { id: '3', name: 'Meta Verified', logoUrl: 'https://cdn.worldvectorlogo.com/logos/meta-1.svg' },
        { id: '4', name: 'Stripe Security', logoUrl: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg' },
        { id: '5', name: 'AWS Cloud', logoUrl: 'https://cdn.worldvectorlogo.com/logos/amazon-web-services-2.svg' },
      ],
    },
  },

  statsBento: {
    type: 'statsBento',
    name: 'מדדי מפתח והישגים (Stats Bento)',
    category: 'social_proof',
    description: 'הצגת 4 מדדים מספריים מרשימים עם אייקונים, צבעים ותגיות',
    icon: TrendingUp,
    viewComponent: StatsBentoSection,
    editorComponent: StatsBentoEditor,
    defaultConfig: {
      type: 'statsBento',
      visible: true,
      anchorId: 'stats',
      title: 'התוצאות מדברות בעד עצמן',
      subtitle: 'מדדי ביצוע מובילים',
      backgroundColor: 'transparent',
      stats: [
        { id: '1', number: '99.8', suffix: '%', label: 'שביעות רצון לקוחות', description: 'מדד שירות מעולה', color: 'emerald', icon: 'Heart' },
        { id: '2', number: '12,500', suffix: '+', label: 'משתמשים פעילים', description: 'קהילה בצמיחה מתמדת', color: 'indigo', icon: 'Users' },
        { id: '3', number: '3.4', suffix: 'X', label: 'גידול ממוצע בהמרות', description: 'תוצאה מוכחת לכל לקוח', color: 'purple', icon: 'TrendingUp' },
        { id: '4', number: '24/7', suffix: '', label: 'תמיכה וליווי אישי', description: 'מענה אנושי מהיר בוואטסאפ', color: 'amber', icon: 'Sparkles' },
      ],
    },
  },

  beforeAfter: {
    type: 'beforeAfter',
    name: 'סליידר השוואת לפני / אחרי',
    category: 'marketing',
    description: 'סליידר אינטראקטיבי אינטואיטיבי המאפשר למשתמש לגרור ולהשוות תוצאות',
    icon: SlidersHorizontal,
    viewComponent: BeforeAfterSection,
    editorComponent: BeforeAfterEditor,
    defaultConfig: {
      type: 'beforeAfter',
      visible: true,
      anchorId: 'beforeAfter',
      title: 'השפעה ושינוי: לפני ואחרי',
      subtitle: 'תוצאות מוכחות בשטח',
      description: 'גררו את הסליידר כדי לראות את ההבדל הדרמטי בתוצאות.',
      beforeImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1000&q=80',
      afterImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
      beforeLabel: 'לפני',
      afterLabel: 'אחרי',
      defaultPosition: 50,
      backgroundColor: 'transparent',
    },
  },

  geoLocal: {
    type: 'geoLocal',
    name: 'סניף מקומי וקידום GEO',
    category: 'contact',
    description: 'הצגת כתובת מקומית, אזורי שירות מורשים, שעות פתיחה ומפת Google Maps אינטראקטיבית',
    icon: MapPin,
    viewComponent: GeoLocalSection,
    editorComponent: GeoLocalEditor,
    defaultConfig: {
      type: 'geoLocal',
      visible: true,
      anchorId: 'location',
      title: 'הסניף והפעילות המקומית שלנו',
      subtitle: 'שירות מקומי בפריסה רחבה',
      businessName: 'מרכז הפעילות והשירות',
      city: 'תל אביב',
      address: 'דרך מנחם בגין 144, תל אביב',
      phone: '03-1234567',
      whatsapp: '0501234567',
      serviceAreas: ['תל אביב וגוש דן', 'ירושלים והסביבה', 'שרון והמרכז'],
      openingHours: ['א׳ - ה׳: 09:00 - 19:00', 'יום ו׳: 09:00 - 13:00'],
      mapEmbedUrl: 'https://maps.google.com/maps?q=Tel%20Aviv&t=&z=13&ie=UTF8&iwloc=&output=embed',
      backgroundColor: 'transparent',
    },
  },

  pricing: {
    type: 'pricing',
    name: 'מחירונים וחבילות 2.0',
    category: 'marketing',
    description: 'טבלת חבילות ומחירים עם מתג חודשי/שנתי, 20% חיסכון והבלטת מסלול Pro',
    icon: CreditCard,
    viewComponent: PricingSection,
    editorComponent: PricingEditor,
    defaultConfig: {
      type: 'pricing',
      visible: true,
      anchorId: 'pricing',
      title: 'תוכניות ומחירים שקופים ומותאמים',
      subtitle: 'בחרו את המסלול המתאים ביותר עבורכם',
      showBillingToggle: true,
      yearlyDiscountBadge: 'חיסכון של 20%',
      backgroundColor: 'transparent',
      packages: [
        { id: '1', name: 'בסיסי (Starter)', priceMonthly: '₪99', priceYearly: '₪79', period: '/ חודש', description: 'למשתמשים יחידים ומתחילים', features: ['עד 5 דפים מעוצבים', 'חיבור דומיין מותאם', 'טפסי לידים בסיסיים', 'תמיכה באימייל'], buttonText: 'התחל בחינם', buttonUrl: '#contact' },
        { id: '2', name: 'מקצועי (Pro 2026)', priceMonthly: '₪249', priceYearly: '₪199', period: '/ חודש', description: 'לקהילות, מוסדות ועסקים בצמיחה', isFeatured: true, badge: 'הכי משתלם ⭐️', features: ['דפים ועמודים ללא הגבלה', 'סנכרון מלא למערכת CRM', 'עוזר AI ליצירת תוכן ותמונות', 'תמיכת VIP 24/7 בוואטסאפ'], buttonText: 'בחר מסלול Pro', buttonUrl: '#contact' },
        { id: '3', name: 'ארגוני (Enterprise)', priceMonthly: '₪590', priceYearly: '₪470', period: '/ חודש', description: 'לארגונים ורשתות עם דרישות מתקדמות', features: ['פתרון מותאם אישית (Custom SLA)', 'מנהל חשבון אישי ייעודי', 'אינטגרציות API מתקדמות', 'הדרכות צוות פרונטליות'], buttonText: 'צור קשר להתאמה', buttonUrl: '#contact' },
      ],
    },
  },

  mainContent: {
    type: 'mainContent',
    name: 'באנר קורס / תוכן מודגש',
    category: 'content',
    description: 'באנר מרכזי מודגש עם נקודות מפתח, כפתורי הרשמה ופס תחתון צבעוני',
    icon: GraduationCap,
    viewComponent: CourseBannerSection,
    editorComponent: CourseBannerEditor,
    defaultConfig: {
      type: 'mainContent',
      visible: true,
      anchorId: 'mainContent',
      title: 'הצטרפו למחזור ההכשרה המקצועי הקרוב',
      subtitle: 'הרשמה מוקדמת בהנחה מיוחדת',
      features: ['ליווי אישי של מנטור צמוד', 'פרויקטים מעשיים מהעולם האמיתי', 'תעודת הסמכה בינלאומית', 'גישה לכל החיים להקלטות'],
      buttonsVisible: true,
      primaryButton: { text: 'שריינו מקום עכשיו', url: '#' },
      imageSrc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      bottomStripeColor: '#4f46e5',
      backgroundColor: 'transparent',
    },
  },

  campaignHeader: {
    type: 'campaignHeader',
    name: 'מד התקדמות קמפיין תרומות',
    category: 'campaign',
    description: 'מד יעד כספי, סכום שגויס, גרף התקדמות וסטטיסטיקות תורמים וימים שנותרו',
    icon: Target,
    viewComponent: CampaignHeaderSection,
    editorComponent: CampaignHeaderEditor,
    defaultConfig: {
      type: 'campaignHeader',
      visible: true,
      anchorId: 'campaignHeader',
      title: 'קמפיין שותפות: בונים את העתיד',
      subtitle: 'יחד מגיעים אל היעד',
      targetGoal: 100000,
      totalRaised: 64500,
      donorsCount: 184,
      daysLeft: 14,
      backgroundColor: 'transparent',
    },
  },

  campaignTiers: {
    type: 'campaignTiers',
    name: 'מדרגות תרומה וסכומים',
    category: 'campaign',
    description: 'כפתורי סכומים מהירים, תרומה חד-פעמית והוראות קבע עם כרטיסיות הדגשה',
    icon: Heart,
    viewComponent: CampaignTiersSection,
    editorComponent: CampaignTiersEditor,
    defaultConfig: {
      type: 'campaignTiers',
      visible: true,
      anchorId: 'campaignTiers',
      title: 'בחרו סכום לתרומה והיו שותפים',
      subtitle: 'כל תרומה מתקבלת בברכה ומקדמת את הפעילות',
      donationType: 'both',
      backgroundColor: 'transparent',
      tiers: [
        { id: '1', title: 'שותף בבניין', amount: 180, description: 'תמיכה חודשית בפעילות', isPopular: false },
        { id: '2', title: 'בונה עולם', amount: 360, description: 'הקדשת יום לימוד שלם', isPopular: true, badgeText: 'הכי נבחר' },
        { id: '3', title: 'עמוד התווך', amount: 1000, description: 'הנצחה על לוח התורמים', isPopular: false },
      ],
    },
  },

  campaignDonors: {
    type: 'campaignDonors',
    name: 'כרטיסיות תורמים ושגרירים',
    category: 'campaign',
    description: 'פיד תורמים בזמן אמת, חיפוש שמות, מיון לפי סכומים והקדשות אישיות',
    icon: Users,
    viewComponent: CampaignDonorsSection,
    editorComponent: CampaignDonorsEditor,
    defaultConfig: {
      type: 'campaignDonors',
      visible: true,
      anchorId: 'campaignDonors',
      title: 'תורמים אחרונים ושגרירים',
      showSearch: true,
      showSort: true,
      cardLayout: 'grid-3',
      backgroundColor: 'transparent',
      donors: [
        { id: '1', name: 'משפחת כהן', amount: 1800, date: 'לפני שעתיים', message: 'לרפואת כל חולי עמו ישראל', isAnonymous: false },
        { id: '2', name: 'תורם אנונימי', amount: 500, date: 'לפני 4 שעות', isAnonymous: true },
        { id: '3', name: 'ישראל ישראלי', amount: 360, date: 'אתמול', message: 'בהצלחה רבה בפעילות הקדושה!', isAnonymous: false },
      ],
    },
  },

  videoGallery: {
    type: 'videoGallery',
    name: 'גלריית וידאו ומדיה',
    category: 'media',
    description: 'נגן וידאו מרכזי (YouTube / Vimeo / MP4) עם תמונות ממוזערות',
    icon: Video,
    viewComponent: VideoGallerySection,
    editorComponent: VideoGalleryEditor,
    defaultConfig: {
      type: 'videoGallery',
      visible: true,
      anchorId: 'videoGallery',
      title: 'צפו בסרטוני הדרכה והרצאות',
      subtitle: 'מגוון תכני וידאו באיכות גבוהה',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      desktopHeight: '480px',
      backgroundColor: 'transparent',
      images: [],
    },
  },

  imageListing: {
    type: 'imageListing',
    name: 'גלריית תמונות וכרטיסים',
    category: 'media',
    description: 'גריד תמונות רספונסיבי עם כותרות, תגיות ואפקטים',
    icon: ImageIcon,
    viewComponent: ImageListingSection,
    editorComponent: ImageListingEditor,
    defaultConfig: {
      type: 'imageListing',
      visible: true,
      anchorId: 'imageListing',
      title: 'גלריית תמונות מהאירועים שלנו',
      imagesPerRow: 3,
      backgroundColor: 'transparent',
      images: [
        { id: '1', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', title: 'אירוע פתיחה מרכזי', subtitle: 'תשרי תשפ״ו' },
        { id: '2', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', title: 'צוות ההדרכה והפיתוח', subtitle: 'כנס שנתי' },
        { id: '3', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', title: 'מרכז הלמידה הדיגיטלי', subtitle: 'חדר מחשבים' },
      ],
    },
  },

  faq: {
    type: 'faq',
    name: 'שאלות ותשובות (FAQ 2.0)',
    category: 'content',
    description: 'עיצוב Notion מודרני עם שורת חיפוש מהירה וכרטיס פנייה ישירה לוואטסאפ',
    icon: HelpCircle,
    viewComponent: FaqSection,
    editorComponent: FaqSectionEditor,
    defaultConfig: {
      type: 'faq',
      visible: true,
      anchorId: 'faq',
      title: 'שאלות ותשובות נפוצות',
      subtitle: 'כל מה שרציתם לדעת על הפלטפורמה והשירות',
      showSearchBar: true,
      showContactCard: true,
      backgroundColor: 'transparent',
      items: [
        { id: '1', question: 'איך מתחילים לעבוד עם המערכת?', answer: 'נרשמים בקלות, בוחרים תבנית עיצוב או מתחילים מאפס, ומעצבים את העמוד בעזרת עורך הבית הוויזואלי הנוח.' },
        { id: '2', question: 'האם ניתן לחבר דומיין מותאם אישית?', answer: 'בהחלט! המערכת תומכת בחיבור דומיין פרטי לכל עמוד, קמפיין או דף נחיתה שתקימו.' },
        { id: '3', question: 'איך עובד הסנכרון עם מערכת ה-CRM?', answer: 'כל פנייה דרך הטפסים בעמוד נשמרת ומוזרמת באופן אוטומטי לכרטיסיות הלידים במערכת ה-CRM.' },
      ],
    },
  },

  timer: {
    type: 'timer',
    name: 'טיימר ספירה לאחור 2.0',
    category: 'marketing',
    description: 'שעון רץ לאחור עם כרטיסיות זכוכית וספרות ענק לקידום אירועים והשקות',
    icon: Clock,
    viewComponent: TimerSection,
    editorComponent: TimerEditor,
    defaultConfig: {
      type: 'timer',
      visible: true,
      anchorId: 'timer',
      title: 'הספירה לאחור החלה',
      subtitle: 'אל תפספסו את ההזדמנות להצטרף',
      targetDate: '2026-12-31T23:59:59',
      backgroundColor: 'transparent',
      boxBackgroundColor: '#0f172a',
      numberColor: '#ffffff',
      labelColor: '#94a3b8',
    },
  },

  richContent: {
    type: 'richContent',
    name: 'אודות / תוכן מעוצב',
    category: 'content',
    description: 'עורך תוכן עשיר עבור פסקאות אודות, חזון, סיפורי הצלחה ופירוט נרחב',
    icon: FileText,
    viewComponent: RichContentSection,
    editorComponent: RichContentEditor,
    defaultConfig: {
      type: 'richContent',
      visible: true,
      anchorId: 'richContent',
      heading: 'אודות הפרויקט והחזון שלנו',
      body: '<p>אנו פועלים מתוך תחושת שליחות עמוקה לחבר, להנגיש ולהעצים את הקהילה בכל מקום בעולם.</p><p>הפלטפורמה שלנו פותחה במיוחד כדי לתת מענה שלם, טכנולוגי ואיכותי לכל יוזמה וקהילה.</p>',
      layout: 'standard',
      backgroundColor: 'transparent',
    },
  },

  community: {
    type: 'community',
    name: 'קהילה וצ׳אט וואטסאפ 2.0',
    category: 'contact',
    description: 'כרטיס קהילה חמה, הדמיית צ׳אט WhatsApp אותנטית ותגית חברים',
    icon: MessageCircle,
    viewComponent: CommunitySection,
    editorComponent: CommunityEditor,
    defaultConfig: {
      type: 'community',
      visible: true,
      anchorId: 'community',
      title: 'הצטרפו לקהילה שלנו',
      subtitle: 'קהילה חמה, תומכת ומחוברת',
      description: 'קבוצת הוואטסאפ של הקהילה היא המקום להתעדכן בזמן אמת, לשאול שאלות ולקחת חלק פעיל.',
      quote: '״הכוח של הקהילה הוא הערבות ההדדית והחיבור בין כולם״',
      buttonText: 'הצטרפות לקבוצת הוואטסאפ',
      whatsappNumber: '972545947701',
      badgeTitle: '5,000+ חברים',
      badgeSubtitle: 'בכל רחבי הארץ',
      backgroundColor: 'transparent',
    },
  },

  livePosts: {
    type: 'livePosts',
    name: 'עדכונים ואירועים (פוסטים)',
    category: 'content',
    description: 'גריד פוסטים וידיעות אחרונות עם תמונות, תאריכים ותגיות',
    icon: Calendar,
    viewComponent: LivePostsGridSection,
    editorComponent: LivePostsGridEditor,
    defaultConfig: {
      type: 'livePosts',
      visible: true,
      anchorId: 'livePosts',
      title: 'עדכונים ואירועים אחרונים',
      description: 'כל מה שחדש וקורה בפעילות ובקהילה שלנו',
      backgroundColor: 'transparent',
      customPages: [
        { id: '1', title: 'סיכום כנס הקיץ השנתי בהשתתפות מאות משפחות', excerpt: 'חוויה מעצימה ומרגשת של חיבור ולימוד משותף...', date: '15 באוגוסט 2026', tag: 'אירועים', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', linkUrl: '#' },
        { id: '2', title: 'השקת תוכנית המלגות לסטודנטים וחוקרים', excerpt: 'פתיחת מסלול חדש להענקת מלגות מחקר וסיוע לימודי...', date: '02 באוגוסט 2026', tag: 'חדשות', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', linkUrl: '#' },
        { id: '3', title: 'פרויקט שיפוץ והרחבת מרכז הפעילות הקהילתי', excerpt: 'התקדמות העבודות לקראת פתיחת השנה החדשה...', date: '28 ביולי 2026', tag: 'פיתוח', imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80', linkUrl: '#' },
      ],
    },
  },

  landingSection: {
    type: 'landingSection',
    name: 'דף נחיתה וטופס הרשמה',
    category: 'marketing',
    description: 'אזור קמפיין ייעודי עם טופס איסוף לידים מובנה',
    icon: Send,
    viewComponent: LandingSection,
    editorComponent: LandingEditor,
    defaultConfig: {
      type: 'landingSection',
      visible: true,
      anchorId: 'landingSection',
      title: 'השאירו פרטים לקבלת מידע נוסף',
      subtitle: 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
      description: 'מלאו את הפרטים הקצרים בטופס ונציג מקצועי יחזור אליכם בהקדם האפשרי.',
      buttonText: 'שלח פרטים עכשיו',
      backgroundColor: 'transparent',
    },
  },

  contact: {
    type: 'contact',
    name: 'אזור צור קשר ו-GEO',
    category: 'contact',
    description: 'פרטי התקשרות (טלפון, מייל, כתובת, וואטסאפ), מפה וטופס פנייה ישיר',
    icon: Phone,
    viewComponent: ContactSection,
    editorComponent: ContactEditor,
    defaultConfig: {
      type: 'contact',
      visible: true,
      anchorId: 'contact',
      title: 'צרו איתנו קשר',
      subtitle: 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות',
      phone: '03-1234567',
      email: 'info@example.com',
      address: 'רחוב הרצל 1, תל אביב',
      whatsapp: '972545947701',
      showForm: true,
      backgroundColor: 'transparent',
    },
  },

  smartForm: {
    type: 'smartForm',
    name: 'טופס חכם רב-שלבי (Smart Form)',
    category: 'forms',
    description: 'טופס יוקרתי שלב-אחר-שלב, בחירה מרשימת טפסים, עריכה ושמירה בשם חדש ב-mod_forms',
    icon: Sparkles,
    viewComponent: SmartFormSection as any,
    editorComponent: SmartFormEditor as any,
    defaultConfig: {
      type: 'smartForm',
      visible: true,
      anchorId: 'smartForm',
      sectionTitle: 'שאלון התאמה והצטרפות',
      sectionSubtitle: 'מלאו את השאלון הקצר שלב אחר שלב לקבלת מענה אישי',
      containerWidth: 'md',
      backgroundColor: 'transparent',
    },
  },

    flowPlayer: {
    type: 'flowPlayer',
    name: 'נגן זרימה אינטראקטיבי (Flow Player)',
    category: 'marketing',
    description: 'הטמעת נציג מכירות / מצגת אינטראקטיבית עם וידאו, שכבות ממשק וזיהוי קולי ב-AI',
    icon: Video,
    viewComponent: FlowPlayerSection as any,
    editorComponent: FlowPlayerEditor as any,
    defaultConfig: {
      type: 'flowPlayer',
      visible: true,
      anchorId: 'interactivePlayer',
      campaignId: 'sales_rep_interactive_01',
      campaignSlug: 'sales_rep_interactive_01',
      showSectionHeader: false,
      title: 'הנציג הדיגיטלי שלנו',
      subtitle: 'שוחחו עם נציג ה-AI שלנו בלייב',
    },
  },

    customHtml: {
    type: 'customHtml',
    name: 'קוד AI מותאם אישית',
    category: 'content',
    description: 'אזור שנבנה אוטומטית על ידי ה-AI באמצעות HTML/Tailwind',
    icon: LayoutTemplate,
    viewComponent: CustomHtmlView as any,
    editorComponent: CustomHtmlEditor as any,
    defaultConfig: {
      type: 'customHtml',
      visible: true,
      rawHtmlTemplate: '',
    },
  },

  eventRsvp: {
    type: 'eventRsvp',
    name: 'אירוע, הגעה ו-RSVP חכם',
    category: 'marketing',
    description: 'כרטיסיות Waze, יומן, אוטומציית WhatsApp מתוזמנת, כפתורי אישור הגעה ומונה אורחים חי',
    icon: CalendarCheck2,
    viewComponent: EventRsvpSection as any,
    editorComponent: EventRsvpEditor as any,
    defaultConfig: {
      type: 'eventRsvp',
      visible: true,
      anchorId: 'event-rsvp',
      title: 'אירוע חגיגי ואישור הגעה',
      subtitle: 'כל הפרטים החשובים במקום אחד – נווטו בקלות, סמנו ביומן והבטיחו את מקומכם',
      eventTitle: 'כנס קהילה והשקה עסקית',
      eventDate: '2026-11-15',
      eventTime: '19:30',
      eventEndTime: '22:00',
      locationName: 'מתחם האירועים היוקרתי קושאן',
      locationAddress: 'דרך מנחם בגין 144, תל אביב',
      wazeQuery: 'דרך מנחם בגין 144 תל אביב',
      description: 'נשמח לראותכם באירוע המיוחד שלנו! כיבוד עשיר, הרצאת אורח והזדמנויות נטוורקינג מרתקות.',
      showWazeCard: true,
      wazeCardTitle: 'ניווט ב-Waze',
      wazeCardSubtitle: 'פתיחה ישירה של אפליקציית Waze להגעה נוחה',
      showCalendarCard: true,
      calendarCardTitle: 'הוסף ליומן',
      calendarCardSubtitle: 'סנכרון מיידי ל-Google Calendar או Apple Calendar',
      showWhatsappCard: true,
      whatsappCardTitle: 'תזכורת אוטומטית בוואטסאפ',
      whatsappCardSubtitle: 'קבלו תזכורת והודעת עדכון מתוזמנת ישירות לנייד',
      whatsappReminderTimeText: 'שעתיים לפני האירוע',
      showRsvpButtons: true,
      yesButtonText: 'מגיע/ה בשמחה',
      noButtonText: 'לא מתאפשר לי הפעם',
      yesCountInitial: 38,
      noCountInitial: 4,
      showAttendeeCounter: true,
      attendeeCounterLabel: 'אישרו הגעה עד כה',
    },
  },

  kosvidio: {
    type: 'kosvidio',
    name: 'נגן ועמוד וידאו Kosvidio',
    category: 'media',
    description: 'נגן חדשני, כותרת, תוויות עדינות, שיתוף, תגובות יוטיוב, תיאור קצר ומאמר עומק SEO/AISEO',
    icon: Video,
    viewComponent: KosvidioSection as any,
    editorComponent: KosvidioEditor as any,
    defaultConfig: {
      type: 'kosvidio',
      visible: true,
      anchorId: 'kosvidio',
      youtubeVideoId: 'dQw4w9WgXcQ',
      title: 'המדריך המקיף לקידום וידאו ו-SEO בשנת 2026',
      channelName: 'קושאן דיגיטל',
      channelSubscribers: '24.5K',
      verifiedBadge: true,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      ambientGlow: true,
      showTheaterMode: true,
      tags: ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
      enableSocialShare: true,
      shortDescriptionBadge: 'על הסרטון בכמה מילים',
      shortDescription: 'הסבר תכליתי ומעשי על הפיכת תוכן וידאו למקור תנועה אורגנית עצום בגוגל ויוטיוב.',
      longDescriptionMarkdown: `## חשיבות הוידאו במנועי החיפוש המודרניים
וידאו הוא כבר מזמן לא רק פלטפורמת בידור, אלא אחד ממנועי החיפוש והסמכות המשמעותיים ביותר ברשת. כשמשלבים וידאו איכותי בתוך עמוד תוכן עשיר ומובנה, גוגל ומנועי החיפוש המבוססים על AI מתעדפים את התוכן בצורה דרמטית.

### 3 עקרונות הברזל לקידום וידאו אורגני:
- **סכמה מובנית (Schema.org VideoObject):** עוזרת לזחלנים להבין את זמן ההעלאה, מילות המפתח ותמצית הסרטון.
- **תוכן עומק טקסטואלי:** מנועי AI קוראים את תמלול והסבר הוידאו לצורך הצגת תשובות ישירות.
- **מעורבות קהילה אותנטית:** תגובות, לייקים ושיתופים מגבירים את אותות האמון וה-EEAT.`,
      keyTakeaways: [
        'שילוב נגן וידאו עם מאמר עומק מכפיל את זמן השהייה הממוצע בעמוד פי 3.',
        'סימון Schema מלא של VideoObject ו-FAQPage מקפיץ את שיעור ההקלקה (CTR) בתוצאות החיפוש.',
        'תוויות עדינות ושיתוף מהיר בוואטסאפ מניעים תנועה ויראלית מיידית.',
      ],
      comments: [],
      faqs: [
        {
          question: 'איך עמוד כזה עוזר לקידום האורגני בגוגל?',
          answer: 'עמוד Kosvidio משלב נגן וידאו אינטראקטיבי יחד עם מאמר עומק עשיר במילות מפתח וסכמת VideoObject מלאה, מה שמאפשר להופיע גם בתוצאות הוידאו וגם בתוצאות האורגניות המובילות.',
        },
        {
          question: 'האם התגובות מיוטיוב מתעדכנות או שניתן להוסיף תגובות ישירות?',
          answer: 'התגובות מעוצבות בסגנון המוכר של יוטיוב, והגולשים באתר יכולים להגיב, לתת לייקים ולפתח דיון פורה ישירות מתוך העמוד.',
        },
      ],
      callToAction: {
        title: 'רוצים לייצר נוכחות דיגיטלית ועמודי וידאו מובילים?',
        subtitle: 'הצוות שלנו יסייע לכם להפוך כל סרטון יוטיוב למכונת לידים וסמכות אורגנית',
        buttonText: 'דברו איתנו עכשיו',
        buttonLink: '#contact',
      },
    },
  },

  tiktokHero: {
    type: 'tiktokHero',
    name: 'הירו טיקטוק סטייל (9:16 Reel)',
    category: 'media',
    description: 'נגן וידאו אנכי 9:16 בסגנון TikTok/Reels עם הוק שיווקי, כרטיס מותג צף וכפתור פתיחת טופס לידים במודאל',
    icon: Smartphone,
    viewComponent: TiktokHeroSection as any,
    editorComponent: TiktokHeroEditor as any,
    defaultConfig: {
      type: 'tiktokHero',
      visible: true,
      anchorId: 'tiktok-hero',
      video: {
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
        muted: true,
        loop: true,
        autoplay: true,
        showTopBadges: false,
        showBadge: true,
        badgeText: 'VIDEO',
        durationText: '9.9s',
        seasonEpisodeText: 'S2 Command the Room',
        showSoundWaveAnimation: true,
        showMuteButton: true,
      },
      overlay: {
        mode: 'gradient',
        gradientDirection: 'to-b',
        opacity: 45,
      },
      ambientGlow: true,
      showHeadline: true,
      headline: 'מחפש עבודה',
      headlineColor: '#ffffff',
      headlineSize: 'xl',
      headlineWeight: 'extrabold',
      headlineShadow: true,
      card: {
        enabled: true,
        showImage: true,
        showTag: true,
        showText: true,
        tag: '• חוקי גיוס והשמה חדשים לשנת 2026 •',
        title: 'קושאן – כל אדם זה נכס',
        subtitle: 'מערכת פרימיום מתקדמת המעניקה מענה מדויק, מהיר ומותאם אישית לכל צורך עסקי.',
        style: 'solid',
      },
      ctaButton: {
        text: 'מצא עכשיו',
        iconName: 'Sparkles',
        showIcon: true,
        iconPosition: 'left',
        paddingY: 'compact',
        bgColor: '#0284c7',
        textColor: '#ffffff',
        pulseEffect: true,
        actionType: 'modal_form',
      },
      modalTitle: 'השארת פרטים לקבלת הצעה',
      modalSubtitle: 'מלאו את הפרטים ונחזור אליכם בהקדם האפשרי',
      form: {
        enabled: true,
        form_type: 'standard',
        submit_button_text: 'שליחת פנייה מיידית',
        fields: [
          {
            label: 'שם מלא',
            type: 'text',
            map_to: 'conta_name',
            required: true,
            default_value: '',
            options: '',
            step: 1,
            widthPercentage: 50,
            placeholder: 'ישראל ישראלי',
          },
          {
            label: 'טלפון נייד',
            type: 'tel',
            map_to: 'conta_phone',
            required: true,
            default_value: '',
            options: '',
            step: 1,
            widthPercentage: 50,
            placeholder: '050-1234567',
          },
          {
            label: 'דואר אלקטרוני',
            type: 'email',
            map_to: 'email',
            required: false,
            default_value: '',
            options: '',
            step: 1,
            widthPercentage: 100,
            placeholder: 'your@email.com',
          },
        ],
      },
    },
  },

  dynamicListing: {
    type: 'dynamicListing',
    name: 'ליסטינג תוכן וקולקציות דינמי',
    category: 'content',
    description: 'ליסטינג רב-תכליתי ב-5 פריסות פרימיום (Bento, זכוכית מרחפת, קרוסלה, מגזין ופינטרסט) עם סינון טאבים וחיפוש לייב',
    icon: LayoutGrid,
    viewComponent: DynamicListingSection as any,
    editorComponent: DynamicListingEditor as any,
    defaultConfig: {
      type: 'dynamicListing',
      visible: true,
      anchorId: 'dynamic-listing',
      badge: 'תוכן ופעילות',
      title: 'הפרויקטים והפעילויות המובילות',
      subtitle: 'מגוון שירותים, עדכונים ואירועים מובילים בהתאמה אישית ובפריסה חדשנית',
      source: 'custom',
      layout: 'bento-showcase',
      gridColumns: 3,
      aspectRatio: '16:9',
      showCategoryFilter: true,
      showSearchBar: true,
      searchPlaceholder: 'חיפוש מהיר בתוכן...',
      effectStyle: 'border-beam',
      categories: ['אירועים', 'שירותים', 'חדשות', 'פיתוח'],
      items: [
        {
          id: 'item-1',
          title: 'סיכום כנס החדשנות השנתי 2026',
          subtitle: 'אירוע השיא שאיחד מאות מומחים ויזמים מכל רחבי הארץ להצגת פריצות דרך טכנולוגיות.',
          excerpt: 'כנס החדשנות השנתי לשנת 2026 כלל עשרות הרצאות מרתקות, סדנאות מעשיות והכרזות על שיתופי פעולה פורצי דרך. המשתתפים נהנו מחיבור ישיר למובילי דעה בתעשייה וחשיפה לכלים העדכניים ביותר.',
          imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
          category: 'אירועים',
          badge: 'מומלץ',
          date: '15 באוגוסט 2026',
          actionType: 'modal',
          price: 'כניסה חופשית',
        },
        {
          id: 'item-2',
          title: 'השקת תוכנית ההכשרה הדיגיטלית',
          subtitle: 'מסלול מואץ ומעשי להקניית מיומנויות מתקדמות עם ליווי צמוד של מנטורים בכירים.',
          excerpt: 'תוכנית ההכשרה נבנתה במיוחד כדי לגשר על הפער בין תיאוריה לפרקטיקה. הסטודנטים זוכים לפרויקטים אמיתיים, ביקורת קוד אישית וסיוע בהשמה בעבודה.',
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
          category: 'שירותים',
          date: '02 באוגוסט 2026',
          actionType: 'modal',
          price: '₪1,200',
        },
        {
          id: 'item-3',
          title: 'פרויקט הרחבת מרכז הפעילות והקהילה',
          subtitle: 'שדרוג המבנה המרכזי והקמת חללי עבודה ומפגש שיתופיים ומאובזרים.',
          excerpt: 'במסגרת עבודות הפיתוח שודרגו התשתיות, הותקנו מערכות שמע ותצוגה מתקדמות, ונוספו חדרים ייעודיים לפגישות וימי עיון.',
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
          category: 'פיתוח',
          date: '28 ביולי 2026',
          actionType: 'modal',
        },
        {
          id: 'item-4',
          title: 'פתיחת הרשמה לסיורי למידה ונטוורקינג',
          subtitle: 'מפגשים בלתי אמצעיים עם צוותי הפיתוח וההנהלה.',
          excerpt: 'הצטרפו לסיורים מקצועיים מאחורי הקלעים הכוללים שיח פתוח, שאלות ותשובות וחיבורים מקצועיים.',
          imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
          category: 'אירועים',
          date: '10 ביולי 2026',
          actionType: 'modal',
        },
      ],
      primaryButton: {
        text: 'צפייה בכל מאגר הפעילויות',
        url: '#',
      },
    },
  },

  futureContent2027: {
    type: 'futureContent2027',
    name: 'אזור תוכן עתידני 2027 (Multi-Mode)',
    category: 'content',
    description: 'אזור תוכן פורץ דרך משנת 2027 הכולל 3 תצורות יוקרה: בנטו מרחבי, מגזין קינטי ואיים צפים, עם החלפה אינטראקטיבית בלייב',
    icon: Sparkles,
    viewComponent: FutureContentSection as any,
    editorComponent: FutureContentEditor as any,
    defaultConfig: {
      type: 'futureContent2027',
      visible: true,
      anchorId: 'future-content',
      source: 'tenant_pages',
      activeMode: 'prism-bento',
      allowVisitorSwitching: true,
      badge: 'חוויית תוכן 2027',
      title: 'העתיד של עולם התוכן והחדשנות',
      subtitle: 'שילוב רב-ממדי של עומק מרחבי, טיפוגרפיה קינטית ואיי תוכן אינטראקטיביים עם תקצירי AI קוליים',
      ambientMeshGlow: true,
      ambientGlowColor: '#6366f1',
      effectStyle: 'prism-beam',
      items: [
        {
          id: 'future-1',
          title: 'אדריכלות המידע והתוכן לשנת 2027',
          subtitle: 'מעבר מפריסות שטוחות ומיושנות לממשקים מרחביים חיים המגיבים לתשומת הלב של המשתמש בזמן אמת.',
          description: 'בשנת 2027 הממשק כבר אינו אוסף קופסאות סטטיות. השילוב של תאורה סביבתית (Ray-tracing Ray Glow), זכוכית נוזלית עמוקה ומיקרו-אינטראקציות קינטיות יוצר תחושת יוקרה, עניין ומעורבות משתמש חסרת תקדים.',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          category: 'חזון ומגמות',
          tag: '• תפיסה מרחבית •',
          badge: 'FEATURED',
          readTime: '3 דק׳ קריאה',
          audioDuration: '01:45',
          metrics: [
            { label: 'זמן שהייה', value: '+340%', trend: 'עלייה' },
            { label: 'מעורבות', value: '98.4%', trend: 'שיא' },
          ],
          ctaText: 'סקירה מעמיקה',
          ctaUrl: '#',
          featured: true,
        },
        {
          id: 'future-2',
          title: 'סוכני תוכן אוטונומיים ומיקרו-האזנה',
          subtitle: 'אינטגרציית קול AI חיה המייצרת תקציר מותאם אישית בלחיצת כפתור אחת ללא צורך בקריאה ממושכת.',
          description: 'מערכת התוכן מנגישה לכל משתמש פודקאסט ממוקד של 90 שניות הממצה את עיקרי הדברים בקול ישראלי טבעי ורהוט, בליווי אנימציית גלי קול פעילה.',
          imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
          category: 'סוכני AI',
          tag: '• סאונד קינטי •',
          readTime: '2 דק׳ קריאה',
          audioDuration: '01:20',
          metrics: [
            { label: 'האזנות', value: '45.2K', trend: 'פופולרי' },
          ],
          ctaText: 'האזן עכשיו',
          ctaUrl: '#',
        },
        {
          id: 'future-3',
          title: 'קפסולות מידע ואיי גלישה צפים',
          subtitle: 'חשיפה מהירה (Peek Sheets) ללא טעינת דפים מחדש ומבלי לקטוע את חוויית הגלישה השוטפת.',
          description: 'כל אי מידע נפתח בצורה נוזלית ורכה למגירת תוכן אינטראקטיבית המרכזת נתונים, גרפים, פעולות מהירות ויצירת קשר ישירה.',
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
          category: 'ממשקים חכמים',
          tag: '• ביצועים •',
          readTime: '4 דק׳ קריאה',
          audioDuration: '02:10',
          metrics: [
            { label: 'מהירות תגובה', value: '12ms', trend: 'מיידי' },
          ],
          ctaText: 'פתיחת קפסולה',
          ctaUrl: '#',
        },
        {
          id: 'future-4',
          title: 'אקו-סיסטם אינטגרטיבי וחיבור מערכות',
          subtitle: 'שילוב חלק עם מודולי CRM, וואטסאפ ותשלומים ללא קטיעות וללא הפניות חיצוניות מגושמות.',
          description: 'התשתית החדשה מאפשרת סגירת עסקאות, הרשמה לאירועים ותיאום פגישות ישירות מתוך שכבת התוכן באפס חיכוך.',
          imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
          category: 'אינטגרציות',
          tag: '• המרה גבוהה •',
          readTime: '3 דק׳ קריאה',
          audioDuration: '01:15',
          ctaText: 'לפרטים נוספים',
          ctaUrl: '#',
        },
      ],
      primaryButton: {
        text: 'גלה את כל פתרונות 2027',
        url: '#',
      },
      secondaryButton: {
        text: 'תיאום שיחת הדגמה',
        url: '#',
      },
    },
  },

  kosvidioGallery: {
    type: 'kosvidioGallery',
    name: 'גלריית סרטוני וידאו (KOSVIDIO)',
    category: 'media',
    description:
      'גלריית סרטונים חכמה המקושרת לסלאג KOSVIDIO ב-3 פריסות (וידאו גדול ותחתיו קטנים, רשימה אנכית, גלילה אופקית ללא גלישה) עם תנאים לוגיים וסינכרון מהמיתוג',
    icon: Video,
    viewComponent: KosvidioGallerySection as any,
    editorComponent: KosvidioGalleryEditor as any,
    defaultConfig: {
      type: 'kosvidioGallery',
      visible: true,
      anchorId: 'kosvidio-gallery',
      badge: 'KOSVIDIO • גלריית וידאו חכמה',
      title: '',
      subtitle: '',
      description: '',
      layout: 'spotlight-grid',
      allowVisitorLayoutSwitch: true,
      source: 'tenant_kosvidio',
      maxVideos: 6,
      logicRules: {
        sortBy: 'newest',
        filterTag: '',
        filterKeyword: '',
        minViews: 0,
        onlyPublished: false,
        maxVideos: 6,
      },
      clickBehavior: 'inline_and_link',
      backgroundColor: '#090d16',
      titleColor: '#ffffff',
      descriptionColor: '#94a3b8',
      accentColor: '#ef4444',
      cardBgColor: '#111827',
      ctaButtonText: 'לכל סרטוני הערוץ (KOSVIDIO)',
      ctaButtonUrl: '/kosvidio',
      items: [],
    },
  },
};


