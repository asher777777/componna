import { DynamicColumn } from '../types';

export const MODULE_ID = 'crm-analytics';
export const MODULE_NAME = 'אנליטיקה ודוחות CRM (CRM Analytics & Insights)';
export const MODULE_VERSION = '1.0.0';

export const DEFAULT_COLLECTIONS = {
  contacts: 'contacts',
  groups: 'crm_groups',
  customFields: 'crm_custom_fields',
  savedViews: 'crm_analytics_saved_views',
};

export const CHART_COLORS = [
  '#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1', 
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#3b82f6',
  '#84cc16', '#06b6d4', '#d946ef', '#a855f7', '#e11d48'
];

export const CORE_COLUMNS: DynamicColumn[] = [
  { id: 'conta_name', label: 'שם מלא', category: 'core' },
  { id: 'conta_phone', label: 'טלפון', category: 'core' },
  { id: 'email', label: 'אימייל', category: 'core' },
  { id: 'f_m', label: 'משפחה / קרבה', category: 'core' },
  { id: 'gender', label: 'מין', category: 'core' },
  { id: 'mh_crm_city', label: 'עיר', category: 'core' },
  { id: 'mh_crm_street', label: 'כתובת / רחוב', category: 'core' },
  { id: 'company_name', label: 'חברה / ארגון', category: 'core' },
  { id: 'job_title', label: 'תפקיד', category: 'core' },
  { id: 'lead_source', label: 'מקור הגעה', category: 'core' },
  { id: 'tags', label: 'תגיות', category: 'tag' },
  { id: 'community', label: 'קבוצה / קהילה', category: 'core' },
  { id: 'total_spent', label: 'סה"כ רכישות (₪)', category: 'financial', isNumeric: true },
  { id: 'order_count', label: 'מספר הזמנות', category: 'financial', isNumeric: true },
  { id: 'campaign_amount', label: 'סכום קמפיין (₪)', category: 'financial', isNumeric: true },
  { id: 'campaign_title', label: 'קמפיין', category: 'financial' },
  { id: 'last_form_name', label: 'טופס אחרון', category: 'form' },
  { id: 'last_form_submission_date', label: 'תאריך טופס', category: 'form', isDate: true },
  { id: 'createdAt', label: 'נוצר בתאריך', category: 'system', isDate: true },
];

export const DEFAULT_SELECTED_COLUMNS = [
  'conta_name',
  'conta_phone',
  'tags',
  'community',
  'total_spent',
  'last_form_name'
];
