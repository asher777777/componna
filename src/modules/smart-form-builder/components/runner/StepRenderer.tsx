import React from 'react';
import { FormStep, FormThemeSettings } from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { Star, Check, Upload, FileCheck } from 'lucide-react';

export interface StepRendererProps {
  step: FormStep;
  value: any;
  onChange: (value: any) => void;
  onEnter?: () => void;
  theme?: FormThemeSettings;
  validationError?: string | null;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  step,
  value,
  onChange,
  onEnter,
  theme,
  validationError,
}) => {
  const accentColor = theme?.accentColor || '#D97706';

  const renderFieldInput = () => {
    switch (step.fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="relative w-full max-w-xl">
            <input
              type={step.fieldType === 'number' ? 'number' : step.fieldType === 'email' ? 'email' : step.fieldType === 'phone' ? 'tel' : 'text'}
              autoFocus
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={step.placeholder || 'הקלד כאן...'}
              className="w-full px-5 py-4 text-lg md:text-xl bg-white/80 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400"
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="w-full max-w-xl">
            <textarea
              autoFocus
              rows={4}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={step.placeholder || 'הקלד את תשובתך בהרחבה כאן...'}
              className="w-full px-5 py-4 text-base md:text-lg bg-white/80 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 resize-y"
            />
          </div>
        );

      case 'single_choice': {
        const options = step.options || [];
        return (
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {options.map((opt, idx) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.id || opt.value || idx}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  className={`group relative p-4 rounded-2xl border-2 text-right transition-all duration-200 flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-2 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-600'
                    }`}
                  >
                    <LuxuryIconRenderer
                      iconName={opt.iconName || 'Sparkles'}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-white text-base">
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {opt.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 self-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );
      }

      case 'multi_choice': {
        const options = step.options || [];
        const currentVals: string[] = Array.isArray(value) ? value : [];
        const toggleOption = (optVal: string) => {
          if (currentVals.includes(optVal)) {
            onChange(currentVals.filter((v) => v !== optVal));
          } else {
            onChange([...currentVals, optVal]);
          }
        };

        return (
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {options.map((opt, idx) => {
              const isSelected = currentVals.includes(opt.value);
              return (
                <button
                  key={opt.id || opt.value || idx}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  className={`group relative p-4 rounded-2xl border-2 text-right transition-all duration-200 flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-2 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-600'
                    }`}
                  >
                    <LuxuryIconRenderer
                      iconName={opt.iconName || 'CheckSquare'}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-white text-base">
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {opt.description}
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 self-center transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        );
      }

      case 'rating': {
        const max = step.maxRating || 5;
        const currentRating = Number(value || 0);

        return (
          <div className="flex items-center gap-3 py-4">
            {Array.from({ length: max }, (_, i) => i + 1).map((starNum) => {
              const isFilled = starNum <= currentRating;
              return (
                <button
                  key={starNum}
                  type="button"
                  onClick={() => onChange(starNum)}
                  className="p-2 transition-transform duration-150 hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-500 drop-shadow-md'
                        : 'fill-none text-slate-300 dark:text-slate-700 hover:text-amber-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        );
      }

      case 'scale': {
        const min = step.minScale || 1;
        const max = step.maxScale || 10;
        const count = max - min + 1;
        const currentScale = Number(value);

        return (
          <div className="w-full max-w-2xl space-y-3">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: count }, (_, i) => min + i).map((num) => {
                const isSelected = currentScale === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onChange(num)}
                    className={`h-12 rounded-xl font-bold text-base transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-lg scale-105 ring-2 ring-amber-500/50'
                        : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              <span>{step.minScaleLabel || 'נמוך'}</span>
              <span>{step.maxScaleLabel || 'גבוה מאוד'}</span>
            </div>
          </div>
        );
      }

      case 'date':
        return (
          <div className="w-full max-w-md">
            <input
              type="date"
              autoFocus
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-5 py-4 text-lg bg-white/80 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none text-slate-800 dark:text-white shadow-sm"
            />
          </div>
        );

      case 'time':
        return (
          <div className="w-full max-w-md">
            <input
              type="time"
              autoFocus
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-5 py-4 text-lg bg-white/80 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none text-slate-800 dark:text-white shadow-sm"
            />
          </div>
        );

      case 'file_upload':
        return (
          <div className="w-full max-w-xl">
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-2xl cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-amber-500/5 transition-all">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(file.name);
                  }
                }}
              />
              {value ? (
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-8 h-8" />
                  <span className="font-semibold">{value}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Upload className="w-8 h-8 text-amber-500" />
                  <span className="text-sm font-medium">
                    לחץ לבחירת קובץ או גרור לכאן
                  </span>
                  <span className="text-xs text-slate-400">
                    PDF, תמונה או מסמך (עד 10MB)
                  </span>
                </div>
              )}
            </label>
          </div>
        );

      default:
        return (
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              autoFocus
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={step.placeholder || 'הקלד כאן...'}
              className="w-full px-5 py-4 text-lg bg-white/80 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 outline-none text-slate-800 dark:text-white"
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-center space-y-6 animate-fadeIn">
      {/* Step Icon & Title Header */}
      <div className="flex flex-col items-center space-y-3 max-w-2xl px-4">
        <LuxuryIconRenderer
          iconName={step.iconName}
          withContainer
          className="w-8 h-8 text-amber-600 dark:text-amber-400"
        />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
          {step.title}
          {step.required && (
            <span className="text-amber-500 mr-1.5 text-xl" title="שדה חובה">*</span>
          )}
        </h2>
        {step.subtitle && (
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
            {step.subtitle}
          </p>
        )}
      </div>

      {/* Field Input */}
      <div className="w-full flex justify-center px-4">
        {renderFieldInput()}
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-4 py-2 rounded-xl animate-shake">
          {validationError}
        </div>
      )}

      {/* Helper text */}
      {step.helperText && !validationError && (
        <p className="text-xs text-slate-400 max-w-md">
          {step.helperText}
        </p>
      )}
    </div>
  );
};
