import { db } from '../../../services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { GlossaryItem, ReceiptLineItem } from '../types';
import { normalizeSearchText, matchesFlexibleName } from './crmContactSyncService';

const STORAGE_KEY = 'kesher_receipt_glossary_v1';

const DEFAULT_PRESET_ITEMS: GlossaryItem[] = [
  { id: 'item_1', name: 'תרומה לפרויקט פשוט מושלם', defaultPrice: 1500, category: 'פרויקטים', usageCount: 15 },
  { id: 'item_2', name: 'תרומה כללית לפעילות', defaultPrice: 180, category: 'תרומות', usageCount: 20 },
  { id: 'item_3', name: 'דמי חברות / שותפות חודשית', defaultPrice: 250, category: 'חברות', usageCount: 10 },
  { id: 'item_4', name: 'הקדשת יום לימוד / עילוי נשמת', defaultPrice: 360, category: 'הנצחה', usageCount: 8 },
  { id: 'item_5', name: 'זכר למחצית השקל', defaultPrice: 36, category: 'מועדים', usageCount: 12 },
  { id: 'item_6', name: 'פדיון כפרות', defaultPrice: 100, category: 'מועדים', usageCount: 14 },
  { id: 'item_7', name: 'רכישת אות בספר תורה', defaultPrice: 500, category: 'קודש', usageCount: 6 },
  { id: 'item_8', name: 'סיוע וחלוקת קמחא דפסחא', defaultPrice: 400, category: 'חסד', usageCount: 9 },
  { id: 'item_9', name: 'תשלום עבור שכר לימוד / חוגים', defaultPrice: 650, category: 'חינוך', usageCount: 5 },
  { id: 'item_10', name: 'רכישת ספרים ומוצרי קודש', defaultPrice: 120, category: 'מכירות', usageCount: 7 },
];

class ReceiptGlossaryService {
  private items: GlossaryItem[] = [];
  private listeners: Set<(items: GlossaryItem[]) => void> = new Set();
  private unsubscribeFirestore: (() => void) | null = null;

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // 1. Load from localStorage first
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items = parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage glossary read error:', e);
    }

    if (this.items.length === 0) {
      this.items = [...DEFAULT_PRESET_ITEMS];
      this.saveLocal();
    }

    // 2. Subscribe to Firestore
    try {
      if (db) {
        const collRef = collection(db, 'receipt_glossary_items');
        this.unsubscribeFirestore = onSnapshot(collRef, (snap) => {
          const list: GlossaryItem[] = [];
          snap.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as GlossaryItem);
          });

          if (list.length > 0) {
            // Merge with presets if needed
            const map = new Map<string, GlossaryItem>();
            list.forEach(item => map.set(item.name.trim().toLowerCase(), item));
            this.items.forEach(item => {
              const k = item.name.trim().toLowerCase();
              if (!map.has(k)) map.set(k, item);
            });
            this.items = Array.from(map.values()).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
            this.saveLocal();
            this.notifyListeners();
          }
        }, (err) => {
          console.warn('[ReceiptGlossaryService] Firestore notice:', err);
        });
      }
    } catch (e) {
      console.warn('[ReceiptGlossaryService] Firestore init notice:', e);
    }
  }

  private saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn('LocalStorage glossary save error:', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.items);
      } catch (err) {
        console.error(err);
      }
    });
  }

  public subscribe(callback: (items: GlossaryItem[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.items);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getItems(): GlossaryItem[] {
    return [...this.items];
  }

  /**
   * Search glossary items by name/token with fuzzy Hebrew matching
   */
  public search(query: string): GlossaryItem[] {
    if (!query || !query.trim()) {
      return this.items.slice(0, 10);
    }
    const term = query.trim();
    return this.items.filter(item => 
      matchesFlexibleName(term, item.name) ||
      (item.category && matchesFlexibleName(term, item.category))
    );
  }

  /**
   * Add or update an item in the glossary
   */
  public async saveOrUpdateItem(data: {
    id?: string;
    name: string;
    defaultPrice: number;
    category?: string;
  }): Promise<GlossaryItem> {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error('שם הפריט אינו יכול להיות ריק');
    }

    const existingIdx = this.items.findIndex(
      it => (data.id && it.id === data.id) || it.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    let finalItem: GlossaryItem;
    if (existingIdx >= 0) {
      const existing = this.items[existingIdx];
      finalItem = {
        ...existing,
        name: trimmedName,
        defaultPrice: Number(data.defaultPrice) || existing.defaultPrice || 0,
        category: data.category || existing.category,
        usageCount: (existing.usageCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      this.items[existingIdx] = finalItem;
    } else {
      const id = data.id || `glossary_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      finalItem = {
        id,
        name: trimmedName,
        defaultPrice: Number(data.defaultPrice) || 0,
        category: data.category || 'כללי',
        usageCount: 1,
        updatedAt: new Date().toISOString(),
      };
      this.items.unshift(finalItem);
    }

    // Sort by usage count
    this.items.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    this.saveLocal();
    this.notifyListeners();

    // Persist to Firestore
    try {
      if (db) {
        const docRef = doc(db, 'receipt_glossary_items', finalItem.id);
        const cleanPayload = JSON.parse(JSON.stringify(finalItem));
        await setDoc(docRef, cleanPayload, { merge: true });
      }
    } catch (err) {
      console.warn('[ReceiptGlossaryService] Firestore save error:', err);
    }

    return finalItem;
  }

  /**
   * Automatically saves all line items from an issued receipt into the glossary
   */
  public async saveItemsFromReceipt(items: ReceiptLineItem[]): Promise<void> {
    if (!Array.isArray(items) || items.length === 0) return;
    for (const line of items) {
      if (line.description && line.description.trim()) {
        try {
          await this.saveOrUpdateItem({
            name: line.description,
            defaultPrice: line.unitPrice || line.total || 0,
            category: line.category || 'תקבולים',
          });
        } catch (e) {
          console.warn('Auto glossary save error for line:', e);
        }
      }
    }
  }

  /**
   * Delete an item from glossary
   */
  public async deleteItem(id: string): Promise<boolean> {
    this.items = this.items.filter(i => i.id !== id);
    this.saveLocal();
    this.notifyListeners();

    try {
      if (db) {
        await deleteDoc(doc(db, 'receipt_glossary_items', id));
      }
      return true;
    } catch (e) {
      console.warn('[ReceiptGlossaryService] Firestore delete notice:', e);
      return true;
    }
  }
}

export const receiptGlossaryService = new ReceiptGlossaryService();
