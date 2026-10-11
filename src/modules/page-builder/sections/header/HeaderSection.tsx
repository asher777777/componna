import React, { useState, useEffect } from 'react';
import { HeaderSectionConfig } from '../../types/sectionConfigs';
import { useBrandDna } from '../../../brand-dna-hub/hooks/useBrandDna';
import { useTenantScope } from '../../../../core/tenant';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { PageBuilderConfig } from '../../types/pageBuilder.types';
import { AuthModal } from '../../../../components/Auth/AuthModal';
import { subscribeToAuth, logoutUser, AuthState } from '../../../../services/firebaseAuth';
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

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  const {
    anchorId = 'header',
    layout = 'floating-glass',
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
    showPhone = true,
    phone,
    showWhatsApp = true,
    whatsApp,
  } = config;

  // Direct live fetch of tenant Brand DNA from Firestore
  useEffect(() => {
    let mounted = true;
    import('../../../brand-dna-hub/services/brandDnaFirestore')
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

  // Resolve brand DNA identity dynamically
  const brandLogoFromContext = brandContext?.brandDna?.identity?.logoUrl;
  const brandLogoFromTenant = tenantBrandDna?.identity?.logoUrl;
  const brandLogoFromStorage = typeof window !== 'undefined' ? (
    (() => {
      try {
        const raw = localStorage.getItem(`kosun_${tenantId}_brand_dna_settings`) || localStorage.getItem('brand_dna_settings');
        return raw ? JSON.parse(raw)?.identity?.logoUrl : null;
      } catch { return null; }
    })()
  ) : null;

  const rawBrandLogo =
    (brandLogoFromContext && brandLogoFromContext.trim() !== '' ? brandLogoFromContext : null) ||
    (brandLogoFromTenant && brandLogoFromTenant.trim() !== '' ? brandLogoFromTenant : null) ||
    (brandLogoFromStorage && brandLogoFromStorage.trim() !== '' ? brandLogoFromStorage : null) ||
    '/images/kosun-official-logo.png';

  const initialLogo = useBrandLogo !== false
    ? (rawBrandLogo || customLogoUrl || '/images/kosun-official-logo.png')
    : (customLogoUrl || rawBrandLogo || '/images/kosun-official-logo.png');

  const effectiveLogoUrl = currentLogoSrc || initialLogo;

  const brandCompanyName =
    brandContext?.brandDna?.identity?.companyName ||
    tenantBrandDna?.identity?.companyName ||
    'קושאן';

  const brandSlogan =
    brandContext?.brandDna?.identity?.slogan ||
    tenantBrandDna?.identity?.slogan ||
    'כל אדם זה נכס';

  const effectiveTitle = logoText || brandCompanyName;
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

  // Determine navigation items (with optional title overrides)
  const navItems =
    menuMode === 'dynamic-tenant'
      ? tenantPages.map((page) => {
          const key = page.slug || page.shortSlug || page.pageId || (page.isHomePage ? 'home' : '');
          const labelOverride = (config.menuTitleOverrides && (config.menuTitleOverrides[key] || config.menuTitleOverrides[page.pageId])) || page.pageTitle || 'עמוד';
          return {
            label: labelOverride,
            url: page.isHomePage ? '/' : `/p/${page.slug || page.shortSlug || page.pageId}`,
          };
        })
      : menuMode === 'custom'
      ? customLinks
      : [];

  const isFloating = layout === 'floating-glass';
  const isTransparent = layout === 'transparent';
  const isCentered = layout === 'centered';
  const isMinimal = layout === 'minimal';
  const isClassic = layout === 'classic';

  return (
    <>
      <header
        id={anchorId}
        className={clsx(
          'w-full z-40 transition-all duration-300 font-sans',
          sticky && 'sticky top-0',
          isFloating && 'px-4 sm:px-8 py-3.5',
          !isFloating && 'px-4 sm:px-6 py-3',
          isTransparent
            ? 'bg-transparent text-white'
            : 'backdrop-blur-2xl bg-white/90 dark:bg-[#0c0c0e]/85 border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-black/40'
        )}
        dir="rtl"
      >
        <div
          className={clsx(
            'mx-auto flex items-center',
            isFloating &&
              'max-w-7xl rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/70 dark:border-white/10 px-4 sm:px-6 py-2.5 shadow-lg shadow-indigo-500/5',
            !isFloating && 'max-w-7xl',
            isCentered &&
              'flex-col md:flex-row justify-center md:justify-between gap-3 text-center md:text-right',
            !isCentered && 'justify-between gap-4'
          )}
        >
          {/* Logo & Brand Name */}
          <div className={clsx('flex items-center gap-3', isCentered && 'justify-center')}>
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
                className={clsx(
                  isMinimal ? 'h-8' : 'h-9 sm:h-10',
                  'w-auto max-w-[140px] sm:max-w-[180px] object-contain rounded-lg transition-transform hover:scale-105'
                )}
              />
            ) : (
              <div
                className={clsx(
                  'rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30',
                  isMinimal ? 'w-8 h-8 text-xs' : 'w-9 h-9 sm:w-10 sm:h-10 text-base'
                )}
              >
                {effectiveTitle.charAt(0) || 'ק'}
              </div>
            )}

            {showLogoText && (
              <div className="text-right">
                <span
                  className={clsx(
                    'font-bold block leading-tight text-slate-900 dark:text-white',
                    isMinimal ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  )}
                >
                  {effectiveTitle}
                </span>
                {effectiveSlogan && !isMinimal && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                    {effectiveSlogan}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Center Navigation Menu (Desktop) */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
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

          {/* Actions & Buttons (Desktop) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {showPhone && effectivePhone && (
              <a
                href={`tel:${effectivePhone.replace(/[^0-9]/g, '')}`}
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition"
                title="חיוג מהיר"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                <span>{effectivePhone}</span>
              </a>
            )}

            {showWhatsApp && effectiveWhatsApp && (
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
              authState.isAuthenticated ? (
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 sm:p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-1.5 truncate max-w-[110px] sm:max-w-[150px]" title={authState.displayName || authState.email || 'משתמש מחובר'}>
                    {authState.displayName || (authState.email ? authState.email.split('@')[0] : 'מחובר')}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await logoutUser(firebaseApp);
                    }}
                    className="p-1 sm:p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                    title="התנתקות מהמערכת"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
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

            {/* Mobile Burger Button */}
            {navItems.length > 0 && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white"
                title="תפריט"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && navItems.length > 0 && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-col gap-2">
              {navItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {item.label}
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

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
};
