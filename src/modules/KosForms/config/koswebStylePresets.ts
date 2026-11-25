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
import { FormThemeSettings } from '../types';

export type KoswebFormStyleKey = TenantStylePreset;

export interface KoswebFormStyleTokens {
  key: KoswebFormStyleKey;
  letter: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  swatches: string[];
  isDarkDefault: boolean;
  /** Default FormThemeSettings applied when user selects this KOSWEB preset */
  themeDefaults: Partial<FormThemeSettings>;
  /** Outer runner card classes (border, shadow, radius, background fallback) */
  runnerContainerClass: string;
  /** Header & footer divider + surface classes */
  headerClass: string;
  footerClass: string;
  /** Badge class (preview / step tag) */
  badgeClass: string;
  /** Step icon wrapper class */
  iconContainerClass: string;
  iconColorClass: string;
  /** Typography classes */
  titleClass: string;
  subtitleClass: string;
  helperTextClass: string;
  /** Input / textarea class */
  inputClass: string;
  /** Choice option card classes */
  optionCardBaseClass: string;
  optionCardSelectedClass: string;
  optionCardUnselectedClass: string;
  optionIconSelectedClass: string;
  optionIconUnselectedClass: string;
  /** Primary & Secondary button classes */
  primaryButtonClass: string;
  secondaryButtonClass: string;
  /** Progress bar track & text */
  progressTrackClass: string;
  progressTextClass: string;
}

export const KOSWEB_FORM_STYLE_TOKENS: Record<KoswebFormStyleKey, KoswebFormStyleTokens> = {
  standard: {
    key: 'standard',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'פריסה עכשווית (סטנדרט מודרני)',
    subtitle: 'ממורכזת ומאוזנת בסגנון SaaS 2026 עם תאורת Mesh Glow',
    icon: LayoutTemplate,
    swatches: ['#6366f1', '#a855f7', '#0f172a', '#f8fafc'],
    isDarkDefault: false,
    themeDefaults: {
      stylePreset: 'standard',
      primaryColor: '#0F172A',
      accentColor: '#6366F1',
      backgroundColor: '#F8FAFC',
      cardBackground: '#FFFFFF',
      textColor: '#0F172A',
      borderRadius: 'xl',
      containerShape: 'rounded',
      buttonStyle: 'gradient',
    },
    runnerContainerClass:
      'bg-gradient-to-b from-white via-indigo-50/40 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-xl',
    headerClass: 'border-b border-slate-200/60 dark:border-slate-800/60',
    footerClass: 'border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 backdrop-blur-xs',
    badgeClass:
      'rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold',
    iconContainerClass:
      'rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 shadow-sm',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
    titleClass: 'font-extrabold tracking-tight leading-[1.18] text-slate-900 dark:text-white',
    subtitleClass: 'font-normal leading-relaxed text-slate-600 dark:text-slate-300',
    helperTextClass: 'text-slate-500 dark:text-slate-400',
    inputClass:
      'rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15',
    optionCardBaseClass: 'rounded-2xl border-2 transition-all duration-200',
    optionCardSelectedClass:
      'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-500/20 shadow-lg ring-2 ring-indigo-500/25 text-slate-900 dark:text-white',
    optionCardUnselectedClass:
      'border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 hover:border-indigo-400/60 hover:bg-indigo-50/30 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100',
    optionIconSelectedClass: 'rounded-xl bg-indigo-600 text-white',
    optionIconUnselectedClass:
      'rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20',
    primaryButtonClass:
      'rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-xl shadow-indigo-600/25 transition-all hover:-translate-y-0.5',
    secondaryButtonClass:
      'rounded-2xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold',
    progressTrackClass: 'bg-indigo-100 dark:bg-slate-800 rounded-full',
    progressTextClass: 'text-slate-600 dark:text-slate-400',
  },

  feminine: {
    key: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'פריסה בסגנון נשי (רכה ואלגנטית)',
    subtitle: 'קווים עגולים וזורמים, פלטת רוז-גולד ושמנת, כפתורי קפסולה',
    icon: Heart,
    swatches: ['#f43f5e', '#fb7185', '#fde68a', '#fff1f2'],
    isDarkDefault: false,
    themeDefaults: {
      stylePreset: 'feminine',
      primaryColor: '#881337',
      accentColor: '#F43F5E',
      backgroundColor: '#FFF8F6',
      cardBackground: '#FFFBF9',
      textColor: '#292524',
      borderRadius: 'full',
      containerShape: 'pill',
      buttonStyle: 'gradient',
    },
    runnerContainerClass:
      'bg-gradient-to-br from-[#fff8f6] via-rose-50/60 to-amber-50/40 dark:from-[#1f1218] dark:via-[#190f16] dark:to-[#120b10] border border-rose-200/80 dark:border-rose-500/25 shadow-xl shadow-rose-500/10',
    headerClass: 'border-b border-rose-200/60 dark:border-rose-800/30',
    footerClass: 'border-t border-rose-200/60 dark:border-rose-800/30 bg-rose-50/40 dark:bg-rose-950/20 backdrop-blur-md',
    badgeClass:
      'rounded-full bg-rose-100/90 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-800 dark:text-rose-200 font-medium',
    iconContainerClass:
      'rounded-full bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 shadow-sm',
    iconColorClass: 'text-rose-500 dark:text-rose-300',
    titleClass: 'font-semibold tracking-tight leading-[1.22] text-stone-900 dark:text-rose-50',
    subtitleClass: 'font-light leading-loose text-stone-600 dark:text-rose-200/80',
    helperTextClass: 'text-stone-500 dark:text-rose-200/60',
    inputClass:
      'rounded-full border border-rose-200 dark:border-rose-800/50 bg-white/95 dark:bg-rose-950/40 text-stone-900 dark:text-rose-50 placeholder:text-stone-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/15',
    optionCardBaseClass: 'rounded-[1.75rem] border transition-all duration-300',
    optionCardSelectedClass:
      'border-rose-400 bg-rose-50/90 dark:bg-rose-500/20 shadow-lg shadow-rose-500/10 ring-2 ring-rose-400/30 text-stone-900 dark:text-rose-50',
    optionCardUnselectedClass:
      'border-rose-200/80 dark:border-rose-800/40 bg-white/85 dark:bg-rose-950/30 hover:border-rose-300 hover:bg-rose-50/50 text-stone-800 dark:text-rose-100',
    optionIconSelectedClass: 'rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white',
    optionIconUnselectedClass:
      'rounded-full bg-rose-100/80 dark:bg-rose-900/40 text-rose-500 dark:text-rose-300',
    primaryButtonClass:
      'rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-rose-500/25 transition-all hover:-translate-y-0.5',
    secondaryButtonClass:
      'rounded-full bg-white/80 dark:bg-white/5 border border-rose-200 dark:border-rose-400/30 text-rose-900 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium',
    progressTrackClass: 'bg-rose-100 dark:bg-rose-950/50 rounded-full',
    progressTextClass: 'text-rose-700/80 dark:text-rose-200/70',
  },

  masculine: {
    key: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'פריסה בסגנון גברי (עוצמתית ודומיננטית)',
    subtitle: 'כותרות ענק מודגשות, פחם וזהב מתכתי, מבנה סמכותי ורחב',
    icon: Shield,
    swatches: ['#090a0f', '#f59e0b', '#27272a', '#3b82f6'],
    isDarkDefault: true,
    themeDefaults: {
      stylePreset: 'masculine',
      primaryColor: '#F59E0B',
      accentColor: '#F59E0B',
      backgroundColor: '#09090B',
      cardBackground: '#09090B',
      textColor: '#FFFFFF',
      borderRadius: 'md',
      containerShape: 'rounded',
      buttonStyle: 'solid',
    },
    runnerContainerClass:
      'bg-zinc-950 text-white border-2 border-zinc-800 shadow-2xl',
    headerClass: 'border-b border-zinc-800',
    footerClass: 'border-t border-zinc-800 bg-zinc-900/80',
    badgeClass:
      'rounded-md bg-zinc-900 border border-amber-500/40 text-amber-400 font-extrabold uppercase tracking-wider',
    iconContainerClass:
      'rounded-lg bg-zinc-900 border-2 border-amber-500/40 shadow-lg',
    iconColorClass: 'text-amber-400',
    titleClass: 'font-black tracking-tight leading-[1.1] text-white',
    subtitleClass: 'font-normal leading-relaxed text-zinc-400',
    helperTextClass: 'text-zinc-500',
    inputClass:
      'rounded-lg border-2 border-zinc-800 bg-zinc-900/90 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15',
    optionCardBaseClass: 'rounded-xl border-2 transition-all duration-200',
    optionCardSelectedClass:
      'border-amber-500 bg-amber-500/15 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40 text-white',
    optionCardUnselectedClass:
      'border-zinc-800 bg-zinc-900/90 hover:border-zinc-600 hover:bg-zinc-800/80 text-zinc-100',
    optionIconSelectedClass: 'rounded-lg bg-amber-500 text-zinc-950 font-black',
    optionIconUnselectedClass:
      'rounded-lg bg-zinc-800 text-amber-400 group-hover:bg-amber-500/15',
    primaryButtonClass:
      'rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5',
    secondaryButtonClass:
      'rounded-lg bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-500 text-white font-bold',
    progressTrackClass: 'bg-zinc-800 rounded-md',
    progressTextClass: 'text-zinc-400 font-bold',
  },

  spiritual: {
    key: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'פריסה רוחנית (הרמונית ושלווה)',
    subtitle: 'סימטריה מדיטטיבית, זכוכית חלבית, ירוק מרווה וזהב הילה',
    icon: Sun,
    swatches: ['#0f766e', '#10b981', '#fbbf24', '#faf8f5'],
    isDarkDefault: false,
    themeDefaults: {
      stylePreset: 'spiritual',
      primaryColor: '#134E4A',
      accentColor: '#0F766E',
      backgroundColor: '#F6F9F6',
      cardBackground: '#F9FCF9',
      textColor: '#134E4A',
      borderRadius: 'full',
      containerShape: 'rounded',
      buttonStyle: 'solid',
    },
    runnerContainerClass:
      'bg-gradient-to-b from-[#f6f9f6] via-[#eff5f1] to-[#faf8f5] dark:from-[#091514] dark:via-[#0b1b1a] dark:to-[#071110] border border-teal-700/20 dark:border-teal-400/20 backdrop-blur-md shadow-xl',
    headerClass: 'border-b border-teal-700/15 dark:border-teal-500/20',
    footerClass: 'border-t border-teal-700/15 dark:border-teal-500/20 bg-white/50 dark:bg-teal-950/30 backdrop-blur-md',
    badgeClass:
      'rounded-full bg-teal-900/5 dark:bg-teal-400/10 border border-teal-700/20 dark:border-teal-400/30 text-teal-800 dark:text-teal-200 font-medium tracking-wide',
    iconContainerClass:
      'rounded-full bg-teal-900/5 dark:bg-teal-400/10 border border-teal-700/20 dark:border-teal-400/30 backdrop-blur-sm',
    iconColorClass: 'text-teal-700 dark:text-emerald-300',
    titleClass: 'font-light tracking-tight leading-[1.24] text-teal-950 dark:text-emerald-50',
    subtitleClass: 'font-normal leading-loose text-teal-900/75 dark:text-emerald-100/75',
    helperTextClass: 'text-teal-800/60 dark:text-emerald-200/60',
    inputClass:
      'rounded-3xl border border-teal-700/25 dark:border-teal-500/30 bg-white/80 dark:bg-teal-950/30 text-teal-950 dark:text-emerald-50 placeholder:text-teal-700/40 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15 backdrop-blur-sm',
    optionCardBaseClass: 'rounded-3xl border transition-all duration-500 backdrop-blur-sm',
    optionCardSelectedClass:
      'border-teal-600 bg-teal-50/90 dark:bg-teal-900/40 shadow-lg shadow-teal-900/10 ring-2 ring-teal-500/25 text-teal-950 dark:text-emerald-50',
    optionCardUnselectedClass:
      'border-teal-700/15 dark:border-teal-500/20 bg-white/70 dark:bg-teal-950/25 hover:border-teal-600/40 hover:bg-white/90 text-teal-900 dark:text-emerald-100',
    optionIconSelectedClass: 'rounded-full bg-teal-700 text-white',
    optionIconUnselectedClass:
      'rounded-full bg-teal-900/5 dark:bg-teal-400/15 text-teal-700 dark:text-emerald-300',
    primaryButtonClass:
      'rounded-full bg-teal-800 dark:bg-emerald-600 hover:bg-teal-700 dark:hover:bg-emerald-500 text-white font-medium shadow-xl shadow-teal-900/15 transition-all duration-500 hover:-translate-y-0.5',
    secondaryButtonClass:
      'rounded-full bg-white/70 dark:bg-white/5 border border-teal-700/25 dark:border-teal-400/30 text-teal-900 dark:text-teal-100 hover:bg-white/90 font-medium',
    progressTrackClass: 'bg-teal-900/10 dark:bg-teal-950/60 rounded-full',
    progressTextClass: 'text-teal-800/75 dark:text-emerald-200/70',
  },

  sharp: {
    key: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'פריסה חדה (ברוטליסטית ומדויקת)',
    subtitle: 'זוויות ישרות 90° ללא עיגול, מסגרות 2px וצללים קשים מוסטים',
    icon: Crosshair,
    swatches: ['#050505', '#ffffff', '#6366f1', '#e2e8f0'],
    isDarkDefault: false,
    themeDefaults: {
      stylePreset: 'sharp',
      primaryColor: '#050505',
      accentColor: '#6366F1',
      backgroundColor: '#FFFFFF',
      cardBackground: '#FFFFFF',
      textColor: '#050505',
      borderRadius: 'sm',
      containerShape: 'square',
      buttonStyle: 'solid',
    },
    runnerContainerClass:
      'bg-white dark:bg-zinc-950 border-2 border-slate-950 dark:border-white shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#6366f1]',
    headerClass: 'border-b-2 border-slate-950 dark:border-white/25',
    footerClass: 'border-t-2 border-slate-950 dark:border-white/25 bg-slate-50 dark:bg-zinc-900',
    badgeClass:
      'rounded-none bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-mono font-bold uppercase tracking-widest border-2 border-slate-950 dark:border-white shadow-[3px_3px_0px_0px_#6366f1]',
    iconContainerClass:
      'rounded-none bg-slate-950 dark:bg-white border-2 border-slate-950 dark:border-white shadow-[3px_3px_0px_0px_#6366f1]',
    iconColorClass: 'text-white dark:text-slate-950',
    titleClass: 'font-black tracking-tighter leading-[1.08] text-slate-950 dark:text-white',
    subtitleClass: 'font-medium leading-relaxed text-slate-700 dark:text-zinc-300',
    helperTextClass: 'font-mono text-slate-600 dark:text-zinc-400',
    inputClass:
      'rounded-none border-2 border-slate-950 dark:border-white/60 bg-white dark:bg-zinc-950 text-slate-950 dark:text-white placeholder:text-slate-400 focus:border-indigo-600 focus:shadow-[4px_4px_0px_0px_#6366f1] font-mono',
    optionCardBaseClass: 'rounded-none border-2 transition-all duration-150',
    optionCardSelectedClass:
      'border-slate-950 dark:border-white bg-indigo-50 dark:bg-indigo-950/60 shadow-[4px_4px_0px_0px_#6366f1] text-slate-950 dark:text-white',
    optionCardUnselectedClass:
      'border-slate-950/80 dark:border-white/30 bg-white dark:bg-zinc-950 hover:shadow-[4px_4px_0px_0px_#0f172a] dark:hover:shadow-[4px_4px_0px_0px_#6366f1] text-slate-900 dark:text-zinc-100',
    optionIconSelectedClass: 'rounded-none bg-indigo-600 text-white',
    optionIconUnselectedClass:
      'rounded-none bg-slate-950 dark:bg-white text-white dark:text-slate-950',
    primaryButtonClass:
      'rounded-none bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black border-2 border-slate-950 dark:border-white shadow-[4px_4px_0px_0px_#6366f1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#6366f1] transition-all',
    secondaryButtonClass:
      'rounded-none bg-white dark:bg-slate-950 text-slate-950 dark:text-white font-bold border-2 border-slate-950 dark:border-white hover:bg-slate-100 dark:hover:bg-slate-900',
    progressTrackClass: 'bg-slate-200 dark:bg-zinc-800 rounded-none border border-slate-950/30 dark:border-white/20',
    progressTextClass: 'font-mono font-bold text-slate-900 dark:text-zinc-200',
  },

  analytical: {
    key: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'פריסה אנליטית (מבוססת נתונים ודיוק)',
    subtitle: 'גריד טכנולוגי מדויק, ציאן טלמטריה ותגיות מונוספייס',
    icon: BarChart3,
    swatches: ['#06b6d4', '#2563eb', '#10b981', '#050b14'],
    isDarkDefault: false,
    themeDefaults: {
      stylePreset: 'analytical',
      primaryColor: '#0F172A',
      accentColor: '#06B6D4',
      backgroundColor: '#F8FAFC',
      cardBackground: '#FFFFFF',
      textColor: '#0F172A',
      borderRadius: 'lg',
      containerShape: 'rounded',
      buttonStyle: 'gradient',
    },
    runnerContainerClass:
      'bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white dark:from-[#050b14] dark:via-[#081526] dark:to-[#050b14] border border-cyan-500/30 shadow-xl shadow-cyan-500/10',
    headerClass: 'border-b border-cyan-500/20',
    footerClass: 'border-t border-cyan-500/20 bg-slate-50/80 dark:bg-slate-900/70 backdrop-blur-xs',
    badgeClass:
      'rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-mono font-bold tracking-wider',
    iconContainerClass:
      'rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-sm',
    iconColorClass: 'text-cyan-600 dark:text-cyan-400',
    titleClass: 'font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white',
    subtitleClass: 'font-normal leading-relaxed text-slate-600 dark:text-slate-300',
    helperTextClass: 'font-mono text-slate-500 dark:text-cyan-200/60',
    inputClass:
      'rounded-xl border border-slate-300 dark:border-cyan-500/30 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15',
    optionCardBaseClass: 'rounded-xl border transition-all duration-200',
    optionCardSelectedClass:
      'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-500/15 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/25 text-slate-900 dark:text-white',
    optionCardUnselectedClass:
      'border-cyan-500/20 bg-white/90 dark:bg-slate-900/80 hover:border-cyan-500/50 hover:bg-cyan-50/30 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100',
    optionIconSelectedClass: 'rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white',
    optionIconUnselectedClass:
      'rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    primaryButtonClass:
      'rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-600/25 transition-all hover:-translate-y-0.5',
    secondaryButtonClass:
      'rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-cyan-500/50 font-bold',
    progressTrackClass: 'bg-cyan-100 dark:bg-slate-800 rounded-md',
    progressTextClass: 'font-mono text-slate-600 dark:text-cyan-300/80',
  },
};

export const KOSWEB_STYLE_PRESETS_LIST: KoswebFormStyleTokens[] = [
  KOSWEB_FORM_STYLE_TOKENS.feminine,
  KOSWEB_FORM_STYLE_TOKENS.masculine,
  KOSWEB_FORM_STYLE_TOKENS.standard,
  KOSWEB_FORM_STYLE_TOKENS.spiritual,
  KOSWEB_FORM_STYLE_TOKENS.sharp,
  KOSWEB_FORM_STYLE_TOKENS.analytical,
];

export function resolveKoswebFormStyle(preset?: TenantStylePreset | string): KoswebFormStyleTokens {
  if (preset && preset in KOSWEB_FORM_STYLE_TOKENS) {
    return KOSWEB_FORM_STYLE_TOKENS[preset as KoswebFormStyleKey];
  }
  return KOSWEB_FORM_STYLE_TOKENS.standard;
}
