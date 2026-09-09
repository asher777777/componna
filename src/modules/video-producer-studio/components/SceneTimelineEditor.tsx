import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Plus, Trash2, Wand2, Sparkles, User, Mic, Image as ImageIcon,
  Video, RefreshCw, CheckCircle2, AlertCircle, Save, ExternalLink,
  ChevronRight, ChevronLeft, Volume2, Film, PlayCircle, MessageSquare,
  Send, Smartphone, ArrowUpRight, HelpCircle, PhoneCall,
  Info, ShieldCheck, Copy, Check, Palette, Target, Download, Sliders, Type, Play as PlayIcon
} from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { GOOGLE_TTS_VOICES } from '../services/googleTtsService';
import { generateSrtContent, generateVttContent, downloadSubtitleFile } from '../services/subtitleService';
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
    generateBananaProImage,
    generateVeoVideo,
    generateGoogleTtsAudio,
    isGeneratingScript,
    isRenderingScene,
    renderingSceneId,
    isGeneratingMedia,
    isGeneratingAudio,
    generatingMediaSceneId,
    avatars
  } = useVideoStudio();

  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoAvatarInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderSuccess, setRenderSuccess] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'media' | 'tts' | 'subtitles'>('script');
  
  // AI Continuity state
  const [isAiAddOpen, setIsAiAddOpen] = useState(false);
  const [customAiInstruction, setCustomAiInstruction] = useState('');
  
  // Project Overview Modal
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Audio demo playing state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

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

  const currentRate = parseFloat(String(activeScene.googleTtsSsmlRate || 1.0)) || 1.0;
  const currentPitch = parseFloat(String(activeScene.googleTtsSsmlPitch || 0)) || 0;

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

  const handlePickPhotoAvatarMedia = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({
        accept: 'image/*',
        multiple: false
      });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (typeof url === 'string') {
          updateCurrentScene(activeScene.id, {
            customAvatarImageUrl: url,
            isPhotoAvatar: true
          });
        }
      }
    } else {
      photoAvatarInputRef.current?.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'background' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (field === 'background') {
          updateCurrentScene(activeScene.id, {
            backgroundMediaUrl: dataUrl,
            backgroundType: file.type.startsWith('video/') ? 'video' : 'image'
          });
        } else {
          updateCurrentScene(activeScene.id, {
            customAvatarImageUrl: dataUrl,
            isPhotoAvatar: true
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRenderHeyGen = async () => {
    setRenderError(null);
    setRenderSuccess(null);
    try {
      await renderHeyGenScene(activeScene.id);
      setRenderSuccess('הפקת וידאו HeyGen החלה בהצלחה! הסרטון יסונכרן אוטומטית לגלריה.');
    } catch (err: any) {
      setRenderError(err?.message || 'שגיאה ביצירת הוידאו');
    }
  };

  const handleGenerateBananaPro = async () => {
    setRenderError(null);
    setRenderSuccess(null);
    try {
      const prompt = activeScene.visualPrompt || activeScene.dialogueScript;
      if (!prompt) {
        setRenderError('נא להזין פרומפט ויזואלי לפני יצירת תמונה בבננה פרו.');
        return;
      }
      await generateBananaProImage(activeScene.id, prompt);
      setRenderSuccess('תמונת בננה פרו (Imagen 3) נוצרה בהצלחה וסונכרנה לגלריית המדיה!');
    } catch (err: any) {
      setRenderError(err?.message || 'שגיאה ביצירת תמונה עם בננה פרו');
    }
  };

  const handleGenerateVeo = async () => {
    setRenderError(null);
    setRenderSuccess(null);
    try {
      const prompt = activeScene.visualPrompt || activeScene.dialogueScript;
      if (!prompt) {
        setRenderError('נא להזין פרומפט ויזואלי לפני יצירת וידאו ב-Veo.');
        return;
      }
      await generateVeoVideo(activeScene.id, prompt);
      setRenderSuccess('סרטון Google Veo נוצר בהצלחה וסונכרן לגלריית המדיה!');
    } catch (err: any) {
      setRenderError(err?.message || 'שגיאה ביצירת וידאו עם Google Veo');
    }
  };

  const handleGenerateGoogleTts = async () => {
    setRenderError(null);
    setRenderSuccess(null);
    try {
      const text = activeScene.dialogueScript;
      if (!text.trim()) {
        setRenderError('נא להזין טקסט קריינות בתסריט לפני הפקת שמע ב-Google TTS.');
        return;
      }
      await generateGoogleTtsAudio(activeScene.id, text);
      setRenderSuccess('הקריינות הופקה בהצלחה עם Google Cloud TTS וסונכרנה לגלריית המדיה!');
    } catch (err: any) {
      setRenderError(err?.message || 'שגיאה בהפקת קריינות Google TTS');
    }
  };

  const handlePlayVoiceDemo = (voice: typeof GOOGLE_TTS_VOICES[0]) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (playingVoiceId === voice.id) {
        setPlayingVoiceId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(voice.sampleText);
      utterance.lang = voice.languageCode;
      utterance.rate = 1.0;
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      setPlayingVoiceId(voice.id);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(voice.sampleText);
    }
  };

  const handleDownloadSubtitles = (format: 'srt' | 'vtt') => {
    const text = activeScene.subtitleText || activeScene.dialogueScript;
    if (!text.trim()) {
      alert('אין טקסט כתוביות בסצנה זו.');
      return;
    }
    const duration = activeScene.durationSeconds || 6;
    if (format === 'srt') {
      const srt = generateSrtContent(text, duration);
      downloadSubtitleFile(`scene_${activeScene.sceneNumber}_subtitles.srt`, srt);
    } else {
      const vtt = generateVttContent(text, duration);
      downloadSubtitleFile(`scene_${activeScene.sceneNumber}_subtitles.vtt`, vtt, 'text/vtt;charset=utf-8');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden" dir="rtl">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'background')}
      />
      <input
        ref={photoAvatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'avatar')}
      />

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

                    <div className="flex items-center gap-1">
                      {scene.renderedVideoUrl ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>וידאו</span>
                        </span>
                      ) : scene.heygenStatus === 'processing' ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>מרנדר</span>
                        </span>
                      ) : null}

                      {scene.renderedAudioUrl && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          <span>TTS</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <p className="line-clamp-1 flex-1">
                      {scene.dialogueScript || 'ללא טקסט קריינות'}
                    </p>
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
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{renderError}</span>
            </div>
          )}

          {renderSuccess && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{renderSuccess}</span>
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

          {/* 4 Specialized Tabs: Script & Avatar, AI Media (Banana Pro & Veo), Google TTS, Subtitles */}
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-md w-fit">
            <button
              onClick={() => setActiveSubTab('script')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'script'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>תסריט ואווטאר (HeyGen)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('media')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'media'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>מדיה AI (בננה פרו & Veo)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('tts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'tts'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>קריינות Google TTS & קולות</span>
            </button>

            <button
              onClick={() => setActiveSubTab('subtitles')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'subtitles'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-amber-900" />
              <span>מנוע כתוביות (Subtitles)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left/Middle Column: Content Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* TAB 1: SCRIPT & AVATAR (HEYGEN & PHOTO AVATARS) */}
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

                  {/* Avatar Type Mode Toggle: Studio Avatar vs Photo Avatar */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span>הגדרת אווטאר ל-HeyGen</span>
                      </label>
                      <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => updateCurrentScene(activeScene.id, { isPhotoAvatar: false })}
                          className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
                            !activeScene.isPhotoAvatar
                              ? 'bg-purple-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          אווטאר סטודיו
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCurrentScene(activeScene.id, { isPhotoAvatar: true })}
                          className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
                            activeScene.isPhotoAvatar
                              ? 'bg-pink-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          תמונת אווטאר (Photo Avatar)
                        </button>
                      </div>
                    </div>

                    {!activeScene.isPhotoAvatar ? (
                      /* Studio Avatar Selector */
                      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedAvatar?.preview_image_url || 'https://files2.heygen.ai/avatar/v3/9b867c2957b4458bb64058b8d0034ea3/full/preview_target.webp'}
                            alt={selectedAvatar?.avatar_name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-purple-500/40"
                          />
                          <div>
                            <span className="text-[10px] text-purple-400 font-semibold block">אווטאר סטודיו HeyGen נבחר</span>
                            <p className="text-xs font-bold text-white">{selectedAvatar?.avatar_name || 'Wayne'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => openAvatarModal(activeScene.id)}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>בחר מקטלוג האווטארים</span>
                        </button>
                      </div>
                    ) : (
                      /* Custom Photo Avatar Section */
                      <div className="p-3 bg-slate-950 rounded-xl border border-pink-500/30 space-y-3">
                        <div className="flex items-center gap-3">
                          {activeScene.customAvatarImageUrl ? (
                            <img
                              src={activeScene.customAvatarImageUrl}
                              alt="Photo Avatar"
                              className="w-14 h-14 rounded-xl object-cover border-2 border-pink-500 bg-slate-900 shadow-md"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl border-2 border-dashed border-pink-500/40 bg-pink-950/20 flex items-center justify-center text-pink-400">
                              <User className="w-6 h-6" />
                            </div>
                          )}

                          <div className="flex-1 space-y-1.5">
                            <span className="text-[11px] font-bold text-pink-300 block">
                              תמונת פורטרט מותאמת אישית (Talking Photo Avatar)
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handlePickPhotoAvatarMedia}
                                className="px-3 py-1 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                                <span>{activeScene.customAvatarImageUrl ? 'החלף תמונה' : 'בחר תמונה / העלה'}</span>
                              </button>
                              {activeScene.customAvatarImageUrl && (
                                <button
                                  type="button"
                                  onClick={() => updateCurrentScene(activeScene.id, { customAvatarImageUrl: undefined })}
                                  className="p-1 text-slate-500 hover:text-rose-400"
                                  title="הסר תמונה"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={activeScene.customAvatarImageUrl || ''}
                          onChange={(e) => updateCurrentScene(activeScene.id, { customAvatarImageUrl: e.target.value, isPhotoAvatar: true })}
                          placeholder="או הדבק קישור URL ישיר לתמונת הפורטרט..."
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Render HeyGen Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleRenderHeyGen}
                      disabled={isRenderingScene || !activeScene.dialogueScript.trim()}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition cursor-pointer disabled:opacity-50 text-xs"
                    >
                      <Sparkles className={`w-4 h-4 ${isRenderingScene ? 'animate-spin text-amber-400' : ''}`} />
                      <span>
                        {isRenderingScene && renderingSceneId === activeScene.id
                          ? 'מייצר וידאו עם HeyGen v3 ומסנכרן לגלריה...'
                          : activeScene.isPhotoAvatar
                            ? 'הפק סרטון Talking Photo (תמונה מדברת) עם HeyGen'
                            : 'הפק סרטון אווטאר סטודיו עם HeyGen AI'}
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* TAB 2: AI MEDIA (BANANA PRO & GOOGLE VEO) */}
              {activeSubTab === 'media' && (
                <div className="space-y-4">
                  {/* Visual Prompt Card */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-pink-400" />
                        <span>פרומפט ויזואלי לתמונה ווידאו (Visual Prompt)</span>
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
                      rows={4}
                      value={activeScene.visualPrompt}
                      onChange={(e) => updateCurrentScene(activeScene.id, { visualPrompt: e.target.value })}
                      placeholder="פרומפט ויזואלי מפורט ליצירת תמונת הרקע או הוידאו..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-pink-200 text-xs font-mono focus:border-pink-500 focus:outline-none leading-relaxed"
                    />

                    {/* AI Generation Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleGenerateBananaPro}
                        disabled={isGeneratingMedia}
                        className="py-3 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-4 h-4 ${isGeneratingMedia && generatingMediaSceneId === activeScene.id ? 'animate-spin' : ''}`} />
                        <span>
                          {isGeneratingMedia && generatingMediaSceneId === activeScene.id
                            ? 'יוצר תמונה בבננה פרו...'
                            : '🚀 צור תמונה עם בננה פרו (Imagen 3)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerateVeo}
                        disabled={isGeneratingMedia}
                        className="py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                      >
                        <Video className={`w-4 h-4 ${isGeneratingMedia && generatingMediaSceneId === activeScene.id ? 'animate-spin' : ''}`} />
                        <span>
                          {isGeneratingMedia && generatingMediaSceneId === activeScene.id
                            ? 'יוצר וידאו ב-Veo...'
                            : '🎬 הפק וידאו עם Google Veo'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Background Media Picker & Current Media Display */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>רקע הסצנה הנבחר (מסונכרן לגלריית המדיה)</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeScene.backgroundMediaUrl ? (
                        <div className="relative group">
                          {activeScene.backgroundType === 'video' ? (
                            <video
                              src={activeScene.backgroundMediaUrl}
                              className="w-24 h-16 rounded-xl object-cover border border-slate-700 bg-slate-950"
                              muted
                            />
                          ) : (
                            <img
                              src={activeScene.backgroundMediaUrl}
                              alt="Background"
                              className="w-24 h-16 rounded-xl object-cover border border-slate-700 bg-slate-950"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-24 h-16 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handlePickBackgroundMedia}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{activeScene.backgroundMediaUrl ? 'החלף מדיה מהגלריה' : 'בחר תמונה/וידאו מהגלריה'}</span>
                          </button>
                          {activeScene.backgroundMediaUrl && (
                            <button
                              type="button"
                              onClick={() => updateCurrentScene(activeScene.id, { backgroundMediaUrl: undefined })}
                              className="p-1.5 text-slate-500 hover:text-rose-400"
                              title="נקה מדיה"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={activeScene.backgroundMediaUrl || ''}
                          onChange={(e) => updateCurrentScene(activeScene.id, {
                            backgroundMediaUrl: e.target.value,
                            backgroundType: e.target.value.endsWith('.mp4') ? 'video' : 'image'
                          })}
                          placeholder="או הדבק קישור URL ישיר לתמונה / וידאו..."
                          className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consistency Seed Info */}
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

              {/* TAB 3: GOOGLE CLOUD TTS STUDIO & VOICES */}
              {activeSubTab === 'tts' && (
                <div className="space-y-4">
                  {/* Voice Selector & Audio Demo Buttons */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-cyan-400" />
                        <span>קטלוג קולות Google Cloud TTS (עברית & בינלאומי)</span>
                      </label>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {GOOGLE_TTS_VOICES.length} קולות זמינים
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                      {GOOGLE_TTS_VOICES.map((v) => {
                        const isSelected = (activeScene.googleTtsVoiceName || 'he-IL-Wavenet-B') === v.id;
                        const isPlaying = playingVoiceId === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => updateCurrentScene(activeScene.id, {
                              googleTtsVoiceName: v.id,
                              googleTtsLanguageCode: v.languageCode
                            })}
                            className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-950/40'
                                : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white flex items-center gap-1">
                                <span>{v.name}</span>
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                                {v.badge}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 line-clamp-1">{v.description}</p>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                              <span className="text-[9px] text-slate-500 font-mono">{v.languageName}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayVoiceDemo(v);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-semibold transition cursor-pointer ${
                                  isPlaying
                                    ? 'bg-amber-500 text-black'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                }`}
                              >
                                <PlayIcon className="w-2.5 h-2.5" />
                                <span>{isPlaying ? 'עצור' : 'השמע דמו'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SSML Controls: Speaking Rate, Pitch, Emphasis */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>הגדרות מתקדמות & תגיות SSML</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Speaking Rate */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">מהירות דיבור</span>
                          <span className="text-cyan-300 font-mono font-bold">
                            {currentRate.toFixed(2)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.75"
                          step="0.05"
                          value={currentRate}
                          onChange={(e) => updateCurrentScene(activeScene.id, { googleTtsSsmlRate: e.target.value })}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      {/* Pitch */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">גובה צליל (Pitch)</span>
                          <span className="text-cyan-300 font-mono font-bold">
                            {currentPitch}st
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          step="1"
                          value={currentPitch}
                          onChange={(e) => updateCurrentScene(activeScene.id, { googleTtsSsmlPitch: e.target.value })}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      {/* Emphasis */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <label className="text-xs text-slate-400 block">רמת הדגשה (Emphasis)</label>
                        <select
                          value={activeScene.googleTtsSsmlEmphasis || 'none'}
                          onChange={(e) => updateCurrentScene(activeScene.id, { googleTtsSsmlEmphasis: e.target.value as any })}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                        >
                          <option value="none">ללא הדגשה (None)</option>
                          <option value="moderate">מתונה (Moderate)</option>
                          <option value="strong">חזקה (Strong)</option>
                          <option value="reduced">מופחתת (Reduced)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Render Google TTS Action Button & Active Audio Player */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleGenerateGoogleTts}
                      disabled={isGeneratingAudio || !activeScene.dialogueScript.trim()}
                      className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <Volume2 className={`w-4 h-4 ${isGeneratingAudio && generatingMediaSceneId === activeScene.id ? 'animate-spin' : ''}`} />
                      <span>
                        {isGeneratingAudio && generatingMediaSceneId === activeScene.id
                          ? 'מפיק קובץ שמע עם Google Cloud TTS...'
                          : '🎙️ הפק קריינות עם Google Cloud TTS (וסנכרן לגלריה)'}
                      </span>
                    </button>

                    {activeScene.renderedAudioUrl && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/40 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>קריינות מוכנה להשמעה</span>
                        </span>
                        <audio src={activeScene.renderedAudioUrl} controls className="h-8 max-w-[240px]" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SUBTITLES ENGINE & STYLES */}
              {activeSubTab === 'subtitles' && (
                <div className="space-y-4">
                  {/* Subtitle Text Input */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-yellow-400" />
                        <span>טקסט הכתוביות (Subtitle Content)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => updateCurrentScene(activeScene.id, { subtitleText: activeScene.dialogueScript })}
                        className="px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-[10px] font-bold rounded-lg transition"
                      >
                        ⚡ שעתק מטקסט התסריט
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={activeScene.subtitleText || ''}
                      onChange={(e) => updateCurrentScene(activeScene.id, { subtitleText: e.target.value })}
                      placeholder={activeScene.dialogueScript || 'הזן טקסט כתוביות ייעודי לסצנה...'}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-yellow-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* 6 Subtitle Style Presets */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <label className="text-xs font-bold text-slate-200 block">
                      בחר סגנון כתוביות (Style Presets):
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'glow', label: 'זוהר ניאון', desc: 'צללית זוהרת מודרנית', color: 'text-cyan-300' },
                        { id: 'outline', label: 'קו מתאר (Outline)', desc: 'סגנון קולנועי מודגש', color: 'text-white' },
                        { id: 'boxed', label: 'תיבה שחורה (Boxed)', desc: 'רקע כהה לקריאות מקסימלית', color: 'text-yellow-300' },
                        { id: 'tiktok', label: 'טיקטוק / רילס', desc: 'טקסט צהוב עז על רקע שחור', color: 'text-amber-400' },
                        { id: 'karaoke', label: 'קריוקי דינמי', desc: 'הדגשת מילים בזמן דיבור', color: 'text-pink-400' },
                        { id: 'minimal', label: 'מינימליסטי', desc: 'עדין ונקי ללא רקע', color: 'text-slate-300' },
                      ].map((style) => {
                        const isSelected = (activeScene.subtitleStyle || 'boxed') === style.id;
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => updateCurrentScene(activeScene.id, { subtitleStyle: style.id as any })}
                            className={`p-2.5 rounded-xl border text-right transition cursor-pointer ${
                              isSelected
                                ? 'bg-yellow-500/20 border-yellow-500 shadow-md shadow-yellow-500/20'
                                : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
                            }`}
                          >
                            <span className={`font-bold text-xs block ${style.color}`}>{style.label}</span>
                            <span className="text-[10px] text-slate-400">{style.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subtitle Animation, Size & Position Controls */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <label className="text-xs font-bold text-slate-200 block">
                      התאמת אנימציה, גודל ומיקום:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Animation */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <label className="text-xs text-slate-400 block">אנימציה</label>
                        <select
                          value={activeScene.subtitleAnimation || 'pop'}
                          onChange={(e) => updateCurrentScene(activeScene.id, { subtitleAnimation: e.target.value as any })}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                        >
                          <option value="pop">קפיצה קלה (Pop)</option>
                          <option value="fade">עמעום (Fade)</option>
                          <option value="word">מילה במילה (Word)</option>
                          <option value="line">שורה אחר שורה (Line)</option>
                        </select>
                      </div>

                      {/* Font Size */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">גודל גופן</span>
                          <span className="text-yellow-400 font-mono font-bold">
                            {activeScene.subtitleFontSize || 18}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="32"
                          step="2"
                          value={activeScene.subtitleFontSize || 18}
                          onChange={(e) => updateCurrentScene(activeScene.id, { subtitleFontSize: parseInt(e.target.value) })}
                          className="w-full accent-yellow-500 cursor-pointer"
                        />
                      </div>

                      {/* Position */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <label className="text-xs text-slate-400 block">מיקום על המסך</label>
                        <select
                          value={activeScene.subtitlePosition || 'bottom'}
                          onChange={(e) => updateCurrentScene(activeScene.id, { subtitlePosition: e.target.value as any })}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                        >
                          <option value="bottom">למטה (Bottom)</option>
                          <option value="center">במרכז (Center)</option>
                          <option value="top">למעלה (Top)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle Downloads (SRT / VTT) */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">ייצוא קבצי כתוביות</span>
                      <span className="text-[10px] text-slate-400">תואם ליוטיוב, טיקטוק, פרימייר ונגני וידאו</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadSubtitles('srt')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-yellow-400" />
                        <span>הורד SRT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSubtitles('vtt')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>הורד VTT</span>
                      </button>
                    </div>
                  </div>
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
