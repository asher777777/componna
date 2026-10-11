import React, { useState } from 'react';
import {
  Mail,
  MessageSquare,
  CreditCard,
  ClipboardList,
  Layout,
  BarChart3,
  Award,
  Video,
  Cpu,
  Search,
  Check,
  Zap,
  FolderOpen,
} from 'lucide-react';
import { DynamicModuleCapability } from '../types';
import { Tooltip } from './Tooltip';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Mail,
  MessageSquare,
  CreditCard,
  ClipboardList,
  Layout,
  BarChart3,
  Award,
  Video,
  Cpu,
};

export interface ModuleCapabilityPickerProps {
  modules: DynamicModuleCapability[];
  selectedModuleIds: string[];
  onToggle: (moduleId: string) => void;
  onSelectRecommended: () => void;
  onSelectAll: () => void;
  onClear: () => void;
}

export const ModuleCapabilityPicker: React.FC<ModuleCapabilityPickerProps> = ({
  modules,
  selectedModuleIds,
  onToggle,
  onSelectRecommended,
  onSelectAll,
  onClear,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = modules.filter(
    (m) =>
      m.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.moduleId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">
            2. בחירת רכיבי המערכת שיחוברו ללוח הבקרה
          </span>
          <Tooltip content="כל רכיב חדש שמתווסף למערכת מופיע כאן אוטומטית. סמן את הרכיבים שתרצה לשלב בלוח הבקרה של המשתמש." />
          <span className="text-[11px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
            {selectedModuleIds.length} מתוך {modules.length} נבחרו
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={onSelectRecommended}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-indigo-300 rounded-lg transition"
          >
            מומלצים לקהל
          </button>
          <button
            type="button"
            onClick={onSelectAll}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition"
          >
            בחר הכל
          </button>
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg transition"
          >
            נקה
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="סינון רכיבים לפי שם, פונקציונליות או מזהה..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Grid of Dynamic Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filtered.map((mod) => {
          const isSelected = selectedModuleIds.includes(mod.moduleId);
          const IconComp = ICON_MAP[mod.iconName] || Cpu;

          return (
            <div
              key={mod.moduleId}
              onClick={() => onToggle(mod.moduleId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onToggle(mod.moduleId);
                }
              }}
              className={`p-3 rounded-2xl border transition duration-150 cursor-pointer select-none relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/80 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-100 leading-tight">
                        {mod.moduleName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {mod.route}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-slate-700 bg-slate-850'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
                  {mod.description}
                </p>
              </div>

              {/* Capabilities & Collections Preview */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{mod.actions.length} פעולות</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px] text-slate-500">
                  <FolderOpen className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">
                    {mod.primaryCollections[0] || 'auto'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
