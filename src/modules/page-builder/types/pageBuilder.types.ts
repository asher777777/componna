export type SectionType =
  | 'hero'
  | 'services'
  | 'testimonials'
  | 'logoMarquee'
  | 'statsBento'
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
  | 'smartForm';

export interface GlobalPageSettings {
  siteTitle?: string;
  siteLogoUrl?: string;
  companyName?: string;
  slogan?: string;
  theme?: 'navy' | 'modern' | 'dark' | 'emerald' | 'purple' | 'sunset' | 'light-minimal' | 'cyber-neon';
  headerLayout?: 'classic' | 'centered' | 'minimal' | 'transparent' | 'floating-glass';
  headerSticky?: boolean;
  isHeaderVisible?: boolean;
  isFooterVisible?: boolean;
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
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  geo?: GeoSeoSettings;
}

export interface BaseSectionConfig {
  id: string;
  type: SectionType;
  visible: boolean;
  mobileHidden?: boolean;
  anchorId?: string;
  backgroundColor?: string;
  customClasses?: string;
}

export interface PageBuilderConfig {
  pageId: string;
  pageTitle: string;
  slug: string;
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
