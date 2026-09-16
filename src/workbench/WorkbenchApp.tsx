import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { REGISTERED_MODULES } from './moduleRegistry';
import { PublicPageView } from '../modules/page-builder';

export const WorkbenchApp: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const isPublicPage =
    location.pathname.startsWith('/p/') ||
    location.pathname.startsWith('/page/') ||
    location.pathname.startsWith('/preview/') ||
    location.hash.startsWith('#/p/') ||
    location.hash.startsWith('#/page/');

  const isStandalone =
    searchParams.get('mode') === 'live' ||
    searchParams.get('standalone') === 'true' ||
    isPublicPage;

  if (isStandalone) {
    return (
      <div className="w-screen min-h-screen bg-[#09090b] flex items-center justify-center p-0 m-0 text-white" dir="rtl">
        <main className="w-full min-h-screen">
          <Routes>
            <Route path="/p/:slug" element={<PublicPageView />} />
            <Route path="/p/*" element={<PublicPageView />} />
            <Route path="/page/:slug" element={<PublicPageView />} />
            <Route path="/page/*" element={<PublicPageView />} />
            <Route path="/preview/:slug" element={<PublicPageView />} />
            <Route path="/preview/*" element={<PublicPageView />} />

            {REGISTERED_MODULES.map((module) => {
              const Component = module.component;
              return (
                <Route
                  key={module.id}
                  path={`${module.route}/*`}
                  element={<Component />}
                />
              );
            })}
            <Route path="/" element={<Navigate to="/flow-player-engine" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100" dir="rtl">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-900/50">
          <Routes>
            <Route path="/" element={<Navigate to={REGISTERED_MODULES[0]?.route || '/'} replace />} />
            
            {/* Public Page Routes */}
            <Route path="/p/:slug" element={<PublicPageView />} />
            <Route path="/p/*" element={<PublicPageView />} />
            <Route path="/page/:slug" element={<PublicPageView />} />
            <Route path="/page/*" element={<PublicPageView />} />
            <Route path="/preview/:slug" element={<PublicPageView />} />
            <Route path="/preview/*" element={<PublicPageView />} />

            {REGISTERED_MODULES.map((module) => {
              const Component = module.component;
              return (
                <Route
                  key={module.id}
                  path={`${module.route}/*`}
                  element={<Component />}
                />
              );
            })}
          </Routes>
        </main>
      </div>
    </div>
  );
};

