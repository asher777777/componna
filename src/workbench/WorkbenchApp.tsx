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

// PublicPageView loaded lazily to isolate page-builder from shell
const PublicPageView = React.lazy(() =>
  import('../modules/page-builder').then((m) => ({ default: m.PublicPageView }))
);

const HomePage = React.lazy(() =>
  import('../pages/HomePage').then((m) => ({ default: m.HomePage }))
);

import { PageBuilderRenderer } from '../modules/page-builder/PageBuilderRenderer';
import { pageBuilderFirestore } from '../modules/page-builder/services/pageBuilderFirestore';
import { PageBuilderConfig } from '../modules/page-builder/types/pageBuilder.types';
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
    <div className="min-h-screen bg-slate-950 text-white relative font-sans" dir="rtl">
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md px-4 py-2 border-b border-indigo-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">עמוד הבית הפעיל שנבחר מבונה העמודים:</span>
          <span className="text-indigo-300 font-bold font-mono bg-slate-800 px-2 py-0.5 rounded">{activePage.pageTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/page-builder"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>עריכה בבונה העמודים</span>
          </a>
          <a
            href="/saas-storefront"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            חנות המערכת והמודולים
          </a>
        </div>
      </div>
      <PageBuilderRenderer config={activePage} />
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
    location.pathname.startsWith('/page/') ||
    location.pathname.startsWith('/preview/') ||
    location.hash.startsWith('#/p/') ||
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
    'control-center-hub': {
      hebrewName: 'מרכז שליטה ובקרה ראשי',
      englishPrefix: 'KOS',
      englishRest: 'Control Center',
      icon: Sparkles,
    },
    'saas-storefront-composer': {
      hebrewName: 'חנות דיגיטלית ומרקטפלייס',
      englishPrefix: 'KOS',
      englishRest: 'Storefront',
      icon: ShoppingBag,
    },
    'brand-dna-hub': {
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
    'whatsapp-green-api-hub': {
      hebrewName: 'אוטומציות ושירות WhatsApp',
      englishPrefix: 'KOS',
      englishRest: 'WhatsApp Hub',
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
    'page-builder': {
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

  // Filter modules: Admin sees all, Regular users see purchased modules
  const availableModules = REGISTERED_MODULES.filter(m => isAdmin || purchasedModules.includes(m.id));
  
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
            <Route path="/store" element={<Navigate to="/saas-storefront" replace />} />
            <Route path="/home" element={<Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-indigo-500 font-bold">טוען...</div>}><HomePage /></Suspense>} />
            
            <Route path="/p/:slug" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
            <Route path="/p/*" element={<ModuleErrorBoundary moduleName="תצוגה ציבורית"><Suspense fallback={<ModuleLoadingFallback moduleName="תצוגה ציבורית" />}><PublicPageView /></Suspense></ModuleErrorBoundary>} />
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

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col animate-scaleUp">
            
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                  <Grid className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping pointer-events-none" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      KosNev
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-sans">
                      תפריט רכיבים
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition cursor-pointer"
                title="סגירת תפריט KosNev"
                aria-label="סגירה"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {sortedModules.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <Lock className="w-8 h-8 mx-auto opacity-50" />
                  <p className="font-bold">אין מודולים פעילים</p>
                  <button onClick={() => {setIsMenuOpen(false); setIsAuthModalOpen(true);}} className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 cursor-pointer">
                    התחבר מחדש
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {sortedModules.map((module, index) => {
                    const isActive = activeModuleId === module.id;
                    const meta = MODULE_META_CONFIG[module.id] || {
                      hebrewName: module.name,
                      englishPrefix: 'KOS',
                      englishRest: module.id,
                      icon: (module as any).icon || Grid,
                    };
                    const Icon = meta.icon;
                    const usageCount = moduleUsageStats[module.id] || 0;

                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => handleNavigateToModule(module.id, module.route)}
                        className={`text-right w-full p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20 shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xs'
                        }`}
                      >
                        {/* Right Section: Icon + Hebrew Name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                            isActive 
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' 
                              : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/80 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm truncate ${isActive ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>
                                {meta.hebrewName}
                              </span>
                              {isActive && (
                                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-[9px] text-white font-bold shrink-0">
                                  נוכחי
                                </span>
                              )}
                              {usageCount > 0 && index < 3 && (
                                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[9px] text-amber-700 dark:text-amber-400 font-bold shrink-0">
                                  מוביל בשימוש ({usageCount})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Left Section: Back-to-Back English Name with Flashing KOS Badge */}
                        <div className="flex items-center gap-2.5 shrink-0 pl-1" dir="ltr">
                          <div className="flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors">
                            {/* Blinking Brand KOS */}
                            <span className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse drop-shadow-xs">
                              {meta.englishPrefix}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {meta.englishRest}
                            </span>
                          </div>

                          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:-translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Session & Logout Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {authState.isAuthenticated && !authState.isAnonymous ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {authState.displayName ? authState.displayName[0].toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {authState.displayName || authState.email?.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        {authState.email}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await logoutUser(firebaseApp);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="התנתק מהחשבון"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>התנתק</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-slate-500 dark:text-slate-400">אורח במערכת</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>כניסה</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

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
