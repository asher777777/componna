import React, { useState, useEffect } from 'react';
import { 
  Crown, Globe, KeyRound, ExternalLink, SlidersHorizontal, 
  Sparkles, Layers, Cpu, Eye, Activity, ShieldCheck 
} from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { TenantTokenTracker, TenantTokenUsage, getDefaultTokenUsage } from '../../../core/ai/tenantTokenTracker';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export const MasterDomainCard: React.FC = () => {
  const { masterTenant, setEditingTenant } = useTenantProvisioner();
  const { db } = useSystemConnection();
  const [tokenUsage, setTokenUsage] = useState<TenantTokenUsage>(() => getDefaultTokenUsage('_master'));

  useEffect(() => {
    let unsubscribe = () => {};
    TenantTokenTracker.getTenantTokenUsage(db, '_master').then(setTokenUsage);
    unsubscribe = TenantTokenTracker.subscribe(db, '_master', setTokenUsage);
    return () => unsubscribe();
  }, [db]);

  if (!masterTenant) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden" dir="rtl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Domain Info */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight" dir="ltr">
                  {masterTenant.fullDomain || 'kosun.pro'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>דומיין ראשי (Master Domain)</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                הדומיין המרכזי של הפלטפורמה — מפתחות ה-AI מקולקציה זו מזינים את כלל הסאב-דומיינים במערכת
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>כל 11 הרכיבים פעילים (100% Full Suite)</span>
            </div>

            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs font-mono" dir="ltr">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>
                {tokenUsage.totalTokens.toLocaleString()} Total Tokens (~${tokenUsage.totalCostUSD.toFixed(3)})
              </span>
            </div>

            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-amber-300">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>סטטוס: פעיל ראשי (Active Core)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setEditingTenant(masterTenant)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            title="עריכת הגדרות ומפתחות הדומיין הראשי"
          >
            <KeyRound className="w-4 h-4" />
            <span>ערוך מפתחות מאסטר</span>
          </button>

          <button
            type="button"
            onClick={() => setEditingTenant(masterTenant)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition cursor-pointer"
            title="ניהול מלא ומד טוקנים"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>הגדרות ומד טוקנים</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center transition cursor-pointer"
            title="מעבר לעמוד הבית הראשי"
          >
            <ExternalLink className="w-4 h-4 text-indigo-300" />
          </a>
        </div>
      </div>
    </div>
  );
};
