import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { REGISTERED_MODULES } from './moduleRegistry';

export const WorkbenchApp: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isStandalone =
    searchParams.get('mode') === 'live' ||
    searchParams.get('standalone') === 'true' ||
    location.pathname.startsWith('/p/');

  if (isStandalone) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-0 m-0 select-none" dir="rtl">
        <main className="w-full h-full flex items-center justify-center overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/flow-player-engine" replace />} />
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
            <Route
              path="/p/*"
              element={React.createElement(
                REGISTERED_MODULES.find((m) => m.id === 'flow-player-engine')?.component || 'div'
              )}
            />
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

