import React, { useState, useEffect, useMemo } from 'react';
import {
  TimerSectionConfig,
  TimerLayoutPreset,
  TimerBoxShape,
  TimerUnitsDirection,
  HeroTextBgEffect,
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
  Sparkles,
  Palette,
  LayoutTemplate,
  CheckCircle2,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Layers,
  Wand2,
  Info,
  Clock,
  ArrowRightLeft,
  Calendar,
  Square,
  Flower2,
  Compass,
  Check,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

export type TimerEditorAccordionSection =
  | 'layouts'
  | 'text_bg'
  | 'content'
  | 'shapes'
  | 'colors';

interface TimerLayoutDefinition {
  id: TimerLayoutPreset;
  letter: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  defaultShape: TimerBoxShape;
  shapeName: string;
  objectSizingDesc: string;
  buttonStyleDesc: string;
  colorPaletteDesc: string;
  cardStyleDesc: string;
  swatches: string[];
}

export const TIMER_LAYOUT_DEFINITIONS: TimerLayoutDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'א. פריסה בסגנון נשי (רכה, אלגנטית ומזמינה)',
    subtitle: 'תיבות זמן מעוצבות כפרח פורח או לב רומנטי, פלטת רוז-גולד ושמנת, זוהר עדין וטיפוגרפיה מעודנת',
    icon: Heart,
    defaultShape: 'flower',
    shapeName: 'פרח פורח / לב רומנטי',
    objectSizingDesc: 'תיבות זמן בצורת עלי כותרת מעוגלים, מרווחים אווריריים וזוהר הילה ורדרד',
    buttonStyleDesc: 'כפתורי קפסולה מלאים (Rounded Full) בגרדיאנט ורוד-רוז רך עם מעבר עדין',
    colorPaletteDesc: 'ורוד פודרה, שמנת חמה, רוז-גולד, שמפניה וזהב מעודן',
    cardStyleDesc: 'כרטיסים בצורת פרח/לב עם ספרות מוזהבות והילת אור רכה',
    swatches: ['#f43f5e', '#fb7185', '#fde68a', '#fff1f2'],
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'ב. פריסה בסגנון גברי (עוצמתית, דומיננטית וטקטית)',
    subtitle: 'תיבות זמן בצורת מגן טקטי פלדה, כותרות ענק מודגשות, פחם כהה, זהב מתכתי וגבולות 2px כפולים',
    icon: Shield,
    defaultShape: 'shield',
    shapeName: 'מגן טקטי מסיבי',
    objectSizingDesc: 'תיבות מגן גיאומטריות רחבות, ספרות ענק בולטות (Font Black) ונוכחות מרשימה',
    buttonStyleDesc: 'כפתורים רחבים מסותתים (Rounded LG) עם גבול כפול מודגש בזהב ענבר',
    colorPaletteDesc: 'שחור-אוניקס, אפור פחם, זהב-ענבר מתכתי וכחול פלדה כהה',
    cardStyleDesc: 'תיבות מגן פלדה מחושלות עם גבול מתכתי כפול וספרות ענק מוארות',
    swatches: ['#090a0f', '#f59e0b', '#27272a', '#3b82f6'],
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (סגנון Notion SaaS 2026)',
    subtitle: 'סקוורקל מעוגל 3XL נקי ומאוזן, אינדיגו וסגול מודרניים, צללים רכים ואווירת Mesh Glow',
    icon: LayoutTemplate,
    defaultShape: 'rounded',
    shapeName: 'סקוורקל מעוגל 3XL',
    objectSizingDesc: 'תיבות Notion SaaS מעוגלות (Rounded 3XL), ספרות מונוספייס חדות ומרווחים שקולים',
    buttonStyleDesc: 'כפתורים מעוגלים מודרניים (Rounded XL) באינדיגו ואמרלד עם צל רך',
    colorPaletteDesc: 'אינדיגו מודרני, סגול עדין, לבן, סלייט וניגודיות שקופה אלגנטית',
    cardStyleDesc: 'כרטיסים מאוזנים עם מסגרת זכוכית עדינה וצל עמוק רך',
    swatches: ['#6366f1', '#a855f7', '#0f172a', '#f8fafc'],
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'ד. פריסה רוחנית (הרמונית, שלווה ומעוררת השראה)',
    subtitle: 'תיבות זמן בצורת עלי לוטוס קדוש, ירוק מרווה, טורקיז עמוק, זהב הילה ומעברים איטיים ורגועים',
    icon: Sun,
    defaultShape: 'lotus',
    shapeName: 'לוטוס קדוש הרמוני',
    objectSizingDesc: 'תיבות לוטוס הרמוניות עם מרווחי נשימה עמוקים וטיפוגרפיה רגועה',
    buttonStyleDesc: 'כפתורי לוטוס הרמוניים עם שקיפות זכוכית ומעברי צבע איטיים ושלווים',
    colorPaletteDesc: 'ירוק מרווה (Sage), טורקיז עמוק, חול מדברי וזהב הילה זוהר בעדינות',
    cardStyleDesc: 'כרטיסי לוטוס מעוצבים עם קווי מתאר מעודנים והילה עוטפת',
    swatches: ['#0f766e', '#10b981', '#fbbf24', '#faf8f5'],
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'ה. פריסה חדה (ברוטליסטית, טכנית ומדויקת)',
    subtitle: 'תיבות מלבן חד 90° ללא שום עיגול, מסגרת 2px מוצקה, צל מוסט קשיח 5px וטיפוגרפיה חותכת',
    icon: Crosshair,
    defaultShape: 'sharp',
    shapeName: 'מלבן חד 90° ברוטליסטי',
    objectSizingDesc: 'אובייקטים גיאומטריים חדים (0px Radius), מסגרות 2px מודגשות וספרות מונוספייס',
    buttonStyleDesc: 'כפתורים מלבניים חדים (Rounded None) עם צל קשיח מוסט ואפקט לחיצה חותך',
    colorPaletteDesc: 'שחור ולבן בניגודיות מקסימלית עם הדגשות אינדיגו חשמלי',
    cardStyleDesc: 'תיבות מלבניות חדות 90° עם מסגרת 2px שחורה/לבנה וצל מוסט קשיח',
    swatches: ['#050505', '#ffffff', '#6366f1', '#e2e8f0'],
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'ו. פריסה אנליטית (מסוף HUD טכנולוגי ודיוק מדדי)',
    subtitle: 'תיבות זמן עם חיתוכי זוויות 45° chamfered, ציאן-כחול טלמטריה, רשת נקודות וחיווי סטטוס מדדי חי',
    icon: Activity,
    defaultShape: 'hud',
    shapeName: 'מסוף HUD חתוך זוויות 45°',
    objectSizingDesc: 'תיבות HUD טכנולוגיות עם זוויות חתוכות 45°, תגיות טלמטריה ומדדי זמן חיים',
    buttonStyleDesc: 'כפתורים טכנולוגיים מהודקים (Rounded XL) בגרדיאנט ציאן-כחול עם חיווי סטטוס',
    colorPaletteDesc: 'כחול-צי עמוק, ציאן טלמטריה, ירוק אמרלד של זמינות ורשת נקודות',
    cardStyleDesc: 'תיבות HUD מנוקבות זוויות עם סוגרי פינה מוארים וספרות דיגיטליות',
    swatches: ['#06b6d4', '#2563eb', '#10b981', '#050b14'],
  },
];

export const TIMER_SHAPE_OPTIONS: Array<{
  id: TimerBoxShape;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'auto',
    label: 'אוטומטי (לפי הפריסה)',
    description: 'מותאם אוטומטית לפי סגנון הפריסה הנבחר',
    icon: Wand2,
  },
  {
    id: 'flower',
    label: 'פרח פורח (Flower)',
    description: 'עלי כותרת מעוגלים יפהפיים לסגנון נשי או בוטיקי',
    icon: Flower2,
  },
  {
    id: 'heart',
    label: 'לב רומנטי (Heart)',
    description: 'קימורי לב אלגנטיים להשקות רומנטיות, אירועים ומתנות',
    icon: Heart,
  },
  {
    id: 'shield',
    label: 'מגן טקטי (Shield)',
    description: 'מגן פלדה מסיבי ועוצמתי לסגנון גברי או ביטחוני',
    icon: Shield,
  },
  {
    id: 'lotus',
    label: 'לוטוס קדוש (Lotus)',
    description: 'הרמוניה ושלווה גיאומטרית מזרחית לסגנון רוחני',
    icon: Sun,
  },
  {
    id: 'sharp',
    label: 'מלבן חד 90° (Sharp Brutalist)',
    description: 'זוויות ישרות חותכות עם צל קשיח מוסט',
    icon: Crosshair,
  },
  {
    id: 'hud',
    label: 'מסוף HUD טכנולוגי (HUD Chamfered)',
    description: 'חיתוכי זוויות 45° ואינדיקטורים דיגיטליים',
    icon: Activity,
  },
  {
    id: 'rounded',
    label: 'סקוורקל מעוגל 3XL (Rounded Modern)',
    description: 'Notion SaaS 2026 קפסולה עכשווית נקייה ומאוזנת',
    icon: Square,
  },
];

interface TimerEditorProps {
  config: TimerSectionConfig;
  onChange: (updated: TimerSectionConfig) => void;
  onClose?: () => void;
}

export const TimerEditor: React.FC<TimerEditorProps> = ({ config, onChange, onClose }) => {
  const { getCapability } = useHostCapabilities();
  const brandDnaCap = getCapability<BrandDnaContract>('brandDna');

  const [formData, setFormData] = useState<TimerSectionConfig>({
    ...config,
    title: config.title || 'הספירה לאחור החלה',
    subtitle: config.subtitle || 'אל תפספסו את ההזדמנות',
    targetDate: config.targetDate || '2026-12-31T23:59:59',
    layout: config.layout || 'standard',
    timeUnitsDirection: config.timeUnitsDirection || 'rtl',
    boxShape: config.boxShape || 'auto',
    objectScale: config.objectScale || 'normal',
    buttonShape: config.buttonShape || 'rounded',
    buttonSize: config.buttonSize || 'md',
    showCtaButton: config.showCtaButton ?? true,
    ctaText: config.ctaText || 'הבטיחו את מקומכם עכשיו',
    ctaUrl: config.ctaUrl || '#contact',
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layouts: true,
  });
  const [hoveredLayoutId, setHoveredLayoutId] = useState<TimerLayoutPreset | null>(null);
  const [hoveredShapeId, setHoveredShapeId] = useState<TimerBoxShape | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  useEffect(() => {
    setFormData({
      ...config,
      title: config.title || 'הספירה לאחור החלה',
      subtitle: config.subtitle || 'אל תפספסו את ההזדמנות',
      targetDate: config.targetDate || '2026-12-31T23:59:59',
      layout: config.layout || 'standard',
      timeUnitsDirection: config.timeUnitsDirection || 'rtl',
      boxShape: config.boxShape || 'auto',
      objectScale: config.objectScale || 'normal',
      buttonShape: config.buttonShape || 'rounded',
      buttonSize: config.buttonSize || 'md',
      showCtaButton: config.showCtaButton ?? true,
      ctaText: config.ctaText || 'הבטיחו את מקומכם עכשיו',
      ctaUrl: config.ctaUrl || '#contact',
    });
  }, [config]);

  // Dirty check
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(config);
  }, [formData, config]);

  const update = <K extends keyof TimerSectionConfig>(field: K, value: TimerSectionConfig[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: TimerEditorAccordionSection) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    onChange(formData);
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage('השינויים נשמרו בהצלחה!');
      setTimeout(() => setToastMessage(null), 3000);
    }, 250);
  };

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else if (onClose) {
      onClose();
    }
  };

  const handleSyncBrandDna = async () => {
    if (!brandDnaCap) {
      setToastMessage('שירות Brand DNA אינו זמין כעת');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    try {
      const dna = await brandDnaCap.getBrandDna();
      if (dna) {
        const company = dna.identity?.companyName || '';
        const slogan = dna.identity?.slogan || '';
        const phone = dna.trust?.contactPhone || '';
        const whatsapp = dna.trust?.whatsappSupportNumber || phone;

        setFormData((prev) => ({
          ...prev,
          title: company ? `הספירה לאחור של ${company} החלה` : prev.title,
          subtitle: slogan || prev.subtitle,
          ctaText: prev.ctaText || 'שריינו מקום עכשיו',
          ctaUrl: whatsapp
            ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`שלום, אני פונה לגבי ההשקה של ${company}`)}`
            : prev.ctaUrl || '#contact',
        }));

        setIsBrandSynced(true);
        setToastMessage(`סונכרן בהצלחה עם ה-DNA של ${company || 'המותג'}!`);
        setTimeout(() => {
          setIsBrandSynced(false);
          setToastMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to sync brand DNA:', err);
      setToastMessage('שגיאה בסנכרון עם Brand DNA');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Quick target date helpers
  const setQuickDate = (hoursToAdd: number) => {
    const d = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
    const isoString = d.toISOString().slice(0, 16);
    update('targetDate', isoString);
    setToastMessage(`התאריך עודכן לעוד ${Math.round(hoursToAdd / 24) || hoursToAdd} ${hoursToAdd >= 24 ? 'ימים' : 'שעות'}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const setYearEndDate = () => {
    const currentYear = new Date().getFullYear();
    const endOfYear = `${currentYear}-12-31T23:59`;
    update('targetDate', endOfYear);
    setToastMessage(`התאריך עודכן לסוף שנה (${currentYear})`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const currentLayoutDef = useMemo(() => {
    const active = formData.layout || 'standard';
    return (
      TIMER_LAYOUT_DEFINITIONS.find((l) => l.id === active) ||
      TIMER_LAYOUT_DEFINITIONS[2] // standard
    );
  }, [formData.layout]);

  const activeShape = formData.boxShape || 'auto';
  const resolvedShape = activeShape === 'auto' ? currentLayoutDef.defaultShape : activeShape;

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all duration-300 relative text-right"
      dir="rtl"
      style={{ fontFamily: "'Heebo', sans-serif" }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-amber-600/95 text-white text-xs sm:text-sm px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-amber-500/20 ring-1 ring-white/20">
            TM
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
              <span>טיימר ספירה לאחור 2.0</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                PRO
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              6 פריסות מותג • צורות מיוחדות לתיבות • סדר ימים מותאם
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Brand DNA Sync */}
          {brandDnaCap && (
            <button
              type="button"
              onClick={handleSyncBrandDna}
              title="סנכרן כותרות ותאריכים מ-Brand DNA של המותג"
              className={`p-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1 border ${
                isBrandSynced
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-500'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isBrandSynced ? 'animate-spin' : 'text-amber-500'}`} />
              <span className="hidden sm:inline text-xs">סנכרון DNA</span>
            </button>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
              isDirty
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/25 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ring-2 ring-amber-400/30 animate-pulse'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'שומר...' : isDirty ? 'שמור שינויים' : 'שמור'}</span>
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="סגור חלונית עריכה"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ICON MENU TOOLBAR WITH RICH HOVER TOOLTIP (ICON ONLY) */}
      <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-around gap-1">
        {[
          {
            id: 'layouts' as TimerEditorAccordionSection,
            icon: LayoutTemplate,
            label: 'פריסות וסגנון',
            badge: currentLayoutDef.shortLabel,
          },
          {
            id: 'text_bg' as TimerEditorAccordionSection,
            icon: Layers,
            label: 'רקע תמונה',
            badge: formData.textBgEnabled ? 'פעיל' : undefined,
          },
          {
            id: 'content' as TimerEditorAccordionSection,
            icon: Clock,
            label: 'תאריך יעד והנעה',
            badge: formData.targetDate ? formData.targetDate.slice(0, 10) : undefined,
          },
          {
            id: 'shapes' as TimerEditorAccordionSection,
            icon: Flower2,
            label: 'צורות תיבות וסדר',
            badge: activeShape === 'auto' ? 'אוטומטי' : activeShape,
          },
          {
            id: 'colors' as TimerEditorAccordionSection,
            icon: Palette,
            label: 'צבעים ועוגן',
          },
        ].map((item) => {
          const isOpen = Boolean(openSections[item.id]);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleSection(item.id)}
              className={`relative group p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                isOpen
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm border border-slate-200/80 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />

              {/* Rich Floating Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center gap-1.5">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE LAYOUT SUMMARY CARD */}
      <div className="mx-3 my-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            {React.createElement(currentLayoutDef.icon, { className: 'w-4 h-4' })}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>{currentLayoutDef.shortLabel}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">
                צורת ברירת מחדל: {currentLayoutDef.shapeName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              סדר היחידות: {formData.timeUnitsDirection === 'ltr' ? 'משמאל לימין (ימים בצד שמאל)' : 'מימין לשמאל (ימים בצד ימין)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {currentLayoutDef.swatches.map((color, idx) => (
            <span
              key={idx}
              className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800 shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* ACCORDION CONTENT BODY */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3 max-h-[calc(90vh-180px)]">

        {/* 1. LAYOUT PRESETS ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('layouts')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  1. בחירת פריסה ועיצוב כללי
                </span>
                <span className="text-[10px] text-slate-500 block">
                  6 סגנונות מותג מתקדמים לטיימר הספירה לאחור
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.layouts ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.layouts && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-col gap-2.5">
                {TIMER_LAYOUT_DEFINITIONS.map((layout) => {
                  const isSelected = formData.layout === layout.id;
                  const LayoutIcon = layout.icon;
                  return (
                    <div
                      key={layout.id}
                      onClick={() => update('layout', layout.id)}
                      onMouseEnter={() => setHoveredLayoutId(layout.id)}
                      onMouseLeave={() => setHoveredLayoutId(null)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 relative text-right flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-500/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                            }`}
                          >
                            <LayoutIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white block leading-tight">
                              {layout.title}
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              צורת תיבות: {layout.shapeName}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {layout.subtitle}
                      </p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] text-slate-400">פלטת צבעים:</span>
                        <div className="flex items-center gap-1">
                          {layout.swatches.map((color, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Object Scaling & CTA button styles */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      קנה מידה לאובייקטים (Object Scale)
                    </label>
                    <select
                      value={formData.objectScale || 'normal'}
                      onChange={(e) => update('objectScale', e.target.value as any)}
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                    >
                      <option value="auto">אוטומטי (לפי הפריסה)</option>
                      <option value="compact">קומפקטי ומדויק</option>
                      <option value="normal">סטנדרטי מאוזן</option>
                      <option value="large">גדול ומודגש</option>
                      <option value="massive">ענק ומסיבי (Eye-Catching)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      צורת כפתור הנעה לפעולה
                    </label>
                    <select
                      value={formData.buttonShape || 'rounded'}
                      onChange={(e) => update('buttonShape', e.target.value as any)}
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                    >
                      <option value="auto">אוטומטי (לפי הפריסה)</option>
                      <option value="pill">קפסולה עגולה (Pill)</option>
                      <option value="rounded">מעוגל מודרני (Rounded)</option>
                      <option value="sharp">חד 90° (Sharp Brutalist)</option>
                      <option value="chiseled">מסותת טקטי (Chiseled)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. TEXT BACKGROUND OVERLAY ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('text_bg')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  2. רקע תמונה מתקדם לטקסט / אזור (Text Background)
                </span>
                <span className="text-[10px] text-slate-500 block">
                  שכבת רקע עם 5 אפקטים עוברים מתקדמים
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.text_bg ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.text_bg && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(formData.textBgEnabled)}
                  onChange={(e) => update('textBgEnabled', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  הפעל תמונת רקע מאחורי הטקסט / אזור הטיימר
                </span>
              </label>

              {formData.textBgEnabled && (
                <div className="space-y-3 bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <PageBuilderImageUpload
                    label="תמונת רקע"
                    value={formData.textBgImageUrl || ''}
                    onChange={(url) => update('textBgImageUrl', url)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PageBuilderColorPicker
                      label="צבע שכבת כיסוי (Overlay Color)"
                      value={formData.textBgOverlayColor || '#000000'}
                      onChange={(c) => update('textBgOverlayColor', c)}
                    />

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        אטימות שכבת כיסוי: {formData.textBgOverlayOpacity ?? 60}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.textBgOverlayOpacity ?? 60}
                        onChange={(e) => update('textBgOverlayOpacity', Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        אפקט עובר (Hover / Reveal Effect)
                      </label>
                      <select
                        value={formData.textBgEffect || 'zoom-glow'}
                        onChange={(e) => update('textBgEffect', e.target.value as HeroTextBgEffect)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <option value="zoom-glow">זום וזוהר עדין (Zoom & Glow)</option>
                        <option value="shimmer-sweep">ברק נע מתכתי (Shimmer Sweep)</option>
                        <option value="float-parallax">ציפה תלת-ממדית (Float Parallax)</option>
                        <option value="blur-reveal">חשיפה מטשטוש (Blur Reveal)</option>
                        <option value="gradient-shift">שינוי גרדיאנט דינמי (Gradient Shift)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        תחולת הרקע (Scope)
                      </label>
                      <select
                        value={formData.textBgScope || 'text-card'}
                        onChange={(e) => update('textBgScope', e.target.value as any)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <option value="text-card">כרטיס התוכן והטיימר בלבד</option>
                        <option value="full-section">כל האזור מקצה לקצה</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. CONTENT, TARGET DATE & CTA ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('content')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  3. תאריך יעד, כותרות והנעה לפעולה
                </span>
                <span className="text-[10px] text-slate-500 block">
                  הגדרת זמני הספירה לאחור וכפתור הרשמה / פעולה
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.content ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.content && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <PageBuilderInput
                label="כותרת הטיימר"
                value={formData.title || ''}
                onChange={(e) => update('title', e.target.value)}
                placeholder="למשל: הספירה לאחור החלה"
              />

              <PageBuilderInput
                label="תת-כותרת"
                value={formData.subtitle || ''}
                onChange={(e) => update('subtitle', e.target.value)}
                placeholder="למשל: אל תפספסו את ההזדמנות להצטרף"
              />

              {/* Target Date with Quick Preset Buttons */}
              <div className="space-y-2 bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <PageBuilderInput
                  label="תאריך ושעת יעד (Date & Time)"
                  type="datetime-local"
                  value={formData.targetDate ? formData.targetDate.substring(0, 16) : ''}
                  onChange={(e) => update('targetDate', e.target.value)}
                  dir="ltr"
                />

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    קיצורי דרך מהירים לקביעת תאריך היעד:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickDate(24)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-950/40 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      עוד 24 שעות
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(72)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-950/40 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      עוד 3 ימים
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(168)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-950/40 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      עוד שבוע
                    </button>
                    <button
                      type="button"
                      onClick={setYearEndDate}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-950/40 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      סוף שנה
                    </button>
                  </div>
                </div>
              </div>

              {/* Action / CTA Button */}
              <div className="space-y-2 bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.showCtaButton ?? true)}
                    onChange={(e) => update('showCtaButton', e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    הצג כפתור הנעה לפעולה (CTA Button) מתחת לטיימר
                  </span>
                </label>

                {(formData.showCtaButton ?? true) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <PageBuilderInput
                      label="טקסט הכפתור"
                      value={formData.ctaText || ''}
                      onChange={(e) => update('ctaText', e.target.value)}
                      placeholder="הבטיחו את מקומכם עכשיו"
                    />
                    <PageBuilderInput
                      label="קישור הכפתור (URL / עוגן / וואטסאפ)"
                      value={formData.ctaUrl || ''}
                      onChange={(e) => update('ctaUrl', e.target.value)}
                      placeholder="#contact או לינק חיצוני"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. SHAPES AND UNITS DIRECTION ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('shapes')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Flower2 className="w-4 h-4 text-pink-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  4. צורת תיבות הזמן וסדר הימים
                </span>
                <span className="text-[10px] text-slate-500 block">
                  בחירת צורות מותאמות (פרח, לב, מגן, לוטוס, HUD) וכיוון הימים (ימין/שמאל)
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.shapes ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.shapes && (
            <div className="p-3.5 pt-1 space-y-4 border-t border-slate-200/80 dark:border-slate-800">
              {/* DIRECTION TOGGLE (RTL VS LTR) */}
              <div className="bg-white dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        סדר וכיוון יחידות הזמן (סדר הימים)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        קבע האם יחידת "ימים" תוצג בצד ימין או בצד שמאל
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                  {/* Option 1: RTL (Days on the Right) */}
                  <div
                    onClick={() => update('timeUnitsDirection', 'rtl')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      (formData.timeUnitsDirection || 'rtl') === 'rtl'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        מימין לשמאל (ימים מימין)
                      </span>
                      {(formData.timeUnitsDirection || 'rtl') === 'rtl' && (
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-2 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                        [ימים]
                      </span>
                      <span>→</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        [שעות]
                      </span>
                      <span>→</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        [דקות]
                      </span>
                      <span>→</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        [שניות]
                      </span>
                    </div>
                  </div>

                  {/* Option 2: LTR (Days on the Left) */}
                  <div
                    onClick={() => update('timeUnitsDirection', 'ltr')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      formData.timeUnitsDirection === 'ltr'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        משמאל לימין (ימים משמאל)
                      </span>
                      {formData.timeUnitsDirection === 'ltr' && (
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-2 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        [שניות]
                      </span>
                      <span>←</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        [דקות]
                      </span>
                      <span>←</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        [שעות]
                      </span>
                      <span>←</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                        [ימים]
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOX SHAPES GRID */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    צורת תיבות הזמן (Shape Styles)
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    צורה פעילה: {resolvedShape}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {TIMER_SHAPE_OPTIONS.map((shape) => {
                    const isSelected = activeShape === shape.id;
                    const ShapeIcon = shape.icon;
                    return (
                      <div
                        key={shape.id}
                        onClick={() => update('boxShape', shape.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 ring-1 ring-pink-500/30'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-pink-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <ShapeIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                              {shape.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block line-clamp-1">
                              {shape.description}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. COLORS AND ANCHOR ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  5. צבעים מותאמים אישית ומזהה עוגן
                </span>
                <span className="text-[10px] text-slate-500 block">
                  צבעי רקע, ספרות, תוויות וניווט מהיר
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.colors ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.colors && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע רקע תיבות"
                  value={formData.boxBackgroundColor || '#0f172a'}
                  onChange={(c) => update('boxBackgroundColor', c)}
                />
                <PageBuilderColorPicker
                  label="צבע ספרות ומספרים"
                  value={formData.numberColor || '#ffffff'}
                  onChange={(c) => update('numberColor', c)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע תוויות היחידות (ימים/שעות)"
                  value={formData.labelColor || '#94a3b8'}
                  onChange={(c) => update('labelColor', c)}
                />
                <PageBuilderColorPicker
                  label="צבע רקע כללי לאזור"
                  value={formData.backgroundColor || 'transparent'}
                  onChange={(c) => update('backgroundColor', c)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע כותרת ראשית"
                  value={formData.titleColor || ''}
                  onChange={(c) => update('titleColor', c)}
                />
                <PageBuilderColorPicker
                  label="צבע תת-כותרת"
                  value={formData.subtitleColor || ''}
                  onChange={(c) => update('subtitleColor', c)}
                />
              </div>

              <PageBuilderInput
                label="מזהה עוגן (Anchor ID)"
                value={formData.anchorId || 'timer'}
                onChange={(e) => update('anchorId', e.target.value)}
                placeholder="timer"
                dir="ltr"
              />
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BAR WITH SAVE / DIRTY STATUS */}
      <div className="p-3 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          {isDirty ? (
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              ישנם שינויים שלא נשמרו
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              הכל שמור ומסונכרן
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              ביטול
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'שומר...' : 'שמור והחל'}</span>
          </button>
        </div>
      </div>

      {/* UNSAVED CHANGES CONFIRMATION MODAL */}
      {showUnsavedConfirm && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-sm w-full text-right space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              האם לצאת ללא שמירה?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ביצעת שינויים בטיימר שטרם נשמרו. יציאה כעת תבטל את השינויים הללו.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                המשך בעריכה
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  if (onClose) onClose();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                צא ללא שמירה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
