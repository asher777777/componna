import React, { useState } from 'react';
import {
  Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Minimize2,
  Smartphone, Monitor, Square, Subtitles, Activity
} from 'lucide-react';
import { useLivingPlayer, LivingPlayerProvider } from '../context/LivingPlayerContext';
import { LivingVideoLayer } from './LivingVideoLayer';
import { LivingOverlayManager } from './LivingOverlayManager';
import { LivingVoiceBubble } from './LivingVoiceBubble';
import { AspectRatioType, LivingCampaignContract } from '../types';

interface LivingPlayerContainerProps {
  campaignId?: string;
  initialCampaign?: LivingCampaignContract;
  aspectRatio?: AspectRatioType;
  className?: string;
  embedMode?: boolean;
}

const LivingPlayerInner: React.FC<{
  initialAspectRatio?: AspectRatioType;
  className?: string;
  embedMode?: boolean;
}> = ({ initialAspectRatio = '9:16', className = '', embedMode = false }) => {
  const {
    campaign,
    currentScene,
    currentSceneId,
    isPlaying,
    isMuted,
    telemetryEvents,
    togglePlay,
    toggleMute,
    transitionTo,
    resetSession
  } = useLivingPlayer();

  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(
    initialAspectRatio || campaign.aspectRatio || '9:16'
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);

  const sceneList = Object.values(campaign.scenes || {});

  const getAspectClass = () => {
    if (isFullscreen) return 'w-full h-full';
    switch (aspectRatio) {
      case '16:9':
        return 'w-full max-w-4xl aspect-video';
      case '1:1':
        return 'w-full max-w-lg aspect-square';
      case '9:16':
      default:
        return 'w-full max-w-[420px] aspect-[9/16]';
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black' : className
      }`}
      dir="rtl"
    >
      {/* Player Frame */}
      <div
        className={`relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-black transition-all duration-300 ${getAspectClass()}`}
      >
        {/* Video & Subtitles Playback Layer */}
        <LivingVideoLayer showSubtitles={showSubtitles} />

        {/* Interactive Overlays Layer (Capsule Carousel, Forms, Quick Replies) */}
        <LivingOverlayManager />

        {/* Voice AI Conversational Bubble */}
        <LivingVoiceBubble />

        {/* Side Scene Stepper Pagination (PlayerSidePagination) */}
        {sceneList.length > 1 && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 pointer-events-auto">
            {sceneList.map((scene, idx) => {
              const isCurrent = scene.id === currentSceneId || scene.id === currentScene?.id;
              return (
                <button
                  key={scene.id || idx}
                  onClick={() => transitionTo(scene.id, 'side_stepper')}
                  title={`סצנה ${idx + 1}: ${scene.title}`}
                  className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110 shadow-lg shadow-amber-500/40'
                      : 'bg-black/60 text-slate-300 border-white/20 hover:bg-white/20'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}

        {/* Top Floating Controls Bar */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-30 flex items-center justify-between pointer-events-auto">
          {/* Campaign Title / Current Scene Pill */}
          <div className="bg-black/65 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] text-white max-w-[55%]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold truncate">{currentScene?.title || campaign.name || 'עמוד חי'}</span>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1 bg-black/65 backdrop-blur-md border border-white/15 rounded-full p-1 text-white">
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              title={isPlaying ? 'השהה' : 'נגן'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              title={isMuted ? 'בטל השתקה' : 'השתק'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer ${
                showSubtitles ? 'text-amber-400' : 'text-slate-400'
              }`}
              title="כתוביות (CC)"
            >
              <Subtitles className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={resetSession}
              className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              title="התחל מחדש"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {!embedMode && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                title={isFullscreen ? 'צא ממסך מלא' : 'מסך מלא'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls: Aspect Ratio Switcher & Telemetry Inspector (Studio Mode) */}
      {!embedMode && !isFullscreen && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-3 mt-3">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl text-xs text-slate-400">
            <span className="text-[11px] font-bold">תצוגה:</span>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                aspectRatio === '9:16' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>מובייל (9:16)</span>
            </button>
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                aspectRatio === '16:9' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>מחשב (16:9)</span>
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                aspectRatio === '1:1' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              <Square className="w-3 h-3" />
              <span>ריבוע (1:1)</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                showTelemetry ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>טלמטריה ואירועים ({telemetryEvents.length})</span>
            </button>
          </div>

          {/* Live Telemetry Inspector Drawer */}
          {showTelemetry && (
            <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3 text-right max-h-44 overflow-y-auto space-y-1.5">
              <div className="text-[11px] font-black text-amber-400 mb-1">
                יומן אירועים חי (מעברי סצנות, הקלקות כרטיסים, כוונות קול וטפסים):
              </div>
              {telemetryEvents.length === 0 ? (
                <p className="text-[11px] text-slate-500">טרם נרשמו אינטראקציות בסשן הנוכחי.</p>
              ) : (
                telemetryEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between text-[11px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800/80"
                  >
                    <span className="text-slate-200 font-medium">{ev.detail}</span>
                    <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                      {ev.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const LivingPlayerContainer: React.FC<LivingPlayerContainerProps> = ({
  campaignId,
  initialCampaign,
  aspectRatio,
  className = '',
  embedMode = false
}) => {
  return (
    <LivingPlayerProvider initialCampaign={initialCampaign} campaignIdOrSlug={campaignId}>
      <LivingPlayerInner initialAspectRatio={aspectRatio} className={className} embedMode={embedMode} />
    </LivingPlayerProvider>
  );
};
