import React from 'react';
import { RichContentSectionConfig, RichContentLayoutPreset } from '../../types/sectionConfigs';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import {
  ArrowLeft,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  TrendingUp,
  Sparkles,
  Quote,
  Compass,
  Milestone,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { clsx } from 'clsx';

export const RichContentSection: React.FC<{ config: RichContentSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    heading = 'אודות הפרויקט והחזון שלנו',
    subtitle,
    body = '',
    imageSrc,
    layout = 'standard',
    contentLayout,
    objectScale = 'auto',
    buttonShape = 'auto',
    buttonSize = 'auto',
    imagePosition = 'auto',
    buttonsVisible = false,
    primaryButton,
    secondaryButton,
    backgroundColor = 'transparent',
    headingColor,
    bodyColor,
    primaryButtonColor,
    secondaryButtonColor,
    textBgEnabled = false,
    textBgImageUrl,
    textBgOverlayColor,
    textBgOverlayOpacity = 70,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
    items = [],
  } = config;

  const hasItems = Array.isArray(items) && items.length > 0;
  const hasButtons = Boolean(buttonsVisible && (primaryButton?.text || secondaryButton?.text));

  // Normalize layout
  const normalizedLayout: RichContentLayoutPreset =
    !layout || layout === 'current' ? 'standard' : layout;

  const effectiveContentMode =
    contentLayout ||
    (normalizedLayout === 'split-story' ||
    normalizedLayout === 'quote-hero' ||
    normalizedLayout === 'timeline-vision' ||
    normalizedLayout === 'bento-about' ||
    normalizedLayout === 'two-columns' ||
    normalizedLayout === 'highlight-box' ||
    normalizedLayout === 'cards-grid-3' ||
    normalizedLayout === 'cards-grid-2'
      ? normalizedLayout
      : 'standard');

  const isCurrentLayout =
    normalizedLayout === 'standard' ||
    normalizedLayout === 'two-columns' ||
    normalizedLayout === 'highlight-box' ||
    normalizedLayout === 'cards-grid-3' ||
    normalizedLayout === 'cards-grid-2' ||
    normalizedLayout === 'split-story' ||
    normalizedLayout === 'quote-hero' ||
    normalizedLayout === 'timeline-vision' ||
    normalizedLayout === 'bento-about' ||
    Boolean(contentLayout);

  const effectiveBgImage =
    textBgImageUrl ||
    imageSrc ||
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
  const overlayAlpha = Math.min(95, Math.max(10, textBgOverlayOpacity ?? 70)) / 100;

  const defaultOverlayHex = (() => {
    if (textBgOverlayColor && textBgOverlayColor !== 'transparent') return textBgOverlayColor;
    switch (normalizedLayout) {
      case 'feminine':
        return '#2e101f';
      case 'masculine':
        return '#09090b';
      case 'spiritual':
        return '#091e1c';
      case 'sharp':
        return '#050505';
      case 'analytical':
        return '#06101e';
      default:
        return '#0f172a';
    }
  })();

  // Object scale helpers
  const getHeadingScaleClass = (defaultClass: string) => {
    if (objectScale === 'compact') return 'text-2xl sm:text-3xl';
    if (objectScale === 'normal') return 'text-3xl sm:text-4xl';
    if (objectScale === 'large') return 'text-3xl sm:text-5xl';
    if (objectScale === 'massive') return 'text-4xl sm:text-5xl md:text-6xl';
    return defaultClass;
  };

  const getBodyScaleClass = (defaultClass: string) => {
    if (objectScale === 'compact') return 'text-sm sm:text-base';
    if (objectScale === 'normal') return 'text-base sm:text-lg';
    if (objectScale === 'large') return 'text-lg sm:text-xl';
    if (objectScale === 'massive') return 'text-xl sm:text-2xl';
    return defaultClass;
  };

  // Button shape & size overrides
  const getButtonShapeClass = (defaultRadius: string) => {
    if (buttonShape === 'pill') return 'rounded-full';
    if (buttonShape === 'rounded') return 'rounded-2xl';
    if (buttonShape === 'sharp') return 'rounded-none';
    if (buttonShape === 'chiseled') return 'rounded-lg';
    return defaultRadius;
  };

  const getButtonSizeClass = (defaultSize: string) => {
    if (buttonSize === 'sm') return 'px-5 py-2.5 text-xs sm:text-sm';
    if (buttonSize === 'md') return 'px-7 py-3.5 text-sm sm:text-base';
    if (buttonSize === 'lg') return 'px-9 py-4 text-base sm:text-lg';
    if (buttonSize === 'xl') return 'px-11 py-5 text-lg sm:text-xl';
    return defaultSize;
  };

  // Render background image + overlay + hover transition layer ("אפקט עובר")
  const renderTextBgLayer = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[inherit]">
      <img
        src={effectiveBgImage}
        alt=""
        aria-hidden="true"
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
        className="absolute inset-0 transition-opacity duration-500 group-hover/textbg:opacity-80"
        style={{
          backgroundColor: defaultOverlayHex,
          opacity: overlayAlpha,
        }}
      />
      {textBgEffect === 'shimmer-sweep' && (
        <div className="absolute inset-0 -translate-x-full group-hover/textbg:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
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
  // ג. הפריסה העכשווית (Current / Standard - Exact Existing Design + Enhancements)
  // ============================================================================
  if (isCurrentLayout) {
    const isCardsLayout =
      normalizedLayout === 'cards-grid-3' || normalizedLayout === 'cards-grid-2' || hasItems;
    const pos = imagePosition === 'auto' ? 'left' : imagePosition;
    const isStack = !imageSrc || pos === 'top' || pos === 'bottom';

    const currentImageBlock = imageSrc && (
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl group max-w-lg mx-auto w-full">
        <img
          src={imageSrc}
          alt={heading}
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    );

    const mainContentBody = (
      <div className="flex flex-col gap-6">
        {(heading || subtitle) && (
          <div
            className={clsx(
              'flex flex-col gap-2',
              (hasItems || isStack) && 'text-center items-center max-w-3xl mx-auto'
            )}
          >
            {subtitle && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold w-fit">
                {subtitle}
              </span>
            )}
            {heading && (
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-4xl'),
                  'font-extrabold tracking-tight leading-tight',
                  textBgEnabled ? 'text-white' : 'text-slate-900 dark:text-white'
                )}
                style={{ color: headingColor }}
              >
                {heading}
              </h2>
            )}
          </div>
        )}

        {body && body.trim() && (
          <div
            className={clsx(
              getBodyScaleClass('text-base sm:text-lg'),
              'leading-relaxed space-y-4 font-normal',
              textBgEnabled ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300',
              normalizedLayout === 'two-columns' && 'sm:columns-2 sm:gap-8',
              hasItems && 'max-w-3xl mx-auto text-center'
            )}
            style={{ color: bodyColor }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}

        {hasButtons && (
          <div className={clsx('flex flex-wrap items-center gap-4 pt-2', hasItems && 'justify-center')}>
            {primaryButton?.text && (
              <a
                href={primaryButton.url || '#'}
                target={primaryButton.target}
                style={{ backgroundColor: primaryButtonColor || undefined }}
                className={clsx(
                  'inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5',
                  getButtonShapeClass('rounded-2xl'),
                  getButtonSizeClass('px-7 py-3.5 text-sm sm:text-base')
                )}
              >
                <span>{primaryButton.text}</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
            )}
            {secondaryButton?.text && (
              <a
                href={secondaryButton.url || '#'}
                target={secondaryButton.target}
                style={{ backgroundColor: secondaryButtonColor || undefined }}
                className={clsx(
                  'inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold transition-all',
                  getButtonShapeClass('rounded-2xl'),
                  getButtonSizeClass('px-7 py-3.5 text-sm sm:text-base')
                )}
              >
                <span>{secondaryButton.text}</span>
              </a>
            )}
          </div>
        )}
      </div>
    );

    return (
      <section
        id={anchorId || 'richContent'}
        className="relative w-full py-16 px-4 sm:px-6 lg:px-8 overflow-hidden group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        <div
          className={clsx(
            isCardsLayout ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto',
            'relative z-10 text-right flex flex-col gap-8',
            normalizedLayout === 'highlight-box' &&
              'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl'
          )}
        >
          {effectiveContentMode === 'split-story' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-7 flex flex-col gap-6 text-right">
                {wrapTextWithOptionalBg(mainContentBody)}
              </div>
              <div className="lg:col-span-5 relative">
                {imageSrc ? (
                  <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl group">
                    <img
                      src={imageSrc}
                      alt={heading}
                      className="w-full h-[440px] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 right-6 left-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>תמצית החזון והשליחות</span>
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-2">
                        {subtitle || heading}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-indigo-500/10 border border-white/10 shadow-2xl flex flex-col justify-center min-h-[350px]">
                    <Quote className="w-12 h-12 text-amber-400 mb-4 opacity-70" />
                    <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed italic mb-4">
                      ״{subtitle || heading}״
                    </p>
                    <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      החזון והשליחות המנחים אותנו
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : effectiveContentMode === 'quote-hero' ? (
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
              <div className="w-14 h-14 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                <Quote className="w-7 h-7" />
              </div>
              {wrapTextWithOptionalBg(mainContentBody)}
            </div>
          ) : effectiveContentMode === 'timeline-vision' ? (
            <div className="max-w-5xl mx-auto flex flex-col gap-10">
              <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
                {wrapTextWithOptionalBg(mainContentBody)}
              </div>
              <div className="relative mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {(hasItems ? items : [
                    { id: '1', title: '1. החזון והיסודות', text: 'הגדרת השליחות והערכים המרכזיים המובילים את פעילותנו.', icon: 'Compass' },
                    { id: '2', title: '2. צמיחה ועשייה', text: 'פיתוח מתמיד, חיבור לקהילה ומתן מענה מקצועי ללא פשרות.', icon: 'Activity' },
                    { id: '3', title: '3. העתיד והיעדים', text: 'הרחבת ההשפעה, חדשנות פורצת דרך והובלת הסטנדרט קדימה.', icon: 'Sparkles' }
                  ]).map((it, idx) => (
                    <div key={it.id || idx} className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xl flex flex-col items-center text-center gap-3 hover:border-amber-500/40 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-base">
                        <DynamicIcon name={it.icon || 'Sparkles'} className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{it.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{it.text || it.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : effectiveContentMode === 'bento-about' ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-white dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950 border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col justify-between gap-6">
                {wrapTextWithOptionalBg(mainContentBody)}
              </div>
              <div className="lg:col-span-5 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative min-h-[300px]">
                {imageSrc ? (
                  <img src={imageSrc} alt={heading} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                    <Sparkles className="w-12 h-12 text-amber-400 mb-3" />
                    <p className="text-lg font-bold text-white">מחויבים לאיכות ולחזון</p>
                  </div>
                )}
              </div>
            </div>
          ) : isStack ? (
            <div className="flex flex-col gap-8">
              {pos === 'top' && currentImageBlock}
              {wrapTextWithOptionalBg(mainContentBody)}
              {pos === 'bottom' && currentImageBlock}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-5">{currentImageBlock}</div>
                  <div className="lg:col-span-7">{wrapTextWithOptionalBg(mainContentBody)}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-7">{wrapTextWithOptionalBg(mainContentBody)}</div>
                  <div className="lg:col-span-5">{currentImageBlock}</div>
                </>
              )}
            </div>
          )}

          {hasItems && effectiveContentMode !== 'timeline-vision' && (
            <div
              className={clsx(
                'grid gap-6 mt-2',
                normalizedLayout === 'cards-grid-2'
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
  }

  // ============================================================================
  // א. פריסה בסגנון נשי (Feminine Style - Soft, Rose-Gold, Arched Image & Pill Cards)
  // ============================================================================
  if (normalizedLayout === 'feminine') {
    const pos = imagePosition === 'auto' ? 'left' : imagePosition;
    const isStack = !imageSrc || pos === 'top' || pos === 'bottom';

    const textAndCards = (
      <div className="flex flex-col gap-8">
        {wrapTextWithOptionalBg(
          <div className={clsx('flex flex-col gap-4', isStack ? 'items-center text-center' : 'items-start text-right')}>
            {subtitle && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-800 dark:text-rose-200 text-xs font-medium w-fit">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400/40" />
                <span>{subtitle}</span>
              </span>
            )}
            {heading && (
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl'),
                  'font-bold tracking-normal leading-[1.25]',
                  textBgEnabled ? 'text-white' : 'text-rose-950 dark:text-rose-50'
                )}
                style={{ color: headingColor }}
              >
                {heading}
              </h2>
            )}
            {body && body.trim() && (
              <div
                className={clsx(
                  getBodyScaleClass('text-base sm:text-lg'),
                  'leading-[1.85] space-y-4 font-normal',
                  textBgEnabled ? 'text-rose-100/95' : 'text-stone-600 dark:text-rose-100/80',
                  isStack && 'max-w-3xl mx-auto'
                )}
                style={{ color: bodyColor }}
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
            {hasButtons && (
              <div className={clsx('flex flex-wrap items-center gap-4 pt-3', isStack && 'justify-center')}>
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    target={primaryButton.target}
                    style={{ backgroundColor: primaryButtonColor || undefined }}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-gradient-to-l from-rose-400 via-pink-500 to-rose-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold shadow-xl shadow-rose-400/30 transition-all duration-500 hover:scale-[1.03]',
                      getButtonShapeClass('rounded-full'),
                      getButtonSizeClass('px-8 py-3.5 text-sm sm:text-base')
                    )}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    target={secondaryButton.target}
                    style={{ backgroundColor: secondaryButtonColor || undefined }}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-white/85 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 border border-rose-200 dark:border-rose-700/50 font-semibold backdrop-blur-md transition-all duration-500',
                      getButtonShapeClass('rounded-full'),
                      getButtonSizeClass('px-7 py-3.5 text-sm sm:text-base')
                    )}
                  >
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>,
          'rounded-[2.75rem]'
        )}

        {hasItems && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group bg-white/85 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-800/40 rounded-[2.25rem] p-6 shadow-lg shadow-rose-200/20 dark:shadow-none hover:border-rose-400/60 transition-all duration-500 flex flex-col gap-3 text-right backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <DynamicIcon name={item.icon || 'Sparkles'} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-rose-950 dark:text-rose-100 leading-snug">
                    {item.title}
                  </h3>
                </div>
                {(item.text || item.description) && (
                  <p className="text-sm sm:text-base text-stone-600 dark:text-rose-100/75 leading-relaxed whitespace-pre-line">
                    {item.text || item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const imageBlock = imageSrc && (
      <div className="relative flex justify-center items-center w-full">
        <div className="relative w-full max-w-md p-3 rounded-t-[9rem] rounded-b-[2.5rem] bg-white/75 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 shadow-2xl shadow-rose-300/25 group">
          <div className="overflow-hidden rounded-t-[8.2rem] rounded-b-[2rem] aspect-[4/5]">
            <img
              src={imageSrc}
              alt={heading}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          </div>
        </div>
      </div>
    );

    return (
      <section
        id={anchorId || 'richContent'}
        className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#fff9fb] via-[#fdf2f6] to-[#fcf6f0] dark:from-[#160c12] dark:via-[#1e1018] dark:to-[#120b0f] transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute -top-16 right-12 w-[360px] h-[360px] bg-rose-300/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {isStack ? (
            <div className="flex flex-col gap-10">
              {pos === 'top' && imageBlock}
              {textAndCards}
              {pos === 'bottom' && imageBlock}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-5">{imageBlock}</div>
                  <div className="lg:col-span-7">{textAndCards}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-7">{textAndCards}</div>
                  <div className="lg:col-span-5">{imageBlock}</div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ב. פריסה בסגנון גברי (Masculine Style - Bold, Charcoal, Amber/Gold & Chiseled)
  // ============================================================================
  if (normalizedLayout === 'masculine') {
    const pos = imagePosition === 'auto' ? 'left' : imagePosition;
    const isStack = !imageSrc || pos === 'top' || pos === 'bottom';

    const textAndCards = (
      <div className="flex flex-col gap-8">
        {wrapTextWithOptionalBg(
          <div className={clsx('flex flex-col gap-5 text-right', isStack && 'items-center text-center')}>
            {subtitle && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider w-fit">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>{subtitle}</span>
              </span>
            )}
            {heading && (
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl lg:text-6xl'),
                  'font-black tracking-tight text-white leading-[1.08]'
                )}
                style={{ color: headingColor }}
              >
                {heading}
              </h2>
            )}
            {body && body.trim() && (
              <div
                className={clsx(
                  getBodyScaleClass('text-base sm:text-xl'),
                  'text-zinc-300 leading-relaxed space-y-4 font-medium',
                  isStack ? 'max-w-3xl mx-auto border-t-2 border-amber-500/40 pt-4' : 'border-r-4 border-amber-500 pr-4'
                )}
                style={{ color: bodyColor }}
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
            {hasButtons && (
              <div className={clsx('flex flex-wrap items-center gap-4 pt-3', isStack && 'justify-center')}>
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    target={primaryButton.target}
                    style={{ backgroundColor: primaryButtonColor || undefined }}
                    className={clsx(
                      'inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border-2 border-amber-400 shadow-[0_12px_32px_-6px_rgba(245,158,11,0.45)] transition-all hover:-translate-y-0.5',
                      getButtonShapeClass('rounded-lg'),
                      getButtonSizeClass('px-9 py-4 text-base')
                    )}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    target={secondaryButton.target}
                    style={{ backgroundColor: secondaryButtonColor || undefined }}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border-2 border-zinc-700 hover:border-amber-500/60 font-extrabold transition-all',
                      getButtonShapeClass('rounded-lg'),
                      getButtonSizeClass('px-8 py-4 text-base')
                    )}
                  >
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>,
          'rounded-xl'
        )}

        {hasItems && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group bg-zinc-900/90 border-2 border-zinc-800 hover:border-amber-500/60 rounded-xl p-6 shadow-xl transition-all duration-300 flex flex-col gap-3 text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <DynamicIcon name={item.icon || 'Shield'} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-white leading-snug">{item.title}</h3>
                </div>
                {(item.text || item.description) && (
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line">
                    {item.text || item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const imageBlock = imageSrc && (
      <div className="relative w-full">
        <div className="absolute -top-2 -right-2 w-7 h-7 border-t-4 border-r-4 border-amber-500 z-20 pointer-events-none" />
        <div className="absolute -bottom-2 -left-2 w-7 h-7 border-b-4 border-l-4 border-amber-500 z-20 pointer-events-none" />
        <div className="rounded-xl overflow-hidden border-2 border-zinc-700 bg-zinc-900 shadow-2xl group">
          <img
            src={imageSrc}
            alt={heading}
            className="w-full h-auto max-h-[480px] object-cover contrast-110 group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>
    );

    return (
      <section
        id={anchorId || 'richContent'}
        className="relative w-full py-18 md:py-26 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#090a0f] via-[#12141c] to-[#090a0f] text-white transition-colors duration-300 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="max-w-6xl mx-auto relative z-10">
          {isStack ? (
            <div className="flex flex-col gap-10">
              {pos === 'top' && imageBlock}
              {textAndCards}
              {pos === 'bottom' && imageBlock}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-5">{imageBlock}</div>
                  <div className="lg:col-span-7">{textAndCards}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-7">{textAndCards}</div>
                  <div className="lg:col-span-5">{imageBlock}</div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ד. פריסה רוחנית (Spiritual Style - Zen, Sage/Teal, Sacred Halo & Breathing Room)
  // ============================================================================
  if (normalizedLayout === 'spiritual') {
    const pos = imagePosition === 'auto' ? 'top' : imagePosition;
    const isSplit = Boolean(imageSrc && (pos === 'left' || pos === 'right'));

    const imagePortal = imageSrc && (
      <div className="relative flex items-center justify-center my-2">
        <div className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-teal-500/20 animate-pulse pointer-events-none" />
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full p-2 bg-gradient-to-b from-amber-200/60 via-teal-200/50 to-emerald-200/50 dark:from-amber-500/30 dark:to-teal-900/40 shadow-xl">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/80 dark:border-teal-300/30">
            <img src={imageSrc} alt={heading} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );

    const textAndCards = (
      <div className="flex flex-col gap-8">
        {wrapTextWithOptionalBg(
          <div className={clsx('flex flex-col gap-4', !isSplit ? 'items-center text-center' : 'items-start text-right')}>
            {subtitle && (
              <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-teal-50/90 dark:bg-teal-950/60 border border-teal-300/60 dark:border-teal-600/40 text-teal-800 dark:text-teal-200 text-xs font-medium tracking-widest">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{subtitle}</span>
              </span>
            )}
            {heading && (
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl'),
                  'font-semibold tracking-wide leading-[1.3]',
                  textBgEnabled ? 'text-white' : 'text-stone-800 dark:text-stone-100'
                )}
                style={{ color: headingColor }}
              >
                {heading}
              </h2>
            )}
            {body && body.trim() && (
              <div
                className={clsx(
                  getBodyScaleClass('text-base sm:text-lg'),
                  'leading-[1.95] space-y-4 font-normal max-w-3xl',
                  textBgEnabled ? 'text-stone-200' : 'text-stone-600 dark:text-stone-300'
                )}
                style={{ color: bodyColor }}
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
            {hasButtons && (
              <div className={clsx('flex flex-wrap items-center gap-4 pt-3', !isSplit && 'justify-center')}>
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    target={primaryButton.target}
                    style={{ backgroundColor: primaryButtonColor || undefined }}
                    className={clsx(
                      'inline-flex items-center gap-2.5 bg-gradient-to-l from-teal-700 via-emerald-600 to-teal-700 text-white font-medium tracking-wide shadow-xl shadow-teal-700/20 ring-1 ring-amber-300/40 transition-all duration-700',
                      getButtonShapeClass('rounded-full'),
                      getButtonSizeClass('px-8 py-3.5 text-sm sm:text-base')
                    )}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    target={secondaryButton.target}
                    style={{ backgroundColor: secondaryButtonColor || undefined }}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-white/75 dark:bg-teal-950/40 text-stone-800 dark:text-teal-100 border border-teal-600/30 font-medium backdrop-blur-md transition-all duration-700',
                      getButtonShapeClass('rounded-full'),
                      getButtonSizeClass('px-8 py-3.5 text-sm sm:text-base')
                    )}
                  >
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>,
          'rounded-[3rem]'
        )}

        {hasItems && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group bg-white/80 dark:bg-teal-950/25 border border-teal-600/20 dark:border-teal-500/25 rounded-[2rem] p-6 shadow-md hover:shadow-xl transition-all duration-700 flex flex-col gap-3 text-right backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-teal-500/10 border border-amber-400/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <DynamicIcon name={item.icon || 'Sun'} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 leading-snug">
                    {item.title}
                  </h3>
                </div>
                {(item.text || item.description) && (
                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                    {item.text || item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <section
        id={anchorId || 'richContent'}
        className="relative w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#faf8f5] via-[#f2f7f5] to-[#f8f5ee] dark:from-[#071110] dark:via-[#0b1c1a] dark:to-[#071110] transition-colors duration-700 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="max-w-6xl mx-auto relative z-10">
          {isSplit ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-4">{imagePortal}</div>
                  <div className="lg:col-span-8">{textAndCards}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-8">{textAndCards}</div>
                  <div className="lg:col-span-4">{imagePortal}</div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {pos === 'top' && imagePortal}
              <div className="w-full">{textAndCards}</div>
              {pos === 'bottom' && imagePortal}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ה. פריסה חדה (Sharp Style - Brutalist 90°, Solid 2px Borders & Offset Shadows)
  // ============================================================================
  if (normalizedLayout === 'sharp') {
    const pos = imagePosition === 'auto' ? 'right' : imagePosition;
    const isStack = !imageSrc || pos === 'top' || pos === 'bottom';

    const textAndCards = (
      <div className="flex flex-col gap-8">
        {wrapTextWithOptionalBg(
          <div className={clsx('flex flex-col gap-4 text-right', isStack && 'items-center text-center')}>
            {subtitle && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none bg-indigo-600 text-white border-2 border-slate-950 dark:border-white text-xs font-mono font-bold uppercase tracking-widest w-fit shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#ffffff]">
                <Crosshair className="w-3.5 h-3.5" />
                <span>{subtitle}</span>
              </span>
            )}
            {heading && (
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl lg:text-6xl'),
                  'font-black tracking-tighter leading-[1.06] uppercase',
                  textBgEnabled ? 'text-white' : 'text-slate-950 dark:text-white'
                )}
                style={{ color: headingColor }}
              >
                {heading}
              </h2>
            )}
            {body && body.trim() && (
              <div
                className={clsx(
                  getBodyScaleClass('text-base sm:text-lg'),
                  'leading-snug space-y-4 font-medium',
                  textBgEnabled ? 'text-slate-200' : 'text-slate-800 dark:text-slate-200',
                  isStack && 'max-w-3xl mx-auto'
                )}
                style={{ color: bodyColor }}
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
            {hasButtons && (
              <div className={clsx('flex flex-wrap items-center gap-4 pt-3', isStack && 'justify-center')}>
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    target={primaryButton.target}
                    style={{ backgroundColor: primaryButtonColor || undefined }}
                    className={clsx(
                      'inline-flex items-center gap-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black border-2 border-slate-950 dark:border-white shadow-[5px_5px_0px_0px_#6366f1] hover:translate-x-[2px] hover:translate-y-[2px] transition-all',
                      getButtonShapeClass('rounded-none'),
                      getButtonSizeClass('px-8 py-3.5 text-sm sm:text-base')
                    )}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    target={secondaryButton.target}
                    style={{ backgroundColor: secondaryButtonColor || undefined }}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-white dark:bg-slate-950 text-slate-950 dark:text-white font-black border-2 border-slate-950 dark:border-white shadow-[5px_5px_0px_0px_rgba(15,23,42,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all',
                      getButtonShapeClass('rounded-none'),
                      getButtonSizeClass('px-8 py-3.5 text-sm sm:text-base')
                    )}
                  >
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>,
          'rounded-none'
        )}

        {hasItems && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white dark:bg-slate-950 border-2 border-slate-950 dark:border-white rounded-none p-6 shadow-[6px_6px_0px_0px_#6366f1] flex flex-col gap-3 text-right"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-950/15 dark:border-white/15 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-none bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shrink-0">
                      <DynamicIcon name={item.icon || 'Sparkles'} className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black text-slate-950 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                    0{idx + 1}
                  </span>
                </div>
                {(item.text || item.description) && (
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                    {item.text || item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const imageBlock = imageSrc && (
      <div className="rounded-none border-2 border-slate-950 dark:border-white bg-white dark:bg-slate-950 shadow-[8px_8px_0px_0px_#6366f1] overflow-hidden">
        <div className="px-3 py-1.5 border-b-2 border-slate-950 dark:border-white bg-slate-100 dark:bg-slate-900 font-mono text-[10px] font-bold flex justify-between">
          <span>CONTENT // FIG. 01</span>
          <span>[90°]</span>
        </div>
        <img src={imageSrc} alt={heading} className="w-full h-auto max-h-[460px] object-cover" />
      </div>
    );

    return (
      <section
        id={anchorId || 'richContent'}
        className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-[#060608] border-b-2 border-slate-950 dark:border-white/20 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          {isStack ? (
            <div className="flex flex-col gap-10">
              {pos === 'top' && imageBlock}
              {textAndCards}
              {pos === 'bottom' && imageBlock}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-5">{imageBlock}</div>
                  <div className="lg:col-span-7">{textAndCards}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-7">{textAndCards}</div>
                  <div className="lg:col-span-5">{imageBlock}</div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ו. פריסה אנליטית (Analytical Style - Data Bento, Monospace & Cyan/Blue HUD)
  // ============================================================================
  const pos = imagePosition === 'auto' ? 'left' : imagePosition;
  const isStack = !imageSrc || pos === 'top' || pos === 'bottom';

  const analyticalTextAndCards = (
    <div className="flex flex-col gap-8">
      {wrapTextWithOptionalBg(
        <div className={clsx('flex flex-col gap-4 text-right', isStack && 'items-center text-center')}>
          {subtitle && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold w-fit">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <Activity className="w-3.5 h-3.5 text-cyan-500" />
              <span>{subtitle}</span>
            </span>
          )}
          {heading && (
            <h2
              className={clsx(
                getHeadingScaleClass('text-3xl sm:text-5xl'),
                'font-extrabold tracking-tight leading-[1.15]',
                textBgEnabled ? 'text-white' : 'text-slate-900 dark:text-white'
              )}
              style={{ color: headingColor }}
            >
              {heading}
            </h2>
          )}
          {body && body.trim() && (
            <div
              className={clsx(
                getBodyScaleClass('text-base sm:text-lg'),
                'leading-relaxed space-y-4 font-normal',
                textBgEnabled ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300',
                isStack && 'max-w-3xl mx-auto'
              )}
              style={{ color: bodyColor }}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          )}
          {hasButtons && (
            <div className={clsx('flex flex-wrap items-center gap-3.5 pt-2', isStack && 'justify-center')}>
              {primaryButton?.text && (
                <a
                  href={primaryButton.url || '#'}
                  target={primaryButton.target}
                  style={{ backgroundColor: primaryButtonColor || undefined }}
                  className={clsx(
                    'inline-flex items-center gap-2 bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all',
                    getButtonShapeClass('rounded-xl'),
                    getButtonSizeClass('px-7 py-3.5 text-xs sm:text-sm')
                  )}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{primaryButton.text}</span>
                  <ArrowLeft className="w-4 h-4" />
                </a>
              )}
              {secondaryButton?.text && (
                <a
                  href={secondaryButton.url || '#'}
                  target={secondaryButton.target}
                  style={{ backgroundColor: secondaryButtonColor || undefined }}
                  className={clsx(
                    'inline-flex items-center gap-2 bg-slate-900/5 dark:bg-slate-900/90 text-slate-800 dark:text-cyan-300 border border-cyan-500/30 font-bold transition-all',
                    getButtonShapeClass('rounded-xl'),
                    getButtonSizeClass('px-7 py-3.5 text-xs sm:text-sm')
                  )}
                >
                  <span>{secondaryButton.text}</span>
                </a>
              )}
            </div>
          )}
        </div>,
        'rounded-2xl'
      )}

      {hasItems && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-white/90 dark:bg-slate-900/85 border border-cyan-500/25 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col gap-2.5 text-right"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <DynamicIcon name={item.icon || 'Activity'} className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {item.metricValue || `KPI #${idx + 1}`}
                </span>
              </div>
              {(item.text || item.description) && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.text || item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const analyticalImageBlock = imageSrc && (
    <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl">
      <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-400">
        <span>DATA INSIGHT // VERIFIED</span>
        <span className="text-emerald-400">● ACTIVE</span>
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-800">
        <img src={imageSrc} alt={heading} className="w-full h-auto max-h-[440px] object-cover" />
      </div>
    </div>
  );

  return (
    <section
      id={anchorId || 'richContent'}
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white dark:from-[#050b14] dark:via-[#081526] dark:to-[#050b14] group/textbg"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d422_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        {isStack ? (
          <div className="flex flex-col gap-10">
            {pos === 'top' && analyticalImageBlock}
            {analyticalTextAndCards}
            {pos === 'bottom' && analyticalImageBlock}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {pos === 'right' ? (
              <>
                <div className="lg:col-span-5">{analyticalImageBlock}</div>
                <div className="lg:col-span-7">{analyticalTextAndCards}</div>
              </>
            ) : (
              <>
                <div className="lg:col-span-7">{analyticalTextAndCards}</div>
                <div className="lg:col-span-5">{analyticalImageBlock}</div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
