import React, { useState } from 'react';
import { 
  Sliders, TrendingUp, Layout, Image, PlayCircle, 
  Database, LogOut, User, Menu, X, Shield, ChevronLeft 
} from 'lucide-react';
import { useClientPlatform } from '../context/ClientPlatformContext';
import { ComponentRegistryTable } from './ComponentRegistryTable';
import { MASTER_AVAILABLE_MODULES } from '../config';

// Import standalone views of our modules
import { CrmAnalyticsStandaloneView } from '../../crm-analytics';
import { PageBuilderStandaloneView } from '../../page-builder';
import { MediaGalleryHubStandaloneView } from '../../media-gallery-hub';
import { FlowPlayerEngineStandaloneView } from '../../flow-player-engine';
import { DbCollectionsHubStandaloneView } from '../../db-collections-hub';

export const DynamicClientShell: React.FC = () => {
  const { session, logout, settings, activeRoute, setActiveRoute } = useClientPlatform();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filter active modules
  const enabledModules = MASTER_AVAILABLE_MODULES.filter(
    m => settings.modules[m.id]?.isEnabled
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return TrendingUp;
      case 'Layout': return Layout;
      case 'Image': return Image;
      case 'PlayCircle': return PlayCircle;
      case 'Database': return Database;
      default: return Sliders;
    }
  };

  const renderActiveModuleView = () => {
    switch (activeRoute) {
      case 'control_panel':
        return <ComponentRegistryTable />;
      case 'crm-analytics':
        return <CrmAnalyticsStandaloneView />;
      case 'page-builder':
        return <PageBuilderStandaloneView />;
      case 'media-gallery-hub':
        return <MediaGalleryHubStandaloneView />;
      case 'flow-player-engine':
        return <FlowPlayerEngineStandaloneView />;
      case 'db-collections-hub':
        return <DbCollectionsHubStandaloneView />;
      default:
        return <ComponentRegistryTable />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col md:flex-row text-right" dir="rtl">
      
      {/* Sidebar */}
      <aside className={`w-full md:w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col justify-between shrink-0 transition-all ${
        isSidebarOpen ? 'block' : 'hidden md:flex'
      }`}>
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow">
                {settings.clientName.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                  {settings.clientName}
                </h2>
                <span className="text-[10px] text-gray-400 font-mono">ID: {settings.clientId}</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            
            {/* Control Panel (Always available for admin) */}
            {session.role === 'admin' && (
              <button
                onClick={() => setActiveRoute('control_panel')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeRoute === 'control_panel'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>לוח בקרת רכיבים (Admin)</span>
              </button>
            )}

            <div className="pt-3 pb-1 text-[10px] font-bold text-gray-400 px-3 uppercase tracking-wider">
              רכיבים פעילים ({enabledModules.length})
            </div>

            {enabledModules.map(mod => {
              const Icon = getIcon(mod.iconName);
              const customTitle = settings.modules[mod.id]?.customTitle || mod.defaultTitle;
              const isCurrent = activeRoute === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveRoute(mod.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{customTitle}</span>
                  </div>
                  <ChevronLeft className={`w-3.5 h-3.5 opacity-60 ${isCurrent ? 'text-white' : ''}`} />
                </button>
              );
            })}

            {enabledModules.length === 0 && (
              <div className="p-3 text-[11px] text-gray-400 text-center bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed">
                אין רכיבים פעילים עדיין. סמן רכיבים בלוח הבקרה.
              </div>
            )}
          </div>
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
              {session.displayName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-xs text-gray-800 dark:text-gray-200 leading-none">
                {session.displayName}
              </p>
              <span className="text-[10px] text-gray-400 capitalize">{session.role}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition"
            title="התנתק"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <div className="md:hidden p-4 bg-white dark:bg-gray-900 border-b flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm">{settings.clientName}</span>
        </div>

        {/* Dynamic Mounted Module View */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto">
          {renderActiveModuleView()}
        </div>
      </main>

    </div>
  );
};
