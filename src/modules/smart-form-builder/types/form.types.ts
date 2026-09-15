export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'single_choice'
  | 'multi_choice'
  | 'rating'
  | 'scale'
  | 'date'
  | 'time'
  | 'file_upload';

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
}

export interface FormThemeSettings {
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
