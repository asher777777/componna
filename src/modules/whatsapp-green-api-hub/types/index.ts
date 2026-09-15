export type GreenApiState = 'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting' | 'yellowState' | 'unknown';

export interface GreenApiInstanceSettings {
  webhookUrl?: string;
  webhookUrlToken?: string;
  delaySendMessagesMilliseconds?: number;
  markIncomingMessagesReaded?: 'yes' | 'no';
  markIncomingMessagesReadedOnReply?: 'yes' | 'no';
  outgoingWebhook?: 'yes' | 'no';
  outgoingMessageWebhook?: 'yes' | 'no';
  stateWebhook?: 'yes' | 'no';
  incomingWebhook?: 'yes' | 'no';
  deviceWebhook?: 'yes' | 'no';
  statusInstanceWebhook?: 'yes' | 'no';
  sendBatteryStatus?: 'yes' | 'no';
  pollMessageWebhook?: 'yes' | 'no';
  incomingCallWebhook?: 'yes' | 'no';
  keepOnlineStatus?: 'yes' | 'no';
}

export interface GreenApiDeviceInfo {
  phone?: string;
  pushName?: string;
  deviceModel?: string;
  platform?: string;
  battery?: number;
  plugged?: boolean;
  lc?: string;
  lg?: string;
  waVersion?: string;
  [key: string]: any;
}

export interface GreenApiChatMessage {
  idMessage: string;
  chatId: string;
  type: 'incoming' | 'outgoing';
  typeMessage?: string;
  textMessage?: string;
  caption?: string;
  timestamp: number;
  statusMessage?: 'pending' | 'sent' | 'delivered' | 'read';
  senderId?: string;
  senderName?: string;
  downloadUrl?: string;
  fileName?: string;
}

export interface GreenApiChat {
  id: string;
  name?: string;
  contactName?: string;
  unreadCount?: number;
  lastMessage?: string;
  timestamp?: number;
  isGroup?: boolean;
  avatar?: string;
}

export interface GreenApiGroupParticipant {
  id: string;
  phone?: string;
  name?: string;
  admin?: 'admin' | 'creator' | null;
}

export interface GreenApiGroupData {
  groupId: string;
  owner: string;
  subject: string;
  creation: number;
  participants: GreenApiGroupParticipant[];
}

export interface GreenApiQueueItem {
  idMessage: string;
  chatId: string;
  statusMessage: string;
  timestamp: number;
  typeMessage: string;
}

export interface GreenApiContactInfo {
  avatar?: string;
  name?: string;
  contactName?: string;
  email?: string;
  category?: string;
  description?: string;
  products?: any[];
  chatId: string;
  lastSeen?: number;
  isArchive?: boolean;
  isDisappearing?: boolean;
  isMute?: boolean;
  messageExpiration?: number;
  muteExpiration?: number;
}
