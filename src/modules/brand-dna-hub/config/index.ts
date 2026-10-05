/**
 * Brand DNA Hub Configuration
 * Scoped collection names and module metadata
 */

export const MODULE_ID = 'brand-dna-hub';

export const DEFAULT_COLLECTION_PREFIX = 'brand_dna_';

export const DEFAULT_COLLECTIONS = {
  settings: 'settings',
  snapshots: 'snapshots',
};

export const BRAND_DNA_DOC_ID = 'brand_dna_settings';

export interface BrandDnaCollectionsConfig {
  settings?: string;
  snapshots?: string;
}

export function resolveCollections(
  prefix: string = DEFAULT_COLLECTION_PREFIX,
  overrides?: BrandDnaCollectionsConfig
): { settings: string; snapshots: string } {
  return {
    settings: overrides?.settings || `${prefix}${DEFAULT_COLLECTIONS.settings}`,
    snapshots: overrides?.snapshots || `${prefix}${DEFAULT_COLLECTIONS.snapshots}`,
  };
}

export const BRAND_DNA_CONFIG_DEFAULTS = {
  moduleId: MODULE_ID,
  defaultSlug: '/brand-dna',
  defaultTitle: 'מרכז מיתוג גלובלי (Brand DNA & AI)',
  collectionPrefix: DEFAULT_COLLECTION_PREFIX,
  storageKey: 'comona_brand_dna_settings',
};
