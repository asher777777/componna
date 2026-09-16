import { PageBuilderConfig } from '../../page-builder/types/pageBuilder.types';

export interface ExtractedPageSummary {
  pageId: string;
  pageTitle: string;
  slug: string;
  companyName?: string;
  slogan?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaText?: string;
  services: Array<{ title: string; description?: string; badge?: string }>;
  faqItems: Array<{ question: string; answer: string; category?: string }>;
  testimonials: Array<{ name: string; content: string; rating?: number }>;
  pricingPackages: Array<{ name: string; price: string; features: string[] }>;
  stats: Array<{ number: string; label: string; description?: string }>;
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
  };
  formFields: Array<{ label: string; type: string }>;
  sectionsSummaryText: string;
}

/**
 * Extracts and synthesizes all structured marketing & sales content from a PageBuilder page
 */
export function extractPageContentForVideo(page: PageBuilderConfig): ExtractedPageSummary {
  const sections = page.sections || {};
  const order = page.sectionOrder || Object.keys(sections);

  let heroHeadline = '';
  let heroSubheadline = '';
  let heroCtaText = '';
  const services: Array<{ title: string; description?: string; badge?: string }> = [];
  const faqItems: Array<{ question: string; answer: string; category?: string }> = [];
  const testimonials: Array<{ name: string; content: string; rating?: number }> = [];
  const pricingPackages: Array<{ name: string; price: string; features: string[] }> = [];
  const stats: Array<{ number: string; label: string; description?: string }> = [];
  const formFields: Array<{ label: string; type: string }> = [];
  const textBlocks: string[] = [];

  textBlocks.push(`=== כותרת העמוד: ${page.pageTitle} (${page.slug}) ===`);
  if (page.globalSettings?.companyName) {
    textBlocks.push(`שם הארגון/חברה: ${page.globalSettings.companyName}`);
  }
  if (page.globalSettings?.slogan) {
    textBlocks.push(`סלוגן: ${page.globalSettings.slogan}`);
  }

  order.forEach((secId) => {
    const sec = sections[secId];
    if (!sec || sec.visible === false) return;

    switch (sec.type) {
      case 'hero':
        heroHeadline = sec.title || '';
        heroSubheadline = sec.subtitle || sec.description || '';
        heroCtaText = sec.primaryButton?.text || '';
        textBlocks.push(`\n[סקשן ראשי / Hero]:`);
        textBlocks.push(`כותרת ראשית: ${sec.title}`);
        if (sec.subtitle) textBlocks.push(`כותרת משנה: ${sec.subtitle}`);
        if (sec.description) textBlocks.push(`תיאור: ${sec.description}`);
        if (sec.primaryButton?.text) textBlocks.push(`כפתור הנעה לפעולה: ${sec.primaryButton.text}`);
        break;

      case 'services':
        textBlocks.push(`\n[שירותים ומוצרים / Services]:`);
        if (sec.title) textBlocks.push(`כותרת הסקשן: ${sec.title}`);
        (sec.items || []).forEach((item: any) => {
          services.push({
            title: item.title,
            description: item.description,
            badge: item.badge,
          });
          textBlocks.push(`• ${item.title}: ${item.description || ''} ${item.badge ? `[תגית: ${item.badge}]` : ''}`);
        });
        break;

      case 'faq':
        textBlocks.push(`\n[שאלות נפוצות ותשובות / FAQ]:`);
        (sec.items || []).forEach((item: any) => {
          faqItems.push({
            question: item.question,
            answer: item.answer,
            category: item.category,
          });
          textBlocks.push(`❓ שאלה: ${item.question}\n   תשובה: ${item.answer}`);
        });
        break;

      case 'testimonials':
        textBlocks.push(`\n[המלצות וסיפורי לקוחות / Testimonials]:`);
        (sec.items || []).forEach((item: any) => {
          testimonials.push({
            name: item.name,
            content: item.content,
            rating: item.rating,
          });
          textBlocks.push(`⭐ ${item.name}: "${item.content}"`);
        });
        break;

      case 'pricing':
        textBlocks.push(`\n[חבילות ומחירים / Pricing]:`);
        (sec.packages || []).forEach((pkg: any) => {
          pricingPackages.push({
            name: pkg.name,
            price: pkg.priceMonthly || pkg.priceYearly || '',
            features: pkg.features || [],
          });
          textBlocks.push(`💎 חבילה: ${pkg.name} | מחיר: ${pkg.priceMonthly || ''} | יתרונות: ${(pkg.features || []).join(', ')}`);
        });
        break;

      case 'statsBento':
        (sec.stats || []).forEach((st: any) => {
          stats.push({
            number: `${st.number || ''}${st.suffix || ''}`,
            label: st.label,
            description: st.description,
          });
          textBlocks.push(`📊 נתון: ${st.number}${st.suffix || ''} - ${st.label}`);
        });
        break;

      case 'landingSection':
        if (sec.title) textBlocks.push(`\n[טופס הרשמה/נחיתה]: ${sec.title}`);
        (sec.fields || []).forEach((f: any) => {
          formFields.push({ label: f.label, type: f.type });
        });
        break;

      case 'contact':
        textBlocks.push(`\n[פרטי יצירת קשר]:`);
        if (sec.phone) textBlocks.push(`טלפון: ${sec.phone}`);
        if (sec.whatsapp) textBlocks.push(`וואטסאפ: ${sec.whatsapp}`);
        if (sec.email) textBlocks.push(`אימייל: ${sec.email}`);
        if (sec.address) textBlocks.push(`כתובת: ${sec.address}`);
        break;

      case 'community':
        if (sec.title) textBlocks.push(`\n[קהילה והצטרפות]: ${sec.title} - ${sec.description || ''}`);
        break;

      case 'mainContent':
        if (sec.title) textBlocks.push(`\n[תוכן מרכזי/קורס]: ${sec.title} - ${sec.subtitle || ''}`);
        if (sec.features) textBlocks.push(`דגשים: ${(sec.features || []).join(', ')}`);
        break;
    }
  });

  const contact = {
    phone: sections.contact?.phone || page.globalSettings?.contactPhone,
    email: sections.contact?.email || page.globalSettings?.contactEmail,
    whatsapp: sections.contact?.whatsapp || page.globalSettings?.contactWhatsApp,
    address: sections.contact?.address || page.globalSettings?.address,
  };

  return {
    pageId: page.pageId,
    pageTitle: page.pageTitle,
    slug: page.slug,
    companyName: page.globalSettings?.companyName,
    slogan: page.globalSettings?.slogan,
    heroHeadline,
    heroSubheadline,
    heroCtaText,
    services,
    faqItems,
    testimonials,
    pricingPackages,
    stats,
    contact,
    formFields,
    sectionsSummaryText: textBlocks.join('\n'),
  };
}
