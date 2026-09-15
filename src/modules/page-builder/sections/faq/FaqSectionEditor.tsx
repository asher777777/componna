import React from 'react';
import { FaqSectionConfig, FaqItem } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { Plus, Trash2 } from 'lucide-react';

export const FaqSectionEditor: React.FC<{
  config: FaqSectionConfig;
  onChange: (updated: FaqSectionConfig) => void;
}> = ({ config, onChange }) => {
  const handleItemChange = (index: number, field: keyof FaqItem, value: any) => {
    const updated = [...(config.items || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, items: updated });
  };

  const handleAddItem = () => {
    const newItem: FaqItem = {
      id: `faq_${Date.now()}`,
      question: 'שאלה חדשה שנשאלת לעיתים קרובות?',
      answer: 'תשובה מפורטת וברורה שמספקת מענה מלא למשתמש.',
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
          label="כותרת אזור השאלות"
          value={config.title || ''}
          onChange={(val) => onChange({ ...config, title: val })}
        />
        <PageBuilderInput
          label="תת-כותרת / תגית"
          value={config.subtitle || ''}
          onChange={(val) => onChange({ ...config, subtitle: val })}
        />
      </div>

      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-300">הגדרות תצוגה ועזרה</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showSearchBar !== false}
              onChange={(e) => onChange({ ...config, showSearchBar: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>הצג שורת חיפוש מהירה</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showContactCard !== false}
              onChange={(e) => onChange({ ...config, showContactCard: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>הצג כרטיס תמיכה ישיר</span>
          </label>
          <PageBuilderInput
            label="טלפון וואטסאפ לפניות"
            value={config.whatsappContact || ''}
            onChange={(val) => onChange({ ...config, whatsappContact: val })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h4 className="text-sm font-bold text-white">שאלות ותשובות ({config.items?.length || 0})</h4>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף שאלה</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {config.items?.map((item, idx) => (
          <div key={item.id || idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">שאלה #{idx + 1}</span>
              <button
                type="button"
                onClick={() => handleDeleteItem(idx)}
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                title="מחק"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <PageBuilderInput
              label="השאלה"
              value={item.question || ''}
              onChange={(val) => handleItemChange(idx, 'question', val)}
            />

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">התשובה</label>
              <textarea
                rows={3}
                value={item.answer || ''}
                onChange={(e) => handleItemChange(idx, 'answer', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
