/**
 * Donation & Recurring Tier Types for KSF Form Engine
 * Monopoly Law: KSF is the single authority for forms & donation steps
 */

export interface DonationTier {
  id: string;
  name: string;
  title?: string;
  amount: number;
  monthlyAmount?: number;
  description?: string;
  subtitle?: string;
  isDefault?: boolean;
  color?: string;
  popular?: boolean;
  icon?: string;
  imageSrc?: string;
  imageShape?: 'circle' | 'rounded' | 'full';
  displayMode?: 'standard' | 'full_image';
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
  tierDisplayMode?: 'standard' | 'full_image';
  tierImageShape?: 'circle' | 'rounded' | 'full';
  step1Title?: string;
  step2Title?: string;
  step3Title?: string;
  thankYouTitle?: string;
  thankYouSubtitle?: string;
  thankYouImage?: string;
  thankYouShareText?: string;
  fieldBgColor?: string;
  borderColor?: string;
  fontSizeScale?: number;
}
