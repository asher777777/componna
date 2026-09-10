import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  Search,
  Box,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Film,
  Database,
  Smartphone,
  BarChart3,
  Layout,
  ShieldCheck,
  PlayCircle,
  Image,
  Code2,
  Sparkles,
} from 'lucide-react';
import { REGISTERED_MODULES } from '../moduleRegistry';
import { FirebaseStatus } from './FirebaseStatus';

const MODULE_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'video-producer-studio': { icon: Film, color: 'text-purple-400 group-hover:text-purple-300' },
  'db-connector-hub': { icon: Database, color: 'text-amber-400 group-hover:text-amber-300' },
  'client-platform': { icon: Smartphone, color: 'text-cyan-400 group-hover:text-cyan-300' },
  'crm-analytics': { icon: BarChart3, color: 'text-emerald-400 group-hover:text-emerald-300' },
  'page-builder': { icon: Layout, color: 'text-blue-400 group-hover:text-blue-300' },
  'auth-portal': { icon: ShieldCheck, color: 'text-teal-400 group-hover:text-teal-300' },
  'flow-player-engine': { icon: PlayCircle, color: 'text-amber-400 group-hover:text-amber-300' },
  'media-gallery-hub': { icon: Image, color: 'text-indigo-400 group-hover:text-indigo-300' },
  'db-collections-hub': { icon: Database, color: 'text-indigo-400 group-hover:text-indigo-300' },
  'template': { icon: Code2, color: 'text-slate-400 group-hover:text-slate-300' },
};

export const Sidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  
  // Collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('comona_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('comona_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const filtered = REGISTERED_MODULES.filter(
    (m) => m.name.includes(search) || m.id.includes(search)
  );

  return (
    <aside
      className={`bg-slate-950/95 border-l border-slate-800/80 flex flex-col h-screen select-none transition-all duration-300 ease-in-out relative z-30 ${
        isCollapsed ? 'w-[70px]' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className={`border-b border-slate-800/80 flex items-center ${isCollapsed ? 'p-3 flex-col gap-2 justify-center' : 'p-4 justify-between'}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0 ${
              isCollapsed ? 'cursor-pointer hover:scale-105 transition' : ''
            }`}
            title={isCollapsed ? 'לחץ להרחבת סרגל הרכיבים' : 'סביבת עבודה'}
          >
            <Box className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-bold text-white text-base leading-tight truncate">Workspace</h1>
              <p className="text-[11px] text-slate-400 font-normal truncate">קומפוננטות React מבודדות</p>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          title={isCollapsed ? 'הרחב תפריט רכיבים' : 'מזער תפריט רכיבים'}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4 text-indigo-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Search Input (Expanded) / Search Button (Collapsed) */}
      {!isCollapsed ? (
        <div className="p-3 border-b border-slate-800/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש קומפוננטה..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-slate-800/40 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition cursor-pointer"
            title="חיפוש רכיב (פתח תפריט)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Module Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!isCollapsed && (
          <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>קומפוננטות רשומות</span>
            <span className="bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.2 rounded font-mono">
              {filtered.length}
            </span>
          </div>
        )}

        {filtered.map((module) => {
          const conf = MODULE_ICONS[module.id] || { icon: Layers, color: 'text-indigo-400' };
          const IconComp = conf.icon;

          if (isCollapsed) {
            return (
              <div key={module.id} className="group relative flex justify-center py-0.5">
                <NavLink
                  to={module.route}
                  className={({ isActive }) =>
                    `w-11 h-11 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`
                  }
                >
                  <IconComp className="w-5 h-5" />
                </NavLink>

                {/* Hover Tooltip Card */}
                <div
                  className="fixed hidden group-hover:flex flex-col gap-1 bg-slate-900 border border-slate-700 text-white text-xs p-3 rounded-2xl shadow-2xl z-50 pointer-events-none whitespace-normal w-64 text-right"
                  style={{ right: '78px' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-indigo-600/20 text-indigo-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-white leading-tight">{module.name}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-relaxed">{module.description}</div>
                  <div className="text-[9px] text-indigo-400 font-mono pt-1 border-t border-slate-800">
                    {module.route}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={module.id}
              to={module.route}
              className={({ isActive }) =>
                `flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-semibold truncate">{module.name}</div>
                  <div className="text-[10px] opacity-70 truncate font-mono">{module.id}</div>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info & Firebase Status */}
      <div className={`border-t border-slate-800/80 bg-slate-950 ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-4 space-y-3'}`}>
        <FirebaseStatus />
        {!isCollapsed && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Vite + React 18
            </span>
            <span className="text-indigo-400 font-mono">RTL Mode</span>
          </div>
        )}
      </div>
    </aside>
  );
};
