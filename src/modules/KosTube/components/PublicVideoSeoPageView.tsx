import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Youtube, 
  Sparkles, 
  Share2, 
  Calendar, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Eye, 
  Check, 
  Copy,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Maximize2,
  Minimize2,
  ExternalLink,
  Shield,
  Play
} from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import { KosunUniversalDock } from '../../../components/Navigation/KosunUniversalDock';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { doc, getDoc } from 'firebase/firestore';
import { kosTubeFirestore } from '../services/kosTubeFirestore';
import { KosTubeSeoPage } from '../types';

export const PublicVideoSeoPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [page, setPage] = useState<KosTubeSeoPage | null>(null);
  const [brandDna, setBrandDna] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Truthful metrics state
  const [pageViewsCount, setPageViewsCount] = useState<number>(0);
  const [pageLikesCount, setPageLikesCount] = useState<number>(0);
  const [isPageLiked, setIsPageLiked] = useState<boolean>(false);

  // Local comments state for visitor interaction (NO MOCK DATA)
  const [commentsList, setCommentsList] = useState<Array<{
    id: string;
    authorName: string;
    publishedAt: string;
    content: string;
    likesCount: number;
    userLiked?: boolean;
  }>>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthorInput, setCommentAuthorInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Tags & Comments collapse states (folded/collapsed by default)
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPageAndBrand() {
      if (!slug) return;
      setLoading(true);
      try {
        // 1. Load tenant brand DNA
        if (db) {
          try {
            const bRef = doc(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
            const bSnap = await getDoc(bRef);
            if (isMounted && bSnap.exists()) {
              setBrandDna(bSnap.data());
            }
          } catch (bErr) {
            console.warn('[PublicVideoSeoPageView] load brand DNA error:', bErr);
          }
        }

        // 2. Load SEO page by slug
        const found = await kosTubeFirestore.getSeoPageBySlug(db, tenantId, slug);
        if (isMounted && found) {
          setPage(found);
          setPageLikesCount(Number(found.likeCount || 0));

          // Real comments only (no fabricated names)
          if (found.youtubeComments && found.youtubeComments.length > 0) {
            setCommentsList(found.youtubeComments);
          } else {
            setCommentsList([]);
          }

          // Track authentic page views (increment once per visitor session)
          const sessionKey = `kosvidio_viewed_${found.id}`;
          let currentViews = Number(found.pageViewsCount || 0);
          if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, '1');
            currentViews += 1;
            kosTubeFirestore.incrementPageViews(db, tenantId, found.id, found.pageBuilderPageId);
          }
          setPageViewsCount(currentViews);
        }
      } catch (err) {
        console.error('[PublicVideoSeoPageView] Error loading page:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadPageAndBrand();
    return () => {
      isMounted = false;
    };
  }, [db, tenantId, slug]);

  const [, setThemeVersion] = useState(0);
  useEffect(() => {
    const handleThemeChange = () => setThemeVersion((v) => v + 1);
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

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
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">טוען עמוד וידאו ו-SEO...</span>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white p-6" dir="rtl">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-950/40 text-red-500 mx-auto flex items-center justify-center">
            <Youtube className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">עמוד ה-SEO אינו קיים או הוסר</h2>
          <p className="text-xs text-slate-400">
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

  const embedUrl = `https://www.youtube-nocookie.com/embed/${page.youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`${page.h1 || page.metaTitle}\n${currentUrl}`);

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleToggleLike = (commentId: string) => {
    setCommentsList((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextLiked = !c.userLiked;
          return {
            ...c,
            userLiked: nextLiked,
            likesCount: nextLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
          };
        }
        return c;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      authorName: commentAuthorInput.trim() || 'אורח/ת באתר',
      publishedAt: 'כרגע',
      content: newCommentText.trim(),
      likesCount: 1,
      userLiked: true,
    };

    setCommentsList([newComment, ...commentsList]);
    setNewCommentText('');
    setIsInputFocused(false);
  };

  const displayTags = page.tags && page.tags.length > 0 ? page.tags : (page.focusKeywords || ['וידאו', 'יוטיוב', 'SEO', 'AISEO']);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 font-sans selection:bg-red-600 selection:text-white transition-colors duration-300" dir="rtl">
      {/* Top Banner Navigation with Tenant Branding */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-[#090b14]/85 border-b border-slate-200 dark:border-slate-800/80 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandDna?.identity?.logoUrl ? (
              <img
                src={brandDna.identity.logoUrl}
                alt={brandDna?.identity?.companyName || 'לוגו העסק'}
                className="h-9 w-auto max-w-[150px] object-contain rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-600/20">
                {(brandDna?.identity?.companyName || 'קושאן').slice(0, 2)}
              </div>
            )}
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block">
                {brandDna?.identity?.companyName || 'קושאן'}
              </span>
              <span className="block text-[11px] text-slate-400 -mt-0.5 font-medium">
                {brandDna?.identity?.slogan || 'וידאו חכם ומאמרי AI SEO'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {brandDna?.trust?.whatsappSupportNumber && (
              <a
                href={`https://wa.me/${brandDna.trust.whatsappSupportNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">וואטסאפ ישיר</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'הועתק!' : 'העתק קישור'}</span>
            </button>

            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition hover:scale-105"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>שיתוף</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Page Article Container */}
      <main className={`mx-auto px-3 sm:px-6 py-8 md:py-12 transition-all duration-500 ${isTheaterMode ? 'max-w-7xl' : 'max-w-5xl'}`}>

        {/* ============================================================== */}
        {/* 1. בראש העמוד נגן חדשני (Innovative Video Player)              */}
        {/* ============================================================== */}
        <div className="relative group mb-6">
          {/* Ambient Lighting Glow Behind the Player */}
          <div className="absolute -inset-3 sm:-inset-5 rounded-3xl bg-gradient-to-r from-red-600/25 via-indigo-600/20 to-purple-600/25 blur-3xl opacity-75 group-hover:opacity-95 transition-opacity duration-700 pointer-events-none" />

          <div className="relative z-10 bg-black/95 rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-white/10">
            {/* Top Player Ambient Header Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-slate-200">נגן וידאו Kosvidio</span>
              </div>

              <button
                type="button"
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
                title={isTheaterMode ? 'מצב רגיל' : 'מצב קולנוע'}
              >
                {isTheaterMode ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">מצב רגיל</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">מצב קולנוע</span>
                  </>
                )}
              </button>
            </div>

            {/* 16:9 Responsive Video Frame with Anti-leak protection */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center group/video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${page.youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&playsinline=1`}
                title={page.h1 || page.metaTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Anti-leak YouTube Redirect Shield (intercepts accidental click away to youtube.com) */}
              <div 
                className="absolute bottom-0 right-0 w-32 h-14 z-20 pointer-events-auto cursor-default bg-transparent"
                title="נגן וידאו ישיר באתר"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. תחתיו הכותרת (Title & Metadata & Truthful Stats)            */}
        {/* ============================================================== */}
        <div className="mb-5 pb-5 border-b border-slate-800/60">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm mb-3">
            {page.h1 || page.metaTitle}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Creator / Channel Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/10 overflow-hidden">
                {(page.channelTitle || 'יוטיוב').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <span>{page.channelTitle || 'ערוץ וידאו'}</span>
                  <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                </div>
                <div className="text-[11px] text-slate-400">יוצר התוכן והערוץ המקורי</div>
              </div>
            </div>

            {/* Engagement Stats Bar (Truthful metrics only) */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              {/* Real Page Views Counter */}
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-semibold shadow-sm"
                title="כמות כניסות וצפיות אמיתיות בעמוד האתר"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>{pageViewsCount.toLocaleString('he-IL')} צפיות בעמוד</span>
              </div>

              {/* YouTube Video Views (Truthful from API, only shown if present) */}
              {page.viewCount !== undefined && page.viewCount > 0 && (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium shadow-sm"
                  title="נתוני צפיות רשמיים מיוטיוב"
                >
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>{page.viewCount.toLocaleString('he-IL')} ביוטיוב</span>
                </div>
              )}

              {/* Interactive Like Action Pill */}
              <div className="flex items-center rounded-full bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsPageLiked(!isPageLiked);
                    setPageLikesCount((prev) => (isPageLiked ? Math.max(0, prev - 1) : prev + 1));
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors ${
                    isPageLiked
                      ? 'text-red-400 bg-red-500/10'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                  title="סימון לייק"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isPageLiked ? 'fill-red-400 text-red-400' : 'text-slate-400'}`} />
                  <span>{pageLikesCount.toLocaleString('he-IL')}</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-800" />
                <button
                  type="button"
                  className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="לא אהבתי"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Comments Jump Pill */}
              <button
                type="button"
                onClick={() => {
                  setIsCommentsExpanded(true);
                  setTimeout(() => {
                    document.getElementById('kosvidio-comments')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium transition-colors shadow-sm cursor-pointer"
                title="קפיצה לאזור התגובות"
              >
                <MessageSquare className="w-4 h-4 text-red-500" />
                <span>{commentsList.length} תגובות</span>
              </button>

              {/* SEO Score Badge */}
              <div className="hidden sm:flex items-center gap-1 px-2 text-slate-400 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>ציון SEO: {page.seoScore}/100</span>
              </div>
            </div>
          </div>

          {/* Tenant Ownership & Creator Credit Badge */}
          <div className="mt-3.5 p-2.5 px-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>
                העמוד והתוכן מנוהלים על ידי <strong>{brandDna?.identity?.companyName || 'קושאן'}</strong>
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              קרדיט וזכויות תוכן וידאו: <strong>{page.channelTitle || 'יוטיוב'}</strong>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. תחתיו תוויות בעיצוב עדין ואיקונים לשיתוף ברשתות             */}
        {/* ============================================================== */}
        <div className="mb-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm overflow-hidden transition-all">
          <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Delicate Tags Toggle Button (Collapsed by default) */}
            <button
              type="button"
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
              title={isTagsExpanded ? 'קפל אזור תוויות' : 'הצג תוויות ונושאים'}
            >
              <span className="w-5 h-5 rounded-md bg-slate-700/80 flex items-center justify-center text-red-400 font-mono text-xs">#</span>
              <span>תוויות ונושאי הסרטון ({displayTags.length})</span>
              {isTagsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Social Share Icons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                שיתוף:
              </span>

              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all hover:scale-105"
                title="שיתוף בוואטסאפ"
              >
                <span className="text-xs font-bold px-1">WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all hover:scale-105"
                title="שיתוף בפייסבוק"
              >
                <span className="text-xs font-bold px-1">Facebook</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all hover:scale-105"
                title="שיתוף ב-LinkedIn"
              >
                <span className="text-xs font-bold px-1">LinkedIn</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-medium cursor-pointer"
                title="העתק קישור"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">הועתק!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>העתק קישור</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Tags Area - Folded by default! */}
          {isTagsExpanded && displayTags && displayTags.length > 0 && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-800/40 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {displayTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors shadow-sm"
                >
                  #{tag.replace(/^#/, '')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 4. תחתיו אזור לתגובות מעוצב כמו ביוטיוב (YouTube Comments)     */}
        {/* ============================================================== */}
        <div id="kosvidio-comments" className="mb-10 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-lg overflow-hidden transition-all">
          {/* Comments Header (Interactive Toggle - Folded by default) */}
          <button
            type="button"
            onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-slate-800/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{commentsList.length} תגובות</span>
                </h2>
                <span className="text-[11px] text-slate-400 block font-normal">
                  {isCommentsExpanded ? 'לחץ לקיפול אזור התגובות' : 'לחץ להצגת תגובות וכתיבת תגובה'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xs">
              <span>{isCommentsExpanded ? 'קפל תגובות' : 'הצג תגובות'}</span>
              {isCommentsExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {/* Collapsible Comments Content - Folded by default! */}
          {isCommentsExpanded && (
            <div className="p-5 sm:p-6 pt-0 border-t border-slate-800/60 space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-end pt-3">
                <div className="text-xs text-slate-400">מסודר לפי: מובילות</div>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 mt-0.5">
                    👤
                  </div>

                  <div className="flex-1">
                    {isInputFocused && (
                      <input
                        type="text"
                        placeholder="שמך (אופציונלי)"
                        value={commentAuthorInput}
                        onChange={(e) => setCommentAuthorInput(e.target.value)}
                        className="w-full mb-2 px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-all"
                      />
                    )}

                    <textarea
                      rows={isInputFocused ? 3 : 1}
                      placeholder="הוסף תגובה ציבורית..."
                      value={newCommentText}
                      onFocus={() => setIsInputFocused(true)}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800/80 border-b-2 border-slate-700 focus:border-red-500 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none transition-all resize-none"
                    />

                    {isInputFocused && (
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsInputFocused(false);
                            setNewCommentText('');
                          }}
                          className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          ביטול
                        </button>
                        <button
                          type="submit"
                          disabled={!newCommentText.trim()}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-xs font-bold text-white transition-all shadow-md shadow-red-600/20"
                        >
                          <Send className="w-3 h-3" />
                          תגובה
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </form>

              {/* Comments List */}
              {commentsList.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-800 text-slate-400 text-xs sm:text-sm">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-slate-300">עדיין אין תגובות בעמוד זה.</p>
                  <p className="text-slate-500 text-xs mt-1">היו הראשונים להגיב ולשתף את דעתכם על הסרטון!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {commentsList.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                        {comment.authorName.slice(0, 1)}
                      </div>

                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-200 text-xs">
                            {comment.authorName}
                          </span>
                          <span className="text-[11px] text-slate-400">{comment.publishedAt}</span>
                        </div>

                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-1.5">
                          {comment.content}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(comment.id)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors ${
                              comment.userLiked ? 'text-red-400 font-bold' : 'hover:text-slate-200'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${comment.userLiked ? 'fill-red-400' : ''}`} />
                            <span>{comment.likesCount}</span>
                          </button>

                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
                            title="לא אהבתי"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 font-semibold text-[11px] transition-colors"
                          >
                            השב
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 5. על הסרטון בכמה מילים (Short Description)                   */}
        {/* ============================================================== */}
        {page.executiveSummary && (
          <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-950/30 via-slate-900/60 to-purple-950/30 border border-red-900/40 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                על הסרטון בכמה מילים
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
              {page.executiveSummary}
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. ותחתיו תיאור ארוך לפי דרישות SEO ו-AISEO                   */}
        {/* ============================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-2xl backdrop-blur-md space-y-8">
          {/* Key Takeaways */}
          {page.keyTakeaways && page.keyTakeaways.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>תובנות מרכזיות ונקודות מפתח מהסרטון</span>
              </h3>
              <ul className="space-y-2">
                {page.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Long Description Article Content */}
          <article className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-800/20 border border-slate-800/60">
              {page.articleContent}
            </div>
          </article>

          {/* FAQs */}
          {page.faqs && page.faqs.length > 0 && (
            <div className="pt-6 border-t border-slate-800/70 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <span>שאלות ותשובות נפוצות</span>
              </h3>
              <div className="space-y-3">
                {page.faqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-800 overflow-hidden bg-slate-800/30 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        className="w-full p-4 text-right flex items-center justify-between font-semibold text-sm sm:text-base text-slate-200 hover:text-white transition-colors"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Call to Action Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-600/20 via-purple-600/20 to-indigo-600/20 border border-red-500/30 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">
                {page.callToAction?.title || 'רוצים לקחת את המומחיות הזו אליכם?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300">
                {page.callToAction?.subtitle || 'השאירו פרטים ונחזור אליכם עם מענה אישי ומדויק.'}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <a
                href={page.callToAction?.buttonLink || '#contact'}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-red-600/25"
              >
                <span>{page.callToAction?.buttonText || 'לפרטים נוספים'}</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Universal Dock */}
      <KosunUniversalDock mode="front" />
    </div>
  );
};
