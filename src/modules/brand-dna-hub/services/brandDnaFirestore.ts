import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { BrandDna, DEFAULT_BRAND_DNA } from '../types/brandDna';

const LOCAL_STORAGE_KEY = 'comona_brand_dna_settings';

/**
 * Load Brand DNA from Firestore or LocalStorage
 */
export async function loadBrandDna(db?: Firestore): Promise<BrandDna> {
  // 1. Try Firestore if connected
  if (db) {
    try {
      const docRef = doc(db, 'settings', 'brand_dna');
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
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
    } catch (err) {
      console.warn('Could not fetch brand_dna from Firestore, falling back to local storage:', err);
    }
  }

  // 2. Fallback to LocalStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
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
    console.warn('Error reading from local storage:', e);
  }

  return DEFAULT_BRAND_DNA;
}

/**
 * Save Brand DNA to Firestore and LocalStorage
 */
export async function saveBrandDna(
  brandDna: BrandDna,
  db?: Firestore
): Promise<{ success: boolean; error?: string }> {
  const payload: BrandDna = {
    ...brandDna,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to LocalStorage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  } catch (err: any) {
    console.warn('Failed saving brand_dna to local storage:', err);
  }

  // 2. Save to Firestore if available
  if (db) {
    try {
      const docRef = doc(db, 'settings', 'brand_dna');
      await setDoc(docRef, payload, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.error('Error saving brand_dna to Firestore:', err);
      return { success: false, error: err.message || 'שגיאה בשמירה בענן' };
    }
  }

  return { success: true };
}
