import React, { useEffect, useState } from 'react';
import { PageBuilderConfig } from '../modules/page-builder/types/pageBuilder.types';
import { PageBuilderRenderer } from '../modules/page-builder/PageBuilderRenderer';
import { FloatingSystemDock } from '../components/Navigation/FloatingSystemDock';

interface RootPublicHomePageViewProps {
  pageConfig: PageBuilderConfig;
  onEnterDevWorkbench?: () => void;
}

export const RootPublicHomePageView: React.FC<RootPublicHomePageViewProps> = ({
  pageConfig,
  onEnterDevWorkbench,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kosun_theme') as 'light' | 'dark') || 
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const newTheme = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTheme(newTheme);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title =
        pageConfig.seoSettings?.title ||
        pageConfig.globalSettings?.siteTitle ||
        pageConfig.pageTitle ||
        'Kosun Platform';
    }
  }, [pageConfig]);

  const effectivePageConfig = React.useMemo(() => {
    if (!pageConfig || !pageConfig.sections) return pageConfig;
    const hasHeader = Object.values(pageConfig.sections).some((s: any) => s && s.type === 'header');
    if (hasHeader) return pageConfig;

    const headerId = 'header-1';
    const headerSection = {
      id: headerId,
      type: 'header',
      visible: true,
      anchorId: 'header',
      layout: (pageConfig.globalSettings?.headerLayout as any) || 'floating-glass',
      sticky: pageConfig.globalSettings?.headerSticky ?? true,
      useBrandLogo: true,
      showLogoText: true,
      logoText: pageConfig.globalSettings?.companyName || 'קושאן',
      menuMode: 'dynamic-tenant',
      showLoginButton: true,
      showCtaButton: true,
      ctaButtonText: 'התחל עכשיו',
      ctaButtonUrl: '#contact',
      showPhone: Boolean(pageConfig.globalSettings?.contactPhone),
      phone: pageConfig.globalSettings?.contactPhone || '052-6968008',
      showWhatsApp: Boolean(pageConfig.globalSettings?.contactWhatsApp),
      whatsApp: pageConfig.globalSettings?.contactWhatsApp || '0526968008',
    };

    return {
      ...pageConfig,
      sectionOrder: [headerId, ...(pageConfig.sectionOrder || []).filter((id) => id !== headerId)],
      sections: {
        [headerId]: headerSection,
        ...pageConfig.sections,
      },
    };
  }, [pageConfig]);

  return (
    <div className={`min-h-screen flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white transition-colors duration-300 pb-20 ${
      theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0a0a0c] text-white'
    }`} dir="rtl">
      {/* Render the Custom Page Builder Homepage (Includes editable Header section at top) */}
      <main className="flex-1">
        <PageBuilderRenderer
          config={effectivePageConfig}
          onSelectDonationTier={(tierId, mode) => {
            console.log('[RootHomePage] Selected tier:', tierId, mode);
          }}
          onLeadSubmit={(formData) => {
            console.log('[RootHomePage] Lead submitted:', formData);
          }}
        />
      </main>

      {/* Floating System Dock (Cashwan Standard - Headerless Floating Dock at bottom) */}
      <FloatingSystemDock
        editPageUrl="/page-builder"
        onEnterDevWorkbench={onEnterDevWorkbench}
      />
    </div>
  );
};

export default RootPublicHomePageView;
