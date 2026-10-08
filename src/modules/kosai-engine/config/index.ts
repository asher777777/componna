// Layer 2: Config
export const KOSAI_CONFIG = {
  MODULE_ID: 'kosai-engine',
  COLLECTIONS: {
    RULES: 'mod_kosai_rules', // Scoped under tenants/{tenantId}
  },
  DEFAULT_CAPABILITIES: ['ADD_SECTION'] as const,
  UI: {
    DRAWER_WIDTH_COLLAPSED: 380,
    DRAWER_WIDTH_EXPANDED: 600,
  }
};
