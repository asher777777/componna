import { Firestore } from 'firebase/firestore';
import { PageBuilderConfig, PageDesignSnapshot } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { pageBuilderFirestore } from './pageBuilderFirestore';
import { hydrateSectionWithBrandDna } from './brandSectionHydrator';
import { buildDefaultBrandUiVocabulary } from '../../KosBranding/services/brandCopilotService';

export interface PageBrandSyncResult {
  updatedPage: PageBuilderConfig;
  snapshot: PageDesignSnapshot;
  changesCount: number;
}

export interface BulkBrandSyncResult {
  success: boolean;
  totalPages: number;
  updatedCount: number;
  pageTitles: string[];
  error?: string;
}

/**
 * Synchronizes an individual page configuration with the latest Brand DNA & UI Vocabulary.
 * Replaces generic placeholders, button CTAs, and section titles with tailored brand microcopy,
 * while strictly preserving unique section body content, images, and custom items.
 */
export function syncSinglePageWithBrandDna(
  page: PageBuilderConfig,
  brandDna: BrandDna
): PageBrandSyncResult {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const snapshot: PageDesignSnapshot = {
    id: `snap_vocab_${Date.now()}`,
    timestamp: now.toISOString(),
    createdAtFormatted: formattedDate,
    label: 'לפני סנכרון שפת ממשק ומיתוג (UI Vocabulary)',
    preset: (brandDna?.designTokens?.defaultStylePreset as any) || 'standard',
    sections: JSON.parse(JSON.stringify(page.sections || {})),
    theme: page.globalSettings?.theme,
  };

  const uiVocab = brandDna.uiVocabulary || buildDefaultBrandUiVocabulary(brandDna);
  const headings = uiVocab.sectionHeadings || {};
  let changesCount = 0;

  const updatedSections: Record<string, any> = {};

  if (page.sections) {
    for (const [sId, rawSection] of Object.entries(page.sections)) {
      if (!rawSection) continue;
      const s = JSON.parse(JSON.stringify(rawSection));
      const sType = s.type;

      // 1. Re-hydrate section through brandSectionHydrator
      const hydrated = hydrateSectionWithBrandDna(s, brandDna, sType);

      // 2. Intelligent overlay: apply UI vocabulary headings & CTAs
      if (sType === 'hero') {
        if (headings.heroTitle && (!s.title || s.title.includes('הפלטפורמה') || s.title.includes('אתר חדש'))) {
          s.title = headings.heroTitle;
          changesCount++;
        }
        if (headings.heroSubtitle && (!s.subtitle || s.subtitle.includes('מובילה'))) {
          s.subtitle = headings.heroSubtitle;
          changesCount++;
        }
        if (uiVocab.primaryCta && s.primaryButton) {
          s.primaryButton.text = uiVocab.primaryCta;
          changesCount++;
        }
        if (uiVocab.whatsappCta && s.secondaryButton) {
          s.secondaryButton.text = uiVocab.whatsappCta;
          changesCount++;
        }
      } else if (sType === 'contact') {
        if (headings.contactHeading) {
          s.title = headings.contactHeading;
          changesCount++;
        }
        if (headings.contactSubtitle && (!s.subtitle || s.subtitle.includes('נשמח לעמוד'))) {
          s.subtitle = headings.contactSubtitle;
          changesCount++;
        }
        if (uiVocab.formSubmitText) s.submitText = uiVocab.formSubmitText;
        if (uiVocab.namePlaceholder) s.namePlaceholder = uiVocab.namePlaceholder;
        if (uiVocab.phonePlaceholder) s.phonePlaceholder = uiVocab.phonePlaceholder;
        if (uiVocab.emailPlaceholder) s.emailPlaceholder = uiVocab.emailPlaceholder;
        if (uiVocab.messagePlaceholder) s.messagePlaceholder = uiVocab.messagePlaceholder;
      } else if (sType === 'faq') {
        if (headings.faqHeading && (!s.title || s.title === 'שאלות ותשובות' || s.title.includes('נפוצות'))) {
          s.title = headings.faqHeading;
          changesCount++;
        }
        if (headings.faqSubtitle && (!s.subtitle || s.subtitle.includes('כל מה שחשוב'))) {
          s.subtitle = headings.faqSubtitle;
          changesCount++;
        }
      } else if (sType === 'testimonials') {
        if (headings.testimonialsHeading && (!s.title || s.title === 'המלצות' || s.title.includes('לקוחות'))) {
          s.title = headings.testimonialsHeading;
          changesCount++;
        }
        if (headings.testimonialsSubtitle && (!s.subtitle || s.subtitle.includes('מהשטח'))) {
          s.subtitle = headings.testimonialsSubtitle;
          changesCount++;
        }
      } else if (sType === 'features' || sType === 'statsBento') {
        if (headings.advantagesHeading && (!s.title || s.title.includes('למה לבחור'))) {
          s.title = headings.advantagesHeading;
          changesCount++;
        }
        if (headings.advantagesSubtitle && (!s.subtitle || !s.description)) {
          if ('subtitle' in s) s.subtitle = headings.advantagesSubtitle;
          if ('description' in s) s.description = headings.advantagesSubtitle;
          changesCount++;
        }
      } else if (sType === 'community') {
        if (headings.communityHeading) {
          s.title = headings.communityHeading;
          changesCount++;
        }
        if (headings.communitySubtitle) {
          s.subtitle = headings.communitySubtitle;
          changesCount++;
        }
        if (uiVocab.whatsappCta && s.ctaButtonText) {
          s.ctaButtonText = uiVocab.whatsappCta;
          changesCount++;
        }
      } else if (sType === 'imageListing') {
        if (headings.galleryHeading && (!s.title || s.title.includes('גלריי'))) {
          s.title = headings.galleryHeading;
          changesCount++;
        }
      }

      // Replace common button clichés in any section
      if (s.primaryButton && (s.primaryButton.text === 'התחל עכשיו' || s.primaryButton.text === 'לחץ כאן')) {
        s.primaryButton.text = uiVocab.primaryCta || s.primaryButton.text;
        changesCount++;
      }
      if (s.buttonText && (s.buttonText === 'התחל עכשיו' || s.buttonText === 'שלח' || s.buttonText === 'לחץ כאן')) {
        s.buttonText = uiVocab.primaryCta || s.buttonText;
        changesCount++;
      }
      if (s.ctaText && (s.ctaText === 'התחל עכשיו' || s.ctaText === 'קרא עוד')) {
        s.ctaText = uiVocab.primaryCta || s.ctaText;
        changesCount++;
      }

      updatedSections[sId] = s;
    }
  }

  const updatedPage: PageBuilderConfig = {
    ...page,
    sections: updatedSections,
    designSnapshots: [snapshot, ...(page.designSnapshots || [])],
    updatedAt: now.toISOString(),
  };

  return {
    updatedPage,
    snapshot,
    changesCount,
  };
}

/**
 * Bulk updates all existing pages for a given tenant in Firestore,
 * syncing their UI vocabulary, CTAs, and headings with zero data loss.
 */
export async function syncAllTenantPagesWithBrandDna(
  db: Firestore | undefined,
  tenantId: string,
  brandDna: BrandDna
): Promise<BulkBrandSyncResult> {
  try {
    const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
    if (!allPages || allPages.length === 0) {
      return {
        success: true,
        totalPages: 0,
        updatedCount: 0,
        pageTitles: [],
      };
    }

    const updatedTitles: string[] = [];

    for (const page of allPages) {
      const { updatedPage } = syncSinglePageWithBrandDna(page, brandDna);
      await pageBuilderFirestore.savePage(updatedPage, db, tenantId);
      updatedTitles.push(updatedPage.pageTitle || updatedPage.slug || updatedPage.pageId);
    }

    return {
      success: true,
      totalPages: allPages.length,
      updatedCount: updatedTitles.length,
      pageTitles: updatedTitles,
    };
  } catch (err: any) {
    console.error('[pageBrandSyncService] Failed to bulk sync tenant pages:', err);
    return {
      success: false,
      totalPages: 0,
      updatedCount: 0,
      pageTitles: [],
      error: err.message || 'שגיאה בסנכרון העמודים',
    };
  }
}
