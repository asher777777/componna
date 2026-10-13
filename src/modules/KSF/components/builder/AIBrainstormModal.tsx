import React, { useState, useMemo } from 'react';
import { ToneStyle, SmartFormDefinition } from '../../types';
import { TONE_PRESETS } from '../../config/tonePresets';
import {
  generateSmartFormWithAI,
  CRM_COLLECTION_FIELDS,
} from '../../services/aiFormService';
import { KOSUN_CRM_FIELD_KEYS } from '../../../../core/contracts/collections';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, BrandDna } from '../../../../core/contracts';
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
  Wand2,
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

  // Retrieve Brand DNA through host capabilities (Zero Cross-Module Import & AI Monopoly)
  const { getCapability } = useHostCapabilities();
  const brandDnaContract = getCapability<BrandDnaContract>('brand-dna');
  const brandDna: BrandDna | null = useMemo(() => {
    return brandDnaContract ? brandDnaContract.getBrandDna() : null;
  }, [brandDnaContract]);

  // Dynamic Brand Colors
  const primaryColor = brandDna?.designTokens?.primaryColor || '#4f46e5';
  const brandGradient = `linear-gradient(135deg, ${primaryColor}, #6366f1)`;

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

  // Dynamic AI Suggestions derived from Brand DNA collection
  const aiGoalSuggestions = useMemo(() => {
    const list: string[] = [];
    if (brandDna?.audience?.mainUvp) {
      list.push(`שאלון התאמה: ${brandDna.audience.mainUvp}`);
    }
    if (brandDna?.identity?.organizationPurpose) {
      list.push(`שאלון ${brandDna.identity.organizationPurpose}`);
    }
    if (brandDna?.identity?.companyName) {
      list.push(`פנייה וקבלת שירות מ${brandDna.identity.companyName}`);
    }
    if (brandDna?.ecosystem?.services && brandDna.ecosystem.services.length > 0) {
      const srv = brandDna.ecosystem.services[0];
      list.push(`קליטת פניות והרשמה ל${srv}`);
    }
    // High-converting defaults
    if (list.length < 3) {
      list.push('שאלון אבחון והתאמה אישית לתוכנית ליווי');
      list.push('קבלת הצעת מחיר ופרויקט מותאם אישית');
      list.push('בדיקת זכאות והרשמה מהירה');
    }
    return list.slice(0, 4);
  }, [brandDna]);

  const aiAudienceSuggestions = useMemo(() => {
    const list: string[] = [];
    if (brandDna?.audience?.targetAudiences && brandDna.audience.targetAudiences.length > 0) {
      list.push(...brandDna.audience.targetAudiences);
    }
    if (brandDna?.audience?.personas && brandDna.audience.personas.length > 0) {
      list.push(...brandDna.audience.personas.map((p) => p.roleOrProfile || p.name));
    }
    if (list.length < 3) {
      list.push('בעלי עסקים ומנהלים');
      list.push('לקוחות פרימיום VIP');
      list.push('מתעניינים חדשים וקהל יעד כללי');
    }
    return Array.from(new Set(list)).slice(0, 4);
  }, [brandDna]);

  const aiNotesSuggestions = [
    'לכלול שאלת דירוג דחיפות בסיום',
    'לשמור על ניסוח קצר ותמציתי',
    'פנייה אישית וחמה בהתאם למותג',
    'שפה עסקית ורשמית',
  ];

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
      style={{ fontFamily: "'Heebo', sans-serif" }}
      className="fixed inset-0 z-[100] w-screen h-screen m-0 p-0 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden animate-fadeIn select-none font-heebo"
    >
      {/* 100% Fullscreen Top Bar: Blinking [K] on right, close button on left */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
        {/* Right side: Blinking K logo only */}
        <div className="flex items-center">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <img
              src="/images/kosun-symbol.svg"
              alt="K"
              className="w-7 h-7 object-contain drop-shadow animate-pulse"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
              }}
            />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping pointer-events-none" />
          </div>
        </div>

        {/* Center: Step indicators if not in review screen */}
        {!generatedResult && (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                style={currentStep === step ? { background: brandGradient } : undefined}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? 'w-8 shadow-sm'
                    : currentStep > step
                    ? 'w-3 bg-emerald-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-slate-400 mr-2 font-mono">
              {currentStep}/{totalWizardSteps}
            </span>
          </div>
        )}

        {/* Left side: Close Button */}
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
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center">
          {!generatedResult ? (
            <div className="w-full space-y-6">
              {/* STEP 1: Goal */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-1.5 text-center">
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
                      רשום בקצרה, הקרא בקולך, או בחר המלצה חכמה מהמיתוג שלך.
                    </p>
                  </div>

                  {/* AI Brand Suggestion Chips */}
                  {aiGoalSuggestions.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {aiGoalSuggestions.map((suggestion, idx) => {
                        const isMatch = goal === suggestion;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setGoal(suggestion)}
                            style={
                              isMatch
                                ? {
                                    borderColor: primaryColor,
                                    backgroundColor: `${primaryColor}18`,
                                    color: primaryColor,
                                  }
                                : undefined
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                              isMatch
                                ? 'border-indigo-500 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-400/60 hover:text-indigo-600'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[280px]">{suggestion}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Input field with voice dictation */}
                  <div className="w-full space-y-2">
                    <KosunInputWithVoice
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="לדוגמה: שאלון אבחון והתאמה לתוכנית ליווי עסקי..."
                      className="text-base p-4 text-center"
                      autoFocus
                    />
                  </div>

                  {/* ACTION BUTTONS: DIRECTLY UNDERNEATH THE INPUT FIELD */}
                  <div className="pt-2 flex items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={handleNext}
                      style={{
                        background: brandGradient,
                        boxShadow: `0 8px 20px -4px ${primaryColor}40`,
                      }}
                      className="px-8 py-3.5 text-white font-bold rounded-xl text-sm hover:opacity-95 active:scale-95 flex items-center gap-2 transition cursor-pointer"
                    >
                      <span>הבא</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-3.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Target Audience */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-1.5 text-center">
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
                      בחר מקהלי היעד של המותג או הקלד קהל יעד משלך.
                    </p>
                  </div>

                  {/* AI Brand Audience Chips */}
                  {aiAudienceSuggestions.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {aiAudienceSuggestions.map((aud, idx) => {
                        const isMatch = targetAudience === aud;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTargetAudience(aud)}
                            style={
                              isMatch
                                ? {
                                    borderColor: primaryColor,
                                    backgroundColor: `${primaryColor}18`,
                                    color: primaryColor,
                                  }
                                : undefined
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                              isMatch
                                ? 'border-indigo-500 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-400/60 hover:text-indigo-600'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{aud}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Input field with voice dictation */}
                  <div className="w-full space-y-2">
                    <KosunInputWithVoice
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="לדוגמה: בעלי עסקים בצמיחה, לקוחות פרימיום..."
                      className="text-base p-4 text-center"
                      autoFocus
                    />
                  </div>

                  {/* ACTION BUTTONS: DIRECTLY UNDERNEATH */}
                  <div className="pt-2 flex items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={handleNext}
                      style={{
                        background: brandGradient,
                        boxShadow: `0 8px 20px -4px ${primaryColor}40`,
                      }}
                      className="px-8 py-3.5 text-white font-bold rounded-xl text-sm hover:opacity-95 active:scale-95 flex items-center gap-2 transition cursor-pointer"
                    >
                      <span>הבא</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-3.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>הקודם</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Tone Preset (Single Question, Row Under Row) */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-1.5 text-center">
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
                  <div className="flex flex-col space-y-2.5 max-h-[46vh] overflow-y-auto pr-1 text-right">
                    {TONE_PRESETS.map((preset) => {
                      const isSelected = selectedTone === preset.id;
                      const isBrandRecommended =
                        (preset.id === 'executive_luxury' &&
                          ((brandDna?.voice?.personality?.luxury ?? 80) >= 50)) ||
                        (preset.id === 'warm_consulting' &&
                          ((brandDna?.voice?.personality?.warmth ?? 0) > 70));

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedTone(preset.id)}
                          style={
                            isSelected
                              ? {
                                  borderColor: primaryColor,
                                  backgroundColor: `${primaryColor}10`,
                                  boxShadow: `0 4px 15px -2px ${primaryColor}25`,
                                }
                              : undefined
                          }
                          className={`w-full p-3.5 rounded-2xl border-2 text-right transition-all flex items-center justify-between gap-4 cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 shadow-sm ring-1 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400/60 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              style={
                                isSelected
                                  ? { background: brandGradient, color: '#ffffff' }
                                  : undefined
                              }
                              className={`p-2 rounded-xl shrink-0 ${
                                isSelected
                                  ? 'text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <LuxuryIconRenderer
                                iconName={preset.defaultIcon}
                                className="w-4 h-4"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                  {preset.label}
                                </span>
                                {isBrandRecommended && (
                                  <span
                                    style={{
                                      backgroundColor: `${primaryColor}20`,
                                      color: primaryColor,
                                    }}
                                    className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>מותאם למותג</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                                {preset.description}
                              </span>
                            </div>
                          </div>

                          <div
                            style={
                              isSelected ? { background: brandGradient, borderColor: primaryColor } : undefined
                            }
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'text-white'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* ACTION BUTTONS: DIRECTLY UNDERNEATH */}
                  <div className="pt-2 flex items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={handleNext}
                      style={{
                        background: brandGradient,
                        boxShadow: `0 8px 20px -4px ${primaryColor}40`,
                      }}
                      className="px-8 py-3.5 text-white font-bold rounded-xl text-sm hover:opacity-95 active:scale-95 flex items-center gap-2 transition cursor-pointer"
                    >
                      <span>הבא</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-3.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>הקודם</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Contact Details (Single Question, Row Under Row) */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-1.5 text-center">
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
                      הפרטים שנבחרו יישמרו ישירות בתיק הלקוח במערכת.
                    </p>
                  </div>

                  {/* Strictly stacked row-under-row - Human Labels with Brand Styling */}
                  <div className="flex flex-col space-y-2 max-h-[46vh] overflow-y-auto pr-1 text-right">
                    {CRM_COLLECTION_FIELDS.map((field) => {
                      const isChecked = selectedCrmFields.includes(field.id);
                      return (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => toggleCrmField(field.id)}
                          style={
                            isChecked
                              ? {
                                  borderColor: primaryColor,
                                  backgroundColor: `${primaryColor}10`,
                                }
                              : undefined
                          }
                          className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isChecked
                              ? 'border-indigo-600 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              style={
                                isChecked
                                  ? {
                                      backgroundColor: `${primaryColor}20`,
                                      color: primaryColor,
                                    }
                                  : undefined
                              }
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0"
                            >
                              <LuxuryIconRenderer
                                iconName={field.iconName}
                                className="w-4 h-4"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                                {field.label}
                              </span>
                            </div>
                          </div>

                          <div
                            style={
                              isChecked
                                ? { background: brandGradient, borderColor: primaryColor }
                                : undefined
                            }
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'text-white'
                                : 'border-slate-300 dark:border-slate-700 bg-transparent'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* ACTION BUTTONS: DIRECTLY UNDERNEATH */}
                  <div className="pt-2 flex items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={handleNext}
                      style={{
                        background: brandGradient,
                        boxShadow: `0 8px 20px -4px ${primaryColor}40`,
                      }}
                      className="px-8 py-3.5 text-white font-bold rounded-xl text-sm hover:opacity-95 active:scale-95 flex items-center gap-2 transition cursor-pointer"
                    >
                      <span>הבא</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-3.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>הקודם</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Special Notes */}
              {currentStep === 5 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span>שאלה 5 מתוך 5</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      דגשים או בקשות מיוחדות לסיום?
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      אופציונלי: בחר דגש חכם מהרשימה או הזן הנחיות חופשיות.
                    </p>
                  </div>

                  {/* AI Brand Notes Chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {aiNotesSuggestions.map((note, idx) => {
                      const isMatch = customToneInstructions === note;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCustomToneInstructions(note)}
                          style={
                            isMatch
                              ? {
                                  borderColor: primaryColor,
                                  backgroundColor: `${primaryColor}18`,
                                  color: primaryColor,
                                }
                              : undefined
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isMatch
                              ? 'border-indigo-500 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-400/60 hover:text-indigo-600'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{note}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input field with voice dictation */}
                  <div className="w-full space-y-2">
                    <KosunInputWithVoice
                      value={customToneInstructions}
                      onChange={(e) => setCustomToneInstructions(e.target.value)}
                      placeholder="לדוגמה: לכלול שאלת דירוג דחיפות בסיום, לשמור על ניסוח קצר..."
                      className="text-base p-4 text-center"
                      autoFocus
                    />
                  </div>

                  {/* ACTION BUTTONS: DIRECTLY UNDERNEATH - FINAL STEP WITH GENERATE BUTTON */}
                  <div className="pt-2 flex items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating || !goal.trim()}
                      style={{
                        background: brandGradient,
                        boxShadow: `0 10px 25px -4px ${primaryColor}50`,
                      }}
                      className="px-9 py-3.5 text-white font-black rounded-xl text-sm hover:opacity-95 active:scale-95 flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>סוכן KOSAI מעבד ויוצר את השאלון...</span>
                        </>
                      ) : (
                        <>
                          <span>צור שאלון עם KOSAI</span>
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-3.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>הקודם</span>
                    </button>
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
            /* Result Preview Screen - Centered with Buttons Immediately Beneath */
            <div className="w-full space-y-5 animate-fadeIn text-right">
              {/* Form Metadata - Clean & Minimalist Header without Technical Jargon */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black mx-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>השאלון מוכן בהצלחה</span>
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-xl">
                  {generatedResult.form.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {generatedResult.form.steps?.length || 0} שאלות ממוקדות • שאלה אחת בכל שלב
                </p>
              </div>

              {/* Steps List */}
              <div className="flex flex-col space-y-2 max-h-52 overflow-y-auto pr-1">
                {(generatedResult.form.steps || []).map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor,
                        }}
                        className="w-5 h-5 rounded-full font-black flex items-center justify-center shrink-0 text-xs"
                      >
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

                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] shrink-0 font-medium font-mono">
                      שלב {idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS: DIRECTLY BENEATH PREVIEW */}
              <div className="pt-3 flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleApplyForm}
                  style={{
                    background: brandGradient,
                    boxShadow: `0 10px 25px -4px ${primaryColor}50`,
                  }}
                  className="px-9 py-3.5 text-white font-black rounded-xl text-sm hover:opacity-95 active:scale-95 flex items-center gap-2 transition cursor-pointer"
                >
                  <span>מעבר לעורך הטופס (KSF)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="px-5 py-3.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  חזרה לעריכה
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
