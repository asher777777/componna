import React, { useState, useEffect } from 'react';
import { SmartFormSectionConfig } from './SmartFormSection';
import { getSmartForms } from '../../../smart-form-builder/services/formStorageService';
import { SmartFormDefinition } from '../../../smart-form-builder/types';
import { Sparkles, FormInput } from 'lucide-react';

export const SmartFormEditor: React.FC<{
  config: SmartFormSectionConfig;
  onChange: (newConfig: SmartFormSectionConfig) => void;
}> = ({ config, onChange }) => {
  const [forms, setForms] = useState<SmartFormDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSmartForms()
      .then((res) => {
        setForms(res);
        if (res.length > 0 && !config.formId) {
          onChange({ ...config, formId: res[0].id });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div dir="rtl" className="space-y-4 text-xs">
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 dark:text-slate-300">
          בחר טופס חכם (Smart Form) להטמעה בסקשן:
        </label>
        {loading ? (
          <div className="p-2 text-slate-400">טוען טפסים...</div>
        ) : forms.length === 0 ? (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-200">
            לא נמצאו טפסים. פתח את "סטודיו בונה הטפסים" כדי ליצור טופס ראשון ב-AI.
          </div>
        ) : (
          <select
            value={config.formId || ''}
            onChange={(e) => onChange({ ...config, formId: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title} ({f.steps?.length || 0} שלבים)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 dark:text-slate-300">
          כותרת עליונה לסקשן (אופציונלי):
        </label>
        <input
          type="text"
          value={config.sectionTitle || ''}
          onChange={(e) => onChange({ ...config, sectionTitle: e.target.value })}
          placeholder="לדוגמה: הצטרפו אלינו עוד היום"
          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 dark:text-slate-300">
          כותרת משנה לסקשן:
        </label>
        <input
          type="text"
          value={config.sectionSubtitle || ''}
          onChange={(e) => onChange({ ...config, sectionSubtitle: e.target.value })}
          placeholder="לדוגמה: מלאו את השאלון הקצר ונציג יחזור אליכם"
          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300">
            רוחב המיכל:
          </label>
          <select
            value={config.containerWidth || 'md'}
            onChange={(e) => onChange({ ...config, containerWidth: e.target.value as any })}
            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
          >
            <option value="sm">צר (max-w-xl)</option>
            <option value="md">סטנדרטי (max-w-2xl)</option>
            <option value="lg">רחב (max-w-4xl)</option>
            <option value="full">רוחב מלא</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300">
            צבע רקע לסקשן:
          </label>
          <input
            type="text"
            value={config.backgroundColor || ''}
            onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
            placeholder="#F8FAFC או transparent"
            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-[11px]"
          />
        </div>
      </div>
    </div>
  );
};
