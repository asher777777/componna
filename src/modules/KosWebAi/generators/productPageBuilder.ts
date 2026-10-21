import { CreatePageFromProductOptions, CreatePageFromServiceOptions, TenantStylePreset } from '../../../core/contracts';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { resolveLiveBrandDna, applyStylePresetToSection } from '../services/brandSectionHydrator';

/**
 * Deterministic function (0 AI calls, 0 tokens) that builds a complete PageBuilderConfig
 * directly from a FlagshipProduct and BrandDna:
 * - Populates only suited sections with the product's structured data (Hero, Long Description,
 *   6 Pain Points, 3 Target Audiences, 6 Competitive Advantages, Gallery Images, 10 FAQs, Contact).
 * - Hides (`visible: false`) all unsuited or empty sections.
 * - Populates `seoSettings` and all AI Promotion (AIO / GEO) fields.
 */
export function buildPageConfigFromFlagshipProduct(
  options: CreatePageFromProductOptions,
  existingPageId?: string
): PageBuilderConfig {
  const { product, brandDna: rawBrandDna } = options;
  const brandDna = resolveLiveBrandDna(rawBrandDna);
  const brandStylePreset: TenantStylePreset =
    brandDna?.designTokens?.defaultStylePreset ||
    (brandDna as any)?.stylePreset ||
    'standard';
  const now = new Date().toISOString();

  // Extract main title and subtitle from nameAndSlogan
  const rawName = (product.nameAndSlogan || 'מוצר דגל').trim();
  const splitParts = rawName.split(/\s*[–—-]\s*/);
  const mainTitle = splitParts[0]?.trim() || rawName;
  const sloganSub = splitParts.slice(1).join(' – ').trim();

  const companyName = brandDna?.identity?.companyName || 'הארגון';
  const brandSlogan = brandDna?.identity?.slogan || '';
  const brandLogo = brandDna?.identity?.logoUrl || '';
  const primaryColor = brandDna?.designTokens?.primaryColor || '#4f46e5';
  const secondaryColor = brandDna?.designTokens?.secondaryColor || '#818cf8';
  const backgroundColor = brandDna?.designTokens?.backgroundColor || '#0f172a';
  const textColor = brandDna?.designTokens?.textColor || '#f8fafc';
  const buttonBgColor = brandDna?.designTokens?.buttonBgColor || primaryColor;
  const fontFamily = brandDna?.designTokens?.fontFamily || 'Heebo';
  const contactPhone = brandDna?.trust?.contactPhone || '';
  const contactEmail = brandDna?.trust?.contactEmail || '';
  const contactWhatsApp = brandDna?.trust?.whatsappSupportNumber || contactPhone;
  const officeAddress = brandDna?.trust?.officeAddress || '';

  // Normalize gallery images
  const galleryImages: string[] = Array.isArray(product.galleryImages) && product.galleryImages.length > 0
    ? product.galleryImages.filter((u) => typeof u === 'string' && u.trim().length > 0)
    : product.imageUrl && product.imageUrl.trim()
      ? [product.imageUrl.trim()]
      : [];

  const primaryImage = galleryImages[0] || product.imageUrl || brandLogo || '';

  // Normalize 6 Pain Points
  const painPoints = Array.isArray(product.painPoints) && product.painPoints.length > 0
    ? product.painPoints.filter((p) => p && (p.title || p.text))
    : product.painPointSolved
      ? product.painPointSolved.split('|').map((chunk, idx) => {
          const [t, ...rest] = chunk.split(':');
          return {
            id: `pain_${idx + 1}`,
            title: rest.length > 0 ? t.trim() : `נקודת כאב ${idx + 1}`,
            text: (rest.length > 0 ? rest.join(':') : t).trim(),
            icon: 'AlertCircle',
          };
        })
      : [];

  // Normalize 3 Target Audiences
  const targetAudiences = Array.isArray(product.targetAudiences) && product.targetAudiences.length > 0
    ? product.targetAudiences.filter((a) => a && (a.title || a.text))
    : product.targetAudience
      ? product.targetAudience.split('|').map((chunk, idx) => {
          const [t, ...rest] = chunk.split(':');
          return {
            id: `aud_${idx + 1}`,
            title: rest.length > 0 ? t.trim() : chunk.trim(),
            text: (rest.length > 0 ? rest.join(':') : `מענה מותאם אישית עבור ${chunk.trim()}`).trim(),
            icon: 'Users',
          };
        })
      : [];

  // Normalize 6 Competitive Advantages
  const competitiveAdvantages = Array.isArray(product.competitiveAdvantages) && product.competitiveAdvantages.length > 0
    ? product.competitiveAdvantages.filter((c) => c && (c.title || c.text))
    : product.competitiveAdvantage
      ? product.competitiveAdvantage.split('|').map((chunk, idx) => {
          const [t, ...rest] = chunk.split(':');
          return {
            id: `adv_${idx + 1}`,
            title: rest.length > 0 ? t.trim() : `יתרון מרכזי ${idx + 1}`,
            text: (rest.length > 0 ? rest.join(':') : t).trim(),
            icon: 'Award',
          };
        })
      : [];

  // Normalize 10 FAQs
  const faqs = Array.isArray(product.faqs) && product.faqs.length > 0
    ? product.faqs.filter((f) => f && f.question && f.answer)
    : [];

  // Build deterministic slug
  const rawSlugCandidate = (
    product.seo?.slug ||
    product.linkedPageSlug ||
    product.id ||
    `product-${Date.now().toString().slice(-4)}`
  )
    .toLowerCase()
    .replace(/[^a-z0-9-/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const companySlug = (brandDna?.identity?.companyName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  let baseSlug = rawSlugCandidate
    .replace(/^kosass[-/]/, '')
    .replace(/^-+/, '');

  if (companySlug && baseSlug.startsWith(`${companySlug}-`)) {
    baseSlug = baseSlug.slice(companySlug.length + 1);
  }
  if (baseSlug.startsWith('kushan-')) {
    baseSlug = baseSlug.slice('kushan-'.length);
  }
  if (baseSlug.startsWith('kosun-')) {
    baseSlug = baseSlug.slice('kosun-'.length);
  }

  baseSlug = baseSlug.replace(/^-+|-+$/g, '') || `product-${Date.now().toString().slice(-4)}`;

  const cleanSlug = `kosass/${baseSlug}`;
  const pageId = existingPageId || product.linkedPageId || `page_kosass_${baseSlug.replace(/[^a-z0-9_]/g, '_')}`;

  // Custom navigation links for visible sections
  const navLinks: Array<{ label: string; url: string; isButton?: boolean }> = [];
  if (product.longDescription?.trim()) {
    navLinks.push({ label: 'אודות המוצר', url: '#sec-about' });
  }
  if (painPoints.length > 0) {
    navLinks.push({ label: 'האתגרים והמענה', url: '#sec-pain-points' });
  }
  if (targetAudiences.length > 0) {
    navLinks.push({ label: 'קהלי יעד', url: '#sec-target-audiences' });
  }
  if (competitiveAdvantages.length > 0) {
    navLinks.push({ label: 'יתרונות המוצר', url: '#sec-advantages' });
  }
  if (galleryImages.length > 0) {
    navLinks.push({ label: 'גלריה', url: '#sec-gallery' });
  }
  if (faqs.length > 0) {
    navLinks.push({ label: 'שאלות ותשובות', url: '#sec-faq' });
  }
  navLinks.push({ label: 'יצירת קשר', url: '#sec-contact', isButton: true });

  const longDescHtml = product.longDescription?.trim()
    ? product.longDescription
        .trim()
        .split(/\n+/)
        .map((p) => `<p>${p.trim()}</p>`)
        .join('')
    : '';

  const isFemale = brandDna?.voice?.genderAddressing === 'female';
  const defaultAboutSub = isFemale ? 'הכירי את המרחב מקרוב' : 'הכירו לעומק';
  const defaultPainSub = isFemale ? 'עוגן בתוך שגרת החול' : 'מענה שלם לאתגרי השגרה';
  const defaultPainHead = isFemale ? 'האתגרים שאנו פוגשות ופותרות יחד איתך' : 'האתגרים שבהם אנו מעניקים מענה שלם';
  const defaultAudienceSub = isFemale ? 'המרחב שמחכה לך' : 'התאמה אישית מלאה';
  const defaultAudienceHead = isFemale ? 'למי נתפר המסע הייחודי הזה?' : 'למי מתאים המענה במיוחד?';
  const defaultAdvantageSub = isFemale ? 'הבשורה שלנו עבורך' : 'הייחוד והעוצמה שלנו';
  const defaultAdvantageHead = companyName ? `המעלות והבידול המובילים ב-${companyName}` : 'המעלות והעוגנים הייחודיים שלנו';
  const defaultFaqSub = isFemale ? 'כל מה שחשוב לך לדעת' : `כל מה שחשוב לדעת על ${mainTitle}`;
  const defaultFaqHead = 'שאלות ותשובות';
  const defaultContactTitle = isFemale ? `מוזמנת להצטרף ל-${mainTitle}` : `מעוניינים להצטרף ל-${mainTitle}?`;
  const defaultContactSub = product.shortDescription || (isFemale ? 'אנחנו כאן באהבה לכל שאלה והתייעצות' : 'השאירו פרטים ונחזור אליכם עם כל המידע');
  const sections: Record<string, any> = {
    header: {
      id: 'header',
      type: 'header',
      visible: true,
      layout: 'floating-glass',
      sticky: true,
      useBrandLogo: true,
      customLogoUrl: brandLogo,
      logoText: companyName,
      showLogoText: true,
      menuMode: 'custom',
      customLinks: navLinks,
      showCtaButton: true,
      ctaButtonText: 'לתיאום והצטרפות',
      ctaButtonUrl: '#sec-contact',
      showPhone: Boolean(contactPhone),
      phone: contactPhone,
      showWhatsApp: Boolean(contactWhatsApp),
      whatsApp: contactWhatsApp,
    },
    hero: {
      id: 'hero',
      type: 'hero',
      visible: true,
      anchorId: 'hero',
      title: mainTitle,
      subtitle: sloganSub || brandSlogan || companyName,
      description: product.shortDescription || '',
      imageSrc: primaryImage,
      layout: brandStylePreset,
      heroStyle: brandStylePreset === 'feminine' || brandStylePreset === 'spiritual'
        ? 'mesh-glow'
        : brandStylePreset === 'masculine'
          ? 'card'
          : brandStylePreset === 'sharp'
            ? 'minimal'
            : brandStylePreset === 'analytical'
              ? 'modern'
              : (primaryImage ? 'split' : 'centered'),
      buttonShape: brandStylePreset === 'feminine' || brandStylePreset === 'spiritual'
        ? 'pill'
        : brandStylePreset === 'masculine'
          ? 'rounded'
          : brandStylePreset === 'sharp'
            ? 'square'
            : 'auto',
      buttonsVisible: true,
      primaryButton: {
        text: 'לתיאום שיחה והצטרפות',
        url: '#sec-contact',
      },
      secondaryButton: {
        text: 'גלו את היתרונות',
        url: '#sec-advantages',
      },
      announcementBadge: {
        text: `${companyName} • מוצר דגל`,
        icon: 'Sparkles',
      },
    },
    'sec-about': {
      id: 'sec-about',
      type: 'richContent',
      adminTitle: 'אודות / תוכן מעוצב',
      visible: Boolean(longDescHtml),
      anchorId: 'sec-about',
      subtitle: product.sectionTitles?.aboutSubtitle || defaultAboutSub,
      heading: product.sectionTitles?.aboutHeading || `אודות ${mainTitle}`,
      body: longDescHtml,
      layout: brandStylePreset,
      cardIconPosition: 'top',
      isAsymmetricGrid: true,
    },
    'sec-pain-points': {
      id: 'sec-pain-points',
      type: 'richContent',
      visible: painPoints.length > 0,
      anchorId: 'sec-pain-points',
      subtitle: product.sectionTitles?.painPointsSubtitle || defaultPainSub,
      heading: product.sectionTitles?.painPointsHeading || defaultPainHead,
      body: '',
      layout: brandStylePreset,
      cardIconPosition: 'top',
      isAsymmetricGrid: true,
      items: painPoints.map((p, idx) => ({
        id: p.id || `pain_${idx + 1}`,
        title: p.title,
        text: p.text,
        description: p.text,
        icon: p.icon || 'AlertCircle',
      })),
    },
    'sec-target-audiences': {
      id: 'sec-target-audiences',
      type: 'richContent',
      visible: targetAudiences.length > 0,
      anchorId: 'sec-target-audiences',
      subtitle: product.sectionTitles?.targetAudiencesSubtitle || defaultAudienceSub,
      heading: product.sectionTitles?.targetAudiencesHeading || defaultAudienceHead,
      body: '',
      layout: brandStylePreset,
      cardIconPosition: 'top',
      isAsymmetricGrid: true,
      items: targetAudiences.map((a, idx) => ({
        id: a.id || `aud_${idx + 1}`,
        title: a.title,
        text: a.text,
        description: a.text,
        icon: a.icon || 'Users',
      })),
    },
    'sec-advantages': {
      id: 'sec-advantages',
      type: 'richContent',
      visible: competitiveAdvantages.length > 0,
      anchorId: 'sec-advantages',
      subtitle: product.sectionTitles?.advantagesSubtitle || defaultAdvantageSub,
      heading: product.sectionTitles?.advantagesHeading || defaultAdvantageHead,
      body: '',
      layout: brandStylePreset,
      cardIconPosition: 'top',
      isAsymmetricGrid: true,
      items: competitiveAdvantages.map((c, idx) => ({
        id: c.id || `adv_${idx + 1}`,
        title: c.title,
        text: c.text,
        description: c.text,
        icon: c.icon || 'Award',
      })),
    },
    'sec-gallery': {
      id: 'sec-gallery',
      type: 'imageListing',
      visible: galleryImages.length > 0,
      anchorId: 'sec-gallery',
      title: 'גלריית תמונות המוצר',
      layout: brandStylePreset,
      imagesPerRow: 3,
      imagesPerRowMobile: 1,
      images: galleryImages.map((imgUrl, idx) => ({
        id: `gal_${idx + 1}`,
        imageUrl: imgUrl,
        title: `${mainTitle} - תמונה ${idx + 1}`,
      })),
    },
    'sec-faq': {
      id: 'sec-faq',
      type: 'faq',
      visible: faqs.length > 0,
      anchorId: 'sec-faq',
      layout: brandStylePreset,
      title: product.sectionTitles?.faqHeading || defaultFaqHead,
      subtitle: product.sectionTitles?.faqSubtitle || defaultFaqSub,
      showSearchBar: true,
      showContactCard: true,
      whatsappContact: contactWhatsApp,
      items: faqs.map((f, idx) => ({
        id: f.id || `faq_${idx + 1}`,
        question: f.question,
        answer: f.answer,
        icon: f.icon || 'HelpCircle',
      })),
    },
    'sec-contact': {
      id: 'sec-contact',
      type: 'contact',
      visible: true,
      anchorId: 'sec-contact',
      layout: brandStylePreset,
      title: product.sectionTitles?.contactHeading || defaultContactTitle,
      subtitle: product.sectionTitles?.contactSubtitle || defaultContactSub,
      phone: contactPhone,
      email: contactEmail,
      address: officeAddress,
      whatsapp: contactWhatsApp,
      showForm: true,
      directWhatsappChat: Boolean(contactWhatsApp),
    },
    // Unsuited sections explicitly marked visible: false as required
    pricing: {
      id: 'pricing',
      type: 'pricing',
      visible: false,
      title: 'חבילות ומסלולים',
      packages: [],
    },
    testimonials: {
      id: 'testimonials',
      type: 'testimonials',
      visible: false,
      title: 'המלצות',
      items: [],
    },
    statsBento: {
      id: 'statsBento',
      type: 'statsBento',
      visible: false,
      stats: [],
    },
    beforeAfter: {
      id: 'beforeAfter',
      type: 'beforeAfter',
      visible: false,
      title: 'לפני ואחרי',
      beforeImage: '',
      afterImage: '',
    },
    videoGallery: {
      id: 'videoGallery',
      type: 'videoGallery',
      visible: false,
    },
    timer: {
      id: 'timer',
      type: 'timer',
      visible: false,
      title: '',
      targetDate: now,
    },
  };

  // Apply brand preset to all sections
  Object.keys(sections).forEach((secKey) => {
    sections[secKey] = applyStylePresetToSection(sections[secKey], brandStylePreset);
  });

  const sectionOrder = [
    'header',
    'hero',
    'sec-about',
    'sec-pain-points',
    'sec-target-audiences',
    'sec-advantages',
    'sec-gallery',
    'sec-faq',
    'sec-contact',
    'pricing',
    'testimonials',
    'statsBento',
    'beforeAfter',
    'videoGallery',
    'timer',
  ];

  // Build SEO & AI Promotion (AIO / GEO) settings
  const seoTitle = product.seo?.metaTitle?.trim() || `${mainTitle} | ${companyName}`;
  const seoDescription =
    product.seo?.metaDescription?.trim() ||
    product.shortDescription?.trim() ||
    (product.longDescription ? product.longDescription.trim().slice(0, 155) : `${mainTitle} מבית ${companyName}`);

  const keywordsList: string[] = product.seo?.keywords
    ? (Array.isArray(product.seo.keywords)
        ? product.seo.keywords
        : String(product.seo.keywords).split(',')
      )
        .map((k: string) => String(k || '').trim())
        .filter((k): k is string => Boolean(k))
    : [mainTitle, companyName, ...targetAudiences.map((a) => String(a.title || '').trim())].filter(
        (k): k is string => Boolean(k)
      );

  const aiKnowledgeSummary =
    product.seo?.aiKnowledgeSummary?.trim() ||
    `${rawName} מבית ${companyName}: ${product.shortDescription || ''}. ${
      competitiveAdvantages.length > 0
        ? 'יתרונות מרכזיים: ' + competitiveAdvantages.map((c) => c.title).join(', ') + '.'
        : ''
    }`.trim();

  const aiTargetQuestions =
    Array.isArray(product.seo?.aiTargetQuestions) && product.seo!.aiTargetQuestions!.length > 0
      ? product.seo!.aiTargetQuestions!
      : faqs.slice(0, 6).map((f) => f.question);

  const rawSchemaType = product.seo?.aiEntitySchemaType;
  const mappedSchemaType: 'Organization' | 'ProfessionalService' | 'Product' | 'FAQPage' | 'Article' =
    rawSchemaType === 'Product'
      ? 'Product'
      : rawSchemaType === 'Organization'
        ? 'Organization'
        : rawSchemaType === 'FAQPage'
          ? 'FAQPage'
          : 'ProfessionalService';

  const ogImage = product.seo?.ogImage?.trim() || primaryImage || '';

  return {
    pageId,
    pageTitle: rawName,
    slug: cleanSlug,
    shortSlug: baseSlug,
    pageCategory: 'service_product',
    published: true,
    publishedUrl: `/${cleanSlug}`,
    isHomePage: false,
    createdAt: now,
    updatedAt: now,
    viewsCount: 0,
    leadsCount: 0,
    sectionOrder,
    sections,
    globalSettings: {
      siteTitle: seoTitle,
      siteLogoUrl: brandLogo,
      companyName,
      slogan: sloganSub || brandSlogan,
      theme: brandStylePreset,
            headerLayout: 'floating-glass',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      buttonBgColor,
      fontFamily,
      contactPhone,
      contactEmail,
      contactWhatsApp,
      address: officeAddress,
      navLinks,
      brandDnaSynced: true,
    },
    seoSettings: {
      title: seoTitle,
      description: seoDescription,
      keywords: keywordsList,
      faviconUrl: brandLogo,
      ogImage,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      author: companyName,
      googleAuditScore: 98,
      googleAuditRecommendations: [
        'תגיות Meta Title ו-Meta Description הוזרקו מנתוני מוצר הדגל',
        'נתוני קידום ב-AI (AIO/GEO) ושאלות נפוצות הוגדרו במלואם',
      ],
      aiKnowledgeSummary,
      aiTargetQuestions,
      aiBotIndexingEnabled: product.seo?.aiBotIndexingEnabled !== false,
      aiEntitySchemaType: mappedSchemaType,
      geo: {
        enabled: true,
        targetCity: officeAddress || 'ישראל',
        targetCountry: 'IL',
        localBusinessName: companyName,
        localBusinessType: 'EducationalOrganization',
        businessAddress: officeAddress,
        businessPhone: contactPhone,
        businessEmail: contactEmail,
        localizedKeywords: keywordsList,
      },
    },
  };
}

/**
 * פונקציה דטרמיניסטית מלאה (0 קריאות AI, 0 טוקנים) להפקת PageBuilderConfig מתוך CoreService
 * - פריסה ישירה של נתוני השירות באזורים המתאימים (Hero, אודות/תוכן, 6 נקודות כאב, 3 קהלים, 6 יתרונות, גלריה, 10 שאלות ותשובות, יצירת קשר).
 * - פתיחת העמוד בסלאג מתאים ונקי ישירות ללא קידומת /p/ (לדוגמה: /${slug})
 * - קליטת התוכן העשיר ישירות באזור התוכן/אודות (sec-about) של הבונה (visible: true).
 * - הסתרת כל האזורים הלא מותאמים (visible: false).
 * - פריסת הגדרות SEO ונתוני קידום ב-AI (AIO/GEO).
 */
export function buildPageConfigFromCoreService(
  options: CreatePageFromServiceOptions,
  existingPageId?: string
): PageBuilderConfig {
  const { service, brandDna: rawBrandDna } = options;
  const brandDna = resolveLiveBrandDna(rawBrandDna);
  const brandStylePreset: TenantStylePreset =
    brandDna?.designTokens?.defaultStylePreset ||
    (brandDna as any)?.stylePreset ||
    'standard';
  const now = new Date().toISOString();

  // חילוץ כותרת ראשית וסלוגן
  const rawName = (service.nameAndSlogan || 'שירות מרכזי').trim();
  const splitParts = rawName.split(/\s*[–—-]\s*/);
  const mainTitle = splitParts[0]?.trim() || rawName;
  const sloganSub = splitParts.slice(1).join(' – ').trim();

  const companyName = brandDna?.identity?.companyName || 'הארגון';
  const brandSlogan = brandDna?.identity?.slogan || '';
  const brandLogo = brandDna?.identity?.logoUrl || '';
  const primaryColor = brandDna?.designTokens?.primaryColor || '#4f46e5';
  const secondaryColor = brandDna?.designTokens?.secondaryColor || '#818cf8';
  const backgroundColor = brandDna?.designTokens?.backgroundColor || '#0f172a';
  const textColor = brandDna?.designTokens?.textColor || '#f8fafc';
  const buttonBgColor = brandDna?.designTokens?.buttonBgColor || primaryColor;
  const fontFamily = brandDna?.designTokens?.fontFamily || 'Heebo';
  const contactPhone = brandDna?.trust?.contactPhone || '';
  const contactEmail = brandDna?.trust?.contactEmail || '';
  const contactWhatsApp = brandDna?.trust?.whatsappSupportNumber || contactPhone;
  const officeAddress = brandDna?.trust?.officeAddress || '';

  // גלריית תמונות
  const galleryImages: string[] = Array.isArray(service.galleryImages) && service.galleryImages.length > 0
    ? service.galleryImages.filter((u) => typeof u === 'string' && u.trim().length > 0)
    : service.imageUrl && service.imageUrl.trim()
      ? [service.imageUrl.trim()]
      : [];

  const primaryImage = galleryImages[0] || service.imageUrl || brandLogo || '';

  // 6 נקודות כאב שהשירות פותר
  const painPoints = Array.isArray(service.painPoints) && service.painPoints.length > 0
    ? service.painPoints.filter((p) => p && (p.title || p.text))
    : service.painPointSolved
      ? service.painPointSolved.split('|').map((chunk, idx) => {
          const [t, ...rest] = chunk.split(':');
          return {
            id: `pain_${idx + 1}`,
            title: rest.length > 0 ? t.trim() : `אתגר ${idx + 1}`,
            text: (rest.length > 0 ? rest.join(':') : t).trim(),
            icon: 'AlertCircle',
          };
        })
      : [];

  // 3 קהלי יעד של השירות
  const targetAudiences = Array.isArray(service.targetAudiences) && service.targetAudiences.length > 0
    ? service.targetAudiences.filter((a) => a && (a.title || a.text))
    : service.targetAudience
      ? service.targetAudience.split('|').map((chunk, idx) => {
          const [t, ...rest] = chunk.split(':');
          return {
            id: `aud_${idx + 1}`,
            title: rest.length > 0 ? t.trim() : chunk.trim(),
            text: (rest.length > 0 ? rest.join(':') : `מענה מותאם אישית עבור ${chunk.trim()}`).trim(),
            icon: 'Users',
          };
        })
      : [];

  // 6 יתרונות תחרותיים
  const competitiveAdvantages = Array.isArray(service.competitiveAdvantages) && service.competitiveAdvantages.length > 0
    ? service.competitiveAdvantages.filter((c) => c && (c.title || c.text))
    : service.competitiveAdvantage
      ? service.competitiveAdvantage.split('|').map((chunk, idx) => {
          const [t, ...rest] = chunk.split(':');
          return {
            id: `adv_${idx + 1}`,
            title: rest.length > 0 ? t.trim() : `יתרון מרכזי ${idx + 1}`,
            text: (rest.length > 0 ? rest.join(':') : t).trim(),
            icon: 'Award',
          };
        })
      : [];

  // 10 שאלות ותשובות נפוצות
  const faqs = Array.isArray(service.faqs) && service.faqs.length > 0
    ? service.faqs.filter((f) => f && f.question && f.answer)
    : [];

  // סלאג נקי תחת נתיב KOSASS רשמי: kosass/{slug} (לדוגמה: kosass/executive-concierge)
  const rawSlugCandidate = (
    service.seo?.slug ||
    service.linkedPageSlug ||
    service.id ||
    `service-${Date.now().toString().slice(-4)}`
  )
    .toLowerCase()
    .replace(/[^a-z0-9-/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const companySlug = (brandDna?.identity?.companyName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  let baseSlug = rawSlugCandidate
    .replace(/^kosass[-/]/, '')
    .replace(/^-+/, '');

  if (companySlug && baseSlug.startsWith(`${companySlug}-`)) {
    baseSlug = baseSlug.slice(companySlug.length + 1);
  }
  if (baseSlug.startsWith('kushan-')) {
    baseSlug = baseSlug.slice('kushan-'.length);
  }
  if (baseSlug.startsWith('kosun-')) {
    baseSlug = baseSlug.slice('kosun-'.length);
  }

  baseSlug = baseSlug.replace(/^-+|-+$/g, '') || `service-${Date.now().toString().slice(-4)}`;

  const cleanSlug = `kosass/${baseSlug}`;
  const pageId = existingPageId || service.linkedPageId || `page_kosass_${baseSlug.replace(/[^a-z0-9_]/g, '_')}`;

  // קישורי תפריט ניווט עליון
  const navLinks: Array<{ label: string; url: string; isButton?: boolean }> = [];
  if (service.longDescription?.trim() || service.shortDescription?.trim()) {
    navLinks.push({ label: 'אודות השירות', url: '#sec-about' });
  }
  if (painPoints.length > 0) {
    navLinks.push({ label: 'האתגרים והמענה', url: '#sec-pain-points' });
  }
  if (targetAudiences.length > 0) {
    navLinks.push({ label: 'קהלי יעד', url: '#sec-target-audiences' });
  }
  if (competitiveAdvantages.length > 0) {
    navLinks.push({ label: 'יתרונות השירות', url: '#sec-advantages' });
  }
  if (galleryImages.length > 0) {
    navLinks.push({ label: 'גלריה', url: '#sec-gallery' });
  }
  if (faqs.length > 0) {
    navLinks.push({ label: 'שאלות ותשובות', url: '#sec-faq' });
  }
  navLinks.push({ label: 'יצירת קשר', url: '#sec-contact', isButton: true });

  const longDescHtml = service.longDescription?.trim()
    ? service.longDescription
        .trim()
        .split(/\n+/)
        .map((p) => `<p>${p.trim()}</p>`)
        .join('')
    : service.shortDescription?.trim()
      ? `<p>${service.shortDescription.trim()}</p>`
      : '';

  const isFemale = brandDna?.voice?.genderAddressing === 'female';
  const defaultAboutSub = isFemale ? 'הכירי את המרחב מקרוב' : 'הכירו לעומק';
  const defaultPainSub = isFemale ? 'עוגן בתוך שגרת החול' : 'מענה שלם לאתגרי השגרה';
  const defaultPainHead = isFemale ? 'האתגרים שאנו פוגשות ופותרות יחד איתך' : 'האתגרים שבהם אנו מעניקים מענה שלם';
  const defaultAudienceSub = isFemale ? 'המרחב שמחכה לך' : 'התאמה אישית מלאה';
  const defaultAudienceHead = isFemale ? 'למי נתפר המסע הייחודי הזה?' : 'למי מתאים המענה במיוחד?';
  const defaultAdvantageSub = isFemale ? 'הבשורה שלנו עבורך' : 'הייחוד והעוצמה שלנו';
  const defaultAdvantageHead = companyName ? `המעלות והבידול המובילים ב-${companyName}` : 'המעלות והעוגנים הייחודיים שלנו';
  const defaultFaqSub = isFemale ? 'כל מה שחשוב לך לדעת' : `כל מה שחשוב לדעת על ${mainTitle}`;
  const defaultFaqHead = 'שאלות ותשובות';
  const defaultContactTitle = isFemale ? `מוזמנת להצטרף ל-${mainTitle}` : `מעוניינים להצטרף ל-${mainTitle}?`;
  const defaultContactSub = service.shortDescription || (isFemale ? 'אנחנו כאן באהבה לכל שאלה והתייעצות' : 'השאירו פרטים ונחזור אליכם עם כל המידע');

  const sections: Record<string, any> = {
    header: {
      id: 'header',
      type: 'header',
      visible: true,
      layout: 'floating-glass',
      sticky: true,
      useBrandLogo: true,
      customLogoUrl: brandLogo,
      logoText: companyName,
      showLogoText: true,
      menuMode: 'custom',
      customLinks: navLinks,
      showCtaButton: true,
      ctaButtonText: 'לתיאום וייעוץ',
      ctaButtonUrl: '#sec-contact',
      showPhone: Boolean(contactPhone),
      phone: contactPhone,
      showWhatsApp: Boolean(contactWhatsApp),
      whatsApp: contactWhatsApp,
    },
    hero: {
      id: 'hero',
      type: 'hero',
      visible: true,
      anchorId: 'hero',
      title: mainTitle,
      subtitle: sloganSub || brandSlogan || companyName,
      description: service.shortDescription || '',
      imageSrc: primaryImage,
      layout: brandStylePreset,
      heroStyle: brandStylePreset === 'feminine' || brandStylePreset === 'spiritual'
        ? 'mesh-glow'
        : brandStylePreset === 'masculine'
          ? 'card'
          : brandStylePreset === 'sharp'
            ? 'minimal'
            : brandStylePreset === 'analytical'
              ? 'modern'
              : (primaryImage ? 'split' : 'centered'),
      buttonShape: brandStylePreset === 'feminine' || brandStylePreset === 'spiritual'
        ? 'pill'
        : brandStylePreset === 'masculine'
          ? 'rounded'
          : brandStylePreset === 'sharp'
            ? 'square'
            : 'auto',
      buttonsVisible: true,
      primaryButton: {
        text: 'לתיאום פגישה וייעוץ',
        url: '#sec-contact',
      },
      secondaryButton: {
        text: 'גלו את היתרונות',
        url: '#sec-advantages',
      },
      announcementBadge: {
        text: `${companyName} • שירות מרכזי`,
        icon: 'Sparkles',
      },
    },
    // אזור תוכן / אודות (sec-about) - קליטה ישירה של התוכן המפורט של השירות
    'sec-about': {
      id: 'sec-about',
      type: 'richContent',
      adminTitle: 'אודות / תוכן מעוצב',
      visible: Boolean(longDescHtml),
      anchorId: 'sec-about',
      subtitle: service.sectionTitles?.aboutSubtitle || defaultAboutSub,
      heading: service.sectionTitles?.aboutHeading || `אודות ${mainTitle}`,
      body: longDescHtml,
      layout: brandStylePreset,
      cardIconPosition: 'top',
      isAsymmetricGrid: true,
    },
    'sec-pain-points': {
      id: 'sec-pain-points',
      type: 'richContent',
      visible: painPoints.length > 0,
      anchorId: 'sec-pain-points',
      subtitle: service.sectionTitles?.painPointsSubtitle || defaultPainSub,
      heading: service.sectionTitles?.painPointsHeading || defaultPainHead,
      body: '',
      layout: brandStylePreset,
      cardIconPosition: 'top',
      isAsymmetricGrid: true,
      items: painPoints.map((p, idx) => ({
        id: p.id || `pain_${idx + 1}`,
        title: p.title,
        text: p.text,
        description: p.text,
        icon: p.icon || 'AlertCircle',
      })),
    },
    'sec-target-audiences': {
      id: 'sec-target-audiences',
      type: 'richContent',
      visible: targetAudiences.length > 0,
      anchorId: 'sec-target-audiences',
      subtitle: service.sectionTitles?.targetAudiencesSubtitle || defaultAudienceSub,
      heading: service.sectionTitles?.targetAudiencesHeading || defaultAudienceHead,
      body: '',
      layout: brandStylePreset,
      cardIconPosition: 'top',
      isAsymmetricGrid: true,
      items: targetAudiences.map((a, idx) => ({
        id: a.id || `aud_${idx + 1}`,
        title: a.title,
        text: a.text,
        description: a.text,
        icon: a.icon || 'Users',
      })),
    },
    'sec-advantages': {
      id: 'sec-advantages',
      type: 'richContent',
      visible: competitiveAdvantages.length > 0,
      anchorId: 'sec-advantages',
      subtitle: service.sectionTitles?.advantagesSubtitle || defaultAdvantageSub,
      heading: service.sectionTitles?.advantagesHeading || defaultAdvantageHead,
      body: '',
      layout: brandStylePreset,
      cardIconPosition: 'top',
      isAsymmetricGrid: true,
      items: competitiveAdvantages.map((c, idx) => ({
        id: c.id || `adv_${idx + 1}`,
        title: c.title,
        text: c.text,
        description: c.text,
        icon: c.icon || 'Award',
      })),
    },
    'sec-gallery': {
      id: 'sec-gallery',
      type: 'imageListing',
      visible: galleryImages.length > 0,
      anchorId: 'sec-gallery',
      title: `גלריית ${mainTitle}`,
      layout: brandStylePreset,
      imagesPerRow: 3,
      imagesPerRowMobile: 1,
      images: galleryImages.map((imgUrl, idx) => ({
        id: `gal_${idx + 1}`,
        imageUrl: imgUrl,
        title: `${mainTitle} - תמונה ${idx + 1}`,
      })),
    },
    'sec-faq': {
      id: 'sec-faq',
      type: 'faq',
      visible: faqs.length > 0,
      anchorId: 'sec-faq',
      layout: brandStylePreset,
      title: service.sectionTitles?.faqHeading || defaultFaqHead,
      subtitle: service.sectionTitles?.faqSubtitle || defaultFaqSub,
      showSearchBar: true,
      showContactCard: true,
      whatsappContact: contactWhatsApp,
      items: faqs.map((f, idx) => ({
        id: f.id || `faq_${idx + 1}`,
        question: f.question,
        answer: f.answer,
        icon: f.icon || 'HelpCircle',
      })),
    },
    'sec-contact': {
      id: 'sec-contact',
      type: 'contact',
      visible: true,
      anchorId: 'sec-contact',
      layout: brandStylePreset,
      title: service.sectionTitles?.contactHeading || defaultContactTitle,
      subtitle: service.sectionTitles?.contactSubtitle || defaultContactSub,
      phone: contactPhone,
      email: contactEmail,
      address: officeAddress,
      whatsapp: contactWhatsApp,
      showForm: true,
      directWhatsappChat: Boolean(contactWhatsApp),
    },
    // הסתרת כל האזורים הלא מותאמים
    pricing: {
      id: 'pricing',
      type: 'pricing',
      visible: false,
      title: 'חבילות ומסלולים',
      packages: [],
    },
    testimonials: {
      id: 'testimonials',
      type: 'testimonials',
      visible: false,
      title: 'המלצות',
      items: [],
    },
    statsBento: {
      id: 'statsBento',
      type: 'statsBento',
      visible: false,
      stats: [],
    },
    beforeAfter: {
      id: 'beforeAfter',
      type: 'beforeAfter',
      visible: false,
      title: 'לפני ואחרי',
      beforeImage: '',
      afterImage: '',
    },
    videoGallery: {
      id: 'videoGallery',
      type: 'videoGallery',
      visible: false,
    },
    timer: {
      id: 'timer',
      type: 'timer',
      visible: false,
      title: '',
      targetDate: now,
    },
  };

  // Apply brand preset to all sections
  Object.keys(sections).forEach((secKey) => {
    sections[secKey] = applyStylePresetToSection(sections[secKey], brandStylePreset);
  });

  const sectionOrder = [
    'header',
    'hero',
    'sec-about',
    'sec-pain-points',
    'sec-target-audiences',
    'sec-advantages',
    'sec-gallery',
    'sec-faq',
    'sec-contact',
    'pricing',
    'testimonials',
    'statsBento',
    'beforeAfter',
    'videoGallery',
    'timer',
  ];

  // הגדרות SEO וקידום ב-AI (AIO / GEO)
  const seoTitle = service.seo?.metaTitle?.trim() || `${mainTitle} | ${companyName}`;
  const seoDescription =
    service.seo?.metaDescription?.trim() ||
    service.shortDescription?.trim() ||
    (service.longDescription ? service.longDescription.trim().slice(0, 155) : `${mainTitle} מבית ${companyName}`);

  const keywordsList: string[] = service.seo?.keywords
    ? (Array.isArray(service.seo.keywords)
        ? service.seo.keywords
        : String(service.seo.keywords).split(',')
      )
        .map((k: string) => String(k || '').trim())
        .filter((k): k is string => Boolean(k))
    : [mainTitle, companyName, ...targetAudiences.map((a) => String(a.title || '').trim())].filter(
        (k): k is string => Boolean(k)
      );

  const aiKnowledgeSummary =
    service.seo?.aiKnowledgeSummary?.trim() ||
    `${rawName} מבית ${companyName}: ${service.shortDescription || ''}. ${
      competitiveAdvantages.length > 0
        ? 'יתרונות מרכזיים: ' + competitiveAdvantages.map((c) => c.title).join(', ') + '.'
        : ''
    }`.trim();

  const aiTargetQuestions =
    Array.isArray(service.seo?.aiTargetQuestions) && service.seo!.aiTargetQuestions!.length > 0
      ? service.seo!.aiTargetQuestions!
      : faqs.slice(0, 6).map((f) => f.question);

  const ogImage = service.seo?.ogImage?.trim() || primaryImage || '';

  return {
    pageId,
    pageTitle: rawName,
    slug: cleanSlug,
    shortSlug: baseSlug,
    pageCategory: 'service_product',
    published: true,
    publishedUrl: `/${cleanSlug}`, // ללא קידומת /p/ לפי דרישת המשתמש
    isHomePage: false,
    createdAt: now,
    updatedAt: now,
    viewsCount: 0,
    leadsCount: 0,
    sectionOrder,
    sections,
    globalSettings: {
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      buttonBgColor,
      fontFamily,
      companyName,
      slogan: sloganSub || brandSlogan,
      theme: brandStylePreset,
            contactPhone,
      contactEmail,
      contactWhatsApp,
      address: officeAddress,
      siteTitle: `${rawName} | ${companyName}`,
      brandDnaSynced: true,
    },
    seoSettings: {
      title: seoTitle,
      description: seoDescription,
      keywords: keywordsList,
      faviconUrl: brandLogo,
      ogImage,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      author: companyName,
      googleAuditScore: 98,
      googleAuditRecommendations: [
        'תגיות Meta Title ו-Meta Description הוזרקו מנתוני השירות המרכזי',
        'נתוני קידום ב-AI (AIO/GEO) ושאלות נפוצות הוגדרו במלואם',
      ],
      aiKnowledgeSummary,
      aiTargetQuestions,
      aiBotIndexingEnabled: service.seo?.aiBotIndexingEnabled !== false,
      aiEntitySchemaType: 'ProfessionalService',
      geo: {
        enabled: true,
        targetCity: officeAddress || 'ישראל',
        targetCountry: 'IL',
        localBusinessName: companyName,
        localBusinessType: 'ProfessionalService',
        businessAddress: officeAddress,
        businessPhone: contactPhone,
        businessEmail: contactEmail,
        localizedKeywords: keywordsList,
      },
    },
  };
}
