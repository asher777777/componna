import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Routes, Route, useLocation, NavLink, Navigate } from 'react-router-dom';
import { TenantRecord } from '../contracts';
import { PageBuilderConfig, SectionType } from '../../modules/KosWebAi/types/pageBuilder.types';
import { SECTION_REGISTRY } from '../../modules/KosWebAi/registry/sectionRegistry';
import { PageBuilderRenderer } from '../../modules/KosWebAi/PageBuilderRenderer';
import { pageBuilderFirestore, ensureHeaderSection } from '../../modules/KosWebAi/services/pageBuilderFirestore';
import { useSystemConnection } from '../connection/SystemConnectionContext';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { BrandDnaHubStandaloneView } from '../../modules/KosBranding';
import { FloatingSystemDock, CashwanDynamicMenu } from '../../components/Navigation/FloatingSystemDock';
import { TenantSyncSettingsModal } from '../../components/Navigation/TenantSyncSettingsModal';
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
    if (params.get('mode') === 'public' || params.get('public') === 'true') {
      return 'public';
    }
    if (params.get('mode') === 'admin' || params.get('admin') === 'true' || params.get('edit') === 'true') {
      return 'admin';
    }
    // Any module or control-center route is inherently admin mode
    if (pathname !== '/' && !pathname.startsWith('/p/') && !pathname.startsWith('/page/')) {
      return 'admin';
    }
    // If root path '/' without explicit admin query, default to public homepage!
    if (pathname === '/' || pathname === '') {
      return 'public';
    }
    if (sessionStorage.getItem(`tenant_admin_${tenantRecord.subdomain}`) === 'true') {
      return 'admin';
    }
    return 'public';
  });

  useEffect(() => {
    sessionStorage.setItem(`tenant_admin_${tenantRecord.subdomain}`, mode === 'admin' ? 'true' : 'false');
  }, [mode, tenantRecord.subdomain]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'public' || params.get('public') === 'true') {
      setMode('public');
      sessionStorage.setItem(`tenant_admin_${tenantRecord.subdomain}`, 'false');
    } else if (params.get('mode') === 'admin' || params.get('admin') === 'true' || params.get('edit') === 'true') {
      setMode('admin');
      sessionStorage.setItem(`tenant_admin_${tenantRecord.subdomain}`, 'true');
    }
  }, [location.search, tenantRecord.subdomain]);

  useEffect(() => {
    const handleGoToPublicHome = () => {
      setMode('public');
      sessionStorage.setItem(`tenant_admin_${tenantRecord.subdomain}`, 'false');
    };
    window.addEventListener('kosun_navigate_home', handleGoToPublicHome);
    return () => window.removeEventListener('kosun_navigate_home', handleGoToPublicHome);
  }, [tenantRecord.subdomain]);

  const isControlCenter = location.pathname === '/' || location.pathname.startsWith('/control-center');

  const [homePageConfig, setHomePageConfig] = useState<PageBuilderConfig | null>(() => {
    return pageBuilderFirestore.getHomePageSync(tenantRecord.subdomain);
  });

  const [currentPageConfig, setCurrentPageConfig] = useState<PageBuilderConfig | null>(() => {
    const init = pageBuilderFirestore.getHomePageSync(tenantRecord.subdomain);
    return init ? ensureHeaderSection(init) : null;
  });

  const [isEditing, setIsEditing] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('edit') === 'true';
    }
    return false;
  });

  const [isSaving, setIsSaving] = useState(false);

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
            const enriched = ensureHeaderSection(targetPage);
            setHomePageConfig(enriched);
            setCurrentPageConfig(enriched);
            if (typeof document !== 'undefined') {
              document.title = enriched.seoSettings?.title || enriched.pageTitle || tenantRecord.clientName;
            }
          }
          return;
        }

        // 2. If no homepage flag is active, check if any pages exist for this tenant
        const allPages = await pageBuilderFirestore.getAllPages(db, tenantRecord.subdomain);
        if (allPages.length > 0) {
          if (isMounted) {
            const enriched = ensureHeaderSection(allPages[0]);
            setHomePageConfig(enriched);
            setCurrentPageConfig(enriched);
            if (typeof document !== 'undefined') {
              document.title = enriched.seoSettings?.title || enriched.pageTitle || tenantRecord.clientName;
            }
          }
          return;
        }

        // 3. Fallback: Initialize customized default home page and save it scoped to tenant
        const defaultPage = ensureHeaderSection(createDefaultTenantPage());
        await pageBuilderFirestore.savePage(defaultPage, db, tenantRecord.subdomain);
        await pageBuilderFirestore.setHomePage(defaultPage.pageId, db, tenantRecord.subdomain);
        
        if (isMounted) {
          setHomePageConfig(defaultPage);
          setCurrentPageConfig(defaultPage);
        }
      } catch (err) {
        console.warn('[TenantSubdomainView] Error loading home page:', err);
        if (isMounted) {
          const fallback = ensureHeaderSection(createDefaultTenantPage());
          setHomePageConfig(fallback);
          setCurrentPageConfig(fallback);
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
  useEffect(() => {
    const handleOpen = () => setIsKosNevOpen(true);
    const handleOpenSettings = () => setIsSettingsModalOpen(true);
    window.addEventListener('kosun_open_modules_menu', handleOpen);
    window.addEventListener('kosun_open_tenant_settings', handleOpenSettings);
    return () => {
      window.removeEventListener('kosun_open_modules_menu', handleOpen);
      window.removeEventListener('kosun_open_tenant_settings', handleOpenSettings);
    };
  }, []);
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

  const toggleEditMode = useCallback(async () => {
    if (isEditing) {
      setIsSaving(true);
      try {
        if (currentPageConfig) {
          await pageBuilderFirestore.savePage(currentPageConfig, db, tenantRecord.subdomain);
        }
      } catch (err) {
        console.warn('[TenantSubdomainView] Failed to save page on exit edit mode:', err);
      } finally {
        setIsSaving(false);
      }
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent('kosun_edit_mode_changed', { detail: { isEditMode: false } }));
    } else {
      setIsEditing(true);
      window.dispatchEvent(new CustomEvent('kosun_edit_mode_changed', { detail: { isEditMode: true } }));
    }
  }, [isEditing, currentPageConfig, db, tenantRecord.subdomain]);

  const handleUpdateSection = useCallback((sectionId: string, updatedData: any) => {
    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: updatedData,
        },
      };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  const handleSaveSection = useCallback(async (sectionId: string, updatedData?: any) => {
    let nextToSave: PageBuilderConfig | null = null;
    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        sections: {
          ...prev.sections,
          ...(updatedData ? { [sectionId]: updatedData } : {}),
        },
      };
      nextToSave = next;
      return next;
    });
    if (nextToSave) {
      await pageBuilderFirestore.savePage(nextToSave, db, tenantRecord.subdomain);
    }
  }, [db, tenantRecord.subdomain]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    if (!window.confirm('האם למחוק אזור זה מהעמוד?')) return;
    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const nextOrder = prev.sectionOrder.filter((id) => id !== sectionId);
      const nextSections = { ...prev.sections };
      delete nextSections[sectionId];
      const next = {
        ...prev,
        sectionOrder: nextOrder,
        sections: nextSections,
      };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  const handleDuplicateSection = useCallback((sectionId: string) => {
    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const src = prev.sections[sectionId];
      if (!src) return prev;
      const newId = `${src.type}_${Date.now()}`;
      const newIndex = prev.sectionOrder.indexOf(sectionId) + 1;
      const nextOrder = [...prev.sectionOrder];
      nextOrder.splice(newIndex, 0, newId);

      const next = {
        ...prev,
        sectionOrder: nextOrder,
        sections: {
          ...prev.sections,
          [newId]: {
            ...src,
            id: newId,
            adminTitle: `${src.adminTitle || src.type} (משוכפל)`,
          },
        },
      };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const nextOrder = [...prev.sectionOrder];
      const temp = nextOrder[index - 1];
      nextOrder[index - 1] = nextOrder[index];
      nextOrder[index] = temp;
      const next = { ...prev, sectionOrder: nextOrder };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  const handleMoveDown = useCallback((index: number) => {
    setCurrentPageConfig((prev) => {
      if (!prev || index >= prev.sectionOrder.length - 1) return prev;
      const nextOrder = [...prev.sectionOrder];
      const temp = nextOrder[index + 1];
      nextOrder[index + 1] = nextOrder[index];
      nextOrder[index] = temp;
      const next = { ...prev, sectionOrder: nextOrder };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  const handleToggleVisibility = useCallback((sectionId: string) => {
    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const current = prev.sections[sectionId];
      if (!current) return prev;
      const next = {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: {
            ...current,
            visible: current.visible === false ? true : false,
          },
        },
      };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  const handleAddSection = useCallback((type: SectionType, insertIndex?: number) => {
    const regDef = SECTION_REGISTRY[type];
    const newId = `${type}_${Date.now()}`;
    const defaultData = regDef?.defaultConfig
      ? { ...regDef.defaultConfig, id: newId }
      : { id: newId, type, visible: true, title: regDef?.name || type };

    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const nextOrder = [...prev.sectionOrder];
      if (typeof insertIndex === 'number' && insertIndex >= 0) {
        nextOrder.splice(insertIndex, 0, newId);
      } else {
        nextOrder.push(newId);
      }
      const next = {
        ...prev,
        sectionOrder: nextOrder,
        sections: {
          ...prev.sections,
          [newId]: defaultData,
        },
      };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  const handleUpdateGlobalSettings = useCallback((updatedGlobalSettings: any) => {
    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        globalSettings: updatedGlobalSettings,
      };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  const effectivePageConfig = React.useMemo(() => {
    if (!currentPageConfig) return homePageConfig ? ensureHeaderSection(homePageConfig) : null;
    return ensureHeaderSection(currentPageConfig);
  }, [currentPageConfig, homePageConfig]);

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

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // System modules that should NEVER appear on a subdomain
  const SYSTEM_MODULES = new Set([
    'auth-portal',
    'db-collections-hub',
    'db-connector-hub',
    'KosTenantProvisioner',
    'template',
    '_template',
    'control-center-hub',
    'saas-storefront-composer',
  ]);

  // Active provisioned modules for this tenant (strictly limited to tenant's active collection)
  const activeModuleIds = tenantRecord.activeModules || [];
  const allowedModules = REGISTERED_MODULES.filter((m) => {
    if (SYSTEM_MODULES.has(m.id)) return false;
    return activeModuleIds.includes(m.id);
  });

  // 2. ADMIN MODE (Full Manager Shell - Exact UI Mirror of Workbench with 100% Tenant Isolation)
  if (mode === 'admin') {
    const subQuery = `?tenant=${tenantRecord.subdomain}&mode=admin`;
    const defaultRoute = customDashboard && adminViewType === 'custom_board'
      ? `/dashboard${subQuery}`
      : activeModuleIds.includes('KosBranding')
      ? `/brand-dna${subQuery}`
      : allowedModules.length > 0
      ? `${allowedModules[0].route}${subQuery}`
      : `/overview${subQuery}`;

    return (
      <div className={`flex flex-col h-screen w-screen overflow-hidden ${tenantTheme === 'dark' ? 'dark bg-[#0a0a0c] text-slate-100' : 'bg-slate-50 text-slate-900'} relative font-sans transition-colors duration-300`} dir="rtl">
        {/* 2026 Kosun Standard: 100% Headerless - Zero Top Header (Exact UI Mirror of Manager Workbench) */}

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0a0a0c] relative transition-colors duration-300 pb-20">
            <Routes>
              {/* Default redirects with preserved tenant query param */}
              <Route path="/" element={<Navigate to={defaultRoute} replace />} />
              <Route path="/brand-dna/*" element={<BrandDnaHubStandaloneView />} />
              <Route path="/KosBranding/*" element={<BrandDnaHubStandaloneView />} />
              <Route path="/branding/*" element={<BrandDnaHubStandaloneView />} />
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
                    <Navigate to={defaultRoute} replace />
                  )
                }
              />
              {/* Fallback overview view if no modules are assigned */}
              <Route
                path="/overview/*"
                element={
                  <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
                    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Globe className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                          לוח ניהול סאב-דומיין: {tenantRecord.clientName}
                        </h2>
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400" dir="ltr">
                          {tenantRecord.fullDomain}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        הרכיבים המוטענים עבור סאב-דומיין זה: {allowedModules.length > 0 ? allowedModules.map(m => m.name).join(', ') : 'עדיין לא הופעלו רכיבים. ניתן להפעיל רכיבים דרך ניהול הסאב-דומיינים.'}
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsSettingsModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-500 cursor-pointer"
                        >
                          הגדרות מפתחות וסנכרון
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('public')}
                          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          מעבר לתצוגה ציבורית
                        </button>
                      </div>
                    </div>
                  </div>
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
              <Route path="/smart-forms/*" element={<Navigate to={`/ksf${subQuery}`} replace />} />
              <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </Routes>
          </main>
        </div>

        {/* Cashwan Dynamic Menu (KosNev) */}
        <CashwanDynamicMenu
          isOpen={isKosNevOpen}
          onClose={() => setIsKosNevOpen(false)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onGoToHome={() => {
            setIsKosNevOpen(false);
            setMode('public');
            sessionStorage.setItem(`tenant_admin_${tenantRecord.subdomain}`, 'false');
            const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
            const targetUrl = isLocal ? `/?tenant=${tenantRecord.subdomain}&mode=public` : '/?mode=public';
            window.location.href = targetUrl;
          }}
          activeModules={tenantRecord.activeModules}
          isSubdomain={true}
        />

        {/* Tenant Sync & Settings Modal */}
        <TenantSyncSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          tenantRecord={tenantRecord}
        />

        {/* Floating System Dock (Cashwan Branding Standard) */}
        <FloatingSystemDock
          isSubdomain={true}
          activeModules={allowedModules.map((m) => m.id)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onGoToHome={() => {
            setMode('public');
            sessionStorage.setItem(`tenant_admin_${tenantRecord.subdomain}`, 'false');
            const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
            const targetUrl = isLocal ? `/?tenant=${tenantRecord.subdomain}&mode=public` : '/?mode=public';
            window.location.href = targetUrl;
          }}
          homeUrl={typeof window !== 'undefined' && (window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1')) ? `/?tenant=${tenantRecord.subdomain}&mode=public` : '/?mode=public'}
        />
      </div>
    );
  }

  // 2. PUBLIC MODE (Visitor Landing Page / Live On-Page Editor for Owners)
  const isAuthorizedToEdit = Boolean(
    isAuthenticated ||
    isEditing ||
    (typeof window !== 'undefined' && (
      sessionStorage.getItem(`tenant_admin_${tenantRecord.subdomain}`) === 'true' ||
      sessionStorage.getItem(`tenant_admin_auth_${tenantRecord.subdomain}`) === 'true' ||
      new URLSearchParams(window.location.search).get('edit') === 'true' ||
      new URLSearchParams(window.location.search).get('admin') === 'true' ||
      new URLSearchParams(window.location.search).get('mode') === 'admin'
    ))
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0c] font-sans relative selection:bg-indigo-500 selection:text-white pb-20" dir="rtl">
      {/* Main Page Builder Stream for Visitors / Live Visual Editor for Tenant Owner */}
      <div className="flex-1">
        {effectivePageConfig ? (
          <PageBuilderRenderer
            config={effectivePageConfig}
            isEditing={isEditing}
            onUpdateSection={handleUpdateSection}
            onSaveSection={handleSaveSection}
            onDeleteSection={handleDeleteSection}
            onDuplicateSection={handleDuplicateSection}
            onMoveSectionUp={handleMoveUp}
            onMoveSectionDown={handleMoveDown}
            onToggleSectionVisibility={handleToggleVisibility}
            onAddSection={handleAddSection}
            onUpdateGlobalSettings={handleUpdateGlobalSettings}
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

      {/* Official KosWebAi Frontend Dock with Full Edit Controls */}
      <KosWebAiFrontDock
        pageId={effectivePageConfig?.pageId}
        isEditing={isEditing}
        onToggleEditMode={toggleEditMode}
        isSaving={isSaving}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        tenantId={tenantRecord.subdomain}
        isAuthorized={isAuthorizedToEdit}
      />

      {/* Discrete admin portal entry button if not currently editing or authorized */}
      {!isAuthorizedToEdit && (
        <button
          type="button"
          onClick={() => setMode('admin')}
          className="fixed bottom-4 left-4 z-40 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-400 hover:text-white backdrop-blur-md border border-slate-700/60 shadow-lg transition opacity-50 hover:opacity-100 cursor-pointer"
          title="כניסת מנהל ועריכת עמוד"
          aria-label="כניסת מנהל"
        >
          <Lock className="w-4 h-4" />
        </button>
      )}

      {/* Tenant Sync & Settings Modal */}
      <TenantSyncSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        tenantRecord={tenantRecord}
      />
    </div>
  );
};

export default TenantSubdomainView;
