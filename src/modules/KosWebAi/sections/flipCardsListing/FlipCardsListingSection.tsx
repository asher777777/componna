import React, { useState, useEffect, useMemo } from 'react';
import {
  FlipCardsListingSectionConfig,
  FlipCardItem,
} from '../../types/sectionConfigs';
import {
  PAGE_CATEGORIES,
  ARCHIVE_7_SECTIONS_SPECS,
  getCategoryFromPage,
  PageBuilderConfig,
} from '../../types/pageBuilder.types';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { BrandDna } from '../../../../core/contracts';
import {
  Calendar,
  BookOpen,
  Mic,
  Heart,
  Users,
  GraduationCap,
  Sparkles,
  Briefcase,
  MessageSquare,
  Compass,
  Layers,
  Shield,
  Zap,
  Activity,
  Award,
  Star,
  Globe,
  FileText,
  Video,
  ShoppingBag,
  Search,
  ChevronsLeft,
  LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';

export const FLIP_CARD_ICON_MAP: Record<string, LucideIcon> = {
  Calendar,
  BookOpen,
  Mic,
  Heart,
  Users,
  GraduationCap,
  Sparkles,
  Briefcase,
  MessageSquare,
  Compass,
  Layers,
  Shield,
  Zap,
  Activity,
  Award,
  Star,
  Globe,
  FileText,
  Video,
  ShoppingBag,
};

// Warm, balanced editorial palette inspired by the showcase grid
export const DEFAULT_FLIP_PALETTE = [
  '#9c5a25', // Warm Terracotta / Brown
  '#528a94', // Slate Teal
  '#2e7d6b', // Sage Emerald
  '#7d2828', // Deep Burgundy
  '#b48a3e', // Warm Gold / Ochre
  '#3e5c8a', // Classic Navy Blue
  '#6e467c', // Muted Plum
  '#2f6e7d', // Deep Cyan
  '#8c4a32', // Sienna
];

const CATEGORY_DEFAULT_META: Record<
  string,
  { iconName: string; accentColor: string; hoverTitle: string; archiveSlug: string }
> = {
  info_content: {
    iconName: 'BookOpen',
    accentColor: '#528a94',
    hoverTitle: 'העמיקו במאמרים ובתוכן',
    archiveSlug: '/kosinfo',
  },
  event: {
    iconName: 'Calendar',
    accentColor: '#9c5a25',
    hoverTitle: 'מחכים לכם באירועים הקרובים',
    archiveSlug: '/kosevent',
  },
  course: {
    iconName: 'GraduationCap',
    accentColor: '#2e7d6b',
    hoverTitle: 'בחרו את מסלול הלימוד שלכם',
    archiveSlug: '/koscourse',
  },
  youtube_post: {
    iconName: 'Video',
    accentColor: '#7d2828',
    hoverTitle: 'לצפייה בתכנים ובשידורים',
    archiveSlug: '/kosvidio',
  },
  community: {
    iconName: 'Users',
    accentColor: '#b48a3e',
    hoverTitle: 'בואו למצוא את הקהילה שלכם',
    archiveSlug: '/koscommunity',
  },
  fundraising: {
    iconName: 'Heart',
    accentColor: '#8c4a32',
    hoverTitle: 'הצטרפו לעשייה משותפת',
    archiveSlug: '/kosfunrise',
  },
  service_product: {
    iconName: 'Briefcase',
    accentColor: '#3e5c8a',
    hoverTitle: 'גלו את השירותים והפתרונות',
    archiveSlug: '/kosass',
  },
  checkout: {
    iconName: 'ShoppingBag',
    accentColor: '#6e467c',
    hoverTitle: 'למוצרים ולחבילות שלנו',
    archiveSlug: '/koscheckout',
  },
  general: {
    iconName: 'Compass',
    accentColor: '#2f6e7d',
    hoverTitle: 'למידע נוסף ופרטים מלאים',
    archiveSlug: '/p',
  },
};

export interface FlipCardsListingSectionProps {
  config: FlipCardsListingSectionConfig;
  isEditing?: boolean;
}

export const FlipCardsListingSection: React.FC<FlipCardsListingSectionProps> = ({
  config,
  isEditing = false,
}) => {
  const {
    anchorId = 'flip-cards-listing',
    title = 'מה תמצאו כאן',
    subtitle,
    badge,
    titleColor,
    subtitleColor,
    backgroundColor = 'transparent',
    cardBgColor,
    sourceMode = 'pages-and-categories',
    selectedPageCategories = [],
    includeArchives = true,
    maxItems = 12,
    sortBy = 'manual',
    columns = 3,
    flipDirection = 'horizontal',
    cardHeight = 'standard',
    defaultCtaText = 'לחצו כאן >>',
    showCategoryFilterBar = false,
    showSearchBar = false,
    enableAutoColorPalette = true,
    colorPalette = DEFAULT_FLIP_PALETTE,
    itemLogicCondition = 'none',
    sectionVisibilityRule = 'always',
    minItemsToShow = 1,
    visibleFromDate,
    visibleUntilDate,
    hiddenItemIds = [],
    items = [],
    itemOverrides = {},
  } = config;

  const [tenantPages, setTenantPages] = useState<PageBuilderConfig[]>([]);
  const [brandDna, setBrandDna] = useState<BrandDna | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicTenantData() {
      if (sourceMode === 'custom') {
        return;
      }
      setIsLoading(true);
      try {
        const effTenant =
          typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
        const liveBrand = resolveLiveBrandDna(null, effTenant);
        if (isMounted) setBrandDna(liveBrand);

        const pages = await pageBuilderFirestore.getAllPages(undefined, effTenant);
        if (isMounted && Array.isArray(pages)) {
          setTenantPages(pages);
        }
      } catch (err) {
        console.error('[FlipCardsListingSection] Failed to load dynamic tenant pages:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadDynamicTenantData();
    return () => {
      isMounted = false;
    };
  }, [sourceMode]);

  const palette = colorPalette && colorPalette.length > 0 ? colorPalette : DEFAULT_FLIP_PALETTE;

  // Build unified items list from dynamic sources + custom items + overrides
  const rawBuiltItems = useMemo<FlipCardItem[]>(() => {
    const result: FlipCardItem[] = [];
    const filterSet =
      selectedPageCategories &&
      selectedPageCategories.length > 0 &&
      !selectedPageCategories.includes('all')
        ? new Set(selectedPageCategories)
        : null;

    // 1. Dynamic Tenant Pages
    if (sourceMode === 'all-pages' || sourceMode === 'pages-and-categories') {
      const nonSystemPages = tenantPages.filter(
        (p) => p && p.pageTitle && !p.isHomePage && p.slug !== 'home' && !p.isArchivePage
      );

      nonSystemPages.forEach((p, idx) => {
        const catKey = getCategoryFromPage(p) || 'general';
        if (filterSet && !filterSet.has(catKey)) return;

        const catCfg = PAGE_CATEGORIES[catKey];
        const meta = CATEGORY_DEFAULT_META[catKey] || CATEGORY_DEFAULT_META.general;
        const heroSec = Object.values(p.sections || {}).find(
          (s: any) => s && s.type === 'hero'
        ) as any;

        const slug =
          p.publishedUrl ||
          p.shortUrl ||
          (p.slug ? (p.slug.startsWith('/') ? p.slug : `/${p.slug}`) : `/p/${p.pageId}`);

        const color = enableAutoColorPalette
          ? palette[idx % palette.length]
          : meta.accentColor;

        result.push({
          id: `page_${p.pageId}`,
          pageId: p.pageId,
          title: p.pageTitle,
          subtitle:
            heroSec?.subtitle ||
            p.seoSettings?.description ||
            catCfg?.shortLabel ||
            'עמוד תוכן פעיל',
          hoverTitle: meta.hoverTitle,
          ctaText: defaultCtaText,
          iconName: meta.iconName,
          accentColor: color,
          linkUrl: slug,
          categoryKey: catKey,
          published: p.published !== false,
          viewsCount: p.viewsCount || 0,
          leadsCount: p.leadsCount || 0,
          createdAt: p.createdAt,
        });
      });
    }

    // 2. KosWebAi Categories & Archives
    if (sourceMode === 'categories' || sourceMode === 'pages-and-categories') {
      const categoryEntries = Object.values(PAGE_CATEGORIES).filter(
        (c) => c.key !== 'home'
      );

      categoryEntries.forEach((catCfg, idx) => {
        if (filterSet && !filterSet.has(catCfg.key)) return;
        const meta = CATEGORY_DEFAULT_META[catCfg.key] || CATEGORY_DEFAULT_META.general;
        const archiveSpec = (ARCHIVE_7_SECTIONS_SPECS as any)[catCfg.key];

        // Count how many tenant pages belong to this category
        const matchingPagesCount = tenantPages.filter(
          (p) =>
            p &&
            !p.isHomePage &&
            !p.isArchivePage &&
            (getCategoryFromPage(p) || 'general') === catCfg.key
        ).length;

        const color = enableAutoColorPalette
          ? palette[(result.length + idx) % palette.length]
          : meta.accentColor;

        const targetUrl = includeArchives
          ? archiveSpec
            ? `/${archiveSpec.slugPrefix}`
            : meta.archiveSlug
          : meta.archiveSlug;

        result.push({
          id: `cat_${catCfg.key}`,
          title: catCfg.label,
          subtitle:
            matchingPagesCount > 0
              ? `${catCfg.shortLabel} • ${matchingPagesCount} עמודים פעילים`
              : catCfg.description,
          hoverTitle: meta.hoverTitle,
          ctaText: defaultCtaText,
          iconName: meta.iconName,
          accentColor: color,
          linkUrl: targetUrl,
          categoryKey: catCfg.key,
          published: true,
          viewsCount: matchingPagesCount,
        });
      });
    }

    // 3. Custom / Manual Items (always included in 'custom' mode, or appended if added)
    if (sourceMode === 'custom' || (items && items.length > 0 && sourceMode !== 'categories')) {
      items.forEach((customItem, idx) => {
        if (filterSet && customItem.categoryKey && !filterSet.has(customItem.categoryKey)) {
          return;
        }
        const color =
          customItem.accentColor ||
          (enableAutoColorPalette ? palette[(result.length + idx) % palette.length] : '#528a94');
        result.push({
          ...customItem,
          accentColor: color,
          ctaText: customItem.ctaText || defaultCtaText,
          published: customItem.published !== false,
        });
      });
    }

    // Apply per-item overrides so users can customize dynamic cards freely
    return result.map((item) => {
      const ov = itemOverrides?.[item.id];
      if (!ov) return item;
      return {
        ...item,
        ...ov,
      };
    });
  }, [
    sourceMode,
    tenantPages,
    selectedPageCategories,
    includeArchives,
    items,
    itemOverrides,
    enableAutoColorPalette,
    palette,
    defaultCtaText,
  ]);

  // Apply logical item conditions, search, category filter, and sorting
  const visibleItems = useMemo(() => {
    let list = rawBuiltItems.filter((item) => {
      if (item.hidden) return false;
      if (hiddenItemIds && hiddenItemIds.includes(item.id)) return false;

      // Item-level logical conditions
      if (itemLogicCondition === 'published-only' && item.published === false) {
        return false;
      }
      if (
        itemLogicCondition === 'has-description' &&
        (!item.subtitle || item.subtitle.trim().length < 2)
      ) {
        return false;
      }
      if (
        itemLogicCondition === 'has-activity' &&
        (item.viewsCount || 0) === 0 &&
        (item.leadsCount || 0) === 0
      ) {
        return false;
      }
      if (
        itemLogicCondition === 'hide-empty-categories' &&
        item.id.startsWith('cat_') &&
        (item.viewsCount || 0) === 0
      ) {
        return false;
      }
      if (
        itemLogicCondition === 'exclude-drafts' &&
        (item.published === false || item.title.includes('טיוטה'))
      ) {
        return false;
      }

      // UI Category filter bar
      if (activeCategoryFilter !== 'all' && item.categoryKey !== activeCategoryFilter) {
        return false;
      }

      // UI Search filter
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSub = item.subtitle?.toLowerCase().includes(q);
        const matchesHover = item.hoverTitle?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub && !matchesHover) return false;
      }

      return true;
    });

    if (sortBy === 'title-asc') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'he'));
    } else if (sortBy === 'title-desc') {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title, 'he'));
    } else if (sortBy === 'date-desc') {
      list = [...list].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    } else if (sortBy === 'views-desc') {
      list = [...list].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

    if (maxItems && maxItems > 0) {
      list = list.slice(0, maxItems);
    }

    return list;
  }, [
    rawBuiltItems,
    hiddenItemIds,
    itemLogicCondition,
    activeCategoryFilter,
    searchQuery,
    sortBy,
    maxItems,
  ]);

  // Section-level logical visibility evaluation
  const sectionConditionPassed = useMemo(() => {
    if (sectionVisibilityRule === 'always') return true;
    if (sectionVisibilityRule === 'when-has-items') {
      return visibleItems.length > 0;
    }
    if (sectionVisibilityRule === 'when-min-items') {
      return visibleItems.length >= (minItemsToShow || 1);
    }
    if (sectionVisibilityRule === 'only-on-home') {
      if (typeof window === 'undefined') return true;
      const path = window.location.pathname;
      return path === '/' || path === '/home' || path === '';
    }
    if (sectionVisibilityRule === 'date-range') {
      const now = Date.now();
      if (visibleFromDate && now < new Date(visibleFromDate).getTime()) return false;
      if (visibleUntilDate && now > new Date(visibleUntilDate).getTime()) return false;
      return true;
    }
    return true;
  }, [
    sectionVisibilityRule,
    visibleItems.length,
    minItemsToShow,
    visibleFromDate,
    visibleUntilDate,
  ]);

  if (!sectionConditionPassed && !isEditing) {
    return null;
  }

  // Unique categories for filter pills
  const availableCategoriesForFilter = useMemo(() => {
    const keys = new Set<string>();
    rawBuiltItems.forEach((it) => {
      if (it.categoryKey) keys.add(it.categoryKey);
    });
    return Array.from(keys);
  }, [rawBuiltItems]);

  const heightClass =
    cardHeight === 'compact'
      ? 'h-[124px]'
      : cardHeight === 'tall'
      ? 'h-[172px]'
      : 'h-[146px]';

  const gridColsClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const handleNavigate = (item: FlipCardItem, e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
      setFlippedCardId((prev) => (prev === item.id ? null : item.id));
      return;
    }
    if (!item.linkUrl || item.linkUrl === '#') {
      e.preventDefault();
      return;
    }
  };

  return (
    <section
      id={anchorId}
      dir="rtl"
      className="relative py-14 md:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{
        backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Logical Condition Warning Banner in Editor Mode */}
        {isEditing && !sectionConditionPassed && (
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold text-center">
            תנאי ההצגה הלוגי של האזור אינו מתקיים כרגע — האזור יהיה מוסתר באתר הציבורי.
          </div>
        )}

        {/* Section Header */}
        {(badge || title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {badge}
              </span>
            )}
            {title && (
              <h2
                className="text-3xl sm:text-4xl md:text-[2.6rem] font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight"
                style={{ color: titleColor || undefined }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
                style={{ color: subtitleColor || undefined }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Optional Filter & Search Controls */}
        {(showCategoryFilterBar || showSearchBar) && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {showCategoryFilterBar && availableCategoriesForFilter.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('all')}
                  className={clsx(
                    'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
                    activeCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  )}
                >
                  הכל
                </button>
                {availableCategoriesForFilter.map((catKey) => {
                  const label = PAGE_CATEGORIES[catKey as keyof typeof PAGE_CATEGORIES]?.shortLabel || catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setActiveCategoryFilter(catKey)}
                      className={clsx(
                        'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
                        activeCategoryFilter === catKey
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {showSearchBar && (
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש מהיר..."
                  className="w-full rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pr-10 pl-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && visibleItems.length === 0 ? (
          <div className={clsx('grid gap-5 md:gap-6', gridColsClass)}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className={clsx(
                  'rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse',
                  heightClass
                )}
              />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
            לא נמצאו פריטים התואמים לתנאי ההצגה והסינון שנבחרו.
          </div>
        ) : (
          /* Flip Cards Grid */
          <div className={clsx('grid gap-5 md:gap-6', gridColsClass)}>
            {visibleItems.map((item, idx) => {
              const IconComp =
                (item.iconName && FLIP_CARD_ICON_MAP[item.iconName]) || Compass;
              const accent =
                item.accentColor || palette[idx % palette.length] || '#528a94';
              const iconBg = item.iconBgColor || `${accent}1c`;
              const isManuallyFlipped = flippedCardId === item.id;
              const isExternal =
                item.linkUrl?.startsWith('http://') ||
                item.linkUrl?.startsWith('https://');

              return (
                <a
                  key={item.id}
                  href={item.linkUrl || '#'}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleNavigate(item, e)}
                  onMouseEnter={() => {
                    // Clear tap state when using pointer hover
                    if (flippedCardId && flippedCardId !== item.id) {
                      setFlippedCardId(null);
                    }
                  }}
                  className={clsx(
                    'group block relative w-full select-none cursor-pointer focus:outline-none',
                    heightClass
                  )}
                  style={{ perspective: '1200px' }}
                >
                  {flipDirection === 'fade-scale' ? (
                    /* Fade & Scale Variant */
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_6px_26px_rgba(15,23,42,0.07)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)] border border-slate-100 dark:border-slate-800/90">
                      {/* Front */}
                      <div
                        className={clsx(
                          'absolute inset-0 flex items-center gap-4 px-5 sm:px-6 transition-all duration-300',
                          'bg-white dark:bg-slate-900',
                          isManuallyFlipped
                            ? 'opacity-0 scale-95'
                            : 'group-hover:opacity-0 group-hover:scale-95'
                        )}
                        style={{
                          backgroundColor: cardBgColor || undefined,
                        }}
                      >
                        <div
                          className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundColor: iconBg }}
                        >
                          {item.iconUrl ? (
                            <img
                              src={item.iconUrl}
                              alt={item.title}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <span style={{ color: accent }}>
                              <IconComp className="w-8 h-8" strokeWidth={1.8} />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Back */}
                      <div
                        className={clsx(
                          'absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white transition-all duration-300',
                          isManuallyFlipped
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100'
                        )}
                        style={{ backgroundColor: accent }}
                      >
                        <span className="text-base sm:text-lg font-bold tracking-tight drop-shadow-sm line-clamp-2">
                          {item.hoverTitle || item.title}
                        </span>
                        <span className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-black/25 hover:bg-black/35 text-white text-sm font-bold shadow-sm transition-colors">
                          {item.ctaText || defaultCtaText}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* 3D Flip Variant (Horizontal / Vertical — exact video effect) */
                    <div
                      className={clsx(
                        'relative w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        flipDirection === 'vertical'
                          ? isManuallyFlipped
                            ? '[transform:rotateX(180deg)]'
                            : 'group-hover:[transform:rotateX(180deg)]'
                          : isManuallyFlipped
                          ? '[transform:rotateY(180deg)]'
                          : 'group-hover:[transform:rotateY(180deg)]'
                      )}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* FRONT FACE */}
                      <div
                        className="absolute inset-0 rounded-2xl flex items-center gap-4 px-5 sm:px-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 shadow-[0_6px_26px_rgba(15,23,42,0.07)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          backgroundColor: cardBgColor || undefined,
                        }}
                      >
                        {/* Circular Colored Icon Badge */}
                        <div
                          className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full shrink-0 flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: iconBg }}
                        >
                          {item.iconUrl ? (
                            <img
                              src={item.iconUrl}
                              alt={item.title}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <span style={{ color: accent }}>
                              <IconComp className="w-8 h-8" strokeWidth={1.8} />
                            </span>
                          )}
                        </div>

                        {/* Title & Subtitle */}
                        <div className="flex-1 min-w-0 text-right">
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* BACK FACE (HOVER STATE) */}
                      <div
                        className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center px-5 text-center text-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] overflow-hidden"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform:
                            flipDirection === 'vertical'
                              ? 'rotateX(180deg)'
                              : 'rotateY(180deg)',
                          backgroundColor: accent,
                        }}
                      >
                        {/* Subtle ambient sheen */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15" />

                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <span className="text-base sm:text-lg font-bold tracking-tight drop-shadow-sm line-clamp-2">
                            {item.hoverTitle || item.title}
                          </span>
                          <span className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-black/25 hover:bg-black/40 backdrop-blur-sm text-white text-sm font-bold shadow-sm transition-colors">
                            <span>{item.ctaText || defaultCtaText}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
