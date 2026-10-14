import React from 'react';
import { 
  Youtube, 
  Sparkles, 
  Layers, 
  Globe, 
  Settings2, 
  Plus, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { KosunUniversalDock } from '../../components/Navigation/KosunUniversalDock';
import { KosTubeProvider, useKosTube, KosTubeTab } from './context/KosTubeContext';
import { KosTubeOverviewTab } from './components/KosTubeOverviewTab';
import { KosTubeVideosTab } from './components/KosTubeVideosTab';
import { KosTubePagesTab } from './components/KosTubePagesTab';
import { KosTubeSettingsTab } from './components/KosTubeSettingsTab';
import { KosTubeChannelModal } from './components/KosTubeChannelModal';
import { KosTubeAddVideoModal } from './components/KosTubeAddVideoModal';
import { KosTubePagePreviewModal } from './components/KosTubePagePreviewModal';

const KosTubeMainContent: React.FC = () => {
  const { 
    channel, 
    activeTab, 
    setActiveTab, 
    isSyncing, 
    isGenerating, 
    error, 
    clearError, 
    setIsModalOpen, 
    setModalMode 
  } = useKosTube();

  const tabs: Array<{ id: KosTubeTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'overview', label: 'סקירה כללית', icon: Layers },
    { id: 'videos', label: 'סרטונים בערוץ', icon: Youtube },
    { id: 'pages', label: 'עמודי SEO', icon: Globe },
    { id: 'settings', label: 'הגדרות', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 pt-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Module Header without top bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  KosTube
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  חיבור ערוץ יוטיוב וקידום SEO מבוסס AI למאמרים ועמודי נחיתה
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setModalMode('add_video');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>הוסף סרטון בקישור</span>
            </button>

            {!channel ? (
              <button
                type="button"
                onClick={() => {
                  setModalMode('channel_connect');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>חבר ערוץ יוטיוב</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ערוץ מחובר: {channel.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-rose-500 hover:underline text-xs font-medium"
            >
              סגור
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/80 w-fit max-w-full overflow-x-auto border border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && <KosTubeOverviewTab />}
          {activeTab === 'videos' && <KosTubeVideosTab />}
          {activeTab === 'pages' && <KosTubePagesTab />}
          {activeTab === 'settings' && <KosTubeSettingsTab />}
        </div>
      </div>

      {/* Fullscreen Modals */}
      <KosTubeChannelModal />
      <KosTubeAddVideoModal />
      <KosTubePagePreviewModal />

      {/* Floating System Dock for Backoffice Navigation */}
      <KosunUniversalDock mode="backoffice" />
    </div>
  );
};

export const KosTubeStandaloneView: React.FC = () => {
  return (
    <KosTubeProvider>
      <KosTubeMainContent />
    </KosTubeProvider>
  );
};

export default KosTubeStandaloneView;
