import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize2, Sparkles, Film, CheckCircle2, Type, Subtitles } from 'lucide-react';
import { VideoScene } from '../types';
import { cleanSubtitleText } from '../services/subtitleService';

interface VideoPreviewPlayerProps {
  scene: VideoScene;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({ scene, aspectRatio }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const speechIntervalRef = useRef<any>(null);

  const aspectClass = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16] max-w-[280px]',
    '1:1': 'aspect-square max-w-[340px]'
  }[aspectRatio];

  const rawSubtitle = scene.subtitleText || scene.dialogueScript;
  const subtitleText = cleanSubtitleText(rawSubtitle);
  const subtitleStyle = scene.subtitleStyle || 'boxed';
  const subtitleAnimation = scene.subtitleAnimation || 'word';
  const subtitleFontSize = scene.subtitleFontSize || 16;
  const subtitlePosition = scene.subtitlePosition || 'bottom';

  // Subtitle position classes
  const positionClass = {
    top: 'top-6',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-6'
  }[subtitlePosition];

  // Subtitle style classes
  const getStyleClass = () => {
    switch (subtitleStyle) {
      case 'glow':
        return 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)] font-extrabold tracking-wide';
      case 'outline':
        return 'text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] [text-shadow:_2px_2px_0_#000,_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000]';
      case 'boxed':
        return 'bg-black/85 text-yellow-300 px-3.5 py-1.5 rounded-xl border border-yellow-500/40 font-bold backdrop-blur-xs shadow-lg';
      case 'tiktok':
        return 'bg-amber-400 text-black px-3 py-1 rounded-lg font-black uppercase tracking-wider shadow-2xl';
      case 'karaoke':
        return 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-3.5 py-1.5 rounded-2xl font-black shadow-xl';
      case 'minimal':
        return 'text-white/95 font-medium drop-shadow-md';
      default:
        return 'bg-black/80 text-white px-3 py-1.5 rounded-xl font-bold';
    }
  };

  // Subtitle animation class
  const getAnimationClass = () => {
    switch (subtitleAnimation) {
      case 'pop':
        return 'animate-scaleUp transition-transform';
      case 'fade':
        return 'animate-fadeIn transition-opacity';
      case 'line':
        return 'transition-all duration-300';
      default:
        return '';
    }
  };

  // Split words for Word-By-Word (Karaoke / TikTok captions)
  const words = subtitleText.split(/\s+/).filter(Boolean);
  const activeWordIdx = (isPlayingAudio || playbackProgress > 0) && words.length > 0
    ? Math.min(Math.floor(playbackProgress * words.length), words.length - 1)
    : -1;

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const prog = audioRef.current.currentTime / audioRef.current.duration;
      setPlaybackProgress(prog);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const prog = videoRef.current.currentTime / videoRef.current.duration;
      setPlaybackProgress(prog);
    }
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      if (audioRef.current) audioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      setIsPlayingAudio(false);
      setPlaybackProgress(0);
    } else {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      } else if ('speechSynthesis' in window && subtitleText) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(subtitleText);
        utt.lang = scene.googleTtsLanguageCode || 'he-IL';
        utt.rate = scene.googleTtsSsmlRate ? parseFloat(scene.googleTtsSsmlRate) : 1.0;
        
        const estDurationMs = (scene.durationSeconds || Math.max(Math.round(subtitleText.length / 14), 4)) * 1000;
        const startTime = Date.now();
        speechIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const prog = Math.min(elapsed / estDurationMs, 0.99);
          setPlaybackProgress(prog);
        }, 100);

        utt.onend = () => {
          setIsPlayingAudio(false);
          setPlaybackProgress(1);
          if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
        };
        utt.onerror = () => {
          setIsPlayingAudio(false);
          setPlaybackProgress(0);
          if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
        };
        window.speechSynthesis.speak(utt);
      }
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    setIsPlayingAudio(false);
    setPlaybackProgress(0);
    if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [scene.id]);

  return (
    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3 flex flex-col items-center shadow-xl" dir="rtl">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2.5 text-xs">
        <span className="font-bold text-slate-200 flex items-center gap-1.5">
          <Film className="w-4 h-4 text-purple-400" />
          <span>תצוגה מקדימה לסצנה ({aspectRatio})</span>
        </span>
        <div className="flex items-center gap-2">
          {/* Subtitle CC Toggle */}
          <button
            type="button"
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
              showSubtitles
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-500/10'
                : 'bg-slate-800/80 text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
            title={showSubtitles ? 'הסתר כתוביות (CC פעיל)' : 'הצג כתוביות (CC כבוי)'}
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>CC</span>
          </button>

          {scene.renderedVideoUrl ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>וידאו מוכן</span>
            </span>
          ) : scene.renderedAudioUrl ? (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold flex items-center gap-1 border border-cyan-500/30">
              <Volume2 className="w-3 h-3" />
              <span>שמע קריינות מוכן</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded-md bg-slate-800/50">טיוטת תצוגה</span>
          )}
        </div>
      </div>

      {/* Screen Container */}
      <div className={`w-full ${aspectClass} mx-auto bg-black rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-2xl group`}>
        {scene.renderedVideoUrl ? (
          <video
            ref={videoRef}
            src={scene.renderedVideoUrl}
            controls
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {/* Background Image / Video if available */}
            {scene.backgroundMediaUrl && (
              scene.backgroundType === 'video' ? (
                <video
                  src={scene.backgroundMediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
              ) : (
                <img
                  src={scene.backgroundMediaUrl}
                  alt="Background preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
              )
            )}

            {/* Custom Photo Avatar Overlay if configured */}
            {scene.isPhotoAvatar && scene.customAvatarImageUrl && (
              <div className="absolute bottom-8 left-4 z-15 w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 shadow-xl bg-black/60">
                <img src={scene.customAvatarImageUrl} alt="Photo Avatar" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Scene Overlay Information */}
            {!scene.backgroundMediaUrl && (
              <div className="relative z-10 p-4 text-center space-y-2 bg-black/40 backdrop-blur-xs rounded-2xl border border-white/10 max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white line-clamp-2">
                  "{subtitleText || 'סצנה מוכנה להפקת וידאו...'}"
                </p>
                <span className="text-[10px] text-purple-300 font-mono block">
                  פרזנטור מונפש מתמונה (Photo Avatar)
                </span>
              </div>
            )}
          </>
        )}

        {/* Live Subtitle Overlay - Rendered ALWAYS whether video is present or not when enabled */}
        {showSubtitles && subtitleText && (
          <div
            className={`absolute ${positionClass} inset-x-3 z-20 flex justify-center text-center pointer-events-none px-2`}
          >
            <div
              style={{ fontSize: `${subtitleFontSize}px` }}
              className={`max-w-[90%] transition-all ${getStyleClass()} ${getAnimationClass()}`}
            >
              {subtitleAnimation === 'word' && words.length > 0 ? (
                <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
                  {words.map((w, idx) => {
                    const isActive = idx === activeWordIdx;
                    const isPast = activeWordIdx >= 0 && idx < activeWordIdx;
                    return (
                      <span
                        key={idx}
                        className={`transition-all duration-150 inline-block ${
                          isActive
                            ? 'scale-115 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.9)] font-black -translate-y-0.5'
                            : isPast
                            ? 'opacity-100'
                            : activeWordIdx >= 0
                            ? 'opacity-60'
                            : 'opacity-100'
                        }`}
                      >
                        {w}
                      </span>
                    );
                  })}
                </span>
              ) : (
                subtitleText
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audio Playback Bar if rendered audio exists */}
      {scene.renderedAudioUrl && (
        <div className="w-full bg-slate-950 p-2.5 rounded-xl border border-cyan-500/30 flex items-center justify-between">
          <audio
            ref={audioRef}
            src={scene.renderedAudioUrl}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={() => {
              setIsPlayingAudio(false);
              setPlaybackProgress(0);
            }}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
              title={isPlayingAudio ? 'השהה שמע' : 'נגן קריינות'}
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] text-cyan-200 font-medium">
              קריינות קולית ({scene.googleTtsVoiceName || 'עברית'})
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {scene.durationSeconds || 5} שניות
          </span>
        </div>
      )}

      {/* Footer Info Strip */}
      <div className="w-full text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Film className="w-3 h-3 text-purple-400" />
          <span>משך: ~{scene.durationSeconds || 5}s</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-yellow-400" />
          <span>סגנון: <span className="text-yellow-300 font-semibold">{subtitleStyle}</span></span>
        </span>
      </div>
    </div>
  );
};

