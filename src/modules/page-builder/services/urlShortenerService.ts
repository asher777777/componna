export interface ShortUrlResult {
  shortSlug: string;
  shortUrl: string;
  domain: string;
  fullTargetUrl: string;
  qrCodeUrl: string;
  suggestedSlugs: string[];
}

export const urlShortenerService = {
  // Generate smart slug ideas based on title and keywords
  generateSmartSlugs(title: string, companyName?: string, category?: string): string[] {
    const cleanHebrewToLatinMap: Record<string, string> = {
      'קורס': 'course',
      'תרומות': 'fund',
      'קהילה': 'community',
      'כנס': 'summit',
      'אירוע': 'event',
      'השקה': 'launch',
      'שירותים': 'pro',
      'מבצע': 'deal',
      'סדנה': 'workshop',
      'פודקאסט': 'podcast',
      'דיגיטל': 'digital',
      'נדלן': 'realestate',
      'סייבר': 'cyber',
      'חינוך': 'edu',
      'חסד': 'care',
      'עסקים': 'biz',
    };

    const words = (title || 'vip page').toLowerCase().split(/[\s,._-]+/);
    const latinParts: string[] = [];

    for (const w of words) {
      if (cleanHebrewToLatinMap[w]) {
        latinParts.push(cleanHebrewToLatinMap[w]);
      } else if (/^[a-z0-9]+$/i.test(w)) {
        latinParts.push(w.toLowerCase());
      }
    }

    if (latinParts.length === 0) {
      latinParts.push('vip', 'landing');
    }

    const basePrefix = latinParts.slice(0, 2).join('-');
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 5);

    return [
      `${basePrefix}-${year}`,
      `${basePrefix}-go`,
      `${basePrefix}-vip`,
      `${basePrefix}-${randomHex}`,
      `${latinParts[0] || 'page'}-live`,
    ];
  },

  // Create a full shortened URL object
  createShortUrl(pageTitle: string, pageSlug: string, customSlug?: string): ShortUrlResult {
    const suggestions = this.generateSmartSlugs(pageTitle);
    const chosenSlug = customSlug?.trim() || suggestions[0] || pageSlug;
    const domain = 'cmn.to';
    const shortUrl = `https://${domain}/${chosenSlug}`;
    
    // Resolve target URL
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.comona.io';
    const fullTargetUrl = `${origin}/p/${pageSlug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(shortUrl)}&bgcolor=0f172a&color=6366f1&margin=15`;

    return {
      shortSlug: chosenSlug,
      shortUrl,
      domain,
      fullTargetUrl,
      qrCodeUrl,
      suggestedSlugs: suggestions,
    };
  },
};
