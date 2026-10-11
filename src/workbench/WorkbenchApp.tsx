import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Grid, X, Check, Lock } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CashwanTopNav } from './components/CashwanTopNav';
import { REGISTERED_MODULES } from './moduleRegistry';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { ModuleLoadingFallback } from './components/ModuleLoadingFallback';
import { useSystemConnection } from '../core/connection/SystemConnectionContext';
import { AuthModal } from '../components/Auth/AuthModal';
import { subscribeToAuth, AuthState, fetchUserRole, isPlatformAdminEmail, getCachedUserRole } from '../services/firebaseAuth';

// PublicPageView loaded lazily to isolate page-builder from shell
const PublicPageView = React.lazy(() =>
  import('../modules/page-builder').then((m) => ({ default: m.PublicPageView }))
);

const HomePage = React.lazy(() =>
  import('../pages/HomePage').then((m) => ({ default: m.HomePage }))
);

import { PageBuilderRenderer } from '../modules/page-builder/PageBuilderRenderer';
import { pageBuilderFirestore } from '../modules/page-builder/services/pageBuilderFirestore';
import { PageBuilderConfig } from '../modules/page-builder/types/pageBuilder.types';
import { ROOT_TENANT_ID } from '../core/tenant/tenantResolver';

const WorkbenchRootHome: React.FC = () => {
  const { db } = useSystemConnection();
  const [homePage, setHomePage] = React.useState<PageBuilderConfig | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadHome = React.useCallback(async () => {
    try {
      const page = await pageBuilderFirestore.getHomePage(db, ROOT_TENANT_ID);
      setHomePage(page);
    } catch {
      setHomePage(null);
    } finally {
      setLoading(false);
    }
  }, [db]);

  React.useEffect(() => {
    loadHome();
    const handleHomeChange = (e: any) => {
      const changed = e?.detail?.tenantId;
      if (!changed || changed === ROOT_TENANT_ID) {
        loadHome();
      }
    };
    window.addEventListener('kosun_homepage_changed', handleHomeChange);
    return () => window.removeEventListener('kosun_homepage_changed', handleHomeChange);
  }, [loadHome]);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-bold">טוען עמוד בית...</div>;
  }

  if (homePage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative font-sans" dir="rtl">
        <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md px-4 py-2 border-b border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">עמוד הבית הפעיל שנבחר מבונה העמודים:</span>
            <span className="text-indigo-300 font-bold font-mono bg-slate-800 px-2 py-0.5 rounded">{homePage.pageTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/page-builder"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1 shadow-sm"
            >
              ✏️ עריכה בבונה העמודים
            </a>
            <a
              href="/saas-storefront"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            >
              חנות המערכת והמודולים
            </a>
          </div>
        </div>
        <PageBuilderRenderer config={homePage} />
      </div>
    );
  }

  return <HomePage />;
};

export const WorkbenchApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const { purchasedModules, firebaseApp } = useSystemConnection();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Auth state for determining admin role
  const [authState, setAuthState] = useState<AuthState>({
    user: null, uid: null, email: null, displayName: null, photoURL: null,
    role: 'viewer', isAuthenticated: false, isAnonymous: false, loading: true, error: null
  });
  
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, async (state) => {
      setAuthState(state);
      if (state.user && state.email) {
        const role = await fetchUserRole(state.uid!, firebaseApp);
        setIsAdmin(role === 'admin' || getCachedUserRole(state.uid!) === 'admin' || isPlatformAdminEmail(state.email));
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, [firebaseApp]);

  const isPublicPage =
    location.pathname.startsWith('/p/') ||
    location.pathname.startsWith('/page/') ||
    location.pathname.startsWith('/preview/') ||
    location.hash.startsWith('#/p/') ||
    location.hash.startsWith('#/page/');

  const isHomePage = location.pathname === '/';
  const showSidebar = searchParams.get('sidebar') === 'true';

  const isStandalone =
    searchParams.get('mode') === 'live' ||
    searchParams.get('standalone') === 'true' ||
    isPublicPage;

  // Filter modules: Admin sees all, Regular users see purchased modules
  const availableModules = REGISTERED_MODULES.filter(m => isAdmin || purchasedModules.includes(m.id));
  
  // Extract active module ID from pathname
  const activeModuleRoute = '/' + location.pathname.split('/')[1];
  const activeModule = REGISTERED_MODULES.find(m => m.route === activeModuleRoute);
  const activeModuleId = activeModule ? activeModule.id : null;

  const handleNavigateToModule = (route: string) => {
    setIsMenuOpen(false);
    navigate(route);
  };

  if (isStandalone) {
    return (
      <div className="w-screen min-h-screen bg-[#09090b] flex items-center justify-center p-0 m-0 text-white font-sans" dir="rtl">
        <main className="w-full min-h-screen">
          <Routes>
            <Route path="/p/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/p/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/page/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/page/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/preview/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/preview/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />

            {REGISTERED_MODULES.map((module) => {
              const Component = module.component;
              return (
                <Route
                  key={module.id}
                  path={`${module.route}/*`}
                  element={
                    <ModuleErrorBoundary moduleName={module.name}>
                      <Suspense fallback={<ModuleLoadingFallback moduleName={module.name} />}>
                        <Component />
                      </Suspense>
                    </ModuleErrorBoundary>
                  }
                />
              );
            })}
            <Route
              path="/"
              element={
                <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-bold">טוען...</div>}>
                  <WorkbenchRootHome />
                </Suspense>
              }
            />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-slate-100 relative font-sans" dir="rtl">
      {/* Cashwan 2026: Pure Top Navigation - Zero Sidebars */}
      <CashwanTopNav onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0a0a0c] relative">
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-bold">טוען...</div>}>
                  <WorkbenchRootHome />
                </Suspense>
              }
            />
            <Route path="/store" element={<Navigate to="/saas-storefront" replace />} />
            <Route path="/home" element={<Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-indigo-500 font-bold">טוען...</div>}><HomePage /></Suspense>} />
            
            <Route path="/p/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/p/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/page/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/page/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/preview/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/preview/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />

            {REGISTERED_MODULES.map((module) => {
              const Component = module.component;
              return (
                <Route
                  key={module.id}
                  path={`${module.route}/*`}
                  element={
                    <ModuleErrorBoundary moduleName={module.name}>
                      <Suspense fallback={<ModuleLoadingFallback moduleName={module.name} />}>
                        <Component />
                      </Suspense>
                    </ModuleErrorBoundary>
                  }
                />
              );
            })}
          </Routes>
        </main>
      </div>

      {!isPublicPage && !isHomePage && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="תפריט מודולים (קושאן)"
        >
          <Grid className="w-6 h-6" />
        </button>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col animate-scaleUp">
            
            <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">כלי קושאן</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {isAdmin ? 'כל הכלים והיכולות של קושאן פעילים לרשותך' : 'הכלים הפעילים בחשבונך'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {availableModules.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <Lock className="w-8 h-8 mx-auto opacity-50" />
                  <p className="font-bold">אין מודולים פעילים</p>
                  <button onClick={() => {setIsMenuOpen(false); setIsAuthModalOpen(true);}} className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100">
                    התחבר מחדש
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableModules.map((module) => {
                    const isActive = activeModuleId === module.id;
                    const Icon = (module as any).icon ? (module as any).icon : Grid;
                    return (
                      <button
                        key={module.id}
                        onClick={() => handleNavigateToModule(module.route)}
                        className={`text-right p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-3 group cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20 shadow-sm'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/80 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {isActive && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <div>
                          <h3 className={`font-bold text-sm mb-1 ${isActive ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                            {module.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                            {module.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        firebaseApp={firebaseApp}
        title="התחברות למערכת"
        subtitle="רענון הרשאות מנהל"
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
