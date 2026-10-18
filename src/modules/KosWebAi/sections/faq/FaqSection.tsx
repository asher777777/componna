import React, { useState } from 'react';
import { FaqSectionConfig, FaqLayoutPreset, HeroTextBgEffect } from '../../types/sectionConfigs';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import {
  ChevronDown,
  Search,
  Sparkles,
  MessageCircle,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';

export const FaqSection: React.FC<{ config: FaqSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'שאלות ותשובות נפוצות',
    subtitle = 'כל מה שחשוב לדעת',
    titleColor,
    subtitleColor,
    showSearchBar = true,
    showContactCard = true,
    whatsappContact,
    backgroundColor = 'transparent',
    cardBackgroundColor,
    items = [],
    layout = 'standard',
    objectScale = 'auto',
    buttonShape = 'auto',
    buttonSize = 'auto',
    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor,
    textBgOverlayOpacity,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
  } = config;

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedLayout: FaqLayoutPreset =
    !layout || layout === 'current' ? 'standard' : layout;

  const filteredItems = items.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  // Sizing helpers
  const getHeadingScaleClass = (defaultClass: string) => {
    if (objectScale === 'compact') return 'text-2xl sm:text-3xl';
    if (objectScale === 'normal') return 'text-3xl sm:text-4xl';
    if (objectScale === 'large') return 'text-3xl sm:text-5xl';
    if (objectScale === 'massive') return 'text-4xl sm:text-6xl';
    return defaultClass;
  };

  const getButtonShapeClass = (defaultRadius: string) => {
    if (buttonShape === 'pill') return 'rounded-full';
    if (buttonShape === 'rounded') return 'rounded-2xl';
    if (buttonShape === 'sharp') return 'rounded-none';
    if (buttonShape === 'chiseled') return 'rounded-lg';
    return defaultRadius;
  };

  const getButtonSizeClass = (defaultSize: string) => {
    if (buttonSize === 'sm') return 'px-4 py-2 text-xs';
    if (buttonSize === 'md') return 'px-5 py-2.5 text-xs sm:text-sm';
    if (buttonSize === 'lg') return 'px-7 py-3 text-sm sm:text-base';
    if (buttonSize === 'xl') return 'px-9 py-4 text-base sm:text-lg';
    return defaultSize;
  };

  // Text Background Overlay & Effects
  const effectiveBgImage =
    textBgImageUrl ||
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80';
  const overlayAlpha = Math.min(95, Math.max(10, textBgOverlayOpacity ?? 72)) / 100;

  const defaultOverlayHex = (() => {
    if (textBgOverlayColor && textBgOverlayColor !== 'transparent') return textBgOverlayColor;
    switch (normalizedLayout) {
      case 'feminine':
        return '#250d18';
      case 'masculine':
        return '#090a0f';
      case 'spiritual':
        return '#061614';
      case 'sharp':
        return '#050505';
      case 'analytical':
        return '#050e1c';
      default:
        return '#0f172a';
    }
  })();

  const renderTextBgLayer = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <img
        src={effectiveBgImage}
        alt="Text backdrop"
        className={clsx(
          'w-full h-full object-cover transition-all ease-out',
          textBgEffect === 'zoom-glow' && 'duration-1000 group-hover/textbg:scale-110',
          textBgEffect === 'shimmer-sweep' && 'duration-700 group-hover/textbg:scale-105',
          textBgEffect === 'float-parallax' &&
            'duration-700 scale-105 group-hover/textbg:scale-110 group-hover/textbg:-translate-y-2',
          textBgEffect === 'blur-reveal' &&
            'duration-700 blur-[3px] scale-105 group-hover/textbg:blur-0 group-hover/textbg:scale-100',
          textBgEffect === 'gradient-shift' &&
            'duration-1000 group-hover/textbg:scale-105 group-hover/textbg:rotate-1'
        )}
      />
      <div
        className="absolute inset-0 transition-opacity duration-500 group-hover/textbg:opacity-85"
        style={{
          backgroundColor: defaultOverlayHex,
          opacity: overlayAlpha,
        }}
      />
      {textBgEffect === 'shimmer-sweep' && (
        <div className="absolute inset-0 -translate-x-full group-hover/textbg:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      )}
      {textBgEffect === 'zoom-glow' && (
        <div className="absolute inset-0 opacity-0 group-hover/textbg:opacity-100 transition-opacity duration-700 bg-radial from-white/15 via-transparent to-transparent" />
      )}
      {textBgEffect === 'gradient-shift' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-transparent to-amber-500/30 opacity-40 group-hover/textbg:opacity-80 transition-opacity duration-700" />
      )}
      {textBgEffect === 'float-parallax' && (
        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 group-hover/textbg:ring-white/50 transition-all duration-700" />
      )}
    </div>
  );

  const wrapTextWithOptionalBg = (content: React.ReactNode, cardRadiusClass = 'rounded-3xl') => {
    if (!textBgEnabled || textBgScope === 'full-section') {
      return content;
    }
    return (
      <div
        className={clsx(
          'relative overflow-hidden p-6 sm:p-10 transition-all duration-500 shadow-2xl border border-white/15 group/textbg w-full',
          cardRadiusClass
        )}
      >
        {renderTextBgLayer()}
        <div className="relative z-10">{content}</div>
      </div>
    );
  };

  // ============================================================================
  // א. פריסה בסגנון נשי (Feminine Style - Soft, Rose-Gold, Capsule Pills)
  // ============================================================================
  if (normalizedLayout === 'feminine') {
    return (
      <section
        id={anchorId || 'faq'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#fff9fb] via-[#fdf2f6] to-[#fcf6f0] dark:from-[#160c12] dark:via-[#1e1018] dark:to-[#120b0f] transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute -top-16 right-12 w-[340px] h-[340px] bg-rose-300/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-800 dark:text-rose-200 text-xs font-medium w-fit">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400/40" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                  'font-bold tracking-normal leading-[1.25]',
                  textBgEnabled ? 'text-white' : 'text-rose-950 dark:text-rose-50'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-[2.5rem]'
          )}

          {showSearchBar && (
            <div className="relative max-w-xl mx-auto w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש שאלה או מילת מפתח..."
                className="w-full bg-white/90 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-800/60 rounded-full pr-11 pl-4 py-3 text-sm text-rose-950 dark:text-rose-100 placeholder-rose-400/70 focus:outline-none focus:border-rose-400 shadow-lg shadow-rose-200/20 backdrop-blur-md"
              />
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            {filteredItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id || index}
                  style={{ backgroundColor: cardBackgroundColor }}
                  className={clsx(
                    'rounded-[2rem] border transition-all duration-500 overflow-hidden backdrop-blur-md',
                    isOpen
                      ? 'bg-white/95 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 shadow-xl shadow-rose-200/30'
                      : 'bg-white/80 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40 hover:border-rose-300'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-rose-950 dark:text-rose-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                        <DynamicIcon name={item.icon || 'Sparkles'} className="w-4 h-4" />
                      </div>
                      <span>{item.question}</span>
                    </div>
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300',
                        isOpen
                          ? 'bg-rose-500 text-white rotate-180 shadow-md'
                          : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 text-stone-600 dark:text-rose-100/80 text-sm sm:text-base leading-relaxed border-t border-rose-100 dark:border-rose-900/40 pt-4 animate-in slide-in-from-top-2">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showContactCard && (
            <div className="mt-4 p-6 rounded-[2.5rem] bg-gradient-to-r from-rose-50 via-white to-rose-50 dark:from-rose-950/30 dark:via-rose-900/20 dark:to-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-lg">
              <div>
                <h4 className="text-base font-bold text-rose-950 dark:text-rose-100">
                  יש לכם שאלה אישית שלא מופיעה כאן?
                </h4>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/70 mt-0.5">
                  נשמח להעניק לכם מענה אישי, סבלני ומקיף בוואטסאפ.
                </p>
              </div>
              {whatsappContact && (
                <a
                  href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    'inline-flex items-center gap-2 bg-gradient-to-l from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold transition-all shadow-lg shadow-rose-400/25 shrink-0',
                    getButtonShapeClass('rounded-full'),
                    getButtonSizeClass('px-6 py-2.5 text-xs sm:text-sm')
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>מענה אישי בוואטסאפ</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ב. פריסה בסגנון גברי (Masculine Style - Bold, Charcoal, Gold & Steel)
  // ============================================================================
  if (normalizedLayout === 'masculine') {
    return (
      <section
        id={anchorId || 'faq'}
        className="w-full py-18 md:py-26 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-[#090a0f] via-[#12141c] to-[#090a0f] text-white transition-colors duration-300 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        <div className="max-w-4xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider w-fit">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl lg:text-6xl'),
                  'font-black tracking-tight text-white leading-[1.08]'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-xl'
          )}

          {showSearchBar && (
            <div className="relative max-w-xl mx-auto w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש שאלה או מילת מפתח..."
                className="w-full bg-zinc-900/90 border-2 border-zinc-700 hover:border-amber-500/60 focus:border-amber-400 rounded-xl pr-11 pl-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none shadow-xl"
              />
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            {filteredItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id || index}
                  style={{ backgroundColor: cardBackgroundColor }}
                  className={clsx(
                    'rounded-xl border-2 transition-all duration-300 overflow-hidden',
                    isOpen
                      ? 'bg-zinc-900/95 border-amber-500 shadow-2xl shadow-amber-500/10'
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-black text-base sm:text-lg text-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                        <DynamicIcon name={item.icon || 'Shield'} className="w-4 h-4" />
                      </div>
                      <span>{item.question}</span>
                    </div>
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300',
                        isOpen
                          ? 'bg-amber-500 text-slate-950 rotate-180 font-black'
                          : 'bg-zinc-800 text-zinc-400'
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 text-zinc-300 text-sm sm:text-base leading-relaxed border-t-2 border-zinc-800 pt-4 font-medium">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showContactCard && (
            <div className="mt-4 p-6 rounded-xl bg-zinc-900/90 border-2 border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-2xl">
              <div>
                <h4 className="text-base font-black text-white">מענה ישיר וממוקד לכל שאלה</h4>
                <p className="text-xs text-zinc-400 mt-0.5">פנו למוקד המקצועי לשיחה ישירה בוואטסאפ.</p>
              </div>
              {whatsappContact && (
                <a
                  href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    'inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border-2 border-amber-400 shadow-[0_12px_32px_-6px_rgba(245,158,11,0.45)] transition-all shrink-0',
                    getButtonShapeClass('rounded-lg'),
                    getButtonSizeClass('px-7 py-3 text-xs sm:text-sm')
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>שיחה ישירה בוואטסאפ</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ד. פריסה רוחנית (Spiritual Style - Zen, Sage/Teal & Sacred Halo)
  // ============================================================================
  if (normalizedLayout === 'spiritual') {
    return (
      <section
        id={anchorId || 'faq'}
        className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-[#faf8f5] via-[#f2f7f5] to-[#f8f5ee] dark:from-[#071110] dark:via-[#0b1c1a] dark:to-[#071110] transition-colors duration-700 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        <div className="max-w-4xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-teal-50/90 dark:bg-teal-950/60 border border-teal-300/60 dark:border-teal-600/40 text-teal-800 dark:text-teal-200 text-xs font-medium tracking-widest w-fit">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl'),
                  'font-semibold tracking-wide leading-[1.3]',
                  textBgEnabled ? 'text-white' : 'text-stone-800 dark:text-stone-100'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-[3rem]'
          )}

          {showSearchBar && (
            <div className="relative max-w-xl mx-auto w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש שאלה או מילת מפתח..."
                className="w-full bg-white/85 dark:bg-teal-950/40 border border-teal-600/25 rounded-full pr-11 pl-4 py-3 text-sm text-stone-800 dark:text-teal-100 placeholder-teal-600/50 focus:outline-none focus:border-teal-500 shadow-md backdrop-blur-md"
              />
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            {filteredItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id || index}
                  style={{ backgroundColor: cardBackgroundColor }}
                  className={clsx(
                    'rounded-[2.25rem] border transition-all duration-700 overflow-hidden backdrop-blur-md',
                    isOpen
                      ? 'bg-white/90 dark:bg-teal-950/40 border-teal-500/40 shadow-xl shadow-teal-500/10'
                      : 'bg-white/70 dark:bg-teal-950/20 border-teal-600/20 dark:border-teal-500/20 hover:border-teal-500/40'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-stone-800 dark:text-stone-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-amber-400/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                        <DynamicIcon name={item.icon || 'Sun'} className="w-4 h-4" />
                      </div>
                      <span>{item.question}</span>
                    </div>
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-500',
                        isOpen
                          ? 'bg-teal-700 text-white rotate-180 ring-2 ring-amber-300/40'
                          : 'bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-[1.85] border-t border-teal-500/15 pt-4">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showContactCard && (
            <div className="mt-4 p-6 rounded-[2.5rem] bg-white/80 dark:bg-teal-950/30 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-md backdrop-blur-md">
              <div>
                <h4 className="text-base font-semibold text-stone-800 dark:text-stone-100">
                  נשמח להקשיב ולהשיב לכל שאלה
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  חיבור אישי, קשוב ונעים לכל פנייה.
                </p>
              </div>
              {whatsappContact && (
                <a
                  href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    'inline-flex items-center gap-2 bg-gradient-to-l from-teal-700 via-emerald-600 to-teal-700 text-white font-medium shadow-xl shadow-teal-700/20 ring-1 ring-amber-300/40 transition-all duration-700 shrink-0',
                    getButtonShapeClass('rounded-full'),
                    getButtonSizeClass('px-7 py-2.5 text-xs sm:text-sm')
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>פנייה שלווה בוואטסאפ</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ה. פריסה חדה (Sharp Style - Brutalist 90° & 2px Offset Shadows)
  // ============================================================================
  if (normalizedLayout === 'sharp') {
    return (
      <section
        id={anchorId || 'faq'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white dark:bg-[#060608] border-b-2 border-slate-950 dark:border-white/20 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none bg-indigo-600 text-white border-2 border-slate-950 dark:border-white text-xs font-mono font-bold uppercase tracking-widest w-fit shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#ffffff]">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl lg:text-6xl'),
                  'font-black tracking-tighter leading-[1.06] uppercase',
                  textBgEnabled ? 'text-white' : 'text-slate-950 dark:text-white'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-none'
          )}

          {showSearchBar && (
            <div className="relative max-w-xl mx-auto w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש שאלה או מילת מפתח..."
                className="w-full bg-white dark:bg-slate-950 border-2 border-slate-950 dark:border-white rounded-none pr-11 pl-4 py-3.5 text-sm text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none shadow-[5px_5px_0px_0px_#6366f1]"
              />
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            {filteredItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id || index}
                  style={{ backgroundColor: cardBackgroundColor }}
                  className={clsx(
                    'rounded-none border-2 border-slate-950 dark:border-white transition-all duration-200 overflow-hidden',
                    isOpen
                      ? 'bg-white dark:bg-slate-950 shadow-[6px_6px_0px_0px_#6366f1]'
                      : 'bg-white dark:bg-slate-950 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#ffffff]'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-black text-base sm:text-lg text-slate-950 dark:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                        0{index + 1}
                      </span>
                      <span>{item.question}</span>
                    </div>
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-none border-2 border-slate-950 dark:border-white flex items-center justify-center shrink-0 transition-transform duration-200',
                        isOpen
                          ? 'bg-indigo-600 text-white rotate-180 shadow-[2px_2px_0px_0px_#050505]'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-950 dark:text-white'
                      )}
                    >
                      <ChevronDown className="w-4 h-4 stroke-[3]" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-snug border-t-2 border-slate-950/20 dark:border-white/20 pt-4 font-medium">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showContactCard && (
            <div className="mt-4 p-6 rounded-none bg-white dark:bg-slate-950 border-2 border-slate-950 dark:border-white shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#ffffff] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
              <div>
                <h4 className="text-base font-black text-slate-950 dark:text-white">
                  לא מצאתם את המענה המדויק?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  פנו ישירות למוקד הפעיל של המערכת.
                </p>
              </div>
              {whatsappContact && (
                <a
                  href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    'inline-flex items-center gap-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black border-2 border-slate-950 dark:border-white shadow-[4px_4px_0px_0px_#6366f1] hover:translate-x-[2px] hover:translate-y-[2px] transition-all shrink-0',
                    getButtonShapeClass('rounded-none'),
                    getButtonSizeClass('px-7 py-3 text-xs sm:text-sm')
                  )}
                >
                  <MessageCircle className="w-4 h-4 stroke-[3]" />
                  <span>מענה ישיר 90°</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ו. פריסה אנליטית (Analytical Style - Data HUD, Telemetry & Cyan/Blue)
  // ============================================================================
  if (normalizedLayout === 'analytical') {
    return (
      <section
        id={anchorId || 'faq'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white dark:from-[#050b14] dark:via-[#081526] dark:to-[#050b14] group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d422_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold w-fit">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl'),
                  'font-extrabold tracking-tight leading-[1.15]',
                  textBgEnabled ? 'text-white' : 'text-slate-900 dark:text-white'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-2xl'
          )}

          {showSearchBar && (
            <div className="relative max-w-xl mx-auto w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש שאלה או מילת מפתח..."
                className="w-full bg-white/95 dark:bg-slate-900/90 border border-cyan-500/30 rounded-2xl pr-11 pl-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-xl"
              />
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            {filteredItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id || index}
                  style={{ backgroundColor: cardBackgroundColor }}
                  className={clsx(
                    'rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md',
                    isOpen
                      ? 'bg-white dark:bg-slate-900/95 border-cyan-500/60 shadow-xl shadow-cyan-500/15'
                      : 'bg-white/85 dark:bg-slate-900/80 border-cyan-500/25 hover:border-cyan-500/40'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-extrabold text-base sm:text-lg text-slate-900 dark:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <DynamicIcon name={item.icon || 'Activity'} className="w-4 h-4" />
                      </div>
                      <span>{item.question}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hidden xs:inline">
                        HUD #{index + 1}
                      </span>
                      <div
                        className={clsx(
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300',
                          isOpen ? 'bg-cyan-600 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-cyan-500'
                        )}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed border-t border-cyan-500/20 pt-4">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showContactCard && (
            <div className="mt-4 p-6 rounded-2xl bg-slate-900/95 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-2xl">
              <div>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>זקוקים לטלמטריה או מענה תמיכה טכני?</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">מוקד פניות ממוחשב בזמן אמת.</p>
              </div>
              {whatsappContact && (
                <a
                  href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    'inline-flex items-center gap-2 bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all shrink-0',
                    getButtonShapeClass('rounded-xl'),
                    getButtonSizeClass('px-6 py-2.5 text-xs sm:text-sm')
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>פנייה טכנולוגית ישירה</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ג. הפריסה העכשווית (Current / Standard - Clean Notion SaaS 2026)
  // ============================================================================
  const isTwoColumns = normalizedLayout === 'two-columns';

  return (
    <section
      id={anchorId || 'faq'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden group/textbg"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

      <div className={clsx(isTwoColumns ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto', 'flex flex-col gap-10 relative z-10')}>
        {wrapTextWithOptionalBg(
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
            {subtitle && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                <span style={{ color: subtitleColor }}>{subtitle}</span>
              </div>
            )}
            <h2
              className={clsx(
                getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                'font-extrabold tracking-tight',
                textBgEnabled ? 'text-white' : 'text-slate-900 dark:text-white'
              )}
              style={{ color: titleColor }}
            >
              {title}
            </h2>
          </div>
        )}

        {/* Quick Search Filter */}
        {showSearchBar && (
          <div className="relative max-w-xl mx-auto w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש שאלה או מילת מפתח..."
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl pr-11 pl-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl backdrop-blur-md"
            />
          </div>
        )}

        {/* Accordion Items */}
        <div className={clsx('grid gap-3', isTwoColumns ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          {filteredItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id || index}
                style={{ backgroundColor: cardBackgroundColor }}
                className={clsx(
                  'rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md',
                  isOpen
                    ? 'bg-white dark:bg-slate-900/90 border-indigo-500/40 shadow-xl'
                    : 'bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-slate-900 dark:text-white"
                >
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <DynamicIcon name={item.icon} className="w-4 h-4" />
                      </div>
                    )}
                    <span>{item.question}</span>
                  </div>
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300',
                      isOpen
                        ? 'bg-indigo-600 text-white rotate-180'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4 animate-in slide-in-from-top-2">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Direct Contact Card */}
        {showContactCard && (
          <div className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-slate-100 via-indigo-50/50 to-slate-100 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">יש לכם שאלה שלא מופיעה כאן?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">הצוות המקצועי שלנו זמין עבורכם לכל מענה ישיר.</p>
            </div>
            {whatsappContact && (
              <a
                href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className={clsx(
                  'inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shrink-0',
                  getButtonShapeClass('rounded-xl'),
                  getButtonSizeClass('px-5 py-2.5 text-xs sm:text-sm')
                )}
              >
                <MessageCircle className="w-4 h-4" />
                <span>שאלו אותנו בוואטסאפ</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
