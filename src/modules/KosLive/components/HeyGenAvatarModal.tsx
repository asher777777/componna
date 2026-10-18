import React, { useState, useRef } from 'react';
import { X, Check, User, Mic, Upload, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { useKosLive } from '../context/KosLiveContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { pickMediaFromGallery, uploadFileAndSyncToGallery } from '../services/livingMediaGalleryBridge';

export const HeyGenAvatarModal: React.FC = () => {
  const {
    isAvatarModalOpen,
    closeAvatarModal,
    modalTargetSceneId,
    activeProject,
    updateCurrentScene,
    avatars,
    voices
  } = useKosLive();

  const { db, storage } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();

  const targetScene = activeProject?.scenes.find(s => s.id === modalTargetSceneId);
  const [selectedAvatarId, setSelectedAvatarId] = useState(targetScene?.avatarId || 'Wayne_20240711');
  const [selectedVoiceId, setSelectedVoiceId] = useState(targetScene?.voiceId || '1bd001e7e50f421d891986aad5158bc8');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>(
    targetScene?.isPhotoAvatar ? targetScene?.avatarId || '' : ''
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  if (!isAvatarModalOpen || !modalTargetSceneId || !activeProject) return null;

  const filteredAvatars = avatars.filter(a => {
    if (filterGender === 'all') return true;
    return a.gender?.toLowerCase() === filterGender;
  });

  const handleUploadCustomPresenterPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const { url } = await uploadFileAndSyncToGallery(file, file.name, 'image', {
        storage: storage as any,
        db: db as any,
        tenantId
      });
      setCustomPhotoUrl(url);
      setSelectedAvatarId(url);
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handlePickPresenterPhotoFromGallery = async () => {
    const url = await pickMediaFromGallery(getCapability as any, 'image');
    if (url) {
      setCustomPhotoUrl(url);
      setSelectedAvatarId(url);
    }
  };

  const handleApply = () => {
    const isCustomPhoto = !!customPhotoUrl && selectedAvatarId === customPhotoUrl;
    updateCurrentScene(modalTargetSceneId, {
      avatarId: selectedAvatarId,
      voiceId: selectedVoiceId,
      isPhotoAvatar: isCustomPhoto,
      ...(isCustomPhoto ? { backgroundImageUrl: customPhotoUrl } : {})
    });
    closeAvatarModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-right text-slate-100">
        
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                בחירת אווטאר, תמונת פרזנטור וקול קריינות (HeyGen AI)
              </h2>
              <p className="text-xs text-slate-400">
                בחר אווטאר מוכן או העלה/בחר תמונת פרזנטור מהגלריה עבור סצנה {targetScene?.sceneNumber || 1}
              </p>
            </div>
          </div>
          <button
            onClick={closeAvatarModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Custom Talking Photo Upload + Gallery Picker */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {customPhotoUrl ? (
                <img
                  src={customPhotoUrl}
                  alt="Custom Presenter"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="font-black text-amber-400 text-xs">תמונת פרזנטור מותאמת אישית (Talking Photo)</h4>
                <p className="text-[11px] text-slate-400">
                  העלו תמונה מהמחשב (נשמרת אוטומטית בגלריה) או בחרו תמונה מגלריית המדיה
                </p>
              </div>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadCustomPresenterPhoto}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingPhoto ? 'מעלה לגלריה...' : 'העלה תמונה'}</span>
              </button>
              <button
                type="button"
                onClick={handlePickPresenterPhotoFromGallery}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>בחר מהגלריה</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="font-bold text-slate-300">אווטארים זמינים ({filteredAvatars.length})</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['all', 'female', 'male'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFilterGender(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterGender === g ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g === 'all' ? 'הכל' : g === 'female' ? 'נשים' : 'גברים'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredAvatars.map((avatar) => {
              const isSelected = avatar.avatar_id === selectedAvatarId;
              return (
                <div
                  key={avatar.avatar_id}
                  onClick={() => setSelectedAvatarId(avatar.avatar_id)}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer flex flex-col items-center text-center space-y-2 relative ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                  <img
                    src={avatar.preview_image_url}
                    alt={avatar.avatar_name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-slate-700"
                  />
                  <div>
                    <p className="font-bold text-white text-[11px]">{avatar.avatar_name}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{avatar.gender}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>קול קריינות (HeyGen Voice Model)</span>
            </label>
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
            >
              {voices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name} ({voice.language} - {voice.gender})
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            onClick={closeAvatarModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ביטול
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>החל אווטאר וקול</span>
          </button>
        </div>

      </div>
    </div>
  );
};
