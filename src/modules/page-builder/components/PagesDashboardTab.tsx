import React, { useState } from 'react';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import {
  Plus,
  Search,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Home,
  Globe,
  Share2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  Film,
} from 'lucide-react';
import { clsx } from 'clsx';

interface PagesDashboardTabProps {
  pages: PageBuilderConfig[];
  activePageId: string;
  onSelectPage: (page: PageBuilderConfig) => void;
  onNewPage: () => void;
  onOpenAiBuilder: () => void;
  onDuplicatePage: (page: PageBuilderConfig) => void;
  onDeletePage: (pageId: string) => void;
  onSetHomePage: (pageId: string) => void;
  onUnsetHomePage?: (pageId: string) => void;
  onTogglePublish: (page: PageBuilderConfig) => void;
  onOpenShortener: (page: PageBuilderConfig) => void;
  onConvertToVideo?: (page: PageBuilderConfig) => void;
}

export const PagesDashboardTab: React.FC<PagesDashboardTabProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onNewPage,
  onOpenAiBuilder,
  onDuplicatePage,
  onDeletePage,
  onSetHomePage,
  onUnsetHomePage,
  onTogglePublish,
  onOpenShortener,
  onConvertToVideo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      (page.pageTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'published') return matchesSearch && page.published;
    if (filter === 'drafts') return matchesSearch && !page.published;
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-right select-none transition-colors duration-300" dir="rtl">
      {/* Sleek Toolbar: Search, Filters & Compact Icon Actions (No Header Bloat, No Emojis) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-xl mb-6 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם עמוד או קישור..."
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-10 pl-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={clsx(
                'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              הכל ({pages.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('published')}
              className={clsx(
                'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                filter === 'published'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              מפורסמים ({pages.filter((p) => p.published).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('drafts')}
              className={clsx(
                'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                filter === 'drafts'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              טיוטות ({pages.filter((p) => !p.published).length})
            </button>
          </div>

          {/* Action Icon Buttons with Tooltips - Elegant, Small, Zero Emojis */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAiBuilder}
              className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="יוצר עמודים ב-AI"
              aria-label="יוצר עמודים ב-AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onNewPage}
              className="p-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700/80 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="עמוד חדש מאפס"
              aria-label="עמוד חדש מאפס"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
          <Layers className="w-12 h-12 text-slate-400 dark:text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">לא נמצאו עמודים</h3>
            <p className="text-xs text-slate-500 mt-1">צרו עמוד חדש או היעזרו בעוזר ה-AI לבניית עמוד מושלם בלייב.</p>
          </div>
          <button
            type="button"
            onClick={onOpenAiBuilder}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            title="יוצר עמודים ב-AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>הפעל יוצר עמודים ב-AI</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => {
            const isHome = page.isHomePage;
            const isCurrent = page.pageId === activePageId;
            const sectionsCount = page.sectionOrder?.length || 0;

            return (
              <div
                key={page.pageId}
                className={clsx(
                  'group relative bg-white dark:bg-slate-900/90 border rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 shadow-sm hover:shadow-xl',
                  isHome
                    ? 'border-amber-500/50 shadow-amber-500/10'
                    : isCurrent
                    ? 'border-indigo-500/60 shadow-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isHome && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        <Home className="w-3.5 h-3.5" />
                        <span>עמוד בית ראשי</span>
                      </span>
                    )}
                    {page.published ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>מפורסם באוויר</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <span>טיוטה</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {sectionsCount} אזורים
                  </span>
                </div>

                {/* Page Title & Slug */}
                <div className="flex flex-col gap-2 text-right">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {page.pageTitle || 'עמוד ללא שם'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span className="truncate">/{page.slug || page.pageId}</span>
                  </div>
                  {page.seoSettings?.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {page.seoSettings.description}
                    </p>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  {/* Convert Page to Interactive Video CTA */}
                  {onConvertToVideo && (
                    <button
                      type="button"
                      onClick={() => onConvertToVideo(page)}
                      className="w-full py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 hover:text-purple-900 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      title="צור עץ וידאו אינטראקטיבי לעמוד זה בסטודיו"
                    >
                      <Film className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                      <span>צור עץ וידאו אינטראקטיבי</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPage(page)}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ערוך עמוד</span>
                    </button>

                    <a
                      href={`/p/${page.slug || page.pageId}${!page.published ? '?preview=true' : ''}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                      title={page.published ? 'צפה בעמוד באוויר' : 'תצוגה מקדימה'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenShortener(page)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="קישור מקוצר ו-QR"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    {!isHome ? (
                      <button
                        type="button"
                        onClick={() => onSetHomePage(page.pageId)}
                        className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-amber-400/10 cursor-pointer"
                        title="קבע כעמוד הראשי של האתר"
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>קבע כעמוד הבית</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUnsetHomePage ? onUnsetHomePage(page.pageId) : onSetHomePage('')}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1.5 transition-all bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-500/30 cursor-pointer group"
                        title="עמוד הבית הפעיל של המערכת - לחץ לביטול וחזרה לרכיב החנות"
                      >
                        <Home className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 group-hover:scale-110 transition-transform" />
                        <span>עמוד בית פעיל (לחץ לביטול)</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDuplicatePage(page)}
                        className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 transition-colors cursor-pointer"
                        title="שכפל עמוד"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePage(page.pageId)}
                        className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="מחק עמוד"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
