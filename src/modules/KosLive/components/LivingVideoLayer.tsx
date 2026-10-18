import React, { useRef, useEffect } from 'react';
import { useLivingPlayer } from '../context/LivingPlayerContext';

export const LivingVideoLayer: React.FC = () => {
  const { currentScene, isPlaying, isMuted, transitionTo } = useLivingPlayer();
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = currentScene?.renderedVideoUrl || currentScene?.backgroundMediaUrl || '';
  const isVideo = !!currentScene?.renderedVideoUrl || (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('preview'));

  // Sync play/pause
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
  }, [isPlaying, videoUrl]);

  // Handle video ended & auto-transition
  const handleEnded = () => {
    if (currentScene?.autoTransitionOnEnd && currentScene?.autoTransitionTarget) {
      const delay = (currentScene.autoTransitionDelaySec || 0) * 1000;
      setTimeout(() => {
        transitionTo(currentScene.autoTransitionTarget!, 'auto_end');
      }, delay);
    }
  };

  if (!isVideo && currentScene?.backgroundMediaUrl) {
    return (
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 select-none"
        style={{ backgroundImage: `url(${currentScene.backgroundMediaUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden select-none">
      <video
        ref={videoRef}
        key={videoUrl}
        src={videoUrl}
        className="w-full h-full object-cover transition-opacity duration-500"
        playsInline
        muted={isMuted}
        autoPlay
        onEnded={handleEnded}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />
    </div>
  );
};
