import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export interface KosunWizardQuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface KosunWizardStep {
  id: string;
  question: string;
  subtitle?: string;
  /** Custom render for this step (e.g. text input, custom selection) */
  render?: (helpers: {
    value: any;
    setValue: (val: any) => void;
    nextStep: () => void;
  }) => React.ReactNode;
  /** If predefined options are used, they will be stacked row-under-row */
  options?: KosunWizardQuestionOption[];
}

export interface KosunStepWizardProps {
  steps: KosunWizardStep[];
  onComplete: (answers: Record<string, any>) => void;
  initialAnswers?: Record<string, any>;
  className?: string;
}

/**
 * KosunStepWizard: Enforces strict KOSUN rules:
 * 1. Single Question Per Step
 * 2. Selection options stacked strictly row-under-row
 */
export const KosunStepWizard: React.FC<KosunStepWizardProps> = ({
  steps,
  onComplete,
  initialAnswers = {},
  className = '',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);

  if (!steps || steps.length === 0) {
    return null;
  }

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(answers);
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.id]: optionId,
    }));
  };

  const currentAnswer = answers[currentStep.id];

  return (
    <div
      className={`glass-card max-w-2xl w-full mx-auto p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 ${className}`}
      dir="rtl"
    >
      {/* 1. סרגל התקדמות ומחוון שלב */}
      <div className="space-y-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400">
          <span className="text-blue-600 dark:text-blue-400 font-mono">
            שלב {currentStepIndex + 1} מתוך {totalSteps}
          </span>
          <span className="text-[11px] font-bold opacity-75">שאלה אחת בלבד בכל שלב</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* 2. כותרת השאלה הבודדת */}
      <div className="space-y-1.5">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
          {currentStep.question}
        </h3>
        {currentStep.subtitle && (
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {currentStep.subtitle}
          </p>
        )}
      </div>

      {/* 3. תוכן השלב */}
      <div className="pt-2">
        {currentStep.render ? (
          currentStep.render({
            value: currentAnswer,
            setValue: (val: any) =>
              setAnswers((prev) => ({ ...prev, [currentStep.id]: val })),
            nextStep: handleNext,
          })
        ) : currentStep.options ? (
          /* חוק קושאן: תיבות בחירה מסוגננות מופיעות תמיד שורה מתחת לשורה */
          <div className="flex flex-col space-y-2.5">
            {currentStep.options.map((opt) => {
              const isSelected = currentAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-right transition flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {opt.icon && <div className="shrink-0">{opt.icon}</div>}
                    <div>
                      <div className="font-bold text-sm">{opt.label}</div>
                      {opt.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* 4. לחצני ניווט */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirstStep}
          className={`px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black transition flex items-center gap-1.5 ${
            isFirstStep
              ? 'opacity-40 cursor-not-allowed text-slate-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>חזור</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
        >
          <span>{isLastStep ? 'סיים ושמור' : 'המשך'}</span>
          {isLastStep ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <ArrowLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default KosunStepWizard;
