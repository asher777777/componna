import React from 'react';
import { StatsBentoSectionConfig } from '../../types/sectionConfigs';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { TrendingUp, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export const StatsBentoSection: React.FC<{ config: StatsBentoSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'התוצאות וההישגים שלנו במספרים',
    subtitle = 'מדדי ביצוע מוכחים',
    backgroundColor = 'transparent',
    stats = [],
  } = config;

  const colorStyles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'group-hover:border-indigo-500/50' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'group-hover:border-emerald-500/50' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'group-hover:border-purple-500/50' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'group-hover:border-amber-500/50' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'group-hover:border-rose-500/50' },
  };

  return (
    <section
      id={anchorId || 'stats'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
            {subtitle && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{subtitle}</span>
              </div>
            )}
            {title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {stats.map((item, idx) => {
            const colorTheme = colorStyles[item.color || 'indigo'] || colorStyles.indigo;
            return (
              <div
                key={item.id || idx}
                className={clsx(
                  'group relative bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5',
                  colorTheme.glow
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110',
                      colorTheme.bg,
                      colorTheme.text,
                      colorTheme.border
                    )}
                  >
                    <DynamicIcon name={item.icon || 'TrendingUp'} className="w-6 h-6" />
                  </div>
                  {item.badge && (
                    <span
                      className={clsx(
                        'px-2.5 py-1 rounded-full text-[11px] font-bold border',
                        colorTheme.bg,
                        colorTheme.text,
                        colorTheme.border
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                      {item.number}
                    </span>
                    {item.suffix && (
                      <span className={clsx('text-2xl font-black', colorTheme.text)}>
                        {item.suffix}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-200 mt-1">{item.label}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
