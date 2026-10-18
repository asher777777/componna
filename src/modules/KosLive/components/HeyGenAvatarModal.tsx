import React, { useState } from 'react';
import { X, Check, User, Mic } from 'lucide-react';
import { useKosLive } from '../context/KosLiveContext';

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

  const targetScene = activeProject?.scenes.find(s => s.id === modalTargetSceneId);
  const [selectedAvatarId, setSelectedAvatarId] = useState(targetScene?.avatarId || 'Wayne_20240711');
  const [selectedVoiceId, setSelectedVoiceId] = useState(targetScene?.voiceId || '1bd001e7e50f421d891986aad5158bc8');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');

  if (!isAvatarModalOpen || !modalTargetSceneId || !activeProject) return null;

  const filteredAvatars = avatars.filter(a => {
    if (filterGender === 'all') return true;
    return a.gender?.toLowerCase() === filterGender;
  });

  const handleApply = () => {
    updateCurrentScene(modalTargetSceneId, {
      avatarId: selectedAvatarId,
      voiceId: selectedVoiceId,
      isPhotoAvatar: false
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
                בחירת אווטאר וקול קריינות (HeyGen AI Avatars)
              </h2>
              <p className="text-xs text-slate-400">
                בחר את הדמות והקול עבור סצנה {targetScene?.sceneNumber || 1}
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
