import React from 'react';
import { BrandingEcosystemConfig } from './BrandingEcosystemSection';
import { BrandingFunctionPicker } from '../common/BrandingFunctionPicker';
import { BrandingCollectionSelector } from '../common/BrandingCollectionSelector';

export interface BrandingEcosystemEditorProps {
  config: BrandingEcosystemConfig;
  onChange: (updated: BrandingEcosystemConfig) => void;
}

export const BrandingEcosystemEditor: React.FC<BrandingEcosystemEditorProps> = ({ config, onChange }) => {
  const updateField = (field: keyof BrandingEcosystemConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleServicesChange = (text: string) => {
    const list = text.split(',').map((s) => s.trim()).filter(Boolean);
    updateField('services', list);
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      {/* 1. Core Services & Ecosystem */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          הגדרות אקוסיסטם ושירותי ליבה
        </h4>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כותרת האזור</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="מבנה שירותים, מוצרי דגל ואקוסיסטם"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">שירותי ליבה (מופרדים בפסיקים)</label>
          <textarea
            value={(config.services || []).join(', ')}
            onChange={(e) => handleServicesChange(e.target.value)}
            rows={2}
            placeholder="ייעוץ אסטרטגי, בניית דפי נחיתה, אוטומציות"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
          />
        </div>
      </div>

      {/* 2. Collection & Contract Data Binding Selector */}
      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
        <h4 className="text-xs font-black text-blue-900 dark:text-blue-200">
          סנכרון נתונים מקולקציית Brand DNA
        </h4>
        <BrandingCollectionSelector
          value="ecosystem.services"
          onChange={(fieldKey) => {
            console.log('Ecosystem binding:', fieldKey);
          }}
          label="שדה מקור לסנכרון שירותי ליבה ומוצרים"
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
