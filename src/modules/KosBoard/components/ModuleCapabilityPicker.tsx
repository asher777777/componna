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
  CheckCircle2,
  Sparkles,
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
  recommendedCount?: number;
}

export const ModuleCapabilityPicker: React.FC<ModuleCapabilityPickerProps> = ({
  modules,
  selectedModuleIds,
  onToggle,
  onSelectRecommended,
  onSelectAll,
  onClear,
  recommendedCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = modules.filter((m) => {
    const matchesSearch =
      m.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'recommended' && m.actions.length > 0) ||
      m.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-100 dark:border-indigo-500/20">
            2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">שילוב רכיבי מערכת</h3>
              <Tooltip content="סמן את הרכיבים שתרצה לשלב בלוח הבקרה. כל רכיב חדש שנרשם במערכת מופיע כאן אוטומטית." />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              נבחרו <span className="font-bold text-indigo-600 dark:text-indigo-300">{selectedModuleIds.length}</span> מתוך{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">{modules.length}</span> רכיבים
            </p>
          </div>
        </div>

        {/* Quick Selection Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={onSelectRecommended}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl transition font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>רכיבים מומלצים</span>
          </button>

          <button
            type="button"
            onClick={onSelectAll}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer font-medium"
          >
            בחר הכל
          </button>

          <button
            type="button"
            onClick={onClear}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition cursor-pointer font-medium"
          >
            נקה
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חיפוש רכיב לפי שם או תיאור..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition shadow-2xs"
        />
      </div>

      {/* Grid of Clean Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
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
              className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer select-none flex flex-col justify-between text-right relative ${
                isSelected
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                        {mod.moduleName}
                      </h4>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400/80 font-medium">
                        {mod.actions.length > 0 ? `${mod.actions.length} פעולות זמינות` : 'רכיב מערכת'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300/80 leading-relaxed line-clamp-2">
                  {mod.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                  {mod.category === 'marketing'
                    ? 'שיווק ופרסום'
                    : mod.category === 'sales'
                    ? 'מכירות וסליקה'
                    : mod.category === 'communication'
                    ? 'תקשורת ושירות'
                    : mod.category === 'content'
                    ? 'תוכן ומדיה'
                    : 'תפעול וניהול'}
                </span>

                <span className="text-[10px]">
                  {mod.kpis.length > 0 ? `${mod.kpis.length} מדדים חיים` : 'סנכרון מלא'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
