import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { BrandDna, DEFAULT_BRAND_DNA } from '../types/brandDna';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { CommunityBrandProfile } from '../../../core/contracts';
import { getTenantStorageKey } from '../../../core/tenant';

const BASE_LOCAL_STORAGE_KEY = 'kos_branding_settings';
const LEGACY_STORAGE_KEY = 'brand_dna_settings';

export function createTenantInitialBrandDna(
  tenantId: string = '_master',
  clientName?: string,
  phone?: string,
  email?: string
): BrandDna {
  if (tenantId === '_master') {
    return DEFAULT_BRAND_DNA;
  }

  const cleanName = clientName || tenantId;

  return {
    identity: {
      companyName: cleanName,
      organizationType: 'חברה',
      organizationPurpose: 'מתן שירותים ופתרונות מותאמים אישית ללקוחותינו',
      memberCount: 'עד 10',
      slogan: '',
      companyVision: `להעניק שירות מקצועי, אמין ואיכותי לכל לקוחות ${cleanName}.`,
      shortVision: `איכות ושירות ללא פשרות.`,
      logoUrl: '',
      vibeImages: [],
    },
    ecosystem: {
      services: [],
      products: [],
      annualEvents: [],
      communities: [],
      businessPackages: [],
    },
    voice: {
      personality: {
        formality: 3,
        warmth: 4,
        luxury: 3,
        energy: 4,
      },
      genderAddressing: 'plural',
      sectorCompliance: 'general',
      powerWords: ['איכות', 'מקצועיות', 'שירות אישי', 'אמינות'],
      forbiddenWords: ['זול', 'חלטורה'],
      shabbatObservant: false,
    },
    audience: {
      mainUvp: `פתרונות ייחודיים ומקצועיים המותאמים אישית עבורכם על ידי ${cleanName}.`,
      targetAudiences: ['לקוחות פרטיים ועסקיים'],
      personas: [],
      commonObjections: [],
    },
    designTokens: {
      primaryColor: '#6366f1',
      secondaryColor: '#0ea5e9',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      textColorH1: '#0f172a',
      textColorH2: '#475569',
      buttonBgColor: '#6366f1',
      buttonTextColor: '#ffffff',
      fontFamily: 'Heebo, sans-serif',
      borderRadius: 'md',
      buttonStyle: 'gradient',
    },
    trust: {
      legalEntityId: '',
      contactPhone: phone || '',
      contactEmail: email || `${tenantId}@kosun.pro`,
      officeAddress: 'ישראל',
      refundPolicySummary: 'שירות אמין ושקוף בהתאם לחוק הגנת הצרכן.',
      securityBadgeText: 'סליקה מאובטחת בתקן PCI-DSS ובהצפנת SSL 256-bit',
      whatsappSupportNumber: phone ? phone.replace(/\D/g, '') : '',
    },
  };
}

/**
 * Load Brand DNA from Firestore (scoped to tenant) or LocalStorage
 * With automatic migration from legacy 'brand_dna' to new 'kos_branding_dna'
 * Path in Firestore: `tenants/{tenantId}/settings/kos_branding_dna`
 */
export async function loadBrandDna(db?: Firestore, tenantId: string = '_master'): Promise<BrandDna> {
  const isMaster = tenantId === '_master';
  const baseDefault = isMaster ? DEFAULT_BRAND_DNA : createTenantInitialBrandDna(tenantId);

  // 1. Try Firestore (tenants/{tenantId}/settings/kos_branding_dna)
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as BrandDna;

        // Cleanse accidental master data leak into custom tenant
        if (!isMaster) {
          if (data.identity?.companyName === 'קושאן') {
            data.identity.companyName = tenantId;
          }
          if (data.identity?.logoUrl === '/images/kosun-logo.svg') {
            data.identity.logoUrl = '';
          }
          if (data.identity?.slogan === 'כל אדם זה נכס') {
            data.identity.slogan = '';
          }
        }

        return {
          ...baseDefault,
          ...data,
          identity: { ...baseDefault.identity, ...(data.identity || {}) },
          voice: { ...baseDefault.voice, ...(data.voice || {}) },
          audience: { ...baseDefault.audience, ...(data.audience || {}) },
          designTokens: { ...baseDefault.designTokens, ...(data.designTokens || {}) },
          trust: { ...baseDefault.trust, ...(data.trust || {}) },
        };
      }

      // Auto-Migration: check legacy doc 'brand_dna' if new 'kos_branding_dna' doesn't exist
      const legacyDocRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, 'brand_dna');
      const legacySnap = await getDoc(legacyDocRef);
      if (legacySnap.exists()) {
        const legacyData = legacySnap.data() as BrandDna;
        if (!isMaster) {
          if (legacyData.identity?.companyName === 'קושאן') {
            legacyData.identity.companyName = tenantId;
          }
          if (legacyData.identity?.logoUrl === '/images/kosun-logo.svg') {
            legacyData.identity.logoUrl = '';
          }
          if (legacyData.identity?.slogan === 'כל אדם זה נכס') {
            legacyData.identity.slogan = '';
          }
        }
        const merged = {
          ...baseDefault,
          ...legacyData,
          identity: { ...baseDefault.identity, ...(legacyData.identity || {}) },
          voice: { ...baseDefault.voice, ...(legacyData.voice || {}) },
          audience: { ...baseDefault.audience, ...(legacyData.audience || {}) },
          designTokens: { ...baseDefault.designTokens, ...(legacyData.designTokens || {}) },
          trust: { ...baseDefault.trust, ...(legacyData.trust || {}) },
        };
        // Migrate to new collection doc in background
        setDoc(docRef, merged, { merge: true }).catch(console.warn);
        return merged;
      }

    } catch (err) {
      console.warn(`[KosBranding] Could not fetch branding for tenant "${tenantId}" from Firestore:`, err);
    }
  }

  // 2. Fallback to LocalStorage (scoped key only for custom tenants, legacy fallback only for _master)
  try {
    const localStorageKey = getTenantStorageKey(BASE_LOCAL_STORAGE_KEY, tenantId);
    let raw = localStorage.getItem(localStorageKey);
    if (!raw && isMaster) {
      raw = localStorage.getItem(BASE_LOCAL_STORAGE_KEY);
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!isMaster) {
        if (parsed.identity?.companyName === 'קושאן') {
          parsed.identity.companyName = tenantId;
        }
        if (parsed.identity?.logoUrl === '/images/kosun-logo.svg') {
          parsed.identity.logoUrl = '';
        }
        if (parsed.identity?.slogan === 'כל אדם זה נכס') {
          parsed.identity.slogan = '';
        }
      }
      return {
        ...baseDefault,
        ...parsed,
        identity: { ...baseDefault.identity, ...(parsed.identity || {}) },
        voice: { ...baseDefault.voice, ...(parsed.voice || {}) },
        audience: { ...baseDefault.audience, ...(parsed.audience || {}) },
        designTokens: { ...baseDefault.designTokens, ...(parsed.designTokens || {}) },
        trust: { ...baseDefault.trust, ...(parsed.trust || {}) },
      };
    }
  } catch (err) {
    console.warn('[BrandDNA] LocalStorage read fallback error:', err);
  }

  return baseDefault;
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

/**
 * Load Community Brand Profile from KosBrandingTo collection
 * Path in Firestore: `tenants/{tenantId}/kos_branding_to/{communityId}`
 */
export async function getCommunityBrand(
  db?: Firestore,
  tenantId: string = '_master',
  communityId?: string
): Promise<CommunityBrandProfile | null> {
  if (!communityId) return null;

  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_BRANDING_TO, communityId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as CommunityBrandProfile;
      }
    } catch (err) {
      console.warn(`[KosBrandingTo] Could not fetch community brand "${communityId}" from Firestore:`, err);
    }
  }

  // LocalStorage fallback
  try {
    const raw = localStorage.getItem(`kos_branding_to_${tenantId}_${communityId}`);
    if (raw) {
      return JSON.parse(raw) as CommunityBrandProfile;
    }
  } catch (err) {
    console.warn('[KosBrandingTo] LocalStorage fallback read error:', err);
  }

  return null;
}

/**
 * Save Community Brand Profile to KosBrandingTo collection
 * Path in Firestore: `tenants/{tenantId}/kos_branding_to/{communityId}`
 */
export async function saveCommunityBrand(
  db?: Firestore,
  tenantId: string = '_master',
  profile?: CommunityBrandProfile
): Promise<boolean> {
  if (!profile || !profile.communityId) return false;

  const payload: CommunityBrandProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  // LocalStorage persistence
  try {
    localStorage.setItem(`kos_branding_to_${tenantId}_${profile.communityId}`, JSON.stringify(payload));
  } catch (err) {
    console.warn('[KosBrandingTo] LocalStorage write error:', err);
  }

  // Firestore persistence
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_BRANDING_TO, profile.communityId);
      await setDoc(docRef, payload, { merge: true });
      return true;
    } catch (err) {
      console.error(`[KosBrandingTo] Error saving community brand "${profile.communityId}" to Firestore:`, err);
      return false;
    }
  }

  return true;
}
