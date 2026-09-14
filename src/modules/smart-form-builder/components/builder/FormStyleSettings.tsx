import React from 'react';
import { FormThemeSettings, FormCompletionSettings, SmartFormDefinition } from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { Palette, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export interface FormStyleSettingsProps {
  form: SmartFormDefinition;
  onChange: (updatedForm: SmartFormDefinition) => void;
}

export const FormStyleSettings: React.FC<FormStyleSettingsProps> = ({
  form,
  onChange,
}) => {
  const theme = form.theme || ({} as FormThemeSettings);
  const completion = form.completion || ({} as FormCompletionSettings);

  const updateTheme = (key: keyof FormThemeSettings, value: any) => {
    onChange({
      ...form,
      theme: {
        ...theme,
        [key]: value,
      },
    });
  };

  const updateCompletion = (key: keyof FormCompletionSettings, value: any) => {
    onChange({
      ...form,
      completion: {
        ...completion,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Visual Theme Section */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Palette className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
            עיצוב פרימיום וצבעי מותג
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              צבע ראשי / כותרות (Primary):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.primaryColor || '#0F172A'}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
              />
              <input
                type="text"
                value={theme.primaryColor || '#0F172A'}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              צבע הדגשה יוקרתי (Accent / Gold):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.accentColor || '#D97706'}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
              />
              <input
                type="text"
                value={theme.accentColor || '#D97706'}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              רקע כרטיס הטופס (Card BG):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.cardBackground || '#FFFFFF'}
                onChange={(e) => updateTheme('cardBackground', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
              />
              <input
                type="text"
                value={theme.cardBackground || '#FFFFFF'}
                onChange={(e) => updateTheme('cardBackground', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showProgressBar !== false}
              onChange={(e) => updateTheme('showProgressBar', e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              הצג מד התקדמות (Progress Bar) בראש הטופס
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showStepNumbers !== false}
              onChange={(e) => updateTheme('showStepNumbers', e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              הצג מספרי שלבים ("שלב X מתוך Y")
            </span>
          </label>
        </div>
      </div>

      {/* Completion Screen Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
            מסך סיום והודעת תודה
          </h4>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              כותרת מסך הסיום:
            </label>
            <input
              type="text"
              value={completion.title || ''}
              onChange={(e) => updateCompletion('title', e.target.value)}
              placeholder="תודה רבה! פנייתך התקבלה בהצלחה"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              הודעת תודה / הנחיות המשך:
            </label>
            <textarea
              rows={2}
              value={completion.subtitle || ''}
              onChange={(e) => updateCompletion('subtitle', e.target.value)}
              placeholder="הפרטים הועברו לטיפול אישי. ניצור עמך קשר בהקדם..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={completion.showRedirectButton || false}
                onChange={(e) => updateCompletion('showRedirectButton', e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>הצג כפתור הפניה לדף אינטרנט חיצוני / דף תודה</span>
            </label>

            {completion.showRedirectButton && (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={completion.redirectUrl || ''}
                  onChange={(e) => updateCompletion('redirectUrl', e.target.value)}
                  placeholder="https://example.com/thank-you"
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CRM Sync Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
            סנכרון לידים ישיר ל-CRM
          </h4>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isCrmSyncEnabled !== false}
            onChange={(e) => onChange({ ...form, isCrmSyncEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            הזן לידים חדשים אוטומטית לקולקציית ה-CRM המרכזית בעת הגשה
          </span>
        </label>
      </div>
    </div>
  );
};
