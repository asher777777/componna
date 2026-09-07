import React, { useState } from 'react';
import { FaqSectionConfig, FaqItem } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderButton } from '../../ui/PageBuilderButton';
import { Plus, Trash2, Edit2, HelpCircle, Sliders } from 'lucide-react';

interface FaqSectionEditorProps {
  config: FaqSectionConfig;
  onChange: (updated: FaqSectionConfig) => void;
}

export const FaqSectionEditor: React.FC<FaqSectionEditorProps> = ({ config, onChange }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const update = <K extends keyof FaqSectionConfig>(field: K, value: FaqSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handleAddItem = () => {
    const newItem: FaqItem = {
      id: Date.now().toString(),
      question: 'שאלה חדשה?',
      answer: 'תשובה מפורטת כאן...',
    };
    const updated = [...(config.items || []), newItem];
    update('items', updated);
    setEditingItemId(newItem.id);
  };

  const handleUpdateItem = (id: string, updates: Partial<FaqItem>) => {
    const updated = (config.items || []).map((item) => (item.id === id ? { ...item, ...updates } : item));
    update('items', updated);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('האם למחוק שאלה זו?')) {
      update('items', (config.items || []).filter((item) => item.id !== id));
      if (editingItemId === id) setEditingItemId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="כותרות שאלות ותשובות" icon={<HelpCircle className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: שאלות ותשובות נפוצות"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: תשובות לכל השאלות שרציתם לשאול"
        />
      </PageBuilderAccordion>

      <PageBuilderAccordion
        title={`ניהול שאלות ותשובות (${(config.items || []).length})`}
        icon={<Plus className="w-4 h-4 text-emerald-400" />}
        defaultOpen={true}
        actionNode={
          <PageBuilderButton size="xs" variant="primary" onClick={handleAddItem} icon={<Plus className="w-3.5 h-3.5" />}>
            הוסף שאלה
          </PageBuilderButton>
        }
      >
        <div className="flex flex-col gap-3">
          {(config.items || []).map((item, idx) => {
            const isEditing = editingItemId === item.id;
            return (
              <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    <span className="text-sm font-bold text-white">{item.question || 'ללא שאלה'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingItemId(isEditing ? null : item.id)}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex flex-col gap-3 animate-in fade-in">
                    <PageBuilderInput
                      label="השאלה"
                      value={item.question}
                      onChange={(e) => handleUpdateItem(item.id, { question: e.target.value })}
                    />
                    <PageBuilderTextarea
                      label="התשובה"
                      value={item.answer}
                      onChange={(e) => handleUpdateItem(item.id, { answer: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            );
          })}
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
          value={config.anchorId || 'faq'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="faq"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
