import React from 'react';
import { DashboardSlotWidgetConfig } from '../../types';

export interface DashboardSlotWidgetEditorProps {
  config: DashboardSlotWidgetConfig;
  onChange: (updated: DashboardSlotWidgetConfig) => void;
}

export const DashboardSlotWidgetEditor: React.FC<DashboardSlotWidgetEditorProps> = ({
  config,
  onChange,
}) => {
  const updateField = <K extends keyof DashboardSlotWidgetConfig>(key: K, val: DashboardSlotWidgetConfig[K]) => {
    onChange({ ...config, [key]: val });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          כותרת הווידג׳ט
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="לדוגמה: טופס יצירת קשר מוטמע"
          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          מזהה שקע היכולת (Capability Slot Name)
        </label>
        <select
          value={config.slotName || 'dashboard-custom-widget'}
          onChange={(e) => updateField('slotName', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono cursor-pointer"
        >
          <option value="form-renderer">form-renderer (טופס חכם KSF)</option>
          <option value="media-gallery-picker">media-gallery-picker (בוחר מדיה KosCloudStore)</option>
          <option value="player-campaign-embed">player-campaign-embed (נגן Flow Player)</option>
          <option value="crm-contact-summary">crm-contact-summary (תקציר אנשי קשר CRM)</option>
          <option value="dashboard-custom-widget">שקע מותאם אישית (custom)</option>
        </select>
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 space-y-1">
        <span className="font-bold text-slate-700 dark:text-slate-300 block">עקרון ה-Slots ב-KOSUN26:</span>
        <p>הווידג׳ט מוטמע ישירות מהמודול המספק ללא צורך בייבוא ישיר, בהתאם לסטנדרט החוזים המחייב.</p>
      </div>
    </div>
  );
};
