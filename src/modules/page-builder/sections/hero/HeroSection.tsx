import React from 'react';
import { HeroSectionConfig } from '../../types/sectionConfigs';
import { Sparkles, ArrowLeft, Star, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const HeroSection: React.FC<{ config: HeroSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title,
    subtitle,
    description,
    imageSrc,
    layout = 'bento-hero',
    heroStyle = 'mesh-glow',
    buttonsVisible = true,
    primaryButton,
    secondaryButton,
    backgroundColor = 'transparent',
    titleColor,
    descriptionColor,
    announcementBadge,
    socialProofAvatars,
  } = config;

  return (
    <section
      id={anchorId || 'hero'}
      className={clsx(
        'relative w-full py-16 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300',
        heroStyle === 'mesh-glow' && 'bg-gradient-to-b from-white via-indigo-50/50 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950',
        heroStyle === 'modern' && 'bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-950',
        heroStyle !== 'mesh-glow' && heroStyle !== 'modern' && 'bg-white dark:bg-slate-950'
      )}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
        {/* Announcement Pill */}
        {announcementBadge?.text && (
          <a
            href={announcementBadge.url || '#'}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6 transition-all hover:scale-105 shadow-sm shadow-indigo-500/5 group"
          >
            <span>{announcementBadge.text}</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </a>
        )}

        {/* Main Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] max-w-4xl drop-shadow-sm"
          style={{ color: titleColor }}
        >
          {title}
        </h1>

        {/* Subtitle / Description */}
        {description && (
          <p
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mt-6"
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        )}

        {/* Call to Action Buttons */}
        {buttonsVisible && (primaryButton || secondaryButton) && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            {primaryButton?.text && (
              <a
                href={primaryButton.url || '#'}
                target={primaryButton.target}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/20 dark:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{primaryButton.text}</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
            )}
            {secondaryButton?.text && (
              <a
                href={secondaryButton.url || '#'}
                target={secondaryButton.target}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-sm sm:text-base shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <span>{secondaryButton.text}</span>
              </a>
            )}
          </div>
        )}

        {/* Social Proof Avatars Stack */}
        {socialProofAvatars?.visible && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center -space-x-2.5 overflow-hidden">
              {(socialProofAvatars.avatars || []).map((av, idx) => (
                <img
                  key={av.id || idx}
                  src={av.avatarUrl}
                  alt={av.name || 'User'}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950 object-cover"
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(socialProofAvatars.starsCount || 5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            {socialProofAvatars.ratingText && (
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {socialProofAvatars.ratingText}
              </span>
            )}
          </div>
        )}

        {/* Media Frame Showcase */}
        {imageSrc && (
          <div className="mt-16 w-full max-w-5xl p-2 sm:p-4 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 group">
            <div className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 relative">
               {/* Browser mock UI for the image */}
               <div className="flex items-center px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                 <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                 </div>
               </div>
              <img
                src={imageSrc}
                alt={title}
                className="w-full h-auto object-cover max-h-[600px] group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
