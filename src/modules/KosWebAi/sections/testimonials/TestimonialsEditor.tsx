import React from 'react';
import { TestimonialsSectionConfig, TestimonialItem } from '../../types/sectionConfigs';
import { PageBuilderInput, resolveInputValue } from '../../ui/PageBuilderInput';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { Plus, Trash2, Star, CheckCircle2 } from 'lucide-react';

export const TestimonialsEditor: React.FC<{
  config: TestimonialsSectionConfig;
  onChange: (updated: TestimonialsSectionConfig) => void;
}> = ({ config, onChange }) => {
  const handleItemChange = (index: number, field: keyof TestimonialItem, rawValue: any) => {
    const value = typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean'
      ? rawValue
      : resolveInputValue(rawValue);
    const updatedItems = [...(config.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onChange({ ...config, items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem: TestimonialItem = {
      id: `test_${Date.now()}`,
      name: 'לקוח חדש',
      role: 'בעל עסק',
      company: 'חברה מובילה',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      content: 'שירות יוצא מן הכלל, פתרונות ברמה הגבוהה ביותר ותוצאות מהירות!',
      rating: 5,
      isVerified: true,
      badge: 'מאומת',
    };
    onChange({ ...config, items: [...(config.items || []), newItem] });
  };

  const handleDeleteItem = (index: number) => {
    const updated = (config.items || []).filter((_, i) => i !== index);
    onChange({ ...config, items: updated });
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PageBuilderInput
          label="כותרת ראשית"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: resolveInputValue(e) })}
        />
        <PageBuilderInput
          label="תת-כותרת / תגית"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: resolveInputValue(e) })}
        />
      </div>

      <PageBuilderInput
        label="תיאור קצר (אופציונלי)"
        value={config.description || ''}
        onChange={(e) => onChange({ ...config, description: resolveInputValue(e) })}
      />

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-4">
        <h4 className="text-xs font-bold text-slate-300">הגדרות סיכום דירוגים (Rating Summary)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showRatingSummary !== false}
              onChange={(e) => onChange({ ...config, showRatingSummary: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>הצג שורת סיכום דירוג</span>
          </label>
          <PageBuilderInput
            label="ציון כולל"
            type="number"
            value={String(config.overallRating || 4.9)}
            onChange={(e) => onChange({ ...config, overallRating: parseFloat(resolveInputValue(e)) || 5 })}
          />
          <PageBuilderInput
            label="טקסט כמות ביקורות"
            value={config.totalReviewsCount || ''}
            onChange={(e) => onChange({ ...config, totalReviewsCount: resolveInputValue(e) })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h4 className="text-sm font-bold text-white">רשימת המלצות וביקורות ({config.items?.length || 0})</h4>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף המלצה</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {config.items?.map((item, idx) => (
          <div key={item.id || idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">ביקורת #{idx + 1}</span>
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
                label="שם הממליץ"
                value={item.name || ''}
                onChange={(e) => handleItemChange(idx, 'name', resolveInputValue(e))}
              />
              <PageBuilderInput
                label="תפקיד"
                value={item.role || ''}
                onChange={(e) => handleItemChange(idx, 'role', resolveInputValue(e))}
              />
              <PageBuilderInput
                label="חברה / ארגון"
                value={item.company || ''}
                onChange={(e) => handleItemChange(idx, 'company', resolveInputValue(e))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PageBuilderInput
                label="דירוג (1-5)"
                type="number"
                value={String(item.rating || 5)}
                onChange={(e) => handleItemChange(idx, 'rating', parseInt(resolveInputValue(e)) || 5)}
              />
              <PageBuilderInput
                label="תגית / Badge"
                value={item.badge || ''}
                onChange={(e) => handleItemChange(idx, 'badge', resolveInputValue(e))}
              />
            </div>

            <PageBuilderImageUpload
              label="תמונת פרופיל של הממליץ"
              value={item.avatarUrl}
              onChange={(url) => handleItemChange(idx, 'avatarUrl', url)}
            />

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">תוכן ההמלצה</label>
              <textarea
                rows={3}
                value={item.content || ''}
                onChange={(e) => handleItemChange(idx, 'content', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
