import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { BrandDna, DEFAULT_BRAND_DNA, BrandIdentity, BrandVoice, BrandAudience, BrandDesignTokens, BrandTrustAndCheckout } from '../types/brandDna';
import { loadBrandDna, saveBrandDna } from '../services/brandDnaFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { buildBrandSystemContext } from '../services/geminiBrandPrompt';

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
}

const BrandDnaContext = createContext<BrandDnaContextValue | undefined>(undefined);

export const BrandDnaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useSystemConnection();
  const [brandDna, setBrandDna] = useState<BrandDna>(DEFAULT_BRAND_DNA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load initially
  useEffect(() => {
    let mounted = true;
    async function init() {
      setIsLoading(true);
      const data = await loadBrandDna(db);
      if (mounted) {
        setBrandDna(data);
        setIsLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [db]);

  const updateIdentity = useCallback((partial: Partial<BrandIdentity>) => {
    setBrandDna((prev) => ({
      ...prev,
      identity: { ...prev.identity, ...partial },
    }));
  }, []);

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

  const saveNow = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    const res = await saveBrandDna(brandDna, db);
    setIsSaving(false);
    return res.success;
  }, [brandDna, db]);

  const resetToDefaults = useCallback(() => {
    if (window.confirm('האם לאפס את נתוני ה-DNA להגדרות ברירת המחדל?')) {
      setBrandDna(DEFAULT_BRAND_DNA);
      saveBrandDna(DEFAULT_BRAND_DNA, db);
    }
  }, [db]);

  // Brand Completeness Score & Missing Recommendations calculation
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
      }}
    >
      {children}
    </BrandDnaContext.Provider>
  );
};

export const useBrandDna = (): BrandDnaContextValue => {
  const context = useContext(BrandDnaContext);
  if (!context) {
    throw new Error('useBrandDna must be used within a BrandDnaProvider');
  }
  return context;
};
