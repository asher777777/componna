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
  Film
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
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-400" />
            <span>ניהול עמודים ודפי נחיתה</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            צפו בכל העמודים שנבנו במערכת, נהלו פרסום, הגדירו את עמוד הבית והמירו דפים סטטיים לעצי וידאו אינטראקטיביים.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenAiBuilder}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>יוצר עמודים ב-AI ✨</span>
          </button>

          <button
            type="button"
            onClick={onNewPage}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>עמוד חדש מאפס</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם עמוד או קישור..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={clsx(
              'px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            הכל ({pages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('published')}
            className={clsx(
              'px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
              filter === 'published' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            מפורסמים ({pages.filter((p) => p.published).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('drafts')}
            className={clsx(
              'px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
              filter === 'drafts' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            טיוטות ({pages.filter((p) => !p.published).length})
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center gap-4">
          <Layers className="w-12 h-12 text-slate-700" />
          <div>
            <h3 className="text-base font-bold text-white">לא נמצאו עמודים</h3>
            <p className="text-xs text-slate-500 mt-1">צרו עמוד חדש או היעזרו בעוזר ה-AI לבניית עמוד מושלם בלייב.</p>
          </div>
          <button
            type="button"
            onClick={onOpenAiBuilder}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
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
                  'group relative bg-slate-900/90 border rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 shadow-xl',
                  isHome
                    ? 'border-amber-500/50 shadow-amber-500/10'
                    : isCurrent
                    ? 'border-indigo-500/60 shadow-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                )}
              >
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isHome && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Home className="w-3.5 h-3.5" />
                        <span>עמוד הבית הראשי 🏠</span>
                      </span>
                    )}
                    {page.published ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>מפורסם באוויר</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
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
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {page.pageTitle || 'עמוד ללא שם'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono" dir="ltr">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">/{page.slug || page.pageId}</span>
                  </div>
                  {page.seoSettings?.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {page.seoSettings.description}
                    </p>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col gap-3">
                  
                  {/* Convert Page to Interactive Video CTA */}
                  {onConvertToVideo && (
                    <button
                      type="button"
                      onClick={() => onConvertToVideo(page)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-800/80 hover:to-pink-800/80 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      title="צור עץ וידאו אינטראקטיבי לעמוד זה בסטודיו"
                    >
                      <Film className="w-3.5 h-3.5 text-pink-400" />
                      <span>🎬 צור עץ וידאו אינטראקטיבי ב-AI</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPage(page)}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ערוך עמוד</span>
                    </button>

                    <a
                      href={`/p/${page.slug || page.pageId}${!page.published ? '?preview=true' : ''}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title={page.published ? 'צפה בעמוד באוויר' : 'תצוגה מקדימה'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenShortener(page)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
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
                        className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>קבע כעמוד הבית</span>
                      </button>
                    ) : (
                      <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" />
                        <span>עמוד בית פעיל</span>
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDuplicatePage(page)}
                        className="text-slate-400 hover:text-white p-1 transition-colors"
                        title="שכפל עמוד"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePage(page.pageId)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
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
