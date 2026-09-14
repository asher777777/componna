import React, { useEffect } from 'react';
import { FormCompletionSettings, FormThemeSettings } from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface FormCompletionScreenProps {
  completion: FormCompletionSettings;
  theme?: FormThemeSettings;
  submissionId?: string | null;
  onReset?: () => void;
}

export const FormCompletionScreen: React.FC<FormCompletionScreenProps> = ({
  completion,
  theme,
  submissionId,
  onReset,
}) => {
  const accentColor = theme?.accentColor || '#D97706';

  useEffect(() => {
    if (
      completion.showRedirectButton &&
      completion.redirectUrl &&
      completion.autoRedirectSeconds &&
      completion.autoRedirectSeconds > 0
    ) {
      const timer = setTimeout(() => {
        window.location.href = completion.redirectUrl!;
      }, completion.autoRedirectSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [completion]);

  return (
    <div
      dir="rtl"
      className="w-full max-w-xl mx-auto py-12 px-6 flex flex-col items-center text-center space-y-6 animate-fadeIn"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative p-5 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-3xl shadow-xl shadow-amber-500/20">
          <LuxuryIconRenderer
            iconName={completion.iconName || 'CheckCircle2'}
            className="w-12 h-12"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {completion.title}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
          {completion.subtitle}
        </p>
      </div>

      {submissionId && (
        <div className="text-xs font-mono px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          מזהה אישור: {submissionId}
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center">
        {completion.showRedirectButton && completion.redirectUrl && (
          <a
            href={completion.redirectUrl}
            className="px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            <span>{completion.redirectButtonText || 'המשך הלאה'}</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            מילוי טופס נוסף
          </button>
        )}
      </div>
    </div>
  );
};
