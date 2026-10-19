import { Firestore } from 'firebase/firestore';
import {
  PageBuilderConfig,
  PageCategory,
  ARCHIVE_7_SECTIONS_SPECS,
} from '../types/pageBuilder.types';
import { BrandDna, TenantStylePreset } from '../../../core/contracts';
import { resolveLiveBrandDna } from '../services/brandSectionHydrator';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { STYLE_GLOBAL_THEMES } from '../services/pageStylePresetService';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';

/**
 * Mapping of canonical URL archive slugs to internal PageCategory
 */
export const ARCHIVE_SLUG_MAP: Record<string, PageCategory> = {
  kosvidio: 'youtube_post',
  kosinfo: 'info_content',
  kosevent: 'event',
  koscheckout: 'checkout',
  koscommunity: 'community',
  kosfunrise: 'fundraising',
  koscourse: 'course',
  kosass: 'service_product',
};

/**
 * Array of all supported archive slugs
 */
export const ARCHIVE_SLUGS = Object.keys(ARCHIVE_SLUG_MAP) as Array<keyof typeof ARCHIVE_SLUG_MAP>;

/**
 * Check if a given slug is a canonical archive route
 */
export function isArchiveSlug(slug?: string | null): boolean {
  if (!slug) return false;
  const clean = slug.toLowerCase().trim().replace(/^\/+/, '');
  return Boolean(ARCHIVE_SLUG_MAP[clean]);
}

/**
 * Get category for an archive slug
 */
export function getCategoryFromArchiveSlug(slug?: string | null): PageCategory | null {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim().replace(/^\/+/, '');
  return ARCHIVE_SLUG_MAP[clean] || null;
}

/**
 * Builds a comprehensive, fully branded 7-sections Living Archive Page configuration
 */
export function buildArchivePageConfig(
  category: PageCategory,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): PageBuilderConfig {
  const brand = resolveLiveBrandDna(brandDnaInput, tenantId);
  const companyName = brand.identity?.companyName || (tenantId === '_master' ? 'קושאן' : `עסק ${tenantId}`);
  const slogan = brand.identity?.slogan || 'חדשנות, איכות וצמיחה מתמדת';
  const logoUrl = brand.identity?.logoUrl || '';

  const preset: TenantStylePreset = (brand.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard';
  const styleTokens = STYLE_GLOBAL_THEMES[preset] || {};

  const primaryColor = brand.designTokens?.primaryColor || styleTokens.primaryColor || '#6366f1';
  const secondaryColor = brand.designTokens?.secondaryColor || styleTokens.secondaryColor || '#0ea5e9';
  const buttonBgColor = brand.designTokens?.buttonBgColor || styleTokens.buttonBgColor || primaryColor;
  const buttonTextColor = brand.designTokens?.buttonTextColor || styleTokens.buttonTextColor || '#ffffff';
  const borderRadius = (brand.designTokens?.borderRadius as any) || styleTokens.borderRadius || 'md';
  const buttonStyle = (brand.designTokens?.buttonStyle as any) || styleTokens.buttonStyle || 'gradient';
  const fontFamily = brand.designTokens?.fontFamily || 'Heebo, sans-serif';

  const contactPhone = brand.trust?.contactPhone || '052-6968008';
  const contactWhatsApp = brand.trust?.whatsappSupportNumber || contactPhone;
  const contactEmail = brand.trust?.contactEmail || 'office@kosun.pro';
  const address = brand.trust?.officeAddress || 'ישראל';

  const spec = (ARCHIVE_7_SECTIONS_SPECS as any)[category] || ARCHIVE_7_SECTIONS_SPECS.info_content;
  const slug = spec.slugPrefix.toLowerCase();
  const pageId = `page_archive_${slug}_${tenantId}`;

  const fullTitle = `${spec.defaultTitle} | ${companyName}`;
  const fullDesc = `${spec.description} מבית ${companyName}. ${slogan}`;

  const sectionOrder: string[] = ['header-1'];
  const sections: Record<string, any> = {};

  // 1. Header Section
  sections['header-1'] = {
    ...SECTION_REGISTRY.header.defaultConfig,
    id: 'header-1',
    title: companyName,
    logoUrl,
    showLogoText: true,
    logoText: companyName,
    navLinks: [
      { label: 'עמוד הבית', url: '/' },
      { label: 'וידאו ושידורים', url: '/kosvidio' },
      { label: 'תוכן ומאמרים', url: '/kosinfo' },
      { label: 'אירועים', url: '/kosevent' },
      { label: 'מוצרים וסליקה', url: '/koscheckout' },
      { label: 'קורסים', url: '/koscourse' },
      { label: 'קהילה', url: '/koscommunity' },
    ],
  };

  // 2. Hero Section
  const heroId = `hero-${slug}`;
  sectionOrder.push(heroId);
  sections[heroId] = {
    ...SECTION_REGISTRY.hero.defaultConfig,
    id: heroId,
    title: spec.defaultTitle,
    subtitle: spec.defaultSubtitle,
    description: fullDesc,
    badgeText: spec.name,
    layout: 'bento-hero',
    heroStyle: 'mesh-glow',
    buttonsVisible: true,
    primaryButton: {
      text: 'צפייה בכל התכנים והעדכונים',
      url: '#sec-listing',
    },
    secondaryButton: {
      text: 'יצירת קשר מהיר בוואטסאפ',
      url: `https://wa.me/${contactWhatsApp.replace(/[^0-9]/g, '')}`,
    },
  };

  // 3-7. Category-Specific Sections
  switch (category) {
    case 'youtube_post': {
      // 3. Living Kosvidio Gallery
      const galId = 'kosvidioGallery-1';
      sectionOrder.push(galId);
      sections[galId] = {
        ...SECTION_REGISTRY.kosvidioGallery.defaultConfig,
        id: galId,
        anchorId: 'sec-listing',
        title: 'ספריית הוידאו, ההרצאות והשידורים החיים',
        subtitle: 'צפייה ישירה, הדרכות מוקלטות וניתוחים מעמיקים',
        badge: 'וידאו חי • VOD',
        source: 'tenant_kosvidio',
        layout: 'featured_carousel',
        viewMode: 'grid',
        channelName: companyName,
        channelSlogan: slogan,
        channelAvatarUrl: logoUrl,
        items: [],
      };

      // 4. Video Engagement Section
      const engId = 'videoEngagement-1';
      sectionOrder.push(engId);
      sections[engId] = {
        ...SECTION_REGISTRY.videoEngagement.defaultConfig,
        id: engId,
        title: 'הישארו מחוברים לעדכוני וידאו שוטפים',
        subtitle: 'הצטרפו למנויי הערוץ וקבלו התראה עם כל שידור וסרטון חדש',
        badge: 'קהילת הצופים',
        channelTitle: companyName,
      };

      // 5. Stats Bento
      const statsId = 'statsBento-1';
      sectionOrder.push(statsId);
      sections[statsId] = {
        ...SECTION_REGISTRY.statsBento.defaultConfig,
        id: statsId,
        title: 'התוכן שלנו במספרים',
        subtitle: 'מדדי צפייה, שעות תוכן וקהל עוקבים נאמן',
        stat1Value: '50K+',
        stat1Label: 'צפיות מצטברות',
        stat2Value: '100+',
        stat2Label: 'שעות תוכן והדרכה',
        stat3Value: '98%',
        stat3Label: 'שביעות רצון צופים',
        stat4Value: '24/7',
        stat4Label: 'זמינות צפייה ב-VOD',
      };

      // 6. FAQ
      const faqId = 'faq-1';
      sectionOrder.push(faqId);
      sections[faqId] = {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: faqId,
        title: 'שאלות ותשובות נפוצות על התכנים והשידורים',
        subtitle: 'כל מה שחשוב לדעת על גישה, הרצאות וזכויות שימוש',
        items: [
          {
            id: 'faq-vid-1',
            question: 'האם התכנים והסרטונים פתוחים לצפייה ללא עלות?',
            answer: 'כן! מרבית ההרצאות, השידורים והמדריכים בערוץ פתוחים לצפייה חופשית כחלק מהשליחות שלנו להנגיש ידע מקצועי ואיכותי.',
          },
          {
            id: 'faq-vid-2',
            question: 'באיזו תדירות עולים סרטונים והדרכות חדשות?',
            answer: 'אנו מעלים תכנים חדשים ושידורים חיים באופן שוטף מדי שבוע. מומלץ להצטרף לערוץ ולקבוצת העדכונים כדי לא לפספס אף הדרכה.',
          },
          {
            id: 'faq-vid-3',
            question: 'האם ניתן להציע נושאים לסרטונים הבאים?',
            answer: 'בהחלט! אנחנו שמחים לקבל הצעות ושאלות מהקהל וליצור סביבן הדרכות מעמיקות. מוזמנים לשלוח לנו הודעה ישירה.',
          },
        ],
      };

      // 7. Testimonials
      const testId = 'testimonials-1';
      sectionOrder.push(testId);
      sections[testId] = {
        ...SECTION_REGISTRY.testimonials.defaultConfig,
        id: testId,
        title: 'מה הצופים והעוקבים מספרים?',
        subtitle: 'תגובות אמיתיות של אנשים שצפו והפיקו ערך מעשי',
      };
      break;
    }

    case 'info_content': {
      // 3. Dynamic Listing (Articles)
      const listId = 'dynamicListing-1';
      sectionOrder.push(listId);
      sections[listId] = {
        ...SECTION_REGISTRY.dynamicListing.defaultConfig,
        id: listId,
        anchorId: 'sec-listing',
        title: 'מאגר המאמרים, המדריכים ומרכז הידע',
        subtitle: 'תובנות מעמיקות, כלים פרקטיים וניתוחים מקצועיים',
        badge: 'תוכן ומאמרים',
        source: 'pages',
        filterCategory: 'info_content',
        layout: 'bento-showcase',
        showCategoryFilter: true,
        showSearchBar: true,
        searchPlaceholder: 'חיפוש מהיר במאמרים ובמדריכים...',
        items: [],
      };

      // 4. Rich Content (Featured Editor's Note)
      const richId = 'richContent-1';
      sectionOrder.push(richId);
      sections[richId] = {
        ...SECTION_REGISTRY.richContent.defaultConfig,
        id: richId,
        title: 'דבר העורך: ידע מעשי למקבלי החלטות',
        subtitle: 'למה אנחנו משקיעים בכתיבת תכני עומק ומחקרים יישומיים',
        badge: 'טור העורך',
      };

      // 5. Stats Bento
      const statsId = 'statsBento-1';
      sectionOrder.push(statsId);
      sections[statsId] = {
        ...SECTION_REGISTRY.statsBento.defaultConfig,
        id: statsId,
        title: 'מרכז הידע במספרים',
        subtitle: 'היקף המחקרים, הקריאות והערך המקצועי',
        stat1Value: '100+',
        stat1Label: 'מאמרי עומק ומדריכים',
        stat2Value: '25K+',
        stat2Label: 'קוראים חודשיים',
        stat3Value: '15',
        stat3Label: 'תחומי התמחות שונים',
        stat4Value: '100%',
        stat4Label: 'תוכן מקורי ומבוסס מחקר',
      };

      // 6. FAQ
      const faqId = 'faq-1';
      sectionOrder.push(faqId);
      sections[faqId] = {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: faqId,
        title: 'שאלות נפוצות על מרכז הידע והתכנים',
        subtitle: 'שימוש בתכנים, ציטוט מחקרים והרשמה לניוזלטר',
      };

      // 7. Testimonials
      const testId = 'testimonials-1';
      sectionOrder.push(testId);
      sections[testId] = {
        ...SECTION_REGISTRY.testimonials.defaultConfig,
        id: testId,
        title: 'מה קוראי המאמרים מספרים?',
        subtitle: 'משוב מקצועי של מנהלים ומובילי תחום',
      };
      break;
    }

    case 'event': {
      // 3. Dynamic Listing (Events)
      const listId = 'dynamicListing-1';
      sectionOrder.push(listId);
      sections[listId] = {
        ...SECTION_REGISTRY.dynamicListing.defaultConfig,
        id: listId,
        anchorId: 'sec-listing',
        title: 'לוח האירועים, הכנסים והסדנאות',
        subtitle: 'השתתפו באירועים הבאים והבטיחו את מקומכם מראש',
        badge: 'לוח אירועים',
        source: 'pages',
        filterCategory: 'event',
        layout: 'grid-cards',
        showCategoryFilter: true,
        showSearchBar: true,
        searchPlaceholder: 'חיפוש אירוע לפי שם או מיקום...',
        items: [],
      };

      // 4. Event RSVP
      const rsvpId = 'eventRsvp-1';
      sectionOrder.push(rsvpId);
      sections[rsvpId] = {
        ...SECTION_REGISTRY.eventRsvp.defaultConfig,
        id: rsvpId,
        anchorId: 'sec-eventRsvp',
        title: 'שריון מקום מוקדם לאירוע המרכזי הבא',
        subtitle: 'מספר המקומות מוגבל לשמירה על חוויית משתתף איכותית',
      };

      // 5. Timer
      const timerId = 'timer-1';
      sectionOrder.push(timerId);
      sections[timerId] = {
        ...SECTION_REGISTRY.timer.defaultConfig,
        id: timerId,
        title: 'פתיחת שערים לאירוע השיא הבא',
        subtitle: 'ההרשמה המוקדמת עומדת להסתיים בקרוב',
      };

      // 6. Stats Bento
      const statsId = 'statsBento-1';
      sectionOrder.push(statsId);
      sections[statsId] = {
        ...SECTION_REGISTRY.statsBento.defaultConfig,
        id: statsId,
        title: 'קהילת האירועים שלנו במספרים',
        subtitle: 'משתתפים, שביעות רצון ורשת קשרים מקצועית',
        stat1Value: '10+',
        stat1Label: 'כנסים שנתיים',
        stat2Value: '5,000+',
        stat2Label: 'משתתפים באירועים',
        stat3Value: '99%',
        stat3Label: 'דירוג חוויית כנס',
        stat4Value: '100%',
        stat4Label: 'נטוורקינג ממוקד ומעשי',
      };

      // 7. FAQ
      const faqId = 'faq-1';
      sectionOrder.push(faqId);
      sections[faqId] = {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: faqId,
        title: 'שאלות ותשובות על ההגעה, ההרשמה והכרטיסים',
        subtitle: 'כל הפרטים הטכניים לקראת האירוע',
      };
      break;
    }

    case 'checkout': {
      // 3. Dynamic Listing (Products/Offers)
      const listId = 'dynamicListing-1';
      sectionOrder.push(listId);
      sections[listId] = {
        ...SECTION_REGISTRY.dynamicListing.defaultConfig,
        id: listId,
        anchorId: 'sec-listing',
        title: 'מרכז המוצרים, החבילות והרכישה המאובטחת',
        subtitle: 'בחרו את הפתרון המתאים לכם ביותר והשלימו סליקה מהירה',
        badge: 'מוצרים וסליקה',
        source: 'pages',
        filterCategory: 'checkout',
        layout: 'grid-cards',
        showCategoryFilter: true,
        showSearchBar: true,
        searchPlaceholder: 'חיפוש מוצר או חבילה...',
        items: [],
      };

      // 4. Pricing
      const priceId = 'pricing-1';
      sectionOrder.push(priceId);
      sections[priceId] = {
        ...SECTION_REGISTRY.pricing.defaultConfig,
        id: priceId,
        anchorId: 'sec-pricing',
        title: 'חבילות ומסלולים מומלצים',
        subtitle: 'שקיפות מלאה, ללא אותיות קטנות ועם תמיכה צמודה',
      };

      // 5. Timer
      const timerId = 'timer-1';
      sectionOrder.push(timerId);
      sections[timerId] = {
        ...SECTION_REGISTRY.timer.defaultConfig,
        id: timerId,
        title: 'מחיר השקה מיוחד לזמן מוגבל',
        subtitle: 'ההטבה בתוקף לרוכשים דרך האתר בלבד',
      };

      // 6. Testimonials
      const testId = 'testimonials-1';
      sectionOrder.push(testId);
      sections[testId] = {
        ...SECTION_REGISTRY.testimonials.defaultConfig,
        id: testId,
        title: 'מה הלקוחות המשלמים מספרים?',
        subtitle: 'חוויות רכישה, שביעות רצון ושירות ברמה הגבוהה ביותר',
      };

      // 7. FAQ
      const faqId = 'faq-1';
      sectionOrder.push(faqId);
      sections[faqId] = {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: faqId,
        title: 'שאלות ותשובות בנושא סליקה, אבטחה וקבלות',
        subtitle: 'עמידה בתקני אבטחה מחמירים, חשבוניות ירוקות ומדיניות ביטולים',
      };
      break;
    }

    case 'community': {
      // 3. Dynamic Listing (Communities)
      const listId = 'dynamicListing-1';
      sectionOrder.push(listId);
      sections[listId] = {
        ...SECTION_REGISTRY.dynamicListing.defaultConfig,
        id: listId,
        anchorId: 'sec-listing',
        title: 'פורטל הקהילות, המועדונים והרשתות',
        subtitle: 'מצאו את הקהילה שמתאימה לכם והצטרפו למעגל העשייה',
        badge: 'קהילות ומועדונים',
        source: 'pages',
        filterCategory: 'community',
        layout: 'bento-showcase',
        showCategoryFilter: true,
        showSearchBar: true,
        searchPlaceholder: 'חיפוש קהילה או קבוצה...',
        items: [],
      };

      // 4. Community Section
      const commId = 'community-1';
      sectionOrder.push(commId);
      sections[commId] = {
        ...SECTION_REGISTRY.community.defaultConfig,
        id: commId,
        title: 'הטבות בלעדיות לחברי הקהילה',
        subtitle: 'מפגשי זום חודשיים, קבוצת וואטסאפ שקטה ותכנים סגורים',
      };

      // 5. Live Posts
      const postsId = 'livePosts-1';
      sectionOrder.push(postsId);
      sections[postsId] = {
        ...SECTION_REGISTRY.livePosts.defaultConfig,
        id: postsId,
        title: 'עדכונים ודיונים חיים מהשטח',
        subtitle: 'מה חדש בקהילה ברגעים אלו ממש',
      };

      // 6. Stats Bento
      const statsId = 'statsBento-1';
      sectionOrder.push(statsId);
      sections[statsId] = {
        ...SECTION_REGISTRY.statsBento.defaultConfig,
        id: statsId,
        title: 'הקהילה שלנו במספרים',
        subtitle: 'חברים פעילים, מפגשים ושיתופי פעולה',
        stat1Value: '1,500+',
        stat1Label: 'חברי קהילה פעילים',
        stat2Value: '50+',
        stat2Label: 'מפגשים שנתיים',
        stat3Value: '100%',
        stat3Label: 'שיח מכבד ומקצועי',
        stat4Value: '24/7',
        stat4Label: 'רשת קשרים ותמיכה הדדית',
      };

      // 7. FAQ
      const faqId = 'faq-1';
      sectionOrder.push(faqId);
      sections[faqId] = {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: faqId,
        title: 'שאלות ותשובות על ההצטרפות לקהילה',
        subtitle: 'תנאי קבלה, כללי התנהגות ופעילות שוטפת',
      };
      break;
    }

    case 'fundraising': {
      // 3. Campaign Header
      const campHeadId = 'campaignHeader-1';
      sectionOrder.push(campHeadId);
      sections[campHeadId] = {
        ...SECTION_REGISTRY.campaignHeader.defaultConfig,
        id: campHeadId,
        title: 'מרכז הקמפיינים והשותפות החברתית',
        subtitle: 'יחד מגשימים חזון ויוצרים שינוי אמיתי בשטח',
        targetAmount: 500000,
        currentAmount: 375000,
        currencySymbol: '₪',
        donorsCount: 420,
        daysLeft: 14,
      };

      // 4. Dynamic Listing (Fundraising Campaigns)
      const listId = 'dynamicListing-1';
      sectionOrder.push(listId);
      sections[listId] = {
        ...SECTION_REGISTRY.dynamicListing.defaultConfig,
        id: listId,
        anchorId: 'sec-listing',
        title: 'כל מטרות הנתינה והקמפיינים הפעילים',
        subtitle: 'בחרו את המטרה הקרובה ללבכם וקחו חלק בשותפות',
        badge: 'קמפיינים פעילים',
        source: 'pages',
        filterCategory: 'fundraising',
        layout: 'grid-cards',
        items: [],
      };

      // 5. Campaign Tiers
      const tiersId = 'campaignTiers-1';
      sectionOrder.push(tiersId);
      sections[tiersId] = {
        ...SECTION_REGISTRY.campaignTiers.defaultConfig,
        id: tiersId,
        anchorId: 'sec-campaignTiers',
        title: 'מדרגות שותפות והקדשה',
        subtitle: 'כל תרומה מוכרת למס לפי סעיף 46 ומקדמת את המטרה',
      };

      // 6. Campaign Donors
      const donorsId = 'campaignDonors-1';
      sectionOrder.push(donorsId);
      sections[donorsId] = {
        ...SECTION_REGISTRY.campaignDonors.defaultConfig,
        id: donorsId,
        title: 'קיר התורמים והשותפים לדרך',
        subtitle: 'תודה מקרב לב לכל מי שלוקח חלק ומסייע להגיע ליעד',
      };

      // 7. FAQ
      const faqId = 'faq-1';
      sectionOrder.push(faqId);
      sections[faqId] = {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: faqId,
        title: 'שאלות ותשובות בנושא תרומות וסעיף 46',
        subtitle: 'קבלות מס, אמצעי תשלום ודיווח שקוף',
      };
      break;
    }

    case 'course': {
      // 3. Dynamic Listing (Courses)
      const listId = 'dynamicListing-1';
      sectionOrder.push(listId);
      sections[listId] = {
        ...SECTION_REGISTRY.dynamicListing.defaultConfig,
        id: listId,
        anchorId: 'sec-listing',
        title: 'האקדמיה הדיגיטלית ומרכז הקורסים',
        subtitle: 'תכניות הכשרה מקצועיות, סילבוסים מעשיים וליווי צמוד',
        badge: 'קורסים והכשרות',
        source: 'pages',
        filterCategory: 'course',
        layout: 'bento-showcase',
        showCategoryFilter: true,
        showSearchBar: true,
        searchPlaceholder: 'חיפוש קורס או נושא לימוד...',
        items: [],
      };

      // 4. Main Content (Methodology & Syllabus)
      const mainId = 'mainContent-1';
      sectionOrder.push(mainId);
      sections[mainId] = {
        ...SECTION_REGISTRY.mainContent.defaultConfig,
        id: mainId,
        title: 'שיטת ההוראה והמנטורינג האישי',
        subtitle: 'שילוב מנצח בין תיאוריה מוצקה לפרקטיקה מעשית מהשטח',
      };

      // 5. Pricing
      const priceId = 'pricing-1';
      sectionOrder.push(priceId);
      sections[priceId] = {
        ...SECTION_REGISTRY.pricing.defaultConfig,
        id: priceId,
        anchorId: 'sec-pricing',
        title: 'מסלולי לימוד והרשמה לקורסים',
        subtitle: 'בחרו את מסלול ההכשרה המותאם ליעדים שלכם',
      };

      // 6. Stats Bento
      const statsId = 'statsBento-1';
      sectionOrder.push(statsId);
      sections[statsId] = {
        ...SECTION_REGISTRY.statsBento.defaultConfig,
        id: statsId,
        title: 'הבוגרים וההצלחות במספרים',
        subtitle: 'שיעורי השמה, פרויקטים ומשוב בוגרים',
        stat1Value: '95%',
        stat1Label: 'שיעור השמה והתקדמות מקצועית',
        stat2Value: '500+',
        stat2Label: 'בוגרי תכניות ההכשרה',
        stat3Value: '120',
        stat3Label: 'שעות תרגול מעשי לכל תלמיד',
        stat4Value: '1-על-1',
        stat4Label: 'ליווי אישי של מנטור מומחה',
      };

      // 7. FAQ
      const faqId = 'faq-1';
      sectionOrder.push(faqId);
      sections[faqId] = {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: faqId,
        title: 'שאלות ותשובות על הלימודים והתעודות',
        subtitle: 'דרישות קדם, שעות שיעור, גישה להקלטות ותעודת גמר',
      };
      break;
    }

    case 'service_product':
    default: {
      // 3. Dynamic Listing (Services)
      const listId = 'dynamicListing-1';
      sectionOrder.push(listId);
      sections[listId] = {
        ...SECTION_REGISTRY.dynamicListing.defaultConfig,
        id: listId,
        anchorId: 'sec-listing',
        title: 'קטלוג השירותים, הפתרונות וההצעות המותאמות',
        subtitle: 'שירותים מקצועיים בהתאמה אישית מלאה לצרכים העסקיים שלכם',
        badge: 'שירותים ומוצרים',
        source: 'pages',
        filterCategory: 'service_product',
        layout: 'bento-showcase',
        showCategoryFilter: true,
        showSearchBar: true,
        searchPlaceholder: 'חיפוש שירות או פתרון...',
        items: [],
      };

      // 4. Pricing
      const priceId = 'pricing-1';
      sectionOrder.push(priceId);
      sections[priceId] = {
        ...SECTION_REGISTRY.pricing.defaultConfig,
        id: priceId,
        anchorId: 'sec-pricing',
        title: 'חבילות שירות והסכמי התקשרות',
        subtitle: 'מענה שקוף וברור עם מחויבות מלאה לתוצאות',
      };

      // 5. Testimonials
      const testId = 'testimonials-1';
      sectionOrder.push(testId);
      sections[testId] = {
        ...SECTION_REGISTRY.testimonials.defaultConfig,
        id: testId,
        title: 'מה הלקוחות שלנו מספרים?',
        subtitle: 'סיפורי הצלחה והמלצות מעסקים ושותפים',
      };

      // 6. Stats Bento
      const statsId = 'statsBento-1';
      sectionOrder.push(statsId);
      sections[statsId] = {
        ...SECTION_REGISTRY.statsBento.defaultConfig,
        id: statsId,
        title: 'הביצועים שלנו במספרים',
        subtitle: 'וותק, היקף פרויקטים ושביעות רצון לקוחות',
        stat1Value: '10+',
        stat1Label: 'שנות ניסיון והובלה',
        stat2Value: '350+',
        stat2Label: 'פרויקטים מוצלחים',
        stat3Value: '99%',
        stat3Label: 'שביעות רצון לקוחות',
        stat4Value: '24/6',
        stat4Label: 'זמינות ומענה מהיר',
      };

      // 7. FAQ
      const faqId = 'faq-1';
      sectionOrder.push(faqId);
      sections[faqId] = {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: faqId,
        title: 'שאלות ותשובות על תהליך העבודה והשירות',
        subtitle: 'לוחות זמנים, שלבי אפיון, תמחור ואחריות',
      };
      break;
    }
  }

  // 8. Contact Section (Common to all archives)
  const contactId = `contact-${slug}`;
  sectionOrder.push(contactId);
  sections[contactId] = {
    ...SECTION_REGISTRY.contact.defaultConfig,
    id: contactId,
    anchorId: 'sec-contact',
    title: `צריכים ייעוץ או מענה מותאם אישית?`,
    subtitle: `צוות ${companyName} זמין עבורכם לכל שאלה והתייעצות מהירה בוואטסאפ או בטלפון`,
    phone: contactPhone,
    whatsapp: contactWhatsApp,
    email: contactEmail,
    address,
    showForm: true,
  };

  const config: PageBuilderConfig = {
    pageId,
    pageTitle: fullTitle,
    slug,
    pageCategory: category,
    published: true,
    isHomePage: false,
    isArchivePage: true,
    viewsCount: 0,
    leadsCount: 0,
    globalSettings: {
      siteTitle: fullTitle,
      companyName,
      slogan,
      theme: preset,
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
      primaryColor,
      secondaryColor,
      buttonBgColor,
      buttonTextColor,
      borderRadius,
      buttonStyle,
      fontFamily,
      contactWhatsApp,
      contactPhone,
      contactEmail,
      address,
      siteLogoUrl: logoUrl,
    },
    seoSettings: {
      title: fullTitle,
      description: fullDesc,
      keywords: [...spec.keywords, companyName, 'ארכיון'],
      ogImage: logoUrl,
      faviconUrl: logoUrl,
      aiKnowledgeSummary: `${fullTitle}. ${fullDesc}`,
    },
    sectionOrder,
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return config;
}

/**
 * Resolves or immediately creates the specialized archive page if missing.
 * Prevents 404 for any archive route like /kosvidio, /kosinfo, /kosevent, etc.
 */
export async function resolveOrGenerateArchivePage(
  slug: string,
  db: Firestore | null,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): Promise<PageBuilderConfig | null> {
  const cleanSlug = slug.toLowerCase().trim().replace(/^\/+/, '');
  const category = ARCHIVE_SLUG_MAP[cleanSlug];
  if (!category) return null;

  try {
    // 1. Check if page already exists in Firestore for this tenant
    const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
    const existing = allPages.find((p) => {
      const pSlug = (p.slug || '').toLowerCase().trim().replace(/^\/+/, '');
      const pShort = (p.shortSlug || '').toLowerCase().trim().replace(/^\/+/, '');
      return pSlug === cleanSlug || pShort === cleanSlug || p.pageId === `page_archive_${cleanSlug}_${tenantId}`;
    });

    if (existing) {
      return existing;
    }

    // 2. Build the specialized archive page configuration
    const archiveConfig = buildArchivePageConfig(category, tenantId, brandDnaInput);

    // 3. Persist to Firestore asynchronously so future loads are instantaneous
    await pageBuilderFirestore.savePage(archiveConfig, db, tenantId);

    return archiveConfig;
  } catch (err) {
    console.warn('[resolveOrGenerateArchivePage] Error generating archive page:', err);
    // Return memory config as instant fallback even if database write fails
    return buildArchivePageConfig(category, tenantId, brandDnaInput);
  }
}

/**
 * Ensures all 8 specialized archive pages exist for a tenant in Firestore
 */
export async function ensureDefaultArchivePages(
  db: Firestore | null,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): Promise<PageBuilderConfig[]> {
  try {
    const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
    const existingSlugs = new Set(
      allPages.map((p) => (p.slug || '').toLowerCase().trim().replace(/^\/+/, ''))
    );

    const archivePages: PageBuilderConfig[] = [];

    for (const [slug, cat] of Object.entries(ARCHIVE_SLUG_MAP)) {
      if (!existingSlugs.has(slug)) {
        const config = buildArchivePageConfig(cat, tenantId, brandDnaInput);
        await pageBuilderFirestore.savePage(config, db, tenantId);
        archivePages.push(config);
      } else {
        const found = allPages.find(
          (p) => (p.slug || '').toLowerCase().trim().replace(/^\/+/, '') === slug
        );
        if (found) archivePages.push(found);
      }
    }

    return archivePages;
  } catch (err) {
    console.warn('[ensureDefaultArchivePages] Failed checking/creating archive pages:', err);
    return [];
  }
}

/**
 * Synchronizes existing archive pages with brand DNA tokens and identity updates
 */
export async function syncArchivePagesWithBrandDna(
  db: Firestore | null,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): Promise<void> {
  try {
    const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
    const brand = resolveLiveBrandDna(brandDnaInput, tenantId);
    const preset: TenantStylePreset = (brand.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard';
    const styleTokens = STYLE_GLOBAL_THEMES[preset] || {};

    for (const page of allPages) {
      const slug = (page.slug || '').toLowerCase().trim().replace(/^\/+/, '');
      if (page.isArchivePage || ARCHIVE_SLUG_MAP[slug]) {
        const updated: PageBuilderConfig = {
          ...page,
          globalSettings: {
            ...page.globalSettings,
            theme: preset,
            primaryColor: brand.designTokens?.primaryColor || styleTokens.primaryColor || page.globalSettings.primaryColor,
            secondaryColor: brand.designTokens?.secondaryColor || styleTokens.secondaryColor || page.globalSettings.secondaryColor,
            buttonBgColor: brand.designTokens?.buttonBgColor || styleTokens.buttonBgColor || page.globalSettings.buttonBgColor,
            buttonTextColor: brand.designTokens?.buttonTextColor || styleTokens.buttonTextColor || page.globalSettings.buttonTextColor,
            borderRadius: (brand.designTokens?.borderRadius as any) || styleTokens.borderRadius || page.globalSettings.borderRadius,
            buttonStyle: (brand.designTokens?.buttonStyle as any) || styleTokens.buttonStyle || page.globalSettings.buttonStyle,
            fontFamily: brand.designTokens?.fontFamily || page.globalSettings.fontFamily,
            companyName: brand.identity?.companyName || page.globalSettings.companyName,
            siteLogoUrl: brand.identity?.logoUrl || page.globalSettings.siteLogoUrl,
            contactPhone: brand.trust?.contactPhone || page.globalSettings.contactPhone,
            contactWhatsApp: brand.trust?.whatsappSupportNumber || page.globalSettings.contactWhatsApp,
            contactEmail: brand.trust?.contactEmail || page.globalSettings.contactEmail,
            address: brand.trust?.officeAddress || page.globalSettings.address,
          },
          updatedAt: new Date().toISOString(),
        };
        await pageBuilderFirestore.savePage(updated, db, tenantId);
      }
    }
  } catch (err) {
    console.warn('[syncArchivePagesWithBrandDna] Failed updating archive pages:', err);
  }
}
