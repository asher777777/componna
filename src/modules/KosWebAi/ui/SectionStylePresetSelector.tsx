import React from 'react';
import { Sparkles, Heart, Shield, Sun, Crosshair, BarChart3, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { KosWebStylePreset } from '../utils/stylePresetTheme';

interface SectionStylePresetSelectorProps {
  value?: string;
  onChange: (preset: KosWebStylePreset) => void;
  title?: string;
}

const PRESET_OPTIONS: Array<{
  id: KosWebStylePreset;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
}> = [
  {
    id: 'standard',
    label: 'סטנדרטי',
    desc: 'מאוזן ונקי',
    icon: Layers,
    activeClass: 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
  },
  {
    id: 'feminine',
    label: 'נשי ורך',
    desc: 'מעוגל וקפסולות',
    icon: Heart,
    activeClass: 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300',
  },
  {
    id: 'masculine',
    label: 'גברי ועוצמתי',
    desc: 'בולט ומסגרות חדות',
    icon: Shield,
    activeClass: 'border-blue-600 bg-blue-600/15 text-blue-600 dark:text-blue-300',
  },
  {
    id: 'spiritual',
    label: 'רוחני ועדין',
    desc: 'רך וזכוכיתי',
    icon: Sun,
    activeClass: 'border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-300',
  },
  {
    id: 'sharp',
    label: 'חד וטכנולוגי',
    desc: 'ללא עיגול פינות',
    icon: Crosshair,
    activeClass: 'border-cyan-500 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
  },
  {
    id: 'analytical',
    label: 'אנליטי ומדעי',
    desc: 'מדויק ומסודר',
    icon: BarChart3,
    activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  },
];

export const SectionStylePresetSelector: React.FC<SectionStylePresetSelectorProps> = ({
  value = 'standard',
  onChange,
  title = 'סגנון עיצוב ומיתוג האזור (6 סגנונות)',
}) => {
  const current = PRESET_OPTIONS.some((p) => p.id === value) ? value : 'standard';

  return (
    <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{title}</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {PRESET_OPTIONS.find((p) => p.id === current)?.label}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {PRESET_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = current === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              title={`${opt.label} — ${opt.desc}`}
              className={clsx(
                'p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                isActive
                  ? opt.activeClass
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SectionStylePresetSelector;
