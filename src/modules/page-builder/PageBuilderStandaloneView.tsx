import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBuilderConfig, SectionType } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { PageBuilderEditor } from './PageBuilderEditor';
import { PageBuilderRenderer } from './PageBuilderRenderer';
import { PagesDashboardTab } from './components/PagesDashboardTab';
import { AiLivePageBuilderModal } from './components/AiLivePageBuilderModal';
import { UrlShortenerModal } from './components/UrlShortenerModal';
import { pageBuilderFirestore } from './services/pageBuilderFirestore';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { useHostCapabilities } from '../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../core/contracts';
import { Layers, Edit3, Sparkles } from 'lucide-react';
import { ContinuousMarketingIdeasDrawer } from './components/ContinuousMarketingIdeasDrawer';
import { PageBuilderProvider } from './context/PageBuilderContext';


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
    headerLayout: 'floating-glass',
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
    'services',
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
    services: { ...SECTION_REGISTRY.services.defaultConfig, id: 'services' },
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
      const all = await pageBuilderFirestore.getAllPages(db);
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
          pageBuilderFirestore.savePage(pCopy, db).catch(() => {});
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
  }, [db, brandDna]);

  // Save current page handler
  const handleSavePage = async (updated: PageBuilderConfig) => {
    setCurrentPage(updated);
    await pageBuilderFirestore.savePage(updated, db);
    const all = await pageBuilderFirestore.getAllPages(db);
    setPages(all);
  };

  // Convert page to interactive video funnel
  const handleConvertToVideo = (page: PageBuilderConfig) => {
    try {
      localStorage.setItem('sdo_video_studio_target_page_id', page.pageId);
    } catch {}
    navigate('/video-producer-studio');
  };

  // Create empty new page
  const handleCreateNewPage = async () => {
    const newId = `page_${Date.now()}`;
    const baseInitial = getInitialCleanPageConfig(brandDna);
    const newPage: PageBuilderConfig = {
      ...baseInitial,
      pageId: newId,
      pageTitle: 'דף נחיתה חדש',
      slug: `page-${Math.floor(Math.random() * 9000 + 1000)}`,
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        ...baseInitial.globalSettings,
        siteTitle: 'דף נחיתה חדש',
        primaryColor: brandDna?.designTokens?.primaryColor || '#6366f1',
        companyName: brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים',
        fontFamily: brandDna?.designTokens?.fontFamily || 'Heebo, sans-serif',
      },
      seoSettings: {
        title: 'דף נחיתה חדש ומעוצב',
        description: 'תיאור קצר של הדף...',
        keywords: ['שירותים', 'איכות'],
      },
      sectionOrder: ['hero', 'services', 'pricing', 'contact'],
      sections: {
        hero: { ...SECTION_REGISTRY.hero.defaultConfig, id: 'hero' },
        services: { ...SECTION_REGISTRY.services.defaultConfig, id: 'services' },
        pricing: { ...SECTION_REGISTRY.pricing.defaultConfig, id: 'pricing' },
        contact: { ...SECTION_REGISTRY.contact.defaultConfig, id: 'contact' },
      },
    };

    await pageBuilderFirestore.savePage(newPage, db);
    const all = await pageBuilderFirestore.getAllPages(db);
    setPages(all);
    setCurrentPage(newPage);
    setViewMode('editor');
  };

  // Duplicate page
  const handleDuplicatePage = async (page: PageBuilderConfig) => {
    const duplicated = await pageBuilderFirestore.duplicatePage(page, db);
    const all = await pageBuilderFirestore.getAllPages(db);
    setPages(all);
    setCurrentPage(duplicated);
  };

  // Delete page
  const handleDeletePage = async (pageId: string) => {
    if (confirm('האם למחוק עמוד זה לצמיתות?')) {
      await pageBuilderFirestore.deletePage(pageId, db);
      const all = await pageBuilderFirestore.getAllPages(db);
      setPages(all);
      if (currentPage.pageId === pageId && all.length > 0) {
        setCurrentPage(all[0]);
      }
    }
  };

  // Set home page
  const handleSetHomePage = async (pageId: string) => {
    await pageBuilderFirestore.setHomePage(pageId, db);
    const all = await pageBuilderFirestore.getAllPages(db);
    setPages(all);
    if (currentPage.pageId === pageId) {
      setCurrentPage({ ...currentPage, isHomePage: true });
    }
  };

  // Toggle publish
  const handleTogglePublish = async (page: PageBuilderConfig) => {
    const updated = await pageBuilderFirestore.togglePublish(page, db);
    const all = await pageBuilderFirestore.getAllPages(db);
    setPages(all);
    if (currentPage.pageId === page.pageId) {
      setCurrentPage(updated);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-white select-none">
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

      {/* AI Live Page Generator Modal */}
      <AiLivePageBuilderModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onComplete={async (generatedConfig) => {
          await pageBuilderFirestore.savePage(generatedConfig, db);
          const all = await pageBuilderFirestore.getAllPages(db);
          setPages(all);
          setCurrentPage(generatedConfig);
          setViewMode('editor');
        }}
        onOpenMarketingDrawer={() => {
          setIsAiModalOpen(false);
          setIsMarketingDrawerOpen(true);
        }}
      />

      {/* URL Shortener Modal */}
      {selectedShortPage && (
        <UrlShortenerModal
          isOpen={isShortenerModalOpen}
          onClose={() => setIsShortenerModalOpen(false)}
          config={selectedShortPage}
          onSaveShortUrl={async (shortUrl, shortSlug) => {
            const updated = { ...selectedShortPage, shortUrl, shortSlug };
            await pageBuilderFirestore.savePage(updated, db);
            const all = await pageBuilderFirestore.getAllPages(db);
            setPages(all);
          }}
        />
      )}

      {/* Brand DNA Marketing Ideas Drawer */}
      <ContinuousMarketingIdeasDrawer
        isOpen={isMarketingDrawerOpen}
        onClose={() => setIsMarketingDrawerOpen(false)}
        onSelectIdea={(prompt) => {
          setIsMarketingDrawerOpen(false);
          setIsAiModalOpen(true);
        }}
      />
    </div>
  );
};

export const PageBuilderStandaloneView: React.FC = () => {
  return (
    <PageBuilderProvider>
      <PageBuilderStandaloneViewInner />
    </PageBuilderProvider>
  );
};

export default PageBuilderStandaloneView;
