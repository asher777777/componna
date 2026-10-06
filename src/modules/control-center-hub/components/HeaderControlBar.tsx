import React from 'react';
import {
  LayoutGrid,
  TableProperties,
  BarChart2,
  GitFork,
  Smartphone,
  Search,
  RefreshCw,
  Database,
  Key,
  ShieldCheck,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { useControlCenter } from '../context/ControlCenterContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { ControlCenterLayoutType } from '../types';

export const HeaderControlBar: React.FC = () => {
  const {
    layout,
    setLayout,
    searchQuery,
    setSearchQuery,
    refreshStats,
    metrics,
    setQuickLeadModalOpen,
  } = useControlCenter();

  const { isConnected, openConnectorModal } = useSystemConnection();
  const { tenantId, isRootTenant } = useTenantScope();

  const layouts: Array<{ id: ControlCenterLayoutType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'bento', label: 'בנטו יוקרתי', icon: LayoutGrid },
    { id: 'matrix', label: 'מטריצת שליטה', icon: TableProperties },
    { id: 'kpi', label: 'מדדים ניהוליים', icon: BarChart2 },
    { id: 'pipeline', label: 'צינור תהליכים', icon: GitFork },
    { id: 'mobile', label: 'סימולטור מובייל', icon: Smartphone },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left / Branding & Connectivity */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 ring-1 ring-indigo-400/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                  מרכז השליטה והבקרה
                </h1>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                  v2.0 Clean
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isConnected ? 'Firestore מחובר' : 'ממתין לחיבור מסד'}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">
                  טננט: <code className="text-indigo-300">{isRootTenant ? 'Root (ראשי)' : tenantId}</code>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Config Modal Trigger */}
          <button
            onClick={() => openConnectorModal('apiKeys')}
            className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            title="מפתחות API"
          >
            <Key className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Center / Search Input */}
        <div className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש מהיר ברכיבים, יכולות או קולקציות..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-[11px] text-slate-500 hover:text-slate-300"
            >
              נקה
            </button>
          )}
        </div>

        {/* Right / Layout Switcher & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
          
          {/* 5 Layout Selector Pills */}
          <div className="bg-slate-900/90 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-sm">
            {layouts.map((item) => {
              const Icon = item.icon;
              const isActive = layout === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setLayout(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={`החלף לפריסת ${item.label}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refreshStats()}
            disabled={metrics.isLoading}
            className={`p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition cursor-pointer shrink-0 ${
              metrics.isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="רענן ספירות חיים מ-Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${metrics.isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Quick Lead Trigger */}
          <button
            onClick={() => setQuickLeadModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-lg shadow-indigo-600/25 cursor-pointer shrink-0"
            title="הוסף ליד ישירות למסד הנתונים"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ ליד מהיר</span>
          </button>

          {/* Connector Modal Button */}
          <button
            onClick={() => openConnectorModal('apiKeys')}
            className="hidden md:flex items-center gap-1.5 p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl transition cursor-pointer shrink-0"
            title="ניהול מפתחות API וחיבורים"
          >
            <Key className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
