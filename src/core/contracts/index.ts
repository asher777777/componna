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

export type KosCloudStoreContract = MediaPickerContract;

export * from './collections';

export interface LeadPayload {
  // Canonical KOSUN CRM Schema
  kosun_crm_name?: string;
  kosun_crm_phone?: string;
  kosun_crm_email?: string;
  kosun_crm_company?: string;
  kosun_crm_city?: string;
  kosun_crm_street?: string;
  kosun_crm_gov_id?: string;
  kosun_crm_notes?: string;
  kosun_crm_tags?: string[];
  kosun_crm_source?: string;

  // Legacy fields (maintained for backward compatibility during migration)
  conta_name?: string;
  conta_phone?: string;
  email?: string;
  source?: string;
  tags?: string[];
  community?: string;
  metadata?: Record<string, any>;
}

export interface LeadCaptureContract {
  captureLead: (lead: LeadPayload) => Promise<string | boolean>;
}

export interface CrmFieldOption {
  value: string;
  label: string;
  group?: string;
}

export interface CrmMetadataContract {
  getMappingFields: () => Promise<CrmFieldOption[]> | CrmFieldOption[];
  captureLead?: (lead: LeadPayload) => Promise<string | boolean>;
  createCustomField?: (field: { label: string; key?: string; type?: string }) => Promise<{ success: boolean; field?: CrmFieldOption; error?: string }>;
}

export interface NotificationContract {
  notify: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface FormItemSummary {
  id: string;
  title: string;
  category?: string;
  submissionsCount?: number;
  hasPaymentStep?: boolean;
  hasWhatsAppTrigger?: boolean;
}

export interface DefaultFormsStatus {
  hasLeadForm: boolean;
  hasPaymentForm: boolean;
  hasWhatsAppForm: boolean;
  missingTypes: ('leads' | 'payment' | 'whatsapp')[];
}

export interface FormFieldContract {
  label: string;
  type: string; // text, tel, email, textarea, select, number, fixed_amount, hidden, calculated, rich_text_display, image_display, step, payment_summary, payment_cc, donation_widget
  map_to: string;
  map_to_2?: string;
  required: boolean;
  default_value?: string;
  options?: string;
  url_param_enable?: boolean;
  url_param_name?: string;
  cond_enable?: boolean;
  cond_field_index?: number;
  cond_operator?: string;
  cond_value?: string;
  step?: number;
  calc_formula?: string;
  icon?: string;
  widthPercentage?: number;
  height?: string | number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  focusColor?: string;
  placeholder?: string;
  autocomplete?: string;
  payment_doc_type?: string; // 320 = מס/קבלה, 400 = קבלה, 405 = תרומה
  payment_methods?: string[]; // 'one-time', 'installments', 'recurring', 'bit'
  payment_recurring_limit?: string; // 'user-choice', 'unlimited', '12', '24'
  payment_require_id?: boolean;
  submitOnNext?: boolean;
  step_button_text?: string;
  step_button_icon?: string;
  step_button_bg_color?: string;
  step_button_text_color?: string;
  step_back_button_text?: string;
  step_back_button_bg_color?: string;
  step_back_button_text_color?: string;
}

export interface FormConfigContract {
  enabled: boolean;
  form_type: 'standard' | 'payment' | 'register';
  submit_button_text: string;
  submit_button_bg_color?: string;
  submit_button_text_color?: string;
  continue_button_text?: string;
  back_button_text?: string;
  fields: FormFieldContract[];
  save_to_crm: boolean;
  crm_owner_id?: string;
  crm_save_step?: number;
  standard_success_message: string;
  standard_redirect_url?: string;
  standard_whatsapp_message?: string;
  standard_whatsapp_image_url?: string;
  payment_amount?: number;
  payment_amount_crm_map?: string;
  payment_pending_message?: string;
  payment_pending_image_url?: string;
  payment_success_message?: string;
  payment_success_image_url?: string;
  payment_receipt_type?: string; // 320, 400, 405
  payment_frequency?: 'one-time' | 'recurring' | 'user-choice';
  payment_methods?: string[];
  payment_require_id?: boolean;
  templateId?: string;
  templateName?: string;
  // Modal container styling & visual effects
  modal_shape?: 'rounded-2xl' | 'rounded-3xl' | 'rounded-capsule' | 'rounded-asymmetric' | 'rounded-sharp';
  modal_effect?: 'glass' | 'neon' | 'aura' | 'shadow-luxury' | 'flat' | 'gradient-border';
  modal_bg_color?: string;
  modal_backdrop_blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  modal_max_width?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FormSubmissionPayload {
  formId: string;
  formTitle: string;
  formType?: string;
  formData: Record<string, any>;
  amountPaid?: number;
  status?: string;
  receiptUrl?: string;
  transactionId?: string;
  embeddingPostId?: string;
  embeddingCollection?: string;
}

export interface FormSubmissionResult {
  success: boolean;
  submissionId?: string;
  error?: string;
}

export interface FormBuilderContract {
  getForms?: () => Promise<FormItemSummary[]>;
  getActiveFormsList?: () => FormItemSummary[];
  getFormById?: (formId: string) => Promise<any>;
  saveForm?: (form: any) => Promise<{ id: string; success: boolean }>;
  submitForm?: (payload: FormSubmissionPayload) => Promise<FormSubmissionResult>;
  checkDefaultFormsStatus?: () => Promise<DefaultFormsStatus>;
  createDefaultForm?: (type: 'leads' | 'payment' | 'whatsapp') => Promise<{ id: string; title: string }>;
  openBrainstormModal?: () => void;
  openBuilderForForm?: (formId: string) => void;
  renderSubmissionsTable?: (formId: string, formTitle?: string) => React.ReactNode;
}


// ========================
// Kesher Payment Clearing Contract
// ========================

export interface KesherPaymentRequest {
  amount: number;
  clientName: string;
  phone?: string;
  email?: string;
  tz?: string;
  paymentMethod?: 'credit_card' | 'bit' | 'cash' | 'bank_transfer';
  description?: string;
  documentType?: number | string; // 320 = חשבונית מס קבלה, 400 = קבלה, 405 = תרומה
  formId?: string;
  metadata?: Record<string, any>;
}

export interface KesherPaymentResponse {
  success: boolean;
  transactionId?: string;
  receiptUrl?: string;
  error?: string;
  statusCode?: string;
}

export interface KesherPaymentContract {
  isConfigured: () => boolean;
  processPayment: (req: KesherPaymentRequest) => Promise<KesherPaymentResponse>;
  renderPaymentPad?: (props: {
    amount: number;
    clientName?: string;
    phone?: string;
    email?: string;
    description?: string;
    onSuccess?: (res: KesherPaymentResponse) => void;
    onCancel?: () => void;
  }) => React.ReactNode;
}

// ========================
// WhatsApp Messaging Contract (KosWhatsUp Monopoly)
// ========================

export interface WhatsAppSendResult {
  success: boolean;
  idMessage?: string;
  error?: string;
}

export interface WhatsAppSendMessageParams {
  phone?: string;
  chatId?: string;
  message?: string;
  text?: string;
  quotedMessageId?: string;
  linkPreview?: boolean;
}

export interface WhatsAppSendFileParams {
  phone?: string;
  chatId?: string;
  urlFile: string;
  fileName?: string;
  caption?: string;
}

export interface WhatsAppSendPollParams {
  phone?: string;
  chatId?: string;
  message: string;
  options: Array<{ optionName: string }> | string[];
  multipleAnswers?: boolean;
}

export interface WhatsAppGroupSummary {
  id: string;
  name: string;
}

export interface WhatsAppGroupParticipantSummary {
  phone: string;
  name: string;
  isAdmin?: boolean;
  chatId?: string;
}

export interface WhatsAppContract {
  isConfigured: () => boolean;
  sendMessage: (
    phoneOrParams: string | WhatsAppSendMessageParams,
    optionalText?: string
  ) => Promise<WhatsAppSendResult>;
  sendFile?: (params: WhatsAppSendFileParams) => Promise<WhatsAppSendResult>;
  sendPoll?: (params: WhatsAppSendPollParams) => Promise<WhatsAppSendResult>;
  fetchGroups?: () => Promise<WhatsAppGroupSummary[]>;
  fetchGroupParticipants?: (groupId: string) => Promise<WhatsAppGroupParticipantSummary[]>;
  sendTemplateNotification?: (
    phone: string,
    templateText: string,
    variables?: Record<string, string>
  ) => Promise<WhatsAppSendResult>;
  buildWaMeUrl: (phone: string, text?: string) => string;
}

export type KosWhatsUpContract = WhatsAppContract;

// ========================
// Recruitment & Ambassador Campaigns Contract (גיוס ושגרירים)
// ========================

export interface AmbassadorSummary {
  id: string;
  name: string;
  campaignId: string;
  campaignTitle?: string;
  targetGoal: number;
  totalRaised: number;
  donorsCount?: number;
  slug?: string;
  shareUrl?: string;
}

export interface RecruitmentContract {
  getCampaigns?: () => Promise<Array<{ id: string; title: string; targetGoal: number; totalRaised: number }>>;
  getAmbassadorDetails?: (ambassadorId: string) => Promise<AmbassadorSummary | null>;
  renderAmbassadorBadge?: (props: { ambassadorId?: string; campaignTitle?: string; totalRaised?: number }) => React.ReactNode;
  openAmbassadorDrawer?: (campaignId?: string, contactId?: string) => void;
  createCampaignLandingPage?: (campaignId: string, options?: Partial<CreateCampaignPageOptions>) => Promise<{
    success: boolean;
    pageId: string;
    slug: string;
    publicUrl: string;
    error?: string;
  }>;
}

// ========================
// CRM Groups & Communities Contract (קבוצות וקהילות)
// ========================

export interface CrmGroupSummary {
  id: string;
  name: string;
  type: 'manual' | 'smart';
  category?: 'community' | 'group';
  color?: string;
  count?: number;
  description?: string;
}

export interface CrmGroupsContract {
  getGroups: () => Promise<CrmGroupSummary[]>;
  assignContactToGroup?: (contactId: string, groupId: string) => Promise<boolean>;
  removeContactFromGroup?: (contactId: string, groupId: string) => Promise<boolean>;
  renderGroupSelector?: (props: {
    selectedGroupId?: string;
    onSelect: (group: CrmGroupSummary) => void;
  }) => React.ReactNode;
}

// ========================
// Email Marketing & Dispatch Contract (מייל ואוטומציות דיוור)
// ========================

export interface EmailDispatchOptions {
  to: string;
  subject: string;
  htmlContent?: string;
  templateId?: string;
  campaignId?: string;
  variables?: Record<string, string>;
}

export interface EmailContract {
  isConfigured: () => boolean;
  sendEmail: (options: EmailDispatchOptions) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  renderEmailComposerModal?: (props: {
    recipientEmail: string;
    recipientName?: string;
    onSuccess?: () => void;
    onClose?: () => void;
  }) => React.ReactNode;
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
  kosun_crm_name?: string;
  kosun_crm_phone?: string;
  kosun_crm_email?: string;
  kosun_crm_gov_id?: string;
  // Legacy fields
  conta_name?: string;
  conta_phone?: string;
  email?: string;
  tg1?: string; // ת.ז. / ח.פ.
  total_spent?: number;
  order_count?: number;
  // Subdomain / Multi-Tenant User fields
  isUser?: boolean;
  isSubdomainAdmin?: boolean;
  subdomain?: string;
  adminUsername?: string;
  [key: string]: any;
}

// ==========================================
// Subdomain Tenant & User Contact Contract (חוזה איש קשר סאב-דומיין ומשתמש מערכת)
// ==========================================

export interface SubdomainTenantContactData {
  subdomain: string;
  fullDomain: string;
  clientName: string;
  adminUsername: string;
  adminPassword?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  activeModules: string[];
  status: 'active' | 'suspended' | 'draft';
  billingPlan?: 'monthly' | 'annual' | 'custom';
  monthlyTotal?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantRecord {
  subdomain: string;
  fullDomain: string;
  clientName: string;
  ownerEmail: string;
  ownerPhone: string;
  activeModules: string[];
  collectionPrefix: string;
  billingPlan: 'monthly' | 'annual' | string;
  monthlyTotal: number;
  paymentTransactionId?: string;
  status: 'active' | 'pending' | 'suspended' | string;
  createdAt: string;
  updatedAt: string;
  adminUsername?: string;
  adminPassword?: string;
  notes?: string;
}

export interface SubdomainTenantContactContract {
  /**
   * Synchronize tenant record to CRM master contact
   */
  syncTenantToContact: (tenant: SubdomainTenantContactData) => Promise<string>;

  /**
   * Update tenant record from CRM contact edit in master
   */
  updateTenantFromContact: (subdomain: string, updates: Partial<SubdomainTenantContactData>) => Promise<boolean>;

  /**
   * Retrieve tenant record by subdomain
   */
  getTenantBySubdomain?: (subdomain: string) => Promise<SubdomainTenantContactData | null>;
}

// ========================
// KosAi Action Contracts (פעולות סוכן KosAi המבוצעות ע"י הרכיב בעל המונופול)
// ========================

/** Payload for REMOVE_CONTACT_TAGS – removes tags from contacts without deleting the contacts */
export interface RemoveContactTagsPayload {
  /** Exact tag names to remove (e.g. ["שייקה", "בראל"]) */
  tags: string[];
  /** 'all' = every contact holding the tags, 'selected' = only contacts currently selected in KosTogether */
  scope?: 'all' | 'selected';
  /** Optional explicit contact ids (overrides scope) */
  contactIds?: string[];
  /** Must be true – set only after the user explicitly confirmed the operation in chat */
  confirmed?: boolean;
}

/** 1. Payload for CRM_FILTER_VIEW – dynamically filters the CRM analytics view from chat */
export interface CrmFilterViewPayload {
  search?: string;
  status?: 'all' | 'active' | 'archived' | 'lead';
  typeFilter?: 'all' | 'contacts' | 'leads';
  metricFilter?: 'contacts' | 'revenue' | 'campaigns' | 'communities' | 'forms';
  tag?: string;
  community?: string;
  minSpent?: number;
  maxSpent?: number;
  reset?: boolean;
}

/** 2. Payload for CRM_BATCH_UPDATE – update fields or tags across filtered contacts */
export interface CrmBatchUpdatePayload {
  filterCriteria: {
    city?: string;
    source?: string;
    tag?: string;
    status?: string;
    isLead?: boolean;
    contactIds?: string[];
  };
  updates: {
    addTags?: string[];
    removeTags?: string[];
    status?: string;
    city?: string;
    notes?: string;
    leadSource?: string;
  };
  confirmed?: boolean;
}

/** 3. Payload for CRM_CONVERT_LEAD – converts a lead into an active paying or verified customer */
export interface CrmConvertLeadPayload {
  contactId?: string;
  contactName?: string;
  newStatus?: string;
  addTags?: string[];
  confirmed?: boolean;
}

/** 4. Payload for CRM_SANITIZE_NAMES – cleans names and extracts tags from brackets/numbers */
export interface CrmSanitizeNamesPayload {
  scope?: 'all' | 'leads' | 'whatsapp' | 'selected';
  confirmed?: boolean;
}

/** 5. Payload for CRM_MERGE_DUPLICATES – discovers duplicates and merges them cleanly */
export interface CrmMergeDuplicatesPayload {
  field?: 'phone' | 'email';
  confirmed?: boolean;
}

/** 6. Payload for CRM_EXPORT_VCARD – generates and downloads vCard for a contact */
export interface CrmExportVcardPayload {
  contactId?: string;
  contactName?: string;
}

/** 7. Payload for CRM_EXPORT_DATA – exports filtered dataset to Excel/CSV */
export interface CrmExportDataPayload {
  format?: 'csv' | 'xlsx';
  filterCriteria?: {
    city?: string;
    tag?: string;
    isLead?: boolean;
    minSpent?: number;
  };
}

/** 8. Payload for CRM_WHATSAPP_DISPATCH – dispatches WhatsApp message via tenant Green-API */
export interface CrmWhatsappDispatchPayload {
  recipientPhone?: string;
  recipientName?: string;
  targetGroup?: 'leads' | 'vip' | 'selected' | 'all';
  messageText: string;
  confirmed?: boolean;
}

/** Result reported back to the KosAi chat by the module that executed an action */
export interface KosaiActionResult {
  action: string;
  success: boolean;
  message: string;
  affectedCount?: number;
  /** true = receipt acknowledgment only (execution in progress) */
  pending?: boolean;
}

export interface CoreEventMap {
  'kosai:action': any;
  'kosai:action_result': KosaiActionResult;
  'media:request_picker': any;
  'cloud_store:request_picker': any;
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
  'tenant:provisioned': SubdomainTenantContactData;
  'tenant:updated': SubdomainTenantContactData;
  'tenant:contact_synced': { subdomain: string; contactId: string };
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
  'brand:service_slug_updated': { serviceName: string; slug: string; pageId?: string };
  'campaign:page_created': { campaignId: string; slug: string; publicUrl: string };
  'whatsapp:status:viewed': { phone: string; statusId: string };
  'whatsapp:message:sent': { phone: string; text?: string; message?: string; source?: string };
  'whatsapp:send': { phone: string; text?: string; message?: string; mediaUrl?: string };

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
  serviceSlugs?: Record<string, string>;
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
  registerServicePageSlug?: (serviceName: string, slug: string) => Promise<boolean>;
  getServicePageSlugs?: () => Record<string, string>;
}

// ========================
// KosBrandingTo - מיתוג קהילות ייעודי (תחת מונופול KosBranding)
// ========================

export interface CommunityBrandProfile {
  communityId: string;
  name: string;
  purpose: string;
  vision?: string;
  logoUrl?: string;
  services: string[];
  colors: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor?: string;
    textColor?: string;
  };
  leaderName?: string;
  contactPhone?: string;
  contactEmail?: string;
  websiteUrl?: string;
  updatedAt?: string;
}

export interface CommunityBrandContract {
  getCommunityBrand: (communityId: string) => Promise<CommunityBrandProfile | null>;
  saveCommunityBrand: (profile: CommunityBrandProfile) => Promise<boolean>;
}

// ========================
// KosWebAi - עמודי קהילה תחת סלאג /to/ (תחת מונופול KosWebAi)
// ========================

export interface CommunityWebPageOptions {
  communityId: string;
  slug: string;
  pageTitle: string;
  description?: string;
  brandProfile?: CommunityBrandProfile;
  sections?: Record<string, any>;
  sectionOrder?: string[];
  isPublished?: boolean;
}

export interface CommunityWebPageContract {
  createOrUpdateCommunityPage: (options: CommunityWebPageOptions) => Promise<{ success: boolean; pageId: string; publicUrl: string }>;
  getCommunityPageUrl: (slug: string) => string;
  openPageBuilderForCommunity: (pageId: string) => void;
}

// ========================
// KosWebAi - חוזה בונה האתרים המרכזי (KosWebAi Monopoly)
// ========================

export interface CreatePageFromProductOptions {
  product: {
    id?: string;
    nameAndSlogan: string;
    shortDescription?: string;
    longDescription?: string;
    imageUrl?: string;
    painPointSolved?: string;
    competitiveAdvantage?: string;
    targetAudience?: string;
  };
  brandDna?: BrandDna | null;
  onStep?: (step: { statusText: string; percent?: number }) => void;
}

export interface CreateVideoSeoPageOptions {
  video: KosTubeVideo;
  channelTitle?: string;
  brandDna?: BrandDna | null;
  aiData?: Partial<KosTubeSeoPage>;
}

export interface CreateCampaignPageOptions {
  campaignId: string;
  title: string;
  targetGoal: number;
  description?: string;
  deadlineDate?: string;
  featuredImageUrl?: string;
  brandDna?: BrandDna | null;
  tiers?: Array<{ id: string; title: string; amount: number; description?: string }>;
  onStep?: (step: { statusText: string; percent?: number }) => void;
}

export interface PageBuilderContract {
  createPageFromProduct: (options: CreatePageFromProductOptions) => Promise<{
    success: boolean;
    pageId: string;
    slug: string;
    publicUrl: string;
    error?: string;
  }>;
  createPageFromVideo?: (options: CreateVideoSeoPageOptions) => Promise<{
    success: boolean;
    pageId: string;
    slug: string;
    publicUrl: string;
    error?: string;
    config?: any;
  }>;
  createPageFromCampaign?: (options: CreateCampaignPageOptions) => Promise<{
    success: boolean;
    pageId: string;
    slug: string;
    publicUrl: string;
    error?: string;
    config?: any;
  }>;
  notifyServicePageCreated?: (options: {
    pageId: string;
    slug: string;
    title: string;
    serviceName?: string;
  }) => Promise<void>;
  openPageBuilder: (pageId?: string) => void;
}

// ========================
// Recruitment / Campaigns Contract for Communities (גיוס כספים לקהילה)
// ========================

export interface CommunityCampaignOptions {
  communityId: string;
  campaignTitle: string;
  targetGoal: number;
  leaderName?: string;
  description?: string;
}

export interface CommunityCampaignContract {
  createCommunityCampaign: (options: CommunityCampaignOptions) => Promise<{ success: boolean; campaignId: string; campaignUrl: string }>;
  getCommunityCampaignStats: (campaignId: string) => Promise<{ targetGoal: number; totalRaised: number; donorCount: number } | null>;
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

export interface AiTextAssistantContract {
  generateReply: (params: {
    systemPrompt?: string;
    userMessage: string;
    chatHistory?: Array<{ role: 'user' | 'model'; text: string }>;
    brandDna?: BrandDna | null;
  }) => Promise<{ text: string; error?: string; isFallback?: boolean }>;

  enhanceText: (params: {
    originalText: string;
    instruction: string;
    brandDna?: BrandDna | null;
  }) => Promise<{ text: string; error?: string; isFallback?: boolean }>;

  generateJson?: <T = any>(params: {
    prompt: string;
    systemPrompt?: string;
    brandDna?: BrandDna | null;
  }) => Promise<{ data?: T; error?: string; isFallback?: boolean }>;
}

// ========================
// KosTube - YouTube AI Channel SEO & Pages Contract (KosTube Monopoly)
// ========================

export interface KosTubeChannel {
  id: string;
  channelId: string;
  customUrl?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  subscriberCount?: number;
  videoCount?: number;
  connectedAt: string;
  lastSyncedAt: string;
  apiKey?: string;
  autoGeneratePages?: boolean;
}

export interface KosTubeVideo {
  id: string;
  channelId: string;
  youtubeVideoId: string;
  youtubeUrl: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
  seoPageId?: string;
  seoPageSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KosTubeSeoScoreBreakdown {
  titleLengthScore: number;
  descriptionLengthScore: number;
  keywordsDensityScore: number;
  headingsStructureScore: number;
  schemaScore: number;
  readabilityScore: number;
}

export interface KosTubeSeoPage {
  id: string;
  videoId: string;
  youtubeVideoId: string;
  channelId: string;
  channelTitle?: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  h1: string;
  articleContent: string;
  executiveSummary: string;
  keyTakeaways: string[];
  faqs: Array<{ question: string; answer: string }>;
  callToAction: {
    title: string;
    subtitle?: string;
    buttonText: string;
    buttonLink?: string;
    formId?: string;
    showLeadForm?: boolean;
    whatsappNumber?: string;
  };
  schemaJsonLd: Record<string, any>;
  seoScore: number;
  seoScoreBreakdown: KosTubeSeoScoreBreakdown;
  viewCount?: number;
  likeCount?: number;
  commentsCount?: number;
  pageViewsCount?: number;
  tags?: string[];
  youtubeComments?: Array<{
    id: string;
    authorName: string;
    authorAvatar?: string;
    publishedAt: string;
    content: string;
    likesCount: number;
  }>;
  pageBuilderPageId?: string;
  isPublished: boolean;
  publishedAt?: string;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface KosTubeContract {
  getChannel: () => Promise<KosTubeChannel | null>;
  syncChannel: (channelQuery: string, apiKey?: string) => Promise<{ success: boolean; channel?: KosTubeChannel; error?: string }>;
  generateSeoPageForVideo: (videoId: string) => Promise<{ success: boolean; page?: KosTubeSeoPage; error?: string }>;
  getSeoPageBySlug: (slug: string) => Promise<KosTubeSeoPage | null>;
}

// ========================
// KosTikTok Contract & DTOs ("קושאן טיקטוק")
// ========================

export interface KosTikTokAccount {
  id: string;
  openId: string;
  unionId?: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  followerCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
  isVerified: boolean;
  scopes: string[];
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  isDefault?: boolean;
  status: 'connected' | 'expired' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface KosTikTokVideo {
  id: string;
  openId: string;
  title: string;
  coverImageUrl: string;
  shareUrl: string;
  duration: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  createTime: number;
  privacyLevel?: string;
}

export interface KosTikTokPublishParams {
  videoUrl: string;
  title: string;
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  disableDuet?: boolean;
  disableComment?: boolean;
  disableStitch?: boolean;
  brandContent?: boolean;
  brandOrganic?: boolean;
}

export interface KosTikTokPublishResult {
  success: boolean;
  publishId?: string;
  status?: string;
  error?: string;
}

export interface KosTikTokLead {
  id: string;
  formId: string;
  adId?: string;
  campaignId?: string;
  openId?: string;
  leadData: {
    fullName?: string;
    email?: string;
    phone?: string;
    city?: string;
    customAnswers?: Record<string, string>;
  };
  submittedAt: string;
  syncedToCrm: boolean;
}

export interface KosTikTokEventPayload {
  event: string;
  eventId?: string;
  eventTime?: number;
  user?: {
    email?: string;
    phone?: string;
    externalId?: string;
    ip?: string;
    userAgent?: string;
  };
  properties?: {
    currency?: string;
    value?: number;
    contents?: Array<{
      contentId: string;
      contentType?: string;
      quantity?: number;
      price?: number;
    }>;
  };
  page?: {
    url?: string;
    referrer?: string;
  };
}

export interface KosTikTokContract {
  getAccounts: () => Promise<KosTikTokAccount[]>;
  getDefaultAccount: () => Promise<KosTikTokAccount | null>;
  publishVideo: (params: KosTikTokPublishParams) => Promise<KosTikTokPublishResult>;
  getVideos: () => Promise<KosTikTokVideo[]>;
  sendConversionEvent: (event: KosTikTokEventPayload) => Promise<{ success: boolean; error?: string }>;
  syncLeads: () => Promise<{ success: boolean; count: number; error?: string }>;
}

export * from './collections';




