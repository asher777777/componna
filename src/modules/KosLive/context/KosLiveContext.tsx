import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LivingProject, 
  LivingScene, 
  LivingCampaignContract, 
  LivingSceneContract,
  HeyGenAvatar, 
  HeyGenVoice,
  ClarificationResult
} from '../types';
import { DEFAULT_LIVING_CAMPAIGN, KOS_LIVE_AVATARS } from '../config';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDna, BrandDnaContract } from '../../../core/contracts';
import { LivingStorageService } from '../services/livingStorageService';
import { fetchAllTenantPages } from '../services/pageToLivingConverter';
import { 
  ScriptGenerationParams, 
  generateClarificationQuestionsWithAI, 
  generateStoryboardWithAI, 
  generateNextSceneWithAI 
} from '../services/scriptWizardService';
import { 
  DEFAULT_AVATARS, 
  DEFAULT_VOICES, 
  fetchHeyGenAvatars, 
  fetchHeyGenVoices, 
  generateHeyGenSceneVideo, 
  pollHeyGenVideoStatus 
} from '../services/heygenService';
import { generateVeoSceneVideo } from '../services/veoService';
import { generateImagen3Image } from '../services/imagenService';
import { synthesizeGoogleSpeechAudio } from '../services/googleTtsService';

export type KosLiveStudioTab = 'projects' | 'converter' | 'wizard' | 'timeline' | 'preview' | 'embed';

interface KosLiveContextValue {
  tab: KosLiveStudioTab;
  setTab: (tab: KosLiveStudioTab) => void;
  projects: LivingProject[];
  activeProject: LivingProject | null;
  setActiveProject: (project: LivingProject | null) => void;
  activeCampaign: LivingCampaignContract;
  setActiveCampaign: (campaign: LivingCampaignContract) => void;
  isLoading: boolean;
  loadProjects: () => Promise<void>;
  saveCurrentProject: (overrideProject?: LivingProject) => Promise<void>;
  createNewProject: (title?: string) => LivingProject;
  deleteProject: (id: string) => Promise<void>;
  updateCurrentScene: (sceneId: string, updates: Partial<LivingScene>) => void;

  // Pages & Brand DNA
  availablePages: any[];
  refreshPages: () => Promise<void>;
  selectedPageForWizard: any | null;
  setSelectedPageForWizard: (page: any | null) => void;
  brandDna: BrandDna | null;
  refreshBrandDna: () => Promise<void>;

  // AI & Studio Production Actions
  isGeneratingScript: boolean;
  isGeneratingVideo: boolean;
  generateClarificationQuestions: (params: ScriptGenerationParams) => Promise<ClarificationResult>;
  createProjectFromWizard: (params: ScriptGenerationParams) => Promise<LivingProject>;
  reGenerateProjectWithAI: (projectId: string, params: ScriptGenerationParams) => Promise<LivingProject>;
  addNextSceneWithAI: (customInstruction?: string) => Promise<LivingScene | null>;
  renderHeyGenScene: (sceneId: string) => Promise<void>;
  renderVeoScene: (sceneId: string) => Promise<void>;
  generateSceneImage: (sceneId: string, prompt: string, referenceImageBase64?: string) => Promise<string>;
  synthesizeSceneSpeech: (sceneId: string) => Promise<string>;

  // HeyGen & Modals
  avatars: HeyGenAvatar[];
  voices: HeyGenVoice[];
  isTeleprompterOpen: boolean;
  isAvatarModalOpen: boolean;
  modalTargetSceneId: string | null;
  openTeleprompter: (sceneId: string) => void;
  closeTeleprompter: () => void;
  openAvatarModal: (sceneId: string) => void;
  closeAvatarModal: () => void;
}

const KosLiveContext = createContext<KosLiveContextValue | null>(null);

export function projectToCampaignContract(project: LivingProject): LivingCampaignContract {
  const scenesMap: Record<string, LivingSceneContract> = {};
  (project.scenes || []).forEach(s => {
    scenesMap[s.id] = s;
  });
  const initialId = project.scenes?.[0]?.id || 'scene_welcome';
  return {
    id: project.id,
    slug: project.campaignSlug || `living-${project.id}`,
    name: project.title,
    description: project.description,
    initialSceneId: initialId,
    scenes: scenesMap,
    sourcePageId: project.sourcePageId,
    sourceProductId: project.sourceProductId,
    aspectRatio: project.aspectRatio || '9:16',
    isPublished: project.isPublished !== false,
    publishedAt: project.publishedAt || Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      primaryColor: '#eab308',
      enableVoice: true,
      autoPlay: true,
      language: project.ttsLanguage || 'he-IL',
      displayMode: project.displayMode || 'full_page',
      formsApiEndpoint: project.formsApiEndpoint,
      smartFormId: project.smartFormId
    }
  };
}

export const KosLiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, geminiApiKey, heygenApiKey, gcpApiKey, elevenLabsApiKey, aiModel } = useSystemConnection() as any;
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();

  const [tab, setTab] = useState<KosLiveStudioTab>('projects');
  const [projects, setProjects] = useState<LivingProject[]>([]);
  const [activeProject, setActiveProject] = useState<LivingProject | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<LivingCampaignContract>(DEFAULT_LIVING_CAMPAIGN);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [availablePages, setAvailablePages] = useState<any[]>([]);
  const [selectedPageForWizard, setSelectedPageForWizard] = useState<any | null>(null);
  const [brandDna, setBrandDna] = useState<BrandDna | null>(null);

  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);

  const [avatars, setAvatars] = useState<HeyGenAvatar[]>(DEFAULT_AVATARS);
  const [voices, setVoices] = useState<HeyGenVoice[]>(DEFAULT_VOICES);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [modalTargetSceneId, setModalTargetSceneId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await LivingStorageService.listProjects(db as any, tenantId);
      setProjects(list);
      if (list.length > 0 && !activeProject) {
        setActiveProject(list[0]);
        setActiveCampaign(projectToCampaignContract(list[0]));
      }
    } catch (e) {
      console.warn('[KosLiveContext] Failed to load projects:', e);
    } finally {
      setIsLoading(false);
    }
  }, [db, tenantId, activeProject]);

  const refreshPages = useCallback(async () => {
    try {
      const list = await fetchAllTenantPages(db as any, tenantId);
      setAvailablePages(list);
    } catch (err) {
      console.warn('[KosLiveContext] Failed to refresh pages:', err);
    }
  }, [db, tenantId]);

  const refreshBrandDna = useCallback(async () => {
    try {
      const cap = getCapability<BrandDnaContract>('brand-dna');
      if (cap && cap.getBrandDna) {
        const dna = await cap.getBrandDna();
        if (dna) {
          setBrandDna(dna);
          return;
        }
      }
      const raw = localStorage.getItem('kosun_brand_dna_hub_v1');
      if (raw) {
        setBrandDna(JSON.parse(raw));
      }
    } catch {}
  }, [getCapability]);

  useEffect(() => {
    loadProjects();
    refreshPages();
    refreshBrandDna();
  }, [loadProjects, refreshPages, refreshBrandDna]);

  useEffect(() => {
    if (heygenApiKey) {
      fetchHeyGenAvatars(heygenApiKey).then(setAvatars).catch(() => {});
      fetchHeyGenVoices(heygenApiKey).then(setVoices).catch(() => {});
    }
  }, [heygenApiKey]);

  const saveCurrentProject = useCallback(async (overrideProject?: LivingProject) => {
    const projToSave = overrideProject || activeProject;
    if (!projToSave) return;
    const camp = projectToCampaignContract(projToSave);
    await LivingStorageService.saveProject(db as any, tenantId, projToSave);
    await LivingStorageService.saveCampaign(db as any, tenantId, camp);
    setActiveCampaign(camp);
    await loadProjects();
  }, [activeProject, db, tenantId, loadProjects]);

  const createNewProject = useCallback((title: string = 'פרויקט עמוד חי חדש'): LivingProject => {
    const id = `live_proj_${Date.now()}`;
    const defaultAvatar = KOS_LIVE_AVATARS[0];
    const scene1Id = `scene_${Date.now()}_1`;
    const newProj: LivingProject = {
      id,
      title,
      description: 'הפיכת תוכן, עמודים ומוצרים לעמוד חי אינטראקטיבי',
      aspectRatio: '9:16',
      cardCountPerScene: 3,
      includeLeadForm: true,
      scenes: [
        {
          id: scene1Id,
          sceneNumber: 1,
          title: 'סצנה 1 - קבלת פנים',
          dialogueScript: '[warm] שלום וברוכים הבאים! [excited] בחרו בכרטיסיות או בכפתורים למטה כדי להתחיל.',
          subtitleText: 'שלום וברוכים הבאים! בחרו בכרטיסיות או בכפתורים למטה כדי להתחיל.',
          subtitleStyle: 'boxed',
          subtitleAnimation: 'word',
          subtitleFontSize: 18,
          subtitlePosition: 'bottom',
          renderedVideoUrl: defaultAvatar.previewVideoUrl,
          backgroundMediaUrl: defaultAvatar.previewImageUrl,
          avatarId: defaultAvatar.id,
          voiceId: defaultAvatar.voiceId,
          sceneRole: 'welcome_hook',
          autoPlay: true,
          loopUntilTrigger: true,
          soundEnabled: true,
          micPosition: 'bottom',
          micIcon: 'mic',
          enableVoiceTrigger: true,
          overlays: [
            {
              id: `ov_carousel_${scene1Id}`,
              type: 'carousel',
              position: 'center',
              title: 'הפתרונות המובילים שלנו',
              subtitle: 'דפדפו בכרטיסיות לפרטים נוספים',
              cards: [
                { id: 'c1', title: 'שירות פרימיום מותאם אישית', description: 'ליווי מקצועי ומענה מלא', badge: '👑 מומלץ', icon: 'crown' },
                { id: 'c2', title: 'חיסכון בזמן ותוצאות מהירות', description: 'אוטומציה חכמה לעסק שלך', badge: '🚀 מהיר', icon: 'rocket' },
                { id: 'c3', title: 'אחריות מלאה ושקט נפשי', description: 'תמיכה זמינה בוואטסאפ ובטלפון', badge: '🛡️ ביטחון', icon: 'shield' }
              ]
            },
            {
              id: `ov_actions_${scene1Id}`,
              type: 'quick_replies',
              position: 'bottom',
              title: 'בחר כיצד להמשיך:',
              actions: [
                { id: 'a1', label: '🚀 קבל הצעה מותאמת', targetSceneId: scene1Id, variant: 'gold' }
              ]
            }
          ]
        }
      ],
      displayMode: 'full_page',
      status: 'draft',
      campaignSlug: `living-${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActiveProject(newProj);
    setActiveCampaign(projectToCampaignContract(newProj));
    setTab('timeline');
    return newProj;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await LivingStorageService.deleteProject(db as any, tenantId, id);
    if (activeProject?.id === id) {
      setActiveProject(null);
      setTab('projects');
    }
    await loadProjects();
  }, [activeProject, db, tenantId, loadProjects]);

  const updateCurrentScene = useCallback((sceneId: string, updates: Partial<LivingScene>) => {
    setActiveProject(prev => {
      if (!prev) return prev;
      const updatedScenes = (prev.scenes || []).map(s => s.id === sceneId ? { ...s, ...updates } : s);
      const nextProj: LivingProject = {
        ...prev,
        scenes: updatedScenes,
        updatedAt: new Date().toISOString()
      };
      setActiveCampaign(projectToCampaignContract(nextProj));
      return nextProj;
    });
  }, []);

  const generateClarificationQuestions = useCallback(async (params: ScriptGenerationParams): Promise<ClarificationResult> => {
    setIsGeneratingScript(true);
    try {
      const { result } = await generateClarificationQuestionsWithAI(
        geminiApiKey || '',
        aiModel || 'gemini-3.8-flash-lite',
        { ...params, brandDna }
      );
      return result;
    } finally {
      setIsGeneratingScript(false);
    }
  }, [geminiApiKey, aiModel, brandDna]);

  const createProjectFromWizard = useCallback(async (params: ScriptGenerationParams): Promise<LivingProject> => {
    setIsGeneratingScript(true);
    try {
      const res = await generateStoryboardWithAI(
        geminiApiKey || '',
        aiModel || 'gemini-3.8-flash-lite',
        { ...params, brandDna }
      );
      const id = `live_proj_${Date.now()}`;
      const newProj: LivingProject = {
        id,
        title: res.project.title || params.topic || 'עמוד חי חדש',
        description: res.project.description || params.topic,
        aspectRatio: params.aspectRatio || '9:16',
        targetAudience: params.targetAudience,
        marketingHook: params.marketingHook,
        productionType: params.productionType,
        visualStyle: params.visualStyle,
        ttsLanguage: params.ttsLanguage,
        outputPreference: params.outputPreference,
        cardCountPerScene: params.cardCountPerScene ?? 3,
        includeLeadForm: params.includeLeadForm !== false,
        smartFormId: params.smartFormId,
        formsApiEndpoint: params.formsApiEndpoint,
        projectOverview: res.project.projectOverview,
        conversationId: res.conversationId,
        conversationHistory: res.conversationHistory,
        scenes: res.scenes,
        sourcePageId: params.sourcePageId,
        sourcePageTitle: params.sourcePageTitle,
        displayMode: 'full_page',
        status: 'scripted',
        campaignSlug: `living-${id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublished: true,
        publishedAt: Date.now()
      };
      setActiveProject(newProj);
      const camp = projectToCampaignContract(newProj);
      setActiveCampaign(camp);
      await LivingStorageService.saveProject(db as any, tenantId, newProj);
      await LivingStorageService.saveCampaign(db as any, tenantId, camp);
      await loadProjects();
      return newProj;
    } finally {
      setIsGeneratingScript(false);
    }
  }, [geminiApiKey, aiModel, brandDna, db, tenantId, loadProjects]);

  const reGenerateProjectWithAI = useCallback(async (projectId: string, params: ScriptGenerationParams): Promise<LivingProject> => {
    setIsGeneratingScript(true);
    try {
      const res = await generateStoryboardWithAI(
        geminiApiKey || '',
        aiModel || 'gemini-3.8-flash-lite',
        { ...params, brandDna }
      );
      const updatedProj: LivingProject = {
        ...(activeProject || ({} as LivingProject)),
        id: projectId,
        title: res.project.title || params.topic,
        description: res.project.description || params.topic,
        aspectRatio: params.aspectRatio || '9:16',
        targetAudience: params.targetAudience,
        marketingHook: params.marketingHook,
        productionType: params.productionType,
        visualStyle: params.visualStyle,
        ttsLanguage: params.ttsLanguage,
        outputPreference: params.outputPreference,
        cardCountPerScene: params.cardCountPerScene ?? 3,
        includeLeadForm: params.includeLeadForm !== false,
        smartFormId: params.smartFormId,
        formsApiEndpoint: params.formsApiEndpoint,
        projectOverview: res.project.projectOverview,
        conversationId: res.conversationId,
        conversationHistory: res.conversationHistory,
        scenes: res.scenes,
        sourcePageId: params.sourcePageId,
        sourcePageTitle: params.sourcePageTitle,
        displayMode: activeProject?.displayMode || 'full_page',
        status: 'scripted',
        updatedAt: new Date().toISOString(),
      };
      setActiveProject(updatedProj);
      const camp = projectToCampaignContract(updatedProj);
      setActiveCampaign(camp);
      await LivingStorageService.saveProject(db as any, tenantId, updatedProj);
      await LivingStorageService.saveCampaign(db as any, tenantId, camp);
      await loadProjects();
      return updatedProj;
    } finally {
      setIsGeneratingScript(false);
    }
  }, [activeProject, geminiApiKey, aiModel, brandDna, db, tenantId, loadProjects]);

  const addNextSceneWithAI = useCallback(async (customInstruction?: string): Promise<LivingScene | null> => {
    if (!activeProject) return null;
    setIsGeneratingScript(true);
    try {
      const { scene, updatedHistory } = await generateNextSceneWithAI(
        geminiApiKey || '',
        aiModel || 'gemini-3.8-flash-lite',
        activeProject,
        customInstruction
      );
      const updatedProj: LivingProject = {
        ...activeProject,
        scenes: [...(activeProject.scenes || []), scene],
        conversationHistory: updatedHistory,
        updatedAt: new Date().toISOString()
      };
      setActiveProject(updatedProj);
      const camp = projectToCampaignContract(updatedProj);
      setActiveCampaign(camp);
      await LivingStorageService.saveProject(db as any, tenantId, updatedProj);
      await LivingStorageService.saveCampaign(db as any, tenantId, camp);
      return scene;
    } finally {
      setIsGeneratingScript(false);
    }
  }, [activeProject, geminiApiKey, aiModel, db, tenantId]);

  const renderHeyGenScene = useCallback(async (sceneId: string) => {
    if (!activeProject) return;
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    setIsGeneratingVideo(true);
    updateCurrentScene(sceneId, { heygenStatus: 'processing', videoProvider: 'heygen' });
    try {
      const jobId = await generateHeyGenSceneVideo(heygenApiKey || '', {
        scriptText: scene.dialogueScript,
        voiceId: scene.voiceId,
        aspectRatio: activeProject.aspectRatio,
        backgroundMediaUrl: scene.backgroundMediaUrl,
        customAvatarImageUrl: scene.customAvatarImageUrl,
        audioUrl: scene.renderedAudioUrl,
        isPhotoAvatar: scene.isPhotoAvatar,
        avatarId: scene.avatarId
      });
      updateCurrentScene(sceneId, { heygenJobId: jobId, heygenStatus: 'processing' });

      // Poll status
      for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await pollHeyGenVideoStatus(heygenApiKey || '', jobId);
        if (statusRes.status === 'completed' && statusRes.video_url) {
          updateCurrentScene(sceneId, {
            heygenStatus: 'completed',
            renderedVideoUrl: statusRes.video_url
          });
          break;
        } else if (statusRes.status === 'failed') {
          updateCurrentScene(sceneId, { heygenStatus: 'failed' });
          throw new Error(statusRes.error || 'HeyGen render failed');
        }
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [activeProject, heygenApiKey, updateCurrentScene]);

  const renderVeoScene = useCallback(async (sceneId: string) => {
    if (!activeProject) return;
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    setIsGeneratingVideo(true);
    updateCurrentScene(sceneId, { heygenStatus: 'processing', videoProvider: 'veo' });
    try {
      const res = await generateVeoSceneVideo(geminiApiKey || '', {
        prompt: scene.visualPrompt || scene.dialogueScript || scene.title,
        aspectRatio: activeProject.aspectRatio,
        durationSeconds: scene.durationSeconds || 6
      });
      updateCurrentScene(sceneId, {
        heygenStatus: 'completed',
        renderedVideoUrl: res.videoUrl,
        durationSeconds: res.durationSec,
        videoProvider: 'veo'
      });
    } catch (err) {
      updateCurrentScene(sceneId, { heygenStatus: 'failed' });
      throw err;
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [activeProject, geminiApiKey, updateCurrentScene]);

  const generateSceneImage = useCallback(async (sceneId: string, prompt: string, referenceImageBase64?: string): Promise<string> => {
    const res = await generateImagen3Image(geminiApiKey || '', {
      prompt,
      aspectRatio: activeProject?.aspectRatio || '9:16',
      referenceImageBase64
    });
    updateCurrentScene(sceneId, {
      backgroundMediaUrl: res.imageUrl,
      backgroundType: 'image',
      customAvatarImageUrl: res.imageUrl
    });
    return res.imageUrl;
  }, [geminiApiKey, activeProject, updateCurrentScene]);

  const synthesizeSceneSpeech = useCallback(async (sceneId: string): Promise<string> => {
    if (!activeProject) return '';
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    if (!scene) return '';

    const res = await synthesizeGoogleSpeechAudio(
      geminiApiKey || '',
      {
        text: scene.dialogueScript,
        voiceName: scene.googleTtsVoiceName || scene.voiceId || 'Kore',
        languageCode: scene.googleTtsLanguageCode || activeProject.ttsLanguage || 'he-IL',
        speakingRate: scene.googleTtsSsmlRate ? parseFloat(scene.googleTtsSsmlRate) : 1.0,
        pitch: scene.googleTtsSsmlPitch ? parseFloat(scene.googleTtsSsmlPitch) : 0,
        emphasis: scene.googleTtsEmphasis || 'none'
      },
      { gcpApiKey, elevenLabsApiKey }
    );
    updateCurrentScene(sceneId, {
      renderedAudioUrl: res.audioUrl,
      durationSeconds: res.durationEstimateSec
    });
    return res.audioUrl;
  }, [activeProject, geminiApiKey, gcpApiKey, elevenLabsApiKey, updateCurrentScene]);

  const openTeleprompter = useCallback((sceneId: string) => {
    setModalTargetSceneId(sceneId);
    setIsTeleprompterOpen(true);
  }, []);

  const closeTeleprompter = useCallback(() => {
    setIsTeleprompterOpen(false);
    setModalTargetSceneId(null);
  }, []);

  const openAvatarModal = useCallback((sceneId: string) => {
    setModalTargetSceneId(sceneId);
    setIsAvatarModalOpen(true);
  }, []);

  const closeAvatarModal = useCallback(() => {
    setIsAvatarModalOpen(false);
    setModalTargetSceneId(null);
  }, []);

  const value = useMemo(() => ({
    tab,
    setTab,
    projects,
    activeProject,
    setActiveProject,
    activeCampaign,
    setActiveCampaign,
    isLoading,
    loadProjects,
    saveCurrentProject,
    createNewProject,
    deleteProject,
    updateCurrentScene,
    availablePages,
    refreshPages,
    selectedPageForWizard,
    setSelectedPageForWizard,
    brandDna,
    refreshBrandDna,
    isGeneratingScript,
    isGeneratingVideo,
    generateClarificationQuestions,
    createProjectFromWizard,
    reGenerateProjectWithAI,
    addNextSceneWithAI,
    renderHeyGenScene,
    renderVeoScene,
    generateSceneImage,
    synthesizeSceneSpeech,
    avatars,
    voices,
    isTeleprompterOpen,
    isAvatarModalOpen,
    modalTargetSceneId,
    openTeleprompter,
    closeTeleprompter,
    openAvatarModal,
    closeAvatarModal
  }), [
    tab,
    projects,
    activeProject,
    activeCampaign,
    isLoading,
    loadProjects,
    saveCurrentProject,
    createNewProject,
    deleteProject,
    updateCurrentScene,
    availablePages,
    refreshPages,
    selectedPageForWizard,
    brandDna,
    refreshBrandDna,
    isGeneratingScript,
    isGeneratingVideo,
    generateClarificationQuestions,
    createProjectFromWizard,
    reGenerateProjectWithAI,
    addNextSceneWithAI,
    renderHeyGenScene,
    renderVeoScene,
    generateSceneImage,
    synthesizeSceneSpeech,
    avatars,
    voices,
    isTeleprompterOpen,
    isAvatarModalOpen,
    modalTargetSceneId,
    openTeleprompter,
    closeTeleprompter,
    openAvatarModal,
    closeAvatarModal
  ]);

  return (
    <KosLiveContext.Provider value={value}>
      {children}
    </KosLiveContext.Provider>
  );
};

export const useKosLive = () => {
  const ctx = useContext(KosLiveContext);
  if (!ctx) {
    throw new Error('useKosLive must be used within a KosLiveProvider');
  }
  return ctx;
};
