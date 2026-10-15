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
  | 'tiktokHero'
  | 'dynamicListing'
  | 'futureContent2027';

export interface GlobalPageSettings {
  siteTitle?: string;
  siteLogoUrl?: string;
  companyName?: string;
  slogan?: string;
  theme?: 'navy' | 'modern' | 'dark' | 'emerald' | 'purple' | 'sunset' | 'light-minimal' | 'cyber-neon';
  headerLayout?: 'capsule-floating' | 'classic' | 'centered' | 'minimal' | 'transparent' | 'floating-glass';
  headerSticky?: boolean;
  isHeaderVisible?: boolean;
  isFooterVisible?: boolean;
  googleAnalyticsId?: string; // GA4 Measurement ID e.g. G-XXXXXXXXXX
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

export type PageCategory =
  | 'service_product'
  | 'info_content'
  | 'event'
  | 'fundraising'
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

export const PAGE_CATEGORIES: Record<PageCategory, PageCategoryConfig> = {
  service_product: {
    key: 'service_product',
    slugPrefix: 'KOSASS',
    slugPrefixLower: 'kosass',
    label: 'עמודי שירות / מוצר',
    shortLabel: 'שירות / מוצר',
    description: 'הצעות ערך, מכירת מוצרים, חבילות שירותים, מחירונים וטפסי תשלום',
    badgeStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    filterBadgeStyle: 'bg-blue-600 text-white',
  },
  info_content: {
    key: 'info_content',
    slugPrefix: 'KOSINFO',
    slugPrefixLower: 'kosinfo',
    label: 'עמוד מידע ותוכן',
    shortLabel: 'מידע ותוכן',
    description: 'מאמרים, מרכז ידע, מדריכים, תוכן מקצועי ומידע כללי',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    filterBadgeStyle: 'bg-emerald-600 text-white',
  },
  event: {
    key: 'event',
    slugPrefix: 'KOSEVENT',
    slugPrefixLower: 'kosevent',
    label: 'עמודי אירועים',
    shortLabel: 'אירועים',
    description: 'כנסים, השקות, הרשמות RSVP, חיבור CRM, תשלום, יומן ודרכי הגעה',
    badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    filterBadgeStyle: 'bg-amber-600 text-white',
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
  youtube_post: {
    key: 'youtube_post',
    slugPrefix: 'KOSTUBE',
    slugPrefixLower: 'kostube',
    label: 'פוסט וידאו יוטיוב',
    shortLabel: 'וידאו יוטיוב',
    description: 'עמודי וידאו מיוטיוב, מאמרי SEO מבוססי AI ונגן אינטראקטיבי',
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
};

export function getCategoryFromPage(page?: { pageCategory?: PageCategory; slug?: string } | null): PageCategory | null {
  if (!page) return null;
  if (page.pageCategory && PAGE_CATEGORIES[page.pageCategory]) return page.pageCategory;
  const s = (page.slug || '').toLowerCase();
  if (s.startsWith('kosass')) return 'service_product';
  if (s.startsWith('kosinfo')) return 'info_content';
  if (s.startsWith('kosevent')) return 'event';
  if (s.startsWith('kosfunrise')) return 'fundraising';
  if (s.startsWith('kostube') || s.startsWith('kosvidio')) return 'youtube_post';
  if (s.startsWith('p-') || s === 'home') return 'general';
  return 'general';
}

export interface PageBuilderConfig {
  pageId: string;
  pageTitle: string;
  slug: string;
  pageCategory?: PageCategory;
  published?: boolean;
  publishedAt?: string;
  publishedUrl?: string;
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
  lastModified?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type BuilderTab = 'pages' | 'edit' | 'ai-builder' | 'preview' | 'split' | 'reorder' | 'settings' | 'seo' | 'geo' | 'publish';
