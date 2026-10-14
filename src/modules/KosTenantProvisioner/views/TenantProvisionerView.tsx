import React, { useState } from 'react';
import { Globe, Plus, RefreshCw, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { TenantStatsOverview } from '../components/TenantStatsOverview';
import { TenantTableCardView } from '../components/TenantTableCardView';
import { TenantCreateModal } from '../components/TenantCreateModal';
import { TenantComprehensiveEditModal } from '../components/TenantComprehensiveEditModal';
import { TenantCredentialsModal } from '../components/TenantCredentialsModal';

export const TenantProvisionerView: React.FC = () => {
  const { setIsCreateModalOpen, refreshTenants, loading } = useTenantProvisioner();
  // סרגלי מידע מוסתרים כברירת מחדל (דרישה ב')
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans space-y-5" dir="rtl">
      {/* Top Banner / Header (דרישה א: כותרת תמציתית ונקייה ללא פסקאות תיאור ארוכות) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ניהול סאב-דומיינים
            </h1>
            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              KosTenantProvisioner
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle KPI Stats Overview (מוסתר כברירת מחדל) */}
          <button
            type="button"
            onClick={() => setShowStats((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
              showStats
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
            title="הצג / הסתר סרגל מדדים וסטטיסטיקה"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">מדדים וסטטיסטיקה</span>
            {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refreshTenants()}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
            title="רענן רשימת סאב-דומיינים"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* New Subdomain Action Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>הקם סאב-דומיין חדש</span>
          </button>
        </div>
      </div>

      {/* KPI Stats (סרגלי מידע מוסתרים כברירת מחדל - נפתחים רק בלחיצה) */}
      {showStats && (
        <div className="animate-fadeIn">
          <TenantStatsOverview />
        </div>
      )}

      {/* Tenants Management Table & Cards (כולל את הדומיין הראשי כריבוע/שורה מוגנת ממחיקה) */}
      <TenantTableCardView />

      {/* Modals */}
      <TenantCreateModal />
      <TenantComprehensiveEditModal />
      <TenantCredentialsModal />
    </div>
  );
};
