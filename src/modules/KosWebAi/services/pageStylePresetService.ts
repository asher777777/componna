import { Firestore } from 'firebase/firestore';
import { TenantStylePreset, BrandDna, BrandDesignTokens } from '../../../core/contracts';
import { GlobalPageSettings, PageBuilderConfig, PageDesignSnapshot, LayoutArchetype, LAYOUT_ARCHETYPES, SectionType } from '../types/pageBuilder.types';
import { pageBuilderFirestore } from './pageBuilderFirestore';
import { hydrateSectionWithBrandDna, applyStylePresetToSection, createDynamicSectionConfig } from './brandSectionHydrator';

export const PRESET_TITLE_MAP: Record<string, string> = {
  standard: 'סטנדרטי ומאוזן (Standard)',
  feminine: 'נשי ורך (Feminine)',
  masculine: 'גברי ועוצמתי (Masculine)',
  spiritual: 'רוחני ועדין (Spiritual)',
  sharp: 'חד וטכנולוגי (Sharp)',
  analytical: 'אנליטי ומדעי (Analytical)',
};

export const STYLE_GLOBAL_THEMES: Record<TenantStylePreset, Partial<GlobalPageSettings>> = {
  standard: {
    primaryColor: '#6366f1',
    secondaryColor: '#0ea5e9',
    buttonBgColor: '#6366f1',
    buttonTextColor: '#ffffff',
    borderRadius: 'md',
    buttonStyle: 'gradient',
  },
  feminine: {
    primaryColor: '#ec4899',
    secondaryColor: '#f43f5e',
    buttonBgColor: '#ec4899',
    buttonTextColor: '#ffffff',
    borderRadius: 'full',
    buttonStyle: 'gradient',
  },
  masculine: {
    primaryColor: '#2563eb',
    secondaryColor: '#0284c7',
    buttonBgColor: '#2563eb',
    buttonTextColor: '#ffffff',
    borderRadius: 'md',
    buttonStyle: 'solid',
  },
  spiritual: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#d946ef',
    buttonBgColor: '#8b5cf6',
    buttonTextColor: '#ffffff',
    borderRadius: 'lg',
    buttonStyle: 'glass',
  },
  sharp: {
    primaryColor: '#06b6d4',
    secondaryColor: '#0891b2',
    buttonBgColor: '#06b6d4',
    buttonTextColor: '#ffffff',
    borderRadius: 'none',
    buttonStyle: 'outline',
  },
  analytical: {
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    buttonBgColor: '#10b981',
    buttonTextColor: '#ffffff',
    borderRadius: 'sm',
    buttonStyle: 'solid',
  },
};

const CORRUPTED_DARK_BGS = ['#140c12', '#080c14', '#0c0716', '#05070a', '#04120e', '#0a0a0c', '#000000'];
const CORRUPTED_TEXT_COLORS = ['#fff1f2', '#f8fafc', '#faf5ff', '#ecfeff', '#ecfdf5', '#ffffff'];

/**
 * Apply layout, shapes, heroStyle, buttonShape and styling of a style preset to a single section.
 * Preserves Header layout intact according to user configuration.
 */
export { applyStylePresetToSection };

/**
 * Apply style preset to a full page with automatic safety snapshot creation.
 */
export function applyStylePresetToPage(
  page: PageBuilderConfig,
  preset: TenantStylePreset
): { updatedPage: PageBuilderConfig; snapshot: PageDesignSnapshot } {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const snapshot: PageDesignSnapshot = {
    id: `snap_${Date.now()}`,
    timestamp: now.toISOString(),
    createdAtFormatted: formattedDate,
    label: `לפני החלת סגנון ${PRESET_TITLE_MAP[preset] || preset}`,
    preset,
    sections: JSON.parse(JSON.stringify(page.sections || {})),
    theme: page.globalSettings?.theme,
  };

  const nextSections: Record<string, any> = {};
  if (page.sections) {
    for (const key of Object.keys(page.sections)) {
      nextSections[key] = applyStylePresetToSection(page.sections[key], preset);
    }
  }

  const styleTokens = STYLE_GLOBAL_THEMES[preset] || {};
  const newGlobalSettings: GlobalPageSettings = {
    ...(page.globalSettings || {}),
    ...styleTokens,
    theme: preset,
  };

  // Clean up corrupted dark backgrounds and text colors
  if (newGlobalSettings.backgroundColor && CORRUPTED_DARK_BGS.includes(newGlobalSettings.backgroundColor.toLowerCase())) {
    delete newGlobalSettings.backgroundColor;
  }
  if (newGlobalSettings.textColor && CORRUPTED_TEXT_COLORS.includes(newGlobalSettings.textColor.toLowerCase())) {
    delete newGlobalSettings.textColor;
  }

  const updatedPage: PageBuilderConfig = {
    ...page,
    sections: nextSections,
    globalSettings: newGlobalSettings,
    designSnapshots: [snapshot, ...(page.designSnapshots || [])],
    lastModified: Date.now(),
  };

  return { updatedPage, snapshot };
}

/**
 * Reset a page to Brand DNA initial state with automatic safety snapshot.
 */
export function resetPageToBrandInitialState(
  page: PageBuilderConfig,
  brandDna: BrandDna
): { updatedPage: PageBuilderConfig; snapshot: PageDesignSnapshot } {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const snapshot: PageDesignSnapshot = {
    id: `snap_${Date.now()}`,
    timestamp: now.toISOString(),
    createdAtFormatted: formattedDate,
    label: 'לפני איפוס להגדרות מיתוג ראשוניות (Brand DNA)',
    preset: (brandDna?.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard',
    sections: JSON.parse(JSON.stringify(page.sections || {})),
    theme: page.globalSettings?.theme,
  };

  const nextSections: Record<string, any> = {};
  if (page.sections) {
    for (const key of Object.keys(page.sections)) {
      const orig = page.sections[key];
      // Re-hydrate with brand DNA
      nextSections[key] = hydrateSectionWithBrandDna(orig, brandDna, orig.type);
    }
  }

  const defaultPreset = (brandDna?.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard';
  const styleTokens = STYLE_GLOBAL_THEMES[defaultPreset] || {};

  const newGlobalSettings: GlobalPageSettings = {
    ...(page.globalSettings || {}),
    ...styleTokens,
    primaryColor: brandDna?.designTokens?.primaryColor || styleTokens.primaryColor || '#6366f1',
    secondaryColor: brandDna?.designTokens?.secondaryColor || styleTokens.secondaryColor || '#0ea5e9',
    borderRadius: (brandDna?.designTokens?.borderRadius as any) || styleTokens.borderRadius || 'md',
    buttonStyle: (brandDna?.designTokens?.buttonStyle as any) || styleTokens.buttonStyle || 'gradient',
    fontFamily: brandDna?.designTokens?.fontFamily || page.globalSettings?.fontFamily || 'Heebo, sans-serif',
    siteTitle: brandDna?.identity?.companyName || page.globalSettings?.siteTitle,
    companyName: brandDna?.identity?.companyName || page.globalSettings?.companyName,
    slogan: brandDna?.identity?.slogan || page.globalSettings?.slogan,
    siteLogoUrl: brandDna?.identity?.logoUrl || page.globalSettings?.siteLogoUrl,
    contactPhone: brandDna?.trust?.contactPhone || page.globalSettings?.contactPhone,
    contactEmail: brandDna?.trust?.contactEmail || page.globalSettings?.contactEmail,
    contactWhatsApp: brandDna?.trust?.whatsappSupportNumber || page.globalSettings?.contactWhatsApp,
    address: brandDna?.trust?.officeAddress || page.globalSettings?.address,
  };

  if (newGlobalSettings.backgroundColor && CORRUPTED_DARK_BGS.includes(newGlobalSettings.backgroundColor.toLowerCase())) {
    delete newGlobalSettings.backgroundColor;
  }
  if (newGlobalSettings.textColor && CORRUPTED_TEXT_COLORS.includes(newGlobalSettings.textColor.toLowerCase())) {
    delete newGlobalSettings.textColor;
  }

  const updatedPage: PageBuilderConfig = {
    ...page,
    sections: nextSections,
    globalSettings: newGlobalSettings,
    designSnapshots: [snapshot, ...(page.designSnapshots || [])],
    lastModified: Date.now(),
  };

  return { updatedPage, snapshot };
}

/**
 * Apply style preset to ALL pages belonging to a tenant, with automatic snapshots and persistence.
 */
export async function applyStylePresetToAllTenantPages(
  db: Firestore | null,
  tenantId: string,
  preset: TenantStylePreset
): Promise<{ updatedCount: number; pages: PageBuilderConfig[] }> {
  const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
  const updatedPages: PageBuilderConfig[] = [];

  for (const page of allPages) {
    const { updatedPage } = applyStylePresetToPage(page, preset);
    await pageBuilderFirestore.savePage(updatedPage, db, tenantId);
    updatedPages.push(updatedPage);
  }

  // Broadcast event across system
  if (typeof window !== 'undefined') {
    const activePage = updatedPages.find((p) => p.isHomePage) || updatedPages[0];
    window.dispatchEvent(
      new CustomEvent('kos_page_sections_updated', {
        detail: {
          sections: activePage?.sections,
          preset,
          globalSettings: activePage?.globalSettings,
          tenantId,
          allPagesUpdated: true,
        },
      })
    );
  }

  return { updatedCount: updatedPages.length, pages: updatedPages };
}

/**
 * Reset ALL pages belonging to a tenant to Brand DNA initial state, with automatic snapshots and persistence.
 */
export async function resetAllTenantPagesToBrand(
  db: Firestore | null,
  tenantId: string,
  brandDna: BrandDna
): Promise<{ updatedCount: number; pages: PageBuilderConfig[] }> {
  const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
  const updatedPages: PageBuilderConfig[] = [];

  for (const page of allPages) {
    const { updatedPage } = resetPageToBrandInitialState(page, brandDna);
    await pageBuilderFirestore.savePage(updatedPage, db, tenantId);
    updatedPages.push(updatedPage);
  }

  if (typeof window !== 'undefined') {
    const activePage = updatedPages.find((p) => p.isHomePage) || updatedPages[0];
    window.dispatchEvent(
      new CustomEvent('kos_page_sections_updated', {
        detail: {
          sections: activePage?.sections,
          preset: brandDna?.designTokens?.defaultStylePreset || 'standard',
          globalSettings: activePage?.globalSettings,
          tenantId,
          allPagesReset: true,
        },
      })
    );
  }

  return { updatedCount: updatedPages.length, pages: updatedPages };
}

/**
 * Applies a Layout Archetype to a page:
 * - Updates sectionOrder
 * - Applies layout configs to hero, header, dynamicListing, statsBento, testimonials, etc.
 * - Auto-creates missing sections if page is home/ecosystem
 * - Creates a PageDesignSnapshot for safety rollback
 */
export function applyLayoutArchetypeToPage(
  page: PageBuilderConfig,
  archetype: LayoutArchetype,
  brandDna?: BrandDna | null,
  tenantId?: string
): { updatedPage: PageBuilderConfig; snapshot: PageDesignSnapshot } {
  const spec = LAYOUT_ARCHETYPES[archetype] || LAYOUT_ARCHETYPES.bento_hub;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const snapshot: PageDesignSnapshot = {
    id: `snap_${Date.now()}`,
    timestamp: now.toISOString(),
    createdAtFormatted: formattedDate,
    label: `לפני החלת ארכיטיפ עימוד: ${spec.name}`,
    preset: (page.globalSettings?.theme as any) || 'standard',
    sections: JSON.parse(JSON.stringify(page.sections || {})),
    theme: page.globalSettings?.theme,
  };

  const existingSections = { ...(page.sections || {}) };
  const nextSections: Record<string, any> = {};
  const processedKeys = new Set<string>();

  // Process sections in the order specified by the archetype
  for (const targetType of spec.sectionOrder) {
    let matchingKey = Object.keys(existingSections).find(
      (k) => !processedKeys.has(k) && (existingSections[k]?.type === targetType || k === targetType)
    );

    let secConfig: any = null;

    if (matchingKey) {
      secConfig = JSON.parse(JSON.stringify(existingSections[matchingKey]));
      processedKeys.add(matchingKey);
    } else if (page.isHomePage || page.slug === 'home' || page.pageCategory === 'home') {
      try {
        secConfig = createDynamicSectionConfig(targetType as SectionType, brandDna, undefined, tenantId);
        matchingKey = secConfig.id || targetType;
        if (matchingKey) processedKeys.add(matchingKey);
      } catch (e) {
        console.warn(`[applyLayoutArchetypeToPage] Could not instantiate missing section ${targetType}`, e);
      }
    }

    if (secConfig && matchingKey) {
      // Apply archetype-specific layouts
      if (targetType === 'header') {
        secConfig.layout = spec.headerLayout;
        secConfig.style = spec.headerLayout;
      } else if (targetType === 'hero') {
        secConfig.layout = spec.heroLayout;
        secConfig.heroLayout = spec.heroLayout;
        if (spec.defaultCtaPrimary && (!secConfig.ctaPrimaryText || secConfig.ctaPrimaryText.trim() === 'גלה את המערכת' || secConfig.ctaPrimaryText.trim() === 'תיאום פגישה אישית' || secConfig.ctaPrimaryText.trim() === 'הצטרפו למעגל' || secConfig.ctaPrimaryText.trim() === 'שריון מקום במחזור הקרוב' || secConfig.ctaPrimaryText.trim() === 'הזמנה מיידית')) {
          secConfig.ctaPrimaryText = spec.defaultCtaPrimary;
        }
        if (spec.defaultCtaSecondary && (!secConfig.ctaSecondaryText || secConfig.ctaSecondaryText.trim() === 'שיחה ב-WhatsApp' || secConfig.ctaSecondaryText.trim() === 'הצצה לעשייה שלנו' || secConfig.ctaSecondaryText.trim() === 'בואו נדבר בוואטסאפ' || secConfig.ctaSecondaryText.trim() === 'הורדת הסילבוס המלא' || secConfig.ctaSecondaryText.trim() === 'פרטים נוספים')) {
          secConfig.ctaSecondaryText = spec.defaultCtaSecondary;
        }
      } else if (targetType === 'dynamicListing') {
        secConfig.layout = spec.listingLayout;
        secConfig.source = 'all';
      } else if (targetType === 'statsBento') {
        secConfig.layout = spec.statsLayout;
      } else if (targetType === 'testimonials') {
        secConfig.layout = spec.testimonialsLayout;
      }

      nextSections[matchingKey] = secConfig;
    }
  }

  // Preserve any remaining sections not covered by archetype sectionOrder
  for (const [key, sec] of Object.entries(existingSections)) {
    if (!processedKeys.has(key)) {
      nextSections[key] = sec;
      processedKeys.add(key);
    }
  }

  const newGlobalSettings: GlobalPageSettings = {
    ...(page.globalSettings || {}),
    layoutArchetype: archetype,
  };

  const updatedPage: PageBuilderConfig = {
    ...page,
    sections: nextSections,
    sectionOrder: Object.keys(nextSections),
    globalSettings: newGlobalSettings,
    designSnapshots: [snapshot, ...(page.designSnapshots || [])],
    lastModified: Date.now(),
  };

  return { updatedPage, snapshot };
}

/**
 * Applies full BrandDesignTokens (colors, typography, radius, button style, preset) to a single page.
 */
export function applyBrandDesignTokensToPage(
  page: PageBuilderConfig,
  tokens: BrandDesignTokens
): { updatedPage: PageBuilderConfig; snapshot: PageDesignSnapshot } {
  const preset: TenantStylePreset = (tokens.defaultStylePreset as TenantStylePreset) || 'standard';
  const now = new Date();
  const formattedDate = now.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const snapshot: PageDesignSnapshot = {
    id: `snap_tokens_${Date.now()}`,
    timestamp: now.toISOString(),
    createdAtFormatted: formattedDate,
    label: 'לפני החלת צבעים ועיצוב מיתוג (Brand Design Tokens)',
    preset,
    sections: JSON.parse(JSON.stringify(page.sections || {})),
    theme: page.globalSettings?.theme,
  };

  const nextSections: Record<string, any> = {};
  if (page.sections) {
    for (const key of Object.keys(page.sections)) {
      const styled = applyStylePresetToSection(page.sections[key], preset);
      // Allow sections to inherit updated brand colors when useBrandColors is not explicitly false
      if (styled && typeof styled === 'object' && styled.useBrandColors !== false) {
        styled.useBrandColors = true;
        styled.accentColor = tokens.primaryColor;
        styled.primaryButtonColor = tokens.buttonBgColor || tokens.primaryColor;
      }
      nextSections[key] = styled;
    }
  }

  const newGlobalSettings: GlobalPageSettings = {
    ...(page.globalSettings || {}),
    primaryColor: tokens.primaryColor,
    secondaryColor: tokens.secondaryColor,
    backgroundColor: tokens.backgroundColor,
    textColor: tokens.textColor,
    buttonBgColor: tokens.buttonBgColor,
    buttonTextColor: tokens.buttonTextColor,
    fontFamily: tokens.fontFamily,
    borderRadius: tokens.borderRadius,
    buttonStyle: tokens.buttonStyle,
    theme: preset,
  };

  const updatedPage: PageBuilderConfig = {
    ...page,
    sections: nextSections,
    globalSettings: newGlobalSettings,
    designSnapshots: [snapshot, ...(page.designSnapshots || [])],
    lastModified: Date.now(),
  };

  return { updatedPage, snapshot };
}

/**
 * Bulk applies BrandDesignTokens (colors, fonts, radius, button style, preset) to ALL pages of a tenant.
 */
export async function applyBrandDesignTokensToAllTenantPages(
  db: Firestore | null,
  tenantId: string,
  tokens: BrandDesignTokens
): Promise<{ updatedCount: number; pages: PageBuilderConfig[] }> {
  const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
  const updatedPages: PageBuilderConfig[] = [];

  for (const page of allPages) {
    const { updatedPage } = applyBrandDesignTokensToPage(page, tokens);
    await pageBuilderFirestore.savePage(updatedPage, db, tenantId);
    updatedPages.push(updatedPage);
  }

  if (typeof window !== 'undefined' && updatedPages.length > 0) {
    const activePage = updatedPages.find((p) => p.isHomePage) || updatedPages[0];
    window.dispatchEvent(
      new CustomEvent('kos_page_sections_updated', {
        detail: {
          sections: activePage?.sections,
          preset: tokens.defaultStylePreset || 'standard',
          globalSettings: activePage?.globalSettings,
          tenantId,
          allPagesUpdated: true,
        },
      })
    );
  }

  return { updatedCount: updatedPages.length, pages: updatedPages };
}

/**
 * Bulk applies a LayoutArchetype to ALL pages of a tenant.
 */
export async function applyLayoutArchetypeToAllTenantPages(
  db: Firestore | null,
  tenantId: string,
  archetype: LayoutArchetype,
  brandDna?: BrandDna | null
): Promise<{ updatedCount: number; pages: PageBuilderConfig[] }> {
  const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
  const updatedPages: PageBuilderConfig[] = [];

  for (const page of allPages) {
    const { updatedPage } = applyLayoutArchetypeToPage(page, archetype, brandDna, tenantId);
    await pageBuilderFirestore.savePage(updatedPage, db, tenantId);
    updatedPages.push(updatedPage);
  }

  if (typeof window !== 'undefined' && updatedPages.length > 0) {
    const activePage = updatedPages.find((p) => p.isHomePage) || updatedPages[0];
    window.dispatchEvent(
      new CustomEvent('kos_page_sections_updated', {
        detail: {
          sections: activePage?.sections,
          globalSettings: activePage?.globalSettings,
          tenantId,
          allPagesUpdated: true,
        },
      })
    );
  }

  return { updatedCount: updatedPages.length, pages: updatedPages };
}

export interface SingleSectionDesignPatch {
  preset?: TenantStylePreset;
  useBrandColors?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  accentColor?: string;
  primaryButtonColor?: string;
  buttonShape?: string;
  layout?: string;
}

/**
 * Updates design settings for a single specific section on a specific page and saves to Firestore.
 */
export async function updateSingleSectionDesign(
  db: Firestore | null,
  tenantId: string,
  pageId: string,
  sectionKey: string,
  patch: SingleSectionDesignPatch
): Promise<{ success: boolean; updatedPage?: PageBuilderConfig; error?: string }> {
  try {
    const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
    const targetPage = allPages.find((p) => p.pageId === pageId || p.slug === pageId);
    if (!targetPage) {
      return { success: false, error: 'העמוד המבוקש לא נמצא' };
    }

    const existingSection = targetPage.sections?.[sectionKey];
    if (!existingSection) {
      return { success: false, error: 'האזור המבוקש לא נמצא בעמוד' };
    }

    const now = new Date();
    const snapshot: PageDesignSnapshot = {
      id: `snap_sec_${Date.now()}`,
      timestamp: now.toISOString(),
      createdAtFormatted: now.toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      label: `לפני עריכת אזור פרטני (${existingSection.title || existingSection.type || sectionKey})`,
      preset: (targetPage.globalSettings?.theme as TenantStylePreset) || 'standard',
      sections: JSON.parse(JSON.stringify(targetPage.sections || {})),
      theme: targetPage.globalSettings?.theme,
    };

    let nextSection = JSON.parse(JSON.stringify(existingSection));
    if (patch.preset) {
      nextSection = applyStylePresetToSection(nextSection, patch.preset);
    }
    if (patch.useBrandColors !== undefined) nextSection.useBrandColors = patch.useBrandColors;
    if (patch.backgroundColor !== undefined) nextSection.backgroundColor = patch.backgroundColor;
    if (patch.titleColor !== undefined) nextSection.titleColor = patch.titleColor;
    if (patch.descriptionColor !== undefined) nextSection.descriptionColor = patch.descriptionColor;
    if (patch.accentColor !== undefined) nextSection.accentColor = patch.accentColor;
    if (patch.primaryButtonColor !== undefined) nextSection.primaryButtonColor = patch.primaryButtonColor;
    if (patch.buttonShape !== undefined) nextSection.buttonShape = patch.buttonShape;
    if (patch.layout !== undefined) nextSection.layout = patch.layout;

    const updatedPage: PageBuilderConfig = {
      ...targetPage,
      sections: {
        ...targetPage.sections,
        [sectionKey]: nextSection,
      },
      designSnapshots: [snapshot, ...(targetPage.designSnapshots || [])],
      lastModified: Date.now(),
    };

    await pageBuilderFirestore.savePage(updatedPage, db, tenantId);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kos_page_sections_updated', {
          detail: {
            sections: updatedPage.sections,
            globalSettings: updatedPage.globalSettings,
            tenantId,
            pageId: updatedPage.pageId,
          },
        })
      );
    }

    return { success: true, updatedPage };
  } catch (err: any) {
    return { success: false, error: err?.message || 'שגיאה בעדכון האזור' };
  }
}

/**
 * Restores a single page to a specific PageDesignSnapshot (e.g., before bulk style/layout/reset change).
 */
export function restorePageFromSnapshotObject(
  page: PageBuilderConfig,
  snapshot: PageDesignSnapshot
): PageBuilderConfig {
  const nextSections = JSON.parse(JSON.stringify(snapshot.sections || {}));
  return {
    ...page,
    sections: nextSections,
    sectionOrder: Object.keys(nextSections),
    globalSettings: {
      ...(page.globalSettings || {}),
      ...(snapshot.theme ? { theme: snapshot.theme as any } : {}),
    },
    lastModified: Date.now(),
  };
}

/**
 * Restores ALL pages of a tenant from their latest saved PageDesignSnapshot,
 * recovering any previous content, layout, and sections.
 */
export async function restoreAllTenantPagesFromLatestSnapshot(
  db: Firestore | null,
  tenantId: string
): Promise<{ restoredCount: number; totalPages: number; pages: PageBuilderConfig[] }> {
  const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
  const restoredPages: PageBuilderConfig[] = [];

  for (const page of allPages) {
    const snapshots = page.designSnapshots || [];
    if (snapshots.length === 0) continue;

    const latestSnap = snapshots[0];
    const remainingSnapshots = snapshots.slice(1);
    const restored = {
      ...restorePageFromSnapshotObject(page, latestSnap),
      designSnapshots: remainingSnapshots,
    };

    await pageBuilderFirestore.savePage(restored, db, tenantId);
    restoredPages.push(restored);
  }

  if (typeof window !== 'undefined' && restoredPages.length > 0) {
    const activePage = restoredPages.find((p) => p.isHomePage) || restoredPages[0];
    window.dispatchEvent(
      new CustomEvent('kos_page_sections_updated', {
        detail: {
          sections: activePage?.sections,
          globalSettings: activePage?.globalSettings,
          tenantId,
          allPagesRestored: true,
        },
      })
    );
  }

  return {
    restoredCount: restoredPages.length,
    totalPages: allPages.length,
    pages: restoredPages,
  };
}
