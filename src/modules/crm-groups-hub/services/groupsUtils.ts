import { ContactRecord, GroupRule, SmartGroup } from '../types';

/**
 * Normalizes phone numbers to a consistent international/standard format
 * e.g., '052-1234567' -> '972521234567', '+972 54-999-8888' -> '972549998888'
 */
export function normalizePhoneNumber(rawPhone: string | undefined | null): string {
  if (!rawPhone) return '';
  let cleaned = String(rawPhone).replace(/[^\d+]/g, '').trim();
  
  // Remove leading plus
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Israeli standard local prefix conversion: 05X-XXXXXXX -> 9725XXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length >= 9 && cleaned.length <= 10) {
    cleaned = '972' + cleaned.substring(1);
  }

  return cleaned;
}

/**
 * Evaluates a single condition rule on a contact record
 */
export function evaluateRule(contact: ContactRecord, rule: GroupRule): boolean {
  const { field, operator, value } = rule;

  if (field === 'has_phone') {
    const has = Boolean(contact.conta_phone && String(contact.conta_phone).trim().length > 0);
    return operator === 'exists' ? has : !has;
  }

  if (field === 'has_email') {
    const has = Boolean(contact.email && String(contact.email).trim().length > 0);
    return operator === 'exists' ? has : !has;
  }

  const contactVal = contact[field];

  if (field === 'total_spent' || field === 'campaign_amount' || field === 'order_count') {
    const num = Number(contactVal || 0);
    const target = Number(value || 0);
    if (operator === 'gte') return num >= target;
    if (operator === 'lte') return num <= target;
    if (operator === 'eq') return num === target;
    return false;
  }

  const str = String(contactVal || '').toLowerCase().trim();
  const targetStr = String(value || '').toLowerCase().trim();

  if (operator === 'eq') return str === targetStr;
  if (operator === 'contains') return str.includes(targetStr);
  if (operator === 'exists') return Boolean(str);
  if (operator === 'not_exists') return !str;
  return false;
}

/**
 * Checks if a contact belongs to a SmartGroup or Tag Group
 */
export function isContactInGroup(contact: ContactRecord, group: SmartGroup): boolean {
  if (group.type === 'smart' && group.rules && group.rules.length > 0) {
    const matchType = group.matchType || 'all';
    if (matchType === 'all') {
      return group.rules.every((r) => evaluateRule(contact, r));
    } else {
      return group.rules.some((r) => evaluateRule(contact, r));
    }
  }

  // Manual group: matched by tags array or community field
  const tags: string[] = Array.isArray(contact.tags) ? contact.tags : [];
  return tags.includes(group.name) || tags.includes(group.id) || contact.community === group.name;
}

/**
 * Export filtered contacts to a UTF-8 CSV file
 */
export function exportContactsToCsv(contacts: ContactRecord[], groupName: string) {
  if (contacts.length === 0) return;

  const headers = ['שם איש קשר', 'טלפון', 'אימייל', 'עיר', 'קבוצות וקהילות', 'סך תשלומים (₪)', 'סכום קמפיין (₪)', 'מקור הגעה', 'סטטוס'];
  const rows = contacts.map((c) => [
    c.conta_name || '',
    c.conta_phone || '',
    c.email || '',
    c.mh_crm_city || '',
    (c.tags || []).join(', '),
    c.total_spent || 0,
    c.campaign_amount || 0,
    c.lead_source || '',
    c.status || 'פעיל',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `group_${groupName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
