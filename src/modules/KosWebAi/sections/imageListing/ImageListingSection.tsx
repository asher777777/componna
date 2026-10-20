import React, { useState, useEffect, useRef } from 'react';
import {
  ImageListingSectionConfig,
  ImageListingLayoutPreset,
  ImageListingItem,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Shield,
  Compass,
  Crosshair,
  Layers,
  ArrowLeft,
  Eye,
  Sliders,
  Play,
  Pause,
} from 'lucide-react';
import { clsx } from 'clsx';

interface ImageListingSectionProps {
  config: ImageListingSectionConfig;
}

export const ImageListingSection: React.FC<ImageListingSectionProps> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  // Destructure config with comprehensive defaults
  const {
    anchorId = 'imageListing',
    title,
    subtitle,
    badge,
    titleColor,
    subtitleColor,
    badgeColor,
    cardBackgroundColor,
    backgroundColor = 'transparent',
    imagesPerRow = 3,
    imagesPerRowMobile = 1,
    images: configuredImages,
    layout = 'standard',
    displayMode = 'grid',
    objectScale = 'normal',
    buttonShape = 'auto',
    buttonSize = 'normal',
    cardAspectRatio = 'square',
    showLightbox = true,
    carouselAutoplay = false,
    autoplayInterval = 3500,
    showCarouselArrows = true,
    showCarouselDots = true,
    backgroundMode = 'static',
    backgroundRotateInterval = 5000,
    textBgEnabled = false,
    textBgImageUrl,
    textBgOverlayColor = '#000000',
    textBgOverlayOpacity = 0.6,
    textBgEffect = 'zoom-glow',
    textBgScope = 'header',
    showCtaButton = false,
    ctaText = 'לכל התמונות והפרויקטים',
    ctaUrl = '#contact',
  } = config;

  // Resolve Brand DNA defaults if not explicitly configured
  const companyName = brandDna?.identity?.companyName || '';
  const brandSlogan = brandDna?.identity?.slogan || '';
  const brandVibeImages = brandDna?.identity?.vibeImages || [];
  const brandLogo = brandDna?.identity?.logoUrl || '';

  // Default title and subtitle based on Brand DNA if absent
  const effectiveTitle =
    title ?? (companyName ? `גלריית ${companyName}` : 'גלריית תמונות מהאירועים והעשייה שלנו');
  const effectiveSubtitle =
    subtitle ?? (brandSlogan || 'הצצה לעולם העשיר, ליצירה ולפרויקטים המובילים שלנו');
  const effectiveBadge =
    badge ?? (companyName ? `• ${companyName} SHOWCASE •` : '• גלריית מדיה •');

  // Fallback default images generated smartly from Brand DNA or curated photography
  const fallbackImages: ImageListingItem[] = React.useMemo(() => {
    const list: ImageListingItem[] = [];

    if (brandVibeImages.length > 0) {
      brandVibeImages.forEach((imgUrl, idx) => {
        list.push({
          id: `vibe-${idx}`,
          imageUrl: imgUrl,
          title: `פרויקט ${idx + 1} • ${companyName || 'העשייה שלנו'}`,
          subtitle: brandSlogan || 'תיעוד בלעדי מהשטח',
          tag: 'פרויקט נבחר',
        });
      });
    }

    if (brandLogo && list.length < 3) {
      list.push({
        id: 'brand-logo-card',
        imageUrl: brandLogo,
        title: companyName ? `החותם של ${companyName}` : 'ערכי המותג',
        subtitle: 'איכות ומצוינות ללא פשרות',
        tag: 'מיתוג רשמי',
      });
    }

    // If still empty or minimal, supplement with curated theme-ready photography
    if (list.length === 0) {
      list.push(
        {
          id: '1',
          imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
          title: companyName ? `אירוע פתיחה מרכזי • ${companyName}` : 'אירוע פתיחה מרכזי',
          subtitle: 'כנס מקצועי ומפגש שותפים',
          tag: 'אירוע מרכזי',
        },
        {
          id: '2',
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
          title: 'צוות ההדרכה והפיתוח',
          subtitle: 'חשיבה יצירתית וחדשנות טכנולוגית',
          tag: 'מאחורי הקלעים',
        },
        {
          id: '3',
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
          title: 'מרכז הלמידה והדיגיטל',
          subtitle: 'תשתיות עבודה וסביבת פיתוח',
          tag: 'סביבת עבודה',
        },
        {
          id: '4',
          imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
          title: 'סדנת אסטרטגיה וליווי',
          subtitle: 'הובלת תהליכים ומצוינות עסקית',
          tag: 'סדנאות',
        }
      );
    }

    return list;
  }, [brandVibeImages, brandLogo, companyName, brandSlogan]);

  const items: ImageListingItem[] =
    configuredImages && configuredImages.length > 0 ? configuredImages : fallbackImages;

  // State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rotatingBgIndex, setRotatingBgIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState<ImageListingItem | null>(null);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  // Background Rotation Timer
  useEffect(() => {
    if (backgroundMode !== 'rotating-images' || items.length <= 1) return;
    const interval = setInterval(() => {
      setRotatingBgIndex((prev) => (prev + 1) % items.length);
    }, backgroundRotateInterval || 5000);
    return () => clearInterval(interval);
  }, [backgroundMode, items.length, backgroundRotateInterval]);

  // Carousel Autoplay Timer
  const effectiveItemsPerView = Math.min(Math.max(1, imagesPerRow || 3), items.length || 1);
  const maxCarouselIndex = Math.max(0, items.length - effectiveItemsPerView);

  useEffect(() => {
    if (displayMode !== 'carousel' || !carouselAutoplay || isAutoplayPaused || maxCarouselIndex <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev >= maxCarouselIndex ? 0 : prev + 1));
    }, autoplayInterval || 3500);
    return () => clearInterval(timer);
  }, [displayMode, carouselAutoplay, isAutoplayPaused, maxCarouselIndex, autoplayInterval]);

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev <= 0 ? maxCarouselIndex : prev - 1));
  };

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev >= maxCarouselIndex ? 0 : prev + 1));
  };

  // Lightbox navigation
  const currentLightboxIdx = lightboxItem ? items.findIndex((i) => i.id === lightboxItem.id) : -1;
  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentLightboxIdx > 0) {
      setLightboxItem(items[currentLightboxIdx - 1]);
    } else {
      setLightboxItem(items[items.length - 1]);
    }
  };
  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentLightboxIdx < items.length - 1) {
      setLightboxItem(items[currentLightboxIdx + 1]);
    } else {
      setLightboxItem(items[0]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxItem(null);
      if (e.key === 'ArrowRight') {
        const idx = items.findIndex((i) => i.id === lightboxItem.id);
        if (idx > 0) setLightboxItem(items[idx - 1]);
      }
      if (e.key === 'ArrowLeft') {
        const idx = items.findIndex((i) => i.id === lightboxItem.id);
        if (idx < items.length - 1) setLightboxItem(items[idx + 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem, items]);

  // Object scale styling
  const getScaleClasses = () => {
    switch (objectScale) {
      case 'compact':
        return {
          py: 'py-10 sm:py-12',
          title: 'text-2xl sm:text-3xl font-bold',
          subtitle: 'text-xs sm:text-sm',
          gap: 'gap-4',
          cardPadding: 'p-3.5',
          cardTitle: 'text-sm font-semibold',
          cardSub: 'text-[11px]',
        };
      case 'large':
        return {
          py: 'py-20 sm:py-24',
          title: 'text-4xl sm:text-5xl font-black tracking-tight',
          subtitle: 'text-base sm:text-lg',
          gap: 'gap-8',
          cardPadding: 'p-6',
          cardTitle: 'text-lg sm:text-xl font-bold',
          cardSub: 'text-xs sm:text-sm',
        };
      case 'massive':
        return {
          py: 'py-24 sm:py-32',
          title: 'text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter',
          subtitle: 'text-lg sm:text-xl font-medium',
          gap: 'gap-10',
          cardPadding: 'p-8',
          cardTitle: 'text-xl sm:text-2xl font-black',
          cardSub: 'text-sm sm:text-base',
        };
      case 'normal':
      default:
        return {
          py: 'py-16 sm:py-20',
          title: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
          subtitle: 'text-sm sm:text-base',
          gap: 'gap-6',
          cardPadding: 'p-5',
          cardTitle: 'text-base sm:text-lg font-bold',
          cardSub: 'text-xs',
        };
    }
  };
  const scale = getScaleClasses();

  // Button Shape styling
  const getButtonShapeClass = () => {
    if (buttonShape === 'round') return 'rounded-full';
    if (buttonShape === 'pill') return 'rounded-full px-5';
    if (buttonShape === 'sharp') return 'rounded-none';
    if (buttonShape === 'square') return 'rounded-md';
    // Auto based on layout
    switch (layout) {
      case 'feminine':
        return 'rounded-full px-5';
      case 'masculine':
        return 'rounded-lg';
      case 'sharp':
        return 'rounded-none';
      case 'spiritual':
        return 'rounded-full';
      case 'analytical':
        return 'rounded-md';
      default:
        return 'rounded-2xl';
    }
  };

  // Aspect ratio classes for gallery cards
  const getAspectRatioClass = (itemRatio?: string) => {
    const eff = itemRatio || cardAspectRatio;
    switch (eff) {
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'wide':
        return 'aspect-[16/10]';
      case 'square':
      default:
        return 'aspect-square';
    }
  };

  // Column classes for grid
  const gridColClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  // Text background effect class
  const getTextBgEffectClass = (effect: HeroTextBgEffect) => {
    switch (effect) {
      case 'zoom-glow':
        return 'group-hover:scale-105 group-hover:brightness-110 transition-all duration-700';
      case 'shimmer-sweep':
        return 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:-translate-x-full group-hover:after:translate-x-full after:transition-transform after:duration-1000';
      case 'float-parallax':
        return 'group-hover:-translate-y-2 group-hover:scale-[1.02] transition-all duration-500';
      case 'blur-reveal':
        return 'blur-[2px] group-hover:blur-0 transition-all duration-500';
      case 'gradient-shift':
        return 'group-hover:contrast-125 transition-all duration-700';
      default:
        return 'transition-transform duration-500 group-hover:scale-105';
    }
  };

  // Determine active background item
  const activeBgImage =
    backgroundMode === 'image-sync' && hoveredIndex !== null && items[hoveredIndex]
      ? items[hoveredIndex].imageUrl
      : backgroundMode === 'rotating-images' && items[rotatingBgIndex]
        ? items[rotatingBgIndex].imageUrl
        : null;

  // Layout Theme Definitions
  const renderLayoutContent = () => {
    switch (layout) {
      case 'feminine':
        return renderFeminineLayout();
      case 'masculine':
        return renderMasculineLayout();
      case 'spiritual':
        return renderSpiritualLayout();
      case 'sharp':
        return renderSharpLayout();
      case 'analytical':
        return renderAnalyticalLayout();
      case 'standard':
      default:
        return renderStandardLayout();
    }
  };

  // ----------------------------------------------------
  // LAYOUT 1: FEMININE (רכה, אלגנטית, קשתות, רוז-גולד)
  // ----------------------------------------------------
  const renderFeminineLayout = () => {
    return (
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="relative text-center max-w-2xl mx-auto space-y-3">
          {effectiveBadge && (
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-sm"
              style={{ color: badgeColor }}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{effectiveBadge}</span>
            </span>
          )}

          {effectiveTitle && (
            <h2
              className={clsx(scale.title, 'text-slate-900 dark:text-rose-50')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>
          )}

          {effectiveSubtitle && (
            <p
              className={clsx(scale.subtitle, 'text-rose-900/70 dark:text-rose-200/70 leading-relaxed font-light')}
              style={{ color: subtitleColor }}
            >
              {effectiveSubtitle}
            </p>
          )}

          {/* Delicate decorative rose gold divider */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="w-8 h-[1px] bg-rose-300 dark:bg-rose-800" />
            <span className="w-2 h-2 rounded-full bg-rose-400/80" />
            <span className="w-8 h-[1px] bg-rose-300 dark:bg-rose-800" />
          </div>
        </div>

        {/* Gallery Items */}
        {renderCardsContainer((item, idx) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => showLightbox && setLightboxItem(item)}
            className={clsx(
              'group relative overflow-hidden rounded-[2.5rem] border border-rose-200/80 dark:border-rose-900/40 bg-white/70 dark:bg-stone-900/60 shadow-lg hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 flex flex-col justify-end cursor-pointer',
              getAspectRatioClass(item.aspectRatio)
            )}
            style={{
              backgroundColor: cardBackgroundColor,
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.title || 'Gallery item'}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            {/* Soft rose gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            {/* Top pill badge */}
            {item.tag && (
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/80 dark:bg-stone-900/80 backdrop-blur-md text-rose-800 dark:text-rose-200 shadow-sm border border-rose-200/50">
                  {item.tag}
                </span>
              </div>
            )}

            {/* Lightbox zoom hint icon */}
            {showLightbox && (
              <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-rose-600 dark:text-rose-300 shadow">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Bottom floating glass caption */}
            <div className="relative z-10 m-3 p-4 rounded-2xl bg-white/85 dark:bg-stone-900/80 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm text-right transition-transform duration-300 group-hover:-translate-y-1">
              {item.subtitle && (
                <span className="text-[11px] text-rose-600 dark:text-rose-300 block mb-0.5 tracking-wide">
                  {item.subtitle}
                </span>
              )}
              {item.title && (
                <h3 className={clsx(scale.cardTitle, 'text-stone-900 dark:text-white leading-snug')}>
                  {item.title}
                </h3>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 2: MASCULINE (עוצמתי, פחם, זהב פליז, שוליים כבדים)
  // ----------------------------------------------------
  const renderMasculineLayout = () => {
    return (
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="relative text-center max-w-3xl mx-auto space-y-3">
          {effectiveBadge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{effectiveBadge}</span>
            </div>
          )}

          {effectiveTitle && (
            <h2
              className={clsx(scale.title, 'font-black uppercase tracking-tight text-white')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>
          )}

          {effectiveSubtitle && (
            <p
              className={clsx(scale.subtitle, 'text-zinc-400 font-medium leading-relaxed')}
              style={{ color: subtitleColor }}
            >
              {effectiveSubtitle}
            </p>
          )}

          <div className="w-20 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent mx-auto rounded-full" />
        </div>

        {/* Gallery Items */}
        {renderCardsContainer((item, idx) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => showLightbox && setLightboxItem(item)}
            className={clsx(
              'group relative overflow-hidden rounded-xl border-2 border-zinc-800 hover:border-amber-500/80 bg-zinc-950 shadow-2xl transition-all duration-300 flex flex-col justify-end cursor-pointer',
              getAspectRatioClass(item.aspectRatio)
            )}
            style={{ backgroundColor: cardBackgroundColor }}
          >
            <img
              src={item.imageUrl}
              alt={item.title || 'Gallery item'}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-105"
            />
            {/* Deep dark cinematic vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Top gold tag */}
            {item.tag && (
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 rounded bg-black/90 text-[10px] font-black tracking-wider uppercase text-amber-400 border border-amber-500/40">
                  {item.tag}
                </span>
              </div>
            )}

            {/* Lightbox zoom hint */}
            {showLightbox && (
              <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-8 h-8 rounded bg-black/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Bottom solid metallic caption */}
            <div className="relative z-10 p-5 border-t border-zinc-800/80 bg-black/85 text-right">
              {item.subtitle && (
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400/90 block mb-1">
                  {item.subtitle}
                </span>
              )}
              {item.title && (
                <h3 className={clsx(scale.cardTitle, 'text-white font-extrabold tracking-tight')}>
                  {item.title}
                </h3>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 3: SPIRITUAL (רוחני, הרמוני, מרווה ומנטה)
  // ----------------------------------------------------
  const renderSpiritualLayout = () => {
    return (
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="relative text-center max-w-2xl mx-auto space-y-3">
          {effectiveBadge && (
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-normal tracking-wider bg-emerald-900/30 text-emerald-300 border border-emerald-500/30"
              style={{ color: badgeColor }}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>{effectiveBadge}</span>
            </span>
          )}

          {effectiveTitle && (
            <h2
              className={clsx(scale.title, 'font-medium tracking-normal text-emerald-50 dark:text-emerald-100')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>
          )}

          {effectiveSubtitle && (
            <p
              className={clsx(scale.subtitle, 'text-emerald-200/70 font-light leading-relaxed max-w-xl mx-auto')}
              style={{ color: subtitleColor }}
            >
              {effectiveSubtitle}
            </p>
          )}

          <div className="flex items-center justify-center gap-1 pt-1 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Gallery Items */}
        {renderCardsContainer((item, idx) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => showLightbox && setLightboxItem(item)}
            className={clsx(
              'group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-950/20 shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-400/50 transition-all duration-700 flex flex-col justify-end cursor-pointer',
              getAspectRatioClass(item.aspectRatio)
            )}
            style={{ backgroundColor: cardBackgroundColor }}
          >
            <img
              src={item.imageUrl}
              alt={item.title || 'Gallery item'}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-in-out"
            />
            {/* Calming sage/emerald atmosphere gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            {item.tag && (
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-light tracking-wide bg-emerald-900/80 backdrop-blur-md text-emerald-200 border border-emerald-400/30 shadow">
                  {item.tag}
                </span>
              </div>
            )}

            {showLightbox && (
              <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-emerald-900/80 backdrop-blur-md flex items-center justify-center text-emerald-200 shadow">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            <div className="relative z-10 p-5 text-right space-y-1">
              {item.subtitle && (
                <span className="text-[11px] text-emerald-300/80 font-light block tracking-wide">
                  {item.subtitle}
                </span>
              )}
              {item.title && (
                <h3 className={clsx(scale.cardTitle, 'text-emerald-50 font-medium leading-snug')}>
                  {item.title}
                </h3>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 4: SHARP (חד, הייטק, מונוכרום, ציאן, 90 מעלות)
  // ----------------------------------------------------
  const renderSharpLayout = () => {
    return (
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="relative text-right sm:text-center max-w-3xl mx-auto space-y-3">
          {effectiveBadge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[11px] font-mono tracking-widest uppercase bg-cyan-950/70 text-cyan-400 border border-cyan-500/50">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>{effectiveBadge}</span>
            </div>
          )}

          {effectiveTitle && (
            <h2
              className={clsx(scale.title, 'font-mono font-bold tracking-tighter text-white uppercase')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>
          )}

          {effectiveSubtitle && (
            <p
              className={clsx(scale.subtitle, 'text-zinc-400 font-mono text-xs sm:text-sm')}
              style={{ color: subtitleColor }}
            >
              {`// ${effectiveSubtitle}`}
            </p>
          )}

          <div className="h-[1px] w-full max-w-xs bg-cyan-500/40 mx-auto" />
        </div>

        {/* Gallery Items */}
        {renderCardsContainer((item, idx) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => showLightbox && setLightboxItem(item)}
            className={clsx(
              'group relative overflow-hidden rounded-none border border-zinc-800 hover:border-cyan-400 bg-black transition-all duration-300 flex flex-col justify-end cursor-pointer',
              getAspectRatioClass(item.aspectRatio)
            )}
            style={{ backgroundColor: cardBackgroundColor }}
          >
            <img
              src={item.imageUrl}
              alt={item.title || 'Gallery item'}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale-[25%] group-hover:grayscale-0"
            />
            {/* Dark technical grid overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

            {/* Corner Tech Brackets */}
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />

            {/* Index label */}
            <div className="absolute top-3 left-3 z-10 font-mono text-[10px] text-cyan-400/90 bg-black/80 px-2 py-0.5 border border-cyan-500/30">
              {`[#0${idx + 1}]`}
            </div>

            {item.tag && (
              <div className="absolute top-3 right-7 z-10">
                <span className="font-mono text-[10px] uppercase text-zinc-300 bg-black/90 px-2 py-0.5 border border-zinc-700">
                  {item.tag}
                </span>
              </div>
            )}

            {/* Bottom info banner */}
            <div className="relative z-10 p-4 border-t border-cyan-500/30 bg-black/95 text-right font-mono">
              {item.subtitle && (
                <span className="text-[10px] text-cyan-400 block mb-0.5 uppercase tracking-wider">
                  {item.subtitle}
                </span>
              )}
              {item.title && (
                <h3 className={clsx(scale.cardTitle, 'text-white font-mono font-bold tracking-tight')}>
                  {item.title}
                </h3>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 5: ANALYTICAL (אנליטי, אינדקס נתונים, סדר קטלוגי)
  // ----------------------------------------------------
  const renderAnalyticalLayout = () => {
    return (
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-700/60 pb-6">
          <div className="text-right space-y-2">
            {effectiveBadge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{effectiveBadge}</span>
              </div>
            )}
            {effectiveTitle && (
              <h2 className={clsx(scale.title, 'font-bold text-white')} style={{ color: titleColor }}>
                {effectiveTitle}
              </h2>
            )}
            {effectiveSubtitle && (
              <p className={clsx(scale.subtitle, 'text-slate-400')} style={{ color: subtitleColor }}>
                {effectiveSubtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-400">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              סה״כ פריטים: <strong className="text-indigo-400">{items.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              תצוגה: <strong className="text-white">{imagesPerRow} בעמודה</strong>
            </span>
          </div>
        </div>

        {/* Gallery Items */}
        {renderCardsContainer((item, idx) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => showLightbox && setLightboxItem(item)}
            className="group rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl hover:border-indigo-500/60 transition-all duration-300 flex flex-col cursor-pointer"
            style={{ backgroundColor: cardBackgroundColor }}
          >
            {/* Image Box */}
            <div className={clsx('relative overflow-hidden w-full', getAspectRatioClass(item.aspectRatio))}>
              <img
                src={item.imageUrl}
                alt={item.title || 'Gallery item'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              {/* Number tag */}
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur font-mono text-[10px] text-slate-300 border border-slate-700">
                {String(idx + 1).padStart(2, '0')}
              </div>

              {item.tag && (
                <div className="absolute bottom-3 right-3 z-10">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-600/90 text-white shadow-sm">
                    {item.tag}
                  </span>
                </div>
              )}
            </div>

            {/* Metadata Bottom Card */}
            <div className="p-4 text-right flex flex-col justify-between flex-1 border-t border-slate-800 bg-slate-950/60">
              <div>
                {item.title && (
                  <h3 className={clsx(scale.cardTitle, 'text-white font-bold leading-snug mb-1')}>
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {item.subtitle}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>פרויקט מאומת</span>
                <span className="text-indigo-400 flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                  צפה במקור <ArrowLeft className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 6: STANDARD (הפריסה העכשווית של KOSUN)
  // ----------------------------------------------------
  const renderStandardLayout = () => {
    return (
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="relative text-center max-w-2xl mx-auto space-y-3">
          {effectiveBadge && (
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
              style={{ color: badgeColor }}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{effectiveBadge}</span>
            </span>
          )}

          {effectiveTitle && (
            <h2
              className={clsx(scale.title, 'text-slate-900 dark:text-white')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>
          )}

          {effectiveSubtitle && (
            <p
              className={clsx(scale.subtitle, 'text-slate-600 dark:text-slate-300 leading-relaxed')}
              style={{ color: subtitleColor }}
            >
              {effectiveSubtitle}
            </p>
          )}
        </div>

        {/* Gallery Items */}
        {renderCardsContainer((item, idx) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => showLightbox && setLightboxItem(item)}
            className={clsx(
              'group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xl hover:shadow-2xl hover:border-indigo-500/40 transition-all duration-500 flex flex-col justify-end cursor-pointer',
              getAspectRatioClass(item.aspectRatio)
            )}
            style={{ backgroundColor: cardBackgroundColor }}
          >
            <img
              src={item.imageUrl}
              alt={item.title || 'Image'}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {item.tag && (
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30 shadow-sm">
                  {item.tag}
                </span>
              </div>
            )}

            {showLightbox && (
              <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-indigo-300 shadow">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {(item.title || item.subtitle) && (
              <div className="relative z-10 p-5 text-right">
                {item.subtitle && (
                  <span className="text-[11px] text-indigo-400 font-bold block mb-1">
                    {item.subtitle}
                  </span>
                )}
                {item.title && (
                  <h3 className={clsx(scale.cardTitle, 'text-white leading-tight')}>
                    {item.title}
                  </h3>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ----------------------------------------------------
  // Container Switcher: Grid vs Carousel vs Marquee vs Masonry
  // ----------------------------------------------------
  const renderCardsContainer = (renderCardFn: (item: ImageListingItem, idx: number) => React.ReactNode) => {
    // 1. CAROUSEL (תצוגה זזה עם חיצים ונקודות)
    if (displayMode === 'carousel') {
      return (
        <div
          className="relative w-full"
          onMouseEnter={() => setIsAutoplayPaused(true)}
          onMouseLeave={() => setIsAutoplayPaused(false)}
        >
          {/* Controls bar */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              {showCarouselArrows && (
                <>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className={clsx(
                      'p-2.5 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-md backdrop-blur-md transition-all cursor-pointer',
                      getButtonShapeClass()
                    )}
                    title="הקודם"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className={clsx(
                      'p-2.5 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-md backdrop-blur-md transition-all cursor-pointer',
                      getButtonShapeClass()
                    )}
                    title="הבא"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              <span>{carouselIndex + 1}</span> / <span>{Math.max(1, items.length - effectiveItemsPerView + 1)}</span>
            </div>
          </div>

          {/* Slider Window */}
          <div className="overflow-hidden w-full rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${carouselIndex * (100 / effectiveItemsPerView)}%)`,
              }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="px-2 shrink-0 transition-opacity"
                  style={{ width: `${100 / effectiveItemsPerView}%` }}
                >
                  {renderCardFn(item, idx)}
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Dots */}
          {showCarouselDots && maxCarouselIndex > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: maxCarouselIndex + 1 }).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCarouselIndex(dotIdx)}
                  className={clsx(
                    'h-2 rounded-full transition-all duration-300 cursor-pointer',
                    carouselIndex === dotIdx ? 'w-7 bg-amber-400 shadow-sm' : 'w-2 bg-slate-700 hover:bg-slate-600'
                  )}
                  title={`עבור לעמודה ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // 2. MARQUEE (פס נע ברצף אינסופי)
    if (displayMode === 'marquee') {
      const doubled = [...items, ...items];
      return (
        <div className="relative w-full overflow-hidden py-4">
          <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max">
            {doubled.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-72 sm:w-80 shrink-0"
              >
                {renderCardFn(item, idx % items.length)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. MASONRY (גובה משתנה / בנטו)
    if (displayMode === 'masonry') {
      return (
        <div className={clsx('columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6')}>
          {items.map((item, idx) => (
            <div key={item.id} className="break-inside-avoid">
              {renderCardFn(item, idx)}
            </div>
          ))}
        </div>
      );
    }

    // 4. GRID (ברירת מחדל רספונסיבית)
    return (
      <div className={clsx('grid gap-6', gridColClasses[imagesPerRow] || gridColClasses[3])}>
        {items.map((item, idx) => renderCardFn(item, idx))}
      </div>
    );
  };

  return (
    <section
      id={anchorId || 'imageListing'}
      className={clsx(
        'relative w-full overflow-hidden transition-colors duration-700 font-sans',
        scale.py
      )}
      style={{
        backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
      }}
      dir="rtl"
    >
      {/* ---------------------------------------------------- */}
      {/* BACKGROUND MODES: Dynamic Gradient / Image Sync / Rotating Images */}
      {/* ---------------------------------------------------- */}
      {backgroundMode === 'dynamic-gradient' && (
        <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-40 animate-pulse transition-opacity duration-1000 bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-amber-900/30 filter blur-3xl" />
      )}

      {activeBgImage && (backgroundMode === 'image-sync' || backgroundMode === 'rotating-images') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-1000">
          <img
            src={activeBgImage}
            alt="ambient background"
            className="w-full h-full object-cover scale-110 filter blur-3xl opacity-20 dark:opacity-25 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-slate-950/70" />
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TEXT / SECTION BACKGROUND OVERLAY (Header or Section scope) */}
      {/* ---------------------------------------------------- */}
      {textBgEnabled && textBgImageUrl && textBgScope === 'section' && (
        <div className="group/bg absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={textBgImageUrl}
            alt="text background"
            className={clsx('w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: textBgOverlayColor,
              opacity: textBgOverlayOpacity,
            }}
          />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Text-Background Scope Option */}
        {textBgEnabled && textBgImageUrl && textBgScope === 'header' ? (
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 mb-10 border border-white/10 shadow-2xl group/hdr">
            <img
              src={textBgImageUrl}
              alt="header background"
              className={clsx(
                'absolute inset-0 w-full h-full object-cover',
                getTextBgEffectClass(textBgEffect)
              )}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: textBgOverlayColor,
                opacity: textBgOverlayOpacity,
              }}
            />
            <div className="relative z-10">{renderLayoutContent()}</div>
          </div>
        ) : (
          renderLayoutContent()
        )}

        {/* Optional Call-To-Action Button below the gallery */}
        {showCtaButton && (
          <div className="flex justify-center mt-12">
            <a
              href={ctaUrl}
              className={clsx(
                'inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer',
                getButtonShapeClass(),
                layout === 'masculine'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-300'
                  : layout === 'feminine'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                    : layout === 'sharp'
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black font-mono uppercase tracking-wider'
                      : layout === 'spiritual'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              )}
            >
              <span>{ctaText}</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* FULLSCREEN LIGHTBOX MODAL */}
      {/* ---------------------------------------------------- */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 select-none"
          onClick={() => setLightboxItem(null)}
          dir="rtl"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxItem(null)}
            className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="סגור (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevLightbox}
                className="absolute right-4 sm:right-8 z-50 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                title="הקודם"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNextLightbox}
                className="absolute left-4 sm:left-8 z-50 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                title="הבא"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Active Image & Captions */}
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.title || 'Lightbox'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            {(lightboxItem.title || lightboxItem.subtitle || lightboxItem.tag) && (
              <div className="mt-4 text-center max-w-xl text-white space-y-1">
                {lightboxItem.tag && (
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
                    {lightboxItem.tag}
                  </span>
                )}
                {lightboxItem.title && (
                  <h4 className="text-lg sm:text-xl font-bold">{lightboxItem.title}</h4>
                )}
                {lightboxItem.subtitle && (
                  <p className="text-xs sm:text-sm text-zinc-300 font-light">
                    {lightboxItem.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
