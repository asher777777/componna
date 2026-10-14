import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Youtube, 
  Sparkles, 
  Share2, 
  Calendar, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  Globe 
} from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import { KosunUniversalDock } from '../../../components/Navigation/KosunUniversalDock';
import { kosTubeFirestore } from '../services/kosTubeFirestore';
import { KosTubeSeoPage } from '../types';

export const PublicVideoSeoPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [page, setPage] = useState<KosTubeSeoPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadPage() {
      if (!slug) return;
      setLoading(true);
      try {
        const found = await kosTubeFirestore.getSeoPageBySlug(db, tenantId, slug);
        if (isMounted) {
          setPage(found);
        }
      } catch (err) {
        console.error('[PublicVideoSeoPageView] Error loading page:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadPage();
    return () => {
      isMounted = false;
    };
  }, [db, tenantId, slug]);

  // Inject Schema.org JSON-LD into Document Head for search engines
  useEffect(() => {
    if (!page?.schemaJsonLd) return;

    const scriptId = `schema-jsonld-${page.id}`;
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(page.schemaJsonLd);

    // Update document title and meta description
    if (page.metaTitle) {
      document.title = page.metaTitle;
    }

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">טוען עמוד מקודם...</span>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-800 dark:text-white p-6" dir="rtl">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
            <Youtube className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">עמוד ה-SEO אינו קיים או הוסר</h2>
          <p className="text-xs text-slate-500">
            העמוד שחיפשת לא נמצא במערכת. אנא בדוק את הקישור או חזור לעמוד הראשי.
          </p>
          <Link
            to="/KosTube"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-md hover:bg-red-500 transition"
          >
            <span>חזרה למרכז KosTube</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${page.youtubeVideoId}?rel=0`;

  const handleShare = () => {
    const text = encodeURIComponent(`צפו במאמר המלא: ${page.h1 || page.metaTitle}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-red-500 selection:text-white" dir="rtl">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
              <Youtube className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              {page.channelTitle || 'KosTube'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>שתף בוואטסאפ</span>
          </button>
        </div>
      </header>

      {/* Main Page Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Header Breadcrumbs & Title */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{page.channelTitle || 'יוטיוב'}</span>
            <span>/</span>
            <span className="text-red-600 dark:text-red-400 font-medium">מאמר וידאו מקודם</span>
            <span>/</span>
            <span>{new Date(page.createdAt).toLocaleDateString('he-IL')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {page.h1 || page.metaTitle}
          </h1>

          {page.executiveSummary && (
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {page.executiveSummary}
            </p>
          )}

          {/* Keywords */}
          {page.focusKeywords && page.focusKeywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {page.focusKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-black">
          <iframe
            src={embedUrl}
            title={page.h1 || page.metaTitle}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Key Takeaways */}
        {page.keyTakeaways && page.keyTakeaways.length > 0 && (
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-4">
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>תובנות מרכזיות ונקודות מפתח מהסרטון</span>
            </h3>
            <ul className="space-y-2.5 text-sm md:text-base text-amber-950 dark:text-amber-100">
              {page.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* In-Depth Article Content */}
        <article className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-line font-serif sm:font-sans">
            {page.articleContent}
          </div>
        </article>

        {/* FAQs */}
        {page.faqs && page.faqs.length > 0 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <span>שאלות ותשובות נפוצות</span>
            </h3>
            <div className="space-y-3">
              {page.faqs.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-4 sm:p-5 text-right flex items-center justify-between font-semibold text-sm sm:text-base text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lead Capture via CapabilitySlot */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white shadow-2xl border border-red-500/20 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {page.callToAction?.title || 'רוצים לקחת את המומחיות הזו אליכם?'}
            </h2>
            <p className="text-sm text-slate-300">
              {page.callToAction?.subtitle || 'השאירו פרטים ונחזור אליכם עם מענה אישי ומדויק.'}
            </p>
          </div>

          <div className="max-w-md mx-auto pt-2">
            <CapabilitySlot
              name="form-renderer"
              props={{
                formId: page.callToAction?.formId,
                onSubmitted: () => alert('תודה! פנייתך התקבלה בהצלחה.'),
              }}
              fallback={
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-300">
                  טופס השארת פרטים מוטמע כאן ישירות מתוך המערכת
                </div>
              }
            />
          </div>
        </div>
      </main>

      {/* Floating Universal Dock */}
      <KosunUniversalDock mode="front" />
    </div>
  );
};
