import { db } from '../../../services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { Contact, PaymentRecord } from '../../crm-analytics/types';
import { generateMockCrmData } from '../../crm-analytics/services/crmAnalyticsService';

/**
 * Normalizes Hebrew & English strings for robust fuzzy/tokenized searching.
 * Removes quotes, gershayim, punctuation, and trims extra spaces.
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/["'״׳`]/g, '') // remove Hebrew gershayim/quotes
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // convert punctuation to spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clean phone numbers to pure digits for matching
 */
export function cleanPhoneDigits(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('972')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

/**
 * Flexible name matching:
 * Matches whether the search is first name first, last name first, or partial tokens.
 * E.g., "ישראל כהן" matches "כהן ישראל", "ישראל" matches "כהן ישראל",
 * "חבד אחיעזר" matches "בית חבד אחיעזר שע"י צעירי חב"ד".
 */
export function matchesFlexibleName(queryText: string, targetName: string): boolean {
  if (!queryText.trim()) return true;
  if (!targetName) return false;

  const normQuery = normalizeSearchText(queryText);
  const normTarget = normalizeSearchText(targetName);

  if (normTarget.includes(normQuery)) return true;

  const queryTokens = normQuery.split(' ').filter(Boolean);
  const targetTokens = normTarget.split(' ').filter(Boolean);

  if (queryTokens.length === 0) return true;

  // Every token in the query must match either a token in target or substring in target
  return queryTokens.every(qToken =>
    targetTokens.some(tToken => tToken.includes(qToken)) || normTarget.includes(qToken)
  );
}

/**
 * Filters a list of contacts against a search query across name, phone, email, TZ/VAT, and company.
 */
export function searchContacts(contacts: Contact[], searchTerm: string): Contact[] {
  if (!searchTerm || !searchTerm.trim()) return [];
  const term = searchTerm.trim();
  const cleanDigits = cleanPhoneDigits(term);

  return contacts.filter(c => {
    const name = c.conta_name || (c as any).fullName || (c as any).name || '';
    const phone = c.conta_phone || (c as any).phone || (c as any).mobile || '';
    const email = c.email || '';
    const tz = String(c.tg1 || (c as any).tz || (c as any).idNumber || (c as any).id_num || (c as any).vat || '').trim();
    const company = c.company_name || (c as any).company || '';

    // 1. Check Name flexible match
    if (name && matchesFlexibleName(term, name)) return true;

    // 2. Check Company match
    if (company && matchesFlexibleName(term, company)) return true;

    // 3. Check Phone digits match
    if (cleanDigits.length >= 3) {
      const contactDigits = cleanPhoneDigits(phone);
      if (contactDigits && (contactDigits.includes(cleanDigits) || cleanDigits.includes(contactDigits))) {
        return true;
      }
    }

    // 4. Check Email match
    if (email && email.toLowerCase().includes(term.toLowerCase())) return true;

    // 5. Check TZ / ID / VAT match
    if (tz && (tz.includes(term) || (cleanDigits.length >= 3 && tz.includes(cleanDigits)))) return true;

    return false;
  });
}

class CrmContactSyncService {
  private cachedContacts: Contact[] = [];
  private isLoaded = false;
  private listeners: Set<(contacts: Contact[]) => void> = new Set();
  private unsubscribeFirestore: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (db) {
        const contactsRef = collection(db, 'contacts');
        this.unsubscribeFirestore = onSnapshot(contactsRef, (snap) => {
          const list: Contact[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              status: data.status || 'active',
              is_lead: data.is_lead ?? false,
              contact_type: data.contact_type || (data.is_lead ? 'lead' : 'contact'),
              ...data,
            } as Contact);
          });

          if (list.length > 0) {
            this.cachedContacts = list;
          } else if (this.cachedContacts.length === 0) {
            this.cachedContacts = generateMockCrmData();
          }

          this.isLoaded = true;
          this.notifyListeners();
        }, (err) => {
          console.warn('[CrmContactSyncService] Firestore snapshot notice:', err);
          if (this.cachedContacts.length === 0) {
            this.cachedContacts = generateMockCrmData();
          }
          this.isLoaded = true;
          this.notifyListeners();
        });
      } else {
        this.cachedContacts = generateMockCrmData();
        this.isLoaded = true;
        this.notifyListeners();
      }
    } catch (e) {
      console.warn('[CrmContactSyncService] Init fallback:', e);
      this.cachedContacts = generateMockCrmData();
      this.isLoaded = true;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.cachedContacts);
      } catch (err) {
        console.error(err);
      }
    });
  }

  /**
   * Subscribe to live contacts list
   */
  public subscribe(callback: (contacts: Contact[]) => void): () => void {
    this.listeners.add(callback);
    if (this.cachedContacts.length > 0) {
      callback(this.cachedContacts);
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current cached contacts immediately
   */
  public getContacts(): Contact[] {
    if (this.cachedContacts.length === 0) {
      return generateMockCrmData();
    }
    return this.cachedContacts;
  }

  /**
   * Searches contacts with flexible Hebrew and multi-field matching
   */
  public search(query: string): Contact[] {
    return searchContacts(this.getContacts(), query);
  }

  /**
   * Saves or updates a contact in the CRM (Firestore and local cache).
   * If the contact already has an ID, updates that document.
   * If not, searches for an existing contact by phone or TZ, and updates or creates a new one.
   */
  public async saveOrUpdateContact(data: {
    id?: string;
    clientName: string;
    phone?: string;
    email?: string;
    tz?: string;
    bankName?: string;
    branchNumber?: string;
    accountNumber?: string;
    checkNumber?: string;
  }): Promise<{ contact: Contact; isNew: boolean }> {
    const cleanPhone = cleanPhoneDigits(data.phone);
    const cleanTz = (data.tz || '').replace(/\D/g, '').trim();
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const fullName = (data.clientName || '').trim();

    let targetId = data.id;
    let existingContact = targetId ? this.cachedContacts.find(c => c.id === targetId) : undefined;

    // If no ID provided, try matching existing contact by phone / tz / email / name
    if (!existingContact) {
      existingContact = this.cachedContacts.find(c => {
        const cPhone = cleanPhoneDigits(c.conta_phone || (c as any).phone);
        const cTz = String(c.tg1 || (c as any).tz || (c as any).idNumber || '').replace(/\D/g, '').trim();
        const cEmail = (c.email || '').trim().toLowerCase();
        
        if (cleanPhone && cPhone && (cPhone === cleanPhone || cPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cPhone))) {
          return true;
        }
        if (cleanTz && cTz && cTz === cleanTz) {
          return true;
        }
        if (cleanEmail && cEmail && cEmail === cleanEmail) {
          return true;
        }
        if (fullName && c.conta_name && matchesFlexibleName(fullName, c.conta_name) && (c.conta_name.length === fullName.length)) {
          return true;
        }
        return false;
      });

      if (existingContact) {
        targetId = existingContact.id;
      }
    }

    const isNew = !existingContact;
    const finalId = targetId || `crm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const updatedContact: Contact = {
      ...(existingContact || {
        status: 'active',
        is_lead: false,
        contact_type: 'contact',
        createdAt: new Date().toISOString(),
        total_spent: 0,
        order_count: 0,
        tags: ['לקוח קשר / סליקה'],
      }),
      id: finalId,
      conta_name: fullName || existingContact?.conta_name || 'לקוח ללא שם',
      conta_phone: data.phone || existingContact?.conta_phone || '',
      email: data.email || existingContact?.email || '',
      tg1: cleanTz || existingContact?.tg1 || '',
      ...(cleanTz ? { tz: cleanTz, id_num: cleanTz, vat: cleanTz } : {}),
      ...(data.bankName ? { bank_name: data.bankName } : {}),
      ...(data.branchNumber ? { branch_number: data.branchNumber } : {}),
      ...(data.accountNumber ? { account_number: data.accountNumber } : {}),
      ...(data.checkNumber ? { check_number: data.checkNumber } : {}),
      updatedAt: new Date().toISOString(),
    };

    // Update in-memory cache immediately
    const idx = this.cachedContacts.findIndex(c => c.id === finalId);
    if (idx >= 0) {
      this.cachedContacts[idx] = updatedContact;
    } else {
      this.cachedContacts.unshift(updatedContact);
    }
    this.notifyListeners();

    // Persist to Firestore if available
    try {
      if (db) {
        const docRef = doc(db, 'contacts', finalId);
        const cleanPayload = JSON.parse(JSON.stringify(updatedContact));
        await setDoc(docRef, cleanPayload, { merge: true });
      }
    } catch (err) {
      console.warn('[CrmContactSyncService] Firestore save error:', err);
    }

    return { contact: updatedContact, isNew };
  }

  /**
   * Log transaction directly into the contact's CRM history
   */
  public async recordContactPayment(contactId: string, payment: PaymentRecord): Promise<void> {
    const contact = this.cachedContacts.find(c => c.id === contactId);
    if (!contact) return;

    const currentPayments = Array.isArray(contact.payments) ? [...contact.payments] : [];
    const updatedPayments = [payment, ...currentPayments];
    const newTotalSpent = (contact.total_spent || 0) + Number(payment.amount || 0);
    const newOrderCount = (contact.order_count || 0) + 1;

    const updatedContact: Contact = {
      ...contact,
      payments: updatedPayments,
      total_spent: newTotalSpent,
      order_count: newOrderCount,
      last_order_date: payment.date || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
    };

    const idx = this.cachedContacts.findIndex(c => c.id === contactId);
    if (idx >= 0) {
      this.cachedContacts[idx] = updatedContact;
    }
    this.notifyListeners();

    try {
      if (db) {
        const docRef = doc(db, 'contacts', contactId);
        await updateDoc(docRef, {
          payments: updatedPayments,
          total_spent: newTotalSpent,
          order_count: newOrderCount,
          last_order_date: updatedContact.last_order_date,
          updatedAt: updatedContact.updatedAt,
        });
      }
    } catch (err) {
      console.warn('[CrmContactSyncService] Firestore record payment error:', err);
    }
  }
}

export const crmContactSyncService = new CrmContactSyncService();
