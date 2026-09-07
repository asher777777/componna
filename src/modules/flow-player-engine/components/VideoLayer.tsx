import React, { useRef, useEffect, useState, useMemo } from 'react';
import { usePlayerMachine } from '../context/PlayerMachineContext';

export const VideoLayer: React.FC = () => {
  const {
    campaign,
    isPlaying,
    isMuted,
    activeVideoSlot,
    videoUrls,
    currentNode,
    transitionTo,
    logEvent,
  } = usePlayerMachine();

  const video0Ref = useRef<HTMLVideoElement>(null);
  const video1Ref = useRef<HTMLVideoElement>(null);

  // visibleSlot tracks which video slot is visibly presented on top to the user
  const [visibleSlot, setVisibleSlot] = useState<0 | 1>(activeVideoSlot);
  const [hasVideoError0, setHasVideoError0] = useState<boolean>(false);
  const [hasVideoError1, setHasVideoError1] = useState<boolean>(false);

  // Determine loop setting from node trigger config
  const isLooping = currentNode?.loopUntilTrigger ?? currentNode?.loop ?? true;

  // Determine sound setting from node trigger config (or global mute toggle)
  const isSoundActive = (currentNode?.soundEnabled ?? true) && !isMuted;

  // Determine auto-play setting from node trigger config
  const shouldPlay = (currentNode?.autoPlay ?? true) && isPlaying;

  const currentUrl = videoUrls[activeVideoSlot] || currentNode?.videoUrl || '';

  // Extract all unique video URLs from the campaign to preload them in the background
  const preloadUrls = useMemo(() => {
    const urls = new Set<string>();
    if (campaign?.states) {
      Object.values(campaign.states).forEach((node) => {
        if (node.videoUrl) urls.add(node.videoUrl);
        if (node.fallbackVideoUrl) urls.add(node.fallbackVideoUrl);
      });
    }
    return Array.from(urls);
  }, [campaign]);

  // Synchronize playback and dual-slot crossfade cleanly without race conditions
  useEffect(() => {
    const incomingSlot = activeVideoSlot;
    const outgoingSlot = incomingSlot === 0 ? 1 : 0;

    const incomingVideo = incomingSlot === 0 ? video0Ref.current : video1Ref.current;
    const outgoingVideo = outgoingSlot === 0 ? video0Ref.current : video1Ref.current;

    if (!incomingVideo) return;

    // Reset error state
    if (incomingSlot === 0) setHasVideoError0(false);
    else setHasVideoError1(false);

    // Ensure audio and loop state
    incomingVideo.muted = !isSoundActive;
    incomingVideo.loop = isLooping;

    // Load new src if changed
    if (currentUrl && incomingVideo.src !== currentUrl) {
      incomingVideo.src = currentUrl;
      incomingVideo.load();
    }

    // Switch visible slot immediately on transition
    setVisibleSlot(incomingSlot);

    if (shouldPlay && currentUrl) {
      const playPromise = incomingVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('[VideoLayer] Video auto-play policy notice:', err);
          }
        });
      }
    } else {
      incomingVideo.pause();
    }

    // Stop outgoing video safely after crossfade
    if (outgoingVideo) {
      const timer = setTimeout(() => {
        try {
          outgoingVideo.pause();
          outgoingVideo.currentTime = 0;
        } catch {}
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [activeVideoSlot, currentUrl, shouldPlay, isSoundActive, isLooping]);

  // Sync mute state changes dynamically
  useEffect(() => {
    const vid0 = video0Ref.current;
    const vid1 = video1Ref.current;
    if (vid0) vid0.muted = !isSoundActive;
    if (vid1) vid1.muted = !isSoundActive;
  }, [isSoundActive]);

  // Handle video ended event
  const handleEnded = (slot: 0 | 1) => {
    if (slot !== activeVideoSlot) return;

    logEvent({
      type: 'video_ended',
      details: { nodeId: currentNode?.id, slot },
    });

    if (currentNode?.autoTransitionOnEnd && currentNode?.autoTransitionTarget) {
      transitionTo(currentNode.autoTransitionTarget, 'node_transition', {
        reason: 'video_ended_auto_transition',
      });
    } else if (currentNode?.autoTransitionTarget && !isLooping) {
      transitionTo(currentNode.autoTransitionTarget, 'node_transition', {
        reason: 'video_ended',
      });
    }
  };

  const hasAnyVideo = Boolean(videoUrls[0] || videoUrls[1] || currentUrl);

  return (
    <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden flex items-center justify-center select-none">
      {/* Video Slot 0 */}
      <video
        ref={video0Ref}
        src={videoUrls[0] || ''}
        playsInline
        preload="auto"
        muted={!isSoundActive}
        loop={isLooping}
        onEnded={() => handleEnded(0)}
        onError={() => setHasVideoError0(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-out ${
          visibleSlot === 0
            ? 'opacity-100 z-20 pointer-events-auto'
            : 'opacity-0 z-10 pointer-events-none'
        }`}
      />

      {/* Video Slot 1 */}
      <video
        ref={video1Ref}
        src={videoUrls[1] || ''}
        playsInline
        preload="auto"
        muted={!isSoundActive}
        loop={isLooping}
        onEnded={() => handleEnded(1)}
        onError={() => setHasVideoError1(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-out ${
          visibleSlot === 1
            ? 'opacity-100 z-20 pointer-events-auto'
            : 'opacity-0 z-10 pointer-events-none'
        }`}
      />

      {/* Fallback Graphic only if there is genuinely no video URL configured */}
      {!hasAnyVideo && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-slate-300 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-3 animate-pulse">
            <span className="text-3xl">🎬</span>
          </div>
          <div className="font-bold text-base text-white mb-1">{currentNode?.name || 'טוען סצנה...'}</div>
          <p className="text-xs text-slate-400 max-w-xs">
            {currentNode?.description || 'בחר סרטון וידאו בסטודיו לצומת זה כדי להציגו'}
          </p>
        </div>
      )}

      {/* Invisible Background Preloader Pool for Zero-Latency Transitions */}
      <div className="hidden" aria-hidden="true">
        {preloadUrls.map((url) => (
          <video
            key={url}
            src={url}
            preload="auto"
            muted
            playsInline
            className="hidden"
          />
        ))}
      </div>
    </div>
  );
};