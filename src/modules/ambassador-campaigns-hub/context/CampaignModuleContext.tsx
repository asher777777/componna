/**
 * React Context Provider for Ambassador Campaigns Hub
 * Manages campaign state, ambassador registration, donation workflows, and multi-tenant scoping.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import {
  Campaign,
  Ambassador,
  Donation,
  DonationTier,
  CreateAmbassadorPayload,
  RecordPendingDonationPayload,
  CompleteDonationPayload,
} from '../types';
import {
  fetchCampaignRecord,
  fetchAmbassadorsRecord,
  fetchDonationsRecord,
  createAmbassadorRecord,
  recordPendingDonationRecord,
  completeDonationRecord,
  MOCK_CAMPAIGN,
  MOCK_AMBASSADORS,
  MOCK_DONATIONS,
} from '../services/campaignFirestoreService';
import { DEFAULT_COLLECTIONS } from '../config';
import { useTenantScope } from '../../../core/tenant';

export interface CampaignModuleContextValue {
  db: Firestore | null;
  loading: boolean;
  campaign: Campaign | null;
  ambassadors: Ambassador[];
  donations: Donation[];
  activeAmbassadorId: string | null;
  setActiveAmbassadorId: (id: string | null) => void;
  activeAmbassador: Ambassador | null;
  
  // Modals & Drawers state
  isAmbassadorModalOpen: boolean;
  setIsAmbassadorModalOpen: (open: boolean) => void;
  isDonationDrawerOpen: boolean;
  setIsDonationDrawerOpen: (open: boolean) => void;
  selectedTierForDonation: DonationTier | null;
  setSelectedTierForDonation: (tier: DonationTier | null) => void;
  
  // Actions
  createAmbassador: (payload: CreateAmbassadorPayload) => Promise<{ success: boolean; ambassador?: Ambassador; error?: string }>;
  recordPendingDonation: (payload: RecordPendingDonationPayload) => Promise<{ success: boolean; donationId: string }>;
  completeDonation: (payload: CompleteDonationPayload) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  updateCampaignSettings: (updated: Partial<Campaign>) => void;
}

const CampaignModuleContext = createContext<CampaignModuleContextValue | null>(null);

export interface CampaignModuleProviderProps {
  children: React.ReactNode;
  firebaseApp?: FirebaseApp | null;
  campaignId?: string;
  customCollections?: Record<string, string>;
}

export const CampaignModuleProvider: React.FC<CampaignModuleProviderProps> = ({
  children,
  firebaseApp,
  campaignId = 'campaign-golden-2026',
  customCollections,
}) => {
  // Access multi-tenant scope if provided by host shell
  let tenantScope: any = null;
  try {
    tenantScope = useTenantScope();
  } catch (e) {
    // Standalone fallback
    tenantScope = null;
  }

  const db = useMemo(() => {
    if (firebaseApp) {
      try {
        return getFirestore(firebaseApp);
      } catch (err) {
        console.warn('[CampaignContext] Could not initialize Firestore:', err);
      }
    }
    return null;
  }, [firebaseApp]);

  // Compute collection paths
  const collections = useMemo(() => {
    if (tenantScope && tenantScope.getScopedCollectionPath) {
      return {
        CAMPAIGNS: tenantScope.getScopedCollectionPath(DEFAULT_COLLECTIONS.CAMPAIGNS),
        AMBASSADORS: tenantScope.getScopedCollectionPath(DEFAULT_COLLECTIONS.AMBASSADORS),
        DONATIONS: tenantScope.getScopedCollectionPath(DEFAULT_COLLECTIONS.DONATIONS),
        GROUPS: tenantScope.getScopedCollectionPath(DEFAULT_COLLECTIONS.GROUPS),
        CONTACTS: tenantScope.getScopedCollectionPath(DEFAULT_COLLECTIONS.CONTACTS),
      };
    }
    return {
      CAMPAIGNS: customCollections?.CAMPAIGNS || DEFAULT_COLLECTIONS.CAMPAIGNS,
      AMBASSADORS: customCollections?.AMBASSADORS || DEFAULT_COLLECTIONS.AMBASSADORS,
      DONATIONS: customCollections?.DONATIONS || DEFAULT_COLLECTIONS.DONATIONS,
      GROUPS: customCollections?.GROUPS || DEFAULT_COLLECTIONS.GROUPS,
      CONTACTS: customCollections?.CONTACTS || DEFAULT_COLLECTIONS.CONTACTS,
    };
  }, [tenantScope, customCollections]);

  const [loading, setLoading] = useState<boolean>(true);
  const [campaign, setCampaign] = useState<Campaign | null>(MOCK_CAMPAIGN);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>(MOCK_AMBASSADORS);
  const [donations, setDonations] = useState<Donation[]>(MOCK_DONATIONS);
  const [activeAmbassadorId, setActiveAmbassadorId] = useState<string | null>(null);

  // Modals & Drawers state
  const [isAmbassadorModalOpen, setIsAmbassadorModalOpen] = useState(false);
  const [isDonationDrawerOpen, setIsDonationDrawerOpen] = useState(false);
  const [selectedTierForDonation, setSelectedTierForDonation] = useState<DonationTier | null>(null);

  const activeAmbassador = useMemo(() => {
    if (!activeAmbassadorId) return null;
    return ambassadors.find((a) => a.id === activeAmbassadorId || a.slug === activeAmbassadorId) || null;
  }, [ambassadors, activeAmbassadorId]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const camp = await fetchCampaignRecord(db, collections.CAMPAIGNS, campaignId);
      const ambs = await fetchAmbassadorsRecord(db, collections.AMBASSADORS, campaignId);
      const dons = await fetchDonationsRecord(db, collections.DONATIONS, campaignId);
      if (camp) setCampaign(camp);
      setAmbassadors(ambs);
      setDonations(dons);
    } catch (err) {
      console.error('[CampaignContext] refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [db, collections, campaignId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCreateAmbassador = async (payload: CreateAmbassadorPayload) => {
    const res = await createAmbassadorRecord(
      db,
      collections.AMBASSADORS,
      collections.GROUPS,
      collections.CONTACTS,
      payload
    );
    if (res.success && res.ambassador) {
      setAmbassadors((prev) => [res.ambassador!, ...prev]);
    }
    return res;
  };

  const handleRecordPendingDonation = async (payload: RecordPendingDonationPayload) => {
    return await recordPendingDonationRecord(db, collections.DONATIONS, payload);
  };

  const handleCompleteDonation = async (payload: CompleteDonationPayload) => {
    const res = await completeDonationRecord(
      db,
      collections.CAMPAIGNS,
      collections.AMBASSADORS,
      collections.DONATIONS,
      payload
    );
    if (res.success) {
      // Local state update for smooth optimistic UI
      setCampaign((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalRaised: prev.totalRaised + Number(payload.amount),
          donorCount: prev.donorCount + 1,
        };
      });

      if (payload.ambassadorId) {
        setAmbassadors((prev) =>
          prev.map((a) =>
            a.id === payload.ambassadorId
              ? { ...a, totalRaised: a.totalRaised + Number(payload.amount), donorCount: a.donorCount + 1 }
              : a
          )
        );
      }

      setDonations((prev) => [
        {
          id: payload.donationId,
          campaignId: payload.campaignId,
          donorName: payload.donorName || 'תורם',
          amount: Number(payload.amount),
          monthlyAmount: payload.monthlyAmount || null,
          recurringMonths: payload.recurringMonths || null,
          isRecurring: Boolean(payload.isRecurring),
          isAnonymous: Boolean(payload.isAnonymous),
          dedication: payload.dedication || '',
          ambassadorId: payload.ambassadorId || null,
          ambassadorName: payload.ambassadorName || null,
          paymentStatus: 'completed',
          paymentMethod: payload.paymentMethod || 'credit_card',
          transactionId: payload.transactionId || `TXN-${Date.now()}`,
          receiptUrl: payload.receiptUrl || '',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    return res;
  };

  const updateCampaignSettings = (updated: Partial<Campaign>) => {
    setCampaign((prev) => {
      if (!prev) return null;
      return { ...prev, ...updated, updatedAt: new Date().toISOString() };
    });
  };

  const value = useMemo<CampaignModuleContextValue>(
    () => ({
      db,
      loading,
      campaign,
      ambassadors,
      donations,
      activeAmbassadorId,
      setActiveAmbassadorId,
      activeAmbassador,
      isAmbassadorModalOpen,
      setIsAmbassadorModalOpen,
      isDonationDrawerOpen,
      setIsDonationDrawerOpen,
      selectedTierForDonation,
      setSelectedTierForDonation,
      createAmbassador: handleCreateAmbassador,
      recordPendingDonation: handleRecordPendingDonation,
      completeDonation: handleCompleteDonation,
      refreshData,
      updateCampaignSettings,
    }),
    [
      db,
      loading,
      campaign,
      ambassadors,
      donations,
      activeAmbassadorId,
      activeAmbassador,
      isAmbassadorModalOpen,
      isDonationDrawerOpen,
      selectedTierForDonation,
      refreshData,
    ]
  );

  return (
    <CampaignModuleContext.Provider value={value}>
      {children}
    </CampaignModuleContext.Provider>
  );
};

export const useCampaignModule = (): CampaignModuleContextValue => {
  const context = useContext(CampaignModuleContext);
  if (!context) {
    throw new Error('useCampaignModule must be used within a CampaignModuleProvider');
  }
  return context;
};
