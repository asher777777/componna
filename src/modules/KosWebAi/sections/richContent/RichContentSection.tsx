import React from 'react';
import { RichContentSectionConfig } from '../../types/sectionConfigs';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { clsx } from 'clsx';

export const RichContentSection: React.FC<{ config: RichContentSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    heading = 'אודות הפרויקט והחזון שלנו',
    subtitle,
    body = '',
    layout = 'standard',
    backgroundColor = 'transparent',
    items = [],
  } = config;

  const hasItems = Array.isArray(items) && items.length > 0;
  const isCardsLayout = layout === 'cards-grid-3' || layout === 'cards-grid-2' || hasItems;

  return (
    <section
      id={anchorId || 'richContent'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div
        className={clsx(
          isCardsLayout ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto',
          'text-right flex flex-col gap-8',
          layout === 'highlight-box' &&
            'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl'
        )}
      >
        {(heading || subtitle) && (
          <div className={clsx('flex flex-col gap-2', hasItems && 'text-center items-center max-w-3xl mx-auto')}>
            {subtitle && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                {subtitle}
              </span>
            )}
            {heading && (
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {heading}
              </h2>
            )}
          </div>
        )}

        {body && body.trim() && (
          <div
            className={clsx(
              'text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 font-normal',
              layout === 'two-columns' && 'sm:columns-2 sm:gap-8',
              hasItems && 'max-w-3xl mx-auto text-center'
            )}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}

        {hasItems && (
          <div
            className={clsx(
              'grid gap-6 mt-2',
              layout === 'cards-grid-2'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col gap-3 text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <DynamicIcon name={item.icon || 'Sparkles'} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                </div>
                {(item.text || item.description) && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {item.text || item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
