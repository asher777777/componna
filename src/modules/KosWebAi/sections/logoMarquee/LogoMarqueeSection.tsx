import React from 'react';
import { LogoMarqueeSectionConfig } from '../../types/sectionConfigs';
import { clsx } from 'clsx';

export const LogoMarqueeSection: React.FC<{ config: LogoMarqueeSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'נבחר על ידי הארגונים והמותגים המובילים',
    backgroundColor = 'transparent',
    grayscale = false,
    logos = [],
  } = config;

  if (!logos || logos.length === 0) return null;

  // Duplicate list to achieve seamless infinite scroll
  const displayLogos = [...logos, ...logos, ...logos];

  return (
    <section
      id={anchorId || 'partners'}
      className="w-full py-10 px-4 sm:px-6 lg:px-8 border-y border-slate-800/60 overflow-hidden relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : '#08080a' }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 text-center">
        {title && (
          <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
        )}

        {/* Gradient edge masks */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-[#08080a] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-[#08080a] to-transparent z-10 pointer-events-none" />

          {/* Marquee Row */}
          <div className="flex items-center gap-12 sm:gap-16 w-max animate-marquee">
            {displayLogos.map((item, idx) => (
              <div
                key={`${item.id}_${idx}`}
                className={clsx(
                  'flex items-center justify-center h-12 min-w-[120px] transition-all duration-300 opacity-60 hover:opacity-100 hover:scale-110',
                  grayscale && 'filter grayscale hover:grayscale-0'
                )}
              >
                {item.logoUrl ? (
                  <img src={item.logoUrl} alt={item.name} className="max-h-9 max-w-[140px] object-contain" />
                ) : (
                  <span className="text-sm font-bold text-slate-300">{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
