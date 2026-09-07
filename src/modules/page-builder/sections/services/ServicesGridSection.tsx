import React from 'react';
import { ServicesSectionConfig } from '../../types/sectionConfigs';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export const ServicesGridSection: React.FC<{ config: ServicesSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title,
    description,
    columns = 3,
    effect = 'hover-scale',
    backgroundColor = 'transparent',
    items = [],
  } = config;

  const visibleItems = items.filter((item) => item.isVisible !== false);

  const columnClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section
      id={anchorId || 'services'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {(title || description) && (
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
                {description}
              </p>
            )}
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2" />
          </div>
        )}

        <div className={clsx('grid gap-6 sm:gap-8', columnClasses[columns] || columnClasses[3])}>
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className={clsx(
                'group relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-md transition-all duration-300',
                effect === 'hover-scale' && 'hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/40',
                effect === 'hover-glow' && 'hover:border-indigo-500 hover:shadow-indigo-500/20 shadow-lg'
              )}
            >
              <div className="flex flex-col gap-4 text-right">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <DynamicIcon name={item.icon || 'Star'} className="w-6 h-6" />
                  </div>
                  {item.badge && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {item.badge}
                    </span>
                  )}
                </div>

                {item.imageSrc && (
                  <div className="rounded-2xl overflow-hidden aspect-video border border-slate-800 my-2">
                    <img src={item.imageSrc} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                )}

                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {item.url && (
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <a
                    href={item.url}
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  >
                    <span>קרא עוד</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
