import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { PageBuilderRenderer } from '../PageBuilderRenderer';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { Loader2, Globe, AlertTriangle, ArrowRight, Eye, Home } from 'lucide-react';

export const PublicPageView: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { db } = useSystemConnection();

  const [page, setPage] = useState<PageBuilderConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Extract slug from URL path, params, or hash (supports both /p/slug and /#/p/slug)
  const resolvedSlug = (() => {
    if (slug) return slug;

    // Check pathname like /p/my-slug
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && (pathParts[0] === 'p' || pathParts[0] === 'page')) {
      return pathParts.slice(1).join('/');
    }

    // Check hash like #/p/my-slug
    if (location.hash) {
      const cleanHash = location.hash.replace(/^#\/?/, '');
      const hashParts = cleanHash.split('/').filter(Boolean);
      if (hashParts.length >= 2 && (hashParts[0] === 'p' || hashParts[0] === 'page')) {
        return hashParts.slice(1).join('/');
      }
    }

    return '';
  })();

  const isPreviewMode = searchParams.get('preview') === 'true';

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setLoading(true);
      setNotFound(false);

      try {
        const allPages = await pageBuilderFirestore.getAllPages(db);
        
        let foundPage: PageBuilderConfig | undefined;

        if (resolvedSlug) {
          const target = resolvedSlug.toLowerCase().trim();
          foundPage = allPages.find(
            (p) =>
              (p.slug && p.slug.toLowerCase().trim() === target) ||
              (p.shortSlug && p.shortSlug.toLowerCase().trim() === target) ||
              p.pageId === target
          );
        } else {
          // If no slug provided, load the homepage
          foundPage = allPages.find((p) => p.isHomePage) || allPages[0];
        }

        if (isMounted) {
          if (foundPage) {
            setPage(foundPage);
            // Update document title
            if (typeof document !== 'undefined') {
              document.title = foundPage.seoSettings?.title || foundPage.pageTitle || 'Componna Page';
            }
            // Track page view for published pages
            if (foundPage.published) {
              pageBuilderFirestore.incrementViews(foundPage.pageId, db);
            }
          } else {
            setNotFound(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[PublicPageView] Error loading page:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [resolvedSlug, db]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#09090b] flex flex-col items-center justify-center text-white" dir="rtl">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <span className="text-sm font-bold text-slate-300">טוען עמוד...</span>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="w-screen h-screen bg-[#09090b] flex items-center justify-center p-6 text-white" dir="rtl">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">העמוד לא נמצא</h1>
            <p className="text-sm text-slate-400 mt-2">
              הכתובת המבוקשת (<span className="font-mono text-indigo-300">/{resolvedSlug}</span>) אינה קיימת או שהוסרה מהמערכת.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/page-builder"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              <Home className="w-4 h-4" />
              <span>חזרה ללוח העמודים</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If page exists but is not published and not in preview mode
  if (!page.published && !isPreviewMode) {
    return (
      <div className="w-screen h-screen bg-[#09090b] flex items-center justify-center p-6 text-white" dir="rtl">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">עמוד זה בטיוטה</h1>
            <p className="text-sm text-slate-400 mt-2">
              העמוד <strong className="text-white">"{page.pageTitle}"</strong> שמור במערכת אך טרם פורסם לציבור הרחב.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to={`/p/${resolvedSlug}?preview=true`}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>צפייה במצב תצוגה מקדימה (Preview)</span>
            </Link>

            <Link
              to="/page-builder"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all"
            >
              חזרה למערכת הניהול
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0a0a0c]">
      {/* If in preview mode of an unpublished draft, show top subtle banner */}
      {!page.published && isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4" />
          <span>מצב תצוגה מקדימה (העמוד טרם פורסם לאוויר)</span>
          <Link to="/page-builder" className="underline mr-2 text-black hover:text-slate-800">
            ערוך ופרסם בעורך
          </Link>
        </div>
      )}

      <PageBuilderRenderer
        config={page}
        onSelectDonationTier={(tierId, mode) => {
          console.log('[PublicPageView] Selected donation tier:', tierId, mode);
        }}
        onLeadSubmit={(formData) => {
          console.log('[PublicPageView] Received lead submission:', formData);
        }}
      />
    </div>
  );
};

export default PublicPageView;
