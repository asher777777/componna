import { TemplateCollectionsConfig } from '../types';

export const DEFAULT_COLLECTION_PREFIX = 'mod_template_';

export const DEFAULT_COLLECTIONS = {
  items: 'items',
  logs: 'logs',
};

export function resolveCollections(
  prefix: string = DEFAULT_COLLECTION_PREFIX,
  overrides?: TemplateCollectionsConfig
): { items: string; logs: string } {
  return {
    items: overrides?.items || `${prefix}${DEFAULT_COLLECTIONS.items}`,
    logs: overrides?.logs || `${prefix}${DEFAULT_COLLECTIONS.logs}`,
  };
}
