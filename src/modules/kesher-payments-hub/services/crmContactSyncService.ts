import { CrmContactSummary } from '../../../core/contracts';

export function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/["'״׳`]/g, '') // remove Hebrew gershayim/quotes
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // convert punctuation to spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanPhoneDigits(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('972')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

export function matchesFlexibleName(queryText: string, targetName: string): boolean {
  if (!queryText.trim()) return true;
  if (!targetName) return false;

  const normQuery = normalizeSearchText(queryText);
  const normTarget = normalizeSearchText(targetName);

  if (normTarget.includes(normQuery)) return true;

  const queryTokens = normQuery.split(' ').filter(Boolean);
  const targetTokens = normTarget.split(' ').filter(Boolean);

  if (queryTokens.length === 0) return true;

  return queryTokens.every(qToken =>
    targetTokens.some(tToken => tToken.includes(qToken)) || normTarget.includes(qToken)
  );
}

export function generateKesherMockContacts(): CrmContactSummary[] {
  return [
    {
      id: 'c1',
      conta_name: 'ישראל ישראלי',
      conta_phone: '050-1234567',
      email: 'israel@example.com',
      tg1: '012345678',
      company_name: 'טכנולוגיות בע"מ',
      total_spent: 4500,
      order_count: 3,
    },
    {
      id: 'c2',
      conta_name: 'שרה כהן',
      conta_phone: '052-7654321',
      email: 'sara.cohen@example.com',
      tg1: '023456789',
      company_name: 'סטודיו לעיצוב',
      total_spent: 8900,
      order_count: 7,
    },
    {
      id: 'c3',
      conta_name: 'דוד לוי',
      conta_phone: '054-9876543',
      email: 'david.levi@example.com',
      tg1: '034567890',
      company_name: 'לוי ובניו',
      total_spent: 1250,
      order_count: 2,
    },
    {
      id: 'c4',
      conta_name: 'רחל גולדשטיין',
      conta_phone: '053-3334455',
      email: 'rachel.g@gmail.com',
      tg1: '045678901',
      total_spent: 3600,
      order_count: 4,
    },
    {
      id: 'c5',
      conta_name: 'משה אברהמי',
      conta_phone: '058-7778899',
      email: 'moshe.av@outlook.com',
      tg1: '056789012',
      total_spent: 980,
      order_count: 1,
    }
  ];
}

export function searchContacts(contacts: CrmContactSummary[], searchTerm: string): CrmContactSummary[] {
  if (!searchTerm || !searchTerm.trim()) return [];
  const term = searchTerm.trim();
  const cleanDigits = cleanPhoneDigits(term);

  return contacts.filter(c => {
    const name = c.conta_name || (c as any).fullName || (c as any).name || '';
    const phone = c.conta_phone || (c as any).phone || (c as any).mobile || '';
    const email = c.email || '';
    const tz = String(c.tg1 || (c as any).tz || (c as any).idNumber || (c as any).id_num || (c as any).vat || '').trim();
    const company = (c as any).company_name || (c as any).company || '';

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

const STORAGE_KEY = 'comona_kesher_cached_contacts';

export class CrmContactSyncService {
  private cachedContacts: CrmContactSummary[] = [];
  private isLoaded = false;
  private listeners: Set<(contacts: CrmContactSummary[]) => void> = new Set();
  private unsubscribeFirestore: (() => void) | null = null;
  private currentDb: any = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cachedContacts = parsed;
          this.isLoaded = true;
          return;
        }
      }
    } catch (e) {
      console.warn('[CrmContactSyncService] Storage read error:', e);
    }
    this.cachedContacts = [];
    this.isLoaded = true;
  }

  private saveToStorage() {
    try {
      // Store a compact summary of max 200 contacts to prevent filling up the 5MB browser quota
      const compactList = this.cachedContacts.slice(0, 200).map(c => ({
        id: c.id,
        conta_name: c.conta_name,
        conta_phone: c.conta_phone,
        email: c.email,
        tg1: c.tg1,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compactList));
    } catch (e: any) {
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        try {
          // If still exceeding, try saving only top 50
          const minList = this.cachedContacts.slice(0, 50).map(c => ({
            id: c.id,
            conta_name: c.conta_name,
            conta_phone: c.conta_phone,
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minList));
        } catch {
          // Fail gracefully without flooding console, contacts remain in memory
        }
      } else {
        console.warn('[CrmContactSyncService] Storage save notice:', e?.message || e);
      }
    }
  }

  /**
   * Inject Firestore DB dynamically without static singleton imports
   */
  public attachFirestore(db: any, tenantId: string = '_master') {
    if (!db) return;
    this.currentDb = db;

    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }

    try {
      import('firebase/firestore').then(({ collection, onSnapshot }) => {
        // Scoped Subcollection: tenants/{tenantId}/contacts
        const contactsRef = collection(db, 'tenants', tenantId, 'contacts');
        this.unsubscribeFirestore = onSnapshot(contactsRef, (snap) => {
          const list: CrmContactSummary[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              conta_name: data.conta_name || data.name || data.fullName || 'ללא שם',
              conta_phone: data.conta_phone || data.phone || data.mobile || '',
              email: data.email || '',
              tg1: data.tg1 || data.tz || data.idNumber || '',
              total_spent: data.total_spent || 0,
              order_count: data.order_count || 0,
            });
          });

          if (list.length > 0) {
            this.cachedContacts = list;
            this.saveToStorage();
          }
          this.isLoaded = true;
          this.notifyListeners();
        }, (err) => {
          console.warn('[CrmContactSyncService] Snapshot fallback:', err);
        });
      }).catch(err => {
        console.warn('[CrmContactSyncService] Firestore dynamic import error:', err);
      });
    } catch (e) {
      console.warn('[CrmContactSyncService] attachFirestore error:', e);
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

  public subscribe(callback: (contacts: CrmContactSummary[]) => void): () => void {
    this.listeners.add(callback);
    if (this.cachedContacts.length > 0) {
      callback(this.cachedContacts);
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getContacts(): CrmContactSummary[] {
    return this.cachedContacts;
  }

  public search(query: string): CrmContactSummary[] {
    return searchContacts(this.getContacts(), query);
  }

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
  }): Promise<{ contact: CrmContactSummary; isNew: boolean }> {
    const cleanPhone = cleanPhoneDigits(data.phone);
    const cleanTz = (data.tz || '').replace(/\D/g, '').trim();
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const fullName = (data.clientName || '').trim();

    let targetId = data.id;
    let existingContact = targetId ? this.cachedContacts.find(c => c.id === targetId) : undefined;

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

    const updatedContact: CrmContactSummary = {
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

    const idx = this.cachedContacts.findIndex(c => c.id === finalId);
    if (idx >= 0) {
      this.cachedContacts[idx] = updatedContact;
    } else {
      this.cachedContacts.unshift(updatedContact);
    }
    this.saveToStorage();
    this.notifyListeners();

    if (this.currentDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const docRef = doc(this.currentDb, 'contacts', finalId);
        const cleanPayload = JSON.parse(JSON.stringify(updatedContact));
        await setDoc(docRef, cleanPayload, { merge: true });
      } catch (err) {
        console.warn('[CrmContactSyncService] Firestore save error:', err);
      }
    }

    return { contact: updatedContact, isNew };
  }

  public async recordContactPayment(contactId: string, payment: {
    id?: string;
    date: string;
    amount: number;
    paymentType: string;
    receiptType?: string;
    receiptLink?: string;
    [key: string]: any;
  }): Promise<void> {
    const contact = this.cachedContacts.find(c => c.id === contactId);
    if (!contact) return;

    const currentPayments = Array.isArray((contact as any).payments) ? [...(contact as any).payments] : [];
    const updatedPayments = [payment, ...currentPayments];
    const newTotalSpent = (contact.total_spent || 0) + Number(payment.amount || 0);
    const newOrderCount = (contact.order_count || 0) + 1;

    const updatedContact: CrmContactSummary = {
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
    this.saveToStorage();
    this.notifyListeners();

    if (this.currentDb) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const docRef = doc(this.currentDb, 'contacts', contactId);
        await updateDoc(docRef, {
          payments: updatedPayments,
          total_spent: newTotalSpent,
          order_count: newOrderCount,
          last_order_date: (updatedContact as any).last_order_date,
          updatedAt: updatedContact.updatedAt,
        });
      } catch (err) {
        console.warn('[CrmContactSyncService] Firestore record payment error:', err);
      }
    }
  }
}

export const crmContactSyncService = new CrmContactSyncService();
