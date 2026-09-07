import React, { useState } from 'react';
import { ImageListingSectionConfig, ImageListingItem } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderButton } from '../../ui/PageBuilderButton';
import { Plus, Trash2, Edit2, Image as ImageIcon, Sliders } from 'lucide-react';

interface ImageListingEditorProps {
  config: ImageListingSectionConfig;
  onChange: (updated: ImageListingSectionConfig) => void;
}

export const ImageListingEditor: React.FC<ImageListingEditorProps> = ({ config, onChange }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const update = <K extends keyof ImageListingSectionConfig>(field: K, value: ImageListingSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handleAddImage = () => {
    const newItem: ImageListingItem = {
      id: Date.now().toString(),
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
      title: 'תמונה חדשה',
      subtitle: 'תיאור קצר',
    };
    const updated = [...(config.images || []), newItem];
    update('images', updated);
    setEditingItemId(newItem.id);
  };

  const handleUpdateImage = (id: string, updates: Partial<ImageListingItem>) => {
    const updated = (config.images || []).map((img) => (img.id === id ? { ...img, ...updates } : img));
    update('images', updated);
  };

  const handleDeleteImage = (id: string) => {
    if (confirm('האם למחוק תמונה זו מהגלריה?')) {
      update('images', (config.images || []).filter((img) => img.id !== id));
      if (editingItemId === id) setEditingItemId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="כותרת גלריית תמונות" icon={<ImageIcon className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת הגלריה"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: תמונות מהשטח ומאירועי הקהילה"
        />
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold text-slate-300">מספר תמונות בשורה</label>
          <select
            value={config.imagesPerRow || 3}
            onChange={(e) => update('imagesPerRow', parseInt(e.target.value) as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value={2}>2 תמונות</option>
            <option value={3}>3 תמונות</option>
            <option value={4}>4 תמונות</option>
            <option value={6}>6 תמונות</option>
          </select>
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion
        title={`ניהול תמונות בגלריה (${(config.images || []).length})`}
        icon={<Plus className="w-4 h-4 text-emerald-400" />}
        defaultOpen={true}
        actionNode={
          <PageBuilderButton size="xs" variant="primary" onClick={handleAddImage} icon={<Plus className="w-3.5 h-3.5" />}>
            הוסף תמונה
          </PageBuilderButton>
        }
      >
        <div className="flex flex-col gap-3">
          {(config.images || []).map((img, idx) => {
            const isEditing = editingItemId === img.id;
            return (
              <div key={img.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <img src={img.imageUrl} alt="thumb" className="w-9 h-9 rounded-lg object-cover border border-slate-800" />
                    <span className="text-sm font-bold text-white">{img.title || 'ללא כותרת'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingItemId(isEditing ? null : img.id)}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex flex-col gap-3 animate-in fade-in">
                    <PageBuilderImageUpload
                      label="קישור תמונה"
                      value={img.imageUrl}
                      onChange={(url) => handleUpdateImage(img.id, { imageUrl: url })}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PageBuilderInput
                        label="כותרת לתמונה"
                        value={img.title || ''}
                        onChange={(e) => handleUpdateImage(img.id, { title: e.target.value })}
                      />
                      <PageBuilderInput
                        label="תת-כותרת / תאריך"
                        value={img.subtitle || ''}
                        onChange={(e) => handleUpdateImage(img.id, { subtitle: e.target.value })}
                      />
                    </div>
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
          value={config.anchorId || 'imageListing'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="imageListing"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
