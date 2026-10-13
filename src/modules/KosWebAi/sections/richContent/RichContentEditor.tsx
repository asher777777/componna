import React from 'react';
import { RichContentSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { FileText, Sliders } from 'lucide-react';

interface RichContentEditorProps {
  config: RichContentSectionConfig;
  onChange: (updated: RichContentSectionConfig) => void;
}

export const RichContentEditor: React.FC<RichContentEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof RichContentSectionConfig>(field: K, value: RichContentSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="תוכן מעוצב ועשיר" icon={<FileText className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת ראשית של התוכן"
          value={config.heading || ''}
          onChange={(e) => update('heading', e.target.value)}
          placeholder="למשל: אודות הפרויקט והחזון שלנו"
        />
        <PageBuilderTextarea
          label="גוף הטקסט (תומך ב-HTML ותוכן עשיר)"
          value={config.body || ''}
          onChange={(e) => update('body', e.target.value)}
          rows={6}
          placeholder="הזן פסקאות טקסט כאן..."
        />

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold text-slate-300">סגנון פריסה</label>
          <select
            value={config.layout || 'standard'}
            onChange={(e) => update('layout', e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="standard">סטנדרטי (פסקה אחת רחבה)</option>
            <option value="two-columns">שני טורים (Two Columns)</option>
            <option value="highlight-box">קופסה מודגשת עם רקע ומסגרת (Highlight Box)</option>
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
          value={config.anchorId || 'richContent'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="richContent"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
