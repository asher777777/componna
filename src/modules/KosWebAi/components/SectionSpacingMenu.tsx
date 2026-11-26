import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { SectionSpacingValues } from '../types/pageBuilder.types';

export interface SectionSpacingMenuProps {
  sectionId: string;
  sectionData: any;
  onUpdateSection?: (sectionId: string, updatedData: any) => void;
  compact?: boolean;
}

type SpacingSide = keyof SectionSpacingValues;

const SIDES: { key: SpacingSide; label: string }[] = [
  { key: 'top', label: 'למעלה' },
  { key: 'bottom', label: 'למטה' },
  { key: 'right', label: 'ימין' },
  { key: 'left', label: 'שמאל' },
];

const PRESETS: { label: string; value: number }[] = [
  { label: 'ללא', value: 0 },
  { label: 'קטן', value: 16 },
  { label: 'בינוני', value: 32 },
  { label: 'גדול', value: 64 },
];

function toPxOrUndefined(val: unknown): string | undefined {
  return typeof val === 'number' && !Number.isNaN(val) ? `${val}px` : undefined;
}

export function getSectionPaddingStyle(sectionData?: any): React.CSSProperties {
  const p: SectionSpacingValues | undefined = sectionData?.sectionPadding;
  if (!p) return {};
  const style: React.CSSProperties = {};
  const top = toPxOrUndefined(p.top);
  const bottom = toPxOrUndefined(p.bottom);
  const left = toPxOrUndefined(p.left);
  const right = toPxOrUndefined(p.right);
  if (top !== undefined) style.paddingTop = top;
  if (bottom !== undefined) style.paddingBottom = bottom;
  if (left !== undefined) style.paddingLeft = left;
  if (right !== undefined) style.paddingRight = right;
  return style;
}

export function getSectionMarginStyle(sectionData?: any): React.CSSProperties {
  const m: SectionSpacingValues | undefined = sectionData?.sectionMargin;
  if (!m) return {};
  const style: React.CSSProperties = {};
  const top = toPxOrUndefined(m.top);
  const bottom = toPxOrUndefined(m.bottom);
  const left = toPxOrUndefined(m.left);
  const right = toPxOrUndefined(m.right);
  if (top !== undefined) style.marginTop = top;
  if (bottom !== undefined) style.marginBottom = bottom;
  if (left !== undefined) style.marginLeft = left;
  if (right !== undefined) style.marginRight = right;
  return style;
}

export function getSectionSpacingStyle(sectionData?: any): React.CSSProperties {
  return {
    ...getSectionMarginStyle(sectionData),
    ...getSectionPaddingStyle(sectionData),
  };
}

export function hasCustomSectionSpacing(sectionData?: any): boolean {
  const check = (vals?: SectionSpacingValues) =>
    Boolean(
      vals &&
        (['top', 'bottom', 'left', 'right'] as SpacingSide[]).some(
          (k) => typeof vals[k] === 'number' && vals[k] !== 0
        )
    );
  return check(sectionData?.sectionPadding) || check(sectionData?.sectionMargin);
}

export const SectionSpacingMenu: React.FC<SectionSpacingMenuProps> = ({
  sectionId,
  sectionData,
  onUpdateSection,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const padding: SectionSpacingValues = sectionData?.sectionPadding || {};
  const margin: SectionSpacingValues = sectionData?.sectionMargin || {};
  const isActive = hasCustomSectionSpacing(sectionData);

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

  const updateSpacing = (
    field: 'sectionPadding' | 'sectionMargin',
    nextValues: SectionSpacingValues | undefined
  ) => {
    if (!onUpdateSection) return;
    onUpdateSection(sectionId, {
      ...sectionData,
      [field]: nextValues,
    });
  };

  const handleSideChange = (
    field: 'sectionPadding' | 'sectionMargin',
    side: SpacingSide,
    raw: string
  ) => {
    const current: SectionSpacingValues =
      (field === 'sectionPadding' ? sectionData?.sectionPadding : sectionData?.sectionMargin) || {};
    if (raw === '') {
      const next = { ...current };
      delete next[side];
      updateSpacing(field, Object.keys(next).length > 0 ? next : undefined);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    const clamped =
      field === 'sectionPadding' ? Math.max(0, Math.min(300, parsed)) : Math.max(-160, Math.min(300, parsed));
    updateSpacing(field, { ...current, [side]: clamped });
  };

  const handleApplyPreset = (field: 'sectionPadding' | 'sectionMargin', value: number) => {
    if (value === 0) {
      updateSpacing(field, undefined);
      return;
    }
    updateSpacing(field, { top: value, bottom: value, left: value, right: value });
  };

  const handleResetAll = () => {
    if (!onUpdateSection) return;
    onUpdateSection(sectionId, {
      ...sectionData,
      sectionPadding: undefined,
      sectionMargin: undefined,
    });
  };

  const renderSpacingGroup = (
    title: string,
    subtitle: string,
    field: 'sectionPadding' | 'sectionMargin',
    values: SectionSpacingValues,
    minVal: number
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white block">{title}</span>
          <span className="text-[10px] text-slate-400">{subtitle}</span>
        </div>
        <div className="flex items-center gap-1">
          {PRESETS.map((preset) => {
            const isPresetActive =
              preset.value === 0
                ? !values.top && !values.bottom && !values.left && !values.right
                : values.top === preset.value &&
                  values.bottom === preset.value &&
                  values.left === preset.value &&
                  values.right === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(field, preset.value)}
                className={clsx(
                  'px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer',
                  isPresetActive
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {SIDES.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1 text-right">
            <span className="text-[10px] text-slate-400 font-medium">{label}</span>
            <div className="relative">
              <input
                type="number"
                min={minVal}
                max={300}
                step={4}
                value={values[key] ?? ''}
                placeholder="0"
                onChange={(e) => handleSideChange(field, key, e.target.value)}
                className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:outline-none text-xs text-white text-center font-mono"
                dir="ltr"
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );

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
            : isActive
              ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
        )}
        title="שוליים פנימיים וחיצוניים (Padding / Margin)"
      >
        <SlidersHorizontal
          className={clsx(
            'w-3.5 h-3.5',
            isOpen ? 'text-white' : isActive ? 'text-amber-300' : 'text-indigo-400'
          )}
        />
        {!compact && isActive && (
          <span className="font-bold text-xs hidden sm:inline">שוליים</span>
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
          className="absolute left-0 sm:right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0b0f19] border border-slate-700 p-3 shadow-2xl z-50 text-right animate-in fade-in zoom-in-95 duration-150 space-y-3"
          dir="rtl"
          style={{ backgroundColor: '#0b0f19' }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>שוליים פנימיים וחיצוניים (px)</span>
            </span>
            {isActive && (
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 border border-slate-700 transition cursor-pointer"
                title="אפס את כל השוליים"
              >
                <RotateCcw className="w-3 h-3" />
                <span>איפוס</span>
              </button>
            )}
          </div>

          {renderSpacingGroup(
            'שוליים פנימיים (Padding)',
            'ריווח פנימי סביב תוכן האזור',
            'sectionPadding',
            padding,
            0
          )}

          <div className="h-px bg-slate-800" />

          {renderSpacingGroup(
            'שוליים חיצוניים (Margin)',
            'מרווח חיצוני מאזורים סמוכים',
            'sectionMargin',
            margin,
            -160
          )}
        </div>
      )}
    </div>
  );
};
