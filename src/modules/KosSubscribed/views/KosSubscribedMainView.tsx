import React from 'react';
import {
  Users,
  Package,
  FileCheck2,
  Lock,
  BarChart3,
  Plus,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { KosunUniversalDock } from '../../../components/Navigation/KosunUniversalDock';
import { useKosSubscribed } from '../hooks/useKosSubscribed';
import { KosSubscribedTab } from '../types';
import { SubscribersTrackingTab } from '../components/SubscribersTrackingTab';
import { PackagesAndDiscountsTab } from '../components/PackagesAndDiscountsTab';
import { QuizzesFormsTab } from '../components/QuizzesFormsTab';
import { ContentGatePreviewTab } from '../components/ContentGatePreviewTab';
import { SubscriptionAnalyticsTab } from '../components/SubscriptionAnalyticsTab';
import { KosSubscribedModals } from '../components/KosSubscribedModals';

export const KosSubscribedMainView: React.FC = () => {
  const {
    tenantId,
    activeTab,
    setActiveTab,
    setModalMode,
    setEditingPackage,
    setSelectedContact,
    contacts,
    isLoading,
    error,
    notification,
    clearError,
    refreshAll,
  } = useKosSubscribed();

  const tabs: Array<{
    id: KosSubscribedTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }> = [
    {
      id: 'subscribers',
      label: 'לשונית המנויים ואנשי הקשר',
      icon: Users,
      badge: 'מונופול CRM',
    },
    { id: 'packages', label: 'חבילות חודשיות והנחות', icon: Package },
    { id: 'quizzes', label: 'טפסים של מבחנים', icon: FileCheck2 },
    { id: 'content', label: 'תצוגת תוכן נעולה', icon: Lock },
    { id: 'analytics', label: 'אנליטיקה ומעקב תשלומים', icon: BarChart3 },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 pt-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Headerless Module Title & Primary Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  KosSubscribed
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  סאב-דומיין: {tenantId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ניהול מנויי תוכן, חבילות חודשיות והנחות, יצירת עמודי תשלום וטפסי מבחנים המחוברים בחוזה למונופול ה-CRM
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={refreshAll}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="רענן נתונים מחוזה ה-CRM"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingPackage(null);
                setModalMode('edit-package');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>הגדר חבילה חדשה</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedContact(contacts[0] || null);
                setModalMode('assign-package');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>שדך חבילה לאיש קשר</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={clearError} className="text-xs underline hover:opacity-80">
              הבנתי
            </button>
          </div>
        )}

        {/* Emphasized Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400 dark:text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-indigo-500 text-white'
                        : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab View */}
        <div className="pt-2">
          {activeTab === 'subscribers' && <SubscribersTrackingTab />}
          {activeTab === 'packages' && <PackagesAndDiscountsTab />}
          {activeTab === 'quizzes' && <QuizzesFormsTab />}
          {activeTab === 'content' && <ContentGatePreviewTab />}
          {activeTab === 'analytics' && <SubscriptionAnalyticsTab />}
        </div>
      </div>

      {/* 100% Fullscreen Modals */}
      <KosSubscribedModals />

      {/* Universal Floating Dock */}
      <KosunUniversalDock />
    </div>
  );
};
