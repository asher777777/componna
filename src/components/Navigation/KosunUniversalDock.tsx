import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  LayoutGrid, 
  Globe, 
  Edit3, 
  Settings2, 
  X, 
  LogOut,
  Sliders,
  Settings,
  Plus
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { subscribeToAuth, AuthState, fetchUserRole, isPlatformAdminEmail, getCachedUserRole } from '../../services/firebaseAuth';
import { useTenantScope } from '../../core/tenant';
import { ROOT_TENANT_ID } from '../../core/tenant/tenantResolver';
import { TenantAuthService } from '../../modules/KosTenantProvisioner/services/tenantAuthService';
import { useKosai } from '../../modules/kosai-engine';
import { KosNevModal } from './KosNevModal';

export type DockMode = 'backoffice' | 'front';

export interface KosunUniversalDockProps {
  mode?: DockMode;
  editPageUrl?: string;
  isEditing?: boolean;
  onToggleEditMode?: () => void;
  isSaving?: boolean;
  onOpenSettings?: () => void;
  onOpenSeoSettings?: () => void;
  onGoToHome?: () => void;
  homeUrl?: string;
  activeModules?: string[];
  isSubdomain?: boolean;
  tenantId?: string;
  className?: string;
  isGlobalFallback?: boolean;
  isAuthorized?: boolean;
}

/**
 * KosunUniversalDock - The Exclusive Floating Dock for KOSUN26.
 * Supports:
 * Mode A: Backoffice (Dynamic Modules, Slug-based AI, Day/Night Toggle, Home)
 * Mode B: Page Builder Front (All Backoffice Controls + Pencil Edit Icon + SEO Settings Icon)
 * 
 * Strict Auth Gatekeeper: Appears ONLY when user is authenticated on their domain/subdomain.
 */
export const KosunUniversalDock: React.FC<KosunUniversalDockProps> = ({
  mode,
  editPageUrl,
  isEditing: controlledIsEditing,
  onToggleEditMode,
  isSaving = false,
  onOpenSettings,
  onOpenSeoSettings,
  onGoToHome,
  homeUrl,
  activeModules,
  isSubdomain: propIsSubdomain,
  tenantId: propTenantId,
  className = '',
  isGlobalFallback = false,
  isAuthorized: propIsAuthorized,
}: KosunUniversalDockProps & { isGlobalFallback?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { firebaseApp } = useSystemConnection();
  const { tenantId: scopeTenantId, isRootTenant } = useTenantScope();
  const { setIsOpen: setKosaiOpen } = useKosai();

  // Track explicit active docks to prevent duplicates
  const [hasExplicitDock, setHasExplicitDock] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean((window as any).__kosun_explicit_dock_mounted);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isGlobalFallback) {
      (window as any).__kosun_explicit_dock_mounted = true;
      window.dispatchEvent(new CustomEvent('kosun_explicit_dock_state', { detail: { mounted: true } }));
      return () => {
        (window as any).__kosun_explicit_dock_mounted = false;
        window.dispatchEvent(new CustomEvent('kosun_explicit_dock_state', { detail: { mounted: false } }));
      };
    } else {
      const handleExplicitChange = (e: any) => {
        setHasExplicitDock(Boolean(e?.detail?.mounted));
      };
      window.addEventListener('kosun_explicit_dock_state', handleExplicitChange);
      return () => window.removeEventListener('kosun_explicit_dock_state', handleExplicitChange);
    }
  }, [isGlobalFallback]);

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local')
  );

  const effectiveTenantId = propTenantId || (!isRootTenant ? scopeTenantId : (isLocal ? ROOT_TENANT_ID : undefined));
  const isSubdomain = propIsSubdomain ?? Boolean(effectiveTenantId && !isRootTenant && !isLocal);

  // Authentication State
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isAdminOrEditor, setIsAdminOrEditor] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local')) return true;
    }
    return false;
  });
  const [isTenantAuthed, setIsTenantAuthed] = useState<boolean>(() => {
    if (isLocal) return true;
    if (effectiveTenantId) {
      return TenantAuthService.isTenantAuthenticated(effectiveTenantId);
    }
    return false;
  });

  // Dock UI State
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isKosNevOpen, setIsKosNevOpen] = useState<boolean>(false);
  const [internalIsEditing, setInternalIsEditing] = useState<boolean>(false);
  const isEditing = controlledIsEditing !== undefined ? controlledIsEditing : internalIsEditing;

  // Day / Night Theme (Light is default per Cashwan standard)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kosun_theme');
    if (saved === 'dark') return 'dark';
    if (saved === 'light') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  // Determine whether this page is Backoffice or Front if not explicitly provided
  const detectedMode: DockMode = useMemo(() => {
    if (mode) return mode;
    const path = location.pathname.toLowerCase();
    const search = location.search.toLowerCase();
    const isPublic = 
      path === '/' || 
      path === '' || 
      path.startsWith('/p/') || 
      path.startsWith('/to/') || 
      path.startsWith('/page/') || 
      path.startsWith('/preview') ||
      search.includes('mode=public') ||
      search.includes('pageid=');
    return isPublic ? 'front' : 'backoffice';
  }, [mode, location.pathname, location.search]);

  // Auth Subscription
  useEffect(() => {
    if (isLocal) {
      setIsAdminOrEditor(true);
      return;
    }
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, async (state) => {
      setAuthState(state);
      if (state.user && state.email) {
        const role = await fetchUserRole(state.uid!, firebaseApp);
        const allowed = role === 'admin' || role === 'editor' || getCachedUserRole(state.uid!) === 'admin' || isPlatformAdminEmail(state.email);
        setIsAdminOrEditor(allowed);
      } else {
        setIsAdminOrEditor(false);
      }
    });
    return () => unsub();
  }, [firebaseApp, isLocal]);

  // Tenant Auth Session check
  useEffect(() => {
    if (isLocal) {
      setIsTenantAuthed(true);
    } else if (effectiveTenantId) {
      setIsTenantAuthed(TenantAuthService.isTenantAuthenticated(effectiveTenantId));
    }
  }, [effectiveTenantId, isLocal, location.search]);

  // Listen to external theme changes
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const newTheme = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTheme(newTheme);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  // Listen to external edit mode events
  useEffect(() => {
    const handleEditChange = (e: any) => {
      if (e?.detail?.isEditMode !== undefined) {
        setInternalIsEditing(Boolean(e.detail.isEditMode));
      }
    };
    window.addEventListener('kosun_edit_mode_changed', handleEditChange);
    return () => window.removeEventListener('kosun_edit_mode_changed', handleEditChange);
  }, []);

  // Theme Toggle Function (Controls the full page)
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

  // Dynamic Current Slug calculation
  const currentSlug = useMemo(() => {
    const p = location.pathname.toLowerCase();
    if (p.includes('crm-analytics') || p.includes('contacts') || p.includes('leads')) return 'crm-analytics';
    if (p.includes('kesher') || p.includes('payments')) return 'kesher-payments-hub';
    if (p.includes('whatsup') || p.includes('whatsapp')) return 'whatsapp-green-api-hub';
    if (p.includes('media-gallery') || p.includes('gallery')) return 'media-gallery-hub';
    if (p.includes('ksf') || p.includes('smart-forms')) return 'ksf';
    if (p.includes('brand-dna') || p.includes('branding') || p.includes('kosbranding')) return 'KosBranding';
    if (p.includes('dashboard') || p.includes('board')) return 'kosun-board-composer';
    if (p.includes('video-producer')) return 'video-producer-studio';
    if (p.includes('campaigns') || p.includes('ambassador')) return 'ambassador-campaigns-hub';
    if (p.includes('crm-groups')) return 'KosTogether';
    if (p.includes('koswebai') || p.includes('builder')) return 'KosWebAi';
    return 'kosun';
  }, [location.pathname]);

  // Open Contextual AI Agent
  const handleOpenAi = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (detectedMode === 'front') {
      window.dispatchEvent(new CustomEvent('kosai_set_agent_mode', { detail: { mode: 'editor', moduleId: 'KosWebAi' } }));
    } else {
      window.dispatchEvent(new CustomEvent('kosai_set_agent_mode', { detail: { mode: 'backoffice', moduleId: currentSlug } }));
    }
    window.dispatchEvent(new CustomEvent('kosai_open_chat'));
    setKosaiOpen(true);
  };

  // Navigate to Homepage
  const handleNavigateHome = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    if (onGoToHome) {
      onGoToHome();
    } else if (homeUrl) {
      window.location.href = homeUrl;
    } else {
      const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
      if (effectiveTenantId && !isRootTenant) {
        if (isLocal) {
          window.location.href = `/?tenant=${effectiveTenantId}&mode=public`;
        } else {
          window.location.href = `https://${effectiveTenantId}.kosun.pro/?mode=public`;
        }
      } else {
        window.location.href = '/';
      }
    }
  };

  // Toggle Live Edit
  const handleToggleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isEditing;
    setInternalIsEditing(next);
    if (onToggleEditMode) {
      onToggleEditMode();
    } else if (editPageUrl) {
      navigate(editPageUrl);
    } else {
      window.dispatchEvent(new CustomEvent('kosun_toggle_edit_mode', { detail: { isEditMode: next } }));
    }
    window.dispatchEvent(new CustomEvent('kosun_edit_mode_changed', { detail: { isEditMode: next } }));
  };

  // Open SEO & Page Settings
  const handleOpenSeoSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSeoSettings) {
      onOpenSeoSettings();
    } else if (onOpenSettings && !isSubdomain) {
      onOpenSettings();
    } else {
      window.dispatchEvent(new CustomEvent('pb_open_seo'));
      window.dispatchEvent(new CustomEvent('kosun_open_page_settings'));
    }
  };

  // STRICT AUTH GATEKEEPER
  // The floating dock appears ONLY when the user is authenticated on the domain/subdomain.
  // Regular visitors/public guests see ZERO floating menus.
  const hasAdminQuery = typeof window !== 'undefined' && Boolean(
    new URLSearchParams(window.location.search).get('edit') === 'true' ||
    new URLSearchParams(window.location.search).get('admin') === 'true' ||
    new URLSearchParams(window.location.search).get('mode') === 'admin'
  );

  const isSuperAdminBypass = typeof window !== 'undefined' && sessionStorage.getItem('kosun_super_admin_bypass') === 'true';

  const isAuthorized = Boolean(
    propIsAuthorized !== undefined
      ? propIsAuthorized
      : (
          isAdminOrEditor ||
          isTenantAuthed ||
          isSuperAdminBypass ||
          (hasAdminQuery && (isAdminOrEditor || isTenantAuthed)) ||
          isEditing ||
          isLocal
        )
  );

  if (isGlobalFallback && hasExplicitDock) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none ${className}`}
        dir="rtl"
        style={{ fontFamily: 'Heebo, sans-serif' }}
      >
        {/* Minimized Single Floating Trigger (Official Kosun Symbol + Blinking Star Badge) */}
        {!isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              boxShadow: '0 12px 36px -6px rgba(79, 70, 229, 0.5)',
            }}
            className="relative w-14 h-14 rounded-2xl text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group border border-white/30 cursor-pointer overflow-visible animate-pulse"
            title="פתח תפריט מערכת קושאן (KosNev)"
            aria-label="פתח תפריט צף"
          >
            {/* Official Kosun Vector Symbol */}
            <img
              src="/images/kosun-symbol.svg"
              alt="KOSUN"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
              }}
              className="w-7 h-7 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />

            {/* Blinking Star & Ping Badge on corner */}
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-tr from-amber-400 to-amber-300 items-center justify-center shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
              </span>
            </span>
          </button>
        ) : (
          /* Full Expanded Luxury Dock Bar */
          <nav 
            className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 p-2 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95"
            aria-label="תפריט מערכת קושאן"
          >
            {/* 1. Dynamic AI Agent Button */}
            <button
              type="button"
              onClick={handleOpenAi}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 transition text-xs font-black font-mono cursor-pointer group"
              title={`סוכן בינה מלאכותית (${detectedMode === 'front' ? 'עורך אתרים' : currentSlug})`}
              aria-label="פתח סוכן AI"
            >
              <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
              <span>KosAi</span>
            </button>

            {/* 2. Canonical KosNev Modules Menu Button */}
            <button
              type="button"
              onClick={() => setIsKosNevOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition text-xs font-bold cursor-pointer"
              title="פתיחת תפריט כל רכיבי המערכת (KosNev)"
              aria-label="תפריט רכיבים"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-500" />
              <span>רכיבים</span>
            </button>

            {/* 3. MODE B: Live Edit Mode Button (Pencil Icon) */}
            {detectedMode === 'front' && (
              <button
                type="button"
                onClick={handleToggleEdit}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition cursor-pointer text-xs font-bold ${
                  isEditing
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-black shadow-md ring-2 ring-amber-400/50'
                    : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300'
                }`}
                title={isEditing ? 'סיום עריכה ושמירת העמוד' : 'עריכה חיה של עמוד זה'}
                aria-label="עריכה חיה"
              >
                <Edit3 className={`w-3.5 h-3.5 ${isEditing ? 'text-slate-950' : 'text-indigo-600 dark:text-indigo-400'}`} />
                <span className="hidden sm:inline">
                  {isSaving ? 'שומר...' : isEditing ? 'סיום עריכה' : 'ערוך עמוד'}
                </span>
              </button>
            )}

            {/* 4. MODE B: SEO & Page Settings */}
            {detectedMode === 'front' && (
              <button
                type="button"
                onClick={handleOpenSeoSettings}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                title="הגדרות עמוד ו-SEO"
                aria-label="הגדרות עמוד"
              >
                <Settings2 className="w-4 h-4 text-purple-500" />
              </button>
            )}

            {/* 5. User Homepage Navigation Shortcut */}
            <button
              type="button"
              onClick={handleNavigateHome}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs font-bold cursor-pointer"
              title="מעבר לעמוד הבית הראשי של המשתמש"
              aria-label="עמוד הבית"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">עמוד הבית</span>
            </button>

            {/* 6. Subdomain Tenant Settings Shortcut */}
            {isSubdomain && onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                title="הגדרות וסנכרון טננט"
                aria-label="הגדרות טננט"
              >
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* 7. Day / Night Mode Toggle (Controls entire page) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-500 transition cursor-pointer"
              title={theme === 'dark' ? 'מעבר למצב יום (Light Mode)' : 'מעבר למצב לילה (Dark Mode)'}
              aria-label="החלף ערכת נושא"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
            </button>

            {/* 8. Collapse / Minimize Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              title="מזער תפריט צף"
              aria-label="מזער תפריט"
            >
              <X className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>

      {/* Canonical KosNev Modal (Screenshot UI standard) */}
      <KosNevModal
        isOpen={isKosNevOpen}
        onClose={() => setIsKosNevOpen(false)}
        activeModules={activeModules}
        isSubdomain={isSubdomain}
        tenantId={effectiveTenantId}
        activeModuleId={currentSlug}
      />
    </>
  );
};
