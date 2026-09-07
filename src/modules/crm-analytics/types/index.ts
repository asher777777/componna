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
