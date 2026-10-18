import React from 'react';
import { BrandingVoiceConfig } from './BrandingVoiceSection';
import { BrandingFunctionPicker } from '../common/BrandingFunctionPicker';
import { BrandingCollectionSelector } from '../common/BrandingCollectionSelector';

export interface BrandingVoiceEditorProps {
  config: BrandingVoiceConfig;
  onChange: (updated: BrandingVoiceConfig) => void;
}

export const BrandingVoiceEditor: React.FC<BrandingVoiceEditorProps> = ({ config, onChange }) => {
  const updateField = (field: keyof BrandingVoiceConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleWordsChange = (field: 'powerWords' | 'forbiddenWords', textValue: string) => {
    const list = textValue
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);
    updateField(field, list);
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      {/* 1. Core Voice Settings */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white">
          הגדרות טון וסגנון פנייה
        </h4>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">כותרת האזור</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="שפת מותג, טון דיבור וערכים"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">אופן פנייה ללקוח</label>
            <select
              value={config.genderAddressing || 'plural'}
              onChange={(e) => updateField('genderAddressing', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="plural">לשון רבים (מומלץ)</option>
              <option value="direct">פנייה ישירה חדה</option>
              <option value="male">זכר יחיד</option>
              <option value="female">נקבה יחיד</option>
              <option value="neutral">נייטרלי / פסיבי</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">תאימות מגזר</label>
            <select
              value={config.sectorCompliance || 'business'}
              onChange={(e) => updateField('sectorCompliance', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="general">כללי ומודרני</option>
              <option value="business">עסקי ותכליתי (B2B)</option>
              <option value="religious">דתי / מסורתי</option>
              <option value="ultra_orthodox">חרדי ושמור</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="shabbatCheck"
            checked={Boolean(config.shabbatObservant)}
            onChange={(e) => updateField('shabbatObservant', e.target.checked)}
            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="shabbatCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            מותג שומר שבת (השבתת טפסים וסליקה בשבתות וחגים)
          </label>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">מילות כוח מומלצות (מופרדות בפסיקים)</label>
          <input
            type="text"
            value={(config.powerWords || []).join(', ')}
            onChange={(e) => handleWordsChange('powerWords', e.target.value)}
            placeholder="צמיחה, תוצאות, דיגיטל, חדשנות"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">מילים אסורות (מופרדות בפסיקים)</label>
          <input
            type="text"
            value={(config.forbiddenWords || []).join(', ')}
            onChange={(e) => handleWordsChange('forbiddenWords', e.target.value)}
            placeholder="זול, אולי, בלתי אפשרי"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* 2. Collection & Contract Data Binding Selector */}
      <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
        <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
          סנכרון נתונים מקולקציית Brand DNA
        </h4>
        <BrandingCollectionSelector
          value="voice.genderAddressing"
          onChange={(fieldKey) => {
            console.log('Voice binding:', fieldKey);
          }}
          label="שדה מקור לסנכרון שפת מותג"
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
            placeholder="למשל: צור אסטרטגיית תוכן"
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
