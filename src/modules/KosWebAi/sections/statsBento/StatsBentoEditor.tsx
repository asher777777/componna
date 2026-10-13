import React from 'react';
import { StatsBentoSectionConfig, StatsBentoItem } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderIconPicker } from '../../ui/PageBuilderIconPicker';
import { Plus, Trash2 } from 'lucide-react';

export const StatsBentoEditor: React.FC<{
  config: StatsBentoSectionConfig;
  onChange: (updated: StatsBentoSectionConfig) => void;
}> = ({ config, onChange }) => {
  const handleItemChange = (index: number, field: keyof StatsBentoItem, value: any) => {
    const updated = [...(config.stats || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, stats: updated });
  };

  const handleAddItem = () => {
    const newItem: StatsBentoItem = {
      id: `stat_${Date.now()}`,
      number: '100',
      suffix: '%',
      label: 'מדד הצלחה חדש',
      description: 'הסבר קצר על הנתון',
      icon: 'TrendingUp',
      color: 'indigo',
    };
    onChange({ ...config, stats: [...(config.stats || []), newItem] });
  };

  const handleDeleteItem = (index: number) => {
    const updated = (config.stats || []).filter((_, i) => i !== index);
    onChange({ ...config, stats: updated });
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PageBuilderInput
          label="כותרת אזור המספרים"
          value={config.title || ''}
          onChange={(val) => onChange({ ...config, title: val })}
        />
        <PageBuilderInput
          label="תת-כותרת / תגית"
          value={config.subtitle || ''}
          onChange={(val) => onChange({ ...config, subtitle: val })}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <h4 className="text-sm font-bold text-white">רשימת מדדים ({config.stats?.length || 0})</h4>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף מדד</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {config.stats?.map((stat, idx) => (
          <div key={stat.id || idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">מדד #{idx + 1}</span>
              <button
                type="button"
                onClick={() => handleDeleteItem(idx)}
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                title="מחק"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PageBuilderInput
                label="מספר ראשי"
                value={stat.number || ''}
                onChange={(val) => handleItemChange(idx, 'number', val)}
              />
              <PageBuilderInput
                label="סיומת (כגון: %, +, X)"
                value={stat.suffix || ''}
                onChange={(val) => handleItemChange(idx, 'suffix', val)}
              />
              <PageBuilderInput
                label="תווית / כותרת המדד"
                value={stat.label || ''}
                onChange={(val) => handleItemChange(idx, 'label', val)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PageBuilderInput
                label="תיאור קצר"
                value={stat.description || ''}
                onChange={(val) => handleItemChange(idx, 'description', val)}
              />
              <PageBuilderIconPicker
                label="אייקון"
                value={stat.icon || 'TrendingUp'}
                onChange={(val) => handleItemChange(idx, 'icon', val)}
              />
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">צבע הדגשה</label>
                <select
                  value={stat.color || 'indigo'}
                  onChange={(e) => handleItemChange(idx, 'color', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="indigo">אינדיגו / סגול</option>
                  <option value="emerald">ירוק ברקת</option>
                  <option value="purple">סגול עמוק</option>
                  <option value="amber">ענבר / זהב</option>
                  <option value="rose">ורוד ורד</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
