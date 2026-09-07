import React from 'react';
import { CourseBannerSectionConfig } from '../../types/sectionConfigs';
import { CheckCircle2, ArrowLeft, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';

export const CourseBannerSection: React.FC<{ config: CourseBannerSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title,
    subtitle,
    imageSrc,
    features = [],
    buttonsVisible = true,
    primaryButton,
    backgroundColor = 'transparent',
    bottomStripeColor = '#4f46e5',
  } = config;

  return (
    <section
      id={anchorId || 'mainContent'}
      className="relative w-full py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Top Accent Badge */}
        {subtitle && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
            <GraduationCap className="w-4 h-4" />
            <span>{subtitle}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 text-right">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              {title}
            </h2>

            {features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {buttonsVisible && primaryButton?.text && (
              <div className="mt-4">
                <a
                  href={primaryButton.url || '#'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-105"
                >
                  <span>{primaryButton.text}</span>
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 w-full flex justify-center">
            {imageSrc ? (
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl max-w-sm w-full aspect-video sm:aspect-square">
                <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs">
                ללא תמונת באנר
              </div>
            )}
          </div>
        </div>

        {/* Bottom decorative stripe */}
        <div
          className="absolute bottom-0 inset-x-0 h-1.5"
          style={{ backgroundColor: bottomStripeColor }}
        />
      </div>
    </section>
  );
};
