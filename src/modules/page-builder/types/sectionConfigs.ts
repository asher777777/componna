import { BaseSectionConfig } from './pageBuilder.types';

export interface HeroSectionConfig extends BaseSectionConfig {
  type: 'hero';
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  layout?: 'fz' | 'spatial' | 'centered' | 'split';
  heroStyle?: 'classic' | 'modern' | 'minimal' | 'card';
  flexDirection?: 'row' | 'row-reverse';
  buttonsVisible?: boolean;
  primaryButton?: {
    text: string;
    url: string;
    target?: string;
  };
  secondaryButton?: {
    text: string;
    url: string;
    target?: string;
  };
  titleColor?: string;
  descriptionColor?: string;
  hoverColor?: string;
  formMode?: boolean;
  formTitle?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  imageSrc?: string;
  url?: string;
  isVisible?: boolean;
  badge?: string;
}

export interface ServicesSectionConfig extends BaseSectionConfig {
  type: 'services';
  title: string;
  description?: string;
  layout?: 'grid' | 'cards' | 'minimal';
  columns?: number;
  columnsMobile?: number;
  effect?: 'hover-scale' | 'hover-glow' | 'none';
  items: ServiceItem[];
}

export interface CourseBannerSectionConfig extends BaseSectionConfig {
  type: 'mainContent';
  title: string;
  subtitle?: string;
  imageSrc?: string;
  features?: string[];
  buttonsVisible?: boolean;
  primaryButton?: {
    text: string;
    url: string;
  };
  bottomStripeColor?: string;
}

export interface CampaignHeaderSectionConfig extends BaseSectionConfig {
  type: 'campaignHeader';
  title: string;
  subtitle?: string;
  campaignId?: string;
  targetGoal: number;
  totalRaised: number;
  donorsCount?: number;
  daysLeft?: number;
  svgTrendPreset?: 'curve_up' | 'linear' | 'steps' | 'wave';
  accentColor?: string;
}

export interface CampaignTierItem {
  id: string;
  title: string;
  amount: number;
  description?: string;
  isPopular?: boolean;
  badgeText?: string;
  imageUrl?: string;
}

export interface CampaignTiersSectionConfig extends BaseSectionConfig {
  type: 'campaignTiers';
  title?: string;
  subtitle?: string;
  campaignId?: string;
  donationType?: 'one_time' | 'recurring' | 'both';
  tiers?: CampaignTierItem[];
}

export interface CampaignDonorItem {
  id: string;
  name: string;
  amount: number;
  date?: string;
  message?: string;
  isAnonymous?: boolean;
  tierId?: string;
}

export interface CampaignDonorsSectionConfig extends BaseSectionConfig {
  type: 'campaignDonors';
  title?: string;
  campaignId?: string;
  defaultTab?: 'donors' | 'ambassadors' | 'recent';
  showSearch?: boolean;
  showSort?: boolean;
  cardLayout?: 'grid-2' | 'grid-3' | 'list';
  donors?: CampaignDonorItem[];
}

export interface VideoGallerySectionConfig extends BaseSectionConfig {
  type: 'videoGallery';
  title?: string;
  subtitle?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'mp4';
  images?: string[];
  desktopHeight?: string;
  effect?: 'fade' | 'slide' | 'zoom';
  objectFit?: 'cover' | 'contain';
  titleEffect?: 'fade' | 'slide-up';
  textPosition?: 'center' | 'bottom-right' | 'top-right';
}

export interface ImageListingItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
}

export interface ImageListingSectionConfig extends BaseSectionConfig {
  type: 'imageListing';
  title?: string;
  titleColor?: string;
  imagesPerRow?: number;
  imagesPerRowMobile?: number;
  images?: ImageListingItem[];
  form?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FaqSectionConfig extends BaseSectionConfig {
  type: 'faq';
  title: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  itemTextColor?: string;
  questionTextColor?: string;
  answerTextColor?: string;
  activeTabBgColor?: string;
  inactiveTabBgColor?: string;
  tabBorderColor?: string;
  layout?: 'accordion' | 'cards' | 'two-columns';
  effect?: 'slide' | 'fade';
  items: FaqItem[];
}

export interface TimerSectionConfig extends BaseSectionConfig {
  type: 'timer';
  title: string;
  subtitle?: string;
  targetDate: string;
  layout?: 'boxed' | 'minimal' | 'cards';
  titleColor?: string;
  subtitleColor?: string;
  boxBackgroundColor?: string;
  numberColor?: string;
  labelColor?: string;
}

export interface PricingPackageItem {
  id: string;
  name: string;
  price: string;
  period?: string;
  description?: string;
  isFeatured?: boolean;
  badge?: string;
  features: string[];
  buttonText?: string;
  buttonUrl?: string;
}

export interface PricingSectionConfig extends BaseSectionConfig {
  type: 'pricing';
  title: string;
  subtitle?: string;
  description?: string;
  packages: PricingPackageItem[];
}

export interface RichContentSectionConfig extends BaseSectionConfig {
  type: 'richContent';
  heading: string;
  body: string;
  layout?: 'standard' | 'two-columns' | 'highlight-box';
}

export interface CommunitySectionConfig extends BaseSectionConfig {
  type: 'community';
  title: string;
  subtitle?: string;
  description?: string;
  quote?: string;
  imageSrc?: string;
  badgeTitle?: string;
  badgeSubtitle?: string;
  buttonText?: string;
  whatsappNumber?: string;
  layout?: 'classic' | 'modern' | 'card';
  badgeVisible?: boolean;
  buttonVisible?: boolean;
}

export interface LivePostItem {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  imageUrl?: string;
  linkUrl?: string;
  tag?: string;
}

export interface LivePostsGridSectionConfig extends BaseSectionConfig {
  type: 'livePosts';
  title: string;
  titleColor?: string;
  description?: string;
  descriptionColor?: string;
  layout?: 'grid' | 'carousel' | 'list';
  customPages?: LivePostItem[];
}

export interface LandingFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface LandingSectionConfig extends BaseSectionConfig {
  type: 'landingSection';
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  form?: boolean;
  formMode?: 'lead' | 'register' | 'contact';
  buttonText?: string;
  layout?: 'split' | 'card' | 'centered';
  fields?: LandingFormField[];
}

export interface ContactSectionConfig extends BaseSectionConfig {
  type: 'contact';
  title: string;
  subtitle?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  showMap?: boolean;
  mapEmbedUrl?: string;
  showForm?: boolean;
}
