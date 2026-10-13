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
    resetForm,
  } = useFormRunnerState({
    form,
    customFirestore,
    collectionName,
    onComplete,
    previewMode,
  });

  const theme = form.theme || ({} as any);
  const accentColor = theme?.accentColor || '#D97706';
  const hasBgImage = theme?.backgroundType === 'image' && !!theme?.backgroundImageUrl;
  const overlayOpacity = (theme?.backgroundOverlayOpacity ?? 50) / 100;

  // Aspect ratio class helper
  const getAspectRatioClasses = () => {
    switch (theme?.aspectRatio) {
      case '16:9':
        return 'aspect-video max-w-4xl max-h-[620px]';
      case '9:16':
        return 'aspect-[9/16] max-w-sm min-h-[640px]';
      case '1:1':
        return 'aspect-square max-w-xl';
      default:
        return 'w-full max-w-2xl min-h-[520px]';
    }
  };

  // Shape class helper
  const getShapeClasses = () => {
    switch (theme?.containerShape) {
      case 'square':
        return 'rounded-none';
      case 'circle':
        return 'rounded-full aspect-square flex flex-col justify-center';
      case 'pill':
        return 'rounded-[44px]';
      default:
        return 'rounded-3xl';
    }
  };

  const isSingleFieldFocus = theme?.displayMode === 'single_field_focus';

  if (isCompleted) {
    return (
      <div
        className={`relative overflow-hidden shadow-2xl transition-all mx-auto ${getShapeClasses()} ${getAspectRatioClasses()} ${className}`}
        style={{
          backgroundColor: theme?.cardBackground || '#FFFFFF',
          color: theme?.textColor || '#0F172A',
        }}
      >
        {hasBgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${theme.backgroundImageUrl})` }}
          >
            <div
              className="absolute inset-0 bg-slate-950"
              style={{ opacity: overlayOpacity }}
            />
          </div>
        )}
        <div className="relative z-10 h-full flex flex-col justify-center">
          <FormCompletionScreen
            completion={form.completion}
            theme={theme}
            submissionId={submissionId}
            onReset={resetForm}
          />
        </div>
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

  const isDarkBg = !theme?.cardBackground || theme?.cardBackground?.startsWith('#0') || theme?.cardBackground?.startsWith('#1') || theme?.cardBackground?.startsWith('#2') || theme?.textColor === '#ffffff';

  return (
    <div
      dir="rtl"
      className={`${isDarkBg ? 'dark text-white' : 'text-slate-900'} relative overflow-hidden shadow-2xl border border-slate-800/80 transition-all flex flex-col justify-between mx-auto ${getShapeClasses()} ${getAspectRatioClasses()} ${className}`}
      style={{
        backgroundColor: hasBgImage ? '#0F172A' : (theme?.cardBackground || (isDarkBg ? '#09090b' : '#FFFFFF')),
        color: hasBgImage ? '#FFFFFF' : (theme?.textColor || (isDarkBg ? '#FFFFFF' : '#0F172A')),
      }}
    >
      {/* Background Image & Overlay */}
      {hasBgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${theme.backgroundImageUrl})` }}
        >
          <div
            className="absolute inset-0 bg-slate-950"
            style={{ opacity: overlayOpacity }}
          />
        </div>
      )}

      {/* Content Container (z-10 above background image) */}
      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        {/* Top Header: Progress & Title (hidden in extreme focus if desired) */}
        <div className="p-6 pb-2 border-b border-slate-100/20 dark:border-slate-800/40 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide drop-shadow-sm">
                {form.title}
              </span>
              {previewMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  תצוגה מקדימה
                </span>
              )}
            </div>

            {/* Step Dots in Single Field Focus Mode */}
            {isSingleFieldFocus && (
              <div className="flex items-center gap-1.5">
                {form.steps.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-5 bg-amber-500'
                        : idx < currentStepIndex
                        ? 'bg-emerald-400'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {!isSingleFieldFocus && theme?.showProgressBar !== false && (
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
        <div className="p-6 border-t border-slate-100/20 dark:border-slate-800/40 bg-black/10 backdrop-blur-xs flex items-center justify-between gap-4">
          {/* Previous Button */}
          <div>
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>הקודם</span>
              </button>
            )}
          </div>

          {/* Next / Submit Button */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] opacity-70">
              לחץ <kbd className="px-1.5 py-0.5 bg-black/30 rounded font-mono text-[10px]">Enter ↵</kbd>
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
    </div>
  );
};
