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
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { BrandDna, BrandDnaContract, TenantStylePreset } from '../../../../core/contracts';
import { resolveSectionTheme } from '../../styles/resolveSectionTheme';
import { SectionStyleKey } from '../../styles/sectionThemePresets';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { getKoscloudBrandingIconsForStyle } from '../../../../core/ui/BrandIconPicker';
import { fetchPublicBrandIcons, PublicBrandIconItem } from '../../../../core/ui/publicBrandIconsService';
import {
  Sparkles,
  Search,
} from 'lucide-react';
import { clsx } from 'clsx';

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

const CATEGORY_TO_BRAND_VOCAB_KEY: Record<
  string,
  'articles' | 'events' | 'courses' | 'videos' | 'community' | 'services' | 'posts' | 'fundraising' | 'checkout'
> = {
  info_content: 'articles',
  event: 'events',
  course: 'courses',
  youtube_post: 'videos',
  community: 'community',
  service_product: 'services',
  general: 'posts',
  fundraising: 'fundraising',
  checkout: 'checkout',
};

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

function getStylePresetCardClasses(styleKey: SectionStyleKey) {
  switch (styleKey) {
    case 'feminine':
      return {
        cardRadius: 'rounded-[1.75rem]',
        frontBorder: 'border-rose-200/70 dark:border-rose-500/20 shadow-[0_8px_28px_rgba(244,63,94,0.08)]',
        iconRadius: 'rounded-full',
        ctaRadius: 'rounded-full',
      };
    case 'masculine':
      return {
        cardRadius: 'rounded-xl',
        frontBorder: 'border-2 border-slate-300 dark:border-slate-700 shadow-xl',
        iconRadius: 'rounded-xl',
        ctaRadius: 'rounded-lg',
      };
    case 'spiritual':
      return {
        cardRadius: 'rounded-3xl',
        frontBorder: 'border-purple-200/60 dark:border-purple-700/30 backdrop-blur-md shadow-[0_8px_30px_rgba(147,51,234,0.08)]',
        iconRadius: 'rounded-full',
        ctaRadius: 'rounded-full',
      };
    case 'sharp':
      return {
        cardRadius: 'rounded-none',
        frontBorder: 'border-2 border-slate-900 dark:border-slate-200 shadow-[4px_4px_0px_rgba(15,23,42,0.12)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.12)]',
        iconRadius: 'rounded-none',
        ctaRadius: 'rounded-none',
      };
    case 'analytical':
      return {
        cardRadius: 'rounded-lg',
        frontBorder: 'border border-emerald-500/30 dark:border-emerald-500/30 shadow-md',
        iconRadius: 'rounded-lg',
        ctaRadius: 'rounded-md',
      };
    case 'standard':
    default:
      return {
        cardRadius: 'rounded-2xl',
        frontBorder: 'border-slate-100 dark:border-slate-800/90 shadow-[0_6px_26px_rgba(15,23,42,0.07)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)]',
        iconRadius: 'rounded-full',
        ctaRadius: 'rounded-lg',
      };
  }
}

export interface FlipCardsListingSectionProps {
  config: FlipCardsListingSectionConfig;
  isEditing?: boolean;
}

export const FlipCardsListingSection: React.FC<FlipCardsListingSectionProps> = ({
  config,
  isEditing = false,
}) => {
  const { getCapability } = useHostCapabilities();
  const { db } = useSystemConnection();
  const capabilityBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  const {
    anchorId = 'flip-cards-listing',
    title: configuredTitle,
    subtitle: configuredSubtitle,
    badge: configuredBadge,
    titleColor,
    subtitleColor,
    backgroundColor = 'transparent',
    cardBgColor,
    stylePreset = 'auto',
    useBrandColors = true,
    useBrandIcons = true,
    useBrandMicrocopy = true,
    accentColor: configuredAccentColor,
    sourceMode = 'pages-and-categories',
    selectedPageCategories = [],
    includeArchives = true,
    maxItems = 12,
    sortBy = 'manual',
    columns = 3,
    flipDirection = 'horizontal',
    cardHeight = 'standard',
    defaultCtaText: configuredCtaText,
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
  const [liveBrandDna, setLiveBrandDna] = useState<BrandDna | null>(() =>
    resolveLiveBrandDna(capabilityBrandDna)
  );
  const [brandIcons, setBrandIcons] = useState<PublicBrandIconItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // Sync live Brand DNA
  useEffect(() => {
    const effTenant =
      typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
    setLiveBrandDna(resolveLiveBrandDna(capabilityBrandDna, effTenant));
  }, [capabilityBrandDna]);

  // Resolve section theme & tokens from KosWebAi Styles + Brand DNA
  const resolvedTheme = useMemo(
    () =>
      resolveSectionTheme(
        {
          layout: stylePreset,
          useBrandColors,
          backgroundColor,
          titleColor,
          descriptionColor: subtitleColor,
          accentColor: configuredAccentColor,
        },
        liveBrandDna
      ),
    [
      stylePreset,
      useBrandColors,
      backgroundColor,
      titleColor,
      subtitleColor,
      configuredAccentColor,
      liveBrandDna,
    ]
  );

  const activeStyleKey: SectionStyleKey = resolvedTheme.styleKey;
  const presetCardClasses = useMemo(
    () => getStylePresetCardClasses(activeStyleKey),
    [activeStyleKey]
  );

  // Load Brand Style Icons from KOSCLOUD / BrandIconPicker
  useEffect(() => {
    if (!useBrandIcons) return;
    let active = true;
    const presetForIcons = activeStyleKey as TenantStylePreset;
    if (db) {
      fetchPublicBrandIcons(db, presetForIcons).then((fetched) => {
        if (active && fetched.length > 0) {
          setBrandIcons(fetched);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [db, activeStyleKey, useBrandIcons]);

  // Load Tenant Pages dynamically
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
        const freshBrand = resolveLiveBrandDna(capabilityBrandDna, effTenant);
        if (isMounted) setLiveBrandDna(freshBrand);

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
  }, [sourceMode, capabilityBrandDna]);

  // Brand micro-copy resolution (uiVocabulary)
  const uiVocab = liveBrandDna?.uiVocabulary;
  const brandCompanyName = liveBrandDna?.identity?.companyName;
  const brandSlogan = liveBrandDna?.identity?.slogan;

  const effectiveTitle =
    configuredTitle ||
    (useBrandMicrocopy ? uiVocab?.sectionHeadings?.aboutHeading : undefined) ||
    'מה תמצאו כאן';

  const effectiveSubtitle =
    configuredSubtitle ||
    (useBrandMicrocopy
      ? uiVocab?.sectionHeadings?.aboutSubtitle || brandSlogan
      : undefined);

  const effectiveBadge =
    configuredBadge ||
    (useBrandMicrocopy && brandCompanyName ? `• ${brandCompanyName} •` : undefined);

  const effectiveDefaultCtaText =
    configuredCtaText ||
    (useBrandMicrocopy && uiVocab?.primaryCta ? uiVocab.primaryCta : undefined) ||
    'לחצו כאן >>';

  // Effective color palette (supports Brand DNA primary/secondary colors when enabled)
  const palette = useMemo(() => {
    if (colorPalette && colorPalette.length > 0 && !useBrandColors) {
      return colorPalette;
    }
    if (useBrandColors && liveBrandDna?.designTokens?.primaryColor) {
      const p = liveBrandDna.designTokens.primaryColor;
      const s = liveBrandDna.designTokens.secondaryColor;
      const basePalette = colorPalette && colorPalette.length > 0 ? colorPalette : DEFAULT_FLIP_PALETTE;
      if (enableAutoColorPalette) {
        return [p, ...(s ? [s] : []), ...basePalette.filter((c) => c !== p && c !== s)];
      }
      return [p];
    }
    return colorPalette && colorPalette.length > 0 ? colorPalette : DEFAULT_FLIP_PALETTE;
  }, [colorPalette, useBrandColors, liveBrandDna, enableAutoColorPalette]);

  // Brand icons pool for fallback assignment
  const styleBrandIconPool = useMemo(() => {
    if (brandIcons.length > 0) {
      return brandIcons.map((ic) => ic.svgUrl || ic.name);
    }
    return getKoscloudBrandingIconsForStyle(activeStyleKey as TenantStylePreset).map(
      (ic) => ic.name
    );
  }, [brandIcons, activeStyleKey]);

  // Build unified items list from dynamic sources + custom items + overrides + brand micro-copy
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
        const vocabKey = CATEGORY_TO_BRAND_VOCAB_KEY[catKey];
        const brandCatDesc =
          useBrandMicrocopy && vocabKey ? uiVocab?.categoryDescriptions?.[vocabKey] : undefined;

        const heroSec = Object.values(p.sections || {}).find(
          (s: any) => s && s.type === 'hero'
        ) as any;

        const slug =
          p.publishedUrl ||
          p.shortUrl ||
          (p.slug ? (p.slug.startsWith('/') ? p.slug : `/${p.slug}`) : `/p/${p.pageId}`);

        const color = enableAutoColorPalette
          ? palette[idx % palette.length]
          : resolvedTheme.resolvedColors.accentColor || meta.accentColor;

        const autoIcon =
          useBrandIcons && styleBrandIconPool.length > 0
            ? styleBrandIconPool[idx % styleBrandIconPool.length]
            : meta.iconName;

        result.push({
          id: `page_${p.pageId}`,
          pageId: p.pageId,
          title: p.pageTitle,
          subtitle:
            heroSec?.subtitle ||
            p.seoSettings?.description ||
            brandCatDesc ||
            catCfg?.shortLabel ||
            'עמוד תוכן פעיל',
          hoverTitle: meta.hoverTitle,
          ctaText: effectiveDefaultCtaText,
          iconName: autoIcon,
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

    // 2. KosWebAi Categories & Archives (connected to Brand Micro-copy)
    if (sourceMode === 'categories' || sourceMode === 'pages-and-categories') {
      const categoryEntries = Object.values(PAGE_CATEGORIES).filter(
        (c) => c.key !== 'home'
      );

      categoryEntries.forEach((catCfg, idx) => {
        if (filterSet && !filterSet.has(catCfg.key)) return;
        const meta = CATEGORY_DEFAULT_META[catCfg.key] || CATEGORY_DEFAULT_META.general;
        const archiveSpec = (ARCHIVE_7_SECTIONS_SPECS as any)[catCfg.key];
        const vocabKey = CATEGORY_TO_BRAND_VOCAB_KEY[catCfg.key];

        const brandCatTitle =
          useBrandMicrocopy && vocabKey ? uiVocab?.categoryTitles?.[vocabKey] : undefined;
        const brandCatDesc =
          useBrandMicrocopy && vocabKey ? uiVocab?.categoryDescriptions?.[vocabKey] : undefined;

        const matchingPagesCount = tenantPages.filter(
          (p) =>
            p &&
            !p.isHomePage &&
            !p.isArchivePage &&
            (getCategoryFromPage(p) || 'general') === catCfg.key
        ).length;

        const color = enableAutoColorPalette
          ? palette[(result.length + idx) % palette.length]
          : resolvedTheme.resolvedColors.accentColor || meta.accentColor;

        const autoIcon =
          useBrandIcons && styleBrandIconPool.length > 0
            ? styleBrandIconPool[(result.length + idx) % styleBrandIconPool.length]
            : meta.iconName;

        const targetUrl = includeArchives
          ? archiveSpec
            ? `/${archiveSpec.slugPrefix}`
            : meta.archiveSlug
          : meta.archiveSlug;

        result.push({
          id: `cat_${catCfg.key}`,
          title: brandCatTitle || catCfg.label,
          subtitle:
            matchingPagesCount > 0
              ? `${catCfg.shortLabel} • ${matchingPagesCount} עמודים פעילים`
              : brandCatDesc || catCfg.description,
          hoverTitle: meta.hoverTitle,
          ctaText: effectiveDefaultCtaText,
          iconName: autoIcon,
          accentColor: color,
          linkUrl: targetUrl,
          categoryKey: catCfg.key,
          published: true,
          viewsCount: matchingPagesCount,
        });
      });
    }

    // 3. Custom / Manual Items
    if (sourceMode === 'custom' || (items && items.length > 0 && sourceMode !== 'categories')) {
      items.forEach((customItem, idx) => {
        if (filterSet && customItem.categoryKey && !filterSet.has(customItem.categoryKey)) {
          return;
        }
        const color =
          customItem.accentColor ||
          (enableAutoColorPalette
            ? palette[(result.length + idx) % palette.length]
            : resolvedTheme.resolvedColors.accentColor || '#528a94');
        result.push({
          ...customItem,
          accentColor: color,
          ctaText: customItem.ctaText || effectiveDefaultCtaText,
          published: customItem.published !== false,
        });
      });
    }

    // Apply per-item overrides
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
    effectiveDefaultCtaText,
    useBrandMicrocopy,
    uiVocab,
    useBrandIcons,
    styleBrandIconPool,
    resolvedTheme.resolvedColors.accentColor,
  ]);

  // Apply logical item conditions, search, category filter, and sorting
  const visibleItems = useMemo(() => {
    let list = rawBuiltItems.filter((item) => {
      if (item.hidden) return false;
      if (hiddenItemIds && hiddenItemIds.includes(item.id)) return false;

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

      if (activeCategoryFilter !== 'all' && item.categoryKey !== activeCategoryFilter) {
        return false;
      }

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
      className={clsx(
        'relative py-14 md:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300',
        backgroundColor === 'transparent' && !resolvedTheme.resolvedColors.backgroundColor
          ? resolvedTheme.tokens.sectionClass
          : ''
      )}
      style={{
        backgroundColor:
          resolvedTheme.resolvedColors.backgroundColor &&
          resolvedTheme.resolvedColors.backgroundColor !== 'transparent'
            ? resolvedTheme.resolvedColors.backgroundColor
            : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {isEditing && !sectionConditionPassed && (
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold text-center">
            תנאי ההצגה הלוגי של האזור אינו מתקיים כרגע — האזור יהיה מוסתר באתר הציבורי.
          </div>
        )}

        {/* Section Header */}
        {(effectiveBadge || effectiveTitle || effectiveSubtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            {effectiveBadge && (
              <span className={resolvedTheme.tokens.badge.className}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{effectiveBadge}</span>
              </span>
            )}
            {effectiveTitle && (
              <h2
                className={clsx(
                  'text-3xl sm:text-4xl md:text-[2.6rem] font-extrabold leading-tight',
                  resolvedTheme.tokens.typography.titleClass
                )}
                style={{ color: resolvedTheme.resolvedColors.titleColor || undefined }}
              >
                {effectiveTitle}
              </h2>
            )}
            {effectiveSubtitle && (
              <p
                className={clsx(
                  'mt-3 text-base sm:text-lg leading-relaxed mx-auto',
                  resolvedTheme.tokens.typography.descClass
                )}
                style={{ color: resolvedTheme.resolvedColors.descriptionColor || undefined }}
              >
                {effectiveSubtitle}
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
                  const vocabKey = CATEGORY_TO_BRAND_VOCAB_KEY[catKey];
                  const brandLabel =
                    useBrandMicrocopy && vocabKey
                      ? uiVocab?.categoryTitles?.[vocabKey]
                      : undefined;
                  const label =
                    brandLabel ||
                    PAGE_CATEGORIES[catKey as keyof typeof PAGE_CATEGORIES]?.shortLabel ||
                    catKey;
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
                  'bg-slate-200/70 dark:bg-slate-800/60 animate-pulse',
                  presetCardClasses.cardRadius,
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
              const accent =
                item.accentColor || palette[idx % palette.length] || '#528a94';
              const iconBg = item.iconBgColor || `${accent}1c`;
              const isManuallyFlipped = flippedCardId === item.id;
              const isExternal =
                item.linkUrl?.startsWith('http://') ||
                item.linkUrl?.startsWith('https://');
              const iconSource = item.iconUrl || item.iconName || 'Compass';

              return (
                <a
                  key={item.id}
                  href={item.linkUrl || '#'}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleNavigate(item, e)}
                  onMouseEnter={() => {
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
                    <div
                      className={clsx(
                        'relative w-full h-full overflow-hidden border',
                        presetCardClasses.cardRadius,
                        presetCardClasses.frontBorder
                      )}
                    >
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
                          className={clsx(
                            'w-16 h-16 sm:w-[70px] sm:h-[70px] shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105',
                            presetCardClasses.iconRadius
                          )}
                          style={{ backgroundColor: iconBg }}
                        >
                          <span style={{ color: accent }}>
                            <DynamicIcon name={iconSource} className="w-8 h-8" />
                          </span>
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
                        <span
                          className={clsx(
                            'mt-3 inline-flex items-center gap-1.5 px-5 py-2 bg-black/25 hover:bg-black/35 text-white text-sm font-bold shadow-sm transition-colors',
                            presetCardClasses.ctaRadius
                          )}
                        >
                          {item.ctaText || effectiveDefaultCtaText}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* 3D Flip Variant */
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
                        className={clsx(
                          'absolute inset-0 flex items-center gap-4 px-5 sm:px-6 bg-white dark:bg-slate-900 border',
                          presetCardClasses.cardRadius,
                          presetCardClasses.frontBorder
                        )}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          backgroundColor: cardBgColor || undefined,
                        }}
                      >
                        <div
                          className={clsx(
                            'w-16 h-16 sm:w-[70px] sm:h-[70px] shrink-0 flex items-center justify-center shadow-inner',
                            presetCardClasses.iconRadius
                          )}
                          style={{ backgroundColor: iconBg }}
                        >
                          <span style={{ color: accent }}>
                            <DynamicIcon name={iconSource} className="w-8 h-8" />
                          </span>
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

                      {/* BACK FACE (HOVER STATE) */}
                      <div
                        className={clsx(
                          'absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] overflow-hidden',
                          presetCardClasses.cardRadius
                        )}
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
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15" />

                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <span className="text-base sm:text-lg font-bold tracking-tight drop-shadow-sm line-clamp-2">
                            {item.hoverTitle || item.title}
                          </span>
                          <span
                            className={clsx(
                              'mt-3 inline-flex items-center gap-1.5 px-5 py-2 bg-black/25 hover:bg-black/40 backdrop-blur-sm text-white text-sm font-bold shadow-sm transition-colors',
                              presetCardClasses.ctaRadius
                            )}
                          >
                            <span>{item.ctaText || effectiveDefaultCtaText}</span>
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
