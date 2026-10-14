import React from 'react';
import {
  Layers,
  Video,
  Target,
  Activity,
  Settings2,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { KosunUniversalDock } from '../../components/Navigation/KosunUniversalDock';
import { TikTokProvider, useTikTok } from './context/TikTokContext';
import { KosTikTokTab } from './types';
import { KosTikTokOverviewTab } from './components/KosTikTokOverviewTab';
import { KosTikTokVideosTab } from './components/KosTikTokVideosTab';
import { KosTikTokLeadsTab } from './components/KosTikTokLeadsTab';
import { KosTikTokEventsTab } from './components/KosTikTokEventsTab';
import { KosTikTokSettingsTab } from './components/KosTikTokSettingsTab';
import { KosTikTokAccountModal } from './components/KosTikTokAccountModal';
import { KosTikTokPublishModal } from './components/KosTikTokPublishModal';

const TikTokMainContent: React.FC = () => {
  const {
    activeAccount,
    activeTab,
    setActiveTab,
    isLoading,
    isPublishing,
    error,
    clearError,
    setIsModalOpen,
    setModalMode,
  } = useTikTok();

  const tabs: Array<{ id: KosTikTokTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'overview', label: 'סקירה כללית', icon: Layers },
    { id: 'videos', label: 'סרטונים ופרסום', icon: Video },
    { id: 'leads', label: 'לידים מטפסים', icon: Target },
    { id: 'events', label: 'מעקב המרות (API)', icon: Activity },
    { id: 'settings', label: 'הגדרות וחיבור', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 pt-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Module Header without top bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-md">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  KosTikTok
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  חיבור חשבונות טיקטוק, פרסום סרטונים ישיר, קליטת לידים ממומנים ומעקב המרות
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                setModalMode('connect-account');
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              חבר חשבון
            </button>
            <button
              onClick={() => {
                setModalMode('publish-video');
                setIsModalOpen(true);
              }}
              disabled={!activeAccount}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Video className="w-3.5 h-3.5" />
              פרסם סרטון ל-TikTok
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={clearError} className="text-xs underline hover:opacity-80">
              הבנתי
            </button>
          </div>
        )}

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pink-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        <div className="pt-2">
          {activeTab === 'overview' && <KosTikTokOverviewTab />}
          {activeTab === 'videos' && <KosTikTokVideosTab />}
          {activeTab === 'leads' && <KosTikTokLeadsTab />}
          {activeTab === 'events' && <KosTikTokEventsTab />}
          {activeTab === 'settings' && <KosTikTokSettingsTab />}
        </div>
      </div>

      {/* Modals */}
      <KosTikTokAccountModal />
      <KosTikTokPublishModal />

      {/* Floating Universal Dock */}
      <KosunUniversalDock />
    </div>
  );
};

export const StandaloneView: React.FC = () => {
  return (
    <TikTokProvider>
      <TikTokMainContent />
    </TikTokProvider>
  );
};
