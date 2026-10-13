import React, { useState } from 'react';
import { CourseBannerSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderButton } from '../../ui/PageBuilderButton';
import { Plus, Trash2, GraduationCap, CheckCircle2, Sliders } from 'lucide-react';

interface CourseBannerEditorProps {
  config: CourseBannerSectionConfig;
  onChange: (updated: CourseBannerSectionConfig) => void;
}

export const CourseBannerEditor: React.FC<CourseBannerEditorProps> = ({ config, onChange }) => {
  const [newFeatureText, setNewFeatureText] = useState('');

  const update = <K extends keyof CourseBannerSectionConfig>(field: K, value: CourseBannerSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    update('features', [...(config.features || []), newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    update(
      'features',
      (config.features || []).filter((_, i) => i !== index)
    );
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      {/* Content */}
      <PageBuilderAccordion title="כותרות ותוכן הבאנר" icon={<GraduationCap className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת הבאנר"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: תוכנית הליווי וההכשרה המקיפה"
        />
        <PageBuilderInput
          label="תת-כותרת / תגית עליונה"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: הרשמה מוקדמת פתוחה"
        />
        <PageBuilderImageUpload
          label="תמונת הבאנר"
          value={config.imageSrc}
          onChange={(url) => update('imageSrc', url)}
        />
      </PageBuilderAccordion>

      {/* Bullet Features */}
      <PageBuilderAccordion
        title={`נקודות מפתח ויתרונות (${(config.features || []).length})`}
        icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        defaultOpen={true}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newFeatureText}
            onChange={(e) => setNewFeatureText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
            placeholder="הקלד יתרון או נקודת מפתח חדשה..."
            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          />
          <PageBuilderButton size="xs" onClick={handleAddFeature} disabled={!newFeatureText.trim()} icon={<Plus className="w-3.5 h-3.5" />}>
            הוסף
          </PageBuilderButton>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          {(config.features || []).map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </PageBuilderAccordion>

      {/* Action Button & Design */}
      <PageBuilderAccordion title="כפתור פעולה ועיצוב" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PageBuilderInput
            label="טקסט כפתור"
            value={config.primaryButton?.text || ''}
            onChange={(e) =>
              update('primaryButton', {
                text: e.target.value,
                url: config.primaryButton?.url || '#',
              })
            }
            placeholder="למשל: שריינו מקום עכשיו"
          />
          <PageBuilderInput
            label="קישור יעד"
            value={config.primaryButton?.url || ''}
            onChange={(e) =>
              update('primaryButton', {
                text: config.primaryButton?.text || 'הרשמה',
                url: e.target.value,
              })
            }
            placeholder="https://..."
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <PageBuilderColorPicker
            label="צבע רקע כללי"
            value={config.backgroundColor || 'transparent'}
            onChange={(c) => update('backgroundColor', c)}
          />
          <PageBuilderColorPicker
            label="צבע פס תחתון (Stripe)"
            value={config.bottomStripeColor || '#4f46e5'}
            onChange={(c) => update('bottomStripeColor', c)}
          />
        </div>

        <PageBuilderInput
          label="מזהה עוגן (Anchor ID)"
          value={config.anchorId || 'mainContent'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="mainContent"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
