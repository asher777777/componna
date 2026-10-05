import React, { useState, useEffect } from 'react';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { aiPageGenerator, GenerationStep } from '../services/aiPageGenerator';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';
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
  Image as ImageIcon,
  Settings,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

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
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  const { openConnectorModal } = useSystemConnection();
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [streamedConfig, setStreamedConfig] = useState<PageBuilderConfig | null>(null);
  const [generateImages, setGenerateImages] = useState(true);
  const [ideas, setIdeas] = useState<Array<{id: string, title: string, description: string, prompt: string, icon: string}>>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPromptText('');
      setCurrentStep(null);
      setStreamedConfig(null);
      setIsGenerating(false);
      loadIdeas();
    }
  }, [isOpen, brandDna]);

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    const generatedIdeas = await aiPageGenerator.generatePageIdeas(brandDna);
    setIdeas(generatedIdeas);
    setLoadingIdeas(false);
  };

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'MapPin': return <MapPin className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleStartGeneration = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || promptText;
    if (!finalPrompt.trim()) return;

    setIsGenerating(true);
    setCurrentStep({
      stepIndex: 0,
      totalSteps: 8,
      sectionType: 'hero',
      stepTitle: 'מנתח Brand DNA...',
      statusText: 'מתחיל...',
      progressPercent: 5,
    });

    try {
      const result = await aiPageGenerator.generatePageLive(
        finalPrompt,
        brandDna,
        (step, partialConfig) => {
          setCurrentStep(step);
          setStreamedConfig(partialConfig);
        },
        { generateImages }
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#060608] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">יוצר עמודים חי ב-AI (Live Streaming Builder)</h2>
              <p className="text-sm text-slate-400">מתחילים ממסך ריק – המערכת תייצר עבורכם אזור אחר אזור בזמן אמת בלווי עיצוב ותוכן ממיר, מבוסס על צבעי המותג.</p>
            </div>
          </div>
          {!isGenerating && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openConnectorModal('apiKeys')}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="הגדרות מפתחות AI"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {!isGenerating ? (
            <div className="flex flex-col gap-8 max-w-2xl mx-auto">
              
              {/* Brand DNA Status */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-indigo-400 font-bold">מחובר ל-Brand DNA:</strong> {brandDna?.identity?.companyName || 'מותג'} (פלטת צבעים, פונטים, ולוגו ישולבו אוטומטית בהתאם למטרת העמוד)
                </p>
                <div className="mr-auto px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  מסונכרן
                </div>
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-white">תארו את מטרת העמוד (או הקלידו מילות מפתח):</label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="למשל: דף נחיתה מקומי (GEO) למשרד שלי בתל אביב, עם שעות פתיחה, מפת הגעה והוכחה חברתית, או דף נחיתה למכירת קורס..."
                  className="w-full h-32 px-5 py-4 rounded-2xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-base resize-none transition-all"
                />
                
                <label className="flex items-center gap-3 mt-2 cursor-pointer group">
                  <div className={clsx(
                    "w-5 h-5 rounded flex items-center justify-center border transition-all",
                    generateImages ? "bg-indigo-600 border-indigo-500" : "bg-slate-800 border-slate-700 group-hover:border-slate-500"
                  )}>
                    {generateImages && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    צור תמונות מתאימות ומדויקות (כולל תיאורי תמונה ו-ALT)
                  </span>
                </label>
              </div>

              {/* Dynamic Presets (Ideas) */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <span>או בחרו רעיון מותאם אישית למותג שלכם:</span>
                  {loadingIdeas && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ideas.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleStartGeneration(preset.prompt)}
                      className="flex flex-col gap-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 text-right transition-all group"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-white text-base">{preset.title}</span>
                        <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                          {getIcon(preset.icon)}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            // Stream Progress View
            <div className="flex flex-col items-center justify-center py-12 gap-8">
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"
                  style={{ animationDuration: '1.5s' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">
                  {currentStep?.progressPercent || 0}%
                </div>
              </div>

              <div className="text-center flex flex-col gap-3">
                <h3 className="text-2xl font-black text-white">
                  {currentStep?.stepTitle || 'מכין תשתית...'}
                </h3>
                <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{currentStep?.statusText || 'טוען נתונים...'}</span>
                </p>
              </div>

              {/* Step indicator pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mt-4">
                {streamedConfig?.sectionOrder.map((secId, idx) => (
                  <div key={secId} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold animate-fade-in-up">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>אזור {idx + 1} הוקם</span>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isGenerating && (
          <div className="p-6 border-t border-slate-800/80 bg-slate-900/60 flex justify-between items-center">
            <button
              onClick={onClose}
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              ביטול
            </button>
            
            <button
              onClick={() => handleStartGeneration()}
              disabled={!promptText.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>צור עמוד עכשיו ב-AI</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
