import React, { useState } from 'react';
import { Play, Pause, Volume2, Maximize2, Sparkles, Film, CheckCircle2 } from 'lucide-react';
import { VideoScene } from '../types';

interface VideoPreviewPlayerProps {
  scene: VideoScene;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({ scene, aspectRatio }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const aspectClass = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16] max-w-[280px]',
    '1:1': 'aspect-square max-w-[340px]'
  }[aspectRatio];

  return (
    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3 flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
        <span className="font-bold text-slate-200 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-purple-400" />
          <span>תצוגה מקדימה לסצנה ({aspectRatio})</span>
        </span>
        {scene.renderedVideoUrl ? (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>וידאו מוכן</span>
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono">טיוטת תצוגה</span>
        )}
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
            {/* Background Image if available */}
            {scene.backgroundMediaUrl && (
              <img
                src={scene.backgroundMediaUrl}
                alt="Background preview"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}

            {/* Scene Overlay Information */}
            <div className="relative z-10 p-4 text-center space-y-2 bg-black/40 backdrop-blur-xs rounded-2xl border border-white/10 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white line-clamp-2">
                "{scene.dialogueScript || 'סצנה מוכנה להפקת וידאו...'}"
              </p>
              <span className="text-[10px] text-purple-300 font-mono block">
                אווטאר: {scene.avatarId || 'Wayne'}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="w-full text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <span>משך מוערך: ~{scene.durationSeconds || 5} שניות</span>
        <span>מעבר: {scene.transition || 'fade'}</span>
      </div>
    </div>
  );
};
