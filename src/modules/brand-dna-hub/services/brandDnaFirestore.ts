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
  const localStorageKey = getTenantStorageKey(BASE_LOCAL_STORAGE_KEY, tenantId);

  // 1. Try Firestore if connected (tenants/{tenantId}/settings/brand_dna)
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as BrandDna;
        // Merge with default to ensure all fields exist
        const merged: BrandDna = {
          ...DEFAULT_BRAND_DNA,
          ...data,
          identity: { ...DEFAULT_BRAND_DNA.identity, ...data.identity },
          voice: { ...DEFAULT_BRAND_DNA.voice, ...data.voice },
          audience: { ...DEFAULT_BRAND_DNA.audience, ...data.audience },
          designTokens: { ...DEFAULT_BRAND_DNA.designTokens, ...data.designTokens },
          trust: { ...DEFAULT_BRAND_DNA.trust, ...data.trust },
        };
        // Also update local storage cache
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(merged));
        } catch {}
        return merged;
      }
    } catch (err) {
      console.warn(`[BrandDNA] Could not fetch brand_dna for tenant "${tenantId}" from Firestore, falling back to local storage:`, err);
    }
  }

  // 2. Fallback to LocalStorage scoped to this tenant
  try {
    const local = localStorage.getItem(localStorageKey);
    if (local) {
      const data = JSON.parse(local) as BrandDna;
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
  } catch (e) {
    console.warn('[BrandDNA] Error reading from local storage:', e);
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
    localStorage.setItem(localStorageKey, JSON.stringify(payload));
  } catch (err: any) {
    console.warn(`[BrandDNA] Failed saving brand_dna for tenant "${tenantId}" to local storage:`, err);
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
