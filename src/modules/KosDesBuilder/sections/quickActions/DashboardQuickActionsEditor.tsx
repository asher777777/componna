import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardQuickActionsConfig, DashboardActionButtonItem } from '../../types';

export interface DashboardQuickActionsEditorProps {
  config: DashboardQuickActionsConfig;
  onChange: (updated: DashboardQuickActionsConfig) => void;
}

export const DashboardQuickActionsEditor: React.FC<DashboardQuickActionsEditorProps> = ({
  config,
  onChange,
}) => {
  const updateTitle = (title: string) => {
    onChange({ ...config, title });
  };

  const updateLayout = (layout: 'grid' | 'row') => {
    onChange({ ...config, layout });
  };

  const addButton = () => {
    const newBtn: DashboardActionButtonItem = {
      id: `btn-${Date.now().toString(36)}`,
      label: 'כפתור חדש',
      icon: 'PlusCircle',
      variant: 'outline',
      actionType: 'navigate',
      target: '/',
    };
    onChange({ ...config, buttons: [...config.buttons, newBtn] });
  };

  const updateButton = (index: number, updates: Partial<DashboardActionButtonItem>) => {
    const newButtons = [...config.buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    onChange({ ...config, buttons: newButtons });
  };

  const removeButton = (index: number) => {
    const newButtons = config.buttons.filter((_, i) => i !== index);
    onChange({ ...config, buttons: newButtons });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          כותרת האזור
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="לדוגמה: פעולות מהירות"
          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      {/* Layout Style */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          סגנון פריסה
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateLayout('row')}
            className={`py-1.5 rounded-xl text-xs font-bold border transition ${
              config.layout === 'row'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            שורה רציפה (Pills)
          </button>
          <button
            type="button"
            onClick={() => updateLayout('grid')}
            className={`py-1.5 rounded-xl text-xs font-bold border transition ${
              config.layout === 'grid'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            גריד כפתורים (Grid)
          </button>
        </div>
      </div>

      {/* Buttons List */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            כפתורי הפעולה ({config.buttons.length})
          </span>
          <button
            type="button"
            onClick={addButton}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף כפתור</span>
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pl-1">
          {config.buttons.map((btn, idx) => (
            <div
              key={btn.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={btn.label}
                  onChange={(e) => updateButton(idx, { label: e.target.value })}
                  placeholder="טקסט כפתור"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold w-2/3"
                />
                <button
                  type="button"
                  onClick={() => removeButton(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={btn.target}
                  onChange={(e) => updateButton(idx, { target: e.target.value })}
                  placeholder="יעד / נתיב (/contacts)"
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                />

                <select
                  value={btn.variant || 'outline'}
                  onChange={(e) => updateButton(idx, { variant: e.target.value as any })}
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value="primary">ראשי (אינדיגו)</option>
                  <option value="secondary">כהה / בולט</option>
                  <option value="outline">מסגרת (עדין)</option>
                  <option value="danger">אדום (אזהרה)</option>
                </select>
              </div>

              <div className="space-y-1">
                <select
                  value={btn.icon || 'PlusCircle'}
                  onChange={(e) => updateButton(idx, { icon: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value="UserPlus">UserPlus (איש קשר)</option>
                  <option value="Receipt">Receipt (קבלה / חיוב)</option>
                  <option value="Send">Send (שליחת הודעה)</option>
                  <option value="Layout">Layout (עמוד KWB)</option>
                  <option value="PlusCircle">PlusCircle (הוספה כללית)</option>
                  <option value="CreditCard">CreditCard (כרטיס אשראי)</option>
                  <option value="MessageCircle">MessageCircle (וואטסאפ)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
