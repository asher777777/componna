import React, { useState } from 'react';
import { ServicesSectionConfig, ServiceItem } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderIconPicker } from '../../ui/PageBuilderIconPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderButton } from '../../ui/PageBuilderButton';
import { Plus, Trash2, Edit2, Eye, EyeOff, GripVertical, Sparkles, Layers, Sliders } from 'lucide-react';

interface ServicesGridEditorProps {
  config: ServicesSectionConfig;
  onChange: (updated: ServicesSectionConfig) => void;
}

export const ServicesGridEditor: React.FC<ServicesGridEditorProps> = ({ config, onChange }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const update = <K extends keyof ServicesSectionConfig>(field: K, value: ServicesSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handleAddItem = () => {
    const newItem: ServiceItem = {
      id: Date.now().toString(),
      title: 'שירות / כרטיס חדש',
      description: 'תיאור השירות והערך המרכזי ללקוח...',
      icon: 'Star',
      url: '#',
      isVisible: true,
    };
    const updated = [...(config.items || []), newItem];
    update('items', updated);
    setEditingItemId(newItem.id);
  };

  const handleUpdateItem = (id: string, updates: Partial<ServiceItem>) => {
    const updated = (config.items || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    update('items', updated);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('האם למחוק כרטיס שירות זה?')) {
      update(
        'items',
        (config.items || []).filter((item) => item.id !== id)
      );
      if (editingItemId === id) setEditingItemId(null);
    }
  };

  const handleToggleItemVisibility = (id: string) => {
    const updated = (config.items || []).map((item) =>
      item.id === id ? { ...item, isVisible: item.isVisible === false } : item
    );
    update('items', updated);
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      {/* Title & Description */}
      <PageBuilderAccordion title="כותרות ותיאור האזור" icon={<Layers className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת אזור השירותים"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: השירותים והפתרונות שלנו"
        />
        <PageBuilderTextarea
          label="תיאור כללי / פסקת מבוא"
          value={config.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          placeholder="למשל: מגוון רחב של כלים ופתרונות המותאמים אישית לצרכים שלך"
        />
      </PageBuilderAccordion>

      {/* Items List Manager */}
      <PageBuilderAccordion
        title={`ניהול כרטיסי שירות (${(config.items || []).length})`}
        icon={<Sparkles className="w-4 h-4 text-amber-400" />}
        defaultOpen={true}
        actionNode={
          <PageBuilderButton size="xs" variant="primary" onClick={handleAddItem} icon={<Plus className="w-3.5 h-3.5" />}>
            הוסף כרטיס
          </PageBuilderButton>
        }
      >
        <div className="flex flex-col gap-3">
          {(config.items || []).map((item, idx) => {
            const isEditing = editingItemId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
              >
                <div className="flex items-center justify-between p-3 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    <span className="text-sm font-bold text-white">{item.title || 'ללא כותרת'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleItemVisibility(item.id)}
                      className="p-1 text-slate-400 hover:text-white"
                      title={item.isVisible !== false ? 'מוצג' : 'מוסתר'}
                    >
                      {item.isVisible !== false ? (
                        <Eye className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-rose-400" />
                      )}
                    </button>
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
                      label="כותרת הכרטיס"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                    />
                    <PageBuilderTextarea
                      label="תיאור השירות"
                      value={item.description || ''}
                      onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                      rows={2}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PageBuilderIconPicker
                        label="אייקון הכרטיס"
                        value={item.icon || 'Star'}
                        onChange={(icon) => handleUpdateItem(item.id, { icon })}
                      />
                      <PageBuilderInput
                        label="תגית עליונה (Badge)"
                        value={item.badge || ''}
                        onChange={(e) => handleUpdateItem(item.id, { badge: e.target.value })}
                        placeholder="למשל: פופולרי / חדש"
                      />
                    </div>
                    <PageBuilderInput
                      label="קישור למידע נוסף (URL)"
                      value={item.url || ''}
                      onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                      placeholder="https://... או /services/..."
                      dir="ltr"
                    />
                    <PageBuilderImageUpload
                      label="תמונה נלווית (אופציונלי)"
                      value={item.imageSrc}
                      onChange={(url) => handleUpdateItem(item.id, { imageSrc: url })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageBuilderAccordion>

      {/* Grid Settings & Appearance */}
      <PageBuilderAccordion title="הגדרות פריסה ומראה" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs font-semibold text-slate-300">מספר עמודות במחשב</label>
            <select
              value={config.columns || 3}
              onChange={(e) => update('columns', parseInt(e.target.value) as any)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value={1}>עמודה אחת (1)</option>
              <option value={2}>שתי עמודות (2)</option>
              <option value={3}>שלוש עמודות (3)</option>
              <option value={4}>ארבע עמודות (4)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs font-semibold text-slate-300">אפקט הובר (Hover)</label>
            <select
              value={config.effect || 'hover-scale'}
              onChange={(e) => update('effect', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="hover-scale">הגבהה עדינה (Scale)</option>
              <option value="hover-glow">הארה זוהרת (Glow)</option>
              <option value="none">ללא אפקט</option>
            </select>
          </div>
        </div>

        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן (Anchor ID)"
          value={config.anchorId || 'services'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="services"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
