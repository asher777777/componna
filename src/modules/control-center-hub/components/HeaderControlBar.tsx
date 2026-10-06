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
  Sparkles,
  Sun,
  Moon
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
    theme,
    toggleTheme,
  } = useControlCenter();

  const { isConnected, openConnectorModal } = useSystemConnection();
  const { tenantId, isRootTenant } = useTenantScope();
  const isLight = theme === 'light';

  const layouts: Array<{ id: ControlCenterLayoutType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'bento', label: 'בנטו יוקרתי', icon: LayoutGrid },
    { id: 'matrix', label: 'מטריצת שליטה', icon: TableProperties },
    { id: 'kpi', label: 'מדדים ניהוליים', icon: BarChart2 },
    { id: 'pipeline', label: 'צינור תהליכים', icon: GitFork },
    { id: 'mobile', label: 'סימולטור מובייל', icon: Smartphone },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 lg:px-8 py-3.5 transition-all ${
      isLight
        ? 'bg-white/85 border-slate-200/90 shadow-sm'
        : 'bg-slate-950/80 border-slate-800/80 shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left / Branding & Connectivity */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 ring-1 ring-indigo-400/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-bold text-base tracking-wide flex items-center gap-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  מרכז השליטה והבקרה
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                  isLight
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  v2.0 Clean
                </span>
              </div>
              <div className={`flex items-center gap-2 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  {isConnected ? 'Firestore מחובר' : 'ממתין לחיבור מסד'}
                </span>
                <span>•</span>
                <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  טננט: <code className="text-indigo-500 font-bold">{isRootTenant ? 'Root (ראשי)' : tenantId}</code>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Config Modal Trigger (mobile) */}
          <button
            onClick={() => openConnectorModal('apiKeys')}
            className={`md:hidden p-2 border rounded-xl ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="מפתחות API"
          >
            <Key className="w-4 h-4 text-amber-500" />
          </button>
        </div>

        {/* Center / Search Input */}
        <div className="w-full md:max-w-md relative">
          <Search className={`w-4 h-4 absolute right-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש מהיר ברכיבים, יכולות או קולקציות..."
            className={`w-full rounded-2xl pr-10 pl-4 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition shadow-inner border ${
              isLight
                ? 'bg-slate-100/80 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-400'
                : 'bg-slate-900/90 border-slate-800 text-white focus:border-indigo-500/80'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-[11px] text-slate-400 hover:text-slate-600"
            >
              נקה
            </button>
          )}
        </div>

        {/* Right / Layout Switcher & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
          
          {/* 5 Layout Selector Pills */}
          <div className={`p-1 rounded-2xl border flex items-center gap-1 shadow-sm ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
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
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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

          {/* Day / Night Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 border rounded-xl transition cursor-pointer shrink-0 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
            }`}
            title={isLight ? 'החלף למצב לילה (Dark Mode)' : 'החלף למצב יום (Light Mode)'}
          >
            {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => refreshStats()}
            disabled={metrics.isLoading}
            className={`p-2 border rounded-xl transition cursor-pointer shrink-0 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
            } ${metrics.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="רענן ספירות חיים מ-Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${metrics.isLoading ? 'animate-spin text-indigo-500' : ''}`} />
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
            className={`hidden md:flex items-center gap-1.5 p-2 border rounded-xl transition cursor-pointer shrink-0 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
            }`}
            title="ניהול מפתחות API וחיבורים"
          >
            <Key className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
