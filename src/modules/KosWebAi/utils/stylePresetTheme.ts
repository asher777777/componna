import { TenantStylePreset } from '../../../core/contracts';

export type KosWebStylePreset = TenantStylePreset | 'standard' | 'feminine' | 'masculine' | 'spiritual' | 'sharp' | 'analytical';

export interface StylePresetTokens {
  id: KosWebStylePreset;
  labelHe: string;
  sectionWrapperClass: string;
  cardClass: string;
  featuredCardClass: string;
  buttonClass: string;
  secondaryButtonClass: string;
  badgeClass: string;
  inputClass: string;
  avatarClass: string;
}

const STYLE_PRESET_TOKENS: Record<string, StylePresetTokens> = {
  feminine: {
    id: 'feminine',
    labelHe: 'נשי ורך',
    sectionWrapperClass: 'bg-gradient-to-b from-rose-50/40 via-transparent to-pink-50/30 dark:from-rose-950/15 dark:to-transparent',
    cardClass:
      'rounded-[2rem] border border-rose-200/70 dark:border-rose-500/20 bg-white/90 dark:bg-slate-900/70 shadow-lg shadow-rose-500/5 hover:shadow-xl hover:shadow-rose-500/10 transition-all',
    featuredCardClass:
      'rounded-[2rem] border-2 border-rose-400 dark:border-rose-500 bg-gradient-to-b from-rose-50/90 to-white dark:from-rose-950/40 dark:to-slate-900 shadow-2xl shadow-rose-500/15',
    buttonClass:
      'rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25',
    secondaryButtonClass:
      'rounded-full border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30',
    badgeClass:
      'rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50',
    inputClass:
      'rounded-2xl border border-rose-200 dark:border-rose-800/50 bg-white dark:bg-slate-950 focus:border-rose-400',
    avatarClass: 'rounded-full ring-2 ring-rose-300/70',
  },
  masculine: {
    id: 'masculine',
    labelHe: 'גברי ועוצמתי',
    sectionWrapperClass: 'bg-gradient-to-b from-slate-100/60 via-transparent to-transparent dark:from-slate-900/40',
    cardClass:
      'rounded-xl border-2 border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md hover:border-blue-600 dark:hover:border-blue-500 transition-all',
    featuredCardClass:
      'rounded-xl border-2 border-blue-600 dark:border-blue-500 bg-slate-900 text-white shadow-2xl shadow-blue-600/20',
    buttonClass:
      'rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black tracking-wide shadow-md shadow-blue-600/25',
    secondaryButtonClass:
      'rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500',
    badgeClass:
      'rounded-md bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-extrabold uppercase',
    inputClass:
      'rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-blue-600',
    avatarClass: 'rounded-lg ring-2 ring-blue-500/50',
  },
  spiritual: {
    id: 'spiritual',
    labelHe: 'רוחני ועדין',
    sectionWrapperClass: 'bg-gradient-to-b from-violet-50/40 via-transparent to-fuchsia-50/20 dark:from-violet-950/15',
    cardClass:
      'rounded-3xl border border-violet-200/70 dark:border-violet-500/25 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md shadow-lg shadow-violet-500/5 hover:border-violet-400 transition-all',
    featuredCardClass:
      'rounded-3xl border-2 border-violet-400 dark:border-violet-500 bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/60 dark:from-violet-950/50 dark:to-slate-900 shadow-2xl shadow-violet-500/15',
    buttonClass:
      'rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:opacity-90 text-white shadow-lg shadow-violet-500/25',
    secondaryButtonClass:
      'rounded-full border border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-200 bg-violet-50/50 dark:bg-violet-950/30',
    badgeClass:
      'rounded-full bg-violet-100/80 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50',
    inputClass:
      'rounded-2xl border border-violet-200 dark:border-violet-800/50 bg-white/90 dark:bg-slate-950/80 focus:border-violet-500',
    avatarClass: 'rounded-full ring-2 ring-violet-400/60',
  },
  sharp: {
    id: 'sharp',
    labelHe: 'חד וטכנולוגי',
    sectionWrapperClass: 'bg-transparent',
    cardClass:
      'rounded-none border border-cyan-500/30 dark:border-cyan-400/30 bg-white dark:bg-slate-950 shadow-sm hover:border-cyan-500 transition-all',
    featuredCardClass:
      'rounded-none border-2 border-cyan-500 bg-slate-950 text-white shadow-[0_0_25px_rgba(6,182,212,0.18)]',
    buttonClass:
      'rounded-none bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black tracking-wider uppercase',
    secondaryButtonClass:
      'rounded-none border border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10',
    badgeClass:
      'rounded-none bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-mono',
    inputClass:
      'rounded-none border border-slate-300 dark:border-cyan-500/30 bg-slate-50 dark:bg-slate-950 focus:border-cyan-400 font-mono',
    avatarClass: 'rounded-none ring-1 ring-cyan-400',
  },
  analytical: {
    id: 'analytical',
    labelHe: 'אנליטי ומדעי',
    sectionWrapperClass: 'bg-emerald-50/20 dark:bg-emerald-950/5',
    cardClass:
      'rounded-lg border border-emerald-500/25 dark:border-emerald-500/20 bg-white dark:bg-slate-900/90 shadow-sm hover:border-emerald-500/60 transition-all',
    featuredCardClass:
      'rounded-lg border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/10',
    buttonClass:
      'rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm',
    secondaryButtonClass:
      'rounded-md border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    badgeClass:
      'rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-mono',
    inputClass:
      'rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500',
    avatarClass: 'rounded-md ring-1 ring-emerald-500/40',
  },
  standard: {
    id: 'standard',
    labelHe: 'סטנדרטי ומאוזן',
    sectionWrapperClass: 'bg-transparent',
    cardClass:
      'rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-lg hover:border-indigo-500/50 transition-all',
    featuredCardClass:
      'rounded-3xl border-2 border-indigo-500 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-500/15',
    buttonClass:
      'rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold shadow-lg shadow-indigo-600/25',
    secondaryButtonClass:
      'rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500',
    badgeClass:
      'rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    inputClass:
      'rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500',
    avatarClass: 'rounded-full ring-2 ring-indigo-500/30',
  },
};

export function resolveStylePresetTokens(presetOrLayout?: string): StylePresetTokens {
  if (presetOrLayout && STYLE_PRESET_TOKENS[presetOrLayout]) {
    return STYLE_PRESET_TOKENS[presetOrLayout];
  }
  return STYLE_PRESET_TOKENS.standard;
}
