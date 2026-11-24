import React from 'react';
import { Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { ServicesGridConfig, ServicesGridItem } from './ServicesGridSection';
import { PageBuilderInput, PageBuilderTextarea, resolveInputValue } from '../../ui/PageBuilderInput';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { SectionStylePresetSelector } from '../../ui/SectionStylePresetSelector';

interface Props {
  config: ServicesGridConfig;
  onChange: (updated: ServicesGridConfig) => void;
}

const selectClass =
  'w-full bg-slate-900/80 border border-slate-700/80 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-150';

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

  const moveItem = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    onChange({ ...config, items: next });
  };

  return (
    <div className="flex flex-col gap-5 text-right" dir="rtl">
      <SectionStylePresetSelector
        value={config.stylePreset as any}
        onChange={(preset) => onChange({ ...config, stylePreset: preset })}
      />

      <div className="flex flex-col gap-4">
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: resolveInputValue(e) })}
          placeholder="לדוגמה: השירותים והתכניות שלנו"
        />

        <PageBuilderTextarea
          label="תיאור"
          rows={2}
          value={config.description || ''}
          onChange={(e) => onChange({ ...config, description: resolveInputValue(e) })}
          placeholder="תיאור קצר שיופיע מתחת לכותרת"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">פריסה</label>
          <select
            value={config.layout || 'grid'}
            onChange={(e) => onChange({ ...config, layout: e.target.value as any })}
            className={selectClass}
          >
            <option value="grid">רשת כרטיסים (Grid)</option>
            <option value="image-card">כרטיסי תמונה (Image Card)</option>
            <option value="hover-card">כרטיסי ריחוף (Hover Card)</option>
            <option value="carousel">סליידר אופקי (Carousel)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">עמודות</label>
          <select
            value={config.columns || 3}
            onChange={(e) => onChange({ ...config, columns: Number(e.target.value) })}
            className={selectClass}
          >
            <option value={1}>עמודה 1</option>
            <option value={2}>2 עמודות</option>
            <option value={3}>3 עמודות</option>
            <option value={4}>4 עמודות</option>
          </select>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">פריטים ({items.length})</span>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 text-white px-3.5 py-2 rounded-xl hover:bg-indigo-500 transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> הוסף פריט
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {item.title || `פריט #${idx + 1}`}
                  </span>
                  {item.isVisible === false && (
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      מוסתר
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                    title="הזז למעלה"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                    title="הזז למטה"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(idx, { isVisible: item.isVisible === false })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={item.isVisible === false ? 'הצג' : 'הסתר'}
                  >
                    {item.isVisible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="מחק"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderInput
                  label="כותרת הפריט"
                  value={item.title || ''}
                  onChange={(e) => updateItem(idx, { title: resolveInputValue(e) })}
                  placeholder="כותרת השירות או הכרטיס"
                />
                <PageBuilderInput
                  label="אייקון (Lucide)"
                  value={item.icon || ''}
                  onChange={(e) => updateItem(idx, { icon: resolveInputValue(e) })}
                  placeholder="Star, Heart, Sparkles..."
                  dir="ltr"
                  className="text-left font-mono"
                />
              </div>

              <PageBuilderTextarea
                label="תיאור קצר"
                rows={2}
                value={item.description || ''}
                onChange={(e) => updateItem(idx, { description: resolveInputValue(e) })}
                placeholder="תיאור השירות שיוצג בכרטיס"
              />

              <PageBuilderInput
                label="קישור (URL)"
                value={item.url || ''}
                onChange={(e) => updateItem(idx, { url: resolveInputValue(e) })}
                placeholder="https://... או #contact"
                dir="ltr"
                className="text-left"
              />

              <PageBuilderImageUpload
                label="תמונת כרטיס (אופציונלי)"
                value={item.imageSrc || ''}
                onChange={(url) => updateItem(idx, { imageSrc: url })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
