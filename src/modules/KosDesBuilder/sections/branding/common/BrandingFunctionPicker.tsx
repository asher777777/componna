import React from 'react';
import { BrandingActionType, BRANDING_ACTION_OPTIONS } from './types';
import { Zap, ChevronDown } from 'lucide-react';

export interface BrandingFunctionPickerProps {
  value?: BrandingActionType;
  payload?: string;
  onChange: (action: BrandingActionType, payload?: string) => void;
  label?: string;
}

export const BrandingFunctionPicker: React.FC<BrandingFunctionPickerProps> = ({
  value = 'open_ai_wizard',
  payload = '',
  onChange,
  label = 'פונקציית כפתור לבחירה',
}) => {
  const currentOption = BRANDING_ACTION_OPTIONS.find((opt) => opt.type === value) || BRANDING_ACTION_OPTIONS[0];

  return (
    <div className="space-y-2 text-right" dir="rtl">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-indigo-500" />
          <span>{label}</span>
        </span>
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            const nextType = e.target.value as BrandingActionType;
            const defOpt = BRANDING_ACTION_OPTIONS.find((o) => o.type === nextType);
            onChange(nextType, defOpt?.defaultPayload || payload);
          }}
          className="w-full appearance-none px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
        >
          {BRANDING_ACTION_OPTIONS.map((opt) => (
            <option key={opt.type} value={opt.type}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {currentOption.description}
      </p>

      {/* Dynamic Payload input if needed */}
      {(value === 'switch_branding_tab' || value === 'navigate' || value === 'custom_event') && (
        <div className="pt-1 space-y-1">
          <label className="text-[10px] font-mono font-bold text-slate-500">
            {value === 'switch_branding_tab' && 'מזהה טאב (identity, voice, audience, ecosystem, design, trust, market):'}
            {value === 'navigate' && 'נתיב ניווט במערכת:'}
            {value === 'custom_event' && 'שם האירוע לשיגור:'}
          </label>
          <input
            type="text"
            value={payload}
            onChange={(e) => onChange(value, e.target.value)}
            placeholder={currentOption.defaultPayload || ''}
            className="w-full px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>
      )}
    </div>
  );
};
