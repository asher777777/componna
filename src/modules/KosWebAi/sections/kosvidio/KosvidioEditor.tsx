import React, { useState, useEffect, useMemo } from 'react';
import { safeJsonStringify } from '../../utils/sanitizeConfig';
import {
  KosvidioSectionConfig,
  KosvidioLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  Video,
  Play,
  LayoutTemplate,
  Sliders,
  Layers,
  Palette,
  Save,
  X,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  User,
  Check,
  Maximize2,
  Monitor,
  Wand2,
} from 'lucide-react';

export type KosvidioEditorAccordionSection =
  | 'layouts'
  | 'player'
  | 'channel'
  | 'text_bg'
  | 'colors';

interface KosvidioLayoutDefinition {
  id: KosvidioLayoutPreset;
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

export const KOSVIDIO_LAYOUT_DEFINITIONS: KosvidioLayoutDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'א. פריסה בסגנון נשי (רכה, אלגנטית ומזמינה)',
    subtitle: 'נגן קפסולרי מעוגל עמוק (Radius 2.5rem), פלטת רוז-גולד, שמנת חמה, הילת תאורה ורודה רכה',
    icon: Heart,
    objectSizingDesc: 'מסגרת נגן קפסולרית מעוגלת, מרווחי נשימה אווריריים והילה ורודה עדינה',
    buttonStyleDesc: 'כפתורי קפסולה עגולים מלאים (Rounded Full) בגרדיאנט רוז רך עם מעבר עדין',
    colorPaletteDesc: 'ורוד פודרה, שמנת חמה, רוז-גולד, שמפניה וזהב מעודן',
    cardStyleDesc: 'מסגרת נגן רכה עם שולי פסטל, תג ערוץ מעוגל וברק שמנת עדין',
    swatches: ['#f43f5e', '#fb7185', '#fde68a', '#fff1f2'],
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'ב. פריסה בסגנון גברי (עוצמתית, דומיננטית וטקטית)',
    subtitle: 'כותרות ענק שחורות, מסגרת פלדה כפולה 2px, פחם כהה, זהב מתכתי ותאורת ענבר טקטית',
    icon: Shield,
    objectSizingDesc: 'נגן מסיבי בולט עם מסגרת פלדה כפולה 2px ונוכחות מסך מרשימה',
    buttonStyleDesc: 'כפתורים רחבים מסותתים (Rounded LG) עם גבול כפול מודגש בזהב ענבר',
    colorPaletteDesc: 'שחור-אוניקס, אפור פחם, זהב-ענבר מתכתי וכחול פלדה כהה',
    cardStyleDesc: 'מסגרת פלדה כהה עם תאורת ענבר ממוקדת וחיווי סמכותי',
    swatches: ['#090a0f', '#f59e0b', '#27272a', '#3b82f6'],
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (סגנון Notion SaaS 2026)',
    subtitle: 'סקוורקל מעוגל 3XL נקי ומאוזן, אינדיגו וסגול מודרניים, שקיפות זכוכית עדינה ו-Mesh Glow',
    icon: LayoutTemplate,
    objectSizingDesc: 'נגן וידאו מרכזי רחב (Rounded 3XL), כותרת מאוזנת ועיצוב נקי',
    buttonStyleDesc: 'כפתורים מעוגלים מודרניים (Rounded XL) באינדיגו ואמרלד עם צל רך',
    colorPaletteDesc: 'אינדיגו מודרני, סגול עדין, לבן, סלייט וניגודיות שקופה אלגנטית',
    cardStyleDesc: 'מסגרת SaaS מעוגלת עם זכוכית עדינה ותאורה סביבתית מאוזנת',
    swatches: ['#6366f1', '#a855f7', '#0f172a', '#f8fafc'],
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'ד. פריסה רוחנית (הרמונית, שלווה ומעוררת השראה)',
    subtitle: 'ירוק מרווה (Sage), טורקיז עמוק, זהב הילה, עקומות אורגניות ומעברים איטיים ושלווים',
    icon: Sun,
    objectSizingDesc: 'מרווחי נשימה עמוקים, קווי מתאר עוטפים וטיפוגרפיה שלווה ומרווחת',
    buttonStyleDesc: 'כפתורי לוטוס הרמוניים עם שקיפות זכוכית ומעברי צבע איטיים ושלווים (duration-700)',
    colorPaletteDesc: 'ירוק מרווה (Sage), טורקיז עמוק, חול מדברי וזהב הילה זוהר בעדינות',
    cardStyleDesc: 'מסגרת נגן הרמונית עם הילת טורקיז עוטפת וטבעת אור עדינה',
    swatches: ['#0f766e', '#10b981', '#fbbf24', '#faf8f5'],
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'ה. פריסה חדה (ברוטליסטית, טכנית ומדויקת)',
    subtitle: 'זוויות ישרות 90° ללא שום עיגול, מסגרת 2px שחור/לבן, צל מוסט קשיח 6px וטיפוגרפיה חותכת',
    icon: Crosshair,
    objectSizingDesc: 'אובייקטים גיאומטריים חדים (0px Radius), מסגרות 2px מודגשות וגבול קשיח',
    buttonStyleDesc: 'כפתורים מלבניים חדים (Rounded None) עם צל קשיח מוסט ואפקט לחיצה חותך',
    colorPaletteDesc: 'שחור ולבן בניגודיות מקסימלית עם הדגשות אינדיגו חשמלי',
    cardStyleDesc: 'מסגרת נגן מלבנית חדה 90° עם מסגרת 2px שחורה/לבנה וצל מוסט קשיח',
    swatches: ['#050505', '#ffffff', '#6366f1', '#e2e8f0'],
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'ו. פריסה אנליטית (מסוף HUD טכנולוגי ודיוק מדדי)',
    subtitle: 'מסגרת HUD עם חיתוכי פינות 45° (Chamfered), ציאן-כחול טלמטריה, קווי סריקה וחיווי סטטוס חי',
    icon: Activity,
    objectSizingDesc: 'קומפוזיציית מסוף דשבורד מהודקת, תגיות HUD ואינדיקטורי וידאו דיגיטליים',
    buttonStyleDesc: 'כפתורים טכנולוגיים מהודקים (Rounded XL) בגרדיאנט ציאן-כחול עם חיווי סטטוס',
    colorPaletteDesc: 'כחול-צי עמוק, ציאן טלמטריה, ירוק אמרלד של זמינות ורשת נקודות',
    cardStyleDesc: 'מסגרת נגן HUD מנוקבת זוויות עם סוגרי פינה מוארים וסרגל טלמטריה',
    swatches: ['#06b6d4', '#2563eb', '#10b981', '#050b14'],
  },
];

export const KOSVIDIO_ASPECT_RATIOS: Array<{
  id: '16:9' | '21:9' | '4:3';
  label: string;
  description: string;
}> = [
  {
    id: '16:9',
    label: 'יחס קלאסי רחב (16:9 HD)',
    description: 'היחס הסטנדרטי המאוזן לרוב סרטוני היוטיוב והרצאות',
  },
  {
    id: '21:9',
    label: 'יחס קולנועי רחב במיוחד (21:9 Ultrawide Cinema)',
    description: 'מראה קולנועי מרהיב לסרטי תדמית, טריילרים והפקות פרימיום',
  },
  {
    id: '4:3',
    label: 'יחס קלאסי מסורתי (4:3 Classic)',
    description: 'יחס מסורתי מוגבה – מתאים לשידורי עבר, ראיונות או תכנים ייעודיים',
  },
];

interface KosvidioEditorProps {
  config: KosvidioSectionConfig;
  onChange: (updated: KosvidioSectionConfig) => void;
  onClose?: () => void;
}

export const KosvidioEditor: React.FC<KosvidioEditorProps> = ({ config, onChange, onClose }) => {
  const { getCapability } = useHostCapabilities();
  const brandDnaCap = getCapability<BrandDnaContract>('brandDna');

  const [formData, setFormData] = useState<KosvidioSectionConfig>({
    ...config,
    youtubeVideoId: config.youtubeVideoId || 'dQw4w9WgXcQ',
    title: config.title || 'Kosun - צפו בסיפור שלנו',
    channelName: config.channelName || 'קושאן דיגיטל',
    channelSubscribers: config.channelSubscribers || '24.5K',
    layout: config.layout || 'standard',
    playerAspect: config.playerAspect || '16:9',
    objectScale: config.objectScale || 'normal',
    ambientGlow: config.ambientGlow !== false,
    showTheaterMode: config.showTheaterMode !== false,
    verifiedBadge: config.verifiedBadge !== false,
    backgroundColor: config.backgroundColor || '#07090e',
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layouts: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  useEffect(() => {
    setFormData({
      ...config,
      youtubeVideoId: config.youtubeVideoId || 'dQw4w9WgXcQ',
      title: config.title || 'Kosun - צפו בסיפור שלנו',
      channelName: config.channelName || 'קושאן דיגיטל',
      channelSubscribers: config.channelSubscribers || '24.5K',
      layout: config.layout || 'standard',
      playerAspect: config.playerAspect || '16:9',
      objectScale: config.objectScale || 'normal',
      ambientGlow: config.ambientGlow !== false,
      showTheaterMode: config.showTheaterMode !== false,
      verifiedBadge: config.verifiedBadge !== false,
      backgroundColor: config.backgroundColor || '#07090e',
    });
  }, [config]);

  // Dirty state tracking
  const isDirty = useMemo(() => {
    return safeJsonStringify(formData) !== safeJsonStringify(config);
  }, [formData, config]);

  const update = <K extends keyof KosvidioSectionConfig>(
    field: K,
    value: KosvidioSectionConfig[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: KosvidioEditorAccordionSection) => {
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

        setFormData((prev) => ({
          ...prev,
          title: company ? `${company} – ${slogan || 'צפו בסיפור שלנו'}` : prev.title,
          channelName: company || prev.channelName,
          channelSubscribers: prev.channelSubscribers || '25K+ מנויים',
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

  const currentLayoutDef = useMemo(() => {
    const active = formData.layout || 'standard';
    return (
      KOSVIDIO_LAYOUT_DEFINITIONS.find((l) => l.id === active) ||
      KOSVIDIO_LAYOUT_DEFINITIONS[2] // standard
    );
  }, [formData.layout]);

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all duration-300 relative text-right"
      dir="rtl"
      style={{ fontFamily: "'Heebo', sans-serif" }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-red-600/95 text-white text-xs sm:text-sm px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-500/20 ring-1 ring-white/20">
            KV
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
              <span>עריכת נגן ועמוד וידאו Kosvidio 2.0</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                PRO
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              6 פריסות מותג • תאורה סביבתית • יחסי מסך רחבים
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Brand DNA Sync */}
          {brandDnaCap && (
            <button
              type="button"
              onClick={handleSyncBrandDna}
              title="סנכרן כותרות וערוץ מ-Brand DNA של המותג"
              className={`p-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1 border ${
                isBrandSynced
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isBrandSynced ? 'animate-spin' : 'text-red-500'}`} />
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
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/25 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ring-2 ring-red-400/30 animate-pulse'
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

      {/* ICON MENU TOOLBAR (STRICTLY ICON + RICH TOOLTIP ONLY, NO TEXT LABELS) */}
      <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-around gap-1">
        {[
          {
            id: 'layouts' as KosvidioEditorAccordionSection,
            icon: LayoutTemplate,
            label: 'פריסות וסגנון מותג',
            badge: currentLayoutDef.shortLabel,
          },
          {
            id: 'player' as KosvidioEditorAccordionSection,
            icon: Video,
            label: 'מקור וידאו והגדרות נגן',
            badge: formData.playerAspect,
          },
          {
            id: 'channel' as KosvidioEditorAccordionSection,
            icon: User,
            label: 'פרטי ערוץ ומנויים',
            badge: formData.channelName,
          },
          {
            id: 'text_bg' as KosvidioEditorAccordionSection,
            icon: Layers,
            label: 'רקע תמונה ואפקטים',
            badge: formData.textBgEnabled ? 'פעיל' : undefined,
          },
          {
            id: 'colors' as KosvidioEditorAccordionSection,
            icon: Palette,
            label: 'צבעים, תאורה ועוגן',
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
                  ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm border border-slate-200/80 dark:border-slate-600'
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
                    <span className="text-[10px] px-1 rounded bg-red-500/20 text-red-300 font-bold max-w-[80px] truncate">
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
      <div className="mx-3 my-2.5 p-3 rounded-2xl bg-gradient-to-r from-red-500/5 via-rose-500/5 to-red-500/10 border border-red-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
            {React.createElement(currentLayoutDef.icon, { className: 'w-4 h-4' })}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>{currentLayoutDef.shortLabel}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/15 text-red-700 dark:text-red-300 font-semibold">
                יחס: {formData.playerAspect || '16:9'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {currentLayoutDef.subtitle}
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

        {/* 1. LAYOUT PRESETS ACCORDION (VERTICAL ROWS STACKED ONE UNDER ANOTHER) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('layouts')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-red-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  1. בחירת פריסה ועיצוב נגן מותג
                </span>
                <span className="text-[10px] text-slate-500 block">
                  6 סגנונות מותג מתקדמים לנגן הוידאו Kosvidio
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
              {/* VERTICAL ROWS ONE UNDER ANOTHER (FLEX FLEX-COL) */}
              <div className="flex flex-col gap-2.5">
                {KOSVIDIO_LAYOUT_DEFINITIONS.map((layout) => {
                  const isSelected = formData.layout === layout.id;
                  const LayoutIcon = layout.icon;
                  return (
                    <div
                      key={layout.id}
                      onClick={() => update('layout', layout.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 relative text-right flex flex-col justify-between ${
                        isSelected
                          ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 ring-2 ring-red-500/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-red-500 text-white border-red-600'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                            }`}
                          >
                            <LayoutIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white block leading-tight">
                              {layout.title}
                            </span>
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                              {layout.cardStyleDesc}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
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
            </div>
          )}
        </div>

        {/* 2. PLAYER SOURCE & ASPECT RATIO ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('player')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-red-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  2. מקור וידאו והגדרות נגן
                </span>
                <span className="text-[10px] text-slate-500 block">
                  מזהה YouTube, כותרת H1 ויחס מסך
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.player ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.player && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  מזהה סרטון יוטיוב (YouTube Video ID או קישור מלא)
                </label>
                <input
                  type="text"
                  value={formData.youtubeVideoId || formData.videoUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    const match = val.match(
                      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
                    );
                    if (match) {
                      update('youtubeVideoId', match[1]);
                      update('videoUrl', val);
                    } else {
                      update('youtubeVideoId', val);
                      update('videoUrl', val);
                    }
                  }}
                  placeholder="למשל: dQw4w9WgXcQ או קישור יוטיוב"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-mono"
                  dir="ltr"
                />
              </div>

              <PageBuilderInput
                label="כותרת הוידאו הראשית (H1)"
                value={formData.title || ''}
                onChange={(e) => update('title', e.target.value)}
                placeholder="למשל: צפו בסיפור שלנו"
              />

              {/* ASPECT RATIO SELECTION ROWS (VERTICAL STACK) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  יחס תצוגת נגן (Player Aspect Ratio)
                </span>
                <div className="flex flex-col gap-2">
                  {KOSVIDIO_ASPECT_RATIOS.map((aspect) => {
                    const isSelected = (formData.playerAspect || '16:9') === aspect.id;
                    return (
                      <div
                        key={aspect.id}
                        onClick={() => update('playerAspect', aspect.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-1 ring-red-500'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-slate-500 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                              {aspect.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {aspect.description}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-red-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ambientGlow !== false}
                    onChange={(e) => update('ambientGlow', e.target.checked)}
                    className="rounded text-red-500 focus:ring-red-400 w-3.5 h-3.5"
                  />
                  <span>תאורה סביבתית זוהרת מאחורי הנגן (Ambient Mesh Glow)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showTheaterMode !== false}
                    onChange={(e) => update('showTheaterMode', e.target.checked)}
                    className="rounded text-red-500 focus:ring-red-400 w-3.5 h-3.5"
                  />
                  <span>אפשר כפתור מעבר למצב קולנוע רחב (Theater Mode) עבור הגולש</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.autoplay)}
                    onChange={(e) => update('autoplay', e.target.checked)}
                    className="rounded text-red-500 focus:ring-red-400 w-3.5 h-3.5"
                  />
                  <span>הפעל ניגון אוטומטי במעבר לעמוד (Autoplay Muted)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 3. CHANNEL INFORMATION ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('channel')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  3. פרטי ערוץ ומנויים
                </span>
                <span className="text-[10px] text-slate-500 block">
                  שם ערוץ, תמונת פרופיל, מספר מנויים ותג מאומת
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.channel ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.channel && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderInput
                  label="שם הערוץ"
                  value={formData.channelName || ''}
                  onChange={(e) => update('channelName', e.target.value)}
                  placeholder="שם ערוץ הוידאו"
                />
                <PageBuilderInput
                  label="מספר מנויים (טקסט)"
                  value={formData.channelSubscribers || ''}
                  onChange={(e) => update('channelSubscribers', e.target.value)}
                  placeholder="למשל: 24.5K מנויים"
                />
              </div>

              <PageBuilderImageUpload
                label="תמונת פרופיל / לוגו הערוץ"
                value={formData.channelAvatarUrl || ''}
                onChange={(url) => update('channelAvatarUrl', url)}
              />

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={formData.verifiedBadge !== false}
                  onChange={(e) => update('verifiedBadge', e.target.checked)}
                  className="rounded text-red-500 focus:ring-red-400 w-3.5 h-3.5"
                />
                <span>הצג תג ערוץ מאומת רשמי (Verified Badge)</span>
              </label>
            </div>
          )}
        </div>

        {/* 4. TEXT BACKGROUND OVERLAY ACCORDION */}
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
                  4. רקע תמונה מתקדם לאזור (Text Background)
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
                  className="rounded text-red-500 focus:ring-red-400 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  הפעל תמונת רקע מאחורי נגן הוידאו Kosvidio
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
                        className="w-full accent-red-500"
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
                        value={formData.textBgScope || 'full-section'}
                        onChange={(e) => update('textBgScope', e.target.value as any)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <option value="full-section">כל האזור מקצה לקצה</option>
                        <option value="text-card">כרטיס הנגן בלבד</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
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
              <Palette className="w-4 h-4 text-cyan-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  5. צבעים, תאורה ומזהה עוגן
                </span>
                <span className="text-[10px] text-slate-500 block">
                  צבע רקע כללי, תאורת נגן סביבתית ועוגן ניווט
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
                  label="צבע רקע כללי"
                  value={formData.backgroundColor || '#07090e'}
                  onChange={(c) => update('backgroundColor', c)}
                />
                <PageBuilderColorPicker
                  label="צבע כותרת וידאו"
                  value={formData.titleColor || ''}
                  onChange={(c) => update('titleColor', c)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע שם הערוץ"
                  value={formData.channelNameColor || ''}
                  onChange={(c) => update('channelNameColor', c)}
                />
                <PageBuilderColorPicker
                  label="צבע תאורת נגן סביבתית (Glow)"
                  value={formData.glowColor || ''}
                  onChange={(c) => update('glowColor', c)}
                />
              </div>

              <PageBuilderInput
                label="מזהה עוגן (Anchor ID)"
                value={formData.anchorId || 'kosvidio'}
                onChange={(e) => update('anchorId', e.target.value)}
                placeholder="kosvidio"
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
            <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
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
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
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
              ביצעת שינויים בנגן הוידאו שטרם נשמרו. יציאה כעת תבטל את השינויים הללו.
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

export default KosvidioEditor;
