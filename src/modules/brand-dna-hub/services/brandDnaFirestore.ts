import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { BrandDna, DEFAULT_BRAND_DNA } from '../types/brandDna';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { getTenantStorageKey } from '../../../core/tenant';

const BASE_LOCAL_STORAGE_KEY = 'brand_dna_settings';

/**
 * Load Brand DNA from Firestore (scoped to tenant) or LocalStorage
 * Path in Firestore: `tenants/{tenantId}/settings/brand_dna`
 */
export async function loadBrandDna(db?: Firestore, tenantId: string = '_master'): Promise<BrandDna> {
  // 1. Try Firestore (tenants/{tenantId}/settings/brand_dna)
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as BrandDna;
        return {
          ...DEFAULT_BRAND_DNA,
          ...data,
          identity: { ...DEFAULT_BRAND_DNA.identity, ...data.identity },
          voice: { ...DEFAULT_BRAND_DNA.voice, ...data.voice },
          audience: { ...DEFAULT_BRAND_DNA.audience, ...data.audience },
          designTokens: { ...DEFAULT_BRAND_DNA.designTokens, ...data.designTokens },
          trust: { ...DEFAULT_BRAND_DNA.trust, ...data.trust },
        };
      }

      // If specific tenant has no doc, try master tenant in DB
      if (tenantId !== '_master') {
        const masterRef = doc(db, 'tenants', '_master', SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
        const masterSnap = await getDoc(masterRef);
        if (masterSnap.exists()) {
          const masterData = masterSnap.data() as BrandDna;
          return {
            ...DEFAULT_BRAND_DNA,
            ...masterData,
            identity: { ...DEFAULT_BRAND_DNA.identity, ...masterData.identity },
            voice: { ...DEFAULT_BRAND_DNA.voice, ...masterData.voice },
            audience: { ...DEFAULT_BRAND_DNA.audience, ...masterData.audience },
            designTokens: { ...DEFAULT_BRAND_DNA.designTokens, ...masterData.designTokens },
            trust: { ...DEFAULT_BRAND_DNA.trust, ...masterData.trust },
          };
        }
      }
    } catch (err) {
      console.warn(`[BrandDNA] Could not fetch brand_dna for tenant "${tenantId}" from Firestore:`, err);
    }
  }

  return DEFAULT_BRAND_DNA;
}

/**
 * Save Brand DNA to Firestore (scoped to tenant) and LocalStorage
 * Path in Firestore: `tenants/{tenantId}/settings/brand_dna`
 */
export async function saveBrandDna(
  brandDna: BrandDna,
  db?: Firestore,
  tenantId: string = '_master'
): Promise<{ success: boolean; error?: string }> {
  const localStorageKey = getTenantStorageKey(BASE_LOCAL_STORAGE_KEY, tenantId);
  const payload: BrandDna = {
    ...brandDna,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to LocalStorage immediately (tenant scoped)
  try {
    const jsonPayload = JSON.stringify(payload);
    if (jsonPayload.length > 1024 * 1024 * 4) { // > 4MB, strip logo to avoid crash
      payload.identity.logoUrl = '';
      localStorage.setItem(localStorageKey, JSON.stringify(payload));
    } else {
      localStorage.setItem(localStorageKey, jsonPayload);
    }
  } catch (err: any) {
    if (err.name !== 'QuotaExceededError') {
      console.warn(`[BrandDNA] Failed saving brand_dna for tenant "${tenantId}" to local storage:`, err);
    }
  }

  // 2. Save to Firestore if available: tenants/{tenantId}/settings/brand_dna
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
      await setDoc(docRef, payload, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.error(`[BrandDNA] Error saving brand_dna for tenant "${tenantId}" to Firestore:`, err);
      return { success: false, error: err.message || 'שגיאה בשמירה בענן' };
    }
  }

  return { success: true };
}

/**
 * Save a content strategy item to the `content_strategies` Firestore collection
 */
export async function saveContentStrategyItem(
  strategy: any,
  db?: Firestore,
  tenantId: string = '_master'
): Promise<{ success: boolean; error?: string }> {
  const strategyId = strategy.id || `strat_${Date.now()}`;
  const payload = {
    ...strategy,
    tenantId,
    savedAt: new Date().toISOString(),
  };

  if (db) {
    try {
      const docRef = doc(db, 'content_strategies', strategyId);
      await setDoc(docRef, payload, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.error('[BrandDNA] Error saving content_strategy to Firestore:', err);
      return { success: false, error: err.message };
    }
  }

  // Local storage fallback if db not connected
  try {
    const listKey = `content_strategies_${tenantId}`;
    const existing = JSON.parse(localStorage.getItem(listKey) || '[]');
    existing.push(payload);
    localStorage.setItem(listKey, JSON.stringify(existing));
  } catch {}

  return { success: true };
}
