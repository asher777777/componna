import React, { useState, useEffect } from 'react';
import {
  EventsListingSectionConfig,
  EventListingItem,
  EventImageMaskShape,
  EventListingStylePreset,
} from '../../types/sectionConfigs';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Search,
  Sparkles,
  Users,
  Compass,
  Laptop,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { clsx } from 'clsx';

export const EventsListingSection: React.FC<{ config: EventsListingSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const fallbackCompanyName = brandDna?.identity?.companyName || '';
  const fallbackSlogan = brandDna?.identity?.slogan || '';

  const {
    anchorId = 'events-listing',
    title = fallbackCompanyName ? `אירועים והכשרות מבית ${fallbackCompanyName}` : 'אירועים, קורסים והכשרות',
    subtitle = fallbackSlogan || 'גלו את מגוון המפגשים, הסדנאות והאירועים הקרובים והבטיחו את מקומכם',
    badge = '• לוח אירועים והכשרות •',
    descriptionHtml,
    source = 'auto-pages',
    filterCategory = 'event',
    cardLayout = 'classic-card', // 'classic-card' | 'split-arch'
    imageMaskShape = 'arch', // 'arch' | 'oval' | 'flower' | 'heart' | 'rounded' | 'sharp' | 'hud'
    gridColumns = 3,
    stylePreset = 'standard',
    cardEffect = 'lift-shadow',
    items = [],
    defaultCtaText = brandDna?.uiVocabulary?.primaryCta || 'לפרטים והצטרפות',
    showSearchBar = false,
    searchPlaceholder = 'חיפוש אירוע, סדנה או נושא...',
    titleFontSize = '3xl',
    titleFontWeight = 'extrabold',
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

  const activeAccent = accentColor || brandDna?.designTokens?.primaryColor || '#0284c7';
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvedItems, setResolvedItems] = useState<EventListingItem[]>(items && items.length > 0 ? items : []);
  const [loading, setLoading] = useState(false);

  // Dynamic automatic loading of pages tagged with event / course / workshop if source === 'auto-pages'
  useEffect(() => {
    if (source === 'manual') {
      if (items && items.length > 0) setResolvedItems(items);
      return;
    }

    let isMounted = true;
    const fetchEventPages = async () => {
      setLoading(true);
      try {
        const tenantId = resolveCurrentTenantId() || ROOT_TENANT_ID;
        const allPages = await pageBuilderFirestore.getAllPages(null, tenantId);
        
        // Find pages that are published and belong to event/course categories or have eventRsvp section
        const eventPages = (allPages || []).filter((p) => {
          if (!p.published && !p.isHomePage) return false;
          const cat = p.pageCategory || '';
          const hasEventSection = p.sections && Object.values(p.sections).some((s: any) => s?.type === 'eventRsvp' || s?.type === 'eventsListing');
          return cat === 'event' || cat === 'course' || cat === 'community' || hasEventSection;
        });

        if (eventPages.length > 0 && isMounted) {
          const mapped: EventListingItem[] = eventPages.map((p, idx) => {
            const sections = p.sections ? Object.values(p.sections) : [];
            const eventRsvpSec: any = sections.find((s: any) => s?.type === 'eventRsvp');
            const heroSec: any = sections.find((s: any) => s?.type === 'hero');

            // Location format resolution
            const locFormat = eventRsvpSec?.locationAddress
              ? `${eventRsvpSec?.locationName || ''} • ${eventRsvpSec?.locationAddress}`
              : eventRsvpSec?.locationName || 'מפגש היברידי / מקוון';

            // Day and time resolution
            const dayTime = eventRsvpSec?.eventTime
              ? `${eventRsvpSec?.eventDate || ''} | ${eventRsvpSec?.eventTime}${eventRsvpSec?.eventEndTime ? ` - ${eventRsvpSec?.eventEndTime}` : ''}`
              : 'מועד מפורט בעמוד האירוע';

            const photo =
              heroSec?.imageSrc ||
              heroSec?.imageUrl ||
              p.globalSettings?.siteLogoUrl ||
              '';

            return {
              id: p.pageId || `event-page-${idx}`,
              title: p.pageTitle || eventRsvpSec?.eventTitle || 'אירוע קהילתי',
              subtitle: p.seoSettings?.description || eventRsvpSec?.subtitle || heroSec?.subtitle || '',
              excerpt: eventRsvpSec?.description || '',
              imageUrl: photo,
              badge: eventRsvpSec?.badge || (p.pageCategory === 'course' ? 'מחזור חדש' : 'ההרשמה בעיצומה'),
              dayAndTime: dayTime,
              locationFormat: locFormat,
              startDateText: eventRsvpSec?.eventDate || 'קרוב',
              sessionsCount: 'מפגשים מרוכזים',
              linkUrl: p.publishedUrl || p.publicUrl || `/${p.slug}`,
              ctaText: defaultCtaText,
              actionType: 'link',
            };
          });

          // Zero Mock Data Policy: If pages found, set them. If manual items exist and no pages found, use manual items.
          setResolvedItems(mapped);
        } else if (items && items.length > 0 && isMounted) {
          setResolvedItems(items);
        }
      } catch (err) {
        console.warn('EventsListingSection: could not fetch dynamic pages', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEventPages();
    return () => {
      isMounted = false;
    };
  }, [source, defaultCtaText]);

  // If items prop directly passed in manual mode or updated by editor
  useEffect(() => {
    if (items && items.length > 0) {
      setResolvedItems(items);
    }
  }, [items]);

  // 6 Visual Styles Presets
  const getPresetStyles = (preset: EventListingStylePreset) => {
    switch (preset) {
      case 'feminine':
        return {
          cardContainer: 'rounded-3xl border border-pink-200/60 dark:border-pink-900/40 shadow-xl shadow-pink-500/5',
          cardInnerBg: cardBackgroundColor || 'bg-gradient-to-b from-white via-pink-50/15 to-white dark:from-slate-900 dark:via-pink-950/10 dark:to-slate-900',
          accentBadge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800',
          btnBg: 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/20',
          metaIconColor: 'text-pink-500 dark:text-pink-400',
          dividerColor: 'border-pink-100 dark:border-pink-900/40',
        };
      case 'masculine':
        return {
          cardContainer: 'rounded-none border-2 border-slate-700 dark:border-slate-800 shadow-2xl',
          cardInnerBg: cardBackgroundColor || 'bg-slate-900 dark:bg-black',
          accentBadge: 'bg-slate-800 text-cyan-400 border border-cyan-500/30',
          btnBg: 'bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-wider uppercase',
          metaIconColor: 'text-cyan-400',
          dividerColor: 'border-slate-800',
        };
      case 'spiritual':
        return {
          cardContainer: 'rounded-[32px] border border-purple-200/50 dark:border-purple-800/40 shadow-xl shadow-purple-500/5 backdrop-blur-sm',
          cardInnerBg: cardBackgroundColor || 'bg-purple-50/30 dark:bg-slate-900/80',
          accentBadge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
          btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25',
          metaIconColor: 'text-purple-500 dark:text-purple-400',
          dividerColor: 'border-purple-100/70 dark:border-purple-900/30',
        };
      case 'sharp':
        return {
          cardContainer: 'rounded-none border border-cyan-500/40 shadow-none',
          cardInnerBg: cardBackgroundColor || 'bg-zinc-900 dark:bg-black',
          accentBadge: 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/50 font-mono text-[10px]',
          btnBg: 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-tight rounded-none',
          metaIconColor: 'text-cyan-400',
          dividerColor: 'border-cyan-500/20',
        };
      case 'analytical':
        return {
          cardContainer: 'rounded-lg border border-emerald-500/30 dark:border-emerald-600/30 shadow-lg shadow-emerald-500/5',
          cardInnerBg: cardBackgroundColor || 'bg-slate-900/90 dark:bg-[#07131f]',
          accentBadge: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 font-mono text-[10px]',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white font-mono',
          metaIconColor: 'text-emerald-400',
          dividerColor: 'border-emerald-500/20',
        };
      case 'standard':
      default:
        return {
          cardContainer: 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl',
          cardInnerBg: cardBackgroundColor || 'bg-white dark:bg-slate-900',
          accentBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-200/80',
          btnBg: 'bg-amber-700 hover:bg-amber-800 text-white shadow-md',
          metaIconColor: 'text-amber-600 dark:text-amber-400',
          dividerColor: 'border-slate-100 dark:border-slate-800',
        };
    }
  };

  const presetStyle = getPresetStyles(stylePreset);

  // Mask Shape Classes for Image
  const getImageMaskClasses = (mask: EventImageMaskShape) => {
    switch (mask) {
      case 'arch':
        // Arch shape: rounded top arch
        return 'rounded-t-[80px] rounded-b-2xl object-cover';
      case 'oval':
        // Full smooth oval mask
        return 'rounded-[50%] object-cover aspect-square';
      case 'flower':
        return 'rounded-[40px_10px_40px_10px] object-cover';
      case 'heart':
        return 'rounded-[50%_50%_40%_40%] object-cover';
      case 'sharp':
        return 'rounded-none object-cover';
      case 'hud':
        return 'rounded-md border border-cyan-500/40 object-cover';
      case 'rounded':
      default:
        return 'rounded-2xl object-cover';
    }
  };

  // Card Interactive Effect
  const getCardEffectClasses = () => {
    switch (cardEffect) {
      case 'glow-hover':
        return 'transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-400/60';
      case 'border-beam':
        return 'transition-all duration-300 hover:border-sky-500 hover:ring-2 hover:ring-sky-500/20';
      case 'tilt-3d':
        return 'transition-transform duration-300 hover:-translate-y-2 hover:rotate-1';
      case 'lift-shadow':
      default:
        return 'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl';
    }
  };

  const filteredItems = resolvedItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.locationFormat?.toLowerCase().includes(q) ||
      item.dayAndTime?.toLowerCase().includes(q)
    );
  });

  return (
    <section
      id={anchorId}
      dir="rtl"
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
    >
      {/* Background Cloud Media Overlay if configured */}
      {bgMediaUrl && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
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
            <img src={bgMediaUrl} alt="" className="w-full h-full object-cover" />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: bgMediaOverlayColor,
              opacity: (bgMediaOverlayOpacity ?? 40) / 100,
            }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
        {/* Header Block */}
        <div className={clsx('flex flex-col gap-3', {
          'items-center text-center max-w-3xl mx-auto': titleAlignment === 'center',
          'items-start text-right': titleAlignment === 'right',
          'items-end text-left': titleAlignment === 'left',
        })}>
          {badge && (
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full shadow-sm border transition-all',
                presetStyle.accentBadge
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </span>
          )}

          <h2
            className={clsx('leading-tight tracking-tight', {
              'text-2xl': titleFontSize === '2xl',
              'text-3xl sm:text-4xl': titleFontSize === '3xl',
              'text-4xl sm:text-5xl': titleFontSize === '4xl',
              'text-xl': titleFontSize === 'xl',
              'font-normal': titleFontWeight === 'normal',
              'font-medium': titleFontWeight === 'medium',
              'font-semibold': titleFontWeight === 'semibold',
              'font-bold': titleFontWeight === 'bold',
              'font-extrabold': titleFontWeight === 'extrabold',
              italic: titleItalic,
              underline: titleUnderline,
            })}
            style={{ color: titleColor }}
          >
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {descriptionHtml && (
            <div
              className="prose prose-sm dark:prose-invert max-w-2xl mt-1 text-zinc-500"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}

          {/* Optional Search Bar */}
          {showSearchBar && (
            <div className="w-full max-w-md mt-4 relative">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && resolvedItems.length === 0 && (
          <div className="py-12 flex justify-center items-center text-zinc-400 text-sm">
            <span>טוען נתוני אירועים ומפגשים מהמערכת...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredItems.length === 0 && (
          <div className="py-12 text-center text-zinc-400 text-sm">
            <span>לא נמצאו אירועים זמינים כעת.</span>
          </div>
        )}

        {/* =====================================================================
            CARD LAYOUT 1: SPLIT ARCH (כמו בתמונה השנייה שסופקה - טקסט לצד מסכת קשת)
        ===================================================================== */}
        {cardLayout === 'split-arch' && filteredItems.length > 0 && (
          <div
            className={clsx(
              'grid gap-8',
              gridColumns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={clsx(
                  'relative overflow-hidden flex flex-col justify-between transition-all duration-300',
                  presetStyle.cardContainer,
                  presetStyle.cardInnerBg,
                  getCardEffectClasses()
                )}
                style={{ borderColor }}
              >
                {/* Upper Body: Flex Row with Text on Right & Arched Photo Mask on Left (RTL) */}
                <div className="p-6 sm:p-7 flex items-center justify-between gap-5 flex-grow">
                  {/* Right side: Texts & Details */}
                  <div className="flex-1 flex flex-col justify-center text-right">
                    <h3
                      className={clsx('font-extrabold leading-snug mb-2 text-zinc-900 dark:text-white', {
                        'text-lg': cardTitleFontSize === 'lg',
                        'text-xl': cardTitleFontSize === 'xl',
                        'text-2xl': cardTitleFontSize === '2xl',
                        'text-base': cardTitleFontSize === 'base',
                        'font-bold': cardTitleFontWeight === 'bold',
                        'font-semibold': cardTitleFontWeight === 'semibold',
                      })}
                      style={{ color: cardTitleColor }}
                    >
                      {item.title}
                    </h3>

                    {item.instructor && (
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        {item.instructor}
                      </p>
                    )}

                    {item.subtitle && (
                      <p
                        className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-2 line-clamp-3"
                        style={{ color: cardSubtitleColor }}
                      >
                        {item.subtitle}
                      </p>
                    )}

                    {item.excerpt && !item.subtitle && (
                      <p className="text-xs text-zinc-500 leading-relaxed mb-2 line-clamp-3">
                        {item.excerpt}
                      </p>
                    )}

                    {/* Time & Sessions Summary inside card */}
                    <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                      {item.sessionsCount && (
                        <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                          <Users className={clsx('w-3.5 h-3.5 shrink-0', presetStyle.metaIconColor)} />
                          <span>{item.sessionsCount}</span>
                        </div>
                      )}
                      {item.startDateText && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className={clsx('w-3.5 h-3.5 shrink-0', presetStyle.metaIconColor)} />
                          <span>{item.startDateText}</span>
                        </div>
                      )}
                      {item.dayAndTime && (
                        <div className="flex items-center gap-1.5">
                          <Clock className={clsx('w-3.5 h-3.5 shrink-0', presetStyle.metaIconColor)} />
                          <span>{item.dayAndTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Left side: Masked Image Arch */}
                  <div className="w-32 sm:w-40 shrink-0 aspect-[3/4] relative overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={clsx('w-full h-full shadow-md transition-transform duration-500 hover:scale-105', getImageMaskClasses(imageMaskShape))}
                      />
                    ) : (
                      <div className={clsx('w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400', getImageMaskClasses(imageMaskShape))}>
                        <Calendar className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="p-4 pt-0">
                  <a
                    href={item.linkUrl || '#'}
                    className={clsx(
                      'w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all duration-200 shadow-sm cursor-pointer',
                      presetStyle.btnBg
                    )}
                    style={accentColor ? { backgroundColor: accentColor } : undefined}
                  >
                    <span>{item.ctaText || defaultCtaText}</span>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================================
            CARD LAYOUT 2: CLASSIC CARD (כמו בתמונה הראשונה שסופקה - תמונה עליונה עם סרט הרשמה + 3 עמודות נתונים + כפתור)
        ===================================================================== */}
        {cardLayout === 'classic-card' && filteredItems.length > 0 && (
          <div
            className={clsx(
              'grid gap-6 sm:gap-8',
              gridColumns === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : gridColumns === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={clsx(
                  'group relative overflow-hidden flex flex-col justify-between transition-all duration-300',
                  presetStyle.cardContainer,
                  presetStyle.cardInnerBg,
                  getCardEffectClasses()
                )}
                style={{ borderColor }}
              >
                {/* Top Section: Photo with Image Mask + Ribbon Badge */}
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-zinc-100 dark:bg-zinc-800">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className={clsx(
                        'w-full h-full transition-transform duration-500 group-hover:scale-105',
                        getImageMaskClasses(imageMaskShape)
                      )}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <Calendar className="w-12 h-12 stroke-[1.5]" />
                    </div>
                  )}

                  {/* Gradient shadow for text readibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Top Ribbon Badge (e.g. 'ההרשמה למחזור תשפ"ז בעיצומה') */}
                  {item.badge && (
                    <div className="absolute top-3 right-3 left-3 flex justify-start pointer-events-none">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-md border border-white/40 dark:border-zinc-700/50">
                        {item.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle Section: Titles & Excerpt */}
                <div className="p-5 sm:p-6 flex flex-col gap-2 flex-grow text-right">
                  <h3
                    className={clsx('leading-tight text-zinc-900 dark:text-white', {
                      'text-lg': cardTitleFontSize === 'lg',
                      'text-xl sm:text-2xl': cardTitleFontSize === 'xl',
                      'text-2xl sm:text-3xl': cardTitleFontSize === '2xl',
                      'text-base': cardTitleFontSize === 'base',
                      'font-bold': cardTitleFontWeight === 'bold',
                      'font-semibold': cardTitleFontWeight === 'semibold',
                    })}
                    style={{ color: cardTitleColor }}
                  >
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p
                      className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed"
                      style={{ color: cardSubtitleColor }}
                    >
                      {item.subtitle}
                    </p>
                  )}

                  {item.excerpt && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                {/* Event Metadata 3-Columns Grid (מתי | מיקום/כתובת | תאריך התחלה ומפגשים) */}
                <div className={clsx('grid grid-cols-3 border-t text-center py-3.5 px-2 bg-zinc-50/60 dark:bg-zinc-950/40', presetStyle.dividerColor)}>
                  {/* Column 1: Time / Schedule */}
                  <div className="px-1 flex flex-col items-center justify-start gap-1">
                    <Calendar className={clsx('w-4 h-4', presetStyle.metaIconColor)} />
                    <span className="text-[10px] text-zinc-400 font-semibold">מתי</span>
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                      {item.dayAndTime || 'מועד גמיש'}
                    </span>
                  </div>

                  {/* Column 2: Location / Format (היברידי, כתובת, זום) */}
                  <div className={clsx('px-1 flex flex-col items-center justify-start gap-1 border-r border-l', presetStyle.dividerColor)}>
                    <MapPin className={clsx('w-4 h-4', presetStyle.metaIconColor)} />
                    <span className="text-[10px] text-zinc-400 font-semibold">מיקום / פורמט</span>
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight line-clamp-2">
                      {item.locationFormat || 'היברידי'}
                    </span>
                  </div>

                  {/* Column 3: Starting Date & Sessions */}
                  <div className="px-1 flex flex-col items-center justify-start gap-1">
                    <Clock className={clsx('w-4 h-4', presetStyle.metaIconColor)} />
                    <span className="text-[10px] text-zinc-400 font-semibold">מתחילים ב</span>
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                      {item.startDateText || 'בקרוב'}
                    </span>
                    {item.sessionsCount && (
                      <span className="text-[10px] font-medium text-zinc-500">
                        {item.sessionsCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action CTA Button */}
                <div className="p-4 sm:p-5 pt-3">
                  <a
                    href={item.linkUrl || '#'}
                    className={clsx(
                      'w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer',
                      presetStyle.btnBg
                    )}
                    style={accentColor ? { backgroundColor: accentColor } : undefined}
                  >
                    <span>{item.ctaText || defaultCtaText}</span>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
