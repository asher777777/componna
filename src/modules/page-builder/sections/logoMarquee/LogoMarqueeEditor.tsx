import React from 'react';
import { LogoMarqueeSectionConfig, LogoMarqueeItem } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { Plus, Trash2 } from 'lucide-react';

export const LogoMarqueeEditor: React.FC<{
  config: LogoMarqueeSectionConfig;
  onChange: (updated: LogoMarqueeSectionConfig) => void;
}> = ({ config, onChange }) => {
  const handleItemChange = (index: number, field: keyof LogoMarqueeItem, value: any) => {
    const updated = [...(config.logos || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, logos: updated });
  };

  const handleAddItem = () => {
    const newItem: LogoMarqueeItem = {
      id: `logo_${Date.now()}`,
      name: 'לוגו שותף',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/google-g-2015.svg',
    };
    onChange({ ...config, logos: [...(config.logos || []), newItem] });
  };

  const handleDeleteItem = (index: number) => {
    const updated = (config.logos || []).filter((_, i) => i !== index);
    onChange({ ...config, logos: updated });
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      <PageBuilderInput
        label="כותרת שורת הלוגואים"
        value={config.title || ''}
        onChange={(val) => onChange({ ...config, title: val })}
      />

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={config.grayscale || false}
            onChange={(e) => onChange({ ...config, grayscale: e.target.checked })}
            className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
          />
          <span>הצג בגווני אפור (Grayscale) עם צבע ב-Hover</span>
        </label>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h4 className="text-sm font-bold text-white">רשימת לוגואים ({config.logos?.length || 0})</h4>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף לוגו</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {config.logos?.map((logo, idx) => (
          <div key={logo.id || idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {logo.logoUrl ? (
                <img src={logo.logoUrl} alt={logo.name} className="max-h-8 max-w-8 object-contain" />
              ) : (
                <span className="text-xs text-slate-500">לוגו</span>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <PageBuilderInput
                label="שם חברה / מותג"
                value={logo.name || ''}
                onChange={(val) => handleItemChange(idx, 'name', val)}
              />
              <PageBuilderInput
                label="כתובת תמונת הלוגו (URL)"
                value={logo.logoUrl || ''}
                onChange={(val) => handleItemChange(idx, 'logoUrl', val)}
              />
            </div>

            <button
              type="button"
              onClick={() => handleDeleteItem(idx)}
              className="text-slate-500 hover:text-red-400 p-2 transition-colors"
              title="מחק"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
