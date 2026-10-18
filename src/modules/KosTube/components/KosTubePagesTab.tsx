import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Trash2, 
  Copy, 
  Check, 
  TrendingUp, 
  Sparkles, 
  FileText, 
  Code2, 
  Eye, 
  Share2 
} from 'lucide-react';
import { useKosTube } from '../context/KosTubeContext';
import { KosTubeSeoPage } from '../types';

export const KosTubePagesTab: React.FC = () => {
  const { 
    seoPages, 
    deleteSeoPage, 
    setSelectedPage, 
    setIsModalOpen, 
    setModalMode, 
    setActiveTab 
  } = useKosTube();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySchema = (page: KosTubeSeoPage) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(page.schemaJsonLd, null, 2));
      setCopiedId(page.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            <span>עמודי SEO מקודמים פעילים ({seoPages.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            כל עמוד כולל מאמר עומק ייחודי, נגן יוטיוב מוטמע, מטא-דאטה עשירה וסכמת JSON-LD מלאה לסריקת מנועי חיפוש.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>צור עמוד מסרטון נוסף</span>
        </button>
      </div>

      {/* Pages List */}
      {seoPages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">טרם נוצרו עמודי SEO</h4>
          <p className="text-xs text-slate-500 mt-1">
            עבור לטאב "סרטונים בערוץ" ולחץ על "צור עמוד SEO" כדי להפיק מאמרים מקודמים ראשונים.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {seoPages.map((page) => (
            <div
              key={page.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/30 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreBadgeClass(
                      page.seoScore
                    )}`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>ציון SEO: {page.seoScore}/100</span>
                  </span>

                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" dir="ltr">
                    {page.publicUrl || (page.slug?.startsWith('kosvidio/') ? `/${page.slug}` : `/kosvidio/${page.slug}`)}
                  </span>

                  <span className="text-xs text-slate-400">
                    {new Date(page.createdAt).toLocaleDateString('he-IL')}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {page.h1 || page.metaTitle}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {page.metaDescription}
                </p>

                {page.focusKeywords && page.focusKeywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {page.focusKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPage(page);
                    setModalMode('page_preview');
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>תצוגה מקדימה</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPage(page);
                    setModalMode('schema_view');
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
                  title="צפה בסכמת JSON-LD"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>סכמה</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopySchema(page)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="העתק סכמת JSON-LD"
                >
                  {copiedId === page.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <a
                  href={page.publicUrl || (page.slug?.startsWith('kosvidio/') ? `/${page.slug}` : `/kosvidio/${page.slug}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="פתח עמוד ציבורי בכרטיסייה חדשה"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('האם אתה בטוח שברצונך למחוק עמוד SEO זה?')) {
                      deleteSeoPage(page.id, page.videoId);
                    }
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="מחק עמוד"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
