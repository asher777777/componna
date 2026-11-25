import React, { useState, useEffect } from 'react';
import {
  FlipCardsListingSectionConfig,
  FlipCardItem,
  FlipCardsSourceMode,
  FlipCardsLogicCondition,
  FlipCardsSectionVisibilityRule,
  FlipCardsSortBy,
  FlipCardsFlipDirection,
} from '../../types/sectionConfigs';
import {
  PAGE_CATEGORIES,
  PageBuilderConfig,
  getCategoryFromPage,
} from '../../types/pageBuilder.types';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { PageBuilderInput, resolveInputValue } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderIconPicker } from '../../ui/PageBuilderIconPicker';
import { SectionStylePresetSelector } from '../../ui/SectionStylePresetSelector';
import {
  DEFAULT_FLIP_PALETTE,
} from './FlipCardsListingSection';
import {
  ChevronDown,
  ChevronUp,
  Database,
  Filter,
  Type,
  Palette,
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  Check,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { clsx } from 'clsx';

interface FlipCardsListingEditorProps {
  config: FlipCardsListingSectionConfig;
  onChange: (updated: FlipCardsListingSectionConfig) => void;
  onClose?: () => void;
}

type AccordionKey = 'source' | 'logic' | 'content' | 'design' | 'items';

export const FlipCardsListingEditor: React.FC<FlipCardsListingEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const [formData, setFormData] = useState<FlipCardsListingSectionConfig>({ ...config });
  const [openSection, setOpenSection] = useState<AccordionKey>('source');
  const [tenantPages, setTenantPages] = useState<PageBuilderConfig[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null);
  const [expandedCustomId, setExpandedCustomId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadPages() {
      setLoadingPages(true);
      try {
        const effTenant =
          typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
        const pages = await pageBuilderFirestore.getAllPages(undefined, effTenant);
        if (mounted && Array.isArray(pages)) {
          setTenantPages(
            pages.filter(
              (p) => p && p.pageTitle && !p.isHomePage && p.slug !== 'home' && !p.isArchivePage
            )
          );
        }
      } catch (err) {
        console.error('[FlipCardsListingEditor] Failed to load tenant pages:', err);
      } finally {
        if (mounted) setLoadingPages(false);
      }
    }
    loadPages();
    return () => {
      mounted = false;
    };
  }, []);

  const updateConfig = (patch: Partial<FlipCardsListingSectionConfig>) => {
    const next = { ...formData, ...patch };
    setFormData(next);
    onChange(next);
  };

  const toggleAccordion = (key: AccordionKey) => {
    setOpenSection((prev) => (prev === key ? key : key));
  };

  const selectedCats = formData.selectedPageCategories || [];
  const toggleCategorySelection = (catKey: string) => {
    if (catKey === 'all') {
      updateConfig({ selectedPageCategories: [] });
      return;
    }
    const exists = selectedCats.includes(catKey);
    const next = exists
      ? selectedCats.filter((c) => c !== catKey)
      : [...selectedCats.filter((c) => c !== 'all'), catKey];
    updateConfig({ selectedPageCategories: next });
  };

  const hiddenIds = formData.hiddenItemIds || [];
  const toggleHiddenId = (id: string) => {
    const exists = hiddenIds.includes(id);
    const next = exists ? hiddenIds.filter((x) => x !== id) : [...hiddenIds, id];
    updateConfig({ hiddenItemIds: next });
  };

  const updateItemOverride = (itemId: string, field: string, value: string) => {
    const currentOverrides = formData.itemOverrides || {};
    const existing = currentOverrides[itemId] || {};
    updateConfig({
      itemOverrides: {
        ...currentOverrides,
        [itemId]: {
          ...existing,
          [field]: value,
        },
      },
    });
  };

  const clearItemOverride = (itemId: string) => {
    const currentOverrides = { ...(formData.itemOverrides || {}) };
    delete currentOverrides[itemId];
    updateConfig({ itemOverrides: currentOverrides });
  };

  const customItems = formData.items || [];
  const handleAddCustomItem = () => {
    const newId = `custom_flip_${Date.now()}`;
    const nextColor =
      DEFAULT_FLIP_PALETTE[customItems.length % DEFAULT_FLIP_PALETTE.length];
    const newItem: FlipCardItem = {
      id: newId,
      title: 'כרטיסייה חדשה',
      subtitle: 'תיאור קצר המופיע במצב רגיל',
      hoverTitle: 'גלו עוד פרטים כאן',
      ctaText: formData.defaultCtaText || 'לחצו כאן >>',
      iconName: 'Sparkles',
      accentColor: nextColor,
      linkUrl: '#',
      published: true,
    };
    updateConfig({ items: [...customItems, newItem] });
    setExpandedCustomId(newId);
  };

  const handleUpdateCustomItem = (id: string, patch: Partial<FlipCardItem>) => {
    updateConfig({
      items: customItems.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  };

  const handleDeleteCustomItem = (id: string) => {
    updateConfig({
      items: customItems.filter((it) => it.id !== id),
    });
  };

  // Build preview list of dynamic entities for override/hiding controls
  const dynamicEntitiesPreview = [
    ...Object.values(PAGE_CATEGORIES)
      .filter((c) => c.key !== 'home')
      .map((c) => ({
        id: `cat_${c.key}`,
        label: `קטגוריה: ${c.label}`,
        sub: c.slugPrefix,
      })),
    ...tenantPages.map((p) => ({
      id: `page_${p.pageId}`,
      label: `עמוד: ${p.pageTitle}`,
      sub: PAGE_CATEGORIES[getCategoryFromPage(p) || 'general']?.shortLabel || 'עמוד',
    })),
  ];

  const AccordionHeader = ({
    id,
    title,
    icon: Icon,
    badgeText,
  }: {
    id: AccordionKey;
    title: string;
    icon: React.FC<{ className?: string }>;
    badgeText?: string;
  }) => {
    const isOpen = openSection === id;
    return (
      <button
        type="button"
        onClick={() => toggleAccordion(id)}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3.5 text-right rounded-xl transition-all cursor-pointer border',
          isOpen
            ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
            : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm">{title}</span>
          {badgeText && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {badgeText}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
    );
  };

  return (
    <div dir="rtl" className="flex flex-col gap-3 text-right text-slate-200">
      {/* 1. SOURCE & KOSWEBAI CATEGORIES */}
      <AccordionHeader
        id="source"
        title="מקור נתונים וקטגוריות KOSWEBAI"
        icon={Database}
        badgeText={
          formData.sourceMode === 'custom'
            ? 'ידני'
            : formData.sourceMode === 'categories'
            ? 'קטגוריות'
            : formData.sourceMode === 'all-pages'
            ? 'עמודי טננט'
            : 'משולב'
        }
      />
      {openSection === 'source' && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">
              מצב טעינת כרטיסיות
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'pages-and-categories', label: 'עמודים + קטגוריות' },
                  { id: 'all-pages', label: 'כל עמודי הטננט' },
                  { id: 'categories', label: 'קטגוריות KOSWEBAI' },
                  { id: 'custom', label: 'פריטים ידניים בלבד' },
                ] as { id: FlipCardsSourceMode; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateConfig({ sourceMode: opt.id })}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                    (formData.sourceMode || 'pages-and-categories') === opt.id
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {formData.sourceMode !== 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">
                סינון לפי קטגוריות KOSWEBAI (ריק = הצג את כולן)
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleCategorySelection('all')}
                  className={clsx(
                    'px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer',
                    selectedCats.length === 0
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  )}
                >
                  כל הקטגוריות
                </button>
                {Object.values(PAGE_CATEGORIES)
                  .filter((c) => c.key !== 'home')
                  .map((cat) => {
                    const active = selectedCats.includes(cat.key);
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => toggleCategorySelection(cat.key)}
                        className={clsx(
                          'px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-all',
                          active
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        )}
                      >
                        {cat.shortLabel}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                מיון פריטים
              </label>
              <select
                value={formData.sortBy || 'manual'}
                onChange={(e) =>
                  updateConfig({ sortBy: e.target.value as FlipCardsSortBy })
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              >
                <option value="manual">סדר ברירת מחדל</option>
                <option value="title-asc">שם (א-ת)</option>
                <option value="title-desc">שם (ת-א)</option>
                <option value="date-desc">חדשים תחילה</option>
                <option value="views-desc">פופולריות / צפיות</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                מקסימום כרטיסים
              </label>
              <input
                type="number"
                min={1}
                max={36}
                value={formData.maxItems ?? 12}
                onChange={(e) =>
                  updateConfig({ maxItems: Number(e.target.value) || 12 })
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.includeArchives !== false}
              onChange={(e) => updateConfig({ includeArchives: e.target.checked })}
              className="rounded border-slate-700 bg-slate-950"
            />
            קישור קטגוריות ישירות לעמודי הארכיון של KOSWEBAI (/kosinfo, /kosevent...)
          </label>
        </div>
      )}

      {/* 2. LOGICAL VISIBILITY CONDITIONS */}
      <AccordionHeader
        id="logic"
        title="תנאים לוגיים להצגה (אזור ופריטים)"
        icon={Filter}
        badgeText={
          formData.sectionVisibilityRule && formData.sectionVisibilityRule !== 'always'
            ? 'תנאי פעיל'
            : undefined
        }
      />
      {openSection === 'logic' && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              תנאי לוגי להצגת האזור כולו בעמוד
            </label>
            <select
              value={formData.sectionVisibilityRule || 'always'}
              onChange={(e) =>
                updateConfig({
                  sectionVisibilityRule: e.target.value as FlipCardsSectionVisibilityRule,
                })
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
            >
              <option value="always">הצג תמיד</option>
              <option value="when-has-items">הצג רק אם קיים לפחות פריט אחד להצגה</option>
              <option value="when-min-items">הצג רק אם קיים מספר מינימלי של פריטים</option>
              <option value="only-on-home">הצג רק בעמוד הבית</option>
              <option value="date-range">הצג רק בטווח תאריכים מוגדר</option>
            </select>
          </div>

          {formData.sectionVisibilityRule === 'when-min-items' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                מינימום פריטים נדרש להצגת האזור
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.minItemsToShow ?? 2}
                onChange={(e) =>
                  updateConfig({ minItemsToShow: Number(e.target.value) || 1 })
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              />
            </div>
          )}

          {formData.sectionVisibilityRule === 'date-range' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  הצג מתאריך
                </label>
                <input
                  type="date"
                  value={formData.visibleFromDate || ''}
                  onChange={(e) => updateConfig({ visibleFromDate: e.target.value })}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  הצג עד תאריך
                </label>
                <input
                  type="date"
                  value={formData.visibleUntilDate || ''}
                  onChange={(e) => updateConfig({ visibleUntilDate: e.target.value })}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              תנאי לוגי לסינון פריטים בודדים
            </label>
            <select
              value={formData.itemLogicCondition || 'none'}
              onChange={(e) =>
                updateConfig({
                  itemLogicCondition: e.target.value as FlipCardsLogicCondition,
                })
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
            >
              <option value="none">ללא סינון נוסף (הצג הכל)</option>
              <option value="published-only">הצג רק עמודים מפורסמים</option>
              <option value="has-description">הצג רק פריטים עם תיאור</option>
              <option value="has-activity">הצג רק עמודים פעילים עם צפיות או לידים</option>
              <option value="hide-empty-categories">
                הסתר קטגוריות שאין בהן עמודים פעילים
              </option>
              <option value="exclude-drafts">הסתר טיוטות</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. HEADER CONTENT & CONTROLS */}
      <AccordionHeader id="content" title="כותרות, כפתור ריחוף וחיפוש" icon={Type} />
      {openSection === 'content' && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-3">
          <PageBuilderInput
            label="באדג' עליון (אופציונלי)"
            value={resolveInputValue(formData.badge)}
            onChange={(val) => updateConfig({ badge: val })}
            placeholder="לדוגמה: גלו את המרכז שלנו"
          />
          <PageBuilderInput
            label="כותרת ראשית"
            value={resolveInputValue(formData.title)}
            onChange={(val) => updateConfig({ title: val })}
            placeholder="מה תמצאו כאן"
          />
          <PageBuilderInput
            label="תת-כותרת (אופציונלי)"
            value={resolveInputValue(formData.subtitle)}
            onChange={(val) => updateConfig({ subtitle: val })}
            placeholder="תיאור קצר מתחת לכותרת"
          />
          <PageBuilderInput
            label="טקסט כפתור ברירת מחדל בצד האחורי (Hover)"
            value={resolveInputValue(formData.defaultCtaText)}
            onChange={(val) => updateConfig({ defaultCtaText: val })}
            placeholder="לחצו כאן >>"
          />

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.showCategoryFilterBar)}
                onChange={(e) =>
                  updateConfig({ showCategoryFilterBar: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-950"
              />
              הצג סרגל סינון קטגוריות מעל הגריד
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.showSearchBar)}
                onChange={(e) => updateConfig({ showSearchBar: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950"
              />
              הצג שורת חיפוש מהיר
            </label>
          </div>
        </div>
      )}

      {/* 4. DESIGN, BRANDING & FLIP ANIMATION */}
      <AccordionHeader id="design" title="עיצוב, מיתוג, אייקונים והיפוך" icon={Palette} />
      {openSection === 'design' && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-4">
          <SectionStylePresetSelector
            value={formData.stylePreset === 'auto' ? 'standard' : (formData.stylePreset || 'standard')}
            onChange={(preset) => updateConfig({ stylePreset: preset })}
          />

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-bold text-indigo-300">
              חיבור אוטומטי לרכיב המיתוג (Brand DNA)
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useBrandColors !== false}
                onChange={(e) => updateConfig({ useBrandColors: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950"
              />
              החל צבעי מותג וטוקנים מרכיב המיתוג
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useBrandMicrocopy !== false}
                onChange={(e) => updateConfig({ useBrandMicrocopy: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950"
              />
              החל מיני-קופי וכותרות קטגוריות מרכיב המיתוג (uiVocabulary)
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useBrandIcons !== false}
                onChange={(e) => updateConfig({ useBrandIcons: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950"
              />
              שייך אייקונים מותאמי סגנון מרכיב המיתוג
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                עמודות
              </label>
              <select
                value={formData.columns || 3}
                onChange={(e) =>
                  updateConfig({ columns: Number(e.target.value) as 2 | 3 | 4 })
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-2 text-xs text-white"
              >
                <option value={2}>2 עמודות</option>
                <option value={3}>3 עמודות</option>
                <option value={4}>4 עמודות</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                גובה כרטיס
              </label>
              <select
                value={formData.cardHeight || 'standard'}
                onChange={(e) =>
                  updateConfig({
                    cardHeight: e.target.value as 'compact' | 'standard' | 'tall',
                  })
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-2 text-xs text-white"
              >
                <option value="compact">קומפקטי</option>
                <option value="standard">סטנדרטי</option>
                <option value="tall">גבוה</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                אנימציית היפוך
              </label>
              <select
                value={formData.flipDirection || 'horizontal'}
                onChange={(e) =>
                  updateConfig({
                    flipDirection: e.target.value as FlipCardsFlipDirection,
                  })
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-2 text-xs text-white"
              >
                <option value="horizontal">היפוך 3D אופקי</option>
                <option value="vertical">היפוך 3D אנכי</option>
                <option value="fade-scale">החלפה חלקה</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enableAutoColorPalette !== false}
              onChange={(e) =>
                updateConfig({ enableAutoColorPalette: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-950"
            />
            צביעה אוטומטית מגוונת לכרטיסים (פלטת צבעי מותג חמה)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <PageBuilderColorPicker
              label="צבע רקע אזור"
              value={formData.backgroundColor || 'transparent'}
              onChange={(val) => updateConfig({ backgroundColor: val })}
            />
            <PageBuilderColorPicker
              label="צבע רקע כרטיס (קדמי)"
              value={formData.cardBgColor || ''}
              onChange={(val) => updateConfig({ cardBgColor: val })}
            />
            <PageBuilderColorPicker
              label="צבע כותרת ראשית"
              value={formData.titleColor || ''}
              onChange={(val) => updateConfig({ titleColor: val })}
            />
            <PageBuilderColorPicker
              label="צבע תת-כותרת"
              value={formData.subtitleColor || ''}
              onChange={(val) => updateConfig({ subtitleColor: val })}
            />
          </div>
        </div>
      )}

      {/* 5. MANAGE DYNAMIC OVERRIDES & CUSTOM ITEMS */}
      <AccordionHeader
        id="items"
        title="ניהול כרטיסים דינמיים וידניים"
        icon={Layers}
        badgeText={`${customItems.length} ידניים`}
      />
      {openSection === 'items' && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-4">
          {/* Custom items builder */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              כרטיסים מותאמים אישית
            </span>
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              הוסף כרטיס
            </button>
          </div>

          {customItems.length > 0 && (
            <div className="flex flex-col gap-2">
              {customItems.map((item) => {
                const isExp = expandedCustomId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCustomId(isExp ? null : item.id)
                        }
                        className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.accentColor || '#528a94' }}
                        />
                        <span>{item.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomItem(item.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                        title="מחק כרטיס"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isExp && (
                      <div className="p-3 border-t border-slate-800 flex flex-col gap-2.5">
                        <PageBuilderInput
                          label="כותרת"
                          value={item.title}
                          onChange={(val) =>
                            handleUpdateCustomItem(item.id, { title: val })
                          }
                        />
                        <PageBuilderInput
                          label="תיאור קצר"
                          value={item.subtitle || ''}
                          onChange={(val) =>
                            handleUpdateCustomItem(item.id, { subtitle: val })
                          }
                        />
                        <PageBuilderInput
                          label="טקסט בריחוף (צד אחורי)"
                          value={item.hoverTitle || ''}
                          onChange={(val) =>
                            handleUpdateCustomItem(item.id, { hoverTitle: val })
                          }
                        />
                        <PageBuilderInput
                          label="טקסט כפתור"
                          value={item.ctaText || ''}
                          onChange={(val) =>
                            handleUpdateCustomItem(item.id, { ctaText: val })
                          }
                        />
                        <PageBuilderInput
                          label="קישור יעד (URL)"
                          value={item.linkUrl || ''}
                          onChange={(val) =>
                            handleUpdateCustomItem(item.id, { linkUrl: val })
                          }
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <PageBuilderIconPicker
                            label="אייקון מיתוג / Lucide"
                            value={item.iconName || 'Sparkles'}
                            onChange={(val) =>
                              handleUpdateCustomItem(item.id, { iconName: val })
                            }
                          />
                          <PageBuilderColorPicker
                            label="צבע כרטיס"
                            value={item.accentColor || '#528a94'}
                            onChange={(val) =>
                              handleUpdateCustomItem(item.id, { accentColor: val })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Tenant Pages & Categories Override / Visibility */}
          {formData.sourceMode !== 'custom' && (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  שליטה בכרטיסים דינמיים (עמודי טננט וקטגוריות)
                </span>
                {loadingPages && (
                  <span className="text-[11px] text-slate-400">טוען...</span>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5 pr-1">
                {dynamicEntitiesPreview.map((ent) => {
                  const isHidden = hiddenIds.includes(ent.id);
                  const ov = formData.itemOverrides?.[ent.id] || {};
                  const isEditingThis = editingOverrideId === ent.id;
                  const hasOverride = Object.keys(ov).length > 0;

                  return (
                    <div
                      key={ent.id}
                      className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div
                            className={clsx(
                              'text-xs font-bold truncate',
                              isHidden ? 'text-slate-500 line-through' : 'text-slate-200'
                            )}
                          >
                            {ov.title || ent.label}
                          </div>
                          <div className="text-[10px] text-slate-500">{ent.sub}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingOverrideId(isEditingThis ? null : ent.id)
                            }
                            className={clsx(
                              'p-1.5 rounded-md cursor-pointer transition-colors',
                              hasOverride || isEditingThis
                                ? 'bg-indigo-600/20 text-indigo-400'
                                : 'text-slate-400 hover:text-white'
                            )}
                            title="התאמה אישית של טקסט/צבע/אייקון"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleHiddenId(ent.id)}
                            className={clsx(
                              'p-1.5 rounded-md cursor-pointer transition-colors',
                              isHidden
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'text-slate-400 hover:text-white'
                            )}
                            title={isHidden ? 'הצג פריט' : 'הסתר פריט'}
                          >
                            {isHidden ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isEditingThis && (
                        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                          <PageBuilderInput
                            label="דריסת כותרת"
                            value={ov.title || ''}
                            onChange={(val) =>
                              updateItemOverride(ent.id, 'title', val)
                            }
                            placeholder="השאר ריק לברירת מחדל"
                          />
                          <PageBuilderInput
                            label="דריסת תיאור קצר"
                            value={ov.subtitle || ''}
                            onChange={(val) =>
                              updateItemOverride(ent.id, 'subtitle', val)
                            }
                          />
                          <PageBuilderInput
                            label="טקסט ריחוף מותאם"
                            value={ov.hoverTitle || ''}
                            onChange={(val) =>
                              updateItemOverride(ent.id, 'hoverTitle', val)
                            }
                          />
                          <PageBuilderInput
                            label="טקסט כפתור CTA"
                            value={ov.ctaText || ''}
                            onChange={(val) =>
                              updateItemOverride(ent.id, 'ctaText', val)
                            }
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <PageBuilderIconPicker
                              label="אייקון מיתוג / Lucide"
                              value={ov.iconName || 'Sparkles'}
                              onChange={(val) =>
                                updateItemOverride(ent.id, 'iconName', val)
                              }
                            />
                            <PageBuilderColorPicker
                              label="צבע כרטיס"
                              value={ov.accentColor || ''}
                              onChange={(val) =>
                                updateItemOverride(ent.id, 'accentColor', val)
                              }
                            />
                          </div>
                          {hasOverride && (
                            <button
                              type="button"
                              onClick={() => clearItemOverride(ent.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer self-start"
                            >
                              <RotateCcw className="w-3 h-3" />
                              אפס דריסות לברירת מחדל
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Check className="w-4 h-4" />
          סיום ועדכון האזור
        </button>
      )}
    </div>
  );
};
