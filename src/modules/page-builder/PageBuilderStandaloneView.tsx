import React, { useState, useEffect } from 'react';
import { PageBuilder } from './PageBuilder';
import { PageBuilderConfig } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_KEY = 'comona_pagebuilder_current_page';

const DEMO_INITIAL_CONFIG: PageBuilderConfig = {
  pageId: 'demo-homepage',
  pageTitle: 'עמוד הבית הראשי',
  slug: 'home',
  globalSettings: {
    siteTitle: 'מרכז הקהילה והחסד',
    companyName: 'עמותת החסד והתורה',
    slogan: 'מחברים לבבות, בונים עתיד משותף',
    theme: 'navy',
    headerLayout: 'classic',
    headerSticky: true,
    isHeaderVisible: true,
    isFooterVisible: true,
    primaryColor: '#4f46e5',
    secondaryColor: '#ec4899',
    backgroundColor: '#0a0a0c',
    textColor: '#f8fafc',
    buttonBgColor: '#4f46e5',
    contactWhatsApp: '972545947701',
    contactPhone: '03-5551234',
    contactEmail: 'contact@example.org',
    address: 'רחוב הרצל 1, תל אביב',
  },
  seoSettings: {
    title: 'מרכז הקהילה והחסד - האתר הרשמי',
    description: 'הצטרפו לפעילות הקהילתית, שיעורים, עדכונים, פרויקטים וקמפיין גיוס משותף.',
    keywords: ['קהילה', 'חסד', 'תרומות', 'שיעורים', 'הדרכה'],
  },
  sectionOrder: [
    'hero',
    'campaignHeader',
    'campaignTiers',
    'services',
    'mainContent',
    'videoGallery',
    'timer',
    'pricing',
    'faq',
    'community',
    'livePosts',
    'landingSection',
    'smartForm',
    'contact',
  ],
  sections: {
    hero: { ...SECTION_REGISTRY.hero.defaultConfig, id: 'hero' },
    campaignHeader: { ...SECTION_REGISTRY.campaignHeader.defaultConfig, id: 'campaignHeader' },
    campaignTiers: { ...SECTION_REGISTRY.campaignTiers.defaultConfig, id: 'campaignTiers' },
    services: { ...SECTION_REGISTRY.services.defaultConfig, id: 'services' },
    mainContent: { ...SECTION_REGISTRY.mainContent.defaultConfig, id: 'mainContent' },
    videoGallery: { ...SECTION_REGISTRY.videoGallery.defaultConfig, id: 'videoGallery' },
    timer: { ...SECTION_REGISTRY.timer.defaultConfig, id: 'timer' },
    pricing: { ...SECTION_REGISTRY.pricing.defaultConfig, id: 'pricing' },
    faq: { ...SECTION_REGISTRY.faq.defaultConfig, id: 'faq' },
    community: { ...SECTION_REGISTRY.community.defaultConfig, id: 'community' },
    livePosts: { ...SECTION_REGISTRY.livePosts.defaultConfig, id: 'livePosts' },
    landingSection: { ...SECTION_REGISTRY.landingSection.defaultConfig, id: 'landingSection' },
    smartForm: { ...SECTION_REGISTRY.smartForm.defaultConfig, id: 'smartForm' },
    contact: { ...SECTION_REGISTRY.contact.defaultConfig, id: 'contact' },
  },
};

export const PageBuilderStandaloneView: React.FC = () => {
  const { db } = useSystemConnection();
  const [pageConfig, setPageConfig] = useState<PageBuilderConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_INITIAL_CONFIG;
  });

  // Real-time Firestore sync for the page definition
  useEffect(() => {
    if (!db) return;
    try {
      const pageDocRef = doc(db, 'mod_pagebuilder_pages', 'demo-homepage');
      const unsub = onSnapshot(
        pageDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as PageBuilderConfig;
            setPageConfig(data);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch {}
          }
        },
        (err) => {
          console.warn('[PageBuilder] Firestore listener notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('[PageBuilder] Firestore subscription setup notice:', e);
    }
  }, [db]);

  const handleSaveConfig = async (savedConfig: PageBuilderConfig) => {
    setPageConfig(savedConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfig));
    } catch {}

    if (db) {
      try {
        const pageId = savedConfig.pageId || 'demo-homepage';
        const pageDocRef = doc(db, 'mod_pagebuilder_pages', pageId);
        const cleanPayload = JSON.parse(JSON.stringify({ ...savedConfig, updatedAt: new Date().toISOString() }));
        await setDoc(pageDocRef, cleanPayload, { merge: true });
      } catch (err) {
        console.warn('[PageBuilder] Firestore save notice:', err);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#09090b]">
      <PageBuilder initialConfig={pageConfig} onSaveConfig={handleSaveConfig} editable={true} />
    </div>
  );
};

export default PageBuilderStandaloneView;
