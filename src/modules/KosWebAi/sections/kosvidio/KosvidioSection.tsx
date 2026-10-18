import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  KosvidioSectionConfig,
  KosvidioLayoutPreset,
} from '../../types/sectionConfigs';
import {
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Play,
} from 'lucide-react';

export const KosvidioSection: React.FC<{ config: KosvidioSectionConfig }> = ({ config }) => {
  const {
    anchorId = 'kosvidio',
    youtubeVideoId,
    videoUrl,
    playerAspect = '16:9',
    ambientGlow = true,
    glowColor,
    showTheaterMode = true,
    channelName = 'קושאן דיגיטל',
    channelAvatarUrl,
    channelSubscribers = '24.5K',
    verifiedBadge = true,
    title = 'Kosun - צפו בסיפור שלנו',
    backgroundColor = '#07090e',
    layout = 'standard',
    objectScale = 'normal',
    titleColor,
    channelNameColor,
    channelSubscribersColor,
    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor = '#000000',
    textBgOverlayOpacity = 60,
    textBgEffect = 'zoom-glow',
    textBgScope = 'full-section',
  } = config;

  // Extract clean YouTube ID
  const effectiveVideoId = useMemo(() => {
    if (youtubeVideoId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeVideoId.trim())) {
      return youtubeVideoId.trim();
    }
    if (videoUrl) {
      const match = videoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
      );
      if (match) return match[1];
    }
    return youtubeVideoId || 'dQw4w9WgXcQ';
  }, [youtubeVideoId, videoUrl]);

  // Theater mode state
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  // Aspect ratio class
  const aspectClass = useMemo(() => {
    switch (playerAspect) {
      case '21:9':
        return 'aspect-[21/9]';
      case '4:3':
        return 'aspect-[4/3]';
      case '16:9':
      default:
        return 'aspect-video';
    }
  }, [playerAspect]);

  // Scale classes
  const scaleClasses = useMemo(() => {
    switch (objectScale) {
      case 'compact':
        return {
          title: 'text-xl sm:text-2xl md:text-3xl font-extrabold',
          avatar: 'w-8 h-8 text-xs',
          channelName: 'text-sm font-bold',
        };
      case 'large':
        return {
          title: 'text-3xl sm:text-4xl md:text-5xl font-black',
          avatar: 'w-12 h-12 text-base font-black',
          channelName: 'text-lg font-black',
        };
      case 'massive':
        return {
          title: 'text-4xl sm:text-5xl md:text-6xl font-black',
          avatar: 'w-14 h-14 text-lg font-black',
          channelName: 'text-xl font-black',
        };
      case 'normal':
      case 'auto':
      default:
        return {
          title: 'text-2xl sm:text-3xl md:text-4xl font-black',
          avatar: 'w-10 h-10 text-sm font-bold',
          channelName: 'text-base font-bold',
        };
    }
  }, [objectScale]);

  // Layout player container styling
  const layoutPlayerStyle = useMemo(() => {
    switch (layout) {
      case 'feminine':
        return {
          container:
            'rounded-[2.5rem] border border-rose-300/40 dark:border-rose-900/40 shadow-[0_20px_50px_rgba(244,63,94,0.15)] ring-1 ring-rose-400/20 bg-black/95',
          headerBar:
            'px-5 py-3 bg-gradient-to-r from-rose-950/80 via-slate-900/80 to-rose-950/80 backdrop-blur-md border-b border-rose-400/20 text-rose-200',
          dotColor: 'bg-rose-500 animate-pulse',
          theaterBtn:
            'rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30',
          glowGradient:
            'radial-gradient(circle, rgba(244, 63, 94, 0.4) 0%, rgba(251, 113, 133, 0.2) 50%, transparent 80%)',
        };
      case 'masculine':
        return {
          container:
            'rounded-2xl border-2 border-slate-700 dark:border-slate-700/80 ring-2 ring-amber-500/25 shadow-2xl bg-black',
          headerBar:
            'px-4 py-2.5 bg-slate-950 border-b border-amber-500/30 text-amber-300 font-extrabold uppercase',
          dotColor: 'bg-amber-500',
          theaterBtn:
            'rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 font-bold',
          glowGradient:
            'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(39, 39, 42, 0.4) 50%, transparent 80%)',
        };
      case 'spiritual':
        return {
          container:
            'rounded-3xl border border-teal-300/40 dark:border-teal-800/40 shadow-[0_20px_50px_rgba(16,185,129,0.12)] bg-black/95',
          headerBar:
            'px-5 py-3 bg-teal-950/80 backdrop-blur-md border-b border-teal-500/20 text-teal-200',
          dotColor: 'bg-teal-400 animate-pulse',
          theaterBtn:
            'rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30',
          glowGradient:
            'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(251, 191, 36, 0.15) 50%, transparent 80%)',
        };
      case 'sharp':
        return {
          container:
            'rounded-none border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.95)] bg-black',
          headerBar:
            'px-4 py-2 border-b-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-black uppercase text-xs',
          dotColor: 'bg-white dark:bg-black',
          theaterBtn:
            'rounded-none border border-current bg-white dark:bg-black text-black dark:text-white font-mono font-bold',
          glowGradient: 'none',
        };
      case 'analytical':
        return {
          container:
            'rounded-none border border-cyan-500/60 shadow-xl shadow-cyan-500/10 bg-slate-950',
          headerBar:
            'px-4 py-2 bg-slate-950/90 border-b border-cyan-500/40 text-cyan-300 font-mono text-xs',
          dotColor: 'bg-cyan-400 animate-ping',
          theaterBtn:
            'rounded-xs bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-mono text-xs',
          glowGradient:
            'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(37, 99, 235, 0.2) 50%, transparent 80%)',
        };
      case 'standard':
      default:
        return {
          container:
            'rounded-3xl border border-slate-200/20 dark:border-white/10 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 bg-black/95',
          headerBar:
            'px-4 py-2.5 bg-slate-900/80 backdrop-blur-md border-b border-white/10 text-slate-300',
          dotColor: 'bg-red-500 animate-pulse',
          theaterBtn: 'rounded-full bg-white/10 hover:bg-white/20 text-white',
          glowGradient:
            'radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 80%)',
        };
    }
  }, [layout]);

  // Text Background effect class
  const textBgEffectClass = useMemo(() => {
    switch (textBgEffect) {
      case 'zoom-glow':
        return 'group-hover:scale-105 group-hover:brightness-110 transition-transform duration-700 ease-out';
      case 'shimmer-sweep':
        return 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full hover:before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';
      case 'float-parallax':
        return 'group-hover:-translate-y-1.5 transition-transform duration-500 ease-out';
      case 'blur-reveal':
        return 'transition-all duration-700 blur-[0.4px] hover:blur-0';
      case 'gradient-shift':
        return 'animate-pulse';
      default:
        return '';
    }
  }, [textBgEffect]);

  // Layout Header Badge
  const renderLayoutHeaderBadge = () => {
    switch (layout) {
      case 'feminine':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>תוכן וידאו בלעדי ומעמיק</span>
          </div>
        );
      case 'masculine':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>KOSVIDIO • OFFICIAL BROADCAST</span>
          </div>
        );
      case 'spiritual':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold mb-2">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>חוויית צפייה והתבוננות</span>
          </div>
        );
      case 'sharp':
        return (
          <div className="px-3 py-1 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-black uppercase mb-2">
            KOSVIDIO_MEDIA_NODE // 2026
          </div>
        );
      case 'analytical':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>TELEMETRY STREAM // 4K BROADCAST</span>
          </div>
        );
      case 'standard':
      default:
        return null;
    }
  };

  const isAnalytical = layout === 'analytical';

  return (
    <section
      id={anchorId || 'kosvidio'}
      className={`relative w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300 ${
        textBgEnabled && textBgScope === 'full-section' ? 'group' : ''
      }`}
      style={{ backgroundColor: backgroundColor || '#07090e' }}
      dir="rtl"
    >
      {/* Full-Section Text Background Image if scope is full-section */}
      {textBgEnabled && textBgImageUrl && textBgScope === 'full-section' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={textBgImageUrl}
            alt=""
            className={`w-full h-full object-cover ${textBgEffectClass}`}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: textBgOverlayColor,
              opacity: (textBgOverlayOpacity ?? 60) / 100,
            }}
          />
        </div>
      )}

      {/* Background Ambient Mesh Glow */}
      {ambientGlow && layout !== 'sharp' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[350px] sm:h-[480px] rounded-full blur-[140px] opacity-25 dark:opacity-35 transition-all duration-700"
            style={{
              background: glowColor
                ? `radial-gradient(circle, ${glowColor} 0%, transparent 75%)`
                : layoutPlayerStyle.glowGradient,
            }}
          />
        </div>
      )}

      <div
        className={clsx(
          'relative mx-auto transition-all duration-500 ease-out z-10',
          isTheaterMode ? 'max-w-[96vw]' : 'max-w-5xl'
        )}
      >
        {/* ============================================================== */}
        {/* LAYER 1: נגן הוידאו הראשי (Main Interactive Video Player)     */}
        {/* ============================================================== */}
        <div className="relative mb-6">
          <div
            className={`relative overflow-hidden ${layoutPlayerStyle.container}`}
            style={{
              clipPath: isAnalytical
                ? 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)'
                : undefined,
            }}
          >
            {/* Player Top Glass Bar (Title & Theater Mode Control) */}
            <div className={`flex items-center justify-between text-xs ${layoutPlayerStyle.headerBar}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${layoutPlayerStyle.dotColor}`} />
                <span className="font-bold truncate text-slate-200">{title}</span>
              </div>

              {showTheaterMode && (
                <button
                  type="button"
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className={`flex items-center gap-1.5 px-3 py-1 transition-all text-xs font-medium cursor-pointer ${layoutPlayerStyle.theaterBtn}`}
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

            {/* Responsive Video Frame with aspect ratio and Anti-leak protection */}
            <div className={`relative w-full ${aspectClass} bg-black flex items-center justify-center`}>
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
        <div
          className={`pb-2 relative rounded-3xl transition-all duration-300 ${
            textBgEnabled && textBgScope === 'text-card'
              ? 'group overflow-hidden p-4 sm:p-6 shadow-2xl backdrop-blur-md'
              : ''
          }`}
        >
          {/* Text-Card Background Image */}
          {textBgEnabled && textBgImageUrl && textBgScope === 'text-card' && (
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-3xl">
              <img
                src={textBgImageUrl}
                alt=""
                className={`w-full h-full object-cover ${textBgEffectClass}`}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: textBgOverlayColor,
                  opacity: (textBgOverlayOpacity ?? 60) / 100,
                }}
              />
            </div>
          )}

          {renderLayoutHeaderBadge()}

          <h1
            className={`${scaleClasses.title} text-slate-900 dark:text-white leading-tight tracking-tight drop-shadow-sm mb-3`}
            style={{ color: titleColor }}
          >
            {title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* Channel Info */}
            <div className="flex items-center gap-2.5">
              <div
                className={`${scaleClasses.avatar} rounded-full bg-gradient-to-tr from-red-500 to-indigo-600 flex items-center justify-center text-white shadow-md overflow-hidden ring-2 ring-slate-200 dark:ring-white/10 shrink-0`}
              >
                {channelAvatarUrl ? (
                  <img
                    src={channelAvatarUrl}
                    alt={channelName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{channelName.slice(0, 2)}</span>
                )}
              </div>
              <div>
                <div
                  className={`flex items-center gap-1.5 ${scaleClasses.channelName} text-slate-800 dark:text-slate-200`}
                  style={{ color: channelNameColor }}
                >
                  <span>{channelName}</span>
                  {verifiedBadge && (
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        layout === 'feminine'
                          ? 'text-rose-500 fill-rose-400/20'
                          : layout === 'masculine'
                          ? 'text-amber-500 fill-amber-400/20'
                          : layout === 'spiritual'
                          ? 'text-teal-500 fill-teal-400/20'
                          : 'text-sky-500 fill-sky-400/20'
                      }`}
                    />
                  )}
                </div>
                {channelSubscribers && (
                  <div
                    className="text-[11px] text-slate-500 dark:text-slate-400"
                    style={{ color: channelSubscribersColor }}
                  >
                    {channelSubscribers} מנויים
                  </div>
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
