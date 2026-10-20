import React, { useState, useEffect, useMemo } from 'react';
import {
  FaqSectionConfig,
  FaqItem,
  FaqLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { safeJsonStringify } from '../../utils/sanitizeConfig';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderIconPicker } from '../../ui/PageBuilderIconPicker';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  Save,
  X,
  ChevronDown,
  Sparkles,
  Palette,
  LayoutTemplate,
  Type,
  CheckCircle2,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Layers,
  Wand2,
  Info,
  Plus,
  Trash2,
  HelpCircle,
  Search,
  MessageCircle,
} from 'lucide-react';

export type FaqEditorAccordionSection =
  | 'layouts'
  | 'text_bg'
  | 'content'
  | 'items'
  | 'colors';

interface FaqLayoutDefinition {
  id: FaqLayoutPreset;
  letter: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  objectSizingDesc: string;
  buttonStyleDesc: string;
  colorPaletteDesc: string;
  cardStyleDesc: string;
  swatches: string[];
}

export const FAQ_LAYOUT_DEFINITIONS: FaqLayoutDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'א. פריסה בסגנון נשי (רכה ואלגנטית)',
    subtitle: 'קווים עגולים וזורמים, פלטת רוז-גולד ושמנת, כרטיסי שאלות קפסולה רכים',
    icon: Heart,
    objectSizingDesc: 'טיפוגרפיה אוורירית ומעודנת עם מרווחי שורות רחבים וכרטיסי אקורדיון מעוגלים עמוק (Radius 2rem)',
    buttonStyleDesc: 'כפתורי קפסולה עגולים (Rounded Full) בגרדיאנט ורוד-רוז עדין וזכוכית חלבית',
    colorPaletteDesc: 'ורוד פודרה, שמנת חמה, רוז-גולד ושמפניה',
    cardStyleDesc: 'כרטיסים רכים עם אייקונים עגולים ומעבר תשובה חלק עם טבעת הילה ורודה',
    swatches: ['#f43f5e', '#fb7185', '#fde68a', '#fff1f2'],
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'ב. פריסה בסגנון גברי (עוצמתית ודומיננטית)',
    subtitle: 'כותרות ענק מודגשות, פחם וזהב מתכתי, כרטיסי שאלות פלדה מסיביים',
    icon: Shield,
    objectSizingDesc: 'כותרות ענק דרמטיות (Font Black), גבולות כפולים מודגשים וכרטיסי שאלות בעלי נוכחות סמכותית',
    buttonStyleDesc: 'כפתורים רחבים וגדולים בזוויות מסותתות (Rounded LG) עם גבול כפול ונוכחות חזקה',
    colorPaletteDesc: 'שחור-אוניקס, אפור פחם, זהב-אמבר מתכתי וכחול פלדה',
    cardStyleDesc: 'כרטיסי פלדה כהים עם מסגרת 2px המוארת בזהב בעת פתיחה ואייקונים בריבועים זוויתיים',
    swatches: ['#090a0f', '#f59e0b', '#27272a', '#3b82f6'],
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (מה שכרגע נמצא)',
    subtitle: 'סגנון Notion SaaS 2026 נקי ומאוזן עם שורת חיפוש מהירה ותמיכה בטור כפול',
    icon: LayoutTemplate,
    objectSizingDesc: 'כותרת ממורכזת, שורת חיפוש רחבה ומאוזנת, כרטיסי שאלות מעוגלים מודרניים',
    buttonStyleDesc: 'כפתורים מעוגלים מודרניים (Rounded XL) באינדיגו ואמרלד',
    colorPaletteDesc: 'אינדיגו, סגול עדין, לבן וניגודיות סלייט מודרנית',
    cardStyleDesc: 'כרטיסי Notion חצי-שקופים עם רקע זכוכית עדין ואייקוני אינדיגו',
    swatches: ['#6366f1', '#a855f7', '#0f172a', '#f8fafc'],
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'ד. פריסה רוחנית (הרמונית ושלווה)',
    subtitle: 'סימטריה מדיטטיבית, גיאומטריה מקודשת, ירוק מרווה וזהב הילה',
    icon: Sun,
    objectSizingDesc: 'מרווחי נשימה עמוקים, טיפוגרפיה רגועה וכרטיסי שאלות שלווים וזורמים',
    buttonStyleDesc: 'כפתורי לוטוס עגולים עם שקיפות זכוכית ומעבר איטי והרמוני (duration-700)',
    colorPaletteDesc: 'ירוק מרווה (Sage), טורקיז עמוק, חול מדברי וזהב הילה',
    cardStyleDesc: 'כרטיסי לוטוס הרמוניים עם מסגרת טורקיז מעודנת וטבעת הילה',
    swatches: ['#0f766e', '#10b981', '#fbbf24', '#faf8f5'],
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'ה. פריסה חדה (ברוטליסטית ומדויקת)',
    subtitle: 'זוויות ישרות 90° ללא עיגול, מסגרות 2px וצללים קשים מוסטים',
    icon: Crosshair,
    objectSizingDesc: 'אובייקטים גיאומטריים חדים (0px Radius), שורת חיפוש חדה וטיפוגרפיה חותכת',
    buttonStyleDesc: 'כפתורים מלבניים חדים (Rounded None) עם צל מוסט קשיח ואפקט הזזה בלחיצה',
    colorPaletteDesc: 'שחור ולבן בניגודיות מקסימלית עם הדגשות אינדיגו חשמלי',
    cardStyleDesc: 'כרטיסים ממוסגרים ב-2px עם צל מוסט קשיח באינדיגו ומספור מונוספייס (01, 02)',
    swatches: ['#050505', '#ffffff', '#6366f1', '#e2e8f0'],
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'ו. פריסה אנליטית (מבוססת נתונים ודיוק)',
    subtitle: 'גריד טלמטריה טכנולוגי, תגיות מונוספייס ומסוף מענה נתונים חי',
    icon: Activity,
    objectSizingDesc: 'קומפוזיציית דשבורד מדויקת עם שורת חיפוש טכנולוגית ותגיות HUD לכל שאלה',
    buttonStyleDesc: 'כפתורים טכנולוגיים מהודקים (Rounded XL) בגרדיאנט ציאן-כחול',
    colorPaletteDesc: 'כחול-צי עמוק, ציאן טלמטריה, ירוק אמרלד ורשת נקודות טכנית',
    cardStyleDesc: 'כרטיסי שאלות עם חיווי סטטוס חי (HUD #), מסגרת ציאן ותגיות קטגוריה',
    swatches: ['#06b6d4', '#2563eb', '#10b981', '#050b14'],
  },
];

export interface FaqSectionEditorProps {
  config: FaqSectionConfig;
  onChange: (updated: FaqSectionConfig) => void;
  onClose?: () => void;
}

export const FaqSectionEditor: React.FC<FaqSectionEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  // Local state mirroring CRM Contact360Modal & PageSettingsDrawer
  const [formData, setFormData] = useState<FaqSectionConfig>({ ...config });
  const [initialData, setInitialData] = useState<FaqSectionConfig>({ ...config });

  // Accordion state: closed by default just like PageSettingsDrawer & Contact360Modal
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hoveredLayoutId, setHoveredLayoutId] = useState<FaqLayoutPreset | null>(null);

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
    return safeJsonStringify(formData) !== safeJsonStringify(initialData);
  }, [formData, initialData]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSection = (section: FaqEditorAccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = <K extends keyof FaqSectionConfig>(
    key: K,
    value: FaqSectionConfig[K]
  ) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onChange(updated);
  };

  const updatePatch = (patch: Partial<FaqSectionConfig>) => {
    const updated = { ...formData, ...patch };
    setFormData(updated);
    onChange(updated);
  };

  const handleSelectLayout = (layoutDef: FaqLayoutDefinition) => {
    updatePatch({
      layout: layoutDef.id,
      objectScale: 'auto',
      buttonShape: 'auto',
      buttonSize: 'auto',
    });
    showNotification(`הוחלה ${layoutDef.title}`);
  };

  const handleSave = (closeAfter = false) => {
    setIsSaving(true);
    try {
      onChange(formData);
      setInitialData({ ...formData });
      setShowUnsavedConfirm(false);
      showNotification('הגדרות אזור השאלות והתשובות נשמרו בהצלחה');
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

  const handleSyncBrandDna = () => {
    if (!brandDna) {
      showNotification('לא נמצאו נתוני מיתוג ב-Brand DNA');
      return;
    }
    const companyName = brandDna.identity?.companyName || '';
    const whatsapp = brandDna.trust?.whatsappSupportNumber || (brandDna.trust as any)?.whatsapp || '';
    const updated: FaqSectionConfig = {
      ...formData,
      subtitle: companyName ? `כל מה שחשוב לדעת על ${companyName}` : formData.subtitle,
      whatsappContact: whatsapp || formData.whatsappContact,
    };
    setFormData(updated);
    onChange(updated);
    setIsBrandSynced(true);
    showNotification('אזור השאלות סונכרן עם נתוני ה-Brand DNA');
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  const items = formData.items || [];

  const handleItemChange = (index: number, field: keyof FaqItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    updateField('items', updated);
  };

  const handleAddItem = () => {
    const newItem: FaqItem = {
      id: `faq_${Date.now()}`,
      question: 'שאלה חדשה שנשאלת לעיתים קרובות?',
      answer: 'תשובה מפורטת וברורה שמספקת מענה מלא למשתמש.',
      icon: 'HelpCircle',
    };
    updateField('items', [...items, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    updateField('items', updated);
  };

  const normalizedActiveLayout: FaqLayoutPreset =
    !formData.layout ||
    formData.layout === 'current' ||
    formData.layout === 'standard' ||
    formData.layout === 'two-columns' ||
    formData.layout === 'compact-cards'
      ? 'standard'
      : formData.layout;

  const activeLayoutDef =
    FAQ_LAYOUT_DEFINITIONS.find((d) => d.id === normalizedActiveLayout) ||
    FAQ_LAYOUT_DEFINITIONS[2];

  const tooltipLayoutDef =
    FAQ_LAYOUT_DEFINITIONS.find((d) => d.id === hoveredLayoutId) || null;

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
      {/* 1. Header: Compact with Two-Letter Avatar Icon (QA), Title, Brand DNA Sync, Save Icon, and Optional Close */}
      <div
        className={`flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        {/* Right: Connected Two-Letter Avatar Icon (QA) + Title */}
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none ${
              isDarkMode
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
            title="Q&A Section Editor"
          >
            QA
          </div>

          <div className="truncate">
            <div
              className={`text-xs sm:text-sm font-black truncate leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              עיצוב והגדרות שאלות ותשובות (Q&A / FAQ)
            </div>
            <div
              className={`text-[10px] truncate leading-none mt-0.5 ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              {activeLayoutDef.title}
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
            title="סנכרן מ-Brand DNA"
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

      {/* 2. Icon Menu with Rich Tooltip for the 6 Q&A Layouts ("תפריט אייקון עם טולטיפ") */}
      <div
        className={`p-2.5 mb-2.5 rounded-2xl border relative transition-all ${
          isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>תפריט אייקונים לבחירת סגנון פריסה (רחף מעל אייקון לפירוט)</span>
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDarkMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            פעיל: {activeLayoutDef.letter}. {activeLayoutDef.shortLabel}
          </span>
        </div>

        {/* 6 Icons Row */}
        <div className="grid grid-cols-6 gap-1.5">
          {FAQ_LAYOUT_DEFINITIONS.map((def) => {
            const IconComp = def.icon;
            const isSelected = normalizedActiveLayout === def.id;
            return (
              <div
                key={def.id}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredLayoutId(def.id)}
                onMouseLeave={() => setHoveredLayoutId((prev) => (prev === def.id ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => handleSelectLayout(def)}
                  onFocus={() => setHoveredLayoutId(def.id)}
                  onBlur={() => setHoveredLayoutId(null)}
                  aria-label={def.title}
                  className={`w-full py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md ring-1 ring-amber-500/40'
                      : isDarkMode
                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black opacity-75">{def.letter}.</span>
                    <IconComp className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold truncate max-w-full">{def.shortLabel}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Rich Interactive Tooltip Panel on Hover / Focus */}
        {tooltipLayoutDef && (
          <div
            className={`mt-2 p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn shadow-xl ${
              isDarkMode
                ? 'bg-[#0d0d0d] border-amber-500/40 text-zinc-200'
                : 'bg-white border-amber-400 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-1.5 border-amber-500/20">
              <span className="font-black text-amber-400 text-xs">{tooltipLayoutDef.title}</span>
              <div className="flex items-center gap-1">
                {tooltipLayoutDef.swatches.map((hex, idx) => (
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
                <strong className="text-amber-500">גודל אובייקטים: </strong>
                <span>{tooltipLayoutDef.objectSizingDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">צורת כפתורים: </strong>
                <span>{tooltipLayoutDef.buttonStyleDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">פלטת צבעים: </strong>
                <span>{tooltipLayoutDef.colorPaletteDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">סגנון כרטיסי שאלות: </strong>
                <span>{tooltipLayoutDef.cardStyleDesc}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Toast Notification */}
      {toastMessage && (
        <div className="mb-2.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Accordion Sections (Closed by default) */}
      <div className="space-y-2 flex-1">
        {/* SECTION 1: Layouts & Object Sizing */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('layouts')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
              </div>
              <span>1. סגנונות פריסה, פרופורציות וכפתורים</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.layouts ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.layouts && (
            <div
              className={`p-3 border-t space-y-2.5 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              {/* Detailed Cards for the 6 Layouts */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-amber-500 block">
                  בחר פריסת שאלות ותשובות (א׳ עד ו׳)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FAQ_LAYOUT_DEFINITIONS.map((def) => {
                    const IconComp = def.icon;
                    const isSelected = normalizedActiveLayout === def.id;
                    return (
                      <button
                        key={def.id}
                        type="button"
                        onClick={() => handleSelectLayout(def)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                            : isDarkMode
                              ? 'bg-[#161616] border-white/10 text-zinc-300 hover:border-amber-500/40'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <IconComp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="font-black text-[11px]">{def.title}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {def.swatches.map((hex, i) => (
                              <span
                                key={i}
                                className="w-2.5 h-2.5 rounded-full border border-white/20"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>
                        <p
                          className={`text-[10px] leading-snug ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}
                        >
                          {def.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-mode for Standard/Current Layout */}
              {normalizedActiveLayout === 'standard' && (
                <div className="space-y-0.5 pt-1">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    תת-מבנה בפריסה העכשווית (טור יחיד / שני טורים)
                  </label>
                  <select
                    value={formData.layout || 'standard'}
                    onChange={(e) =>
                      updateField('layout', e.target.value as FaqLayoutPreset)
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-[#1a1a1a] border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="standard">טור יחיד מרכזי (Notion Clean)</option>
                    <option value="two-columns">שני טורים (2 Columns Grid)</option>
                  </select>
                </div>
              )}

              {/* Object Scale & Button Shape */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    גודל אובייקטים וטיפוגרפיה
                  </label>
                  <select
                    value={formData.objectScale || 'auto'}
                    onChange={(e) =>
                      updateField(
                        'objectScale',
                        e.target.value as FaqSectionConfig['objectScale']
                      )
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-[#1a1a1a] border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">מותאם אוטומטית לסגנון הפריסה</option>
                    <option value="compact">קומפקטי ומדויק (Compact)</option>
                    <option value="normal">מאוזן וסטנדרטי (Normal)</option>
                    <option value="large">דרמטי ורחב (Large XL)</option>
                    <option value="massive">ענק במיוחד (Massive Max)</option>
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    צורת כפתורים (כפתור פנייה ישירה)
                  </label>
                  <select
                    value={formData.buttonShape || 'auto'}
                    onChange={(e) =>
                      updateField(
                        'buttonShape',
                        e.target.value as FaqSectionConfig['buttonShape']
                      )
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-[#1a1a1a] border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">מותאם אוטומטית לסגנון הפריסה</option>
                    <option value="pill">קפסולה עגולה (Pill / נשי ורוחני)</option>
                    <option value="rounded">מעוגל מודרני (Rounded 2XL / עכשווי)</option>
                    <option value="chiseled">זוויתי מסיבי (Chiseled / גברי)</option>
                    <option value="sharp">חד 90° עם צל קשיח (Sharp / חד)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Background Image Behind Text with Overlay & Hover Effect */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('text_bg')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>2. רקע תמונה מאחורי הטקסט ואפקט מעבר (Hover)</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.text_bg ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.text_bg && (
            <div
              className={`p-3 border-t space-y-2.5 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="font-bold text-amber-500 text-[11px]">
                  הפעל תמונת רקע מאחורי הטקסט עם שכבת מיסוך ואפקט מעבר
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(formData.textBgEnabled)}
                  onChange={(e) => updateField('textBgEnabled', e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
              </label>

              {formData.textBgEnabled && (
                <div className="space-y-2.5 pt-1 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-500 block">
                        מיקום הרקע מאחורי הטקסט
                      </label>
                      <select
                        value={formData.textBgScope || 'text-card'}
                        onChange={(e) =>
                          updateField('textBgScope', e.target.value as 'text-card' | 'full-section')
                        }
                        className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode
                            ? 'bg-[#1a1a1a] border-amber-500/60 text-white'
                            : 'bg-white border-amber-500/60 text-slate-900'
                        }`}
                      >
                        <option value="text-card">תיבת הכותרת בלבד (Header Card Backdrop)</option>
                        <option value="full-section">כל אזור השאלות (Full Section Backdrop)</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-500 block">
                        אפקט מעבר במעבר עכבר (Hover Effect)
                      </label>
                      <select
                        value={formData.textBgEffect || 'zoom-glow'}
                        onChange={(e) =>
                          updateField('textBgEffect', e.target.value as HeroTextBgEffect)
                        }
                        className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode
                            ? 'bg-[#1a1a1a] border-amber-500/60 text-white'
                            : 'bg-white border-amber-500/60 text-slate-900'
                        }`}
                      >
                        <option value="zoom-glow">זום קולנועי והארה (Zoom & Glow)</option>
                        <option value="shimmer-sweep">אלומת אור חולפת (Shimmer Sweep)</option>
                        <option value="float-parallax">ריחוף פראלקס עדין (Float Parallax)</option>
                        <option value="blur-reveal">חשיפה מטשטוש לחדות (Blur Reveal)</option>
                        <option value="gradient-shift">זרימת גרדיאנט דינמית (Gradient Shift)</option>
                      </select>
                    </div>
                  </div>

                  <PageBuilderImageUpload
                    label="תמונת רקע מאחורי הטקסט"
                    value={formData.textBgImageUrl || ''}
                    onChange={(url) => updateField('textBgImageUrl', url)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <PageBuilderColorPicker
                      label="צבע שכבת מיסוך (Overlay)"
                      value={formData.textBgOverlayColor || '#090d16'}
                      onChange={(c) => updateField('textBgOverlayColor', c)}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-500">
                        <span>אטימות שכבת הרקע (Opacity)</span>
                        <span>{formData.textBgOverlayOpacity ?? 72}%</span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={95}
                        value={formData.textBgOverlayOpacity ?? 72}
                        onChange={(e) =>
                          updateField('textBgOverlayOpacity', Number(e.target.value))
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Headings, Search & Support Card */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('content')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
              </div>
              <span>3. כותרות, חיפוש מהיר וכרטיס פנייה ישירה</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.content ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.content && (
            <div
              className={`p-3 border-t space-y-2.5 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-amber-500 block">
                  כותרת ראשית (Title)
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="שאלות ותשובות נפוצות"
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-amber-500 block">
                  תת-כותרת / תגית עליונה (Subtitle)
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="כל מה שחשוב לדעת..."
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-xl border border-white/5">
                  <span className="font-bold text-amber-500 text-[11px] flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>הצג שורת חיפוש מהירה</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.showSearchBar !== false}
                    onChange={(e) => updateField('showSearchBar', e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-xl border border-white/5">
                  <span className="font-bold text-amber-500 text-[11px] flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>הצג כרטיס פנייה ישירה בוואטסאפ</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.showContactCard !== false}
                    onChange={(e) => updateField('showContactCard', e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                </label>
              </div>

              {formData.showContactCard && (
                <div className="space-y-0.5 pt-1">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    מספר וואטסאפ לפניות (למשל: 0526968008 או 972545947701)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappContact || ''}
                    onChange={(e) => updateField('whatsappContact', e.target.value)}
                    dir="ltr"
                    placeholder="972545947701"
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: Repeating FAQ Items */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('items')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-cyan-500/15 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <span>4. שאלות ותשובות ({items.length})</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.items ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.items && (
            <div
              className={`p-3 border-t space-y-2.5 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-2.5 rounded-xl border space-y-2 ${
                    isDarkMode ? 'bg-[#161616] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-400">
                      שאלה #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="p-1 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="מחק שאלה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <PageBuilderIconPicker
                    label="אייקון השאלה"
                    value={item.icon || 'HelpCircle'}
                    onChange={(icon) => handleItemChange(idx, 'icon', icon)}
                  />

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">
                      השאלה
                    </label>
                    <input
                      type="text"
                      value={item.question || ''}
                      onChange={(e) => handleItemChange(idx, 'question', e.target.value)}
                      placeholder="הזן שאלה..."
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-transparent border-amber-500/60 text-white'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">
                      התשובה המפורטת
                    </label>
                    <textarea
                      rows={3}
                      value={item.answer || ''}
                      onChange={(e) => handleItemChange(idx, 'answer', e.target.value)}
                      placeholder="הזן תשובה..."
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none ${
                        isDarkMode
                          ? 'bg-transparent border-amber-500/60 text-white'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2 rounded-xl border border-dashed border-amber-500/50 text-amber-400 hover:bg-amber-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף שאלה חדשה</span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION 5: Custom Colors & Anchor */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-700'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
              </div>
              <span>5. צבעים מותאמים אישית ומזהה עוגן</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.colors ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.colors && (
            <div
              className={`p-3 border-t space-y-2.5 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>השאר ריק לשימוש בפלטת הצבעים המקורית של הפריסה</span>
                </span>
                {(formData.titleColor ||
                  formData.subtitleColor ||
                  formData.cardBackgroundColor ||
                  (formData.backgroundColor && formData.backgroundColor !== 'transparent')) && (
                  <button
                    type="button"
                    onClick={() =>
                      updatePatch({
                        titleColor: undefined,
                        subtitleColor: undefined,
                        cardBackgroundColor: undefined,
                        backgroundColor: 'transparent',
                      })
                    }
                    className="text-amber-400 hover:underline text-[10px] font-bold cursor-pointer"
                  >
                    אפס צבעים לסגנון הפריסה
                  </button>
                )}
              </div>

              <PageBuilderColorPicker
                label="צבע כותרת ראשית"
                value={formData.titleColor || '#ffffff'}
                onChange={(c) => updateField('titleColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע תת-כותרת / תגית"
                value={formData.subtitleColor || '#94a3b8'}
                onChange={(c) => updateField('subtitleColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כרטיסי שאלות"
                value={formData.cardBackgroundColor || 'transparent'}
                onChange={(c) => updateField('cardBackgroundColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כללי לאזור"
                value={formData.backgroundColor || 'transparent'}
                onChange={(c) => updateField('backgroundColor', c)}
              />

              <div className="space-y-0.5 pt-1">
                <label className="text-[10px] font-bold text-amber-500 block">
                  מזהה עוגן (Anchor ID)
                </label>
                <input
                  type="text"
                  value={formData.anchorId || 'faq'}
                  onChange={(e) => updateField('anchorId', e.target.value)}
                  dir="ltr"
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Footer: Compact Bottom Actions */}
      <div
        className={`flex items-center justify-between pt-2.5 mt-2.5 border-t shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        <div className="text-[11px] font-medium text-zinc-400">
          {isDirty ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              שינויים ממתינים לשמירה
            </span>
          ) : (
            <span className="text-zinc-500">כל השינויים מעודכנים</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              סגור
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave(Boolean(onClose))}
            disabled={isSaving}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50'
                : isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'שומר...' : 'שמור'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
