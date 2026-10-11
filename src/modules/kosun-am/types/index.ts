/**
 * KOSUN AM (קושאן מייל אוטומטי) - Core Type Definitions
 * 12-Layer Scaffolding Layer 1: Strict TypeScript interfaces with zero 'any'
 */

import { FirebaseApp } from 'firebase/app';

export type EmailCampaignStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'sending' 
  | 'sent' 
  | 'paused' 
  | 'failed';

export type EmailProviderType = 
  | 'resend' 
  | 'sendgrid' 
  | 'functions_smtp' 
  | 'mock_local';

export type EmailDeliveryStatus = 
  | 'sent' 
  | 'delivered' 
  | 'opened' 
  | 'clicked' 
  | 'failed' 
  | 'simulated_success';

export interface CampaignAudienceConfig {
  type: 'all' | 'segment' | 'crm_group' | 'tags' | 'manual';
  crmGroupIds?: string[];
  tags?: string[];
  manualEmails?: string[];
}

export interface CampaignStats {
  totalRecipients: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  templateId?: string;
  htmlContent: string;
  textContent?: string;
  status: EmailCampaignStatus;
  audience: CampaignAudienceConfig;
  scheduledAt?: string;
  sentAt?: string;
  stats: CampaignStats;
  provider: EmailProviderType;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

export type EmailBlockType = 
  | 'header' 
  | 'hero' 
  | 'bento-grid' 
  | 'rich-text' 
  | 'button-cta' 
  | 'whatsapp-link' 
  | 'divider' 
  | 'footer';

export interface EmailBlockConfig {
  id: string;
  type: EmailBlockType;
  content: {
    title?: string;
    subtitle?: string;
    bodyText?: string;
    buttonText?: string;
    buttonUrl?: string;
    imageUrl?: string;
    logoUrl?: string;
    whatsappNumber?: string;
    whatsappMessage?: string;
    items?: Array<{ title: string; description: string; icon?: string }>;
    [key: string]: unknown;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    borderRadius?: string;
    alignment?: 'right' | 'center' | 'left';
  };
}

export type TemplateCategory = 
  | 'newsletter' 
  | 'promotional' 
  | 'transactional' 
  | 'welcome' 
  | 'event';

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  thumbnailUrl?: string;
  blocks: EmailBlockConfig[];
  htmlSnapshot: string;
  variables: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AutomationTriggerEvent = 
  | 'crm:lead:created' 
  | 'smart_form:submitted' 
  | 'campaign:ambassador:created' 
  | 'payment:completed' 
  | 'manual:subscribed';

export type AutomationStepType = 
  | 'delay' 
  | 'send_email' 
  | 'send_whatsapp' 
  | 'update_crm_lead' 
  | 'condition';

export interface AutomationStepConfig {
  id: string;
  order: number;
  title: string;
  type: AutomationStepType;
  delayMinutes?: number;
  emailConfig?: {
    templateId?: string;
    subject: string;
    htmlContent?: string;
    fromName?: string;
  };
  whatsAppConfig?: {
    messageTemplate: string;
    recipientPhoneField?: string;
  };
  crmConfig?: {
    addTags?: string[];
    updateStatus?: string;
  };
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: {
    event: AutomationTriggerEvent;
    filterCondition?: Record<string, unknown>;
  };
  steps: AutomationStepConfig[];
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDeliveryLog {
  id: string;
  campaignId?: string;
  automationId?: string;
  recipientEmail: string;
  subject: string;
  status: EmailDeliveryStatus;
  provider: EmailProviderType;
  messageId: string;
  errorMessage?: string;
  dispatchedAt: string;
  metadata?: Record<string, unknown>;
}

export interface DispatchResult {
  success: boolean;
  provider: EmailProviderType;
  messageId: string;
  dispatchedCount: number;
  error?: string;
  timestamp: string;
}

export interface AiGenerationResult {
  success: boolean;
  subjectSuggestions: string[];
  bodyCopy?: string;
  preheader?: string;
  usageReport?: {
    promptTokens: number;
    completionTokens: number;
    totalCostUsd: number;
    totalCostIls: number;
  };
  error?: string;
}

export interface KosunAmModuleConfig {
  firebaseApp?: FirebaseApp;
  collectionPrefix?: string;
  functionsBaseUrl?: string;
}

export interface KosunAmContextValue {
  tenantId: string;
  campaigns: EmailCampaign[];
  templates: EmailTemplate[];
  automations: EmailAutomation[];
  logs: EmailDeliveryLog[];
  isLoading: boolean;
  activeProvider: EmailProviderType;
  createCampaign: (data: Partial<EmailCampaign>) => Promise<string>;
  updateCampaign: (id: string, data: Partial<EmailCampaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  dispatchCampaign: (id: string) => Promise<DispatchResult>;
  saveTemplate: (data: Partial<EmailTemplate>) => Promise<string>;
  deleteTemplate: (id: string) => Promise<void>;
  saveAutomation: (data: Partial<EmailAutomation>) => Promise<string>;
  toggleAutomation: (id: string, active: boolean) => Promise<void>;
  generateAiContent: (prompt: string, context?: Record<string, unknown>) => Promise<AiGenerationResult>;
  refreshAll: () => Promise<void>;
}
