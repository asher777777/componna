import React from 'react';
import { BeforeAfterSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput, resolveInputValue } from '../../ui/PageBuilderInput';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';

export const BeforeAfterEditor: React.FC<{
  config: BeforeAfterSectionConfig;
  onChange: (updated: BeforeAfterSectionConfig) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PageBuilderInput
          label="כותרת ראשית"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: resolveInputValue(e) })}
        />
        <PageBuilderInput
          label="תת-כותרת / תגית"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: resolveInputValue(e) })}
        />
      </div>

      <PageBuilderInput
        label="תיאור קצר"
        value={config.description || ''}
        onChange={(e) => onChange({ ...config, description: resolveInputValue(e) })}
      />

      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-4">
        <h4 className="text-xs font-bold text-slate-300">הגדרות תמונות לפני / אחרי</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <PageBuilderInput
              label="תווית תמונת 'לפני'"
              value={config.beforeLabel || 'לפני'}
              onChange={(e) => onChange({ ...config, beforeLabel: resolveInputValue(e) })}
            />
            <PageBuilderImageUpload
              label="תמונת 'לפני'"
              value={config.beforeImage}
              onChange={(url) => onChange({ ...config, beforeImage: url })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <PageBuilderInput
              label="תווית תמונת 'אחרי'"
              value={config.afterLabel || 'אחרי'}
              onChange={(e) => onChange({ ...config, afterLabel: resolveInputValue(e) })}
            />
            <PageBuilderImageUpload
              label="תמונת 'אחרי'"
              value={config.afterImage}
              onChange={(url) => onChange({ ...config, afterImage: url })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
