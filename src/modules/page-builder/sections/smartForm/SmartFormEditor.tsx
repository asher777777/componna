import React, { useState, useEffect } from 'react';
import { SmartFormSectionConfig } from './SmartFormSection';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { FormBuilderContract, FormItemSummary } from '../../../../core/contracts';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { FileText, Sparkles, RefreshCw, Layers } from 'lucide-react';

export const SmartFormEditor: React.FC<{
  config: SmartFormSectionConfig;
  onChange: (newConfig: SmartFormSectionConfig) => void;
}> = ({ config, onChange }) => {
  const { getCapability } = useHostCapabilities();
  const formBuilder = getCapability<FormBuilderContract>('form-builder');

  const [forms, setForms] = useState<FormItemSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchForms = async () => {
    if (!formBuilder?.getForms) return;
    setLoading(true);
    try {
      const list = await formBuilder.getForms();
      setForms(list);
      if (!config.formId && list.length > 0) {
        onChange({ ...config, formId: list[0].id });
      }
    } catch (e) {
      console.warn('Error fetching forms from host capability:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [formBuilder]);

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="טקסטים וכותרות" defaultOpen>
        <div className="flex flex-col gap-3">
          <PageBuilderInput
            label="כותרת הסקשן"
            value={config.sectionTitle || ''}
            onChange={(val) => onChange({ ...config, sectionTitle: val })}
            placeholder="למשל: דברו איתנו / השאירו פרטים"
          />
          <PageBuilderInput
            label="תת כותרת"
            value={config.sectionSubtitle || ''}
            onChange={(val) => onChange({ ...config, sectionSubtitle: val })}
            placeholder="נחזור אליכם תוך זמן קצר"
          />
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="בחירת טופס ומקור נתונים" defaultOpen>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">טופס חכם מקושר</label>
            {formBuilder?.getForms && (
              <button
                type="button"
                onClick={fetchForms}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>רענן רשימה</span>
              </button>
            )}
          </div>

          {forms.length > 0 ? (
            <select
              value={config.formId || ''}
              onChange={(e) => onChange({ ...config, formId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">טופס לידים מובנה של העמוד (מומלץ)</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.submissionsCount || 0} הגשות)
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400">
              <p>טופס לידים מובנה מוגדר כברירת מחדל ויקלוט הגשות ישירות ל-CRM.</p>
              {formBuilder && (
                <p className="mt-1 text-[11px] text-indigo-400">
                  מודול הטפסים החכמים מחובר וזמין.
                </p>
              )}
            </div>
          )}

          <PageBuilderInput
            label="מזהה טופס ידני (אופציונלי)"
            value={config.formId || ''}
            onChange={(val) => onChange({ ...config, formId: val })}
            placeholder="form_id..."
          />
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="עיצוב ומבנה">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">רוחב המיכל</label>
            <div className="grid grid-cols-4 gap-2">
              {(['sm', 'md', 'lg', 'full'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onChange({ ...config, containerWidth: w })}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    (config.containerWidth || 'md') === w
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {w.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <PageBuilderColorPicker
            label="צבע רקע"
            value={config.backgroundColor || 'transparent'}
            onChange={(val) => onChange({ ...config, backgroundColor: val })}
          />
        </div>
      </PageBuilderAccordion>
    </div>
  );
};
