/**
 * Types & Data Entities for Ambassador Campaigns Hub
 */

export interface DonationTier {
  id: string;
  name: string;
  amount: number;
  monthlyAmount?: number;
  description: string;
  isDefault?: boolean;
  color?: string;
  popular?: boolean;
  subtitle?: string;
  icon?: string;
}

export interface DrawerConfig {
  theme?: 'light' | 'dark';
  whatsapp_enabled?: boolean;
  whatsapp_success_message?: string;
  whatsapp_success_image_url?: string;
  whatsapp_pending_message?: string;
  whatsapp_pending_image_url?: string;
  direct_bit_phone?: string;
  direct_bank_details?: string;
  receipt_prefix?: string;
  testMode?: boolean;
}

export interface CampaignVideoGallery {
  images?: string[];
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'direct' | 'auto';
  effect?: 'fade' | 'slide' | 'zoom';
  objectFit?: 'cover' | 'contain';
  desktopHeight?: string;
  titleEffect?: string;
  backgroundColor?: string;
}

export interface CampaignDonorsDisplayConfig {
  cardLayout?: 'grid-2' | 'grid-3' | 'list';
  defaultTab?: 'recent' | 'top';
  showSearch?: boolean;
  showSort?: boolean;
  showDedications?: boolean;
}

export interface CampaignStoryContent {
  heading?: string;
  title?: string;
  body?: string;
  layout?: 'center' | 'course-banner';
  bannerImage?: string;
}

export interface CampaignBranding {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  theme?: 'dark' | 'light' | 'gradient';
  svgTrendPreset?: 'curve_up' | 'percentage_gauge' | 'custom';
  customSvgPath?: string;
}

export interface Campaign {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  targetGoal: number;
  totalRaised: number;
  donorCount: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  campaignTiers?: {
    donationType?: 'one_time' | 'recurring' | 'both';
    recurringMonths?: number;
    tiers?: DonationTier[];
  };
  drawerConfig?: DrawerConfig;
  videoGallery?: CampaignVideoGallery;
  donorsConfig?: CampaignDonorsDisplayConfig;
  branding?: CampaignBranding;
  storyContent?: CampaignStoryContent;
  testMode?: boolean;
  ownerId?: string;
  slug?: string;
  featuredImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ambassador {
  id: string;
  campaignId: string;
  name: string;
  leaderName: string;
  slug: string;
  targetGoal: number;
  totalRaised: number;
  donorCount: number;
  message?: string;
  vision?: string;
  gallery?: string[];
  phone?: string;
  email?: string;
  status?: 'active' | 'pending' | 'archived';
  pageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type DonationPaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type DonationMode = 'one_time' | 'recurring';

export interface Donation {
  id: string;
  campaignId: string;
  donorName: string;
  realDonorName?: string;
  amount: number;
  monthlyAmount?: number | null;
  recurringMonths?: number | null;
  isRecurring: boolean;
  tier?: string;
  dedication?: string;
  isAnonymous: boolean;
  ambassadorId?: string | null;
  ambassadorName?: string | null;
  phone?: string;
  email?: string;
  paymentStatus: DonationPaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  receiptUrl?: string;
  pendingWhatsAppSent?: boolean;
  pendingWhatsAppSentAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCampaignPayload {
  title: string;
  subtitle?: string;
  description?: string;
  targetGoal: number;
  slug?: string;
  currency?: string;
  featuredImageUrl?: string;
  donationType?: 'one_time' | 'recurring' | 'both';
  tiers?: DonationTier[];
  videoGallery?: CampaignVideoGallery;
  branding?: CampaignBranding;
  ownerId?: string;
}

export interface CreateAmbassadorPayload {
  campaignId: string;
  name: string;
  leaderName?: string;
  targetGoal: number;
  message?: string;
  gallery?: string[];
  customSlug?: string;
  phone?: string;
  email?: string;
  ownerId?: string;
}

export interface RecordPendingDonationPayload {
  campaignId: string;
  donorName: string;
  amount: number;
  monthlyAmount?: number;
  recurringMonths?: number;
  isRecurring?: boolean;
  tier?: string;
  dedication?: string;
  isAnonymous?: boolean;
  ambassadorId?: string | null;
  ambassadorName?: string | null;
  phone?: string;
  email?: string;
}

export interface CompleteDonationPayload {
  campaignId: string;
  donationId: string;
  contactId?: string;
  amount: number;
  monthlyAmount?: number;
  recurringMonths?: number;
  isRecurring?: boolean;
  dedication?: string;
  isAnonymous?: boolean;
  ambassadorId?: string | null;
  ambassadorName?: string | null;
  transactionId?: string;
  receiptUrl?: string;
  paymentMethod?: string;
  donorName?: string;
  phone?: string;
  email?: string;
}

export interface CampaignModuleConfig {
  defaultCampaignId?: string;
  enableLiveFeed?: boolean;
  enableWhatsAppAlerts?: boolean;
  enableCrmSync?: boolean;
}
