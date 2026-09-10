import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Plus, Trash2, Wand2, Sparkles, User, Mic, Image as ImageIcon,
  Video, RefreshCw, CheckCircle2, AlertCircle, Save, ExternalLink,
  ChevronRight, ChevronLeft, Volume2, Film, PlayCircle, MessageSquare,
  Send, Smartphone, ArrowUpRight, HelpCircle, PhoneCall,
  Info, ShieldCheck, Copy, Check, Palette, Target, Download, Sliders, Type, Play as PlayIcon, Edit3,
  FolderOpen, Upload
} from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { GOOGLE_TTS_VOICES, SPEECH_DIRECTION_TAGS, synthesizeGoogleSpeechAudio } from '../services/googleTtsService';
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
    setTab,
    avatars
  } = useVideoStudio();

  const { config, apiKeys } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoAvatarInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // Real TTS Audio playback & cache
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderSuccess, setRenderSuccess] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'video' | 'tts' | 'subtitles'>('script');
  const [selectedVideoEngine, setSelectedVideoEngine] = useState<'heygen' | 'veo'>('heygen');
  
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

  const handleInsertSpeechTag = (tag: string) => {
    const currentText = activeScene.dialogueScript || '';
    const newText = currentText ? `${currentText} ${tag} ` : `${tag} `;
    updateCurrentScene(activeScene.id, { dialogueScript: newText });
  };

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

  const handlePickAudioMedia = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({
        accept: 'audio/*',
        multiple: false
      });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (typeof url === 'string') {
          updateCurrentScene(activeScene.id, {
            renderedAudioUrl: url
          });
        }
      }
    } else {
      audioFileInputRef.current?.click();
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateCurrentScene(activeScene.id, {
          renderedAudioUrl: dataUrl
        });
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

  const handlePlayVoiceDemo = async (voice: typeof GOOGLE_TTS_VOICES[0]) => {
    // 1. If this voice is currently playing, stop it immediately
    if (playingVoiceId === voice.id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingVoiceId(null);
      setLoadingVoiceId(null);
      return;
    }

    // 2. Stop any existing playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // 3. Check if we already have the synthesized audio in cache
    const cachedUrl = audioCacheRef.current.get(voice.id);
    if (cachedUrl) {
      try {
        const audio = new Audio(cachedUrl);
        currentAudioRef.current = audio;
        setPlayingVoiceId(voice.id);
        audio.onended = () => setPlayingVoiceId(null);
        audio.onerror = () => setPlayingVoiceId(null);
        await audio.play();
      } catch (playErr) {
        console.warn('[Audio Cached Play Error]:', playErr);
        setPlayingVoiceId(null);
      }
      return;
    }

    // 4. Try synthesizing audio live with Google Gemini / Cloud TTS API Key
    const apiKey = apiKeys?.googleAiApiKey || apiKeys?.googleCloudTtsApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
    if (apiKey && apiKey.trim()) {
      setLoadingVoiceId(voice.id);
      setPlayingVoiceId(voice.id);
      try {
        const langCode = voice.languageCode === 'multilingual' ? 'he-IL' : voice.languageCode;
        const res = await synthesizeGoogleSpeechAudio(
          apiKey,
          {
            text: voice.sampleText,
            voiceName: voice.id,
            languageCode: langCode,
            speakingRate: 1.0,
            pitch: 0
          },
          {
            gcpApiKey: config?.apiKey,
            elevenLabsApiKey: apiKeys?.elevenLabsApiKey
          }
        );

        if (res.audioUrl && !res.isFallback) {
          audioCacheRef.current.set(voice.id, res.audioUrl);
          const audio = new Audio(res.audioUrl);
          currentAudioRef.current = audio;
          setLoadingVoiceId(null);
          audio.onended = () => setPlayingVoiceId(null);
          audio.onerror = () => setPlayingVoiceId(null);
          await audio.play();
          return;
        }
      } catch (synthErr) {
        console.warn('[Voice Demo Synth Error]:', synthErr);
      } finally {
        setLoadingVoiceId(null);
      }
    }

    // 5. Fallback to browser SpeechSynthesis with valid BCP-47 language tag
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voice.sampleText);
      const isHebrew = /[\u0590-\u05FF]/.test(voice.sampleText);
      utterance.lang = isHebrew ? 'he-IL' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const browserVoices = window.speechSynthesis.getVoices();
      if (browserVoices && browserVoices.length > 0) {
        const matched = browserVoices.find(v => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2)));
        if (matched) utterance.voice = matched;
      }

      utterance.onstart = () => setPlayingVoiceId(voice.id);
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
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleAudioFileUpload}
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
          {/* View Stages & Edit Prompt Button */}
          <button
            onClick={() => setTab('wizard')}
            className="px-3 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="צפה בכל שלבי הפרויקט, הפרומפטים והשאלות המנחות ושלח תיקונים ל-Gemini"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>שלבי הפקה & עריכת פרומפט</span>
          </button>

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

          {/* 4 Specialized Tabs: Presenter & Image (Banana Pro), Video Generation (HeyGen & Veo), Google TTS, Subtitles */}
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
              <span>מציג, תסריט ותמונת בננה פרו</span>
            </button>

            <button
              onClick={() => setActiveSubTab('video')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'video'
                  ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-pink-300" />
              <span>הפקת וידאו AI (HeyGen & Veo)</span>
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
              
              {/* TAB 1: SCRIPT, PRESENTER & BANANA PRO IMAGE */}
              {activeSubTab === 'script' && (
                <div className="space-y-4">
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
                      rows={3}
                      value={activeScene.dialogueScript}
                      onChange={(e) => updateCurrentScene(activeScene.id, { dialogueScript: e.target.value })}
                      placeholder="הזן את הטקסט שהאווטאר יקריא בסצנה זו..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 focus:outline-none leading-relaxed"
                    />

                    {/* Google Speech & Audio Direction Tags Toolbar */}
                    <div className="pt-1 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <Mic className="w-3 h-3 text-cyan-400" />
                          <span>תגיות הדרכה קוליות של גוגל (לחץ להוספה):</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Google AI Studio Speech</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        {SPEECH_DIRECTION_TAGS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleInsertSpeechTag(t.tag)}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${t.color}`}
                            title={t.desc}
                          >
                            <span>{t.tag}</span>
                            <span className="opacity-80 mr-1 text-[9px]">({t.label})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Banana Pro Image Prompt & Generation Section */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-pink-400" />
                        <span>פרומפט ויזואלי לתמונת בננה פרו / פרזנטור (Banana Pro / Imagen 3)</span>
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
                      rows={3}
                      value={activeScene.visualPrompt}
                      onChange={(e) => updateCurrentScene(activeScene.id, { visualPrompt: e.target.value })}
                      placeholder="פרומפט ויזואלי מפורט ליצירת תמונת הפרזנטור/הרקע בבננה פרו..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-pink-200 text-xs font-mono focus:border-pink-500 focus:outline-none leading-relaxed"
                    />

                    {/* Generate Banana Pro Button */}
                    <button
                      type="button"
                      onClick={handleGenerateBananaPro}
                      disabled={isGeneratingMedia}
                      className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isGeneratingMedia && generatingMediaSceneId === activeScene.id ? 'animate-spin' : ''}`} />
                      <span>
                        {isGeneratingMedia && generatingMediaSceneId === activeScene.id
                          ? 'יוצר תמונה באיכות גבוהה בבננה פרו...'
                          : '🚀 צור תמונה עם בננה פרו (Imagen 3 / Gemini)'}
                      </span>
                    </button>

                    {/* Scene / Talking Photo Image Display & Picker */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 block">
                          תמונת הסצנה / פרזנטור מדבר (Talking Photo Image):
                        </span>
                        <span className="text-[10px] text-pink-400 font-medium">
                          משמשת ישירות ליצירת Talking Photo ב-HeyGen ו-Google Veo
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {activeScene.backgroundMediaUrl || activeScene.customAvatarImageUrl ? (
                          <div className="relative group">
                            <img
                              src={activeScene.backgroundMediaUrl || activeScene.customAvatarImageUrl}
                              alt="Scene / Presenter"
                              className="w-24 h-16 rounded-xl object-cover border-2 border-pink-500/60 bg-slate-950 shadow-md"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-16 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}

                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handlePickBackgroundMedia}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{activeScene.backgroundMediaUrl || activeScene.customAvatarImageUrl ? 'החלף תמונה מהגלריה' : 'בחר תמונה מהגלריה'}</span>
                            </button>
                            {(activeScene.backgroundMediaUrl || activeScene.customAvatarImageUrl) && (
                              <button
                                type="button"
                                onClick={() => updateCurrentScene(activeScene.id, { backgroundMediaUrl: undefined, customAvatarImageUrl: undefined })}
                                className="p-1.5 text-slate-500 hover:text-rose-400"
                                title="נקה תמונה"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={activeScene.backgroundMediaUrl || activeScene.customAvatarImageUrl || ''}
                            onChange={(e) => updateCurrentScene(activeScene.id, {
                              backgroundMediaUrl: e.target.value,
                              customAvatarImageUrl: e.target.value,
                              backgroundType: 'image'
                            })}
                            placeholder="או הדבק קישור URL ישיר לתמונה..."
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
                </div>
              )}

              {/* TAB 2: VIDEO GENERATION (HEYGEN & GOOGLE VEO) */}
              {activeSubTab === 'video' && (
                <div className="space-y-4">
                  {/* Video Engine Selection Cards */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <label className="text-xs font-bold text-slate-200 block">
                      בחר מנוע להפקת הוידאו של הסצנה (Video Production Engine):
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option 1: HeyGen */}
                      <button
                        type="button"
                        onClick={() => setSelectedVideoEngine('heygen')}
                        className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between gap-2 ${
                          selectedVideoEngine === 'heygen'
                            ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/20'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-xs text-white block">HeyGen AI Video</span>
                              <span className="text-[10px] text-purple-300">אווטאר מדבר + תנועות שפתיים</span>
                            </div>
                          </div>
                          {selectedVideoEngine === 'heygen' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-4 ring-purple-500/20" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          יוצר סרטון של הפרזנטור הנבחר מקריא את הטקסט בדיוק מלא ובסנכרון שפתיים מקצועי.
                        </p>
                      </button>

                      {/* Option 2: Google Veo */}
                      <button
                        type="button"
                        onClick={() => setSelectedVideoEngine('veo')}
                        className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between gap-2 ${
                          selectedVideoEngine === 'veo'
                            ? 'bg-pink-950/40 border-pink-500 shadow-lg shadow-pink-500/20'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center">
                              <Film className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-xs text-white block">Google Veo AI Video</span>
                              <span className="text-[10px] text-pink-300">וידאו סינמטי מבוסס פרומפט</span>
                            </div>
                          </div>
                          {selectedVideoEngine === 'veo' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 ring-4 ring-pink-500/20" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          יוצר סרטון וידאו סינמטי מונפש ברזולוציה גבוהה לפי הפרומפט הויזואלי של הסצנה.
                        </p>
                      </button>
                    </div>

                    {/* Scene Duration & Engine Parameters */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-300 block">משך הסרטון (Duration):</span>
                        <span className="text-[10px] text-slate-500">
                          {selectedVideoEngine === 'heygen' ? 'מותאם לפי אורך הטקסט המוקרא' : 'משך אנימציית הוידאו הסינמטי'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="3"
                          max="30"
                          value={activeScene.durationSeconds || 6}
                          onChange={(e) => updateCurrentScene(activeScene.id, { durationSeconds: parseInt(e.target.value) || 6 })}
                          className="w-16 p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white text-center font-bold"
                        />
                        <span className="text-xs text-slate-400">שניות</span>
                      </div>
                    </div>

                    {/* HeyGen Input Assets Summary */}
                    {selectedVideoEngine === 'heygen' && (
                      <div className="p-3 bg-slate-950/90 rounded-xl border border-purple-500/30 space-y-2">
                        <div className="text-[11px] font-bold text-purple-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>נכסים הנשלחים להפקת הסרטון ב-HeyGen:</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Payload Assets</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* Image Status */}
                          <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-between">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                              <span>תמונת פרזנטור:</span>
                            </span>
                            {activeScene.customAvatarImageUrl || activeScene.backgroundMediaUrl ? (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>תמונה מוכנה</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                                אווטאר ברירת מחדל
                              </span>
                            )}
                          </div>

                          {/* Audio TTS Status */}
                          <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-between">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>שמע וקריינות TTS:</span>
                            </span>
                            {activeScene.renderedAudioUrl ? (
                              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>קובץ TTS מוכן</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                טקסט תסריט בלבד
                              </span>
                            )}
                          </div>
                        </div>

                        {activeScene.renderedAudioUrl && (
                          <div className="flex items-center justify-between gap-2 p-2 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-[11px]">
                            <span className="text-cyan-300 flex items-center gap-1">
                              <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>הקשב לשמע ה-TTS שישלח לסנכרון שפתיים מלא:</span>
                            </span>
                            <audio src={activeScene.renderedAudioUrl} controls className="h-6 max-w-[200px]" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main Render Action Button */}
                    <div className="pt-2">
                      {selectedVideoEngine === 'heygen' ? (
                        <button
                          type="button"
                          onClick={handleRenderHeyGen}
                          disabled={isRenderingScene || !activeScene.dialogueScript.trim()}
                          className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition cursor-pointer disabled:opacity-50 text-xs"
                        >
                          <Sparkles className={`w-4 h-4 ${isRenderingScene ? 'animate-spin text-amber-400' : ''}`} />
                          <span>
                            {isRenderingScene && renderingSceneId === activeScene.id
                              ? 'מייצר וידאו Image-to-Video ב-HeyGen ומסנכרן לגלריה...'
                              : activeScene.renderedAudioUrl
                              ? '🚀 הפק סרטון מונפש (HeyGen Image to Video + שמע TTS)'
                              : '🚀 הפק סרטון מונפש מתמונה (HeyGen Image to Video)'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGenerateVeo}
                          disabled={isGeneratingMedia}
                          className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-indigo-600 to-purple-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-pink-600/30 transition cursor-pointer disabled:opacity-50 text-xs"
                        >
                          <Film className={`w-4 h-4 ${isGeneratingMedia && generatingMediaSceneId === activeScene.id ? 'animate-spin' : ''}`} />
                          <span>
                            {isGeneratingMedia && generatingMediaSceneId === activeScene.id
                              ? 'מייצר וידאו סינמטי ב-Google Veo ומסנכרן לגלריה...'
                              : '🎬 הפק וידאו סינמטי עם Google Veo'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rendered Video Result Card */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                        <span>קובץ הוידאו המוכן לסצנה (Rendered Video Asset)</span>
                      </label>
                      {activeScene.renderedVideoUrl && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {activeScene.videoProvider === 'veo' ? 'Google Veo MP4' : 'HeyGen MP4'}
                          </span>
                        </span>
                      )}
                    </div>

                    {activeScene.renderedVideoUrl ? (
                      <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-3">
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-800">
                          <video
                            src={activeScene.renderedVideoUrl}
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                          <span className="text-[11px] text-slate-300 font-mono truncate max-w-[200px]">
                            {activeScene.renderedVideoUrl.startsWith('data:') ? 'קובץ מוטמע (Base64 Video)' : activeScene.renderedVideoUrl}
                          </span>

                          <div className="flex items-center gap-2">
                            <a
                              href={activeScene.renderedVideoUrl}
                              download={`scene_${activeScene.sceneNumber}_video.mp4`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>הורד קובץ MP4</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => updateCurrentScene(activeScene.id, { renderedVideoUrl: undefined, heygenJobId: undefined, heygenStatus: undefined })}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="מחק וידאו והפק מחדש"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-slate-500 space-y-2">
                        <Film className="w-8 h-8 mx-auto text-slate-600" />
                        <p className="text-xs">
                          טרם הופק וידאו עבור סצנה זו. בחר מנוע (HeyGen או Google Veo) ולחץ על כפתור ההפקה למעלה.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: GOOGLE GEMINI SPEECH & CLOUD TTS STUDIO */}
              {activeSubTab === 'tts' && (
                <div className="space-y-4">
                  {/* Dialogue Script & Google Speech Direction Tags */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>טקסט הקריינות והדיבוב (כולל תגיות הדרכה קוליות)</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {activeScene.dialogueScript.length} תווים (~{Math.round(activeScene.dialogueScript.length / 15)} שניות)
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={activeScene.dialogueScript}
                      onChange={(e) => updateCurrentScene(activeScene.id, { dialogueScript: e.target.value })}
                      placeholder="הזן טקסט לקריינות והוסף תגיות [excited], [warm], [pause]..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none leading-relaxed"
                    />

                    {/* Speech Direction Tags Toolbar */}
                    <div className="pt-1 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <Mic className="w-3 h-3 text-cyan-400" />
                          <span>תגיות הדרכה קוליות של גוגל (לחץ להוספה בטקסט):</span>
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">Google AI Studio Speech Guidelines</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        {SPEECH_DIRECTION_TAGS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleInsertSpeechTag(t.tag)}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${t.color}`}
                            title={t.desc}
                          >
                            <span>{t.tag}</span>
                            <span className="opacity-80 mr-1 text-[9px]">({t.label})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Voice Selector & Audio Demo Buttons */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-cyan-400" />
                        <span>קטלוג קולות Google Gemini Audio & Cloud TTS</span>
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
                                className={`px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 font-semibold transition cursor-pointer ${
                                  isPlaying
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                }`}
                              >
                                {loadingVoiceId === v.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin text-cyan-300" />
                                ) : isPlaying ? (
                                  <Volume2 className="w-3 h-3 text-black animate-pulse" />
                                ) : (
                                  <PlayIcon className="w-2.5 h-2.5" />
                                )}
                                <span>{loadingVoiceId === v.id ? 'טוען שמע...' : isPlaying ? 'עצור' : 'השמע דמו'}</span>
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

                  {/* Render Google TTS & Audio Import Buttons */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleGenerateGoogleTts}
                      disabled={isGeneratingAudio || !activeScene.dialogueScript.trim()}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <Volume2 className={`w-4 h-4 ${isGeneratingAudio && generatingMediaSceneId === activeScene.id ? 'animate-spin' : ''}`} />
                      <span>
                        {isGeneratingAudio && generatingMediaSceneId === activeScene.id
                          ? 'מפיק קובץ שמע עם Google Gemini Speech & TTS...'
                          : '🎙️ הפק קריינות עם Google Gemini Speech & TTS (וסנכרן לגלריה)'}
                      </span>
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handlePickAudioMedia}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4 text-cyan-400" />
                        <span>📁 בחר שמע מגלריית המדיה</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => audioFileInputRef.current?.click()}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>📤 העלה קובץ שמע מהמחשב</span>
                      </button>
                    </div>

                    {/* Active Rendered / Selected Audio Card */}
                    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>קובץ השמע והקריינות הפעיל לסצנה (Audio Asset)</span>
                        </label>
                        {activeScene.renderedAudioUrl ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>שמע מוגדר ופעיל</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">טרם הוגדר שמע</span>
                        )}
                      </div>

                      {activeScene.renderedAudioUrl ? (
                        <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-3">
                          {/* Audio Player */}
                          <div className="flex items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                <Volume2 className="w-4 h-4 animate-pulse" />
                              </div>
                              <span className="text-xs font-bold text-slate-200">נגן שמע לסצנה</span>
                            </div>
                            <audio src={activeScene.renderedAudioUrl} controls className="h-8 max-w-[260px] sm:max-w-[320px]" />
                          </div>

                          {/* Spoken Narration Subtitle Box */}
                          <div className="bg-slate-900/90 border border-cyan-500/20 rounded-xl p-3 text-right" dir="rtl">
                            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <span>💬</span>
                                <span>כתוביות ותמליל הקריינות:</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(activeScene.subtitleText || activeScene.dialogueScript, 'audio_sub')}
                                className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition"
                              >
                                {copiedField === 'audio_sub' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedField === 'audio_sub' ? 'הועתק' : 'העתק'}</span>
                              </button>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed font-medium select-text whitespace-pre-wrap">
                              {activeScene.subtitleText || activeScene.dialogueScript || '(אין טקסט קריינות)'}
                            </p>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                              {activeScene.renderedAudioUrl.startsWith('data:') ? 'קובץ שמע מוטמע (Audio Data)' : activeScene.renderedAudioUrl}
                            </span>

                            <div className="flex items-center gap-2">
                              <a
                                href={activeScene.renderedAudioUrl}
                                download={`scene_${activeScene.sceneNumber}_audio.wav`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>הורד קובץ שמע</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => updateCurrentScene(activeScene.id, { renderedAudioUrl: undefined })}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                                title="מחק שמע"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-slate-500 space-y-1.5">
                          <Volume2 className="w-6 h-6 mx-auto text-slate-600" />
                          <p className="text-xs">
                            טרם הופק או נבחר קובץ שמע עבור סצנה זו. תוכל להפיק קריינות AI, לבחור מגלריית המדיה או להעלות קובץ מקומי.
                          </p>
                        </div>
                      )}
                    </div>
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
