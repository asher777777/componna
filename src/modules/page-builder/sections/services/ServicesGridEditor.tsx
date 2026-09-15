import React from 'react';
import { ServicesSectionConfig, ServiceItem } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderIconPicker } from '../../ui/PageBuilderIconPicker';
import { Plus, Trash2 } from 'lucide-react';

export const ServicesGridEditor: React.FC<{
  config: ServicesSectionConfig;
  onChange: (updated: ServicesSectionConfig) => void;
}> = ({ config, onChange }) => {
  const handleItemChange = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...(config.items || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, items: updated });
  };

  const handleAddItem = () => {
    const newItem: ServiceItem = {
      id: `srv_${Date.now()}`,
      title: 'שירות / פיצ׳ר חדש',
      description: 'תיאור מפורט על השירות ויתרונותיו המרכזיים',
      icon: 'Sparkles',
      url: '#',
      isVisible: true,
      span: '1',
    };
    onChange({ ...config, items: [...(config.items || []), newItem] });
  };

  const handleDeleteItem = (index: number) => {
    const updated = (config.items || []).filter((_, i) => i !== index);
    onChange({ ...config, items: updated });
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PageBuilderInput
          label="כותרת אזור השירותים"
          value={config.title || ''}
          onChange={(val) => onChange({ ...config, title: val })}
        />
        <PageBuilderInput
          label="תת-כותרת / תגית"
          value={config.subtitle || ''}
          onChange={(val) => onChange({ ...config, subtitle: val })}
        />
      </div>

      <PageBuilderInput
        label="תיאור כללי (אופציונלי)"
        value={config.description || ''}
        onChange={(val) => onChange({ ...config, description: val })}
      />

      <div className="flex items-center justify-between pt-2">
        <h4 className="text-sm font-bold text-white">כרטיסיות Bento Grid ({config.items?.length || 0})</h4>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף כרטיס פיצ׳ר</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {config.items?.map((item, idx) => (
          <div key={item.id || idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">כרטיס #{idx + 1}</span>
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
                label="כותרת הפיצ׳ר"
                value={item.title || ''}
                onChange={(val) => handleItemChange(idx, 'title', val)}
              />
              <PageBuilderIconPicker
                label="אייקון"
                value={item.icon || 'Star'}
                onChange={(val) => handleItemChange(idx, 'icon', val)}
              />
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">פריסת Bento (רוחב)</label>
                <select
                  value={item.span || '1'}
                  onChange={(e) => handleItemChange(idx, 'span', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="1">עמודה רגילה (1 Col)</option>
                  <option value="2">עמודה כפולה מודגשת (2 Cols - Bento Hero)</option>
                </select>
              </div>
            </div>

            <PageBuilderInput
              label="תיאור הפיצ׳ר"
              value={item.description || ''}
              onChange={(val) => handleItemChange(idx, 'description', val)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PageBuilderInput
                label="תגית / Badge"
                value={item.badge || ''}
                onChange={(val) => handleItemChange(idx, 'badge', val)}
              />
              <PageBuilderInput
                label="כתובת תמונה מלווה (URL)"
                value={item.imageSrc || ''}
                onChange={(val) => handleItemChange(idx, 'imageSrc', val)}
              />
              <PageBuilderInput
                label="קישור למידע נוסף (URL)"
                value={item.url || ''}
                onChange={(val) => handleItemChange(idx, 'url', val)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
