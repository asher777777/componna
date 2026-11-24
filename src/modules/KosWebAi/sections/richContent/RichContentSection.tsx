import React from 'react';
import {
  RichContentSectionConfig,
  RichContentItem,
} from '../../types/sectionConfigs';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import {
  ArrowLeft,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Sparkles,
  Quote,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import {
  resolveSectionTheme,
  SectionStyleKey,
  getTitleScaleClass,
  getDescScaleClass,
  getButtonShapeClass,
  getButtonSizeClass,
} from '../../styles';
import { ensureReadableTextColor } from '../../styles/resolveSectionTheme';

const DEFAULT_FALLBACK_BG =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';

const CARD_STYLE_MAP: Record<
  SectionStyleKey,
  {
    baseCard: string;
    iconBox: string;
    badgeText: string;
    titleText: string;
    descText: string;
    defaultIcon: string;
  }
> = {
  standard: {
    baseCard:
      'bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500/40',
    iconBox:
      'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-500/30',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    titleText: 'text-slate-900 dark:text-white',
    descText: 'text-slate-600 dark:text-slate-300',
    defaultIcon: 'Sparkles',
  },
  feminine: {
    baseCard:
      'bg-white/85 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 shadow-xl shadow-rose-500/10 hover:border-rose-400',
    iconBox:
      'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-400/30',
    badgeText: 'text-rose-600 dark:text-rose-300',
    titleText: 'text-stone-900 dark:text-rose-50',
    descText: 'text-stone-600 dark:text-rose-100/80',
    defaultIcon: 'Heart',
  },
  masculine: {
    baseCard:
      'bg-zinc-900 border border-zinc-800 shadow-2xl hover:border-amber-500/50',
    iconBox:
      'bg-zinc-950 text-amber-400 border border-amber-500/40',
    badgeText: 'text-amber-400',
    titleText: 'text-white',
    descText: 'text-zinc-400',
    defaultIcon: 'Shield',
  },
  spiritual: {
    baseCard:
      'bg-white/75 dark:bg-teal-950/30 border border-teal-700/20 dark:border-teal-400/25 backdrop-blur-md shadow-lg hover:border-teal-500/50',
    iconBox:
      'bg-teal-900/10 dark:bg-teal-400/15 text-teal-700 dark:text-amber-300 border border-teal-700/20 dark:border-teal-400/30',
    badgeText: 'text-teal-700 dark:text-amber-300',
    titleText: 'text-teal-950 dark:text-emerald-50',
    descText: 'text-teal-900/75 dark:text-emerald-100/75',
    defaultIcon: 'Sun',
  },
  sharp: {
    baseCard:
      'bg-white dark:bg-zinc-950 border-2 border-slate-950 dark:border-white shadow-[6px_6px_0px_0px_#6366f1] hover:translate-x-[2px] hover:translate-y-[2px]',
    iconBox:
      'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-2 border-slate-950 dark:border-white',
    badgeText: 'text-indigo-600 dark:text-indigo-400 font-mono',
    titleText: 'text-slate-950 dark:text-white',
    descText: 'text-slate-700 dark:text-zinc-300',
    defaultIcon: 'Crosshair',
  },
  analytical: {
    baseCard:
      'bg-white/90 dark:bg-slate-900/85 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 hover:border-cyan-400',
    iconBox:
      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30',
    badgeText: 'text-cyan-600 dark:text-cyan-400 font-mono',
    titleText: 'text-slate-900 dark:text-white',
    descText: 'text-slate-600 dark:text-slate-300',
    defaultIcon: 'Activity',
  },
};

export const RichContentSection: React.FC<{ config: RichContentSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const {
    anchorId,
    heading = 'אודות הפרויקט והחזון שלנו',
    subtitle,
    body = '',
    imageSrc,
    layout = 'auto',
    contentLayout,
    objectScale = 'auto',
    buttonShape = 'auto',
    buttonSize = 'auto',
    imagePosition = 'auto',
    buttonsVisible = false,
    primaryButton,
    secondaryButton,
    backgroundColor = 'transparent',
    useBrandColors,
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
    cardFrameShape = 'auto',
    cardIconPosition = 'side',
    isAsymmetricGrid = false,
    cardStylePresetEffect = 'auto',
  } = config;

  const isLegacyContentLayout =
    layout === 'split-story' ||
    layout === 'quote-hero' ||
    layout === 'timeline-vision' ||
    layout === 'bento-about' ||
    layout === 'two-columns' ||
    layout === 'highlight-box' ||
    layout === 'cards-grid-3' ||
    layout === 'cards-grid-2';

  const effectiveContentMode = contentLayout || (isLegacyContentLayout ? layout : 'standard');

  const { styleKey, tokens, resolvedColors, effectiveButtonShape } = resolveSectionTheme(
    {
      layout: isLegacyContentLayout ? 'standard' : layout,
      useBrandColors,
      backgroundColor,
      titleColor: headingColor,
      descriptionColor: bodyColor,
      primaryButtonColor,
      secondaryButtonColor,
      buttonShape,
      textBgEnabled,
      textBgOverlayColor,
    },
    brandDna
  );

  const hasItems = Array.isArray(items) && items.length > 0;
  const hasButtons = Boolean(buttonsVisible && (primaryButton?.text || secondaryButton?.text));

  const effectiveBgImage = textBgImageUrl || imageSrc || DEFAULT_FALLBACK_BG;
  const overlayAlpha = Math.min(95, Math.max(10, textBgOverlayOpacity ?? 70)) / 100;
  const effectiveOverlayHex =
    textBgOverlayColor && textBgOverlayColor !== 'transparent'
      ? textBgOverlayColor
      : resolvedColors.overlayHex;

  const pos = imagePosition === 'auto' ? 'left' : imagePosition;
  const isStack = pos === 'top' || pos === 'bottom';

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
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getCardShapeClass = (shape: string, preset: SectionStyleKey) => {
    if (shape === 'sharp') return 'rounded-none';
    if (shape === 'rounded') return 'rounded-3xl';
    if (shape === 'pill') return 'rounded-[3rem]';
    if (shape === 'arched') return 'rounded-t-[4rem] rounded-b-2xl';
    if (shape === 'chiseled') return 'rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md';
    if (preset === 'sharp') return 'rounded-none';
    if (preset === 'masculine') return 'rounded-2xl';
    if (preset === 'feminine' || preset === 'spiritual') return 'rounded-3xl';
    if (preset === 'analytical') return 'rounded-xl';
    return 'rounded-2xl';
  };

  const getEffectExtraClass = () => {
    if (cardStylePresetEffect === 'glass') return 'backdrop-blur-xl bg-opacity-70';
    if (cardStylePresetEffect === 'heavy-border') return 'border-2';
    if (cardStylePresetEffect === 'glow') return 'shadow-2xl';
    return '';
  };

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
        style={{ backgroundColor: effectiveOverlayHex, opacity: overlayAlpha }}
      />
    </div>
  );

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

  const renderMilestoneGrid = (milestoneItems: RichContentItem[]) => {
    if (!Array.isArray(milestoneItems) || milestoneItems.length === 0) return null;
    const shapeClass = getCardShapeClass(cardFrameShape, styleKey);
    const is2Cols = effectiveContentMode === 'cards-grid-2';
    const cardTheme = CARD_STYLE_MAP[styleKey];

    return (
      <div
        className={clsx(
          'grid gap-6 mt-8 w-full',
          is2Cols ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          isAsymmetricGrid && 'lg:gap-8 items-start'
        )}
      >
        {milestoneItems.map((item, idx) => {
          const desc = item.text || item.description;
          const asymmetricOffset = isAsymmetricGrid
            ? is2Cols
              ? idx % 2 === 1
                ? 'md:translate-y-6'
                : ''
              : idx % 3 === 1
                ? 'lg:translate-y-6'
                : idx % 3 === 2
                  ? 'lg:translate-y-3'
                  : ''
            : '';

          return (
            <div
              key={item.id || idx}
              className={clsx(
                'group p-6 text-right transition-all duration-500 flex flex-col',
                shapeClass,
                cardTheme.baseCard,
                getEffectExtraClass(),
                asymmetricOffset
              )}
            >
              <div
                className={clsx(
                  'flex gap-4',
                  cardIconPosition === 'top' ? 'flex-col items-start' : 'flex-row items-start'
                )}
              >
                <div
                  className={clsx(
                    'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                    styleKey === 'sharp' && 'rounded-none',
                    cardTheme.iconBox
                  )}
                >
                  <DynamicIcon name={item.icon || cardTheme.defaultIcon} className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className={clsx('text-base sm:text-lg font-extrabold', cardTheme.titleText)}>
                    {item.title}
                  </h3>
                  {desc && (
                    <p className={clsx('text-sm leading-relaxed', cardTheme.descText)}>{desc}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const mainContentBody = (
    <div
      className={clsx(
        'flex flex-col',
        (effectiveContentMode === 'quote-hero' || effectiveContentMode === 'timeline-vision') &&
          'items-center text-center'
      )}
    >
      <div className="inline-flex mb-4">
        <span className={tokens.badge.className}>
          {renderBadgeIcon()}
          <span>אודות / תוכן מעוצב</span>
        </span>
      </div>

      <h2
        className={clsx(
          getTitleScaleClass(undefined, objectScale, 'text-3xl sm:text-4xl md:text-5xl'),
          tokens.typography.defaultTitleWeight,
          tokens.typography.titleClass,
          textBgEnabled && 'text-white'
        )}
        style={{ color: resolvedColors.titleColor }}
      >
        {heading}
      </h2>

      {subtitle && (
        <p
          className={clsx(
            'text-base sm:text-lg mt-3',
            tokens.typography.subtitleClass,
            textBgEnabled && 'text-slate-200'
          )}
          style={{ color: resolvedColors.subtitleColor }}
        >
          {subtitle}
        </p>
      )}

      {body && (
        <div
          className={clsx(
            getDescScaleClass(undefined, objectScale, 'text-base sm:text-lg'),
            'mt-5 leading-relaxed space-y-3',
            effectiveContentMode === 'two-columns' && 'sm:columns-2 sm:gap-8',
            effectiveContentMode === 'highlight-box' &&
              clsx('p-6 sm:p-8', tokens.cardClass, getCardShapeClass(cardFrameShape, styleKey)),
            tokens.typography.descClass,
            textBgEnabled && effectiveContentMode !== 'highlight-box' && 'text-slate-100'
          )}
          style={{
            color:
              effectiveContentMode === 'highlight-box'
                ? ensureReadableTextColor(
                    resolvedColors.descriptionColor,
                    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
                      ? '#0f172a'
                      : '#ffffff',
                    4.5,
                    '#e2e8f0',
                    '#334155',
                    false
                  )
                : resolvedColors.descriptionColor,
          }}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}

      {hasButtons && (
        <div
          className={clsx(
            'flex flex-wrap items-center gap-4 mt-8',
            (effectiveContentMode === 'quote-hero' || effectiveContentMode === 'timeline-vision') &&
              'justify-center'
          )}
        >
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
              <ArrowLeft className="w-4 h-4" />
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

  const imageBlock = imageSrc ? (
    <div
      className={clsx(
        'overflow-hidden shadow-2xl group relative',
        getCardShapeClass(cardFrameShape, styleKey),
        styleKey === 'sharp' && 'border-2 border-slate-950 dark:border-white shadow-[8px_8px_0px_0px_#6366f1]',
        styleKey === 'feminine' && 'border-4 border-white dark:border-rose-950/60',
        styleKey === 'masculine' && 'border-2 border-zinc-800',
        styleKey === 'analytical' && 'border border-cyan-500/30',
        styleKey === 'standard' && 'border border-slate-200 dark:border-white/10'
      )}
    >
      <img
        src={imageSrc}
        alt={heading}
        className="w-full h-auto max-h-[460px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
      />
    </div>
  ) : null;

  return (
    <section
      id={anchorId || 'richContent'}
      className={clsx(
        'relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300 group/textbg',
        tokens.sectionClass
      )}
      style={{ backgroundColor: resolvedColors.backgroundColor }}
      dir="rtl"
    >
      {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

      <div className="max-w-7xl mx-auto relative z-10">
        {effectiveContentMode === 'split-story' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">{wrapTextWithOptionalBg(mainContentBody)}</div>
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
                    <p className="text-xs text-slate-200 line-clamp-2">{subtitle || heading}</p>
                  </div>
                </div>
              ) : (
                <div
                  className={clsx(
                    'p-8 rounded-[2.5rem] flex flex-col justify-center min-h-[340px]',
                    tokens.cardClass
                  )}
                >
                  <Quote className="w-10 h-10 text-amber-400 mb-4 opacity-80" />
                  <p className={clsx('text-xl sm:text-2xl font-bold leading-relaxed italic mb-4', tokens.typography.titleClass)}>
                    ״{subtitle || heading}״
                  </p>
                  <span className={clsx('text-xs font-bold uppercase tracking-wider', tokens.typography.subtitleClass)}>
                    החזון והשליחות המנחים אותנו
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : effectiveContentMode === 'quote-hero' ? (
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
            <div className="w-14 h-14 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
              <Quote className="w-7 h-7" />
            </div>
            {wrapTextWithOptionalBg(mainContentBody)}
          </div>
        ) : effectiveContentMode === 'timeline-vision' ? (
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
              {wrapTextWithOptionalBg(mainContentBody)}
            </div>
            {renderMilestoneGrid(
              hasItems
                ? items
                : [
                    { id: '1', title: '1. החזון והיסודות', text: 'הגדרת השליחות והערכים המרכזיים המובילים את פעילותנו.', icon: 'Compass' },
                    { id: '2', title: '2. צמיחה ועשייה', text: 'פיתוח מתמיד, חיבור לקהילה ומתן מענה מקצועי ללא פשרות.', icon: 'Activity' },
                    { id: '3', title: '3. העתיד והיעדים', text: 'הרחבת ההשפעה, חדשנות פורצת דרך והובלת הסטנדרט קדימה.', icon: 'Sparkles' },
                  ]
            )}
          </div>
        ) : effectiveContentMode === 'bento-about' ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className={clsx('lg:col-span-7 p-8 sm:p-10 rounded-[2.5rem] flex flex-col justify-between gap-6', tokens.cardClass)}>
              {wrapTextWithOptionalBg(mainContentBody)}
            </div>
            <div className={clsx('lg:col-span-5 rounded-[2.5rem] overflow-hidden relative min-h-[300px]', tokens.cardClass)}>
              {imageSrc ? (
                <img src={imageSrc} alt={heading} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                  <Sparkles className="w-12 h-12 text-amber-400 mb-3" />
                  <p className={clsx('text-lg font-bold', tokens.typography.titleClass)}>
                    מחויבים לאיכות ולחזון
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : isStack || !imageBlock ? (
          <div className="flex flex-col gap-8">
            {pos === 'top' && imageBlock}
            {wrapTextWithOptionalBg(mainContentBody)}
            {pos === 'bottom' && imageBlock}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {pos === 'right' ? (
              <>
                <div className="lg:col-span-5">{imageBlock}</div>
                <div className="lg:col-span-7">{wrapTextWithOptionalBg(mainContentBody)}</div>
              </>
            ) : (
              <>
                <div className="lg:col-span-7">{wrapTextWithOptionalBg(mainContentBody)}</div>
                <div className="lg:col-span-5">{imageBlock}</div>
              </>
            )}
          </div>
        )}

        {hasItems && effectiveContentMode !== 'timeline-vision' && renderMilestoneGrid(items)}
      </div>
    </section>
  );
};
