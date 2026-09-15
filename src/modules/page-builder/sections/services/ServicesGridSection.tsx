import React from 'react';
import { ServicesSectionConfig } from '../../types/sectionConfigs';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export const ServicesGridSection: React.FC<{ config: ServicesSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'השירותים והפתרונות המובילים שלנו',
    subtitle = 'פתרונות מתקדמים ואיכותיים',
    description,
    layout = 'bento',
    effect = 'border-beam',
    backgroundColor = 'transparent',
    items = [],
  } = config;

  const visibleItems = items.filter((item) => item.isVisible !== false);

  return (
    <section
      id={anchorId || 'services'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {(title || subtitle || description) && (
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
            {description && (
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Bento Grid Layout (Asymmetric 3-column flow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {visibleItems.map((item) => {
            const isSpan2 = item.span === '2' || item.highlight;
            return (
              <div
                key={item.id}
                className={clsx(
                  'group relative bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 shadow-xl overflow-hidden',
                  isSpan2 ? 'md:col-span-2' : 'col-span-1',
                  effect === 'border-beam' && 'hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5'
                )}
              >
                {/* Background lighting effect for highlighted card */}
                {isSpan2 && (
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                )}

                <div className="flex flex-col gap-4 text-right relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <DynamicIcon name={item.icon || 'Star'} className="w-6 h-6" />
                    </div>
                    {item.badge && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {item.imageSrc && (
                    <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-slate-800 my-2">
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  )}

                  {(item.statNumber || item.statLabel) && (
                    <div className="mt-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {item.statNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.statLabel}
                      </span>
                    </div>
                  )}
                </div>

                {item.url && (
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                    <a
                      href={item.url}
                      className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                    >
                      <span>למידע נוסף והרחבה</span>
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
