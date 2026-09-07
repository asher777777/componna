import React from 'react';
import { CampaignDonorsSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Users, Sliders } from 'lucide-react';

interface CampaignDonorsEditorProps {
  config: CampaignDonorsSectionConfig;
  onChange: (updated: CampaignDonorsSectionConfig) => void;
}

export const CampaignDonorsEditor: React.FC<CampaignDonorsEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof CampaignDonorsSectionConfig>(field: K, value: CampaignDonorsSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="הגדרות כרטיסיות תורמים" icon={<Users className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: תורמים אחרונים ושגרירים"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300">הצג שדה חיפוש תורם</label>
            <input
              type="checkbox"
              checked={config.showSearch ?? true}
              onChange={(e) => update('showSearch', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300">הצג תיבת סינון / מיון</label>
            <input
              type="checkbox"
              checked={config.showSort ?? true}
              onChange={(e) => update('showSort', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold text-slate-300">מבנה כרטיסיות (Layout)</label>
          <select
            value={config.cardLayout || 'grid-3'}
            onChange={(e) => update('cardLayout', e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="grid-3">גריד 3 כרטיסיות בשורה (Grid-3)</option>
            <option value="grid-2">גריד 2 כרטיסיות רחבות בשורה (Grid-2)</option>
          </select>
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'campaignDonors'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="campaignDonors"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
