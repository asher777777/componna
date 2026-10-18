import React from 'react';
import { BRANDING_DATA_FIELDS, BrandingDataFieldOption } from './types';
import { Database, ChevronDown } from 'lucide-react';

export interface BrandingCollectionSelectorProps {
  value?: string;
  onChange: (fieldKey: string) => void;
  label?: string;
}

export const BrandingCollectionSelector: React.FC<BrandingCollectionSelectorProps> = ({
  value = 'identity.companyName',
  onChange,
  label = 'שדה נתונים / קולקציה מקושרת',
}) => {
  const groups: Record<string, BrandingDataFieldOption[]> = {};
  BRANDING_DATA_FIELDS.forEach((f) => {
    if (!groups[f.group]) groups[f.group] = [];
    groups[f.group].push(f);
  });

  return (
    <div className="space-y-2 text-right" dir="rtl">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>{label}</span>
        </span>
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
        >
          {Object.entries(groups).map(([groupName, items]) => (
            <optgroup key={groupName} label={`📂 ${groupName}`}>
              {items.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label} ({item.key})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
        {value ? `bound: ${value}` : 'לא נבחר שדה'}
      </p>
    </div>
  );
};
