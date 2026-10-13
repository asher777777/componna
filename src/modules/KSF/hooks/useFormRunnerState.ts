import { useState, useEffect, useRef, useCallback } from 'react';
import { Firestore } from 'firebase/firestore';
import { SmartFormDefinition, FormStep } from '../types';
import { submitFormResponse } from '../services/submissionStorageService';
import { trackFormView, trackFormStart } from '../services/formStorageService';
import { DEFAULT_FORMS_COLLECTION } from '../config/constants';

export interface UseFormRunnerOptions {
  form: SmartFormDefinition;
  customFirestore?: Firestore;
  collectionName?: string;
  onComplete?: (answers: Record<string, any>, submissionId: string) => void;
  previewMode?: boolean;
}

export function useFormRunnerState({
  form,
  customFirestore,
  collectionName = DEFAULT_FORMS_COLLECTION,
  onComplete,
  previewMode = false,
}: UseFormRunnerOptions) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const startTimeRef = useRef<number>(Date.now());
  const hasStartedRef = useRef<boolean>(false);

  // Track initial view
  useEffect(() => {
    if (!previewMode && form?.id) {
      trackFormView(form.id, customFirestore, collectionName);
    }
  }, [form?.id, previewMode, customFirestore, collectionName]);

  const steps = form.steps || [];
  const currentStep: FormStep | undefined = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progressPercent = steps.length > 0 ? Math.round(((currentStepIndex + 1) / steps.length) * 100) : 0;

  const getStepKey = useCallback(
    (step: FormStep) => step.mappingKey || step.id,
    []
  );

  const currentAnswer = currentStep ? answers[getStepKey(currentStep)] : undefined;

  const setStepAnswer = useCallback(
    (value: any) => {
      if (!currentStep) return;
      const key = getStepKey(currentStep);
      setAnswers((prev) => ({ ...prev, [key]: value }));
      setValidationError(null);

      // Track start on first answer input
      if (!hasStartedRef.current && !previewMode && form?.id) {
        hasStartedRef.current = true;
        trackFormStart(form.id, customFirestore, collectionName);
      }
    },
    [currentStep, getStepKey, previewMode, form?.id, customFirestore, collectionName]
  );

  // Step Validation logic
  const validateCurrentStep = useCallback((): boolean => {
    if (!currentStep) return true;
    const key = getStepKey(currentStep);
    const value = answers[key];

    if (currentStep.required) {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        setValidationError('שדה זה הינו שדה חובה');
        return false;
      }
    }

    if (value && typeof value === 'string') {
      if (currentStep.fieldType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          setValidationError('נא להזין כתובת דוא"ל תקינה');
          return false;
        }
      } else if (currentStep.fieldType === 'phone') {
        const phoneClean = value.replace(/[\s-]/g, '');
        if (phoneClean.length < 8) {
          setValidationError('נא להזין מספר טלפון תקין');
          return false;
        }
      }
    }

    setValidationError(null);
    return true;
  }, [currentStep, getStepKey, answers]);

  // Go to Next Step or Submit
  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) return;

    if (isLastStep) {
      // Final Submit to Firestore
      setIsSubmitting(true);
      try {
        const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);
        const res = await submitFormResponse(
          form,
          answers,
          completionTime,
          customFirestore,
          collectionName
        );
        setSubmissionId(res.submissionId);
        setIsCompleted(true);
        if (onComplete) onComplete(answers, res.submissionId);
      } catch (err: any) {
        console.error('Error submitting form:', err);
        setValidationError(err.message || 'שגיאה בשליחת הטופס. אנא נסה שוב.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setDirection('next');
      setCurrentStepIndex((prev) => prev + 1);
    }

  }, [
    validateCurrentStep,
    isLastStep,
    previewMode,
    answers,
    onComplete,
    form,
    customFirestore,
    collectionName,
  ]);

  // Go to Previous Step
  const handlePrev = useCallback(() => {
    if (isFirstStep) return;
    setValidationError(null);
    setDirection('prev');
    setCurrentStepIndex((prev) => prev - 1);
  }, [isFirstStep]);

  // Keyboard shortcut listener (Enter for next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || isSubmitting) return;

      // Don't auto-advance on Enter if inside textarea or if shift is pressed
      if (e.key === 'Enter' && !e.shiftKey && currentStep?.fieldType !== 'textarea') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.tagName === 'DIV') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, isSubmitting, currentStep?.fieldType, handleNext]);

  // Reset form to start a new submission
  const resetForm = useCallback(() => {
    setCurrentStepIndex(0);
    setAnswers({});
    setValidationError(null);
    setIsCompleted(false);
    setSubmissionId(null);
    hasStartedRef.current = false;
    startTimeRef.current = Date.now();
  }, []);

  return {
    currentStepIndex,
    currentStep,
    stepsCount: steps.length,
    isFirstStep,
    isLastStep,
    progressPercent,
    answers,
    currentAnswer,
    validationError,
    isSubmitting,
    isCompleted,
    submissionId,
    direction,
    setStepAnswer,
    handleNext,
    handlePrev,
    setCurrentStepIndex,
    resetForm,
  };
}

