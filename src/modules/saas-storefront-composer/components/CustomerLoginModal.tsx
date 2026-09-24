import React, { useState } from 'react';
import { 
  X, Globe, LogIn, ArrowLeft, Shield, Sparkles, 
  CheckCircle2, AlertCircle, Building, User, Lock, ExternalLink 
} from 'lucide-react';
import { StorefrontService } from '../services/storefrontService';
import { TenantRecord } from '../types';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterDevWorkbench: () => void;
}

export const CustomerLoginModal: React.FC<CustomerLoginModalProps> = ({
  isOpen,
  onClose,
  onEnterDevWorkbench,
}) => {
  const [activeTab, setActiveTab] = useState<'subdomain' | 'email' | 'admin'>('subdomain');
  const [subdomainInput, setSubdomainInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const settings = StorefrontService.getSettings();

  // 1. Login by Subdomain Name
  const handleSubdomainLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = subdomainInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) {
      setErrorMsg('נא להזין את שם הסאב-דומיין שלך');
      return;
    }

    setIsLoading(true);
    const tenants = StorefrontService.getAllTenants();
    const found = tenants.find(t => t.subdomain.toLowerCase() === clean);

    setTimeout(() => {
      setIsLoading(false);
      if (found || clean === 'biti' || clean === 'demo') {
        // Redirect directly to the customer subdomain
        const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
        if (isLocal) {
          window.location.href = `${window.location.origin}/?tenant=${clean}`;
        } else {
          window.location.href = `https://${clean}.${settings.baseDomain}`;
        }
      } else {
        setErrorMsg(`לא נמצא סאב-דומיין פעיל בשם "${clean}.${settings.baseDomain}". אנא ודא את השם או רכוש סאב-דומיין חדש בחנות.`);
      }
    }, 400);
  };

  // 2. Login by Email Lookup
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setErrorMsg('נא להזין את כתובת האימייל שלך');
      return;
    }

    setIsLoading(true);
    const tenants = StorefrontService.getAllTenants();
    const found = tenants.find(t => t.ownerEmail.toLowerCase() === email);

    setTimeout(() => {
      setIsLoading(false);
      if (found) {
        const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
        if (isLocal) {
          window.location.href = `${window.location.origin}/?tenant=${found.subdomain}`;
        } else {
          window.location.href = `https://${found.fullDomain}`;
        }
      } else {
        setErrorMsg(`לא נמצא סאב-דומיין המשויך לכתובת "${email}". באפשרותך להקים סאב-דומיין חדש בחנות הרכיבים.`);
      }
    }, 400);
  };

  // 3. Admin / Developer Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin' || adminPassword === 'kosun2026' || adminPassword === '') {
      onEnterDevWorkbench();
      onClose();
    } else {
      setErrorMsg('סיסמת מנהל שגויה');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 relative text-right">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            כניסה למערכת
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            התחבר כדי לעבור ישירות לסאב-דומיין שלך ולרכיבים הפעילים
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800/70 p-1 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300">
          <button
            onClick={() => { setActiveTab('subdomain'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'subdomain'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            לפי סאב-דומיין
          </button>
          <button
            onClick={() => { setActiveTab('email'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'email'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            לפי אימייל
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'admin'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            מנהל מערכת
          </button>
        </div>

        {/* Tab 1: Subdomain Login Form */}
        {activeTab === 'subdomain' && (
          <form onSubmit={handleSubdomainLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                שם הסאב-דומיין שלך:
              </label>
              <div className="relative flex items-center rounded-2xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <input
                  type="text"
                  value={subdomainInput}
                  onChange={e => setSubdomainInput(e.target.value)}
                  placeholder="e.g. biti"
                  className="flex-1 bg-transparent p-3 text-sm font-bold font-mono text-gray-900 dark:text-white focus:outline-none text-left"
                  dir="ltr"
                  autoFocus
                />
                <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-xs px-3 py-3 border-r border-indigo-100 dark:border-indigo-900 font-bold select-none">
                  .{settings.baseDomain}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 transition transform active:scale-98"
            >
              {isLoading ? (
                <span>בודק ומעביר...</span>
              ) : (
                <>
                  <span>כניסה לסאב-דומיין שלי</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Email Lookup Form */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                כתובת האימייל איתה רכשת:
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg transition transform active:scale-98"
            >
              {isLoading ? (
                <span>מחפש סאב-דומיין...</span>
              ) : (
                <>
                  <span>אתר את הסאב-דומיין שלי והיכנס</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Admin / Developer Workbench Mode */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                כניסת מנהל ומפתח ראשי (Dev Workbench):
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="הזן סיסמה או השאר ריק לכניסה..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg transition"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>כניסה ללוח פיתוח ומנהל מערכת (Workbench)</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
