import { Firestore } from 'firebase/firestore';
import {
  PageBuilderConfig,
  PageCategory,
  ARCHIVE_7_SECTIONS_SPECS,
} from '../types/pageBuilder.types';
import { BrandDna, TenantStylePreset } from '../../../core/contracts';
import { resolveLiveBrandDna, applyStylePresetToSection } from '../services/brandSectionHydrator';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { STYLE_GLOBAL_THEMES } from '../services/pageStylePresetService';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { loadBrandDna } from '../../KosBranding/services/brandDnaFirestore';

/**
 * Mapping of canonical URL archive slugs to internal PageCategory
 */
export const ARCHIVE_SLUG_MAP: Record<string, PageCategory> = {
  kosvidio: 'youtube_post',
  kosinfo: 'info_content',
  kosevent: 'event',
  koscheckout: 'checkout',
  koscommunity: 'community',
  kosfunrise: 'fundraising',
  koscourse: 'course',
  kosass: 'service_product',
};

/**
 * Array of all supported archive slugs
 */
export const ARCHIVE_SLUGS = Object.keys(ARCHIVE_SLUG_MAP) as Array<keyof typeof ARCHIVE_SLUG_MAP>;

/**
 * Check if a given slug is a canonical archive route
 */
export function isArchiveSlug(slug?: string | null): boolean {
  if (!slug) return false;
  const clean = slug.toLowerCase().trim().replace(/^\/+/, '');
  return Boolean(ARCHIVE_SLUG_MAP[clean]);
}

/**
 * Get category for an archive slug
 */
export function getCategoryFromArchiveSlug(slug?: string | null): PageCategory | null {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim().replace(/^\/+/, '');
  return ARCHIVE_SLUG_MAP[clean] || null;
}

/**
 * Loads the active Brand DNA directly from Firestore collection tenants/{tenantId}/settings/kos_branding_dna
 * with graceful fallback to cached memory resolver.
 */
export async function fetchLiveBrandDna(
  db?: Firestore | null,
  tenantId: string = '_master',
  providedBrand?: BrandDna | null
): Promise<BrandDna> {
  if (providedBrand && providedBrand.designTokens?.primaryColor) {
    return resolveLiveBrandDna(providedBrand, tenantId);
  }
  if (db) {
    try {
      const fromDb = await loadBrandDna(db, tenantId);
      if (fromDb && fromDb.designTokens?.primaryColor) {
        return fromDb;
      }
    } catch (err) {
      console.warn('[archivePageGenerator] Failed reading brand DNA from Firestore collection:', err);
    }
  }
  return resolveLiveBrandDna(providedBrand, tenantId);
}

/**
 * Builds an archive page configuration containing ONLY:
 * 1. Top Header
 * 2. Dedicated Hero section
 * 3. The matching category listing section
 * 
 * Injects the tenant's visual language collection (designTokens, colors, shapes, typography and presets).
 */
export function buildArchivePageConfig(
  category: PageCategory,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): PageBuilderConfig {
  const brand = resolveLiveBrandDna(brandDnaInput, tenantId);
  const companyName = brand.identity?.companyName || (tenantId === '_master' ? 'קושאן' : `עסק ${tenantId}`);
  const slogan = brand.identity?.slogan || 'חדשנות, איכות וצמיחה מתמדת';
  const logoUrl = brand.identity?.logoUrl || '';

  const preset: TenantStylePreset = (brand.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard';
  const styleTokens = STYLE_GLOBAL_THEMES[preset] || {};

  const primaryColor = brand.designTokens?.primaryColor || styleTokens.primaryColor || '#6366f1';
  const secondaryColor = brand.designTokens?.secondaryColor || styleTokens.secondaryColor || '#0ea5e9';
  const buttonBgColor = brand.designTokens?.buttonBgColor || styleTokens.buttonBgColor || primaryColor;
  const buttonTextColor = brand.designTokens?.buttonTextColor || styleTokens.buttonTextColor || '#ffffff';
  const borderRadius = (brand.designTokens?.borderRadius as any) || styleTokens.borderRadius || 'md';
  const buttonStyle = (brand.designTokens?.buttonStyle as any) || styleTokens.buttonStyle || 'gradient';
  const fontFamily = brand.designTokens?.fontFamily || 'Heebo, sans-serif';

  const contactPhone = brand.trust?.contactPhone || '052-6968008';
  const contactWhatsApp = brand.trust?.whatsappSupportNumber || contactPhone;
  const contactEmail = brand.trust?.contactEmail || 'office@kosun.pro';
  const address = brand.trust?.officeAddress || 'ישראל';

  const spec = (ARCHIVE_7_SECTIONS_SPECS as any)[category] || ARCHIVE_7_SECTIONS_SPECS.info_content;
  const slug = spec.slugPrefix.toLowerCase();
  const pageId = `page_archive_${slug}_${tenantId}`;

  const fullTitle = `${spec.defaultTitle} | ${companyName}`;
  const fullDesc = `${spec.description} מבית ${companyName}. ${slogan}`;

  // Archive pages strictly contain ONLY Header, Hero, and the matching Listing
  const sectionOrder: string[] = ['header-1'];
  const sections: Record<string, any> = {};

  // 1. Header Section
  sections['header-1'] = {
    ...SECTION_REGISTRY.header.defaultConfig,
    id: 'header-1',
    title: companyName,
    logoUrl,
    showLogoText: true,
    logoText: companyName,
    navLinks: [
      { label: 'עמוד הבית', url: '/' },
      { label: 'וידאו ושידורים', url: '/kosvidio' },
      { label: 'תוכן ומאמרים', url: '/kosinfo' },
      { label: 'אירועים', url: '/kosevent' },
      { label: 'מוצרים וסליקה', url: '/koscheckout' },
      { label: 'קורסים', url: '/koscourse' },
      { label: 'קהילה', url: '/koscommunity' },
    ],
  };

  // 2. Hero Section
  const heroId = `hero-${slug}`;
  sectionOrder.push(heroId);
  const heroBase = {
    ...SECTION_REGISTRY.hero.defaultConfig,
    id: heroId,
    title: spec.defaultTitle,
    subtitle: spec.defaultSubtitle,
    description: fullDesc,
    badgeText: spec.name,
    layout: (preset === 'masculine' || preset === 'feminine' || preset === 'spiritual' || preset === 'sharp' || preset === 'analytical')
      ? preset
      : 'bento-hero',
    heroStyle: preset === 'feminine' || preset === 'spiritual'
      ? 'mesh-glow'
      : preset === 'masculine'
      ? 'card'
      : preset === 'sharp'
      ? 'minimal'
      : preset === 'analytical'
      ? 'modern'
      : 'mesh-glow',
    buttonShape: borderRadius === 'none'
      ? 'square'
      : borderRadius === 'full'
      ? 'pill'
      : 'rounded',
    primaryButtonColor: buttonBgColor,
    secondaryButtonColor: secondaryColor,
    accentColor: primaryColor,
    buttonsVisible: true,
    primaryButton: {
      text: 'צפייה בכל התכנים והעדכונים',
      url: '#sec-listing',
    },
    secondaryButton: {
      text: 'יצירת קשר מהיר בוואטסאפ',
      url: `https://wa.me/${contactWhatsApp.replace(/[^0-9]/g, '')}`,
    },
  };
  sections[heroId] = applyStylePresetToSection(heroBase, preset);

  // 3. Category-Specific Listing Section ONLY
  if (category === 'youtube_post') {
    const listingId = 'kosvidioGallery-1';
    sectionOrder.push(listingId);
    const galBase = {
      ...SECTION_REGISTRY.kosvidioGallery.defaultConfig,
      id: listingId,
      anchorId: 'sec-listing',
      title: 'ספריית הוידאו, ההרצאות והשידורים החיים',
      subtitle: 'צפייה ישירה, הדרכות מוקלטות וניתוחים מעמיקים',
      badge: 'וידאו חי • VOD',
      source: 'tenant_kosvidio',
      layout: (preset === 'feminine' || preset === 'spiritual') ? 'featured_carousel' : (preset === 'sharp' ? 'grid' : 'featured_carousel'),
      viewMode: 'grid',
      channelName: companyName,
      channelSlogan: slogan,
      channelAvatarUrl: logoUrl,
      accentColor: primaryColor,
      items: [],
    };
    sections[listingId] = applyStylePresetToSection(galBase, preset);
  } else {
    const listingId = 'dynamicListing-1';
    sectionOrder.push(listingId);
    const listBase = {
      ...SECTION_REGISTRY.dynamicListing.defaultConfig,
      id: listingId,
      anchorId: 'sec-listing',
      title: spec.defaultTitle,
      subtitle: spec.defaultSubtitle,
      badge: spec.name,
      source: 'pages',
      filterCategory: category,
      stylePreset: preset,
      layout: preset === 'feminine'
        ? 'snap-carousel'
        : preset === 'masculine'
        ? 'bento-showcase'
        : preset === 'spiritual'
        ? 'snap-carousel'
        : preset === 'sharp'
        ? 'masonry'
        : preset === 'analytical'
        ? 'editorial-list'
        : 'bento-showcase',
      boxShape: preset === 'feminine'
        ? 'flower'
        : preset === 'masculine'
        ? 'shield'
        : preset === 'spiritual'
        ? 'lotus'
        : preset === 'sharp'
        ? 'sharp'
        : preset === 'analytical'
        ? 'hud'
        : 'rounded',
      buttonShape: borderRadius === 'none'
        ? 'square'
        : borderRadius === 'full'
        ? 'pill'
        : 'rounded',
      accentColor: primaryColor,
      showCategoryFilter: true,
      showSearchBar: true,
      searchPlaceholder: `חיפוש מהיר ב${spec.name}...`,
      items: [],
    };
    sections[listingId] = applyStylePresetToSection(listBase, preset);
  }

  const config: PageBuilderConfig = {
    pageId,
    pageTitle: fullTitle,
    slug,
    pageCategory: category,
    published: true,
    isHomePage: false,
    isArchivePage: true,
    viewsCount: 0,
    leadsCount: 0,
    globalSettings: {
      siteTitle: fullTitle,
      companyName,
      slogan,
      theme: preset,
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
      primaryColor,
      secondaryColor,
      buttonBgColor,
      buttonTextColor,
      borderRadius,
      buttonStyle,
      fontFamily,
      contactWhatsApp,
      contactPhone,
      contactEmail,
      address,
      siteLogoUrl: logoUrl,
    },
    seoSettings: {
      title: fullTitle,
      description: fullDesc,
      keywords: [...spec.keywords, companyName, 'ארכיון'],
      ogImage: logoUrl,
      faviconUrl: logoUrl,
      aiKnowledgeSummary: `${fullTitle}. ${fullDesc}`,
    },
    sectionOrder,
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return config;
}

/**
 * Sanitizes an archive page so that only Header, Hero, and the matching Listing are in sectionOrder,
 * and updates its globalSettings and sections to strictly adhere to the tenant's visual language collection.
 */
export function sanitizeArchivePageWithBrandDna(
  page: PageBuilderConfig,
  brand: BrandDna,
  tenantId: string = '_master'
): PageBuilderConfig {
  const slug = (page.slug || '').toLowerCase().trim().replace(/^\/+/, '');
  const category = page.pageCategory || ARCHIVE_SLUG_MAP[slug] || 'info_content';
  const spec = (ARCHIVE_7_SECTIONS_SPECS as any)[category] || ARCHIVE_7_SECTIONS_SPECS.info_content;

  const preset: TenantStylePreset = (brand.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard';
  const styleTokens = STYLE_GLOBAL_THEMES[preset] || {};

  const primaryColor = brand.designTokens?.primaryColor || styleTokens.primaryColor || '#6366f1';
  const secondaryColor = brand.designTokens?.secondaryColor || styleTokens.secondaryColor || '#0ea5e9';
  const buttonBgColor = brand.designTokens?.buttonBgColor || styleTokens.buttonBgColor || primaryColor;
  const buttonTextColor = brand.designTokens?.buttonTextColor || styleTokens.buttonTextColor || '#ffffff';
  const borderRadius = (brand.designTokens?.borderRadius as any) || styleTokens.borderRadius || 'md';
  const buttonStyle = (brand.designTokens?.buttonStyle as any) || styleTokens.buttonStyle || 'gradient';
  const fontFamily = brand.designTokens?.fontFamily || 'Heebo, sans-serif';

  const companyName = brand.identity?.companyName || page.globalSettings?.companyName || (tenantId === '_master' ? 'קושאן' : `עסק ${tenantId}`);
  const logoUrl = brand.identity?.logoUrl || page.globalSettings?.siteLogoUrl || '';
  const slogan = brand.identity?.slogan || page.globalSettings?.slogan || 'חדשנות, איכות וצמיחה מתמדת';
  const contactPhone = brand.trust?.contactPhone || page.globalSettings?.contactPhone || '052-6968008';
  const contactWhatsApp = brand.trust?.whatsappSupportNumber || contactPhone;
  const contactEmail = brand.trust?.contactEmail || page.globalSettings?.contactEmail || 'office@kosun.pro';
  const address = brand.trust?.officeAddress || page.globalSettings?.address || 'ישראל';

  const sections: Record<string, any> = { ...page.sections };

  // 1. Ensure Header
  if (!sections['header-1']) {
    sections['header-1'] = {
      ...SECTION_REGISTRY.header.defaultConfig,
      id: 'header-1',
      title: companyName,
      logoUrl,
      showLogoText: true,
      logoText: companyName,
      navLinks: [
        { label: 'עמוד הבית', url: '/' },
        { label: 'וידאו ושידורים', url: '/kosvidio' },
        { label: 'תוכן ומאמרים', url: '/kosinfo' },
        { label: 'אירועים', url: '/kosevent' },
        { label: 'מוצרים וסליקה', url: '/koscheckout' },
        { label: 'קורסים', url: '/koscourse' },
        { label: 'קהילה', url: '/koscommunity' },
      ],
    };
  } else {
    sections['header-1'] = {
      ...sections['header-1'],
      title: companyName,
      logoUrl,
      logoText: companyName,
    };
  }

  // 2. Find or create Hero
  const heroId = page.sectionOrder?.find((id) => id.startsWith('hero') || sections[id]?.type === 'hero') || `hero-${slug}`;
  if (!sections[heroId]) {
    sections[heroId] = {
      ...SECTION_REGISTRY.hero.defaultConfig,
      id: heroId,
      title: spec.defaultTitle,
      subtitle: spec.defaultSubtitle,
      description: `${spec.description} מבית ${companyName}. ${slogan}`,
      badgeText: spec.name,
      buttonsVisible: true,
      primaryButton: {
        text: 'צפייה בכל התכנים והעדכונים',
        url: '#sec-listing',
      },
      secondaryButton: {
        text: 'יצירת קשר מהיר בוואטסאפ',
        url: `https://wa.me/${contactWhatsApp.replace(/[^0-9]/g, '')}`,
      },
    };
  }
  sections[heroId] = {
    ...sections[heroId],
    layout: (preset === 'masculine' || preset === 'feminine' || preset === 'spiritual' || preset === 'sharp' || preset === 'analytical')
      ? preset
      : 'bento-hero',
    heroStyle: preset === 'feminine' || preset === 'spiritual'
      ? 'mesh-glow'
      : preset === 'masculine'
      ? 'card'
      : preset === 'sharp'
      ? 'minimal'
      : preset === 'analytical'
      ? 'modern'
      : 'mesh-glow',
    buttonShape: borderRadius === 'none'
      ? 'square'
      : borderRadius === 'full'
      ? 'pill'
      : 'rounded',
    primaryButtonColor: buttonBgColor,
    secondaryButtonColor: secondaryColor,
    accentColor: primaryColor,
  };
  applyStylePresetToSection(sections[heroId], preset);

  // 3. Find or create Listing
  const isVideoCategory = category === 'youtube_post' || slug === 'kosvidio';
  const listingId = isVideoCategory
    ? page.sectionOrder?.find((id) => id.startsWith('kosvidioGallery') || sections[id]?.type === 'kosvidioGallery') || 'kosvidioGallery-1'
    : page.sectionOrder?.find((id) => id.startsWith('dynamicListing') || sections[id]?.type === 'dynamicListing') || 'dynamicListing-1';

  if (isVideoCategory) {
    if (!sections[listingId]) {
      sections[listingId] = {
        ...SECTION_REGISTRY.kosvidioGallery.defaultConfig,
        id: listingId,
        anchorId: 'sec-listing',
        title: 'ספריית הוידאו, ההרצאות והשידורים החיים',
        subtitle: 'צפייה ישירה, הדרכות מוקלטות וניתוחים מעמיקים',
        badge: 'וידאו חי • VOD',
        source: 'tenant_kosvidio',
        items: [],
      };
    }
    sections[listingId] = {
      ...sections[listingId],
      channelName: companyName,
      channelSlogan: slogan,
      channelAvatarUrl: logoUrl,
      accentColor: primaryColor,
      layout: (preset === 'feminine' || preset === 'spiritual') ? 'featured_carousel' : (preset === 'sharp' ? 'grid' : 'featured_carousel'),
    };
    applyStylePresetToSection(sections[listingId], preset);
  } else {
    if (!sections[listingId]) {
      sections[listingId] = {
        ...SECTION_REGISTRY.dynamicListing.defaultConfig,
        id: listingId,
        anchorId: 'sec-listing',
        title: spec.defaultTitle,
        subtitle: spec.defaultSubtitle,
        badge: spec.name,
        source: 'pages',
        filterCategory: category,
        items: [],
      };
    }
    sections[listingId] = {
      ...sections[listingId],
      filterCategory: category,
      stylePreset: preset,
      layout: preset === 'feminine'
        ? 'snap-carousel'
        : preset === 'masculine'
        ? 'bento-showcase'
        : preset === 'spiritual'
        ? 'snap-carousel'
        : preset === 'sharp'
        ? 'masonry'
        : preset === 'analytical'
        ? 'editorial-list'
        : 'bento-showcase',
      boxShape: preset === 'feminine'
        ? 'flower'
        : preset === 'masculine'
        ? 'shield'
        : preset === 'spiritual'
        ? 'lotus'
        : preset === 'sharp'
        ? 'sharp'
        : preset === 'analytical'
        ? 'hud'
        : 'rounded',
      buttonShape: borderRadius === 'none'
        ? 'square'
        : borderRadius === 'full'
        ? 'pill'
        : 'rounded',
      accentColor: primaryColor,
    };
    applyStylePresetToSection(sections[listingId], preset);
  }

  // Strictly enforce sectionOrder: ONLY Header, Hero, and the matching Listing!
  const finalSectionOrder = ['header-1', heroId, listingId];

  return {
    ...page,
    pageCategory: category,
    isArchivePage: true,
    published: true,
    sectionOrder: finalSectionOrder,
    sections,
    globalSettings: {
      ...page.globalSettings,
      theme: preset,
      primaryColor,
      secondaryColor,
      buttonBgColor,
      buttonTextColor,
      borderRadius,
      buttonStyle,
      fontFamily,
      companyName,
      slogan,
      siteLogoUrl: logoUrl,
      contactWhatsApp,
      contactPhone,
      contactEmail,
      address,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Resolves or immediately creates the specialized archive page if missing.
 * Prevents 404 for any archive route like /kosvidio, /kosinfo, /kosevent, etc.
 * Connects directly to Firestore collection tenants/{tenantId}/settings/kos_branding_dna.
 */
export async function resolveOrGenerateArchivePage(
  slug: string,
  db?: Firestore | null,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): Promise<PageBuilderConfig | null> {
  const cleanSlug = slug.toLowerCase().trim().replace(/^\/+/, '');
  const category = ARCHIVE_SLUG_MAP[cleanSlug];
  if (!category) return null;

  // 1. Fetch live Brand DNA directly from Firestore collection settings/kos_branding_dna
  const liveBrand = await fetchLiveBrandDna(db, tenantId, brandDnaInput);

  try {
    // 2. Check if page already exists in Firestore for this tenant
    const allPages = await pageBuilderFirestore.getAllPages(db || null, tenantId);
    const existing = allPages.find((p) => {
      const pSlug = (p.slug || '').toLowerCase().trim().replace(/^\/+/, '');
      const pShort = (p.shortSlug || '').toLowerCase().trim().replace(/^\/+/, '');
      return pSlug === cleanSlug || pShort === cleanSlug || p.pageId === `page_archive_${cleanSlug}_${tenantId}`;
    });

    if (existing) {
      // Sanitize existing page: prune excess sections, enforce Hero + Listing only, apply visual language
      const sanitized = sanitizeArchivePageWithBrandDna(existing, liveBrand, tenantId);
      await pageBuilderFirestore.savePage(sanitized, db || null, tenantId);
      return sanitized;
    }

    // 3. Build the specialized archive page configuration (Hero + Listing only)
    const archiveConfig = buildArchivePageConfig(category, tenantId, liveBrand);
    await pageBuilderFirestore.savePage(archiveConfig, db || null, tenantId);

    return archiveConfig;
  } catch (err) {
    console.warn('[resolveOrGenerateArchivePage] Error generating archive page:', err);
    return buildArchivePageConfig(category, tenantId, liveBrand);
  }
}

/**
 * Ensures all 8 specialized archive pages exist for a tenant in Firestore,
 * and prunes them to strictly Hero + Listing only, connected to the visual language collection.
 */
export async function ensureDefaultArchivePages(
  db?: Firestore | null,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): Promise<PageBuilderConfig[]> {
  try {
    const liveBrand = await fetchLiveBrandDna(db, tenantId, brandDnaInput);
    const allPages = await pageBuilderFirestore.getAllPages(db || null, tenantId);

    const tasks = Object.entries(ARCHIVE_SLUG_MAP).map(async ([slug, cat]) => {
      const existing = allPages.find((p) => {
        const pSlug = (p.slug || '').toLowerCase().trim().replace(/^\/+/, '');
        const pShort = (p.shortSlug || '').toLowerCase().trim().replace(/^\/+/, '');
        return pSlug === slug || pShort === slug || p.pageId === `page_archive_${slug}_${tenantId}`;
      });

      if (existing) {
        const currentTheme = existing.globalSettings?.theme;
        const targetPreset = (liveBrand.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard';
        if (existing.sectionOrder?.length === 3 && existing.isArchivePage && currentTheme === targetPreset) {
          return existing;
        }
        const sanitized = sanitizeArchivePageWithBrandDna(existing, liveBrand, tenantId);
        await pageBuilderFirestore.savePage(sanitized, db || null, tenantId);
        return sanitized;
      } else {
        const config = buildArchivePageConfig(cat, tenantId, liveBrand);
        await pageBuilderFirestore.savePage(config, db || null, tenantId);
        return config;
      }
    });

    return await Promise.all(tasks);
  } catch (err) {
    console.warn('[ensureDefaultArchivePages] Failed checking/creating archive pages:', err);
    return [];
  }
}

/**
 * Synchronizes existing archive pages with brand DNA tokens and identity updates
 * from Firestore collection tenants/{tenantId}/settings/kos_branding_dna
 */
export async function syncArchivePagesWithBrandDna(
  db?: Firestore | null,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): Promise<void> {
  try {
    const liveBrand = await fetchLiveBrandDna(db, tenantId, brandDnaInput);
    const allPages = await pageBuilderFirestore.getAllPages(db || null, tenantId);

    const updateTasks = allPages
      .filter((page) => {
        const slug = (page.slug || '').toLowerCase().trim().replace(/^\/+/, '');
        return page.isArchivePage || ARCHIVE_SLUG_MAP[slug];
      })
      .map(async (page) => {
        const sanitized = sanitizeArchivePageWithBrandDna(page, liveBrand, tenantId);
        await pageBuilderFirestore.savePage(sanitized, db || null, tenantId);
      });

    await Promise.all(updateTasks);
  } catch (err) {
    console.warn('[syncArchivePagesWithBrandDna] Failed updating archive pages:', err);
  }
}
