import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  ExternalLink, 
  Code2, 
  FileText, 
  TrendingUp, 
  Share2, 
  Youtube, 
  Check, 
  Copy, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { KosTubeFullscreenModal } from './KosTubeFullscreenModal';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import { useKosTube } from '../context/KosTubeContext';
import { KosTubeSeoPage } from '../types';

export const KosTubePagePreviewModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, modalMode, selectedPage, videos } = useKosTube();
  const [activeView, setActiveView] = useState<'preview' | 'schema' | 'breakdown'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isModalOpen || !selectedPage || (modalMode !== 'page_preview' && modalMode !== 'schema_view')) {
    return null;
  }

  const video = videos.find((v) => v.id === selectedPage.videoId || v.youtubeVideoId === selectedPage.youtubeVideoId);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${selectedPage.youtubeVideoId}?rel=0`;

  const handleCopySchema = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(selectedPage.schemaJsonLd, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`צפו במאמר המלא ובסרטון: ${selectedPage.h1 || selectedPage.metaTitle}\n${window.location.origin}/tube/${selectedPage.slug}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <KosTubeFullscreenModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={`עמוד SEO: ${selectedPage.h1 || selectedPage.metaTitle}`}
    >
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white" dir="rtl">
        {/* Top Control Bar */}
        <div className="flex-shrink-0 px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('preview')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeView === 'preview'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>תצוגת עמוד חי</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('breakdown')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeView === 'breakdown'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ציון SEO ({selectedPage.seoScore}/100)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('schema')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeView === 'schema'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>סכמת JSON-LD</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>שתף בוואטסאפ</span>
            </button>

            <a
              href={`/tube/${selectedPage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>פתח עמוד ציבורי</span>
            </a>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {activeView === 'preview' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              {/* Meta tags bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Meta Title:</span>
                  <span>{selectedPage.metaTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Meta Description:</span>
                  <span>{selectedPage.metaDescription}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">סלאג URL:</span>
                  <code className="text-red-500 font-mono">/tube/{selectedPage.slug}</code>
                </div>
              </div>

              {/* Page Title & Header */}
              <div className="text-center space-y-3">
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  {selectedPage.channelTitle || 'ערוץ יוטיוב'} • מאמר מקודם
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedPage.h1}
                </h1>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                  {selectedPage.executiveSummary}
                </p>
              </div>

              {/* YouTube Embed Player */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-black">
                <iframe
                  src={embedUrl}
                  title={selectedPage.h1}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Key Takeaways Card */}
              {selectedPage.keyTakeaways && selectedPage.keyTakeaways.length > 0 && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/40">
                  <h3 className="text-base font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>נקודות מפתח מרכזיות מהסרטון</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-950 dark:text-amber-100">
                    {selectedPage.keyTakeaways.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* In-depth Article Content */}
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  מאמר עומק ומדריך מקיף
                </h2>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {selectedPage.articleContent}
                </div>
              </div>

              {/* FAQs Accordion */}
              {selectedPage.faqs && selectedPage.faqs.length > 0 && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <span>שאלות ותשובות נפוצות (FAQ)</span>
                  </h3>
                  <div className="space-y-3">
                    {selectedPage.faqs.map((faq, i) => {
                      const isOpen = openFaqIndex === i;
                      return (
                        <div
                          key={i}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                            className="w-full p-4 text-right flex items-center justify-between font-semibold text-sm text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <span>{faq.question}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {isOpen && (
                            <div className="p-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CapabilitySlot for Smart Lead Capture Form */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border border-slate-700 text-center space-y-4">
                <h3 className="text-xl font-bold">
                  {selectedPage.callToAction?.title || 'מעוניינים בייעוץ והתאמה אישית?'}
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  {selectedPage.callToAction?.subtitle || 'השאירו פרטים ונחזור אליכם בהקדם האפשרי'}
                </p>

                <div className="pt-2 max-w-lg mx-auto">
                  <CapabilitySlot
                    name="form-renderer"
                    props={{
                      formId: selectedPage.callToAction?.formId,
                      onSubmitted: () => alert('תודה! פנייתך נשלחה בהצלחה.'),
                    }}
                    fallback={
                      <div className="p-5 rounded-xl border border-dashed border-slate-600 text-center text-xs text-slate-400">
                        טופס לידים חכם יוטמע כאן אוטומטית (חיבור CapabilitySlot)
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeView === 'breakdown' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-4 border-emerald-500 text-emerald-600 dark:text-emerald-400 text-3xl font-black mb-3">
                  {selectedPage.seoScore}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">ציון איכות קידום כולל</h3>
                <p className="text-xs text-slate-500 mt-1">מחושב לפי אלגוריתם הדירוג והסכמות של Google</p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">פירוט מדדים מפורט:</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">אורך ואיכות כותרת Meta Title</span>
                    <span className="font-bold text-emerald-600">{selectedPage.seoScoreBreakdown?.titleLengthScore || 18}/20</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">תיאור Meta Description שיווקי</span>
                    <span className="font-bold text-emerald-600">{selectedPage.seoScoreBreakdown?.descriptionLengthScore || 18}/20</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">צפיפות מילות מפתח Focus Keywords</span>
                    <span className="font-bold text-emerald-600">{selectedPage.seoScoreBreakdown?.keywordsDensityScore || 15}/15</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">מבנה כותרות H1, H2, H3 היררכי</span>
                    <span className="font-bold text-emerald-600">{selectedPage.seoScoreBreakdown?.headingsStructureScore || 15}/15</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">סכמת נתונים JSON-LD מובנית</span>
                    <span className="font-bold text-emerald-600">{selectedPage.seoScoreBreakdown?.schemaScore || 15}/15</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">עומק טקסט ורמת קריאות (Readability)</span>
                    <span className="font-bold text-emerald-600">{selectedPage.seoScoreBreakdown?.readabilityScore || 15}/15</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'schema' && (
            <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  קוד סכמה מוכן להטמעה ב-Google Rich Results (JSON-LD)
                </span>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-medium transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'הועתק ללוח!' : 'העתק סכמה'}</span>
                </button>
              </div>

              <pre className="p-5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner max-h-[500px]">
                {JSON.stringify(selectedPage.schemaJsonLd, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </KosTubeFullscreenModal>
  );
};
