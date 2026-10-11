import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronUp, 
  LayoutGrid, 
  Search, 
  X, 
  Edit3 
} from 'lucide-react';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { subscribeToAuth, logoutUser, AuthState } from '../../services/firebaseAuth';
import { AuthModal } from '../Auth/AuthModal';
import { REGISTERED_MODULES, ModuleDefinition } from '../../workbench/moduleRegistry';

interface FloatingSystemDockProps {
  editPageUrl?: string;
  isEditing?: boolean;
  onToggleEditMode?: () => void;
  isSaving?: boolean;
  onEnterDevWorkbench?: () => void;
  className?: string;
}

export const FloatingSystemDock: React.FC<FloatingSystemDockProps> = ({
  editPageUrl,
  isEditing = false,
  onToggleEditMode,
  isSaving = false,
  onEnterDevWorkbench,
  className = '',
}) => {
  const navigate = useNavigate();
  const { firebaseApp } = useSystemConnection();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');
  // By default per Cashwan branding standard, the dock is minimized to an elegant floating icon button
  const [isDockExpanded, setIsDockExpanded] = useState(false);

  // Day / Night Theme (Light is default per Cashwan standard)
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
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  const filteredModules = useMemo(() => {
    if (!moduleSearchQuery.trim()) return REGISTERED_MODULES;
    return REGISTERED_MODULES.filter((m: ModuleDefinition) =>
      m.name.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(moduleSearchQuery.toLowerCase())
    );
  }, [moduleSearchQuery]);

  const isAdminOrEditor = authState.isAuthenticated && (authState.role === 'admin' || authState.role === 'editor');

  return (
    <>
      {/* Minimized Floating Trigger Icon (Default) */}
      {!isDockExpanded ? (
        <button
          type="button"
          onClick={() => setIsDockExpanded(true)}
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 p-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white backdrop-blur-xl border border-slate-700/80 shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer flex items-center gap-2 group ${className}`}
          title="פתיחת תפריט מערכת קושאן (Floating Dock)"
          aria-label="פתח תפריט צף"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-indigo-600/40">
            ק
          </div>
          <span className="text-xs font-bold pl-2 pr-1 text-slate-300 group-hover:text-white transition hidden group-hover:inline-block">
            תפריט קושאן
          </span>
        </button>
      ) : (
        /* Full Floating Dock Bar */
        <nav 
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 px-3 py-2 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}
          dir="rtl"
          aria-label="תפריט מערכת צף (קושאן)"
        >
          {/* Collapse Icon */}
          <button
            type="button"
            onClick={() => setIsDockExpanded(false)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="מזער תפריט צף"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        {/* Quick Edit Page button for admins/editors */}
        {isAdminOrEditor && (onToggleEditMode || editPageUrl) && (
          <button
            type="button"
            onClick={() => {
              if (onToggleEditMode) {
                onToggleEditMode();
              } else if (editPageUrl) {
                if (onEnterDevWorkbench) onEnterDevWorkbench();
                navigate(editPageUrl);
              }
            }}
            disabled={isSaving}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold transition shadow-sm cursor-pointer ${
              isEditing
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 font-black'
                : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40'
            }`}
            title={isEditing ? 'סיום עריכה ושמירת העמוד' : 'עריכת עמוד זה על גבי הדומיין'}
          >
            <Edit3 className={`w-3.5 h-3.5 ${isEditing ? 'text-slate-950' : 'text-indigo-400'}`} />
            <span className="hidden sm:inline">
              {isSaving ? 'שומר שינויים...' : isEditing ? 'סיום עריכה' : 'ערוך עמוד'}
            </span>
          </button>
        )}

        {/* Modules Store */}
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

            {/* 100% Screen or Large Bento Modules Picker */}
            {isModulesMenuOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-right animate-in zoom-in-95 duration-150">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white">רכיבי מערכת קושאן</h2>
                        <span className="text-[11px] text-slate-400">מעבר מהיר לכל הכלים והמודולים הפעילים</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModulesMenuOpen(false)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="סגירה"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={moduleSearchQuery}
                        onChange={(e) => setModuleSearchQuery(e.target.value)}
                        placeholder="חיפוש רכיב או כלי..."
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Modules Bento Grid */}
                  <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredModules.map((module: ModuleDefinition) => (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => {
                          setIsModulesMenuOpen(false);
                          if (onEnterDevWorkbench) onEnterDevWorkbench();
                          navigate(module.route);
                        }}
                        className="flex flex-col justify-between p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all text-right group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors mb-1">
                            {module.name.split('-')[0].trim()}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {module.description}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-end">
                          <span className="text-[10px] text-indigo-400 font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition">
                            כניסה לרכיב
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Session & Logout / Login */}
        {authState.isAuthenticated ? (
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/80">
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
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          if (onEnterDevWorkbench) onEnterDevWorkbench();
        }}
        title="כניסה לפלטפורמת קושאן"
        subtitle="התחברו לניהול האתר, עריכת תכנים וגישה לכל המודולים"
      />
    </>
  );
};
