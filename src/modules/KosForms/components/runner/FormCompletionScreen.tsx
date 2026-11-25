import React, { useEffect } from 'react';
import { FormCompletionSettings, FormThemeSettings } from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { resolveKoswebFormStyle } from '../../config/koswebStylePresets';
import { ArrowLeft } from 'lucide-react';

export interface FormCompletionScreenProps {
  completion: FormCompletionSettings;
  theme?: FormThemeSettings;
  submissionId?: string | null;
  ticketOrderCode?: string | null;
  ticketCodes?: string[];
  onReset?: () => void;
}

export const FormCompletionScreen: React.FC<FormCompletionScreenProps> = ({
  completion,
  theme,
  submissionId,
  ticketOrderCode,
  ticketCodes,
  onReset,
}) => {
  const styleTokens = resolveKoswebFormStyle(theme?.stylePreset);
  const accentColor = theme?.accentColor || styleTokens.themeDefaults.accentColor || '#D97706';

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
        <div
          className="absolute inset-0 rounded-full blur-xl animate-pulse opacity-30"
          style={{ backgroundColor: accentColor }}
        />
        <LuxuryIconRenderer
          iconName={completion.iconName || 'CheckCircle2'}
          withContainer
          containerClassName={`relative p-5 ${styleTokens.iconContainerClass}`}
          className={`w-12 h-12 ${styleTokens.iconColorClass}`}
        />
      </div>

      <div className="space-y-3">
        <h2 className={`text-3xl sm:text-4xl ${styleTokens.titleClass}`}>
          {completion.title}
        </h2>
        <p className={`text-base sm:text-lg max-w-md mx-auto ${styleTokens.subtitleClass}`}>
          {completion.subtitle}
        </p>
      </div>

      {ticketOrderCode && (
        <div className={`w-full max-w-md p-4 text-right space-y-2 ${styleTokens.optionCardBaseClass} ${styleTokens.optionCardSelectedClass}`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold opacity-80">קוד הזמנת כרטיסים:</span>
            <span className="font-mono font-black text-base">
              {ticketOrderCode}
            </span>
          </div>
          {ticketCodes && ticketCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-current/15">
              {ticketCodes.map((code) => (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded-lg bg-slate-900/80 text-amber-300 font-mono text-[11px]"
                >
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {submissionId && (
        <div className={`text-xs font-mono px-3 py-1.5 ${styleTokens.badgeClass}`}>
          מזהה אישור: {submissionId}
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center">
        {completion.showRedirectButton && completion.redirectUrl && (
          <a
            href={completion.redirectUrl}
            className={`px-6 py-3 flex items-center gap-2 ${styleTokens.primaryButtonClass}`}
            style={theme?.accentColor ? { backgroundColor: accentColor } : undefined}
          >
            <span>{completion.redirectButtonText || 'המשך הלאה'}</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className={`px-5 py-2.5 text-sm transition-colors cursor-pointer ${styleTokens.secondaryButtonClass}`}
          >
            מילוי טופס נוסף
          </button>
        )}
      </div>
    </div>
  );
};
