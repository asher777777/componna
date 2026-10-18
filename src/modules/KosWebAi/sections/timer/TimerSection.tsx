import React, { useState, useEffect, useMemo } from 'react';
import {
  TimerSectionConfig,
  TimerLayoutPreset,
  TimerBoxShape,
} from '../../types/sectionConfigs';
import {
  Clock,
  Sparkles,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  ArrowRight,
  ChevronLeft,
  Calendar,
} from 'lucide-react';

export const TimerSection: React.FC<{ config: TimerSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'הספירה לאחור החלה',
    subtitle = 'אל תפספסו את ההזדמנות',
    targetDate = '2026-12-31T23:59:59',
    layout = 'standard',
    timeUnitsDirection = 'rtl',
    boxShape = 'auto',
    objectScale = 'normal',
    buttonShape = 'auto',
    buttonSize = 'auto',
    showCtaButton = true,
    ctaText = 'הבטיחו את מקומכם עכשיו',
    ctaUrl = '#contact',
    backgroundColor = 'transparent',
    boxBackgroundColor,
    numberColor,
    labelColor,
    titleColor,
    subtitleColor,
    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor = '#000000',
    textBgOverlayOpacity = 60,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
  } = config;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Resolve active shape based on layout if auto
  const resolvedShape: TimerBoxShape = useMemo(() => {
    if (boxShape && boxShape !== 'auto') return boxShape;
    switch (layout) {
      case 'feminine':
        return 'flower';
      case 'masculine':
        return 'shield';
      case 'spiritual':
        return 'lotus';
      case 'sharp':
        return 'sharp';
      case 'analytical':
        return 'hud';
      case 'standard':
      default:
        return 'rounded';
    }
  }, [boxShape, layout]);

  // Order of time units (RTL: Days on right vs LTR: Days on left)
  const baseUnits = useMemo(
    () => [
      { key: 'days', label: 'ימים', value: timeLeft.days },
      { key: 'hours', label: 'שעות', value: timeLeft.hours },
      { key: 'minutes', label: 'דקות', value: timeLeft.minutes },
      { key: 'seconds', label: 'שניות', value: timeLeft.seconds },
    ],
    [timeLeft]
  );

  // In RTL rendering (dir="rtl"):
  // If timeUnitsDirection === 'rtl', the first element appears on the RIGHT.
  // So baseUnits gives: Days on right, Seconds on left.
  // If timeUnitsDirection === 'ltr', reversing gives: Seconds on right, Days on LEFT!
  const displayUnits = useMemo(() => {
    return timeUnitsDirection === 'ltr' ? [...baseUnits].reverse() : baseUnits;
  }, [timeUnitsDirection, baseUnits]);

  // Scaling classes
  const scaleClasses = useMemo(() => {
    switch (objectScale) {
      case 'compact':
        return {
          box: 'p-2.5 sm:p-4 min-h-[95px] sm:min-h-[110px]',
          num: 'text-2xl sm:text-4xl lg:text-5xl',
          lbl: 'text-[10px] sm:text-xs mt-1',
          gap: 'gap-2 sm:gap-4 max-w-xl',
          icon: 'w-8 h-8',
        };
      case 'large':
        return {
          box: 'p-5 sm:p-7 min-h-[135px] sm:min-h-[160px]',
          num: 'text-4xl sm:text-6xl lg:text-7xl',
          lbl: 'text-xs sm:text-base mt-2.5',
          gap: 'gap-4 sm:gap-7 max-w-3xl',
          icon: 'w-12 h-12',
        };
      case 'massive':
        return {
          box: 'p-6 sm:p-9 min-h-[155px] sm:min-h-[185px]',
          num: 'text-5xl sm:text-7xl lg:text-8xl',
          lbl: 'text-sm sm:text-lg font-extrabold mt-3',
          gap: 'gap-4 sm:gap-8 max-w-4xl',
          icon: 'w-14 h-14',
        };
      case 'normal':
      case 'auto':
      default:
        return {
          box: 'p-3.5 sm:p-6 min-h-[115px] sm:min-h-[135px]',
          num: 'text-3xl sm:text-5xl lg:text-6xl',
          lbl: 'text-xs sm:text-sm mt-1.5',
          gap: 'gap-3 sm:gap-6 max-w-2xl',
          icon: 'w-10 h-10',
        };
    }
  }, [objectScale]);

  // CTA Button Shape resolution
  const resolvedButtonShapeClass = useMemo(() => {
    const shape = buttonShape === 'auto' ? (layout === 'feminine' ? 'pill' : layout === 'sharp' ? 'sharp' : layout === 'masculine' ? 'chiseled' : 'rounded') : buttonShape;
    switch (shape) {
      case 'pill':
        return 'rounded-full';
      case 'sharp':
        return 'rounded-none border-2 border-current shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]';
      case 'chiseled':
        return 'rounded-lg border-2 border-amber-500/80 shadow-md';
      case 'rounded':
      default:
        return 'rounded-2xl';
    }
  }, [buttonShape, layout]);

  // CTA Button Size resolution
  const resolvedButtonSizeClass = useMemo(() => {
    switch (buttonSize) {
      case 'sm':
        return 'px-4 py-2 text-xs';
      case 'lg':
        return 'px-8 py-3.5 text-base';
      case 'xl':
        return 'px-10 py-4 text-lg font-black';
      case 'md':
      case 'auto':
      default:
        return 'px-6 py-3 text-sm font-bold';
    }
  }, [buttonSize]);

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

  // Render individual unit box based on resolved shape
  const renderUnitBox = (unit: { key: string; label: string; value: number }, idx: number) => {
    const formattedNumber = String(unit.value).padStart(2, '0');

    // Custom shape wrappers
    if (resolvedShape === 'flower') {
      return (
        <div
          key={unit.key}
          className={`relative flex flex-col items-center justify-center group ${scaleClasses.box} transition-all duration-300`}
        >
          {/* Flower SVG Background */}
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6"
            preserveAspectRatio="none"
          >
            <g
              fill={boxBackgroundColor || 'rgba(255, 241, 242, 0.92)'}
              stroke="#fb7185"
              strokeWidth="1.5"
              strokeOpacity="0.45"
            >
              <circle cx="60" cy="26" r="22" />
              <circle cx="85" cy="36" r="22" />
              <circle cx="94" cy="60" r="22" />
              <circle cx="85" cy="84" r="22" />
              <circle cx="60" cy="94" r="22" />
              <circle cx="35" cy="84" r="22" />
              <circle cx="26" cy="60" r="22" />
              <circle cx="35" cy="36" r="22" />
              <circle
                cx="60"
                cy="60"
                r="34"
                fill={boxBackgroundColor || 'rgba(255, 255, 255, 0.98)'}
                stroke="#f43f5e"
                strokeWidth="1"
              />
            </g>
          </svg>

          {/* Centered Numbers and Label */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span
              className={`font-black font-mono tracking-tight text-rose-950 dark:text-rose-100 ${scaleClasses.num} drop-shadow-xs`}
              style={{ color: numberColor }}
            >
              {formattedNumber}
            </span>
            <span
              className={`font-bold text-rose-600 dark:text-rose-300 ${scaleClasses.lbl}`}
              style={{ color: labelColor }}
            >
              {unit.label}
            </span>
          </div>
        </div>
      );
    }

    if (resolvedShape === 'heart') {
      return (
        <div
          key={unit.key}
          className={`relative flex flex-col items-center justify-center group ${scaleClasses.box} transition-all duration-300`}
        >
          {/* Heart SVG Background */}
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md transition-transform duration-500 group-hover:scale-105"
            preserveAspectRatio="none"
          >
            <path
              d="M 60,108 C 57,105 14,72 14,38 C 14,18 30,6 48,6 C 56,6 60,12 60,12 C 60,12 64,6 72,6 C 90,6 106,18 106,38 C 106,72 63,105 60,108 Z"
              fill={boxBackgroundColor || 'rgba(255, 241, 242, 0.95)'}
              stroke="#f43f5e"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
          </svg>

          {/* Centered Content in heart upper-center */}
          <div className="relative z-10 flex flex-col items-center justify-center -translate-y-1">
            <span
              className={`font-black font-mono tracking-tight text-rose-950 dark:text-rose-100 ${scaleClasses.num}`}
              style={{ color: numberColor }}
            >
              {formattedNumber}
            </span>
            <span
              className={`font-bold text-rose-600 dark:text-rose-300 ${scaleClasses.lbl}`}
              style={{ color: labelColor }}
            >
              {unit.label}
            </span>
          </div>
        </div>
      );
    }

    if (resolvedShape === 'shield') {
      return (
        <div
          key={unit.key}
          className={`relative flex flex-col items-center justify-center group ${scaleClasses.box} transition-all duration-300`}
        >
          {/* Shield SVG Background */}
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
            preserveAspectRatio="none"
          >
            <path
              d="M 60,6 L 110,18 L 110,62 C 110,88 88,110 60,118 C 32,110 10,88 10,62 L 10,18 Z"
              fill={boxBackgroundColor || '#0f172a'}
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <path
              d="M 60,12 L 104,23 L 104,60 C 104,83 84,102 60,110 C 36,102 16,83 16,60 L 16,23 Z"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="4 2"
              strokeOpacity="0.4"
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center -translate-y-0.5">
            <span
              className={`font-black font-mono tracking-tight text-white ${scaleClasses.num} drop-shadow-md`}
              style={{ color: numberColor }}
            >
              {formattedNumber}
            </span>
            <span
              className={`font-bold uppercase tracking-wider text-amber-400 ${scaleClasses.lbl}`}
              style={{ color: labelColor }}
            >
              {unit.label}
            </span>
          </div>
        </div>
      );
    }

    if (resolvedShape === 'lotus') {
      return (
        <div
          key={unit.key}
          className={`relative flex flex-col items-center justify-center group ${scaleClasses.box} transition-all duration-700`}
        >
          {/* Lotus SVG Background */}
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-lg transition-transform duration-700 group-hover:scale-105"
            preserveAspectRatio="none"
          >
            <path
              d="M 60,8 C 74,28 94,42 112,52 C 96,66 86,86 82,110 C 70,98 50,98 38,110 C 34,86 24,66 8,52 C 26,42 46,28 60,8 Z"
              fill={boxBackgroundColor || 'rgba(15, 118, 110, 0.2)'}
              stroke="#10b981"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1"
              strokeOpacity="0.35"
              strokeDasharray="3 3"
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <span
              className={`font-black font-mono tracking-tight text-teal-950 dark:text-emerald-100 ${scaleClasses.num}`}
              style={{ color: numberColor }}
            >
              {formattedNumber}
            </span>
            <span
              className={`font-bold text-teal-600 dark:text-teal-300 ${scaleClasses.lbl}`}
              style={{ color: labelColor }}
            >
              {unit.label}
            </span>
          </div>
        </div>
      );
    }

    if (resolvedShape === 'sharp') {
      return (
        <div
          key={unit.key}
          className={`relative flex flex-col items-center justify-center rounded-none border-2 border-black dark:border-white bg-white dark:bg-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.95)] ${scaleClasses.box} transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1`}
          style={{ backgroundColor: boxBackgroundColor }}
        >
          <span
            className={`font-black font-mono tracking-tight text-black dark:text-white ${scaleClasses.num}`}
            style={{ color: numberColor }}
          >
            {formattedNumber}
          </span>
          <span
            className={`font-black font-mono uppercase text-slate-700 dark:text-slate-300 ${scaleClasses.lbl}`}
            style={{ color: labelColor }}
          >
            {unit.label}
          </span>
        </div>
      );
    }

    if (resolvedShape === 'hud') {
      return (
        <div
          key={unit.key}
          className={`relative flex flex-col items-center justify-center bg-slate-950/90 border border-cyan-500/50 shadow-lg shadow-cyan-500/10 ${scaleClasses.box} group transition-all duration-300 hover:border-cyan-400`}
          style={{
            backgroundColor: boxBackgroundColor,
            clipPath:
              'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
          }}
        >
          {/* Cyber HUD Corner Markings */}
          <span className="absolute top-1 left-2 text-[8px] font-mono text-cyan-400/80">
            [HUD]
          </span>
          <span className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-400/80">
            //LIVE
          </span>

          <span
            className={`font-black font-mono tracking-tight text-cyan-300 ${scaleClasses.num} drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]`}
            style={{ color: numberColor }}
          >
            {formattedNumber}
          </span>
          <span
            className={`font-bold font-mono tracking-wider text-cyan-500 ${scaleClasses.lbl}`}
            style={{ color: labelColor }}
          >
            {unit.label}
          </span>
        </div>
      );
    }

    // Default: 'rounded' (Notion SaaS 2026 Squircle)
    return (
      <div
        key={unit.key}
        className={`rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 ${scaleClasses.box} flex flex-col items-center justify-center shadow-2xl backdrop-blur-md group hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all duration-300 hover:shadow-indigo-500/10`}
        style={{ backgroundColor: boxBackgroundColor }}
      >
        <span
          className={`font-black font-mono tracking-tight text-slate-900 dark:text-white ${scaleClasses.num}`}
          style={{ color: numberColor }}
        >
          {formattedNumber}
        </span>
        <span
          className={`font-bold text-slate-500 dark:text-slate-400 ${scaleClasses.lbl}`}
          style={{ color: labelColor }}
        >
          {unit.label}
        </span>
      </div>
    );
  };

  // Layout-specific Header Icons / Badges
  const renderLayoutHeaderBadge = () => {
    switch (layout) {
      case 'feminine':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>השקה חגיגית ובלעדית</span>
          </div>
        );
      case 'masculine':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>מועד יעד סופי ומוחלט</span>
          </div>
        );
      case 'spiritual':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold mb-2">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>זמן של התחדשות וצמיחה</span>
          </div>
        );
      case 'sharp':
        return (
          <div className="px-3 py-1 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-black uppercase mb-2">
            COUNTDOWN_T_ZERO // 2026
          </div>
        );
      case 'analytical':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>TELEMETRY ACTIVE // SYNCED</span>
          </div>
        );
      case 'standard':
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-2 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        );
    }
  };

  // CTA Button Appearance by Layout
  const renderCtaButton = () => {
    if (!showCtaButton || !ctaText) return null;

    let buttonColorClasses = 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-95';
    if (layout === 'feminine') {
      buttonColorClasses = 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40';
    } else if (layout === 'masculine') {
      buttonColorClasses = 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40';
    } else if (layout === 'spiritual') {
      buttonColorClasses = 'bg-teal-700 hover:bg-teal-800 text-amber-100 shadow-lg shadow-teal-700/25';
    } else if (layout === 'sharp') {
      buttonColorClasses = 'bg-black text-white dark:bg-white dark:text-black font-mono font-black';
    } else if (layout === 'analytical') {
      buttonColorClasses = 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25';
    } else if (layout === 'standard') {
      buttonColorClasses = 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25';
    }

    return (
      <div className="mt-4 sm:mt-6">
        <a
          href={ctaUrl || '#contact'}
          className={`inline-flex items-center gap-2 ${resolvedButtonShapeClass} ${resolvedButtonSizeClass} ${buttonColorClasses} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group`}
        >
          <span>{ctaText}</span>
          <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        </a>
      </div>
    );
  };

  return (
    <section
      id={anchorId || 'timer'}
      className={`w-full py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
        textBgEnabled && textBgScope === 'full-section' ? 'group' : ''
      }`}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
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

      {/* Main Container */}
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8 relative z-10">

        {/* Text Card with Optional textBg */}
        <div
          className={`w-full flex flex-col items-center relative rounded-3xl p-4 sm:p-6 transition-all duration-300 ${
            textBgEnabled && textBgScope === 'text-card'
              ? 'group overflow-hidden shadow-2xl backdrop-blur-md'
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

          {/* Header Badge */}
          {renderLayoutHeaderBadge()}

          {/* Title & Subtitle */}
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-2xl"
            style={{ color: titleColor }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed"
              style={{ color: subtitleColor }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Timer Box Units Grid */}
        <div className={`grid grid-cols-4 w-full ${scaleClasses.gap}`}>
          {displayUnits.map((unit, idx) => renderUnitBox(unit, idx))}
        </div>

        {/* Call to Action Button */}
        {renderCtaButton()}
      </div>
    </section>
  );
};
