import React from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardStatsConfig, DashboardStatItem } from '../../types';

export interface DashboardStatsEditorProps {
  config: DashboardStatsConfig;
  onChange: (updated: DashboardStatsConfig) => void;
}

export const DashboardStatsEditor: React.FC<DashboardStatsEditorProps> = ({
  config,
  onChange,
}) => {
  const updateColumns = (cols: 2 | 3 | 4) => {
    onChange({ ...config, columns: cols });
  };

  const updateStatItem = (index: number, updates: Partial<DashboardStatItem>) => {
    const newStats = [...config.stats];
    newStats[index] = { ...newStats[index], ...updates };
    onChange({ ...config, stats: newStats });
  };

  const addStatItem = () => {
    const newItem: DashboardStatItem = {
      id: `stat-${Date.now().toString(36)}`,
      label: 'מדד חדש',
      value: '0',
      change: '+0%',
      isPositive: true,
      icon: 'Activity',
      color: 'indigo',
    };
    onChange({ ...config, stats: [...config.stats, newItem] });
  };

  const removeStatItem = (index: number) => {
    const newStats = config.stats.filter((_, i) => i !== index);
    onChange({ ...config, stats: newStats });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Columns Switcher */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          מספר עמודות מדדים
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[2, 3, 4].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateColumns(c as 2 | 3 | 4)}
              className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                (config.columns || 4) === c
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {c} עמודות
            </button>
          ))}
        </div>
      </div>

      {/* Stat Items List */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            רשימת כרטיסי המדדים ({config.stats.length})
          </span>
          <button
            type="button"
            onClick={addStatItem}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף מדד</span>
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pl-1">
          {config.stats.map((stat, idx) => (
            <div
              key={stat.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  מדד #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeStatItem(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  title="מחק מדד"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">תווית המדד</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStatItem(idx, { label: e.target.value })}
                    className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">ערך ראשי</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStatItem(idx, { value: e.target.value })}
                    className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">אחוז שינוי</label>
                  <input
                    type="text"
                    value={stat.change || ''}
                    onChange={(e) => updateStatItem(idx, { change: e.target.value })}
                    placeholder="+10%"
                    className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">מגמה חיובית?</label>
                  <button
                    type="button"
                    onClick={() => updateStatItem(idx, { isPositive: !stat.isPositive })}
                    className={`w-full py-1 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                      stat.isPositive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40'
                        : 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/40'
                    }`}
                  >
                    {stat.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{stat.isPositive ? 'חיובי' : 'שלילי'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">אייקון</label>
                  <select
                    value={stat.icon || 'TrendingUp'}
                    onChange={(e) => updateStatItem(idx, { icon: e.target.value })}
                    className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <option value="TrendingUp">TrendingUp</option>
                    <option value="Users">Users</option>
                    <option value="CreditCard">CreditCard</option>
                    <option value="MessageSquare">MessageSquare</option>
                    <option value="Activity">Activity</option>
                    <option value="DollarSign">DollarSign</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">גוון כרטיס</label>
                  <select
                    value={stat.color || 'indigo'}
                    onChange={(e) => updateStatItem(idx, { color: e.target.value as any })}
                    className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <option value="indigo">אינדיגו</option>
                    <option value="emerald">ירוק ברקת</option>
                    <option value="amber">ענבר כתום</option>
                    <option value="rose">ורד אדום</option>
                    <option value="blue">כחול</option>
                    <option value="purple">סגול</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
