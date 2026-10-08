// Layer 1: Types
export interface KosaiRule {
  id: string;
  name: string;
  slugPattern: string; // e.g., '/edit/*' or '/forms/'
  systemPromptAddon: string;
  enabledCapabilities: KosaiCapability[];
  isActive: boolean;
  createdAt: number;
}

export type KosaiCapability = 'ADD_SECTION' | 'UPDATE_SECTION' | 'UPDATE_GLOBAL_SETTINGS' | 'UPDATE_SEO' | 'MEDIA_GALLERY' | 'CRM_SYNC';

export interface KosaiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface KosaiActionPayload {
  action: KosaiCapability;
  payload: any;
}
