import React, { useState } from 'react';
import { X, Check, User, Mic, Sparkles, Volume2 } from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';

export const HeyGenAvatarModal: React.FC = () => {
  const {
    isAvatarModalOpen,
    closeAvatarModal,
    modalTargetSceneId,
    activeProject,
    updateCurrentScene,
    avatars,
    voices
  } = useVideoStudio();

  if (!isAvatarModalOpen || !modalTargetSceneId || !activeProject) return null;

  const targetScene = activeProject.scenes.find(s => s.id === modalTargetSceneId);
  const [selectedAvatarId, setSelectedAvatarId] = useState(targetScene?.avatarId || 'Wayne_20240711');
  const [selectedVoiceId, setSelectedVoiceId] = useState(targetScene?.voiceId || '077ab11b14f04ce0b49b5f67b5f59629');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');

  const filteredAvatars = avatars.filter(a => {
    if (filterGender === 'all') return true;
    return a.gender?.toLowerCase() === filterGender;
  });

  const handleApply = () => {
    updateCurrentScene(modalTargetSceneId, {
      avatarId: selectedAvatarId,
      voiceId: selectedVoiceId
    });
    closeAvatarModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-right text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Gender Filter */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="font-bold text-slate-300">אווטארים זמינים ({filteredAvatars.length})</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterGender('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterGender === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                הכל
              </button>
              <button
                type="button"
                onClick={() => setFilterGender('female')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterGender === 'female' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                נשים
              </button>
              <button
                type="button"
                onClick={() => setFilterGender('male')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterGender === 'male' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                גברים
              </button>
            </div>
          </div>

          {/* Avatars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredAvatars.map((avatar) => {
              const isSelected = avatar.avatar_id === selectedAvatarId;
              return (
                <div
                  key={avatar.avatar_id}
                  onClick={() => setSelectedAvatarId(avatar.avatar_id)}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer flex flex-col items-center text-center space-y-2 relative ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-md">
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

          {/* Voice Selection */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              <span>קול קריינות (Voice Model)</span>
            </label>
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500"
            >
              {voices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name} ({voice.language} - {voice.gender})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            onClick={closeAvatarModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ביטול
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>החל אווטאר וקול</span>
          </button>
        </div>

      </div>
    </div>
  );
};
