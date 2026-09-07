import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PageBuilderColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presetColors?: string[];
  className?: string;
}

const DEFAULT_PRESETS = [
  '#4f46e5', // Indigo
  '#7c3aed', // Purple
  '#ec4899', // Pink
  '#2563eb', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#0f172a', // Slate Dark
  '#18181b', // Zinc Dark
  '#ffffff', // White
  'transparent',
];

export const PageBuilderColorPicker: React.FC<PageBuilderColorPickerProps> = ({
  label,
  value,
  onChange,
  presetColors = DEFAULT_PRESETS,
  className,
}) => {
  return (
    <div className={twMerge(clsx('flex flex-col gap-1.5 w-full text-right', className))} dir="rtl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300">{label}</label>
        <span className="text-[11px] font-mono text-slate-400" dir="ltr">
          {value || '#ffffff'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative shrink-0 w-9 h-9 rounded-xl border border-slate-700 overflow-hidden shadow-inner flex items-center justify-center bg-slate-800">
          <input
            type="color"
            value={value && value !== 'transparent' ? value : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div
            className="w-full h-full"
            style={{
              backgroundColor: value === 'transparent' ? 'transparent' : value,
              backgroundImage:
                value === 'transparent'
                  ? 'repeating-linear-gradient(45deg, #333 0, #333 4px, #444 0, #444 8px)'
                  : undefined,
            }}
          />
        </div>

        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff / transparent"
          className="flex-1 bg-slate-900/80 border border-slate-700/80 text-white rounded-xl px-3 py-1.5 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          dir="ltr"
        />
      </div>

      <div className="flex flex-wrap gap-1 mt-1">
        {presetColors.map((color, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChange(color)}
            className={twMerge(
              clsx(
                'w-5 h-5 rounded-lg border border-white/10 transition-transform hover:scale-110 cursor-pointer',
                value === color && 'ring-2 ring-indigo-400 scale-110'
              )
            )}
            style={{
              backgroundColor: color === 'transparent' ? 'transparent' : color,
              backgroundImage:
                color === 'transparent'
                  ? 'repeating-linear-gradient(45deg, #333 0, #333 2px, #444 0, #444 4px)'
                  : undefined,
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};
