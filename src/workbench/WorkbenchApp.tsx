import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Grid, X, Check, Lock, Edit3, User, LogOut, Sun, Moon,
  Mail, Bot, ShoppingBag, CreditCard, MessageSquare, Layers, BookOpen,
  Film, Layout, BarChart3, Image, Database, ShieldCheck, ChevronLeft,
  ArrowUpRight
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CashwanTopNav } from './components/CashwanTopNav';
import { REGISTERED_MODULES } from './moduleRegistry';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { ModuleLoadingFallback } from './components/ModuleLoadingFallback';
import { useSystemConnection } from '../core/connection/SystemConnectionContext';
import { AuthModal } from '../components/Auth/AuthModal';
import { subscribeToAuth, AuthState, fetchUserRole, isPlatformAdminEmail, getCachedUserRole, logoutUser } from '../services/firebaseAuth';
import { KosNevModal } from '../components/Navigation/KosNevModal';

// PublicPageView loaded lazily to isolate KosWebAi from shell
const PublicPageView = React.lazy(() =>
  import('../modules/KosWebAi').then((m) => ({ default: m.PublicPageView }))
);

const HomePage = React.lazy(() =>
  import('../pages/HomePage').then((m) => ({ default: m.HomePage }))
);

import { PageBuilderRenderer } from '../modules/KosWebAi/PageBuilderRenderer';
import { pageBuilderFirestore } from '../modules/KosWebAi/services/pageBuilderFirestore';
import { PageBuilderConfig } from '../modules/KosWebAi/types/pageBuilder.types';
import { KosWebAiFrontDock } from '../modules/KosWebAi';
import { ROOT_TENANT_ID } from '../core/tenant/tenantResolver';

const WorkbenchRootHome: React.FC = () => {
  const { db } = useSystemConnection();
  const [homePage, setHomePage] = React.useState<PageBuilderConfig | null>(() => {
    return pageBuilderFirestore.getHomePageSync(ROOT_TENANT_ID);
  });
  const [loading, setLoading] = React.useState(() => !homePage);

  const loadHome = React.useCallback(async () => {
    try {
      const page = await pageBuilderFirestore.getHomePage(db, ROOT_TENANT_ID);
      if (page) {
        setHomePage(page);
      }
    } catch {
      // keep existing cached page
    } finally {
      setLoading(false);
    }
  }, [db]);

  React.useEffect(() => {
    loadHome();
    const handleHomeChange = (e: any) => {
      const changed = e?.detail?.tenantId;
      if (!changed || changed === ROOT_TENANT_ID) {
        loadHome();
      }
    };
    window.addEventListener('kosun_homepage_changed', handleHomeChange);
    return () => window.removeEventListener('kosun_homepage_changed', handleHomeChange);
  }, [loadHome]);

  const activePage = homePage || pageBuilderFirestore.getHomePageSync(ROOT_TENANT_ID) || pageBuilderFirestore.createDefaultRootHomePage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative font-sans transition-colors duration-300" dir="rtl">
      <PageBuilderRenderer config={activePage} />
      <KosWebAiFrontDock pageId={activePage.pageId} />
    </div>
  );
};

export const WorkbenchApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const { purchasedModules, firebaseApp } = useSystemConnection();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Auth state for determining admin role
  const [authState, setAuthState] = useState<AuthState>({
    user: null, uid: null, email: null, displayName: null, photoURL: null,
    role: 'viewer', isAuthenticated: false, isAnonymous: false, loading: true, error: null
  });
  
  const [isAdmin, setIsAdmin] = useState(false);

  // Day / Night Theme (Light Mode is Default)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kosun_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('kosun_theme', next);
    localStorage.setItem('kosun_home_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('kosun_theme_changed', { detail: { theme: next } }));
  };

  useEffect(() => {
    const handleOpenModules = () => {
      setIsMenuOpen(true);
    };
    window.addEventListener('kosun_open_modules_menu', handleOpenModules);
    return () => window.removeEventListener('kosun_open_modules_menu', handleOpenModules);
  }, []);

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, async (state) => {
      setAuthState(state);
      if (state.user && state.email) {
        const role = await fetchUserRole(state.uid!, firebaseApp);
        setIsAdmin(role === 'admin' || getCachedUserRole(state.uid!) === 'admin' || isPlatformAdminEmail(state.email));
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, [firebaseApp]);

  const isPublicPage =
    location.pathname.startsWith('/p/') ||
    location.pathname.startsWith('/to/') ||
    location.pathname.startsWith('/page/') ||
    location.pathname.startsWith('/preview/') ||
    location.hash.startsWith('#/p/') ||
    location.hash.startsWith('#/to/') ||
    location.hash.startsWith('#/page/');

  const isHomePage = location.pathname === '/';
  const showSidebar = searchParams.get('sidebar') === 'true';

  const isStandalone =
    searchParams.get('mode') === 'live' ||
    searchParams.get('standalone') === 'true' ||
    isPublicPage;

  // Module metadata: Hebrew label, English label, and dedicated icon
  const MODULE_META_CONFIG: Record<string, {
    hebrewName: string;
    englishPrefix: string;
    englishRest: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = {
    'kosun-board-composer': {
      hebrewName: 'מחולל מערכות ולוחות בקרה',
      englishPrefix: 'KOS',
      englishRest: 'Board Composer',
      icon: Layout,
    },
    'kosun-am': {
      hebrewName: 'מערכת דיוור ואוטומציה',
      englishPrefix: 'KOS',
      englishRest: 'UN AM Mail',
      icon: Mail,
    },
    'kosai-engine': {
      hebrewName: 'מנוע בינה מלאכותית וסוכנים',
      englishPrefix: 'KOS',
      englishRest: 'AI Engine',
      icon: Bot,
    },
    'KosBranding': {
      hebrewName: 'מרכז זהות ומיתוג עסקי',
      englishPrefix: 'KOS',
      englishRest: 'Brand DNA',
      icon: Sparkles,
    },
    'kesher-payments-hub': {
      hebrewName: 'פתרונות סליקה ותשלומים',
      englishPrefix: 'KOS',
      englishRest: 'Pay Terminal',
      icon: CreditCard,
    },
    'KosWhatsUp': {
      hebrewName: 'אוטומציות ושירות WhatsApp',
      englishPrefix: 'KOS',
      englishRest: 'WhatsUp',
      icon: MessageSquare,
    },
    'whatsapp-green-api-hub': {
      hebrewName: 'אוטומציות ושירות WhatsApp',
      englishPrefix: 'KOS',
      englishRest: 'WhatsUp',
      icon: MessageSquare,
    },
    'KosTogether': {
      hebrewName: 'ניהול קהילות וסגמנטים CRM',
      englishPrefix: 'KOS',
      englishRest: 'Together CRM',
      icon: Layers,
    },
    'ksf': {
      hebrewName: 'מחולל טפסים ושאלונים שלביים',
      englishPrefix: 'KOS',
      englishRest: 'Smart Forms (KSF)',
      icon: BookOpen,
    },
    'smart-form-builder': {
      hebrewName: 'טפסים חכמים',
      englishPrefix: 'KOS',
      englishRest: 'Forms Studio',
      icon: BookOpen,
    },
    'video-producer-studio': {
      hebrewName: 'סטודיו הפקות וידאו ואווטאר',
      englishPrefix: 'KOS',
      englishRest: 'Video Studio',
      icon: Film,
    },
    'db-connector-hub': {
      hebrewName: 'מחולל אינטגרציות וחיבורים',
      englishPrefix: 'KOS',
      englishRest: 'Connector Hub',
      icon: Database,
    },
    'client-platform': {
      hebrewName: 'קליטת לקוחות ואונבורדינג',
      englishPrefix: 'KOS',
      englishRest: 'Client Platform',
      icon: User,
    },
    'crm-analytics': {
      hebrewName: 'ניתוח נתונים ואנליטיקס CRM',
      englishPrefix: 'KOS',
      englishRest: 'Analytics CRM',
      icon: BarChart3,
    },
    'KosWebAi': {
      hebrewName: 'בונה עמודים ודפי נחיתה',
      englishPrefix: 'KOS',
      englishRest: 'Page Builder',
      icon: Layout,
    },
    'auth-portal': {
      hebrewName: 'שער כניסה ואבטחה',
      englishPrefix: 'KOS',
      englishRest: 'Auth Portal',
      icon: ShieldCheck,
    },
    'flow-player-engine': {
      hebrewName: 'נגן תהליכים אינטראקטיבי',
      englishPrefix: 'KOS',
      englishRest: 'Flow Player',
      icon: Film,
    },
    'media-gallery-hub': {
      hebrewName: 'ניהול ספריית מדיה',
      englishPrefix: 'KOS',
      englishRest: 'Media Gallery',
      icon: Image,
    },
    'db-collections-hub': {
      hebrewName: 'סייר מאגרי נתונים',
      englishPrefix: 'KOS',
      englishRest: 'Data Hub',
      icon: Database,
    },
    'ambassador-campaigns-hub': {
      hebrewName: 'גיוס וקמפיינים לשגרירים',
      englishPrefix: 'KOS',
      englishRest: 'Ambassadors Hub',
      icon: Sparkles,
    },
  };

  // Usage stats state for dynamic ranking
  const [moduleUsageStats, setModuleUsageStats] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('kosun_module_usage_stats');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Filter modules: Admin sees all, Regular users see purchased modules (System modules strictly admin only)
  const availableModules = REGISTERED_MODULES.filter(m => {
    if (m.isSystemModule) return isAdmin;
    return isAdmin || purchasedModules.includes(m.id);
  });
  
  // Sort modules dynamically by frequency of use
  const sortedModules = React.useMemo(() => {
    return [...availableModules].sort((a, b) => {
      const countA = moduleUsageStats[a.id] || 0;
      const countB = moduleUsageStats[b.id] || 0;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name, 'he');
    });
  }, [availableModules, moduleUsageStats]);

  // Extract active module ID from pathname
  const activeModuleRoute = '/' + location.pathname.split('/')[1];
  const activeModule = REGISTERED_MODULES.find(m => m.route === activeModuleRoute);
  const activeModuleId = activeModule ? activeModule.id : null;

  const handleNavigateToModule = (moduleId: string, route: string) => {
    // Record usage dynamically
    setModuleUsageStats((prev) => {
      const updated = { ...prev, [moduleId]: (prev[moduleId] || 0) + 1 };
      try {
        localStorage.setItem('kosun_module_usage_stats', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setIsMenuOpen(false);
    navigate(route);
  };

  if (isStandalone) {
    return (
      <div className="w-screen min-h-screen bg-[#09090b] flex items-center justify-center p-0 m-0 text-white font-sans" dir="rtl">
        <main className="w-full min-h-screen">
          <Routes>
            <Route path="/p/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/p/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/to/:slug" element={<ModuleErrorBoundary moduleName="תצוגת קהילה"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגת קהילה" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/to/*" element={<ModuleErrorBoundary moduleName="תצוגת קהילה"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגת קהילה" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/page/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/page/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/preview/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/preview/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />

            {REGISTERED_MODULES.map((module) => {
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
            <Route
              path="/"
              element={
                <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-bold">טוען...</div>}>
                  <WorkbenchRootHome />
                </Suspense>
              }
            />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-slate-100 relative font-sans transition-colors duration-300" dir="rtl">
      {/* 2026 Kosun Standard: 100% Headerless - Zero Top Header */}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0a0a0c] relative transition-colors duration-300">
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-bold">טוען...</div>}>
                  <WorkbenchRootHome />
                </Suspense>
              }
            />
            <Route path="/home" element={<Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-indigo-500 font-bold">טוען...</div>}><HomePage /></Suspense>} />
            
            <Route path="/p/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/p/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/to/:slug" element={<ModuleErrorBoundary moduleName="תצוגת קהילה"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגת קהילה" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/to/*" element={<ModuleErrorBoundary moduleName="תצוגת קהילה"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגת קהילה" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/page/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/page/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/preview/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/preview/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />

            {REGISTERED_MODULES.map((module) => {
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
          </Routes>
        </main>
      </div>

      <KosNevModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeModuleId={activeModuleId}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        firebaseApp={firebaseApp}
        title="התחברות למערכת"
        subtitle="רענון הרשאות מנהל"
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
