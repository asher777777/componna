import React, { useState, useEffect } from 'react';
import { CookieConsentSettings } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { resolveCurrentTenantId } from '../../../core/tenant';
import { Cookie, ShieldCheck, X, Check, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

export interface CookieConsentBannerProps {
  settings?: CookieConsentSettings;
  brandDna?: BrandDna | null;
  tenantId?: string;
  previewMode?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  settings,
  brandDna,
  tenantId,
  previewMode = false,
  onAccept,
  onDecline,
}) => {
  const effTenant = tenantId || (typeof window !== 'undefined' ? resolveCurrentTenantId() : '_master') || '_master';
  const storageKey = `kosun_cookie_consent_${effTenant}`;

  // If explicitly disabled in settings and not previewing, do not render
  const isEnabled = settings?.enabled !== false;

  const [hasDecided, setHasDecided] = useState<boolean>(() => {
    if (previewMode) return false;
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(storageKey);
      return Boolean(stored);
    } catch {
      return false;
    }
  });

  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (previewMode) {
      setIsVisible(true);
      return;
    }
    if (!isEnabled) {
      setIsVisible(false);
      return;
    }
    // Delay appearance slightly for smooth UX
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) {
          setIsVisible(true);
        }
      } catch {
        setIsVisible(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isEnabled, storageKey, previewMode]);

  const handleAcceptAll = () => {
    if (!previewMode && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ choice: 'all', timestamp: Date.now() })
        );
      } catch {}
    }
    setHasDecided(true);
    setIsVisible(false);
    if (onAccept) onAccept();
  };

  const handleDeclineOrEssential = () => {
    if (!previewMode && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ choice: 'essential', timestamp: Date.now() })
        );
      } catch {}
    }
    setHasDecided(true);
    setIsVisible(false);
    if (onDecline) onDecline();
  };

  if (!isEnabled && !previewMode) return null;
  if (hasDecided && !previewMode) return null;
  if (!isVisible && !previewMode) return null;

  const position = settings?.position || 'bottom-banner';
  const companyName = brandDna?.identity?.companyName || 'האתר';
  const primaryColor = settings?.primaryColor || brandDna?.designTokens?.primaryColor || '#4f46e5';

  const title = settings?.title?.trim() || 'הודעת פרטיות ושימוש בקובצי עוגיות (Cookies)';
  const message =
    settings?.message?.trim() ||
    `אנו ב-${companyName} משתמשים בקובצי עוגיות (Cookies) ובטכנולוגיות דומות כדי להבטיח את פעילותו התקינה והמאובטחת של האתר, להתאים את השירותים להעדפותיך ולהעניק לך חוויית גלישה מיטבית. המשך השימוש באתר מהווה הסכמה למדיניות הפרטיות ולתנאי השימוש שלנו.`;

  const acceptText = settings?.acceptButtonText?.trim() || 'מאשר/ת וממשיך/ה';
  const declineText = settings?.declineButtonText?.trim() || 'רק הכרחיות';
  const privacyLinkText = settings?.privacyPolicyLinkText?.trim() || 'מדיניות פרטיות';
  const privacyUrl = settings?.privacyPolicyUrl?.trim() || '/privacy';
  const termsLinkText = settings?.termsLinkText?.trim() || 'תנאי שימוש';
  const termsUrl = settings?.termsUrl?.trim() || '/terms';

  // Floating Box mode
  if (position === 'floating-box') {
    return (
      <div
        className={clsx(
          previewMode ? 'relative w-full' : 'fixed bottom-4 right-4 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto',
          'transition-all duration-300'
        )}
        dir="rtl"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-2xl text-right">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
            >
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h4>
                {previewMode && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">
                    תצוגה מקדימה
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {message}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
                <a
                  href={privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{privacyLinkText}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <a
                  href={termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{termsLinkText}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1 py-2 px-3.5 rounded-xl text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{acceptText}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeclineOrEssential}
                  className="py-2 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {declineText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Center Modal mode
  if (position === 'center-modal') {
    return (
      <div
        className={clsx(
          previewMode
            ? 'relative w-full'
            : 'fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4',
          'transition-all duration-300'
        )}
        dir="rtl"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-right">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
            >
              <Cookie className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                אבטחה והגנת פרטיות
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
            {message}
          </p>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">למידע נוסף ומסמכים משפטיים:</span>
            <div className="flex items-center gap-3">
              <a
                href={privacyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>{privacyLinkText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a
                href={termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>{termsLinkText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleDeclineOrEssential}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              {declineText}
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              style={{ backgroundColor: primaryColor }}
              className="py-2.5 px-6 rounded-xl text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{acceptText}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Bottom Banner mode
  return (
    <div
      className={clsx(
        previewMode
          ? 'relative w-full'
          : 'fixed bottom-0 inset-x-0 z-50 border-t border-slate-200/90 dark:border-white/10 shadow-2xl',
        'bg-white/95 dark:bg-[#0b0c10]/95 backdrop-blur-xl py-4 px-4 sm:px-6 lg:px-8 transition-all duration-300'
      )}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 text-right w-full md:w-auto flex-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
          >
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {title}
              </span>
              {previewMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">
                  תצוגה מקדימה
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {message}{' '}
              <a
                href={privacyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 mx-1"
              >
                <span>{privacyLinkText}</span>
              </a>
              {' • '}
              <a
                href={termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 mx-1"
              >
                <span>{termsLinkText}</span>
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleDeclineOrEssential}
            className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            {declineText}
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            style={{ backgroundColor: primaryColor }}
            className="py-2 px-5 rounded-xl text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{acceptText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
