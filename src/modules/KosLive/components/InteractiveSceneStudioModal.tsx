import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Video,
  Plus,
  Trash2,
  Save,
  Check,
  Eye,
  Sliders,
  Volume2,
  VolumeX,
  RotateCw,
  Play,
  Clock,
  ArrowRightCircle,
  Mic,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  HardDrive
} from 'lucide-react';
import {
  LivingCampaignContract,
  LivingSceneContract,
  LivingOverlayItem,
  LivingCarouselCardItem
} from '../types';
import { PREMIUM_ICONS, PremiumVectorIcon } from '../utils/premiumIcons';
import { IconPickerModal } from './IconPickerModal';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { LivingStorageService } from '../services/livingStorageService';
import {
  pickMediaFromGallery,
  uploadFileAndSyncToGallery
} from '../services/livingMediaGalleryBridge';

export interface InteractiveSceneStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: LivingCampaignContract;
  currentSceneId?: string;
  initialSceneId?: string;
  onApplyCampaign: (updatedCampaign: LivingCampaignContract, targetSceneId?: string) => void;
}

export const InteractiveSceneStudioModal: React.FC<InteractiveSceneStudioModalProps> = ({
  isOpen,
  onClose,
  campaign,
  currentSceneId,
  initialSceneId,
  onApplyCampaign
}) => {
  const { db, storage } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();

  const [editingCampaign, setEditingCampaign] = useState<LivingCampaignContract>(() =>
    JSON.parse(JSON.stringify(campaign))
  );
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    initialSceneId ||
      currentSceneId ||
      campaign.initialSceneId ||
      Object.keys(campaign.scenes || {})[0] ||
      ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Upload states
  const [uploadingVideoSceneId, setUploadingVideoSceneId] = useState<string | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [uploadingImageSceneId, setUploadingImageSceneId] = useState<string | null>(null);
  const [uploadingCardIndex, setUploadingCardIndex] = useState<number | null>(null);

  // Icon Picker Modal State
  const [iconPickerConfig, setIconPickerConfig] = useState<{
    isOpen: boolean;
    onSelect: (iconId: string) => void;
    selectedIconId?: string;
    title?: string;
  }>({
    isOpen: false,
    onSelect: () => {}
  });

  useEffect(() => {
    if (isOpen) {
      const cloned: LivingCampaignContract = JSON.parse(JSON.stringify(campaign));
      setEditingCampaign(cloned);
      const targetId =
        initialSceneId ||
        currentSceneId ||
        cloned.initialSceneId ||
        Object.keys(cloned.scenes || {})[0] ||
        '';
      setSelectedSceneId(targetId);
    }
  }, [isOpen, campaign, currentSceneId, initialSceneId]);

  if (!isOpen) return null;

  const scenesMap = editingCampaign.scenes || {};
  const sceneList = Object.values(scenesMap);
  const currentScene: LivingSceneContract | null = scenesMap[selectedSceneId] || sceneList[0] || null;

  const handleUpdateScene = (sceneId: string, updates: Partial<LivingSceneContract>) => {
    setEditingCampaign(prev => {
      const existing = prev.scenes[sceneId];
      if (!existing) return prev;
      return {
        ...prev,
        scenes: {
          ...prev.scenes,
          [sceneId]: {
            ...existing,
            ...updates
          }
        }
      };
    });
  };

  const handleAddNewScene = () => {
    const newSceneId = `scene_${Date.now().toString(36)}`;
    const firstSceneId = editingCampaign.initialSceneId || Object.keys(scenesMap)[0] || newSceneId;
    const newScene: LivingSceneContract = {
      id: newSceneId,
      title: `סצנה חדשה ${sceneList.length + 1}`,
      scriptText: 'שלום! בחרו מתוך הכרטיסיות שלפניכם או לחצו על המיקרופון לשיחה חיה.',
      videoUrl: '',
      fallbackImageUrl: '',
      durationSeconds: 10,
      autoPlay: true,
      loopUntilTrigger: true,
      soundEnabled: true,
      autoTransitionOnEnd: false,
      enableVoiceTrigger: true,
      micPosition: 'center',
      micIcon: 'mic-luxury',
      micTargetAction: 'open_text_input',
      overlays: [
        {
          id: `ov_carousel_${Date.now()}`,
          type: 'carousel',
          position: 'bottom',
          title: 'בחרו אפשרות להמשך:',
          subtitle: 'לחצו על כרטיסייה למידע נוסף',
          cards: [
            {
              id: `card_${Date.now()}_1`,
              title: 'כרטיסייה ראשונה',
              subtitle: 'תיאור קצר של המוצר או השירות',
              description: 'תיאור קצר של המוצר או השירות',
              icon: 'sparkles-gold',
              badge: 'מומלץ',
              ctaText: 'לפרטים והמשך',
              actionType: 'transition',
              targetSceneId: firstSceneId
            }
          ]
        }
      ]
    };

    setEditingCampaign(prev => ({
      ...prev,
      scenes: {
        ...prev.scenes,
        [newSceneId]: newScene
      }
    }));
    setSelectedSceneId(newSceneId);
  };

  const handleDeleteScene = (sceneId: string) => {
    const keys = Object.keys(scenesMap);
    if (keys.length <= 1) {
      alert('חייבת להישאר לפחות סצנה אחת בעמוד החי.');
      return;
    }

    setEditingCampaign(prev => {
      const nextScenes = { ...prev.scenes };
      delete nextScenes[sceneId];
      const remaining = Object.keys(nextScenes);
      return {
        ...prev,
        initialSceneId: prev.initialSceneId === sceneId ? remaining[0] : prev.initialSceneId,
        scenes: nextScenes
      };
    });

    const remainingKeys = keys.filter(k => k !== sceneId);
    if (remainingKeys.length > 0) {
      setSelectedSceneId(remainingKeys[0]);
    }
  };

  // --- Media Gallery & File Upload Handlers ---

  const handlePickSceneVideoFromGallery = async (sceneId: string) => {
    const pickedUrl = await pickMediaFromGallery(getCapability, 'video');
    if (pickedUrl) {
      handleUpdateScene(sceneId, { videoUrl: pickedUrl });
    }
  };

  const handleSceneVideoFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sceneId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    handleUpdateScene(sceneId, {
      videoUrl: objectUrl,
      mediaName: file.name
    });

    setUploadingVideoSceneId(sceneId);
    setVideoUploadProgress(15);
    try {
      const { url, mediaId } = await uploadFileAndSyncToGallery(file, file.name, 'video', {
        storage: storage as any,
        db: db as any,
        tenantId,
        tags: ['סצנה', editingCampaign.name || ''],
        onProgress: pct => setVideoUploadProgress(pct)
      });
      handleUpdateScene(sceneId, {
        videoUrl: url,
        mediaId,
        mediaName: file.name
      });
      setVideoUploadProgress(100);
    } catch (err) {
      console.warn('[InteractiveSceneStudioModal] Video upload notice:', err);
    } finally {
      setTimeout(() => {
        setUploadingVideoSceneId(null);
        setVideoUploadProgress(0);
      }, 600);
      e.target.value = '';
    }
  };

  const handlePickSceneImageFromGallery = async (sceneId: string) => {
    const pickedUrl = await pickMediaFromGallery(getCapability, 'image');
    if (pickedUrl) {
      handleUpdateScene(sceneId, { fallbackImageUrl: pickedUrl });
    }
  };

  const handleSceneImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sceneId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    handleUpdateScene(sceneId, { fallbackImageUrl: objectUrl });

    setUploadingImageSceneId(sceneId);
    try {
      const { url } = await uploadFileAndSyncToGallery(file, file.name, 'image', {
        storage: storage as any,
        db: db as any,
        tenantId,
        tags: ['רקע_סצנה', editingCampaign.name || '']
      });
      handleUpdateScene(sceneId, { fallbackImageUrl: url });
    } catch (err) {
      console.warn('[InteractiveSceneStudioModal] Scene image upload notice:', err);
    } finally {
      setUploadingImageSceneId(null);
      e.target.value = '';
    }
  };

  // --- Carousel & Cards Management ---

  const getCarouselOverlay = (): LivingOverlayItem | undefined => {
    return currentScene?.overlays?.find(o => o.type === 'carousel');
  };

  const getCarouselCards = (): LivingCarouselCardItem[] => {
    const ov = getCarouselOverlay();
    return ov?.cards || ov?.carouselItems || [];
  };

  const handleToggleCarousel = (enable: boolean) => {
    if (!currentScene) return;
    let updatedOverlays = [...(currentScene.overlays || [])];
    if (enable) {
      if (!getCarouselOverlay()) {
        const firstSceneId = editingCampaign.initialSceneId || Object.keys(scenesMap)[0] || currentScene.id;
        const newCarousel: LivingOverlayItem = {
          id: `ov_carousel_${Date.now()}`,
          type: 'carousel',
          position: 'bottom',
          title: 'בחרו מתוך האפשרויות:',
          subtitle: 'לחצו על כרטיסייה להמשך',
          cards: [
            {
              id: `card_${Date.now()}_1`,
              title: 'כרטיסייה ראשונה',
              subtitle: 'תיאור קצר של האפשרות',
              description: 'תיאור קצר של האפשרות',
              icon: 'sparkles-gold',
              badge: 'מומלץ',
              ctaText: 'לפרטים והמשך',
              actionType: 'transition',
              targetSceneId: firstSceneId
            }
          ]
        };
        updatedOverlays.push(newCarousel);
      }
    } else {
      updatedOverlays = updatedOverlays.filter(o => o.type !== 'carousel');
    }
    handleUpdateScene(currentScene.id, { overlays: updatedOverlays });
  };

  const handleUpdateCarouselOverlay = (updates: Partial<LivingOverlayItem>) => {
    if (!currentScene) return;
    const existing = getCarouselOverlay();
    if (!existing) return;
    const updatedOverlays = (currentScene.overlays || []).map(o =>
      o.type === 'carousel' ? { ...o, ...updates } : o
    );
    handleUpdateScene(currentScene.id, { overlays: updatedOverlays });
  };

  const handleSetCardsCount = (targetCount: number) => {
    if (!currentScene) return;
    if (targetCount <= 0) {
      handleToggleCarousel(false);
      return;
    }

    const firstSceneId = editingCampaign.initialSceneId || Object.keys(scenesMap)[0] || currentScene.id;
    const existingCards = getCarouselCards();
    let nextCards = [...existingCards];

    if (targetCount < nextCards.length) {
      nextCards = nextCards.slice(0, targetCount);
    } else {
      const icons = ['sparkles-gold', 'crown-gold', 'rocket-gold', 'shield-gold', 'gem-gold', 'star-gold'];
      while (nextCards.length < targetCount) {
        const idx = nextCards.length + 1;
        nextCards.push({
          id: `card_${Date.now()}_${idx}`,
          title: `כרטיסייה #${idx}`,
          subtitle: 'תיאור קצר של המוצר או השירות',
          description: 'תיאור קצר של המוצר או השירות',
          icon: icons[(idx - 1) % icons.length],
          badge: idx === 1 ? 'פופולרי' : undefined,
          ctaText: 'לפרטים והמשך',
          actionType: 'transition',
          targetSceneId: firstSceneId
        });
      }
    }

    if (!getCarouselOverlay()) {
      const newCarousel: LivingOverlayItem = {
        id: `ov_carousel_${Date.now()}`,
        type: 'carousel',
        position: 'bottom',
        title: 'בחרו מתוך האפשרויות:',
        subtitle: 'לחצו על כרטיסייה להמשך',
        cards: nextCards
      };
      handleUpdateScene(currentScene.id, {
        overlays: [...(currentScene.overlays || []), newCarousel]
      });
    } else {
      handleUpdateCarouselOverlay({ cards: nextCards, carouselItems: nextCards });
    }
  };

  const handleAddCardToCarousel = () => {
    const current = getCarouselCards();
    handleSetCardsCount(current.length + 1);
  };

  const handleUpdateCard = (cardIndex: number, cardUpdates: Partial<LivingCarouselCardItem>) => {
    const cards = [...getCarouselCards()];
    if (!cards[cardIndex]) return;
    const updatedCard: LivingCarouselCardItem = {
      ...cards[cardIndex],
      ...cardUpdates
    };
    if (cardUpdates.description !== undefined && cardUpdates.subtitle === undefined) {
      updatedCard.subtitle = cardUpdates.description;
    }
    if (cardUpdates.subtitle !== undefined && cardUpdates.description === undefined) {
      updatedCard.description = cardUpdates.subtitle;
    }
    cards[cardIndex] = updatedCard;
    handleUpdateCarouselOverlay({ cards, carouselItems: cards });
  };

  const handleDeleteCard = (cardIndex: number) => {
    const cards = getCarouselCards().filter((_, idx) => idx !== cardIndex);
    handleUpdateCarouselOverlay({ cards, carouselItems: cards });
  };

  const handlePickCardImageFromGallery = async (cardIndex: number) => {
    const pickedUrl = await pickMediaFromGallery(getCapability, 'image');
    if (pickedUrl) {
      handleUpdateCard(cardIndex, { imageUrl: pickedUrl });
    }
  };

  const handleCardImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    cardIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentScene) return;

    const objectUrl = URL.createObjectURL(file);
    handleUpdateCard(cardIndex, { imageUrl: objectUrl });

    setUploadingCardIndex(cardIndex);
    try {
      const { url } = await uploadFileAndSyncToGallery(file, file.name, 'image', {
        storage: storage as any,
        db: db as any,
        tenantId,
        tags: ['כרטיסייה', editingCampaign.name || '']
      });
      handleUpdateCard(cardIndex, { imageUrl: url });
    } catch (err) {
      console.warn('[InteractiveSceneStudioModal] Card image upload notice:', err);
    } finally {
      setUploadingCardIndex(null);
      e.target.value = '';
    }
  };

  const handleSaveAndApply = async () => {
    if (uploadingVideoSceneId) {
      alert('העלאת קובץ הווידאו לענן עדיין בעיצומה. אנא המתינו לסיום ההעלאה.');
      return;
    }

    setIsSaving(true);
    const targetSceneToRun =
      selectedSceneId || editingCampaign.initialSceneId || Object.keys(scenesMap)[0] || '';

    // 1. Apply immediately to live player & studio context
    onApplyCampaign(editingCampaign, targetSceneToRun);
    setSavedSuccess(true);

    // 2. Persist in background to Firestore & LocalStorage
    try {
      await LivingStorageService.saveCampaign(db as any, tenantId, editingCampaign);
    } catch (err) {
      console.warn('[InteractiveSceneStudioModal] Save campaign notice:', err);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 350);
    }
  };

  const currentCarousel = getCarouselOverlay();
  const currentCards = getCarouselCards();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in text-slate-100 select-none font-sans"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                סטודיו סצנות, וידאו, תמונות וכרטיסיות (הנגן האינטראקטיבי)
              </h2>
              <p className="text-xs text-slate-400">
                צרו וערכו סצנות, העלו או בחרו וידאו ותמונות מגלריית המדיה, הגדירו קרוסלת כרטיסים וטריגרים לכל צומת
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (2 Columns: Scenes Sidebar + Full Scene Builder) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar: Scenes / Nodes List */}
          <div className="w-full md:w-64 bg-slate-950/60 border-l border-slate-800 p-3 overflow-y-auto space-y-2 shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-black text-slate-300">
                סצנות וצמתים ({sceneList.length})
              </span>
              <button
                type="button"
                onClick={handleAddNewScene}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1 text-xs font-black transition cursor-pointer shadow"
                title="הוסף סצנה חדשה"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף סצנה</span>
              </button>
            </div>

            {sceneList.map((scene, idx) => {
              const isSelected = scene.id === currentScene?.id;
              const hasVideo = !!scene.videoUrl;
              const hasImage = !!scene.fallbackImageUrl;
              const cardsCount =
                scene.overlays?.find(o => o.type === 'carousel')?.cards?.length ||
                scene.overlays?.find(o => o.type === 'carousel')?.carouselItems?.length ||
                0;

              return (
                <div
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : hasVideo
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-xs truncate">{scene.title}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className={hasVideo ? 'text-emerald-400' : 'text-amber-400'}>
                          {hasVideo ? 'וידאו' : hasImage ? 'תמונה' : 'ללא מדיה'}
                        </span>
                        {cardsCount > 0 && <span>• {cardsCount} כרטיסים</span>}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Main Area: Selected Scene Full Builder */}
          {currentScene && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-900/40">
              {/* 1. Campaign Global Info & Forms Webhook */}
              <div className="p-3.5 bg-slate-950/90 border border-amber-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-amber-400">
                  <span>הגדרות קמפיין ועמוד חי ראשיות</span>
                  <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                    ID: {editingCampaign.slug || editingCampaign.id}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">שם העמוד החי / הקמפיין</label>
                    <input
                      type="text"
                      value={editingCampaign.name}
                      onChange={e =>
                        setEditingCampaign(prev => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-amber-300 font-bold mb-1">
                      סלאג ייחודי לקישור (Slug ID)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={editingCampaign.slug || editingCampaign.id}
                      onChange={e =>
                        setEditingCampaign(prev => ({
                          ...prev,
                          slug: e.target.value,
                          id: e.target.value
                        }))
                      }
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      כתובת API לקליטת לידים מטפסים (Webhook)
                    </label>
                    <input
                      type="url"
                      dir="ltr"
                      placeholder="https://api.yourdomain.com/leads"
                      value={editingCampaign.formsApiEndpoint || ''}
                      onChange={e =>
                        setEditingCampaign(prev => ({
                          ...prev,
                          formsApiEndpoint: e.target.value
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Scene Name & Script */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    שם הסצנה / הצומת
                  </label>
                  <input
                    type="text"
                    value={currentScene.title}
                    onChange={e => handleUpdateScene(currentScene.id, { title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    תסריט דיבור / תיאור עבור ה-AI והכתוביות
                  </label>
                  <input
                    type="text"
                    value={currentScene.scriptText || ''}
                    onChange={e =>
                      handleUpdateScene(currentScene.id, {
                        scriptText: e.target.value,
                        subtitleText: e.target.value
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    כתובת API ייעודית לסצנה (אופציונלי)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="עוקף את ה-API הכללי"
                    value={currentScene.formsApiEndpoint || ''}
                    onChange={e =>
                      handleUpdateScene(currentScene.id, { formsApiEndpoint: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* ===================================================================== */}
              {/* 3. SCENE VIDEO & SCENE IMAGE UPLOAD + MEDIA GALLERY PICKER            */}
              {/* ===================================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* BOX A: סרטון הווידאו של הסצנה */}
                <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                      <Video className="w-4 h-4" />
                      <span>סרטון הווידאו של הסצנה</span>
                    </div>
                    {currentScene.videoUrl && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800/50 font-bold">
                        סרטון מחובר
                      </span>
                    )}
                  </div>

                  {/* Upload Progress Bar */}
                  {uploadingVideoSceneId === currentScene.id && (
                    <div className="p-3 bg-indigo-950/80 border border-indigo-500/50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-indigo-200 font-bold">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                          <span>מעלה סרטון ושומר בגלריית המדיה...</span>
                        </span>
                        <span className="text-amber-400">{videoUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-300"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: File Upload + Media Gallery Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 px-3 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition">
                      <Upload className="w-4 h-4 shrink-0" />
                      <span>העלה וידאו (נשמר בגלריה)</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={e => handleSceneVideoFileUpload(e, currentScene.id)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handlePickSceneVideoFromGallery(currentScene.id)}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 border border-amber-500/40 shadow transition cursor-pointer"
                    >
                      <HardDrive className="w-4 h-4 shrink-0" />
                      <span>בחר וידאו מגלריית המדיה</span>
                    </button>
                  </div>

                  {/* Direct Video URL */}
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://.../video.mp4"
                    value={currentScene.videoUrl || ''}
                    onChange={e => handleUpdateScene(currentScene.id, { videoUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />

                  {/* Live Video Preview */}
                  {currentScene.videoUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-black max-h-44 flex items-center justify-center border border-slate-800">
                      <video
                        key={currentScene.videoUrl}
                        src={currentScene.videoUrl}
                        controls
                        playsInline
                        className="max-h-44 object-contain w-full"
                      />
                    </div>
                  )}
                </div>

                {/* BOX B: תמונת הסצנה / תמונת רקע (Fallback / Poster Image) */}
                <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                      <ImageIcon className="w-4 h-4" />
                      <span>תמונת הסצנה / תמונת רקע ופוסטר</span>
                    </div>
                    {currentScene.fallbackImageUrl && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800/50 font-bold">
                        תמונה מחוברת
                      </span>
                    )}
                  </div>

                  {uploadingImageSceneId === currentScene.id && (
                    <div className="p-2.5 bg-indigo-950/80 border border-indigo-500/50 rounded-xl flex items-center gap-2 text-xs text-indigo-200 font-bold">
                      <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>מעלה תמונה ושומר בגלריית המדיה...</span>
                    </div>
                  )}

                  {/* Action Buttons: File Upload + Media Gallery Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition">
                      <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>העלה תמונה (נשמר בגלריה)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleSceneImageFileUpload(e, currentScene.id)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handlePickSceneImageFromGallery(currentScene.id)}
                      className="px-3 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-black text-xs flex items-center justify-center gap-1.5 border border-indigo-500/40 shadow transition cursor-pointer"
                    >
                      <HardDrive className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>בחר תמונה מגלריית המדיה</span>
                    </button>
                  </div>

                  {/* Direct Image URL */}
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://.../scene-image.jpg"
                    value={currentScene.fallbackImageUrl || ''}
                    onChange={e =>
                      handleUpdateScene(currentScene.id, { fallbackImageUrl: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />

                  {/* Live Image Preview */}
                  {currentScene.fallbackImageUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-black max-h-44 flex items-center justify-center border border-slate-800">
                      <img
                        src={currentScene.fallbackImageUrl}
                        alt={currentScene.title}
                        className="max-h-44 object-contain w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ===================================================================== */}
              {/* 4. CARDS & CAROUSEL EDITOR (WITH GALLERY & FILE UPLOAD PER CARD!)     */}
              {/* ===================================================================== */}
              <div className="bg-black/60 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                    <Layers className="w-4 h-4" />
                    <span>עריכת כרטיסיות וקרוסלה לסצנה זו ({currentCards.length} כרטיסיות)</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Quick Card Count Pills */}
                    <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold ml-1">כמות כרטיסים:</span>
                      {[0, 1, 2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSetCardsCount(num)}
                          className={`w-6 h-6 rounded-lg text-[10px] font-black transition cursor-pointer ${
                            currentCards.length === num
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCardToCarousel}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>הוסף כרטיסייה</span>
                    </button>
                  </div>
                </div>

                {currentCarousel && currentCards.length > 0 ? (
                  <div className="space-y-4">
                    {/* Carousel Title & Subtitle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          כותרת ראשית לקרוסלה
                        </label>
                        <input
                          type="text"
                          value={currentCarousel.title || ''}
                          onChange={e => handleUpdateCarouselOverlay({ title: e.target.value })}
                          placeholder="לדוגמה: במה תרצו להתמקד כעת?"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          תת-כותרת / הנחיה
                        </label>
                        <input
                          type="text"
                          value={currentCarousel.subtitle || ''}
                          onChange={e => handleUpdateCarouselOverlay({ subtitle: e.target.value })}
                          placeholder="לדוגמה: בחרו מתוך האפשרויות הבאות"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-3">
                      {currentCards.map((card, cardIndex) => (
                        <div
                          key={card.id || cardIndex}
                          className="p-3.5 bg-slate-900/90 border border-amber-500/30 rounded-2xl space-y-3 transition-all hover:border-amber-500/60"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
                                {cardIndex + 1}
                              </span>
                              <span>{card.title || 'כרטיסייה ללא שם'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(cardIndex)}
                              className="text-xs text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                              title="מחק כרטיסייה"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                כותרת הכרטיסייה
                              </label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={e =>
                                  handleUpdateCard(cardIndex, { title: e.target.value })
                                }
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                תיאור קצר
                              </label>
                              <input
                                type="text"
                                value={card.subtitle || card.description || ''}
                                onChange={e =>
                                  handleUpdateCard(cardIndex, {
                                    subtitle: e.target.value,
                                    description: e.target.value
                                  })
                                }
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-amber-400 font-bold mb-1">
                                קישור לסצנת יעד בלחיצה
                              </label>
                              <select
                                value={card.targetSceneId || ''}
                                onChange={e =>
                                  handleUpdateCard(cardIndex, {
                                    targetSceneId: e.target.value,
                                    actionType: 'transition'
                                  })
                                }
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
                              >
                                {sceneList.map((target, tIdx) => (
                                  <option key={target.id} value={target.id}>
                                    ➡️ #{tIdx + 1} - {target.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start pt-1">
                            {/* Luxury Vector Icon */}
                            <div>
                              <label className="block text-[11px] text-slate-300 font-bold mb-1">
                                אייקון כרטיסייה
                              </label>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-amber-400/80 flex items-center justify-center shrink-0">
                                  <PremiumVectorIcon
                                    name={card.icon || 'sparkles-gold'}
                                    className="w-4 h-4"
                                  />
                                </div>
                                {['coins', 'dollar', 'sparkles', 'rocket', 'gift', 'crown'].map(
                                  icId => {
                                    const isSel = (card.icon || 'sparkles') === icId;
                                    return (
                                      <button
                                        key={icId}
                                        type="button"
                                        onClick={() => handleUpdateCard(cardIndex, { icon: icId })}
                                        className={`w-7 h-7 rounded-lg border transition flex items-center justify-center cursor-pointer ${
                                          isSel
                                            ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300'
                                        }`}
                                      >
                                        <PremiumVectorIcon
                                          name={icId}
                                          className="w-3.5 h-3.5"
                                          isGold={isSel}
                                        />
                                      </button>
                                    );
                                  }
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setIconPickerConfig({
                                      isOpen: true,
                                      title: `בחר אייקון לכרטיסייה ${cardIndex + 1} (${card.title})`,
                                      selectedIconId: card.icon,
                                      onSelect: selectedId =>
                                        handleUpdateCard(cardIndex, { icon: selectedId })
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-600/60 text-[10px] font-bold text-indigo-300 flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-400" />
                                  <span>ספרייה מלאה</span>
                                </button>
                              </div>
                            </div>

                            {/* Badge / Price */}
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                תגית מיוחדת / מחיר (Badge)
                              </label>
                              <input
                                type="text"
                                value={card.badge || card.price || ''}
                                onChange={e =>
                                  handleUpdateCard(cardIndex, {
                                    badge: e.target.value,
                                    price: e.target.value
                                  })
                                }
                                placeholder="מומלץ / פופולרי / ₪299"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
                              />
                            </div>

                            {/* Card Image Upload + Gallery Picker + Preview */}
                            <div>
                              <label className="block text-[11px] text-slate-300 font-bold mb-1">
                                תמונת כרטיסייה (העלאה או בחירה מהגלריה)
                              </label>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition shrink-0">
                                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                                    <span>
                                      {uploadingCardIndex === cardIndex ? 'מעלה...' : 'העלה קובץ'}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={e => handleCardImageFileUpload(e, cardIndex)}
                                      className="hidden"
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => handlePickCardImageFromGallery(cardIndex)}
                                    className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 text-indigo-200 text-[11px] font-bold flex items-center gap-1 border border-indigo-600/60 transition shrink-0"
                                  >
                                    <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>מהגלריה</span>
                                  </button>

                                  {card.imageUrl && (
                                    <img
                                      src={card.imageUrl}
                                      alt={card.title}
                                      className="w-8 h-8 rounded-lg object-cover border border-amber-500/50 shrink-0"
                                    />
                                  )}
                                </div>
                                <input
                                  type="url"
                                  dir="ltr"
                                  placeholder="https://.../card-image.jpg"
                                  value={card.imageUrl || ''}
                                  onChange={e =>
                                    handleUpdateCard(cardIndex, { imageUrl: e.target.value })
                                  }
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white font-mono placeholder-slate-600 focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    קרוסלת הכרטיסיות אינה פעילה בסצנה זו. בחרו כמות כרטיסים למעלה או לחצו על &quot;הוסף כרטיסייה&quot;.
                  </div>
                )}
              </div>

              {/* ===================================================================== */}
              {/* 5. TRIGGER & PLAYBACK SETTINGS (MIC, LOOP, SOUND, AUTO-TRANSITION)    */}
              {/* ===================================================================== */}
              <div className="bg-black/60 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 border-b border-slate-800 pb-2.5">
                  <Sliders className="w-4 h-4" />
                  <span>הגדרות טריגרים והפעלה לסצנה זו</span>
                </div>

                {/* Playback & Sound Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50">
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-bold">
                      <Play className="w-4 h-4 text-emerald-400" />
                      <span>הפעלה אוטומטית</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentScene.autoPlay ?? true}
                      onChange={e =>
                        handleUpdateScene(currentScene.id, { autoPlay: e.target.checked })
                      }
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50">
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-bold">
                      <RotateCw className="w-4 h-4 text-indigo-400" />
                      <span>נגן בלופ עד טריגר</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentScene.loopUntilTrigger ?? true}
                      onChange={e =>
                        handleUpdateScene(currentScene.id, { loopUntilTrigger: e.target.checked })
                      }
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50">
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-bold">
                      {(currentScene.soundEnabled ?? true) ? (
                        <Volume2 className="w-4 h-4 text-amber-400" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-500" />
                      )}
                      <span>הפעל סאונד</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentScene.soundEnabled ?? true}
                      onChange={e =>
                        handleUpdateScene(currentScene.id, { soundEnabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Mic Click Trigger Settings */}
                <div className="p-3.5 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                    <div className="text-xs font-black text-amber-300 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-amber-400" />
                      <span>הגדרות וטריגר לחיצה על מיקרופון:</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-slate-300 font-bold">אייקון הכפתור:</span>
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-amber-400/80 flex items-center justify-center shrink-0">
                        <PremiumVectorIcon
                          name={currentScene.micIcon || 'mic'}
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {PREMIUM_ICONS.slice(0, 8).map(item => {
                          const IconComp = item.icon;
                          const isSelected = (currentScene.micIcon || 'mic') === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                handleUpdateScene(currentScene.id, { micIcon: item.id })
                              }
                              title={item.label}
                              className={`w-7 h-7 rounded-lg border transition flex items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() =>
                            setIconPickerConfig({
                              isOpen: true,
                              title: `בחר אייקון לכפתור המיקרופון (${currentScene.title})`,
                              selectedIconId: currentScene.micIcon,
                              onSelect: selectedId =>
                                handleUpdateScene(currentScene.id, { micIcon: selectedId })
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-600/60 text-[10px] font-bold text-indigo-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>ספרייה מלאה</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">
                        מיקום ותצוגת המיקרופון:
                      </span>
                      <select
                        value={
                          currentScene.enableVoiceTrigger === false
                            ? 'hidden'
                            : currentScene.micPosition || 'center'
                        }
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'hidden') {
                            handleUpdateScene(currentScene.id, {
                              enableVoiceTrigger: false,
                              micPosition: 'hidden'
                            });
                          } else {
                            handleUpdateScene(currentScene.id, {
                              enableVoiceTrigger: true,
                              micPosition: val as any
                            });
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
                      >
                        <option value="screen_center_trigger">
                          🎯 אמצע המסך - טריגר לסצנה הבאה
                        </option>
                        <option value="center">🟡 מיקרופון זהב (מרכז/תחתית אוטומטי)</option>
                        <option value="bottom">🔽 מיקרופון בתחתית המסך</option>
                        <option value="hidden">🚫 מוסתר בסצנה זו</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-[11px] text-amber-400 font-bold mb-1">
                        פעולת טריגר בלחיצה:
                      </span>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateScene(currentScene.id, {
                                micTargetAction: 'open_text_input',
                                micTargetSceneId: undefined
                              })
                            }
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                              (currentScene.micTargetAction || 'open_text_input') ===
                              'open_text_input'
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            📝 פתח שדה טקסט ושיחה קולית
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateScene(currentScene.id, {
                                micTargetAction: 'navigate_to_scene'
                              })
                            }
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                              currentScene.micTargetAction === 'navigate_to_scene'
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            ➡️ קישור ישיר לסצנה
                          </button>
                        </div>

                        {currentScene.micTargetAction === 'navigate_to_scene' && (
                          <select
                            value={currentScene.micTargetSceneId || ''}
                            onChange={e =>
                              handleUpdateScene(currentScene.id, {
                                micTargetSceneId: e.target.value || undefined
                              })
                            }
                            className="w-full bg-slate-950 border border-amber-500/60 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="">-- בחר סצנת יעד למעבר --</option>
                            {sceneList
                              .filter(n => n.id !== currentScene.id)
                              .map(target => (
                                <option key={target.id} value={target.id}>
                                  ➡️ {target.title}
                                </option>
                              ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto Transition */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <ArrowRightCircle className="w-4 h-4 text-amber-400" />
                    <span>מעבר אוטומטי לסצנה הבאה:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentScene.autoTransitionOnEnd ?? false}
                        onChange={e =>
                          handleUpdateScene(currentScene.id, {
                            autoTransitionOnEnd: e.target.checked
                          })
                        }
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span>בסיום שידור הווידאו</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-400">לאחר</span>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        placeholder="ללא"
                        value={currentScene.autoTransitionDelaySec ?? ''}
                        onChange={e =>
                          handleUpdateScene(currentScene.id, {
                            autoTransitionDelaySec: e.target.value
                              ? Number(e.target.value)
                              : undefined
                          })
                        }
                        className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                      />
                      <span className="text-xs text-slate-400">שניות</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 shrink-0">סצנת היעד:</span>
                      <select
                        value={currentScene.autoTransitionTargetSceneId || ''}
                        onChange={e =>
                          handleUpdateScene(currentScene.id, {
                            autoTransitionTargetSceneId: e.target.value || undefined
                          })
                        }
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="">-- ללא מעבר אוטומטי --</option>
                        {sceneList
                          .filter(n => n.id !== currentScene.id)
                          .map(target => (
                            <option key={target.id} value={target.id}>
                              {target.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Scene Button */}
              <div className="flex justify-between items-center pt-1">
                <button
                  type="button"
                  onClick={() => handleDeleteScene(currentScene.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>מחק סצנה זו</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            כל קובץ שמועלה נשמר אוטומטית בגלריית המדיה (KosCloudStore) ובפרויקט העמוד החי
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700/60 transition cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              disabled={isSaving || !!uploadingVideoSceneId}
              className={`px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 flex items-center gap-2 shadow-lg transition cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>נשמר ומופעל בנגן!</span>
                </>
              ) : isSaving ? (
                <span>שומר...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>שמור והפעל בנגן</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full Vector Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerConfig.isOpen}
        onClose={() => setIconPickerConfig(prev => ({ ...prev, isOpen: false }))}
        onSelect={iconPickerConfig.onSelect}
        selectedIcon={iconPickerConfig.selectedIconId}
        title={iconPickerConfig.title}
      />
    </div>
  );
};
