import React from 'react';
import { HeroSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Layout, Palette, Link as LinkIcon, Sliders, Type, FileText } from 'lucide-react';

interface HeroEditorProps {
  config: HeroSectionConfig;
  onChange: (updated: HeroSectionConfig) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof HeroSectionConfig>(field: K, value: HeroSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      {/* Content Accordion */}
      <PageBuilderAccordion title="טקסטים ותוכן ראשי" icon={<Type className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת ראשית (H1)"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: הפלטפורמה המובילה לניהול קהילות"
        />
        <PageBuilderInput
          label="תת-כותרת / תגית עליונה"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: חדש! גרסה 2.0 זמינה כעת"
        />
        <PageBuilderTextarea
          label="תיאור ופסקת פתיחה"
          value={config.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          placeholder="הסבר קצר על המוצר או השירות..."
        />
      </PageBuilderAccordion>

      {/* Media & Image Accordion */}
      <PageBuilderAccordion title="תמונה ומדיה ראשית" icon={<FileText className="w-4 h-4 text-emerald-400" />}>
        <PageBuilderImageUpload
          label="תמונת Hero ראשית"
          value={config.imageSrc}
          onChange={(url) => update('imageSrc', url)}
        />
      </PageBuilderAccordion>

      {/* Action Buttons Accordion */}
      <PageBuilderAccordion title="כפתורי הנעה לפעולה (CTA)" icon={<LinkIcon className="w-4 h-4 text-amber-400" />}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <label className="text-xs font-semibold text-slate-300">הצג כפתורי פעולה</label>
          <input
            type="checkbox"
            checked={config.buttonsVisible ?? true}
            onChange={(e) => update('buttonsVisible', e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
          />
        </div>

        {config.buttonsVisible !== false && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-indigo-300">כפתור ראשי (Primary)</span>
              <PageBuilderInput
                label="טקסט כפתור"
                value={config.primaryButton?.text || ''}
                onChange={(e) =>
                  update('primaryButton', {
                    text: e.target.value,
                    url: config.primaryButton?.url || '#',
                  })
                }
                placeholder="למשל: התחל עכשיו בחינם"
              />
              <PageBuilderInput
                label="קישור יעד (URL)"
                value={config.primaryButton?.url || ''}
                onChange={(e) =>
                  update('primaryButton', {
                    text: config.primaryButton?.text || 'התחל עכשיו',
                    url: e.target.value,
                  })
                }
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-300">כפתור משני (Secondary)</span>
              <PageBuilderInput
                label="טקסט כפתור"
                value={config.secondaryButton?.text || ''}
                onChange={(e) =>
                  update('secondaryButton', {
                    text: e.target.value,
                    url: config.secondaryButton?.url || '#',
                  })
                }
                placeholder="למשל: צפה בהדגמה"
              />
              <PageBuilderInput
                label="קישור יעד (URL)"
                value={config.secondaryButton?.url || ''}
                onChange={(e) =>
                  update('secondaryButton', {
                    text: config.secondaryButton?.text || 'צפה בהדגמה',
                    url: e.target.value,
                  })
                }
                placeholder="https://..."
                dir="ltr"
              />
            </div>
          </div>
        )}
      </PageBuilderAccordion>

      {/* Form Mode Accordion */}
      <PageBuilderAccordion title="טופס השארת פרטים (Lead Form)" icon={<Sliders className="w-4 h-4 text-purple-400" />}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <label className="text-xs font-semibold text-slate-300">הפעל טופס לידים במקום תמונה</label>
            <p className="text-[11px] text-slate-500">יוצג טופס איסוף לידים מעוצב לצד הכותרת</p>
          </div>
          <input
            type="checkbox"
            checked={config.formMode ?? false}
            onChange={(e) => update('formMode', e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
          />
        </div>

        {config.formMode && (
          <PageBuilderInput
            label="כותרת הטופס"
            value={config.formTitle || ''}
            onChange={(e) => update('formTitle', e.target.value)}
            placeholder="למשל: השאירו פרטים ונחזור אליכם"
          />
        )}
      </PageBuilderAccordion>

      {/* Layout & Styling Accordion */}
      <PageBuilderAccordion title="עיצוב, פריסה וצבעים" icon={<Palette className="w-4 h-4 text-pink-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs font-semibold text-slate-300">סגנון פריסה (Layout)</label>
            <select
              value={config.layout || 'fz'}
              onChange={(e) => update('layout', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="fz">פריסת צד-אל-צד (F/Z Classic)</option>
              <option value="centered">פריסה ממורכזת (Centered Hero)</option>
              <option value="spatial">גלריה מרחבית (Spatial Hero)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs font-semibold text-slate-300">כיוון עמודות</label>
            <select
              value={config.flexDirection || 'row'}
              onChange={(e) => update('flexDirection', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="row">טקסט מימין, תמונה משמאל</option>
              <option value="row-reverse">תמונה מימין, טקסט משמאל</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          <PageBuilderColorPicker
            label="צבע רקע"
            value={config.backgroundColor || 'transparent'}
            onChange={(c) => update('backgroundColor', c)}
          />
          <PageBuilderColorPicker
            label="צבע כותרת"
            value={config.titleColor || '#ffffff'}
            onChange={(c) => update('titleColor', c)}
          />
          <PageBuilderColorPicker
            label="צבע תיאור"
            value={config.descriptionColor || '#94a3b8'}
            onChange={(c) => update('descriptionColor', c)}
          />
        </div>

        <PageBuilderInput
          label="מזהה עוגן (Anchor ID)"
          value={config.anchorId || 'hero'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="hero"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
