import React from 'react';
import { BrandingTrustConfig } from './BrandingTrustSection';
import { BrandingFunctionPicker } from '../common/BrandingFunctionPicker';
import { BrandingCollectionSelector } from '../common/BrandingCollectionSelector';

export interface BrandingTrustEditorProps {
  config: BrandingTrustConfig;
  onChange: (updated: BrandingTrustConfig) => void;
}

export const BrandingTrustEditor: React.FC<BrandingTrustEditorProps> = ({ config, onChange }) => {
  const updateField = (field: keyof BrandingTrustConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      {/* 1. Core Trust & Contact Inputs */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          פרטי אמון והתקשרות
        </h4>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כותרת האזור</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="אמינות, תאימות משפטית וסליקה בטוחה"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כותרת אחריות והתחייבות</label>
          <input
            type="text"
            value={config.guaranteeHeadline || ''}
            onChange={(e) => updateField('guaranteeHeadline', e.target.value)}
            placeholder="100% שביעות רצון מובטחת"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">טלפון שירות</label>
            <input
              type="text"
              value={config.supportPhone || ''}
              onChange={(e) => updateField('supportPhone', e.target.value)}
              placeholder="03-1234567"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">דוא״ל שירות</label>
            <input
              type="text"
              value={config.supportEmail || ''}
              onChange={(e) => updateField('supportEmail', e.target.value)}
              placeholder="support@domain.com"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">מספר ח.פ / ע.מ</label>
            <input
              type="text"
              value={config.legalEntityId || ''}
              onChange={(e) => updateField('legalEntityId', e.target.value)}
              placeholder="515000000"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">ימי ביטול עסקה (חוק)</label>
            <input
              type="number"
              value={config.cancellationPolicyDays || 14}
              onChange={(e) => updateField('cancellationPolicyDays', Number(e.target.value))}
              min={0}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* 2. Collection & Contract Data Binding Selector */}
      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
        <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
          סנכרון נתונים מקולקציית Brand DNA
        </h4>
        <BrandingCollectionSelector
          value="trust.legalEntityId"
          onChange={(fieldKey) => {
            console.log('Trust binding:', fieldKey);
          }}
          label="שדה מקור לסנכרון נתוני אמינות ומשפט"
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
            placeholder="למשל: סנכרן תנאי שירות (AI)"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <BrandingFunctionPicker
          value={config.primaryButtonAction || 'open_strategy'}
          onChange={(action) => updateField('primaryButtonAction', action)}
          label="פונקציה שתופעל בלחיצה"
        />
      </div>
    </div>
  );
};
