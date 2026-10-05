/**
 * Global Core Contracts (חוזים וממשקים משותפים)
 * All modules must import only contracts from this file, never implementation from sibling modules.
 */

export interface MediaPickerOptions {
  accept?: 'image/*' | 'video/*' | 'audio/*' | '*/*';
  multiple?: boolean;
  maxFiles?: number;
}

export interface MediaPickerContract {
  openPicker: (options?: MediaPickerOptions) => Promise<string | string[] | null>;
}

export interface LeadPayload {
  conta_name: string;
  conta_phone: string;
  email?: string;
  source?: string;
  tags?: string[];
  community?: string;
  metadata?: Record<string, any>;
}

export interface LeadCaptureContract {
  captureLead: (lead: LeadPayload) => Promise<string | boolean>;
}

export interface NotificationContract {
  notify: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface FormItemSummary {
  id: string;
  title: string;
  submissionsCount?: number;
}

export interface FormBuilderContract {
  getForms?: () => Promise<FormItemSummary[]>;
  renderSubmissionsTable?: (formId: string, formTitle?: string) => React.ReactNode;
}

export interface WhatsAppContract {
  sendMessage: (phone: string, text: string) => Promise<{ idMessage?: string; error?: string }>;
  buildWaMeUrl: (phone: string, text?: string) => string;
}

export interface AuthSessionContract {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer';
  isAuthenticated: boolean;
}

export interface CrmContactSummary {
  id: string;
  conta_name: string;
  conta_phone?: string;
  email?: string;
  tg1?: string; // ת.ז. / ח.פ.
  total_spent?: number;
  order_count?: number;
  [key: string]: any;
}

export interface CoreEventMap {
  'crm:lead:created': LeadPayload;
  'media:uploaded': { url: string; fileName: string; type: string; sourceModule?: string };
  'auth:state_changed': AuthSessionContract;
  'form:submitted': { formId?: string; pageUrl?: string; data?: Record<string, any>; [key: string]: any };
  'smart_form:submitted': {
    formId: string;
    formTitle: string;
    submissionId: string;
    data: Record<string, any>;
    leadPayload?: LeadPayload;
    submittedAt: string;
  };
  'crm:contact:updated': { id: string; conta_name?: string; email?: string; [key: string]: any };
  'payment:completed': {
    transactionId: string;
    amount: number;
    clientName: string;
    phone?: string;
    email?: string;
    tz?: string;
    paymentMethod: string;
    documentType?: number | string;
    receiptUrl?: string;
    timestamp: string;
  };
  'player:interaction': { videoId: string; eventType: string; timestamp: number };
  'brand:updated': { brandDna: BrandDna; updatedAt: string };
}

// ========================
// Brand DNA Hub Contracts
// ========================

export type OrganizationType = 'חברה' | 'עמותה' | 'שותפות' | 'עוסק מורשה' | 'עוסק פטור' | 'אחר';

export type GenderAddressing = 'male' | 'female' | 'plural' | 'neutral' | 'direct';

export type SectorCompliance = 'general' | 'religious' | 'ultra_orthodox' | 'business';

export type BorderRadiusStyle = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type ButtonStyleType = 'solid' | 'gradient' | 'outline' | 'glass';

export interface PersonaItem {
  id: string;
  name: string;
  roleOrProfile: string;
  mainPain: string;
  dreamOutcome: string;
}

export interface ObjectionItem {
  id: string;
  objection: string;
  rebuttal: string;
}

export interface BrandIdentity {
  companyName: string;
  organizationType: OrganizationType;
  organizationPurpose: string;
  memberCount: string;
  slogan: string;
  companyVision: string;
  shortVision: string;
  logoUrl?: string;
  vibeImages?: string[];
}

export interface BrandVoice {
  personality: {
    formality: number;
    warmth: number;
    luxury: number;
    energy: number;
  };
  genderAddressing: GenderAddressing;
  sectorCompliance: SectorCompliance;
  powerWords: string[];
  forbiddenWords: string[];
  shabbatObservant: boolean;
}

export interface BrandAudience {
  mainUvp: string;
  targetAudiences: string[];
  personas: PersonaItem[];
  commonObjections: ObjectionItem[];
}

export interface BrandDesignTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  textColorH1: string;
  textColorH2: string;
  buttonBgColor: string;
  buttonTextColor: string;
  fontFamily: string;
  borderRadius: BorderRadiusStyle;
  buttonStyle: ButtonStyleType;
}

export interface BrandTrustAndCheckout {
  legalEntityId: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  refundPolicySummary: string;
  securityBadgeText: string;
  securityBadgeImageUrl?: string;
  whatsappSupportNumber?: string;
}

export interface BrandDna {
  identity: BrandIdentity;
  voice: BrandVoice;
  audience: BrandAudience;
  designTokens: BrandDesignTokens;
  trust: BrandTrustAndCheckout;
  updatedAt?: string;
}

export interface BrandDnaContract {
  getBrandDna: () => BrandDna;
  getSystemPrompt: (moduleRole?: string) => string;
  getDesignTokens: () => BrandDesignTokens;
}


