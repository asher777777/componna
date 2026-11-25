import React from 'react';
import { HeroSectionConfig } from '../../types/sectionConfigs';
import {
  ArrowLeft,
  Shield,
  Activity,
  TrendingUp,
  Sun,
  Crosshair,
  Heart,
} from 'lucide-react';
import { clsx } from 'clsx';
import { resolveSafeMediaUrl } from '../../../KosCloudStore/utils/mediaUrlSanitizer';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import {
  resolveSectionTheme,
  getTitleScaleClass,
  getTitleWeightClass,
  getSubtitleScaleClass,
  getDescScaleClass,
  getButtonShapeClass,
  getButtonSizeClass,
} from '../../styles';

const DEFAULT_FALLBACK_BG =
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80';

const isVideoMedia = (url?: string): boolean => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('data:image/')) return false;
  const clean = decodeURIComponent(url.split('?')[0].split('#')[0]).toLowerCase();
  return /\.(mp4|webm|ogg|mov|mkv|m4v)$/i.test(clean);
};

export const HeroSection: React.FC<{ config: HeroSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const {
    anchorId,
    title,
    subtitle,
    description,
    imageSrc,
    videoBgUrl,
    layout = 'auto',
    heroStyle = 'mesh-glow',
    objectScale = 'massive',
    buttonShape = 'auto',
    buttonSize = 'auto',
    imagePosition = 'bottom',
    buttonsVisible = true,
    primaryButton,
    secondaryButton,
    backgroundColor = 'transparent',
    useBrandColors,
    titleColor,
    descriptionColor,
    primaryButtonColor,
    secondaryButtonColor,
    accentColor,
    textBgEnabled = true,
    textBgImageUrl,
    textBgOverlayColor,
    textBgOverlayOpacity = 70,
    textBgEffect = 'zoom-glow',
    textBgScope = 'full-section',
    analyticalMetrics,
    announcementBadge,
    imageBadge,
    titleFontSize,
    titleFontWeight,
    titleAlignment,
    subtitleFontSize,
    descriptionFontSize,
  } = config;

  const { styleKey, tokens, resolvedColors, effectiveButtonShape } = resolveSectionTheme(
    {
      layout,
      useBrandColors,
      backgroundColor,
      titleColor,
      descriptionColor,
      accentColor,
      primaryButtonColor,
      secondaryButtonColor,
      buttonShape,
      textBgEnabled,
      textBgOverlayColor,
    },
    brandDna
  );

  const safeImageSrc = imageSrc ? resolveSafeMediaUrl(imageSrc) : '';
  const safeVideoBgUrl = videoBgUrl ? resolveSafeMediaUrl(videoBgUrl) : '';
  const safeTextBgImageUrl = textBgImageUrl ? resolveSafeMediaUrl(textBgImageUrl) : '';
  const effectiveBgMedia = safeVideoBgUrl || safeTextBgImageUrl || safeImageSrc || DEFAULT_FALLBACK_BG;
  const isBgVideo = Boolean(safeVideoBgUrl) || isVideoMedia(effectiveBgMedia);
  const effectiveObjectScale = objectScale === 'auto' ? 'massive' : objectScale;
  const overlayAlpha = Math.min(95, Math.max(10, textBgOverlayOpacity ?? 70)) / 100;
  const effectiveOverlayHex =
    textBgOverlayColor && textBgOverlayColor !== 'transparent'
      ? textBgOverlayColor
      : resolvedColors.overlayHex;

  const pos = imagePosition === 'auto' ? tokens.defaultImagePosition : imagePosition;
  const isStack = pos === 'top' || pos === 'bottom';
  const isCenteredStack = isStack && (styleKey === 'standard' || styleKey === 'spiritual');

  const renderBadgeIcon = () => {
    switch (tokens.badge.iconType) {
      case 'heart':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400/40" />;
      case 'shield':
        return <Shield className="w-3.5 h-3.5" />;
      case 'sun':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'crosshair':
        return <Crosshair className="w-3.5 h-3.5" />;
      case 'activity':
        return <Activity className="w-3.5 h-3.5" />;
      case 'arrow':
      default:
        return <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />;
    }
  };

  const renderTextBgLayer = () => {
    const mediaEffectClass = clsx(
      'w-full h-full object-cover transition-all ease-out',
      textBgEffect === 'zoom-glow' && 'duration-1000 group-hover/textbg:scale-110',
      textBgEffect === 'shimmer-sweep' && 'duration-700 group-hover/textbg:scale-105',
      textBgEffect === 'float-parallax' &&
        'duration-700 scale-105 group-hover/textbg:scale-110 group-hover/textbg:-translate-y-2',
      textBgEffect === 'blur-reveal' &&
        'duration-700 blur-[3px] scale-105 group-hover/textbg:blur-0 group-hover/textbg:scale-100',
      textBgEffect === 'gradient-shift' &&
        'duration-1000 group-hover/textbg:scale-105 group-hover/textbg:rotate-1'
    );

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[inherit]">
        {isBgVideo ? (
          <video
            src={effectiveBgMedia}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className={mediaEffectClass}
          />
        ) : (
          <img
            src={effectiveBgMedia}
            alt=""
            aria-hidden="true"
            className={mediaEffectClass}
          />
        )}
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover/textbg:opacity-80"
          style={{ backgroundColor: effectiveOverlayHex, opacity: overlayAlpha }}
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
  };

  const wrapTextWithOptionalBg = (content: React.ReactNode) => {
    if (!textBgEnabled || textBgScope === 'full-section') return content;
    return (
      <div
        className={clsx(
          'relative overflow-hidden p-6 sm:p-10 transition-all duration-500 shadow-2xl border border-white/15 group/textbg w-full',
          tokens.textCardRadiusClass
        )}
      >
        {renderTextBgLayer()}
        <div className="relative z-10">{content}</div>
      </div>
    );
  };

  const alignClass =
    titleAlignment === 'left'
      ? 'text-left'
      : titleAlignment === 'center' || isStack
        ? 'text-center'
        : 'text-right';

  const metrics =
    analyticalMetrics && analyticalMetrics.length > 0
      ? analyticalMetrics
      : [
          { id: 'm1', label: 'שיעור המרה ממוצע', value: '+34.8%', trend: '▲ מגמת עלייה' },
          { id: 'm2', label: 'מהירות תגובה', value: '0.2s', trend: 'SLA 99.9%' },
          { id: 'm3', label: 'לקוחות פעילים', value: '12,480', trend: 'מאומת בזמן אמת' },
        ];

  const textBlock = wrapTextWithOptionalBg(
    <div
      className={clsx(
        'flex flex-col',
        isStack ? 'items-center text-center' : 'items-start text-right'
      )}
    >
      {announcementBadge?.text &&
        announcementBadge.text.trim() !== 'חדשנות ומצוינות 2026' &&
        (announcementBadge as any).visible !== false && (
        <a href={announcementBadge.url || '#'} className={tokens.badge.className}>
          {tokens.badge.iconType !== 'arrow' && renderBadgeIcon()}
          <span>{announcementBadge.text}</span>
          {tokens.badge.iconType === 'arrow' && renderBadgeIcon()}
        </a>
      )}

      <h1
        className={clsx(
          getTitleScaleClass(titleFontSize, effectiveObjectScale, tokens.typography.defaultTitleScale),
          getTitleWeightClass(titleFontWeight, tokens.typography.defaultTitleWeight),
          alignClass,
          'max-w-4xl',
          tokens.typography.titleClass,
          textBgEnabled && 'text-white'
        )}
        style={{ color: resolvedColors.titleColor }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className={clsx(
            getSubtitleScaleClass(subtitleFontSize, tokens.typography.defaultSubtitleScale),
            alignClass,
            'mt-4',
            tokens.typography.subtitleClass,
            textBgEnabled && 'text-slate-200'
          )}
          style={{ color: resolvedColors.subtitleColor }}
        >
          {subtitle}
        </p>
      )}

      {description && (
        <p
          className={clsx(
            getDescScaleClass(descriptionFontSize, effectiveObjectScale, tokens.typography.defaultDescScale),
            alignClass,
            'mt-6',
            tokens.typography.descClass,
            styleKey === 'masculine' && !isStack && 'border-r-2 border-zinc-700 pr-4',
            textBgEnabled && 'text-slate-200'
          )}
          style={{ color: resolvedColors.descriptionColor }}
        >
          {description}
        </p>
      )}

      {styleKey === 'analytical' && (
        <div className="grid grid-cols-3 gap-3 w-full max-w-xl mt-7">
          {metrics.slice(0, 3).map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-cyan-500/20 shadow-sm text-right"
            >
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {m.label}
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-cyan-300 mt-0.5">
                {m.value}
              </div>
              {m.trend && (
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {m.trend}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {buttonsVisible && (primaryButton || secondaryButton) && (
        <div className={clsx('flex flex-wrap items-center gap-4 mt-9', isStack && 'justify-center')}>
          {primaryButton?.text && (
            <a
              href={primaryButton.url || '#'}
              target={primaryButton.target}
              style={{
                backgroundColor: resolvedColors.primaryButtonColor,
                color: resolvedColors.primaryButtonTextColor,
              }}
              className={clsx(
                tokens.button.primaryClass,
                getButtonShapeClass(effectiveButtonShape, tokens.button.defaultShapeRadius),
                getButtonSizeClass(buttonSize, tokens.button.defaultSizeClass)
              )}
            >
              <span>{primaryButton.text}</span>
              {styleKey === 'analytical' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
            </a>
          )}
          {secondaryButton?.text && (
            <a
              href={secondaryButton.url || '#'}
              target={secondaryButton.target}
              style={{ backgroundColor: resolvedColors.secondaryButtonColor }}
              className={clsx(
                tokens.button.secondaryClass,
                getButtonShapeClass(effectiveButtonShape, tokens.button.defaultShapeRadius),
                getButtonSizeClass(buttonSize, tokens.button.defaultSizeClass)
              )}
            >
              <span>{secondaryButton.text}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );

  const renderMediaBlock = () => {
    if (!safeImageSrc) return null;

    if (tokens.mediaVariant === 'portal') {
      return (
        <div className="relative flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full p-2 border border-teal-600/25 dark:border-amber-400/25 shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/80 dark:border-teal-900/60">
              <img
                src={safeImageSrc}
                alt={title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>
        </div>
      );
    }

    if (tokens.mediaVariant === 'arch') {
      return (
        <div className="relative group">
          <div className="rounded-t-[10rem] rounded-b-3xl overflow-hidden border-4 border-white dark:border-rose-950/60 shadow-2xl shadow-rose-500/10 relative">
            <img
              src={safeImageSrc}
              alt={title}
              className="w-full h-auto max-h-[520px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
          {imageBadge?.visible !== false && (
            <div className="absolute -bottom-4 right-6 px-4 py-2 rounded-full bg-white/95 dark:bg-zinc-900/95 border border-rose-200 dark:border-rose-500/30 shadow-lg text-xs font-medium text-rose-900 dark:text-rose-200">
              {imageBadge?.text || tokens.defaultImageBadgeText}
            </div>
          )}
        </div>
      );
    }

    if (tokens.mediaVariant === 'hud') {
      return (
        <div className="relative p-3 rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 group">
          <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-cyan-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ANALYTICS HUD // LIVE TELEMETRY</span>
            </div>
            <span className="text-slate-400">{imageBadge?.text || tokens.defaultImageBadgeText}</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-800 relative">
            <img
              src={safeImageSrc}
              alt={title}
              className="w-full h-auto max-h-[480px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        </div>
      );
    }

    if (tokens.mediaVariant === 'brutalist') {
      return (
        <div className="relative border-2 border-slate-950 dark:border-white shadow-[10px_10px_0px_0px_#6366f1] bg-white dark:bg-zinc-950 p-2 group">
          <img
            src={safeImageSrc}
            alt={title}
            className="w-full h-auto max-h-[500px] object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      );
    }

    if (tokens.mediaVariant === 'charcoal-frame') {
      return (
        <div className="relative group">
          <div className="rounded-xl overflow-hidden border-2 border-zinc-800 shadow-2xl bg-zinc-900 relative">
            <img
              src={safeImageSrc}
              alt={title}
              className="w-full h-auto max-h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
          {imageBadge?.visible !== false && (
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-zinc-900 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>{imageBadge?.text || tokens.defaultImageBadgeText}</span>
            </div>
          )}
        </div>
      );
    }

    // Default: 'browser'
    return (
      <div className="w-full max-w-5xl p-2 sm:p-4 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 group">
        <div className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 relative">
          <div className="flex items-center px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
          </div>
          <img
            src={safeImageSrc}
            alt={title}
            className="w-full h-auto object-cover max-h-[600px] group-hover:scale-[1.01] transition-transform duration-700 ease-out"
          />
        </div>
      </div>
    );
  };

  const mediaBlock = textBgEnabled ? null : renderMediaBlock();

  return (
    <section
      id={anchorId || 'hero'}
      className={clsx(
        'relative w-full py-16 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300 group/textbg',
        tokens.sectionClass,
        styleKey === 'standard' &&
          heroStyle === 'modern' &&
          'bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-950'
      )}
      style={{ backgroundColor: resolvedColors.backgroundColor }}
      dir="rtl"
    >
      {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

      {styleKey === 'standard' && (
        <>
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {styleKey === 'analytical' && (
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d424_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {isStack || !mediaBlock ? (
          <div
            className={clsx(
              'flex flex-col items-center gap-12',
              isCenteredStack ? 'text-center' : ''
            )}
          >
            {pos === 'top' && mediaBlock && <div className="max-w-4xl w-full flex justify-center">{mediaBlock}</div>}
            <div className="max-w-4xl w-full">{textBlock}</div>
            {pos === 'bottom' && mediaBlock && <div className="max-w-5xl w-full flex justify-center">{mediaBlock}</div>}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {pos === 'right' ? (
              <>
                <div className="lg:col-span-6">{mediaBlock}</div>
                <div className="lg:col-span-6">{textBlock}</div>
              </>
            ) : (
              <>
                <div className="lg:col-span-6">{textBlock}</div>
                <div className="lg:col-span-6">{mediaBlock}</div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
