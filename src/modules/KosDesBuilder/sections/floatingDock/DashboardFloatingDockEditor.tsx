import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardFloatingDockConfig, DashboardFloatingDockItem } from '../../types';

export interface DashboardFloatingDockEditorProps {
  config: DashboardFloatingDockConfig;
  onChange: (updated: DashboardFloatingDockConfig) => void;
}

export const DashboardFloatingDockEditor: React.FC<DashboardFloatingDockEditorProps> = ({
  config,
  onChange,
}) => {
  const updateField = <K extends keyof DashboardFloatingDockConfig>(key: K, val: DashboardFloatingDockConfig[K]) => {
    onChange({ ...config, [key]: val });
  };

  const addItem = () => {
    const newItem: DashboardFloatingDockItem = {
      id: `dock-${Date.now().toString(36)}`,
      label: 'פריט תפריט',
      icon: 'LayoutDashboard',
      targetUrl: '/dashboard',
    };
    onChange({ ...config, items: [...config.items, newItem] });
  };

  const updateItem = (index: number, updates: Partial<DashboardFloatingDockItem>) => {
    const newItems = [...config.items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ ...config, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = config.items.filter((_, i) => i !== index);
    onChange({ ...config, items: newItems });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Dock Position & Display Options */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
          הגדרות מעגן צף (Cashwan Dock)
        </span>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
            הצג תוויות טקסט
          </span>
          <input
            type="checkbox"
            checked={Boolean(config.showLabels)}
            onChange={(e) => updateField('showLabels', e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            מיקום המעגן
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateField('dockPosition', 'bottom')}
              className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                (config.dockPosition || 'bottom') === 'bottom'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              תחתון מרכזי
            </button>
            <button
              type="button"
              onClick={() => updateField('dockPosition', 'side')}
              className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                config.dockPosition === 'side'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              צף צדדי
            </button>
          </div>
        </div>
      </div>

      {/* Dock Items */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            פריטי המעגן ({config.items.length})
          </span>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף פריט</span>
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pl-1">
          {config.items.map((item, idx) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(idx, { label: e.target.value })}
                  placeholder="תווית פריט"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold w-2/3"
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.targetUrl}
                  onChange={(e) => updateItem(idx, { targetUrl: e.target.value })}
                  placeholder="כתובת יעד (/contacts)"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                />

                <select
                  value={item.icon || 'LayoutDashboard'}
                  onChange={(e) => updateItem(idx, { icon: e.target.value })}
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value="LayoutDashboard">LayoutDashboard (דשבורד)</option>
                  <option value="Users">Users (אנשי קשר)</option>
                  <option value="CreditCard">CreditCard (תשלומים)</option>
                  <option value="MessageCircle">MessageCircle (וואטסאפ)</option>
                  <option value="Settings">Settings (הגדרות)</option>
                  <option value="Sparkles">Sparkles (AI)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
