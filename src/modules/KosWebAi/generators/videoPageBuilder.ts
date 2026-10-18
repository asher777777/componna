/**
 * Video Page Builder (Kosvidio Blueprint)
 * Directly injects structured AI output into native KWB sections without raw HTML blobs.
 */

import { PageBuilderConfig } from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { KosvidioGalleryItem } from '../types/sectionConfigs';

export interface CreateVideoPageOptions {
  video: {
    id?: string;
    youtubeVideoId?: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    viewCount?: number;
    likeCount?: number;
    duration?: string;
  };
  channelTitle?: string;
  brandDna?: any;
  aiData?: any;
  channelVideos?: any[];
  customSlug?: string;
}

export function buildPageConfigFromVideo(options: CreateVideoPageOptions): PageBuilderConfig {
  const { video, channelTitle = 'ערוץ יוטיוב', brandDna, aiData, channelVideos = [] } = options;

  const cleanVideoId = (video.youtubeVideoId || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  const rawSlug = options.customSlug || aiData?.slug || cleanVideoId;
  const cleanSlug = rawSlug
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/?(p|to|page)\//i, '')
    .replace(/^\/?kosvidio[-/]/i, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || cleanVideoId || 'video';

  const publicUrl = `/kosvidio/${cleanSlug}`;
  const pageId = `page_kosvidio_${video.youtubeVideoId || cleanSlug}`;
  const title = aiData?.h1 || video.title || 'וידאו ומאמר AI SEO';

  const brandCompanyName = brandDna?.identity?.companyName || 'קושאן';
  const brandLogo = brandDna?.identity?.logoUrl || '';
  const brandSlogan = brandDna?.identity?.slogan || 'וידאו חכם ומאמרי SEO מעמיקים';
  const primaryColor = brandDna?.designTokens?.primaryColor || '#ef4444';
  const secondaryColor = brandDna?.designTokens?.secondaryColor || '#8b5cf6';
  const whatsapp = brandDna?.trust?.whatsappSupportNumber || '';
  const phone = brandDna?.trust?.contactPhone || '';
  const email = brandDna?.trust?.contactEmail || '';

  // 1. Format Takeaways into structured cards (zero raw HTML)
  const takeawayItems = (aiData?.keyTakeaways || []).map((point: string, idx: number) => ({
    id: `takeaway_${idx + 1}`,
    title: `תובנה מרכזית ${idx + 1}`,
    text: point,
    description: point,
    icon: 'CheckCircle2',
  }));

  // 2. Format FAQ items
  const faqItems = Array.isArray(aiData?.faqs) && aiData.faqs.length > 0
    ? aiData.faqs.map((f: { question?: string; answer?: string }, idx: number) => ({
        id: `faq_${idx + 1}`,
        question: f.question || '',
        answer: f.answer || '',
        icon: 'HelpCircle',
      }))
    : SECTION_REGISTRY.faq?.defaultConfig?.items || [];

  // 3. Format Channel Video Gallery items
  const galleryItems: KosvidioGalleryItem[] = channelVideos.map((v, i) => ({
    id: v.id || `vid-${i}`,
    title: v.title,
    subtitle: channelTitle || brandCompanyName,
    description: v.description?.slice(0, 140) || '',
    youtubeVideoId: v.youtubeVideoId,
    thumbnailUrl: v.thumbnailUrl,
    kosvidioSlug: 'kosvidio',
    duration: v.duration || '',
    viewsCount: Number(v.viewCount || 0),
    likesCount: Number(v.likeCount || 0),
    category: 'סרטוני הערוץ',
    tags: ['וידאו', 'יוטיוב'],
    featured: i === 0,
  }));

  const navLinks = [
    { label: 'הסרטון', url: '#kosvidio' },
    { label: 'תובנות מפתח', url: '#sec-takeaways' },
    { label: 'שאלות ותשובות', url: '#sec-faq' },
    { label: 'סרטונים נוספים', url: '#sec-gallery' },
  ];

  return {
    pageId,
    pageTitle: `${title} - Kosvidio`,
    slug: cleanSlug,
    shortSlug: cleanSlug,
    publicUrl,
    publishedUrl: publicUrl,
    published: true,
    isHomePage: false,
    viewsCount: 0,
    leadsCount: 0,
    globalSettings: {
      siteTitle: `${title} | ${brandCompanyName}`,
      companyName: brandCompanyName,
      slogan: brandSlogan,
      theme: 'dark',
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
      primaryColor,
      secondaryColor,
      backgroundColor: '#090a0f',
      textColor: '#f8fafc',
      fontFamily: 'Heebo, sans-serif',
      borderRadius: 'lg',
      buttonStyle: 'gradient',
      contactWhatsApp: whatsapp,
      contactPhone: phone,
      contactEmail: email,
      siteLogoUrl: brandLogo,
    },
    seoSettings: {
      title: aiData?.metaTitle || title,
      description: aiData?.metaDescription || video.description?.slice(0, 160) || '',
      keywords: aiData?.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
    },
    // Order: Header -> Video -> Engagement (Likes & Comments) -> Takeaways -> FAQ -> CTA -> Gallery
    sectionOrder: [
      'header-1',
      'kosvidio-1',
      'videoEngagement-1',
      'sec-takeaways',
      'sec-faq',
      'sec-cta',
      'sec-gallery',
    ],
    sections: {
      'header-1': {
        ...SECTION_REGISTRY.header.defaultConfig,
        id: 'header-1',
        type: 'header',
        visible: true,
        title: brandCompanyName,
        showLogoText: true,
        logoText: brandCompanyName,
        useBrandLogo: Boolean(brandLogo),
        customLogoUrl: brandLogo,
        layout: 'capsule-floating',
        sticky: true,
        menuMode: 'custom',
        customLinks: navLinks,
        showCtaButton: true,
        ctaButtonText: aiData?.callToAction?.buttonText || 'צרו קשר',
        ctaButtonUrl: '#sec-cta',
      },

      'kosvidio-1': {
        ...SECTION_REGISTRY.kosvidio.defaultConfig,
        id: 'kosvidio-1',
        type: 'kosvidio',
        visible: true,
        anchorId: 'kosvidio',
        youtubeVideoId: video.youtubeVideoId,
        title,
        viewsCount: Number(video.viewCount || 0),
        likesCount: Number(video.likeCount || 0),
        commentsCount: 0,
        pageViewsCount: 0,
        channelName: channelTitle,
        channelAvatarUrl: video.thumbnailUrl,
        tags: aiData?.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
        hideInternalEngagement: true, // Engagement is handled by dedicated videoEngagement-1 section
        ambientGlow: true,
        showTheaterMode: true,
        shortDescription: '',
        longDescriptionMarkdown: '',
      },

      'videoEngagement-1': {
        ...SECTION_REGISTRY.videoEngagement.defaultConfig,
        id: 'videoEngagement-1',
        type: 'videoEngagement',
        visible: true,
        anchorId: 'engagement',
        allowLikes: true,
        likesCount: Number(video.likeCount || 0),
        viewsCount: Number(video.viewCount || 0),
        allowComments: true,
        allowUserComments: true,
        enableSocialShare: true,
        tags: aiData?.tags || [],
        videoTitle: title,
        comments: [],
        accentColor: primaryColor,
      },

      'sec-takeaways': {
        ...SECTION_REGISTRY.richContent.defaultConfig,
        id: 'sec-takeaways',
        type: 'richContent',
        visible: takeawayItems.length > 0 || Boolean(aiData?.executiveSummary),
        anchorId: 'sec-takeaways',
        heading: 'תובנות מפתח מהסרטון',
        subtitle: aiData?.executiveSummary || 'התובנות המרכזיות והערך המעשי הנלמד מהוידאו',
        body: '', // Zero raw HTML blob!
        layout: 'cards-grid-3',
        items: takeawayItems,
      },

      'sec-faq': {
        ...SECTION_REGISTRY.faq.defaultConfig,
        id: 'sec-faq',
        type: 'faq',
        visible: faqItems.length > 0,
        anchorId: 'sec-faq',
        title: 'שאלות ותשובות נפוצות',
        subtitle: 'תובנות מעמיקות ובירורים מתוך הסרטון',
        showSearchBar: true,
        showContactCard: false,
        items: faqItems,
      },

      'sec-cta': {
        ...SECTION_REGISTRY.landingSection.defaultConfig,
        id: 'sec-cta',
        type: 'landingSection',
        visible: true,
        anchorId: 'sec-cta',
        headline: aiData?.callToAction?.title || `רוצים לקחת את התוצאות צעד קדימה עם ${brandCompanyName}?`,
        card: {
          ...SECTION_REGISTRY.landingSection.defaultConfig?.card,
          title: aiData?.callToAction?.title || brandCompanyName,
          subtitle: aiData?.callToAction?.subtitle || 'פנו אלינו ונשמח לסייע לכם להגיע ליעדים שלכם',
        },
        ctaButton: {
          ...SECTION_REGISTRY.landingSection.defaultConfig?.ctaButton,
          text: aiData?.callToAction?.buttonText || 'צרו קשר עכשיו',
        },
      },

      'sec-gallery': {
        ...SECTION_REGISTRY.kosvidioGallery.defaultConfig,
        id: 'sec-gallery',
        type: 'kosvidioGallery',
        visible: true,
        anchorId: 'sec-gallery',
        badge: 'KOSVIDIO • גלריית סרטונים',
        title: 'ספריית סרטוני הערוץ',
        subtitle: channelTitle || brandCompanyName,
        description: `צפו במבחר סרטוני וידאו מתוך ${channelTitle || brandCompanyName}`,
        layout: 'horizontal-scroll',
        source: 'tenant_kosvidio',
        items: galleryItems.length > 0 ? galleryItems : SECTION_REGISTRY.kosvidioGallery.defaultConfig.items,
        allowVisitorLayoutSwitch: false,
      },

      // Contact section explicitly hidden because floating capsule widget ("אנחנו כאן") is active
      'contact-1': {
        ...SECTION_REGISTRY.contact.defaultConfig,
        id: 'contact-1',
        type: 'contact',
        visible: false,
      },
    },
  };
}
