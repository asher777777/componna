import React, { useState, useEffect, useMemo } from 'react';
import {
  DynamicListingSectionConfig,
  DynamicListingItem,
  DynamicListingLayout,
  DynamicListingSource,
  DynamicListingStylePreset,
  StylePresetName,
  CardBoxShape,
  ControlsOrder,
  ButtonShape,
  ObjectScale,
  DynamicListingSortBy,
  DynamicListingLogicCondition,
} from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LayoutTemplate,
  CheckCircle2,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Layers,
  Wand2,
  Trash2,
  Plus,
  Link as LinkIcon,
  Database,
  Type,
  Palette,
  Sliders,
  Search,
  ExternalLink,
  ArrowRightLeft,
  Square,
  Flower2,
  Cpu,
  ArrowUpDown,
  Filter,
  EyeOff,
  Eye,
  FolderArchive,
  Image as ImageIcon,
} from 'lucide-react';

export type DynamicListingAccordionSection =
  | 'layouts'
  | 'source'
  | 'content'
  | 'colors'
  | 'items';

export interface DynamicListingStyleDefinition {
  id: DynamicListingStylePreset;
  letter: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  layout: DynamicListingLayout;
  boxShape: CardBoxShape;
  buttonShape: ButtonShape;
  controlsOrder: ControlsOrder;
  objectScale: ObjectScale;
  effectStyle: 'border-beam' | 'glow-hover' | 'tilt-3d' | 'subtle';
  objectSizingDesc: string;
  buttonStyleDesc: string;
  cardShapeDesc: string;
  colorPaletteDesc: string;
  swatches: string[];
}

export const DYNAMIC_LISTING_STYLE_DEFINITIONS: DynamicListingStyleDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'א. פריסה בסגנון נשי (רכה, אלגנטית ומזמינה)',
    subtitle: 'כרטיסי פרח/לב מעוגלים בעדינות, פלטת רוז-גולד, קרוסלה חלקה וכפתורי קפסולה',
    icon: Heart,
    layout: 'snap-carousel',
    boxShape: 'flower',
    buttonShape: 'pill',
    controlsOrder: 'categories-first',
    objectScale: 'prominent',
    effectStyle: 'glow-hover',
    objectSizingDesc: 'כרטיסים מרווחים ואווריריים, טיפוגרפיה רכה, מעברי צבע פסטליים וזוהר עדין',
    buttonStyleDesc: 'כפתורי קפסולה עגולים מלאים (Rounded Full) בגווני רוז-פינק עם ברק זוהר',
    cardShapeDesc: 'כרטיסי פרח ולב אלגנטיים (Radius 2.5rem) עם גבולות עדינים וצללים מלטפים',
    colorPaletteDesc: 'ורוד פודרה, רוז-גולד, שמנת חמה וסגול לבנדר מעודן',
    swatches: ['#ec4899', '#f43f5e', '#fb7185', '#fff1f2'],
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'ב. פריסה בסגנון גברי (עוצמתית, דומיננטית וטקטית)',
    subtitle: 'כרטיס מוביל Bento Spotlight, כרטיסי מגן כהים, זהב מתכתי וגבולות פלדה כפולים',
    icon: Shield,
    layout: 'bento-showcase',
    boxShape: 'shield',
    buttonShape: 'rounded',
    controlsOrder: 'search-first',
    objectScale: 'prominent',
    effectStyle: 'border-beam',
    objectSizingDesc: 'כותרות ענק דומיננטיות, מבנה Bento מסיבי, כרטיס ראשי רחב והילה נעה',
    buttonStyleDesc: 'כפתורים מסותתים (Rounded LG) עם מסגרות כפולות בזהב-ענבר מתכתי',
    cardShapeDesc: 'כרטיסי מגן טקטיים עם מסגרות 2px מובלטות, רקע כהה ופסי זהב',
    colorPaletteDesc: 'שחור-פחם, זהב מתכתי, אפור פלדה והדגשות ענבר עמוקות',
    swatches: ['#0a0b10', '#f59e0b', '#27272a', '#eab308'],
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (Notion SaaS 2026)',
    subtitle: 'מבנה Bento מודרני ומאוזן, כרטיסים מעוגלים נקיים, אינדיגו ואמרלד',
    icon: LayoutTemplate,
    layout: 'bento-showcase',
    boxShape: 'rounded',
    buttonShape: 'auto',
    controlsOrder: 'categories-first',
    objectScale: 'standard',
    effectStyle: 'border-beam',
    objectSizingDesc: 'פרופורציות מאוזנות ונקיות, גריד אחיד וסדר קטגוריות טבעי ואינטואיטיבי',
    buttonStyleDesc: 'כפתורים מודרניים מעוגלים (Rounded XL) באינדיגו עם צל עדין',
    cardShapeDesc: 'כרטיסים מעוגלים קלאסיים (Rounded 3XL) עם גבולות עדינים ורקע בהיר/כהה נקי',
    colorPaletteDesc: 'אינדיגו מודרני, לבן, סלייט, אמרלד וניגודיות שקופה',
    swatches: ['#6366f1', '#10b981', '#0f172a', '#f8fafc'],
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'ד. פריסה רוחנית (הרמונית, שלווה ומחוברת)',
    subtitle: 'כרטיסי לוטוס זורמים, קרוסלה אופקית שקטה, סגול-טורקיז עמוק והילה עוטפת',
    icon: Sun,
    layout: 'snap-carousel',
    boxShape: 'lotus',
    buttonShape: 'pill',
    controlsOrder: 'categories-first',
    objectScale: 'standard',
    effectStyle: 'subtle',
    objectSizingDesc: 'מרווחי נשימה רחבים, טיפוגרפיה הרמונית ותנועה חלקה ורגועה',
    buttonStyleDesc: 'כפתורי קפסולה הרמוניים מזכוכית חצי-שקופה עם גבול סגול זוהר',
    cardShapeDesc: 'כרטיסי לוטוס מעוגלים א-סימטרית עם שקיפות זכוכית וצל סגול רך',
    colorPaletteDesc: 'סגול רוחני, טורקיז עמוק, זהב הילה וחול מדברי חמים',
    swatches: ['#9333ea', '#7e22ce', '#14b8a6', '#faf5ff'],
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'ה. פריסה חדה (ברוטליסטית, טכנית ומדויקת)',
    subtitle: 'גריד Masonry חותך, זוויות ישרות 90°, גבולות 2px שחור/לבן וצללים קשים מוסטים',
    icon: Crosshair,
    layout: 'masonry',
    boxShape: 'sharp',
    buttonShape: 'square',
    controlsOrder: 'search-first',
    objectScale: 'compact',
    effectStyle: 'tilt-3d',
    objectSizingDesc: 'מבנה Masonry קומפקטי וחד, גופנים מונוספייסים וקווים גיאומטריים חותכים',
    buttonStyleDesc: 'כפתורים מלבניים חדים (Rounded None) עם צל קשיח 3px מוסט',
    cardShapeDesc: 'כרטיסים מלבניים חדים (0px Radius) עם גבולות 2px מודגשים',
    colorPaletteDesc: 'שחור-פחם ולבן בניגודיות מקסימלית עם קווים חדים',
    swatches: ['#000000', '#ffffff', '#4f46e5', '#334155'],
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'ו. פריסה אנליטית (מבוססת נתונים ודיוק HUD)',
    subtitle: 'רשימת מגזין Editorial List עם תמונה צפה, כרטיסי HUD טלמטריה וירוק אמרלד',
    icon: Activity,
    layout: 'editorial-list',
    boxShape: 'hud',
    buttonShape: 'rounded',
    controlsOrder: 'search-first',
    objectScale: 'standard',
    effectStyle: 'border-beam',
    objectSizingDesc: 'רשימה מהודקת עם אינדקס ספרתי (01, 02), תצוגה צפה ומדדי תוכן מדויקים',
    buttonStyleDesc: 'כפתורים טכנולוגיים מהודקים (Rounded SM) עם קווי רשת דקים',
    cardShapeDesc: 'כרטיסים קטומים (HUD chamfered / Rounded SM) עם תגיות טכניות',
    colorPaletteDesc: 'כחול-צי עמוק, ירוק אמרלד טלמטריה, ציאן וסלייט טכנולוגי',
    swatches: ['#059669', '#10b981', '#06b6d4', '#022c22'],
  },
];

interface DynamicListingEditorProps {
  config: DynamicListingSectionConfig;
  onChange: (updated: DynamicListingSectionConfig) => void;
  onClose?: () => void;
}

export const DynamicListingEditor: React.FC<DynamicListingEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  // Local state
  const [formData, setFormData] = useState<DynamicListingSectionConfig>({ ...config });
  const [initialData, setInitialData] = useState<DynamicListingSectionConfig>({ ...config });
  const [openSections, setOpenSections] = useState<Record<DynamicListingAccordionSection, boolean>>({
    layouts: true,
    source: false,
    content: false,
    colors: false,
    items: false,
  });

  const [hoveredLayoutId, setHoveredLayoutId] = useState<DynamicListingStylePreset | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  // Dynamic Light / Dark mode sync from document element
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateField = <K extends keyof DynamicListingSectionConfig>(
    field: K,
    value: DynamicListingSectionConfig[K]
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const toggleSection = (section: DynamicListingAccordionSection) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Select one of the 6 canonical style presets
  const handleSelectStylePreset = (def: DynamicListingStyleDefinition) => {
    const updated: DynamicListingSectionConfig = {
      ...formData,
      stylePreset: def.id,
      layout: def.layout,
      boxShape: def.boxShape,
      buttonShape: def.buttonShape,
      controlsOrder: def.controlsOrder,
      objectScale: def.objectScale,
      effectStyle: def.effectStyle,
    };
    setFormData(updated);
    onChange(updated);
    showNotification(`סגנון הפריסה עודכן ל-${def.title}`);
  };

  // Sync with Brand DNA
  const handleSyncBrandDna = () => {
    if (!brandDna) {
      showNotification('לא נמצאו נתוני מיתוג ב-Brand DNA');
      return;
    }
    const companyName = brandDna.identity?.companyName || '';
    const slogan = brandDna.identity?.slogan || '';

    const updated: DynamicListingSectionConfig = {
      ...formData,
      title: companyName ? `מאגר המידע, המדריכים והתוכן של ${companyName}` : formData.title,
      subtitle: slogan || formData.subtitle,
      source: 'pages',
    };
    setFormData(updated);
    onChange(updated);
    setIsBrandSynced(true);
    showNotification('האזור סונכרן עם נתוני ה-Brand DNA ומאגר התוכן של הטננט');
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  const handleSave = (closeAfter = false) => {
    setIsSaving(true);
    try {
      onChange(formData);
      setInitialData({ ...formData });
      setShowUnsavedConfirm(false);
      showNotification('הגדרות מאגר התוכן נשמרו בהצלחה');
      if (closeAfter && onClose) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestClose = () => {
    if (!onClose) return;
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // Items manipulation
  const updateItem = (index: number, updatedItem: Partial<DynamicListingItem>) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], ...updatedItem };
    updateField('items', newItems);
  };

  const addItem = () => {
    const newItem: DynamicListingItem = {
      id: `item-${Date.now()}`,
      title: 'פריט תוכן חדש',
      subtitle: 'פירוט קצר על הפריט...',
      excerpt: 'תיאור מורחב שמוצג בחלונית המלאה או כטקסט משני.',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
      category: 'כללי',
      date: new Date().toLocaleDateString('he-IL'),
      linkUrl: '#',
      actionType: 'modal',
    };
    const newItems = [...(formData.items || []), newItem];
    updateField('items', newItems);
    setExpandedItemId(newItem.id);
  };

  const removeItem = (index: number) => {
    const newItems = (formData.items || []).filter((_, idx) => idx !== index);
    updateField('items', newItems);
  };

  const toggleHideItem = (itemId: string) => {
    const currentHidden = formData.hiddenItemIds || [];
    const isHidden = currentHidden.includes(itemId);
    const updated = isHidden
      ? currentHidden.filter((id) => id !== itemId)
      : [...currentHidden, itemId];
    updateField('hiddenItemIds', updated);
  };

  const normalizedActivePreset: DynamicListingStylePreset =
    formData.stylePreset ||
    (formData.layout === 'editorial-list'
      ? 'analytical'
      : formData.layout === 'masonry'
      ? 'sharp'
      : formData.layout === 'snap-carousel'
      ? 'feminine'
      : 'standard');

  const activeStyleDef =
    DYNAMIC_LISTING_STYLE_DEFINITIONS.find((d) => d.id === normalizedActivePreset) ||
    DYNAMIC_LISTING_STYLE_DEFINITIONS[2];

  const tooltipStyleDef =
    DYNAMIC_LISTING_STYLE_DEFINITIONS.find((d) => d.id === hoveredLayoutId) || null;

  const items = formData.items || [];

  return (
    <div
      className={`w-full rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors font-sans text-right ${
        isDarkMode
          ? 'bg-[#0a0a0a] border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
      {/* 1. Header: Compact with Two-Letter Avatar Icon (DL), Title, Brand DNA Sync, Save Icon, and Optional Close */}
      <div
        className={`flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        {/* Right: Connected Two-Letter Avatar Icon (DL) + Title */}
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none ${
              isDarkMode
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                : 'bg-indigo-100 text-indigo-800 border-indigo-300'
            }`}
            title="Dynamic Listing Section Editor"
          >
            DL
          </div>

          <div className="truncate">
            <div
              className={`text-xs sm:text-sm font-black truncate leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              עיצוב והגדרות מאגר תוכן ורשימות (Dynamic Listing)
            </div>
            <div
              className={`text-[10px] truncate leading-none mt-0.5 ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              {activeStyleDef.title}
            </div>
          </div>
        </div>

        {/* Left: Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncBrandDna}
            className={`p-1.5 rounded-full border transition hover:opacity-80 cursor-pointer ${
              isBrandSynced
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : isDarkMode
                ? 'border-indigo-900 text-indigo-400 bg-indigo-950/30'
                : 'border-indigo-200 text-indigo-600 bg-indigo-50/50'
            }`}
            title="סנכרן מ-Brand DNA ומאגר הטננט"
          >
            {isBrandSynced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 animate-pulse'
                : isDarkMode
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isDirty ? 'שמור שינויים שלא נשמרו' : 'שמור'}
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="סגור"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Banner */}
      {showUnsavedConfirm && (
        <div
          className={`mb-2.5 p-3 rounded-2xl border flex flex-col gap-2 animate-fadeIn ${
            isDarkMode
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="text-xs font-bold">יש שינויים שלא נשמרו. מה ברצונך לעשות?</div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition cursor-pointer"
            >
              שמור וסגור
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUnsavedConfirm(false);
                if (onClose) onClose();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              צא ללא שמירה
            </button>
            <button
              type="button"
              onClick={() => setShowUnsavedConfirm(false)}
              className="px-2.5 py-1 rounded-xl text-xs opacity-70 hover:opacity-100 transition cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* 2. Quick Icon Bar for the 6 Layout Styles - STRICTLY ONLY ICONS AND TOOLTIP, NO BUTTON TEXT LABELS */}
      <div
        className={`p-2.5 mb-2.5 rounded-2xl border relative transition-all ${
          isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>בחירה מהירה לפי סגנון (רחף מעל אייקון לפירוט מלא)</span>
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDarkMode
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-indigo-100 text-indigo-800 border-indigo-300'
            }`}
          >
            פעיל: {activeStyleDef.letter}. {activeStyleDef.shortLabel}
          </span>
        </div>

        {/* 6 Icons Row - NO TEXT LABELS ON BUTTONS */}
        <div className="grid grid-cols-6 gap-1.5">
          {DYNAMIC_LISTING_STYLE_DEFINITIONS.map((def) => {
            const IconComp = def.icon;
            const isSelected = normalizedActivePreset === def.id;
            return (
              <div
                key={def.id}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredLayoutId(def.id)}
                onMouseLeave={() => setHoveredLayoutId(null)}
              >
                <button
                  type="button"
                  onClick={() => handleSelectStylePreset(def)}
                  onFocus={() => setHoveredLayoutId(def.id)}
                  onBlur={() => setHoveredLayoutId(null)}
                  aria-label={def.title}
                  title={`${def.letter}. ${def.shortLabel}`}
                  className={`w-full py-2.5 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-md ring-1 ring-indigo-500/40'
                      : isDarkMode
                      ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-1 justify-center py-0.5">
                    <span className="text-[11px] font-black opacity-75">{def.letter}.</span>
                    <IconComp className="w-5 h-5 shrink-0" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Rich Interactive Tooltip Panel on Hover / Focus */}
        {tooltipStyleDef && (
          <div
            className={`mt-2 p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn shadow-xl ${
              isDarkMode
                ? 'bg-[#0d0d0d] border-indigo-500/40 text-zinc-200'
                : 'bg-white border-indigo-400 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-1.5 border-indigo-500/20">
              <span className="font-black text-indigo-400 text-xs">{tooltipStyleDef.title}</span>
              <div className="flex items-center gap-1">
                {tooltipStyleDef.swatches.map((hex, idx) => (
                  <span
                    key={idx}
                    className="w-3 h-3 rounded-full border border-white/20 inline-block"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] leading-snug pt-0.5">
              <div>
                <strong className="text-indigo-400">גודל וקומפוזיציה: </strong>
                <span>{tooltipStyleDef.objectSizingDesc}</span>
              </div>
              <div>
                <strong className="text-indigo-400">סגנון כפתורים: </strong>
                <span>{tooltipStyleDef.buttonStyleDesc}</span>
              </div>
              <div>
                <strong className="text-indigo-400">צורת כרטיסים: </strong>
                <span>{tooltipStyleDef.cardShapeDesc}</span>
              </div>
              <div>
                <strong className="text-indigo-400">פלטת גוונים: </strong>
                <span>{tooltipStyleDef.colorPaletteDesc}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion Container */}
      <div className="space-y-2 flex-grow">
        {/* =========================================================================
            ACCORDION 1: STYLE PRESETS, SHAPES & BRANDING ("סגנון פריסה ומיתוג")
        ========================================================================= */}
        <div
          className={`rounded-2xl border transition overflow-hidden ${
            isDarkMode ? 'border-white/10 bg-[#121212]' : 'border-slate-200 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('layouts')}
            className="w-full p-3 flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-indigo-400" />
              <span>סגנון פריסה, צורות כרטיסים ומיתוג</span>
            </span>
            {openSections.layouts ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.layouts && (
            <div className="p-3 pt-0 space-y-4 text-xs border-t border-inherit">
              {/* Vertical Stacked Selection List (שורה תחת שורה) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 block">
                  בחר סגנון מותאם (רשימה מפורטת שורה תחת שורה):
                </label>
                <div className="flex flex-col gap-2">
                  {DYNAMIC_LISTING_STYLE_DEFINITIONS.map((def) => {
                    const IconComp = def.icon;
                    const isSelected = normalizedActivePreset === def.id;
                    return (
                      <div
                        key={def.id}
                        onClick={() => handleSelectStylePreset(def)}
                        className={`p-3 rounded-xl border flex flex-col gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-500/15 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                            : isDarkMode
                            ? 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                            : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500 text-white'
                                  : 'border-zinc-500 text-transparent'
                              }`}
                            >
                              ✓
                            </div>
                            <div className="flex items-center gap-2">
                              <IconComp className="w-4 h-4 text-indigo-400" />
                              <span className="font-black text-sm">{def.title}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {def.swatches.map((hex, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed pr-7">
                          {def.subtitle}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-zinc-400 pt-1 border-t border-white/5 pr-7">
                          <div>
                            <strong className="text-indigo-300">צורת כרטיסים: </strong>
                            <span>{def.cardShapeDesc}</span>
                          </div>
                          <div>
                            <strong className="text-indigo-300">סגנון כפתורים: </strong>
                            <span>{def.buttonStyleDesc}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box Shape Override Selector */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Square className="w-3.5 h-3.5 text-indigo-400" />
                  <span>צורת התיבות / הכרטיסים (Box Shape)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'rounded', label: 'מעוגל קלאסי (Rounded)', icon: Square },
                    { id: 'flower', label: 'פרח / לב נשי (Flower)', icon: Flower2 },
                    { id: 'heart', label: 'לב מיוחד (Heart)', icon: Heart },
                    { id: 'shield', label: 'מגן גברי (Shield)', icon: Shield },
                    { id: 'lotus', label: 'לוטוס רוחני (Lotus)', icon: Sun },
                    { id: 'sharp', label: 'חד 90° ברוטליסטי (Sharp)', icon: Crosshair },
                    { id: 'hud', label: 'אנליטי HUD טכנולוגי (HUD)', icon: Cpu },
                  ].map((shape) => {
                    const IconC = shape.icon;
                    const isShapeSelected =
                      (formData.boxShape || activeStyleDef.boxShape) === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => updateField('boxShape', shape.id as CardBoxShape)}
                        className={`p-2 rounded-xl border text-right flex items-center gap-2 transition cursor-pointer text-xs ${
                          isShapeSelected
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                            : isDarkMode
                            ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <IconC className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{shape.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order of Controls Toggle (מימין לשמאל ומשמאל לימין) */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                  <span>סדר הפקדים (קטגוריות מול חיפוש - מימין לשמאל / משמאל לימין)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('controlsOrder', 'categories-first')}
                    className={`p-2.5 rounded-xl border text-right flex items-center justify-between transition cursor-pointer text-xs ${
                      (formData.controlsOrder || 'categories-first') === 'categories-first'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                        : isDarkMode
                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>1. קטגוריות בימין ⟵ חיפוש בשמאל</span>
                    <span className="text-[10px] opacity-70">(רגיל)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('controlsOrder', 'search-first')}
                    className={`p-2.5 rounded-xl border text-right flex items-center justify-between transition cursor-pointer text-xs ${
                      formData.controlsOrder === 'search-first'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                        : isDarkMode
                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>2. חיפוש בימין ⟵ קטגוריות בשמאל</span>
                    <span className="text-[10px] opacity-70">(סדר הפוך)</span>
                  </button>
                </div>
              </div>

              {/* Button Shape Selector */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">צורת כפתורים (Button Shape)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'auto', label: 'אוטומטי לפי סגנון' },
                    { id: 'pill', label: 'קפסולה מעוגלת (Pill)' },
                    { id: 'rounded', label: 'מעוגל מודרני (Rounded)' },
                    { id: 'square', label: 'מרובע חד (Square)' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => updateField('buttonShape', btn.id as ButtonShape)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs ${
                        (formData.buttonShape || 'auto') === btn.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                          : isDarkMode
                          ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Presentation Selector */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">תצורת פריסה כללית (Layout)</label>
                <select
                  value={formData.layout || 'bento-showcase'}
                  onChange={(e) => updateField('layout', e.target.value as DynamicListingLayout)}
                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="bento-showcase">1. Bento Showcase (כרטיס מוביל Spotlight + כרטיסי משנה)</option>
                  <option value="floating-grid">2. גריד זכוכית מרחף (Floating Glass Grid עם 3D Tilt)</option>
                  <option value="snap-carousel">3. קרוסלה אופקית חלקה (Infinite Snap Carousel)</option>
                  <option value="editorial-list">4. רשימת מגזין יוקרתית (Editorial List עם תמונה צפה)</option>
                  <option value="masonry">5. גריד א-סימטרי פינטרסט (Asymmetric Masonry)</option>
                </select>
              </div>

              {/* Grid Columns & Ratio (If Floating Grid) */}
              {formData.layout === 'floating-grid' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">מספר עמודות בדסקטופ</label>
                    <select
                      value={formData.gridColumns || 3}
                      onChange={(e) => updateField('gridColumns', parseInt(e.target.value) as any)}
                      className={`w-full rounded-xl px-2.5 py-1.5 text-xs outline-none border ${
                        isDarkMode
                          ? 'bg-black border-white/10 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value={2}>2 עמודות (רחב)</option>
                      <option value={3}>3 עמודות (סטנדרט)</option>
                      <option value={4}>4 עמודות (קומפקטי)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">יחס גובה-רוחב לתמונה</label>
                    <select
                      value={formData.aspectRatio || '16:9'}
                      onChange={(e) => updateField('aspectRatio', e.target.value as any)}
                      className={`w-full rounded-xl px-2.5 py-1.5 text-xs outline-none border ${
                        isDarkMode
                          ? 'bg-black border-white/10 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="16:9">16:9 (וידאו רחב)</option>
                      <option value="4:3">4:3 (קלאסי)</option>
                      <option value="1:1">1:1 (מרובע)</option>
                      <option value="9:16">9:16 (אנכי טיקטוק / סטורי)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Visual Effect Selector */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">אפקט ויזואלי וריחוף</label>
                <select
                  value={formData.effectStyle || 'border-beam'}
                  onChange={(e) => updateField('effectStyle', e.target.value as any)}
                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="border-beam">Border Beam (הילת מסגרת נעה על כרטיס מוביל)</option>
                  <option value="glow-hover">Glow Hover (זוהר עדין בריחוף)</option>
                  <option value="tilt-3d">Tilt 3D (הטיה תלת-ממדית עם תנועת העכבר)</option>
                  <option value="subtle">עדין ונקי (Subtle Minimal)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            ACCORDION 2: CONTENT SOURCE & COLLECTIONS ("מקור התוכן והקולקציות")
        ========================================================================= */}
        <div
          className={`rounded-2xl border transition overflow-hidden ${
            isDarkMode ? 'border-white/10 bg-[#121212]' : 'border-slate-200 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('source')}
            className="w-full p-3 flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>מקור התוכן, סנכרון קולקציות ומאגר</span>
            </span>
            {openSections.source ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.source && (
            <div className="p-3 pt-0 space-y-3 text-xs border-t border-inherit">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">סוג מקור התוכן</label>
                <select
                  value={formData.source || 'pages'}
                  onChange={(e) => updateField('source', e.target.value as any)}
                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="pages">עמודי תוכן, מאמרים ומדריכים (PAGES - ברירת מחדל)</option>
                  <option value="media_gallery">ספריית המדיה והקבצים של הטננט (Media Hub Gallery)</option>
                  <option value="archives">נתיבי הארכיונים והקטגוריות (Archives Hub)</option>
                  <option value="custom">הזנה ידנית מותאמת אישית (Custom Items)</option>
                  <option value="kos_tube">סרטוני וידאו (KOS_TUBE)</option>
                  <option value="campaigns">פרויקטים וקמפיינים (CAMPAIGNS)</option>
                </select>
              </div>

              {formData.source === 'archives' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
                    <span>סינון נתיב ארכיון ספציפי</span>
                  </label>
                  <select
                    value={formData.archivePathFilter || 'all'}
                    onChange={(e) => updateField('archivePathFilter', e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                      isDarkMode
                        ? 'bg-black border-white/10 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="all">כל נתיבי הארכיונים (7 ארכיונים ראשיים)</option>
                    <option value="info_content">/kosinfo • מרכז התוכן, הידע והמאמרים</option>
                    <option value="event">/kosevent • לוח האירועים, הכנסים והסדנאות</option>
                    <option value="checkout">/koscheckout • מרכז המוצרים, החבילות והסליקה</option>
                    <option value="community">/koscommunity • פורטל הקהילות והמועדונים</option>
                    <option value="fundraising">/kosfunrise • מרכז הקמפיינים והגיוס</option>
                    <option value="course">/koscourse • האקדמיה הדיגיטלית ומרכז הקורסים</option>
                    <option value="service_product">/kosass • קטלוג השירותים והפתרונות</option>
                    <option value="youtube_post">/kosvidio • מרכז הוידאו והשידורים החיים</option>
                  </select>
                </div>
              )}

              {formData.source === 'pages' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">סינון לפי קטגוריית עמודים</label>
                  <select
                    value={formData.filterCategory || 'all'}
                    onChange={(e) => updateField('filterCategory', e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                      isDarkMode
                        ? 'bg-black border-white/10 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="all">כל סוגי העמודים והמוצרים (All)</option>
                    <option value="event">עמודי אירועים וכנסים בלבד</option>
                    <option value="course">דפי קורסים והכשרות בלבד</option>
                    <option value="fundraising">קמפיין וגיוס כספים בלבד</option>
                    <option value="checkout">דפי נחיתה ומוצרים בלבד</option>
                    <option value="service_product">מוצרי דגל ושירותים מתוך האקוסיסטם</option>
                  </select>
                </div>
              )}

              {/* Sorting Conditions (סידור לפי תנאים שונים) */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span>סדר הצגת הפריטים (סידור לפי תנאי)</span>
                </label>
                <select
                  value={formData.sortBy || 'date-desc'}
                  onChange={(e) => updateField('sortBy', e.target.value as DynamicListingSortBy)}
                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="date-desc">תאריך: מהחדש ביותר לישן ביותר</option>
                  <option value="date-asc">תאריך: מהישן ביותר לחדש ביותר</option>
                  <option value="title-asc">שם פריט: מא' עד ת' (אלפביתי עולה)</option>
                  <option value="title-desc">שם פריט: מת' עד א' (אלפביתי יורד)</option>
                  <option value="manual">סדר ידני מותאם אישית</option>
                </select>
              </div>

              {/* Logical Filter / Condition (תנאי לוגי דינמי) */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span>סינון תנאי לוגי (הסתרה אוטומטית לפי כלל)</span>
                </label>
                <select
                  value={formData.logicRule || 'none'}
                  onChange={(e) => updateField('logicRule', e.target.value as DynamicListingLogicCondition)}
                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="none">הצג את כל הפריטים (ללא תנאי לוגי)</option>
                  <option value="only-with-image">הצג רק פריטים בעלי תמונה ממשית (הסתר ריקים)</option>
                  <option value="only-featured">הצג רק פריטים מומלצים / מוצרי דגל (Featured Only)</option>
                  <option value="exclude-tags">הסתר פריטי טיוטה או פריטים שסומנו כמוסתרים</option>
                </select>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">כמות פריטים מקסימלית להצגה</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.maxItems || 12}
                  onChange={(e) => updateField('maxItems', parseInt(e.target.value) || 12)}
                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            ACCORDION 3: HEADERS, FILTERS & SEARCH ("כותרות, פילטרים וחיפוש")
        ========================================================================= */}
        <div
          className={`rounded-2xl border transition overflow-hidden ${
            isDarkMode ? 'border-white/10 bg-[#121212]' : 'border-slate-200 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('content')}
            className="w-full p-3 flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Type className="w-4 h-4 text-sky-400" />
              <span>כותרות, תיבת חיפוש ופילטרים</span>
            </span>
            {openSections.content ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.content && (
            <div className="p-3 pt-0 space-y-3 text-xs border-t border-inherit">
              <PageBuilderInput
                label="תגית עליונה (Badge)"
                value={formData.badge || ''}
                onChange={(val) => updateField('badge', val)}
                placeholder="לדוגמה: מרכז הידע • מאמרים ומדריכים"
              />

              <PageBuilderInput
                label="כותרת ראשית של האזור"
                value={formData.title || ''}
                onChange={(val) => updateField('title', val)}
                placeholder="מאגר המאמרים, המדריכים ומרכז הידע"
              />

              <PageBuilderInput
                label="תת-כותרת / תיאור קצר"
                value={formData.subtitle || ''}
                onChange={(val) => updateField('subtitle', val)}
                placeholder="כל הכלים, התובנות והמדריכים המעשיים שיעזרו לכם לצמוח..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showCategoryFilter ?? true}
                    onChange={(e) => updateField('showCategoryFilter', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-zinc-300 font-semibold">הצג לשוניות סינון קטגוריות</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showSearchBar ?? true}
                    onChange={(e) => updateField('showSearchBar', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-zinc-300 font-semibold">הצג תיבת חיפוש מהיר</span>
                </label>
              </div>

              {(formData.showSearchBar ?? true) && (
                <PageBuilderInput
                  label="טקסט ברירת מחדל לחיפוש (Placeholder)"
                  value={formData.searchPlaceholder || ''}
                  onChange={(val) => updateField('searchPlaceholder', val)}
                  placeholder="חיפוש מהיר במאגר..."
                />
              )}

              {/* Primary CTA Bottom Button */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">כפתור הנעה לפעולה ראשי (בתחתית האזור)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <PageBuilderInput
                    label="טקסט הכפתור (ריק להסתרה)"
                    value={formData.primaryButton?.text || ''}
                    onChange={(val) =>
                      updateField('primaryButton', {
                        text: val,
                        url: formData.primaryButton?.url || '#',
                      })
                    }
                    placeholder="לדוגמה: לכל המאמרים והמדריכים"
                  />
                  <PageBuilderInput
                    label="קישור הכפתור (URL)"
                    value={formData.primaryButton?.url || ''}
                    onChange={(val) =>
                      updateField('primaryButton', {
                        text: formData.primaryButton?.text || '',
                        url: val,
                      })
                    }
                    placeholder="/blog או #sec-contact"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            ACCORDION 4: COLORS & BACKGROUNDS ("צבעים, רקעים ומיתוג")
        ========================================================================= */}
        <div
          className={`rounded-2xl border transition overflow-hidden ${
            isDarkMode ? 'border-white/10 bg-[#121212]' : 'border-slate-200 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className="w-full p-3 flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>צבעים, רקעים ומיתוג ויזואלי</span>
            </span>
            {openSections.colors ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.colors && (
            <div className="p-3 pt-0 space-y-3 text-xs border-t border-inherit">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע רקע לאזור"
                  value={formData.backgroundColor || 'transparent'}
                  onChange={(val) => updateField('backgroundColor', val)}
                />

                <PageBuilderColorPicker
                  label="צבע רקע לכרטיסים"
                  value={formData.cardBgColor || ''}
                  onChange={(val) => updateField('cardBgColor', val)}
                />

                <PageBuilderColorPicker
                  label="צבע כותרת ראשית"
                  value={formData.titleColor || ''}
                  onChange={(val) => updateField('titleColor', val)}
                />

                <PageBuilderColorPicker
                  label="צבע הדגשה (Accent Color)"
                  value={formData.accentColor || ''}
                  onChange={(val) => updateField('accentColor', val)}
                />
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            ACCORDION 5: ITEMS MANAGEMENT ("ניהול פריטי תוכן ידניים")
        ========================================================================= */}
        <div
          className={`rounded-2xl border transition overflow-hidden ${
            isDarkMode ? 'border-white/10 bg-[#121212]' : 'border-slate-200 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('items')}
            className="w-full p-3 flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>ניהול פריטי תוכן ידניים ({items.length} פריטים)</span>
            </span>
            {openSections.items ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.items && (
            <div className="p-3 pt-0 space-y-3 text-xs border-t border-inherit">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-[11px]">
                  {formData.source === 'custom'
                    ? 'פריטים אלו מוצגים כעת באזור התוכן:'
                    : 'פריטים אלו משמשים כגיבוי / במצב הזנה ידנית:'}
                </span>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף פריט חדש</span>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed text-center text-zinc-500 text-xs">
                  אין פריטים ידניים ברשימה. לחץ על "הוסף פריט חדש" כדי להתחיל.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const isExpanded = expandedItemId === item.id;
                    return (
                      <div
                        key={item.id || index}
                        className={`rounded-xl border overflow-hidden transition ${
                          isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                          className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2.5 truncate max-w-[75%]">
                            <span className="font-mono text-zinc-400 text-xs font-bold">
                              #{index + 1}
                            </span>
                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-bold truncate text-xs">{item.title}</span>
                            {item.category && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px]">
                                {item.category}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleHideItem(item.id);
                              }}
                              className={`p-1 rounded-lg transition cursor-pointer ${
                                (formData.hiddenItemIds || []).includes(item.id)
                                  ? 'text-amber-400 bg-amber-500/20'
                                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
                              }`}
                              title={
                                (formData.hiddenItemIds || []).includes(item.id)
                                  ? 'פריט זה מוסתר - לחץ להצגה'
                                  : 'הסתר פריט זה מהתצוגה'
                              }
                            >
                              {(formData.hiddenItemIds || []).includes(item.id) ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(index);
                              }}
                              className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                              title="מחק פריט"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-3 pt-0 space-y-3 border-t border-inherit mt-2">
                            <PageBuilderInput
                              label="כותרת הפריט"
                              value={item.title}
                              onChange={(val) => updateItem(index, { title: val })}
                              placeholder="כותרת המאמר / המוצר..."
                            />

                            <PageBuilderInput
                              label="תת-כותרת / שורת תקציר"
                              value={item.subtitle || ''}
                              onChange={(val) => updateItem(index, { subtitle: val })}
                              placeholder="שורת פירוט קצרה..."
                            />

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-zinc-400">תקציר מלא (למודאל)</label>
                              <textarea
                                value={item.excerpt || ''}
                                onChange={(e) => updateItem(index, { excerpt: e.target.value })}
                                rows={2}
                                className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                                  isDarkMode
                                    ? 'bg-black border-white/10 text-white'
                                    : 'bg-white border-slate-300 text-slate-900'
                                }`}
                                placeholder="תיאור מורחב על הפריט..."
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <PageBuilderInput
                                label="קטגוריה"
                                value={item.category || ''}
                                onChange={(val) => updateItem(index, { category: val })}
                                placeholder="לדוגמה: מדריכים"
                              />

                              <PageBuilderInput
                                label="תגית מיוחדת (Badge)"
                                value={item.badge || ''}
                                onChange={(val) => updateItem(index, { badge: val })}
                                placeholder="מומלץ / חדש"
                              />

                              <PageBuilderInput
                                label="תאריך או מחיר"
                                value={item.date || item.price || ''}
                                onChange={(val) => updateItem(index, { date: val })}
                                placeholder="24/10/2026"
                              />
                            </div>

                            <PageBuilderImageUpload
                              label="תמונת הפריט"
                              value={item.imageUrl}
                              onChange={(val) => updateItem(index, { imageUrl: val })}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <PageBuilderInput
                                label="קישור (URL)"
                                value={item.linkUrl || ''}
                                onChange={(val) => updateItem(index, { linkUrl: val })}
                                placeholder="https://... או #sec-contact"
                              />

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-400">פעולת לחיצה</label>
                                <select
                                  value={item.actionType || 'modal'}
                                  onChange={(e) =>
                                    updateItem(index, { actionType: e.target.value as any })
                                  }
                                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${
                                    isDarkMode
                                      ? 'bg-black border-white/10 text-white'
                                      : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                                >
                                  <option value="modal">פתיחה בחלונית צפה (Modal)</option>
                                  <option value="link">מעבר לקישור בעמוד חדש (Link)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
