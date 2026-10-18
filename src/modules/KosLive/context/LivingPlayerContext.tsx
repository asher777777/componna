import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { LivingCampaignContract, LivingSceneContract } from '../types';
import { DEFAULT_LIVING_CAMPAIGN } from '../config';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { LivingStorageService } from '../services/livingStorageService';
import { LeadDispatchService } from '../services/leadDispatchService';

export interface LivingTelemetryEvent {
  id: string;
  timestamp: string;
  type: 'scene_enter' | 'card_click' | 'voice_intent' | 'form_submit' | 'quick_reply';
  sceneId: string;
  detail: string;
}

interface LivingPlayerContextValue {
  campaign: LivingCampaignContract;
  currentSceneId: string;
  currentScene: LivingSceneContract | undefined;
  isPlaying: boolean;
  isMuted: boolean;
  isVoiceActive: boolean;
  isProcessingIntent: boolean;
  sessionId: string;
  history: string[];
  telemetryEvents: LivingTelemetryEvent[];
  togglePlay: () => void;
  toggleMute: () => void;
  setIsVoiceActive: (active: boolean) => void;
  setIsProcessingIntent: (processing: boolean) => void;
  transitionTo: (targetSceneId: string, trigger?: string) => void;
  resetSession: () => void;
  submitLead: (
    formData: Record<string, string>,
    options?: { smartFormId?: string; webhookUrl?: string }
  ) => Promise<void>;
  logTelemetry: (type: LivingTelemetryEvent['type'], detail: string) => void;
}

const LivingPlayerContext = createContext<LivingPlayerContextValue | null>(null);

export const LivingPlayerProvider: React.FC<{
  initialCampaign?: LivingCampaignContract;
  campaignIdOrSlug?: string;
  children: React.ReactNode;
}> = ({ initialCampaign, campaignIdOrSlug, children }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [campaign, setCampaign] = useState<LivingCampaignContract>(() => initialCampaign || DEFAULT_LIVING_CAMPAIGN);
  const [currentSceneId, setCurrentSceneId] = useState<string>(() => {
    return initialCampaign?.initialSceneId || Object.keys(initialCampaign?.scenes || {})[0] || 'scene_welcome';
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [isProcessingIntent, setIsProcessingIntent] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([currentSceneId]);
  const [telemetryEvents, setTelemetryEvents] = useState<LivingTelemetryEvent[]>([]);
  const [sessionId] = useState<string>(() => `live_sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);

  const logTelemetry = useCallback((type: LivingTelemetryEvent['type'], detail: string) => {
    setTelemetryEvents(prev => [
      {
        id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        timestamp: new Date().toLocaleTimeString('he-IL'),
        type,
        sceneId: currentSceneId,
        detail
      },
      ...prev.slice(0, 39)
    ]);
  }, [currentSceneId]);

  // Keep synced when initialCampaign prop updates from Studio Editor
  useEffect(() => {
    if (initialCampaign) {
      setCampaign(initialCampaign);
      const validCurrent = initialCampaign.scenes[currentSceneId];
      if (!validCurrent) {
        const firstId = initialCampaign.initialSceneId || Object.keys(initialCampaign.scenes)[0] || '';
        setCurrentSceneId(firstId);
        setHistory([firstId]);
      }
    }
  }, [initialCampaign]);

  // Load campaign if ID provided and differs from current
  useEffect(() => {
    if (campaignIdOrSlug && campaignIdOrSlug !== campaign.id && campaignIdOrSlug !== campaign.slug) {
      LivingStorageService.getCampaign(db as any, tenantId, campaignIdOrSlug).then(loaded => {
        if (loaded) {
          setCampaign(loaded);
          const initial = loaded.initialSceneId || Object.keys(loaded.scenes)[0];
          setCurrentSceneId(initial);
          setHistory([initial]);
        }
      });
    }
  }, [campaignIdOrSlug, db, tenantId]);

  const currentScene = useMemo(() => {
    return campaign.scenes[currentSceneId] || Object.values(campaign.scenes)[0];
  }, [campaign.scenes, currentSceneId]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const transitionTo = useCallback((targetSceneId: string, trigger: string = 'manual') => {
    if (campaign.scenes[targetSceneId]) {
      setCurrentSceneId(targetSceneId);
      setHistory(prev => [...prev, targetSceneId]);
      setIsPlaying(true);
      logTelemetry('scene_enter', `מעבר לסצנה "${campaign.scenes[targetSceneId]?.title || targetSceneId}" (${trigger})`);
    } else {
      console.warn(`[LivingPlayerContext] Target scene ${targetSceneId} not found in campaign.`);
    }
  }, [campaign.scenes, logTelemetry]);

  const resetSession = useCallback(() => {
    const initial = campaign.initialSceneId || Object.keys(campaign.scenes)[0];
    setCurrentSceneId(initial);
    setHistory([initial]);
    setIsPlaying(true);
    logTelemetry('scene_enter', 'אתחול סשן מחדש');
  }, [campaign, logTelemetry]);

  const submitLead = useCallback(async (
    formData: Record<string, string>,
    options?: { smartFormId?: string; webhookUrl?: string }
  ) => {
    logTelemetry('form_submit', `שליחת טופס לידים (${Object.keys(formData).length} שדות)`);
    await LeadDispatchService.dispatchLead(db as any, tenantId, formData, {
      campaignId: campaign.id,
      campaignName: campaign.name,
      sceneId: currentSceneId,
      sceneTitle: currentScene?.title,
      smartFormId: options?.smartFormId,
      webhookUrl: options?.webhookUrl
    });
  }, [db, tenantId, campaign, currentSceneId, currentScene, logTelemetry]);

  const value = useMemo(() => ({
    campaign,
    currentSceneId,
    currentScene,
    isPlaying,
    isMuted,
    isVoiceActive,
    isProcessingIntent,
    sessionId,
    history,
    telemetryEvents,
    togglePlay,
    toggleMute,
    setIsVoiceActive,
    setIsProcessingIntent,
    transitionTo,
    resetSession,
    submitLead,
    logTelemetry
  }), [
    campaign,
    currentSceneId,
    currentScene,
    isPlaying,
    isMuted,
    isVoiceActive,
    isProcessingIntent,
    sessionId,
    history,
    telemetryEvents,
    togglePlay,
    toggleMute,
    transitionTo,
    resetSession,
    submitLead,
    logTelemetry
  ]);

  return (
    <LivingPlayerContext.Provider value={value}>
      {children}
    </LivingPlayerContext.Provider>
  );
};

export const useLivingPlayer = () => {
  const ctx = useContext(LivingPlayerContext);
  if (!ctx) {
    throw new Error('useLivingPlayer must be used within a LivingPlayerProvider');
  }
  return ctx;
};
