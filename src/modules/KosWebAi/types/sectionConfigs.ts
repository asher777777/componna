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

export interface HeroSectionConfig extends BaseSectionConfig {
  type: 'hero';
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  videoBgUrl?: string;
  layout?: 'fz' | 'spatial' | 'centered' | 'split' | 'bento-hero';
  heroStyle?: 'classic' | 'modern' | 'minimal' | 'card' | 'mesh-glow';
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
  announcementBadge?: {
    text: string;
    url?: string;
    icon?: string;
  };
  socialProofAvatars?: {
    visible: boolean;
    avatars: HeroAvatarItem[];
    ratingText?: string;
    starsCount?: number;
  };
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

export interface StatsBentoItem {
  id: string;
  number: string;
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
  layout?: 'bento-4' | 'row-4' | 'cards-3';
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
  showSearchBar?: boolean;
  showContactCard?: boolean;
  whatsappContact?: string;
  items: FaqItem[];
}

export interface TimerSectionConfig extends BaseSectionConfig {
  type: 'timer';
  title: string;
  subtitle?: string;
  targetDate: string;
  layout?: 'boxed' | 'minimal' | 'cards' | 'floating-bar';
  ctaText?: string;
  ctaUrl?: string;
  titleColor?: string;
  subtitleColor?: string;
  boxBackgroundColor?: string;
  numberColor?: string;
  labelColor?: string;
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
  showLiveChatPreview?: boolean;
  chatBubbleMessage?: string;
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
  openingHours?: string;
  directWhatsappChat?: boolean;
  formId?: string;
  form?: FormConfigContract;
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

export interface LiveAnalyticsSectionConfig extends BaseSectionConfig {
  type: 'liveAnalytics';
  title?: string;
  subtitle?: string;
  adminOnly?: boolean; // When true, only visible when editing or logged in as admin
  displayStyle?: 'bento' | 'glass-cards' | 'ticker' | 'minimal';
  showViews?: boolean;
  showUniqueVisitors?: boolean;
  showCtaClicks?: boolean;
  showLeads?: boolean;
  showConversionRate?: boolean;
  showTrafficSources?: boolean;
  showAiTrafficBadge?: boolean;
  showGa4StatusBadge?: boolean;
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

export interface KosvidioSectionConfig extends BaseSectionConfig {
  type: 'kosvidio';
  // 1. Innovative Video Player
  youtubeVideoId: string;
  videoUrl?: string;
  playerAspect?: '16:9' | '21:9' | '4:3';
  ambientGlow?: boolean;
  showTheaterMode?: boolean;
  autoplay?: boolean;
  channelName?: string;
  channelAvatarUrl?: string;
  channelSubscribers?: string;
  verifiedBadge?: boolean;

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

export interface DynamicListingSectionConfig extends BaseSectionConfig {
  type: 'dynamicListing';
  title?: string;
  subtitle?: string;
  badge?: string;
  source: DynamicListingSource;
  layout: DynamicListingLayout;
  gridColumns?: 2 | 3 | 4;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  showCategoryFilter?: boolean;
  categories?: string[];
  showSearchBar?: boolean;
  searchPlaceholder?: string;
  effectStyle?: 'border-beam' | 'glow-hover' | 'tilt-3d' | 'subtle';
  collectionLimit?: number;
  items: DynamicListingItem[];
  primaryButton?: {
    text: string;
    url: string;
  };
  cardBgColor?: string;
  titleColor?: string;
}

