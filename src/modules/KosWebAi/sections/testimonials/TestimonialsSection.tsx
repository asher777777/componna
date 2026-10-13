import React from 'react';
import { TestimonialsSectionConfig } from '../../types/sectionConfigs';
import { Star, CheckCircle2, Quote, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export const TestimonialsSection: React.FC<{ config: TestimonialsSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'מה הלקוחות שלנו מספרים?',
    subtitle = 'המלצות וביקורות מאומתות',
    description,
    backgroundColor = 'transparent',
    showRatingSummary = true,
    overallRating = 4.9,
    totalReviewsCount = '250+ ביקורות בגוגל וברשת',
    trustBadgeText = 'לקוחות מאומתים 100%',
    items = [],
  } = config;

  return (
    <section
      id={anchorId || 'testimonials'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-12 relative z-10">
        {/* Header & Rating Summary */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{subtitle}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {description}
            </p>
          )}

          {showRatingSummary && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-white">
                {overallRating} מתוך 5.0
              </span>
              <span className="text-xs text-slate-400">({totalReviewsCount})</span>
              {trustBadgeText && (
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{trustBadgeText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-xl hover:border-indigo-500/40 hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div className="flex flex-col gap-4 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-indigo-500/30 group-hover:text-indigo-400 transition-colors" />
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  {item.content}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-right">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700 shadow-md"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{item.name}</span>
                      {item.isVerified !== false && (
                        <span title="לקוח מאומת">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    {(item.role || item.company) && (
                      <span className="text-xs text-slate-400 block">
                        {[item.role, item.company].filter(Boolean).join(' • ')}
                      </span>
                    )}
                  </div>
                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
