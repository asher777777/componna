import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { REGISTERED_MODULES } from './moduleRegistry';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { ModuleLoadingFallback } from './components/ModuleLoadingFallback';

// PublicPageView loaded lazily to isolate page-builder from shell
const PublicPageView = React.lazy(() =>
  import('../modules/page-builder').then((m) => ({ default: m.PublicPageView }))
);

export const WorkbenchApp: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const isPublicPage =
    location.pathname.startsWith('/p/') ||
    location.pathname.startsWith('/page/') ||
    location.pathname.startsWith('/preview/') ||
    location.hash.startsWith('#/p/') ||
    location.hash.startsWith('#/page/');

  const isControlCenter =
    location.pathname.startsWith('/control-center') ||
    location.pathname === '/';

  // Sidebar is disabled by default across all workbench and modules unless ?sidebar=true is passed
  const showSidebar = searchParams.get('sidebar') === 'true';

  const isStandalone =
    searchParams.get('mode') === 'live' ||
    searchParams.get('standalone') === 'true' ||
    isPublicPage;

  if (isStandalone) {
    return (
      <div className="w-screen min-h-screen bg-[#09090b] flex items-center justify-center p-0 m-0 text-white" dir="rtl">
        <main className="w-full min-h-screen">
          <Routes>
            <Route
              path="/p/:slug"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/p/*"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/page/:slug"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/page/*"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/preview/:slug"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/preview/*"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />

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
            <Route path="/" element={<Navigate to="/control-center" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 relative" dir="rtl">
      {/* Optional Sidebar only if explicitly requested with ?sidebar=true */}
      {showSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Workbench Header rendered only when NOT in control center and NOT public page */}
        {!isControlCenter && !isPublicPage && <Header />}
        
        <main className="flex-1 overflow-y-auto bg-slate-900/50 relative">
          <Routes>
            <Route path="/" element={<Navigate to="/control-center" replace />} />
            
            {/* Public Page Routes */}
            <Route
              path="/p/:slug"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/p/*"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/page/:slug"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/page/*"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/preview/:slug"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />
            <Route
              path="/preview/*"
              element={
                <ModuleErrorBoundary moduleName="תצוגה ציבורית">
                  <Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}>
                    <PublicPageView />
                  </Suspense>
                </ModuleErrorBoundary>
              }
            />

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

      {/* Floating Return Pill for other modules (when not in control center and not public page) */}
      {!isControlCenter && !isPublicPage && (
        <NavLink
          to="/control-center"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-950/90 hover:bg-indigo-600 text-white rounded-2xl border border-indigo-500/30 hover:border-indigo-400 shadow-2xl backdrop-blur-xl transition group text-xs font-bold cursor-pointer"
          title="חזרה מהירה למרכז השליטה"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-white" />
          <span>מרכז השליטה</span>
        </NavLink>
      )}
    </div>
  );
};
