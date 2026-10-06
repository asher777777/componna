import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Layers,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { MediaItem } from '../types';
import { useDocToLandingPage } from '../hooks/useDocToLandingPage';

interface DocToLandingPageModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const DocToLandingPageModal: React.FC<DocToLandingPageModalProps> = ({
  item,
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const { isGenerating, error, generatedPage, generateLandingPage, setGeneratedPage } =
    useDocToLandingPage();

  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');

  if (!isOpen || !item) return null;

  const handleStartGeneration = async () => {
    await generateLandingPage(item);
  };

  const handleCopyJson = () => {
    if (!generatedPage) return;
    navigator.clipboard.writeText(JSON.stringify(generatedPage, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div
        className={`w-full max-w-4xl h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`h-14 px-4 border-b flex items-center justify-between flex-shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">
                מחולל עמודי נחיתה ממסמכים (AI Doc-to-Landing)
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                מקור: {item.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {generatedPage && (
              <>
                {/* Tab switch */}
                <div className="flex rounded-xl bg-slate-800 p-0.5 border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeTab === 'preview' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    תצוגה מקדימה
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeTab === 'json' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JSON
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                  title="העתק JSON של הדף"
                >
                  {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-red-50 border-slate-200 text-slate-500' : 'bg-slate-800 hover:bg-red-950/40 border-slate-700 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
          {!generatedPage && !isGenerating && (
            <div className="max-w-xl mx-auto py-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl">
                <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black">הפיכת מסמך לדף נחיתה אינטראקטיבי</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  ה-AI ינתח את תוכן המסמך (PDF, הצעה, פלייר או תמונה), יחלץ את נקודות החוזקה, התמחור,
                  והשאלות הנפוצות, וייצר אוטומטית מבנה דף נחיתה שיווקי מעוצב עם התאמה מלאה למותג שלך.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-right text-xs space-y-2 text-purple-200">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ניתוח מלא של הצעות מחיר, ברושורים וקבצים</span>
                </div>
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>שילוב זהות המותג וצבעי DNA באופן אוטומטי</span>
                </div>
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>שידור ישיר לבונה הדפים (Page Builder) דרך EventBus</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartGeneration}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.01]"
              >
                <Sparkles className="w-5 h-5" />
                <span>התחל יצירת דף נחיתה מהמסמך</span>
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="max-w-md mx-auto py-20 text-center space-y-6">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
              <div className="space-y-2">
                <h4 className="text-lg font-bold">סורק ומעבד את המסמך...</h4>
                <p className="text-xs text-slate-400">
                  מודל Gemini Vision מנתח את הטקסט והמבנה ומייצר כותרות, יתרונות ומחירים.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm mb-4">
              {error}
            </div>
          )}

          {generatedPage && !isGenerating && (
            <div>
              {activeTab === 'json' ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto" dir="ltr">
                  <pre>{JSON.stringify(generatedPage, null, 2)}</pre>
                </div>
              ) : (
                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Hero Preview Box */}
                  {generatedPage.sections?.find((s) => s.type === 'hero') && (() => {
                    const hero = generatedPage.sections.find((s) => s.type === 'hero');
                    return (
                      <div
                        className="p-8 rounded-3xl text-center space-y-4 shadow-xl border relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${generatedPage.brandStyles?.primaryColor || '#4f46e5'}22, ${generatedPage.brandStyles?.secondaryColor || '#7c3aed'}33)`,
                          borderColor: generatedPage.brandStyles?.primaryColor || '#6366f1',
                        }}
                      >
                        {hero?.badge && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {hero.badge}
                          </span>
                        )}
                        <h2 className="text-2xl sm:text-3xl font-black">{hero?.title}</h2>
                        <p className="text-sm text-slate-300 max-w-lg mx-auto">{hero?.subtitle}</p>
                        {hero?.ctaText && (
                          <div className="pt-2">
                            <span
                              className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg cursor-pointer"
                              style={{ backgroundColor: generatedPage.brandStyles?.primaryColor || '#6366f1' }}
                            >
                              {hero.ctaText}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Features / Benefits */}
                  {generatedPage.sections?.find((s) => s.type === 'features') && (() => {
                    const sec = generatedPage.sections.find((s) => s.type === 'features');
                    return (
                      <div className="space-y-3">
                        <h4 className="font-bold text-base text-slate-300">{sec?.title || 'יתרונות מרכזיים'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(sec?.items || []).map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl border border-slate-800 bg-slate-800/40 space-y-1.5"
                            >
                              <div className="flex items-center gap-2 font-bold text-sm text-purple-400">
                                <Zap className="w-4 h-4" />
                                <span>{item.title}</span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Pricing / Packages */}
                  {generatedPage.sections?.find((s) => s.type === 'pricing') && (() => {
                    const sec = generatedPage.sections.find((s) => s.type === 'pricing');
                    return (
                      <div className="space-y-3">
                        <h4 className="font-bold text-base text-slate-300">{sec?.title || 'חבילות ומחירים'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(sec?.packages || []).map((pkg: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-5 rounded-2xl border border-purple-500/40 bg-purple-950/20 space-y-3 text-center"
                            >
                              <h5 className="font-bold text-sm">{pkg.name}</h5>
                              <div className="text-2xl font-black text-amber-400">{pkg.price}</div>
                              <div className="text-[11px] text-slate-400">{pkg.period}</div>
                              {pkg.features && (
                                <ul className="text-xs text-right space-y-1.5 pt-2 border-t border-purple-500/20 text-slate-300">
                                  {pkg.features.map((f: string, fi: number) => (
                                    <li key={fi} className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* FAQ */}
                  {generatedPage.sections?.find((s) => s.type === 'faq') && (() => {
                    const sec = generatedPage.sections.find((s) => s.type === 'faq');
                    return (
                      <div className="space-y-3">
                        <h4 className="font-bold text-base text-slate-300">{sec?.title || 'שאלות ותשובות'}</h4>
                        <div className="space-y-2">
                          {(sec?.items || []).map((faq: any, idx: number) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/30 space-y-1 text-xs">
                              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{faq.question}</span>
                              </div>
                              <p className="text-slate-400 pr-5">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Success notification banner */}
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>האירוע שודר בהצלחה ל-EventBus עבור בונה הדפים!</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                    >
                      העתק JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
