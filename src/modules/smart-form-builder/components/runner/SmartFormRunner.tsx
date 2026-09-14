import React, { useState, useEffect } from 'react';
import { Firestore } from 'firebase/firestore';
import { SmartFormDefinition } from '../../types';
import { getSmartFormById } from '../../services/formStorageService';
import { useFormRunnerState } from '../../hooks/useFormRunnerState';
import { StepRenderer } from './StepRenderer';
import { ProgressBar } from './ProgressBar';
import { FormCompletionScreen } from './FormCompletionScreen';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { DEFAULT_FORMS_COLLECTION } from '../../config/constants';

export interface SmartFormRunnerProps {
  formId?: string;
  form?: SmartFormDefinition;
  customFirestore?: Firestore;
  collectionName?: string;
  onComplete?: (answers: Record<string, any>, submissionId: string) => void;
  previewMode?: boolean;
  className?: string;
}

export const SmartFormRunner: React.FC<SmartFormRunnerProps> = ({
  formId,
  form: propForm,
  customFirestore,
  collectionName = DEFAULT_FORMS_COLLECTION,
  onComplete,
  previewMode = false,
  className = '',
}) => {
  const [loadedForm, setLoadedForm] = useState<SmartFormDefinition | null>(propForm || null);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(!propForm && !!formId);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (propForm) {
      setLoadedForm(propForm);
      return;
    }

    if (formId) {
      setIsLoadingForm(true);
      getSmartFormById(formId, customFirestore, collectionName)
        .then((f) => {
          if (f) {
            setLoadedForm(f);
          } else {
            setLoadError('הטופס המבוקש לא נמצא');
          }
        })
        .catch((e) => setLoadError(e.message || 'שגיאה בטעינת הטופס'))
        .finally(() => setIsLoadingForm(false));
    }
  }, [formId, propForm, customFirestore, collectionName]);

  if (isLoadingForm) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-slate-500 gap-3 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-sm font-medium">טוען טופס...</span>
      </div>
    );
  }

  if (loadError || !loadedForm) {
    return (
      <div
        dir="rtl"
        className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-2xl border border-rose-200 dark:border-rose-900 max-w-md">
          <p className="font-bold">{loadError || 'טופס לא נמצא'}</p>
        </div>
      </div>
    );
  }

  return (
    <SmartFormRunnerInner
      form={loadedForm}
      customFirestore={customFirestore}
      collectionName={collectionName}
      onComplete={onComplete}
      previewMode={previewMode}
      className={className}
    />
  );
};

interface InnerProps {
  form: SmartFormDefinition;
  customFirestore?: Firestore;
  collectionName?: string;
  onComplete?: (answers: Record<string, any>, submissionId: string) => void;
  previewMode?: boolean;
  className?: string;
}

const SmartFormRunnerInner: React.FC<InnerProps> = ({
  form,
  customFirestore,
  collectionName,
  onComplete,
  previewMode,
  className,
}) => {
  const {
    currentStepIndex,
    currentStep,
    stepsCount,
    isFirstStep,
    isLastStep,
    progressPercent,
    currentAnswer,
    validationError,
    isSubmitting,
    isCompleted,
    submissionId,
    setStepAnswer,
    handleNext,
    handlePrev,
    setCurrentStepIndex,
  } = useFormRunnerState({
    form,
    customFirestore,
    collectionName,
    onComplete,
    previewMode,
  });

  const theme = form.theme;
  const primaryColor = theme?.primaryColor || '#0F172A';
  const accentColor = theme?.accentColor || '#D97706';

  if (isCompleted) {
    return (
      <div
        className={`w-full rounded-3xl overflow-hidden shadow-2xl transition-all ${className}`}
        style={{
          backgroundColor: theme?.cardBackground || '#FFFFFF',
          color: theme?.textColor || '#0F172A',
        }}
      >
        <FormCompletionScreen
          completion={form.completion}
          theme={theme}
          submissionId={submissionId}
          onReset={previewMode ? () => setCurrentStepIndex(0) : undefined}
        />
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div dir="rtl" className="p-8 text-center text-slate-500">
        טופס זה עדיין אינו מכיל שאלות.
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={`w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 transition-all flex flex-col min-h-[520px] ${className}`}
      style={{
        backgroundColor: theme?.cardBackground || '#FFFFFF',
        color: theme?.textColor || '#0F172A',
      }}
    >
      {/* Top Bar: Progress & Form Title */}
      <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800/60 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-wide text-slate-800 dark:text-white">
              {form.title}
            </span>
            {previewMode && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">
                תצוגה מקדימה
              </span>
            )}
          </div>
        </div>

        {theme?.showProgressBar !== false && (
          <ProgressBar
            currentStepIndex={currentStepIndex}
            totalSteps={stepsCount}
            progressPercent={progressPercent}
            accentColor={accentColor}
            showStepNumbers={theme?.showStepNumbers !== false}
          />
        )}
      </div>

      {/* Main Body (One field per step) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 my-auto">
        <StepRenderer
          key={currentStep.id}
          step={currentStep}
          value={currentAnswer}
          onChange={setStepAnswer}
          onEnter={handleNext}
          theme={theme}
          validationError={validationError}
        />
      </div>

      {/* Bottom Footer Navigation */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4">
        {/* Previous Button */}
        <div>
          {!isFirstStep && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>הקודם</span>
            </button>
          )}
        </div>

        {/* Next / Submit Button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            לחץ <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">Enter ↵</kbd>
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-7 py-3 rounded-2xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 text-sm sm:text-base disabled:opacity-50"
            style={{
              backgroundColor: accentColor,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>שולח...</span>
              </>
            ) : isLastStep ? (
              <>
                <span>שליחת הטופס</span>
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>הבא</span>
                <ArrowLeft className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
