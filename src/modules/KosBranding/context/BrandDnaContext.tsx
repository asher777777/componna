import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { BrandDna, DEFAULT_BRAND_DNA, BrandIdentity, BrandVoice, BrandAudience, BrandDesignTokens, BrandTrustAndCheckout } from '../types/brandDna';
import { loadBrandDna, saveBrandDna, getCommunityBrand, saveCommunityBrand } from '../services/brandDnaFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { buildBrandSystemContext } from '../services/geminiBrandPrompt';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { eventBus } from '../../../core/bridge/EventBus';
import { BrandDnaContract, CommunityBrandContract, CommunityBrandProfile } from '../../../core/contracts';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { useTenantScope } from '../../../core/tenant';

export interface BrandDnaContextValue {
  brandDna: BrandDna;
  isLoading: boolean;
  isSaving: boolean;
  completenessScore: number;
  missingRecommendations: string[];
  updateIdentity: (partial: Partial<BrandIdentity>) => void;
  updateVoice: (partial: Partial<BrandVoice>) => void;
  updateAudience: (partial: Partial<BrandAudience>) => void;
  updateDesignTokens: (partial: Partial<BrandDesignTokens>) => void;
  updateTrust: (partial: Partial<BrandTrustAndCheckout>) => void;
  setFullBrandDna: (newDna: BrandDna) => void;
  saveNow: () => Promise<boolean>;
  resetToDefaults: () => void;
  getGeminiSystemContext: (moduleRole?: string) => string;
  setLogoUrl: (url: string) => Promise<boolean>;
  addVibeImage: (url: string) => Promise<boolean>;
  removeVibeImage: (url: string) => Promise<boolean>;
}

const BrandDnaContext = createContext<BrandDnaContextValue | undefined>(undefined);

export const BrandDnaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { registerCapability, unregisterCapability } = useHostCapabilities();
  const [brandDna, setBrandDna] = useState<BrandDna>(DEFAULT_BRAND_DNA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load initially or when tenant changes, and attach real-time onSnapshot listener
  useEffect(() => {
    let mounted = true;
    async function init() {
      setIsLoading(true);
      const data = await loadBrandDna(db, tenantId);
      if (mounted) {
        setBrandDna(data);
        setIsLoading(false);
      }
    }
    init();

    // Attach real-time Firestore listener to settings/brand_dna collection
    let unsubscribeSnapshot: (() => void) | undefined;
    if (db) {
      try {
        const docRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
        unsubscribeSnapshot = onSnapshot(
          docRef,
          (snap) => {
            if (snap.exists() && mounted) {
              const remoteData = snap.data() as BrandDna;
              setBrandDna((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(remoteData)) return prev;
                return {
                  ...DEFAULT_BRAND_DNA,
                  ...remoteData,
                  identity: { ...DEFAULT_BRAND_DNA.identity, ...(remoteData.identity || {}) },
                  voice: { ...DEFAULT_BRAND_DNA.voice, ...(remoteData.voice || {}) },
                  audience: { ...DEFAULT_BRAND_DNA.audience, ...(remoteData.audience || {}) },
                  designTokens: { ...DEFAULT_BRAND_DNA.designTokens, ...(remoteData.designTokens || {}) },
                  trust: { ...DEFAULT_BRAND_DNA.trust, ...(remoteData.trust || {}) },
                };
              });
            }
          },
          (err) => {
            console.warn('[BrandDNA] onSnapshot collection listener note:', err);
          }
        );
      } catch (err) {
        console.warn('[BrandDNA] Firestore subscription init note:', err);
      }
    }

    return () => {
      mounted = false;
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [db, tenantId]);

  // Subscribe to live logo updates across EventBus (e.g. from Media Gallery, Gemini Studio)
  useEffect(() => {
    const unsub = eventBus.subscribe('brand:logo_updated', (data) => {
      if (data?.logoUrl !== undefined) {
        setBrandDna((prev) => {
          if (prev.identity.logoUrl === data.logoUrl) return prev;
          const updated = {
            ...prev,
            identity: { ...prev.identity, logoUrl: data.logoUrl },
          };
          saveBrandDna(updated, db, tenantId).catch((err) =>
            console.warn('[BrandDNA] Failed to persist logo from event:', err)
          );
          return updated;
        });
      }
    });
    return () => unsub();
  }, [db, tenantId]);

  // Auto-Save whenever brandDna changes (debounced by 1.5 seconds)
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      saveBrandDna(brandDna, db, tenantId).then((res) => {
        if (res.success) {
          eventBus.publish('brand:updated', {
            brandDna,
            updatedAt: new Date().toISOString(),
          });
        }
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [brandDna, db, tenantId, isLoading]);

  const updateIdentity = useCallback((partial: Partial<BrandIdentity>) => {
    setBrandDna((prev) => {
      const updated = {
        ...prev,
        identity: { ...prev.identity, ...partial },
      };
      if (partial.logoUrl !== undefined) {
        saveBrandDna(updated, db, tenantId).catch((err) =>
          console.warn('[BrandDNA] Auto-save logo failed:', err)
        );
      }
      return updated;
    });
    if (partial.logoUrl !== undefined) {
      eventBus.publish('brand:logo_updated', {
        logoUrl: partial.logoUrl,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [db, tenantId]);

  const updateVoice = useCallback((partial: Partial<BrandVoice>) => {
    setBrandDna((prev) => ({
      ...prev,
      voice: { ...prev.voice, ...partial },
    }));
  }, []);

  const updateAudience = useCallback((partial: Partial<BrandAudience>) => {
    setBrandDna((prev) => ({
      ...prev,
      audience: { ...prev.audience, ...partial },
    }));
  }, []);

  const updateDesignTokens = useCallback((partial: Partial<BrandDesignTokens>) => {
    setBrandDna((prev) => ({
      ...prev,
      designTokens: { ...prev.designTokens, ...partial },
    }));
  }, []);

  const updateTrust = useCallback((partial: Partial<BrandTrustAndCheckout>) => {
    setBrandDna((prev) => ({
      ...prev,
      trust: { ...prev.trust, ...partial },
    }));
  }, []);

  const setFullBrandDna = useCallback((newDna: BrandDna) => {
    setBrandDna(newDna);
  }, []);

  const setLogoUrl = useCallback(async (url: string): Promise<boolean> => {
    setBrandDna((prev) => {
      const updated = {
        ...prev,
        identity: { ...prev.identity, logoUrl: url },
      };
      saveBrandDna(updated, db, tenantId).catch((err) =>
        console.warn('[BrandDNA] Save logoUrl failed:', err)
      );
      return updated;
    });
    eventBus.publish('brand:logo_updated', {
      logoUrl: url,
      updatedAt: new Date().toISOString(),
    });
    eventBus.publish('brand:updated', {
      brandDna: {
        ...brandDna,
        identity: { ...brandDna.identity, logoUrl: url },
      },
      updatedAt: new Date().toISOString(),
    });
    return true;
  }, [db, tenantId, brandDna]);

  const addVibeImage = useCallback(async (url: string): Promise<boolean> => {
    setBrandDna((prev) => {
      const existing = prev.identity.vibeImages || [];
      if (existing.includes(url)) return prev;
      return {
        ...prev,
        identity: {
          ...prev.identity,
          vibeImages: [...existing, url],
        },
      };
    });
    eventBus.publish('brand:vibe_image_added', {
      imageUrl: url,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }, []);

  const removeVibeImage = useCallback(async (url: string): Promise<boolean> => {
    setBrandDna((prev) => ({
      ...prev,
      identity: {
        ...prev.identity,
        vibeImages: (prev.identity.vibeImages || []).filter((img) => img !== url),
      },
    }));
    return true;
  }, []);

  const saveNow = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    const res = await saveBrandDna(brandDna, db, tenantId);
    setIsSaving(false);
    if (res.success) {
      eventBus.publish('brand:updated', {
        brandDna,
        updatedAt: new Date().toISOString(),
      });
    }
    return res.success;
  }, [brandDna, db]);

  const resetToDefaults = useCallback(async () => {
    if (window.confirm('האם לאפס את נתוני ה-DNA להגדרות ברירת המחדל?')) {
      setBrandDna(DEFAULT_BRAND_DNA);
      await saveBrandDna(DEFAULT_BRAND_DNA, db);
      eventBus.publish('brand:updated', {
        brandDna: DEFAULT_BRAND_DNA,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [db]);

  // Register brand-dna and community-brand capabilities to host context
  useEffect(() => {
    const contract: BrandDnaContract = {
      getBrandDna: () => brandDna,
      getSystemPrompt: (moduleRole?: string) => buildBrandSystemContext(brandDna, moduleRole),
      getDesignTokens: () => brandDna.designTokens,
      updateBrandDna: async (partial: Partial<BrandDna>) => {
        setBrandDna((prev) => ({ ...prev, ...partial }));
        return true;
      },
      setLogoUrl,
      addVibeImage,
      removeVibeImage,
    };
    registerCapability('brand-dna', contract);

    const communityContract: CommunityBrandContract = {
      getCommunityBrand: (communityId: string) => getCommunityBrand(db, tenantId, communityId),
      saveCommunityBrand: (profile: CommunityBrandProfile) => saveCommunityBrand(db, tenantId, profile),
    };
    registerCapability('community-brand', communityContract);

    return () => {
      unregisterCapability('brand-dna');
      unregisterCapability('community-brand');
    };
  }, [brandDna, db, tenantId, registerCapability, unregisterCapability, setLogoUrl, addVibeImage, removeVibeImage]);
  const { completenessScore, missingRecommendations } = useMemo(() => {
    let score = 0;
    const recommendations: string[] = [];

    // Identity (30%)
    if (brandDna.identity.companyName.trim()) score += 8;
    else recommendations.push('הגדר שם חברה או ארגון');

    if (brandDna.identity.slogan.trim()) score += 7;
    else recommendations.push('הוסף סלוגן קליט');

    if (brandDna.identity.companyVision.trim()) score += 8;
    else recommendations.push('נסח חזון מפורט');

    if (brandDna.identity.logoUrl) score += 7;
    else recommendations.push('העלה לוגו של המותג');

    // Voice & Tone (25%)
    if (brandDna.voice.powerWords.length >= 3) score += 10;
    else recommendations.push('הוסף לפחות 3 מילות כוח שיווקיות');

    if (brandDna.voice.forbiddenWords.length >= 1) score += 8;
    else recommendations.push('הגדר מילים אסורות לשימוש (Guardrails)');

    if (brandDna.voice.genderAddressing) score += 7;

    // Audience & UVP (25%)
    if (brandDna.audience.mainUvp.trim()) score += 10;
    else recommendations.push('הגדר הצעת ערך ייחודית (UVP)');

    if (brandDna.audience.personas.length >= 1) score += 8;
    else recommendations.push('צור לפחות פרסונת לקוח אחת');

    if (brandDna.audience.commonObjections.length >= 1) score += 7;
    else recommendations.push('הזן מענה לחשש או התנגדות נפוצה');

    // Trust & Legal (20%)
    if (brandDna.trust.legalEntityId.trim()) score += 5;
    if (brandDna.trust.contactPhone.trim() || brandDna.trust.contactEmail.trim()) score += 5;
    if (brandDna.trust.refundPolicySummary.trim()) score += 5;
    if (brandDna.trust.securityBadgeText.trim()) score += 5;

    return {
      completenessScore: Math.min(100, score),
      missingRecommendations: recommendations,
    };
  }, [brandDna]);

  const getGeminiSystemContext = useCallback(
    (moduleRole?: string) => {
      return buildBrandSystemContext(brandDna, moduleRole);
    },
    [brandDna]
  );

  return (
    <BrandDnaContext.Provider
      value={{
        brandDna,
        isLoading,
        isSaving,
        completenessScore,
        missingRecommendations,
        updateIdentity,
        updateVoice,
        updateAudience,
        updateDesignTokens,
        updateTrust,
        setFullBrandDna,
        saveNow,
        resetToDefaults,
        getGeminiSystemContext,
        setLogoUrl,
        addVibeImage,
        removeVibeImage,
      }}
    >
      {children}
    </BrandDnaContext.Provider>
  );
};

const FALLBACK_CONTEXT_VALUE: BrandDnaContextValue = {
  brandDna: DEFAULT_BRAND_DNA,
  isLoading: false,
  isSaving: false,
  completenessScore: 0,
  missingRecommendations: [],
  updateIdentity: () => {},
  updateVoice: () => {},
  updateAudience: () => {},
  updateDesignTokens: () => {},
  updateTrust: () => {},
  setFullBrandDna: () => {},
  saveNow: async () => true,
  resetToDefaults: () => {},
  getGeminiSystemContext: () => '',
  setLogoUrl: async () => true,
  addVibeImage: async () => true,
  removeVibeImage: async () => true,
};

export const useBrandDna = (): BrandDnaContextValue => {
  const context = useContext(BrandDnaContext);
  if (!context) {
    return FALLBACK_CONTEXT_VALUE;
  }
  return context;
};
