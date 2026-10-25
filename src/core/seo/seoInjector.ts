export interface SeoMetadataOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  faviconUrl?: string;
  keywords?: string[];
  canonicalUrl?: string;
  aiBotIndexingEnabled?: boolean;
  aiKnowledgeSummary?: string;
  businessName?: string;
}

/**
 * Universal client-side OpenGraph and Meta tags injector for KOSUN.
 * Ensures that whenever a page, subdomain, or portal loads in browser,
 * the meta tags, open graph tags, twitter tags and favicon are updated dynamically.
 */
export function injectSeoMetadata(options: SeoMetadataOptions): void {
  if (typeof document === 'undefined') return;

  const title = options.title?.trim();
  if (title) {
    document.title = title;
  }

  // Favicon
  if (options.faviconUrl) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = options.faviconUrl;
  }

  // AI Bots / GEO tags
  if (options.aiKnowledgeSummary) {
    let aiMeta: HTMLMetaElement | null = document.querySelector("meta[name='ai-knowledge-summary']");
    if (!aiMeta) {
      aiMeta = document.createElement('meta');
      aiMeta.name = 'ai-knowledge-summary';
      document.head.appendChild(aiMeta);
    }
    aiMeta.content = options.aiKnowledgeSummary;
  }

  // Robots
  let robotsMeta: HTMLMetaElement | null = document.querySelector("meta[name='robots']");
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.content = options.aiBotIndexingEnabled !== false
    ? 'index, follow, max-image-preview:large, max-snippet:-1'
    : 'noindex, nofollow';

  const setMeta = (attrName: 'name' | 'property', attrValue: string, contentValue?: string) => {
    if (!contentValue) return;
    let el: HTMLMetaElement | null = document.querySelector(`meta[${attrName}='${attrValue}']`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.content = contentValue;
  };

  const finalTitle = title || options.businessName || 'KOSUN';
  const desc = options.description?.trim() || '';
  const img = options.ogImage?.trim() || '';
  const currentUrl = options.canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  // Open Graph
  setMeta('property', 'og:title', finalTitle);
  if (desc) setMeta('property', 'og:description', desc);
  if (img) setMeta('property', 'og:image', img);
  setMeta('property', 'og:type', 'website');
  if (currentUrl) setMeta('property', 'og:url', currentUrl);

  // Twitter Cards
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', finalTitle);
  if (desc) setMeta('name', 'twitter:description', desc);
  if (img) setMeta('name', 'twitter:image', img);

  // Standard Description & Keywords
  if (desc) {
    setMeta('name', 'description', desc);
  }
  if (options.keywords && options.keywords.length > 0) {
    setMeta('name', 'keywords', options.keywords.join(', '));
  }
}
