import { TenantStylePreset } from '../../../core/contracts';

export type SectionType =
  | 'header'
  | 'hero'  | 'testimonials'
  | 'logoMarquee'
  | 'statsBento'
  | 'liveAnalytics'
  | 'beforeAfter'
  | 'geoLocal'
  | 'pricing'
  | 'mainContent'
  | 'campaignHeader'
  | 'campaignTiers'
  | 'campaignDonors'
  | 'videoGallery'
  | 'imageListing'
  | 'faq'
  | 'timer'
  | 'richContent'
  | 'community'
  | 'livePosts'
  | 'landingSection'
  | 'contact'
  | 'smartForm'
  | 'flowPlayer'
  | 'customHtml'
  | 'eventRsvp'
  | 'kosvidio'
  | 'kosvidioGallery'
  | 'videoEngagement'
  | 'tiktokHero'
  | 'dynamicListing'
  | 'futureContent2027';

export interface CookieConsentSettings {
  enabled?: boolean;
  position?: 'bottom-banner' | 'floating-box' | 'center-modal';
  title?: string;
  message?: string;
  acceptButtonText?: string;
  declineButtonText?: string;
  privacyPolicyLinkText?: string;
  privacyPolicyUrl?: string;
  termsLinkText?: string;
  termsUrl?: string;
  badgeText?: string;
  primaryColor?: string;
}

export interface GlobalPageSettings {
  siteTitle?: string;
  siteLogoUrl?: string;
  companyName?: string;
  legalEntityId?: string; // ח.פ / ע.מ / מספר תאגיד
  slogan?: string;
  theme?: TenantStylePreset | 'navy' | 'modern' | 'dark' | 'emerald' | 'purple' | 'sunset' | 'light-minimal' | 'cyber-neon';
  layoutArchetype?: LayoutArchetype;
  headerLayout?: 'capsule-floating' | 'classic' | 'centered' | 'minimal' | 'transparent' | 'floating-glass';
  headerSticky?: boolean;
  isHeaderVisible?: boolean;
  isFooterVisible?: boolean;
  googleAnalyticsId?: string; // GA4 Measurement ID e.g. G-XXXXXXXXXX
  googleTagManagerId?: string; // GTM Container ID e.g. GTM-WDDMHZJQ
  googleSearchConsoleVerification?: string; // Google Search Console verification code / meta tag
  googleSearchConsolePropertyUrl?: string; // Property URL or sc-domain in Google Search Console
  googleSearchConsoleConnected?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  textColorH1?: string;
  textColorH2?: string;
  textColorH3?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  fontFamily?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonStyle?: 'solid' | 'gradient' | 'outline' | 'glass';
  contactWhatsApp?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  floatingContactWidget?: {
    enabled?: boolean;
    buttonText?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    enableShare?: boolean;
    shareTitle?: string;
    shareText?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
      telegram?: string;
      waze?: string;
    };
  };
  cookieConsent?: CookieConsentSettings;
  navLinks?: Array<{ label: string; url: string; isButton?: boolean }>;
  footerText?: string;
  customCss?: string;
  brandDnaSynced?: boolean;
}

export interface GeoSeoSettings {
  enabled?: boolean;
  targetCity?: string;
  targetRegion?: string;
  targetCountry?: string;
  serviceAreas?: string[];
  localBusinessName?: string;
  localBusinessType?: 'LocalBusiness' | 'ProfessionalService' | 'EducationalOrganization' | 'NGO' | 'Store' | 'MedicalBusiness';
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  priceRange?: string;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
  googleMapEmbedUrl?: string;
  localizedKeywords?: string[];
}

export interface SeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  faviconUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'business.business';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  author?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  googleAuditScore?: number;
  googleAuditRecommendations?: string[];
  // AI Engine Optimization (GEO / AIO) Fields
  aiKnowledgeSummary?: string; // Direct snippet for ChatGPT, Gemini, Perplexity
  aiTargetQuestions?: string[]; // Questions this page directly answers for AI bots
  aiBotIndexingEnabled?: boolean; // GPTBot, ClaudeBot, PerplexityBot
  aiEntitySchemaType?: 'Organization' | 'ProfessionalService' | 'Product' | 'FAQPage' | 'Article';
  geo?: GeoSeoSettings;
}

export type DeviceVisibilityMode =
  | 'all'
  | 'desktop_only'
  | 'tablet_only'
  | 'mobile_only'
  | 'desktop_tablet'
  | 'mobile_tablet';

export interface ScreenVisibilityConfig {
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

export interface BaseSectionConfig {
  id: string;
  type: SectionType;
  visible: boolean;
  mobileHidden?: boolean;
  deviceVisibility?: DeviceVisibilityMode;
  screenVisibility?: ScreenVisibilityConfig;
  anchorId?: string;
  backgroundColor?: string;
  customClasses?: string;
}

export type LayoutArchetype =
  | 'bento_hub'
  | 'editorial_boutique'
  | 'warm_community'
  | 'knowledge_academy'
  | 'direct_showcase';

export interface LayoutArchetypeSpec {
  id: LayoutArchetype;
  name: string;
  englishLabel: string;
  description: string;
  badge: string;
  icon: string;
  sectionOrder: SectionType[];
  headerLayout: 'floating-glass' | 'minimal' | 'capsule-floating' | 'classic';
  heroLayout: 'bento-hero' | 'split' | 'centered' | 'mesh-glow';
  listingLayout: 'bento-showcase' | 'editorial-list' | 'snap-carousel' | 'floating-grid';
  statsLayout: 'bento-4' | 'cards-3' | 'row-4';
  testimonialsLayout: 'grid' | 'carousel' | 'masonry';
  defaultCtaPrimary: string;
  defaultCtaSecondary: string;
}

export const LAYOUT_ARCHETYPES: Record<LayoutArchetype, LayoutArchetypeSpec> = {
  bento_hub: {
    id: 'bento_hub',
    name: 'פורטל והאב אקולוגי (Bento Ecosystem)',
    englishLabel: 'Bento Tech Hub',
    description: 'מבנה הייטק מודרני מבוסס קוביות בנטו, מדדים בולטים ומאגר פעילות עשיר ואינטראקטיבי',
    badge: 'פורטל טכנולוגי • Bento',
    icon: 'LayoutGrid',
    sectionOrder: ['header', 'hero', 'statsBento', 'dynamicListing', 'richContent', 'community', 'testimonials', 'faq', 'contact'],
    headerLayout: 'floating-glass',
    heroLayout: 'bento-hero',
    listingLayout: 'bento-showcase',
    statsLayout: 'bento-4',
    testimonialsLayout: 'grid',
    defaultCtaPrimary: 'גלה את המערכת',
    defaultCtaSecondary: 'שיחה ב-WhatsApp',
  },
  editorial_boutique: {
    id: 'editorial_boutique',
    name: 'מגזין ובוטיק יוקרתי (Editorial Luxury)',
    englishLabel: 'Editorial Boutique',
    description: 'עימוד עריכתי מרווח, טיפוגרפיה סמכותית ורשימת תוכן מגנטית אלגנטית במעבר עכבר',
    badge: 'בוטיק עריכתי • Minimalist',
    icon: 'Newspaper',
    sectionOrder: ['header', 'hero', 'richContent', 'dynamicListing', 'statsBento', 'testimonials', 'faq', 'contact'],
    headerLayout: 'capsule-floating',
    heroLayout: 'split',
    listingLayout: 'editorial-list',
    statsLayout: 'cards-3',
    testimonialsLayout: 'masonry',
    defaultCtaPrimary: 'תיאום פגישה אישית',
    defaultCtaSecondary: 'הצצה לעשייה שלנו',
  },
  warm_community: {
    id: 'warm_community',
    name: 'קהילה וחיבור אנושי (Warm Community)',
    englishLabel: 'Warm Community',
    description: 'פוקוס קהילתי חם: פיד הפוסטים והמפגשים בראש העמוד, צורות רכות ושיח פתוח',
    badge: 'קהילה ועשייה • Community First',
    icon: 'Users',
    sectionOrder: ['header', 'hero', 'community', 'livePosts', 'dynamicListing', 'testimonials', 'statsBento', 'faq', 'contact'],
    headerLayout: 'floating-glass',
    heroLayout: 'mesh-glow',
    listingLayout: 'snap-carousel',
    statsLayout: 'cards-3',
    testimonialsLayout: 'carousel',
    defaultCtaPrimary: 'הצטרפו למעגל',
    defaultCtaSecondary: 'בואו נדבר בוואטסאפ',
  },
  knowledge_academy: {
    id: 'knowledge_academy',
    name: 'קמפוס ידע והכשרות (Knowledge Academy)',
    englishLabel: 'Academy Campus',
    description: 'מבנה לימודי מקצועי: סילבוס ותוכניות בראש, קורסים פופולריים, תעודות ומסלולי הרשמה',
    badge: 'קמפוס אקדמי • Academy',
    icon: 'GraduationCap',
    sectionOrder: ['header', 'hero', 'mainContent', 'dynamicListing', 'pricing', 'statsBento', 'testimonials', 'faq', 'contact'],
    headerLayout: 'classic',
    heroLayout: 'split',
    listingLayout: 'bento-showcase',
    statsLayout: 'row-4',
    testimonialsLayout: 'grid',
    defaultCtaPrimary: 'שריון מקום במחזור הקרוב',
    defaultCtaSecondary: 'הורדת הסילבוס המלא',
  },
  direct_showcase: {
    id: 'direct_showcase',
    name: 'המרה וסליקה ישירה (High-Impact Showcase)',
    englishLabel: 'Direct Sales',
    description: 'מבנה מכירתי עוצמתי: הצעת ערך, מוצרי דגל, טיימר הטבה, סליקה מהירה וביקורות רוכשים',
    badge: 'סליקה והמרה • High Impact',
    icon: 'Zap',
    sectionOrder: ['header', 'hero', 'pricing', 'timer', 'dynamicListing', 'smartForm', 'testimonials', 'faq', 'contact'],
    headerLayout: 'floating-glass',
    heroLayout: 'bento-hero',
    listingLayout: 'floating-grid',
    statsLayout: 'bento-4',
    testimonialsLayout: 'carousel',
    defaultCtaPrimary: 'הזמינו עכשיו',
    defaultCtaSecondary: 'רכישה מאובטחת',
  },
};

export type PageCategory =
  | 'home'
  | 'info_content'
  | 'event'
  | 'checkout'
  | 'community'
  | 'fundraising'
  | 'course'
  | 'service_product'
  | 'youtube_post'
  | 'general';

export interface PageCategoryConfig {
  key: PageCategory;
  slugPrefix: string;
  slugPrefixLower: string;
  label: string;
  shortLabel: string;
  description: string;
  badgeStyle: string;
  filterBadgeStyle: string;
}

export interface ArchiveTemplateSpec {
  category: PageCategory;
  name: string;
  slugPrefix: string;
  sections: SectionType[];
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  keywords: string[];
}

export const ARCHIVE_7_SECTIONS_SPECS: Record<
  'info_content' | 'event' | 'checkout' | 'community' | 'fundraising' | 'course',
  ArchiveTemplateSpec
> = {
  info_content: {
    category: 'info_content',
    name: 'עמודי תוכן ומאמרים',
    slugPrefix: 'kosinfo',
    sections: ['hero', 'richContent', 'statsBento', 'faq', 'testimonials', 'community', 'contact'],
    description: 'מבנה עשיר של 7 אזורים למאמרים, מדריכים ומרכז ידע עם מעורבות גבוהה',
    defaultTitle: 'מדריך מעשי ותוכן מקצועי',
    defaultSubtitle: 'תובנות מעמיקות, כלים ומתודולוגיות מוכחות',
    keywords: ['תוכן', 'מאמר', 'מדריך', 'ידע מקצועי', 'בלוג'],
  },
  event: {
    category: 'event',
    name: 'עמודי אירועים וכנסים',
    slugPrefix: 'kosevent',
    sections: ['hero', 'timer', 'eventRsvp', 'richContent', 'statsBento', 'faq', 'contact'],
    description: 'מבנה 7 אזורים מלא לכנסים והשקות כולל ספירה לאחור, RSVP, לו"ז ודרכי הגעה',
    defaultTitle: 'כנס שנתי ואירוע קהילה',
    defaultSubtitle: 'הבטיחו את מקומכם באירוע המרכזי של השנה',
    keywords: ['אירוע', 'כנס', 'RSVP', 'וובינר', 'הרשמה'],
  },
  checkout: {
    category: 'checkout',
    name: 'דפי סליקה ותשלום',
    slugPrefix: 'koscheckout',
    sections: ['hero', 'pricing', 'smartForm', 'timer', 'testimonials', 'faq', 'contact'],
    description: 'משפך סליקה ממיר ב-7 אזורים: הצעת ערך, מחירון, טופס סליקה מאובטח, טיימר וביקורות',
    defaultTitle: 'הצטרפות והסדרת תשלום מאובטח',
    defaultSubtitle: 'הצעה מיוחדת לזמן מוגבל • סליקה מהירה בתקן אבטחה מחמיר',
    keywords: ['סליקה', 'תשלום', 'רכישה', 'מחירון', 'הזמנה מאובטחת'],
  },
  community: {
    category: 'community',
    name: 'דפי קהילה ומועדון',
    slugPrefix: 'koscommunity',
    sections: ['hero', 'community', 'statsBento', 'livePosts', 'testimonials', 'faq', 'contact'],
    description: 'מתחם 7 אזורים לקהילות ומועדוני לקוחות: הטבות, חברים, פוסטים חיים והרשמה',
    defaultTitle: 'קהילת המובילים והמקצוענים',
    defaultSubtitle: 'נטוורקינג, הטבות בלעדיות ותוכן סגור לחברים בלבד',
    keywords: ['קהילה', 'מועדון חברים', 'נטוורקינג', 'חברות', 'VIP'],
  },
  fundraising: {
    category: 'fundraising',
    name: 'דפי קמפיין לגיוס',
    slugPrefix: 'kosfunrise',
    sections: ['campaignHeader', 'hero', 'campaignTiers', 'campaignDonors', 'statsBento', 'faq', 'contact'],
    description: 'מערך גיוס המונים ב-7 אזורים: מד יעד, סיפור מרגש, מדרגות תרומה, קיר תורמים וסעיף 46',
    defaultTitle: 'קמפיין שותפות וגיוס תרומות',
    defaultSubtitle: 'ביחד מגיעים אל היעד • כל תרומה מוכפלת ומוכרת למס',
    keywords: ['תרומות', 'קמפיין', 'גיוס המונים', 'סעיף 46', 'שותפות'],
  },
  course: {
    category: 'course',
    name: 'דפי קורסים והכשרות',
    slugPrefix: 'koscourse',
    sections: ['hero', 'mainContent', 'statsBento', 'pricing', 'testimonials', 'faq', 'contact'],
    description: 'דף קורס מקצועי ב-7 אזורים: סילבוס, באנר תוכן מודגש, נתונים, מסלולים והרשמה',
    defaultTitle: 'התכנית המקיפה להכשרה מקצועית',
    defaultSubtitle: 'סילבוס מעשי, פרויקטים מהשטח וליווי צמוד עד להצלחה',
    keywords: ['קורס', 'סדנה', 'הכשרה', 'לימודים', 'אקדמיה', 'סילבוס'],
  },
};

export const PAGE_CATEGORIES: Record<PageCategory, PageCategoryConfig> = {
  info_content: {
    key: 'info_content',
    slugPrefix: 'KOSINFO',
    slugPrefixLower: 'kosinfo',
    label: 'עמודי תוכן ומאמרים',
    shortLabel: 'תוכן ומאמרים',
    description: 'מאמרים, מרכז ידע, מדריכים, תוכן מקצועי ומידע כללי',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    filterBadgeStyle: 'bg-emerald-600 text-white',
  },
  event: {
    key: 'event',
    slugPrefix: 'KOSEVENT',
    slugPrefixLower: 'kosevent',
    label: 'עמודי אירועים וכנסים',
    shortLabel: 'אירועים',
    description: 'כנסים, השקות, הרשמות RSVP, חיבור CRM, תשלום, יומן ודרכי הגעה',
    badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    filterBadgeStyle: 'bg-amber-600 text-white',
  },
  checkout: {
    key: 'checkout',
    slugPrefix: 'KOSCHECKOUT',
    slugPrefixLower: 'koscheckout',
    label: 'דפי סליקה ותשלום',
    shortLabel: 'סליקה ותשלום',
    description: 'עמודי רכישה וסליקה, הצעות ערך, מחירונים, סליקה מאובטחת וטיימרים',
    badgeStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    filterBadgeStyle: 'bg-blue-600 text-white',
  },
  community: {
    key: 'community',
    slugPrefix: 'KOSCOMMUNITY',
    slugPrefixLower: 'koscommunity',
    label: 'דפי קהילה ומועדון',
    shortLabel: 'קהילה',
    description: 'מועדוני לקוחות, קהילות מקצועיות, הטבות בלעדיות, שיח חי והרשמה',
    badgeStyle: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    filterBadgeStyle: 'bg-purple-600 text-white',
  },
  fundraising: {
    key: 'fundraising',
    slugPrefix: 'KOSFUNRISE',
    slugPrefixLower: 'kosfunrise',
    label: 'קמפיין וגיוס כספים',
    shortLabel: 'גיוס כספים',
    description: 'קמפיינים לגיוס תרומות, מדרגות נתינה, קיר תורמים ומד התקדמות',
    badgeStyle: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    filterBadgeStyle: 'bg-rose-600 text-white',
  },
  course: {
    key: 'course',
    slugPrefix: 'KOSCOURSE',
    slugPrefixLower: 'koscourse',
    label: 'דפי קורסים והכשרות',
    shortLabel: 'קורסים',
    description: 'קורסים דיגיטליים, תכניות הכשרה, סילבוס מודולרי, מסלולי לימוד והרשמה',
    badgeStyle: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    filterBadgeStyle: 'bg-indigo-600 text-white',
  },
  service_product: {
    key: 'service_product',
    slugPrefix: 'KOSASS',
    slugPrefixLower: 'kosass',
    label: 'עמודי שירות / מוצר',
    shortLabel: 'שירות / מוצר',
    description: 'הצעות ערך, מכירת מוצרים, חבילות שירותים, מחירונים וטפסי תשלום',
    badgeStyle: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    filterBadgeStyle: 'bg-cyan-600 text-white',
  },
  youtube_post: {
    key: 'youtube_post',
    slugPrefix: 'KOSVIDIO',
    slugPrefixLower: 'kosvidio',
    label: 'עמוד וידאו Kosvidio',
    shortLabel: 'וידאו Kosvidio',
    description: 'עמודי וידאו מיוטיוב, מאמרי SEO מבוססי AI ונגן אינטראקטיבי Kosvidio',
    badgeStyle: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    filterBadgeStyle: 'bg-red-600 text-white',
  },
  general: {
    key: 'general',
    slugPrefix: 'P',
    slugPrefixLower: 'p',
    label: 'עמוד כללי',
    shortLabel: 'כללי',
    description: 'עמוד נחיתה חופשי בעיצוב אישי',
    badgeStyle: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    filterBadgeStyle: 'bg-slate-600 text-white',
  },
  home: {
    key: 'home',
    slugPrefix: 'HOME',
    slugPrefixLower: 'home',
    label: 'עמוד בית חי ומערכתי',
    shortLabel: 'עמוד בית',
    description: 'שער מותגי חי ונושם המחבר את כלל עמודי הארכיון, מוצרי הדגל והשירותים',
    badgeStyle: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    filterBadgeStyle: 'bg-violet-600 text-white',
  },
};

export function getCategoryFromPage(page?: { pageCategory?: PageCategory; slug?: string; pageId?: string; isHomePage?: boolean; sections?: any } | null): PageCategory | null {
  if (!page) return null;
  if (page.isHomePage || (page.slug || '').toLowerCase() === 'home' || page.pageCategory === 'home') return 'home';
  if (page.pageCategory && PAGE_CATEGORIES[page.pageCategory]) return page.pageCategory;
  const s = (page.slug || '').toLowerCase();
  const pid = (page.pageId || '').toLowerCase();
  if (
    s.startsWith('koscheckout') ||
    s.startsWith('checkout-') ||
    s.startsWith('pay-')
  ) return 'checkout';
  if (
    s.startsWith('koscommunity') ||
    s.startsWith('koscomm') ||
    s.startsWith('community-') ||
    s.startsWith('comm-')
  ) return 'community';
  if (
    s.startsWith('koscourse') ||
    s.startsWith('course-') ||
    s.startsWith('academy-')
  ) return 'course';
  if (s.startsWith('kosinfo') || s.startsWith('info-') || s.startsWith('article-') || s.startsWith('content-')) return 'info_content';
  if (s.startsWith('kosevent') || s.startsWith('event-')) return 'event';
  if (s.startsWith('kosfunrise') || s.startsWith('campaign-') || s.startsWith('camp_')) return 'fundraising';
  if (
    s.startsWith('kosass') ||
    s.startsWith('service-') ||
    s.startsWith('product-') ||
    s.startsWith('srv_') ||
    s.startsWith('srv-') ||
    Boolean(page.sections?.painPoints?.visible && page.sections?.targetAudiences?.visible)
  ) return 'service_product';
  if (
    s.startsWith('kosvidio') ||
    s.startsWith('kostube') ||
    s.startsWith('tube-') ||
    s.startsWith('video-') ||
    pid.startsWith('page_kosvidio_') ||
    Boolean(page.sections?.['kosvidio-1'] || page.sections?.kosvidio)
  ) return 'youtube_post';
  if (s.startsWith('p-') || s === 'home') return 'general';
  return 'general';
}

export interface PageDesignSnapshot {
  id: string;
  timestamp: string;
  label: string;
  preset: string;
  sections: Record<string, any>;
  theme?: string;
  createdAtFormatted?: string;
}

export interface PageBuilderConfig {
  pageId: string;
  pageTitle: string;
  slug: string;
  pageCategory?: PageCategory;
  published?: boolean;
  publishedAt?: string;
  publishedUrl?: string;
  publicUrl?: string;
  shortSlug?: string;
  shortUrl?: string;
  qrCodeUrl?: string;
  isHomePage?: boolean;
  viewsCount?: number;
  leadsCount?: number;
  globalSettings: GlobalPageSettings;
  seoSettings: SeoSettings;
  sectionOrder: string[];
  sections: Record<string, any>;
  designSnapshots?: PageDesignSnapshot[];
  lastModified?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type BuilderTab = 'pages' | 'edit' | 'ai-builder' | 'preview' | 'split' | 'reorder' | 'settings' | 'seo' | 'geo' | 'publish';
