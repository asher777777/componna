import React from 'react';
import { Globe, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { TenantStatsOverview } from '../components/TenantStatsOverview';
import { MasterDomainCard } from '../components/MasterDomainCard';
import { TenantTableCardView } from '../components/TenantTableCardView';
import { TenantCreateModal } from '../components/TenantCreateModal';
import { TenantComprehensiveEditModal } from '../components/TenantComprehensiveEditModal';
import { TenantCredentialsModal } from '../components/TenantCredentialsModal';

export const TenantProvisionerView: React.FC = () => {
  const { setIsCreateModalOpen, refreshTenants, loading } = useTenantProvisioner();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans space-y-6" dir="rtl">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                ניהול סאב-דומיינים והטענת רכיבים
              </h1>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                KosTenantProvisioner
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              הקצאת סאב-דומיינים מבודדים 100%, הגדרת שמות משתמש וסיסמאות, וטעינת רכיבים מודולריים לפי חוקי KOSUN26
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refreshTenants()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="רענן רשימה"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>הקם סאב-דומיין חדש</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <TenantStatsOverview />

      {/* Main Master Domain Featured Card (Clause ו) */}
      <MasterDomainCard />

      {/* Tenants Management Table & Cards */}
      <TenantTableCardView />

      {/* Modals */}
      <TenantCreateModal />
      <TenantComprehensiveEditModal />
      <TenantCredentialsModal />
    </div>
  );
};
