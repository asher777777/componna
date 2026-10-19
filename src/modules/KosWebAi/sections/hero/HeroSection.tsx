import React from 'react';
import { HeroSectionConfig, HeroLayoutPreset } from '../../types/sectionConfigs';
import {
  Sparkles,
  ArrowLeft,
  Star,
  Shield,
  Activity,
  TrendingUp,
  Sun,
  Crosshair,
  Heart,
} from 'lucide-react';
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
    objectScale = 'auto',
    buttonShape = 'auto',
    buttonSize = 'auto',
    imagePosition = 'auto',
    buttonsVisible = true,
    primaryButton,
    secondaryButton,
    backgroundColor = 'transparent',
    titleColor,
    descriptionColor,
    primaryButtonColor,
    secondaryButtonColor,
    accentColor,
    textBgEnabled = false,
    textBgImageUrl,
    textBgOverlayColor,
    textBgOverlayOpacity = 70,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
    analyticalMetrics,
    announcementBadge,
    imageBadge,
    socialProofAvatars,
    titleFontSize,
    titleFontWeight,
    titleAlignment,
    subtitleFontSize,
    subtitleFontWeight,
    descriptionFontSize,
  } = config;

  // Normalize layout key (treat 'bento-hero' and 'current' as the current layout)
  const normalizedLayout: HeroLayoutPreset =
    layout === 'current' || !layout ? 'bento-hero' : layout;

  const isCurrentLayout =
    normalizedLayout === 'bento-hero' ||
    normalizedLayout === 'fz' ||
    normalizedLayout === 'spatial' ||
    normalizedLayout === 'centered' ||
    normalizedLayout === 'split';

  const effectiveBgImage = textBgImageUrl || imageSrc || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80';
  const overlayAlpha = Math.min(95, Math.max(10, textBgOverlayOpacity ?? 70)) / 100;

  // Default overlay color per style when textBgOverlayColor is not set
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

  // Object scale classes (Title H1 + Description)
  const getTitleScaleClass = (defaultClass: string) => {
    if (objectScale === 'compact') return 'text-3xl sm:text-4xl md:text-5xl';
    if (objectScale === 'normal') return 'text-4xl sm:text-5xl md:text-6xl';
    if (objectScale === 'large') return 'text-4xl sm:text-6xl md:text-7xl';
    if (objectScale === 'massive') return 'text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem]';
    return defaultClass;
  };

  const getDescScaleClass = (defaultClass: string) => {
    if (objectScale === 'compact') return 'text-sm sm:text-base max-w-xl';
    if (objectScale === 'normal') return 'text-base sm:text-lg max-w-2xl';
    if (objectScale === 'large') return 'text-lg sm:text-xl md:text-2xl max-w-3xl';
    if (objectScale === 'massive') return 'text-xl sm:text-2xl max-w-3xl';
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

  // Render the background image + overlay + hover transition layer
  const renderTextBgLayer = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[inherit]">
      {/* Background image with hover transition effect */}
      <img
        src={effectiveBgImage}
        alt=""
        aria-hidden="true"
        className={clsx(
          'w-full h-full object-cover transition-all ease-out',
          textBgEffect === 'zoom-glow' && 'duration-1000 group-hover/textbg:scale-110',
          textBgEffect === 'shimmer-sweep' && 'duration-700 group-hover/textbg:scale-105',
          textBgEffect === 'float-parallax' && 'duration-700 scale-105 group-hover/textbg:scale-110 group-hover/textbg:-translate-y-2',
          textBgEffect === 'blur-reveal' && 'duration-700 blur-[3px] scale-105 group-hover/textbg:blur-0 group-hover/textbg:scale-100',
          textBgEffect === 'gradient-shift' && 'duration-1000 group-hover/textbg:scale-105 group-hover/textbg:rotate-1'
        )}
      />

      {/* Configurable Color Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500 group-hover/textbg:opacity-80"
        style={{
          backgroundColor: defaultOverlayHex,
          opacity: overlayAlpha,
        }}
      />

      {/* Dynamic Hover Effect Layer ("אפקט עובר") */}
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

  // Social proof block reusable across styles
  const renderSocialProof = (customClass?: string, textColorClass?: string) => {
    if (!socialProofAvatars?.visible) return null;
    return (
      <div
        className={clsx(
          'flex flex-wrap items-center gap-3 mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/50',
          customClass
        )}
      >
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
          <span className={clsx('text-sm font-medium', textColorClass || 'text-slate-600 dark:text-slate-400')}>
            {socialProofAvatars.ratingText}
          </span>
        )}
      </div>
    );
  };

  // Helper to wrap the text column when textBgEnabled && textBgScope === 'text-card'
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
  // ג. הפריסה העכשווית (Current / Bento-Hero - Exact Existing Design + Enhancements)
  // ============================================================================
  if (isCurrentLayout && imagePosition === 'auto') {
    return (
      <section
        id={anchorId || 'hero'}
        className={clsx(
          'relative w-full py-16 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300 group/textbg',
          heroStyle === 'mesh-glow' &&
            'bg-gradient-to-b from-white via-indigo-50/50 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950',
          heroStyle === 'modern' &&
            'bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-950',
          heroStyle !== 'mesh-glow' && heroStyle !== 'modern' && 'bg-white dark:bg-slate-950'
        )}
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        {/* Background ambient lighting */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          {wrapTextWithOptionalBg(
            <div className="flex flex-col items-center text-center">
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
                className={clsx(
                  getTitleScaleClass('text-4xl sm:text-5xl md:text-6xl lg:text-7xl'),
                  'font-extrabold tracking-tight leading-[1.15] max-w-4xl drop-shadow-sm',
                  textBgEnabled ? 'text-white' : 'text-slate-900 dark:text-white'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h1>

              {subtitle && (
                <p
                  className={clsx(
                    'text-sm sm:text-base font-bold mt-4 tracking-wide',
                    textBgEnabled ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'
                  )}
                >
                  {subtitle}
                </p>
              )}

              {/* Subtitle / Description */}
              {description && (
                <p
                  className={clsx(
                    getDescScaleClass('text-base sm:text-lg md:text-xl max-w-2xl'),
                    'leading-relaxed font-normal mt-6',
                    textBgEnabled ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'
                  )}
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
                      style={{ backgroundColor: primaryButtonColor || undefined }}
                      className={clsx(
                        'inline-flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-600/20 dark:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0',
                        getButtonShapeClass('rounded-2xl'),
                        getButtonSizeClass('px-8 py-4 text-sm sm:text-base')
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
                        'inline-flex items-center gap-2 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600',
                        getButtonShapeClass('rounded-2xl'),
                        getButtonSizeClass('px-8 py-4 text-sm sm:text-base')
                      )}
                    >
                      <span>{secondaryButton.text}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Social Proof Avatars Stack */}
              {renderSocialProof('justify-center mt-10', textBgEnabled ? 'text-slate-200' : undefined)}
            </div>,
            'rounded-[2.5rem]'
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
  }

  // ============================================================================
  // א. פריסה בסגנון נשי (Feminine Style - Soft, Organic, Rose-Gold & Arch Frame)
  // ============================================================================
  if (normalizedLayout === 'feminine') {
    const pos = imagePosition === 'auto' ? 'left' : imagePosition;
    const isStack = pos === 'top' || pos === 'bottom';

    const textBlock = wrapTextWithOptionalBg(
      <div className={clsx('flex flex-col', isStack ? 'items-center text-center' : 'items-start text-right')}>
        {announcementBadge?.text && (
          <a
            href={announcementBadge.url || '#'}
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-800 dark:text-rose-200 text-xs font-medium tracking-wide mb-6 shadow-sm hover:scale-105 transition-all"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400/40" />
            <span>{announcementBadge.text}</span>
          </a>
        )}

        <h1
          className={clsx(
            getTitleScaleClass('text-3xl sm:text-5xl lg:text-6xl'),
            'font-bold tracking-normal leading-[1.22]',
            textBgEnabled ? 'text-white' : 'text-rose-950 dark:text-rose-50'
          )}
          style={{ color: titleColor }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={clsx(
              'text-sm sm:text-base font-medium mt-3 tracking-wide',
              textBgEnabled ? 'text-rose-200' : 'text-rose-600 dark:text-rose-300'
            )}
          >
            {subtitle}
          </p>
        )}

        {description && (
          <p
            className={clsx(
              getDescScaleClass('text-base sm:text-lg max-w-xl'),
              'leading-[1.8] font-normal mt-5',
              textBgEnabled ? 'text-rose-100/90' : 'text-stone-600 dark:text-rose-100/75'
            )}
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        )}

        {buttonsVisible && (primaryButton || secondaryButton) && (
          <div className={clsx('flex flex-wrap items-center gap-4 mt-9', isStack && 'justify-center')}>
            {primaryButton?.text && (
              <a
                href={primaryButton.url || '#'}
                target={primaryButton.target}
                style={{ backgroundColor: primaryButtonColor || undefined }}
                className={clsx(
                  'inline-flex items-center gap-2.5 bg-gradient-to-l from-rose-400 via-pink-500 to-rose-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold shadow-xl shadow-rose-400/30 dark:shadow-rose-900/40 transition-all duration-500 hover:scale-[1.03]',
                  getButtonShapeClass('rounded-full'),
                  getButtonSizeClass('px-9 py-4 text-sm sm:text-base')
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
                  'inline-flex items-center gap-2 bg-white/85 dark:bg-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-900/50 text-rose-900 dark:text-rose-100 border border-rose-200/90 dark:border-rose-700/50 font-semibold backdrop-blur-md transition-all duration-500 hover:border-rose-300',
                  getButtonShapeClass('rounded-full'),
                  getButtonSizeClass('px-8 py-4 text-sm sm:text-base')
                )}
              >
                <span>{secondaryButton.text}</span>
              </a>
            )}
          </div>
        )}

        {renderSocialProof(
          isStack ? 'justify-center border-rose-200/60 dark:border-rose-800/40' : 'border-rose-200/60 dark:border-rose-800/40',
          textBgEnabled ? 'text-rose-100' : 'text-stone-600 dark:text-rose-200/80'
        )}
      </div>,
      'rounded-[3rem]'
    );

    const imageBlock = imageSrc && (
      <div className="relative flex justify-center items-center w-full">
        {/* Soft decorative arch halo */}
        <div className="absolute -inset-3 rounded-t-[11rem] rounded-b-[3.5rem] bg-gradient-to-b from-rose-300/30 via-pink-200/20 to-amber-200/30 dark:from-rose-500/20 dark:to-amber-500/10 blur-xl pointer-events-none" />
        <div className="relative w-full max-w-md p-3 rounded-t-[10rem] rounded-b-[3rem] bg-white/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 backdrop-blur-xl shadow-2xl shadow-rose-300/25 dark:shadow-black/50 group">
          <div className="overflow-hidden rounded-t-[9.2rem] rounded-b-[2.4rem] relative aspect-[4/5]">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-950/30 via-transparent to-transparent" />
          </div>
          {/* Floating boutique pill (dynamic via imageBadge) */}
          {(imageBadge?.visible !== false && (imageBadge?.text || true)) && (
            <div className="absolute -bottom-4 right-6 px-5 py-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-rose-200 dark:border-rose-800/60 shadow-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-rose-950 dark:text-rose-100">
                {imageBadge?.text || 'עיצוב בוטיק מותאם אישית'}
              </span>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <section
        id={anchorId || 'hero'}
        className="relative w-full py-16 md:py-26 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#fff9fb] via-[#fdf2f6] to-[#fcf6f0] dark:from-[#160c12] dark:via-[#1e1018] dark:to-[#120b0f] transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        {/* Soft Pastel Ambient Blobs */}
        <div className="absolute -top-20 right-10 w-[420px] h-[420px] bg-rose-300/25 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-amber-200/30 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {isStack ? (
            <div className="flex flex-col items-center gap-12">
              {pos === 'top' && imageBlock}
              <div className="max-w-3xl w-full">{textBlock}</div>
              {pos === 'bottom' && imageBlock}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-5">{imageBlock}</div>
                  <div className="lg:col-span-7">{textBlock}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-7">{textBlock}</div>
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
  // ב. פריסה בסגנון גברי (Masculine Style - Bold, Authoritative, Charcoal & Gold/Steel)
  // ============================================================================
  if (normalizedLayout === 'masculine') {
    const pos = imagePosition === 'auto' ? 'left' : imagePosition;
    const isStack = pos === 'top' || pos === 'bottom';

    const textBlock = wrapTextWithOptionalBg(
      <div className={clsx('flex flex-col', isStack ? 'items-center text-center' : 'items-start text-right')}>
        {announcementBadge?.text && (
          <a
            href={announcementBadge.url || '#'}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider mb-6 hover:bg-amber-500/25 transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>{announcementBadge.text}</span>
          </a>
        )}

        <h1
          className={clsx(
            getTitleScaleClass('text-4xl sm:text-6xl md:text-7xl lg:text-[5rem]'),
            'font-black tracking-tight text-white leading-[1.05] drop-shadow-md'
          )}
          style={{ color: titleColor }}
        >
          {title}
        </h1>

        {subtitle && (
          <div className="mt-4 pr-4 border-r-4 border-amber-500">
            <p className="text-base sm:text-lg font-extrabold text-amber-400 tracking-wide">
              {subtitle}
            </p>
          </div>
        )}

        {description && (
          <p
            className={clsx(
              getDescScaleClass('text-base sm:text-xl max-w-2xl'),
              'text-zinc-300 leading-relaxed font-medium mt-6',
              !isStack && 'border-r-2 border-zinc-700 pr-4'
            )}
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        )}

        {buttonsVisible && (primaryButton || secondaryButton) && (
          <div className={clsx('flex flex-wrap items-center gap-4 mt-10', isStack && 'justify-center')}>
            {primaryButton?.text && (
              <a
                href={primaryButton.url || '#'}
                target={primaryButton.target}
                style={{ backgroundColor: primaryButtonColor || undefined }}
                className={clsx(
                  'inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border-2 border-amber-400 shadow-[0_12px_32px_-6px_rgba(245,158,11,0.45)] transition-all hover:-translate-y-0.5',
                  getButtonShapeClass('rounded-lg'),
                  getButtonSizeClass('px-10 py-4.5 text-base sm:text-lg')
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
                  'inline-flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 text-white border-2 border-zinc-700 hover:border-amber-500/60 font-extrabold transition-all',
                  getButtonShapeClass('rounded-lg'),
                  getButtonSizeClass('px-9 py-4.5 text-base sm:text-lg')
                )}
              >
                <span>{secondaryButton.text}</span>
              </a>
            )}
          </div>
        )}

        {renderSocialProof(
          isStack ? 'justify-center border-zinc-800' : 'border-zinc-800',
          'text-zinc-300'
        )}
      </div>,
      'rounded-xl'
    );

    const imageBlock = imageSrc && (
      <div className="relative w-full">
        {/* Metallic corner accents */}
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-amber-500 z-20 pointer-events-none" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-amber-500 z-20 pointer-events-none" />
        <div className="relative rounded-xl overflow-hidden border-2 border-zinc-700/90 bg-zinc-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] group">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-auto max-h-[540px] object-cover contrast-110 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {imageBadge?.visible !== false && (
            <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-950/90 border border-zinc-800 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black text-white tracking-wider">
                  {imageBadge?.text || 'ביצועים ועוצמה ללא פשרות'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-400 font-bold">PRO EDITION</span>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <section
        id={anchorId || 'hero'}
        className="relative w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#090a0f] via-[#12141c] to-[#090a0f] text-white transition-colors duration-300 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        {/* Metallic Amber & Cobalt Ambient Glow */}
        <div className="absolute top-10 right-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {isStack ? (
            <div className="flex flex-col items-center gap-12">
              {pos === 'top' && <div className="max-w-4xl w-full">{imageBlock}</div>}
              <div className="max-w-4xl w-full">{textBlock}</div>
              {pos === 'bottom' && <div className="max-w-4xl w-full">{imageBlock}</div>}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-6">{imageBlock}</div>
                  <div className="lg:col-span-6">{textBlock}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-6">{textBlock}</div>
                  <div className="lg:col-span-6">{imageBlock}</div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ד. פריסה רוחנית (Spiritual Style - Zen, Sacred Geometry, Sage/Teal & Halo Portal)
  // ============================================================================
  if (normalizedLayout === 'spiritual') {
    const pos = imagePosition === 'auto' ? 'top' : imagePosition;
    const isSplit = pos === 'left' || pos === 'right';

    const imagePortal = imageSrc && (
      <div className="relative flex items-center justify-center my-4">
        {/* Concentric Sacred Geometry / Aura Rings */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-teal-500/20 dark:border-teal-400/20 animate-pulse pointer-events-none" />
        <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-amber-400/30 dark:border-amber-300/20 pointer-events-none" />
        <div className="relative w-52 h-52 sm:w-68 sm:h-68 rounded-full p-2.5 bg-gradient-to-b from-amber-200/60 via-teal-200/50 to-emerald-200/50 dark:from-amber-500/30 dark:via-teal-500/30 dark:to-emerald-900/40 shadow-2xl shadow-teal-600/15 group">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/80 dark:border-teal-300/30">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
          </div>
        </div>
      </div>
    );

    const textBlock = wrapTextWithOptionalBg(
      <div className={clsx('flex flex-col', isSplit ? 'items-start text-right' : 'items-center text-center')}>
        {announcementBadge?.text && (
          <a
            href={announcementBadge.url || '#'}
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-teal-50/90 dark:bg-teal-950/60 border border-teal-300/60 dark:border-teal-600/40 text-teal-800 dark:text-teal-200 text-xs font-medium tracking-widest mb-6 shadow-sm transition-all hover:scale-105"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{announcementBadge.text}</span>
          </a>
        )}

        <h1
          className={clsx(
            getTitleScaleClass('text-3xl sm:text-5xl md:text-6xl'),
            'font-semibold tracking-wide leading-[1.28] max-w-3xl',
            textBgEnabled ? 'text-white' : 'text-stone-800 dark:text-stone-100'
          )}
          style={{ color: titleColor }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={clsx(
              'text-sm sm:text-base font-medium mt-4 tracking-widest',
              textBgEnabled ? 'text-amber-200' : 'text-teal-700 dark:text-teal-300'
            )}
          >
            ✦ {subtitle} ✦
          </p>
        )}

        {description && (
          <p
            className={clsx(
              getDescScaleClass('text-base sm:text-lg md:text-xl max-w-2xl'),
              'leading-[1.9] font-normal mt-5',
              textBgEnabled ? 'text-stone-200' : 'text-stone-600 dark:text-stone-300'
            )}
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        )}

        {buttonsVisible && (primaryButton || secondaryButton) && (
          <div className={clsx('flex flex-wrap items-center gap-4 mt-10', !isSplit && 'justify-center')}>
            {primaryButton?.text && (
              <a
                href={primaryButton.url || '#'}
                target={primaryButton.target}
                style={{ backgroundColor: primaryButtonColor || undefined }}
                className={clsx(
                  'inline-flex items-center gap-2.5 bg-gradient-to-l from-teal-700 via-emerald-600 to-teal-700 hover:from-teal-600 hover:to-emerald-500 text-white font-medium tracking-wide shadow-xl shadow-teal-700/25 ring-1 ring-amber-300/40 transition-all duration-700 hover:-translate-y-0.5',
                  getButtonShapeClass('rounded-full'),
                  getButtonSizeClass('px-9 py-4 text-sm sm:text-base')
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
                  'inline-flex items-center gap-2 bg-white/75 dark:bg-teal-950/40 hover:bg-white dark:hover:bg-teal-900/50 text-stone-800 dark:text-teal-100 border border-teal-600/30 dark:border-teal-400/30 font-medium backdrop-blur-md transition-all duration-700',
                  getButtonShapeClass('rounded-full'),
                  getButtonSizeClass('px-8 py-4 text-sm sm:text-base')
                )}
              >
                <span>{secondaryButton.text}</span>
              </a>
            )}
          </div>
        )}

        {renderSocialProof(
          !isSplit ? 'justify-center border-teal-200/50 dark:border-teal-800/40' : 'border-teal-200/50 dark:border-teal-800/40',
          textBgEnabled ? 'text-stone-200' : 'text-stone-600 dark:text-stone-400'
        )}
      </div>,
      'rounded-[3rem]'
    );

    return (
      <section
        id={anchorId || 'hero'}
        className="relative w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#faf8f5] via-[#f2f7f5] to-[#f8f5ee] dark:from-[#071110] dark:via-[#0b1c1a] dark:to-[#071110] transition-colors duration-700 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        {/* Ethereal Golden & Sage Aura Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-300/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {isSplit ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-5">{imagePortal}</div>
                  <div className="lg:col-span-7">{textBlock}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-7">{textBlock}</div>
                  <div className="lg:col-span-5">{imagePortal}</div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-8">
              {pos === 'top' && imagePortal}
              {textBlock}
              {pos === 'bottom' && imagePortal}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ה. פריסה חדה (Sharp Style - Brutalist, 0px Radius, High-Contrast Offset Shadows)
  // ============================================================================
  if (normalizedLayout === 'sharp') {
    const pos = imagePosition === 'auto' ? 'right' : imagePosition;
    const isStack = pos === 'top' || pos === 'bottom';

    const textBlock = wrapTextWithOptionalBg(
      <div className={clsx('flex flex-col', isStack ? 'items-center text-center' : 'items-start text-right')}>
        {announcementBadge?.text && (
          <a
            href={announcementBadge.url || '#'}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-indigo-600 text-white border-2 border-slate-950 dark:border-white text-xs font-mono font-bold uppercase tracking-widest mb-6 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{announcementBadge.text}</span>
          </a>
        )}

        <h1
          className={clsx(
            getTitleScaleClass('text-4xl sm:text-6xl lg:text-7xl'),
            'font-black tracking-tighter leading-[1.04] uppercase',
            textBgEnabled ? 'text-white' : 'text-slate-950 dark:text-white'
          )}
          style={{ color: titleColor }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest px-3 py-1 bg-slate-950 text-white dark:bg-white dark:text-slate-950 mt-4">
            // {subtitle}
          </p>
        )}

        {description && (
          <p
            className={clsx(
              getDescScaleClass('text-base sm:text-lg md:text-xl max-w-xl'),
              'leading-snug font-medium mt-6',
              textBgEnabled ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'
            )}
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        )}

        {buttonsVisible && (primaryButton || secondaryButton) && (
          <div className={clsx('flex flex-wrap items-center gap-5 mt-10', isStack && 'justify-center')}>
            {primaryButton?.text && (
              <a
                href={primaryButton.url || '#'}
                target={primaryButton.target}
                style={{ backgroundColor: primaryButtonColor || undefined }}
                className={clsx(
                  'inline-flex items-center gap-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black border-2 border-slate-950 dark:border-white shadow-[6px_6px_0px_0px_#6366f1] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_#6366f1] transition-all',
                  getButtonShapeClass('rounded-none'),
                  getButtonSizeClass('px-9 py-4 text-sm sm:text-base')
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
                  'inline-flex items-center gap-2 bg-white dark:bg-slate-950 text-slate-950 dark:text-white font-black border-2 border-slate-950 dark:border-white shadow-[6px_6px_0px_0px_rgba(15,23,42,0.25)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.25)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all',
                  getButtonShapeClass('rounded-none'),
                  getButtonSizeClass('px-8 py-4 text-sm sm:text-base')
                )}
              >
                <span>{secondaryButton.text}</span>
              </a>
            )}
          </div>
        )}

        {renderSocialProof(
          isStack ? 'justify-center border-slate-950/20 dark:border-white/20' : 'border-slate-950/20 dark:border-white/20',
          textBgEnabled ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'
        )}
      </div>,
      'rounded-none'
    );

    const imageBlock = imageSrc && (
      <div className="relative w-full">
        <div className="rounded-none border-2 border-slate-950 dark:border-white bg-white dark:bg-slate-950 shadow-[10px_10px_0px_0px_#6366f1] overflow-hidden group">
          <div className="flex items-center justify-between px-4 py-2 border-b-2 border-slate-950 dark:border-white bg-slate-100 dark:bg-slate-900 font-mono text-[11px] font-bold text-slate-950 dark:text-white">
            <span>FIG. 01 // ARCHITECTURAL FRAME</span>
            <span>[90° SHARP]</span>
          </div>
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-auto max-h-[520px] object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      </div>
    );

    return (
      <section
        id={anchorId || 'hero'}
        className="relative w-full py-16 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-[#060608] border-b-2 border-slate-950 dark:border-white/20 transition-colors duration-300 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        {/* Sharp Architectural Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {isStack ? (
            <div className="flex flex-col items-center gap-12">
              {pos === 'top' && <div className="max-w-4xl w-full">{imageBlock}</div>}
              <div className="max-w-4xl w-full">{textBlock}</div>
              {pos === 'bottom' && <div className="max-w-4xl w-full">{imageBlock}</div>}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {pos === 'right' ? (
                <>
                  <div className="lg:col-span-6">{imageBlock}</div>
                  <div className="lg:col-span-6">{textBlock}</div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-6">{textBlock}</div>
                  <div className="lg:col-span-6">{imageBlock}</div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ו. פריסה אנליטית (Analytical Style - Data-Driven Bento HUD, KPIs & Cyan/Blue)
  // ============================================================================
  const metrics =
    analyticalMetrics && analyticalMetrics.length > 0
      ? analyticalMetrics
      : [
          { id: 'm1', label: 'שיפור המרות ממוצע', value: '+148%', trend: '↑ בזמן אמת' },
          { id: 'm2', label: 'דיוק עיבוד נתונים', value: '99.9%', trend: 'SLA מובטח' },
          { id: 'm3', label: 'זמן תגובה מערכת', value: '0.2s', trend: 'מהיר במיוחד' },
        ];

  const pos = imagePosition === 'auto' ? 'left' : imagePosition;
  const isStack = pos === 'top' || pos === 'bottom';

  const analyticalTextBlock = wrapTextWithOptionalBg(
    <div className={clsx('flex flex-col', isStack ? 'items-center text-center' : 'items-start text-right')}>
      {announcementBadge?.text && (
        <a
          href={announcementBadge.url || '#'}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold mb-5 hover:bg-cyan-500/20 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <Activity className="w-3.5 h-3.5 text-cyan-500" />
          <span>{announcementBadge.text}</span>
        </a>
      )}

      <h1
        className={clsx(
          getTitleScaleClass('text-3xl sm:text-5xl lg:text-6xl'),
          'font-extrabold tracking-tight leading-[1.15]',
          textBgEnabled ? 'text-white' : 'text-slate-900 dark:text-white'
        )}
        style={{ color: titleColor }}
      >
        {title}
      </h1>

      {subtitle && (
        <p className="text-xs sm:text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-3">
          {subtitle}
        </p>
      )}

      {description && (
        <p
          className={clsx(
            getDescScaleClass('text-base sm:text-lg max-w-xl'),
            'leading-relaxed font-normal mt-4',
            textBgEnabled ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'
          )}
          style={{ color: descriptionColor }}
        >
          {description}
        </p>
      )}

      {/* Structured KPI Metric Bento Strip */}
      <div className="grid grid-cols-3 gap-2.5 w-full mt-7">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-cyan-500/20 dark:border-cyan-500/25 shadow-sm backdrop-blur-md text-right"
          >
            <div className="text-lg sm:text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 leading-none">
              {m.value}
            </div>
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 truncate">
              {m.label}
            </div>
            {m.trend && (
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {m.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {buttonsVisible && (primaryButton || secondaryButton) && (
        <div className={clsx('flex flex-wrap items-center gap-3.5 mt-8', isStack && 'justify-center')}>
          {primaryButton?.text && (
            <a
              href={primaryButton.url || '#'}
              target={primaryButton.target}
              style={{ backgroundColor: primaryButtonColor || undefined }}
              className={clsx(
                'inline-flex items-center gap-2.5 bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/25 border border-cyan-400/30 transition-all hover:-translate-y-0.5',
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
                'inline-flex items-center gap-2 bg-slate-900/5 dark:bg-slate-900/90 hover:bg-cyan-500/10 text-slate-800 dark:text-cyan-300 border border-cyan-500/30 font-bold transition-all',
                getButtonShapeClass('rounded-xl'),
                getButtonSizeClass('px-7 py-3.5 text-xs sm:text-sm')
              )}
            >
              <span>{secondaryButton.text}</span>
            </a>
          )}
        </div>
      )}

      {renderSocialProof(
        isStack ? 'justify-center border-cyan-500/20' : 'border-cyan-500/20',
        textBgEnabled ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'
      )}
    </div>,
    'rounded-2xl'
  );

  const analyticalImageBlock = imageSrc && (
    <div className="relative w-full">
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl group">
        {/* Top Telemetry Bar */}
        <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-cyan-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ANALYTICS HUD // LIVE TELEMETRY</span>
          </div>
          <span className="text-slate-400">100% VERIFIED</span>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-800 relative">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-auto max-h-[480px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
          />
        </div>
      </div>
    </div>
  );

  return (
    <section
      id={anchorId || 'hero'}
      className="relative w-full py-16 md:py-26 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white dark:from-[#050b14] dark:via-[#081526] dark:to-[#050b14] transition-colors duration-300 group/textbg"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

      {/* Technical Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d424_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {isStack ? (
          <div className="flex flex-col items-center gap-12">
            {pos === 'top' && <div className="max-w-4xl w-full">{analyticalImageBlock}</div>}
            <div className="max-w-4xl w-full">{analyticalTextBlock}</div>
            {pos === 'bottom' && <div className="max-w-4xl w-full">{analyticalImageBlock}</div>}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {pos === 'right' ? (
              <>
                <div className="lg:col-span-6">{analyticalImageBlock}</div>
                <div className="lg:col-span-6">{analyticalTextBlock}</div>
              </>
            ) : (
              <>
                <div className="lg:col-span-6">{analyticalTextBlock}</div>
                <div className="lg:col-span-6">{analyticalImageBlock}</div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
