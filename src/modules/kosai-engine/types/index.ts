export interface KosaiWhatsAppTrigger {
  enabled: boolean;
  triggerType: 'keyword' | 'all' | 'welcome';
  keywords: string[];
  matchMode?: 'contains' | 'exact' | 'startsWith';
  autoReply?: boolean;
  replyPrefix?: string;
  botDisplayName?: string;
}

export interface KosaiRule {
  id: string;
  name: string;
  moduleId: string; // Refers to a module in MODULE_CATALOG
  slugPattern: string; // The route the rule applies to
  systemPromptAddon: string;
  enabledCapabilities: KosaiCapability[];
  allowedDataSources: string[]; // Allowed collections the AI can query
  isActive: boolean;
  templateId?: string;
  toneOfVoice?: {
    professionalism: number; // 0 = Humorous/Casual, 100 = Strict Professional
    detail: number; // 0 = Short/Concise, 100 = Highly Detailed
    creativity: number; // 0 = Conservative, 100 = Bold/Creative
  };
  whatsappTrigger?: KosaiWhatsAppTrigger;
  createdAt: number;
}

export type KosaiCapability = 
  | 'CODE_GENERATION' 
  | 'PDF_READING' 
  | 'WEB_SEARCH' 
  | 'IMAGE_GENERATION' 
  | 'VIDEO_GENERATION' 
  | 'DEEP_RESEARCH'
  | 'WHATSAPP_AUTOMATION'
  | 'WHATSAPP_AUTO_RESPOND'
  | 'ADD_SECTION'
  | 'UPDATE_SECTION'
  | 'UPDATE_GLOBAL_SETTINGS'
  | 'UPDATE_SEO'
  | 'CREATE_CRM_CHART'
  | 'REMOVE_CONTACT_TAGS'
  | 'CRM_FILTER_VIEW'
  | 'CRM_BATCH_UPDATE'
  | 'CRM_CONVERT_LEAD'
  | 'CRM_SANITIZE_NAMES'
  | 'CRM_MERGE_DUPLICATES'
  | 'CRM_EXPORT_VCARD'
  | 'CRM_EXPORT_DATA'
  | 'CRM_WHATSAPP_DISPATCH'
  | 'CREATE_SMART_FORM'
  | 'UPDATE_SMART_FORM'
  | 'SAVE_FORM_TEMPLATE'
  | 'LOAD_SMART_FORM'
  | 'DELETE_SMART_FORM';

export interface KosaiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date | number | string;
  isLoading?: boolean;
}

export interface KosaiConversation {
  id: string;
  tenantId: string;
  moduleId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: KosaiMessage[];
  cachedContentId?: string;
  contactId?: string;
  status: 'active' | 'archived' | 'deleted';
}

export interface KosaiActionPayload {
  action: KosaiCapability | 'CHAT_MESSAGE';
  payload: any;
}
