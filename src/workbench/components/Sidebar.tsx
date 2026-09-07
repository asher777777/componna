import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, Plus, Search, Box, BookOpen } from 'lucide-react';
import { REGISTERED_MODULES } from '../moduleRegistry';
import { FirebaseStatus } from './FirebaseStatus';

export const Sidebar: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = REGISTERED_MODULES.filter(
    (m) => m.name.includes(search) || m.id.includes(search)
  );

  return (
    <aside className="w-72 bg-slate-950/90 border-l border-slate-800/80 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Workspace</h1>
            <p className="text-[11px] text-slate-400 font-normal">קומפוננטות React מבודדות</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-slate-800/40">
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

      {/* Module Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          קומפוננטות רשומות ({filtered.length})
        </div>

        {filtered.map((module) => {
          let IconComponent = Layers;
          if (module.id === 'db-collections-hub') IconComponent = Box;
          else if (module.id === 'media-gallery-hub') IconComponent = Layers;
          else if (module.id === 'flow-player-engine') IconComponent = Layers;

          return (
            <NavLink
              key={module.id}
              to={module.route}
              className={({ isActive }) =>
                `flex items-center justify-between p-3 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5 truncate">
                <IconComponent className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <div className="font-semibold truncate">{module.name}</div>
                  <div className="text-[10px] opacity-75 truncate">{module.id}</div>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info & Firebase Status */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950">
        <FirebaseStatus />
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Vite + React 18
          </span>
          <span className="text-indigo-400 font-mono">RTL Mode</span>
        </div>
      </div>
    </aside>
  );
};
