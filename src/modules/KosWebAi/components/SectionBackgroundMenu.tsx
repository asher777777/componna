import React, { useState, useRef, useEffect } from 'react';
import { PaintBucket, Ban, Sparkles, Palette, Check, ChevronDown, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { SectionBackgroundMode } from '../types/pageBuilder.types';

export interface SectionBackgroundMenuProps {
  sectionId: string;
  sectionData: any;
  onUpdateSection?: (sectionId: string, updatedData: any) => void;
  compact?: boolean;
}

const COLOR_SWATCHES = [
  '#ffffff',
  '#f8fafc',
  '#0f172a',
  '#000000',
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
];

function hexToRgba(hex: string, opacityPercent: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (full.length !== 6) return hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const alpha = Math.max(0, Math.min(100, opacityPercent)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getSectionBackgroundMode(sectionData?: any): SectionBackgroundMode {
  const mode = sectionData?.sectionBackgroundMode;
  if (mode === 'transparent' || mode === 'glass' || mode === 'custom') return mode;
  return 'default';
}

export function getSectionBackgroundWrapperProps(sectionData?: any): {
  className: string;
  style: React.CSSProperties;
} {
  const mode = getSectionBackgroundMode(sectionData);
  if (mode === 'transparent') {
    return {
      className:
        'bg-transparent [&>div>section]:!bg-transparent [&>div>section]:!shadow-none [&>div>section]:!border-transparent [&>section]:!bg-transparent [&>section]:!shadow-none [&>section]:!border-transparent',
      style: { backgroundColor: 'transparent' },
    };
  }
  if (mode === 'glass') {
    return {
      className:
        'backdrop-blur-md bg-white/75 dark:bg-slate-900/75 border-y border-slate-200/40 dark:border-white/10 [&>div>section]:!bg-transparent [&>section]:!bg-transparent',
      style: {},
    };
  }
  if (mode === 'custom') {
    const color = sectionData?.sectionBackgroundColor || '#0f172a';
    const opacity = sectionData?.sectionBackgroundOpacity ?? 100;
    const resolved = opacity < 100 ? hexToRgba(color, opacity) : color;
    return {
      className: '[&>div>section]:!bg-transparent [&>section]:!bg-transparent',
      style: { backgroundColor: resolved },
    };
  }
  return { className: '', style: {} };
}

export const SectionBackgroundMenu: React.FC<SectionBackgroundMenuProps> = ({
  sectionId,
  sectionData,
  onUpdateSection,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMode = getSectionBackgroundMode(sectionData);
  const currentColor = sectionData?.sectionBackgroundColor || '#0f172a';
  const currentOpacity = sectionData?.sectionBackgroundOpacity ?? 100;

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const applyMode = (mode: SectionBackgroundMode, color?: string, opacity?: number) => {
    if (!onUpdateSection) return;

    if (mode === 'default') {
      const next = { ...sectionData };
      delete next.sectionBackgroundMode;
      delete next.sectionBackgroundColor;
      delete next.sectionBackgroundOpacity;
      if (sectionData?.sectionBackgroundMode === 'transparent') {
        next.isUnbounded = false;
        next.backgroundColor = undefined;
        next.cardBackgroundColor = undefined;
      }
      onUpdateSection(sectionId, next);
      return;
    }

    if (mode === 'transparent') {
      onUpdateSection(sectionId, {
        ...sectionData,
        sectionBackgroundMode: 'transparent',
        backgroundColor: 'transparent',
        cardBackgroundColor: 'transparent',
        isUnbounded: true,
      });
      return;
    }

    if (mode === 'glass') {
      onUpdateSection(sectionId, {
        ...sectionData,
        sectionBackgroundMode: 'glass',
        backgroundColor: 'transparent',
        cardBackgroundColor: 'transparent',
        isUnbounded: true,
      });
      return;
    }

    const nextColor = color ?? currentColor;
    const nextOpacity = opacity ?? currentOpacity;
    const resolvedBg = nextOpacity < 100 ? hexToRgba(nextColor, nextOpacity) : nextColor;

    onUpdateSection(sectionId, {
      ...sectionData,
      sectionBackgroundMode: 'custom',
      sectionBackgroundColor: nextColor,
      sectionBackgroundOpacity: nextOpacity,
      backgroundColor: resolvedBg,
      isUnbounded: false,
    });
  };

  const modeLabel =
    currentMode === 'transparent'
      ? 'רקע שקוף'
      : currentMode === 'glass'
        ? 'רקע זכוכית'
        : currentMode === 'custom'
          ? 'רקע מותאם'
          : 'רקע אזור';

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-1.5 rounded-xl border transition-all cursor-pointer select-none',
          compact ? 'p-1.5' : 'px-2 sm:px-2.5 py-1.5 text-xs',
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
            : currentMode !== 'default'
              ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
        )}
        title={`רקע האזור: ${modeLabel} (לחץ לשינוי)`}
      >
        <PaintBucket
          className={clsx(
            'w-3.5 h-3.5',
            isOpen ? 'text-white' : currentMode !== 'default' ? 'text-amber-300' : 'text-indigo-400'
          )}
        />
        {!compact && currentMode !== 'default' && (
          <span className="font-bold text-xs hidden sm:inline">{modeLabel}</span>
        )}
        <ChevronDown
          className={clsx(
            'w-3 h-3 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-white'
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 sm:right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0b0f19] border border-slate-700 p-3 shadow-2xl z-50 text-right animate-in fade-in zoom-in-95 duration-150 space-y-2.5"
          dir="rtl"
          style={{ backgroundColor: '#0b0f19' }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <PaintBucket className="w-3.5 h-3.5 text-indigo-400" />
              <span>רקע האזור</span>
            </span>
            {currentMode !== 'default' && (
              <button
                type="button"
                onClick={() => applyMode('default')}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>איפוס</span>
              </button>
            )}
          </div>

          <div className="space-y-1">
            {[
              {
                id: 'default' as SectionBackgroundMode,
                label: 'ברירת מחדל (עיצוב האזור)',
                desc: 'שימוש ברקע ובכרטיס המובנים של האזור',
                icon: RotateCcw,
              },
              {
                id: 'transparent' as SectionBackgroundMode,
                label: 'שקוף לגמרי (ללא רקע ומסגרת)',
                desc: 'מסיר רקע, כרטיס וצל — אידיאלי לכפתור צף',
                icon: Ban,
              },
              {
                id: 'glass' as SectionBackgroundMode,
                label: 'זכוכית מטושטשת (Glass)',
                desc: 'רקע חצי-שקוף עם טשטוש לסרגלים צפים',
                icon: Sparkles,
              },
              {
                id: 'custom' as SectionBackgroundMode,
                label: 'צבע מותאם אישית',
                desc: 'בחירת צבע רקע ושקיפות מותאמים',
                icon: Palette,
              },
            ].map((opt) => {
              const isSelected = opt.id === currentMode;
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => applyMode(opt.id)}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2 p-2 rounded-xl text-xs transition-all text-right cursor-pointer',
                    isSelected
                      ? 'bg-indigo-600/30 text-white font-bold border border-indigo-500/60 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={clsx(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      )}
                    >
                      <OptIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col text-right min-w-0">
                      <span className="font-bold text-xs">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 truncate">{opt.desc}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {currentMode === 'custom' && (
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-300">צבע רקע</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => applyMode('custom', e.target.value, currentOpacity)}
                    className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                    {currentColor}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => applyMode('custom', swatch, currentOpacity)}
                    className={clsx(
                      'w-5 h-5 rounded-full border transition cursor-pointer',
                      currentColor.toLowerCase() === swatch
                        ? 'border-indigo-400 ring-2 ring-indigo-500/40 scale-110'
                        : 'border-slate-600 hover:scale-105'
                    )}
                    style={{ backgroundColor: swatch }}
                    title={swatch}
                  />
                ))}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-bold">שקיפות</span>
                  <span className="font-mono text-indigo-300">{currentOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={currentOpacity}
                  onChange={(e) => applyMode('custom', currentColor, Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
