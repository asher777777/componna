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

export interface AuthSessionContract {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer';
  isAuthenticated: boolean;
}

export interface CoreEventMap {
  'crm:lead:created': LeadPayload;
  'media:uploaded': { url: string; fileName: string; type: string };
  'auth:state_changed': AuthSessionContract;
  'form:submitted': { formId: string; pageUrl: string; data: Record<string, any> };
  'player:interaction': { videoId: string; eventType: string; timestamp: number };
}
