import React, { useState } from 'react';
import { useBrandDna } from '../context/BrandDnaContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { generateBrandContentStrategies } from '../services/geminiBrandPrompt';
import { ContentStrategyItem } from '../types/brandDna';
import { saveContentStrategyItem } from '../services/brandDnaFirestore';
import {
  Sparkles,
  Wand2,
  Save,
  CheckCircle2,
  Copy,
  Layers,
  ArrowRight,
  Loader2,
  FileText,
  DollarSign,
  ShieldCheck,
  Check,
  ExternalLink,
  X,
  Target,
} from 'lucide-react';

interface ContentStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContentStrategyModal: React.FC<ContentStrategyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { brandDna } = useBrandDna();
  const { apiKeys } = useSystemConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [strategies, setStrategies] = useState<ContentStrategyItem[]>([]);
  const [activeStrategyIdx, setActiveStrategyIdx] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [savedSuccessIdx, setSavedSuccessIdx] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const apiKey = apiKeys.googleAiApiKey || '';
      const res = await generateBrandContentStrategies(brandDna, apiKey);
      if (res.success && res.strategies.length > 0) {
        setStrategies(res.strategies);
        setActiveStrategyIdx(0);
      } else {
        setErrorMessage(res.error || 'לא הצלחנו לייצר אסטרטגיות תוכן');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'שגיאה בלתי צפויה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveToCollection = async (strat: ContentStrategyItem, idx: number) => {
    setSavingIdx(idx);
    try {
      const res = await saveContentStrategyItem({
        ...strat,
        companyName: brandDna.identity.companyName || '',
      }, undefined, '_master');
      if (res.success) {
        setSavedSuccessIdx(idx);
        setTimeout(() => setSavedSuccessIdx(null), 3000);
      } else {
        alert(`שגיאה בשמירה: ${res.error || 'נסה שוב'}`);
      }
    } catch (err: any) {
      console.error('Error saving content strategy:', err);
      alert(`שגיאה בשמירה לקולקציה: ${err.message}`);
    } finally {
      setSavingIdx(null);
    }
  };

  const activeStrategy = strategies[activeStrategyIdx];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                הצעות אסטרטגיה של כתיבת תוכן (AI)
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-500/20">
                  עמודי שירות ומכירה
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                יצירת קופי מנצח ומשפכי המרה מבוססי Brand DNA ושמירה ישירה לקולקציית content_strategies
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Initial State / Generate Trigger */}
          {strategies.length === 0 && !isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
                <Wand2 className="w-8 h-8 animate-pulse" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  ייצר עמודי שירות ומכירה מדויקים למותג שלך
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ה-AI ינתח את נתוני ה-DNA (תחום, סלוגן, בידול, מילות כוח ומענה לחששות) ויבנה הצעות קופי מקיפות בדקות ספורות.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>הפק אסטרטגיות תוכן עכשיו ב-AI</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600 dark:text-purple-400" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Gemini מנתח את ה-DNA ומגבש אסטרטגיית תוכן ומכירה...
                </p>
                <p className="text-xs text-slate-400">
                  גוזר כותרות מושכות, נקודות ערך מרכזיות, ומנטרל התנגדויות.
                </p>
              </div>
            </div>
          )}

          {/* Strategies Render */}
          {strategies.length > 0 && !isLoading && (
            <div className="space-y-6">
              {/* Strategy Selector Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {strategies.map((strat, idx) => (
                  <button
                    key={strat.id || idx}
                    type="button"
                    onClick={() => setActiveStrategyIdx(idx)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeStrategyIdx === idx
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {strat.type === 'sales_page' ? <DollarSign className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span>{strat.title}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="mr-auto px-3 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>ייצר גרסאות נוספות</span>
                </button>
              </div>

              {/* Active Strategy Detailed Card */}
              {activeStrategy && (
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block mb-1">
                        קהל יעד ממוקד: {activeStrategy.targetAudience}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">
                        {activeStrategy.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveToCollection(activeStrategy, activeStrategyIdx)}
                      disabled={savingIdx === activeStrategyIdx}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0 ${
                        savedSuccessIdx === activeStrategyIdx
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                      }`}
                    >
                      {savingIdx === activeStrategyIdx ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : savedSuccessIdx === activeStrategyIdx ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>
                        {savedSuccessIdx === activeStrategyIdx
                          ? 'נשמר לקולקציה בהצלחה!'
                          : 'שמור לקולקציית content_strategies'}
                      </span>
                    </button>
                  </div>

                  {/* Hero Headline & Subheadline */}
                  <div className="space-y-3">
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-400">כותרת עליונה (Hero Headline)</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(activeStrategy.heroHeadline, 'heroHeadline')}
                          className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                        >
                          {copiedField === 'heroHeadline' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'heroHeadline' ? 'הועתק!' : 'העתק'}</span>
                        </button>
                      </div>
                      <p className="text-base font-black text-slate-800 dark:text-white">
                        {activeStrategy.heroHeadline}
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-400">כותרת משנה (Subheadline)</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(activeStrategy.heroSubheadline, 'heroSubheadline')}
                          className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                        >
                          {copiedField === 'heroSubheadline' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'heroSubheadline' ? 'הועתק!' : 'העתק'}</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {activeStrategy.heroSubheadline}
                      </p>
                    </div>
                  </div>

                  {/* Core Value Points */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      נקודות ערך ותועלות מובילות (Value Bullets):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeStrategy.coreValuePoints?.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA & Objection Killer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide block">
                        הנעה לפעולה (Call to Action)
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200">
                        {activeStrategy.callToAction}
                      </p>
                    </div>

                    {activeStrategy.objectionKiller && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block">
                          מנטרל התנגדויות וחרדות
                        </span>
                        <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                          {activeStrategy.objectionKiller}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Persuasive Closing */}
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">סגירה רגשית משכנעת</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {activeStrategy.persuasiveClosing}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="text-[11px] text-slate-400">
            האסטרטגיות נשמרות בקולקציית Firestore וזמינות לכל מודולי הדפים והסליקה
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
