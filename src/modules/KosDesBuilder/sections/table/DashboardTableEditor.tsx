import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardTableConfig, DashboardTableColumn } from '../../types';

export interface DashboardTableEditorProps {
  config: DashboardTableConfig;
  onChange: (updated: DashboardTableConfig) => void;
}

export const DashboardTableEditor: React.FC<DashboardTableEditorProps> = ({
  config,
  onChange,
}) => {
  const updateField = <K extends keyof DashboardTableConfig>(key: K, val: DashboardTableConfig[K]) => {
    onChange({ ...config, [key]: val });
  };

  const addColumn = () => {
    const newCol: DashboardTableColumn = {
      key: `field_${Date.now().toString(36)}`,
      label: 'עמודה חדשה',
      sortable: true,
      type: 'text',
    };
    onChange({ ...config, columns: [...config.columns, newCol] });
  };

  const updateColumn = (index: number, updates: Partial<DashboardTableColumn>) => {
    const newCols = [...config.columns];
    newCols[index] = { ...newCols[index], ...updates };
    onChange({ ...config, columns: newCols });
  };

  const removeColumn = (index: number) => {
    const newCols = config.columns.filter((_, i) => i !== index);
    onChange({ ...config, columns: newCols });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Title & Subtitle */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          כותרת הטבלה
        </label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => updateField('title', e.target.value)}
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

      {/* Collection Connection */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
          חיבור קולקציה ונתונים
        </span>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            שם קולקציית הדייר
          </label>
          <select
            value={config.collectionName || 'contacts'}
            onChange={(e) => updateField('collectionName', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono cursor-pointer"
          >
            <option value="contacts">contacts (אנשי קשר ולידים)</option>
            <option value="kesher_transactions">kesher_transactions (עסקאות וסליקה)</option>
            <option value="crm_subscription_packages">crm_subscription_packages (מנויים וחבילות)</option>
            <option value="kos_whatsup_chats">kos_whatsup_chats (שיחות וואטסאפ)</option>
            <option value="mod_campaigns">mod_campaigns (קמפיינים ושגרירים)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">תיבת חיפוש</span>
            <input
              type="checkbox"
              checked={Boolean(config.showSearch)}
              onChange={(e) => updateField('showSearch', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">כפתור ייצוא</span>
            <input
              type="checkbox"
              checked={Boolean(config.showExport)}
              onChange={(e) => updateField('showExport', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
          </label>
        </div>
      </div>

      {/* Columns Management */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            עמודות הטבלה ({config.columns.length})
          </span>
          <button
            type="button"
            onClick={addColumn}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף עמודה</span>
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pl-1">
          {config.columns.map((col, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={col.label}
                  onChange={(e) => updateColumn(idx, { label: e.target.value })}
                  placeholder="כותרת עמודה"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold w-1/2"
                />
                <button
                  type="button"
                  onClick={() => removeColumn(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={col.key}
                  onChange={(e) => updateColumn(idx, { key: e.target.value })}
                  placeholder="מפתח שדה (key)"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                />
                <select
                  value={col.type || 'text'}
                  onChange={(e) => updateColumn(idx, { type: e.target.value as any })}
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value="text">טקסט רגיל</option>
                  <option value="badge">תגית / סטטוס</option>
                  <option value="date">תאריך</option>
                  <option value="currency">מטבע (₪)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
