import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { BrandDna, DEFAULT_BRAND_DNA, BrandIdentity, BrandVoice, BrandAudience, BrandDesignTokens, BrandTrustAndCheckout } from '../types/brandDna';
import { loadBrandDna, saveBrandDna, getCommunityBrand, saveCommunityBrand, createTenantInitialBrandDna } from '../services/brandDnaFirestore';
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

export const BrandDnaContext = createContext<BrandDnaContextValue | undefined>(undefined);

export const BrandDnaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { registerCapability, unregisterCapability } = useHostCapabilities();
  const [brandDna, setBrandDna] = useState<BrandDna>(() => createTenantInitialBrandDna(tenantId));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Stable ref to always have latest state without triggering re-registration loops
  const brandDnaRef = useRef<BrandDna>(brandDna);
  useEffect(() => {
    brandDnaRef.current = brandDna;
  }, [brandDna]);

  // Editing lock to prevent onSnapshot from overwriting active user edits
  const isEditingRef = useRef(false);
  const editTimeoutRef = useRef<any>(null);

  const markLocalEdit = useCallback(() => {
    isEditingRef.current = true;
    if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
    editTimeoutRef.current = setTimeout(() => {
      isEditingRef.current = false;
    }, 4000);
  }, []);

  // Cleanup edit timeout on unmount
  useEffect(() => {
    return () => {
      if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
    };
  }, []);

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
            // Ignore local pending writes and active user typing to prevent cursor jump back
            if (snap.metadata.hasPendingWrites || isEditingRef.current) return;

            if (snap.exists() && mounted) {
              const remoteData = snap.data() as BrandDna;
              const isMaster = tenantId === '_master';
              const baseDefault = isMaster ? DEFAULT_BRAND_DNA : createTenantInitialBrandDna(tenantId);

              // Cleanse accidental master data leak or slug fallback into custom tenant
              if (!isMaster) {
                if (remoteData.identity?.companyName === 'קושאן' || remoteData.identity?.companyName === tenantId) {
                  remoteData.identity.companyName = '';
                }
                if (remoteData.identity?.logoUrl === '/images/kosun-logo.svg') {
                  remoteData.identity.logoUrl = '';
                }
                if (remoteData.identity?.slogan === 'כל אדם זה נכס') {
                  remoteData.identity.slogan = '';
                }
                if (remoteData.identity?.companyVision?.includes('קושאן') || remoteData.identity?.companyVision?.includes(tenantId)) {
                  remoteData.identity.companyVision = '';
                }
                if (remoteData.audience?.mainUvp?.includes('קושאן') || remoteData.audience?.mainUvp?.includes(tenantId)) {
                  remoteData.audience.mainUvp = '';
                }
              }

              setBrandDna((prev) => {
                const { updatedAt: _p, ...prevClean } = prev as any;
                const { updatedAt: _r, ...remoteClean } = remoteData as any;
                if (JSON.stringify(prevClean) === JSON.stringify(remoteClean)) return prev;

                return {
                  ...baseDefault,
                  ...remoteData,
                  identity: { ...baseDefault.identity, ...(remoteData.identity || {}) },
                  ecosystem: { ...(baseDefault.ecosystem || { services: [], products: [], annualEvents: [], communities: [], businessPackages: [] }), ...(remoteData.ecosystem || {}) },
                  voice: { ...baseDefault.voice, ...(remoteData.voice || {}) },
                  audience: { ...baseDefault.audience, ...(remoteData.audience || {}) },
                  designTokens: { ...baseDefault.designTokens, ...(remoteData.designTokens || {}) },
                  trust: { ...baseDefault.trust, ...(remoteData.trust || {}) },
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
        markLocalEdit();
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
  }, [db, tenantId, markLocalEdit]);

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
    markLocalEdit();
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
  }, [db, tenantId, markLocalEdit]);

  const updateVoice = useCallback((partial: Partial<BrandVoice>) => {
    markLocalEdit();
    setBrandDna((prev) => ({
      ...prev,
      voice: { ...prev.voice, ...partial },
    }));
  }, [markLocalEdit]);

  const updateAudience = useCallback((partial: Partial<BrandAudience>) => {
    markLocalEdit();
    setBrandDna((prev) => ({
      ...prev,
      audience: { ...prev.audience, ...partial },
    }));
  }, [markLocalEdit]);

  const updateDesignTokens = useCallback((partial: Partial<BrandDesignTokens>) => {
    markLocalEdit();
    setBrandDna((prev) => ({
      ...prev,
      designTokens: { ...prev.designTokens, ...partial },
    }));
  }, [markLocalEdit]);

  const updateTrust = useCallback((partial: Partial<BrandTrustAndCheckout>) => {
    markLocalEdit();
    setBrandDna((prev) => ({
      ...prev,
      trust: { ...prev.trust, ...partial },
    }));
  }, [markLocalEdit]);

  const setFullBrandDna = useCallback((newDna: BrandDna) => {
    markLocalEdit();
    setBrandDna(newDna);
    saveBrandDna(newDna, db, tenantId).then((res) => {
      if (res.success) {
        eventBus.publish('brand:updated', {
          brandDna: newDna,
          updatedAt: new Date().toISOString(),
        });
      }
    }).catch((err) => {
      console.warn('[BrandDNA] Immediate save in setFullBrandDna failed:', err);
    });
  }, [db, tenantId, markLocalEdit]);

  const setLogoUrl = useCallback(async (url: string): Promise<boolean> => {
    markLocalEdit();
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
        ...brandDnaRef.current,
        identity: { ...brandDnaRef.current.identity, logoUrl: url },
      },
      updatedAt: new Date().toISOString(),
    });
    return true;
  }, [db, tenantId, markLocalEdit]);

  const addVibeImage = useCallback(async (url: string): Promise<boolean> => {
    markLocalEdit();
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
  }, [markLocalEdit]);

  const removeVibeImage = useCallback(async (url: string): Promise<boolean> => {
    markLocalEdit();
    setBrandDna((prev) => ({
      ...prev,
      identity: {
        ...prev.identity,
        vibeImages: (prev.identity.vibeImages || []).filter((img) => img !== url),
      },
    }));
    return true;
  }, [markLocalEdit]);

  const saveNow = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    const res = await saveBrandDna(brandDnaRef.current, db, tenantId);
    setIsSaving(false);
    if (res.success) {
      eventBus.publish('brand:updated', {
        brandDna: brandDnaRef.current,
        updatedAt: new Date().toISOString(),
      });
    }
    return res.success;
  }, [db, tenantId]);

  const resetToDefaults = useCallback(async () => {
    if (window.confirm('האם לאפס את נתוני ה-DNA להגדרות ברירת המחדל?')) {
      markLocalEdit();
      setBrandDna(DEFAULT_BRAND_DNA);
      await saveBrandDna(DEFAULT_BRAND_DNA, db, tenantId);
      eventBus.publish('brand:updated', {
        brandDna: DEFAULT_BRAND_DNA,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [db, tenantId, markLocalEdit]);

  // Register brand-dna and community-brand capabilities to host context (uses stable brandDnaRef to avoid keystroke re-registration)
  useEffect(() => {
    const contract: BrandDnaContract = {
      getBrandDna: () => brandDnaRef.current,
      getSystemPrompt: (moduleRole?: string) => buildBrandSystemContext(brandDnaRef.current, moduleRole),
      getDesignTokens: () => brandDnaRef.current.designTokens,
      updateBrandDna: async (partial: Partial<BrandDna>) => {
        markLocalEdit();
        setBrandDna((prev) => ({ ...prev, ...partial }));
        return true;
      },
      setLogoUrl,
      addVibeImage,
      removeVibeImage,
      registerServicePageSlug: async (serviceName: string, slug: string): Promise<boolean> => {
        markLocalEdit();
        setBrandDna((prev) => {
          const updatedSlugs = { ...(prev.serviceSlugs || {}), [serviceName]: slug };
          const updated = { ...prev, serviceSlugs: updatedSlugs };
          saveBrandDna(updated, db, tenantId).catch(console.warn);
          return updated;
        });
        eventBus.publish('brand:service_slug_updated', { serviceName, slug });
        return true;
      },
      getServicePageSlugs: () => brandDnaRef.current.serviceSlugs || {},
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
  }, [db, tenantId, registerCapability, unregisterCapability, setLogoUrl, addVibeImage, removeVibeImage, markLocalEdit]);
  const { completenessScore, missingRecommendations } = useMemo(() => {
    let score = 0;
    const recommendations: string[] = [];

    // Identity (30%)
    if (brandDna?.identity?.companyName?.trim()) score += 8;
    else recommendations.push('הגדר שם חברה או ארגון');

    if (brandDna?.identity?.slogan?.trim()) score += 7;
    else recommendations.push('הוסף סלוגן קליט');

    if (brandDna?.identity?.companyVision?.trim()) score += 8;
    else recommendations.push('נסח חזון מפורט');

    if (brandDna?.identity?.logoUrl) score += 7;
    else recommendations.push('העלה לוגו של המותג');

    // Voice & Tone (25%)
    if ((brandDna?.voice?.powerWords?.length || 0) >= 3) score += 10;
    else recommendations.push('הוסף לפחות 3 מילות כוח שיווקיות');

    if ((brandDna?.voice?.forbiddenWords?.length || 0) >= 1) score += 8;
    else recommendations.push('הגדר מילים אסורות לשימוש (Guardrails)');

    if (brandDna?.voice?.genderAddressing && ((brandDna?.voice?.powerWords?.length || 0) > 0 || (brandDna?.voice?.forbiddenWords?.length || 0) > 0)) score += 7;

    // Audience & UVP (25%)
    if (brandDna?.audience?.mainUvp?.trim()) score += 10;
    else recommendations.push('הגדר הצעת ערך ייחודית (UVP)');

    if ((brandDna?.audience?.personas?.length || 0) >= 1) score += 8;
    else recommendations.push('צור לפחות פרסונת לקוח אחת');

    if ((brandDna?.audience?.commonObjections?.length || 0) >= 1) score += 7;
    else recommendations.push('הזן מענה לחשש או התנגדות נפוצה');

    // Trust & Legal (20%)
    if (brandDna?.trust?.legalEntityId?.trim()) score += 5;
    if (brandDna?.trust?.contactPhone?.trim()) score += 5;
    if (brandDna?.trust?.refundPolicySummary?.trim()) score += 5;
    if (brandDna?.trust?.securityBadgeText?.trim()) score += 5;

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
