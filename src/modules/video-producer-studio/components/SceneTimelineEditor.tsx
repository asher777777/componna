import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Plus, Trash2, Wand2, Sparkles, User, Mic, Image as ImageIcon,
  Video, RefreshCw, CheckCircle2, AlertCircle, Save, ExternalLink,
  ChevronRight, ChevronLeft, Volume2, Film, PlayCircle, MessageSquare,
  Layers, Send, Smartphone, ArrowUpRight, HelpCircle, PhoneCall,
  Info, ShieldCheck, Copy, Check, Palette, Target
} from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { SceneRoleType, InteractiveActionItem, InteractiveCardItem } from '../types';
import { PRODUCTION_TYPES_CATALOG, VISUAL_STYLES_CATALOG } from '../config/catalogs';

export const SceneTimelineEditor: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeProject,
    activeScene,
    activeSceneId,
    setActiveSceneId,
    updateCurrentScene,
    addScene,
    deleteScene,
    addNextSceneWithAI,
    saveCurrentProject,
    openAvatarModal,
    openTeleprompter,
    renderHeyGenScene,
    exportProjectToFlowPlayer,
    isGeneratingScript,
    isRenderingScene,
    renderingSceneId,
    avatars
  } = useVideoStudio();

  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'interactive' | 'visualPrompt'>('script');
  
  // AI Continuity state
  const [isAiAddOpen, setIsAiAddOpen] = useState(false);
  const [customAiInstruction, setCustomAiInstruction] = useState('');
  
  // Project Overview Modal
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!activeProject || !activeScene) {
    return (
      <div className="p-12 text-center text-slate-400" dir="rtl">
        <Film className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-bounce" />
        <p>לא נבחר פרויקט פעיל. נא לבחור או ליצור פרויקט חדש באשף.</p>
      </div>
    );
  }

  const selectedAvatar = avatars.find(a => a.avatar_id === activeScene.avatarId) || avatars[0];
  const prodTypeObj = PRODUCTION_TYPES_CATALOG.find(p => p.id === activeProject.productionType);
  const visualStyleObj = VISUAL_STYLES_CATALOG.find(s => s.id === activeProject.visualStyle);

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveCurrentProject();
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleLaunchToFlowPlayer = async () => {
    setIsExporting(true);
    try {
      await saveCurrentProject();
      const campaign = await exportProjectToFlowPlayer(activeProject);
      navigate(`/flow-player-engine/${campaign.id}`);
    } catch (err: any) {
      setRenderError(err?.message || 'שגיאה בשיגור הקמפיין לנגן');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddNextSceneAI = async () => {
    if (activeProject.scenes.length >= 20) {
      setRenderError('הגעת למגבלה המקסימלית של 20 סצנות לפרויקט.');
      return;
    }
    setRenderError(null);
    try {
      await addNextSceneWithAI(customAiInstruction.trim() || undefined);
      setCustomAiInstruction('');
      setIsAiAddOpen(false);
    } catch (err: any) {
      setRenderError(err?.message || 'שגיאה ביצירת הסצנה הבאה ב-AI');
    }
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
            {activeProject.productionType && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {prodTypeObj?.name || activeProject.productionType}
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Project Overview & Character Bible Button */}
          <button
            onClick={() => setIsOverviewModalOpen(true)}
            className="px-3 py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="צפה באפיון הפרויקט, עוגן בננה פרו ותנ״ך הדמות"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
            <span>אפיון & עוגן בננה פרו</span>
          </button>

          <button
            onClick={handleLaunchToFlowPlayer}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-yellow-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
            title="מייצא את כל הסצנות, המעברים והשכבות ישירות לקמפיין אינטראקטיבי ב-Flow Player"
          >
            <PlayCircle className={`w-4 h-4 text-black ${isExporting ? 'animate-spin' : ''}`} />
            <span>{isExporting ? 'משגר לנגן...' : '🚀 שגר לעמוד נחיתה אינטראקטיבי'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
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
              ציר סצנות ({activeProject.scenes.length}/20)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAiAddOpen(!isAiAddOpen)}
                className="p-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-pink-300 border border-pink-500/30 rounded-lg text-xs flex items-center gap-1 font-semibold transition cursor-pointer"
                title="הוסף סצנה המשכית חכמה עם Gemini AI ושימור שיחה"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span>+ סצנת AI</span>
              </button>
              
              <button
                onClick={addScene}
                disabled={activeProject.scenes.length >= 20}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 font-medium transition cursor-pointer disabled:opacity-30"
                title="הוסף סצנה ריקה ידנית"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Next Scene Prompt Drawer */}
          {isAiAddOpen && (
            <div className="p-3 bg-purple-950/50 border-b border-purple-500/30 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-pink-300 flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>הוספת סצנה {activeProject.scenes.length + 1} עם Gemini</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {activeProject.conversationId ? 'מזהה שיחה שמור' : 'שיחה חדשה'}
                </span>
              </div>
              <input
                type="text"
                value={customAiInstruction}
                onChange={(e) => setCustomAiInstruction(e.target.value)}
                placeholder="הוראות מותאמות (למשל: סצנת טיפול בהתנגדות מחיר)..."
                className="w-full p-2 bg-slate-950 border border-purple-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAiAddOpen(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleAddNextSceneAI}
                  disabled={isGeneratingScript}
                  className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3 h-3 ${isGeneratingScript ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingScript ? 'יוצר...' : 'ייצר סצנה ב-AI'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {activeProject.scenes.map((scene, idx) => {
              const isSelected = scene.id === activeScene.id;
              const roleLabels: Record<string, string> = {
                welcome_hook: 'פתיח והוק',
                feature_explainer: 'הסברים והדגמה',
                sales_pitch: 'שיחת מכירה',
                objection_handler: 'התנגדויות',
                lead_closing: 'סגירה ולידים',
                custom: 'סצנה'
              };
              const roleLabel = scene.sceneRole ? roleLabels[scene.sceneRole] : undefined;

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

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <p className="line-clamp-1 flex-1">
                      {scene.dialogueScript || 'ללא טקסט קריינות'}
                    </p>
                    {roleLabel && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-medium shrink-0 mr-1">
                        {roleLabel}
                      </span>
                    )}
                  </div>
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
                סצנה {activeScene.sceneNumber} מתוך {activeProject.scenes.length}
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
                <span>טלפרומפטר</span>
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

          {/* Subtabs Segmented Control */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1 shadow-md w-fit">
            <button
              onClick={() => setActiveSubTab('script')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'script'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>תסריט, אווטאר ומדיה</span>
            </button>

            <button
              onClick={() => setActiveSubTab('interactive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'interactive'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>שכבות אינטראקטיביות והסברים</span>
            </button>

            <button
              onClick={() => setActiveSubTab('visualPrompt')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'visualPrompt'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>פרומפט בננה פרו (Imagen 3)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left/Middle Column: Content Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {activeSubTab === 'script' && (
                <>
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
                </>
              )}

              {activeSubTab === 'interactive' && (
                /* Interactive Overlays & Sales Flow Sub-Tab */
                <div className="space-y-4">
                  {/* Role Selector */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                    <label className="text-xs font-bold text-slate-200 block">
                      תפקיד הסצנה במשפך (Scene Role):
                    </label>
                    <select
                      value={activeScene.sceneRole || 'welcome_hook'}
                      onChange={(e) => updateCurrentScene(activeScene.id, { sceneRole: e.target.value as SceneRoleType })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-yellow-500"
                    >
                      <option value="welcome_hook">🎯 פתיח והוק שיווקי (Hook & Welcome)</option>
                      <option value="feature_explainer">💡 הסברים והדגמת המוצר (Feature Explainer)</option>
                      <option value="sales_pitch">🔥 שיחת מכירה והצעה בלעדית (Sales Pitch)</option>
                      <option value="objection_handler">🛡️ טיפול בהתנגדויות ושאלות נפוצות (Objection Handler)</option>
                      <option value="lead_closing">🤝 סגירת עסקה, טופס לידים ו-WhatsApp (Lead Closing)</option>
                    </select>
                  </div>

                  {/* Interactive Actions (מעברים וכפתורי תגובה מהירה) */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-yellow-400" />
                        <span>כפתורי מענה ומעברים (Interactive Actions / CTAs)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = activeScene.interactiveActions || [];
                          const nextScn = activeProject.scenes.find(s => s.id !== activeScene.id)?.id || activeScene.id;
                          updateCurrentScene(activeScene.id, {
                            interactiveActions: [
                              ...current,
                              {
                                id: `act_${Date.now()}`,
                                label: 'כפתור פעולה חדש',
                                targetSceneId: nextScn,
                                variant: 'primary'
                              }
                            ]
                          });
                        }}
                        className="p-1 px-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-[10px] font-bold rounded-lg transition"
                      >
                        + הוסף כפתור
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(activeScene.interactiveActions || []).map((act, aIdx) => (
                        <div key={act.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={act.label}
                            onChange={(e) => {
                              const list = [...(activeScene.interactiveActions || [])];
                              list[aIdx] = { ...list[aIdx], label: e.target.value };
                              updateCurrentScene(activeScene.id, { interactiveActions: list });
                            }}
                            placeholder="טקסט הכפתור..."
                            className="flex-1 min-w-[140px] p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                          />

                          <select
                            value={act.targetSceneId}
                            onChange={(e) => {
                              const list = [...(activeScene.interactiveActions || [])];
                              list[aIdx] = { ...list[aIdx], targetSceneId: e.target.value };
                              updateCurrentScene(activeScene.id, { interactiveActions: list });
                            }}
                            className="p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                          >
                            <option value="">בחר סצנת יעד...</option>
                            {activeProject.scenes.map(s => (
                              <option key={s.id} value={s.id}>
                                סצנה {s.sceneNumber}: {s.title}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              const filtered = (activeScene.interactiveActions || []).filter((_, i) => i !== aIdx);
                              updateCurrentScene(activeScene.id, { interactiveActions: filtered });
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {(!activeScene.interactiveActions || activeScene.interactiveActions.length === 0) && (
                        <p className="text-[11px] text-slate-500 text-center py-2 border border-dashed border-slate-800 rounded-xl">
                          אין כפתורי מענה מותאמים אישית. הנגן ישתמש במעבר אוטומטי או ברירת מחדל לסצנה הבאה.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Interactive Cards (הסברים, כרטיסי מידע ומוצרים) */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>כרטיסי הסבר והדגמת מוצר (Info & Product Cards)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = activeScene.interactiveCards || [];
                          updateCurrentScene(activeScene.id, {
                            interactiveCards: [
                              ...current,
                              {
                                id: `card_${Date.now()}`,
                                title: 'כותרת הסבר / מוצר',
                                description: 'תיאור קצר של התכונה או היתרון המרכזי',
                                badge: 'חדש'
                              }
                            ]
                          });
                        }}
                        className="p-1 px-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-lg transition"
                      >
                        + הוסף כרטיס הסבר
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(activeScene.interactiveCards || []).map((card, cIdx) => (
                        <div key={card.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => {
                                const list = [...(activeScene.interactiveCards || [])];
                                list[cIdx] = { ...list[cIdx], title: e.target.value };
                                updateCurrentScene(activeScene.id, { interactiveCards: list });
                              }}
                              placeholder="כותרת הכרטיס..."
                              className="flex-1 p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                            />
                            <input
                              type="text"
                              value={card.badge || ''}
                              onChange={(e) => {
                                const list = [...(activeScene.interactiveCards || [])];
                                list[cIdx] = { ...list[cIdx], badge: e.target.value };
                                updateCurrentScene(activeScene.id, { interactiveCards: list });
                              }}
                              placeholder="תגית (למשל: ⭐ בלעדי)..."
                              className="w-28 p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-yellow-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = (activeScene.interactiveCards || []).filter((_, i) => i !== cIdx);
                                updateCurrentScene(activeScene.id, { interactiveCards: filtered });
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={card.description || ''}
                            onChange={(e) => {
                              const list = [...(activeScene.interactiveCards || [])];
                              list[cIdx] = { ...list[cIdx], description: e.target.value };
                              updateCurrentScene(activeScene.id, { interactiveCards: list });
                            }}
                            placeholder="תיאור ההסבר..."
                            className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300"
                          />
                        </div>
                      ))}

                      {(!activeScene.interactiveCards || activeScene.interactiveCards.length === 0) && (
                        <p className="text-[11px] text-slate-500 text-center py-2 border border-dashed border-slate-800 rounded-xl">
                          אין כרטיסי הסבר בסצנה זו.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Auto Transitions & Voice Trigger */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <label className="text-xs font-bold text-slate-200 block">
                      הגדרות מעבר אוטומטי ואינטראקציה קולית:
                    </label>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        <span>אפשר דיאלוג ופקודות קוליות בסצנה זו</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={!!activeScene.enableVoiceTrigger}
                        onChange={(e) => updateCurrentScene(activeScene.id, { enableVoiceTrigger: e.target.checked })}
                        className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-400 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>העבר אוטומטית לסצנה הבאה בסיום הווידאו</span>
                      <input
                        type="checkbox"
                        checked={activeScene.autoTransitionOnEnd !== false}
                        onChange={(e) => updateCurrentScene(activeScene.id, { autoTransitionOnEnd: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>

                </div>
              )}

              {activeSubTab === 'visualPrompt' && (
                /* Visual Prompt & Banana Pro Consistency Sub-Tab */
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-pink-400" />
                      <span>פרומפט ויזואלי לתמונה / וידאו (Imagen 3 / Nano Banana Pro)</span>
                    </label>
                    <button
                      onClick={() => handleCopyText(activeScene.visualPrompt, 'visualPrompt')}
                      className="px-2.5 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[11px] rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer"
                    >
                      {copiedField === 'visualPrompt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'visualPrompt' ? 'הועתק!' : 'העתק פרומפט'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={activeScene.visualPrompt}
                    onChange={(e) => updateCurrentScene(activeScene.id, { visualPrompt: e.target.value })}
                    placeholder="פרומפט ויזואלי מפורט ליצירת תמונת הרקע או הוידאו..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-pink-200 text-xs font-mono focus:border-pink-500 focus:outline-none leading-relaxed"
                  />

                  {activeScene.characterDescription && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-indigo-400 font-bold block">תיאור ופעולת האווטאר בסצנה:</span>
                      <p className="text-xs text-slate-300">{activeScene.characterDescription}</p>
                    </div>
                  )}

                  {activeProject.projectOverview?.bananaConsistencySeed && (
                    <div className="p-3 bg-pink-950/20 rounded-xl border border-pink-500/30 space-y-1">
                      <span className="text-[10px] text-pink-300 font-bold block flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                        <span>עוגן עקביות בננה פרו (Banana Pro Consistency Seed):</span>
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {activeProject.projectOverview.bananaConsistencySeed}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column: Scene & Video Preview Player (5 cols) */}
            <div className="lg:col-span-5">
              <VideoPreviewPlayer scene={activeScene} aspectRatio={activeProject.aspectRatio} />
            </div>

          </div>

        </div>

      </div>

      {/* Project Overview & Character Bible Modal */}
      {isOverviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">אפיון פרויקט, עוגן בננה פרו ותנ״ך דמות</h3>
                  <p className="text-[11px] text-slate-400">
                    מזהה שיחה: <span className="font-mono text-purple-300">{activeProject.conversationId || 'ללא מזהה'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOverviewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Concept */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>קונספט וחזון הפרויקט:</span>
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {activeProject.projectOverview?.concept || activeProject.description || 'טרם הוגדר אפיון מפורט.'}
                </p>
              </div>

              {/* Consistency Seed */}
              {activeProject.projectOverview?.bananaConsistencySeed && (
                <div className="p-3.5 bg-pink-950/30 rounded-2xl border border-pink-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-pink-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                      <span>עוגן עקביות בננה פרו (Banana Pro Consistency Seed):</span>
                    </span>
                    <button
                      onClick={() => handleCopyText(activeProject.projectOverview?.bananaConsistencySeed || '', 'seed')}
                      className="px-2 py-0.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded text-[10px] flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      {copiedField === 'seed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'seed' ? 'הועתק' : 'העתק עוגן'}</span>
                    </button>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {activeProject.projectOverview.bananaConsistencySeed}
                  </p>
                </div>
              )}

              {/* Character Bible */}
              {activeProject.projectOverview?.characterBible && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>תנ״ך הדמות והפרזנטור (Character Bible):</span>
                  </span>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                    {activeProject.projectOverview.characterBible}
                  </p>
                </div>
              )}

              {/* Visual Guide */}
              {activeProject.projectOverview?.visualGuide && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>מדריך שפה ויזואלית, צבעים ותאורה:</span>
                  </span>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                    {activeProject.projectOverview.visualGuide}
                  </p>
                </div>
              )}

              {/* Target KPI & Narrative Arc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeProject.projectOverview?.targetKpi && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>יעד המרה ראשי (KPI):</span>
                    </span>
                    <p className="text-slate-300 text-[11px]">{activeProject.projectOverview.targetKpi}</p>
                  </div>
                )}

                {activeProject.projectOverview?.toneAndStyle && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>טון ושפת דיבור:</span>
                    </span>
                    <p className="text-slate-300 text-[11px]">{activeProject.projectOverview.toneAndStyle}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setIsOverviewModalOpen(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
