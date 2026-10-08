export const PAGE_BUILDER_MODULE_CONFIG = {
  id: 'page-builder',
  name: 'יוצר עמודים ואתרים',
  version: '2.0.0',
  storagePrefix: 'kosun_pages_',
  collections: {
    pages: 'mod_pages_documents',
    templates: 'mod_pages_templates',
    analytics: 'mod_pages_analytics'
  },
  defaults: {
    theme: 'modern' as const,
    primaryColor: '#6366f1',
    secondaryColor: '#0ea5e9',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    fontFamily: 'Heebo, sans-serif',
    borderRadius: 'md' as const,
    buttonStyle: 'gradient' as const,
  },
  ai: {
    defaultModel: 'gemini-3.8-flash',
    fallbackSectionsCount: 6,
    streamingStepDelayMs: 450,
  }
};

export default PAGE_BUILDER_MODULE_CONFIG;
