import React, { useState, useEffect } from 'react';
import { HeaderSectionConfig } from '../../types/sectionConfigs';
import { useBrandDna } from '../../../KosBranding/hooks/useBrandDna';
import { useTenantScope, ROOT_TENANT_ID } from '../../../../core/tenant';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { PageBuilderConfig } from '../../types/pageBuilder.types';
import { AuthModal } from '../../../../components/Auth/AuthModal';
import { subscribeToAuth, logoutUser, AuthState } from '../../../../services/firebaseAuth';
import { TenantAuthService } from '../../../KosTenantProvisioner/services/tenantAuthService';
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Phone,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import { clsx } from 'clsx';

export const HeaderSection: React.FC<{ config: HeaderSectionConfig }> = ({ config }) => {
  const brandContext = useBrandDna();
  const { tenantId } = useTenantScope();
  const { db, firebaseApp } = useSystemConnection();

  const [tenantBrandDna, setTenantBrandDna] = useState<any>(null);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [currentLogoSrc, setCurrentLogoSrc] = useState<string>('');
  const [tenantPages, setTenantPages] = useState<PageBuilderConfig[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null, uid: null, email: null, displayName: null, photoURL: null,
    role: 'viewer', isAuthenticated: false, isAnonymous: false, loading: true, error: null
  });

  // Day / Night Theme Management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('kosun_theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const handleThemeSync = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    window.addEventListener('kosun_theme_changed', handleThemeSync);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeSync);
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kosun_theme', 'dark');
      window.dispatchEvent(new CustomEvent('kosun_theme_changed', { detail: { theme: 'dark' } }));
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kosun_theme', 'light');
      window.dispatchEvent(new CustomEvent('kosun_theme_changed', { detail: { theme: 'light' } }));
    }
  };

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  const [isTenantAuthed, setIsTenantAuthed] = useState<boolean>(() =>
    tenantId ? TenantAuthService.isTenantAuthenticated(tenantId) : false
  );

  useEffect(() => {
    const syncTenantAuth = () => {
      setIsTenantAuthed(tenantId ? TenantAuthService.isTenantAuthenticated(tenantId) : false);
    };
    syncTenantAuth();
    window.addEventListener('kosun_tenant_auth_changed', syncTenantAuth);
    return () => window.removeEventListener('kosun_tenant_auth_changed', syncTenantAuth);
  }, [tenantId]);

  const isLoggedIn = Boolean((authState.isAuthenticated && !authState.isAnonymous) || isTenantAuthed);

  const handleFullLogout = async () => {
    if (tenantId) {
      TenantAuthService.logoutTenant(tenantId);
    }
    try {
      await logoutUser(firebaseApp);
    } catch {}
    setIsTenantAuthed(false);
    setMobileMenuOpen(false);
  };

  const safeConfig = config || {} as HeaderSectionConfig;
  const {
    anchorId = 'header',
    layout = 'capsule-floating',
    logoAlignment,
    logoSize = 'md',
    sticky = true,
    useBrandLogo = true,
    customLogoUrl,
    logoText,
    showLogoText = true,
    menuMode = 'dynamic-tenant',
    customLinks = [],
    showLoginButton = true,
    showCtaButton = true,
    ctaButtonText = 'התחל עכשיו',
    ctaButtonUrl = '#contact',
    showPhone,
    phone,
    showWhatsApp,
    whatsApp,
    desktopMenuDisplay = 'hamburger',
  } = safeConfig;

  // Ensure strict boolean evaluation: only show if explicitly true (default false if undefined)
  const isWhatsAppVisible = showWhatsApp === true;
  const isPhoneVisible = showPhone === true;

  // Direct live fetch of tenant Brand DNA from Firestore
  useEffect(() => {
    let mounted = true;
    import('../../../KosBranding/services/brandDnaFirestore')
      .then(({ loadBrandDna }) => loadBrandDna(db, tenantId))
      .then((dna) => {
        if (mounted && dna) {
          setTenantBrandDna(dna);
        }
      })
      .catch((err) => console.warn('[HeaderSection] loadBrandDna err:', err));

    return () => {
      mounted = false;
    };
  }, [db, tenantId]);

  // Check master tenant status
  const isMasterTenant = !tenantId || tenantId === '_master' || tenantId === ROOT_TENANT_ID;

  // Read tenant-scoped branding from localStorage (never leak _master branding to child tenants)
  const storedTenantDna = typeof window !== 'undefined' ? (
    (() => {
      try {
        const raw =
          localStorage.getItem(`kosun_${tenantId}_kos_branding_settings`) ||
          localStorage.getItem(`kosun_${tenantId}_brand_dna_settings`) ||
          (isMasterTenant ? localStorage.getItem('brand_dna_settings') : null);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })()
  ) : null;

  // Resolve brand DNA identity dynamically (tenantBrandDna takes priority on child tenants)
  const contextDna = brandContext?.brandDna;
  const isContextLeakedMaster = !isMasterTenant && contextDna?.identity?.companyName === 'קושאן';
  const safeContextDna = isContextLeakedMaster ? null : contextDna;

  const activeDna = tenantBrandDna || storedTenantDna || safeContextDna;

  const brandLogoFromContext = safeContextDna?.identity?.logoUrl;
  const brandLogoFromTenant = tenantBrandDna?.identity?.logoUrl;
  const brandLogoFromStorage = storedTenantDna?.identity?.logoUrl;

  const rawBrandLogo =
    (brandLogoFromTenant && brandLogoFromTenant.trim() !== '' ? brandLogoFromTenant : null) ||
    (brandLogoFromStorage && brandLogoFromStorage.trim() !== '' ? brandLogoFromStorage : null) ||
    (brandLogoFromContext && brandLogoFromContext.trim() !== '' ? brandLogoFromContext : null) ||
    (isMasterTenant ? '/images/kosun-symbol.svg' : '');

  const initialLogo = useBrandLogo !== false
    ? (rawBrandLogo || customLogoUrl || (isMasterTenant ? '/images/kosun-official-logo.png' : ''))
    : (customLogoUrl || rawBrandLogo || (isMasterTenant ? '/images/kosun-official-logo.png' : ''));

  const effectiveLogoUrl = currentLogoSrc || initialLogo;

  const rawCompanyName =
    activeDna?.identity?.companyName ||
    (activeDna?.identity as any)?.brandName ||
    safeContextDna?.identity?.companyName ||
    '';

  const brandCompanyName =
    (!isMasterTenant && rawCompanyName === 'קושאן' ? '' : rawCompanyName) ||
    (isMasterTenant ? 'KosTogether' : tenantId || '');

  const rawSlogan =
    activeDna?.identity?.slogan ||
    safeContextDna?.identity?.slogan ||
    '';

  const brandSlogan =
    (!isMasterTenant && rawSlogan === 'כל אדם זה נכס' ? '' : rawSlogan) ||
    (isMasterTenant ? 'כל אדם זה נכס' : '');

  const sanitizedLogoText = !isMasterTenant && logoText === 'קושאן' ? '' : logoText;
  const effectiveTitle = sanitizedLogoText || brandCompanyName;
  const effectiveSlogan = brandSlogan;

  const effectivePhone =
    phone ||
    brandContext?.brandDna?.trust?.contactPhone ||
    tenantBrandDna?.trust?.contactPhone ||
    '052-6968008';

  const effectiveWhatsApp =
    whatsApp ||
    brandContext?.brandDna?.trust?.whatsappSupportNumber ||
    tenantBrandDna?.trust?.whatsappSupportNumber ||
    '0526968008';

  // Fetch tenant published content pages when in dynamic-tenant mode
  useEffect(() => {
    if (menuMode !== 'dynamic-tenant') return;
    let isMounted = true;

    async function loadTenantPages() {
      try {
        const { pageBuilderFirestore } = await import('../../services/pageBuilderFirestore');
        const pages = await pageBuilderFirestore.getAllPages(db, tenantId);
        if (isMounted) {
          // Filter to published pages and sort with home page first
          const published = pages.filter((p) => p.published !== false);
          published.sort((a, b) => {
            if (a.isHomePage) return -1;
            if (b.isHomePage) return 1;
            return 0;
          });
          setTenantPages(published);
        }
      } catch (err) {
        console.error('[HeaderSection] Failed loading tenant pages:', err);
      }
    }

    loadTenantPages();
    return () => {
      isMounted = false;
    };
  }, [menuMode, db, tenantId]);

  // Determine navigation items (with fallback so menu never becomes completely empty while tenant pages load)
  const defaultTenantItems = [
    { label: 'עמוד הבית', url: '/' },
    { label: 'שירותים', url: '#services' },
    { label: 'אודות', url: '#about' },
    { label: 'צור קשר', url: '#contact' },
  ];

  const hiddenSet = new Set(safeConfig.hiddenPageIds || []);
  const visiblePages = tenantPages.filter((page) => {
    const key = page.slug || page.shortSlug || page.pageId || (page.isHomePage ? 'home' : '');
    return !hiddenSet.has(page.pageId) && !hiddenSet.has(key);
  });

  const dynamicItems = visiblePages.length > 0
    ? visiblePages.map((page) => {
        const key = page.slug || page.shortSlug || page.pageId || (page.isHomePage ? 'home' : '');
        const labelOverride = (safeConfig.menuTitleOverrides && (safeConfig.menuTitleOverrides[key] || safeConfig.menuTitleOverrides[page.pageId])) || page.pageTitle || 'עמוד';
        return {
          label: labelOverride,
          url: page.isHomePage ? '/' : `/${(page.slug || page.shortSlug || page.pageId).replace(/^\/?p\//i, '')}`,
        };
      })
    : defaultTenantItems;

  const navItems =
    menuMode === 'dynamic-tenant'
      ? dynamicItems
      : menuMode === 'custom'
      ? (customLinks && customLinks.length > 0 ? customLinks : [{ label: 'עמוד הבית', url: '/' }])
      : [];

  // Permanent Default is KosTogether Capsule Floating Menu
  const isCapsuleLayout = !layout || layout === 'capsule-floating' || layout === 'floating-glass';

  const isTransparent = layout === 'transparent';
  const isCentered = layout === 'centered' || layout === 'logo-center' || logoAlignment === 'center';
  const isMinimal = layout === 'minimal';
  const isClassic = layout === 'classic';

  // Logo Size Classes for alternative layouts
  const logoImgClasses = clsx(
    logoSize === 'sm' && 'h-7 sm:h-8 max-w-[110px] sm:max-w-[130px]',
    logoSize === 'md' && 'h-9 sm:h-11 max-w-[150px] sm:max-w-[190px]',
    logoSize === 'lg' && 'h-12 sm:h-14 max-w-[180px] sm:max-w-[240px]',
    logoSize === 'xl' && 'h-16 sm:h-20 max-w-[220px] sm:max-w-[300px]',
    'w-auto object-contain rounded-lg transition-transform hover:scale-105'
  );

  const logoFallbackClasses = clsx(
    'rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30',
    logoSize === 'sm' && 'w-7 h-7 text-xs',
    logoSize === 'md' && 'w-10 h-10 text-base',
    logoSize === 'lg' && 'w-14 h-14 text-xl',
    logoSize === 'xl' && 'w-20 h-20 text-3xl'
  );

  return (
    <>
      {isCapsuleLayout ? (
        /* ========================================================================= */
        /* 1. PERMANENT DEFAULT: KOSTOGETHER CAPSULE & FLOATING DRAWER (Desktop & Mobile) */
        /* ========================================================================= */
        <header
          id={anchorId}
          className="w-full relative z-40 font-sans"
          dir="rtl"
        >
          {/* Floating Menu Trigger Capsule Button (Fixed top-4 right-4, Official Symbol + Brand Name) */}
          <div className="fixed top-4 right-4 z-40">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 flex items-center gap-2 sm:gap-2.5 text-slate-900 dark:text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="תפריט ניווט"
              aria-label="פתח תפריט ניווט"
            >
              {/* Logo / K Icon on Right (In RTL: first child is on the right) */}
              {isMasterTenant ? (
                <img
                  src="/images/kosun-symbol.svg"
                  onError={(e: any) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/kosun-official-logo.png';
                  }}
                  alt={effectiveTitle}
                  className="w-5 h-5 sm:w-7 sm:h-7 object-contain animate-pulse drop-shadow-xs"
                />
              ) : effectiveLogoUrl && !logoLoadFailed ? (
                <img
                  src={effectiveLogoUrl}
                  alt={effectiveTitle}
                  onError={() => {
                    if (effectiveLogoUrl !== '/images/kosun-official-logo.png') {
                      setCurrentLogoSrc('/images/kosun-official-logo.png');
                    } else {
                      setLogoLoadFailed(true);
                    }
                  }}
                  className="w-5 h-5 sm:w-7 sm:h-7 object-contain rounded-md"
                />
              ) : (
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-[10px] sm:text-xs">
                  {effectiveTitle.charAt(0) || 'ק'}
                </div>
              )}

              {/* Brand Title (Center) */}
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[200px]">
                {effectiveTitle}
              </span>

              {/* Hamburger Menu Icon (Left in RTL) */}
              <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 mr-0.5 sm:mr-1 transition-colors flex-shrink-0" />
            </button>
          </div>

          {/* Floating Side Navigation Drawer (Opened on capsule click) */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300 font-sans"
              onClick={() => setMobileMenuOpen(false)}
              dir="rtl"
            >
              <aside
                className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-4 sm:p-5 animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {isMasterTenant ? (
                      <img
                        src="/images/kosun-symbol.svg"
                        onError={(e: any) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/kosun-official-logo.png';
                        }}
                        alt={effectiveTitle}
                        className="w-7 h-7 sm:w-8 sm:h-8 object-contain animate-pulse drop-shadow-xs"
                      />
                    ) : effectiveLogoUrl && !logoLoadFailed ? (
                      <img
                        src={effectiveLogoUrl}
                        onError={() => setLogoLoadFailed(true)}
                        alt={effectiveTitle}
                        className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-xs">
                        {effectiveTitle.charAt(0) || 'ק'}
                      </div>
                    )}
                    <div className="text-right">
                      <span className="font-black text-sm text-slate-900 dark:text-white block leading-tight">
                        {effectiveTitle}
                      </span>
                      {effectiveSlogan && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                          {effectiveSlogan}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                    title="סגור תפריט"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Vertical Navigation Links */}
                <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto text-xs font-bold text-slate-700 dark:text-slate-300">
                  {navItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      <span>{item.label}</span>
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  ))}

                  {/* Direct Contact Buttons inside drawer */}
                  {(isWhatsAppVisible || isPhoneVisible || (showCtaButton && ctaButtonText)) && (
                    <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      {showCtaButton && ctaButtonText && (
                        <a
                          href={ctaButtonUrl}
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                        >
                          <span>{ctaButtonText}</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {isWhatsAppVisible && effectiveWhatsApp && (
                        <a
                          href={`https://wa.me/${effectiveWhatsApp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>וואטסאפ: {effectiveWhatsApp}</span>
                        </a>
                      )}

                      {isPhoneVisible && effectivePhone && (
                        <a
                          href={`tel:${effectivePhone.replace(/[^0-9]/g, '')}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
                        >
                          <Phone className="w-3.5 h-3.5 text-indigo-500" />
                          <span>חיוג: {effectivePhone}</span>
                        </a>
                      )}
                    </div>
                  )}
                </nav>

                {/* Drawer Bottom (Footer): Day/Night Mode Switch & Login Button */}
                <div className="pt-3 mt-auto border-t border-slate-200 dark:border-slate-800 space-y-2">
                  {/* Day / Night Mode Switch (Allows guests to toggle theme) */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition cursor-pointer shadow-xs"
                    title="החלפת מצב תצוגה בין יום ללילה"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      )}
                      <span>{isDarkMode ? 'מצב תצוגה: לילה (החלף ליום)' : 'מצב תצוגה: יום (החלף ללילה)'}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </button>

                  {/* Login / Auth Button */}
                  {showLoginButton && (
                    isLoggedIn ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.dispatchEvent(new CustomEvent('kosun:open-tenant-settings'));
                          }}
                          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold transition shadow-xs cursor-pointer"
                          title="הגדרות חשבון, מפתחות שירותים, תשלומים, רכיבים פעילים ושדרוגים"
                        >
                          <Settings className="w-4 h-4" />
                          <span>הגדרות, מפתחות וחשבון</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleFullLogout}
                          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                          title="התנתקות מהמערכת"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>התנתק</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        title="התחברות למערכת"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>התחברות למערכת</span>
                      </button>
                    )
                  )}
                </div>
              </aside>
            </div>
          )}
        </header>
      ) : (
        /* ========================================================================= */
        /* 2. ALTERNATIVE LAYOUTS (Classic / Transparent / Centered / Minimal)       */
        /* ========================================================================= */
        <header
          id={anchorId}
          className={clsx(
            'w-full transition-all duration-300 font-sans',
            sticky !== false ? 'sticky top-0 z-50' : 'relative z-30',
            !isTransparent && 'backdrop-blur-2xl bg-white/95 dark:bg-[#0c0c0e]/90 border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-black/40',
            isTransparent && 'bg-transparent text-white',
            'px-4 sm:px-6 py-3'
          )}
          dir="rtl"
        >
          <div
            className={clsx(
              'mx-auto flex items-center max-w-7xl',
              isCentered &&
                'flex-col md:flex-row justify-center md:justify-between gap-3 text-center md:text-right',
              !isCentered && 'justify-between gap-4'
            )}
          >
            {/* Logo & Brand Name */}
            <div className={clsx(
              'flex items-center gap-3',
              isCentered ? 'justify-center order-1 md:order-2' : 'order-1'
            )}>
              {effectiveLogoUrl && !logoLoadFailed ? (
                <img
                  src={effectiveLogoUrl}
                  alt={effectiveTitle}
                  onError={() => {
                    if (effectiveLogoUrl !== '/images/kosun-official-logo.png') {
                      setCurrentLogoSrc('/images/kosun-official-logo.png');
                    } else {
                      setLogoLoadFailed(true);
                    }
                  }}
                  className={logoImgClasses}
                />
              ) : (
                <div className={logoFallbackClasses}>
                  {effectiveTitle.charAt(0) || 'ק'}
                </div>
              )}

              {showLogoText && (
                <div className="text-right">
                  <span
                    className={clsx(
                      'font-bold block leading-tight text-slate-900 dark:text-white',
                      logoSize === 'sm' && 'text-xs sm:text-sm',
                      logoSize === 'md' && 'text-sm sm:text-base',
                      logoSize === 'lg' && 'text-base sm:text-lg',
                      logoSize === 'xl' && 'text-lg sm:text-xl'
                    )}
                  >
                    {effectiveTitle}
                  </span>
                  {effectiveSlogan && logoSize !== 'sm' && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                      {effectiveSlogan}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Menu (Desktop links when enabled) */}
            {navItems.length > 0 && desktopMenuDisplay !== 'hamburger' && (
              <nav className={clsx(
                "hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300",
                isCentered ? 'order-2 md:order-1' : 'order-2'
              )}>
                {navItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1 relative group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-indigo-500 transition-all duration-200 group-hover:w-full" />
                  </a>
                ))}
              </nav>
            )}

            {/* Actions & Buttons */}
            <div className={clsx(
              "flex items-center gap-2.5 sm:gap-3",
              isCentered ? 'order-3' : 'order-3'
            )}>
              {/* Day / Night Mode Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition cursor-pointer"
                title={isDarkMode ? 'החלף למצב יום' : 'החלף למצב לילה'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              </button>

              {isPhoneVisible && effectivePhone && (
                <a
                  href={`tel:${effectivePhone.replace(/[^0-9]/g, '')}`}
                  className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition"
                  title="חיוג מהיר"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{effectivePhone}</span>
                </a>
              )}

              {isWhatsAppVisible && effectiveWhatsApp && (
                <a
                  href={`https://wa.me/${effectiveWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                  title="שיחה בוואטסאפ"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>וואטסאפ</span>
                </a>
              )}

              {showCtaButton && ctaButtonText && (
                <a
                  href={ctaButtonUrl}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 hover:scale-105 active:scale-95"
                >
                  <span>{ctaButtonText}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </a>
              )}

              {showLoginButton && (
                isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleFullLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition shadow-sm cursor-pointer"
                    title="התנתקות מהמערכת"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">התנתק</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition shadow-sm cursor-pointer"
                    title="התחברות למערכת"
                  >
                    <LogIn className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-[11px] font-medium">התחבר</span>
                  </button>
                )
              )}

              {/* Burger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={clsx(
                  "p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white transition cursor-pointer",
                  desktopMenuDisplay === 'links' ? 'md:hidden flex' : 'flex'
                )}
                title="תפריט ניווט"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Dropdown Menu for alternative layouts */}
          {mobileMenuOpen && navItems.length > 0 && (
            <div className={clsx(
              "mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 animate-in fade-in duration-200 max-w-7xl mx-auto",
              desktopMenuDisplay === 'links' && 'md:hidden'
            )}>
              <div className="flex flex-col gap-2">
                {navItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ))}
              </div>

              {showCtaButton && ctaButtonText && (
                <a
                  href={ctaButtonUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <span>{ctaButtonText}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </header>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          firebaseApp={firebaseApp}
        />
      )}
    </>
  );
};
