import React from 'react';
import { CampaignHeaderSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Target, TrendingUp, Sliders } from 'lucide-react';

interface CampaignHeaderEditorProps {
  config: CampaignHeaderSectionConfig;
  onChange: (updated: CampaignHeaderSectionConfig) => void;
}

export const CampaignHeaderEditor: React.FC<CampaignHeaderEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof CampaignHeaderSectionConfig>(field: K, value: CampaignHeaderSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="כותרות ויעדי קמפיין" icon={<Target className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת הקמפיין"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: בונים את בית המדרש החדש"
        />
        <PageBuilderInput
          label="תת-כותרת / תגית"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: שותפות בבניין עולם"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <PageBuilderInput
            label="יעד גיוס (₪)"
            type="number"
            value={config.targetGoal || ''}
            onChange={(e) => update('targetGoal', parseInt(e.target.value) || 0)}
            placeholder="100000"
            dir="ltr"
          />
          <PageBuilderInput
            label="סכום שגויס בפועל (₪)"
            type="number"
            value={config.totalRaised || ''}
            onChange={(e) => update('totalRaised', parseInt(e.target.value) || 0)}
            placeholder="64500"
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <PageBuilderInput
            label="מספר תורמים שהצטרפו"
            type="number"
            value={config.donorsCount || ''}
            onChange={(e) => update('donorsCount', parseInt(e.target.value) || 0)}
            placeholder="184"
            dir="ltr"
          />
          <PageBuilderInput
            label="ימים שנותרו לקמפיין"
            type="number"
            value={config.daysLeft || ''}
            onChange={(e) => update('daysLeft', parseInt(e.target.value) || 0)}
            placeholder="14"
            dir="ltr"
          />
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="הגדרות עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן (Anchor ID)"
          value={config.anchorId || 'campaignHeader'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="campaignHeader"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
