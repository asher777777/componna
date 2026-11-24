import React from 'react';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';
import { resolveStylePresetTokens } from '../../utils/stylePresetTheme';

export interface ServicesGridItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  icon?: string;
  imageSrc?: string;
  isVisible?: boolean;
}

export interface ServicesGridConfig {
  id?: string;
  type?: 'services';
  visible?: boolean;
  anchorId?: string;
  title?: string;
  description?: string;
  layout?: 'grid' | 'carousel' | 'image-card' | 'hover-card';
  columns?: number;
  backgroundColor?: string;
  stylePreset?: string;
  items?: ServicesGridItem[];
}

const getIcon = (iconName?: string) => {
  if (!iconName) return LucideIcons.Star;
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Star;
};

export const ServicesGridSection: React.FC<{ config: ServicesGridConfig }> = ({ config }) => {
  if (config.visible === false) return null;

  const styleTokens = resolveStylePresetTokens((config as any).stylePreset);
  const {
    anchorId = 'services',
    title = 'השירותים והתכניות שלנו',
    description = '',
    layout = 'grid',
    columns = 3,
    backgroundColor = 'transparent',
    items = [],
  } = config;

  const visibleItems = items.filter((item) => item.isVisible !== false);

  const gridColsClass =
    layout === 'carousel'
      ? 'flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4'
      : columns === 1
      ? 'grid grid-cols-1 gap-6'
      : columns === 2
      ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
      : columns === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <section
      id={anchorId}
      dir="rtl"
      className={clsx('w-full py-14 px-4 sm:px-6 lg:px-8', styleTokens.sectionWrapperClass)}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
    >
      <div className="max-w-6xl mx-auto">
        {(title || description) && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={gridColsClass}>
          {visibleItems.map((item) => {
            const Icon = getIcon(item.icon);
            const cardContent = (
              <div
                className={clsx(
                  'h-full p-6 flex flex-col justify-between gap-4 transition-all duration-300',
                  styleTokens.cardClass,
                  layout === 'hover-card' && 'hover:-translate-y-1.5 hover:shadow-2xl',
                  layout === 'image-card' && 'overflow-hidden p-0'
                )}
              >
                {item.imageSrc && (
                  <div className={clsx('w-full overflow-hidden', layout === 'image-card' ? 'h-48' : 'h-40 rounded-2xl')}>
                    <img
                      src={item.imageSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className={clsx('flex flex-col gap-3', layout === 'image-card' && 'p-6')}>
                  <div className={clsx('w-12 h-12 flex items-center justify-center', styleTokens.badgeClass)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );

            const wrapperClass = layout === 'carousel' ? 'block h-full shrink-0 w-[85%] sm:w-[320px] snap-start' : 'block h-full';

            return item.url ? (
              <a key={item.id} href={item.url} className={wrapperClass}>
                {cardContent}
              </a>
            ) : (
              <div key={item.id} className={wrapperClass}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
