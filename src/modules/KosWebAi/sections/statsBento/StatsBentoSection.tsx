import React from 'react';
import {
  StatsBentoSectionConfig,
  StatsBentoLayoutPreset,
  StatsBentoViewMode,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import {
  TrendingUp,
  Sparkles,
  Heart,
  Shield,
  Activity,
  ArrowLeft,
  ChevronLeft,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

export const StatsBentoSection: React.FC<{ config: StatsBentoSectionConfig }> = ({ config }) => {
  const {
    anchorId = 'stats',
    title = 'התוצאות מדברות בעד עצמן',
    subtitle,
    badge = 'מדדי ביצוע מובילים',
    description,
    layout = 'standard',
    viewMode = 'grid-4',
    objectScale = 'normal',
    buttonShape = 'rounded',
    buttonSize = 'md',
    titleColor,
    subtitleColor,
    descriptionColor,
    backgroundColor = 'transparent',
    cardBackgroundColor,
    accentColor = '#3b82f6',
    showCtaButton = false,
    ctaButtonText = 'לכל הנתונים וההישגים',
    ctaButtonUrl = '#',
    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor,
    textBgOverlayOpacity,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
    stats = [],
  } = config;

  const effectiveLayout: 'feminine' | 'masculine' | 'standard' | 'spiritual' | 'sharp' | 'analytical' =
    layout === 'feminine' ||
    layout === 'masculine' ||
    layout === 'spiritual' ||
    layout === 'sharp' ||
    layout === 'analytical'
      ? layout
      : 'standard';

  const effectiveViewMode: StatsBentoViewMode =
    layout === 'bento-4' || layout === 'cards-3' || layout === 'row-4'
      ? (layout === 'row-4' ? 'grid-4' : layout)
      : viewMode || 'grid-4';

  // Sizing scale helpers
  const getScaleClasses = () => {
    switch (objectScale) {
      case 'compact':
        return {
          headerGap: 'space-y-2 mb-8',
          titleSize: 'text-2xl sm:text-3xl',
          subSize: 'text-xs sm:text-sm',
          cardPadding: 'p-4 sm:p-5',
          gridGap: 'gap-4',
          numberSize: 'text-3xl sm:text-4xl',
          prefixSize: 'text-xl sm:text-2xl',
          labelSize: 'text-sm font-bold',
          descSize: 'text-[11px] leading-relaxed',
          iconBox: 'w-10 h-10 rounded-xl',
          iconSize: 'w-5 h-5',
        };
      case 'spacious':
        return {
          headerGap: 'space-y-4 mb-16',
          titleSize: 'text-4xl sm:text-5xl md:text-6xl',
          subSize: 'text-base sm:text-lg',
          cardPadding: 'p-8 sm:p-10',
          gridGap: 'gap-8',
          numberSize: 'text-5xl sm:text-6xl md:text-7xl',
          prefixSize: 'text-3xl sm:text-4xl',
          labelSize: 'text-lg sm:text-xl font-black',
          descSize: 'text-sm leading-relaxed',
          iconBox: 'w-16 h-16 rounded-3xl',
          iconSize: 'w-8 h-8',
        };
      case 'normal':
      default:
        return {
          headerGap: 'space-y-3 mb-12',
          titleSize: 'text-3xl sm:text-4xl md:text-5xl',
          subSize: 'text-sm sm:text-base',
          cardPadding: 'p-6 sm:p-8',
          gridGap: 'gap-6',
          numberSize: 'text-4xl sm:text-5xl',
          prefixSize: 'text-2xl sm:text-3xl',
          labelSize: 'text-base font-bold',
          descSize: 'text-xs leading-relaxed',
          iconBox: 'w-12 h-12 rounded-2xl',
          iconSize: 'w-6 h-6',
        };
    }
  };
  const scale = getScaleClasses();

  // Button Shape
  const getButtonShapeClass = () => {
    if (buttonShape === 'pill') return 'rounded-full';
    if (buttonShape === 'sharp') return 'rounded-none';
    if (buttonShape === 'rounded') return 'rounded-2xl';
    switch (effectiveLayout) {
      case 'feminine':
      case 'spiritual':
        return 'rounded-full';
      case 'masculine':
        return 'rounded-xl';
      case 'sharp':
        return 'rounded-none';
      case 'analytical':
        return 'rounded-lg';
      default:
        return 'rounded-2xl';
    }
  };

  // Button Size
  const getButtonSizeClass = () => {
    switch (buttonSize) {
      case 'sm':
        return 'px-4 py-2 text-xs';
      case 'lg':
        return 'px-8 py-4 text-base font-black';
      case 'md':
      default:
        return 'px-6 py-3 text-sm font-bold';
    }
  };

  // Text Background Hover Effect
  const getTextBgEffectClass = (eff: HeroTextBgEffect) => {
    switch (eff) {
      case 'zoom-glow':
        return 'group-hover/textbg:scale-105 group-hover/textbg:brightness-110 transition-all duration-700';
      case 'shimmer-sweep':
        return 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent after:-translate-x-full group-hover/textbg:after:translate-x-full after:transition-transform after:duration-1000';
      case 'float-parallax':
        return 'group-hover/textbg:-translate-y-1 group-hover/textbg:scale-[1.01] transition-all duration-500';
      case 'blur-reveal':
        return 'blur-[2px] group-hover/textbg:blur-0 transition-all duration-500';
      case 'gradient-shift':
        return 'group-hover/textbg:contrast-125 transition-all duration-700';
      default:
        return 'transition-transform duration-500 group-hover/textbg:scale-105';
    }
  };

  // Color Palette Theme Classes for the 6 Visual Presets
  const getThemeClasses = () => {
    switch (effectiveLayout) {
      case 'feminine':
        return {
          wrapper: 'font-sans bg-gradient-to-br from-[#fff7f9] via-[#fdf2f5] to-[#fbf7f4] dark:from-[#170a13] dark:via-[#1c0f17] dark:to-[#120a0f]',
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-300/40 rounded-full px-4 py-1.5 shadow-sm font-medium',
          title: 'text-rose-950 dark:text-rose-50 drop-shadow-sm',
          subtitle: 'text-rose-700/80 dark:text-rose-200/70',
          desc: 'text-rose-900/60 dark:text-rose-200/50',
          card: 'bg-white/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-500/20 hover:border-rose-400/60 rounded-[2.2rem] shadow-[0_15px_35px_rgba(244,63,94,0.08)] hover:shadow-[0_20px_45px_rgba(244,63,94,0.15)] hover:-translate-y-1.5 backdrop-blur-xl',
          numberColor: 'text-rose-950 dark:text-rose-50',
          labelColor: 'text-rose-900 dark:text-rose-100',
          descColor: 'text-rose-700/70 dark:text-rose-300/60',
          iconRadius: 'rounded-full',
          accent: '#f43f5e',
        };
      case 'masculine':
        return {
          wrapper: 'font-sans bg-gradient-to-b from-zinc-950 via-zinc-900 to-black',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30 rounded-lg px-3.5 py-1 tracking-wider uppercase font-mono text-xs',
          title: 'font-black tracking-tight text-white drop-shadow-md',
          subtitle: 'text-zinc-400 font-medium',
          desc: 'text-zinc-500',
          card: 'bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black border-2 border-zinc-800 hover:border-amber-500/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] hover:-translate-y-1.5 backdrop-blur-xl',
          numberColor: 'text-white font-mono',
          labelColor: 'text-zinc-200 font-black',
          descColor: 'text-zinc-400',
          iconRadius: 'rounded-xl',
          accent: '#f59e0b',
        };
      case 'spiritual':
        return {
          wrapper: 'font-sans bg-gradient-to-b from-[#061815] via-[#09221d] to-[#040e0c]',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 rounded-full px-4 py-1.5 font-light shadow-[0_0_20px_rgba(16,185,129,0.2)]',
          title: 'font-light tracking-wide text-emerald-50 drop-shadow-sm',
          subtitle: 'text-emerald-200/80',
          desc: 'text-emerald-300/60',
          card: 'bg-gradient-to-b from-emerald-950/40 via-teal-950/30 to-slate-950/90 border border-emerald-500/25 hover:border-emerald-400/60 rounded-[2.5rem] shadow-[0_15px_45px_rgba(16,185,129,0.12)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.22)] hover:-translate-y-1.5 backdrop-blur-2xl',
          numberColor: 'text-emerald-50 bg-gradient-to-r from-amber-200 via-emerald-100 to-teal-200 bg-clip-text text-transparent',
          labelColor: 'text-emerald-100 font-medium',
          descColor: 'text-emerald-300/70',
          iconRadius: 'rounded-full ring-2 ring-emerald-500/30',
          accent: '#10b981',
        };
      case 'sharp':
        return {
          wrapper: 'font-sans bg-black',
          badge: 'bg-cyan-950/80 text-cyan-300 border-2 border-cyan-500/70 rounded-none px-3 py-1 font-mono text-[11px] uppercase tracking-widest',
          title: 'font-mono font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]',
          subtitle: 'text-cyan-200/80 font-mono text-xs',
          desc: 'text-zinc-400 font-mono text-xs',
          card: 'bg-black border-2 border-cyan-500/40 hover:border-cyan-400 rounded-none shadow-[0_0_30px_rgba(6,182,212,0.18)] hover:-translate-y-1',
          numberColor: 'text-white font-mono',
          labelColor: 'text-cyan-100 font-bold font-mono',
          descColor: 'text-zinc-400 font-mono text-xs',
          iconRadius: 'rounded-none border border-cyan-500',
          accent: '#06b6d4',
        };
      case 'analytical':
        return {
          wrapper: 'font-sans bg-slate-950',
          badge: 'bg-blue-950/80 text-blue-300 border border-blue-500/40 rounded-md px-3 py-1 font-mono text-xs',
          title: 'font-extrabold tracking-tight text-white border-r-4 border-blue-500 pr-3',
          subtitle: 'text-slate-400 font-mono text-xs',
          desc: 'text-slate-400 text-xs',
          card: 'bg-slate-900/90 border border-slate-700/80 hover:border-blue-400/60 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 font-mono',
          numberColor: 'text-blue-400 font-mono font-black',
          labelColor: 'text-slate-100 font-bold',
          descColor: 'text-slate-400 font-sans',
          iconRadius: 'rounded-lg border border-blue-500/30',
          accent: '#3b82f6',
        };
      case 'standard':
      default:
        return {
          wrapper: 'font-sans bg-slate-50/50 dark:bg-slate-950/50',
          badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-400/30 rounded-full px-4 py-1.5 text-xs font-bold shadow-sm',
          title: 'font-black tracking-tight text-slate-900 dark:text-white',
          subtitle: 'text-slate-600 dark:text-slate-300 font-medium',
          desc: 'text-slate-500 dark:text-slate-400',
          card: 'bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1.5 backdrop-blur-xl',
          numberColor: 'text-slate-900 dark:text-white font-black',
          labelColor: 'text-slate-800 dark:text-slate-200 font-bold',
          descColor: 'text-slate-500 dark:text-slate-400',
          iconRadius: 'rounded-2xl',
          accent: accentColor || '#3b82f6',
        };
    }
  };
  const theme = getThemeClasses();
  const effectiveAccent = accentColor || theme.accent;

  // Icon container color styles based on card item color or preset
  const getItemColorClasses = (colorName?: string) => {
    switch (colorName) {
      case 'emerald':
      case 'green':
        return {
          bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
          glow: 'group-hover:border-emerald-500/50',
          accentText: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25',
          glow: 'group-hover:border-purple-500/50',
          accentText: 'text-purple-600 dark:text-purple-400',
          badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      case 'amber':
      case 'yellow':
        return {
          bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
          glow: 'group-hover:border-amber-500/50',
          accentText: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'rose':
      case 'pink':
        return {
          bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
          glow: 'group-hover:border-rose-500/50',
          accentText: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
      case 'blue':
      case 'sky':
        return {
          bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
          glow: 'group-hover:border-blue-500/50',
          accentText: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'indigo':
      default:
        return {
          bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
          glow: 'group-hover:border-indigo-500/50',
          accentText: 'text-indigo-600 dark:text-indigo-400',
          badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        };
    }
  };

  // Grid layout class based on effectiveViewMode and items length
  const getGridClasses = () => {
    if (effectiveViewMode === 'cards-3') {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
    if (effectiveViewMode === 'bento-4') {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
    // grid-4 default
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  };

  return (
    <section
      id={anchorId}
      className={clsx(
        'w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500 text-right',
        theme.wrapper
      )}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Full-Section Background Image with Overlay & Effect */}
      {textBgEnabled && textBgImageUrl && textBgScope === 'full-section' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={textBgImageUrl}
            alt=""
            className={clsx('w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: textBgOverlayColor || '#000000',
              opacity: (textBgOverlayOpacity ?? 60) / 100,
            }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col relative z-10">
        {/* Section Header */}
        {(title || subtitle || badge || description) && (
          <div className={clsx('relative flex flex-col items-center text-center max-w-3xl mx-auto group/textbg', scale.headerGap)}>
            {/* Card-scoped background image */}
            {textBgEnabled && textBgImageUrl && textBgScope === 'text-card' && (
              <div className="absolute inset-0 -m-6 rounded-3xl overflow-hidden pointer-events-none z-0 shadow-2xl">
                <img
                  src={textBgImageUrl}
                  alt=""
                  className={clsx('w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: textBgOverlayColor || '#000000',
                    opacity: (textBgOverlayOpacity ?? 60) / 100,
                  }}
                />
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center">
              {/* Badge or Subtitle */}
              {(badge || subtitle) && (
                <div className={clsx('inline-flex items-center gap-2 mb-3 backdrop-blur-md', theme.badge)}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{badge || subtitle}</span>
                </div>
              )}

              {/* Title */}
              {title && (
                <h2
                  className={clsx('leading-tight tracking-tight', scale.titleSize, theme.title)}
                  style={{ color: titleColor }}
                >
                  {title}
                </h2>
              )}

              {/* Subtitle / Description */}
              {description && (
                <p
                  className={clsx('mt-3 max-w-2xl leading-relaxed', scale.subSize, theme.desc)}
                  style={{ color: descriptionColor }}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bento Stats Grid */}
        <div className={clsx(getGridClasses(), scale.gridGap, 'items-stretch')}>
          {stats.map((item, idx) => {
            const itemTheme = getItemColorClasses(item.color);
            const isBentoLead = effectiveViewMode === 'bento-4' && idx === 0;

            return (
              <div
                key={item.id || idx}
                className={clsx(
                  'group relative flex flex-col justify-between transition-all duration-300 select-none overflow-hidden',
                  theme.card,
                  scale.cardPadding,
                  itemTheme.glow,
                  isBentoLead && 'md:col-span-2 md:row-span-1 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent'
                )}
                style={{
                  backgroundColor: cardBackgroundColor || undefined,
                }}
              >
                {/* Top Row: Icon Container and Optional Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={clsx(
                      'flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-sm',
                      scale.iconBox,
                      theme.iconRadius,
                      itemTheme.bg
                    )}
                  >
                    <DynamicIcon
                      name={item.icon || 'TrendingUp'}
                      className={scale.iconSize}
                    />
                  </div>

                  {item.badge && (
                    <span
                      className={clsx(
                        'px-2.5 py-1 text-[11px] font-bold border backdrop-blur-md shadow-xs',
                        getButtonShapeClass(),
                        itemTheme.badge
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Technical Index on Analytical Layout */}
                  {effectiveLayout === 'analytical' && !item.badge && (
                    <span className="font-mono text-[10px] text-blue-400/80 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded">
                      #STAT_{String(idx + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Bottom Row: Number with Prefix/Suffix, Label, and Description */}
                <div className="flex flex-col gap-1 text-right mt-auto">
                  <div className="flex items-baseline gap-1" dir="ltr">
                    {/* Prefix if defined (e.g. "+", "x", "%") */}
                    {item.prefix && (
                      <span className={clsx('font-black tracking-tight', scale.prefixSize, itemTheme.accentText)}>
                        {item.prefix}
                      </span>
                    )}

                    {/* Main Number */}
                    <span
                      className={clsx(
                        'font-black tracking-tight leading-none',
                        scale.numberSize,
                        theme.numberColor
                      )}
                    >
                      {item.number}
                    </span>

                    {/* Suffix if defined (e.g. "%", "+", "X", "M") */}
                    {item.suffix && (
                      <span className={clsx('font-black tracking-tight', scale.prefixSize, itemTheme.accentText)}>
                        {item.suffix}
                      </span>
                    )}
                  </div>

                  {/* Stat Label */}
                  <h3 className={clsx('mt-2 text-right', scale.labelSize, theme.labelColor)}>
                    {item.label}
                  </h3>

                  {/* Stat Description */}
                  {item.description && (
                    <p className={clsx('mt-1 text-right', scale.descSize, theme.descColor)}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Action / CTA Button */}
        {showCtaButton && (
          <div className="pt-10 flex justify-center">
            <a
              href={ctaButtonUrl}
              className={clsx(
                'inline-flex items-center gap-2 font-black text-white shadow-xl transition-transform hover:-translate-y-0.5 cursor-pointer',
                getButtonShapeClass(),
                getButtonSizeClass()
              )}
              style={{
                backgroundColor: effectiveAccent,
                boxShadow: `0 10px 30px -5px ${effectiveAccent}66`,
              }}
            >
              <span>{ctaButtonText}</span>
              <ChevronLeft className="w-4 h-4 ml-1" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
