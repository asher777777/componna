export type SectionType =
  | 'hero'
  | 'services'
  | 'mainContent'
  | 'campaignHeader'
  | 'campaignTiers'
  | 'campaignDonors'
  | 'videoGallery'
  | 'imageListing'
  | 'faq'
  | 'timer'
  | 'pricing'
  | 'richContent'
  | 'community'
  | 'livePosts'
  | 'landingSection'
  | 'contact';

export interface GlobalPageSettings {
  siteTitle?: string;
  siteLogoUrl?: string;
  companyName?: string;
  slogan?: string;
  theme?: 'navy' | 'modern' | 'dark' | 'emerald' | 'purple' | 'sunset';
  headerLayout?: 'classic' | 'centered' | 'minimal' | 'transparent';
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
  contactWhatsApp?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  navLinks?: Array<{ label: string; url: string; isButton?: boolean }>;
  footerText?: string;
  customCss?: string;
}

export interface SeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
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
  globalSettings: GlobalPageSettings;
  seoSettings: SeoSettings;
  sectionOrder: string[];
  sections: Record<string, any>;
  lastModified?: number;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type BuilderTab = 'edit' | 'preview' | 'split' | 'reorder' | 'settings' | 'seo';
