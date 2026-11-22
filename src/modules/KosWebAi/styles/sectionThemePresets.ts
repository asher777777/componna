import React from 'react';
import {
  Heart,
  Shield,
  LayoutTemplate,
  Sun,
  Crosshair,
  BarChart3,
} from 'lucide-react';
import { TenantStylePreset } from '../../../core/contracts';

/**
 * 6 הסגנונות המרכזיים של מערכת KosWebAi.
 * מהווה מקור אמת יחיד (Single Source of Truth) לכל האזורים והעורכים.
 */
export type SectionStyleKey =
  | 'standard'
  | 'feminine'
  | 'masculine'
  | 'spiritual'
  | 'sharp'
  | 'analytical';

export type SectionMediaVariant =
  | 'browser'
  | 'arch'
  | 'charcoal-frame'
  | 'portal'
  | 'brutalist'
  | 'hud';

export interface SectionThemeTokens {
  key: SectionStyleKey;
  /** רקע ברירת מחדל של הסקשן */
  sectionClass: string;
  /** מחלקת רקע כרטיס / משטח משני */
  cardClass: string;
  /** רדיוס כרטיס הטקסט כשמופעל textBgEnabled */
  textCardRadiusClass: string;
  /** צבע overlay ברירת מחדל לתמונת רקע */
  defaultOverlayHex: string;
  /** פוזיציית תמונה ברירת מחדל כשהפריסה על auto */
  defaultImagePosition: 'bottom' | 'top' | 'left' | 'right';
  /** טקסט ברירת מחדל לתגית על התמונה */
  defaultImageBadgeText: string;
  /** סגנון מסגרת התמונה/וידאו */
  mediaVariant: SectionMediaVariant;
  /** מחלקות טיפוגרפיה */
  typography: {
    titleClass: string;
    defaultTitleScale: string;
    defaultTitleWeight: string;
    subtitleClass: string;
    defaultSubtitleScale: string;
    descClass: string;
    defaultDescScale: string;
    socialProofTextClass: string;
    socialProofBorderClass: string;
  };
  /** תגית הכרזה עליונה */
  badge: {
    className: string;
    iconType: 'arrow' | 'heart' | 'shield' | 'sun' | 'crosshair' | 'activity';
    isUppercaseMono?: boolean;
  };
  /** כפתורים */
  button: {
    primaryClass: string;
    secondaryClass: string;
    defaultShapeRadius: string;
    defaultSizeClass: string;
  };
  /** צבעי ברירת מחדל (לפני דריסת מיתוג או דריסה ידנית) */
  defaults: {
    accentColor: string;
    primaryBtnBg?: string;
  };
}

export interface StylePresetDefinition {
  id: SectionStyleKey;
  /** מזהה תואם ל־HeroLayoutPreset עבור הפריסה העכשווית */
  heroLayoutId: 'bento-hero' | 'feminine' | 'masculine' | 'spiritual' | 'sharp' | 'analytical';
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

export const SECTION_THEMES: Record<SectionStyleKey, SectionThemeTokens> = {
  standard: {
    key: 'standard',
    sectionClass:
      'bg-gradient-to-b from-white via-indigo-50/50 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950',
    cardClass:
      'bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/80 shadow-xl',
    textCardRadiusClass: 'rounded-[2.5rem]',
    defaultOverlayHex: '#0f172a',
    defaultImagePosition: 'bottom',
    defaultImageBadgeText: 'חוויה דיגיטלית מתקדמת',
    mediaVariant: 'browser',
    typography: {
      titleClass: 'tracking-tight leading-[1.15] text-slate-900 dark:text-white drop-shadow-sm',
      defaultTitleScale: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
      defaultTitleWeight: 'font-extrabold',
      subtitleClass: 'font-bold tracking-wide text-indigo-600 dark:text-indigo-400',
      defaultSubtitleScale: 'text-sm sm:text-base',
      descClass: 'leading-relaxed font-normal text-slate-600 dark:text-slate-300',
      defaultDescScale: 'text-base sm:text-lg md:text-xl max-w-2xl',
      socialProofTextClass: 'text-slate-600 dark:text-slate-400',
      socialProofBorderClass: 'border-slate-200/50 dark:border-slate-800/50',
    },
    badge: {
      className:
        'inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6 transition-all hover:scale-105 shadow-sm shadow-indigo-500/5 group',
      iconType: 'arrow',
    },
    button: {
      primaryClass:
        'inline-flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-600/20 dark:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0',
      secondaryClass:
        'inline-flex items-center gap-2 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600',
      defaultShapeRadius: 'rounded-2xl',
      defaultSizeClass: 'px-8 py-4 text-sm sm:text-base',
    },
    defaults: {
      accentColor: '#6366f1',
    },
  },

  feminine: {
    key: 'feminine',
    sectionClass:
      'bg-gradient-to-br from-[#fff8f6] via-rose-50/40 to-amber-50/30 dark:from-[#1f1218] dark:via-[#190f16] dark:to-[#120b10]',
    cardClass:
      'bg-white/75 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-500/20 shadow-xl shadow-rose-500/5',
    textCardRadiusClass: 'rounded-[2.5rem]',
    defaultOverlayHex: '#2e101f',
    defaultImagePosition: 'bottom',
    defaultImageBadgeText: 'עיצוב בוטיק מותאם אישית',
    mediaVariant: 'arch',
    typography: {
      titleClass: 'leading-[1.2] tracking-tight text-stone-900 dark:text-rose-50',
      defaultTitleScale: 'text-4xl sm:text-5xl md:text-6xl',
      defaultTitleWeight: 'font-semibold',
      subtitleClass: 'font-medium tracking-wide text-rose-600 dark:text-rose-300',
      defaultSubtitleScale: 'text-sm sm:text-base',
      descClass: 'leading-loose font-light text-stone-600 dark:text-stone-300',
      defaultDescScale: 'text-base sm:text-lg max-w-xl',
      socialProofTextClass: 'text-stone-600 dark:text-rose-200/80',
      socialProofBorderClass: 'border-rose-200/60 dark:border-rose-800/40',
    },
    badge: {
      className:
        'inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-800 dark:text-rose-200 text-xs font-medium tracking-wide mb-6 shadow-sm hover:scale-105 transition-all',
      iconType: 'heart',
    },
    button: {
      primaryClass:
        'inline-flex items-center gap-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-rose-500/25 transition-all hover:-translate-y-0.5',
      secondaryClass:
        'inline-flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-md border border-rose-200 dark:border-rose-400/30 text-rose-900 dark:text-rose-100 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all',
      defaultShapeRadius: 'rounded-full',
      defaultSizeClass: 'px-8 py-3.5 text-sm sm:text-base',
    },
    defaults: {
      accentColor: '#f43f5e',
    },
  },

  masculine: {
    key: 'masculine',
    sectionClass: 'bg-zinc-950 text-white',
    cardClass: 'bg-zinc-900/90 border border-zinc-800 shadow-2xl',
    textCardRadiusClass: 'rounded-2xl',
    defaultOverlayHex: '#09090b',
    defaultImagePosition: 'bottom',
    defaultImageBadgeText: 'ביצועים ועוצמה ללא פשרות',
    mediaVariant: 'charcoal-frame',
    typography: {
      titleClass: 'leading-[1.08] tracking-tight text-white',
      defaultTitleScale: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
      defaultTitleWeight: 'font-black',
      subtitleClass: 'font-bold uppercase tracking-widest text-amber-400',
      defaultSubtitleScale: 'text-xs sm:text-sm',
      descClass: 'leading-relaxed font-normal text-zinc-400',
      defaultDescScale: 'text-base sm:text-lg max-w-xl',
      socialProofTextClass: 'text-zinc-400',
      socialProofBorderClass: 'border-zinc-800',
    },
    badge: {
      className:
        'inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-zinc-900 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-6 shadow-lg',
      iconType: 'shield',
    },
    button: {
      primaryClass:
        'inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5',
      secondaryClass:
        'inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-500 text-white font-bold transition-all',
      defaultShapeRadius: 'rounded-lg',
      defaultSizeClass: 'px-9 py-4 text-sm sm:text-base',
    },
    defaults: {
      accentColor: '#f59e0b',
    },
  },

  spiritual: {
    key: 'spiritual',
    sectionClass:
      'bg-gradient-to-b from-[#f6f9f6] via-[#eff5f1] to-[#faf8f5] dark:from-[#091514] dark:via-[#0b1b1a] dark:to-[#071110]',
    cardClass:
      'bg-white/70 dark:bg-teal-950/30 border border-teal-700/15 dark:border-teal-400/20 backdrop-blur-md shadow-xl',
    textCardRadiusClass: 'rounded-[2.5rem]',
    defaultOverlayHex: '#091e1c',
    defaultImagePosition: 'bottom',
    defaultImageBadgeText: 'הרמוניה, איזון ונוכחות',
    mediaVariant: 'portal',
    typography: {
      titleClass: 'leading-[1.22] tracking-tight text-teal-950 dark:text-emerald-50',
      defaultTitleScale: 'text-4xl sm:text-5xl md:text-6xl',
      defaultTitleWeight: 'font-light',
      subtitleClass: 'font-medium tracking-widest text-teal-700 dark:text-amber-300',
      defaultSubtitleScale: 'text-xs sm:text-sm',
      descClass: 'leading-loose font-normal text-teal-900/75 dark:text-emerald-100/75',
      defaultDescScale: 'text-base sm:text-lg max-w-2xl',
      socialProofTextClass: 'text-teal-800 dark:text-emerald-200',
      socialProofBorderClass: 'border-teal-700/15 dark:border-teal-500/20',
    },
    badge: {
      className:
        'inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-teal-900/5 dark:bg-teal-400/10 border border-teal-700/20 dark:border-teal-400/30 text-teal-800 dark:text-teal-200 text-xs font-medium tracking-widest mb-6 backdrop-blur-sm',
      iconType: 'sun',
    },
    button: {
      primaryClass:
        'inline-flex items-center gap-2.5 bg-teal-800 dark:bg-emerald-600 hover:bg-teal-700 dark:hover:bg-emerald-500 text-white font-medium shadow-xl shadow-teal-900/15 transition-all duration-500 hover:-translate-y-0.5',
      secondaryClass:
        'inline-flex items-center gap-2 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-teal-700/25 dark:border-teal-400/30 text-teal-900 dark:text-teal-100 font-medium hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-500',
      defaultShapeRadius: 'rounded-full',
      defaultSizeClass: 'px-8 py-4 text-sm sm:text-base',
    },
    defaults: {
      accentColor: '#0f766e',
    },
  },

  sharp: {
    key: 'sharp',
    sectionClass: 'bg-white dark:bg-[#050505] border-y-2 border-slate-950 dark:border-white/20',
    cardClass:
      'bg-white dark:bg-zinc-950 border-2 border-slate-950 dark:border-white shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#6366f1]',
    textCardRadiusClass: 'rounded-none',
    defaultOverlayHex: '#050505',
    defaultImagePosition: 'bottom',
    defaultImageBadgeText: 'דיוק אדריכלי',
    mediaVariant: 'brutalist',
    typography: {
      titleClass: 'leading-[1.05] tracking-tighter text-slate-950 dark:text-white',
      defaultTitleScale: 'text-4xl sm:text-6xl md:text-7xl',
      defaultTitleWeight: 'font-black',
      subtitleClass: 'font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400',
      defaultSubtitleScale: 'text-xs sm:text-sm',
      descClass: 'leading-relaxed font-medium text-slate-700 dark:text-zinc-300',
      defaultDescScale: 'text-base sm:text-lg max-w-xl',
      socialProofTextClass: 'text-slate-900 dark:text-white font-bold',
      socialProofBorderClass: 'border-slate-950/20 dark:border-white/20',
    },
    badge: {
      className:
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-mono font-bold uppercase tracking-widest mb-6 border-2 border-slate-950 dark:border-white shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]',
      iconType: 'crosshair',
      isUppercaseMono: true,
    },
    button: {
      primaryClass:
        'inline-flex items-center gap-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black border-2 border-slate-950 dark:border-white shadow-[5px_5px_0px_0px_#6366f1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#6366f1] transition-all',
      secondaryClass:
        'inline-flex items-center gap-2 bg-white dark:bg-slate-950 text-slate-950 dark:text-white font-bold border-2 border-slate-950 dark:border-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all',
      defaultShapeRadius: 'rounded-none',
      defaultSizeClass: 'px-8 py-4 text-sm sm:text-base',
    },
    defaults: {
      accentColor: '#6366f1',
    },
  },

  analytical: {
    key: 'analytical',
    sectionClass:
      'bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white dark:from-[#050b14] dark:via-[#081526] dark:to-[#050b14]',
    cardClass:
      'bg-white/90 dark:bg-slate-900/80 border border-cyan-500/25 shadow-xl shadow-cyan-500/5',
    textCardRadiusClass: 'rounded-3xl',
    defaultOverlayHex: '#06101e',
    defaultImagePosition: 'bottom',
    defaultImageBadgeText: '100% VERIFIED',
    mediaVariant: 'hud',
    typography: {
      titleClass: 'leading-[1.12] tracking-tight text-slate-900 dark:text-white',
      defaultTitleScale: 'text-3xl sm:text-5xl md:text-6xl',
      defaultTitleWeight: 'font-extrabold',
      subtitleClass: 'font-mono font-bold tracking-wider text-cyan-600 dark:text-cyan-400',
      defaultSubtitleScale: 'text-xs sm:text-sm',
      descClass: 'leading-relaxed font-normal text-slate-600 dark:text-slate-300',
      defaultDescScale: 'text-base sm:text-lg max-w-xl',
      socialProofTextClass: 'text-slate-600 dark:text-slate-300',
      socialProofBorderClass: 'border-cyan-500/20',
    },
    badge: {
      className:
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold tracking-wider mb-5',
      iconType: 'activity',
    },
    button: {
      primaryClass:
        'inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-600/25 transition-all hover:-translate-y-0.5',
      secondaryClass:
        'inline-flex items-center gap-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:border-cyan-500/50 transition-all',
      defaultShapeRadius: 'rounded-xl',
      defaultSizeClass: 'px-7 py-3.5 text-sm sm:text-base',
    },
    defaults: {
      accentColor: '#06b6d4',
    },
  },
};

/**
 * מטא-דאטה אחידה עבור כל קבצי העריכה (*Editor.tsx) להצגת 6 הסגנונות.
 */
export const STYLE_PRESET_DEFINITIONS: StylePresetDefinition[] = [
  {
    id: 'feminine',
    heroLayoutId: 'feminine',
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
    heroLayoutId: 'masculine',
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
    id: 'standard',
    heroLayoutId: 'bento-hero',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (סטנדרט מודרני)',
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
    heroLayoutId: 'spiritual',
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
    heroLayoutId: 'sharp',
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
    heroLayoutId: 'analytical',
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

/**
 * ממיר כל מזהה פריסה היסטורי או 'auto' למפתח סגנון תקני מתוך 6 הסגנונות.
 */
export function normalizeStylePreset(
  layout?: string,
  brandDefaultPreset?: TenantStylePreset
): SectionStyleKey {
  if (!layout || layout === 'auto') {
    if (brandDefaultPreset && brandDefaultPreset in SECTION_THEMES) {
      return brandDefaultPreset as SectionStyleKey;
    }
    return 'standard';
  }
  if (
    layout === 'bento-hero' ||
    layout === 'current' ||
    layout === 'fz' ||
    layout === 'spatial' ||
    layout === 'centered' ||
    layout === 'split' ||
    layout === 'standard'
  ) {
    return 'standard';
  }
  if (layout in SECTION_THEMES) {
    return layout as SectionStyleKey;
  }
  return 'standard';
}
