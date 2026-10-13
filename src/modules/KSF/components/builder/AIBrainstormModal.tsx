import React, { useState } from 'react';
import { ToneStyle, SmartFormDefinition } from '../../types';
import { TONE_PRESETS } from '../../config/tonePresets';
import {
  generateSmartFormWithAI,
  CRM_COLLECTION_FIELDS,
} from '../../services/aiFormService';
import { KOSUN_CRM_FIELD_KEYS } from '../../../../core/contracts/collections';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { KosunInputWithVoice } from '../../../../core/ui/KosunInputWithVoice';
import {
  Sparkles,
  X,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Check,
  HelpCircle,
} from 'lucide-react';

export interface AIBrainstormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormGenerated: (form: SmartFormDefinition) => void;
}

export const AIBrainstormModal: React.FC<AIBrainstormModalProps> = ({
  isOpen,
  onClose,
  onFormGenerated,
}) => {
  // Wizard state: strictly 1 question per step
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalWizardSteps = 5;

  // Active tooltip hover state
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Form parameters
  const [goal, setGoal] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<ToneStyle>('executive_luxury');
  const [selectedCrmFields, setSelectedCrmFields] = useState<string[]>([
    KOSUN_CRM_FIELD_KEYS.NAME,
    KOSUN_CRM_FIELD_KEYS.PHONE,
    KOSUN_CRM_FIELD_KEYS.EMAIL,
    KOSUN_CRM_FIELD_KEYS.NOTES,
  ]);
  const [customToneInstructions, setCustomToneInstructions] = useState<string>('');

  // Generation & Results
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<{
    form: Partial<SmartFormDefinition>;
    explanation: string;
    suggestedNextSteps: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCrmField = (fieldId: string) => {
    setSelectedCrmFields((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && !goal.trim()) {
      setError('נא להזין את מטרת השאלון כדי להמשיך');
      return;
    }
    setError(null);
    if (currentStep < totalWizardSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError('נא להזין את מטרת השאלון');
      setCurrentStep(1);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateSmartFormWithAI({
        goal,
        targetAudience,
        tone: selectedTone,
        crmSyncFields: selectedCrmFields,
        customToneInstructions,
      });

      setGeneratedResult(result);
    } catch (e: any) {
      setError(e.message || 'שגיאה ביצירת השאלון');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyForm = () => {
    if (!generatedResult?.form) return;

    const fullForm: SmartFormDefinition = {
      id: `form_${Date.now()}`,
      title: generatedResult.form.title || goal,
      slug: (generatedResult.form.title || 'form')
        .toLowerCase()
        .replace(/[^\w\u0590-\u05FF]+/g, '-')
        .slice(0, 40),
      description: generatedResult.form.description || '',
      category: generatedResult.form.category || 'עסקים',
      tone: selectedTone,
      toneDescription: TONE_PRESETS.find((t) => t.id === selectedTone)?.description || '',
      steps: generatedResult.form.steps || [],
      theme: generatedResult.form.theme as any,
      completion: generatedResult.form.completion as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      viewsCount: 0,
      startsCount: 0,
      submissionsCount: 0,
      isCrmSyncEnabled: true,
      crmDefaultTags: ['KSF', goal],
    };

    onFormGenerated(fullForm);
    onClose();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] w-screen h-screen m-0 p-0 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden animate-fadeIn select-none"
    >
      {/* 100% Fullscreen Top Bar - MINIMALIST: ONLY [K] ComponentName in English, no long headers or badges! */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
            K
          </div>
          <span className="font-black text-sm text-slate-900 dark:text-white tracking-wider">
            KSF
          </span>
        </div>

        {/* Center: Step indicators if not in review screen */}
        {!generatedResult && (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? 'w-8 bg-slate-900 dark:bg-white'
                    : currentStep > step
                    ? 'w-3 bg-emerald-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-slate-400 mr-2">
              {currentStep}/{totalWizardSteps}
            </span>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="סגור"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body - ABSOLUTE CENTER ALIGNMENT: Content centered horizontally & vertically */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center">
          {!generatedResult ? (
            <div className="w-full space-y-6">
              {/* STEP 1: Goal (Single Question, Centered) */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span>שאלה 1 מתוך 5</span>
                      <div
                        className="relative cursor-pointer"
                        onMouseEnter={() => setActiveTooltip('step1')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                        {activeTooltip === 'step1' && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-slate-900 text-white text-[11px] font-normal shadow-xl z-50 pointer-events-none">
                            הגדרת המטרה מאפשרת למערכת לבנות שאלות רלוונטיות וממוקדות.
                          </div>
                        )}
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      מהי מטרת השאלון?
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      רשום בקצרה או הקרא בקולך, והמערכת תתאים את השאלות.
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <KosunInputWithVoice
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="לדוגמה: שאלון אבחון והתאמה לתוכנית ליווי עסקי..."
                      className="text-base p-4 text-center"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Target Audience (Single Question, Centered) */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span>שאלה 2 מתוך 5</span>
                      <div
                        className="relative cursor-pointer"
                        onMouseEnter={() => setActiveTooltip('step2')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                        {activeTooltip === 'step2' && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-slate-900 text-white text-[11px] font-normal shadow-xl z-50 pointer-events-none">
                            התאמת השפה והניסוח למי שממלא את הטופס.
                          </div>
                        )}
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      למי מיועד השאלון?
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      הגדרת קהל הממלאים (לדוגמה: לקוחות קיימים, מתעניינים חדשים).
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <KosunInputWithVoice
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="לדוגמה: בעלי עסקים בצמיחה, לקוחות פרימיום..."
                      className="text-base p-4 text-center"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Tone Preset (Single Question, Row Under Row) */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span>שאלה 3 מתוך 5</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      איזה סגנון שיחה מתאים לשאלון?
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      בחר את הטון שמתאים לאופי הפעילות שלך.
                    </p>
                  </div>

                  {/* Strictly stacked row-under-row */}
                  <div className="flex flex-col space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 text-right">
                    {TONE_PRESETS.map((preset) => {
                      const isSelected = selectedTone === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedTone(preset.id)}
                          className={`w-full p-3.5 rounded-2xl border-2 text-right transition-all flex items-center justify-between gap-4 cursor-pointer ${
                            isSelected
                              ? 'border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/10 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`p-2 rounded-xl shrink-0 ${
                                isSelected
                                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <LuxuryIconRenderer
                                iconName={preset.defaultIcon}
                                className="w-4 h-4"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                                {preset.label}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">
                                {preset.description}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Contact details to collect (Human Language, Tooltips only!) */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span>שאלה 4 מתוך 5</span>
                      <div
                        className="relative cursor-pointer"
                        onMouseEnter={() => setActiveTooltip('step4')}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                        {activeTooltip === 'step4' && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 rounded-lg bg-slate-900 text-white text-[11px] font-normal shadow-xl z-50 pointer-events-none">
                            כל פרט שנבחר יישמר אוטומטית בכרטיס הלקוח לשירות מהיר והמשך טיפול.
                          </div>
                        )}
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      אילו פרטים תרצה שהממלא ישאיר?
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      הפרטים שנבחרו יישמרו ישירות בתיק הלקוח.
                    </p>
                  </div>

                  {/* Strictly stacked row-under-row - Pure Human Labels */}
                  <div className="flex flex-col space-y-2 max-h-[50vh] overflow-y-auto pr-1 text-right">
                    {CRM_COLLECTION_FIELDS.map((field) => {
                      const isChecked = selectedCrmFields.includes(field.id);
                      return (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => toggleCrmField(field.id)}
                          className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isChecked
                              ? 'border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/10'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                              <LuxuryIconRenderer
                                iconName={field.iconName}
                                className="w-4 h-4 text-slate-700 dark:text-slate-200"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                                {field.label}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                : 'border-slate-300 dark:border-slate-700 bg-transparent'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: Special Notes (Single Question, Centered) */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span>שאלה 5 מתוך 5</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      דגשים או בקשות מיוחדות לסיום?
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      אופציונלי: שאלת דירוג, אורך שאלון או בקשה מיוחדת.
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <KosunInputWithVoice
                      value={customToneInstructions}
                      onChange={(e) => setCustomToneInstructions(e.target.value)}
                      placeholder="לדוגמה: לכלול שאלת דירוג דחיפות בסיום, לשמור על ניסוח קצר..."
                      className="text-base p-4 text-center"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-bold text-center">
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* Result Preview Screen - Centered & Clean */
            <div className="w-full space-y-6 animate-fadeIn text-right">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-start gap-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-base">
                    השאלון מוכן בהצלחה!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                    {generatedResult.explanation}
                  </p>
                </div>
              </div>

              {/* Form Metadata */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 text-center">
                <h4 className="font-black text-slate-900 dark:text-white text-lg">
                  {generatedResult.form.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {generatedResult.form.steps?.length || 0} שלבים (שאלה אחת בכל שלב)
                </p>
              </div>

              {/* Steps List - Clean without technical jargon */}
              <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto pr-1">
                {(generatedResult.form.steps || []).map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <LuxuryIconRenderer
                        iconName={step.iconName}
                        className="w-4 h-4 text-slate-700 dark:text-slate-200 shrink-0"
                      />
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {step.title}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] shrink-0 font-medium">
                      שלב {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 100% Fullscreen Footer Controls - Generous spacing to avoid overlapping with floating elements */}
      <div className="h-20 px-8 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between shrink-0">
        {!generatedResult ? (
          <>
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>הקודם</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  ביטול
                </button>
              )}
            </div>

            <div>
              {currentStep < totalWizardSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md hover:opacity-90 flex items-center gap-2 transition cursor-pointer"
                >
                  <span>הבא</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !goal.trim()}
                  className="px-7 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black rounded-xl text-xs shadow-md hover:opacity-90 flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>יוצר את השאלון...</span>
                    </>
                  ) : (
                    <>
                      <span>צור שאלון</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setGeneratedResult(null)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              חזרה לעריכה
            </button>
            <button
              type="button"
              onClick={handleApplyForm}
              className="px-8 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-extrabold rounded-xl text-xs shadow-md hover:opacity-90 flex items-center gap-2 transition cursor-pointer"
            >
              <span>מעבר לעורך הטופס</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
