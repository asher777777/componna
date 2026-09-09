import React, { useState, useRef } from 'react';
import { 
  Play, Plus, Trash2, Wand2, Sparkles, User, Mic, Image as ImageIcon,
  Video, RefreshCw, CheckCircle2, AlertCircle, Save, ExternalLink,
  ChevronRight, ChevronLeft, Volume2, Film
} from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';

export const SceneTimelineEditor: React.FC = () => {
  const {
    activeProject,
    activeScene,
    activeSceneId,
    setActiveSceneId,
    updateCurrentScene,
    addScene,
    deleteScene,
    saveCurrentProject,
    openAvatarModal,
    openTeleprompter,
    renderHeyGenScene,
    isRenderingScene,
    renderingSceneId,
    avatars
  } = useVideoStudio();

  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  if (!activeProject || !activeScene) {
    return (
      <div className="p-12 text-center text-slate-400" dir="rtl">
        <Film className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-bounce" />
        <p>לא נבחר פרויקט פעיל. נא לבחור או ליצור פרויקט חדש באשף.</p>
      </div>
    );
  }

  const selectedAvatar = avatars.find(a => a.avatar_id === activeScene.avatarId) || avatars[0];

  const handleSave = async () => {
    setIsSaving(true);
    await saveCurrentProject();
    setTimeout(() => setIsSaving(false), 500);
  };

  const handlePickBackgroundMedia = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({
        accept: '*/*',
        multiple: false
      });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (typeof url === 'string') {
          updateCurrentScene(activeScene.id, {
            backgroundMediaUrl: url,
            backgroundType: url.endsWith('.mp4') || url.endsWith('.webm') ? 'video' : 'image'
          });
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleRender = async () => {
    setRenderError(null);
    try {
      await renderHeyGenScene(activeScene.id);
    } catch (err: any) {
      setRenderError(err?.message || 'שגיאה ביצירת הוידאו');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden" dir="rtl">
      {/* Top Project Bar */}
      <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{activeProject.title}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {activeProject.aspectRatio}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-purple-400" />
            <span>{isSaving ? 'שומר...' : 'שמור שינויים'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Timeline, Center/Right Editor */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Timeline Sidebar */}
        <div className="w-full md:w-80 bg-slate-900/90 border-l border-slate-800 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              ציר סצנות ({activeProject.scenes.length})
            </span>
            <button
              onClick={addScene}
              className="p-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>סצנה חדשה</span>
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {activeProject.scenes.map((scene, idx) => {
              const isSelected = scene.id === activeScene.id;
              return (
                <div
                  key={scene.id}
                  onClick={() => setActiveSceneId(scene.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-purple-300 font-mono">
                        {idx + 1}
                      </span>
                      <span>{scene.title}</span>
                    </span>

                    {scene.renderedVideoUrl ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>מוכן</span>
                      </span>
                    ) : scene.heygenStatus === 'processing' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>מרנדר</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">טיוטה</span>
                    )}
                  </div>

                  <p className="text-slate-400 line-clamp-1 text-[11px]">
                    {scene.dialogueScript || 'ללא טקסט קריינות'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center/Right Detail Editor */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-950/50">
          
          {renderError && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{renderError}</span>
            </div>
          )}

          {/* Scene Header & Title Input */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                סצנה {activeScene.sceneNumber}
              </span>
              <input
                type="text"
                value={activeScene.title}
                onChange={(e) => updateCurrentScene(activeScene.id, { title: e.target.value })}
                className="bg-transparent text-sm font-bold text-white border-b border-transparent focus:border-purple-500 focus:outline-none flex-1"
                placeholder="שם הסצנה..."
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openTeleprompter(activeScene.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>טלפרומפטר והקלטה</span>
              </button>

              <button
                onClick={() => deleteScene(activeScene.id)}
                disabled={activeProject.scenes.length <= 1}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer disabled:opacity-30"
                title="מחק סצנה"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left/Middle Column: Script & Assets (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Dialogue Script Card */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>טקסט הקריינות של האווטאר (Dialogue Script)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {activeScene.dialogueScript.length} תווים (~{Math.round(activeScene.dialogueScript.length / 15)} שניות)
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={activeScene.dialogueScript}
                  onChange={(e) => updateCurrentScene(activeScene.id, { dialogueScript: e.target.value })}
                  placeholder="הזן את הטקסט שהאווטאר יקריא בסצנה זו..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Avatar Selector Card */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAvatar?.preview_image_url || 'https://files2.heygen.ai/avatar/v3/9b867c2957b4458bb64058b8d0034ea3/full/preview_target.webp'}
                    alt={selectedAvatar?.avatar_name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-purple-500/40"
                  />
                  <div>
                    <span className="text-[10px] text-purple-400 font-semibold block">אווטאר AI נבחר (HeyGen)</span>
                    <p className="text-xs font-bold text-white">{selectedAvatar?.avatar_name || 'Wayne'}</p>
                  </div>
                </div>

                <button
                  onClick={() => openAvatarModal(activeScene.id)}
                  className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>החלף אווטאר וקול</span>
                </button>
              </div>

              {/* Background Media Picker */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>רקע הסצנה (מסונכרן לגלריית המדיה)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {activeScene.backgroundMediaUrl ? (
                    <img
                      src={activeScene.backgroundMediaUrl}
                      alt="Background"
                      className="w-20 h-14 rounded-xl object-cover border border-slate-700 bg-slate-950"
                    />
                  ) : (
                    <div className="w-20 h-14 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex items-center justify-center text-slate-600">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <button
                      onClick={handlePickBackgroundMedia}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{activeScene.backgroundMediaUrl ? 'החלף מדיה מהגלריה' : 'בחר תמונה/וידאו מהגלריה'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500">
                      בוחר ישירות מתוך גלריית המדיה של המערכת (Storage & Firestore)
                    </p>
                  </div>
                </div>
              </div>

              {/* Render Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleRender}
                  disabled={isRenderingScene || !activeScene.dialogueScript.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition cursor-pointer disabled:opacity-50 text-xs"
                >
                  <Sparkles className={`w-4 h-4 ${isRenderingScene ? 'animate-spin text-amber-400' : ''}`} />
                  <span>
                    {isRenderingScene && renderingSceneId === activeScene.id
                      ? 'מייצר וידאו עם HeyGen v3 ומסנכרן לגלריה...'
                      : 'הפק סרטון אווטאר לסצנה זו (HeyGen AI)'}
                  </span>
                </button>
              </div>

            </div>

            {/* Right Column: Scene & Video Preview Player (5 cols) */}
            <div className="lg:col-span-5">
              <VideoPreviewPlayer scene={activeScene} aspectRatio={activeProject.aspectRatio} />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
