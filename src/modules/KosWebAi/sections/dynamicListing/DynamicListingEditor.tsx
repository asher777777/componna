import React, { useState } from 'react';
import {
  DynamicListingSectionConfig,
  DynamicListingItem,
  DynamicListingLayout,
  DynamicListingSource,
} from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import {
  LayoutGrid,
  Database,
  Type,
  ListPlus,
  Sliders,
  Trash2,
  Plus,
  Sparkles,
  Link as LinkIcon,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DynamicListingEditorProps {
  config: DynamicListingSectionConfig;
  onChange: (updated: DynamicListingSectionConfig) => void;
}

export const DynamicListingEditor: React.FC<DynamicListingEditorProps> = ({ config, onChange }) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const update = <K extends keyof DynamicListingSectionConfig>(field: K, value: DynamicListingSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const updateItem = (index: number, updatedItem: Partial<DynamicListingItem>) => {
    const newItems = [...(config.items || [])];
    newItems[index] = { ...newItems[index], ...updatedItem };
    update('items', newItems);
  };

  const addItem = () => {
    const newItem: DynamicListingItem = {
      id: `item-${Date.now()}`,
      title: 'פריט תוכן חדש',
      subtitle: 'פירוט קצר על הפריט...',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
      category: 'כללי',
      date: new Date().toLocaleDateString('he-IL'),
      linkUrl: '#',
      actionType: 'modal',
    };
    const newItems = [...(config.items || []), newItem];
    update('items', newItems);
    setExpandedItemId(newItem.id);
  };

  const removeItem = (index: number) => {
    const newItems = (config.items || []).filter((_, idx) => idx !== index);
    update('items', newItems);
  };

  const items = config.items || [];

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      {/* 1. Layout & Presentation Style */}
      <PageBuilderAccordion title="פריסת תצוגה ואפקטים" icon={<LayoutGrid className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">בחר סגנון פריסה (5 פריסות פרימיום)</label>
          <select
            value={config.layout || 'bento-showcase'}
            onChange={(e) => update('layout', e.target.value as DynamicListingLayout)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="bento-showcase">1. Bento Showcase (כרטיס מוביל Spotlight + כרטיסי משנה)</option>
            <option value="floating-grid">2. גריד זכוכית מרחף (Floating Glass Grid עם 3D Tilt)</option>
            <option value="snap-carousel">3. קרוסלה אופקית חלקה (Infinite Snap Carousel)</option>
            <option value="editorial-list">4. רשימת מגזין יוקרתית (Editorial List עם תמונה צפה)</option>
            <option value="masonry">5. גריד א-סימטרי פינטרסט (Asymmetric Masonry)</option>
          </select>
        </div>

        {config.layout === 'floating-grid' && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">מספר עמודות בדסקטופ</label>
              <select
                value={config.gridColumns || 3}
                onChange={(e) => update('gridColumns', parseInt(e.target.value) as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value={2}>2 עמודות (רחב)</option>
                <option value={3}>3 עמודות (סטנדרט)</option>
                <option value={4}>4 עמודות (קומפקטי)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">יחס גובה-רוחב לתמונה</label>
              <select
                value={config.aspectRatio || '16:9'}
                onChange={(e) => update('aspectRatio', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="16:9">16:9 (וידאו רחב)</option>
                <option value="4:3">4:3 (קלאסי)</option>
                <option value="1:1">1:1 (מרובע)</option>
                <option value="9:16">9:16 (אנכי טיקטוק / סטורי)</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5 mt-3">
          <label className="text-xs font-semibold text-slate-300">אפקט ויזואלי</label>
          <select
            value={config.effectStyle || 'border-beam'}
            onChange={(e) => update('effectStyle', e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
          >
            <option value="border-beam">Border Beam (הילת מסגרת נעה על כרטיס מוביל)</option>
            <option value="glow-hover">Glow Hover (זוהר עדין בריחוף)</option>
            <option value="tilt-3d">Tilt 3D (הטיה תלת-ממדית עם תנועת העכבר)</option>
            <option value="subtle">עדין ונקי (Subtle Minimal)</option>
          </select>
        </div>
      </PageBuilderAccordion>

      {/* 2. Content Source & Collections */}
      <PageBuilderAccordion title="מקור התוכן והקולקציות" icon={<Database className="w-4 h-4 text-emerald-400" />}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">סוג מקור התוכן</label>
          <select
            value={config.source || 'custom'}
            onChange={(e) => update('source', e.target.value as DynamicListingSource)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="custom">הזנה ידנית מותאמת אישית (Custom Items)</option>
            <option value="pages">עמודי תוכן ומאמרים (PAGES)</option>
            <option value="kos_tube">סרטוני וידאו (KOS_TUBE)</option>
            <option value="campaigns">פרויקטים וקמפיינים (CAMPAIGNS)</option>
            <option value="media">גלריית מדיה ותיק עבודות (MEDIA_ITEMS)</option>
          </select>
        </div>

        {config.source !== 'custom' && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 mt-2 space-y-1">
            <strong>משיכה אוטומטית פעילה:</strong>
            <p className="text-slate-300">הפריטים נשאבים ישירות מקולקציית המערכת. במצב עורך מוצגים פריטי תצוגה מקדימה עשירים.</p>
          </div>
        )}
      </PageBuilderAccordion>

      {/* 3. Headers, Search & Filters */}
      <PageBuilderAccordion title="כותרות, סינון וחיפוש" icon={<Type className="w-4 h-4 text-amber-400" />}>
        <PageBuilderInput
          label="תגית עליונה (Badge)"
          value={config.badge || ''}
          onChange={(e) => update('badge', e.target.value)}
          placeholder="למשל: עדכונים ואירועים"
        />

        <div className="mt-3">
          <PageBuilderInput
            label="כותרת ראשית"
            value={config.title || ''}
            onChange={(e) => update('title', e.target.value)}
            placeholder="כותרת האזור"
          />
        </div>

        <div className="mt-3">
          <PageBuilderInput
            label="תת-כותרת"
            value={config.subtitle || ''}
            onChange={(e) => update('subtitle', e.target.value)}
            placeholder="פירוט והסבר קצר..."
          />
        </div>

        <div className="mt-3">
          <PageBuilderColorPicker
            label="צבע כותרת"
            value={config.titleColor || '#ffffff'}
            onChange={(color) => update('titleColor', color)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showCategoryFilter ?? true}
              onChange={(e) => update('showCategoryFilter', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700"
            />
            <span>טאבים לסינון קטגוריות</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showSearchBar ?? true}
              onChange={(e) => update('showSearchBar', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700"
            />
            <span>שורת חיפוש לייב</span>
          </label>
        </div>
      </PageBuilderAccordion>

      {/* 4. Items Management */}
      <PageBuilderAccordion
        title={`ניהול פריטי התוכן (${items.length})`}
        icon={<ListPlus className="w-4 h-4 text-sky-400" />}
        defaultOpen={true}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400">רשימת הפריטים המוצגים:</span>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף פריט חדש</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden"
              >
                {/* Item Summary Bar */}
                <div
                  onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition select-none"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                      <span className="text-[10px] text-slate-400">{item.category || 'כללי'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(index);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                      title="מחק פריט"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Item Editor Form */}
                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-slate-800 space-y-3 bg-slate-950/40">
                    <PageBuilderInput
                      label="כותרת הפריט"
                      value={item.title}
                      onChange={(e) => updateItem(index, { title: e.target.value })}
                      placeholder="כותרת"
                    />

                    <PageBuilderInput
                      label="תת-כותרת / תיאור קצר"
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(index, { subtitle: e.target.value })}
                      placeholder="תקציר קצר..."
                    />

                    <PageBuilderImageUpload
                      label="תמונת הפריט (מתוך הגלריה או קישור)"
                      value={item.imageUrl}
                      onChange={(url) => updateItem(index, { imageUrl: url })}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <PageBuilderInput
                        label="קטגוריה (לסינון בטאבים)"
                        value={item.category || ''}
                        onChange={(e) => updateItem(index, { category: e.target.value })}
                        placeholder="אירועים / חדשות"
                      />

                      <PageBuilderInput
                        label="תאריך"
                        value={item.date || ''}
                        onChange={(e) => updateItem(index, { date: e.target.value })}
                        placeholder="תאריך"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <PageBuilderInput
                        label="תגית מיוחדת (Badge)"
                        value={item.badge || ''}
                        onChange={(e) => updateItem(index, { badge: e.target.value })}
                        placeholder="נבחר / מומלץ"
                      />

                      <PageBuilderInput
                        label="מחיר או יעד (אופציונלי)"
                        value={item.price || ''}
                        onChange={(e) => updateItem(index, { price: e.target.value })}
                        placeholder="₪150 או יעד קמפיין"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">פעולת לחיצה על הפריט</label>
                      <select
                        value={item.actionType || 'modal'}
                        onChange={(e) => updateItem(index, { actionType: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        <option value="modal">פתיחת מודאל מידע מורחב (מומלץ)</option>
                        <option value="link">מעבר לקישור חיצוני / עמוד</option>
                      </select>
                    </div>

                    {item.actionType === 'link' && (
                      <PageBuilderInput
                        label="כתובת קישור (URL)"
                        value={item.linkUrl || ''}
                        onChange={(e) => updateItem(index, { linkUrl: e.target.value })}
                        placeholder="https://example.com"
                        dir="ltr"
                      />
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">תוכן מורחב למודאל</label>
                      <textarea
                        value={item.excerpt || ''}
                        onChange={(e) => updateItem(index, { excerpt: e.target.value })}
                        rows={3}
                        placeholder="הסבר מעמיק שנפתח במודאל בלחיצה על הכרטיס..."
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageBuilderAccordion>

      {/* 5. Design & Global Button */}
      <PageBuilderAccordion title="עיצוב, רקע וכפתור תחתון" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderInput
          label="טקסט כפתור תחתון (אופציונלי)"
          value={config.primaryButton?.text || ''}
          onChange={(e) =>
            update('primaryButton', {
              url: config.primaryButton?.url || '#',
              text: e.target.value,
            })
          }
          placeholder="למשל: צפה בכל המאגר"
        />

        {config.primaryButton?.text && (
          <div className="mt-3">
            <PageBuilderInput
              label="קישור כפתור תחתון"
              value={config.primaryButton?.url || ''}
              onChange={(e) =>
                update('primaryButton', {
                  text: config.primaryButton?.text || '',
                  url: e.target.value,
                })
              }
              placeholder="#all-items"
              dir="ltr"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <PageBuilderColorPicker
            label="צבע רקע האזור"
            value={config.backgroundColor || 'transparent'}
            onChange={(color) => update('backgroundColor', color)}
          />

          <PageBuilderColorPicker
            label="צבע רקע כרטיסים"
            value={config.cardBgColor || 'transparent'}
            onChange={(color) => update('cardBgColor', color)}
          />
        </div>

        <div className="mt-3">
          <PageBuilderInput
            label="עוגן ניווט (Anchor ID)"
            value={config.anchorId || ''}
            onChange={(e) => update('anchorId', e.target.value)}
            placeholder="dynamic-listing"
            dir="ltr"
          />
        </div>
      </PageBuilderAccordion>
    </div>
  );
};
