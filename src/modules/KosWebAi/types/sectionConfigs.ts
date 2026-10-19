import { BaseSectionConfig } from './pageBuilder.types';
import { FormConfigContract } from '../../../core/contracts';


export interface HeaderSectionConfig extends BaseSectionConfig {
  type: 'header';
  title?: string;
  adminTitle?: string;
  layout?: 'capsule-floating' | 'floating-glass' | 'classic' | 'centered' | 'minimal' | 'transparent' | 'logo-center' | 'logo-right';
  logoAlignment?: 'right' | 'center' | 'left';
  logoSize?: 'sm' | 'md' | 'lg' | 'xl';
  sticky?: boolean;
  useBrandLogo?: boolean;
  customLogoUrl?: string;
  logoText?: string;
  showLogoText?: boolean;
  menuMode?: 'dynamic-tenant' | 'custom' | 'none';
  customLinks?: Array<{ label: string; url: string; isButton?: boolean }>;
  showLoginButton?: boolean;
  showCtaButton?: boolean;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  showPhone?: boolean;
  phone?: string;
  showWhatsApp?: boolean;
  whatsApp?: string;
  menuTitleOverrides?: Record<string, string>;
  desktopMenuDisplay?: 'links' | 'hamburger' | 'both';
}

export interface HeroAvatarItem {
  id: string;
  avatarUrl: string;
  name?: string;
}

export type HeroLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'bento-hero'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'fz'
  | 'spatial'
  | 'centered'
  | 'split';

export type HeroTextBgEffect =
  | 'zoom-glow'
  | 'shimmer-sweep'
  | 'float-parallax'
  | 'blur-reveal'
  | 'gradient-shift';

export interface HeroMetricItem {
  id: string;
  label: string;
  value: string;
  trend?: string;
}

export interface HeroSectionConfig extends BaseSectionConfig {
  type: 'hero';
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  videoBgUrl?: string;
  layout?: HeroLayoutPreset;
  heroStyle?: 'classic' | 'modern' | 'minimal' | 'card' | 'mesh-glow';
  flexDirection?: 'row' | 'row-reverse';
  objectScale?: 'auto' | 'compact' | 'normal' | 'large' | 'massive';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp' | 'chiseled';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  imagePosition?: 'auto' | 'bottom' | 'top' | 'left' | 'right';
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
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  accentColor?: string;
  hoverColor?: string;
  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';
  analyticalMetrics?: HeroMetricItem[];
  formMode?: boolean;
  formTitle?: string;
  announcementBadge?: {
    text: string;
    url?: string;
    icon?: string;
  };
  imageBadge?: {
    visible?: boolean;
    text?: string;
    icon?: string;
    url?: string;
  };
  socialProofAvatars?: {
    visible: boolean;
    avatars: HeroAvatarItem[];
    ratingText?: string;
    starsCount?: number;
  };
  // Full Font Typography Controls
  titleFontSize?: string;
  titleFontWeight?: string;
  titleAlignment?: 'right' | 'center' | 'left';
  subtitleFontSize?: string;
  subtitleFontWeight?: string;
  descriptionFontSize?: string;
}



export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  content: string;
  rating: number; // 1-5
  isVerified?: boolean;
  badge?: string;
  videoUrl?: string;
}

export interface TestimonialsSectionConfig extends BaseSectionConfig {
  type: 'testimonials';
  title: string;
  subtitle?: string;
  description?: string;
  layout?: 'grid' | 'carousel' | 'masonry';
  showRatingSummary?: boolean;
  overallRating?: number;
  totalReviewsCount?: string;
  trustBadgeText?: string;
  items: TestimonialItem[];
}

export interface LogoMarqueeItem {
  id: string;
  name: string;
  logoUrl: string;
  url?: string;
}

export interface LogoMarqueeSectionConfig extends BaseSectionConfig {
  type: 'logoMarquee';
  title?: string;
  speed?: 'slow' | 'medium' | 'fast';
  direction?: 'left' | 'right';
  grayscale?: boolean;
  logos: LogoMarqueeItem[];
}

export type StatsBentoLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'bento-4'
  | 'row-4'
  | 'cards-3';

export type StatsBentoViewMode = 'grid-4' | 'bento-4' | 'cards-3';

export interface StatsBentoItem {
  id: string;
  number: string;
  prefix?: string;
  suffix?: string;
  label: string;
  description?: string;
  icon?: string;
  badge?: string;
  color?: string;
}

export interface StatsBentoSectionConfig extends BaseSectionConfig {
  type: 'statsBento';
  title?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  layout?: StatsBentoLayoutPreset;
  viewMode?: StatsBentoViewMode;
  objectScale?: 'compact' | 'normal' | 'spacious' | 'auto';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg';
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  cardBackgroundColor?: string;
  accentColor?: string;

  // CTA button support
  showCtaButton?: boolean;
  ctaButtonText?: string;
  ctaButtonUrl?: string;

  // Background image with overlay and hover effect
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';

  stats: StatsBentoItem[];
}

export interface BeforeAfterSectionConfig extends BaseSectionConfig {
  type: 'beforeAfter';
  title: string;
  subtitle?: string;
  description?: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  defaultPosition?: number; // 0 to 100 percentage
}

export interface GeoLocalSectionConfig extends BaseSectionConfig {
  type: 'geoLocal';
  title: string;
  subtitle?: string;
  businessName?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  serviceAreas?: string[];
  openingHours?: string[];
  mapEmbedUrl?: string;
  directionsUrl?: string;
}

export type CourseBannerLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical';

export interface CourseBannerSectionConfig extends BaseSectionConfig {
  type: 'mainContent';
  title: string;
  subtitle?: string;
  badge?: string;
  titleColor?: string;
  subtitleColor?: string;
  badgeColor?: string;
  cardBackgroundColor?: string;
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'background' | 'auto';
  features?: string[];
  featureIcon?: string;
  buttonsVisible?: boolean;
  primaryButton?: {
    text: string;
    url: string;
    color?: string;
  };
  secondaryButton?: {
    text: string;
    url: string;
    color?: string;
  };
  bottomStripeColor?: string;

  // Layout & Styling Controls
  layout?: CourseBannerLayoutPreset;
  objectScale?: 'compact' | 'normal' | 'large' | 'massive' | 'auto';
  buttonShape?: 'round' | 'square' | 'sharp' | 'pill' | 'auto';
  buttonSize?: 'compact' | 'normal' | 'large' | 'auto';

  // Text Background Overlay & 5 Hover Effects
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: 'zoom-glow' | 'shimmer-sweep' | 'float-parallax' | 'blur-reveal' | 'gradient-shift';
  textBgScope?: 'card' | 'section';
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

export type VideoGalleryLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'spotlight'
  | 'grid';

export interface VideoGalleryItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  youtubeVideoId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  viewsCount?: number;
  publishedAt?: string;
  category?: string;
  tags?: string[];
}

export interface VideoGallerySectionConfig extends BaseSectionConfig {
  type: 'videoGallery';
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'mp4';
  images?: string[];
  desktopHeight?: string;
  effect?: 'fade' | 'slide' | 'zoom';
  objectFit?: 'cover' | 'contain';
  titleEffect?: 'fade' | 'slide-up';
  textPosition?: 'center' | 'bottom-right' | 'top-right';

  // Tenant YouTube integration & items
  source?: 'tenant_youtube' | 'custom';
  items?: VideoGalleryItem[];
  maxVideos?: number;
  selectedVideoId?: string;
  showThumbnails?: boolean;
  ctaButtonText?: string;
  ctaButtonUrl?: string;

  // Layout & visual controls matching Hero, RichContent, FAQ & Contact
  layout?: VideoGalleryLayoutPreset;
  objectScale?: 'auto' | 'compact' | 'normal' | 'large' | 'massive';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp' | 'chiseled';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  cardBackgroundColor?: string;

  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';
}

export interface ImageListingItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  tag?: string;
  description?: string;
  linkUrl?: string;
  aspectRatio?: string;
}

export type ImageListingLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'grid'
  | 'carousel'
  | 'masonry';

export interface ImageListingSectionConfig extends BaseSectionConfig {
  type: 'imageListing';
  title?: string;
  subtitle?: string;
  badge?: string;
  titleColor?: string;
  subtitleColor?: string;
  badgeColor?: string;
  cardBackgroundColor?: string;
  imagesPerRow?: number;
  imagesPerRowMobile?: number;
  images?: ImageListingItem[];
  form?: boolean;

  // Layout & Styling Presets
  layout?: ImageListingLayoutPreset;
  displayMode?: 'grid' | 'carousel' | 'marquee' | 'masonry';
  objectScale?: 'compact' | 'normal' | 'large' | 'massive' | 'auto';
  buttonShape?: 'round' | 'square' | 'sharp' | 'pill' | 'auto';
  buttonSize?: 'compact' | 'normal' | 'large' | 'auto';
  cardAspectRatio?: 'square' | 'video' | 'portrait' | 'wide' | 'auto';
  showLightbox?: boolean;

  // Moving display / Carousel controls
  carouselAutoplay?: boolean;
  autoplayInterval?: number;
  showCarouselArrows?: boolean;
  showCarouselDots?: boolean;

  // Rotating & Dynamic Backgrounds
  backgroundMode?: 'static' | 'dynamic-gradient' | 'image-sync' | 'rotating-images';
  backgroundRotateInterval?: number;

  // Text Background Overlay & Effects
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: 'zoom-glow' | 'shimmer-sweep' | 'float-parallax' | 'blur-reveal' | 'gradient-shift';
  textBgScope?: 'header' | 'section';

  // Action / CTA button
  showCtaButton?: boolean;
  ctaText?: string;
  ctaUrl?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  icon?: string;
}

export type FaqLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'two-columns'
  | 'compact-cards';

export interface FaqSectionConfig extends BaseSectionConfig {
  type: 'faq';
  title: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  showSearchBar?: boolean;
  showContactCard?: boolean;
  whatsappContact?: string;
  items: FaqItem[];
  layout?: FaqLayoutPreset;
  objectScale?: 'auto' | 'compact' | 'normal' | 'large' | 'massive';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp' | 'chiseled';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  cardBackgroundColor?: string;
  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';
}

export type TimerLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'boxed'
  | 'minimal'
  | 'cards'
  | 'floating-bar';

export type TimerBoxShape =
  | 'auto'
  | 'flower'
  | 'heart'
  | 'shield'
  | 'lotus'
  | 'sharp'
  | 'hud'
  | 'rounded';

export type TimerUnitsDirection = 'rtl' | 'ltr';

export interface TimerSectionConfig extends BaseSectionConfig {
  type: 'timer';
  title: string;
  subtitle?: string;
  targetDate: string;
  layout?: TimerLayoutPreset;
  timeUnitsDirection?: TimerUnitsDirection;
  boxShape?: TimerBoxShape;
  objectScale?: 'auto' | 'compact' | 'normal' | 'large' | 'massive';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp' | 'chiseled';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  cardBackgroundColor?: string;

  // CTA button
  showCtaButton?: boolean;
  ctaText?: string;
  ctaUrl?: string;

  // Custom colors
  titleColor?: string;
  subtitleColor?: string;
  boxBackgroundColor?: string;
  numberColor?: string;
  labelColor?: string;

  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';
}

export interface PricingPackageItem {
  id: string;
  name: string;
  priceMonthly: string;
  priceYearly?: string;
  period?: string;
  description?: string;
  isFeatured?: boolean;
  badge?: string;
  features: string[];
  buttonText?: string;
  buttonUrl?: string;
  actionType?: 'kesher_checkout' | 'smart_form' | 'external_url';
  formId?: string;
  formTemplateId?: string;
}

export interface PricingSectionConfig extends BaseSectionConfig {
  type: 'pricing';
  title: string;
  subtitle?: string;
  description?: string;
  showBillingToggle?: boolean;
  yearlyDiscountBadge?: string;
  packages: PricingPackageItem[];
}

export type RichContentDisplayMode =
  | 'standard'
  | 'two-columns'
  | 'highlight-box'
  | 'split-story'
  | 'quote-hero'
  | 'timeline-vision'
  | 'bento-about'
  | 'cards-grid-3'
  | 'cards-grid-2';

export type RichContentLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'current'
  | 'standard'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'two-columns'
  | 'highlight-box'
  | 'cards-grid-3'
  | 'cards-grid-2'
  | 'split-story'
  | 'quote-hero'
  | 'timeline-vision'
  | 'bento-about';

export interface RichContentItem {
  id: string;
  title: string;
  description?: string;
  text?: string;
  icon?: string;
  metricValue?: string;
}

export interface RichContentSectionConfig extends BaseSectionConfig {
  type: 'richContent';
  heading: string;
  subtitle?: string;
  body: string;
  imageSrc?: string;
  layout?: RichContentLayoutPreset;
  contentLayout?: RichContentDisplayMode;
  objectScale?: 'auto' | 'compact' | 'normal' | 'large' | 'massive';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp' | 'chiseled';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  imagePosition?: 'auto' | 'bottom' | 'top' | 'left' | 'right';
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
  headingColor?: string;
  bodyColor?: string;
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';
  items?: RichContentItem[];
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
  showLiveChatPreview?: boolean;
  chatBubbleMessage?: string;
}

export type LivePostsLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'grid'
  | 'carousel'
  | 'list';

export type LivePostsDisplayMode = 'grid' | 'carousel' | 'spotlight' | 'compact-list';

export interface LivePostItem {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  imageUrl?: string;
  linkUrl?: string;
  tag?: string;
  tagColor?: string;
  authorName?: string;
  authorAvatar?: string;
  readTimeMinutes?: number;
  isFeatured?: boolean;
  ctaButtonText?: string;
}

export interface LivePostsGridSectionConfig extends BaseSectionConfig {
  type: 'livePosts';
  title: string;
  titleColor?: string;
  subtitle?: string;
  subtitleColor?: string;
  description?: string;
  descriptionColor?: string;
  badge?: string;
  badgeColor?: string;
  accentColor?: string;

  // Layout & Styling Presets
  layout?: LivePostsLayoutPreset;
  displayMode?: LivePostsDisplayMode;
  objectScale?: 'auto' | 'compact' | 'normal' | 'large' | 'massive';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp' | 'chiseled';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  cardBackgroundColor?: string;

  // Content items & Grid controls
  customPages?: LivePostItem[];
  postsPerRow?: 2 | 3 | 4;
  showPostExcerpt?: boolean;
  showPostDate?: boolean;
  showPostTag?: boolean;
  showPostAuthor?: boolean;
  showReadTime?: boolean;

  // Global Call to action button for entire section
  showCtaButton?: boolean;
  ctaText?: string;
  ctaUrl?: string;

  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';
}

export interface LandingFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export type LandingLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical';

export type LandingFormPosition = 'left' | 'right' | 'bottom' | 'modal';

export interface LandingSectionConfig extends BaseSectionConfig {
  type: 'landingSection';
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  imageSrc?: string;
  formId?: string;
  form?: FormConfigContract | boolean;
  formPosition?: LandingFormPosition;
  modalButtonText?: string;
  layout?: LandingLayoutPreset | 'split' | 'card' | 'centered';
  objectScale?: 'compact' | 'normal' | 'spacious';
  buttonShape?: 'rounded' | 'pill' | 'sharp';
  buttonSize?: 'sm' | 'md' | 'lg';
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  cardBackgroundColor?: string;
  accentColor?: string;
  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'whole-section';
  buttonText?: string;
  formMode?: 'lead' | 'register' | 'contact';
  fields?: LandingFormField[];
}

export type ContactLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'split-cards'
  | 'minimal';

export interface ContactSectionConfig extends BaseSectionConfig {
  type: 'contact';
  title: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  showMap?: boolean;
  mapEmbedUrl?: string;
  showForm?: boolean;
  openingHours?: string;
  directWhatsappChat?: boolean;
  formId?: string;
  form?: FormConfigContract;
  layout?: ContactLayoutPreset;
  objectScale?: 'auto' | 'compact' | 'normal' | 'large' | 'massive';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp' | 'chiseled';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  cardBackgroundColor?: string;
  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';
}


export interface FlowPlayerSectionConfig extends BaseSectionConfig {
  type: 'flowPlayer';
  campaignId?: string;
  campaignSlug?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  showSectionHeader?: boolean;
  aspectRatio?: '9:16' | '16:9' | '1:1' | 'auto';
  containerWidth?: 'sm' | 'md' | 'lg' | 'full';
  backgroundColor?: string;
  desktopBgImage?: string;
  desktopBgStyle?: 'cover' | 'contain' | 'blur-ambient' | 'pattern';
  desktopBgOverlayOpacity?: number;
  mode?: 'live' | 'edit';
}

export interface SearchConsoleQueryMetric {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
}

export interface LiveAnalyticsSectionConfig extends BaseSectionConfig {
  type: 'liveAnalytics';
  title?: string;
  subtitle?: string;
  adminOnly?: boolean; // When true, only visible when editing or logged in as admin
  displayStyle?: 'bento' | 'glass-cards' | 'ticker' | 'minimal';
  googleAnalyticsId?: string; // Optional direct GA4 Measurement ID (G-XXXXXXXXXX)
  googleSearchConsoleVerification?: string; // Google Search Console verification code / meta tag
  googleSearchConsolePropertyUrl?: string; // Google Search Console property URL / domain
  showViews?: boolean;
  showUniqueVisitors?: boolean;
  showCtaClicks?: boolean;
  showLeads?: boolean;
  showConversionRate?: boolean;
  showTrafficSources?: boolean;
  showSearchConsoleCard?: boolean;
  showAiTrafficBadge?: boolean;
  showGa4StatusBadge?: boolean;
  showGscStatusBadge?: boolean;
  topSearchQueries?: SearchConsoleQueryMetric[];
  customBadgeText?: string;
  accentColor?: string;
}

export interface EventRsvpSectionConfig extends BaseSectionConfig {
  type: 'eventRsvp';
  title?: string;
  subtitle?: string;
  eventTitle?: string;
  eventDate?: string; // YYYY-MM-DD
  eventTime?: string; // HH:mm
  eventEndTime?: string; // HH:mm
  locationName?: string;
  locationAddress?: string;
  wazeQuery?: string; // query or coordinates for Waze
  description?: string;
  // Card 1: Waze
  showWazeCard?: boolean;
  wazeCardTitle?: string;
  wazeCardSubtitle?: string;
  // Card 2: Calendar
  showCalendarCard?: boolean;
  calendarCardTitle?: string;
  calendarCardSubtitle?: string;
  // Card 3: WhatsApp Timed Reminder
  showWhatsappCard?: boolean;
  whatsappCardTitle?: string;
  whatsappCardSubtitle?: string;
  whatsappReminderTimeText?: string;
  // RSVP Controls
  showRsvpButtons?: boolean;
  yesButtonText?: string;
  noButtonText?: string;
  yesCountInitial?: number;
  noCountInitial?: number;
  showAttendeeCounter?: boolean;
  attendeeCounterLabel?: string;
  accentColor?: string;
}

export interface KosvidioComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  content: string;
  likesCount: number;
  userLiked?: boolean;
}

export interface KosvidioFaqItem {
  question: string;
  answer: string;
}

export type KosvidioLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical';

export interface KosvidioSectionConfig extends BaseSectionConfig {
  type: 'kosvidio';
  // 1. Innovative Video Player
  youtubeVideoId: string;
  videoUrl?: string;
  playerAspect?: '16:9' | '21:9' | '4:3';
  ambientGlow?: boolean;
  glowColor?: string;
  showTheaterMode?: boolean;
  autoplay?: boolean;
  channelName?: string;
  channelAvatarUrl?: string;
  channelSubscribers?: string;
  verifiedBadge?: boolean;

  // Layout & Presets
  layout?: KosvidioLayoutPreset;
  objectScale?: 'auto' | 'compact' | 'normal' | 'large' | 'massive';
  buttonShape?: 'auto' | 'pill' | 'rounded' | 'sharp' | 'chiseled';
  buttonSize?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  titleColor?: string;
  channelNameColor?: string;
  channelSubscribersColor?: string;

  /** רקע של תמונה מאחורי הטקסט עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';

  // 2. Title & Stats
  title: string;
  viewsCount?: number | string;
  viewsCountText?: string;
  likesCount?: number;
  userLiked?: boolean;
  publishedDateText?: string;

  // 3. Delicate tags & Social share icons
  tags: string[];
  shareTitle?: string;
  enableSocialShare?: boolean;

  // 4. YouTube-styled comments area
  commentsCount?: number;
  comments: KosvidioComment[];
  allowUserComments?: boolean;

  hideInternalEngagement?: boolean; // When true, engagement bar & comments are handled by dedicated videoEngagement section

  // 5. Short description
  shortDescription: string;
  shortDescriptionBadge?: string;

  // 6. Long description (SEO & AISEO)
  longDescriptionMarkdown: string;
  keyTakeaways?: string[];
  faqs?: KosvidioFaqItem[];
  callToAction?: {
    title: string;
    subtitle?: string;
    buttonText: string;
    buttonLink: string;
    showLeadForm?: boolean;
  };
}

export interface VideoEngagementComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  content: string;
  likesCount: number;
  userLiked?: boolean;
}

export type VideoEngagementLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical';

export interface VideoEngagementSectionConfig extends BaseSectionConfig {
  type: 'videoEngagement';
  title?: string;
  videoTitle?: string;
  allowLikes?: boolean;
  likesCount?: number;
  viewsCount?: number | string;
  viewsCountText?: string;
  allowComments?: boolean;
  allowUserComments?: boolean;
  comments?: VideoEngagementComment[];
  enableSocialShare?: boolean;
  tags?: string[];
  shareTitle?: string;
  accentColor?: string;
  publishedDateText?: string;

  // New styling & layout presets
  layout?: VideoEngagementLayoutPreset;
  objectScale?: 'compact' | 'normal' | 'large' | 'massive' | 'auto';
  buttonShape?: 'round' | 'square' | 'sharp' | 'pill' | 'auto';
  buttonSize?: 'compact' | 'normal' | 'large' | 'auto';

  // Default icons only with tooltips (no text labels)
  socialButtonsStyle?: 'icons-only' | 'icons-text' | 'compact';
  showButtonLabels?: boolean; // default: false (icons + tooltip without text)

  // Custom colors
  cardBackgroundColor?: string;

  // Text Background Overlay & 5 Hover Effects
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: 'zoom-glow' | 'shimmer-sweep' | 'float-parallax' | 'blur-reveal' | 'gradient-shift';
  textBgScope?: 'bar' | 'section';
}

export interface TiktokHeroVideoSettings {
  videoUrl?: string;
  posterUrl?: string;
  muted?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  showTopBadges?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  durationText?: string;
  seasonEpisodeText?: string;
  showSoundWaveAnimation?: boolean;
  showMuteButton?: boolean;
}

export interface TiktokHeroOverlaySettings {
  mode: 'solid' | 'gradient' | 'image' | 'vignette' | 'none';
  solidColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-t' | 'to-b' | 'to-r' | 'to-l';
  opacity?: number; // 0 - 100
  imageUrl?: string;
  blur?: 'none' | 'sm' | 'md' | 'lg';
}

export interface TiktokHeroFloatingCard {
  enabled?: boolean;
  position?: 'bottom' | 'center' | 'top';
  width?: 'compact' | 'normal' | 'wide' | 'full';
  textAlign?: 'right' | 'center' | 'left';
  showImage?: boolean;
  showText?: boolean;
  showTag?: boolean;
  title?: string;
  subtitle?: string;
  tag?: string;
  imageUrl?: string;
  shape?: 'rounded' | 'capsule' | 'square' | 'asymmetric';
  style?: 'glass' | 'solid' | 'bordered';
  bgColor?: string;
  borderColor?: string;
  titleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  titleColor?: string;
  subtitleSize?: 'xs' | 'sm' | 'md';
  subtitleColor?: string;
  tagSize?: 'xs' | 'sm' | 'md';
  tagColor?: string;
  tagBgColor?: string;
  padding?: 'compact' | 'normal' | 'spacious';
}

export interface TiktokHeroCtaButton {
  text: string;
  iconName?: string;
  customIconUrl?: string;
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  iconSize?: 'sm' | 'md' | 'lg';
  buttonSize?: 'compact' | 'normal' | 'spacious' | 'huge' | 'fullWidth';
  widthMode?: 'auto' | 'full' | 'fixed';
  customWidthPx?: number;
  fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  paddingY?: 'compact' | 'normal' | 'spacious';
  position?: 'inside-card' | 'below-card' | 'center-video' | 'bottom-floating';
  align?: 'right' | 'center' | 'left' | 'stretch';
  bgColor?: string;
  textColor?: string;
  shape?: 'rounded' | 'capsule' | 'square';
  pulseEffect?: boolean;
  actionType: 'modal_form' | 'link';
  linkUrl?: string;
}

export interface TiktokHeroSectionConfig extends BaseSectionConfig {
  type: 'tiktokHero';
  video: TiktokHeroVideoSettings;
  // Foreground overlay in front of the video (סעיף ד)
  overlay: TiktokHeroOverlaySettings;
  // Background behind the video (סעיף ד)
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  backgroundGradientFrom?: string;
  backgroundGradientTo?: string;
  backgroundGradientDirection?: 'to-t' | 'to-b' | 'to-r' | 'to-l' | 'to-br';
  backgroundImageUrl?: string;
  ambientGlow?: boolean;
  ambientGlowColor?: string;
  ambientGlowOpacity?: number;

  // Headline element & positioning (סעיף א)
  showHeadline?: boolean;
  headline: string;
  headlinePosition?: 'top' | 'inside-top' | 'above-card';
  headlineAlign?: 'right' | 'center' | 'left';
  headlineColor?: string;
  headlineSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  headlineWeight?: 'bold' | 'extrabold' | 'black';
  headlineShadow?: boolean;
  headlineMarginBottom?: 'none' | 'sm' | 'md' | 'lg';

  // Floating card element & positioning (סעיף א)
  card?: TiktokHeroFloatingCard;

  // CTA button element & size over video (סעיף א ו-ג)
  ctaButton: TiktokHeroCtaButton;

  // Modal element, text sizes and modal button (סעיף א ו-ב)
  modalTitle?: string;
  modalSubtitle?: string;
  modalButtonText?: string;
  modalButtonSize?: 'compact' | 'normal' | 'spacious' | 'fullWidth';
  modalButtonFontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  modalButtonBgColor?: string;
  modalButtonTextColor?: string;
  modalButtonShape?: 'rounded' | 'capsule' | 'square';
  modalButtonPulse?: boolean;
  modalShape?: 'rounded-2xl' | 'rounded-3xl' | 'rounded-capsule' | 'rounded-asymmetric' | 'rounded-sharp';
  modalEffect?: 'glass' | 'neon' | 'aura' | 'shadow-luxury' | 'flat' | 'gradient-border';
  modalBgColor?: string;
  modalBackdropBlur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  modalMaxWidth?: 'sm' | 'md' | 'lg' | 'xl';

  // Forms component delegation (סעיף ב)
  formId?: string;
  form?: FormConfigContract;
}

export type DynamicListingLayout =
  | 'bento-showcase'
  | 'floating-grid'
  | 'snap-carousel'
  | 'editorial-list'
  | 'masonry';

export type DynamicListingSource =
  | 'custom'
  | 'pages'
  | 'all'
  | 'kos_tube'
  | 'campaigns'
  | 'media';

export interface DynamicListingItem {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  imageUrl: string;
  badge?: string;
  date?: string;
  category?: string;
  author?: string;
  linkUrl?: string;
  actionType?: 'link' | 'modal';
  modalContent?: string;
  featured?: boolean;
  price?: string;
}

export type DynamicListingStylePreset = 'standard' | 'feminine' | 'masculine' | 'spiritual' | 'sharp' | 'analytical';
export type StylePresetName = DynamicListingStylePreset;
export type CardBoxShape = 'rounded' | 'flower' | 'heart' | 'shield' | 'lotus' | 'sharp' | 'hud';
export type ControlsOrder = 'search-first' | 'categories-first';
export type ButtonShape = 'auto' | 'pill' | 'rounded' | 'square';
export type ObjectScale = 'compact' | 'normal' | 'expanded' | 'prominent' | 'standard';

export type DynamicListingSortBy = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'manual';
export type DynamicListingLogicCondition = 'none' | 'only-with-image' | 'only-featured' | 'exclude-tags' | 'hide-hidden-status';

export interface DynamicListingSectionConfig extends BaseSectionConfig {
  type: 'dynamicListing';
  title?: string;
  subtitle?: string;
  badge?: string;
  source: DynamicListingSource | 'media_gallery' | 'archives';
  layout: DynamicListingLayout;
  gridColumns?: 2 | 3 | 4;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  showCategoryFilter?: boolean;
  categories?: string[];
  filterCategory?: string;
  showSearchBar?: boolean;
  searchPlaceholder?: string;
  effectStyle?: 'border-beam' | 'glow-hover' | 'tilt-3d' | 'subtle';
  collectionLimit?: number;
  maxItems?: number;
  items: DynamicListingItem[];
  primaryButton?: {
    text: string;
    url: string;
  };
  cardBgColor?: string;
  titleColor?: string;
  stylePreset?: DynamicListingStylePreset;
  boxShape?: CardBoxShape;
  controlsOrder?: ControlsOrder;
  buttonShape?: ButtonShape;
  objectScale?: ObjectScale;
  accentColor?: string;

  // Sorting, dynamic hiding & logic rules
  sortBy?: DynamicListingSortBy;
  hiddenItemIds?: string[];
  logicRule?: DynamicListingLogicCondition;
  hideEmptyCategories?: boolean;
  archivePathFilter?: string; // Optional filter for specific archive paths
}

export type FutureContentMode = 'prism-bento' | 'kinetic-editorial' | 'floating-islands';

export type FutureContentEffect = 'prism-beam' | 'fluid-glass' | 'cyber-aura' | 'minimal-refract';

export interface FutureContentMetric {
  label: string;
  value: string;
  trend?: string;
}

export interface FutureContentItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  category: string;
  tag?: string;
  badge?: string;
  readTime?: string;
  audioDuration?: string;
  metrics?: FutureContentMetric[];
  author?: {
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  ctaText?: string;
  ctaUrl?: string;
  featured?: boolean;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
}

export interface FutureContentSectionConfig extends BaseSectionConfig {
  type: 'futureContent2027';
  source?: 'tenant_pages' | 'brand_services' | 'custom';
  activeMode: FutureContentMode;
  allowVisitorSwitching?: boolean;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  ambientMeshGlow?: boolean;
  ambientGlowColor?: string;
  effectStyle?: FutureContentEffect;
  items: FutureContentItem[];
  enableAudioPreview?: boolean;
  primaryButton?: {
    text: string;
    url: string;
  };
  secondaryButton?: {
    text: string;
    url: string;
  };
  cardBgColor?: string;
  titleColor?: string;
  textColor?: string;
}

export type KosvidioGalleryLayoutPreset =
  | 'feminine'
  | 'masculine'
  | 'standard'
  | 'current'
  | 'spiritual'
  | 'sharp'
  | 'analytical'
  | 'spotlight-grid'
  | 'stacked-list'
  | 'horizontal-scroll';

export type KosvidioGalleryLayout = KosvidioGalleryLayoutPreset;

export type KosvidioGalleryViewMode =
  | 'spotlight-grid'     // פריסה א: וידאו גדול ותחתיו כמה קטנים
  | 'stacked-list'       // רשימה זה תחת זה
  | 'horizontal-scroll'; // גלריה עם גלילה אופקית ללא גלישה

export type KosvidioGallerySource =
  | 'tenant_kosvidio'    // משיכה דינמית מקולקציית הטננט (עמודי וידאו / סרטוני ערוץ)
  | 'brand_services'     // משיכה דינמית משירותי המותג ב-DNA
  | 'custom';            // ניהול ידני של רשימת הסרטונים

export type KosvidioGallerySortBy = 'newest' | 'most_views' | 'most_likes' | 'title_asc';

export interface KosvidioGalleryLogicRules {
  sortBy?: KosvidioGallerySortBy;
  filterTag?: string;
  filterKeyword?: string;
  minViews?: number;
  onlyPublished?: boolean;
  maxVideos?: number;
}

export interface KosvidioGalleryItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  youtubeVideoId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  kosvidioSlug?: string;
  duration?: string;
  viewsCount?: number;
  likesCount?: number;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
}

export interface KosvidioGallerySectionConfig extends BaseSectionConfig {
  type: 'kosvidioGallery';
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  layout: KosvidioGalleryLayout;
  viewMode?: KosvidioGalleryViewMode;
  objectScale?: 'compact' | 'normal' | 'spacious';
  buttonShape?: 'pill' | 'rounded' | 'square';
  buttonSize?: 'sm' | 'md' | 'lg';
  allowVisitorLayoutSwitch?: boolean;
  source: KosvidioGallerySource;
  logicRules?: KosvidioGalleryLogicRules;
  maxVideos?: number;
  clickBehavior?: 'inline_and_link' | 'navigate_slug' | 'inline_only';
  channelName?: string;
  channelSlogan?: string;
  channelAvatarUrl?: string;
  titleColor?: string;
  descriptionColor?: string;
  accentColor?: string;
  cardBgColor?: string;
  items: KosvidioGalleryItem[];
  showCtaButton?: boolean;
  ctaButtonText?: string;
  ctaButtonUrl?: string;

  /** רקע של תמונה מאחורי הטקסט/הכרטיס עם שכבת רקע ואפקט עובר */
  textBgEnabled?: boolean;
  textBgImageUrl?: string;
  textBgOverlayColor?: string;
  textBgOverlayOpacity?: number;
  textBgEffect?: HeroTextBgEffect;
  textBgScope?: 'text-card' | 'full-section';
}

export type DynamicCategoriesLayoutPreset =
  | 'standard'
  | 'feminine'
  | 'masculine'
  | 'spiritual'
  | 'sharp'
  | 'analytical';

export interface DynamicCategoryCardItem {
  id: string;
  title: string;
  subtitle?: string;
  iconName: string; // Lucide icon name, e.g. Mic, Heart, Briefcase, MessageSquare
  iconUrl?: string; // Optional custom SVG or media uploaded via KOSCLOUD
  linkUrl: string;
  badge?: string;
  highlightText?: string;
  archiveCategoryKey?: string; // e.g. 'info_content' | 'event' | 'course' | 'community' | 'checkout' | 'youtube_post'
  archiveSlug?: string; // e.g. 'kosinfo', 'kosevent', 'koscourse', 'kosvidio'
}

export interface DynamicCategoriesSectionConfig extends BaseSectionConfig {
  type: 'dynamicCategories';
  title?: string;
  subtitle?: string;
  badge?: string;
  descriptionHtml?: string; // WYSIWYG
  layout?: DynamicCategoriesLayoutPreset;
  
  // Dynamic categories items
  categories: DynamicCategoryCardItem[];

  // Icon motion effect
  iconMotionEffect?: 'bounce-gentle' | 'pulse-slow' | 'float-subtle' | 'wiggle' | 'scale-hover' | 'none';

  // Typography Controls
  titleFontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  titleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  titleColor?: string;
  titleItalic?: boolean;
  titleUnderline?: boolean;
  titleAlignment?: 'right' | 'center' | 'left';

  cardTitleFontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  cardTitleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  cardTitleColor?: string;

  cardSubtitleFontSize?: 'xs' | 'sm' | 'base';
  cardSubtitleColor?: string;

  // Background and Styling
  backgroundColor?: string;
  cardBackgroundColor?: string;
  accentColor?: string;
  borderColor?: string;
  
  // Cloud Media Background
  bgMediaUrl?: string;
  bgMediaType?: 'image' | 'video';
  bgMediaOverlayColor?: string;
  bgMediaOverlayOpacity?: number;
}

// ============================================================================
// EVENTS LISTING SECTION CONFIGURATION (יוצר האזורים - ליסטינג אירועים דינמי)
// ============================================================================

export type EventImageMaskShape = 'arch' | 'oval' | 'flower' | 'heart' | 'rounded' | 'sharp' | 'hud';
export type EventListingCardLayout = 'classic-card' | 'split-arch' | 'horizontal-pill' | 'minimal-compact';
export type EventListingSource = 'auto-pages' | 'manual' | 'selected-pages' | 'all';
export type EventListingStylePreset = 'standard' | 'feminine' | 'masculine' | 'spiritual' | 'sharp' | 'analytical';

export interface EventListingItem {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  imageUrl: string;
  badge?: string; // כגון "ההרשמה למחזור תשפ״ז בעיצומה" / "מתחילים מחדש"
  
  // נתוני זמן ומקום מסונכרנים
  dayAndTime?: string; // כגון "בימי ראשון 20:00-22:30" / "בימי שלישי 09:00-12:15"
  locationFormat?: string; // כגון "היברידי: בזום ופרונטלי, מרכז חיבה, ירושלים" / "בזום >>" / "מבנה עתיקות באשקלון"
  startDateText?: string; // כגון "כ״א חשון תשפ״ז • 1.11.2026" / "כ״ד אלול - י״ב תשרי"
  sessionsCount?: string; // כגון "10 מפגשים" / "4 מפגשים חינמיים" / "25 מפגשים"
  
  // מרצים ומנחים
  instructor?: string; // כגון "עם הרב אוהד תירוש"
  
  // כפתור וקישור
  linkUrl?: string; // קישור לעמוד האירוע או ל-RSVP
  ctaText?: string; // כגון "לפרטים והצטרפות"
  actionType?: 'link' | 'modal' | 'scroll';
}

export interface EventsListingSectionConfig extends BaseSectionConfig {
  type: 'eventsListing';
  title?: string;
  subtitle?: string;
  badge?: string;
  descriptionHtml?: string;

  // Source & Loading
  source?: EventListingSource;
  selectedPageIds?: string[]; // בחירה דינמית של עמודים ספציפיים מכל סוגי העמודים
  filterCategory?: string; // e.g. 'all' | 'event' | 'course' | 'workshop'
  collectionLimit?: number;

  // Layout & Visual Card Masks
  cardLayout?: EventListingCardLayout; // 'split-arch' (עיצוב התמונה השנייה) / 'classic-card' (עיצוב התמונה הראשונה)
  imageMaskShape?: EventImageMaskShape; // arch (קשת עליונה), oval (אליפסה), flower, heart, rounded, sharp, hud
  gridColumns?: 2 | 3 | 4;
  stylePreset?: EventListingStylePreset;

  // Visual Effects
  cardEffect?: 'glow-hover' | 'border-beam' | 'tilt-3d' | 'lift-shadow' | 'none';

  // Items List
  items?: EventListingItem[];

  // Micro-copy / CTAs
  defaultCtaText?: string;

  // Filter & Search Controls
  showSearchBar?: boolean;
  searchPlaceholder?: string;
  showCategoryFilter?: boolean;

  // Typography Controls
  titleFontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  titleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  titleColor?: string;
  titleItalic?: boolean;
  titleUnderline?: boolean;
  titleAlignment?: 'right' | 'center' | 'left';

  cardTitleFontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  cardTitleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  cardTitleColor?: string;

  cardSubtitleFontSize?: 'xs' | 'sm' | 'base';
  cardSubtitleColor?: string;

  // Background and Styling
  backgroundColor?: string;
  cardBackgroundColor?: string;
  accentColor?: string;
  borderColor?: string;

  // Cloud Media Background
  bgMediaUrl?: string;
  bgMediaType?: 'image' | 'video';
  bgMediaOverlayColor?: string;
  bgMediaOverlayOpacity?: number;
}

// ============================================================================
// ARTICLES & CONTENT LISTING SECTION CONFIGURATION (יוצר האזורים - ליסטינג תוכן ומאמרים)
// ============================================================================

export type ArticlesListingLayoutPreset =
  | 'standard'
  | 'feminine'
  | 'masculine'
  | 'spiritual'
  | 'sharp'
  | 'analytical';

export interface ArticleCardItem {
  id: string;
  title: string;
  subtitle?: string; // e.g. "הרב אוהד תירוש" / author
  tag?: string; // e.g. "כללי", "הורות ומשפחה"
  tagColor?: string;
  imageUrl?: string; // Selected from KOSCLOUD
  linkUrl: string;
  ctaText?: string; // e.g. "למאמר המלא"
}

export interface ArticlesListingSectionConfig extends BaseSectionConfig {
  type: 'articlesListing';
  title?: string; // e.g. "מרכז הידע והתוכן של בנין שלם"
  subtitle?: string;
  badge?: string;
  descriptionHtml?: string; // WYSIWYG
  layout?: ArticlesListingLayoutPreset;

  // Header CTA button (e.g. "למרכז התוכן")
  topCtaText?: string;
  topCtaUrl?: string;
  showTopCta?: boolean;

  // Articles source and items
  source?: 'tenant_pages' | 'manual' | 'brand_services' | 'all';
  items: ArticleCardItem[];

  // Dynamic Search & Filtering
  showSearchBar?: boolean;
  searchPlaceholder?: string;
  showCategoryFilter?: boolean;
  selectedTagFilter?: string;
  sortBy?: 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'manual';
  maxItems?: number;

  // Button micro-copy defaults
  cardCtaText?: string; // "למאמר המלא"
  cardCtaBgColor?: string; // Coral/Orange #ea580c / #f97316

  // Typography Controls
  titleFontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  titleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  titleColor?: string;
  titleItalic?: boolean;
  titleUnderline?: boolean;
  titleAlignment?: 'right' | 'center' | 'left';

  cardTitleFontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  cardTitleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  cardTitleColor?: string;

  cardSubtitleFontSize?: 'xs' | 'sm' | 'base';
  cardSubtitleColor?: string;

  // Background and Styling
  backgroundColor?: string;
  cardBackgroundColor?: string; // e.g. light mint / soft cyan #eaf4f4
  accentColor?: string;
  borderColor?: string;

  // Cloud Media Background
  bgMediaUrl?: string;
  bgMediaType?: 'image' | 'video';
  bgMediaOverlayColor?: string;
  bgMediaOverlayOpacity?: number;
}



