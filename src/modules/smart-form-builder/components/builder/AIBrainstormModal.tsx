import React, { useState } from 'react';
import { ToneStyle, SmartFormDefinition } from '../../types';
import { TONE_PRESETS } from '../../config/tonePresets';
import { generateSmartFormWithAI } from '../../services/aiFormService';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { Sparkles, X, Loader2, ArrowLeft, Bot, Wand2, Lightbulb, CheckCircle2 } from 'lucide-react';

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
  const [goal, setGoal] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<ToneStyle>('executive_luxury');
  const [customToneInstructions, setCustomToneInstructions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<{
    form: Partial<SmartFormDefinition>;
    explanation: string;
    suggestedNextSteps: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError('נא להזין את מטרת הטופס או נושא השאלון');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateSmartFormWithAI({
        goal,
        targetAudience,
        tone: selectedTone,
        customToneInstructions,
      });

      setGeneratedResult(result);
    } catch (e: any) {
      setError(e.message || 'שגיאה ביצירת הטופס בעזרת AI');
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
      crmDefaultTags: ['AI Form', goal],
    };

    onFormGenerated(fullForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        dir="rtl"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">
                  סטודיו סיעור מוחות והפקת טופס ב-AI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950">
                  Gemini Copilot
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                הגדרת טון, אופי ושאלות מדויקות שדה-אחר-שדה (ללא אימוג'ים ועם אייקוני יוקרה)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!generatedResult ? (
            <>
              {/* Step 1: Goal */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <LuxuryIconRenderer iconName="Target" className="w-4 h-4 text-amber-500" />
                  <span>מהי מטרת הטופס או השאלון?</span>
                </label>
                <textarea
                  rows={2}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="לדוגמה: שאלון אבחון והתאמה לתוכנית ליווי עסקי פרטית לבכירים, או טופס קבלת הצעת מחיר לפרויקט מותאם אישית..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Step 2: Target Audience */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <LuxuryIconRenderer iconName="Users" className="w-4 h-4 text-amber-500" />
                  <span>מיהו קהל היעד המרכזי? (אופציונלי)</span>
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="לדוגמה: מנכ&quot;לים וסמנכ&quot;לים, בעלי עסקים בצמיחה, לקוחות פרימיום..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Step 3: Tone Presets */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <LuxuryIconRenderer iconName="Crown" className="w-4 h-4 text-amber-500" />
                  <span>בחר את טון הדיבור והאופי של הטופס:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TONE_PRESETS.map((preset) => {
                    const isSelected = selectedTone === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedTone(preset.id)}
                        className={`p-3.5 rounded-2xl border-2 text-right transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 ring-2 ring-amber-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/40 bg-slate-50/50 dark:bg-slate-800/40'
                        }`}
                      >
                        <LuxuryIconRenderer
                          iconName={preset.defaultIcon}
                          className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
                              {preset.label}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {preset.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Custom Refinement instructions */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  הנחיות או דגשים מיוחדים נוספים ל-AI:
                </label>
                <input
                  type="text"
                  value={customToneInstructions}
                  onChange={(e) => setCustomToneInstructions(e.target.value)}
                  placeholder="לדוגמה: לכלול שאלת דירוג בסיום, לבקש שם מלא וטלפון בשלבים הראשונים..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-semibold">
                  {error}
                </div>
              )}
            </>
          ) : (
            /* Result Preview Screen */
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    מבנה הטופס הופק בהצלחה על ידי ה-AI!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    {generatedResult.explanation}
                  </p>
                </div>
              </div>

              {/* Form Metadata preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {generatedResult.form.title}
                  </h4>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {generatedResult.form.steps?.length || 0} שלבים (שדה אחד בכל שלב)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {generatedResult.form.description}
                </p>
              </div>

              {/* Steps List Preview */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  פירוט השלבים שנוצרו:
                </h5>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(generatedResult.form.steps || []).map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <LuxuryIconRenderer
                          iconName={step.iconName}
                          className="w-4 h-4 text-amber-500 shrink-0"
                        />
                        <span className="font-semibold text-slate-800 dark:text-white truncate">
                          {step.title}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] shrink-0">
                        {step.fieldType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          {!generatedResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !goal.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ה-AI מגבש ויוצר את הטופס...</span>
                  </>
                ) : (
                  <>
                    <span>צור טופס חכם עם AI</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setGeneratedResult(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                חזרה לעריכת הנחיות
              </button>
              <button
                type="button"
                onClick={handleApplyForm}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all"
              >
                <span>החל ועבור לעורך הטופס</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
