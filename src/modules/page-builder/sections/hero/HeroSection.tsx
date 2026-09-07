import React from 'react';
import { HeroSectionConfig } from '../../types/sectionConfigs';
import { Sparkles, ArrowLeft, Send } from 'lucide-react';
import { clsx } from 'clsx';

export const HeroSection: React.FC<{ config: HeroSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title,
    subtitle,
    description,
    imageSrc,
    layout = 'fz',
    heroStyle = 'classic',
    flexDirection = 'row',
    buttonsVisible = true,
    primaryButton,
    secondaryButton,
    backgroundColor = 'transparent',
    titleColor,
    descriptionColor,
    formMode,
    formTitle = 'השאירו פרטים ונחזור אליכם בהקדם',
  } = config;

  const isSpatial = layout === 'spatial';
  const isCentered = layout === 'centered';
  const isReverse = flexDirection === 'row-reverse';

  return (
    <section
      id={anchorId || 'hero'}
      className={clsx(
        'relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300',
        heroStyle === 'modern' && 'bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-950',
        heroStyle === 'card' && 'my-6 rounded-3xl border border-slate-800 shadow-2xl'
      )}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Background subtle glow effect */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {isCentered ? (
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
            {subtitle && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{subtitle}</span>
              </div>
            )}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
              style={{ color: titleColor }}
            >
              {title}
            </h1>
            {description && (
              <p
                className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed font-normal"
                style={{ color: descriptionColor }}
              >
                {description}
              </p>
            )}

            {buttonsVisible && (primaryButton || secondaryButton) && (
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    target={primaryButton.target}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-105"
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    target={secondaryButton.target}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm sm:text-base transition-all"
                  >
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}

            {imageSrc && (
              <div className="mt-8 w-full max-w-4xl rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <img src={imageSrc} alt={title} className="w-full h-auto object-cover max-h-[500px]" />
              </div>
            )}
          </div>
        ) : (
          <div
            className={clsx(
              'grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center',
              isReverse && 'lg:flex-row-reverse'
            )}
          >
            {/* Text & Action Column */}
            <div className={clsx('lg:col-span-7 flex flex-col gap-6 text-right', isReverse && 'lg:order-2')}>
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold w-fit">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{subtitle}</span>
                </div>
              )}

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
                style={{ color: titleColor }}
              >
                {title}
              </h1>

              {description && (
                <p
                  className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal"
                  style={{ color: descriptionColor }}
                >
                  {description}
                </p>
              )}

              {buttonsVisible && (primaryButton || secondaryButton) && (
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  {primaryButton?.text && (
                    <a
                      href={primaryButton.url || '#'}
                      target={primaryButton.target}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-105"
                    >
                      <span>{primaryButton.text}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </a>
                  )}
                  {secondaryButton?.text && (
                    <a
                      href={secondaryButton.url || '#'}
                      target={secondaryButton.target}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm sm:text-base transition-all"
                    >
                      <span>{secondaryButton.text}</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Media / Form Column */}
            <div className={clsx('lg:col-span-5 w-full', isReverse && 'lg:order-1')}>
              {formMode ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-2">{formTitle}</h3>
                  <p className="text-xs text-slate-400 mb-6">מלאו את הפרטים ונציג יחזור אליכם בהקדם</p>
                  <form onSubmit={(e) => { e.preventDefault(); alert('הטופס נשלח בהצלחה!'); }} className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="שם מלא"
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="tel"
                      placeholder="מספר טלפון"
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="email"
                      placeholder="אימייל (אופציונלי)"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>שליחת פרטים</span>
                    </button>
                  </form>
                </div>
              ) : imageSrc ? (
                <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl group">
                  <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-auto object-cover max-h-[460px] group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-3xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-sm">
                  לא הוגדרה תמונה
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
