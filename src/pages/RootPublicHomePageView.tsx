import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBuilderConfig } from '../modules/page-builder/types/pageBuilder.types';
import { PageBuilderRenderer } from '../modules/page-builder/PageBuilderRenderer';
import { Globe, ShoppingBag, ShieldCheck, Edit3, ArrowRight, Sparkles, UserCheck, Sun, Moon } from 'lucide-react';
import { useSystemConnection } from '../core/connection/SystemConnectionContext';
import { subscribeToAuth, AuthState } from '../services/firebaseAuth';
import { AuthModal } from '../components/Auth/AuthModal';

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

  const isAdmin = authState.role === 'admin' || authState.role === 'editor';

  return (
    <div className={`min-h-screen flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0a0a0c] text-white'
    }`} dir="rtl">
      {/* Discreet Platform Header Bar */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b px-4 sm:px-6 py-2.5 transition-all ${
        theme === 'light'
          ? 'bg-white/90 border-slate-200/90 shadow-sm text-slate-900'
          : 'bg-slate-950/80 border-slate-800/80 text-white'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              {pageConfig.globalSettings?.companyName || pageConfig.globalSettings?.siteTitle || 'קשואן'}
            </span>
            <span className="text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              דף הבית הרשמי
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Edit Shortcut */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (onEnterDevWorkbench) onEnterDevWorkbench();
                  navigate('/page-builder');
                }}
                className="flex items-center gap-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold transition shadow-sm"
                title="עריכת עמוד הבית בבונה העמודים"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">עריכה בבונה העמודים</span>
              </button>
            )}

            {/* Link to SaaS Storefront */}
            <button
              type="button"
              onClick={() => {
                if (onEnterDevWorkbench) onEnterDevWorkbench();
                navigate('/saas-storefront');
              }}
              className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl font-bold transition shadow-sm"
              title="צפייה בחנות המערכת והמודולים"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
              <span>חנות המודולים</span>
            </button>

            {/* Login / Workbench Access */}
            {authState.isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  if (onEnterDevWorkbench) onEnterDevWorkbench();
                  navigate('/control-center');
                }}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl font-bold transition shadow-md shadow-indigo-600/25"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>לוח בקרה</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl font-bold transition shadow-md shadow-indigo-600/25"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>כניסה למערכת</span>
              </button>
            )}
            {/* Day / Night Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-xl border border-slate-700/80 hover:bg-slate-800 text-amber-400 transition"
              title={theme === 'light' ? 'מעבר למצב לילה (Dark Mode)' : 'מעבר למצב יום (Light Mode)'}
              aria-label="החלף ערכת נושא"
            >
              {theme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* Render the Custom Page Builder Homepage */}
      <main className="flex-1">
        <PageBuilderRenderer
          config={pageConfig}
          onSelectDonationTier={(tierId, mode) => {
            console.log('[RootHomePage] Selected tier:', tierId, mode);
          }}
          onLeadSubmit={(formData) => {
            console.log('[RootHomePage] Lead submitted:', formData);
          }}
        />
      </main>

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
