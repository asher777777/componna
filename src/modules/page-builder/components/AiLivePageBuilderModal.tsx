import React, { useState } from 'react';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { aiPageGenerator, GenerationStep } from '../services/aiPageGenerator';
import { useBrandDna } from '../../brand-dna-hub/hooks/useBrandDna';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  X,
  GraduationCap,
  Heart,
  MapPin,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

interface AiLivePageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (generatedConfig: PageBuilderConfig) => void;
}

export const AiLivePageBuilderModal: React.FC<AiLivePageBuilderModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { brandDna } = useBrandDna();
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [streamedConfig, setStreamedConfig] = useState<PageBuilderConfig | null>(null);

  if (!isOpen) return null;

  const handleStartGeneration = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || promptText;
    if (!finalPrompt.trim()) return;

    setIsGenerating(true);
    setCurrentStep({
      stepIndex: 0,
      totalSteps: 8,
      sectionType: 'hero',
      stepTitle: 'מאתחל מסך ריק ושואב נתוני Brand DNA...',
      statusText: 'מנתח פרומפט ומתאים פלטת צבעים...',
      progressPercent: 5,
    });

    try {
      const result = await aiPageGenerator.generatePageLive(
        finalPrompt,
        brandDna,
        (step, partialConfig) => {
          setCurrentStep(step);
          setStreamedConfig(partialConfig);
        }
      );

      // Finish & trigger completion
      setTimeout(() => {
        setIsGenerating(false);
        onComplete(result);
        onClose();
      }, 500);
    } catch (err) {
      console.error('AI Generation error:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl" dir="rtl">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col text-right max-h-[90vh]">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {!isGenerating && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 rounded-full bg-slate-900 border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              יוצר עמודים חי ב-AI (Live Streaming Builder)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              מתחילים ממסך ריק – המערכת תייצר עבורכם אזור אחר אזור בזמן אמת בליווי עיצוב ותוכן ממיר.
            </p>
          </div>
        </div>

        {/* Brand DNA Sync Notice */}
        {brandDna && (
          <div className="mb-6 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>
                מחובר ל-Brand DNA: <strong>{brandDna.identity.companyName}</strong> (פלטת צבעים, פונטים ולוגו ישולבו אוטומטית)
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              מסונכרן
            </span>
          </div>
        )}

        {/* Live Generation Progress View vs. Input View */}
        {isGenerating && currentStep ? (
          <div className="flex flex-col gap-6 py-6 items-center text-center relative z-10">
            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-800 p-0.5 max-w-xl">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${currentStep.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{currentStep.stepTitle}</span>
            </div>

            <p className="text-xs text-slate-400 max-w-md">{currentStep.statusText}</p>

            {/* Visual Live Stream Box */}
            <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 max-h-52 overflow-y-auto text-right text-xs text-slate-300 font-mono">
              <div className="text-emerald-400 font-bold">✨ אבני בניין הנוצרות כעת על המסך:</div>
              {streamedConfig?.sectionOrder.map((secId, i) => {
                const sec = streamedConfig.sections[secId];
                return (
                  <div key={secId} className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-white font-semibold">
                      #{i + 1} {sec?.title || sec?.type}
                    </span>
                    <span className="text-indigo-400 text-[10px] uppercase font-bold">[{sec?.type}] נוצר בהצלחה ✓</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 relative z-10 overflow-y-auto pr-1">
            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                תארו את מטרת העמוד (או הקלידו מילות מפתח):
              </label>
              <textarea
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="למשל: דף נחיתה יוקרתי לקורס סייבר עם מחירונים, ביקורות, שאלות נפוצות וטופס הרשמה מוקדמת..."
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 shadow-inner resize-none"
              />
            </div>

            {/* Preset Ideas */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-3">
                או בחרו תבנית מוכנה להשקה מהירה:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiPageGenerator.presetPrompts.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPromptText(preset.prompt);
                      handleStartGeneration(preset.prompt);
                    }}
                    className="p-4 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex items-start gap-3 text-right transition-all group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 mt-2">
              <button
                type="button"
                disabled={!promptText.trim()}
                onClick={() => handleStartGeneration()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Sparkles className="w-5 h-5" />
                <span>התחל יצירת עמוד בלייב ✨</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
