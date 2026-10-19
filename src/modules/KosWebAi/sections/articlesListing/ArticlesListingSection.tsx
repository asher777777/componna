import React, { useState, useEffect, useMemo } from 'react';
import {
  ArticlesListingSectionConfig,
  ArticleCardItem,
  ArticlesListingLayoutPreset,
} from '../../types/sectionConfigs';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { ArrowLeft, BookOpen, Sparkles, ExternalLink, Search, X, Calendar, User } from 'lucide-react';
import { clsx } from 'clsx';

export const ArticlesListingSection: React.FC<{ config: ArticlesListingSectionConfig }> = ({
  config,
}) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const fallbackCompanyName = brandDna?.identity?.companyName || '';
  const fallbackSlogan = brandDna?.identity?.slogan || '';
  const uiVocab = brandDna?.uiVocabulary;

  const {
    anchorId = 'articlesListing',
    title = fallbackCompanyName ? `מרכז הידע והתוכן של ${fallbackCompanyName}` : 'מרכז הידע והתוכן',
    subtitle = fallbackSlogan || 'מאמרים, שיעורים ומדריכים מעמיקים',
    badge = fallbackCompanyName ? `• ${fallbackCompanyName} •` : undefined,
    descriptionHtml,
    layout = 'standard',
    topCtaText = uiVocab?.primaryCta || 'למרכז התוכן',
    topCtaUrl = '#content',
    showTopCta = true,
    source = 'all',
    items = [],
    showSearchBar = true,
    searchPlaceholder = 'חיפוש במאגר הידע והמאמרים...',
    showCategoryFilter = true,
    selectedTagFilter = 'all',
    sortBy = 'date-desc',
    cardCtaText = 'למאמר המלא',
    cardCtaBgColor = '#ea580c', // Coral orange matching screenshot
    titleFontSize = '3xl',
    titleFontWeight = 'bold',
    titleColor,
    titleItalic = false,
    titleUnderline = false,
    titleAlignment = 'right',
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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>(selectedTagFilter || 'all');
  const [dynamicArticles, setDynamicArticles] = useState<ArticleCardItem[]>(items && items.length > 0 ? items : []);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch Dynamic Articles from Tenant Pages and Brand DNA
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicContent() {
      // If user strictly specified manual items and provided them
      if (source === 'manual' && items && items.length > 0) {
        if (isMounted) setDynamicArticles(items);
        return;
      }

      setIsLoading(true);
      try {
        const effTenant = typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
        const compiledArticles: ArticleCardItem[] = [];

        // 1. Fetch Tenant's published pages
        if (source === 'all' || source === 'tenant_pages') {
          const pages = await pageBuilderFirestore.getAllPages(undefined, effTenant);
          pages.forEach((p) => {
            if (!p || !p.pageTitle || p.isHomePage || p.slug === 'home' || p.isArchivePage) return;
            const heroSec = Object.values(p.sections || {}).find((s: any) => s && s.type === 'hero') as any;
            const defaultImg =
              heroSec?.imageSrc ||
              heroSec?.imageUrl ||
              p.globalSettings?.siteLogoUrl ||
              'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80';

            const slug = p.publishedUrl || p.shortUrl || (p.slug ? (p.slug.startsWith('/') ? p.slug : `/${p.slug}`) : `/p/${p.pageId}`);

            const catTag = p.pageCategory === 'info_content'
              ? 'מאמר'
              : p.pageCategory === 'course'
              ? 'קורס'
              : p.pageCategory === 'event'
              ? 'אירוע'
              : p.pageCategory === 'community'
              ? 'קהילה'
              : 'תוכן';

            compiledArticles.push({
              id: p.pageId,
              title: p.pageTitle,
              subtitle: heroSec?.subtitle || p.globalSettings?.slogan || fallbackCompanyName || 'מערכת התוכן',
              tag: catTag,
              imageUrl: defaultImg,
              linkUrl: slug,
              ctaText: cardCtaText || 'למאמר המלא',
            });
          });
        }

        // 2. Fetch Brand Ecosystem Services & Products
        if (source === 'all' || source === 'brand_services') {
          const services = brandDna.ecosystem?.services || [];
          services.forEach((srv: any, idx: number) => {
            if (!srv) return;
            const sTitle = typeof srv === 'string' ? srv : srv.name || srv.title || `שירות ${idx + 1}`;
            const sDesc = typeof srv === 'string' ? '' : srv.description || srv.shortDescription || '';
            const sSlug = typeof srv === 'string' ? '' : (srv.linkedPageSlug ? (srv.linkedPageSlug.startsWith('/') ? srv.linkedPageSlug : `/${srv.linkedPageSlug}`) : `/kosass/srv-${srv.id || idx + 1}`);
            const sImg = typeof srv === 'string' ? '' : (srv.imageUrl || (srv.galleryImages && srv.galleryImages[0]));

            compiledArticles.push({
              id: `srv_${idx}`,
              title: sTitle,
              subtitle: fallbackCompanyName || sDesc.slice(0, 40) || 'שירות תוכן מומחה',
              tag: 'שירות ותוכן',
              imageUrl: sImg || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
              linkUrl: sSlug || '#',
              ctaText: cardCtaText || 'למאמר המלא',
            });
          });
        }

        // 3. Fallback to configured items if compiled list is empty
        if (compiledArticles.length === 0 && items && items.length > 0) {
          if (isMounted) setDynamicArticles(items);
        } else if (compiledArticles.length > 0) {
          if (isMounted) setDynamicArticles(compiledArticles);
        }
      } catch (err) {
        console.warn('Failed to load dynamic articles, using fallback items:', err);
        if (isMounted && items && items.length > 0) setDynamicArticles(items);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDynamicContent();
  }, [source, items, fallbackCompanyName, cardCtaText]);

  const activeAccent = accentColor || brandDna?.designTokens?.primaryColor || '#0ea5e9';

  // 6 Visual Style Presets
  const getLayoutTheme = (preset: ArticlesListingLayoutPreset) => {
    switch (preset) {
      case 'feminine':
        return {
          cardShape: 'rounded-3xl border-pink-200/60 dark:border-pink-900/40 shadow-sm hover:shadow-pink-500/10',
          imageRadius: 'rounded-t-3xl',
          cardBg: cardBackgroundColor || 'bg-pink-50/40 dark:bg-slate-900',
          tagDefaultBg: 'bg-pink-500/80 text-white',
          buttonClass: 'rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/20',
        };
      case 'masculine':
        return {
          cardShape: 'rounded-xl border-2 border-slate-700 dark:border-slate-800 shadow-md',
          imageRadius: 'rounded-t-lg',
          cardBg: cardBackgroundColor || 'bg-slate-900 dark:bg-black',
          tagDefaultBg: 'bg-slate-800 text-cyan-400 border border-cyan-500/30',
          buttonClass: 'rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-bold',
        };
      case 'spiritual':
        return {
          cardShape: 'rounded-3xl border-purple-200/50 dark:border-purple-800/40 shadow-sm backdrop-blur-sm',
          imageRadius: 'rounded-t-3xl',
          cardBg: cardBackgroundColor || 'bg-purple-50/30 dark:bg-slate-900/60',
          tagDefaultBg: 'bg-purple-600/80 text-white',
          buttonClass: 'rounded-2xl bg-purple-600 hover:bg-purple-500 text-white',
        };
      case 'sharp':
        return {
          cardShape: 'rounded-none border border-cyan-500/40 shadow-none',
          imageRadius: 'rounded-none',
          cardBg: cardBackgroundColor || 'bg-zinc-900 dark:bg-black',
          tagDefaultBg: 'bg-cyan-950 text-cyan-300 border border-cyan-500/40',
          buttonClass: 'rounded-none bg-cyan-500 text-black font-extrabold hover:bg-cyan-400',
        };
      case 'analytical':
        return {
          cardShape: 'rounded-md border border-emerald-500/30 dark:border-emerald-600/30 font-mono-subtle',
          imageRadius: 'rounded-t-sm',
          cardBg: cardBackgroundColor || 'bg-slate-900/80 dark:bg-[#091528]',
          tagDefaultBg: 'bg-emerald-950 text-emerald-300 border border-emerald-500/30',
          buttonClass: 'rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white',
        };
      case 'standard':
      default:
        // Mint/light cyan container with rounded-3xl and coral buttons (1:1 with screenshot)
        return {
          cardShape: 'rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300',
          imageRadius: 'rounded-t-3xl',
          cardBg: cardBackgroundColor || 'bg-[#eaf4f4] dark:bg-slate-900/80',
          tagDefaultBg: 'bg-black/60 backdrop-blur-sm text-white',
          buttonClass: 'rounded-xl text-white font-bold shadow-md hover:brightness-110 transition-all',
        };
    }
  };

  const theme = getLayoutTheme(layout);

  // Typography Size Maps
  const titleSizeMap: Record<string, string> = {
    sm: 'text-lg',
    base: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
    '3xl': 'text-4xl md:text-5xl',
    '4xl': 'text-5xl md:text-6xl',
  };

  const cardTitleSizeMap: Record<string, string> = {
    sm: 'text-base',
    base: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
  };

  // Extract unique tags for filtering
  const allTags = useMemo(() => {
    const set = new Set<string>();
    dynamicArticles.forEach((art) => {
      if (art.tag) set.add(art.tag);
    });
    return ['all', ...Array.from(set)];
  }, [dynamicArticles]);

  // Filtered and Sorted Articles
  const filteredArticles = useMemo(() => {
    let result = dynamicArticles.filter((art) => {
      const matchesTag = activeTag === 'all' || art.tag === activeTag;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        (art.subtitle && art.subtitle.toLowerCase().includes(q)) ||
        (art.tag && art.tag.toLowerCase().includes(q));

      return matchesTag && matchesSearch;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title, 'he');
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title, 'he');
      return 0;
    });

    return result;
  }, [dynamicArticles, activeTag, searchQuery, sortBy]);

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

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header: Title on Right, CTA Button on Left (as in screenshot) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
          {/* Header Action Button on Left */}
          {showTopCta && (
            <div className="order-2 md:order-1">
              <a
                href={topCtaUrl || '#'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-400 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-all shadow-sm hover:shadow"
                title={topCtaText}
              >
                <span>{topCtaText}</span>
              </a>
            </div>
          )}

          {/* Main Title on Right */}
          <div className="order-1 md:order-2 text-right space-y-1">
            {badge && (
              <span
                className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold border mb-1"
                style={{
                  borderColor: `${activeAccent}40`,
                  backgroundColor: `${activeAccent}15`,
                  color: activeAccent,
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
                  titleFontWeight === 'extrabold'
                    ? 'font-extrabold'
                    : titleFontWeight === 'semibold'
                    ? 'font-semibold'
                    : 'font-bold',
                  titleItalic && 'italic',
                  titleUnderline && 'underline',
                  !titleColor && 'text-[#0e3b5e] dark:text-white' // Deep blue heading matching screenshot
                )}
                style={titleColor ? { color: titleColor } : undefined}
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Search & Tag Filtering Bar */}
        {(showSearchBar || (showCategoryFilter && allTags.length > 2)) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Tag Pills */}
            {showCategoryFilter && allTags.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={clsx(
                      'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer',
                      activeTag === tag
                        ? 'bg-[#0e3b5e] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    )}
                  >
                    {tag === 'all' ? 'הכל' : tag}
                  </button>
                ))}
              </div>
            )}

            {/* Instant Search Bar */}
            {showSearchBar && (
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pr-9 pl-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#0e3b5e] transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* WYSIWYG Description if provided */}
        {descriptionHtml && (
          <div
            className="text-sm md:text-base text-slate-600 dark:text-slate-300 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}

        {/* Empty State */}
        {filteredArticles.length === 0 && !isLoading && (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">לא נמצאו מאמרים תואמים לחיפוש</p>
          </div>
        )}

        {/* 4 Cards Grid - 1:1 with Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArticles.map((item, idx) => (
            <div
              key={item.id || idx}
              className={clsx(
                'group flex flex-col overflow-hidden transition-all duration-300 relative',
                theme.cardShape,
                theme.cardBg
              )}
              style={borderColor ? { borderColor } : undefined}
            >
              {/* Card Image with Tag Badge */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={clsx(
                      'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
                      theme.imageRadius
                    )}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <BookOpen className="w-10 h-10 stroke-[1.5]" />
                  </div>
                )}

                {/* Tag Badge over Image (e.g. "כללי" or "הורות ומשפחה") */}
                {item.tag && (
                  <div className="absolute bottom-2.5 right-2.5">
                    <span
                      className={clsx(
                        'px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm',
                        item.tagColor ? '' : theme.tagDefaultBg
                      )}
                      style={
                        item.tagColor
                          ? { backgroundColor: item.tagColor, color: '#ffffff' }
                          : item.tag === 'הורות ומשפחה'
                          ? { backgroundColor: '#48bb78', color: '#ffffff' } // Green badge from screenshot
                          : undefined
                      }
                    >
                      {item.tag}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body & Content */}
              <div className="p-6 flex-1 flex flex-col items-center text-center justify-between space-y-4">
                <div className="space-y-2 w-full">
                  {/* Article Title */}
                  <h3
                    className={clsx(
                      'tracking-tight leading-snug group-hover:text-primary transition-colors',
                      cardTitleSizeMap[cardTitleFontSize] || 'text-xl',
                      cardTitleFontWeight === 'bold' ? 'font-bold' : 'font-semibold',
                      !cardTitleColor && 'text-[#0e3b5e] dark:text-white'
                    )}
                    style={cardTitleColor ? { color: cardTitleColor } : undefined}
                  >
                    {item.title}
                  </h3>

                  {/* Subtitle / Author (e.g. "הרב אוהד תירוש") */}
                  {item.subtitle && (
                    <p
                      className={clsx(
                        'text-xs md:text-sm font-medium',
                        !cardSubtitleColor && 'text-slate-600 dark:text-slate-400'
                      )}
                      style={cardSubtitleColor ? { color: cardSubtitleColor } : undefined}
                    >
                      {item.subtitle}
                    </p>
                  )}
                </div>

                {/* CTA Button: "למאמר המלא <-" */}
                <a
                  href={item.linkUrl || '#'}
                  className={clsx(
                    'w-full max-w-[180px] py-2 px-4 flex items-center justify-center gap-2 text-xs md:text-sm transition-all cursor-pointer',
                    theme.buttonClass
                  )}
                  style={{
                    backgroundColor: cardCtaBgColor || '#ea580c',
                  }}
                  title={item.ctaText || cardCtaText}
                >
                  <span>{item.ctaText || cardCtaText}</span>
                  <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
