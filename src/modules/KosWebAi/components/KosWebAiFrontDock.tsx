import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Settings2, 
  Sparkles, 
  Sun, 
  Moon, 
  ChevronUp, 
  X, 
  LayoutTemplate,
  Plus,
  Globe
} from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { subscribeToAuth, AuthState } from '../../../services/firebaseAuth';
import { useKosai } from '../../kosai-engine';
import { CashwanDynamicMenu } from '../../../components/Navigation/FloatingSystemDock';

export interface KosWebAiFrontDockProps {
  pageId?: string;
  isEditing?: boolean;
  onToggleEditMode?: () => void;
  isSaving?: boolean;
  onOpenSettings?: () => void;
  onOpenAddSection?: () => void;
  className?: string;
  tenantId?: string;
  isAuthorized?: boolean;
}

export const KosWebAiFrontDock: React.FC<KosWebAiFrontDockProps> = ({
  pageId,
  isEditing = false,
  onToggleEditMode,
  isSaving = false,
  onOpenSettings,
  onOpenAddSection,
  className = '',
  tenantId,
  isAuthorized = false,
}) => {
  const { firebaseApp } = useSystemConnection();
  const { setIsOpen } = useKosai();
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDynamicMenuOpen, setIsDynamicMenuOpen] = useState(false);

  // Authenticate user under tenant rules: Only authenticated registered editors/admins see this dock
  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
      setAuthInitialized(true);
    });
    return () => unsub();
  }, [firebaseApp]);

  useEffect(() => {
    const handleOpenMenu = () => {
      setIsDynamicMenuOpen(true);
    };
    window.addEventListener('kosun_open_modules_menu', handleOpenMenu);
    return () => window.removeEventListener('kosun_open_modules_menu', handleOpenMenu);
  }, []);

  // Day / Night mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kosun_theme') as 'light' | 'dark') ||
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const next = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTheme(next);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleGoToStudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchParams = new URLSearchParams(window.location.search);
    const effectiveTenant = tenantId || searchParams.get('tenant');
    const params = new URLSearchParams();
    if (pageId) params.set('pageId', pageId);
    if (effectiveTenant) params.set('tenant', effectiveTenant);
    const query = params.toString();
    const target = query ? `/KosWebAi?${query}` : '/KosWebAi';
    window.location.href = target;
  };

  const handleOpenEditorAi = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('kosai_set_agent_mode', { detail: { mode: 'editor', moduleId: 'KosWebAi' } }));
    window.dispatchEvent(new CustomEvent('kosai_open_chat'));
    setIsOpen(true);
  };

  // Check tenant & user authorization:
  // 1. Explicitly authorized via isAuthorized prop
  // 2. Active live edit mode
  // 3. Authenticated tenant admin session in sessionStorage
  // 4. URL query with edit/admin/mode=admin
  // 5. Firebase auth registered user with admin/editor role
  const isTenantAdminAuthed = Boolean(
    tenantId && typeof window !== 'undefined' && (
      sessionStorage.getItem(`tenant_admin_${tenantId}`) === 'true' ||
      sessionStorage.getItem(`tenant_admin_auth_${tenantId}`) === 'true'
    )
  );

  const hasAdminQuery = typeof window !== 'undefined' && Boolean(
    new URLSearchParams(window.location.search).get('edit') === 'true' ||
    new URLSearchParams(window.location.search).get('admin') === 'true' ||
    new URLSearchParams(window.location.search).get('mode') === 'admin'
  );

  const isAllowedUser = Boolean(
    isAuthorized ||
    isEditing ||
    isTenantAdminAuthed ||
    hasAdminQuery ||
    (
      authState &&
      authState.isAuthenticated &&
      !authState.isAnonymous &&
      (authState.role === 'admin' || authState.role === 'editor')
    )
  );

  if (!isAllowedUser) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none ${className}`}
        dir="rtl"
        style={{ fontFamily: 'Heebo, sans-serif' }}
      >
        {/* Minimized Dock Trigger (Compact, sleek pill) */}
        {!isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl border shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${
              isEditing
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 ring-4 ring-amber-500/20 shadow-amber-600/30'
                : 'bg-slate-900/95 hover:bg-slate-800 text-slate-100 border-slate-700/80 shadow-black/40'
            }`}
            title="פתח סרגל פקדים KosNev"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
              <Sparkles className="w-3 h-3" />
            </div>

            <span className="text-xs font-black tracking-tight font-mono">
              KosNev
            </span>

            {isEditing && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping pointer-events-none" />
            )}

            <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
          </button>
        ) : (
          /* Full Expanded Dock (KosNev) */
          <nav className="flex items-center gap-1.5 bg-slate-900/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
            {/* Module Monopoly Badge: KosNev (Clickable to open dynamic menu) */}
            <button
              type="button"
              onClick={() => setIsDynamicMenuOpen(true)}
              className="flex items-center gap-1.5 pl-2 pr-1.5 border-l border-slate-700/80 text-xs font-black text-indigo-400 hover:text-white font-mono transition cursor-pointer group"
              title="לחץ לפתיחת תפריט רכיבי מערכת קושאן"
              aria-label="פתח תפריט מודולים KosNev"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse group-hover:scale-125 transition-transform" />
              <span className="group-hover:underline">KosNev</span>
            </button>

            {/* 1. Home Page Navigation */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
                if (tenantId) {
                  sessionStorage.setItem(`tenant_admin_${tenantId}`, 'false');
                  window.dispatchEvent(new CustomEvent('kosun_navigate_home'));
                  if (isLocal) {
                    window.location.href = `/?tenant=${tenantId}&mode=public`;
                  } else {
                    window.location.href = '/?mode=public';
                  }
                } else {
                  window.location.href = '/';
                }
              }}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition cursor-pointer"
              title="מעבר לעמוד הבית הראשי של המשתמש"
              aria-label="עמוד הבית"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* 2. KosAI Editor Agent Button */}
            <button
              type="button"
              onClick={handleOpenEditorAi}
              className="flex items-center justify-center p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 transition cursor-pointer group"
              title="סוכן עריכה AI (KosAI)"
              aria-label="פתח סוכן עריכה KosAI"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            </button>

            {/* 2. Toggle Live Edit Mode - Pencil Icon Only (Edit3) */}
            {onToggleEditMode && (
              <button
                type="button"
                onClick={onToggleEditMode}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isEditing
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                }`}
                title={isEditing ? 'סיום עריכה' : 'עריכה חיה'}
                aria-label="עריכה חיה"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {/* 3. Add Section (when editing) - Icon Only */}
            {isEditing && onOpenAddSection && (
              <button
                type="button"
                onClick={onOpenAddSection}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition cursor-pointer"
                title="הוסף אזור חדש"
                aria-label="הוסף אזור חדש"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {/* 4. Open Website Builder Studio - Website Editor Icon */}
            <button
              type="button"
              onClick={handleGoToStudio}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 transition cursor-pointer"
              title="סטודיו עורך אתרים"
              aria-label="סטודיו עורך אתרים"
            >
              <LayoutTemplate className="w-4 h-4" />
            </button>

            {/* 5. Settings Drawer */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="הגדרות עמוד ו-SEO"
                aria-label="הגדרות עמוד"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}

            {/* 6. Day / Night Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition cursor-pointer"
              title={theme === 'dark' ? 'מעבר למצב יום' : 'מעבר למצב לילה'}
              aria-label="מצב יום/לילה"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* 7. Saving Status or Collapse Button */}
            {isSaving ? (
              <span className="text-[10px] font-black text-amber-400 px-1 animate-pulse">
                שומר...
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="מזער סרגל"
                aria-label="מזער סרגל"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </nav>
        )}
      </div>

      {/* Official Cashwan Dynamic Menu */}
      <CashwanDynamicMenu 
        isOpen={isDynamicMenuOpen} 
        onClose={() => setIsDynamicMenuOpen(false)} 
        onOpenSettings={onOpenSettings}
        onGoToHome={() => {
          setIsDynamicMenuOpen(false);
          const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
          if (tenantId) {
            sessionStorage.setItem(`tenant_admin_${tenantId}`, 'false');
            window.dispatchEvent(new CustomEvent('kosun_navigate_home'));
            if (isLocal) {
              window.location.href = `/?tenant=${tenantId}&mode=public`;
            } else {
              window.location.href = '/?mode=public';
            }
          } else {
            window.location.href = '/';
          }
        }}
        isSubdomain={Boolean(tenantId)}
      />
    </>
  );
};
