import React from 'react';
import { BrandingMarketConfig } from './BrandingMarketSection';
import { BrandingFunctionPicker } from '../common/BrandingFunctionPicker';
import { BrandingCollectionSelector } from '../common/BrandingCollectionSelector';

export interface BrandingMarketEditorProps {
  config: BrandingMarketConfig;
  onChange: (updated: BrandingMarketConfig) => void;
}

export const BrandingMarketEditor: React.FC<BrandingMarketEditorProps> = ({ config, onChange }) => {
  const updateField = (field: keyof BrandingMarketConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleCompetitorsChange = (text: string) => {
    const list = text.split(',').map((s) => s.trim()).filter(Boolean);
    updateField('competitors', list);
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      {/* 1. Core Market Settings */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          הגדרות מחקר שוק ומתחרים
        </h4>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כותרת האזור</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="סוכן מחקר שוק, מתחרים ובידול (AI)"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">תובנת שוק מרכזית</label>
          <textarea
            value={config.topInsight || ''}
            onChange={(e) => updateField('topInsight', e.target.value)}
            rows={2}
            placeholder="תובנה אסטרטגית על השוק והמתחרים..."
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">מתחרים במעקב (מופרדים בפסיקים)</label>
          <input
            type="text"
            value={(config.competitors || []).join(', ')}
            onChange={(e) => handleCompetitorsChange(e.target.value)}
            placeholder="מתחרה א, חברה ב, סוכנות ג"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* 2. Collection & Contract Data Binding Selector */}
      <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-3">
        <h4 className="text-xs font-black text-purple-900 dark:text-purple-200">
          סנכרון נתונים מקולקציית Brand DNA
        </h4>
        <BrandingCollectionSelector
          value="identity.primaryPurpose"
          onChange={(fieldKey) => {
            console.log('Market binding:', fieldKey);
          }}
          label="שדה מקור לסנכרון נתוני מחקר שוק"
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
            placeholder="למשל: הפעל סוכן מחקר שוק (AI)"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <BrandingFunctionPicker
          value={config.primaryButtonAction || 'run_market_agent'}
          onChange={(action) => updateField('primaryButtonAction', action)}
          label="פונקציה שתופעל בלחיצה"
        />
      </div>
    </div>
  );
};
