import { Firestore } from 'firebase/firestore';
import { TenantStylePreset, BrandDna } from '../../../core/contracts';
import { GlobalPageSettings, PageBuilderConfig, PageDesignSnapshot } from '../types/pageBuilder.types';
import { pageBuilderFirestore } from './pageBuilderFirestore';
import { hydrateSectionWithBrandDna, applyStylePresetToSection } from './brandSectionHydrator';

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
