import React, { useState, useEffect, useMemo } from 'react';
import { HeroSectionConfig, HeroLayoutPreset, HeroTextBgEffect } from '../../types/sectionConfigs';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, AiTextAssistantContract } from '../../../../core/contracts';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { PageBuilderConfig } from '../../types/pageBuilder.types';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import {
  Save,
  X,
  ChevronDown,
  Sparkles,
  Palette,
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  CheckCircle2,
  Heart,
  Shield,
  Sun,
  Crosshair,
  BarChart3,
  Layers,
  Wand2,
  Loader2,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Link as LinkIcon,
  Globe,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';

export type HeroEditorAccordionSection =
  | 'layouts'
  | 'content'
  | 'buttons'
  | 'text_bg'
  | 'media_metrics'
  | 'colors';

interface HeroLayoutDefinition {
  id: HeroLayoutPreset;
  letter: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  objectSizingDesc: string;
  buttonStyleDesc: string;
  colorPaletteDesc: string;
  imagePlacementDesc: string;
  swatches: string[];
}

export const HERO_LAYOUT_DEFINITIONS: HeroLayoutDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'א. פריסה בסגנון נשי (רכה ואלגנטית)',
    subtitle: 'קווים עגולים וזורמים, פלטת רוז-גולד ושמנת, מסגרת קשתית',
    icon: Heart,
    objectSizingDesc: 'טיפוגרפיה אוורירית ומעודנת עם מרווחי שורות רחבים ומסגרת תמונה קשתית (Arch)',
    buttonStyleDesc: 'כפתורי קפסולה עגולים (Rounded Full) בגרדיאנט ורוד-רוז עדין וזכוכית חלבית',
    colorPaletteDesc: 'ורוד פודרה, שמנת חמה, רוז-גולד ושמפניה',
    imagePlacementDesc: 'חלוקה אסימטרית – תמונת בוטיק קשתית משמאל וטקסט אלגנטי מימין',
    swatches: ['#f43f5e', '#fb7185', '#fde68a', '#fff1f2'],
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'ב. פריסה בסגנון גברי (עוצמתית ודומיננטית)',
    subtitle: 'כותרות ענק מודגשות, פחם וזהב מתכתי, מבנה סמכותי ורחב',
    icon: Shield,
    objectSizingDesc: 'כותרות ענק דרמטיות (Font Black), קווי הדגשה אנכיים עבים ומסגרת קולנועית מסיבית',
    buttonStyleDesc: 'כפתורים רחבים וגדולים בזוויות מסותתות (Rounded LG) עם גבול כפול ונוכחות חזקה',
    colorPaletteDesc: 'שחור-אוניקס, אפור פחם, זהב-אמבר מתכתי וכחול פלדה',
    imagePlacementDesc: 'חלוקת כוח דו-עמודתית – מסגרת פלדה רחבה עם עיטורי זווית לצד הטקסט',
    swatches: ['#090a0f', '#f59e0b', '#27272a', '#3b82f6'],
  },
  {
    id: 'bento-hero',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (מה שכרגע נמצא)',
    subtitle: 'ממורכזת ומאוזנת בסגנון SaaS 2026 עם תאורת Mesh Glow',
    icon: LayoutTemplate,
    objectSizingDesc: 'כותרת ממורכזת גדולה, באדג׳ הכרזה עליון, שורת אווטארים ומסגרת דפדפן רחבה',
    buttonStyleDesc: 'כפתורים מעוגלים מודרניים (Rounded 2XL) באינדיגו עמוק ולבן נקי',
    colorPaletteDesc: 'אינדיגו, סגול עדין, לבן וניגודיות סלייט מודרנית',
    imagePlacementDesc: 'ממורכזת מתחת לטקסט בתוך מסגרת Showcase דמוית דפדפן',
    swatches: ['#6366f1', '#a855f7', '#0f172a', '#f8fafc'],
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'ד. פריסה רוחנית (הרמונית ושלווה)',
    subtitle: 'סימטריה מדיטטיבית, גיאומטריה מקודשת, ירוק מרווה וזהב הילה',
    icon: Sun,
    objectSizingDesc: 'מרווחי נשימה עמוקים, טיפוגרפיה רגועה ופורטל תמונה עגול מוקף טבעות הילה',
    buttonStyleDesc: 'כפתורי לוטוס עגולים עם שקיפות זכוכית ומעבר איטי והרמוני',
    colorPaletteDesc: 'ירוק מרווה (Sage), טורקיז עמוק, חול מדברי וזהב הילה',
    imagePlacementDesc: 'פורטל עגול מקודש בחלק העליון המרכזי מעל הכותרת הראשית',
    swatches: ['#0f766e', '#10b981', '#fbbf24', '#faf8f5'],
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'ה. פריסה חדה (ברוטליסטית ומדויקת)',
    subtitle: 'זוויות ישרות 90° ללא עיגול, מסגרות 2px וצללים קשים מוסטים',
    icon: Crosshair,
    objectSizingDesc: 'אובייקטים גיאומטריים חדים (0px Radius), רשת אדריכלית ברקע וטיפוגרפיה חותכת',
    buttonStyleDesc: 'כפתורים מלבניים חדים (Rounded None) עם צל מוסט קשיח ואפקט הזזה בלחיצה',
    colorPaletteDesc: 'שחור ולבן בניגודיות מקסימלית עם הדגשות אינדיגו חשמלי',
    imagePlacementDesc: 'פריסה אדריכלית חדה – תמונה ממוסגרת ב-90° בימין ומניפסט טקסט בשמאל',
    swatches: ['#050505', '#ffffff', '#6366f1', '#e2e8f0'],
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'ו. פריסה אנליטית (מבוססת נתונים ודיוק)',
    subtitle: 'גריד Bento טכנולוגי, מדדי KPI בזמן אמת ומסוף נתונים חי',
    icon: BarChart3,
    objectSizingDesc: 'קומפוזיציית דשבורד מדויקת המשלבת כרטיסי מדדים (KPIs) ותגיות מונוספייס',
    buttonStyleDesc: 'כפתורים טכנולוגיים מהודקים (Rounded XL) בגרדיאנט ציאן-כחול עם אייקון מגמה',
    colorPaletteDesc: 'כחול-צי עמוק, ציאן טלמטריה, ירוק אמרלד ורשת נקודות טכנית',
    imagePlacementDesc: 'מסוף נתונים (Analytics HUD) משמאל לטקסט עם סרגל חיווי חי',
    swatches: ['#06b6d4', '#2563eb', '#10b981', '#050b14'],
  },
];

export const HeroEditor: React.FC<{
  config: HeroSectionConfig;
  onChange: (updated: HeroSectionConfig) => void;
  onClose?: () => void;
}> = ({ config, onChange, onClose }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);
  const aiAssistant = getCapability<AiTextAssistantContract>('ai-assistant');
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  // Local state mirroring CRM Contact360Modal & PageSettingsDrawer
  const [formData, setFormData] = useState<HeroSectionConfig>({ ...config });
  const [initialData, setInitialData] = useState<HeroSectionConfig>({ ...config });

  // Exclusive Accordion state: closed by default, only 1 open at a time
  const [openSection, setOpenSection] = useState<HeroEditorAccordionSection | null>(null);
  const [openNestedSection, setOpenNestedSection] = useState<string | null>(null);
  const [hoveredLayoutId, setHoveredLayoutId] = useState<HeroLayoutPreset | null>(null);

  // Tenant Pages list for CTA button destination selector
  const [tenantPages, setTenantPages] = useState<PageBuilderConfig[]>([]);

  // AI loading per field
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);

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

  // Load tenant published pages
  useEffect(() => {
    let mounted = true;
    pageBuilderFirestore.getAllPages(db || null, tenantId)
      .then((pages) => {
        if (mounted && pages) {
          const published = pages.filter((p) => p.published !== false);
          published.sort((a, b) => {
            if (a.isHomePage) return -1;
            if (b.isHomePage) return 1;
            return (a.pageTitle || '').localeCompare(b.pageTitle || '');
          });
          setTenantPages(published);
        }
      })
      .catch((err) => {
        console.warn('[HeroEditor] Failed to load tenant pages:', err);
      });
    return () => {
      mounted = false;
    };
  }, [db, tenantId]);

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

  const toggleSection = (section: HeroEditorAccordionSection) => {
    setOpenSection((prev) => (prev === section ? null : section));
    setOpenNestedSection(null); // Reset nested accordion on main tab toggle
  };

  const toggleNestedSection = (id: string) => {
    setOpenNestedSection((prev) => (prev === id ? null : id));
  };

  // AI Text Enhancement with Agent Contract and Brand DNA
  const handleEnhanceTextWithAi = async (
    fieldKey: 'title' | 'subtitle' | 'description' | 'announcementBadge' | 'imageBadge',
    instruction: string
  ) => {
    if (!aiAssistant) {
      showNotification('סוכן ה-AI אינו זמין כעת');
      return;
    }
    let currentText = '';
    if (fieldKey === 'announcementBadge') {
      currentText = formData.announcementBadge?.text || '';
    } else if (fieldKey === 'imageBadge') {
      currentText = formData.imageBadge?.text || '';
    } else {
      currentText = (formData as any)[fieldKey] || '';
    }

    setAiLoadingField(fieldKey);
    try {
      const voiceHint = brandDna.voice?.powerWords?.slice(0, 3).join(', ') || '';
      const brandSummary = brandDna.identity?.slogan || brandDna.audience?.mainUvp || '';
      const res = await aiAssistant.enhanceText({
        originalText: currentText,
        instruction: `${instruction}. מילות כוח מותגיות: ${voiceHint}. תמצית מותג: ${brandSummary}. פנייה: ${brandDna.voice?.genderAddressing || 'direct'}.`,
        brandDna,
      });
      if (res && res.text) {
        if (fieldKey === 'announcementBadge') {
          updateField('announcementBadge', { ...(formData.announcementBadge || {}), text: res.text });
        } else if (fieldKey === 'imageBadge') {
          updateField('imageBadge', { ...(formData.imageBadge || {}), text: res.text });
        } else {
          updateField(fieldKey, res.text);
        }
        showNotification('הטקסט שופר בהצלחה באמצעות סוכן ה-AI של המותג');
      }
    } catch (err) {
      console.warn('[HeroEditor] AI Enhance failed:', err);
      showNotification('שגיאה בשיפור הטקסט עם AI');
    } finally {
      setAiLoadingField(null);
    }
  };

  // Updates both local state and live preview immediately
  const updateField = <K extends keyof HeroSectionConfig>(key: K, value: HeroSectionConfig[K]) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onChange(updated);
  };

  const updatePatch = (patch: Partial<HeroSectionConfig>) => {
    const updated = { ...formData, ...patch };
    setFormData(updated);
    onChange(updated);
  };

  const handleSelectLayout = (layoutDef: HeroLayoutDefinition) => {
    updatePatch({
      layout: layoutDef.id,
      objectScale: 'auto',
      buttonShape: 'auto',
      buttonSize: 'auto',
      imagePosition: 'auto',
    });
    showNotification(`הוחלה ${layoutDef.title}`);
  };

  const handleSave = (closeAfter = false) => {
    setIsSaving(true);
    try {
      onChange(formData);
      setInitialData({ ...formData });
      setShowUnsavedConfirm(false);
      showNotification('הגדרות אזור ההירו נשמרו בהצלחה');
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
    const slogan = brandDna.identity?.slogan || '';
    const uvp = brandDna.audience?.mainUvp || '';
    const updated: HeroSectionConfig = {
      ...formData,
      title: companyName && slogan ? `${companyName} – ${slogan}` : formData.title,
      subtitle: uvp || formData.subtitle,
      primaryButtonColor: brandDna.designTokens?.primaryColor || formData.primaryButtonColor,
    };
    setFormData(updated);
    onChange(updated);
    setIsBrandSynced(true);
    showNotification('אזור ההירו סונכרן עם נתוני ה-Brand DNA');
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  const normalizedActiveLayout: HeroLayoutPreset =
    !formData.layout || formData.layout === 'current' || formData.layout === 'fz' || formData.layout === 'spatial' || formData.layout === 'centered' || formData.layout === 'split'
      ? 'bento-hero'
      : formData.layout;

  const activeLayoutDef =
    HERO_LAYOUT_DEFINITIONS.find((d) => d.id === normalizedActiveLayout) || HERO_LAYOUT_DEFINITIONS[2];

  const tooltipLayoutDef =
    HERO_LAYOUT_DEFINITIONS.find((d) => d.id === hoveredLayoutId) || null;

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
      {/* 1. Header: Compact with Two-Letter Avatar Icon (HR), Title, Brand DNA Sync, and Save Icon (Mirrors Contact360Modal & PageSettingsDrawer) */}
      <div
        className={`flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        {/* Right: Connected Two-Letter Avatar Icon (HR) + Title */}
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none ${
              isDarkMode
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
            title="Hero Section Editor"
          >
            HR
          </div>

          <div className="truncate">
            <div
              className={`text-xs sm:text-sm font-black truncate leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              עיצוב והגדרות אזור הירו (Hero)
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

        {/* Left: Quick Actions (Brand DNA Sync, Save Icon in Header, Optional Close X) */}
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

      {/* 2. Icon Menu with Rich Tooltip for the 6 Hero Layouts ("תפריט אייקון עם טולטיפ") */}
      <div
        className={`p-2.5 mb-2.5 rounded-2xl border relative transition-all ${
          isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>תפריט אייקונים לבחירת סגנון פריסה (רחף מעל אייקון לפירוט העיצוב)</span>
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
          {HERO_LAYOUT_DEFINITIONS.map((def) => {
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
                <strong className="text-amber-500">צבעים: </strong>
                <span>{tooltipLayoutDef.colorPaletteDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">מיקום תמונה: </strong>
                <span>{tooltipLayoutDef.imagePlacementDesc}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Toast Notification */}
      {toastMessage && (
        <div className="mb-2 p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs text-center font-bold animate-fadeIn shrink-0">
          {toastMessage}
        </div>
      )}

      {/* 4. Accordion Tabs - Exact look & behavior of PageSettingsDrawer (SEO Modal) & Contact360Modal */}
      <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
        {/* TAB 1: סגנונות פריסה, גדלי אובייקטים ומיקום תמונות */}
        <div
          className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('layouts')}
            className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
              isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
              </div>
              <span>סוגי פריסה, גודל אובייקטים ומיקום תמונות (א-ו)</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                openSection === 'layouts' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'layouts' && (
            <div
              className={`p-3 border-t space-y-3 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <label className="text-[10px] font-bold text-amber-500 block">
                בחר סגנון פריסה לאזור ההירו (משנה אוטומטית גדלים, כפתורים, צבעים ומיקום תמונה)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {HERO_LAYOUT_DEFINITIONS.map((def) => {
                  const IconComp = def.icon;
                  const isSelected = normalizedActiveLayout === def.id;
                  return (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => handleSelectLayout(def)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                          : isDarkMode
                            ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <IconComp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-[11px] font-bold leading-tight">{def.title}</span>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {def.swatches.slice(0, 3).map((c, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full border border-white/20"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] opacity-80 leading-snug">{def.subtitle}</span>
                    </button>
                  );
                })}
              </div>

              {/* Object Scale & Image Position Fine-Tuning */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    גודל אובייקטים וטיפוגרפיה
                  </label>
                  <select
                    value={formData.objectScale || 'auto'}
                    onChange={(e) => updateField('objectScale', e.target.value as any)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-[#161616] border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי לפי סגנון הפריסה (מומלץ)</option>
                    <option value="compact">קומפקטי ועדין (Compact)</option>
                    <option value="normal">מאוזן ורגיל (Normal)</option>
                    <option value="large">גדול ובולט (Large)</option>
                    <option value="massive">ענק ודרמטי (Massive)</option>
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    מיקום התמונה ביחס לטקסט
                  </label>
                  <select
                    value={formData.imagePosition || 'auto'}
                    onChange={(e) => updateField('imagePosition', e.target.value as any)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-[#161616] border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי לפי סגנון הפריסה</option>
                    <option value="left">משמאל לטקסט (Split Left)</option>
                    <option value="right">מימין לטקסט (Split Right)</option>
                    <option value="top">מעל הטקסט במרכז (Top Portal)</option>
                    <option value="bottom">מתחת לטקסט במרכז (Bottom Showcase)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAB 2: רקע תמונה מאחורי הטקסט ואפקט עובר */}
        <div
          className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('text_bg')}
            className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
              isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>רקע תמונה מאחורי הטקסט ואפקט עובר</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                openSection === 'text_bg' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'text_bg' && (
            <div
              className={`p-3 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              {/* Toggle Enable Background Behind Text */}
              <div
                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">הפעל רקע של תמונה מאחורי הטקסט</span>
                  <span className="text-[10px] opacity-80">
                    מציג תמונת רקע עשירה עם שכבת מיסוך ואפקט אינטראקטיבי במעבר עכבר
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.textBgEnabled)}
                  onChange={(e) => updateField('textBgEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-transparent border-amber-500/60 cursor-pointer"
                />
              </div>

              {formData.textBgEnabled && (
                <>
                  {/* Scope Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">
                      היקף הרקע מאחורי הטקסט
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'text-card', label: 'תיבת הטקסט בלבד', desc: 'רקע ממוסגר ישירות מאחורי הטקסט' },
                        { id: 'full-section', label: 'כל אזור ההירו', desc: 'רקע מלא מאחורי כל האזור' },
                      ].map((sc) => {
                        const isSel = (formData.textBgScope || 'text-card') === sc.id;
                        return (
                          <button
                            key={sc.id}
                            type="button"
                            onClick={() => updateField('textBgScope', sc.id as any)}
                            className={`p-2 rounded-xl border text-right transition cursor-pointer flex flex-col gap-0.5 ${
                              isSel
                                ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                                : isDarkMode
                                  ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-[11px] font-bold">{sc.label}</span>
                            <span className="text-[9px] opacity-75">{sc.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hover Effect Selection ("אפקט עובר") */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">
                      סוג אפקט עובר במעבר עכבר (Hover & Transition Effect)
                    </label>
                    <select
                      value={formData.textBgEffect || 'zoom-glow'}
                      onChange={(e) => updateField('textBgEffect', e.target.value as HeroTextBgEffect)}
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-[#161616] border-amber-500/60 text-white'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    >
                      <option value="zoom-glow">זום קולנועי רך והילה זוהרת (Zoom & Glow)</option>
                      <option value="shimmer-sweep">אלומת אור חולפת על פני הרקע (Shimmer Sweep)</option>
                      <option value="float-parallax">ריחוף פרלקסה ותנועת עומק (Float Parallax)</option>
                      <option value="blur-reveal">מיקוד וחדות הדרגתית מטשטוש (Blur Reveal)</option>
                      <option value="gradient-shift">מעבר צבעי גרדיאנט דינמי (Gradient Shift)</option>
                    </select>
                  </div>

                  {/* Background Image Upload */}
                  <div className="space-y-0.5">
                    <PageBuilderImageUpload
                      label="תמונת רקע מאחורי הטקסט (אם ריק – ישתמש בתמונת ההירו הראשית)"
                      value={formData.textBgImageUrl || ''}
                      onChange={(url) => updateField('textBgImageUrl', url)}
                    />
                  </div>

                  {/* Overlay Color & Opacity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <PageBuilderColorPicker
                        label="צבע שכבת הרקע (Overlay)"
                        value={formData.textBgOverlayColor || '#0f172a'}
                        onChange={(c) => updateField('textBgOverlayColor', c)}
                      />
                    </div>
                    <div className="space-y-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-amber-500">
                          אטימות שכבת הרקע
                        </label>
                        <span className="text-[11px] font-mono font-bold text-amber-400">
                          {formData.textBgOverlayOpacity ?? 70}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={95}
                        step={5}
                        value={formData.textBgOverlayOpacity ?? 70}
                        onChange={(e) => updateField('textBgOverlayOpacity', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* TAB 3: כותרות, טקסטים, תגית הכרזה וטיפוגרפיה (Content) */}
        <div
          className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('content')}
            className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
              isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
              </div>
              <span>כותרות, תיאור, תגית הכרזה וטיפוגרפיה</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                openSection === 'content' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'content' && (
            <div
              className={`p-3 border-t space-y-3 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              {/* Nested Accordion 1: Text Fields with AI Assist (Icons & Tooltips) */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleNestedSection('text_fields')}
                  className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                  title="עריכת טקסטים ושיפור עם סוכן ה-AI"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>טקסטים ושדות תוכן (עם סוכן AI)</span>
                  </span>
                  <ChevronDown
                    className={clsx(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      openNestedSection === 'text_fields' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
                    )}
                  />
                </button>

                {openNestedSection === 'text_fields' && (
                  <div className="p-3 border-t border-white/10 space-y-2.5 bg-black/20">
                    {/* Title field with AI */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-amber-500 block">
                          כותרת ראשית של העמוד (H1)
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={formData.title || ''}
                          onChange={(e) => updateField('title', e.target.value)}
                          placeholder="כותרת ראשית בולטת..."
                          className={`flex-1 border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode
                              ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                              : 'bg-white border-amber-500/60 text-slate-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleEnhanceTextWithAi('title', 'נסח כותרת ראשית שיווקית חדה וסוחפת')}
                          className="p-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition shrink-0"
                          title="שפר כותרת באמצעות סוכן ה-AI של המותג"
                        >
                          {aiLoadingField === 'title' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Subtitle field with AI */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-500 block">
                        תת-כותרת מודגשת (Subtitle)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={formData.subtitle || ''}
                          onChange={(e) => updateField('subtitle', e.target.value)}
                          placeholder="משפט מיקוד קצר..."
                          className={`flex-1 border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode
                              ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                              : 'bg-white border-amber-500/60 text-slate-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleEnhanceTextWithAi('subtitle', 'נסח תת-כותרת שיווקית חזקה וסוחפת המביעה את עיקר הערך')}
                          className="p-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition shrink-0"
                          title="שפר תת-כותרת באמצעות סוכן ה-AI של המותג"
                        >
                          {aiLoadingField === 'subtitle' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Description field with AI */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-500 block">
                        פסקת תיאור והסבר
                      </label>
                      <div className="flex items-start gap-1.5">
                        <textarea
                          rows={2}
                          value={formData.description || ''}
                          onChange={(e) => updateField('description', e.target.value)}
                          placeholder="תיאור מפורט..."
                          className={`flex-1 border rounded-xl p-2 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none ${
                            isDarkMode
                              ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                              : 'bg-white border-amber-500/60 text-slate-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleEnhanceTextWithAi('description', 'נסח פסקת תיאור מנצחת ומשכנעת לאזור ההירו המותאמת לשפת המותג')}
                          className="p-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition shrink-0 mt-1"
                          title="שפר תיאור באמצעות סוכן ה-AI של המותג"
                        >
                          {aiLoadingField === 'description' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Announcement Badge with AI */}
                    <div className="space-y-0.5 pt-1">
                      <label className="text-[10px] font-bold text-amber-500 block">
                        תגית הכרזה עליונה (Announcement Pill)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={formData.announcementBadge?.text || ''}
                          onChange={(e) =>
                            updateField('announcementBadge', {
                              ...(formData.announcementBadge || {}),
                              text: e.target.value,
                            })
                          }
                          placeholder="למשל: שחרור רשמי 2026"
                          className={`flex-1 border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode
                              ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                              : 'bg-white border-amber-500/60 text-slate-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleEnhanceTextWithAi('announcementBadge', 'נסח תגית הכרזה קצרה ומושכת תשומת לב')}
                          className="p-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition shrink-0"
                          title="שפר תגית באמצעות סוכן ה-AI של המותג"
                        >
                          {aiLoadingField === 'announcementBadge' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-500 block">
                        קישור התגית (URL / עוגן)
                      </label>
                      <input
                        type="text"
                        value={formData.announcementBadge?.url || ''}
                        onChange={(e) =>
                          updateField('announcementBadge', {
                            ...(formData.announcementBadge || { text: 'חדש' }),
                            url: e.target.value,
                          })
                        }
                        placeholder="#about"
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

              {/* Nested Accordion 2: Typography & Alignment Controls (Icons & Tooltips ONLY) */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleNestedSection('typography')}
                  className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                  title="שליטה מלאה בגודל, משקל ויישור פונטים"
                >
                  <span className="flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-indigo-400" />
                    <span>עריכת פונטים וטיפוגרפיה (אייקונים וטולטיפים בלבד)</span>
                  </span>
                  <ChevronDown
                    className={clsx(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      openNestedSection === 'typography' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
                    )}
                  />
                </button>

                {openNestedSection === 'typography' && (
                  <div className="p-3 border-t border-white/10 space-y-3 bg-black/20">
                    {/* Alignments & Font Weights Toolbar (Icons with Tooltips) */}
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      {/* Alignment Toolbar */}
                      <div className="flex items-center gap-1 border border-white/10 p-1 rounded-xl bg-white/5">
                        <button
                          type="button"
                          onClick={() => updateField('titleAlignment', 'right')}
                          className={clsx(
                            'p-1.5 rounded-lg cursor-pointer transition',
                            (formData.titleAlignment || 'right') === 'right' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                          )}
                          title="יישור לימין"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField('titleAlignment', 'center')}
                          className={clsx(
                            'p-1.5 rounded-lg cursor-pointer transition',
                            (formData.titleAlignment || 'right') === 'center' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                          )}
                          title="יישור למרכז"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField('titleAlignment', 'left')}
                          className={clsx(
                            'p-1.5 rounded-lg cursor-pointer transition',
                            (formData.titleAlignment || 'right') === 'left' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                          )}
                          title="יישור לשמאל"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Font Weight Toolbar */}
                      <div className="flex items-center gap-1 border border-white/10 p-1 rounded-xl bg-white/5">
                        <button
                          type="button"
                          onClick={() => updateField('titleFontWeight', formData.titleFontWeight === 'black' ? 'bold' : 'black')}
                          className={clsx(
                            'p-1.5 rounded-lg cursor-pointer transition',
                            formData.titleFontWeight === 'black' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                          )}
                          title="עובי כותרת ענק (Black / Ultra Bold)"
                        >
                          <Bold className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField('titleFontWeight', formData.titleFontWeight === 'bold' ? 'normal' : 'bold')}
                          className={clsx(
                            'p-1.5 rounded-lg cursor-pointer transition',
                            (!formData.titleFontWeight || formData.titleFontWeight === 'bold') ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                          )}
                          title="עובי כותרת רגיל-מודגש (Bold)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Font Size Scales */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold">
                        <span>גודל כותרת ראשית (Scale)</span>
                        <span className="font-mono">{formData.titleFontSize || 'auto'}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(['auto', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => updateField('titleFontSize', sz)}
                            className={clsx(
                              'px-2 py-1 rounded-lg border text-[10px] cursor-pointer transition font-mono',
                              (formData.titleFontSize || 'auto') === sz
                                ? 'bg-amber-500 border-amber-400 text-black font-bold'
                                : 'border-white/10 text-zinc-400 hover:text-white'
                            )}
                            title={`גודל כותרת ${sz}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold">
                        <span>גודל פסקת תיאור</span>
                        <span className="font-mono">{formData.descriptionFontSize || 'auto'}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(['auto', 'sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => updateField('descriptionFontSize', sz)}
                            className={clsx(
                              'px-2 py-1 rounded-lg border text-[10px] cursor-pointer transition font-mono',
                              (formData.descriptionFontSize || 'auto') === sz
                                ? 'bg-amber-500 border-amber-400 text-black font-bold'
                                : 'border-white/10 text-zinc-400 hover:text-white'
                            )}
                            title={`גודל תיאור ${sz}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TAB 4: כפתורי הנעה לפעולה (CTAs, צורה, גודל וחיבור לקולקציית עמודי הטננט) */}
        <div
          className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('buttons')}
            className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
              isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5" />
              </div>
              <span>כפתורי הנעה לפעולה (צורה, גודל וחיבור לעמודי טננט)</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                openSection === 'buttons' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'buttons' && (
            <div
              className={`p-3 border-t space-y-3 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-between p-2 rounded-xl border ${
                  isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-medium">הצג כפתורי פעולה (CTAs)</span>
                <input
                  type="checkbox"
                  checked={formData.buttonsVisible ?? true}
                  onChange={(e) => updateField('buttonsVisible', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-transparent border-amber-500/60 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">צורת הכפתורים</label>
                  <select
                    value={formData.buttonShape || 'auto'}
                    onChange={(e) => updateField('buttonShape', e.target.value as any)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-[#161616] border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי לפי סגנון הפריסה</option>
                    <option value="pill">קפסולה עגולה (Pill - נשי/רוחני)</option>
                    <option value="rounded">מעוגל מודרני (Rounded 2XL - עכשווי)</option>
                    <option value="chiseled">מסותת סמכותי (Chiseled - גברי/אנליטי)</option>
                    <option value="sharp">חד 90° (Sharp - ברוטליסטי)</option>
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">גודל הכפתורים</label>
                  <select
                    value={formData.buttonSize || 'auto'}
                    onChange={(e) => updateField('buttonSize', e.target.value as any)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-[#161616] border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי לפי סגנון הפריסה</option>
                    <option value="sm">קומפקטי (Small)</option>
                    <option value="md">בינוני (Medium)</option>
                    <option value="lg">גדול (Large)</option>
                    <option value="xl">ענק ודומיננטי (Extra Large)</option>
                  </select>
                </div>
              </div>

              {/* Primary Button Settings + Tenant Pages Selector */}
              <div
                className={`p-2.5 rounded-xl border space-y-2 ${
                  isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3" />
                    <span>כפתור ראשי (Primary CTA)</span>
                  </label>
                  <span className="text-[9px] text-zinc-400">קישור ישיר לעמוד טננט</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <input
                      type="text"
                      value={formData.primaryButton?.text || ''}
                      onChange={(e) =>
                        updateField('primaryButton', {
                          ...(formData.primaryButton || { url: '#' }),
                          text: e.target.value,
                        })
                      }
                      placeholder="טקסט כפתור (למשל: התחל עכשיו)"
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Tenant Published Pages Selector */}
                  <div className="space-y-0.5">
                    <select
                      value={formData.primaryButton?.url || ''}
                      onChange={(e) =>
                        updateField('primaryButton', {
                          ...(formData.primaryButton || { text: 'התחל' }),
                          url: e.target.value,
                        })
                      }
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-[#181818] border-amber-500/60 text-white'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    >
                      <option value="">-- בחר יעד מעמודי הטננט --</option>
                      {tenantPages.map((page) => {
                        const targetUrl = page.isHomePage ? '/' : `/${page.slug || page.pageId}`;
                        return (
                          <option key={page.pageId} value={targetUrl}>
                            📄 {page.pageTitle} {page.isHomePage ? '(דף הבית)' : `(${targetUrl})`}
                          </option>
                        );
                      })}
                      <option value="#contact">⚓ טופס יצירת קשר (#contact)</option>
                      <option value="#about">⚓ אודות (#about)</option>
                      <option value="#services">⚓ שירותים (#services)</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.primaryButton?.url || ''}
                  onChange={(e) =>
                    updateField('primaryButton', {
                      ...(formData.primaryButton || { text: 'התחל' }),
                      url: e.target.value,
                    })
                  }
                  placeholder="או הזן כתובת URL מותאמת אישית (למשל: https://...)"
                  dir="ltr"
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-white/10 text-zinc-300 placeholder-zinc-600'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                />
              </div>

              {/* Secondary Button Settings + Tenant Pages Selector */}
              <div
                className={`p-2.5 rounded-xl border space-y-2 ${
                  isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3" />
                    <span>כפתור משני (Secondary CTA)</span>
                  </label>
                  <span className="text-[9px] text-zinc-400">קישור ישיר לעמוד טננט</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <input
                      type="text"
                      value={formData.secondaryButton?.text || ''}
                      onChange={(e) =>
                        updateField('secondaryButton', {
                          ...(formData.secondaryButton || { url: '#' }),
                          text: e.target.value,
                        })
                      }
                      placeholder="טקסט כפתור (למשל: לפרטים נוספים)"
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Tenant Published Pages Selector */}
                  <div className="space-y-0.5">
                    <select
                      value={formData.secondaryButton?.url || ''}
                      onChange={(e) =>
                        updateField('secondaryButton', {
                          ...(formData.secondaryButton || { text: 'פרטים' }),
                          url: e.target.value,
                        })
                      }
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-[#181818] border-amber-500/60 text-white'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    >
                      <option value="">-- בחר יעד מעמודי הטננט --</option>
                      {tenantPages.map((page) => {
                        const targetUrl = page.isHomePage ? '/' : `/${page.slug || page.pageId}`;
                        return (
                          <option key={page.pageId} value={targetUrl}>
                            📄 {page.pageTitle} {page.isHomePage ? '(דף הבית)' : `(${targetUrl})`}
                          </option>
                        );
                      })}
                      <option value="#about">⚓ אודות (#about)</option>
                      <option value="#pricing">⚓ מחירים וחבילות (#pricing)</option>
                      <option value="#faq">⚓ שאלות ותשובות (#faq)</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.secondaryButton?.url || ''}
                  onChange={(e) =>
                    updateField('secondaryButton', {
                      ...(formData.secondaryButton || { text: 'פרטים' }),
                      url: e.target.value,
                    })
                  }
                  placeholder="או הזן כתובת URL מותאמת אישית (למשל: https://...)"
                  dir="ltr"
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-white/10 text-zinc-300 placeholder-zinc-600'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* TAB 5: תמונת Showcase, תגית צפה והוכחה חברתית (Media & Showcase) */}
        <div
          className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('media_metrics')}
            className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
              isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
              <span>תמונת Showcase, תגית צפה והוכחה חברתית</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                openSection === 'media_metrics' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'media_metrics' && (
            <div
              className={`p-3 border-t space-y-3 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <PageBuilderImageUpload
                label="תמונת Showcase ראשית של ההירו (בחירה מ-KOSCLOUD)"
                value={formData.imageSrc}
                onChange={(url) => updateField('imageSrc', url)}
              />

              {/* Floating Image Badge (pill on top/bottom of image frame) with AI */}
              <div
                className={`p-2.5 rounded-xl border space-y-2 ${
                  isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>תגית צפה על גבי התמונה (Image Floating Badge)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.imageBadge?.visible ?? true}
                    onChange={(e) =>
                      updateField('imageBadge', {
                        ...(formData.imageBadge || { text: 'עיצוב בוטיק מותאם אישית' }),
                        visible: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500 bg-transparent border-amber-500/60 cursor-pointer"
                  />
                </div>

                {formData.imageBadge?.visible !== false && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={formData.imageBadge?.text || ''}
                        onChange={(e) =>
                          updateField('imageBadge', {
                            ...(formData.imageBadge || { visible: true }),
                            text: e.target.value,
                          })
                        }
                        placeholder="טקסט התגית הצפה (למשל: עיצוב בוטיק מותאם אישית)..."
                        className={`flex-1 border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode
                            ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                            : 'bg-white border-amber-500/60 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleEnhanceTextWithAi('imageBadge', 'נסח תגית צפה קצרה, יוקרתית וממוקדת עבור תמונת ההירו')}
                        className="p-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition shrink-0"
                        title="שפר תגית צפה עם סוכן AI"
                      >
                        {aiLoadingField === 'imageBadge' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Proof Avatars */}
              <div
                className={`flex items-center justify-between p-2 rounded-xl border ${
                  isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-medium">הצג שורת הוכחה חברתית ודירוג כוכבים</span>
                <input
                  type="checkbox"
                  checked={formData.socialProofAvatars?.visible ?? true}
                  onChange={(e) =>
                    updateField('socialProofAvatars', {
                      avatars: formData.socialProofAvatars?.avatars || [],
                      starsCount: formData.socialProofAvatars?.starsCount || 5,
                      ratingText: formData.socialProofAvatars?.ratingText || 'מדורג 4.9/5 על ידי לקוחותינו',
                      visible: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-amber-500 bg-transparent border-amber-500/60 cursor-pointer"
                />
              </div>

              {formData.socialProofAvatars?.visible && (
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">טקסט דירוג והוכחה חברתית</label>
                  <input
                    type="text"
                    value={formData.socialProofAvatars?.ratingText || ''}
                    onChange={(e) =>
                      updateField('socialProofAvatars', {
                        ...(formData.socialProofAvatars || { visible: true, avatars: [] }),
                        ratingText: e.target.value,
                      })
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* TAB 6: צבעים, טיפוגרפיה ומזהה עוגן (Colors & Anchor) */}
        <div
          className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
              isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
              </div>
              <span>צבעים מותאמים אישית ומזהה עוגן</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                openSection === 'colors' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'colors' && (
            <div
              className={`p-3 border-t space-y-2 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <PageBuilderColorPicker
                label="צבע כותרת ראשית (H1)"
                value={formData.titleColor || '#ffffff'}
                onChange={(c) => updateField('titleColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע טקסט תיאור"
                value={formData.descriptionColor || '#cbd5e1'}
                onChange={(c) => updateField('descriptionColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע כפתור ראשי"
                value={formData.primaryButtonColor || '#6366f1'}
                onChange={(c) => updateField('primaryButtonColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כללי לאזור"
                value={formData.backgroundColor || 'transparent'}
                onChange={(c) => updateField('backgroundColor', c)}
              />

              <div className="space-y-0.5 pt-1">
                <label className="text-[10px] font-bold text-amber-500 block">מזהה עוגן (Anchor ID)</label>
                <input
                  type="text"
                  value={formData.anchorId || 'hero'}
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

      {/* 5. Footer: Compact Bottom Actions (Mirrors PageSettingsDrawer & Contact360Modal) */}
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
