export interface CustomTab {
  id: string;
  title: string;
  icon: string;
}

export interface CustomField {
  id: string;
  category: string;
  type: string; // text, date, number, etc.
  label: string;
}

export interface ContactEvent {
  time: string;
  title: string;
  text: string;
}

export interface FormSubmission {
  name: string;
  page: string;
  date: string;
  payload?: Record<string, any>;
}

export interface PaymentRecord {
  id?: string;
  date: string;
  amount: number;
  paymentType: string;
  receiptType?: string;
  kesherStatus?: string;
  receiptLink?: string;
}

export interface AIInteraction {
  date: string;
  summary: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
  nextBestAction?: string;
  draftMessage?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
}

export interface Contact {
  id?: string;
  ownerId?: string;
  status: "active" | "trashed";
  
  // Core Fields
  conta_name: string;
  f_m?: string;
  conta_phone: string;
  email?: string;
  gender?: string;
  
  // Address Fields
  mh_crm_city?: string;
  mh_crm_street?: string;
  
  // Tag Fields
  tg1?: string;
  tg2?: string;
  tg3?: string;
  tags?: string[];

  // Company Fields
  company_name?: string;
  job_title?: string;
  lead_source?: string;

  // Other Contact Info
  segment?: string;
  work_phone?: string;
  website?: string;
  birth_date?: string;
  notes?: string;
  events?: ContactEvent[];
  form_submissions?: FormSubmission[];

  // Form Tracking Fields
  last_form_name?: string;
  last_form_page?: string;
  last_form_submission_date?: string;
  
  // Community Fields
  community?: string;
  mh_crm_community?: string;
  communityIds?: string[];
  isUser?: boolean;
  systemUserId?: string;

  // WooCommerce Summary Fields
  total_spent?: number;
  order_count?: number;
  last_order_date?: string;
  payments?: PaymentRecord[];

  // Campaign & Ambassador Fields
  campaign_id?: string;
  campaign_title?: string;
  campaign_amount?: number;
  campaign_role?: string;
  campaign_target_goal?: number;
  campaign_total_raised?: number;
  ambassador_page_url?: string;

  // AI Insights
  ai_sentiment_score?: number; // 0 - 100
  ai_lead_temperature?: 'hot' | 'warm' | 'cold';
  ai_summary?: string;
  ai_next_best_action?: string;
  ai_interactions?: AIInteraction[];

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Dynamic custom fields
  [key: string]: any;
}

export interface NumericFieldAggEntry {
  contactId: string;
  parentName: string;
  phone: string;
  childName?: string;
  totalSpent: number;
  hasPaid: boolean;
  value: number;
}

export interface NumericFieldAgg {
  sum: number;
  count: number;
  entries: NumericFieldAggEntry[];
}

export interface CRMAnalyticsFilter {
  startDate?: string;
  endDate?: string;
  status?: "active" | "trashed" | "all";
  source?: string;
  tag?: string;
  form?: string;
  community?: string;
  searchTerm?: string;
}

export interface CRMAnalyticsData {
  totalContacts: number;
  totalSpent: number;
  totalCampaignAmount: number;
  tagsCount: Record<string, number>;
  leadSourcesCount: Record<string, number>;
  communitiesCount: Record<string, number>;
  formsCount: Record<string, number>;
  numericFieldsAgg: Record<string, NumericFieldAgg>;
  textFieldsAgg: Record<string, Record<string, number>>;
  contacts: Contact[];
  customFields: CustomField[];
}

export interface DynamicColumn {
  id: string;
  label: string;
  category: "core" | "financial" | "tag" | "form" | "custom" | "system";
  isNumeric?: boolean;
  isDate?: boolean;
}

export interface SavedAnalyticsView {
  id: string;
  name: string;
  createdAt: string;
  selectedColumns: string[];
  filters: {
    startDate?: string;
    endDate?: string;
    dataSource: "contacts" | "forms";
    status: "active" | "trashed" | "all";
    tags: string[];
    community?: string;
    leadSource?: string;
    formName?: string;
  };
}

export type DatabaseProviderType = 'firestore' | 'supabase' | 'rest_api' | 'mock_dataset';

export interface DatabaseConnectionProfile {
  id: string;
  name: string;
  provider: DatabaseProviderType;
  isActive: boolean;
  createdAt: string;
  config: {
    // Firestore
    projectId?: string;
    apiKey?: string;
    authDomain?: string;
    collectionName?: string;
    // Supabase / SQL
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    tableName?: string;
    // REST API
    apiUrl?: string;
    bearerToken?: string;
    method?: 'GET' | 'POST';
  };
  fieldMappings?: Record<string, string>;
}
