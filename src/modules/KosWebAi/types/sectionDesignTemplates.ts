import { SectionType } from '../types/pageBuilder.types';
import { TenantStylePreset } from '../../../core/contracts';

/**
 * Public Section Design Template
 * Stored in Firestore under the public system space:
 * `system_public_section_designs/{designId}` or `tenants/_public/section_designs/{designId}`
 */
export interface PublicSectionDesignTemplate {
  id: string; // e.g. `des_hero_feminine_1719283921`
  sectionType: SectionType; // e.g. 'hero', 'dynamicListing', 'decorativeDivider'
  stylePreset: TenantStylePreset; // 'feminine' | 'masculine' | 'standard' | 'spiritual' | 'sharp' | 'analytical'
  name: string; // e.g. "פריסה נשית עם זוהר גלוי וכפתורי קפסולה"
  description?: string;
  authorTenantId: string; // Tenant ID that created or saved this design
  authorName?: string;
  createdAt: string; // ISO string
  updatedAt: string;
  previewThumbnailUrl?: string; // Optional preview snapshot
  tags?: string[];
  isOfficial?: boolean; // Official system template

  // Pure design tokens & layout configuration (Stripped of specific client textual content)
  designConfig: Record<string, any>;
}

/**
 * Common content fields that must NOT be saved into a public reusable design template
 */
export const CONTENT_FIELDS_TO_STRIP: string[] = [
  'title',
  'subtitle',
  'description',
  'descriptionHtml',
  'badge',
  'heading',
  'body',
  'excerpt',
  'phone',
  'email',
  'whatsapp',
  'address',
  'companyName',
  'businessName',
  'legalName',
  'contactName',
  'seoTitle',
  'seoDescription',
  'searchPlaceholder',
  'singlePageId', // do not lock to specific page
];

/**
 * Extracts pure design, layout, styling, shapes, colors and behavioral rules from a section config.
 * Preserves buttons layout/styling while resetting text to standard action labels.
 */
export function extractSectionDesign(
  sectionConfig: Record<string, any>,
  targetPreset?: TenantStylePreset
): Record<string, any> {
  if (!sectionConfig) return {};
  const cloned = JSON.parse(JSON.stringify(sectionConfig));

  // Determine preset from config or fallback
  const effPreset: TenantStylePreset =
    targetPreset ||
    cloned.stylePreset ||
    (cloned.layout && ['feminine', 'masculine', 'spiritual', 'sharp', 'analytical', 'standard'].includes(cloned.layout)
      ? cloned.layout
      : 'standard');

  cloned.stylePreset = effPreset;

  // 1. Delete content/identity/PII keys
  for (const field of CONTENT_FIELDS_TO_STRIP) {
    delete cloned[field];
  }

  // 2. Clean items if section has items: keep layout structure/shapes/styling, clean specific texts
  if (Array.isArray(cloned.items)) {
    // Keep at most 3-4 placeholder styled items for structural layout reference
    cloned.items = cloned.items.slice(0, 4).map((item: any, idx: number) => {
      const cleanedItem = { ...item };
      delete cleanedItem.title;
      delete cleanedItem.subtitle;
      delete cleanedItem.excerpt;
      delete cleanedItem.date;
      delete cleanedItem.price;
      delete cleanedItem.linkUrl;
      return cleanedItem;
    });
  }

  // Clean categories items
  if (Array.isArray(cloned.categories)) {
    cloned.categories = cloned.categories.map((c: any) => {
      const cleaned = { ...c };
      delete cleaned.title;
      delete cleaned.subtitle;
      delete cleaned.linkUrl;
      return cleaned;
    });
  }

  // Clean button texts but preserve shapes, styles, colors and targets
  if (cloned.primaryButton && typeof cloned.primaryButton === 'object') {
    delete cloned.primaryButton.text;
  }
  if (cloned.secondaryButton && typeof cloned.secondaryButton === 'object') {
    delete cloned.secondaryButton.text;
  }

  // Remove individual page binding or specific filters
  delete cloned.singlePageId;

  return cloned;
}

/**
 * Merges a saved pure design template onto an existing section without erasing the user's content!
 */
export function applySectionDesignTemplate(
  existingSection: Record<string, any>,
  templateDesign: Record<string, any>
): Record<string, any> {
  if (!templateDesign) return existingSection;
  const merged = { ...existingSection };

  // Copy design properties from template
  for (const [key, val] of Object.entries(templateDesign)) {
    if (CONTENT_FIELDS_TO_STRIP.includes(key)) continue;
    // Don't overwrite existing items with empty template items
    if (key === 'items' && Array.isArray(merged.items) && merged.items.length > 0) continue;
    if (key === 'categories' && Array.isArray(merged.categories) && merged.categories.length > 0) continue;

    if (key === 'primaryButton' && typeof val === 'object' && val !== null) {
      merged.primaryButton = {
        ...(merged.primaryButton || {}),
        ...val,
        text: merged.primaryButton?.text || '', // preserve text
      };
      continue;
    }

    if (key === 'secondaryButton' && typeof val === 'object' && val !== null) {
      merged.secondaryButton = {
        ...(merged.secondaryButton || {}),
        ...val,
        text: merged.secondaryButton?.text || '', // preserve text
      };
      continue;
    }

    merged[key] = val;
  }

  return merged;
}
