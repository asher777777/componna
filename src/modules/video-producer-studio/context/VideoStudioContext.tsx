import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VideoProject, VideoScene, HeyGenAvatar, HeyGenVoice, ClarificationResult } from '../types';
import { fetchAllProjects, saveProject, deleteProject, syncRenderedVideoToMediaGallery } from '../services/videoProjectStore';
import { fetchHeyGenAvatars, fetchHeyGenVoices, generateHeyGenSceneVideo, pollHeyGenVideoStatus } from '../services/heygenService';
import { 
  generateStoryboardWithAI, 
  generateNextSceneWithAI, 
  generateClarificationQuestionsWithAI,
  ScriptGenerationParams 
} from '../services/scriptWizardService';
import { exportVideoProjectToFlowPlayer, convertVideoProjectToCampaign } from '../services/videoStudioFlowBridge';
import { CampaignConfig } from '../../flow-player-engine/types';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { TokenUsageReport } from '../../../core/ai';

export type StudioTab = 'wizard' | 'editor' | 'projects' | 'avatars';

interface VideoStudioContextValue {
  tab: StudioTab;
  setTab: (tab: StudioTab) => void;
  projects: VideoProject[];
  activeProject: VideoProject | null;
  activeSceneId: string | null;
  activeScene: VideoScene | null;
  setActiveProject: (p: VideoProject | null) => void;
  setActiveSceneId: (id: string | null) => void;
  generateClarificationQuestions: (params: ScriptGenerationParams) => Promise<ClarificationResult>;
  createProjectFromWizard: (params: ScriptGenerationParams) => Promise<TokenUsageReport>;
  createInteractiveFunnelFromWizard: (params: ScriptGenerationParams) => Promise<TokenUsageReport>;
  addNextSceneWithAI: (customInstruction?: string) => Promise<TokenUsageReport>;
  exportProjectToFlowPlayer: (projectToExport?: VideoProject) => Promise<CampaignConfig>;
  updateCurrentScene: (sceneId: string, updates: Partial<VideoScene>) => void;
  addScene: () => void;
  deleteScene: (sceneId: string) => void;
  saveCurrentProject: () => Promise<void>;
  deleteCurrentProject: (id: string) => Promise<void>;
  avatars: HeyGenAvatar[];
  voices: HeyGenVoice[];
  isGeneratingScript: boolean;
  isRenderingScene: boolean;
  renderingSceneId: string | null;
  renderHeyGenScene: (sceneId: string) => Promise<void>;
  lastCostReport: TokenUsageReport | null;
  
  // Modals
  isAvatarModalOpen: boolean;
  openAvatarModal: (sceneId: string) => void;
  closeAvatarModal: () => void;
  isTeleprompterOpen: boolean;
  openTeleprompter: (sceneId: string) => void;
  closeTeleprompter: () => void;
  modalTargetSceneId: string | null;
}

const VideoStudioContext = createContext<VideoStudioContextValue | null>(null);

export const VideoStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, apiKeys, openConnectorModal } = useSystemConnection();
  const [tab, setTab] = useState<StudioTab>('wizard');
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [activeProject, setActiveProject] = useState<VideoProject | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  const [avatars, setAvatars] = useState<HeyGenAvatar[]>([]);
  const [voices, setVoices] = useState<HeyGenVoice[]>([]);

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isRenderingScene, setIsRenderingScene] = useState(false);
  const [renderingSceneId, setRenderingSceneId] = useState<string | null>(null);
  const [lastCostReport, setLastCostReport] = useState<TokenUsageReport | null>(null);

  // Modals state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [modalTargetSceneId, setModalTargetSceneId] = useState<string | null>(null);

  // Load projects from DB
  const loadProjects = useCallback(async () => {
    const list = await fetchAllProjects(db);
    setProjects(list);
  }, [db]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load avatars and voices
  useEffect(() => {
    fetchHeyGenAvatars(apiKeys.heygenApiKey || '').then(setAvatars);
    fetchHeyGenVoices(apiKeys.heygenApiKey || '').then(setVoices);
  }, [apiKeys.heygenApiKey]);

  const activeScene = activeProject?.scenes.find(s => s.id === activeSceneId) || activeProject?.scenes[0] || null;

  const generateClarificationQuestions = async (params: ScriptGenerationParams): Promise<ClarificationResult> => {
    const geminiKey = apiKeys.googleAiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
    if (!geminiKey) {
      openConnectorModal();
      throw new Error('נא להגדיר תחילה מפתח Google Gemini API Key במרכז הסנכרון.');
    }

    setIsGeneratingScript(true);
    try {
      const res = await generateClarificationQuestionsWithAI(
        geminiKey,
        apiKeys.geminiModel || 'gemini-1.5-flash',
        params
      );
      setLastCostReport(res.costReport);
      return res.result;
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const createProjectFromWizard = async (params: ScriptGenerationParams): Promise<TokenUsageReport> => {
    const geminiKey = apiKeys.googleAiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
    if (!geminiKey) {
      openConnectorModal();
      throw new Error('נא להגדיר תחילה מפתח Google Gemini API Key במרכז הסנכרון.');
    }

    setIsGeneratingScript(true);
    try {
      const res = await generateStoryboardWithAI(geminiKey, apiKeys.geminiModel || 'gemini-1.5-flash', params);
      const isInteractive = params.productionType === 'landing_funnel' || params.outputPreference === 'full_production';
      const newProj: VideoProject = {
        id: `proj_${Date.now()}`,
        title: res.project.title || params.topic,
        description: res.project.description || '',
        aspectRatio: res.project.aspectRatio || params.aspectRatio || '16:9',
        targetAudience: params.targetAudience,
        marketingHook: params.marketingHook,
        productionType: params.productionType || 'landing_funnel',
        visualStyle: params.visualStyle || 'cinematic_dramatic',
        ttsLanguage: params.ttsLanguage || 'he-IL',
        outputPreference: params.outputPreference || 'full_production',
        referenceImageUrl: params.referenceImageBase64 ? '(attached_reference_image)' : undefined,
        referencePdfName: params.referencePdfName,
        documentUrl: params.documentUrl,
        clarificationAnswers: params.clarificationAnswers,
        projectOverview: res.project.projectOverview,
        conversationId: res.conversationId,
        conversationHistory: res.conversationHistory,
        isInteractiveCampaign: isInteractive,
        scenes: res.scenes,
        status: 'scripted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveProject(newProj, db);
      setActiveProject(newProj);
      setActiveSceneId(newProj.scenes[0]?.id || null);
      setLastCostReport(res.costReport);
      
      if (isInteractive) {
        // Auto-export initial campaign to Flow Player for instant interactive preview
        await exportVideoProjectToFlowPlayer(newProj, db).catch(e => console.warn('Auto-export notice:', e));
      }

      setTab('editor');
      await loadProjects();
      return res.costReport;
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const createInteractiveFunnelFromWizard = async (params: ScriptGenerationParams): Promise<TokenUsageReport> => {
    return createProjectFromWizard({
      ...params,
      productionType: params.productionType || 'landing_funnel'
    });
  };

  const exportProjectToFlowPlayer = async (projectToExport?: VideoProject): Promise<CampaignConfig> => {
    const target = projectToExport || activeProject;
    if (!target) {
      throw new Error('לא נבחר פרויקט לייצוא.');
    }
    const campaign = await exportVideoProjectToFlowPlayer(target, db);
    return campaign;
  };

  const updateCurrentScene = (sceneId: string, updates: Partial<VideoScene>) => {
    if (!activeProject) return;
    const updatedScenes = activeProject.scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, ...updates };
      }
      return s;
    });

    const updatedProject = { ...activeProject, scenes: updatedScenes, updatedAt: new Date().toISOString() };
    setActiveProject(updatedProject);
    saveProject(updatedProject, db);
  };

  const addScene = () => {
    if (!activeProject) return;
    const nextNum = activeProject.scenes.length + 1;
    const newScene: VideoScene = {
      id: `scene_${Date.now()}_${nextNum}`,
      sceneNumber: nextNum,
      title: `סצנה ${nextNum}`,
      dialogueScript: 'טקסט קריינות עבור הסצנה...',
      visualPrompt: 'Cinematic corporate studio with soft ambient lighting',
      durationSeconds: 5,
      avatarId: 'Wayne_20240711',
      avatarPose: 'half_body',
      voiceId: '077ab11b14f04ce0b49b5f67b5f59629',
      transition: 'fade',
      heygenStatus: 'pending'
    };

    const updated = {
      ...activeProject,
      scenes: [...activeProject.scenes, newScene],
      updatedAt: new Date().toISOString()
    };
    setActiveProject(updated);
    setActiveSceneId(newScene.id);
    saveProject(updated, db);
  };

  const deleteScene = (sceneId: string) => {
    if (!activeProject || activeProject.scenes.length <= 1) return;
    const filtered = activeProject.scenes.filter(s => s.id !== sceneId);
    const reindexed = filtered.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    const updated = { ...activeProject, scenes: reindexed, updatedAt: new Date().toISOString() };
    setActiveProject(updated);
    setActiveSceneId(reindexed[0]?.id || null);
    saveProject(updated, db);
  };

  const addNextSceneWithAI = async (customInstruction?: string): Promise<TokenUsageReport> => {
    if (!activeProject) {
      throw new Error('אין פרויקט פעיל.');
    }
    const geminiKey = apiKeys.googleAiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
    if (!geminiKey) {
      openConnectorModal();
      throw new Error('נא להגדיר תחילה מפתח Google Gemini API Key במרכז הסנכרון.');
    }

    setIsGeneratingScript(true);
    try {
      const res = await generateNextSceneWithAI(
        geminiKey,
        apiKeys.geminiModel || 'gemini-1.5-flash',
        activeProject,
        customInstruction
      );

      const updatedProject: VideoProject = {
        ...activeProject,
        scenes: [...activeProject.scenes, res.scene],
        conversationHistory: res.updatedHistory,
        updatedAt: new Date().toISOString()
      };

      await saveProject(updatedProject, db);
      setActiveProject(updatedProject);
      setActiveSceneId(res.scene.id);
      setLastCostReport(res.costReport);
      await loadProjects();
      return res.costReport;
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const saveCurrentProject = async () => {
    if (activeProject) {
      await saveProject(activeProject, db);
      await loadProjects();
    }
  };

  const deleteCurrentProject = async (id: string) => {
    await deleteProject(id, db);
    if (activeProject?.id === id) {
      setActiveProject(null);
      setActiveSceneId(null);
      setTab('projects');
    }
    await loadProjects();
  };

  const renderHeyGenScene = async (sceneId: string) => {
    if (!activeProject) return;
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const heygenKey = apiKeys.heygenApiKey;
    if (!heygenKey) {
      openConnectorModal();
      throw new Error('נא להגדיר מפתח HeyGen API Key ברכיב ה-DB Connector.');
    }

    setIsRenderingScene(true);
    setRenderingSceneId(sceneId);

    try {
      updateCurrentScene(sceneId, { heygenStatus: 'processing' });

      const videoJobId = await generateHeyGenSceneVideo(heygenKey, {
        avatarId: scene.avatarId || 'Wayne_20240711',
        scriptText: scene.dialogueScript,
        voiceId: scene.voiceId,
        aspectRatio: activeProject.aspectRatio,
        backgroundMediaUrl: scene.backgroundMediaUrl
      });

      updateCurrentScene(sceneId, { heygenJobId: videoJobId });

      // Poll until video is completed
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      const interval = setInterval(async () => {
        attempts++;
        try {
          const statusResult = await pollHeyGenVideoStatus(heygenKey, videoJobId);
          if (statusResult.status === 'completed' && statusResult.video_url) {
            clearInterval(interval);
            updateCurrentScene(sceneId, {
              heygenStatus: 'completed',
              renderedVideoUrl: statusResult.video_url
            });

            // Automatically sync rendered video into Media Gallery Hub!
            await syncRenderedVideoToMediaGallery(db, {
              videoUrl: statusResult.video_url,
              title: `${activeProject.title} - ${scene.title}`,
              projectId: activeProject.id,
              sceneId: scene.id,
              aspectRatio: activeProject.aspectRatio,
              avatarName: scene.avatarId
            });

            setIsRenderingScene(false);
            setRenderingSceneId(null);
          } else if (statusResult.status === 'failed' || attempts >= maxAttempts) {
            clearInterval(interval);
            updateCurrentScene(sceneId, {
              heygenStatus: 'failed'
            });
            setIsRenderingScene(false);
            setRenderingSceneId(null);
          }
        } catch (pollErr) {
          console.warn('[HeyGen Poll] error:', pollErr);
        }
      }, 5000);

    } catch (err: any) {
      updateCurrentScene(sceneId, { heygenStatus: 'failed' });
      setIsRenderingScene(false);
      setRenderingSceneId(null);
      throw err;
    }
  };

  const openAvatarModal = (sceneId: string) => {
    setModalTargetSceneId(sceneId);
    setIsAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setModalTargetSceneId(null);
  };

  const openTeleprompter = (sceneId: string) => {
    setModalTargetSceneId(sceneId);
    setIsTeleprompterOpen(true);
  };

  const closeTeleprompter = () => {
    setIsTeleprompterOpen(false);
    setModalTargetSceneId(null);
  };

  return (
    <VideoStudioContext.Provider
      value={{
        tab,
        setTab,
        projects,
        activeProject,
        activeSceneId,
        activeScene,
        setActiveProject,
        setActiveSceneId,
        generateClarificationQuestions,
        createProjectFromWizard,
        createInteractiveFunnelFromWizard,
        addNextSceneWithAI,
        exportProjectToFlowPlayer,
        updateCurrentScene,
        addScene,
        deleteScene,
        saveCurrentProject,
        deleteCurrentProject,
        avatars,
        voices,
        isGeneratingScript,
        isRenderingScene,
        renderingSceneId,
        renderHeyGenScene,
        lastCostReport,
        isAvatarModalOpen,
        openAvatarModal,
        closeAvatarModal,
        isTeleprompterOpen,
        openTeleprompter,
        closeTeleprompter,
        modalTargetSceneId
      }}
    >
      {children}
    </VideoStudioContext.Provider>
  );
};

export const useVideoStudio = () => {
  const ctx = useContext(VideoStudioContext);
  if (!ctx) {
    throw new Error('useVideoStudio must be used within VideoStudioProvider');
  }
  return ctx;
};
