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
  'kosai:action': any;
  'media:request_picker': any;
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
  'brand:logo_updated': { logoUrl: string; updatedAt: string };
  'brand:vibe_image_added': { imageUrl: string; updatedAt: string };
  'media:ai_edit_requested': { item: any };
  'whatsapp:status:viewed': { phone: string; statusId: string };
  'landing_page:generated_from_doc': {
    sourceFileId: string;
    sourceFileName: string;
    pageTitle: string;
    sections: any[];
    brandStyles?: any;
    createdAt: string;
  };
  'campaign:ambassador:created': {
    campaignId: string;
    ambassadorId: string;
    name: string;
    leaderName?: string;
    slug: string;
    targetGoal: number;
    phone?: string;
    email?: string;
    shareUrl: string;
    createdAt: string;
  };
  'campaign:donation:pending': {
    campaignId: string;
    donationId: string;
    amount: number;
    donorName: string;
    phone?: string;
    email?: string;
    ambassadorId?: string;
    ambassadorName?: string;
    paymentUrl: string;
    createdAt: string;
  };
  'campaign:donation:completed': {
    campaignId: string;
    donationId: string;
    amount: number;
    donorName: string;
    phone?: string;
    email?: string;
    ambassadorId?: string;
    ambassadorName?: string;
    receiptUrl?: string;
    paymentMethod: string;
    transactionId?: string;
    completedAt: string;
  };
  'email:campaign:sent': {
    campaignId: string;
    campaignTitle: string;
    recipientCount: number;
    sentAt: string;
  };
  'email:automation:triggered': {
    automationId: string;
    triggerEvent: string;
    recipientEmail: string;
    actionTaken: string;
    timestamp: string;
  };
  'email:delivery:failed': {
    campaignId?: string;
    automationId?: string;
    recipientEmail: string;
    reason: string;
    timestamp: string;
  };
  'crm:groups:import_requested': {
    source?: string;
    tenantId?: string;
  };
  'crm:groups:import_completed': {
    importedCount: number;
    groupsCount?: number;
    timestamp: string;
  };
  'kesher:sync:requested': {
    timeframe?: 'all' | 'year' | '3months' | 'week';
    tenantId?: string;
    force?: boolean;
  };
  'kesher:sync:completed': {
    success: boolean;
    createdCount?: number;
    updatedCount?: number;
    totalTransactions?: number;
    message: string;
    timestamp?: string;
  };
  'crm:chart:create_requested': {
    chart: any;
    tenantId?: string;
  };
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

export interface FlagshipProduct {
  id: string;
  nameAndSlogan: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  painPointSolved: string;
  targetAudience: string;
  competitiveAdvantage: string;
  linkedPageId?: string;
  linkedPageSlug?: string;
}

export interface BusinessPackage {
  id: string;
  name: string;
  description: string;
  painPointsAddressed: string;
  competitiveAdvantage: string;
  targetAudience: string;
  callToAction: string;
}

export interface BrandEcosystem {
  services: string[];
  products: (string | FlagshipProduct)[];
  annualEvents: string[];
  communities: string[];
  businessPackages?: BusinessPackage[];
}

export interface BrandDna {
  identity: BrandIdentity;
  voice: BrandVoice;
  audience: BrandAudience;
  ecosystem?: BrandEcosystem;
  designTokens: BrandDesignTokens;
  trust: BrandTrustAndCheckout;
  updatedAt?: string;
}

export interface BrandDnaContract {
  getBrandDna: () => BrandDna;
  getSystemPrompt: (moduleRole?: string) => string;
  getDesignTokens: () => BrandDesignTokens;
  updateBrandDna?: (partial: Partial<BrandDna>) => Promise<boolean>;
  setLogoUrl?: (url: string) => Promise<boolean>;
  addVibeImage?: (url: string) => Promise<boolean>;
  removeVibeImage?: (url: string) => Promise<boolean>;
}

// ========================
// KOSAI AI Engine Contracts
// ========================

export interface KosaiImageGenerationOptions {
  prompt: string;
  mode?: 'general' | 'logo' | 'vibe' | 'edit';
  stylePreset?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  referenceImageBase64?: string;
  brandDna?: BrandDna;
  model?: string;
  customApiKey?: string;
}

export interface KosaiImageGenerationResult {
  imageUrl: string;
  base64Data?: string;
  mimeType?: string;
  width: number;
  height: number;
  model: string;
  enhancedPrompt?: string;
  suggestedTitle?: string;
  suggestedDescription?: string;
  suggestedTags?: string[];
  usageReport?: any;
}

export interface KosaiImageEditOptions {
  referenceImageBase64: string;
  instruction: string;
  brandDna?: BrandDna;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  model?: string;
  customApiKey?: string;
}

export interface KosaiAgentContract {
  generateImage: (options: KosaiImageGenerationOptions) => Promise<KosaiImageGenerationResult>;
  generateBrandLogo: (options: { prompt?: string; stylePreset?: string; brandDna?: BrandDna }) => Promise<KosaiImageGenerationResult>;
  generateBrandVibeImage: (options: { prompt?: string; vibeStyle?: string; brandDna?: BrandDna; aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' }) => Promise<KosaiImageGenerationResult>;
  editImageWithAi: (options: KosaiImageEditOptions) => Promise<KosaiImageGenerationResult>;
  enhancePromptWithBrandContext: (prompt: string, type: 'logo' | 'vibe' | 'edit' | 'general', brandDna?: BrandDna) => Promise<{ enhancedPromptEn: string; explanationHe: string }>;

}

export * from './collections';



