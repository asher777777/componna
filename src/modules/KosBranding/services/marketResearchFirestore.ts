import {
  Firestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db as defaultFirestoreDb } from '../../../services/firebase';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import { MarketResearchItem } from '../types/brandDna';

function resolveEffectiveTenant(tenantId?: string): string {
  if (
    !tenantId ||
    tenantId === ROOT_TENANT_ID ||
    tenantId === '_master' ||
    tenantId === 'default' ||
    tenantId === 'master' ||
    tenantId === 'undefined' ||
    tenantId === 'null'
  ) {
    return ROOT_TENANT_ID;
  }
  return tenantId;
}

function getCollectionPath(tenantId?: string): string {
  const eff = resolveEffectiveTenant(tenantId);
  return `tenants/${eff}/${SYSTEM_COLLECTIONS.MARKET_RESEARCH}`;
}

function getStorageKey(tenantId?: string): string {
  const eff = resolveEffectiveTenant(tenantId);
  return `kosun_${eff}_market_research_items`;
}

function sanitizeForFirestore(value: any): any {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map(sanitizeForFirestore).filter((v) => v !== undefined);
  }
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    const cleaned = sanitizeForFirestore(v);
    if (cleaned !== undefined) out[k] = cleaned;
  }
  return out;
}

function readLocalItems(tenantId?: string): MarketResearchItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(tenantId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalItems(items: MarketResearchItem[], tenantId?: string): void {
  try {
    localStorage.setItem(getStorageKey(tenantId), JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

export const marketResearchFirestore = {
  async list(db?: Firestore | null, tenantId?: string): Promise<MarketResearchItem[]> {
    const effDb = db || defaultFirestoreDb;
    const localItems = readLocalItems(tenantId);

    if (!effDb) {
      return localItems;
    }

    try {
      const colRef = collection(effDb, getCollectionPath(tenantId));
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const remoteItems: MarketResearchItem[] = [];
      snap.forEach((d) => {
        remoteItems.push(d.data() as MarketResearchItem);
      });
      if (remoteItems.length > 0) {
        writeLocalItems(remoteItems, tenantId);
        return remoteItems;
      }
      return localItems;
    } catch (err) {
      console.warn('[marketResearchFirestore] Falling back to localStorage:', err);
      return localItems;
    }
  },

  async save(
    item: MarketResearchItem,
    db?: Firestore | null,
    tenantId?: string
  ): Promise<MarketResearchItem> {
    const now = new Date().toISOString();
    const record: MarketResearchItem = {
      ...item,
      createdAt: item.createdAt || now,
      updatedAt: now,
    };

    // Always update local cache immediately
    const existing = readLocalItems(tenantId).filter((x) => x.id !== record.id);
    writeLocalItems([record, ...existing], tenantId);

    const effDb = db || defaultFirestoreDb;
    if (effDb) {
      try {
        const docRef = doc(effDb, getCollectionPath(tenantId), record.id);
        await setDoc(docRef, sanitizeForFirestore(record), { merge: true });
      } catch (err) {
        console.warn('[marketResearchFirestore] Firestore save note:', err);
      }
    }

    return record;
  },

  async remove(id: string, db?: Firestore | null, tenantId?: string): Promise<void> {
    const existing = readLocalItems(tenantId).filter((x) => x.id !== id);
    writeLocalItems(existing, tenantId);

    const effDb = db || defaultFirestoreDb;
    if (effDb) {
      try {
        const docRef = doc(effDb, getCollectionPath(tenantId), id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[marketResearchFirestore] Firestore delete note:', err);
      }
    }
  },
};
