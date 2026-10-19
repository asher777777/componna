import React from 'react';
import {
  DynamicCategoriesSectionConfig,
  DynamicCategoryCardItem,
  DynamicCategoriesLayoutPreset,
} from '../../types/sectionConfigs';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import {
  Mic,
  Heart,
  Briefcase,
  MessageSquare,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  Compass,
  Zap,
  Shield,
  Flower2,
  Cpu,
  ArrowLeft,
  Activity,
  LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';

// Icon mapping lookup
const ICON_LOOKUP: Record<string, LucideIcon> = {
  Mic,
  Heart,
  Briefcase,
  MessageSquare,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  Compass,
  Zap,
  Shield,
  Flower2,
  Cpu,
  Activity,
};

export const DynamicCategoriesSection: React.FC<{ config: DynamicCategoriesSectionConfig }> = ({
  config,
}) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const fallbackCompanyName = brandDna?.identity?.companyName || '';
  const fallbackSlogan = brandDna?.identity?.slogan || '';

  const {
    anchorId = 'dynamicCategories',
    title = fallbackCompanyName ? `התכנים והשירותים של ${fallbackCompanyName}` : 'המתחמים והקטגוריות שלנו',
    subtitle = fallbackSlogan || 'גלו את מגוון השירותים, הפודקאסטים, ההכשרות והאירועים',
    badge,
    descriptionHtml,
    layout = 'standard',
    categories = [],
    iconMotionEffect = 'bounce-gentle',
    titleFontSize = '3xl',
    titleFontWeight = 'bold',
    titleColor,
    titleItalic = false,
    titleUnderline = false,
    titleAlignment = 'center',
    cardTitleFontSize = 'xl',
    cardTitleFontWeight = 'bold',
    cardTitleColor,
    cardSubtitleFontSize = 'sm',
    cardSubtitleColor,
    backgroundColor = 'transparent',
    cardBackgroundColor,
    accentColor,
    borderColor,
    bgMediaUrl,
    bgMediaType = 'image',
    bgMediaOverlayColor = '#000000',
    bgMediaOverlayOpacity = 40,
  } = config;

  const activeAccentColor = accentColor || brandDna?.designTokens?.primaryColor || '#0ea5e9';

  // 6 Visual Styles Presets
  const getLayoutClasses = (preset: DynamicCategoriesLayoutPreset) => {
    switch (preset) {
      case 'feminine':
        return {
          cardShape: 'rounded-t-[70px] rounded-b-2xl border-pink-200/50 dark:border-pink-900/30 shadow-pink-500/10 hover:shadow-pink-500/25',
          cardBg: cardBackgroundColor || 'bg-gradient-to-b from-white via-pink-50/20 to-white dark:from-slate-900 dark:via-pink-950/10 dark:to-slate-900',
          iconWrapper: 'bg-pink-100/60 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800/40',
          hoverBorder: 'hover:border-pink-400',
        };
      case 'masculine':
        return {
          cardShape: 'rounded-t-[60px] rounded-b-none border-2 border-slate-700 dark:border-slate-800 shadow-xl',
          cardBg: cardBackgroundColor || 'bg-slate-900 dark:bg-black',
          iconWrapper: 'bg-slate-800 text-cyan-400 border border-cyan-500/30',
          hoverBorder: 'hover:border-cyan-400',
        };
      case 'spiritual':
        return {
          cardShape: 'rounded-t-[80px] rounded-b-3xl border-purple-300/40 dark:border-purple-800/40 shadow-purple-500/10 backdrop-blur-md',
          cardBg: cardBackgroundColor || 'bg-purple-50/30 dark:bg-slate-900/70',
          iconWrapper: 'bg-purple-100/70 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50',
          hoverBorder: 'hover:border-purple-400',
        };
      case 'sharp':
        return {
          cardShape: 'rounded-t-[40px] rounded-b-none border border-cyan-500/40 shadow-none',
          cardBg: cardBackgroundColor || 'bg-zinc-900 dark:bg-black',
          iconWrapper: 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/50',
          hoverBorder: 'hover:border-cyan-300',
        };
      case 'analytical':
        return {
          cardShape: 'rounded-t-[50px] rounded-b-md border border-emerald-500/30 dark:border-emerald-600/30 shadow-emerald-500/5 font-mono-subtle',
          cardBg: cardBackgroundColor || 'bg-slate-900/90 dark:bg-[#091528]',
          iconWrapper: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40',
          hoverBorder: 'hover:border-emerald-400',
        };
      case 'standard':
      default:
        // Arch shape exactly like screenshot: dome/arch top with subtle bottom rounding
        return {
          cardShape: 'rounded-t-[90px] rounded-b-xl border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300',
          cardBg: cardBackgroundColor || 'bg-white dark:bg-slate-900',
          iconWrapper: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
          hoverBorder: 'hover:border-emerald-500/50',
        };
    }
  };

  const styleTheme = getLayoutClasses(layout);

  // Icon motion CSS class
  const getMotionClass = (motion: string) => {
    switch (motion) {
      case 'bounce-gentle':
        return 'animate-bounce';
      case 'pulse-slow':
        return 'animate-pulse';
      case 'float-subtle':
        return 'motion-safe:animate-[pulse_3s_ease-in-out_infinite] hover:-translate-y-1.5 transition-transform duration-300';
      case 'wiggle':
        return 'hover:rotate-6 transition-transform duration-300';
      case 'scale-hover':
        return 'group-hover:scale-125 transition-transform duration-300';
      default:
        return 'group-hover:scale-110 transition-transform duration-300';
    }
  };

  const motionClass = getMotionClass(iconMotionEffect);

  // Typography font size mapping
  const titleSizeMap: Record<string, string> = {
    sm: 'text-lg',
    base: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
    '3xl': 'text-4xl md:text-5xl',
    '4xl': 'text-5xl md:text-6xl',
  };

  const titleWeightMap: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  const titleAlignMap: Record<string, string> = {
    right: 'text-right',
    center: 'text-center',
    left: 'text-left',
  };

  const cardTitleSizeMap: Record<string, string> = {
    sm: 'text-base',
    base: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
  };

  return (
    <section
      id={anchorId}
      dir="rtl"
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans transition-colors duration-300"
      style={{ backgroundColor }}
    >
      {/* Background Cloud Media Support */}
      {bgMediaUrl && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          {bgMediaType === 'video' ? (
            <video
              src={bgMediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={bgMediaUrl}
              alt="Section background"
              className="w-full h-full object-cover"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: bgMediaOverlayColor,
              opacity: (bgMediaOverlayOpacity || 40) / 100,
            }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className={clsx('space-y-3 max-w-3xl mx-auto', titleAlignMap[titleAlignment] || 'text-center')}>
          {badge && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm"
              style={{
                borderColor: `${activeAccentColor}40`,
                backgroundColor: `${activeAccentColor}15`,
                color: activeAccentColor,
              }}
            >
              {badge}
            </span>
          )}

          {title && (
            <h2
              className={clsx(
                'tracking-tight leading-tight',
                titleSizeMap[titleFontSize] || 'text-4xl md:text-5xl',
                titleWeightMap[titleFontWeight] || 'font-bold',
                titleItalic && 'italic',
                titleUnderline && 'underline',
                !titleColor && 'text-slate-900 dark:text-white'
              )}
              style={titleColor ? { color: titleColor } : undefined}
            >
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {subtitle}
            </p>
          )}

          {/* WYSIWYG Description rendering if present */}
          {descriptionHtml && (
            <div
              className="text-sm md:text-base text-slate-600 dark:text-slate-300 prose dark:prose-invert max-w-none pt-2"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}
        </div>

        {/* Dynamic Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {categories.map((cat, idx) => {
            const IconComponent = cat.iconName && ICON_LOOKUP[cat.iconName] ? ICON_LOOKUP[cat.iconName] : BookOpen;

            return (
              <a
                key={cat.id || idx}
                href={cat.linkUrl || '#'}
                className={clsx(
                  'group relative flex flex-col items-center text-center p-8 transition-all duration-300 cursor-pointer',
                  styleTheme.cardShape,
                  styleTheme.cardBg,
                  styleTheme.hoverBorder
                )}
                style={borderColor ? { borderColor } : undefined}
              >
                {/* Moving Animated Icon */}
                <div
                  className={clsx(
                    'w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm transition-transform duration-300',
                    styleTheme.iconWrapper,
                    motionClass
                  )}
                  style={{
                    boxShadow: `0 4px 14px ${activeAccentColor}20`,
                  }}
                >
                  {cat.iconUrl ? (
                    <img
                      src={cat.iconUrl}
                      alt={cat.title}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <IconComponent className="w-8 h-8 stroke-[1.75]" />
                  )}
                </div>

                {/* Card Title */}
                <h3
                  className={clsx(
                    'leading-tight mb-2 tracking-tight group-hover:text-primary transition-colors',
                    cardTitleSizeMap[cardTitleFontSize] || 'text-xl',
                    cardTitleFontWeight === 'bold' ? 'font-bold' : 'font-semibold',
                    !cardTitleColor && 'text-slate-900 dark:text-white'
                  )}
                  style={cardTitleColor ? { color: cardTitleColor } : undefined}
                >
                  {cat.title}
                </h3>

                {/* Card Subtitle */}
                {cat.subtitle && (
                  <p
                    className={clsx(
                      'leading-relaxed font-normal',
                      cardSubtitleFontSize === 'xs' ? 'text-xs' : 'text-sm',
                      !cardSubtitleColor && 'text-slate-600 dark:text-slate-400'
                    )}
                    style={cardSubtitleColor ? { color: cardSubtitleColor } : undefined}
                  >
                    {cat.subtitle}
                  </p>
                )}

                {/* Subtle Hover Action Arrow */}
                <div
                  className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold flex items-center gap-1"
                  style={{ color: activeAccentColor }}
                >
                  <span>גלה עוד</span>
                  <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
