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
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState<boolean>(false);

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
              href={`/KosWebAi?pageId=${selectedPage.pageBuilderPageId || 'page_kosvidio_' + selectedPage.youtubeVideoId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-semibold transition"
              title="פתיחה ועריכה ב-KWB"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ערוך ב-KWB</span>
            </a>

            <a
              href={`/p/${selectedPage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>פתח עמוד חי</span>
            </a>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {activeView === 'preview' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              {/* Meta tags bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">תבנית עמוד:</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono font-bold">Kosvidio (סלאג: {selectedPage.slug})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">קישור ציבורי ישיר:</span>
                  <code className="text-red-500 font-mono">/p/{selectedPage.slug}</code>
                </div>
              </div>

              {/* LAYER 1: בראש העמוד נגן חדשני */}
              <div className="relative group">
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-red-600/20 via-indigo-600/20 to-purple-600/20 blur-2xl opacity-70 pointer-events-none" />
                <div className="relative z-10 aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
                  <iframe
                    src={embedUrl}
                    title={selectedPage.h1}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* LAYER 2: תחתיו הכותרת */}
              <div className="space-y-2 pt-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedPage.h1}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedPage.channelTitle || 'קושאן'}</span>
                  <span>•</span>
                  <span>פורסם לאחרונה</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-semibold">ציון SEO: {selectedPage.seoScore}/100</span>
                </div>
              </div>

              {/* LAYER 3: תחתיו תוויות בעיצוב עדין ואיקונים לשיתוף ברשתות */}
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                  {/* Delicate Tags Toggle Button (Collapsed by default) */}
                  <button
                    type="button"
                    onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-red-500 font-mono text-xs">#</span>
                    <span>תוויות ונושאי הסרטון ({((selectedPage.tags && selectedPage.tags.length > 0 ? selectedPage.tags : (selectedPage.focusKeywords || ['וידאו', 'יוטיוב', 'SEO', 'AISEO']))).length})</span>
                    {isTagsExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/p/' + selectedPage.slug);
                        alert('הקישור הועתק ללוח!');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                    >
                      העתק קישור
                    </button>
                  </div>
                </div>

                {/* Collapsible Tags Area - Folded by default */}
                {isTagsExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                    {(selectedPage.tags && selectedPage.tags.length > 0 ? selectedPage.tags : (selectedPage.focusKeywords || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'])).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        #{tag.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* LAYER 4: תחתיו אזור לתגובות מעוצב כמו ביוטיוב */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden space-y-0">
                {/* Comments Header (Interactive Toggle - Folded by default) */}
                <button
                  type="button"
                  onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                  className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {(selectedPage.youtubeComments || []).length} תגובות
                      </h3>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        {isCommentsExpanded ? 'לחץ לקיפול אזור התגובות' : 'לחץ להצגת תגובות מהסרטון'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span>{isCommentsExpanded ? 'קפל תגובות' : 'הצג תגובות'}</span>
                    {isCommentsExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Collapsible Comments Content - Folded by default */}
                {isCommentsExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex justify-end pt-2">
                      <span className="text-xs text-slate-400">מסודר לפי: מובילות</span>
                    </div>

                    <div className="space-y-3">
                      {(!selectedPage.youtubeComments || selectedPage.youtubeComments.length === 0) ? (
                        <div className="p-4 text-center text-xs text-slate-500 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                          עדיין אין תגובות. תגובות מגולשים בעמוד החי יוצגו כאן בזמן אמת.
                        </div>
                      ) : (
                        selectedPage.youtubeComments.map((comm: any) => (
                          <div key={comm.id} className="flex items-start gap-3 text-xs">
                            <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">
                              {comm.authorName.slice(0, 1)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-slate-800 dark:text-slate-200">{comm.authorName}</span>
                                <span className="text-slate-400 text-[10px]">{comm.publishedAt}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300">{comm.content}</p>
                              <div className="flex items-center gap-2 mt-1 text-slate-400 text-[11px]">
                                <span>👍 {comm.likesCount}</span>
                                <span>•</span>
                                <span>השב</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* LAYER 5: תחתיו תיאור קצר */}
              {selectedPage.executiveSummary && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/20 via-slate-900/40 to-purple-950/20 border border-red-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>על הסרטון בכמה מילים</span>
                  </div>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedPage.executiveSummary}
                  </p>
                </div>
              )}

              {/* LAYER 6: ותחתיו תיאור ארוך לפי דרישות SEO ו-AISEO */}
              <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                {/* Key Takeaways */}
                {selectedPage.keyTakeaways && selectedPage.keyTakeaways.length > 0 && (
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>נקודות מפתח מרכזיות מהסרטון</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {selectedPage.keyTakeaways.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Long Description Article */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    מאמר עומק ומדריך מקיף (SEO & AI-SEO)
                  </h2>
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                    {selectedPage.articleContent}
                  </div>
                </div>

                {/* FAQs */}
                {selectedPage.faqs && selectedPage.faqs.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <span>שאלות ותשובות נפוצות (FAQ)</span>
                    </h3>
                    <div className="space-y-2">
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
                              className="w-full p-3 text-right flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <span>{faq.question}</span>
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {isOpen && (
                              <div className="p-3 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600/10 via-purple-600/10 to-indigo-600/10 border border-red-500/20 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedPage.callToAction?.title || 'מעוניינים בייעוץ והתאמה אישית?'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedPage.callToAction?.subtitle || 'השאירו פרטים ונחזור אליכם בהקדם.'}
                    </p>
                  </div>
                  <a
                    href={selectedPage.callToAction?.buttonLink || '#contact'}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                  >
                    {selectedPage.callToAction?.buttonText || 'לפרטים נוספים'}
                  </a>
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
