export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'price'
  | 'calculated'
  | 'hidden'
  | 'single_choice'
  | 'multi_choice'
  | 'rating'
  | 'scale'
  | 'date'
  | 'time'
  | 'file_upload'
  | 'payment'
  | 'ticket_booking'
  | 'coupon_code';

export interface TicketTier {
  id: string;
  name: string;
  description?: string;
  price: number;
  capacity?: number;
  soldCount?: number;
  maxPerOrder?: number;
  iconName?: string;
}

export interface TicketBookingItem {
  tierId: string;
  tierName: string;
  unitPrice: number;
  quantity: number;
  attendeeNames?: string[];
}

export interface TicketBookingAnswer {
  items: TicketBookingItem[];
  totalQuantity: number;
  subtotal: number;
  attendeeNames: string[];
  summaryText: string;
}

export interface CouponDefinition {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  validFrom?: string;
  validUntil?: string;
  maxUses?: number;
  usedCount?: number;
  minOrderAmount?: number;
  active: boolean;
}

export interface AppliedCouponAnswer {
  code: string;
  couponId?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  isFree: boolean;
}

export type ToneStyle =
  | 'executive_luxury'
  | 'warm_consulting'
  | 'direct_professional'
  | 'exclusive_vip'
  | 'innovative_tech'
  | 'custom';

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  iconName?: string;
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_empty'
  | 'is_not_empty';

export interface StepConditionRule {
  id: string;
  fieldKey: string;
  operator: ConditionOperator;
  value?: string;
}

export interface StepConditionalLogic {
  enabled: boolean;
  logicType: 'all' | 'any';
  rules: StepConditionRule[];
}

export interface FormStep {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  fieldType: FieldType;
  iconName: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[];
  minRating?: number;
  maxRating?: number;
  minScale?: number;
  maxScale?: number;
  minScaleLabel?: string;
  maxScaleLabel?: string;
  helperText?: string;
  defaultValue?: any;
  mappingKey?: string; // Key name for the submission data and CRM mapping (e.g., conta_name, conta_phone, email)
  ticketTiers?: TicketTier[];
  collectAttendeeNames?: boolean;
  coupons?: CouponDefinition[];
  // Price field configuration (fieldType === 'price')
  priceSource?: 'default' | 'field';
  priceSourceFieldKey?: string;
  priceEditable?: boolean;
  // Hidden field configuration (fieldType === 'hidden')
  hiddenUrlParam?: string;
  // Calculated field configuration (fieldType === 'calculated')
  calcFormula?: string;
  isPriceField?: boolean;
  // Universal conditional visibility logic
  conditionalLogic?: StepConditionalLogic;
  // Payment step configuration (fieldType === 'payment')
  paymentAmountSource?: 'fixed' | 'field';
  paymentAmountFieldKey?: string;
  paymentFrequencyMode?: 'one_time' | 'recurring' | 'from_field';
  paymentFrequencyFieldKey?: string;
  paymentRecurringMatchValue?: string;
  paymentRecurringInstallments?: number;
  paymentDocumentType?: number;
  paymentRequireId?: boolean;
}

import type { TenantStylePreset } from '../../../core/contracts';

export interface FormThemeSettings {
  stylePreset?: TenantStylePreset;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  cardBackground: string;
  borderRadius: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showProgressBar: boolean;
  showStepNumbers: boolean;
  luxuryBorder: boolean;
  buttonStyle: 'solid' | 'gradient' | 'outline';
  backgroundType?: 'color' | 'gradient' | 'image';
  backgroundImageUrl?: string;
  backgroundOverlayOpacity?: number; // 0 to 100
  aspectRatio?: 'auto' | '16:9' | '9:16' | '1:1' | '4:3';
  containerShape?: 'rounded' | 'square' | 'circle' | 'pill';
  displayMode?: 'standard_card' | 'single_field_focus' | 'fullscreen';
  enableVoiceInput?: boolean;
}


export interface FormCompletionSettings {
  title: string;
  subtitle: string;
  iconName: string;
  showRedirectButton: boolean;
  redirectButtonText?: string;
  redirectUrl?: string;
  autoRedirectSeconds?: number;
}

export interface SmartFormDefinition {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  tone: ToneStyle;
  toneDescription?: string;
  steps: FormStep[];
  theme: FormThemeSettings;
  completion: FormCompletionSettings;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  status: 'published' | 'draft' | 'archived';
  viewsCount?: number;
  startsCount?: number;
  submissionsCount?: number;
  isCrmSyncEnabled?: boolean;
  crmDefaultTags?: string[];
  crmDefaultCommunity?: string;
  whatsappAutomationEnabled?: boolean;
  whatsappRules?: import('./whatsapp.types').FormWhatsAppRule[];
  coupons?: CouponDefinition[];
}

export interface AIBrainstormMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedSteps?: FormStep[];
  suggestedTone?: ToneStyle;
  suggestedTheme?: Partial<FormThemeSettings>;
}
