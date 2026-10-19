import { GroupColumnDefinition, GroupRuleField, GroupRuleOperator } from '../types';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts';

export const DEFAULT_COLLECTIONS = {
  groups: SYSTEM_COLLECTIONS.GROUPS,
  contacts: SYSTEM_COLLECTIONS.CONTACTS,
  pages: SYSTEM_COLLECTIONS.PAGES,
  campaigns: SYSTEM_COLLECTIONS.CAMPAIGNS,
  interactions: SYSTEM_COLLECTIONS.INTERACTIONS,
  chatMessages: SYSTEM_COLLECTIONS.CHAT_MESSAGES,
  videoRooms: 'crm_community_video_rooms',
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

export const RULE_FIELD_OPTIONS: { value: GroupRuleField; label: string; type: 'number' | 'text' | 'boolean'; placeholder?: string }[] = [
  { value: 'tags', label: 'תווית / תגית', type: 'text', placeholder: 'לדוגמה: VIP / שגריר / בוגרים' },
  { value: 'community', label: 'קהילה משויכת', type: 'text', placeholder: 'לדוגמה: קהילת ירושלים' },
  { value: 'conta_name', label: 'שם איש קשר', type: 'text', placeholder: 'לדוגמה: ישראל ישראלי' },
  { value: 'conta_phone', label: 'מספר טלפון', type: 'text', placeholder: 'לדוגמה: 0501234567' },
  { value: 'email', label: 'כתובת אימייל', type: 'text', placeholder: 'לדוגמה: user@domain.com' },
  { value: 'mh_crm_city', label: 'עיר מגורים', type: 'text', placeholder: 'לדוגמה: ירושלים / תל אביב' },
  { value: 'mh_crm_street', label: 'רחוב / כתובת', type: 'text', placeholder: 'לדוגמה: יפו 10' },
  { value: 'company_name', label: 'שם ארגון או חברה', type: 'text', placeholder: 'לדוגמה: עמותת ידידים' },
  { value: 'job_title', label: 'תפקיד או מקצוע', type: 'text', placeholder: 'לדוגמה: מנהל / מתנדב' },
  { value: 'lead_source', label: 'מקור הגעה (ליד)', type: 'text', placeholder: 'לדוגמה: וואטסאפ / אתר / פייסבוק' },
  { value: 'status', label: 'סטטוס ב-CRM', type: 'text', placeholder: 'לדוגמה: פעיל / ליד חדש' },
  { value: 'gender', label: 'מגדר', type: 'text', placeholder: 'לדוגמה: זכר / נקבה' },
  { value: 'notes', label: 'הערות', type: 'text', placeholder: 'הקלד הערה לחיפוש...' },
  { value: 'last_form_name', label: 'שם טופס אחרון', type: 'text', placeholder: 'לדוגמה: טופס הצטרפות' },
  { value: 'total_spent', label: 'סך תשלומים מצטבר (₪)', type: 'number', placeholder: 'לדוגמה: 1000' },
  { value: 'campaign_amount', label: 'סכום תרומה לקמפיין (₪)', type: 'number', placeholder: 'לדוגמה: 500' },
  { value: 'order_count', label: 'מספר הזמנות / תשלומים', type: 'number', placeholder: 'לדוגמה: 2' },
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
