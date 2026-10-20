import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Routes, Route, useLocation, NavLink, Navigate } from 'react-router-dom';
import { TenantRecord } from '../contracts';
import { DEFAULT_SUBDOMAIN_MODULES } from './tenantResolver';
import { PageBuilderConfig, SectionType } from '../../modules/KosWebAi/types/pageBuilder.types';
import { SECTION_REGISTRY } from '../../modules/KosWebAi/registry/sectionRegistry';
import { PageBuilderRenderer } from '../../modules/KosWebAi/PageBuilderRenderer';
import { pageBuilderFirestore, ensureHeaderSection } from '../../modules/KosWebAi/services/pageBuilderFirestore';
import { useSystemConnection } from '../connection/SystemConnectionContext';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { BrandDnaHubStandaloneView } from '../../modules/KosBranding';
import { loadBrandDna } from '../../modules/KosBranding/services/brandDnaFirestore';
import { createDynamicSectionConfig, resolveLiveBrandDna } from '../../modules/KosWebAi/services/brandSectionHydrator';
import { BrandDna } from '../contracts';
import { FloatingSystemDock, CashwanDynamicMenu } from '../../components/Navigation/FloatingSystemDock';
import { CapabilitySlot } from '../bridge/CapabilitySlot';
import { TenantSyncSettingsModal } from '../../components/Navigation/TenantSyncSettingsModal';
import { REGISTERED_MODULES } from '../../workbench/moduleRegistry';
import { ModuleErrorBoundary } from '../../workbench/components/ModuleErrorBoundary';
import { ModuleLoadingFallback } from '../../workbench/components/ModuleLoadingFallback';
import { Globe, Lock, ArrowRight, Eye, LayoutDashboard, Sparkles, LayoutGrid, BookOpen } from 'lucide-react';
import { DashboardFirestoreService } from '../../modules/kosun-board-composer/services/dashboardFirestoreService';
import { DynamicCustomDashboardView } from '../../modules/kosun-board-composer/components/DynamicCustomDashboardView';
import { GeneratedCustomDashboard } from '../../modules/kosun-board-composer/types';
import { KosunBoardProvider } from '../../modules/kosun-board-composer/context/ModuleContext';
import { KosWebAiFrontDock } from '../../modules/KosWebAi';
import { PublicPageView } from '../../modules/KosWebAi/components/PublicPageView';
import { TenantAdminLoginView } from './TenantAdminLoginView';
import { TenantAuthService } from '../../modules/KosTenantProvisioner/services/tenantAuthService';
import { SubscriberPortalView } from '../../modules/KosSubscribed/components/SubscriberPortalView';
import { subscribeToAuth, isPlatformAdminEmail } from '../../services/firebaseAuth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Sun, Moon, LogOut, ChevronLeft, Check } from 'lucide-react';

export interface TenantSubdomainViewProps {
  tenantRecord: TenantRecord;
}

export const isKnownModuleOrAdminRoute = (path: string): boolean => {
  const p = path.toLowerCase().trim();
  if (p === '/' || p === '') return false;

  const systemOrAdminPrefixes = [
    '/dashboard',
    '/brand-dna',
    '/kosbranding',
    '/branding',
    '/overview',
    '/control-center',
    '/settings',
    '/communities',
    '/together',
    '/crm-groups',
    '/crm-groups-hub',
    '/smart-forms',
    '/media-gallery',
    '/media-gallery-hub',
    '/tenant-provisioner',
    '/page-builder',
    '/builder',
    '/koswebbulider',
  ];

  if (systemOrAdminPrefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))) {
    return true;
  }

  return REGISTERED_MODULES.some((m) => {
    const route = m.route.toLowerCase();
    return p === route || p.startsWith(`${route}/`);
  });
};

export const isPublicContentPath = (path: string): boolean => {
  const p = path.toLowerCase().trim();
  if (p === '/' || p === '') return false;

  // 1. Explicit public content paths
  if (
    p === '/kosvidio' ||
    p.startsWith('/kosvidio/') ||
    p.startsWith('/kosvidio-') ||
    p === '/kosass' ||
    p.startsWith('/kosass/') ||
    p.startsWith('/kosass-') ||
    p === '/p' ||
    p === '/p/' ||
    p.startsWith('/p/') ||
    p === '/posts' ||
    p.startsWith('/posts/') ||
    p === '/page' ||
    p.startsWith('/page/') ||
    p.startsWith('/preview/') ||
    p.startsWith('/tube/') ||
    p.startsWith('/to/') ||
    p === '/kosinfo' ||
    p.startsWith('/kosinfo/') ||
    p.startsWith('/kosinfo-') ||
    p === '/kosevent' ||
    p.startsWith('/kosevent/') ||
    p.startsWith('/kosevent-') ||
    p === '/koscheckout' ||
    p.startsWith('/koscheckout/') ||
    p.startsWith('/koscheckout-') ||
    p === '/koscommunity' ||
    p.startsWith('/koscommunity/') ||
    p.startsWith('/koscommunity-') ||
    p === '/kosfunrise' ||
    p.startsWith('/kosfunrise/') ||
    p.startsWith('/kosfunrise-') ||
    p === '/koscourse' ||
    p.startsWith('/koscourse/') ||
    p.startsWith('/koscourse-')
  ) {
    return true;
  }

  // 2. Known module or backoffice admin routes are strictly non-public
  if (isKnownModuleOrAdminRoute(path)) {
    return false;
  }

  // 3. Direct public page slug (e.g. /about, /services) under the tenant subdomain
  return p.length > 1 && !p.slice(1).includes('/');
};

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
    // Known module or admin routes strictly default to admin mode
    if (isKnownModuleOrAdminRoute(pathname)) {
      return 'admin';
    }
    // Public home or public content pages (e.g. /kosvidio, /p/*) default strictly to public mode
    if (pathname === '/' || pathname === '' || isPublicContentPath(pathname)) {
      return 'public';
    }
    if (sessionStorage.getItem(`tenant_admin_${tenantRecord.subdomain}`) === 'true' || sessionStorage.getItem(`tenant_admin_auth_${tenantRecord.subdomain}`) === 'true') {
      return 'admin';
    }
    return 'public';
  });

  const [isEditing, setIsEditing] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('edit') === 'true';
    }
    return false;
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(`tenant_view_mode_${tenantRecord.subdomain}`, mode);
  }, [mode, tenantRecord.subdomain]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === 'true') {
      setIsEditing(true);
      if (mode === 'admin') {
        setMode('public');
      }
    }

    if (params.get('mode') === 'public' || params.get('public') === 'true') {
      setMode('public');
    } else if (params.get('mode') === 'admin' || params.get('admin') === 'true') {
      setMode('admin');
    } else if (isKnownModuleOrAdminRoute(location.pathname)) {
      setMode('admin');
    } else if (isPublicContentPath(location.pathname) && !params.get('admin') && !params.get('mode')) {
      setMode('public');
    }

    // Clean noisy parameters (?mode=, ?admin=, ?tenant=) from the URL bar immediately
    if (typeof window !== 'undefined' && (params.has('mode') || params.has('admin') || params.has('tenant'))) {
      params.delete('mode');
      params.delete('admin');
      params.delete('tenant');
      const cleanSearch = params.toString() ? `?${params.toString()}` : '';
      const cleanUrl = `${window.location.pathname}${cleanSearch}${window.location.hash}`;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [location.pathname, location.search, tenantRecord.subdomain]);

  useEffect(() => {
    const handleGoToPublicHome = () => {
      setMode('public');
    };
    const handleToggleEdit = (e: any) => {
      const targetState = e?.detail?.isEditMode !== undefined ? Boolean(e.detail.isEditMode) : !isEditing;
      if (mode === 'admin' && targetState) {
        setMode('public');
      }
      setIsEditing(targetState);
    };
    window.addEventListener('kosun_navigate_home', handleGoToPublicHome);
    window.addEventListener('kosun_toggle_edit_mode', handleToggleEdit);
    return () => {
      window.removeEventListener('kosun_navigate_home', handleGoToPublicHome);
      window.removeEventListener('kosun_toggle_edit_mode', handleToggleEdit);
    };
  }, [tenantRecord.subdomain, mode, isEditing]);

  const isControlCenter = location.pathname === '/' || location.pathname.startsWith('/control-center');

  // Subscriber Role & Portal Detection
  const [currentUserRole, setCurrentUserRole] = useState<string>('viewer');
  const [isSubscriberPortalOpen, setIsSubscriberPortalOpen] = useState(false);
  const [subscriberContact, setSubscriberContact] = useState<any | null>(null);
  const [subscriberPackages, setSubscriberPackages] = useState<any[]>([]);

  useEffect(() => {
    if (!db || !tenantRecord.subdomain) return;
    const colPath = `tenants/${tenantRecord.subdomain}/subscription_packages`;
    getDocs(collection(db, colPath))
      .then((snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setSubscriberPackages(items);
      })
      .catch(() => {});
  }, [db, tenantRecord.subdomain]);

  const [firebaseAuthState, setFirebaseAuthState] = useState<any>(null);

  useEffect(() => {
    const unsub = subscribeToAuth(undefined, (state) => {
      setFirebaseAuthState(state);
      if (state.role) {
        setCurrentUserRole(state.role);
      }
      if (state.uid && db) {
        getDoc(doc(db, 'tenants', tenantRecord.subdomain, 'contacts', state.uid))
          .then((snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setSubscriberContact(data);
              if (data?.isContentSubscriber || data?.subscriberRole) {
                setCurrentUserRole('subscriber');
              }
            }
          })
          .catch(() => {});
      }
    });
    return () => unsub();
  }, [db, tenantRecord.subdomain]);

  const isContentSubscriber = currentUserRole === 'subscriber';

  // Strict Exclusion: Content subscriber is strictly barred from admin mode!
  useEffect(() => {
    if (isContentSubscriber && mode === 'admin') {
      setMode('public');
      setIsSubscriberPortalOpen(true);
    }
  }, [isContentSubscriber, mode]);

  const [homePageConfig, setHomePageConfig] = useState<PageBuilderConfig | null>(() => {
    return pageBuilderFirestore.getHomePageSync(tenantRecord.subdomain);
  });

  const [currentPageConfig, setCurrentPageConfig] = useState<PageBuilderConfig | null>(() => {
    const init = pageBuilderFirestore.getHomePageSync(tenantRecord.subdomain);
    return init ? ensureHeaderSection(init) : null;
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
        headerLayout: 'capsule-floating',
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
      sectionOrder: ['hero', 'statsBento', 'testimonials', 'pricing', 'faq', 'contact'],
      sections: {
        hero: {
          ...SECTION_REGISTRY.hero.defaultConfig,
          id: 'hero',
          badgeText: '🌟 ברוכים הבאים לאתר הרשמי',
          title: `ברוכים הבאים ל-${tenantRecord.clientName || tenantRecord.subdomain}`,
          subtitle: `הפלטפורמה והשירותים הדיגיטליים שלנו זמינים עבורכם ישירות בכתובת ${tenantRecord.fullDomain}`,
          ctaButtonText: 'צרו קשר עכשיו',
        },
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

        // 2. Check if any pages exist for this tenant
        const allPages = await pageBuilderFirestore.getAllPages(db, tenantRecord.subdomain);
        if (allPages.length > 0) {
          // Find any page that has slug === 'home' or isHomePage === true
          const existingHome = allPages.find((p) => p.isHomePage || p.slug === 'home' || p.pageId === `home_${tenantRecord.subdomain}`);
          const selected = existingHome || allPages[0];
          if (isMounted) {
            const enriched = ensureHeaderSection(selected);
            setHomePageConfig(enriched);
            setCurrentPageConfig(enriched);
            if (typeof document !== 'undefined') {
              document.title = enriched.seoSettings?.title || enriched.pageTitle || tenantRecord.clientName;
            }
          }
          return;
        }

        // 3. Fallback: ONLY initialize default landing page if tenant truly has 0 pages in both Firestore and cache!
        // Double check Firestore docs count directly to ensure zero data overwriting
        const doubleCheckPages = await pageBuilderFirestore.getAllPages(db, tenantRecord.subdomain);
        if (doubleCheckPages.length > 0) {
          const selected = doubleCheckPages.find((p) => p.isHomePage || p.slug === 'home') || doubleCheckPages[0];
          if (isMounted) {
            const enriched = ensureHeaderSection(selected);
            setHomePageConfig(enriched);
            setCurrentPageConfig(enriched);
          }
          return;
        }

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
        if (e?.detail?.page) {
          const enriched = ensureHeaderSection(e.detail.page);
          setHomePageConfig(enriched);
          setCurrentPageConfig(enriched);
          return;
        }
        loadTenantHomePage();
      }
    };
    window.addEventListener('kosun_homepage_changed', handleHomeChange);

    return () => {
      isMounted = false;
      window.removeEventListener('kosun_homepage_changed', handleHomeChange);
    };
  }, [db, tenantRecord.subdomain, mode]);

  const [tenantBrandDna, setTenantBrandDna] = useState<BrandDna | null>(() =>
    resolveLiveBrandDna(null, tenantRecord.subdomain)
  );

  useEffect(() => {
    let active = true;
    loadBrandDna(db, tenantRecord.subdomain)
      .then((dna) => {
        if (active && dna) {
          setTenantBrandDna(dna);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [db, tenantRecord.subdomain]);

  const [authVersion, setAuthVersion] = useState(0);

  const isAuthenticated = TenantAuthService.isTenantAuthenticated(tenantRecord.subdomain);

  const isFirebaseTenantOwner = Boolean(
    firebaseAuthState?.user && (
      (firebaseAuthState.email && isPlatformAdminEmail(firebaseAuthState.email)) ||
      currentUserRole === 'admin' ||
      currentUserRole === 'editor' ||
      (firebaseAuthState.email && tenantRecord.ownerEmail && firebaseAuthState.email.toLowerCase() === tenantRecord.ownerEmail.toLowerCase()) ||
      (firebaseAuthState.email && firebaseAuthState.email.toLowerCase().startsWith(`${tenantRecord.subdomain.toLowerCase()}@`))
    )
  );

  const isTenantAuthed = Boolean(isAuthenticated || isFirebaseTenantOwner);

  const isAuthorizedToEdit = Boolean(!isContentSubscriber && isTenantAuthed);

  // If not authorized to edit, edit mode is strictly barred
  useEffect(() => {
    if (!isAuthorizedToEdit && isEditing) {
      setIsEditing(false);
    }
  }, [isAuthorizedToEdit, isEditing]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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
    const saved = localStorage.getItem('kosun_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const newTheme = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTenantTheme(newTheme);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  const toggleTenantTheme = () => {
    const next = tenantTheme === 'dark' ? 'light' : 'dark';
    setTenantTheme(next);
    localStorage.setItem('kosun_theme', next);
    localStorage.setItem('kosun_home_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('kosun_theme_changed', { detail: { theme: next } }));
  };

  const toggleEditMode = useCallback(async () => {
    if (!isAuthorizedToEdit) return;
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
  }, [isAuthorizedToEdit, isEditing, currentPageConfig, db, tenantRecord.subdomain]);

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
    const liveDna = resolveLiveBrandDna(tenantBrandDna, tenantRecord.subdomain);
    const defaultData = createDynamicSectionConfig(
      type,
      liveDna,
      regDef?.defaultConfig,
      tenantRecord.subdomain
    );
    const newId = defaultData.id;

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

  const handleApplyGlobalOverride = useCallback((result: {
    globalSettings: any;
    sections: Record<string, any>;
    designSnapshots: any[];
  }) => {
    setCurrentPageConfig((prev) => {
      if (!prev) return prev;
      const next: PageBuilderConfig = {
        ...prev,
        globalSettings: result.globalSettings,
        sections: result.sections,
        designSnapshots: result.designSnapshots,
      };
      pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
      return next;
    });
  }, [db, tenantRecord.subdomain]);

  useEffect(() => {
    const handlePageSectionsUpdated = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;
      setCurrentPageConfig((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: detail.sections || prev.sections,
          ...(detail.globalSettings ? { globalSettings: detail.globalSettings } : {}),
        };
      });
    };
    window.addEventListener('kos_page_sections_updated', handlePageSectionsUpdated);
    return () => window.removeEventListener('kos_page_sections_updated', handlePageSectionsUpdated);
  }, []);

  const effectivePageConfig = React.useMemo(() => {
    if (!currentPageConfig) return homePageConfig ? ensureHeaderSection(homePageConfig) : null;
    return ensureHeaderSection(currentPageConfig);
  }, [currentPageConfig, homePageConfig]);

  // 1. PUBLIC CONTENT PATHS: Render PublicPageView immediately for public content URLs (e.g. /kosass/*, /kosvidio/*, /p/*)
  if (isPublicContentPath(location.pathname)) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0c] font-sans relative selection:bg-indigo-500 selection:text-white" dir="rtl">
        <PublicPageView />
      </div>
    );
  }

  // 2. ADMIN LOGIN GUARD: Check tenant admin authentication
  if (mode === 'admin' && !isTenantAuthed) {
    return (
      <TenantAdminLoginView
        tenantRecord={tenantRecord}
        onLoginSuccess={() => setAuthVersion((v) => v + 1)}
        onBackToPublic={() => setMode('public')}
      />
    );
  }

  // System modules that should NEVER appear on a subdomain
  // System modules reserved exclusively for master platform administrator
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

  const ALL_NON_SYSTEM_MODULES = REGISTERED_MODULES
    .filter((m) => !SYSTEM_MODULES.has(m.id))
    .map((m) => m.id);

  // Active provisioned modules for this tenant - ensures all standard non-system modules are available
  const activeModuleIds = Array.isArray(tenantRecord.activeModules) && tenantRecord.activeModules.length > 0
    ? Array.from(new Set([...tenantRecord.activeModules, ...DEFAULT_SUBDOMAIN_MODULES]))
    : ALL_NON_SYSTEM_MODULES;

  const allowedModules = REGISTERED_MODULES.filter((m) => {
    if (SYSTEM_MODULES.has(m.id)) return false;
    return activeModuleIds.some((id) => {
      const lowerId = id.toLowerCase();
      const lowerM = m.id.toLowerCase();
      return lowerId === lowerM ||
        (lowerM === 'koscloudstore' && lowerId === 'media-gallery-hub') ||
        (lowerM === 'media-gallery-hub' && lowerId === 'koscloudstore') ||
        (lowerM === 'kostogether' && lowerId === 'crm-groups-hub') ||
        (lowerM === 'crm-groups-hub' && lowerId === 'kostogether') ||
        (lowerM === 'ksf' && lowerId === 'smart-form-builder') ||
        (lowerM === 'smart-form-builder' && lowerId === 'ksf') ||
        (lowerM === 'koswhatsup' && lowerId === 'whatsapp-green-api-hub') ||
        (lowerM === 'whatsapp-green-api-hub' && lowerId === 'koswhatsup');
    });
  });

  // 2. ADMIN MODE (Full Manager Shell - Exact UI Mirror of Workbench with 100% Tenant Isolation)
  if (mode === 'admin') {
    if (isContentSubscriber) {
      return null;
    }
    const defaultRoute = customDashboard && adminViewType === 'custom_board'
      ? '/dashboard'
      : activeModuleIds.some((id) => id.toLowerCase() === 'kosbranding')
      ? '/brand-dna'
      : allowedModules.length > 0
      ? allowedModules[0].route
      : '/dashboard';

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
                  <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                    <CapabilitySlot
                      name="dashboard-renderer"
                      props={{
                        tenantId: tenantRecord.subdomain,
                        tenantName: tenantRecord.clientName,
                        moduleId: 'dashboard',
                      }}
                      fallback={
                        customDashboard ? (
                          <KosunBoardProvider>
                            <DynamicCustomDashboardView dashboard={customDashboard} />
                          </KosunBoardProvider>
                        ) : (
                          <Navigate to={defaultRoute} replace />
                        )
                      }
                    />
                  </div>
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
              <Route path="/smart-forms/*" element={<Navigate to="/ksf" replace />} />
              <Route path="/communities/*" element={<Navigate to="/crm-groups" replace />} />
              <Route path="/together/*" element={<Navigate to="/crm-groups" replace />} />
              <Route path="/crm-groups-hub/*" element={<Navigate to="/crm-groups" replace />} />
              <Route path="/KosTogether/*" element={<Navigate to="/crm-groups" replace />} />
              <Route path="/media-gallery-hub/*" element={<Navigate to="/KosCloudStore" replace />} />
              <Route path="/media-gallery/*" element={<Navigate to="/KosCloudStore" replace />} />
              <Route path="/KosWebBulider/*" element={<Navigate to="/KosWebAi" replace />} />
              <Route path="/page-builder/*" element={<Navigate to="/KosWebAi" replace />} />
              <Route path="/builder/*" element={<Navigate to="/KosWebAi" replace />} />

              {/* Public content routes inside admin router for smooth pass-through */}
              <Route path="/kosass" element={<PublicPageView />} />
              <Route path="/kosass/:slug" element={<PublicPageView />} />
              <Route path="/kosass/*" element={<PublicPageView />} />
              <Route path="/kosvidio" element={<PublicPageView />} />
              <Route path="/kosvidio/:slug" element={<PublicPageView />} />
              <Route path="/kosvidio/*" element={<PublicPageView />} />
              <Route path="/p" element={<PublicPageView />} />
              <Route path="/p/:slug" element={<PublicPageView />} />
              <Route path="/posts" element={<PublicPageView />} />
              <Route path="/posts/:slug" element={<PublicPageView />} />
              <Route path="/page" element={<PublicPageView />} />
              <Route path="/page/:slug" element={<PublicPageView />} />
              <Route path="/preview/:slug" element={<PublicPageView />} />
              <Route path="/tube/:slug" element={<PublicPageView />} />
              <Route path="/to/:slug" element={<PublicPageView />} />

              <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </Routes>
          </main>
        </div>



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
          onToggleEditMode={() => {
            setMode('public');
            setIsEditing(true);
          }}
          onGoToHome={() => {
            setMode('public');
            const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
            const targetUrl = isLocal ? `/?tenant=${tenantRecord.subdomain}` : '/';
            window.location.href = targetUrl;
          }}
          homeUrl={typeof window !== 'undefined' && (window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1')) ? `/?tenant=${tenantRecord.subdomain}` : '/'}
        />
      </div>
    );
  }

  // 2. PUBLIC MODE (Visitor Landing Page / Live On-Page Editor for Owners)

  if (isPublicContentPath(location.pathname)) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0c] font-sans relative selection:bg-indigo-500 selection:text-white" dir="rtl">
        <PublicPageView />
      </div>
    );
  }

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
        pageConfig={effectivePageConfig}
        globalSettings={effectivePageConfig?.globalSettings}
        seoSettings={effectivePageConfig?.seoSettings}
        onUpdateGlobalSettings={handleUpdateGlobalSettings}
        onUpdateSeoSettings={(updatedSeo) => {
          setCurrentPageConfig((prev) => {
            if (!prev) return prev;
            const next = { ...prev, seoSettings: updatedSeo };
            pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
            return next;
          });
        }}
        sections={effectivePageConfig?.sections}
        onUpdateSections={(updatedSections) => {
          setCurrentPageConfig((prev) => {
            if (!prev) return prev;
            const next = { ...prev, sections: updatedSections };
            pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
            return next;
          });
        }}
        designSnapshots={effectivePageConfig?.designSnapshots}
        onUpdateDesignSnapshots={(updatedSnapshots) => {
          setCurrentPageConfig((prev) => {
            if (!prev) return prev;
            const next = { ...prev, designSnapshots: updatedSnapshots };
            pageBuilderFirestore.savePage(next, db, tenantRecord.subdomain).catch(console.warn);
            return next;
          });
        }}
        onApplyGlobalOverride={handleApplyGlobalOverride}
        pageTitle={effectivePageConfig?.pageTitle}
        pageSections={effectivePageConfig?.sections ? Object.values(effectivePageConfig.sections) : []}
        isEditing={isEditing}
        onToggleEditMode={toggleEditMode}
        isSaving={isSaving}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        tenantId={tenantRecord.subdomain}
        isAuthorized={isAuthorizedToEdit}
      />

      {/* Discrete admin portal entry button if not content subscriber and not authorized */}
      {!isContentSubscriber && !isAuthorizedToEdit && (
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

      {/* Dedicated personal dashboard entry button for content subscriber */}
      {isContentSubscriber && (
        <button
          type="button"
          onClick={() => setIsSubscriberPortalOpen(true)}
          className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 cursor-pointer"
          title="אזור אישי - לוח מנוי ותוכן"
          aria-label="לוח מנוי"
        >
          <BookOpen className="w-4 h-4" />
          <span>התוכן שלי (לוח מנוי)</span>
        </button>
      )}

      {/* Content Subscriber Dedicated Personal Portal Modal */}
      {isSubscriberPortalOpen && (
        <SubscriberPortalView
          isModal={true}
          tenantSubdomain={tenantRecord.subdomain}
          contact={
            subscriberContact || {
              id: 'current-subscriber',
              name: 'מנוי תוכן',
              email: '',
              isContentSubscriber: true,
              subscriberRole: 'content_subscriber',
              permissions: {
                canAccessLockedContent: true,
                canTakeQuizzes: true,
                canViewReceipts: true,
                canEditPages: false,
                canUseAiGenerators: false,
                canAccessAdminPanel: false,
              },
              contentSubscriptions: [
                {
                  packageId: 'general',
                  packageName: 'מנוי תוכן',
                  status: 'active',
                  startDate: new Date().toISOString(),
                  billingCycle: 'monthly',
                  originalPrice: 0,
                  finalAmount: 0,
                },
              ],
            }
          }
          packages={subscriberPackages}
          onClose={() => setIsSubscriberPortalOpen(false)}
        />
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
