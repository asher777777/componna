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
        heroStyle === 'mesh-glow' && 'bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950',
        heroStyle === 'modern' && 'bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-950'
      )}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
        {/* Announcement Pill */}
        {announcementBadge?.text && (
          <a
            href={announcementBadge.url || '#'}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-6 transition-all hover:scale-105 shadow-lg shadow-indigo-500/10 group"
          >
            <span>{announcementBadge.text}</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </a>
        )}

        {/* Main Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15] max-w-4xl"
          style={{ color: titleColor }}
        >
          {title}
        </h1>

        {/* Subtitle / Description */}
        {description && (
          <p
            className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl mt-6"
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        )}

        {/* Call to Action Buttons */}
        {buttonsVisible && (primaryButton || secondaryButton) && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {primaryButton?.text && (
              <a
                href={primaryButton.url || '#'}
                target={primaryButton.target}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-black text-sm sm:text-base shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105"
              >
                <span>{primaryButton.text}</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
            )}
            {secondaryButton?.text && (
              <a
                href={secondaryButton.url || '#'}
                target={secondaryButton.target}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base transition-all hover:border-slate-600"
              >
                <span>{secondaryButton.text}</span>
              </a>
            )}
          </div>
        )}

        {/* Social Proof Avatars Stack */}
        {socialProofAvatars?.visible && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 pt-4">
            <div className="flex items-center -space-x-2.5 overflow-hidden">
              {(socialProofAvatars.avatars || []).map((av, idx) => (
                <img
                  key={av.id || idx}
                  src={av.avatarUrl}
                  alt={av.name || 'User'}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 object-cover"
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(socialProofAvatars.starsCount || 5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            {socialProofAvatars.ratingText && (
              <span className="text-xs font-semibold text-slate-300">
                {socialProofAvatars.ratingText}
              </span>
            )}
          </div>
        )}

        {/* Media Frame Showcase */}
        {imageSrc && (
          <div className="mt-12 w-full max-w-5xl rounded-3xl overflow-hidden border border-slate-800/80 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.2)] bg-slate-900 group">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-auto object-cover max-h-[550px] group-hover:scale-[1.01] transition-transform duration-700"
            />
          </div>
        )}
      </div>
    </section>
  );
};
