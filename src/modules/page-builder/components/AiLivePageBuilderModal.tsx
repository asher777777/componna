import React, { useState, useEffect } from 'react';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { aiPageGenerator, GenerationStep } from '../services/aiPageGenerator';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';
import { resolveApiKey } from '../api/functionsApi';
import { MarketingIdea } from '../types';
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
  AlertCircle,
  Lightbulb,
  LayoutTemplate,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { PAGE_BLUEPRINTS, hydrateBlueprintWithBrandDna } from '../blueprints/pageBlueprints';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { GreenApiService } from '../../whatsapp-green-api-hub/services/greenApiService';

interface AiLivePageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (generatedConfig: PageBuilderConfig) => void;
  onOpenMarketingDrawer?: () => void;
}

export const AiLivePageBuilderModal: React.FC<AiLivePageBuilderModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onOpenMarketingDrawer,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const { openConnectorModal, getApiKeysForModule } = useSystemConnection();

  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [streamedConfig, setStreamedConfig] = useState<PageBuilderConfig | null>(null);
  const [useBrandDna, setUseBrandDna] = useState(true);
  const [imageMode, setImageMode] = useState<'ai' | 'gallery' | 'none'>('ai');
  const [draftConfig, setDraftConfig] = useState<any>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [approvedSectionIds, setApprovedSectionIds] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<MarketingIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Wizard step state: 1 = Brainstorm & Goal, 2 = Architecture & Template, 3 = Generating/Streaming
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('sales-funnel');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  const moduleKeys = getApiKeysForModule('page-builder');
  const apiKey = moduleKeys.googleAiApiKey || '';

  const hasApiKey = !!resolveApiKey();

  useEffect(() => {
    if (isOpen) {
      setPromptText('');
      setCurrentStep(null);
      setStreamedConfig(null);
      setIsGenerating(false);
      setWizardStep(1);
      setSelectedIdeaId(null);
      loadIdeas();
    }
  }, [isOpen, brandDna]);

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const existingPages = await pageBuilderFirestore.getAllPages();
      const generatedIdeas = await aiPageGenerator.generatePageIdeas(brandDna, apiKey, existingPages);
      setIdeas(generatedIdeas);
    } catch {
      // fallback handled in generator
    } finally {
      setLoadingIdeas(false);
    }
  };

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleSelectIdea = (idea: MarketingIdea) => {
    setSelectedIdeaId(idea.id);
    setPromptText(idea.prompt);
  };

  
  const reportError = async (errText: string) => {
    try {
      const keys = getApiKeysForModule('whatsapp-hub');
      const waService = new GreenApiService({
        idInstance: keys.greenApiInstanceId || '',
        apiTokenInstance: keys.greenApiToken || ''
      });
      const phone = brandDna?.trust?.whatsappSupportNumber || brandDna?.trust?.contactPhone || '';
      const cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone || !keys.greenApiInstanceId) {
        alert('לא הוגדר מספר טלפון ב-Brand DNA או שחסרים פרטי Green API ב-Connector Hub.');
        return;
      }
      await waService.sendMessage({
        chatId: `${cleanPhone}@c.us`,
        message: `*דו"ח תקלה ממערכת בניית העמודים ב-AI:* \n\n${errText}`
      });
      alert('הדיווח נשלח בהצלחה לווצאפ.');
    } catch (e) {
      alert('שגיאה בשליחת הדיווח לווצאפ.');
    }
  };

  
  const finalizeConfig = (approvedIds: string[]) => {
    if (!draftConfig) return;
    
    if (approvedIds.length === 0) {
      alert('לא נבחרו אזורים כלל.');
      setWizardStep(2);
      return;
    }

    const finalConfig = { ...draftConfig };
    finalConfig.sectionOrder = approvedIds;
    const newSections: Record<string, any> = {};
    approvedIds.forEach((id: string) => {
      newSections[id] = finalConfig.sections[id];
      if (imageMode === 'gallery' || imageMode === 'none') {
         newSections[id].imageUrl = '';
         newSections[id].imageSrc = '';
      }
    });
    finalConfig.sections = newSections;

    onComplete(finalConfig);
    onClose();
  };

  const handleStartGeneration = async () => {
    const finalPrompt = promptText.trim() || 'דף נחיתה מקצועי וממיר';
    // Incorporate the chosen template blueprint guidance into the prompt
    const templateBlueprint = PAGE_BLUEPRINTS.find((b) => b.id === selectedTemplateId);
    const enrichedPrompt = templateBlueprint
      ? `${finalPrompt}. מבוסס על שלד ארכיטקטוני של ${templateBlueprint.title} עם אזורים מגוונים ואפקטים מותאמים.`
      : finalPrompt;

    setIsGenerating(true);
    setCurrentStep({
      stepIndex: 0,
      totalSteps: 6,
      sectionType: 'hero',
      stepTitle: 'מנתח Brand DNA ומגבש אסטרטגיה...',
      statusText: 'בונה ארכיטקטורה עשירה מבוססת על המיתוג ושלד התבנית שנבחרה...',
      progressPercent: 5,
    });

    try {
      const result = await aiPageGenerator.generatePageLive(
        enrichedPrompt,
        useBrandDna ? brandDna : null,
        (step, partialConfig) => {
          setCurrentStep(step);
          setStreamedConfig(partialConfig);
        },
        { generateImages: imageMode === 'ai', apiKey }
      );

      setDraftConfig(result);
      setReviewIndex(0);
      setApprovedSectionIds([]);
      setIsGenerating(false);
      setWizardStep(3);
    } catch (err) {
      console.error('AI Generation error:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#060608] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                סיעור מוחות ויצירת עמוד ב-AI
              </h2>
              <p className="text-sm text-slate-400">
                תהליך תכנון חכם מבוסס Brand DNA, בחירת ארכיטקטורה והזרמת עמוד חי בזמן אמת.
              </p>
            </div>
          </div>
          {!isGenerating && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openConnectorModal('apiKeys')}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="הגדרות מפתחות AI"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Wizard Steps Bar (if not actively streaming) */}
        {!isGenerating && (
          <div className="flex items-center justify-center gap-8 py-3 px-6 bg-slate-950 border-b border-slate-800/60 text-xs">
            <div
              className={clsx(
                'flex items-center gap-2 font-bold cursor-pointer transition-colors',
                wizardStep === 1 ? 'text-indigo-400' : 'text-slate-400'
              )}
              onClick={() => setWizardStep(1)}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[11px]">
                1
              </span>
              <span>שלב 1: סיעור מוחות ומטרת העמוד</span>
            </div>
            <div className="w-8 h-px bg-slate-800" />
            <div
              className={clsx(
                'flex items-center gap-2 font-bold cursor-pointer transition-colors',
                wizardStep === 2 ? 'text-indigo-400' : 'text-slate-400'
              )}
              onClick={() => {
                if (promptText.trim()) setWizardStep(2);
              }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                2
              </span>
              <span>שלב 2: סגנון ושלד תבנית מנחה</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {!isGenerating ? (
            wizardStep === 1 ? (
              // STEP 1: Brainstorming & Goal
              <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                {/* Brand DNA Notification */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                  <p className="text-sm text-slate-300">
                    <strong className="text-indigo-400 font-bold">מסונכרן עם ה-Brand DNA:</strong>{' '}
                    פרטי הקשר, יעדי המותג, נקודות הכאב וההתנגדויות מוזנים אוטומטית לסיעור המוחות.
                  </p>
                </div>

                {/* Brainstorming Ideas Cards */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-300">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>רעיונות שיווקיים מותאמים למותג שלך (לחצו לבחירה):</span>
                      {loadingIdeas && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ideas.slice(0, 4).map((idea) => {
                      const isSelected = selectedIdeaId === idea.id;
                      return (
                        <div
                          key={idea.id}
                          onClick={() => handleSelectIdea(idea)}
                          className={clsx(
                            'flex flex-col gap-2 p-4 rounded-2xl border text-right transition-all cursor-pointer relative',
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-white text-sm">{idea.title}</span>
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400">
                              {getIcon(idea.icon)}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {idea.description}
                          </p>
                          <span className="text-[10px] text-indigo-400 font-bold self-start mt-1">
                            {idea.badge || idea.targetObjective}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Goal Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white">
                    או הגדירו במילים שלכם את מטרת העמוד:
                  </label>
                  <textarea
                    value={promptText}
                    onChange={(e) => {
                      setPromptText(e.target.value);
                      setSelectedIdeaId(null);
                    }}
                    placeholder="למשל: דף מכירה ממוקד לחבילות ליווי, או דף שירות מקומי מהיר עם ווטסאפ, או דף הורדת מדריך ידע..."
                    className="w-full h-24 px-5 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm resize-none transition-all"
                  />
                </div>
              </div>
            ) : wizardStep === 2 ? (
              // STEP 2: Architectural Template & Style
              
              <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-purple-400" />
                    <span>בחרו שלד ארכיטקטוני מנחה עבור ה-AI:</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ה-AI ייקח את התבנית שנבחרה כבסיס ארכיטקטוני, ויעצב עמוד שלם ומותאם אישית למיתוג שלכם עם מגוון אזורים.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {PAGE_BLUEPRINTS.map((bp) => {
                    const isSelected = selectedTemplateId === bp.id;
                    return (
                      <div
                        key={bp.id}
                        onClick={() => setSelectedTemplateId(bp.id)}
                        className={clsx(
                          'flex flex-col gap-2.5 p-4 rounded-2xl border text-right transition-all cursor-pointer relative',
                          isSelected
                            ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{bp.title}</span>
                          <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                            {getIcon(bp.icon)}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {bp.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                            {bp.badge}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {bp.sectionTypes.length} אזורים
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Brand DNA & Image Settings */}
                <div className="flex flex-col gap-4 mt-6">
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-600 transition-all">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-600 bg-slate-800"
                      checked={useBrandDna}
                      onChange={(e) => setUseBrandDna(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-slate-300">השתמש במיתוג העסק (Brand DNA) בעמוד זה</span>
                  </label>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                    <span className="text-sm font-bold text-slate-300 mb-1">העדפת תמונות באזורים:</span>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="imageMode" value="ai" checked={imageMode === 'ai'} onChange={() => setImageMode('ai')} className="text-indigo-600 bg-slate-800 border-slate-700" />
                      <span className="text-sm text-slate-400">יצירת תמונות על ידי AI</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="imageMode" value="gallery" checked={imageMode === 'gallery'} onChange={() => setImageMode('gallery')} className="text-indigo-600 bg-slate-800 border-slate-700" />
                      <span className="text-sm text-slate-400">בחירה מתוך הגלריה (יושארו ריקות לבחירתך)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="imageMode" value="none" checked={imageMode === 'none'} onChange={() => setImageMode('none')} className="text-indigo-600 bg-slate-800 border-slate-700" />
                      <span className="text-sm text-slate-400">ללא תמונות כלל</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              // STEP 3: Review Sections
              draftConfig && (
                <div className="flex flex-col gap-6 max-w-2xl mx-auto items-center">
                  <h3 className="text-xl font-bold text-white text-center">אישור אזורים ({reviewIndex + 1} מתוך {draftConfig.sectionOrder.length})</h3>
                  
                  {(() => {
                    const currentSecId = draftConfig.sectionOrder[reviewIndex];
                    const sec = draftConfig.sections[currentSecId];
                    if (!sec) return null;
                    return (
                      <div className="w-full p-6 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col gap-4 text-right">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-bold rounded text-sm">{sec.type}</span>
                          </div>
                          <div>
                            {sec.title && <h4 className="text-white font-bold text-lg">{sec.title}</h4>}
                            {sec.subtitle && <p className="text-slate-400 text-sm mt-1">{sec.subtitle}</p>}
                            {sec.description && <p className="text-slate-500 text-xs mt-2 line-clamp-3">{sec.description}</p>}
                            {sec.features && sec.features.length > 0 && (
                              <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
                                {sec.features.map((f: any) => <li key={f.title}>• {f.title}</li>)}
                              </ul>
                            )}
                          </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full mt-4">
                      <button 
                        onClick={() => {
                          const currentSecId = draftConfig.sectionOrder[reviewIndex];
                          const nextIds = [...approvedSectionIds, currentSecId];
                          if (reviewIndex + 1 < draftConfig.sectionOrder.length) {
                            setApprovedSectionIds(nextIds);
                            setReviewIndex(r => r + 1);
                          } else {
                            finalizeConfig(nextIds);
                          }
                        }}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl w-full"
                      >
                        הוסף אזור זה
                      </button>
                      <button 
                        onClick={() => {
                          if (reviewIndex + 1 < draftConfig.sectionOrder.length) {
                            setReviewIndex(r => r + 1);
                          } else {
                            finalizeConfig(approvedSectionIds);
                          }
                        }}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl w-full"
                      >
                        דלג (לא רלוונטי)
                      </button>
                  </div>
                </div>
              )
            )
          ) : (
            // Stream Progress View
            <div className="flex flex-col items-center justify-center py-12 gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div
                  className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"
                  style={{ animationDuration: '1.2s' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">
                  {currentStep?.progressPercent || 0}%
                </div>
              </div>

              <div className="text-center flex flex-col gap-3">
                <h3 className="text-2xl font-black text-white">
                  {currentStep?.stepTitle || 'מכין תשתית עמוד...'}
                </h3>
                <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{currentStep?.statusText || 'מעצב ומזרים תוכן...'}</span>
                </p>
              </div>

              {/* Step indicator pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mt-4">
                {streamedConfig?.sectionOrder.map((secId, idx) => (
                  <div
                    key={secId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold animate-fade-in-up"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>אזור {idx + 1} הוקם ({secId.split('_')[0]})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {errorMsg && !isGenerating && (
          <div className="mx-6 sm:mx-8 mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-bold text-sm mb-1">שגיאה ביצירת העמוד</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{errorMsg}</p>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button 
                onClick={() => reportError(errorMsg)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-colors"
              >
                דווח למערכת (WhatsApp)
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!isGenerating && (
          <div className="p-6 border-t border-slate-800/80 bg-slate-900/60 flex justify-between items-center">
            {wizardStep === 1 ? (
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                disabled={!promptText.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>המשך לבחירת שלד וסגנון</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : wizardStep === 2 ? (
              <button
                type="button"
                onClick={handleStartGeneration}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>צור עמוד מלא ב-AI</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}

            {wizardStep === 1 ? (
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                disabled={!promptText.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>המשך לבחירת שלד וסגנון</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartGeneration}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>צור עמוד מלא ב-AI (הזרמה חיה)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiLivePageBuilderModal;
