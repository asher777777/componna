import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardCommandMatrixConfig, DashboardCommandMatrixItem } from '../../types';

export interface CommandMatrixEditorProps {
  config: DashboardCommandMatrixConfig;
  onChange: (updated: DashboardCommandMatrixConfig) => void;
}

export const CommandMatrixEditor: React.FC<CommandMatrixEditorProps> = ({
  config,
  onChange,
}) => {
  const updateField = <K extends keyof DashboardCommandMatrixConfig>(
    key: K,
    val: DashboardCommandMatrixConfig[K]
  ) => {
    onChange({ ...config, [key]: val });
  };

  const addItem = () => {
    const newItem: DashboardCommandMatrixItem = {
      id: `cm-${Date.now().toString(36)}`,
      title: 'רכיב חדש',
      subtitle: 'תיאור קצר של הפעולה',
      icon: 'Layers',
      moduleId: 'custom-module',
      targetUrl: '/',
      badge: 'פעיל',
    };
    onChange({ ...config, items: [...config.items, newItem] });
  };

  const updateItem = (index: number, updates: Partial<DashboardCommandMatrixItem>) => {
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
      {/* Title & Subtitle */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          כותרת המטריצה
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="לדוגמה: מרכז שליטה ורכיבים"
          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          תת-כותרת
        </label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => updateField('subtitle', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      {/* Columns */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          עמודות גריד
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[2, 3, 4].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateField('columns', c as 2 | 3 | 4)}
              className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                (config.columns || 3) === c
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {c} עמודות
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            אריחי הרכיבים ({config.items.length})
          </span>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף אריח</span>
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pl-1">
          {config.items.map((item, idx) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  placeholder="שם הרכיב"
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

              <div className="space-y-1">
                <input
                  type="text"
                  value={item.subtitle || ''}
                  onChange={(e) => updateItem(idx, { subtitle: e.target.value })}
                  placeholder="תיאור קצר"
                  className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.targetUrl}
                  onChange={(e) => updateItem(idx, { targetUrl: e.target.value })}
                  placeholder="כתובת יעד (/contacts)"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                />
                <input
                  type="text"
                  value={item.badge || ''}
                  onChange={(e) => updateItem(idx, { badge: e.target.value })}
                  placeholder="תגית (לדוגמה: פעיל)"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.moduleId}
                  onChange={(e) => updateItem(idx, { moduleId: e.target.value })}
                  placeholder="מזהה מודול (moduleId)"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                />
                <select
                  value={item.icon || 'Layers'}
                  onChange={(e) => updateItem(idx, { icon: e.target.value })}
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value="Layers">Layers (רכיבים)</option>
                  <option value="Users">Users (לקוחות)</option>
                  <option value="CreditCard">CreditCard (סליקה)</option>
                  <option value="MessageCircle">MessageCircle (וואטסאפ)</option>
                  <option value="Sparkles">Sparkles (AI)</option>
                  <option value="Video">Video (וידאו)</option>
                  <option value="FileText">FileText (טפסים)</option>
                  <option value="Mail">Mail (דיוור)</option>
                  <option value="Youtube">Youtube (יוטיוב)</option>
                  <option value="Share2">Share2 (טיקטוק)</option>
                  <option value="FolderLock">FolderLock (כספת מדיה)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
