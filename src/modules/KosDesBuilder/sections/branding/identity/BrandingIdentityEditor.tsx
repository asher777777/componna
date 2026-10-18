import React from 'react';
import { BrandingIdentityConfig } from './BrandingIdentitySection';
import { BrandingFunctionPicker } from '../common/BrandingFunctionPicker';
import { BrandingCollectionSelector } from '../common/BrandingCollectionSelector';

export interface BrandingIdentityEditorProps {
  config: BrandingIdentityConfig;
  onChange: (updated: BrandingIdentityConfig) => void;
}

export const BrandingIdentityEditor: React.FC<BrandingIdentityEditorProps> = ({ config, onChange }) => {
  const updateField = (field: keyof BrandingIdentityConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      {/* 1. Core Identity Data */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>פרטי זהות מותג</span>
        </h4>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">שם המותג / חברה</label>
          <input
            type="text"
            value={config.companyName || ''}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder="לדוגמה: קושאן דיגיטל"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">סלוגן עסקי</label>
          <input
            type="text"
            value={config.slogan || ''}
            onChange={(e) => updateField('slogan', e.target.value)}
            placeholder="לדוגמה: פתרונות בינה מלאכותית לעסקים"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">סוג התאגדות</label>
            <input
              type="text"
              value={config.orgType || ''}
              onChange={(e) => updateField('orgType', e.target.value)}
              placeholder="חברה בע״מ / עוסק מורשה"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כתובת לוגו (URL)</label>
            <input
              type="text"
              value={config.logoUrl || ''}
              onChange={(e) => updateField('logoUrl', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">חזון מותג ממוקד (מוצג בלחיצת הרחבה - חוק 7)</label>
          <textarea
            value={config.shortVision || ''}
            onChange={(e) => updateField('shortVision', e.target.value)}
            rows={2}
            placeholder="תיאור תמציתי של חזון המותג..."
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
          value="identity.companyName"
          onChange={(fieldKey) => {
            // Can be used to sync from contract
            console.log('Selected binding key:', fieldKey);
          }}
          label="שדה מקור לסנכרון אוטומטי של שם המותג"
        />
      </div>

      {/* 3. Primary Button Function Selector */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          הגדרת כפתור פעולה ראשי
        </h4>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">טקסט הכפתור הראשי</label>
          <input
            type="text"
            value={config.primaryButtonText || ''}
            onChange={(e) => updateField('primaryButtonText', e.target.value)}
            placeholder="לדוגמה: הפעל אשף גילוי AI"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <BrandingFunctionPicker
          value={config.primaryButtonAction || 'open_ai_wizard'}
          payload={config.primaryButtonPayload || ''}
          onChange={(action, payload) => {
            onChange({
              ...config,
              primaryButtonAction: action,
              primaryButtonPayload: payload,
            });
          }}
          label="פונקציה שתופעל בלחיצה על הכפתור הראשי"
        />
      </div>

      {/* 4. Secondary Button Function Selector */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          הגדרת כפתור פעולה משני
        </h4>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">טקסט הכפתור המשני</label>
          <input
            type="text"
            value={config.secondaryButtonText || ''}
            onChange={(e) => updateField('secondaryButtonText', e.target.value)}
            placeholder="לדוגמה: סריקת מותג מ-URL"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <BrandingFunctionPicker
          value={config.secondaryButtonAction || 'open_scraper'}
          payload={config.secondaryButtonPayload || ''}
          onChange={(action, payload) => {
            onChange({
              ...config,
              secondaryButtonAction: action,
              secondaryButtonPayload: payload,
            });
          }}
          label="פונקציה שתופעל בלחיצה על הכפתור המשני"
        />
      </div>
    </div>
  );
};
