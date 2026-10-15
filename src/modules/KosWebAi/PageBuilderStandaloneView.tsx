import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBuilderConfig, SectionType, PageCategory, PAGE_CATEGORIES } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { PageBuilderEditor } from './PageBuilderEditor';
import { PageBuilderRenderer } from './PageBuilderRenderer';
import { PagesDashboardTab } from './components/PagesDashboardTab';
import { PageCreationOptions } from './components/CreatePageWizardModal';
import { AiLivePageBuilderModal } from './components/AiLivePageBuilderModal';
import { UrlShortenerModal } from './components/UrlShortenerModal';
import { pageBuilderFirestore } from './services/pageBuilderFirestore';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../core/tenant';
import { useHostCapabilities } from '../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../core/contracts';
import { Layers, Edit3, Sparkles } from 'lucide-react';
import { ContinuousMarketingIdeasDrawer } from './components/ContinuousMarketingIdeasDrawer';
import { PageBuilderProvider } from './context/PageBuilderContext';
import { KosaiProvider } from '../kosai-engine';


const STORAGE_KEY = 'kosun_pagebuilder_current_page';

const getInitialCleanPageConfig = (brandDna?: any): PageBuilderConfig => ({
  pageId: 'page_main_home',
  pageTitle: 'עמוד הבית הראשי',
  slug: 'home',
  published: true,
  isHomePage: true,
  viewsCount: 0,
  leadsCount: 0,
  globalSettings: {
    siteTitle: brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים',
    companyName: brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים',
    slogan: brandDna?.identity?.slogan || 'חדשנות, איכות וצמיחה מתמדת',
    theme: 'modern',
    headerLayout: 'capsule-floating',
    headerSticky: true,
    isHeaderVisible: true,
    isFooterVisible: true,
    primaryColor: brandDna?.designTokens?.primaryColor || '#6366f1',
    secondaryColor: brandDna?.designTokens?.secondaryColor || '#0ea5e9',
    backgroundColor: '#0a0a0c',
    textColor: '#f8fafc',
    buttonBgColor: brandDna?.designTokens?.primaryColor || '#6366f1',
    fontFamily: brandDna?.designTokens?.fontFamily || 'Heebo, sans-serif',
    contactWhatsApp: brandDna?.trust?.whatsappSupportNumber || '0526968008',
    contactPhone: brandDna?.trust?.contactPhone || '052-6968008',
    contactEmail: brandDna?.trust?.contactEmail || 'ovt5771@gmail.com',
    address: brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב',
  },
  seoSettings: {
    title: `${brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים'} - דפי נחיתה וניהול קהילות`,
    description: brandDna?.identity?.shortVision || 'פלטפורמה מתקדמת לדפי אינטרנט ואוטומציות דיגיטליות.',
    keywords: ['דפי נחיתה', 'קהילות', 'שירותים דיגיטליים', 'קמונה'],
    geo: {
      enabled: true,
      targetCity: 'תל אביב',
      targetRegion: 'גוש דן והמרכז',
      targetCountry: 'ישראל',
      serviceAreas: ['תל אביב וגוש דן', 'ירושלים והסביבה', 'השרון', 'צפון ודרום'],
      localBusinessName: brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים',
      businessAddress: brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב',
      businessPhone: brandDna?.trust?.contactPhone || '052-6968008',
      openingHours: 'א׳-ה׳: 09:00-19:00',
    },
  },
  sectionOrder: [
    'hero',
    'logoMarquee',
    'statsBento',
    'testimonials',
    'pricing',
    'beforeAfter',
    'faq',
    'community',
    'geoLocal',
    'contact',
  ],
  sections: {
    hero: { ...SECTION_REGISTRY.hero.defaultConfig, id: 'hero' },
    logoMarquee: { ...SECTION_REGISTRY.logoMarquee.defaultConfig, id: 'logoMarquee' },
    statsBento: { ...SECTION_REGISTRY.statsBento.defaultConfig, id: 'statsBento' },
    testimonials: { ...SECTION_REGISTRY.testimonials.defaultConfig, id: 'testimonials' },
    pricing: { ...SECTION_REGISTRY.pricing.defaultConfig, id: 'pricing' },
    beforeAfter: { ...SECTION_REGISTRY.beforeAfter.defaultConfig, id: 'beforeAfter' },
    faq: { ...SECTION_REGISTRY.faq.defaultConfig, id: 'faq' },
    community: { ...SECTION_REGISTRY.community.defaultConfig, id: 'community' },
    geoLocal: { ...SECTION_REGISTRY.geoLocal.defaultConfig, id: 'geoLocal' },
    contact: { ...SECTION_REGISTRY.contact.defaultConfig, id: 'contact' },
  },
});

const PageBuilderStandaloneViewInner: React.FC = () => {
  const navigate = useNavigate();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  const [viewMode, setViewMode] = useState<'pages' | 'editor' | 'public'>('pages');
  const [pages, setPages] = useState<PageBuilderConfig[]>([]);
  const [currentPage, setCurrentPage] = useState<PageBuilderConfig>(() => getInitialCleanPageConfig(brandDna));

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMarketingDrawerOpen, setIsMarketingDrawerOpen] = useState(false);
  const [isShortenerModalOpen, setIsShortenerModalOpen] = useState(false);
  const [selectedShortPage, setSelectedShortPage] = useState<PageBuilderConfig | null>(null);

  // Load all pages from Firestore / LocalStorage
  useEffect(() => {
    const loadData = async () => {
      const all = await pageBuilderFirestore.getAllPages(db, tenantId);
      // Clean up any historical dummy values if present in stored pages
      const sanitized = all.map((p) => {
        let pCopy = { ...p };
        let wasCleaned = false;
        if (pCopy.viewsCount === 1420 && pCopy.leadsCount === 38) {
          pCopy.viewsCount = 0;
          pCopy.leadsCount = 0;
          wasCleaned = true;
        }
        if (pCopy.globalSettings?.companyName === 'הארגון המוביל') {
          pCopy.globalSettings = {
            ...pCopy.globalSettings,
            companyName: brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים',
            siteTitle: brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים',
          };
          wasCleaned = true;
        }
        if (wasCleaned && db) {
          pageBuilderFirestore.savePage(pCopy, db, tenantId).catch(() => {});
        }
        return pCopy;
      });

      if (sanitized.length > 0) {
        setPages(sanitized);
        const home = sanitized.find((p) => p.isHomePage) || sanitized[0];
        setCurrentPage(home);
      } else {
        // Zero dummy data: clean empty state, no auto-saving fake pages to Firestore
        setPages([]);
        setCurrentPage(getInitialCleanPageConfig(brandDna));
      }
    };
    loadData();
  }, [db, tenantId, brandDna]);

  // Save current page handler
  const handleSavePage = async (updated: PageBuilderConfig) => {
    setCurrentPage(updated);
    await pageBuilderFirestore.savePage(updated, db, tenantId);
    const all = await pageBuilderFirestore.getAllPages(db, tenantId);
    setPages(all);
  };

  // Convert page to interactive video funnel
  const handleConvertToVideo = (page: PageBuilderConfig) => {
    try {
      localStorage.setItem('sdo_video_studio_target_page_id', page.pageId);
    } catch {}
    navigate('/video-producer-studio');
  };

  const extractYouTubeId = (url?: string): string => {
    if (!url) return 'dQw4w9WgXcQ';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : (url.length === 11 ? url : 'dQw4w9WgXcQ');
  };

  // Create new page categorized by type (KOSASS, KOSINFO, KOSEVENT, KOSFUNRISE, KOSTUBE, P)
  const handleCreateNewPage = async (categoryOrOptions: PageCreationOptions | PageCategory = 'service_product') => {
    const isOptionsObject = typeof categoryOrOptions === 'object' && categoryOrOptions !== null;
    const options: PageCreationOptions = isOptionsObject
      ? categoryOrOptions
      : {
          category: categoryOrOptions,
          pageTitle: '',
        };

    const category: PageCategory = options.category || 'service_product';
    const newId = `page_${Date.now()}`;
    const baseInitial = getInitialCleanPageConfig(brandDna);

    const categoryTemplates: Record<PageCategory, {
      title: string;
      slugPrefix: string;
      sections: SectionType[];
      keywords: string[];
    }> = {
      service_product: {
        title: 'עמוד שירות / מוצר חדש',
        slugPrefix: 'kosass',
        sections: ['hero', 'richContent', 'pricing', 'smartForm', 'contact'],
        keywords: ['שירותים', 'מוצרים', 'הצעת מחיר'],
      },
      info_content: {
        title: 'עמוד מידע ותוכן חדש',
        slugPrefix: 'kosinfo',
        sections: ['hero', 'richContent', 'faq', 'contact'],
        keywords: ['מאמרים', 'מדריכים', 'מידע מקצועי'],
      },
      event: {
        title: 'עמוד אירוע חדש',
        slugPrefix: 'kosevent',
        sections: ['hero', 'timer', 'eventRsvp', 'contact'],
        keywords: ['אירוע', 'כנס', 'הרשמה', 'RSVP', 'Waze'],
      },
      fundraising: {
        title: 'קמפיין גיוס כספים ושגרירים',
        slugPrefix: 'kosfunrise',
        sections: ['campaignHeader', 'campaignTiers', 'campaignDonors', 'contact'],
        keywords: ['תרומות', 'קמפיין', 'שגרירים', 'גיוס כספים'],
      },
      youtube_post: {
        title: 'עמוד פוסט וידאו KosTube',
        slugPrefix: 'kostube',
        sections: ['kosvidio', 'faq', 'contact'],
        keywords: ['וידאו', 'יוטיוב', 'KosTube', 'תוכן'],
      },
      general: {
        title: 'דף נחיתה חדש',
        slugPrefix: 'p',
        sections: ['hero', 'richContent', 'contact'],
        keywords: ['דף נחיתה', 'קמונה'],
      },
    };

    const targetTemplate = categoryTemplates[category] || categoryTemplates.service_product;
    const finalTitle = options.pageTitle?.trim() || targetTemplate.title;

    // Build unique slug conforming to category prefix
    let finalSlug = '';
    const cleanPrefix = targetTemplate.slugPrefix;
    if (options.slugSuffix?.trim()) {
      const cleanSuffix = options.slugSuffix
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/^-+|-+$/g, '');
      finalSlug = cleanSuffix.startsWith(`${cleanPrefix}-`) ? cleanSuffix : `${cleanPrefix}-${cleanSuffix}`;
    } else {
      const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
      finalSlug = `${cleanPrefix}-${randomSuffix}`;
    }

    const builtSections: Record<string, any> = {};
    targetTemplate.sections.forEach((secType) => {
      if (SECTION_REGISTRY[secType]) {
        builtSections[secType] = { ...SECTION_REGISTRY[secType].defaultConfig, id: secType };
      }
    });

    // Tailor section configurations according to wizard options
    if (builtSections.hero) {
      builtSections.hero.title = finalTitle;
      if (options.description?.trim()) {
        builtSections.hero.subtitle = options.description.trim();
      }
    }

    if (category === 'event') {
      if (builtSections.timer && options.eventDate) {
        builtSections.timer.title = `הספירה לאחור לקראת: ${finalTitle}`;
        builtSections.timer.targetDate = `${options.eventDate}T${options.eventTime || '19:30'}:00`;
      }
      if (builtSections.eventRsvp) {
        builtSections.eventRsvp.eventTitle = finalTitle;
        if (options.eventDate) builtSections.eventRsvp.eventDate = options.eventDate;
        if (options.eventTime) builtSections.eventRsvp.eventTime = options.eventTime;
        if (options.eventEndTime) builtSections.eventRsvp.eventEndTime = options.eventEndTime;
        if (options.locationName) builtSections.eventRsvp.locationName = options.locationName;
        if (options.locationAddress) builtSections.eventRsvp.locationAddress = options.locationAddress;
        if (options.wazeQuery) builtSections.eventRsvp.wazeQuery = options.wazeQuery;
        else if (options.locationAddress) builtSections.eventRsvp.wazeQuery = options.locationAddress;
        if (options.description) builtSections.eventRsvp.description = options.description;
        if (options.enableCalendarAdd !== undefined) builtSections.eventRsvp.showCalendarCard = options.enableCalendarAdd;
        if (options.isPaidEvent) {
          builtSections.eventRsvp.isPaidEvent = true;
          builtSections.eventRsvp.ticketPrice = options.ticketPrice || 0;
        }
        if (options.enableCrmRsvp) {
          builtSections.eventRsvp.enableCrmRsvp = true;
          builtSections.eventRsvp.crmGroupName = options.crmGroupName || finalTitle;
        }
      }
    } else if (category === 'service_product') {
      if (builtSections.pricing && options.servicePrice) {
        const sPrice = options.servicePrice;
        builtSections.pricing.packages = (builtSections.pricing.packages || []).map((pkg: any, idx: number) => {
          if (idx === 1 || pkg.isFeatured) {
            return {
              ...pkg,
              priceMonthly: `₪${sPrice}`,
              priceYearly: `₪${Math.round(sPrice * 0.8)}`,
              name: finalTitle,
            };
          }
          return pkg;
        });
      }
      if (builtSections.smartForm) {
        builtSections.smartForm.sectionTitle = `הזמנת ${finalTitle} / השארת פרטים`;
        if (options.servicePrice) {
          builtSections.smartForm.sectionSubtitle = `מחיר שירות / מוצר: ₪${options.servicePrice} | מלאו את הפרטים ונחזור אליכם בהקדם`;
        }
      }
    } else if (category === 'fundraising') {
      if (builtSections.campaignHeader) {
        builtSections.campaignHeader.title = finalTitle;
        if (options.targetGoal) builtSections.campaignHeader.targetGoal = options.targetGoal;
        builtSections.campaignHeader.totalRaised = 0;
        builtSections.campaignHeader.donorsCount = 0;
      }
      if (builtSections.campaignTiers && options.campaignTiers && options.campaignTiers.length > 0) {
        builtSections.campaignTiers.tiers = options.campaignTiers.map((t, idx) => ({
          id: String(idx + 1),
          title: t.title,
          amount: t.amount,
          description: `תמיכה עבור ${t.title}`,
          isPopular: idx === 1,
          badgeText: idx === 1 ? 'הכי נבחר' : undefined,
        }));
      }
    } else if (category === 'youtube_post') {
      if (builtSections.kosvidio) {
        builtSections.kosvidio.title = finalTitle;
        if (options.youtubeUrl) {
          builtSections.kosvidio.youtubeVideoId = extractYouTubeId(options.youtubeUrl);
        }
        if (options.description) {
          builtSections.kosvidio.shortDescription = options.description;
        }
      }
    } else if (category === 'info_content') {
      if (builtSections.richContent && options.description) {
        builtSections.richContent.heading = finalTitle;
        builtSections.richContent.body = `<p>${options.description}</p>`;
      }
    }

    const newPage: PageBuilderConfig = {
      ...baseInitial,
      pageId: newId,
      pageTitle: finalTitle,
      slug: finalSlug,
      pageCategory: category,
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        ...baseInitial.globalSettings,
        siteTitle: finalTitle,
        primaryColor: brandDna?.designTokens?.primaryColor || '#6366f1',
        companyName: brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים',
        fontFamily: brandDna?.designTokens?.fontFamily || 'Heebo, sans-serif',
      },
      seoSettings: {
        title: `${finalTitle} | ${PAGE_CATEGORIES[category]?.label || 'דף נחיתה'}`,
        description: options.description || `עמוד ${PAGE_CATEGORIES[category]?.label || ''} מקצועי ומעוצב`,
        keywords: targetTemplate.keywords,
      },
      sectionOrder: targetTemplate.sections,
      sections: builtSections,
    };

    // If it's a service/product page, register slug with BrandDNA contract
    if (category === 'service_product') {
      const brandContract = getCapability<BrandDnaContract>('brand-dna');
      if (brandContract?.registerServicePageSlug) {
        brandContract.registerServicePageSlug(newPage.pageId, newPage.slug);
      }
    }

    await pageBuilderFirestore.savePage(newPage, db, tenantId);
    const all = await pageBuilderFirestore.getAllPages(db, tenantId);
    setPages(all);
    setCurrentPage(newPage);
    setViewMode('editor');
  };

  // Duplicate page
  const handleDuplicatePage = async (page: PageBuilderConfig) => {
    const duplicated = await pageBuilderFirestore.duplicatePage(page, db, tenantId);
    const all = await pageBuilderFirestore.getAllPages(db, tenantId);
    setPages(all);
    setCurrentPage(duplicated);
  };

  // Delete page
  const handleDeletePage = async (pageId: string) => {
    if (confirm('האם למחוק עמוד זה לצמיתות?')) {
      await pageBuilderFirestore.deletePage(pageId, db, tenantId);
      const all = await pageBuilderFirestore.getAllPages(db, tenantId);
      setPages(all);
      if (currentPage.pageId === pageId && all.length > 0) {
        setCurrentPage(all[0]);
      }
    }
  };

  // Set home page
  const handleSetHomePage = async (pageId: string) => {
    await pageBuilderFirestore.setHomePage(pageId, db, tenantId);
    const all = await pageBuilderFirestore.getAllPages(db, tenantId);
    setPages(all);
    const updated = all.find((p) => p.pageId === currentPage.pageId);
    if (updated) {
      setCurrentPage(updated);
    }
  };

  // Unset home page
  const handleUnsetHomePage = async (_pageId: string) => {
    await pageBuilderFirestore.setHomePage('', db, tenantId);
    const all = await pageBuilderFirestore.getAllPages(db, tenantId);
    setPages(all);
    const updated = all.find((p) => p.pageId === currentPage.pageId);
    if (updated) {
      setCurrentPage(updated);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (page: PageBuilderConfig) => {
    const updated = await pageBuilderFirestore.togglePublish(page, db, tenantId);
    const all = await pageBuilderFirestore.getAllPages(db, tenantId);
    setPages(all);
    if (currentPage.pageId === page.pageId) {
      setCurrentPage(updated);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white select-none transition-colors duration-300">
      {viewMode === 'pages' ? (
        <PagesDashboardTab
          pages={pages}
          activePageId={currentPage.pageId}
          onSelectPage={(page) => {
            setCurrentPage(page);
            setViewMode('editor');
          }}
          onNewPage={handleCreateNewPage}
          onOpenAiBuilder={() => setIsAiModalOpen(true)}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onSetHomePage={handleSetHomePage}
          onUnsetHomePage={handleUnsetHomePage}
          onTogglePublish={handleTogglePublish}
          onOpenShortener={(page) => {
            setSelectedShortPage(page);
            setIsShortenerModalOpen(true);
          }}
          onConvertToVideo={handleConvertToVideo}
        />
      ) : (
        <PageBuilderEditor
          initialConfig={currentPage}
          onSaveConfig={handleSavePage}
          onGoToPagesList={() => setViewMode('pages')}
          onClose={() => setViewMode('pages')}
          onConvertToVideo={() => handleConvertToVideo(currentPage)}
        />
      )}

      {/* AI Live Page Generator Modal (Dashboard view only) */}
      {viewMode === 'pages' && (
        <AiLivePageBuilderModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onComplete={async (generatedConfig) => {
            await pageBuilderFirestore.savePage(generatedConfig, db, tenantId);
            const all = await pageBuilderFirestore.getAllPages(db, tenantId);
            setPages(all);
            setCurrentPage(generatedConfig);
            setViewMode('editor');
          }}
          onOpenMarketingDrawer={() => {
            setIsAiModalOpen(false);
            setIsMarketingDrawerOpen(true);
          }}
        />
      )}

      {/* URL Shortener Modal */}
      {selectedShortPage && (
        <UrlShortenerModal
          isOpen={isShortenerModalOpen}
          onClose={() => setIsShortenerModalOpen(false)}
          config={selectedShortPage}
          onSaveShortUrl={async (shortUrl, shortSlug) => {
            const updated = { ...selectedShortPage, shortUrl, shortSlug };
            await pageBuilderFirestore.savePage(updated, db, tenantId);
            const all = await pageBuilderFirestore.getAllPages(db, tenantId);
            setPages(all);
          }}
        />
      )}

      {/* Brand DNA Marketing Ideas Drawer (Dashboard view only) */}
      {viewMode === 'pages' && (
        <ContinuousMarketingIdeasDrawer
          isOpen={isMarketingDrawerOpen}
          onClose={() => setIsMarketingDrawerOpen(false)}
          onSelectIdea={(prompt) => {
            setIsMarketingDrawerOpen(false);
            setIsAiModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export const PageBuilderStandaloneView: React.FC = () => {
  return (
    <PageBuilderProvider>
      <KosaiProvider>
        <PageBuilderStandaloneViewInner />
      </KosaiProvider>
    </PageBuilderProvider>
  );
};

export default PageBuilderStandaloneView;
