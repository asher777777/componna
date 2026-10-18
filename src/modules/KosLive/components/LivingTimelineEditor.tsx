import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit3, Film, Sparkles, Volume2, Mic, Play, 
  ChevronDown, ChevronUp, CheckCircle2, Video, MessageSquare
} from 'lucide-react';
import { useKosLive } from '../context/KosLiveContext';
import { LivingScene, SceneRoleType, LivingOverlayAction } from '../types';
import { KOS_LIVE_AVATARS, HEBREW_TTS_VOICES } from '../config';

export const LivingTimelineEditor: React.FC = () => {
  const { activeProject, setActiveProject, setTab } = useKosLive();
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-400 select-none font-sans" dir="rtl">
        <Film className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-sm">אנא בחרו או צרו פרויקט כדי לערוך את ציר הזמן והסצנות.</p>
      </div>
    );
  }

  const scenes = activeProject.scenes || [];
  const currentScene: LivingScene | undefined = scenes[selectedSceneIndex];

  const updateScene = (updatedFields: Partial<LivingScene>) => {
    const updatedScenes = [...scenes];
    if (updatedScenes[selectedSceneIndex]) {
      updatedScenes[selectedSceneIndex] = {
        ...updatedScenes[selectedSceneIndex],
        ...updatedFields,
      };
      setActiveProject({
        ...activeProject,
        scenes: updatedScenes,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const addScene = () => {
    const newSceneNumber = scenes.length + 1;
    const newId = `scene_${Date.now()}`;
    const defaultAvatar = KOS_LIVE_AVATARS[0];

    const newScene: LivingScene = {
      id: newId,
      sceneNumber: newSceneNumber,
      title: `סצנה ${newSceneNumber}`,
      dialogueScript: 'טקסט דיאלוג חדש עבור הפרזנטור...',
      renderedVideoUrl: defaultAvatar.previewVideoUrl,
      backgroundMediaUrl: defaultAvatar.previewImageUrl,
      avatarId: defaultAvatar.id,
      voiceId: defaultAvatar.voiceId,
      sceneRole: 'custom',
      autoTransitionOnEnd: false,
      enableVoiceTrigger: true,
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

  const deleteScene = (index: number) => {
    if (scenes.length <= 1) return;
    const updated = scenes.filter((_, i) => i !== index);
    setActiveProject({
      ...activeProject,
      scenes: updated,
      updatedAt: new Date().toISOString()
    });
    setSelectedSceneIndex(Math.max(0, index - 1));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 font-sans select-none" dir="rtl">
      
      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Sidebar: Scenes Timeline List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span>ציר הזמן של הסצנות ({scenes.length})</span>
            </h3>
            <button
              onClick={addScene}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>הוסף סצנה</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[550px] pr-1">
            {scenes.map((scene, idx) => {
              const isSelected = idx === selectedSceneIndex;
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
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                        {scene.title || `סצנה ${idx + 1}`}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {scene.dialogueScript || 'ללא תסריט'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {scenes.length > 1 && (
                      <button
                        onClick={e => { e.stopPropagation(); deleteScene(idx); }}
                        className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="מחק סצנה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right/Main: Active Scene Config (8 cols) */}
        {currentScene ? (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-right">
            
            {/* Scene Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  סצנה #{selectedSceneIndex + 1}
                </span>
                <input
                  type="text"
                  value={currentScene.title}
                  onChange={e => updateScene({ title: e.target.value })}
                  className="mt-1 text-lg font-black text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-400 focus:outline-none w-full"
                  placeholder="כותרת הסצנה..."
                />
              </div>

              {/* Role selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">תפקיד:</span>
                <select
                  value={currentScene.sceneRole || 'welcome_hook'}
                  onChange={e => updateScene({ sceneRole: e.target.value as SceneRoleType })}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="welcome_hook">קבלת פנים ומבוא (Hook)</option>
                  <option value="feature_explainer">הסבר תכונות ושירותים</option>
                  <option value="sales_pitch">הצגת מחיר והצעה</option>
                  <option value="objection_handler">מענה לשאלות נפוצות (FAQ)</option>
                  <option value="lead_closing">טופס סגירה וליד</option>
                  <option value="custom">סצנה מותאמת אישית</option>
                </select>
              </div>
            </div>

            {/* Dialogue & Script */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>תסריט הדיאלוג של הפרזנטור (מה האוואטר יאמר):</span>
              </label>
              <textarea
                rows={3}
                value={currentScene.dialogueScript}
                onChange={e => updateScene({ dialogueScript: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed transition"
                placeholder="כתבו כאן את מילות הפרזנטור..."
              />
            </div>

            {/* Avatar & Voice Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">פרזנטור AI:</label>
                <div className="grid grid-cols-2 gap-2">
                  {KOS_LIVE_AVATARS.map(av => (
                    <div
                      key={av.id}
                      onClick={() => updateScene({
                        avatarId: av.id,
                        renderedVideoUrl: av.previewVideoUrl,
                        backgroundMediaUrl: av.previewImageUrl,
                        voiceId: av.voiceId
                      })}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                        currentScene.avatarId === av.id
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <img src={av.previewImageUrl} alt={av.name} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[11px] font-bold truncate">{av.name.split('-')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">קול דיבור (TTS בעברית):</label>
                <select
                  value={currentScene.voiceId || HEBREW_TTS_VOICES[0].id}
                  onChange={e => updateScene({ voiceId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  {HEBREW_TTS_VOICES.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableVoice"
                    checked={currentScene.enableVoiceTrigger !== false}
                    onChange={e => updateScene({ enableVoiceTrigger: e.target.checked })}
                    className="rounded accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="enableVoice" className="text-xs text-slate-300 cursor-pointer font-bold">
                    אפשר לגולש לדבר עם הפרזנטור בקול (סוכן AI)
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Overlay Preview & Config */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2">שכבות ממשק בסצנה זו (Overlays):</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                {currentScene.overlays && currentScene.overlays.length > 0 
                  ? `מוגדרות ${currentScene.overlays.length} שכבות (כפתורי הסתעפות/טפסים/כרטיסים). ניתן לבדוק אותן בסימולטור הנגן.` 
                  : 'טרם הוגדרו שכבות מותאמות אישית לסצנה זו.'}
              </p>

              <button
                onClick={() => setTab('preview')}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>צפה ובדוק סצנה זו בנגן האינטראקטיבי</span>
              </button>
            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
};
