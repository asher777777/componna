import React, { useState } from 'react';
import { BeforeAfterSectionConfig } from '../../types/sectionConfigs';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export const BeforeAfterSection: React.FC<{ config: BeforeAfterSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'השפעה ושינוי: לפני ואחרי',
    subtitle = 'תוצאות מוכחות בשטח',
    description,
    beforeImage = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1000&q=80',
    afterImage = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
    beforeLabel = 'לפני',
    afterLabel = 'אחרי',
    defaultPosition = 50,
    backgroundColor = 'transparent',
  } = config;

  const [sliderPos, setSliderPos] = useState<number>(defaultPosition);

  return (
    <section
      id={anchorId || 'beforeAfter'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{subtitle}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Interactive Slider Box */}
        <div className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none group">
          {/* After Image (Full background) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-black text-emerald-400 z-10 shadow-lg">
            {afterLabel}
          </div>

          {/* Before Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${100 - sliderPos}%`, left: 'auto', right: 0 }}
          >
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="absolute top-0 right-0 h-full object-cover max-w-none pointer-events-none"
              style={{ width: '100%', minWidth: '800px', objectFit: 'cover' }}
            />
          </div>
          <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-black text-slate-300 z-10 shadow-lg">
            {beforeLabel}
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 pointer-events-none flex items-center justify-center"
            style={{ right: `${sliderPos}%` }}
          >
            <div className="w-9 h-9 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>

          {/* Invisible Range Input for Dragging */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />
        </div>

        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>💡 גררו את הסליידר ימינה ושמאלה לצפייה בשינוי</span>
        </span>
      </div>
    </section>
  );
};
