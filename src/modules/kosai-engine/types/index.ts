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
  | 'WHATSAPP_AUTO_RESPOND';

export interface KosaiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface KosaiActionPayload {
  action: KosaiCapability | 'CHAT_MESSAGE';
  payload: any;
}
