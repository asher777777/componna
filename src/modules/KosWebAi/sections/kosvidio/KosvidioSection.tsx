import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { KosvidioSectionConfig } from '../../types/sectionConfigs';
import {
  Play,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const KosvidioSection: React.FC<{ config: KosvidioSectionConfig }> = ({ config }) => {
  const {
    anchorId = 'kosvidio',
    youtubeVideoId,
    videoUrl,
    ambientGlow = true,
    showTheaterMode = true,
    channelName = 'קושאן דיגיטל',
    channelAvatarUrl,
    channelSubscribers,
    verifiedBadge = true,
    title = 'סרטון וידאו מעמיק',
    backgroundColor = '#07090e',
  } = config;

  // Extract clean YouTube ID
  const effectiveVideoId = useMemo(() => {
    if (youtubeVideoId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeVideoId.trim())) {
      return youtubeVideoId.trim();
    }
    if (videoUrl) {
      const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (match) return match[1];
    }
    return youtubeVideoId || 'dQw4w9WgXcQ';
  }, [youtubeVideoId, videoUrl]);

  // Theater mode state
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  return (
    <section
      id={anchorId || 'kosvidio'}
      className="relative w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: backgroundColor || '#07090e' }}
      dir="rtl"
    >
      {/* Background Ambient Mesh Glow */}
      {ambientGlow && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[350px] sm:h-[450px] rounded-full blur-[140px] opacity-25 dark:opacity-35 transition-all duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 80%)',
            }}
          />
        </div>
      )}

      <div
        className={clsx(
          'relative mx-auto transition-all duration-500 ease-out',
          isTheaterMode ? 'max-w-[96vw]' : 'max-w-5xl'
        )}
      >
        {/* ============================================================== */}
        {/* LAYER 1: נגן הוידאו הראשי (Main Interactive Video Player)     */}
        {/* ============================================================== */}
        <div className="relative mb-6">
          <div className="relative rounded-3xl overflow-hidden bg-black/95 shadow-2xl border border-slate-200/20 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
            {/* Player Top Glass Bar (Title & Theater Mode Control) */}
            <div className="px-4 py-2.5 bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="font-bold truncate text-slate-200">{title}</span>
              </div>

              {showTheaterMode && (
                <button
                  type="button"
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-medium cursor-pointer"
                  title={isTheaterMode ? 'חזרה למצב רגיל' : 'מצב קולנוע רחב'}
                >
                  {isTheaterMode ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">מצב רגיל</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">מצב קולנוע</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 16:9 Responsive Video Frame with Anti-leak protection */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${effectiveVideoId}?rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&playsinline=1`}
                title={title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Anti-leak YouTube Redirect Shield */}
              <div 
                className="absolute bottom-0 right-0 w-32 h-14 z-20 pointer-events-auto cursor-default bg-transparent"
                title="נגן וידאו ישיר באתר"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LAYER 2: כותרת ופרטי הערוץ בלבד (Title & Channel Information)   */}
        {/* ============================================================== */}
        <div className="pb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight drop-shadow-sm mb-3">
            {title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* Channel Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden ring-2 ring-slate-200 dark:ring-white/10">
                {channelAvatarUrl ? (
                  <img src={channelAvatarUrl} alt={channelName} className="w-full h-full object-cover" />
                ) : (
                  <span>{channelName.slice(0, 2)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <span>{channelName}</span>
                  {verifiedBadge && <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-400/20" />}
                </div>
                {channelSubscribers && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{channelSubscribers} מנויים</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KosvidioSection;
