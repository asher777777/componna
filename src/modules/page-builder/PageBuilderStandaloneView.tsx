import React, { useState, useEffect } from 'react';
import { PageBuilderConfig, SectionType } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { PageBuilderEditor } from './PageBuilderEditor';
import { PageBuilderRenderer } from './PageBuilderRenderer';
import { PagesDashboardTab } from './components/PagesDashboardTab';
import { AiLivePageBuilderModal } from './components/AiLivePageBuilderModal';
import { UrlShortenerModal } from './components/UrlShortenerModal';
import { pageBuilderFirestore } from './services/pageBuilderFirestore';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { useBrandDna } from '../brand-dna-hub/hooks/useBrandDna';
import { Layers, Edit3, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'comona_pagebuilder_current_page';

const DEMO_INITIAL_CONFIG: PageBuilderConfig = {
  pageId: 'demo-homepage',
  pageTitle: 'עמוד הבית הראשי 2026',
  slug: 'home',
  published: true,
  isHomePage: true,
  viewsCount: 1420,
  leadsCount: 38,
  globalSettings: {
    siteTitle: 'הפלטפורמה הדיגיטלית המובילה',
    companyName: 'הארגון המוביל',
    slogan: 'חדשנות, איכות וצמיחה מתמדת',
    theme: 'modern',
    headerLayout: 'floating-glass',
    headerSticky: true,
    isHeaderVisible: true,
    isFooterVisible: true,
    primaryColor: '#6366f1',
    secondaryColor: '#0ea5e9',
    backgroundColor: '#0a0a0c',
    textColor: '#f8fafc',
    buttonBgColor: '#6366f1',
    fontFamily: 'Heebo, sans-serif',
    contactWhatsApp: '972545947701',
    contactPhone: '03-5551234',
    contactEmail: 'contact@example.org',
    address: 'דרך מנחם בגין 144, תל אביב',
  },
  seoSettings: {
    title: 'הפלטפורמה המובילה - דפי נחיתה וניהול קהילות',
    description: 'עצבו ופרסמו דפי אינטרנט מתקדמים ב-AI עם תמיכה מלאה ב-GEO SEO, מחירונים חכמים ו-WhatsApp.',
    keywords: ['דפי נחיתה', 'קהילות', 'שירותים דיגיטליים', 'AI Page Builder'],
    geo: {
      enabled: true,
      targetCity: 'תל אביב',
      targetRegion: 'גוש דן והמרכז',
      targetCountry: 'ישראל',
      serviceAreas: ['תל אביב וגוש דן', 'ירושלים והסביבה', 'השרון', 'צפון ודרום'],
      localBusinessName: 'הארגון המוביל',
      businessAddress: 'דרך מנחם בגין 144, תל אביב',
      businessPhone: '03-5551234',
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
};

export const PageBuilderStandaloneView: React.FC = () => {
  const { db } = useSystemConnection();
  const { brandDna } = useBrandDna();

  const [viewMode, setViewMode] = useState<'pages' | 'editor' | 'public'>('pages');
  const [pages, setPages] = useState<PageBuilderConfig[]>([DEMO_INITIAL_CONFIG]);
  const [currentPage, setCurrentPage] = useState<PageBuilderConfig>(DEMO_INITIAL_CONFIG);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isShortenerModalOpen, setIsShortenerModalOpen] = useState(false);
  const [selectedShortPage, setSelectedShortPage] = useState<PageBuilderConfig | null>(null);

  // Load all pages from Firestore / LocalStorage
  useEffect(() => {
    const loadData = async () => {
      const all = await pageBuilderFirestore.getAllPages(db);
      if (all.length > 0) {
        setPages(all);
        const home = all.find((p) => p.isHomePage) || all[0];
        setCurrentPage(home);
      } else {
        // Save initial demo
        await pageBuilderFirestore.savePage(DEMO_INITIAL_CONFIG, db);
        setPages([DEMO_INITIAL_CONFIG]);
      }
    };
    loadData();
  }, [db]);

  // Save current page handler
  const handleSavePage = async (updated: PageBuilderConfig) => {
    setCurrentPage(updated);
    await pageBuilderFirestore.savePage(updated, db);
    const all = await pageBuilderFirestore.getAllPages(db);
    setPages(all);
  };

  // Create empty new page
  const handleCreateNewPage = async () => {
    const newId = `page_${Date.now()}`;
    const newPage: PageBuilderConfig = {
      pageId: newId,
      pageTitle: 'דף נחיתה חדש',
      slug: `page-${Math.floor(Math.random() * 9000 + 1000)}`,
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        ...DEMO_INITIAL_CONFIG.globalSettings,
        siteTitle: 'דף נחיתה חדש',
        primaryColor: brandDna?.designTokens?.primaryColor || '#6366f1',
        companyName: brandDna?.identity?.companyName || 'החברה המובילה',
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
        />
      ) : (
        <PageBuilderEditor
          initialConfig={currentPage}
          onSaveConfig={handleSavePage}
          onGoToPagesList={() => setViewMode('pages')}
          onClose={() => setViewMode('pages')}
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
    </div>
  );
};

export default PageBuilderStandaloneView;
