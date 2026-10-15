import React, { useState } from 'react';
import {
  FutureContentSectionConfig,
  FutureContentItem,
  FutureContentMode,
  FutureContentEffect,
} from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import {
  Sparkles,
  LayoutGrid,
  Layers,
  Compass,
  Type,
  ListPlus,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Volume2,
  TrendingUp,
  Sliders,
} from 'lucide-react';

interface FutureContentEditorProps {
  config: FutureContentSectionConfig;
  onChange: (updated: FutureContentSectionConfig) => void;
}

export const FutureContentEditor: React.FC<FutureContentEditorProps> = ({ config, onChange }) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const update = <K extends keyof FutureContentSectionConfig>(field: K, value: FutureContentSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const updateItem = (index: number, updatedItem: Partial<FutureContentItem>) => {
    const newItems = [...(config.items || [])];
    newItems[index] = { ...newItems[index], ...updatedItem };
    update('items', newItems);
  };

  const addItem = () => {
    const newItem: FutureContentItem = {
      id: `item-${Date.now()}`,
      title: 'כותרת תוכן חדשה לשנת 2027',
      subtitle: 'פירוט קצר על התוכן, החדשנות והערך המרכזי...',
      description: 'תיאור מלא ועשיר הנפתח בעת לחיצה על כרטיס המידע...',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      category: 'חדשנות',
      tag: '• פריצת דרך •',
      badge: 'PRO',
      readTime: '3 דק׳ קריאה',
      audioDuration: '01:45',
      metrics: [{ label: 'יעילות', value: '+85%', trend: 'צמיחה' }],
      ctaText: 'קרא עוד',
      ctaUrl: '#',
    };
    const newItems = [...(config.items || []), newItem];
    update('items', newItems);
    setExpandedItemId(newItem.id);
  };

  const deleteItem = (index: number) => {
    const newItems = (config.items || []).filter((_, i) => i !== index);
    update('items', newItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const items = [...(config.items || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;
    update('items', items);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* 1. Mode & Switching Capabilities */}
      <PageBuilderAccordion title="סגנון תצוגה עתידני 2027 (Multi-Mode)" icon={<Sparkles className="w-4 h-4 text-cyan-400" />} defaultOpen={true}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">פריסת ברירת מחדל לאזור</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => update('activeMode', 'prism-bento')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                config.activeMode === 'prism-bento'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-md'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <span>בנטו מרחבי</span>
            </button>

            <button
              type="button"
              onClick={() => update('activeMode', 'kinetic-editorial')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                config.activeMode === 'kinetic-editorial'
                  ? 'border-pink-500 bg-pink-500/10 text-white shadow-md'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-pink-400" />
              <span>מגזין קינטי</span>
            </button>

            <button
              type="button"
              onClick={() => update('activeMode', 'floating-islands')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                config.activeMode === 'floating-islands'
                  ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>איים צפים</span>
            </button>
          </div>
        </div>

        {/* Live Visitor Switcher Pill Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mt-3">
          <div>
            <div className="text-xs font-bold text-white">אפשר למבקרים להחליף תצוגה בלייב</div>
            <div className="text-[11px] text-slate-400">הצגת קפסולת מעבר אינטראקטיבית בראש האזור</div>
          </div>
          <input
            type="checkbox"
            checked={config.allowVisitorSwitching ?? true}
            onChange={(e) => update('allowVisitorSwitching', e.target.checked)}
            className="w-4 h-4 rounded text-cyan-600 bg-slate-950 border-slate-700 cursor-pointer"
          />
        </div>

        {/* Effect Style Selector */}
        <div className="flex flex-col gap-1.5 mt-3">
          <label className="text-xs font-semibold text-slate-300">אפקט ויזואלי מוביל (2027 Styling)</label>
          <select
            value={config.effectStyle || 'prism-beam'}
            onChange={(e) => update('effectStyle', e.target.value as FutureContentEffect)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
          >
            <option value="prism-beam">קרן אור פריזמטית (Prism Border Beam)</option>
            <option value="fluid-glass">זכוכית נוזלית עמוקה (Liquid Glass Depth)</option>
            <option value="cyber-aura">הילה קיברנטית זוהרת (Cyber Aura)</option>
            <option value="minimal-refract">רפרקציה מינימליסטית (Refraction)</option>
          </select>
        </div>

        {/* Ambient Mesh Glow Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mt-3">
          <label className="text-xs font-semibold text-slate-300">תאורת רקע מרחבית (Ray-Tracing Mesh Glow)</label>
          <input
            type="checkbox"
            checked={config.ambientMeshGlow ?? true}
            onChange={(e) => update('ambientMeshGlow', e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
          />
        </div>

        {config.ambientMeshGlow && (
          <div className="mt-3">
            <PageBuilderColorPicker
              label="גוון ההילה המרחבית"
              value={config.ambientGlowColor || '#6366f1'}
              onChange={(color) => update('ambientGlowColor', color)}
            />
          </div>
        )}
      </PageBuilderAccordion>

      {/* 2. Titles & Brand Header */}
      <PageBuilderAccordion title="כותרות ותוכן ראשי" icon={<Type className="w-4 h-4 text-indigo-400" />}>
        <PageBuilderInput
          label="תגית עליונה (באדג' פרימיום)"
          value={config.badge || ''}
          onChange={(e) => update('badge', e.target.value)}
          placeholder="חוויית תוכן 2027"
        />

        <div className="mt-3">
          <PageBuilderInput
            label="כותרת ראשית של האזור"
            value={config.title || ''}
            onChange={(e) => update('title', e.target.value)}
            placeholder="כותרת עוצמתית..."
          />
        </div>

        <div className="mt-3">
          <PageBuilderInput
            label="תת-כותרת / פסקת מבוא"
            value={config.subtitle || ''}
            onChange={(e) => update('subtitle', e.target.value)}
            placeholder="הסבר קצר על נושאי התוכן..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <PageBuilderColorPicker
            label="צבע כותרת"
            value={config.titleColor || '#ffffff'}
            onChange={(color) => update('titleColor', color)}
          />
          <PageBuilderColorPicker
            label="צבע רקע כללי"
            value={config.backgroundColor || 'transparent'}
            onChange={(color) => update('backgroundColor', color)}
          />
        </div>
      </PageBuilderAccordion>

      {/* 3. Items Manager */}
      <PageBuilderAccordion
        title={`ניהול פריטי תוכן (${(config.items || []).length})`}
        icon={<ListPlus className="w-4 h-4 text-emerald-400" />}
        defaultOpen={true}
      >
        <div className="space-y-3">
          {(config.items || []).map((item, index) => {
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id || index}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 space-y-3 transition"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1"
                  >
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-bold text-xs text-white line-clamp-1">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="העלה מעלה"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === (config.items || []).length - 1}
                      onClick={() => moveItem(index, 'down')}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="הורד מטה"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(index)}
                      className="p-1 text-red-400 hover:text-red-300 transition cursor-pointer"
                      title="מחק פריט"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Fields */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fadeIn">
                    <PageBuilderInput
                      label="כותרת הפריט"
                      value={item.title || ''}
                      onChange={(e) => updateItem(index, { title: e.target.value })}
                    />

                    <PageBuilderInput
                      label="תת-כותרת / תקציר"
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(index, { subtitle: e.target.value })}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">תוכן מורחב (במודאל חשיפה)</label>
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none"
                        placeholder="תיאור מלא..."
                      />
                    </div>

                    <PageBuilderImageUpload
                      label="תמונת פריט"
                      value={item.imageUrl || ''}
                      onChange={(url) => updateItem(index, { imageUrl: url })}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <PageBuilderInput
                        label="קטגוריה"
                        value={item.category || ''}
                        onChange={(e) => updateItem(index, { category: e.target.value })}
                      />
                      <PageBuilderInput
                        label="תגית עליונה"
                        value={item.tag || ''}
                        onChange={(e) => updateItem(index, { tag: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <PageBuilderInput
                        label="זמן קריאה (Read Time)"
                        value={item.readTime || ''}
                        onChange={(e) => updateItem(index, { readTime: e.target.value })}
                        placeholder="3 דק׳ קריאה"
                      />
                      <PageBuilderInput
                        label="משך תקציר קולי (Audio AI)"
                        value={item.audioDuration || ''}
                        onChange={(e) => updateItem(index, { audioDuration: e.target.value })}
                        placeholder="01:45"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <PageBuilderInput
                        label="טקסט כפתור פעולה"
                        value={item.ctaText || ''}
                        onChange={(e) => updateItem(index, { ctaText: e.target.value })}
                      />
                      <PageBuilderInput
                        label="קישור כפתור (URL)"
                        value={item.ctaUrl || ''}
                        onChange={(e) => updateItem(index, { ctaUrl: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItem}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף פריט תוכן 2027</span>
          </button>
        </div>
      </PageBuilderAccordion>

      {/* 4. Global Action Buttons */}
      <PageBuilderAccordion title="כפתורי הנעה לפעולה בתחתית האזור" icon={<Sliders className="w-4 h-4 text-purple-400" />}>
        <div className="grid grid-cols-2 gap-2">
          <PageBuilderInput
            label="טקסט כפתור ראשי"
            value={config.primaryButton?.text || ''}
            onChange={(e) =>
              update('primaryButton', {
                text: e.target.value,
                url: config.primaryButton?.url || '#',
              })
            }
          />
          <PageBuilderInput
            label="קישור כפתור ראשי"
            value={config.primaryButton?.url || ''}
            onChange={(e) =>
              update('primaryButton', {
                text: config.primaryButton?.text || 'למידע נוסף',
                url: e.target.value,
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <PageBuilderInput
            label="טקסט כפתור משני"
            value={config.secondaryButton?.text || ''}
            onChange={(e) =>
              update('secondaryButton', {
                text: e.target.value,
                url: config.secondaryButton?.url || '#',
              })
            }
          />
          <PageBuilderInput
            label="קישור כפתור משני"
            value={config.secondaryButton?.url || ''}
            onChange={(e) =>
              update('secondaryButton', {
                text: config.secondaryButton?.text || 'צפייה בקולקציה',
                url: e.target.value,
              })
            }
          />
        </div>
      </PageBuilderAccordion>
    </div>
  );
};
