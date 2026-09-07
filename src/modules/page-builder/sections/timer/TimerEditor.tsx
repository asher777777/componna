import React from 'react';
import { TimerSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Clock, Sliders } from 'lucide-react';

interface TimerEditorProps {
  config: TimerSectionConfig;
  onChange: (updated: TimerSectionConfig) => void;
}

export const TimerEditor: React.FC<TimerEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof TimerSectionConfig>(field: K, value: TimerSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="הגדרות טיימר ותאריך" icon={<Clock className="w-4 h-4 text-amber-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת הטיימר"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: הספירה לאחור החלה"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: אל תפספסו את ההזדמנות"
        />
        <PageBuilderInput
          label="תאריך ושעת יעד (ISO Format / Date)"
          type="datetime-local"
          value={config.targetDate ? config.targetDate.substring(0, 16) : ''}
          onChange={(e) => update('targetDate', e.target.value)}
          dir="ltr"
        />
      </PageBuilderAccordion>

      <PageBuilderAccordion title="צבעים ועיצוב קוביות" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PageBuilderColorPicker
            label="צבע רקע קוביות"
            value={config.boxBackgroundColor || '#0f172a'}
            onChange={(c) => update('boxBackgroundColor', c)}
          />
          <PageBuilderColorPicker
            label="צבע מספרים"
            value={config.numberColor || '#ffffff'}
            onChange={(c) => update('numberColor', c)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <PageBuilderColorPicker
            label="צבע תוויות"
            value={config.labelColor || '#94a3b8'}
            onChange={(c) => update('labelColor', c)}
          />
          <PageBuilderColorPicker
            label="צבע רקע כללי"
            value={config.backgroundColor || 'transparent'}
            onChange={(c) => update('backgroundColor', c)}
          />
        </div>

        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'timer'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="timer"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
