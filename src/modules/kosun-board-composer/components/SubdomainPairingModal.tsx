import React, { useState, useEffect } from 'react';
import {
  Globe,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { StorefrontService } from '../../saas-storefront-composer/services/storefrontService';
import { TenantRecord } from '../../saas-storefront-composer/types';
import { GeneratedCustomDashboard } from '../types';

export interface SubdomainPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: GeneratedCustomDashboard;
  onPair: (subdomain: string) => Promise<void>;
}

export const SubdomainPairingModal: React.FC<SubdomainPairingModalProps> = ({
  isOpen,
  onClose,
  dashboard,
  onPair,
}) => {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>('');
  const [customSubdomainInput, setCustomSubdomainInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const all = StorefrontService.getAllTenants();
      setTenants(all);
      if (dashboard.pairedSubdomain) {
        setSelectedSubdomain(dashboard.pairedSubdomain);
      } else if (all.length > 0) {
        setSelectedSubdomain(all[0].subdomain);
      }
      setSuccessMessage(null);
    }
  }, [isOpen, dashboard]);

  if (!isOpen) return null;

  const targetSubdomain = customSubdomainInput.trim()
    ? customSubdomainInput.trim().toLowerCase()
    : selectedSubdomain;

  const handleConfirmPairing = async () => {
    if (!targetSubdomain) return;
    setIsSubmitting(true);
    try {
      await onPair(targetSubdomain);
      setSuccessMessage(
        `לוח הבקרה שודך בהצלחה לסאב-דומיין "${targetSubdomain}.kosun.pro"! כעת, בכל כניסה ללוח הניהול בסאב-דומיין זה יוצג לוח בקרה מותאם זה.`
      );
    } catch (err: any) {
      console.error('[SubdomainPairingModal] Pairing error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                שידוך לוח בקרה לסאב-דומיין לקוח
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                הגדרת לוח הבקרה שיוצג למשתמש בעת כניסתו למערכת
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
              לוח בקרה נבחר:
            </span>
            <div className="font-bold text-sm text-indigo-700 dark:text-indigo-300">
              {dashboard.title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              מיועד ל: {dashboard.targetAudienceName} | {dashboard.selectedModuleIds.length} רכיבים מקושרים
            </div>
          </div>

          {/* Subdomain selection from existing tenants */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              בחר סאב-דומיין מתוך הלקוחות הקיימים:
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {tenants.map((t) => (
                <label
                  key={t.subdomain}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                    selectedSubdomain === t.subdomain && !customSubdomainInput
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-slate-900 dark:text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="subdomain_radio"
                      checked={selectedSubdomain === t.subdomain && !customSubdomainInput}
                      onChange={() => {
                        setSelectedSubdomain(t.subdomain);
                        setCustomSubdomainInput('');
                      }}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span>{t.clientName}</span>
                  </div>
                  <span className="font-mono text-[11px] text-indigo-700 dark:text-indigo-400 bg-slate-200/60 dark:bg-slate-900 px-2 py-0.5 rounded font-medium">
                    {t.subdomain}.kosun.pro
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Or manual custom subdomain input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              או הזן סאב-דומיין חדש ידנית:
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-mono">.kosun.pro</span>
              <input
                type="text"
                value={customSubdomainInput}
                onChange={(e) => setCustomSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="client-name"
                className="bg-transparent flex-1 text-left text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            סגירה
          </button>

          <div className="flex items-center gap-2">
            {targetSubdomain && (
              <a
                href={`/?tenant=${targetSubdomain}&mode=admin`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer font-medium"
              >
                <span>צפייה בלוח של {targetSubdomain}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              type="button"
              disabled={!targetSubdomain || isSubmitting}
              onClick={handleConfirmPairing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'משדך...' : 'אשר שידוך לוח בקרה'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
