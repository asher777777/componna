import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, Check, ChevronDown, AlignCenter, StretchHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { SectionWidthMode } from '../types/pageBuilder.types';

export interface SectionDimensionsMenuProps {
  sectionId: string;
  sectionData: any;
  onUpdateSection?: (sectionId: string, updatedData: any) => void;
  compact?: boolean;
}

export const WIDTH_OPTIONS: {
  id: SectionWidthMode;
  label: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'centered',
    label: 'ממורכז',
    badge: 'קלאסי',
    desc: 'רוחב עמוד קריאה סטנדרטי (max-w-4xl)',
    icon: AlignCenter,
  },
  {
    id: 'wide',
    label: 'רחב',
    badge: 'מודרני',
    desc: 'פריסה מרווחת ורחבה למסכים גדולים (max-w-7xl)',
    icon: StretchHorizontal,
  },
  {
    id: 'full',
    label: 'רוחב מלא',
    badge: 'מקצה לקצה',
    desc: 'רוחב מלא של 100% ללא הגבלת מקסימום',
    icon: Maximize2,
  },
];

export function getSectionWidthMode(sectionData?: any): SectionWidthMode {
  const w = sectionData?.sectionWidth || sectionData?.containerWidth;
  if (w === 'full' || w === '100%') return 'full';
  if (w === 'wide' || w === 'xl' || w === '2xl' || w === '7xl') return 'wide';
  if (w === 'centered' || w === 'normal' || w === 'sm' || w === 'md' || w === 'lg' || w === '4xl' || w === '5xl') return 'centered';
  return 'wide'; // default standard web layout
}

export function getSectionWidthWrapperClasses(widthMode: SectionWidthMode): string {
  switch (widthMode) {
    case 'centered':
      return 'max-w-4xl mx-auto w-full';
    case 'full':
      return 'w-full max-w-none';
    case 'wide':
    default:
      return 'max-w-7xl mx-auto w-full';
  }
}

export const SectionDimensionsMenu: React.FC<SectionDimensionsMenuProps> = ({
  sectionId,
  sectionData,
  onUpdateSection,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMode = getSectionWidthMode(sectionData);
  const activeOption = WIDTH_OPTIONS.find((o) => o.id === currentMode) || WIDTH_OPTIONS[1];
  const ActiveIcon = activeOption.icon;

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

  const handleSelectWidth = (mode: SectionWidthMode) => {
    if (!onUpdateSection) return;
    const updated = {
      ...sectionData,
      sectionWidth: mode,
      containerWidth: mode === 'full' ? 'full' : mode === 'centered' ? 'md' : 'lg',
    };
    onUpdateSection(sectionId, updated);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-1.5 rounded-xl border transition-all cursor-pointer select-none',
          compact ? 'p-1.5' : 'px-2 sm:px-2.5 py-1.5 text-xs',
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
            : currentMode !== 'wide'
              ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
        )}
        title={`מימדי האזור: ${activeOption.label} (לחץ לשינוי)`}
      >
        <ActiveIcon className="w-3.5 h-3.5 text-indigo-400" />
        {!compact && (
          <span className="font-bold text-xs hidden sm:inline">
            {activeOption.label}
          </span>
        )}
        <ChevronDown
          className={clsx(
            'w-3 h-3 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-white'
          )}
        />
      </button>

      {/* Dropdown Menu with High Contrast Solid Dark Background & Deep Drop Shadow */}
      {isOpen && (
        <div
          className="absolute left-0 sm:right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0b0f19] border border-slate-700 p-2 shadow-2xl z-50 text-right animate-in fade-in zoom-in-95 duration-150"
          dir="rtl"
          style={{ backgroundColor: '#0b0f19' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1.5 mb-1.5 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <StretchHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>מימדי האזור</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
              {activeOption.label}
            </span>
          </div>

          {/* 3 Options: Centered | Wide | Full */}
          <div className="space-y-1">
            {WIDTH_OPTIONS.map((opt) => {
              const isSelected = opt.id === currentMode;
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectWidth(opt.id)}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2.5 p-2 rounded-xl text-xs transition-all text-right cursor-pointer',
                    isSelected
                      ? 'bg-indigo-600/30 text-white font-bold border border-indigo-500/60 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
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
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">{opt.label}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate">{opt.desc}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
