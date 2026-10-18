import React, { useState, useRef } from 'react';
import {
  Plus, Trash2, Film, Sparkles, Volume2, Mic, Play, Pause,
  ChevronDown, ChevronUp, CheckCircle2, Video, MessageSquare, HardDrive,
  Image as ImageIcon, Wand2, Copy, Camera, Subtitles, Sliders,
  LayoutGrid, FileText, Download, Upload, RefreshCw, ExternalLink,
  ArrowUp, ArrowDown, Layers, PhoneCall, Eye, Globe, Webhook
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useKosLive } from '../context/KosLiveContext';
import {
  LivingScene,
  SceneRoleType,
  LivingOverlayItem,
  LivingOverlayAction,
  LivingCarouselCardItem,
  LivingFormFieldConfig,
  SubtitleStylePreset,
  SubtitleAnimationType,
  TransitionEffectType
} from '../types';
import { KOS_LIVE_AVATARS } from '../config';
import {
  SPEECH_DIRECTION_TAGS,
  GOOGLE_TTS_VOICES,
  GoogleTtsVoice,
  SpeechDirectionTag,
  synthesizeGoogleSpeechAudio
} from '../services/googleTtsService';
import {
  cleanSubtitleText,
  generateSrtContent,
  generateVttContent,
  downloadSubtitleFile
} from '../services/subtitleService';
import {
  extractPageContentForLiving,
  buildCardsFromPageSummary,
  buildFormFieldsFromPageSummary
} from '../services/pageToLivingConverter';
import { PremiumVectorIcon } from '../utils/premiumIcons';
import { IconPickerModal } from './IconPickerModal';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { MediaPickerContract } from '../../../core/contracts';

type StudioSceneTab = 'script' | 'video' | 'audio' | 'subtitles' | 'interactive';

export const LivingTimelineEditor: React.FC = () => {
  const {
    activeProject,
    setActiveProject,
    setTab,
    availablePages,
    selectedPageForWizard,
    setSelectedPageForWizard,
    addNextSceneWithAI,
    generateSceneImage,
    synthesizeSceneSpeech,
    renderHeyGenScene,
    renderVeoScene,
    openTeleprompter,
    openAvatarModal,
    isGeneratingScript,
    isGeneratingVideo
  } = useKosLive();

  const extractedPageSummary = React.useMemo(() => {
    if (selectedPageForWizard) {
      return extractPageContentForLiving(selectedPageForWizard);
    }
    if (activeProject?.sourcePageId && availablePages.length > 0) {
      const found = availablePages.find(p => p.id === activeProject.sourcePageId);
      if (found) return extractPageContentForLiving(found);
    }
    return null;
  }, [selectedPageForWizard, activeProject?.sourcePageId, availablePages]);

  const selectPageAndExtract = (pageId: string) => {
    const found = availablePages.find(p => p.id === pageId);
    if (found) {
      setSelectedPageForWizard(found);
    }
  };

  const addAiScene = () => addNextSceneWithAI();
  const isGeneratingAi = isGeneratingScript;
  const isGeneratingImage = isGeneratingVideo;
  const isGeneratingTts = isGeneratingVideo;
  const isRenderingHeyGen = isGeneratingVideo;
  const isRenderingVeo = isGeneratingVideo;

  const previewGoogleVoiceSample = async (voiceId: string) => {
    const voiceObj = GOOGLE_TTS_VOICES.find(v => v.id === voiceId) || GOOGLE_TTS_VOICES[0];
    try {
      const res = await synthesizeGoogleSpeechAudio('', {
        text: voiceObj.sampleText,
        voiceName: voiceObj.id,
        languageCode: voiceObj.languageCode === 'multilingual' ? 'he-IL' : voiceObj.languageCode
      });
      if (res.audioUrl) {
        const audio = new Audio(res.audioUrl);
        audio.play().catch(() => {});
      }
    } catch (e) {
      console.warn('[LivingTimelineEditor] Voice preview failed:', e);
    }
  };

  const exportSceneSubtitlesSrt = (scene: LivingScene) => {
    const srt = generateSrtContent(scene.subtitleText || scene.dialogueScript || '', scene.durationSeconds || 8);
    downloadSubtitleFile(`${scene.id}_subtitles.srt`, srt);
  };

  const exportSceneSubtitlesVtt = (scene: LivingScene) => {
    const vtt = generateVttContent(scene.subtitleText || scene.dialogueScript || '', scene.durationSeconds || 8);
    downloadSubtitleFile(`${scene.id}_subtitles.vtt`, vtt, 'text/vtt;charset=utf-8');
  };

  const { storage } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [activeSceneTab, setActiveSceneTab] = useState<StudioSceneTab>('script');
  const [ttsLangFilter, setTtsLangFilter] = useState<string>('all');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [showPreviewCc, setShowPreviewCc] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Icon picker modal state
  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    target: 'mic' | 'card';
    cardId?: string;
    currentIcon?: string;
  }>({ isOpen: false, target: 'mic' });

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileVideoInputRef = useRef<HTMLInputElement | null>(null);
  const fileImageInputRef = useRef<HTMLInputElement | null>(null);

  if (!activeProject) {
    return (
      <div className="p-10 text-center text-slate-400 select-none font-sans bg-slate-900/50 border border-slate-800 rounded-3xl max-w-xl mx-auto my-8" dir="rtl">
        <Film className="w-12 h-12 mx-auto mb-3 text-amber-400" />
        <h3 className="text-base font-black text-white mb-1">אין פרויקט פעיל בעריכה</h3>
        <p className="text-xs text-slate-400 mb-4">בחרו פרויקט קיים או המירו עמוד לחי בלחיצה אחת כדי לפתוח את סטודיו הסצנות המלא.</p>
        <button
          onClick={() => setTab('converter')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
        >
          פתח אשף יצירה והמרת עמוד לחי
        </button>
      </div>
    );
  }

  const scenes = activeProject.scenes || [];
  const safeIndex = Math.min(selectedSceneIndex, Math.max(0, scenes.length - 1));
  const currentScene: LivingScene | undefined = scenes[safeIndex];

  const updateScene = (updatedFields: Partial<LivingScene>) => {
    const updatedScenes = [...scenes];
    if (updatedScenes[safeIndex]) {
      const merged: LivingScene = {
        ...updatedScenes[safeIndex],
        ...updatedFields
      };
      // Keep aliases synced
      if (updatedFields.dialogueScript !== undefined) {
        merged.scriptText = updatedFields.dialogueScript;
      }
      if (updatedFields.renderedVideoUrl !== undefined) {
        merged.videoUrl = updatedFields.renderedVideoUrl;
      }
      if (updatedFields.backgroundMediaUrl !== undefined) {
        merged.fallbackImageUrl = updatedFields.backgroundMediaUrl;
      }
      updatedScenes[safeIndex] = merged;
      setActiveProject({
        ...activeProject,
        scenes: updatedScenes,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // --- Scene List Operations ---
  const addScene = () => {
    const newSceneNumber = scenes.length + 1;
    const newId = `scene_${Date.now()}`;
    const defaultAvatar = KOS_LIVE_AVATARS[0];

    const newScene: LivingScene = {
      id: newId,
      sceneNumber: newSceneNumber,
      title: `סצנה ${newSceneNumber}`,
      dialogueScript: 'שלום! בואו נדבר על האפשרויות שעומדות בפניכם כאן בעמוד...',
      scriptText: 'שלום! בואו נדבר על האפשרויות שעומדות בפניכם כאן בעמוד...',
      visualDescription: 'הפרזנטור פונה לצופה בחיוך באולפן מודרני',
      characterDescription: defaultAvatar.name,
      backgroundPrompt: 'Modern luxury studio with warm lighting, 8k cinematic',
      durationSeconds: 10,
      renderedVideoUrl: defaultAvatar.previewVideoUrl,
      videoUrl: defaultAvatar.previewVideoUrl,
      backgroundMediaUrl: defaultAvatar.previewImageUrl,
      fallbackImageUrl: defaultAvatar.previewImageUrl,
      avatarId: defaultAvatar.id,
      voiceId: 'he-IL-Wavenet-D',
      ttsLanguageCode: 'he-IL',
      ttsSpeakingRate: 1.0,
      ttsPitch: 0,
      sceneRole: 'custom',
      transitionEffect: 'fade',
      autoPlay: true,
      loopUntilTrigger: true,
      soundEnabled: true,
      autoTransitionOnEnd: false,
      enableVoiceTrigger: true,
      micPosition: 'bottom',
      micIcon: 'mic-luxury',
      micPromptText: 'דברו איתי או בחרו אפשרות',
      micTargetAction: 'open_text_input',
      subtitleEnabled: true,
      subtitleText: 'שלום! בואו נדבר על האפשרויות שעומדות בפניכם כאן בעמוד...',
      subtitleStyle: 'boxed',
      subtitleAnimation: 'word',
      subtitlePosition: 'bottom',
      subtitleFontSize: 24,
      subtitleTextColor: '#FFFFFF',
      subtitleHighlightColor: '#F59E0B',
      overlays: []
    };

    const updated = [...scenes, newScene];
    setActiveProject({
      ...activeProject,
      scenes: updated,
      updatedAt: new Date().toISOString()
    });
    setSelectedSceneIndex(updated.length - 1);
  };

  const duplicateScene = (index: number) => {
    const source = scenes[index];
    if (!source) return;
    const copy: LivingScene = {
      ...JSON.parse(JSON.stringify(source)),
      id: `scene_${Date.now()}`,
      sceneNumber: scenes.length + 1,
      title: `${source.title} (עותק)`
    };
    const updated = [...scenes];
    updated.splice(index + 1, 0, copy);
    const reindexed = updated.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    setActiveProject({
      ...activeProject,
      scenes: reindexed,
      updatedAt: new Date().toISOString()
    });
    setSelectedSceneIndex(index + 1);
  };

  const moveScene = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= scenes.length) return;
    const updated = [...scenes];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    const reindexed = updated.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    setActiveProject({
      ...activeProject,
      scenes: reindexed,
      updatedAt: new Date().toISOString()
    });
    setSelectedSceneIndex(targetIdx);
  };

  const deleteScene = (index: number) => {
    if (scenes.length <= 1) return;
    const updated = scenes.filter((_, i) => i !== index).map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    setActiveProject({
      ...activeProject,
      scenes: updated,
      updatedAt: new Date().toISOString()
    });
    setSelectedSceneIndex(Math.max(0, index - 1));
  };

  // --- Media Vault & Direct Firebase Upload ---
  const handlePickCloudVideo = async () => {
    if (!mediaPicker) {
      alert('שירות כספת המדיה KosCloudStore אינו זמין כרגע.');
      return;
    }
    try {
      const selected = await mediaPicker.openPicker({
        accept: 'video/*',
        multiple: false
      });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (typeof url === 'string') {
          updateScene({
            renderedVideoUrl: url,
            videoUrl: url,
            videoProvider: 'custom'
          });
        }
      }
    } catch (err) {
      console.error('[LivingTimelineEditor] Error picking video from media-picker:', err);
    }
  };

  const handlePickCloudBackground = async () => {
    if (!mediaPicker) {
      alert('שירות כספת המדיה KosCloudStore אינו זמין כרגע.');
      return;
    }
    try {
      const selected = await mediaPicker.openPicker({
        accept: 'image/*',
        multiple: false
      });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (typeof url === 'string') {
          updateScene({
            backgroundMediaUrl: url,
            fallbackImageUrl: url
          });
        }
      }
    } catch (err) {
      console.error('[LivingTimelineEditor] Error picking image from media-picker:', err);
    }
  };

  const handleDirectVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentScene) return;

    if (!storage) {
      // Fallback to object URL if storage is offline
      const localUrl = URL.createObjectURL(file);
      updateScene({ renderedVideoUrl: localUrl, videoUrl: localUrl, videoProvider: 'custom' });
      return;
    }

    try {
      setUploadProgress(1);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `tenants/${tenantId}/kos_live_videos/${activeProject.id}/${currentScene.id}_${Date.now()}_${safeName}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        snapshot => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(pct);
        },
        err => {
          console.error('[LivingTimelineEditor] Video upload error:', err);
          setUploadProgress(null);
          const localUrl = URL.createObjectURL(file);
          updateScene({ renderedVideoUrl: localUrl, videoUrl: localUrl, videoProvider: 'custom' });
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          updateScene({
            renderedVideoUrl: downloadUrl,
            videoUrl: downloadUrl,
            videoProvider: 'custom'
          });
          setUploadProgress(null);
        }
      );
    } catch (err) {
      console.error('[LivingTimelineEditor] Direct upload exception:', err);
      setUploadProgress(null);
    }
  };

  const handleDirectImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateScene({
          backgroundMediaUrl: reader.result,
          fallbackImageUrl: reader.result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Overlays Helpers (Carousel Cards, Lead Form, Quick Replies) ---
  const overlays = currentScene?.overlays || [];
  const carouselOverlay = overlays.find(o => o.type === 'carousel');
  const formOverlay = overlays.find(o => o.type === 'form_input');
  const quickRepliesOverlay = overlays.find(o => o.type === 'quick_replies');

  const upsertOverlay = (updatedOverlay: LivingOverlayItem) => {
    const existingIdx = overlays.findIndex(o => o.id === updatedOverlay.id || o.type === updatedOverlay.type);
    const nextOverlays = [...overlays];
    if (existingIdx >= 0) {
      nextOverlays[existingIdx] = updatedOverlay;
    } else {
      nextOverlays.push(updatedOverlay);
    }
    updateScene({ overlays: nextOverlays });
  };

  const removeOverlayByType = (type: LivingOverlayItem['type']) => {
    updateScene({ overlays: overlays.filter(o => o.type !== type) });
  };

  // --- Carousel Cards Management & Card Count Generator ---
  const currentCards: LivingCarouselCardItem[] = carouselOverlay?.cards || [];

  const updateCarouselCards = (newCards: LivingCarouselCardItem[], title?: string) => {
    if (newCards.length === 0) {
      removeOverlayByType('carousel');
      return;
    }
    const nextSceneId = scenes[safeIndex + 1]?.id || scenes[0]?.id;
    const updatedCarousel: LivingOverlayItem = {
      id: carouselOverlay?.id || `ov_carousel_${currentScene?.id || Date.now()}`,
      type: 'carousel',
      title: title !== undefined ? title : (carouselOverlay?.title || 'בחרו מהקטלוג לפרטים נוספים:'),
      position: 'center',
      cards: newCards.map(c => ({
        ...c,
        targetSceneId: c.targetSceneId || nextSceneId
      }))
    };
    upsertOverlay(updatedCarousel);
  };

  const handleSetCardCount = (count: number) => {
    if (count <= 0) {
      removeOverlayByType('carousel');
      return;
    }
    const nextSceneId = scenes[safeIndex + 1]?.id || scenes[0]?.id;

    // If we have extracted page summary, use real items for any newly added slots
    const pageGeneratedCards = extractedPageSummary
      ? buildCardsFromPageSummary(extractedPageSummary, count, nextSceneId)
      : [];

    const nextCards: LivingCarouselCardItem[] = [];
    for (let i = 0; i < count; i++) {
      if (currentCards[i]) {
        nextCards.push(currentCards[i]);
      } else if (pageGeneratedCards[i]) {
        nextCards.push(pageGeneratedCards[i]);
      } else {
        const icons = ['sparkles-gold', 'crown-vip', 'diamond-luxury', 'rocket-boost', 'shield-trust', 'gift-vip'];
        nextCards.push({
          id: `card_${Date.now()}_${i}`,
          title: `כרטיס מוצר / שירות #${i + 1}`,
          subtitle: 'תיאור קצר של ההצעה, היתרון המרכזי או השירות עבור הגולש',
          badge: i === 0 ? 'מומלץ' : undefined,
          price: '',
          icon: icons[i % icons.length],
          ctaText: 'לפרטים והמשך',
          targetSceneId: nextSceneId
        });
      }
    }
    updateCarouselCards(nextCards);
  };

  const handlePullCardsFromPage = () => {
    if (!extractedPageSummary) {
      alert('אנא בחרו עמוד מקושר מהרשימה למעלה או בלשונית "המרת עמוד לחי" כדי לשאוב כרטיסים אוטומטית.');
      return;
    }
    const targetCount = currentCards.length > 0 ? currentCards.length : 4;
    const nextSceneId = scenes[safeIndex + 1]?.id || scenes[0]?.id;
    const cards = buildCardsFromPageSummary(extractedPageSummary, targetCount, nextSceneId);
    updateCarouselCards(cards, `קטלוג ${extractedPageSummary.heroTitle}`);
  };

  const handlePickCardImage = async (cardId: string) => {
    if (!mediaPicker) return;
    try {
      const selected = await mediaPicker.openPicker({ accept: 'image/*', multiple: false });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (typeof url === 'string') {
          updateCarouselCards(currentCards.map(c => (c.id === cardId ? { ...c, imageUrl: url } : c)));
        }
      }
    } catch (e) {
      console.warn('[LivingTimelineEditor] Card image picker error:', e);
    }
  };

  // --- Interactive Form Management ---
  const handleToggleLeadForm = (enabled: boolean) => {
    if (!enabled) {
      removeOverlayByType('form_input');
      return;
    }
    const defaultFields: LivingFormFieldConfig[] = extractedPageSummary
      ? buildFormFieldsFromPageSummary(extractedPageSummary)
      : [
          { key: 'fullName', label: 'שם מלא', placeholder: 'הקלידו שם מלא...', type: 'text', required: true },
          { key: 'phone', label: 'טלפון נייד', placeholder: '050-0000000', type: 'tel', required: true },
          { key: 'notes', label: 'הערות או שאלה', placeholder: 'במה נוכל לעזור?', type: 'textarea', required: false }
        ];

    const newFormOverlay: LivingOverlayItem = {
      id: `ov_form_${currentScene?.id || Date.now()}`,
      type: 'form_input',
      title: `השאירו פרטים ונחזור אליכם מיד`,
      subtitle: 'הפרטים נשלחים ישירות למערכת ה-CRM ולנציג האישי',
      position: 'center',
      formFields: defaultFields,
      submitButtonText: 'שליחה וקבלת ההטבה',
      smartFormId: extractedPageSummary?.smartFormId || '',
      webhookUrl: '',
      actions: [
        {
          id: `act_submit_${Date.now()}`,
          label: 'שליחה וקבלת ההטבה',
          actionType: 'submit_form',
          targetSceneId: scenes[safeIndex + 1]?.id || scenes[0]?.id,
          variant: 'gold'
        }
      ]
    };
    upsertOverlay(newFormOverlay);
  };

  const updateFormOverlay = (patch: Partial<LivingOverlayItem>) => {
    if (!formOverlay) return;
    upsertOverlay({
      ...formOverlay,
      ...patch
    });
  };

  // --- Quick Replies Management ---
  const currentQuickActions: LivingOverlayAction[] = quickRepliesOverlay?.actions || [];

  const updateQuickActions = (newActions: LivingOverlayAction[], title?: string) => {
    if (newActions.length === 0) {
      removeOverlayByType('quick_replies');
      return;
    }
    upsertOverlay({
      id: quickRepliesOverlay?.id || `ov_qr_${currentScene?.id || Date.now()}`,
      type: 'quick_replies',
      title: title !== undefined ? title : (quickRepliesOverlay?.title || 'לאן תרצו להמשיך?'),
      position: 'bottom',
      actions: newActions
    });
  };

  const addQuickAction = () => {
    const nextSceneId = scenes[safeIndex + 1]?.id || scenes[0]?.id;
    const newAct: LivingOverlayAction = {
      id: `act_${Date.now()}`,
      label: `אפשרות בחירה ${currentQuickActions.length + 1}`,
      actionType: 'transition',
      targetSceneId: nextSceneId,
      variant: currentQuickActions.length === 0 ? 'gold' : 'outline'
    };
    updateQuickActions([...currentQuickActions, newAct]);
  };

  //Insert direction tag into dialogueScript
  const insertDirectionTag = (tag: string) => {
    if (!currentScene) return;
    const currentText = currentScene.dialogueScript || '';
    updateScene({
      dialogueScript: `${currentText} ${tag} `.trimStart()
    });
  };

  const filteredVoices = GOOGLE_TTS_VOICES.filter(
    v => ttsLangFilter === 'all' || v.languageCode === ttsLangFilter
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 font-sans select-none" dir="rtl">
      {/* Hidden File Inputs */}
      <input
        ref={fileVideoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleDirectVideoFileUpload}
      />
      <input
        ref={fileImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDirectImageFileUpload}
      />

      {/* Top Bar: Connected Page Data Sync & Quick Info */}
      <div className="mb-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white">{activeProject.title}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {scenes.length} סצנות
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {extractedPageSummary
                ? `מחובר לנתוני עמוד: "${extractedPageSummary.heroTitle}" (${extractedPageSummary.services.length} שירותים, ${extractedPageSummary.products.length} מוצרים)`
                : 'ניתן לקשר עמוד מבונה העמודים כדי לשאוב מוצרים, שירותים, כרטיסים וטפסים בלחיצה'}
            </p>
          </div>
        </div>

        {/* Page Data Connection Selector right inside Studio */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={extractedPageSummary?.pageId || ''}
            onChange={e => {
              if (e.target.value) selectPageAndExtract(e.target.value);
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="">-- חיבור מהיר לנתוני עמוד קיים ({availablePages.length}) --</option>
            {availablePages.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.slug})
              </option>
            ))}
          </select>

          <button
            onClick={() => setTab('preview')}
            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>סימולטור מלא</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN (4 cols): Live Scene Preview + Scenes Timeline List */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* 1. Live Mini Scene Monitor */}
          {currentScene && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>מוניטור תצוגה חיה - סצנה #{safeIndex + 1}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowPreviewCc(!showPreviewCc)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                      showPreviewCc
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                    title="הצג/הסתר כתוביות במוניטור"
                  >
                    CC כתוביות
                  </button>
                </div>
              </div>

              {/* Monitor Screen */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 group">
                {currentScene.renderedVideoUrl ? (
                  <video
                    ref={previewVideoRef}
                    key={currentScene.renderedVideoUrl}
                    src={currentScene.renderedVideoUrl}
                    poster={currentScene.backgroundMediaUrl || currentScene.fallbackImageUrl}
                    className="w-full h-full object-cover"
                    playsInline
                    onPlay={() => setIsPreviewPlaying(true)}
                    onPause={() => setIsPreviewPlaying(false)}
                    onEnded={() => setIsPreviewPlaying(false)}
                  />
                ) : currentScene.backgroundMediaUrl || currentScene.generatedImageUrl ? (
                  <img
                    src={currentScene.generatedImageUrl || currentScene.backgroundMediaUrl}
                    alt={currentScene.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                    <Film className="w-8 h-8 mb-1" />
                    <span>אין מדיה משויכת</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Play/Pause Overlay Button */}
                {currentScene.renderedVideoUrl && (
                  <button
                    onClick={() => {
                      if (!previewVideoRef.current) return;
                      if (previewVideoRef.current.paused) {
                        previewVideoRef.current.play();
                      } else {
                        previewVideoRef.current.pause();
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl">
                      {isPreviewPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </div>
                  </button>
                )}

                {/* Live Subtitle Preview inside Monitor */}
                {showPreviewCc && currentScene.subtitleEnabled !== false && (currentScene.subtitleText || currentScene.dialogueScript) && (
                  <div
                    className={`absolute left-3 right-3 text-center pointer-events-none px-2 ${
                      currentScene.subtitlePosition === 'top'
                        ? 'top-3'
                        : currentScene.subtitlePosition === 'center'
                        ? 'top-1/2 -translate-y-1/2'
                        : 'bottom-3'
                    }`}
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-[11px] font-bold leading-snug max-w-full line-clamp-2 ${
                        currentScene.subtitleStyle === 'tiktok'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-lg'
                          : currentScene.subtitleStyle === 'glow'
                          ? 'bg-black/40 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                          : currentScene.subtitleStyle === 'outline'
                          ? 'bg-transparent text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]'
                          : 'bg-black/80 text-white border border-white/10'
                      }`}
                    >
                      {cleanSubtitleText(currentScene.subtitleText || currentScene.dialogueScript || '')}
                    </span>
                  </div>
                )}

                {/* Badges on top of monitor */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 pointer-events-none">
                  {currentCards.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow">
                      {currentCards.length} כרטיסים בקרוסלה
                    </span>
                  )}
                  {formOverlay && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow">
                      טופס לידים פעיל
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. Scenes List Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>ציר הזמן של הסצנות ({scenes.length})</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => addAiScene()}
                  disabled={isGeneratingAi}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                  title="הוסף סצנת המשך חכמה באמצעות Gemini AI"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isGeneratingAi ? 'מייצר...' : '+ סצנת AI'}</span>
                </button>
                <button
                  onClick={addScene}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>הוסף</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px] pr-1">
              {scenes.map((scene, idx) => {
                const isSelected = idx === safeIndex;
                const sceneCardsCount = scene.overlays?.find(o => o.type === 'carousel')?.cards?.length || 0;
                const hasForm = scene.overlays?.some(o => o.type === 'form_input');

                return (
                  <div
                    key={scene.id || idx}
                    onClick={() => setSelectedSceneIndex(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-right ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate max-w-[135px]">
                            {scene.title || `סצנה ${idx + 1}`}
                          </h4>
                          {sceneCardsCount > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold">
                              {sceneCardsCount} כרט׳
                            </span>
                          )}
                          {hasForm && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                              טופס
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[165px]">
                          {scene.dialogueScript || 'ללא תסריט'}
                        </p>
                      </div>
                    </div>

                    {/* Scene Item Actions */}
                    <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => moveScene(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-25 cursor-pointer"
                        title="הזז למעלה"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveScene(idx, 1)}
                        disabled={idx === scenes.length - 1}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-25 cursor-pointer"
                        title="הזז למטה"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => duplicateScene(idx)}
                        className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer"
                        title="שכפל סצנה"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {scenes.length > 1 && (
                        <button
                          onClick={() => deleteScene(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="מחק סצנה"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8 cols): 5-Tab Deep Studio Editor */}
        {currentScene ? (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5 text-right">
            {/* Top Scene Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    סצנה #{safeIndex + 1} מתוך {scenes.length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                    ID: {currentScene.id}
                  </span>
                </div>
                <input
                  type="text"
                  value={currentScene.title}
                  onChange={e => updateScene({ title: e.target.value })}
                  className="text-base sm:text-lg font-black text-white bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 focus:border-amber-400 focus:outline-none w-full"
                  placeholder="כותרת הסצנה..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">תפקיד הסצנה:</label>
                  <select
                    value={currentScene.sceneRole || 'welcome_hook'}
                    onChange={e => updateScene({ sceneRole: e.target.value as SceneRoleType })}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="welcome_hook">פתיחה וקבלת פנים (Hook)</option>
                    <option value="feature_explainer">הצגת שירותים ומוצרים</option>
                    <option value="sales_pitch">הצעת מחיר וחבילות</option>
                    <option value="objection_handler">טיפול בהתנגדויות (FAQ)</option>
                    <option value="lead_closing">טופס לידים וסגירה</option>
                    <option value="custom">סצנה מותאמת אישית</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">משך (שניות):</label>
                  <input
                    type="number"
                    min={3}
                    max={180}
                    value={currentScene.durationSeconds || 10}
                    onChange={e => updateScene({ durationSeconds: Number(e.target.value) || 10 })}
                    className="w-16 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">אפקט מעבר:</label>
                  <select
                    value={currentScene.transitionEffect || 'fade'}
                    onChange={e => updateScene({ transitionEffect: e.target.value as TransitionEffectType })}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="fade">עמעום חלק (Fade)</option>
                    <option value="cut">חיתוך מהיר (Cut)</option>
                    <option value="zoom">זום קולנועי (Zoom)</option>
                    <option value="slide">החלקה (Slide)</option>
                    <option value="whip_pan">תנועת מצלמה (Whip Pan)</option>
                    <option value="glitch">אפקט דיגיטלי (Glitch)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5 Studio Sub-Tabs Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveSceneTab('script')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeSceneTab === 'script'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">1. תסריט ו-Banana Pro</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSceneTab('video')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeSceneTab === 'video'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">2. וידאו HeyGen / Veo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSceneTab('audio')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeSceneTab === 'audio'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">3. קריינות וקול TTS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSceneTab('subtitles')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeSceneTab === 'subtitles'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Subtitles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">4. כתוביות מונפשות</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSceneTab('interactive')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeSceneTab === 'interactive'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow'
                    : 'text-amber-300/90 hover:text-amber-200 bg-amber-500/10'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">5. כרטיסים, טפסים וזרימה</span>
              </button>
            </div>

            {/* ===================================================================== */}
            {/* TAB 1: SCRIPT, PRESENTER & BANANA PRO IMAGE GENERATION                */}
            {/* ===================================================================== */}
            {activeSceneTab === 'script' && (
              <div className="space-y-5 animate-fade-in">
                {/* Dialogue Script + Speech Direction Tags */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>תסריט הדיאלוג של הפרזנטור (כולל תגיות בימוי קול):</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {(currentScene.dialogueScript || '').split(/\s+/).filter(Boolean).length} מילים
                    </span>
                  </div>

                  {/* Speech Direction Tags Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    <span className="text-[10px] font-bold text-slate-400 ml-1">הוסף תגית בימוי:</span>
                    {SPEECH_DIRECTION_TAGS.map((item: SpeechDirectionTag) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => insertDirectionTag(item.tag)}
                        title={item.desc}
                        className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-300 hover:text-amber-300 transition cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    value={currentScene.dialogueScript || ''}
                    onChange={e =>
                      updateScene({
                        dialogueScript: e.target.value,
                        subtitleText: cleanSubtitleText(e.target.value)
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                    placeholder="כתבו כאן את הטקסט שהפרזנטור או האווטאר יאמר בסצנה זו..."
                  />
                </div>

                {/* Character & Visual Scene Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      תיאור הפרזנטור והדמות (Character Bible):
                    </label>
                    <textarea
                      rows={2}
                      value={currentScene.characterDescription || ''}
                      onChange={e => updateScene({ characterDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="למשל: פרזנטורית בלבוש מחויט יוקרתי, חיוך מזמין..."
                    />
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      התרחשות ויזואלית וזווית צילום:
                    </label>
                    <textarea
                      rows={2}
                      value={currentScene.visualDescription || ''}
                      onChange={e => updateScene({ visualDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="למשל: צילום תקריב (Medium Close-Up), תאורה חמה..."
                    />
                  </div>
                </div>

                {/* Banana Pro / Imagen 3 Background Studio */}
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black text-white">
                        מחולל תמונות רקע וסטוריבורד (Banana Pro / Google Imagen 3)
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          generateSceneImage(
                            currentScene.id,
                            currentScene.backgroundPrompt || currentScene.visualDescription || currentScene.title
                          )
                        }
                        disabled={isGeneratingImage}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isGeneratingImage ? 'מייצר תמונה ב-Imagen 3...' : 'ייצר תמונת רקע ב-AI'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePickCloudBackground}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                        <span>בחר מכספת המדיה</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileImageInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>העלה מהמחשב</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      פרומפט Banana Pro לתמונת הרקע / וידאו Veo (באנגלית או בעברית):
                    </label>
                    <input
                      type="text"
                      value={currentScene.backgroundPrompt || ''}
                      onChange={e => updateScene({ backgroundPrompt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="Cinematic luxury showroom with warm golden lighting, depth of field, 8k..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        קישור ישיר לתמונת רקע (Background / Fallback URL):
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={currentScene.backgroundMediaUrl || ''}
                        onChange={e =>
                          updateScene({
                            backgroundMediaUrl: e.target.value,
                            fallbackImageUrl: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        כותרת טקסט על המסך (On-Screen Headline):
                      </label>
                      <input
                        type="text"
                        value={currentScene.onScreenText || ''}
                        onChange={e => updateScene({ onScreenText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                        placeholder="טקסט בולט שיופיע בסצנה..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 2: AI VIDEO PRODUCTION (HEYGEN / VEO / TELEPROMPTER / STORAGE)     */}
            {/* ===================================================================== */}
            {activeSceneTab === 'video' && (
              <div className="space-y-5 animate-fade-in">
                {/* 1. KosCloudStore Media Vault & Direct Upload */}
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4" />
                      <span>מקור וידאו ראשי לסצנה (כספת המדיה KosCloudStore / העלאה ישירה)</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePickCloudVideo}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>בחר סרטון מכספת המדיה</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileVideoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>העלה קובץ MP4/WebM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openTeleprompter(currentScene.id)}
                        className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>הקלט בטלפרומפטר</span>
                      </button>
                    </div>
                  </div>

                  {uploadProgress !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-amber-300 font-bold">
                        <span>מעלה וידאו ל-Firebase Storage של הטננט...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      כתובת וידאו פעילה (Video URL - MP4 / WebM / Signed Cloud URL):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={currentScene.renderedVideoUrl || ''}
                      onChange={e =>
                        updateScene({
                          renderedVideoUrl: e.target.value,
                          videoUrl: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* 2. HeyGen AI Avatar & Talking Photo Studio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>הפקת אווטאר מדבר (HeyGen AI Studio)</span>
                        </h4>
                        {currentScene.heygenStatus && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                            {currentScene.heygenStatus}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        בחרו פרזנטור מקטלוג האווטארים, או פתחו את קטלוג HeyGen המלא / העלו תמונה מדברת (Talking Photo) לסנכרון שפתיים מלא לתסריט.
                      </p>

                      {/* Quick Built-in Presenters */}
                      <div className="grid grid-cols-3 gap-2">
                        {KOS_LIVE_AVATARS.map(av => (
                          <div
                            key={av.id}
                            onClick={() =>
                              updateScene({
                                avatarId: av.id,
                                renderedVideoUrl: av.previewVideoUrl,
                                videoUrl: av.previewVideoUrl,
                                backgroundMediaUrl: av.previewImageUrl,
                                fallbackImageUrl: av.previewImageUrl,
                                voiceId: av.voiceId,
                                videoProvider: 'heygen'
                              })
                            }
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition text-center ${
                              currentScene.avatarId === av.id
                                ? 'bg-amber-500/20 border-amber-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <img src={av.previewImageUrl} alt={av.name} className="w-10 h-10 rounded-lg object-cover" />
                            <span className="text-[10px] font-bold truncate w-full">{av.name.split('-')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => openAvatarModal(currentScene.id)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        פתח קטלוג HeyGen מלא / Talking Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => renderHeyGenScene(currentScene.id)}
                        disabled={isRenderingHeyGen}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black shadow transition cursor-pointer disabled:opacity-50"
                      >
                        {isRenderingHeyGen ? 'מרנדר אווטאר ב-HeyGen...' : 'רנדר וידאו אווטאר ב-HeyGen כעת'}
                      </button>
                    </div>
                  </div>

                  {/* 3. Google Veo 2 Video Production */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-emerald-400" />
                          <span>הפקת וידאו קולנועי (Google Veo 2)</span>
                        </h4>
                        {currentScene.veoStatus && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            {currentScene.veoStatus}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        ייצור וידאו קולנועי באיכות גבוהה ישירות מתוך תיאור הסצנה והפרומפט של Banana Pro באמצעות מנוע Google Veo 2.
                      </p>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        <span className="text-slate-500 block mb-1 font-bold">פרומפט פעיל ל-Veo:</span>
                        <p className="line-clamp-3">
                          {currentScene.backgroundPrompt || currentScene.visualDescription || currentScene.title}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => renderVeoScene(currentScene.id)}
                      disabled={isRenderingVeo}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow transition cursor-pointer disabled:opacity-50"
                    >
                      {isRenderingVeo ? 'מרנדר וידאו ב-Google Veo 2...' : 'רנדר וידאו קולנועי ב-Google Veo 2'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 3: GOOGLE GEMINI SPEECH & CLOUD TTS STUDIO                         */}
            {/* ===================================================================== */}
            {activeSceneTab === 'audio' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        <span>אולפן קריינות ודיבור (Google Cloud TTS & Gemini Speech)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        בחרו קול מקצועי, כוונו קצב ואינטונציה (SSML) וסנתזו קריינות נקייה לסצנה
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => synthesizeSceneSpeech(currentScene.id)}
                      disabled={isGeneratingTts}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer disabled:opacity-50"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isGeneratingTts ? 'מסנתז קריינות...' : 'סנתז קריינות לסצנה כעת'}</span>
                    </button>
                  </div>

                  {/* Language Filter & Voice Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">סינון לפי שפה:</label>
                      <select
                        value={ttsLangFilter}
                        onChange={e => setTtsLangFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="all">כל השפות ({GOOGLE_TTS_VOICES.length})</option>
                        <option value="he-IL">עברית (he-IL)</option>
                        <option value="en-US">אנגלית ארה״ב (en-US)</option>
                        <option value="ar-XA">ערבית (ar-XA)</option>
                        <option value="ru-RU">רוסית (ru-RU)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">בחירת קול (Voice Catalog):</label>
                      <select
                        value={currentScene.voiceId || 'he-IL-Wavenet-D'}
                        onChange={e => {
                          const selected = GOOGLE_TTS_VOICES.find((v: GoogleTtsVoice) => v.id === e.target.value);
                          updateScene({
                            voiceId: e.target.value,
                            ttsLanguageCode: selected?.languageCode || 'he-IL'
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {filteredVoices.map((v: GoogleTtsVoice) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.type} - {v.gender === 'FEMALE' ? 'אישה' : 'גבר'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={() => previewGoogleVoiceSample(currentScene.voiceId || 'he-IL-Wavenet-D')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        title="השמע דגימת קול"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>דגימה</span>
                      </button>
                    </div>
                  </div>

                  {/* SSML Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span>מהירות דיבור (Rate):</span>
                        <span className="text-amber-400">{currentScene.ttsSpeakingRate || 1.0}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.6}
                        max={1.6}
                        step={0.05}
                        value={currentScene.ttsSpeakingRate || 1.0}
                        onChange={e => updateScene({ ttsSpeakingRate: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span>גובה קול (Pitch):</span>
                        <span className="text-amber-400">{currentScene.ttsPitch || 0} st</span>
                      </div>
                      <input
                        type="range"
                        min={-8}
                        max={8}
                        step={0.5}
                        value={currentScene.ttsPitch || 0}
                        onChange={e => updateScene({ ttsPitch: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">רמת הדגשה (Emphasis):</label>
                      <select
                        value={currentScene.ttsEmphasis || 'none'}
                        onChange={e => updateScene({ ttsEmphasis: e.target.value as any })}
                        className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="none">רגיל (None)</option>
                        <option value="moderate">מודגש מתון (Moderate)</option>
                        <option value="strong">דרמטי וחזק (Strong)</option>
                        <option value="reduced">רגוע ורך (Reduced)</option>
                      </select>
                    </div>
                  </div>

                  {/* Audio Preview Player if synthesized */}
                  {currentScene.renderedAudioUrl && (
                    <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>קובץ קריינות מוכן לסצנה:</span>
                      </span>
                      <audio controls src={currentScene.renderedAudioUrl} className="h-8 max-w-xs" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 4: SUBTITLES ENGINE & STYLES                                       */}
            {/* ===================================================================== */}
            {activeSceneTab === 'subtitles' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentScene.subtitleEnabled !== false}
                        onChange={e => updateScene({ subtitleEnabled: e.target.checked })}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="text-xs font-black text-white">הצג כתוביות מונפשות על גבי הסצנה</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateScene({
                            subtitleText: cleanSubtitleText(currentScene.dialogueScript || '')
                          })
                        }
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-[11px] font-bold transition cursor-pointer"
                      >
                        סנכרן ונקה תגיות בימוי מהתסריט
                      </button>
                      <button
                        type="button"
                        onClick={() => exportSceneSubtitlesSrt(currentScene)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>SRT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => exportSceneSubtitlesVtt(currentScene)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>VTT</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtitle Text */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">טקסט הכתוביות לסצנה:</label>
                    <textarea
                      rows={2}
                      value={currentScene.subtitleText ?? cleanSubtitleText(currentScene.dialogueScript || '')}
                      onChange={e => updateScene({ subtitleText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 6 Style Presets */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2">סגנון עיצוב כתוביות (6 פריסטים):</label>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {(
                        [
                          { id: 'boxed', label: 'קופסה קלאסית' },
                          { id: 'tiktok', label: 'טיקטוק בולט' },
                          { id: 'karaoke', label: 'קריוקי מילים' },
                          { id: 'glow', label: 'זוהר ניאון' },
                          { id: 'outline', label: 'קו מתאר נקי' },
                          { id: 'minimal', label: 'מינימליסטי' }
                        ] as { id: SubtitleStylePreset; label: string }[]
                      ).map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => updateScene({ subtitleStyle: preset.id })}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                            (currentScene.subtitleStyle || 'boxed') === preset.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animation, Position, Font Size, Colors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">הנפשה:</label>
                      <select
                        value={currentScene.subtitleAnimation || 'word'}
                        onChange={e => updateScene({ subtitleAnimation: e.target.value as SubtitleAnimationType })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="word">מילה-אחר-מילה (Word)</option>
                        <option value="pop">קפיצה דינמית (Pop)</option>
                        <option value="fade">עמעום חלק (Fade)</option>
                        <option value="line">שורה מלאה (Line)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">מיקום במסך:</label>
                      <select
                        value={currentScene.subtitlePosition || 'bottom'}
                        onChange={e => updateScene({ subtitlePosition: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="bottom">למטה (Bottom)</option>
                        <option value="center">מרכז (Center)</option>
                        <option value="top">למעלה (Top)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        גודל פונט ({currentScene.subtitleFontSize || 24}px):
                      </label>
                      <input
                        type="range"
                        min={16}
                        max={48}
                        value={currentScene.subtitleFontSize || 24}
                        onChange={e => updateScene({ subtitleFontSize: Number(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer mt-1.5"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">צבע טקסט:</label>
                        <input
                          type="color"
                          value={currentScene.subtitleTextColor || '#FFFFFF'}
                          onChange={e => updateScene({ subtitleTextColor: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">צבע הדגשה:</label>
                        <input
                          type="color"
                          value={currentScene.subtitleHighlightColor || '#F59E0B'}
                          onChange={e => updateScene({ subtitleHighlightColor: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 5: INTERACTIVE FLOW, CARDS CAROUSEL (WITH COUNT) & LEAD FORMS      */}
            {/* ===================================================================== */}
            {activeSceneTab === 'interactive' && (
              <div className="space-y-6 animate-fade-in">
                {/* SECTION A: CAROUSEL CARDS BUILDER + CARD COUNT SELECTOR + PAGE SYNC */}
                <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 space-y-4 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        <span>קרוסלת כרטיסים אינטראקטיבית (Sleek Capsule Carousel)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        בחרו את כמות הכרטיסים בסצנה או שאבו מוצרים ושירותים אמיתיים ישירות מנתוני העמוד
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePullCardsFromPage}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>משוך כרטיסים מנתוני העמוד המחובר</span>
                    </button>
                  </div>

                  {/* Card Count Selector Pills (0 to 8) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">כמות כרטיסים בסצנה זו:</span>
                    {[0, 1, 2, 3, 4, 5, 6, 8].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetCardCount(num)}
                        className={`px-3 py-1 rounded-xl text-xs font-black border transition cursor-pointer ${
                          currentCards.length === num
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {num === 0 ? 'ללא כרטיסים (0)' : `${num} כרטיסים`}
                      </button>
                    ))}
                  </div>

                  {/* Cards List Editor */}
                  {currentCards.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          כותרת מעל הקרוסלה:
                        </label>
                        <input
                          type="text"
                          value={carouselOverlay?.title || ''}
                          onChange={e => updateCarouselCards(currentCards, e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                          placeholder="בחרו מתוך הקטלוג לפרטים נוספים:"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                        {currentCards.map((card, cIdx) => (
                          <div
                            key={card.id}
                            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setIconPickerState({
                                      isOpen: true,
                                      target: 'card',
                                      cardId: card.id,
                                      currentIcon: card.icon
                                    })
                                  }
                                  className="w-8 h-8 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                                  title="בחר אייקון יוקרתי לכרטיס"
                                >
                                  <PremiumVectorIcon name={card.icon || 'sparkles-gold'} className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-black text-amber-300">כרטיס #{cIdx + 1}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handlePickCardImage(card.id)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
                                  title="בחר תמונה לכרטיס מכספת המדיה"
                                >
                                  <ImageIcon className="w-3 h-3 text-amber-400" />
                                  <span>תמונה</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCarouselCards(currentCards.filter(item => item.id !== card.id))
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                                  title="מחק כרטיס"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <label className="block text-[10px] text-slate-400 font-bold mb-0.5">כותרת הכרטיס:</label>
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={e =>
                                    updateCarouselCards(
                                      currentCards.map(c => (c.id === card.id ? { ...c, title: e.target.value } : c))
                                    )
                                  }
                                  className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-0.5">מחיר / תגית:</label>
                                <input
                                  type="text"
                                  value={card.price || card.badge || ''}
                                  onChange={e =>
                                    updateCarouselCards(
                                      currentCards.map(c => (c.id === card.id ? { ...c, price: e.target.value } : c))
                                    )
                                  }
                                  placeholder="₪299 / מומלץ"
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-300"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 font-bold mb-0.5">תיאור קצר:</label>
                              <input
                                type="text"
                                value={card.subtitle || ''}
                                onChange={e =>
                                  updateCarouselCards(
                                    currentCards.map(c => (c.id === card.id ? { ...c, subtitle: e.target.value } : c))
                                  )
                                }
                                className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-0.5">טקסט כפתור:</label>
                                <input
                                  type="text"
                                  value={card.ctaText || 'לפרטים והמשך'}
                                  onChange={e =>
                                    updateCarouselCards(
                                      currentCards.map(c => (c.id === card.id ? { ...c, ctaText: e.target.value } : c))
                                    )
                                  }
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-0.5">בלחיצה עבור לסצנה:</label>
                                <select
                                  value={card.targetSceneId || ''}
                                  onChange={e =>
                                    updateCarouselCards(
                                      currentCards.map(c =>
                                        c.id === card.id ? { ...c, targetSceneId: e.target.value } : c
                                      )
                                    )
                                  }
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                                >
                                  {scenes.map((s, idx) => (
                                    <option key={s.id} value={s.id}>
                                      #{idx + 1} - {s.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION B: INTERACTIVE LEAD FORM BUILDER (KSF / CRM / WEBHOOK) */}
                <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formOverlay}
                        onChange={e => handleToggleLeadForm(e.target.checked)}
                        className="rounded accent-emerald-500 w-4 h-4"
                      />
                      <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4" />
                        <span>הפעל טופס לידים חכם בסצנה זו (מחובר ל-CRM, KSF ו-Webhook)</span>
                      </span>
                    </label>

                    {formOverlay && extractedPageSummary && (
                      <button
                        type="button"
                        onClick={() =>
                          updateFormOverlay({
                            formFields: buildFormFieldsFromPageSummary(extractedPageSummary),
                            smartFormId: extractedPageSummary.smartFormId || formOverlay.smartFormId
                          })
                        }
                        className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-bold transition cursor-pointer"
                      >
                        טען שדות מטופס העמוד המחובר
                      </button>
                    )}
                  </div>

                  {formOverlay && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">כותרת הטופס:</label>
                          <input
                            type="text"
                            value={formOverlay.title || ''}
                            onChange={e => updateFormOverlay({ title: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">טקסט כפתור השליחה:</label>
                          <input
                            type="text"
                            value={formOverlay.submitButtonText || 'שליחה והמשך'}
                            onChange={e => updateFormOverlay({ submitButtonText: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">מזהה טופס KSF / Webhook:</label>
                          <input
                            type="text"
                            dir="ltr"
                            value={formOverlay.webhookUrl || formOverlay.smartFormId || ''}
                            onChange={e =>
                              updateFormOverlay({
                                webhookUrl: e.target.value.startsWith('http') ? e.target.value : formOverlay.webhookUrl,
                                smartFormId: !e.target.value.startsWith('http') ? e.target.value : formOverlay.smartFormId
                              })
                            }
                            placeholder="ksf_form_id or https://webhook..."
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                          />
                        </div>
                      </div>

                      {/* Dynamic Form Fields List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">
                            שדות הטופס ({(formOverlay.formFields || []).length}):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentFields = formOverlay.formFields || [];
                              const nextField: LivingFormFieldConfig = {
                                key: `field_${Date.now()}`,
                                label: `שדה חדש ${currentFields.length + 1}`,
                                placeholder: 'הקלידו כאן...',
                                type: 'text',
                                required: false
                              };
                              updateFormOverlay({ formFields: [...currentFields, nextField] });
                            }}
                            className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[11px] rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>הוסף שדה לטופס</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(formOverlay.formFields || []).map((field, fIdx) => (
                            <div
                              key={field.key || fIdx}
                              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                            >
                              <div className="sm:col-span-4">
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={e => {
                                    const updated = [...(formOverlay.formFields || [])];
                                    updated[fIdx] = { ...field, label: e.target.value };
                                    updateFormOverlay({ formFields: updated });
                                  }}
                                  placeholder="תווית השדה"
                                  className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <select
                                  value={field.type}
                                  onChange={e => {
                                    const updated = [...(formOverlay.formFields || [])];
                                    updated[fIdx] = { ...field, type: e.target.value as any };
                                    updateFormOverlay({ formFields: updated });
                                  }}
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                                >
                                  <option value="text">טקסט רגיל (Text)</option>
                                  <option value="tel">טלפון (Phone)</option>
                                  <option value="email">אימייל (Email)</option>
                                  <option value="textarea">הודעה ארוכה (Textarea)</option>
                                  <option value="number">מספר (Number)</option>
                                </select>
                              </div>
                              <div className="sm:col-span-3">
                                <input
                                  type="text"
                                  value={field.placeholder || ''}
                                  onChange={e => {
                                    const updated = [...(formOverlay.formFields || [])];
                                    updated[fIdx] = { ...field, placeholder: e.target.value };
                                    updateFormOverlay({ formFields: updated });
                                  }}
                                  placeholder="Placeholder..."
                                  className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400"
                                />
                              </div>
                              <div className="sm:col-span-2 flex items-center justify-end gap-2">
                                <label className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.required !== false}
                                    onChange={e => {
                                      const updated = [...(formOverlay.formFields || [])];
                                      updated[fIdx] = { ...field, required: e.target.checked };
                                      updateFormOverlay({ formFields: updated });
                                    }}
                                    className="accent-emerald-500"
                                  />
                                  <span>חובה</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (formOverlay.formFields || []).filter((_, i) => i !== fIdx);
                                    updateFormOverlay({ formFields: updated });
                                  }}
                                  className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION C: QUICK REPLIES / BRANCHING BUTTONS */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">כפתורי הסתעפות מהירים בתחתית הסצנה (Quick Replies)</h4>
                      <p className="text-[11px] text-slate-400">כפתורי החלטה שמעבירים את הצופה לסצנה הבאה או לוואטסאפ</p>
                    </div>
                    <button
                      type="button"
                      onClick={addQuickAction}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>הוסף כפתור הסתעפות</span>
                    </button>
                  </div>

                  {currentQuickActions.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {currentQuickActions.map((act, aIdx) => (
                        <div
                          key={act.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                        >
                          <div className="sm:col-span-4">
                            <input
                              type="text"
                              value={act.label}
                              onChange={e => {
                                const next = [...currentQuickActions];
                                next[aIdx] = { ...act, label: e.target.value };
                                updateQuickActions(next);
                              }}
                              className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                              placeholder="טקסט הכפתור..."
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <select
                              value={act.variant || 'gold'}
                              onChange={e => {
                                const next = [...currentQuickActions];
                                next[aIdx] = { ...act, variant: e.target.value as any };
                                updateQuickActions(next);
                              }}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                            >
                              <option value="gold">זהב יוקרתי (Gold)</option>
                              <option value="primary">כחול ראשי (Primary)</option>
                              <option value="outline">שקוף ממוסגר (Outline)</option>
                              <option value="secondary">משני כהה (Secondary)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-4">
                            <select
                              value={act.targetSceneId || ''}
                              onChange={e => {
                                const next = [...currentQuickActions];
                                next[aIdx] = { ...act, targetSceneId: e.target.value };
                                updateQuickActions(next);
                              }}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                            >
                              {scenes.map((s, idx) => (
                                <option key={s.id} value={s.id}>
                                  מעבר לסצנה #{idx + 1}: {s.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => updateQuickActions(currentQuickActions.filter((_, i) => i !== aIdx))}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION D: PLAYBACK, AUTO-TRANSITION & MIC TRIGGER SETTINGS */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>הגדרות ניגון, מעבר אוטומטי וכפתור מיקרופון / טריגר מרכזי</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={currentScene.autoPlay !== false}
                        onChange={e => updateScene({ autoPlay: e.target.checked })}
                        className="accent-amber-500"
                      />
                      <span>ניגון אוטומטי (AutoPlay)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={currentScene.loopUntilTrigger !== false}
                        onChange={e => updateScene({ loopUntilTrigger: e.target.checked })}
                        className="accent-amber-500"
                      />
                      <span>לולאה עד בחירת גולש</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={currentScene.enableVoiceTrigger !== false}
                        onChange={e => updateScene({ enableVoiceTrigger: e.target.checked })}
                        className="accent-amber-500"
                      />
                      <span>שיחה קולית עם AI</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={!!currentScene.autoTransitionOnEnd}
                        onChange={e => updateScene({ autoTransitionOnEnd: e.target.checked })}
                        className="accent-amber-500"
                      />
                      <span>מעבר אוטומטי בסיום</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">מיקום כפתור המיקרופון / טריגר:</label>
                      <select
                        value={currentScene.micPosition || 'bottom'}
                        onChange={e => updateScene({ micPosition: e.target.value as any })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="bottom">פינה תחתונה (Bottom Floating)</option>
                        <option value="center">במרכז המסך (Center Pulse)</option>
                        <option value="screen_center_trigger">טריגר הקלקה על כל המסך</option>
                        <option value="hidden">מוסתר בסצנה זו</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">אייקון יוקרתי לכפתור הטריגר:</label>
                      <button
                        type="button"
                        onClick={() =>
                          setIconPickerState({
                            isOpen: true,
                            target: 'mic',
                            currentIcon: currentScene.micIcon || 'mic-luxury'
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-amber-300 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <PremiumVectorIcon name={currentScene.micIcon || 'mic-luxury'} className="w-4 h-4" />
                          <span>{currentScene.micIcon || 'mic-luxury'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">שנה אייקון</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">סצנת יעד במעבר אוטומטי:</label>
                      <select
                        value={currentScene.autoTransitionTarget || ''}
                        onChange={e =>
                          updateScene({
                            autoTransitionTarget: e.target.value,
                            nextSceneId: e.target.value
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="">-- ללא מעבר אוטומטי --</option>
                        {scenes.map((s, idx) => (
                          <option key={s.id} value={s.id}>
                            סצנה #{idx + 1}: {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Luxury Vector Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerState.isOpen}
        selectedIcon={iconPickerState.currentIcon || 'sparkles-gold'}
        onClose={() => setIconPickerState({ ...iconPickerState, isOpen: false })}
        onSelect={iconName => {
          if (iconPickerState.target === 'mic') {
            updateScene({ micIcon: iconName });
          } else if (iconPickerState.target === 'card' && iconPickerState.cardId) {
            updateCarouselCards(
              currentCards.map(c => (c.id === iconPickerState.cardId ? { ...c, icon: iconName } : c))
            );
          }
          setIconPickerState({ ...iconPickerState, isOpen: false });
        }}
      />
    </div>
  );
};
