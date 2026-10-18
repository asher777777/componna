import React from 'react';
import { BrandingDesignTokensConfig } from './BrandingDesignTokensSection';
import { BrandingFunctionPicker } from '../common/BrandingFunctionPicker';
import { BrandingCollectionSelector } from '../common/BrandingCollectionSelector';

export interface BrandingDesignTokensEditorProps {
  config: BrandingDesignTokensConfig;
  onChange: (updated: BrandingDesignTokensConfig) => void;
}

const PRESET_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#2563eb', '#8b5cf6'];

export const BrandingDesignTokensEditor: React.FC<BrandingDesignTokensEditorProps> = ({ config, onChange }) => {
  const updateField = (field: keyof BrandingDesignTokensConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      {/* 1. Core Token Settings */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          צבעים וטיפוגרפיה
        </h4>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כותרת האזור</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="שפה חזותית, צבעים וטיפוגרפיה"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        {/* Primary Color Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">צבע ראשי (Primary)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.primaryColor || '#6366f1'}
              onChange={(e) => updateField('primaryColor', e.target.value)}
              className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={config.primaryColor || '#6366f1'}
              onChange={(e) => updateField('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              dir="ltr"
            />
          </div>
          <div className="flex gap-1.5 pt-1">
            {PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => updateField('primaryColor', hex)}
                className="w-5 h-5 rounded-md border border-white dark:border-slate-800 shadow-xs cursor-pointer hover:scale-110 transition"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {/* Secondary Color Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">צבע משני (Secondary)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.secondaryColor || '#0ea5e9'}
              onChange={(e) => updateField('secondaryColor', e.target.value)}
              className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={config.secondaryColor || '#0ea5e9'}
              onChange={(e) => updateField('secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              dir="ltr"
            />
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">גופן מותג ראשי</label>
          <select
            value={config.fontFamily || 'Heebo, sans-serif'}
            onChange={(e) => updateField('fontFamily', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="Heebo, sans-serif">Heebo (מודרני, נקי וחד)</option>
            <option value="Assistant, sans-serif">Assistant (נעים, עגול וקריא)</option>
            <option value="Rubik, sans-serif">Rubik (דינמי, בולט וידידותי)</option>
            <option value='"Frank Ruhl Libre", serif'>Frank Ruhl (מסורתי, יוקרתי, רשמי)</option>
            <option value="Alef, sans-serif">Alef (אלגנטי ומאוזן)</option>
          </select>
        </div>
      </div>

      {/* 2. Collection & Contract Data Binding Selector */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-3">
        <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200">
          סנכרון נתונים מקולקציית Brand DNA
        </h4>
        <BrandingCollectionSelector
          value="designTokens.primaryColor"
          onChange={(fieldKey) => {
            console.log('Design tokens binding:', fieldKey);
          }}
          label="שדה מקור לסנכרון שפה חזותית וצבעים"
        />
      </div>

      {/* 3. Action Button Picker */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          כפתור פעולה ראשי
        </h4>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">טקסט כפתור</label>
          <input
            type="text"
            value={config.primaryButtonText || ''}
            onChange={(e) => updateField('primaryButtonText', e.target.value)}
            placeholder="למשל: חלץ צבעים מאתר (Scraper)"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <BrandingFunctionPicker
          value={config.primaryButtonAction || 'open_scraper'}
          onChange={(action) => updateField('primaryButtonAction', action)}
          label="פונקציה שתופעל בלחיצה"
        />
      </div>
    </div>
  );
};
