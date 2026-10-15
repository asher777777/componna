import React, { useState, useRef, useMemo } from 'react';
import clsx from 'clsx';
import {
  Sparkles,
  LayoutGrid,
  Layers,
  Compass,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Clock,
  Play,
  Pause,
  ExternalLink,
  X,
  Share2,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import {
  FutureContentSectionConfig,
  FutureContentItem,
  FutureContentMode,
} from '../../types/sectionConfigs';

export interface FutureContentSectionProps {
  config: FutureContentSectionConfig;
}

export const FutureContentSection: React.FC<FutureContentSectionProps> = ({ config }) => {
  const {
    id,
    anchorId,
    title = 'העתיד כבר כאן: תוכן פורץ דרך',
    subtitle = 'שילוב רב-ממדי של עומק מרחבי, טיפוגרפיה קינטית וזכוכית פריזמטית',
    badge = 'חוויית תוכן 2027',
    items = [],
    activeMode: initialMode = 'prism-bento',
    allowVisitorSwitching = true,
    ambientMeshGlow = true,
    ambientGlowColor = '#6366f1',
    effectStyle = 'prism-beam',
    primaryButton,
    secondaryButton,
    backgroundColor = 'transparent',
    titleColor,
    cardBgColor,
  } = config;

  // Active view mode (allows visitor to switch live if enabled)
  const [currentMode, setCurrentMode] = useState<FutureContentMode>(initialMode);
  
  // Interactive category filter for Floating Islands mode
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');
  
  // Audio preview simulation state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Active item in Peek Sheet Modal (Floating Islands)
  const [peekItem, setPeekItem] = useState<FutureContentItem | null>(null);

  // Horizontal scroll ref for Kinetic Editorial mode
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Available unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['הכל', ...Array.from(set)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'הכל') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const toggleAudio = (itemId: string) => {
    if (playingAudioId === itemId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(itemId);
    }
  };

  const scrollKinetic = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 420;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id={anchorId || id || 'future-content-2027'}
      className="relative w-full py-16 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* 1. Ambient Ray-Tracing Mesh Glow (2027 Spatial Lighting) */}
      {ambientMeshGlow && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-25 dark:opacity-35 transition-all duration-700 animate-pulse"
            style={{ backgroundColor: ambientGlowColor || '#6366f1' }}
          />
          <div
            className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 dark:opacity-30 transition-all duration-700"
            style={{ backgroundColor: '#ec4899' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        {/* Top Floating Badge */}
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 dark:bg-slate-800/80 border border-slate-700/60 backdrop-blur-xl shadow-lg mb-6">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 animate-ping" />
            <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-200 bg-clip-text text-transparent">
              {badge}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              2027 OS
            </span>
          </div>
        )}

        {/* Section Headline & Description */}
        <div className="text-center max-w-3xl mb-8">
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white"
            style={{ color: titleColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* 2. Interactive Mode Switcher Pill (2027 Futuristic Capsule Switcher) */}
        {allowVisitorSwitching && (
          <div className="inline-flex items-center p-1.5 rounded-full bg-slate-950/70 dark:bg-slate-900/90 border border-slate-800/80 backdrop-blur-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.5)] mb-12 transition-all">
            <button
              type="button"
              onClick={() => setCurrentMode('prism-bento')}
              className={clsx(
                'relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer',
                currentMode === 'prism-bento'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>בנטו מרחבי</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentMode('kinetic-editorial')}
              className={clsx(
                'relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer',
                currentMode === 'kinetic-editorial'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>מגזין קינטי</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentMode('floating-islands')}
              className={clsx(
                'relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer',
                currentMode === 'floating-islands'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>איים צפים</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            MODE 1: SPATIAL PRISM BENTO
        ========================================================================= */}
        {currentMode === 'prism-bento' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[220px] sm:auto-rows-[260px] animate-fadeIn">
            {items.map((item, index) => {
              // Layout assignment: 1st item is hero (2x2), 2nd is vertical or audio, others are compact tiles
              const isHero = index === 0;
              const isMetric = !!item.metrics && item.metrics.length > 0;
              const isAudioCard = !!item.audioDuration && index === 2;

              return (
                <div
                  key={item.id || index}
                  className={clsx(
                    'group relative rounded-3xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between transition-all duration-500',
                    'bg-slate-900/70 dark:bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl',
                    'hover:shadow-[0_20px_50px_rgba(8,112,184,0.15)] hover:border-indigo-500/50 hover:-translate-y-1',
                    isHero && 'md:col-span-2 md:row-span-2',
                    index === 1 && 'md:col-span-1 md:row-span-2',
                    index > 2 && 'md:col-span-1 md:row-span-1'
                  )}
                  style={{ backgroundColor: cardBgColor }}
                >
                  {/* Iridescent Border Beam Effect */}
                  {effectStyle === 'prism-beam' && (
                    <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-cyan-400/40 pointer-events-none transition-all duration-700" />
                  )}

                  {/* Image / Video Background */}
                  {item.imageUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={clsx(
                          'w-full h-full object-cover transition-transform duration-700 group-hover:scale-105',
                          isHero ? 'opacity-40' : 'opacity-20 group-hover:opacity-30'
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
                    </div>
                  )}

                  {/* Card Header: Tags & Actions */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white backdrop-blur-md border border-white/15 tracking-wide">
                      {item.category || 'תוכן'}
                    </span>

                    {item.readTime && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {item.readTime}
                      </span>
                    )}
                  </div>

                  {/* Special Widget: Audio Player Bar if available */}
                  {isAudioCard && (
                    <div className="relative z-10 my-auto p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleAudio(item.id)}
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 hover:scale-105 transition cursor-pointer"
                          >
                            {playingAudioId === item.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <div>
                            <div className="text-xs font-bold text-white">תקציר קולי מבוסס AI</div>
                            <div className="text-[10px] font-mono text-cyan-300">{item.audioDuration || '01:45'}</div>
                          </div>
                        </div>

                        {/* Animated Equalizer Wave */}
                        <div className="flex items-end gap-1 h-5">
                          {[40, 80, 50, 100, 60, 90, 30].map((h, i) => (
                            <span
                              key={i}
                              className={clsx(
                                'w-1 rounded-full bg-cyan-400 transition-all duration-300',
                                playingAudioId === item.id ? 'animate-pulse' : 'opacity-40'
                              )}
                              style={{ height: playingAudioId === item.id ? `${h}%` : '25%' }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Widget: Live Metrics if available */}
                  {isMetric && item.metrics && (
                    <div className="relative z-10 grid grid-cols-2 gap-2 my-2 p-3 rounded-xl bg-black/40 border border-white/10">
                      {item.metrics.map((m, mi) => (
                        <div key={mi} className="text-right">
                          <div className="text-[10px] text-slate-400 font-medium">{m.label}</div>
                          <div className="text-lg font-black text-white font-mono flex items-center gap-1">
                            {m.value}
                            {m.trend && (
                              <span className="text-[10px] text-emerald-400 flex items-center">
                                <TrendingUp className="w-3 h-3" />
                                {m.trend}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card Bottom: Title & Description */}
                  <div className="relative z-10 text-right mt-auto pt-2">
                    {item.tag && (
                      <div className="text-xs font-semibold text-cyan-400 mb-1">{item.tag}</div>
                    )}
                    <h3
                      className={clsx(
                        'font-black text-white tracking-tight leading-snug',
                        isHero ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-lg sm:text-xl'
                      )}
                    >
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.subtitle}
                      </p>
                    )}

                    {isHero && item.ctaText && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setPeekItem(item)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition hover:scale-105 cursor-pointer"
                        >
                          <span>{item.ctaText}</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            MODE 2: KINETIC EDITORIAL MAGAZINE
        ========================================================================= */}
        {currentMode === 'kinetic-editorial' && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            {/* Scroll Navigation Header */}
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-pink-400 uppercase tracking-widest font-bold">
                  ISSUE 2027 // STREAM
                </span>
                <span className="text-xs text-slate-400">גלילה אופקית חלקה</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollKinetic('left')}
                  className="p-2.5 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 transition cursor-pointer"
                  title="גלול שמאלה"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollKinetic('right')}
                  className="p-2.5 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 transition cursor-pointer"
                  title="גלול ימינה"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Kinetic Stream Container */}
            <div
              ref={scrollContainerRef}
              className="w-full flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
            >
              {items.map((item, index) => {
                const indexFormatted = String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={item.id || index}
                    className="flex-shrink-0 w-[300px] sm:w-[380px] md:w-[440px] snap-start group relative rounded-[32px] overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:border-pink-500/50 hover:shadow-[0_20px_50px_rgba(236,72,153,0.15)]"
                    style={{ backgroundColor: cardBgColor }}
                  >
                    {/* Index Number & Category */}
                    <div className="flex items-center justify-between w-full mb-6">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-slate-700 group-hover:text-pink-400 transition-colors">
                        {indexFormatted}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-300 border border-pink-500/20">
                        {item.category || 'מאמר'}
                      </span>
                    </div>

                    {/* Image with High-Contrast Editorial Mask */}
                    {item.imageUrl && (
                      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-slate-950">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      </div>
                    )}

                    {/* Headline and Narrative */}
                    <div className="text-right">
                      <h3 className="text-xl sm:text-2xl font-black text-white leading-snug group-hover:text-pink-100 transition-colors">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Bottom Utility Bar: Audio Clip & Read More */}
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-6">
                      <button
                        type="button"
                        onClick={() => toggleAudio(item.id)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-pink-400 transition cursor-pointer"
                      >
                        {playingAudioId === item.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{playingAudioId === item.id ? 'עצור השמעה' : 'האזן לתקציר'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPeekItem(item)}
                        className="p-2 rounded-full bg-slate-800 text-white hover:bg-pink-600 transition cursor-pointer"
                        title="קרא בהרחבה"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 3: FLOATING ISLANDS & PEEK SHEETS
        ========================================================================= */}
        {currentMode === 'floating-islands' && (
          <div className="w-full flex flex-col items-center gap-8 animate-fadeIn">
            {/* Category Filter Capsules */}
            {categories.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={clsx(
                      'px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer',
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Floating Islands Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id || index}
                  onClick={() => setPeekItem(item)}
                  className="group relative rounded-3xl overflow-hidden bg-slate-900/60 dark:bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-emerald-500/60 hover:shadow-[0_25px_60px_rgba(16,185,129,0.15)] hover:-translate-y-2 cursor-pointer"
                  style={{ backgroundColor: cardBgColor }}
                >
                  {/* Floating Island Badge */}
                  <div className="relative z-10 flex items-center justify-between w-full mb-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.category || 'אי מידע'}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Visual Window */}
                  {item.imageUrl && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 bg-slate-950">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      
                      {/* Floating Quick Peek Pill */}
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                        חשיפה מהירה ✦
                      </div>
                    </div>
                  )}

                  {/* Title & Body */}
                  <div className="relative z-10 text-right">
                    <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Island Footer */}
                  <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-4 mt-5 text-xs text-slate-400">
                    {item.author ? (
                      <div className="flex items-center gap-2">
                        {item.author.avatarUrl && (
                          <img
                            src={item.author.avatarUrl}
                            alt={item.author.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        )}
                        <span className="text-slate-300 font-medium">{item.author.name}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-emerald-400">2027 NODE</span>
                    )}

                    <span className="text-emerald-400 group-hover:translate-x-[-4px] transition-transform font-bold flex items-center gap-1">
                      <span>צפייה בפרטים</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Action Buttons */}
        {(primaryButton || secondaryButton) && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-14">
            {primaryButton && (
              <a
                href={primaryButton.url || '#'}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition hover:scale-105"
              >
                {primaryButton.text}
              </a>
            )}
            {secondaryButton && (
              <a
                href={secondaryButton.url || '#'}
                className="px-8 py-3.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 font-semibold text-sm transition"
              >
                {secondaryButton.text}
              </a>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          4. 2027 PEEK SHEET MODAL (Expandable Deep Content Drawer)
      ========================================================================= */}
      {peekItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setPeekItem(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-right flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {peekItem.category || 'סקירה מורחבת'}
              </span>
              <button
                type="button"
                onClick={() => setPeekItem(null)}
                className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            {peekItem.imageUrl && (
              <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden my-5 bg-slate-950">
                <img
                  src={peekItem.imageUrl}
                  alt={peekItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Modal Body */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {peekItem.title}
              </h2>
              {peekItem.subtitle && (
                <p className="text-sm sm:text-base text-cyan-400 font-medium mt-2">
                  {peekItem.subtitle}
                </p>
              )}
              <div className="text-sm text-slate-300 mt-4 leading-relaxed whitespace-pre-line space-y-3">
                <p>{peekItem.description || peekItem.subtitle}</p>
                <p>
                  טכנולוגיית התוכן של 2027 מאפשרת גישה מיידית, חוויית משתמש מרחבית והתאמה אישית מלאה לפי העדפות הצפייה.
                </p>
              </div>

              {/* Metrics Display in Modal */}
              {peekItem.metrics && peekItem.metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  {peekItem.metrics.map((m, idx) => (
                    <div key={idx} className="text-right">
                      <div className="text-xs text-slate-400">{m.label}</div>
                      <div className="text-lg font-black text-white font-mono">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between border-t border-slate-800 pt-5 mt-6 gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAudio(peekItem.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>השמע תקציר קולי</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {peekItem.ctaUrl && (
                  <a
                    href={peekItem.ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs hover:scale-105 transition cursor-pointer"
                  >
                    <span>{peekItem.ctaText || 'למעבר לקישור'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPeekItem(null)}
                  className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
