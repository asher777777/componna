import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize2, Sparkles, Film, CheckCircle2, Type } from 'lucide-react';
import { VideoScene } from '../types';

interface VideoPreviewPlayerProps {
  scene: VideoScene;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({ scene, aspectRatio }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const aspectClass = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16] max-w-[280px]',
    '1:1': 'aspect-square max-w-[340px]'
  }[aspectRatio];

  const subtitleText = scene.subtitleText || scene.dialogueScript;
  const subtitleStyle = scene.subtitleStyle || 'boxed';
  const subtitleAnimation = scene.subtitleAnimation || 'pop';
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
        return 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-3.5 py-1.5 rounded-2xl font-black shadow-xl animate-pulse';
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
      case 'word':
        return 'animate-pulse';
      case 'line':
        return 'transition-all duration-300';
      default:
        return '';
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    setIsPlayingAudio(false);
  }, [scene.id]);

  return (
    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3 flex flex-col items-center" dir="rtl">
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
        <span className="font-bold text-slate-200 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-purple-400" />
          <span>תצוגה מקדימה לסצנה ({aspectRatio})</span>
        </span>
        <div className="flex items-center gap-1.5">
          {scene.renderedVideoUrl ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>וידאו מוכן</span>
            </span>
          ) : scene.renderedAudioUrl ? (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              <span>שמע TTS מוכן</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">טיוטת תצוגה</span>
          )}
        </div>
      </div>

      {/* Screen Container */}
      <div className={`w-full ${aspectClass} mx-auto bg-black rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-2xl group`}>
        {scene.renderedVideoUrl ? (
          <video
            src={scene.renderedVideoUrl}
            controls
            playsInline
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
                  "{scene.dialogueScript || 'סצנה מוכנה להפקת וידאו...'}"
                </p>
                <span className="text-[10px] text-purple-300 font-mono block">
                  {scene.isPhotoAvatar ? 'תמונת אווטאר מותאמת' : `אווטאר: ${scene.avatarId || 'Wayne'}`}
                </span>
              </div>
            )}

            {/* Live Subtitle Overlay */}
            {subtitleText && (
              <div
                className={`absolute ${positionClass} inset-x-3 z-20 flex justify-center text-center pointer-events-none px-2`}
              >
                <div
                  style={{ fontSize: `${subtitleFontSize}px` }}
                  className={`max-w-[90%] transition-all ${getStyleClass()} ${getAnimationClass()}`}
                >
                  {subtitleText}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Audio Playback Bar if rendered audio exists */}
      {scene.renderedAudioUrl && (
        <div className="w-full bg-slate-950 p-2.5 rounded-xl border border-cyan-500/30 flex items-center justify-between">
          <audio
            ref={audioRef}
            src={scene.renderedAudioUrl}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
              title={isPlayingAudio ? 'השהה שמע' : 'נגן שמע'}
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] text-cyan-200 font-medium">
              קריינות TTS ({scene.googleTtsVoiceName || 'he-IL'})
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {scene.durationSeconds || 5} שניות
          </span>
        </div>
      )}

      <div className="w-full text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <span>משך מוערך: ~{scene.durationSeconds || 5} שניות</span>
        <span className="flex items-center gap-1">
          <Type className="w-3 h-3 text-yellow-400" />
          <span>סגנון כתוביות: {subtitleStyle}</span>
        </span>
      </div>
    </div>
  );
};
