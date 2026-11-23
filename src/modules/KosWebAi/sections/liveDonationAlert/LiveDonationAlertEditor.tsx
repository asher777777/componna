import React from 'react';
import { Bell, Sliders } from 'lucide-react';
import { LiveDonationAlertConfig } from './LiveDonationAlertSection';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';

interface Props {
  config: LiveDonationAlertConfig;
  onChange: (updated: LiveDonationAlertConfig) => void;
}

export const LiveDonationAlertEditor: React.FC<Props> = ({ config, onChange }) => {
  const update = <K extends keyof LiveDonationAlertConfig>(field: K, value: LiveDonationAlertConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="הגדרות התראת תורמים חיים" icon={<Bell className="w-4 h-4 text-emerald-400" />} defaultOpen={true}>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
          <label className="text-xs font-semibold text-slate-300">הפעל מודל התראות תורמים</label>
          <input
            type="checkbox"
            checked={config.visible ?? true}
            onChange={(e) => update('visible', e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 cursor-pointer"
          />
        </div>

        <PageBuilderInput
          label="מזהה קמפיין מקושר (Campaign ID)"
          value={config.campaignId || 'home'}
          onChange={(e) => update('campaignId', e.target.value)}
          placeholder="home"
          dir="ltr"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">מיקום ההתראה במסך</label>
          <select
            value={config.position || 'top-right'}
            onChange={(e) => update('position', e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="top-right">למעלה מימין</option>
            <option value="top-left">למעלה משמאל</option>
            <option value="bottom-right">למטה מימין</option>
            <option value="bottom-left">למטה משמאל</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PageBuilderInput
            label="משך תצוגה (מילישניות)"
            type="number"
            value={String(config.displayDurationMs ?? 3500)}
            onChange={(e) => update('displayDurationMs', Number(e.target.value) || 3500)}
          />
          <PageBuilderInput
            label="כמות תרומות אחרונות בטעינה"
            type="number"
            value={String(config.initialCount ?? 3)}
            onChange={(e) => update('initialCount', Number(e.target.value) || 0)}
          />
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="אפשרויות ועיצוב" icon={<Sliders className="w-4 h-4 text-amber-400" />} defaultOpen={true}>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300">השמע צליל התראה עדין</label>
            <input
              type="checkbox"
              checked={config.playSound ?? true}
              onChange={(e) => update('playSound', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300">הצג פס התקדמות סגירה</label>
            <input
              type="checkbox"
              checked={config.showProgressBar ?? true}
              onChange={(e) => update('showProgressBar', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300">הצג כפתור בדיקה (Demo)</label>
            <input
              type="checkbox"
              checked={config.enableDemoMode ?? false}
              onChange={(e) => update('enableDemoMode', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 cursor-pointer"
            />
          </div>
        </div>

        <PageBuilderColorPicker
          label="צבע דגש"
          value={config.accentColor || '#036846'}
          onChange={(c) => update('accentColor', c)}
        />
      </PageBuilderAccordion>
    </div>
  );
};
