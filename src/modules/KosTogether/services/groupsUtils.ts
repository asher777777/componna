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
 * Cleans push names by removing unnecessary emoji strings, symbols, or formatting noise
 */
export function cleanPushName(rawName: string | undefined | null): string {
  if (!rawName) return '';
  // Remove most common emojis and leading/trailing non-alphanumeric noise except Hebrew/English/Arabic letters & spaces
  const cleaned = rawName
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[~`!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || rawName.trim();
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

import * as XLSX from 'xlsx';

/**
 * Export filtered contacts to an Excel (.xlsx) file
 */
export function exportContactsToExcel(contacts: ContactRecord[], groupName: string) {
  if (contacts.length === 0) return;

  const data = contacts.map((c) => ({
    'שם איש קשר': c.conta_name || '',
    'טלפון': c.conta_phone || '',
    'אימייל': c.email || '',
    'עיר': c.mh_crm_city || '',
    'קבוצות וקהילות': (c.tags || []).join(', '),
    'סך תשלומים (₪)': c.total_spent || 0,
    'סכום קמפיין (₪)': c.campaign_amount || 0,
    'מקור הגעה': c.lead_source || '',
    'סטטוס': c.status || 'פעיל',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'אנשי קשר');

  XLSX.writeFile(workbook, `group_${groupName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
