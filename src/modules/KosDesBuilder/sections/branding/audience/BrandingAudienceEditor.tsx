import React from 'react';
import { BrandingAudienceConfig } from './BrandingAudienceSection';
import { BrandingFunctionPicker } from '../common/BrandingFunctionPicker';
import { BrandingCollectionSelector } from '../common/BrandingCollectionSelector';

export interface BrandingAudienceEditorProps {
  config: BrandingAudienceConfig;
  onChange: (updated: BrandingAudienceConfig) => void;
}

export const BrandingAudienceEditor: React.FC<BrandingAudienceEditorProps> = ({ config, onChange }) => {
  const updateField = (field: keyof BrandingAudienceConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleAudiencesChange = (text: string) => {
    const list = text.split(',').map((s) => s.trim()).filter(Boolean);
    updateField('targetAudiences', list);
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      {/* 1. Target Audience & UVP Inputs */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          הגדרות קהלי יעד ובידול
        </h4>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כותרת האזור</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="קהלי יעד, פרסונות ובידול (UVP)"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">הצעת ערך ייחודית (UVP מרכזי)</label>
          <textarea
            value={config.mainUvp || ''}
            onChange={(e) => updateField('mainUvp', e.target.value)}
            rows={2}
            placeholder="מה הערך הבלעדי שהעסק מעניק שאי אפשר למצוא במקום אחר..."
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">קהלי יעד מוגדרים (מופרדים בפסיקים)</label>
          <input
            type="text"
            value={(config.targetAudiences || []).join(', ')}
            onChange={(e) => handleAudiencesChange(e.target.value)}
            placeholder="בעלי עסקים קטנים, מנהלי שיווק, יועצים"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* 2. Collection & Contract Data Binding Selector */}
      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
        <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
          סנכרון נתונים מקולקציית Brand DNA
        </h4>
        <BrandingCollectionSelector
          value="audience.mainUvp"
          onChange={(fieldKey) => {
            console.log('Audience binding:', fieldKey);
          }}
          label="שדה מקור לסנכרון הצעת ערך וקהלי יעד"
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
