import React from 'react';
import {
  LayoutGrid,
  TableProperties,
  BarChart2,
  GitFork,
  Smartphone,
  RefreshCw,
  Key,
  UserPlus,
  Sun,
  Moon,
  Home,
  ArrowRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useControlCenter } from '../context/ControlCenterContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { ControlCenterLayoutType } from '../types';

export const HeaderControlBar: React.FC = () => {
  const {
    layout,
    setLayout,
    refreshStats,
    metrics,
    setQuickLeadModalOpen,
    theme,
    toggleTheme,
  } = useControlCenter();

  const { openConnectorModal } = useSystemConnection();
  const isLight = theme === 'light';

  const layouts: Array<{ id: ControlCenterLayoutType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'bento', label: 'בנטו יוקרתי', icon: LayoutGrid },
    { id: 'matrix', label: 'מטריצת שליטה', icon: TableProperties },
    { id: 'kpi', label: 'מדדים ניהוליים', icon: BarChart2 },
    { id: 'pipeline', label: 'צינור תהליכים', icon: GitFork },
    { id: 'mobile', label: 'סימולטור מובייל', icon: Smartphone },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 lg:px-8 py-2.5 transition-all ${
      isLight
        ? 'bg-white/85 border-slate-200/90 shadow-sm'
        : 'bg-slate-950/80 border-slate-800/80 shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Navigation back to Home & 5 Layout Selector Pills */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto">
          {/* Back to Home Page button */}
          <NavLink
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 border ${
              isLight
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                : 'bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border-indigo-800/60'
            }`}
            title="חזרה לעמוד הבית הראשי"
          >
            <Home className="w-3.5 h-3.5" />
            <span>עמוד הבית</span>
          </NavLink>

          <div className={`p-1 rounded-2xl border flex items-center gap-1 shadow-sm overflow-x-auto max-w-full ${
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
                <span>{item.label}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* Action Controls & Day/Night Toggle */}
        <div className="flex items-center gap-2 shrink-0">
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
            className={`flex items-center gap-1.5 p-2 border rounded-xl transition cursor-pointer shrink-0 ${
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
