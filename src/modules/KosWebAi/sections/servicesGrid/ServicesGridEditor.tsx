import React from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { ServicesGridConfig, ServicesGridItem } from './ServicesGridSection';

interface Props {
  config: ServicesGridConfig;
  onChange: (updated: ServicesGridConfig) => void;
}

export const ServicesGridEditor: React.FC<Props> = ({ config, onChange }) => {
  const items = config.items || [];

  const updateItem = (idx: number, patch: Partial<ServicesGridItem>) => {
    const next = items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onChange({ ...config, items: next });
  };

  const addItem = () => {
    const newItem: ServicesGridItem = {
      id: `srv_${Date.now()}`,
      title: 'שירות חדש',
      description: 'תיאור קצר של השירות או המסלול',
      url: '#contact',
      icon: 'Star',
      isVisible: true,
    };
    onChange({ ...config, items: [...items, newItem] });
  };

  const removeItem = (idx: number) => {
    onChange({ ...config, items: items.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">כותרת האזור</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">תיאור</label>
        <textarea
          rows={2}
          value={config.description || ''}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">פריסה</label>
          <select
            value={config.layout || 'grid'}
            onChange={(e) => onChange({ ...config, layout: e.target.value as any })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="grid">רשת כרטיסים (Grid)</option>
            <option value="image-card">כרטיסי תמונה (Image Card)</option>
            <option value="hover-card">כרטיסי ריחוף (Hover Card)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">עמודות</label>
          <select
            value={config.columns || 3}
            onChange={(e) => onChange({ ...config, columns: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value={2}>2 עמודות</option>
            <option value={3}>3 עמודות</option>
            <option value={4}>4 עמודות</option>
          </select>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">פריטים ({items.length})</span>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" /> הוסף פריט
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  placeholder="כותרת הפריט"
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => updateItem(idx, { isVisible: item.isVisible === false })}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                  title={item.isVisible === false ? 'הצג' : 'הסתר'}
                >
                  {item.isVisible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                  title="מחק"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                placeholder="תיאור קצר"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.url || ''}
                  onChange={(e) => updateItem(idx, { url: e.target.value })}
                  placeholder="קישור (URL)"
                  dir="ltr"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-left"
                />
                <input
                  type="text"
                  value={item.imageSrc || ''}
                  onChange={(e) => updateItem(idx, { imageSrc: e.target.value })}
                  placeholder="קישור לתמונה (אופציונלי)"
                  dir="ltr"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-left"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
