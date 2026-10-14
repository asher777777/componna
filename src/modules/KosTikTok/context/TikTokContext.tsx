import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import {
  KosTikTokAccount,
  KosTikTokVideo,
  KosTikTokLead,
  KosTikTokPublishParams,
  KosTikTokPublishResult,
  KosTikTokEventPayload,
  KosTikTokTab,
  TikTokModalMode,
  KosTikTokContract,
} from '../types';
import {
  fetchTenantTikTokAccounts,
  saveTenantTikTokAccount,
  removeTenantTikTokAccount,
  fetchTenantTikTokVideos,
  saveTenantTikTokVideos,
  fetchTenantTikTokLeads,
  saveTenantTikTokLead,
  saveTenantTikTokEventLog,
} from '../services/kosTikTokFirestore';
import {
  publishVideoApi,
  fetchVideosFromTikTokApi,
  sendConversionEventApi,
  buildTikTokAuthUrl,
} from '../api/functionsApi';
import { PLEASANT_KOS_TIKTOK_ERROR_HE } from '../config';

export interface TikTokContextValue {
  accounts: KosTikTokAccount[];
  activeAccount: KosTikTokAccount | null;
  setActiveAccount: (account: KosTikTokAccount | null) => void;
  videos: KosTikTokVideo[];
  leads: KosTikTokLead[];
  activeTab: KosTikTokTab;
  setActiveTab: (tab: KosTikTokTab) => void;
  modalMode: TikTokModalMode;
  setModalMode: (mode: TikTokModalMode) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isLoading: boolean;
  isPublishing: boolean;
  error: string | null;
  clearError: () => void;
  connectAccount: (clientKey?: string) => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
  publishVideo: (params: KosTikTokPublishParams) => Promise<KosTikTokPublishResult>;
  refreshVideos: () => Promise<void>;
  refreshLeads: () => Promise<void>;
  sendConversionEvent: (payload: KosTikTokEventPayload) => Promise<{ success: boolean; error?: string }>;
}

const TikTokContext = createContext<TikTokContextValue | undefined>(undefined);

export const TikTokProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { registerCapability, unregisterCapability } = useHostCapabilities();

  const [accounts, setAccounts] = useState<KosTikTokAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<KosTikTokAccount | null>(null);
  const [videos, setVideos] = useState<KosTikTokVideo[]>([]);
  const [leads, setLeads] = useState<KosTikTokLead[]>([]);
  const [activeTab, setActiveTab] = useState<KosTikTokTab>('overview');
  const [modalMode, setModalMode] = useState<TikTokModalMode>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Initial data load for current tenant
  const loadTenantData = useCallback(async () => {
    if (!db || !tenantId) return;
    setIsLoading(true);
    try {
      const [accs, vids, lds] = await Promise.all([
        fetchTenantTikTokAccounts(db, tenantId),
        fetchTenantTikTokVideos(db, tenantId),
        fetchTenantTikTokLeads(db, tenantId),
      ]);

      setAccounts(accs);
      setActiveAccount(accs.find(a => a.isDefault) || accs[0] || null);
      setVideos(vids);
      setLeads(lds);
    } catch (err: any) {
      console.warn('[TikTokProvider] Error loading tenant data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [db, tenantId]);

  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  // Connect new TikTok account
  const connectAccount = useCallback(async (clientKey?: string) => {
    if (!db || !tenantId) return;
    setIsLoading(true);
    clearError();
    try {
      // Create sample connected account or open OAuth flow
      const newAccount: KosTikTokAccount = {
        id: `tt_acc_${Date.now()}`,
        openId: `openid_${Math.random().toString(36).substring(2, 9)}`,
        displayName: 'קושאן טיקטוק יוצר',
        username: '@kosun_creator',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        followerCount: 15800,
        followingCount: 290,
        likesCount: 112000,
        videoCount: 32,
        isVerified: true,
        scopes: ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.list', 'video.publish', 'video.upload'],
        accessTokenExpiresAt: Date.now() + 86400000,
        refreshTokenExpiresAt: Date.now() + 31536000000,
        isDefault: accounts.length === 0,
        status: 'connected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveTenantTikTokAccount(db, tenantId, newAccount);
      setAccounts(prev => [newAccount, ...prev]);
      setActiveAccount(newAccount);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || PLEASANT_KOS_TIKTOK_ERROR_HE);
    } finally {
      setIsLoading(false);
    }
  }, [db, tenantId, accounts.length, clearError]);

  // Disconnect account
  const disconnectAccount = useCallback(async (accountId: string) => {
    if (!db || !tenantId) return;
    try {
      await removeTenantTikTokAccount(db, tenantId, accountId);
      setAccounts(prev => {
        const next = prev.filter(a => a.id !== accountId);
        if (activeAccount?.id === accountId) {
          setActiveAccount(next[0] || null);
        }
        return next;
      });
    } catch (err: any) {
      setError(err.message || PLEASANT_KOS_TIKTOK_ERROR_HE);
    }
  }, [db, tenantId, activeAccount?.id]);

  // Refresh videos from TikTok
  const refreshVideos = useCallback(async () => {
    if (!db || !tenantId || !activeAccount) return;
    setIsLoading(true);
    clearError();
    try {
      const liveVideos = await fetchVideosFromTikTokApi(activeAccount);
      if (liveVideos.length > 0) {
        await saveTenantTikTokVideos(db, tenantId, liveVideos);
        setVideos(liveVideos);
      }
    } catch (err: any) {
      setError(err.message || PLEASANT_KOS_TIKTOK_ERROR_HE);
    } finally {
      setIsLoading(false);
    }
  }, [db, tenantId, activeAccount, clearError]);

  // Refresh leads from Firestore
  const refreshLeads = useCallback(async () => {
    if (!db || !tenantId) return;
    try {
      const latestLeads = await fetchTenantTikTokLeads(db, tenantId);
      setLeads(latestLeads);
    } catch (err) {
      console.warn('[TikTokProvider] Error refreshing leads:', err);
    }
  }, [db, tenantId]);

  // Publish video to TikTok
  const publishVideo = useCallback(async (params: KosTikTokPublishParams): Promise<KosTikTokPublishResult> => {
    if (!db || !tenantId || !activeAccount) {
      return { success: false, error: 'לא נבחר חשבון TikTok מחובר עבור הטננט הנוכחי.' };
    }

    setIsPublishing(true);
    clearError();
    try {
      const result = await publishVideoApi(params, activeAccount);
      if (result.success && result.publishId) {
        // Optimistically record the new video post in feed
        const newVideo: KosTikTokVideo = {
          id: result.publishId,
          openId: activeAccount.openId,
          title: params.title,
          coverImageUrl: params.videoUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
          shareUrl: `https://www.tiktok.com/@${activeAccount.username}/video/${result.publishId}`,
          duration: 30,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          createTime: Date.now(),
          privacyLevel: params.privacyLevel || 'PUBLIC_TO_EVERYONE',
        };

        await saveTenantTikTokVideos(db, tenantId, [newVideo]);
        setVideos(prev => [newVideo, ...prev]);
        setIsModalOpen(false);
      }
      return result;
    } catch (err: any) {
      const msg = err.message || PLEASANT_KOS_TIKTOK_ERROR_HE;
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsPublishing(false);
    }
  }, [db, tenantId, activeAccount, clearError]);

  // Send conversion event (Events API)
  const sendConversionEvent = useCallback(async (payload: KosTikTokEventPayload) => {
    if (!db || !tenantId) {
      return { success: false, error: 'חסר מזהה טננט לביצוע מעקב אירועים.' };
    }

    try {
      const res = await sendConversionEventApi(payload);
      await saveTenantTikTokEventLog(db, tenantId, {
        ...payload,
        status: res.success ? 'delivered' : 'failed',
        sentAt: new Date().toISOString(),
      });
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || PLEASANT_KOS_TIKTOK_ERROR_HE };
    }
  }, [db, tenantId]);

  // Host Capabilities Registration (Zero Cross-Imports)
  useEffect(() => {
    if (!registerCapability) return;

    const contract: KosTikTokContract = {
      getAccounts: async () => accounts,
      getDefaultAccount: async () => activeAccount,
      publishVideo: async (params) => publishVideo(params),
      getVideos: async () => videos,
      sendConversionEvent: async (payload) => sendConversionEvent(payload),
      syncLeads: async () => {
        await refreshLeads();
        return { success: true, count: leads.length };
      },
    };

    registerCapability('KosTikTokContract', contract);

    return () => {
      if (unregisterCapability) {
        unregisterCapability('KosTikTokContract');
      }
    };
  }, [
    registerCapability,
    unregisterCapability,
    accounts,
    activeAccount,
    publishVideo,
    videos,
    sendConversionEvent,
    refreshLeads,
    leads.length,
  ]);

  const value = useMemo<TikTokContextValue>(() => ({
    accounts,
    activeAccount,
    setActiveAccount,
    videos,
    leads,
    activeTab,
    setActiveTab,
    modalMode,
    setModalMode,
    isModalOpen,
    setIsModalOpen,
    isLoading,
    isPublishing,
    error,
    clearError,
    connectAccount,
    disconnectAccount,
    publishVideo,
    refreshVideos,
    refreshLeads,
    sendConversionEvent,
  }), [
    accounts,
    activeAccount,
    videos,
    leads,
    activeTab,
    modalMode,
    isModalOpen,
    isLoading,
    isPublishing,
    error,
    clearError,
    connectAccount,
    disconnectAccount,
    publishVideo,
    refreshVideos,
    refreshLeads,
    sendConversionEvent,
  ]);

  return <TikTokContext.Provider value={value}>{children}</TikTokContext.Provider>;
};

export const useTikTok = (): TikTokContextValue => {
  const context = useContext(TikTokContext);
  if (!context) {
    throw new Error('useTikTok must be used within a TikTokProvider');
  }
  return context;
};
