import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  X,
  Layers,
  ShieldCheck,
  Target,
  Zap,
  Compass,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Wand2,
  Palette,
  FileText,
  Sliders,
} from 'lucide-react';
import { SectionType } from '../types/pageBuilder.types';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useTenantScope } from '../../../core/tenant';
import { BrandDnaContract, BrandDna } from '../../../core/contracts';
import { loadBrandDna } from '../../KosBranding/services/brandDnaFirestore';
import {
  aiSectionEnhancerService,
  SectionAiSuggestion,
  SectionEnhancementResult,
} from '../services/aiSectionEnhancerService';
import { resolveLiveBrandDna } from '../services/aiPageGenerator';

interface AiSectionDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionType: SectionType;
  currentConfig: any;
  allSections?: Record<string, any>;
  sectionOrder?: string[];
  pageTitle?: string;
  onApplyDesign: (newConfig: any) => void;
}

type TabType = 'brand' | 'page_context' | 'layout' | 'custom';

export const AiSectionDesignerModal: React.FC<AiSectionDesignerModalProps> = ({
  isOpen,
  onClose,
  sectionId,
  sectionType,
  currentConfig,
  allSections,
  sectionOrder,
  pageTitle,
  onApplyDesign,
}) => {
  const { db, getApiKeysForModule } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const { tenantId } = useTenantScope();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('brand');

  // Custom Prompt
  const [customPrompt, setCustomPrompt] = useState('');

  // Brand DNA State
  const [brandDna, setBrandDna] = useState<BrandDna | null>(() => {
    const fromCap = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna();
    return resolveLiveBrandDna(fromCap || null);
  });

  // Loading & Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);

  // Result & Preview State
  const [previewResult, setPreviewResult] = useState<SectionEnhancementResult | null>(null);

  // Fetch Firestore Brand DNA on mount if available
  useEffect(() => {
    let isMounted = true;
    async function fetchFreshBrandDna() {
      try {
        const loaded = await loadBrandDna(db, tenantId);
        if (isMounted && loaded) {
          setBrandDna(resolveLiveBrandDna(loaded));
        }
      } catch (err) {
        console.warn('Could not load firestore brand dna, using context:', err);
      }
    }
    fetchFreshBrandDna();
    return () => {
      isMounted = false;
    };
  }, [db, tenantId]);

  if (!isOpen) return null;

  // Get Suggestions
  const { brandSuggestions, pageContextSuggestions, layoutSuggestions } =
    aiSectionEnhancerService.getSuggestionsForSection(
      sectionType,
      currentConfig,
      brandDna,
      allSections,
      sectionOrder
    );

  const companyName = brandDna?.identity?.companyName || 'המותג שלך';
  const slogan = brandDna?.identity?.slogan || '';
  const uvp = brandDna?.audience?.mainUvp || '';

  // Execute Improvement
  const handleRunEnhancement = async (promptToUse: string, suggestionId?: string) => {
    if (!promptToUse.trim()) return;
    setIsProcessing(true);
    if (suggestionId) setActiveSuggestionId(suggestionId);

    try {
      const apiKey = getApiKeysForModule('KosWebAi').googleAiApiKey || undefined;
      const result = await aiSectionEnhancerService.enhanceSection({
        sectionType,
        instructionPrompt: promptToUse,
        currentConfig,
        brandDna,
        allSections,
        sectionOrder,
        pageTitle,
        providedApiKey: apiKey,
      });

      setPreviewResult(result);
    } catch (err) {
      console.error('Enhancement failed:', err);
    } finally {
      setIsProcessing(false);
      setActiveSuggestionId(null);
    }
  };

  const handleApply = () => {
    if (previewResult?.updatedConfig) {
      onApplyDesign(previewResult.updatedConfig);
      onClose();
    }
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Target':
        return <Target className="w-5 h-5 text-rose-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-50 bg-[#090a0f]/98 backdrop-blur-2xl text-slate-100 flex flex-col overflow-hidden"
      dir="rtl"
    >
      {/* Top Bar with Minimal Header & Close Button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white">שדרוג אזור ב-AI חכם</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                {sectionType}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                קושאן מותג: {companyName}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              התאמה מלאה של המסרים והעיצוב לקולקציית המיתוג ולרצף העמוד כולו
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/60"
          title="סגור"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800/60 bg-slate-950/40 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
            activeTab === 'brand'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>קולקציית מיתוג (Brand DNA)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('page_context')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
            activeTab === 'page_context'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>רצף תוכן העמוד ({sectionOrder?.length || 1} אזורים)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
            activeTab === 'layout'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>פריסה ועיצוב Bento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
            activeTab === 'custom'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>הנחיה חופשית ל-AI</span>
        </button>
      </div>

      {/* Main Body: 2 Columns (Suggestions/Input & Live Preview/Diff) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Left/Main Column: Tab Content */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-y-auto pr-1">
          {/* TAB 1: BRAND DNA */}
          {activeTab === 'brand' && (
            <div className="flex flex-col gap-4">
              {/* Brand Summary Banner */}
              <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>נתוני קולקציית המיתוג הפעילה:</span>
                  <span className="text-indigo-400">{companyName}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {slogan && <div>סלוגן: <strong className="text-white">{slogan}</strong></div>}
                  {uvp && <div>הצעת ערך (UVP): <strong className="text-white">{uvp}</strong></div>}
                </div>
              </div>

              {/* Suggestions Cards */}
              <div className="flex flex-col gap-3">
                {brandSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/20 transition-colors">
                          {renderIcon(sug.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">{sug.title}</h4>
                            {sug.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                                {sug.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {sug.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRunEnhancement(sug.prompt, sug.id)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                      >
                        {isProcessing && activeSuggestionId === sug.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>מייצר...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>הפק שדרוג</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PAGE CONTEXT */}
          {activeTab === 'page_context' && (
            <div className="flex flex-col gap-4">
              {/* Page Overview Banner */}
              <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400">
                  ניתוח רצף העמוד ({sectionOrder?.length || 1} אזורים בסך הכל):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(sectionOrder || []).map((id, idx) => {
                    const sec = allSections?.[id];
                    const isCurrent = id === sectionId;
                    return (
                      <span
                        key={id}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                        }`}
                      >
                        {idx + 1}. {sec?.type || id} {isCurrent && '(נוכחי)'}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Page Context Suggestions */}
              <div className="flex flex-col gap-3">
                {pageContextSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/20 transition-colors">
                          {renderIcon(sug.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">{sug.title}</h4>
                            {sug.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                                {sug.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {sug.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRunEnhancement(sug.prompt, sug.id)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                      >
                        {isProcessing && activeSuggestionId === sug.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>מייצר...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>הפק שדרוג</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LAYOUT & BENTO */}
          {activeTab === 'layout' && (
            <div className="flex flex-col gap-3">
              {layoutSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/20 transition-colors">
                        {renderIcon(sug.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{sug.title}</h4>
                          {sug.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                              {sug.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {sug.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleRunEnhancement(sug.prompt, sug.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      {isProcessing && activeSuggestionId === sug.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>מייצר...</span>
                        </>
                      ) : (
                        <>
                          <Palette className="w-3.5 h-3.5" />
                          <span>עצב פריסה</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: CUSTOM PROMPT */}
          {activeTab === 'custom' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">
                  הנחיות חופשיות לשדרוג האזור ב-AI:
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="לדוגמה: 'הפוך את האזור לעיצוב Bento מודרני, עם כותרת שמדגישה ליווי אישי וקריאה ישירה לוואטסאפ...'"
                  className="w-full h-36 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Quick Inspiration Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 self-center">רעיונות מהירים:</span>
                {[
                  'הפוך את הטון ליוקרתי וסמכותי',
                  'הדגש פתרון מהיר לנקודות הכאב של הלקוח',
                  'הוסף הנעה חזקה לפעולה עם דחיפות לחודש הקרוב',
                  'סנכרן עם צבעי המותג והסלוגן',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setCustomPrompt(txt)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-700/50"
                  >
                    {txt}
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  disabled={isProcessing || !customPrompt.trim()}
                  onClick={() => handleRunEnhancement(customPrompt)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>מייצר שדרוג ב-AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>הפק שדרוג מותאם</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Diff & Preview */}
        <div className="lg:col-span-5 flex flex-col h-full bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-black text-white">תצוגה מקדימה ובדיקת שינויים</span>
            </div>
            {previewResult && previewResult.success && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                מוכן להחלה
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
            {previewResult ? (
              !previewResult.success ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2 text-right">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>הודעת מערכת:</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {previewResult.message || 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Changes List */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>עיקרי השדרוג שבוצע:</span>
                    </span>
                  <ul className="text-xs text-slate-300 flex flex-col gap-1.5 pr-2">
                    {previewResult.summaryOfChanges.map((change, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Diff Comparison */}
                <div className="flex flex-col gap-3 text-xs">
                  {previewResult.updatedConfig.title && (
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                      <span className="text-slate-500 font-bold">כותרת משודרגת:</span>
                      <span className="text-white font-black text-sm">
                        {previewResult.updatedConfig.title}
                      </span>
                      {currentConfig.title && (
                        <span className="text-slate-500 line-through text-[11px]">
                          לפני: {currentConfig.title}
                        </span>
                      )}
                    </div>
                  )}

                  {previewResult.updatedConfig.subtitle && (
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                      <span className="text-slate-500 font-bold">תת-כותרת משודרגת:</span>
                      <span className="text-slate-200 font-medium">
                        {previewResult.updatedConfig.subtitle}
                      </span>
                    </div>
                  )}

                  {previewResult.updatedConfig.layout && (
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-500 font-bold">סגנון פריסה:</span>
                      <span className="text-indigo-300 font-bold">
                        {previewResult.updatedConfig.layout}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Wand2 className="w-10 h-10 mb-3 opacity-30 text-indigo-400" />
                <p className="text-xs font-bold text-slate-400">טרם הופק שדרוג</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  בחר הצעה מאחת הלשוניות (מיתוג, רצף עמוד או פריסה) או הזן הנחיה חופשית כדי לראות את התוצאה כאן
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              ביטול
            </button>

            <button
              type="button"
              disabled={!previewResult?.success || !previewResult?.updatedConfig}
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>החל שדרוג זה על האזור</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AiSectionDesignerModal;
