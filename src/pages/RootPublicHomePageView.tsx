import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBuilderConfig } from '../modules/page-builder/types/pageBuilder.types';
import { PageBuilderRenderer } from '../modules/page-builder/PageBuilderRenderer';
import { Globe, ShoppingBag, ShieldCheck, Edit3, ArrowRight, Sparkles, UserCheck, Sun, Moon, LogOut, ChevronUp, LayoutGrid, Search, X } from 'lucide-react';
import { useSystemConnection } from '../core/connection/SystemConnectionContext';
import { subscribeToAuth, logoutUser, AuthState } from '../services/firebaseAuth';
import { AuthModal } from '../components/Auth/AuthModal';
import { REGISTERED_MODULES, ModuleDefinition } from '../workbench/moduleRegistry';

interface RootPublicHomePageViewProps {
  pageConfig: PageBuilderConfig;
  onEnterDevWorkbench?: () => void;
}

export const RootPublicHomePageView: React.FC<RootPublicHomePageViewProps> = ({
  pageConfig,
  onEnterDevWorkbench,
}) => {
  const navigate = useNavigate();
  const { firebaseApp } = useSystemConnection();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');

  const filteredModules = React.useMemo(() => {
    if (!moduleSearchQuery.trim()) return REGISTERED_MODULES;
    return REGISTERED_MODULES.filter((m: ModuleDefinition) =>
      m.name.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(moduleSearchQuery.toLowerCase())
    );
  }, [moduleSearchQuery]);

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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    role: 'viewer',
    isAuthenticated: false,
    isAnonymous: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

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

  const isAdmin = authState.role === 'admin' || authState.role === 'editor';

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
      <nav
        aria-label="מערכת וניווט מהיר"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 text-white max-w-[95vw]"
      >
        {/* Brand Symbol / Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 border-l border-white/10 text-xs font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>קושאן</span>
        </div>

        {/* Admin Edit Shortcut */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              if (onEnterDevWorkbench) onEnterDevWorkbench();
              navigate('/page-builder');
            }}
            className="flex items-center gap-1.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
            title="עריכת עמוד הבית בבונה העמודים"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">עריכת עמוד</span>
          </button>
        )}

        {/* KOSAI AI Assistant Shortcut */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              const kosaiBtn = document.querySelector('button[aria-label="סוכן AI לעריכה"]') as HTMLButtonElement;
              if (kosaiBtn) {
                kosaiBtn.click();
              } else {
                window.dispatchEvent(new CustomEvent('kosai:open_chat'));
              }
            }}
            className="flex items-center gap-1.5 text-xs bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
            title="עריכה באמצעות סוכן ה-AI (KOSAI)"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">KOSAI AI</span>
          </button>
        )}

        {/* Link to SaaS Storefront */}
        <button
          type="button"
          onClick={() => {
            if (onEnterDevWorkbench) onEnterDevWorkbench();
            navigate('/saas-storefront');
          }}
          className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
          title="צפייה בחנות המערכת והמודולים"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">חנות מודולים</span>
        </button>

        {/* Floating Modules Navigator (Available when logged in) */}
        {authState.isAuthenticated && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModulesMenuOpen(!isModulesMenuOpen)}
              className="flex items-center gap-1.5 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 px-3 py-1.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
              title="מעבר בין כלי ורכיבי המערכת"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">רכיבים</span>
              <ChevronUp className={`w-3 h-3 text-indigo-300 transition-transform ${isModulesMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Floating Bento Modules Picker Modal / Menu */}
            {isModulesMenuOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 sm:w-96 p-3 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-indigo-500/30 z-50 text-right animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-white">לוח בקרה ורכיבי המערכת</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModulesMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={moduleSearchQuery}
                    onChange={(e) => setModuleSearchQuery(e.target.value)}
                    placeholder="חיפוש רכיב או כלי..."
                    className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-800 text-xs text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Modules Grid */}
                <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
                  {filteredModules.map((module: ModuleDefinition) => (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => {
                        setIsModulesMenuOpen(false);
                        if (onEnterDevWorkbench) onEnterDevWorkbench();
                        navigate(module.route);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-right transition hover:bg-white/10 text-slate-200 hover:text-white group cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                          {module.name.split('-')[0].trim()}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                          {module.description}
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        מעבר
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Status / Logout / Login Access */}
        {authState.isAuthenticated ? (
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/80">
            <span
              className="text-xs font-bold text-slate-200 truncate max-w-[90px] sm:max-w-[130px]"
              title={authState.displayName || authState.email || 'משתמש מחובר'}
            >
              {authState.displayName || (authState.email ? authState.email.split('@')[0] : 'מחובר')}
            </span>
            <button
              type="button"
              onClick={async () => {
                await logoutUser(firebaseApp);
              }}
              className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
              title="התנתקות מהמערכת"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-bold transition shadow-md shadow-indigo-600/25 cursor-pointer"
            title="התחברות למערכת"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[11px]">התחבר</span>
          </button>
        )}

        {/* Day / Night Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-xl border border-slate-700/80 hover:bg-slate-800 text-amber-400 transition cursor-pointer"
          title={theme === 'light' ? 'מעבר למצב לילה (Dark Mode)' : 'מעבר למצב יום (Light Mode)'}
          aria-label="החלף ערכת נושא"
        >
          {theme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
        </button>
      </nav>

      {/* Auth Modal for Visitors / Admin Login */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          if (onEnterDevWorkbench) onEnterDevWorkbench();
        }}
        title="כניסה לפלטפורמת קשואן"
        subtitle="התחברו לניהול האתר, עריכת תכנים וגישה לכל המודולים"
      />
    </div>
  );
};

export default RootPublicHomePageView;
