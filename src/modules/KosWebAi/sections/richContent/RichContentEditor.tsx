import React from 'react';
import { RichContentSectionConfig, RichContentItem } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderIconPicker } from '../../ui/PageBuilderIconPicker';
import { FileText, Sliders, Plus, Trash2, Layers } from 'lucide-react';

interface RichContentEditorProps {
  config: RichContentSectionConfig;
  onChange: (updated: RichContentSectionConfig) => void;
}

export const RichContentEditor: React.FC<RichContentEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof RichContentSectionConfig>(field: K, value: RichContentSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const items = config.items || [];

  const updateItem = (idx: number, patch: Partial<RichContentItem>) => {
    const next = items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    update('items', next);
  };

  const addItem = () => {
    update('items', [
      ...items,
      { id: `item_${Date.now()}`, title: 'כותרת כרטיס', text: 'תיאור מורחב...', icon: 'Sparkles' },
    ]);
  };

  const removeItem = (idx: number) => {
    update('items', items.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="תוכן מעוצב ועשיר" icon={<FileText className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת משנה / תגית"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: היתרונות שלנו"
        />
        <PageBuilderInput
          label="כותרת ראשית של התוכן"
          value={config.heading || ''}
          onChange={(e) => update('heading', e.target.value)}
          placeholder="למשל: אודות הפרויקט והחזון שלנו"
        />
        <PageBuilderTextarea
          label="גוף הטקסט (תומך ב-HTML ותוכן עשיר)"
          value={config.body || ''}
          onChange={(e) => update('body', e.target.value)}
          rows={5}
          placeholder="הזן פסקאות טקסט כאן..."
        />

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold text-slate-300">סגנון פריסה</label>
          <select
            value={config.layout || 'standard'}
            onChange={(e) => update('layout', e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="standard">סטנדרטי (פסקה אחת רחבה)</option>
            <option value="two-columns">שני טורים (Two Columns)</option>
            <option value="highlight-box">קופסה מודגשת עם רקע ומסגרת (Highlight Box)</option>
            <option value="cards-grid-3">רשת כרטיסים (3 בשורה עם אייקונים)</option>
            <option value="cards-grid-2">רשת כרטיסים (2 בשורה עם אייקונים)</option>
          </select>
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title={`כרטיסי תוכן חוזרים (${items.length})`} icon={<Layers className="w-4 h-4 text-emerald-400" />} defaultOpen={items.length > 0}>
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">פריט #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <PageBuilderIconPicker
                label="אייקון"
                value={item.icon || 'Sparkles'}
                onChange={(icon) => updateItem(idx, { icon })}
              />
              <PageBuilderInput
                label="כותרת"
                value={item.title || ''}
                onChange={(e) => updateItem(idx, { title: e.target.value })}
              />
              <PageBuilderTextarea
                label="טקסט מורחב"
                value={item.text ?? item.description ?? ''}
                onChange={(e) => updateItem(idx, { text: e.target.value, description: e.target.value })}
                rows={3}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="w-full py-2 rounded-xl border border-dashed border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            הוסף כרטיס תוכן
          </button>
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'richContent'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="richContent"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
