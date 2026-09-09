import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CampaignConfig, FlowNodeState, SessionTelemetryEvent } from '../types';
import { useFlowPlayerModule } from './ModuleContext';
import { FirestoreService } from '../services/firestoreService';

export interface PlayerMachineContextValue {
  campaign: CampaignConfig;
  currentNodeId: string;
  currentNode: FlowNodeState | null;
  history: string[];
  sessionId: string;
  isPlaying: boolean;
  isMuted: boolean;
  isVoiceListening: boolean;
  isProcessingIntent: boolean;
  playerMode: 'edit' | 'live';
  activeVideoSlot: 0 | 1;
  videoUrls: [string, string];
  events: SessionTelemetryEvent[];
  lastIntentResult: { intent: string; confidence?: number; rawText?: string } | null;
  transitionTo: (targetNodeId: string, triggerType?: SessionTelemetryEvent['type'], details?: Record<string, any>) => void;
  jumpToNode: (targetNodeId: string) => void;
  setPlayerMode: (mode: 'edit' | 'live') => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setIsVoiceListening: (isListening: boolean) => void;
  setIsProcessingIntent: (isProcessing: boolean) => void;
  setLastIntentResult: (result: { intent: string; confidence?: number; rawText?: string } | null) => void;
  logEvent: (eventData: Omit<SessionTelemetryEvent, 'timestamp'>) => void;
  resetSession: () => void;
  updateCampaign: (newCampaign: CampaignConfig, targetNodeId?: string) => void;
}

const PlayerMachineContext = createContext<PlayerMachineContextValue | null>(null);

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const PlayerMachineProvider: React.FC<{
  initialCampaign: CampaignConfig;
  children: React.ReactNode;
}> = ({ initialCampaign, children }) => {
  const { db, collections, config } = useFlowPlayerModule();

  const [campaign, setCampaign] = useState<CampaignConfig>(initialCampaign);
  const campaignRef = useRef<CampaignConfig>(initialCampaign);
  campaignRef.current = campaign;

  // Sync state when new initialCampaign is passed from Firestore
  useEffect(() => {
    if (initialCampaign && initialCampaign !== campaignRef.current) {
      campaignRef.current = initialCampaign;
      setCampaign(initialCampaign);
      const initialId = initialCampaign.initialNodeId || Object.keys(initialCampaign.states)[0] || 'node_intro';
      setCurrentNodeId(initialId);
      const getSafeUrl = (node?: FlowNodeState | null) => {
        if (!node) return '';
        return node.videoUrl || node.fallbackVideoUrl || '';
      };

      const initialUrl = getSafeUrl(initialCampaign.states[initialId]);
      setVideoUrls([initialUrl, initialUrl]);
    }
  }, [initialCampaign]);

  const [sessionId, setSessionId] = useState<string>(generateSessionId);
  const [currentNodeId, setCurrentNodeId] = useState<string>(
    initialCampaign.initialNodeId || Object.keys(initialCampaign.states)[0] || 'node_intro'
  );
  const [history, setHistory] = useState<string[]>([currentNodeId]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [isProcessingIntent, setIsProcessingIntent] = useState<boolean>(false);
  const [lastIntentResult, setLastIntentResult] = useState<{ intent: string; confidence?: number; rawText?: string } | null>(null);
  const [events, setEvents] = useState<SessionTelemetryEvent[]>([]);

  // Dual video slot tracking
  const getInitialNodeUrl = () => {
    const node = initialCampaign.states[currentNodeId];
    if (!node) return '';
    return node.videoUrl || node.fallbackVideoUrl || '';
  };

  const [activeVideoSlot, setActiveVideoSlot] = useState<0 | 1>(0);
  const [videoUrls, setVideoUrls] = useState<[string, string]>([
    getInitialNodeUrl(),
    getInitialNodeUrl(),
  ]);

  const currentNode = campaign.states[currentNodeId] || null;
  const isInitialMount = useRef(true);

  // Helper to log telemetry
  const logEvent = useCallback(
    (eventData: Omit<SessionTelemetryEvent, 'timestamp'>) => {
      const fullEvent: SessionTelemetryEvent = {
        ...eventData,
        timestamp: Date.now(),
      };

      setEvents((prev) => [...prev, fullEvent]);

      if (config.onEvent) {
        config.onEvent(fullEvent);
      }

      if (db) {
        FirestoreService.recordSessionEvent(db, collections, sessionId, campaignRef.current.id, fullEvent).catch((err: any) => {
          console.warn('[PlayerMachine] Firestore telemetry write notice:', err);
        });
      }
    },
    [db, collections, sessionId, config]
  );

  // Transition handler with always-fresh campaign ref
  const transitionTo = useCallback(
    (targetNodeId: string, triggerType: SessionTelemetryEvent['type'] = 'node_transition', details?: Record<string, any>) => {
      const currentCamp = campaignRef.current;
      const targetNode = currentCamp.states[targetNodeId];

      if (!targetNode) {
        console.warn(`[PlayerMachine] Target node "${targetNodeId}" not found in campaign states.`);
        return;
      }

      const prevNodeId = currentNodeId;
      const nextSlot = activeVideoSlot === 0 ? 1 : 0;
      const safeTargetUrl = targetNode.videoUrl || targetNode.fallbackVideoUrl || '';

      setVideoUrls((prev) => {
        const updated: [string, string] = [...prev];
        updated[nextSlot] = safeTargetUrl;
        return updated;
      });
      setActiveVideoSlot(nextSlot);

      setCurrentNodeId(targetNodeId);
      setHistory((prev) => [...prev, targetNodeId]);
      setIsPlaying(true);

      logEvent({
        type: triggerType,
        from: prevNodeId,
        to: targetNodeId,
        details,
      });

      if (config.onStateChange) {
        config.onStateChange(targetNode);
      }
    },
    [currentNodeId, activeVideoSlot, logEvent, config]
  );

  // Initialize session log
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      logEvent({
        type: 'session_start',
        to: currentNodeId,
        details: { campaignId: campaign.id, presenterId: campaign.presenterId },
      });
    }
  }, [campaign.id, campaign.presenterId, currentNodeId, logEvent]);

  // Handle auto-transitions
  useEffect(() => {
    if (!currentNode?.autoTransitionTarget || !currentNode.autoTransitionDelaySec) {
      return;
    }

    const timer = setTimeout(() => {
      transitionTo(currentNode.autoTransitionTarget!, 'node_transition', { reason: 'auto_delay' });
    }, currentNode.autoTransitionDelaySec * 1000);

    return () => clearTimeout(timer);
  }, [currentNode, transitionTo]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    logEvent({
      type: 'video_play',
      details: { isPlaying: !isPlaying, nodeId: currentNodeId },
    });
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const resetSession = () => {
    const newSessId = generateSessionId();
    setSessionId(newSessId);
    const initialId = campaign.initialNodeId || Object.keys(campaign.states)[0] || 'node_intro';
    setCurrentNodeId(initialId);
    setHistory([initialId]);
    setEvents([]);
    setLastIntentResult(null);
    setActiveVideoSlot(0);
    const initialUrl = campaign.states[initialId]?.videoUrl || '';
    setVideoUrls([initialUrl, initialUrl]);
    setIsPlaying(true);

    logEvent({
      type: 'session_start',
      to: initialId,
      details: { campaignId: campaign.id, isReset: true },
    });
  };

  const updateCampaign = (newCampaign: CampaignConfig, targetNodeId?: string) => {
    campaignRef.current = newCampaign;
    setCampaign({ ...newCampaign });

    const targetId =
      targetNodeId ||
      (newCampaign.states[currentNodeId]
        ? currentNodeId
        : newCampaign.initialNodeId || Object.keys(newCampaign.states)[0] || 'node_intro');

    setCurrentNodeId(targetId);
    setHistory((prev) => [...prev, targetId]);

    const targetUrl = newCampaign.states[targetId]?.videoUrl || '';
    const nextSlot = activeVideoSlot === 0 ? 1 : 0;
    setVideoUrls((prev) => {
      const updated: [string, string] = [...prev];
      updated[nextSlot] = targetUrl;
      return updated;
    });
    setActiveVideoSlot(nextSlot);
    setIsPlaying(true);
  };

  const [playerMode, setPlayerMode] = useState<'edit' | 'live'>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('mode') === 'live' || searchParams.get('live') === 'true') {
        return 'live';
      }
    }
    return 'edit';
  });

  // Jump directly to node (used by Edit Mode Pagination Stepper)
  const jumpToNode = useCallback(
    (targetNodeId: string) => {
      const currentCamp = campaignRef.current;
      const targetNode = currentCamp.states[targetNodeId];
      if (!targetNode) return;

      const prevNodeId = currentNodeId;
      const nextSlot = activeVideoSlot === 0 ? 1 : 0;

      setVideoUrls((prev) => {
        const updated: [string, string] = [...prev];
        updated[nextSlot] = targetNode.videoUrl || '';
        return updated;
      });
      setActiveVideoSlot(nextSlot);
      setCurrentNodeId(targetNodeId);
      setIsPlaying(true);

      logEvent({
        type: 'node_transition',
        from: prevNodeId,
        to: targetNodeId,
        details: { trigger: 'stepper_edit_jump' },
      });

      if (config.onStateChange) {
        config.onStateChange(targetNode);
      }
    },
    [currentNodeId, activeVideoSlot, logEvent, config]
  );

  const value: PlayerMachineContextValue = {
    campaign,
    currentNodeId,
    currentNode,
    history,
    sessionId,
    isPlaying,
    isMuted,
    isVoiceListening,
    isProcessingIntent,
    playerMode,
    activeVideoSlot,
    videoUrls,
    events,
    lastIntentResult,
    transitionTo,
    jumpToNode,
    setPlayerMode,
    togglePlay,
    toggleMute,
    setIsVoiceListening,
    setIsProcessingIntent,
    setLastIntentResult,
    logEvent,
    resetSession,
    updateCampaign,
  };

  return <PlayerMachineContext.Provider value={value}>{children}</PlayerMachineContext.Provider>;
};

export function usePlayerMachine(): PlayerMachineContextValue {
  const context = useContext(PlayerMachineContext);
  if (!context) {
    throw new Error('usePlayerMachine must be used within a PlayerMachineProvider');
  }
  return context;
}