import React, { useState, useRef, useEffect } from 'react';
import {
  PageBuilderConfig,
  PageCategory,
  PAGE_CATEGORIES,
  getCategoryFromPage,
} from '../types/pageBuilder.types';
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
  ChevronDown,
  Check,
  FileText,
  ShoppingBag,
  BookOpen,
  X,
  HeartHandshake,
  Youtube,
} from 'lucide-react';
import { clsx } from 'clsx';
import { CreatePageWizardModal, PageCreationOptions } from './CreatePageWizardModal';

interface PagesDashboardTabProps {
  pages: PageBuilderConfig[];
  activePageId: string;
  onSelectPage: (page: PageBuilderConfig) => void;
  onNewPage: (options: PageCreationOptions | PageCategory) => void;
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | PageCategory>('all');
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [openPublishDropdownPageId, setOpenPublishDropdownPageId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenPublishDropdownPageId(null);
      }
    };
    if (openPublishDropdownPageId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPublishDropdownPageId]);

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      (page.pageTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'published' && !page.published) return false;
    if (filter === 'drafts' && page.published) return false;

    if (selectedCategory !== 'all') {
      const cat = getCategoryFromPage(page);
      if (cat !== selectedCategory) return false;
    }

    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-right select-none transition-colors duration-300" dir="rtl">
      {/* Top Brand Header Bar: K SVG from gallery on the left, KosWebBulider, Slogan */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col items-start text-left" dir="ltr">
          <div className="flex items-center gap-3">
            {/* K SVG from gallery - on the left */}
            <img
              src="/images/kosun-symbol.svg"
              alt="K"
              className="w-9 h-9 rounded-xl object-contain animate-pulse shrink-0 drop-shadow-md"
            />
            {/* Brand Name */}
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              KosWebBulider
            </span>
          </div>
          {/* Small Slogan */}
          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 pl-1">
            Building Your Digital Interaction
          </span>
        </div>
      </div>

      {/* Sleek Toolbar: Search, Filters & Compact Icon Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 sm:p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-xl mb-6 shadow-sm">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם עמוד או קישור..."
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-10 pl-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          {/* Category Filter Pills (KOSASS, KOSINFO, KOSEVENT, KOSFUNRISE, KOSTUBE, P) */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                selectedCategory === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              הכל
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('service_product')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                selectedCategory === 'service_product'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              )}
              title="עמודי שירות / מוצר (KOSASS)"
            >
              <span>KOSASS</span>
              <span className="text-[10px] opacity-75">
                ({pages.filter((p) => getCategoryFromPage(p) === 'service_product').length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('info_content')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                selectedCategory === 'info_content'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              )}
              title="עמודי מידע ותוכן (KOSINFO)"
            >
              <span>KOSINFO</span>
              <span className="text-[10px] opacity-75">
                ({pages.filter((p) => getCategoryFromPage(p) === 'info_content').length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('event')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                selectedCategory === 'event'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
              )}
              title="עמודי אירועים (KOSEVENT)"
            >
              <span>KOSEVENT</span>
              <span className="text-[10px] opacity-75">
                ({pages.filter((p) => getCategoryFromPage(p) === 'event').length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('fundraising')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                selectedCategory === 'fundraising'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
              )}
              title="קמפיין וגיוס כספים (KOSFUNRISE)"
            >
              <span>KOSFUNRISE</span>
              <span className="text-[10px] opacity-75">
                ({pages.filter((p) => getCategoryFromPage(p) === 'fundraising').length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('youtube_post')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                selectedCategory === 'youtube_post'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
              )}
              title="פוסט וידאו יוטיוב (KOSTUBE)"
            >
              <span>KOSTUBE</span>
              <span className="text-[10px] opacity-75">
                ({pages.filter((p) => getCategoryFromPage(p) === 'youtube_post').length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('general')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                selectedCategory === 'general'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
              title="עמודים כלליים (P)"
            >
              <span>P</span>
              <span className="text-[10px] opacity-75">
                ({pages.filter((p) => getCategoryFromPage(p) === 'general').length})
              </span>
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              סטטוס
            </button>
            <button
              type="button"
              onClick={() => setFilter('published')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                filter === 'published'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              באוויר ({pages.filter((p) => p.published).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('drafts')}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                filter === 'drafts'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              טיוטות ({pages.filter((p) => !p.published).length})
            </button>
          </div>

          {/* Action Icon Buttons */}
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
              onClick={() => setIsNewPageModalOpen(true)}
              className="px-3 py-2 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700/80 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-bold"
              title="עמוד חדש מאפס"
              aria-label="עמוד חדש מאפס"
            >
              <Plus className="w-4 h-4" />
              <span>עמוד חדש</span>
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
                    {/* Interactive Publish Status Dropdown Menu */}
                    <div
                      className="relative"
                      ref={openPublishDropdownPageId === page.pageId ? dropdownRef : null}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenPublishDropdownPageId(
                            openPublishDropdownPageId === page.pageId ? null : page.pageId
                          );
                        }}
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-xs select-none',
                          page.published
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        )}
                        title="לחצו לשינוי סטטוס עמוד (באוויר / טיוטה)"
                      >
                        {page.published ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>באוויר</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                            <span>טיוטה</span>
                          </>
                        )}
                        <ChevronDown className={clsx("w-3 h-3 transition-transform duration-200", openPublishDropdownPageId === page.pageId && "rotate-180")} />
                      </button>

                      {/* Dropdown Menu */}
                      {openPublishDropdownPageId === page.pageId && (
                        <div
                          className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-30 p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
                          dir="rtl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Option 1: Live (באוויר) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!page.published) {
                                onTogglePublish(page);
                              }
                              setOpenPublishDropdownPageId(null);
                            }}
                            className={clsx(
                              "w-full flex items-center justify-between p-2 rounded-xl text-right text-xs transition-colors cursor-pointer",
                              page.published
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold">באוויר</span>
                                <span className="text-[10px] text-slate-400 font-normal">גלוי לכל הגולשים</span>
                              </div>
                            </div>
                            {page.published && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          </button>

                          {/* Option 2: Draft (טיוטה) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (page.published) {
                                onTogglePublish(page);
                              }
                              setOpenPublishDropdownPageId(null);
                            }}
                            className={clsx(
                              "w-full flex items-center justify-between p-2 rounded-xl text-right text-xs transition-colors cursor-pointer",
                              !page.published
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-slate-500/10 text-slate-500 flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold">טיוטה</span>
                                <span className="text-[10px] text-slate-400 font-normal">פרטי ומוסתר מהרשת</span>
                              </div>
                            </div>
                            {!page.published && <Check className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const cat = getCategoryFromPage(page);
                      if (!cat) return null;
                      const meta = PAGE_CATEGORIES[cat];
                      return (
                        <span
                          className={clsx(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 font-mono',
                            meta.badgeStyle
                          )}
                          title={`${meta.label} (${meta.slugPrefix})`}
                        >
                          {meta.slugPrefix}
                        </span>
                      );
                    })()}

                    <span className="text-[11px] text-slate-500 font-mono">
                      {sectionsCount} אזורים
                    </span>
                  </div>
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
                      href={`/${(page.slug || page.pageId).replace(/^\/?p\//i, '')}${!page.published ? '?preview=true' : ''}`}
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

      {/* Interactive Page Creation Wizard Modal */}
      <CreatePageWizardModal
        isOpen={isNewPageModalOpen}
        onClose={() => setIsNewPageModalOpen(false)}
        onConfirm={async (options) => {
          onNewPage(options);
        }}
      />
    </div>
  );
};
