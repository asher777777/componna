import React from 'react';
import { BrandingOverviewConfig } from './BrandingOverviewSection';
import { BrandingFunctionPicker } from '../common/BrandingFunctionPicker';
import { BrandingCollectionSelector } from '../common/BrandingCollectionSelector';

export interface BrandingOverviewEditorProps {
  config: BrandingOverviewConfig;
  onChange: (updated: BrandingOverviewConfig) => void;
}

export const BrandingOverviewEditor: React.FC<BrandingOverviewEditorProps> = ({ config, onChange }) => {
  const updateField = (field: keyof BrandingOverviewConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleRecsChange = (text: string) => {
    const list = text.split('\n').map((s) => s.trim()).filter(Boolean);
    updateField('recommendations', list);
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      {/* 1. Core Overview Settings */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          הגדרות מבט-על ושלמות מותג
        </h4>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כותרת האזור</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="מבט-על: שלמות אפיון המותג והמלצות AI"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">ציון שלמות (0-100%)</label>
            <input
              type="number"
              value={config.completenessScore ?? 85}
              onChange={(e) => updateField('completenessScore', Number(e.target.value))}
              min={0}
              max={100}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">הודעת סטטוס</label>
            <input
              type="text"
              value={config.statusText || ''}
              onChange={(e) => updateField('statusText', e.target.value)}
              placeholder="אפיון המותג מוכן לשיגור"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">המלצות להשלמה (שורה לכל המלצה)</label>
          <textarea
            value={(config.recommendations || []).join('\n')}
            onChange={(e) => handleRecsChange(e.target.value)}
            rows={3}
            placeholder="המלצה 1&#10;המלצה 2"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
          />
        </div>
      </div>

      {/* 2. Collection & Contract Data Binding Selector */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-3">
        <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200">
          סנכרון נתונים מקולקציית Brand DNA
        </h4>
        <BrandingCollectionSelector
          value="identity.brandSummary"
          onChange={(fieldKey) => {
            console.log('Overview binding:', fieldKey);
          }}
          label="שדה מקור לסנכרון תמצית מותג"
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
            placeholder="למשל: הפעל אשף גילוי AI"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <BrandingFunctionPicker
          value={config.primaryButtonAction || 'open_ai_wizard'}
          onChange={(action) => updateField('primaryButtonAction', action)}
          label="פונקציה שתופעל בלחיצה"
        />
      </div>
    </div>
  );
};
