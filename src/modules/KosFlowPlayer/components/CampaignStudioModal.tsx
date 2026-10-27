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
  MousePointerClick,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { useFlowPlayerModule } from '../context/ModuleContext';
import { FirestoreService } from '../services/firestoreService';
import { FlowNodeState, CampaignConfig, CarouselCardItem, OverlayItem } from '../types';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { PREMIUM_ICONS, PremiumVectorIcon } from '../utils/premiumIcons';
import { IconPickerModal } from './IconPickerModal';

export const CampaignStudioModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialNodeId?: string;
}> = ({ isOpen, onClose, initialNodeId }) => {
  const { campaign, currentNodeId, updateCampaign } = usePlayerMachine();
  const { firebaseApp, db, collections } = useFlowPlayerModule();

  const [editingCampaign, setEditingCampaign] = useState<CampaignConfig>(() => JSON.parse(JSON.stringify(campaign)));
  const { getCapability } = useHostCapabilities();
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    initialNodeId || currentNodeId || campaign.initialNodeId || Object.keys(campaign.states)[0] || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingNodeId, setUploadingNodeId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingCardIndex, setUploadingCardIndex] = useState<number | null>(null);

  // Icon Picker Modal State
  const [iconPickerConfig, setIconPickerConfig] = useState<{
    isOpen: boolean;
    onSelect: (iconId: string) => void;
    selectedIconId?: string;
    title?: string;
  }>({
    isOpen: false,
    onSelect: () => {},
  });

  // Sync editing state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setEditingCampaign(JSON.parse(JSON.stringify(campaign)));
      setSelectedNodeId(initialNodeId || currentNodeId || campaign.initialNodeId || Object.keys(campaign.states)[0] || '');
    }
  }, [isOpen, campaign, currentNodeId, initialNodeId]);

  if (!isOpen) return null;

  const currentNode = editingCampaign.states[selectedNodeId] || null;

  const handlePickFromGallery = async (type: 'video' | 'image', nodeId?: string, cardIndex?: number) => {
    const picker = getCapability<MediaPickerContract>('media-picker');
    if (picker) {
      const res = await picker.openPicker({ accept: type === 'video' ? 'video/*' : 'image/*' });
      if (res) {
        const url = Array.isArray(res) ? res[0] : res;
        if (type === 'video' && nodeId) {
          handleUpdateNode(nodeId, {
            videoUrl: url,
            fallbackVideoUrl: url,
          });
        } else if (type === 'image' && cardIndex !== undefined) {
          handleUpdateCard(cardIndex, { imageUrl: url });
        }
      }
    } else {
      const promptUrl = window.prompt(type === 'video' ? 'הזן קישור ישיר לסרטון וידאו (URL):' : 'הזן קישור ישיר לתמונה (URL):');
      if (promptUrl) {
        if (type === 'video' && nodeId) {
          handleUpdateNode(nodeId, {
            videoUrl: promptUrl,
            fallbackVideoUrl: promptUrl,
          });
        } else if (type === 'image' && cardIndex !== undefined) {
          handleUpdateCard(cardIndex, { imageUrl: promptUrl });
        }
      }
    }
  };

  const uploadStorageBlob = async (
    file: File | Blob,
    fileName: string,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    if (!firebaseApp) {
      return URL.createObjectURL(file);
    }
    const storage = getStorage(firebaseApp);
    const storagePath = `flow_player/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) onProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, nodeId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Create local object URL for instant preview & playback
    const objectUrl = URL.createObjectURL(file);
    const mediaId = `storage_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    handleUpdateNode(nodeId, {
      videoUrl: objectUrl,
      fallbackVideoUrl: objectUrl,
      mediaId: mediaId,
      mediaName: file.name,
    });

    // 2. Upload to Firebase Storage
    setUploadingNodeId(nodeId);
    setUploadProgress(15);
    try {
      const downloadUrl = await uploadStorageBlob(file, file.name, (pct) => setUploadProgress(pct));

      // Update node with persistent URL
      handleUpdateNode(nodeId, {
        videoUrl: downloadUrl,
        fallbackVideoUrl: downloadUrl,
        mediaId: mediaId,
        mediaName: file.name,
      });
      setUploadProgress(100);
    } catch (uploadErr) {
      console.warn('[CampaignStudioModal] Cloud upload notice:', uploadErr);
    } finally {
      setTimeout(() => {
        setUploadingNodeId(null);
        setUploadProgress(0);
      }, 600);
    }
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<FlowNodeState>) => {
    setEditingCampaign((prev) => ({
      ...prev,
      states: {
        ...prev.states,
        [nodeId]: {
          ...prev.states[nodeId],
          ...updates,
        },
      },
    }));
  };

  const handleAddNewNode = () => {
    const newNodeId = `node_${Date.now().toString(36)}`;
    const newNode: FlowNodeState = {
      id: newNodeId,
      name: 'צומת חדש',
      description: 'תיאור הסצנה',
      videoUrl: '',
      autoPlay: true,
      loopUntilTrigger: true,
      soundEnabled: true,
      autoTransitionOnEnd: false,
      micPosition: 'center',
      overlays: [
        {
          id: `ov_${Date.now()}`,
          type: 'quick_replies',
          position: 'bottom',
          title: 'בחר אפשרות:',
          actions: [
            { id: `act_back`, label: 'חזרה לפתיחה', targetNodeId: editingCampaign.initialNodeId, variant: 'primary' },
          ],
        },
      ],
    };

    setEditingCampaign((prev) => ({
      ...prev,
      states: {
        ...prev.states,
        [newNodeId]: newNode,
      },
    }));
    setSelectedNodeId(newNodeId);
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardIndex: number) => {
    const file = e.target.files?.[0];
    if (!file || !currentNode) return;

    // 1. Instant local object URL
    const objectUrl = URL.createObjectURL(file);
    handleUpdateCard(cardIndex, { imageUrl: objectUrl });

    // 2. Upload to Firebase Storage
    setUploadingCardIndex(cardIndex);
    try {
      const downloadUrl = await uploadStorageBlob(file, file.name);
      handleUpdateCard(cardIndex, { imageUrl: downloadUrl });
    } catch (uploadErr) {
      console.warn('[CampaignStudioModal] Card image upload notice:', uploadErr);
    } finally {
      setUploadingCardIndex(null);
    }
  };

  const getCarouselOverlay = (): OverlayItem | undefined => {
    return currentNode?.overlays?.find((o) => o.type === 'carousel');
  };

  const handleToggleCarousel = (enable: boolean) => {
    if (!currentNode) return;

    let updatedOverlays = [...(currentNode.overlays || [])];
    if (enable) {
      if (!getCarouselOverlay()) {
        const newCarousel: OverlayItem = {
          id: `ov_carousel_${Date.now()}`,
          type: 'carousel',
          position: 'center',
          title: 'בחר מתוך האפשרויות:',
          subtitle: 'לחץ על כרטיסייה להמשך',
          carouselItems: [
            {
              id: `card_${Date.now()}_1`,
              title: 'כרטיסייה ראשונה',
              description: 'תיאור קצר של האפשרות',
              icon: '⭐',
              targetNodeId: editingCampaign.initialNodeId,
              badge: 'חדש',
            },
          ],
        };
        updatedOverlays.push(newCarousel);
      }
    } else {
      updatedOverlays = updatedOverlays.filter((o) => o.type !== 'carousel');
    }

    handleUpdateNode(currentNode.id, { overlays: updatedOverlays });
  };

  const handleUpdateCarouselHeader = (updates: Partial<OverlayItem>) => {
    if (!currentNode) return;
    const updatedOverlays = (currentNode.overlays || []).map((o) => {
      if (o.type === 'carousel') {
        return { ...o, ...updates };
      }
      return o;
    });
    handleUpdateNode(currentNode.id, { overlays: updatedOverlays });
  };

  const handleAddCardToCarousel = () => {
    if (!currentNode) return;
    const carousel = getCarouselOverlay();
    const newCard: CarouselCardItem = {
      id: `card_${Date.now().toString(36)}`,
      title: 'כרטיסייה חדשה',
      description: 'הזן תיאור כרטיסייה',
      icon: '✨',
      targetNodeId: editingCampaign.initialNodeId,
    };

    if (carousel) {
      const updatedItems = [...(carousel.carouselItems || []), newCard];
      handleUpdateCarouselHeader({ carouselItems: updatedItems });
    } else {
      handleToggleCarousel(true);
    }
  };

  const handleUpdateCard = (cardIndex: number, cardUpdates: Partial<CarouselCardItem>) => {
    if (!currentNode) return;
    const carousel = getCarouselOverlay();
    if (!carousel || !carousel.carouselItems) return;

    const updatedItems = [...carousel.carouselItems];
    updatedItems[cardIndex] = { ...updatedItems[cardIndex], ...cardUpdates };
    handleUpdateCarouselHeader({ carouselItems: updatedItems });
  };

  const handleDeleteCard = (cardIndex: number) => {
    if (!currentNode) return;
    const carousel = getCarouselOverlay();
    if (!carousel || !carousel.carouselItems) return;

    const updatedItems = carousel.carouselItems.filter((_, idx) => idx !== cardIndex);
    handleUpdateCarouselHeader({ carouselItems: updatedItems });
  };

  const handleSaveAndApply = async () => {
    if (uploadingNodeId) {
      alert('העלאת קובץ הווידאו לענן עדיין בעיצומה. אנא המתן לסיום ההעלאה כדי שהסרטון יישמר לצמיתות.');
      return;
    }

    const targetNodeToRun = selectedNodeId || editingCampaign.initialNodeId || Object.keys(editingCampaign.states)[0];

    // 1. Update live React state machine immediately with the selected node
    updateCampaign(editingCampaign, targetNodeToRun);

    // 2. Close modal immediately
    onClose();

    // 3. Persist to Firestore and LocalStorage asynchronously in background without blocking UI
    try {
      const savePromise = FirestoreService.saveCampaignConfig(db as any, collections, editingCampaign);
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 4000));
      await Promise.race([savePromise, timeoutPromise]);
    } catch (err) {
      console.warn('[Studio] Background Firestore save notice:', err);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    if (Object.keys(editingCampaign.states).length <= 1) {
      alert('חייב להישאר לפחות צומת אחד בקמפיין.');
      return;
    }

    setEditingCampaign((prev) => {
      const updated = { ...prev, states: { ...prev.states } };
      delete updated.states[nodeId];
      return updated;
    });

    const remainingKeys = Object.keys(editingCampaign.states).filter((k) => k !== nodeId);
    if (remainingKeys.length > 0) {
      setSelectedNodeId(remainingKeys[0]);
    }
  };

  const currentCarousel = getCarouselOverlay();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in text-slate-100" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">סטודיו סרטונים והגדרת טריגרים לכל צומת</h2>
              <p className="text-xs text-slate-400">הגדר הפעלה אוטומטית, ניגון בלופ, סאונד, טריגר לחיצה על מיקרופון ומעבר אוטומטי</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (2 Columns) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left / Navigation Sidebar: Nodes List */}
          <div className="w-full md:w-64 bg-slate-950/60 border-l border-slate-800 p-3 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">צמתי שיחה ({Object.keys(editingCampaign.states).length})</span>
              <button
                onClick={handleAddNewNode}
                className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-950/50 rounded flex items-center text-xs"
                title="הוסף צומת חדש"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>הוסף</span>
              </button>
            </div>

            {Object.values(editingCampaign.states).map((node) => {
              const isSelected = node.id === selectedNodeId;
              const hasVideo = !!node.videoUrl;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-yellow-500/15 border-yellow-500/80 text-white shadow-lg'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse truncate">
                    <span className={`w-2 h-2 rounded-full ${hasVideo ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate">{node.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{node.id}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <Eye className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Area: Selected Node Editor */}
          {currentNode && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-900/40">
              {/* Campaign Global Slug & Forms API Banner */}
              <div className="p-3.5 bg-slate-950/90 border border-yellow-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-yellow-400">
                  <span>הגדרות קמפיין ראשיות (Firestore Slug & Forms API)</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    נתיב שמירה: sdo_player_campaign_configs/{editingCampaign.slug || editingCampaign.id}/scenes/
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">שם הקמפיין הראשי</label>
                    <input
                      type="text"
                      value={editingCampaign.name}
                      onChange={(e) => setEditingCampaign((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-yellow-300 font-semibold mb-1">סלאג ייחודי לקולקציה (Slug ID)</label>
                    <input
                      type="text"
                      value={editingCampaign.slug || editingCampaign.id}
                      onChange={(e) => setEditingCampaign((prev) => ({ ...prev, slug: e.target.value, id: e.target.value }))}
                      placeholder="sales_rep_interactive_01"
                      className="w-full bg-slate-900 border border-yellow-500/50 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">כתובת API לקליטת INPUT מטפסים (Webhook)</label>
                    <input
                      type="url"
                      placeholder="https://api.yourdomain.com/leads"
                      value={editingCampaign.formsApiEndpoint || ''}
                      onChange={(e) => setEditingCampaign((prev) => ({ ...prev, formsApiEndpoint: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-yellow-500"
                    />
                  </div>
                </div>
              </div>

              {/* General Info for Selected Node */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">שם הצומת / הסצנה</label>
                  <input
                    type="text"
                    value={currentNode.name}
                    onChange={(e) => handleUpdateNode(currentNode.id, { name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">תיאור קצר עבור ה-AI</label>
                  <input
                    type="text"
                    value={currentNode.description || ''}
                    onChange={(e) => handleUpdateNode(currentNode.id, { description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">כתובת API ייעודית לצומת (אופציונלי)</label>
                  <input
                    type="url"
                    placeholder="עוקף את ה-API הכללי"
                    value={currentNode.formsApiEndpoint || ''}
                    onChange={(e) => handleUpdateNode(currentNode.id, { formsApiEndpoint: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* SECTION: הגדרות טריגרים והפעלה (Trigger & Playback Settings) */}
              <div className="bg-black/60 border border-yellow-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold text-yellow-400 border-b border-slate-800 pb-2.5">
                  <Sliders className="w-4 h-4 text-yellow-400" />
                  <span>הגדרות טריגרים והפעלה לצומת זה</span>
                </div>

                {/* 1. בקרות ניגון וסאונד */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* הפעלה אוטומטית */}
                  <label className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-xl cursor-pointer hover:border-yellow-500/50 transition-colors">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-200 font-medium">
                      <Play className="w-4 h-4 text-emerald-400" />
                      <span>הפעלה אוטומטית</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentNode.autoPlay ?? true}
                      onChange={(e) => handleUpdateNode(currentNode.id, { autoPlay: e.target.checked })}
                      className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* נגן בלופ עד הפעלת טריגר */}
                  <label className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-xl cursor-pointer hover:border-yellow-500/50 transition-colors">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-200 font-medium">
                      <RotateCw className="w-4 h-4 text-indigo-400" />
                      <span>נגן בלופ עד טריגר</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentNode.loopUntilTrigger ?? currentNode.loop ?? true}
                      onChange={(e) => handleUpdateNode(currentNode.id, { loopUntilTrigger: e.target.checked, loop: e.target.checked })}
                      className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* הפעל סאונד */}
                  <label className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-xl cursor-pointer hover:border-yellow-500/50 transition-colors">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-200 font-medium">
                      {(currentNode.soundEnabled ?? true) ? (
                        <Volume2 className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-500" />
                      )}
                      <span>הפעל סאונד</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentNode.soundEnabled ?? true}
                      onChange={(e) => handleUpdateNode(currentNode.id, { soundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* 2. טריגר לחיצה על מיקרופון (MIC CLICK TRIGGER) */}
                <div className="p-3.5 bg-slate-900/90 border border-yellow-500/30 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="text-xs font-bold text-yellow-300 flex items-center space-x-2 rtl:space-x-reverse">
                      <Mic className="w-4 h-4 text-yellow-400" />
                      <span>הגדרות וטריגר לחיצה על מיקרופון:</span>
                    </div>

                    {/* בחירת אייקון וקטורי יוקרתי לכפתור המיקרופון */}
                    <div className="flex items-center gap-2 rtl:space-x-reverse flex-wrap">
                      <span className="text-[11px] text-slate-300 font-semibold">אייקון הכפתור:</span>

                      {/* Active Icon Preview Badge */}
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-amber-400/80 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.3)] flex-shrink-0">
                        <PremiumVectorIcon iconKey={currentNode.micIcon || 'mic'} className="w-4 h-4" />
                      </div>

                      {/* Luxury Vector Icons Grid + Full Library Button */}
                      <div className="flex items-center gap-1.5 flex-wrap max-w-sm">
                        {PREMIUM_ICONS.slice(0, 10).map((item) => {
                          const isSelected = (currentNode.micIcon || 'mic') === item.id || (currentNode.micIcon && item.aliases.includes(currentNode.micIcon));
                          const IconComp = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleUpdateNode(currentNode.id, { micIcon: item.id })}
                              title={item.label}
                              className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center cursor-pointer transform hover:scale-115 active:scale-95 ${
                                isSelected
                                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                                  : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700'
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() =>
                            setIconPickerConfig({
                              isOpen: true,
                              title: `בחר אייקון לכפתור המיקרופון / טריגר (${currentNode.name})`,
                              selectedIconId: currentNode.micIcon,
                              onSelect: (selectedId) => handleUpdateNode(currentNode.id, { micIcon: selectedId }),
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-600/60 text-[10px] font-bold text-indigo-300 flex items-center gap-1 shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
                          title="פתח ספריית אייקונים מלאה"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>ספרייה מלאה</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
                    {/* מיקום ותצוגת המיקרופון */}
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">מיקום ותצוגת המיקרופון:</span>
                      <select
                        value={currentNode.micPosition || 'center'}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          if (val === 'screen_center_trigger') {
                            const otherNodes = Object.values(editingCampaign.states).filter((n) => n.id !== currentNode.id);
                            const defaultTarget = otherNodes[0]?.id;
                            handleUpdateNode(currentNode.id, {
                              micPosition: 'screen_center_trigger',
                              micActionType: 'navigate_to_node',
                              clickMicTargetNodeId: currentNode.clickMicTargetNodeId || defaultTarget,
                            });
                          } else {
                            handleUpdateNode(currentNode.id, { micPosition: val });
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500 focus:outline-none"
                      >
                        <option value="screen_center_trigger">🎯 אמצע המסך - טריגר לצומת הבאה</option>
                        <option value="center">🟡 מיקרופון זהב (מרכז/תחתית אוטומטי)</option>
                        <option value="bottom">🔽 מיקרופון בתחתית המסך</option>
                        <option value="hidden">🚫 מוסתר בצומת זה</option>
                      </select>
                    </div>

                    {/* בחירת סוג הפעולה בלחיצה: שדה טקסט או מעבר לצומת */}
                    <div>
                      <span className="block text-[11px] text-yellow-400 font-semibold mb-1">פעולת טריגר בלחיצה:</span>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateNode(currentNode.id, { micActionType: 'open_text_input', clickMicTargetNodeId: undefined })}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              (currentNode.micActionType ?? (currentNode.clickMicTargetNodeId ? 'navigate_to_node' : 'open_text_input')) === 'open_text_input'
                                ? 'bg-yellow-500 text-black border-yellow-400 shadow'
                                : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            📝 פתח שדה טקסט
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateNode(currentNode.id, { micActionType: 'navigate_to_node' })}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              (currentNode.micActionType ?? (currentNode.clickMicTargetNodeId ? 'navigate_to_node' : 'open_text_input')) === 'navigate_to_node'
                                ? 'bg-yellow-500 text-black border-yellow-400 shadow'
                                : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            ➡️ קישור לצומת
                          </button>
                        </div>

                        {/* תפריט בחירת צומת במידה ונבחר מעבר ישיר */}
                        {(currentNode.micActionType ?? (currentNode.clickMicTargetNodeId ? 'navigate_to_node' : 'open_text_input')) === 'navigate_to_node' && (
                          <div className="animate-fade-in pt-1">
                            <select
                              value={currentNode.clickMicTargetNodeId || ''}
                              onChange={(e) => handleUpdateNode(currentNode.id, { clickMicTargetNodeId: e.target.value || undefined })}
                              className="w-full bg-slate-950 border border-yellow-500/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
                            >
                              <option value="">-- בחר צומת יעד למעבר --</option>
                              {Object.values(editingCampaign.states)
                                .filter((n) => n.id !== currentNode.id)
                                .map((target) => (
                                  <option key={target.id} value={target.id}>
                                    ➡️ {target.name} ({target.id})
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. מעבר אוטומטי לצומת הבא */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-slate-300 flex items-center space-x-2 rtl:space-x-reverse">
                    <ArrowRightCircle className="w-4 h-4 text-yellow-400" />
                    <span>מעבר אוטומטי לצומת הבא:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    {/* Switch: מעבר בסיום הווידאו */}
                    <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentNode.autoTransitionOnEnd ?? false}
                        onChange={(e) => handleUpdateNode(currentNode.id, { autoTransitionOnEnd: e.target.checked })}
                        className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                      />
                      <span>בסיום שידור הווידאו</span>
                    </label>

                    {/* Timer: מעבר לאחר X שניות */}
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400">לאחר</span>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        placeholder="ללא"
                        value={currentNode.autoTransitionDelaySec ?? ''}
                        onChange={(e) => handleUpdateNode(currentNode.id, { autoTransitionDelaySec: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:border-yellow-500"
                      />
                      <span className="text-xs text-slate-400">שניות</span>
                    </div>

                    {/* Target Node Selector */}
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-xs text-slate-400 flex-shrink-0">צומת היעד:</span>
                      <select
                        value={currentNode.autoTransitionTarget || ''}
                        onChange={(e) => handleUpdateNode(currentNode.id, { autoTransitionTarget: e.target.value || undefined })}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500 focus:outline-none"
                      >
                        <option value="">-- ללא מעבר אוטומטי --</option>
                        {Object.values(editingCampaign.states)
                          .filter((n) => n.id !== currentNode.id)
                          .map((target) => (
                            <option key={target.id} value={target.id}>
                              {target.name} ({target.id})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: עריכת כרטיסיות וקרוסלה (CARDS & CAROUSEL EDITOR) */}
              <div className="bg-black/60 border border-yellow-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold text-yellow-400">
                    <Layers className="w-4 h-4 text-yellow-400" />
                    <span>עריכת כרטיסיות וקרוסלה לצומת זה</span>
                  </div>

                  <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-yellow-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentCarousel}
                      onChange={(e) => handleToggleCarousel(e.target.checked)}
                      className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                    />
                    <span>הפעל קרוסלת כרטיסיות בצומת זה</span>
                  </label>
                </div>

                {currentCarousel ? (
                  <div className="space-y-4">
                    {/* כותרת ותת-כותרת של הקרוסלה */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">כותרת ראשית לקרוסלה</label>
                        <input
                          type="text"
                          value={currentCarousel.title || ''}
                          onChange={(e) => handleUpdateCarouselHeader({ title: e.target.value })}
                          placeholder="לדוגמה: במה תרצה להתמקד כעת?"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">תת-כותרת / הנחיה</label>
                        <input
                          type="text"
                          value={currentCarousel.subtitle || ''}
                          onChange={(e) => handleUpdateCarouselHeader({ subtitle: e.target.value })}
                          placeholder="לדוגמה: בחר מתוך האפשרויות הבאות"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-yellow-500"
                        />
                      </div>
                    </div>

                    {/* רשימת הכרטיסיות */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          כרטיסיות בקרוסלה ({currentCarousel.carouselItems?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={handleAddCardToCarousel}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse shadow transition-all active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>הוסף כרטיסייה חדשה</span>
                        </button>
                      </div>

                      {currentCarousel.carouselItems?.map((card, cardIndex) => (
                        <div
                          key={card.id || cardIndex}
                          className="p-3.5 bg-slate-900/90 border border-yellow-500/30 rounded-2xl space-y-3 transition-all hover:border-yellow-500/60"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold text-yellow-300">
                              <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] flex items-center justify-center font-black">
                                {cardIndex + 1}
                              </span>
                              <span>{card.title || 'כרטיסייה ללא שם'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(cardIndex)}
                              className="text-xs text-red-400 hover:text-red-300 p-1 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                              title="מחק כרטיסייה"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* כותרת כרטיסייה */}
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">כותרת הכרטיסייה</label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => handleUpdateCard(cardIndex, { title: e.target.value })}
                                placeholder="שם הכרטיסייה"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500"
                              />
                            </div>

                            {/* תיאור כרטיסייה */}
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">תיאור קצר</label>
                              <input
                                type="text"
                                value={card.description || ''}
                                onChange={(e) => handleUpdateCard(cardIndex, { description: e.target.value })}
                                placeholder="הסבר קצר למשתמש"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500"
                              />
                            </div>

                            {/* צומת יעד לקישור */}
                            <div>
                              <label className="block text-[11px] text-yellow-400 font-semibold mb-1">קישור לצומת יעד</label>
                              <select
                                value={card.targetNodeId}
                                onChange={(e) => handleUpdateCard(cardIndex, { targetNodeId: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500 focus:outline-none"
                              >
                                {Object.values(editingCampaign.states).map((target) => (
                                  <option key={target.id} value={target.id}>
                                    ➡️ {target.name} ({target.id})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start pt-1">
                            {/* אייקון וקטורי יוקרתי לכרטיסייה */}
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">אייקון כרטיסייה</label>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Active Icon Preview */}
                                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-amber-400/80 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.3)] flex-shrink-0">
                                  <PremiumVectorIcon iconKey={card.icon || 'coins'} className="w-4 h-4" />
                                </div>

                                {/* Quick Presets */}
                                {['coins', 'dollar', 'sparkles', 'rocket', 'gift', 'tag', 'crown'].map((icId) => {
                                  const isSel = (card.icon || 'coins') === icId;
                                  return (
                                    <button
                                      key={icId}
                                      type="button"
                                      onClick={() => handleUpdateCard(cardIndex, { icon: icId })}
                                      className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center cursor-pointer transform hover:scale-110 active:scale-95 ${
                                        isSel
                                          ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700'
                                      }`}
                                    >
                                      <PremiumVectorIcon iconKey={icId} className="w-3.5 h-3.5" isGold={isSel} />
                                    </button>
                                  );
                                })}

                                {/* Full Library Modal Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setIconPickerConfig({
                                      isOpen: true,
                                      title: `בחר אייקון לכרטיסייה ${cardIndex + 1} (${card.title || 'ללא כותרת'})`,
                                      selectedIconId: card.icon,
                                      onSelect: (selectedId) => handleUpdateCard(cardIndex, { icon: selectedId }),
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-600/60 text-[10px] font-bold text-indigo-300 flex items-center gap-1 shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
                                  title="פתח ספריית אייקונים מלאה"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-400" />
                                  <span>ספרייה מלאה</span>
                                </button>
                              </div>
                            </div>

                            {/* תגית / Badge */}
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">תגית מיוחדת (Badge)</label>
                              <input
                                type="text"
                                value={card.badge || ''}
                                onChange={(e) => handleUpdateCard(cardIndex, { badge: e.target.value })}
                                placeholder="מומלץ / פופולרי / חדש"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500"
                              />
                            </div>

                            {/* העלאת תמונה / קישור תמונה */}
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">תמונת כרטיסייה</label>
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center space-x-1 rtl:space-x-reverse border border-slate-700 transition-colors">
                                  <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
                                  <span>קובץ</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleCardImageUpload(e, cardIndex)}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handlePickFromGallery('image', undefined, cardIndex)}
                                  className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-[11px] flex items-center space-x-1 rtl:space-x-reverse border border-indigo-700/60 transition-colors"
                                  title="בחר תמונה מגלריית המדיה"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>גלריה</span>
                                </button>
                                <input
                                  type="url"
                                  placeholder="https://.../img.jpg"
                                  value={card.imageUrl || ''}
                                  onChange={(e) => handleUpdateCard(cardIndex, { imageUrl: e.target.value })}
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white placeholder-slate-600 focus:border-yellow-500"
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
                    קרוסלת הכרטיסיות אינה פעילה בצומת זה. סמן את התיבה למעלה כדי להוסיף כרטיסיות.
                  </div>
                )}
              </div>

              {/* Video Upload & Preview Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold text-slate-200">
                    <Video className="w-4 h-4 text-yellow-400" />
                    <span>סרטון הווידאו של הצומת</span>
                  </div>
                  {currentNode.videoUrl && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/50">
                      סרטון מחובר
                    </span>
                  )}
                </div>

                {/* Upload Progress Bar if active */}
                {uploadingNodeId === currentNode.id && (
                  <div className="p-3 bg-indigo-950/80 border border-indigo-500/50 rounded-xl space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs text-indigo-200 font-medium">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                        <span>מעלה סרטון ושומר בגלריית המדיה (Firebase Storage)...</span>
                      </span>
                      <span className="font-bold text-yellow-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-indigo-700/50">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Buttons & URL input */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label className="w-full sm:w-auto flex-1 cursor-pointer bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-md transition-all">
                    <Upload className="w-4 h-4" />
                    <span>העלה סרטון מהמחשב (נשמר בגלריה)</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => handleVideoFileUpload(e, currentNode.id)}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handlePickFromGallery('video', currentNode.id)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold text-xs flex items-center justify-center space-x-2 rtl:space-x-reverse border border-yellow-500/40 shadow transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>בחר מגלריית המדיה</span>
                  </button>

                  <span className="text-xs text-slate-500">או קישור:</span>

                  <input
                    type="url"
                    placeholder="https://.../video.mp4"
                    value={currentNode.videoUrl || ''}
                    onChange={(e) => handleUpdateNode(currentNode.id, { videoUrl: e.target.value })}
                    className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                {/* Live Preview if Video Exists */}
                {currentNode.videoUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden bg-black max-h-48 flex items-center justify-center border border-slate-800">
                    <video
                      key={currentNode.videoUrl}
                      src={currentNode.videoUrl}
                      controls
                      playsInline
                      className="max-h-48 object-contain w-full"
                    />
                  </div>
                )}
              </div>

              {/* Actions & Delete */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => handleDeleteNode(currentNode.id)}
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-3 py-1.5 rounded-lg flex items-center space-x-1 rtl:space-x-reverse transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>מחק צומת זה</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {db ? 'השינויים יישמרו גם ב-Firestore (sdo_player_campaign_configs)' : 'מצב Standalone מקומי'}
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              onClick={handleSaveAndApply}
              disabled={isSaving || !!uploadingNodeId}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-black flex items-center space-x-2 rtl:space-x-reverse shadow-lg transition-all active:scale-95 cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>נשמר ומופעל!</span>
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

      {/* Full Luxury Vector Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerConfig.isOpen}
        onClose={() => setIconPickerConfig((prev) => ({ ...prev, isOpen: false }))}
        onSelectIcon={iconPickerConfig.onSelect}
        selectedIconId={iconPickerConfig.selectedIconId}
        title={iconPickerConfig.title}
      />
    </div>
  );
};