import React, { useState } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Minimize2, 
  Sparkles, Smartphone, Monitor, Square, Share2
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
  const { campaign, currentScene, isPlaying, isMuted, togglePlay, toggleMute, resetSession } = useLivingPlayer();
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(
    initialAspectRatio || campaign.aspectRatio || '9:16'
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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
    <div className={`relative flex flex-col items-center justify-center ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : className}`} dir="rtl">
      
      {/* Player Frame */}
      <div className={`relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-black transition-all duration-300 ${getAspectClass()}`}>
        
        {/* Video Playback Layer */}
        <LivingVideoLayer />

        {/* Interactive Overlays Layer (Buttons, Forms, Cards) */}
        <LivingOverlayManager />

        {/* Voice AI Conversational Bubble */}
        <LivingVoiceBubble />

        {/* Top Floating Controls Bar */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
          {/* Campaign Title / Presenter Pill */}
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold truncate max-w-[150px]">{campaign.name || 'עמוד חי'}</span>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1 text-white">
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

      {/* Optional Aspect Ratio Switcher (when not embedded or full screen) */}
      {!embedMode && !isFullscreen && (
        <div className="flex items-center gap-2 mt-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl text-xs text-slate-400">
          <span className="text-[11px] font-bold">תצוגה:</span>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${aspectRatio === '9:16' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'}`}
          >
            <Smartphone className="w-3 h-3" />
            <span>מובייל (9:16)</span>
          </button>
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${aspectRatio === '16:9' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'}`}
          >
            <Monitor className="w-3 h-3" />
            <span>מחשב (16:9)</span>
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${aspectRatio === '1:1' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'}`}
          >
            <Square className="w-3 h-3" />
            <span>ריבוע (1:1)</span>
          </button>
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
