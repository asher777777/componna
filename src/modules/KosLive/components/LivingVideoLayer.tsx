import React, { useRef, useEffect } from 'react';
import { useLivingPlayer } from '../context/LivingPlayerContext';
import { cleanSubtitleText } from '../services/subtitleService';

export const LivingVideoLayer: React.FC<{ showSubtitles?: boolean }> = ({ showSubtitles = true }) => {
  const { currentScene, isPlaying, isMuted, transitionTo } = useLivingPlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const videoUrl = currentScene?.renderedVideoUrl || currentScene?.videoUrl || '';
  const backgroundUrl =
    currentScene?.generatedImageUrl ||
    currentScene?.backgroundMediaUrl ||
    currentScene?.fallbackImageUrl ||
    '';

  const isVideo =
    !!videoUrl &&
    (videoUrl.endsWith('.mp4') ||
      videoUrl.endsWith('.webm') ||
      videoUrl.includes('preview') ||
      videoUrl.includes('firebasestorage') ||
      videoUrl.includes('storage.googleapis.com') ||
      videoUrl.startsWith('blob:') ||
      !!currentScene?.renderedVideoUrl);

  // Sync video & synthesized TTS audio play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.warn('[LivingVideoLayer] Autoplay prevented, waiting for user gesture:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }

    if (audioRef.current && currentScene?.renderedAudioUrl) {
      audioRef.current.muted = isMuted;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted, videoUrl, currentScene?.renderedAudioUrl]);

  // Handle video ended & auto-transition
  const handleEnded = () => {
    const target = currentScene?.autoTransitionTarget || currentScene?.nextSceneId;
    if (currentScene?.autoTransitionOnEnd && target) {
      const delay = (currentScene.autoTransitionDelaySec || currentScene.autoTransitionAfterSeconds || 0) * 1000;
      setTimeout(() => {
        transitionTo(target, 'auto_end');
      }, delay);
    }
  };

  const subtitleContent = cleanSubtitleText(
    currentScene?.subtitleText || currentScene?.dialogueScript || currentScene?.scriptText || ''
  );

  const shouldRenderSubtitles =
    showSubtitles && currentScene?.subtitleEnabled !== false && subtitleContent.length > 0;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden select-none">
      {/* Synthesized TTS Audio Track (if separate from video) */}
      {currentScene?.renderedAudioUrl && (
        <audio
          ref={audioRef}
          key={currentScene.renderedAudioUrl}
          src={currentScene.renderedAudioUrl}
          muted={isMuted}
        />
      )}

      {/* Video or Background Image */}
      {isVideo ? (
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          poster={backgroundUrl}
          className="w-full h-full object-cover transition-opacity duration-500"
          playsInline
          muted={isMuted || !!currentScene?.renderedAudioUrl}
          loop={currentScene?.loopUntilTrigger !== false && !currentScene?.autoTransitionOnEnd}
          autoPlay
          onEnded={handleEnded}
        />
      ) : backgroundUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 animate-pulse-slow"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      ) : null}

      {/* Cinematic Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/45 pointer-events-none" />

      {/* Live Animated Subtitles Layer */}
      {shouldRenderSubtitles && (
        <div
          dir="rtl"
          className={`absolute left-4 right-4 z-15 pointer-events-none flex justify-center ${
            currentScene?.subtitlePosition === 'top'
              ? 'top-14'
              : currentScene?.subtitlePosition === 'center'
              ? 'top-1/2 -translate-y-1/2'
              : 'bottom-28'
          }`}
        >
          <div
            style={{
              fontSize: `${Math.min(28, Math.max(13, (currentScene?.subtitleFontSize || 22) * 0.72))}px`,
              color: currentScene?.subtitleTextColor || '#FFFFFF'
            }}
            className={`px-3.5 py-1.5 rounded-2xl text-center font-bold leading-relaxed max-w-[92%] transition-all ${
              currentScene?.subtitleStyle === 'tiktok'
                ? 'bg-amber-400 !text-slate-950 font-black shadow-[0_4px_20px_rgba(245,158,11,0.5)]'
                : currentScene?.subtitleStyle === 'glow'
                ? 'bg-black/45 backdrop-blur-sm border border-amber-500/30 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]'
                : currentScene?.subtitleStyle === 'outline'
                ? 'bg-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] font-black'
                : currentScene?.subtitleStyle === 'minimal'
                ? 'bg-black/40 text-slate-100'
                : 'bg-black/75 backdrop-blur-md border border-white/10 shadow-xl'
            }`}
          >
            {subtitleContent}
          </div>
        </div>
      )}
    </div>
  );
};
