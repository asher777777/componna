import React, { useState, useEffect } from 'react';
import { Firestore } from 'firebase/firestore';
import { SmartFormDefinition, FormThemeSettings } from '../../types';
import { getSmartFormById } from '../../services/formStorageService';
import { useFormRunnerState } from '../../hooks/useFormRunnerState';
import { StepRenderer } from './StepRenderer';
import { ProgressBar } from './ProgressBar';
import { FormCompletionScreen } from './FormCompletionScreen';
import { resolveKoswebFormStyle } from '../../config/koswebStylePresets';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { DEFAULT_FORMS_COLLECTION } from '../../config/constants';
import { SMART_FORM_TEMPLATES } from '../../config/formTemplates';
import { useTenantScope } from '../../../../core/tenant';

export interface SmartFormRunnerProps {
  formId?: string;
  form?: SmartFormDefinition;
  customFirestore?: Firestore;
  collectionName?: string;
  onComplete?: (answers: Record<string, any>, submissionId: string) => void;
  previewMode?: boolean;
  className?: string;
  submitButtonText?: string;
  submitButtonBgColor?: string;
  submitButtonTextColor?: string;
  submitButtonSize?: 'compact' | 'normal' | 'spacious' | 'fullWidth';
  submitButtonFontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  submitButtonShape?: 'rounded' | 'capsule' | 'square';
  themeOverride?: Partial<FormThemeSettings>;
}

export const SmartFormRunner: React.FC<SmartFormRunnerProps> = ({
  formId,
  form: propForm,
  customFirestore,
  collectionName,
  onComplete,
  previewMode = false,
  className = '',
  submitButtonText,
  submitButtonBgColor,
  submitButtonTextColor,
  submitButtonSize,
  submitButtonFontSize,
  submitButtonShape,
  themeOverride,
}) => {
  const { tenantId, getScopedCollectionPath } = useTenantScope();
  const effectiveCollectionName =
    collectionName && collectionName !== DEFAULT_FORMS_COLLECTION
      ? collectionName
      : getScopedCollectionPath(DEFAULT_FORMS_COLLECTION);

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
      getSmartFormById(formId, customFirestore, effectiveCollectionName)
        .then((f) => {
          if (f) {
            setLoadedForm(f);
          } else {
            const fallbackTpl = SMART_FORM_TEMPLATES.find((t) => t.id === formId) || SMART_FORM_TEMPLATES[0];
            setLoadedForm(fallbackTpl || null);
          }
        })
        .catch(() => {
          const fallbackTpl = SMART_FORM_TEMPLATES[0];
          setLoadedForm(fallbackTpl || null);
        })
        .finally(() => setIsLoadingForm(false));
    } else {
      setLoadedForm(SMART_FORM_TEMPLATES[0] || null);
    }
  }, [formId, propForm, customFirestore, effectiveCollectionName, tenantId]);

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
      collectionName={effectiveCollectionName}
      onComplete={onComplete}
      previewMode={previewMode}
      className={className}
      submitButtonText={submitButtonText}
      submitButtonBgColor={submitButtonBgColor}
      submitButtonTextColor={submitButtonTextColor}
      submitButtonSize={submitButtonSize}
      submitButtonFontSize={submitButtonFontSize}
      submitButtonShape={submitButtonShape}
      themeOverride={themeOverride}
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
  submitButtonText?: string;
  submitButtonBgColor?: string;
  submitButtonTextColor?: string;
  submitButtonSize?: 'compact' | 'normal' | 'spacious' | 'fullWidth';
  submitButtonFontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  submitButtonShape?: 'rounded' | 'capsule' | 'square';
  themeOverride?: Partial<FormThemeSettings>;
}

const SmartFormRunnerInner: React.FC<InnerProps> = ({
  form,
  customFirestore,
  collectionName,
  onComplete,
  previewMode,
  className,
  submitButtonText,
  submitButtonBgColor,
  submitButtonTextColor,
  submitButtonSize,
  submitButtonFontSize,
  submitButtonShape,
  themeOverride,
}) => {
  const {
    currentStepIndex,
    currentStep,
    stepsCount,
    isFirstStep,
    isLastStep,
    progressPercent,
    answers,
    currentAnswer,
    validationError,
    isSubmitting,
    isCompleted,
    submissionId,
    ticketOrderCode,
    ticketCodes,
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

  const theme = { ...(form.theme || {}), ...(themeOverride || {}) } as any;
  const styleTokens = resolveKoswebFormStyle(theme?.stylePreset);
  const accentColor = theme?.accentColor || styleTokens.themeDefaults.accentColor || '#D97706';
  const hasBgImage = theme?.backgroundType === 'image' && !!theme?.backgroundImageUrl;
  const overlayOpacity = (theme?.backgroundOverlayOpacity ?? 50) / 100;

  // Aspect ratio class helper (avoid fixed height/aspect clipping on payment steps)
  const getAspectRatioClasses = () => {
    if (currentStep?.fieldType === 'payment') {
      return 'w-full max-w-2xl min-h-[520px]';
    }
    switch (theme?.aspectRatio) {
      case '16:9':
        return 'aspect-video max-w-4xl min-h-[520px]';
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
    if (theme?.stylePreset === 'sharp' && (!theme?.containerShape || theme.containerShape === 'square')) {
      return 'rounded-none';
    }
    switch (theme?.containerShape) {
      case 'square':
        return 'rounded-none';
      case 'circle':
        return 'rounded-full aspect-square flex flex-col justify-center';
      case 'pill':
        return 'rounded-[44px]';
      default:
        return theme?.stylePreset === 'feminine' ? 'rounded-[2.5rem]' : 'rounded-3xl';
    }
  };

  const isSingleFieldFocus = theme?.displayMode === 'single_field_focus';

  if (isCompleted) {
    return (
      <div
        className={`relative overflow-hidden transition-all mx-auto ${styleTokens.runnerContainerClass} ${getShapeClasses()} ${getAspectRatioClasses()} ${className}`}
        style={{
          backgroundColor: theme?.cardBackground || styleTokens.themeDefaults.cardBackground || undefined,
          color: theme?.textColor || styleTokens.themeDefaults.textColor || undefined,
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
            ticketOrderCode={ticketOrderCode}
            ticketCodes={ticketCodes}
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

  const cardBg = theme?.cardBackground || styleTokens.themeDefaults.cardBackground;
  const isDarkBg =
    hasBgImage ||
    styleTokens.isDarkDefault ||
    (!!cardBg && (cardBg.startsWith('#0') || cardBg.startsWith('#1') || cardBg.startsWith('#2'))) ||
    theme?.textColor?.toLowerCase() === '#ffffff';

  return (
    <div
      dir="rtl"
      className={`${isDarkBg ? 'dark text-white' : 'text-slate-900'} relative overflow-y-auto transition-all flex flex-col justify-between mx-auto ${styleTokens.runnerContainerClass} ${getShapeClasses()} ${getAspectRatioClasses()} ${className}`}
      style={{
        backgroundColor: hasBgImage ? '#0F172A' : (cardBg || undefined),
        color: hasBgImage ? '#FFFFFF' : (theme?.textColor || styleTokens.themeDefaults.textColor || undefined),
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
        <div className={`p-6 pb-2 flex flex-col gap-4 ${styleTokens.headerClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide drop-shadow-sm">
                {form.title}
              </span>
              {previewMode && (
                <span className={`px-2.5 py-0.5 text-[10px] ${styleTokens.badgeClass}`}>
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
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-5'
                        : idx < currentStepIndex
                        ? 'w-2 bg-emerald-400'
                        : 'w-2 bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={idx === currentStepIndex ? { backgroundColor: accentColor } : undefined}
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
              stylePreset={theme?.stylePreset}
            />
          )}
        </div>

        {/* Main Body (One field per step) */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 my-auto">
          <StepRenderer
            key={currentStep.id}
            step={currentStep}
            form={form}
            value={currentAnswer}
            onChange={setStepAnswer}
            onEnter={handleNext}
            theme={theme}
            validationError={validationError}
            allAnswers={answers}
          />
        </div>

        {/* Bottom Footer Navigation */}
        <div className={`p-6 flex items-center justify-between gap-4 ${styleTokens.footerClass}`}>
          {/* Previous Button */}
          <div>
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-sm transition-all flex items-center gap-2 cursor-pointer ${styleTokens.secondaryButtonClass}`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>הקודם</span>
              </button>
            )}
          </div>

          {/* Next / Submit Button */}
          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-block text-[11px] opacity-70 ${styleTokens.helperTextClass}`}>
              לחץ <kbd className="px-1.5 py-0.5 bg-black/15 dark:bg-black/30 rounded font-mono text-[10px]">Enter ↵</kbd>
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${styleTokens.primaryButtonClass} ${
                submitButtonShape === 'capsule'
                  ? '!rounded-full'
                  : submitButtonShape === 'square'
                  ? '!rounded-none'
                  : submitButtonShape === 'rounded'
                  ? '!rounded-2xl'
                  : ''
              } ${
                submitButtonSize === 'compact'
                  ? 'px-4 py-2'
                  : submitButtonSize === 'spacious'
                  ? 'px-9 py-4'
                  : submitButtonSize === 'fullWidth'
                  ? 'w-full py-3.5 px-6'
                  : 'px-7 py-3'
              } ${
                submitButtonFontSize === 'xs'
                  ? 'text-xs'
                  : submitButtonFontSize === 'sm'
                  ? 'text-sm'
                  : submitButtonFontSize === 'lg'
                  ? 'text-lg'
                  : submitButtonFontSize === 'xl'
                  ? 'text-xl'
                  : 'text-sm sm:text-base'
              }`}
              style={{
                backgroundColor: submitButtonBgColor || (theme?.buttonStyle === 'solid' ? accentColor : undefined),
                color: submitButtonTextColor || undefined,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>שולח...</span>
                </>
              ) : isLastStep ? (
                <>
                  <span>{submitButtonText || 'שליחת הטופס'}</span>
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
