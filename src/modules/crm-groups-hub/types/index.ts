import type { FirebaseApp } from 'firebase/app';

export type GroupType = 'manual' | 'smart';
export type GroupCategory = 'community' | 'group';
export type GroupMatchType = 'all' | 'any';

export type GroupRuleField = 
  | 'total_spent' 
  | 'campaign_amount'
  | 'order_count' 
  | 'lead_source' 
  | 'gender' 
  | 'mh_crm_city' 
  | 'company_name' 
  | 'job_title'
  | 'status'
  | 'last_form_name' 
  | 'has_phone'
  | 'has_email';

export type GroupRuleOperator = 
  | 'gte' 
  | 'lte' 
  | 'eq' 
  | 'contains' 
  | 'exists' 
  | 'not_exists';

export interface GroupRule {
  field: GroupRuleField;
  operator: GroupRuleOperator;
  value: string | number;
}

export interface SmartGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  type: GroupType;
  rules?: GroupRule[];
  matchType?: GroupMatchType;
  count?: number;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Community distinction & Page Builder Integration
  isCommunity?: boolean;
  category?: GroupCategory;

  // Enhanced Community Parameters
  leaderName?: string;
  targetGoal?: number;
  currentRaised?: number;
  gallery?: string[];
  vision?: string;
  purpose?: string;
  pageId?: string;
  pageSlug?: string;
  pageUrl?: string;
  mainCampaignId?: string;
  campaignTitle?: string;
  engagementScore?: number;
}

export interface ContactRecord {
  id: string;
  conta_name?: string;
  conta_phone?: string;
  email?: string;
  mh_crm_city?: string;
  total_spent?: number;
  campaign_amount?: number;
  lead_source?: string;
  gender?: string;
  company_name?: string;
  job_title?: string;
  status?: string;
  tags?: string[];
  community?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  [key: string]: any;
}

export interface CommunityInteraction {
  id: string;
  contactId?: string;
  contactName?: string;
  contactPhone?: string;
  type: 'whatsapp' | 'call' | 'donation' | 'note' | 'system' | 'email';
  title?: string;
  content: string;
  date: string;
  status?: 'completed' | 'pending' | 'failed';
  groupName?: string;
  metadata?: Record<string, any>;
}

export interface SelectableCampaignOrPage {
  id: string;
  title: string;
  category: string;
  type: 'home' | 'campaign' | 'landing' | 'service' | 'page';
  url: string;
  target?: number;
  currentAmount?: number;
  coverImage?: string;
}

export interface GroupColumnDefinition {
  id: string;
  label: string;
  minWidth?: string;
  align?: 'right' | 'center' | 'left';
}

export interface WhatsAppGroupItem {
  id: string;
  name: string;
  avatarUrl?: string;
  participantsCount?: number;
}

export interface WhatsAppGroupParticipant {
  phone: string;
  name: string;
  isAdmin?: boolean;
  chatId?: string;
  existsInCRM?: boolean;
  matchedContactId?: string;
}

export interface WhatsAppDirectContactItem {
  phone: string;
  name: string;
  avatarUrl?: string;
  existsInCRM?: boolean;
}

export interface WhatsAppConnectionInfo {
  status: 'authorized' | 'notAuthorized' | 'checking' | 'error';
  phoneNumber?: string;
  name?: string;
  error?: string;
}

export interface CrmGroupsCollectionsConfig {
  groups?: string;
  contacts?: string;
  pages?: string;
  campaigns?: string;
  interactions?: string;
}

export interface CrmGroupsModuleProps {
  firebaseApp?: FirebaseApp;
  customCollections?: CrmGroupsCollectionsConfig;
  ownerId?: string;
  className?: string;
  onOpenContactDetail?: (contact: ContactRecord) => void;
  onOpenCampaignPage?: (url: string) => void;
  greenApiCredentials?: {
    idInstance?: string;
    apiTokenInstance?: string;
    apiUrl?: string;
  };
}
