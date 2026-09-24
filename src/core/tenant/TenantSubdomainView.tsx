import React, { useState, useEffect } from 'react';
import { TenantRecord } from '../../modules/saas-storefront-composer/types';
import { PageBuilderConfig } from '../../modules/page-builder/types/pageBuilder.types';
import { SECTION_REGISTRY } from '../../modules/page-builder/registry/sectionRegistry';
import { PageBuilderRenderer } from '../../modules/page-builder/PageBuilderRenderer';
import { pageBuilderFirestore } from '../../modules/page-builder/services/pageBuilderFirestore';
import { useSystemConnection } from '../connection/SystemConnectionContext';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { Globe, Lock, ArrowRight, Eye } from 'lucide-react';

export interface TenantSubdomainViewProps {
  tenantRecord: TenantRecord;
}

export const TenantSubdomainView: React.FC<TenantSubdomainViewProps> = ({ tenantRecord }) => {
  const { db } = useSystemConnection();

  // Mode state: 'public' (visitor landing page) or 'admin' (control panel / module editors)
  const [mode, setMode] = useState<'public' | 'admin'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'admin' || params.get('admin') === 'true' || params.get('edit') === 'true'
      ? 'admin'
      : 'public';
  });

  const [homePageConfig, setHomePageConfig] = useState<PageBuilderConfig | null>(null);

  // Generate fallback default landing page config customized for this tenant
  const createDefaultTenantPage = (): PageBuilderConfig => {
    const rawPhone = tenantRecord.ownerPhone ? tenantRecord.ownerPhone.replace(/[^0-9]/g, '') : '972500000000';
    const cleanWhatsApp = rawPhone.startsWith('0') ? `972${rawPhone.substring(1)}` : rawPhone;

    return {
      pageId: `home_${tenantRecord.subdomain}`,
      pageTitle: tenantRecord.clientName || `עמוד הבית - ${tenantRecord.subdomain}`,
      slug: 'home',
      published: true,
      isHomePage: true,
      viewsCount: 1,
      leadsCount: 0,
      globalSettings: {
        siteTitle: tenantRecord.clientName || `עסק ${tenantRecord.subdomain}`,
        companyName: tenantRecord.clientName || `עסק ${tenantRecord.subdomain}`,
        slogan: 'פתרונות דיגיטליים מתקדמים ומותאמים אישית',
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
        contactWhatsApp: cleanWhatsApp,
        contactPhone: tenantRecord.ownerPhone || '050-0000000',
        contactEmail: tenantRecord.ownerEmail || `${tenantRecord.subdomain}@kosun.pro`,
        address: 'ישראל',
      },
      seoSettings: {
        title: `${tenantRecord.clientName || tenantRecord.subdomain} - דף הבית הרשמי`,
        description: `ברוכים הבאים לאתר הרשמי של ${tenantRecord.clientName || tenantRecord.subdomain} בכתובת ${tenantRecord.fullDomain}`,
        keywords: [tenantRecord.clientName, tenantRecord.subdomain, 'אתר רשמי'],
        geo: {
          enabled: true,
          targetCity: 'תל אביב',
          targetRegion: 'ישראל',
          targetCountry: 'ישראל',
          serviceAreas: ['מרכז', 'שרון', 'צפון', 'דרום', 'ירושלים'],
          localBusinessName: tenantRecord.clientName || tenantRecord.subdomain,
          businessAddress: 'ישראל',
          businessPhone: tenantRecord.ownerPhone || '050-0000000',
          openingHours: 'א׳-ה׳: 09:00-18:00',
        },
      },
      sectionOrder: ['hero', 'services', 'statsBento', 'testimonials', 'pricing', 'faq', 'contact'],
      sections: {
        hero: {
          ...SECTION_REGISTRY.hero.defaultConfig,
          id: 'hero',
          badgeText: '🌟 ברוכים הבאים לאתר הרשמי',
          title: `ברוכים הבאים ל-${tenantRecord.clientName || tenantRecord.subdomain}`,
          subtitle: `הפלטפורמה והשירותים הדיגיטליים שלנו זמינים עבורכם ישירות בכתובת ${tenantRecord.fullDomain}`,
          ctaButtonText: 'צרו קשר עכשיו',
        },
        services: { ...SECTION_REGISTRY.services.defaultConfig, id: 'services' },
        statsBento: { ...SECTION_REGISTRY.statsBento.defaultConfig, id: 'statsBento' },
        testimonials: { ...SECTION_REGISTRY.testimonials.defaultConfig, id: 'testimonials' },
        pricing: { ...SECTION_REGISTRY.pricing.defaultConfig, id: 'pricing' },
        faq: { ...SECTION_REGISTRY.faq.defaultConfig, id: 'faq' },
        contact: {
          ...SECTION_REGISTRY.contact.defaultConfig,
          id: 'contact',
          title: 'דברו איתנו ישירות',
          subtitle: 'נשמח לעמוד לשירותכם בכל שאלה או בקשה',
        },
      },
    };
  };

  // Load or initialize page
  useEffect(() => {
    let isMounted = true;

    async function loadTenantHomePage() {
      try {
        const allPages = await pageBuilderFirestore.getAllPages(db);
        let targetPage = allPages.find((p) => p.isHomePage || p.pageId === `home_${tenantRecord.subdomain}`);
        
        if (!targetPage) {
          // Initialize customized default home page and save it
          const defaultPage = createDefaultTenantPage();
          await pageBuilderFirestore.savePage(defaultPage, db);
          targetPage = defaultPage;
        }

        if (isMounted) {
          setHomePageConfig(targetPage);
          if (typeof document !== 'undefined') {
            document.title = targetPage.seoSettings?.title || targetPage.pageTitle || tenantRecord.clientName;
          }
        }
      } catch (err) {
        console.warn('[TenantSubdomainView] Error loading home page:', err);
        if (isMounted) {
          setHomePageConfig(createDefaultTenantPage());
        }
      }
    }

    loadTenantHomePage();

    return () => {
      isMounted = false;
    };
  }, [db, tenantRecord.subdomain]);

  // 1. ADMIN MODE (Control Panel & Purchased Module Editors)
  if (mode === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 font-sans" dir="rtl">
        {/* Top Admin Status Bar */}
        <header className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-indigo-500/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">לוח בקרת סאב-דומיין (מנהל):</span>
            <span className="font-mono text-indigo-300 bg-slate-800 px-2 py-0.5 rounded">
              {tenantRecord.fullDomain}
            </span>
            <span className="text-gray-400 hidden md:inline">
              | DB מבודד: <code className="text-emerald-400 font-mono">{tenantRecord.collectionPrefix}*</code>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMode('public')}
              className="flex items-center gap-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition shadow-md shadow-emerald-600/20"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>צפייה באתר (עבור מבקרים)</span>
            </button>

            <button
              onClick={() => {
                window.location.href = window.location.origin;
              }}
              className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-gray-300 px-2.5 py-1.5 rounded-lg transition border border-slate-700"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">חזרה לחנות kosun.pro</span>
            </button>
          </div>
        </header>

        {/* Dynamic Client Shell with ONLY active modules and Page Builder Editor */}
        <div className="flex-1">
          <ClientPlatformProvider 
            tenantRecord={tenantRecord} 
            initialRoute={tenantRecord.activeModules && tenantRecord.activeModules.length > 0 ? tenantRecord.activeModules[0] : 'page-builder'}
          >
            <DynamicClientShell onExitToPublic={() => setMode('public')} />
          </ClientPlatformProvider>
        </div>
      </div>
    );
  }

  // 2. PUBLIC MODE (Visitor Landing Page - Default View for All Subdomains)
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] font-sans relative selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Discreet Subdomain Bar with Owner Login Button */}
      <div className="bg-slate-950/90 backdrop-blur-md text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-slate-200">{tenantRecord.clientName}</span>
          <span className="font-mono text-indigo-300 bg-slate-900 px-2 py-0.5 rounded text-[11px] border border-slate-800">
            {tenantRecord.fullDomain}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('admin')}
            className="flex items-center gap-1.5 text-[11px] bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg transition shadow-md shadow-indigo-600/20"
            title="כניסה לעריכת עמוד הבית וניהול הרכיבים"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-200" />
            <span>🔐 לוח בקרה / ניהול אתר</span>
          </button>
        </div>
      </div>

      {/* Main Page Builder Stream for Visitors */}
      <div className="flex-1">
        {homePageConfig ? (
          <PageBuilderRenderer
            config={homePageConfig}
            onSelectDonationTier={(tierId, mode) => {
              console.log('[TenantSubdomainView] Selected tier:', tierId, mode);
            }}
            onLeadSubmit={(formData) => {
              console.log('[TenantSubdomainView] Lead submit:', formData);
            }}
          />
        ) : (
          <div className="w-full h-96 flex items-center justify-center text-slate-400 text-sm">
            טוען עמוד נחיתה...
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantSubdomainView;
