import React from 'react';
import { DashboardHeaderConfig } from '../../types';

export interface DashboardHeaderEditorProps {
  config: DashboardHeaderConfig;
  onChange: (updated: DashboardHeaderConfig) => void;
}

export const DashboardHeaderEditor: React.FC<DashboardHeaderEditorProps> = ({
  config,
  onChange,
}) => {
  const updateField = <K extends keyof DashboardHeaderConfig>(key: K, val: DashboardHeaderConfig[K]) => {
    onChange({
      ...config,
      [key]: val,
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          ברכת פתיחה
        </label>
        <input
          type="text"
          value={config.greetingPrefix || ''}
          onChange={(e) => updateField('greetingPrefix', e.target.value)}
          placeholder="לדוגמה: שלום וברוך הבא"
          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          תת-כותרת / הסבר
        </label>
        <textarea
          rows={2}
          value={config.subtitle || ''}
          onChange={(e) => updateField('subtitle', e.target.value)}
          placeholder="הסבר קצר על מה שמוצג בלוח הבקרה..."
          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Toggles */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            הצג תג שם הדייר
          </span>
          <input
            type="checkbox"
            checked={Boolean(config.showTenantBadge)}
            onChange={(e) => updateField('showTenantBadge', e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            הצג תאריך נוכחי
          </span>
          <input
            type="checkbox"
            checked={Boolean(config.showDateRange)}
            onChange={(e) => updateField('showDateRange', e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </label>
      </div>

      {/* Action Buttons Config */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
          כפתורי פעולה עליונים
        </span>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              טקסט כפתור ראשי
            </label>
            <input
              type="text"
              value={config.primaryActionText || ''}
              onChange={(e) => updateField('primaryActionText', e.target.value)}
              placeholder="פעולה חדשה"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              קישור / יעד ראשי
            </label>
            <input
              type="text"
              value={config.primaryActionUrl || ''}
              onChange={(e) => updateField('primaryActionUrl', e.target.value)}
              placeholder="/contacts"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              טקסט כפתור משני
            </label>
            <input
              type="text"
              value={config.secondaryActionText || ''}
              onChange={(e) => updateField('secondaryActionText', e.target.value)}
              placeholder="צפייה בדוחות"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              קישור / יעד משני
            </label>
            <input
              type="text"
              value={config.secondaryActionUrl || ''}
              onChange={(e) => updateField('secondaryActionUrl', e.target.value)}
              placeholder="/crm-analytics"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
