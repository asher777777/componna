import { GroupColumnDefinition, GroupRuleField, GroupRuleOperator } from '../types';

export const DEFAULT_COLLECTIONS = {
  groups: 'crm_groups',
  contacts: 'contacts',
  pages: 'pages',
  campaigns: 'campaigns',
  interactions: 'interactions',
};

export const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Rose
  '#7c3aed', // Purple
  '#0284c7', // Sky
  '#0891b2', // Cyan
  '#475569', // Slate
  '#ec4899', // Pink
  '#10b981', // Teal
];

export const ALL_GROUP_COLUMNS: GroupColumnDefinition[] = [
  { id: 'conta_name', label: 'שם איש קשר', minWidth: '180px' },
  { id: 'tags', label: 'קהילות וקבוצות משויכות', minWidth: '220px' },
  { id: 'conta_phone', label: 'טלפון', minWidth: '130px' },
  { id: 'email', label: 'אימייל', minWidth: '180px' },
  { id: 'mh_crm_city', label: 'עיר', minWidth: '120px' },
  { id: 'total_spent', label: 'סך תשלומים (₪)', minWidth: '130px', align: 'center' },
  { id: 'campaign_amount', label: 'סכום קמפיין (₪)', minWidth: '130px', align: 'center' },
  { id: 'lead_source', label: 'מקור הגעה / ליד', minWidth: '140px' },
  { id: 'gender', label: 'מגדר', minWidth: '100px' },
  { id: 'company_name', label: 'שם חברה', minWidth: '140px' },
  { id: 'job_title', label: 'תפקיד', minWidth: '130px' },
  { id: 'status', label: 'סטטוס', minWidth: '110px' },
  { id: 'createdAt', label: 'תאריך הצטרפות', minWidth: '130px' },
  { id: 'actions', label: 'פעולות מהירות', minWidth: '120px', align: 'center' },
];

export const DEFAULT_VISIBLE_COLUMNS = ['conta_name', 'tags', 'conta_phone', 'mh_crm_city', 'total_spent', 'actions'];

export const RULE_FIELD_OPTIONS: { value: GroupRuleField; label: string; type: 'number' | 'text' | 'boolean' }[] = [
  { value: 'total_spent', label: 'סך תשלומים מצטבר (₪)', type: 'number' },
  { value: 'campaign_amount', label: 'סכום תרומה לקמפיין (₪)', type: 'number' },
  { value: 'order_count', label: 'מספר הזמנות / תשלומים', type: 'number' },
  { value: 'mh_crm_city', label: 'עיר מגורים', type: 'text' },
  { value: 'lead_source', label: 'מקור הגעה (ליד)', type: 'text' },
  { value: 'company_name', label: 'שם חברה / ארגון', type: 'text' },
  { value: 'job_title', label: 'תפקיד', type: 'text' },
  { value: 'gender', label: 'מגדר', type: 'text' },
  { value: 'status', label: 'סטטוס ב-CRM', type: 'text' },
  { value: 'has_phone', label: 'קיים מספר טלפון', type: 'boolean' },
  { value: 'has_email', label: 'קיימת כתובת אימייל', type: 'boolean' },
];

export const RULE_OPERATOR_OPTIONS: { value: GroupRuleOperator; label: string }[] = [
  { value: 'gte', label: 'גדול או שווה ל- (>=)' },
  { value: 'lte', label: 'קטן או שווה ל- (<=)' },
  { value: 'eq', label: 'שווה בדיוק ל-' },
  { value: 'contains', label: 'מכיל את הטקסט' },
  { value: 'exists', label: 'קיים / מלא' },
  { value: 'not_exists', label: 'לא קיים / ריק' },
];
