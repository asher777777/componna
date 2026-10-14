import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, NavLink, Navigate } from 'react-router-dom';
import { TenantRecord } from '../../modules/saas-storefront-composer/types';
import { PageBuilderConfig } from '../../modules/KosWebAi/types/pageBuilder.types';
import { SECTION_REGISTRY } from '../../modules/KosWebAi/registry/sectionRegistry';
import { PageBuilderRenderer } from '../../modules/KosWebAi/PageBuilderRenderer';
import { pageBuilderFirestore } from '../../modules/KosWebAi/services/pageBuilderFirestore';
import { useSystemConnection } from '../connection/SystemConnectionContext';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { ControlCenterStandaloneView } from '../../modules/control-center-hub/StandaloneView';
import { BrandDnaHubStandaloneView } from '../../modules/KosBranding';
import { REGISTERED_MODULES } from '../../workbench/moduleRegistry';
import { ModuleErrorBoundary } from '../../workbench/components/ModuleErrorBoundary';
import { ModuleLoadingFallback } from '../../workbench/components/ModuleLoadingFallback';
import { Globe, Lock, ArrowRight, Eye, LayoutDashboard, Sparkles, LayoutGrid } from 'lucide-react';
import { DashboardFirestoreService } from '../../modules/kosun-board-composer/services/dashboardFirestoreService';
import { DynamicCustomDashboardView } from '../../modules/kosun-board-composer/components/DynamicCustomDashboardView';
import { GeneratedCustomDashboard } from '../../modules/kosun-board-composer/types';
import { KosunBoardProvider } from '../../modules/kosun-board-composer/context/ModuleContext';
import { KosWebAiFrontDock } from '../../modules/KosWebAi';
import { TenantAdminLoginView } from './TenantAdminLoginView';
import { TenantAuthService } from '../../modules/KosTenantProvisioner/services/tenantAuthService';
import { Grid, Sun, Moon, LogOut, ChevronLeft, Check } from 'lucide-react';

export interface TenantSubdomainViewProps {
  tenantRecord: TenantRecord;
}

export const TenantSubdomainView: React.FC<TenantSubdomainViewProps> = ({ tenantRecord }) => {
  const { db } = useSystemConnection();

  const location = useLocation();

  // Mode state: 'public' (visitor landing page) or 'admin' (control panel / module editors)
  const [mode, setMode] = useState<'public' | 'admin'>(() => {
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    if (params.get('mode') === 'admin' || params.get('admin') === 'true' || params.get('edit') === 'true') {
      return 'admin';
    }
    // Any module or control-center route is inherently admin mode
    if (pathname !== '/' && !pathname.startsWith('/p/') && !pathname.startsWith('/page/')) {
      return 'admin';
    }
    if (sessionStorage.getItem(`tenant_admin_${tenantRecord.subdomain}`) === 'true') {
      return 'admin';
    }
    return 'public';
  });

  useEffect(() => {
    sessionStorage.setItem(`tenant_admin_${tenantRecord.subdomain}`, mode === 'admin' ? 'true' : 'false');
  }, [mode, tenantRecord.subdomain]);

  const isControlCenter = location.pathname === '/' || location.pathname.startsWith('/control-center');

  const [homePageConfig, setHomePageConfig] = useState<PageBuilderConfig | null>(() => {
    return pageBuilderFirestore.getHomePageSync(tenantRecord.subdomain);
  });

  const [customDashboard, setCustomDashboard] = useState<GeneratedCustomDashboard | null>(null);
  const [adminViewType, setAdminViewType] = useState<'custom_board' | 'standard'>('custom_board');

  useEffect(() => {
    let isMounted = true;
    DashboardFirestoreService.getDashboardsForTenant(db, tenantRecord.subdomain).then((list) => {
      if (!isMounted) return;
      const matched =
        list.find((d) => d.pairedSubdomain?.toLowerCase() === tenantRecord.subdomain.toLowerCase()) ||
        list[0] ||
        null;
      setCustomDashboard(matched);
    }).catch((err) => {
      console.warn('[TenantSubdomainView] Error fetching custom dashboard:', err);
    });
    return () => {
      isMounted = false;
    };
  }, [db, tenantRecord.subdomain]);

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
        // 1. Try to get designated homepage for this subdomain
        const targetPage = await pageBuilderFirestore.getHomePage(db, tenantRecord.subdomain);
        
        if (targetPage) {
          if (isMounted) {
            setHomePageConfig(targetPage);
            if (typeof document !== 'undefined') {
              document.title = targetPage.seoSettings?.title || targetPage.pageTitle || tenantRecord.clientName;
            }
          }
          return;
        }

        // 2. If no homepage flag is active, check if any pages exist for this tenant
        const allPages = await pageBuilderFirestore.getAllPages(db, tenantRecord.subdomain);
        if (allPages.length > 0) {
          if (isMounted) {
            setHomePageConfig(allPages[0]);
            if (typeof document !== 'undefined') {
              document.title = allPages[0].seoSettings?.title || allPages[0].pageTitle || tenantRecord.clientName;
            }
          }
          return;
        }

        // 3. Fallback: Initialize customized default home page and save it scoped to tenant
        const defaultPage = createDefaultTenantPage();
        await pageBuilderFirestore.savePage(defaultPage, db, tenantRecord.subdomain);
        await pageBuilderFirestore.setHomePage(defaultPage.pageId, db, tenantRecord.subdomain);
        
        if (isMounted) {
          setHomePageConfig(defaultPage);
        }
      } catch (err) {
        console.warn('[TenantSubdomainView] Error loading home page:', err);
        if (isMounted) {
          setHomePageConfig(createDefaultTenantPage());
        }
      }
    }

    loadTenantHomePage();

    // Listen to homepage changes dispatched from PageBuilder
    const handleHomeChange = (e: any) => {
      const changed = e?.detail?.tenantId;
      if (!changed || changed === tenantRecord.subdomain) {
        loadTenantHomePage();
      }
    };
    window.addEventListener('kosun_homepage_changed', handleHomeChange);

    return () => {
      isMounted = false;
      window.removeEventListener('kosun_homepage_changed', handleHomeChange);
    };
  }, [db, tenantRecord.subdomain, mode]);

  const [authVersion, setAuthVersion] = useState(0);
  const [isKosNevOpen, setIsKosNevOpen] = useState(false);
  const [tenantTheme, setTenantTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(`kosun_theme_${tenantRecord.subdomain}`) as 'light' | 'dark') || 'light';
  });

  const toggleTenantTheme = () => {
    const next = tenantTheme === 'dark' ? 'light' : 'dark';
    setTenantTheme(next);
    try {
      localStorage.setItem(`kosun_theme_${tenantRecord.subdomain}`, next);
    } catch {}
  };

  const isAuthenticated = TenantAuthService.isTenantAuthenticated(tenantRecord.subdomain);

  // 1. ADMIN LOGIN GUARD: Check tenant admin authentication
  if (mode === 'admin' && !isAuthenticated) {
    return (
      <TenantAdminLoginView
        tenantRecord={tenantRecord}
        onLoginSuccess={() => setAuthVersion((v) => v + 1)}
        onBackToPublic={() => setMode('public')}
      />
    );
  }

  // Active provisioned modules for this tenant (KosBranding is the core branding dashboard)
  const activeModuleIds = tenantRecord.activeModules || ['KosBranding', 'KosWebAi', 'KSF'];
  const allowedModules = REGISTERED_MODULES.filter((m) => {
    if (m.id === 'KosBranding' || m.id === 'control-center-hub' || m.id === 'kosun-board-composer') return true;
    return activeModuleIds.includes(m.id);
  });

  // 2. ADMIN MODE (Full Manager Shell - Exact UI Mirror of Workbench with 100% Tenant Isolation)
  if (mode === 'admin') {
    return (
      <div className={`flex flex-col h-screen w-screen overflow-hidden ${tenantTheme === 'dark' ? 'dark bg-[#0a0a0c] text-slate-100' : 'bg-slate-50 text-slate-900'} relative font-sans transition-colors duration-300`} dir="rtl">
        {/* 2026 Kosun Standard: 100% Headerless - Zero Top Header (Exact UI Mirror of Manager Workbench) */}

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0a0a0c] relative transition-colors duration-300">
            <Routes>
              {/* Default redirects to Brand DNA or custom board */}
              <Route
                path="/"
                element={
                  customDashboard && adminViewType === 'custom_board' ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/brand-dna" replace />
                  )
                }
              />
              <Route path="/brand-dna/*" element={<BrandDnaHubStandaloneView />} />
              <Route path="/KosBranding/*" element={<BrandDnaHubStandaloneView />} />
              <Route path="/branding/*" element={<BrandDnaHubStandaloneView />} />
              <Route path="/control-center/*" element={<ControlCenterStandaloneView />} />
              <Route
                path="/dashboard/*"
                element={
                  customDashboard ? (
                    <KosunBoardProvider>
                      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                        <DynamicCustomDashboardView dashboard={customDashboard} />
                      </div>
                    </KosunBoardProvider>
                  ) : (
                    <Navigate to="/brand-dna" replace />
                  )
                }
              />
              {/* All provisioned modules with exact same routes as Manager Workbench */}
              {allowedModules.map((module) => {
                const Component = module.component;
                return (
                  <Route
                    key={module.id}
                    path={`${module.route}/*`}
                    element={
                      <ModuleErrorBoundary moduleName={module.name}>
                        <Suspense fallback={<ModuleLoadingFallback moduleName={module.name} />}>
                          <Component />
                        </Suspense>
                      </ModuleErrorBoundary>
                    }
                  />
                );
              })}
              {/* Fallback alias routes for full workbench compatibility */}
              <Route path="/smart-forms/*" element={<Navigate to="/ksf" replace />} />
              <Route path="*" element={<Navigate to="/brand-dna" replace />} />
            </Routes>
          </main>
        </div>

        {/* Floating Kosun System Dock - Zero intrusive top header */}
        <nav 
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in"
          dir="rtl"
        >
          {/* KosNev Module Launcher Button */}
          <button
            type="button"
            onClick={() => setIsKosNevOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            title="תפריט רכיבים מוטענים (KosNev)"
          >
            <Grid className="w-4 h-4" />
            <span className="font-mono">KosNev</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </button>

          {/* Subdomain domain badge */}
          <span className="font-mono text-[11px] text-slate-300 px-2 py-1 bg-slate-800/80 rounded-lg border border-slate-700 hidden sm:inline-block" dir="ltr">
            {tenantRecord.fullDomain}
          </span>

          {/* View as Visitor */}
          <button
            type="button"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('admin');
              url.pathname = '/';
              window.location.href = url.toString();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
            title="צפייה באתר כפי שרואה מבקר"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">צפייה באתר</span>
          </button>

          {/* Day / Night Theme Toggle */}
          <button
            type="button"
            onClick={toggleTenantTheme}
            className="p-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-amber-400 transition cursor-pointer"
            title={tenantTheme === 'dark' ? 'מעבר למצב יום' : 'מעבר למצב לילה'}
          >
            {tenantTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              TenantAuthService.logoutTenant(tenantRecord.subdomain);
              const url = new URL(window.location.href);
              url.searchParams.delete('admin');
              url.pathname = '/';
              window.location.href = url.toString();
            }}
            className="p-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 transition cursor-pointer"
            title="התנתק ממערכת הניהול"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </nav>

        {/* KosNev Module Launcher Modal (Exact Manager UI Launcher) */}
        {isKosNevOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col animate-scaleUp">
              
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      KosNev - רכיבים מוטענים
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      הרכיבים המופעלים בסאב-דומיין {tenantRecord.fullDomain}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsKosNevOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-3">
                {allowedModules.map((module) => {
                  const isActive = location.pathname.startsWith(module.route);
                  return (
                    <NavLink
                      key={module.id}
                      to={module.route}
                      onClick={() => setIsKosNevOpen(false)}
                      className={`text-right w-full p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isActive ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          <Grid className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className={`font-bold text-sm block truncate ${isActive ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>
                            {module.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                            {module.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" dir="ltr">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          {module.id}
                        </span>
                        <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      </div>
                    </NavLink>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* Floating Return Pill for other modules (when not in control center) */}
        {!isControlCenter && (
          <NavLink
            to="/control-center"
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-950/90 hover:bg-indigo-600 text-white rounded-2xl border border-indigo-500/30 hover:border-indigo-400 shadow-2xl backdrop-blur-xl transition group text-xs font-bold cursor-pointer"
            title="חזרה מהירה למרכז השליטה"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-white" />
            <span>מרכז השליטה</span>
          </NavLink>
        )}
      </div>
    );
  }

  // 2. PUBLIC MODE (Visitor Landing Page - Default View for All Subdomains)
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0c] font-sans relative selection:bg-indigo-500 selection:text-white" dir="rtl">
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

      <KosWebAiFrontDock pageId={homePageConfig?.pageId} />
    </div>
  );
};

export default TenantSubdomainView;
