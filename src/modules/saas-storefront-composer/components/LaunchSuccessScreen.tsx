import React, { useState } from 'react';
import { 
  CheckCircle, Globe, ExternalLink, Sparkles, Shield, 
  Layers, ArrowLeft, Copy, Check, MessageSquare, Mail, Lock, User, KeyRound 
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';

export const LaunchSuccessScreen: React.FC = () => {
  const { provisionedTenant, resetStorefront, settings, lastDispatchResult } = useStorefront();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  if (!provisionedTenant) return null;

  const subdomainUrl = `https://${provisionedTenant.fullDomain}`;
  const adminUrl = `${window.location.origin}/?tenant=${provisionedTenant.subdomain}&mode=admin`;
  const tempPassword = lastDispatchResult?.credentials.temporaryPassword || `Ks@${(provisionedTenant.ownerPhone || '1234').slice(-4)}`;
  const username = lastDispatchResult?.credentials.username || provisionedTenant.ownerEmail || provisionedTenant.ownerPhone;

  const copySubdomain = () => {
    navigator.clipboard.writeText(subdomainUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center" dir="rtl">
      
      {/* Celebration Icon */}
      <div className="relative inline-block">
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto shadow-emerald-500/30 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="absolute -top-2 -right-2 p-1.5 bg-amber-400 text-slate-900 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Main Success Title */}
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
          מזל טוב! המערכת והסאב-דומיין שלך הופעלו בהצלחה 🎉
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          הסאב-דומיין <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{provisionedTenant.fullDomain}</span> מוכן, ו-
          <span className="font-bold text-gray-900 dark:text-white"> {provisionedTenant.activeModules.length} הרכיבים שרכשת </span>
          הוטמעו במסד הנתונים המבודד שלך.
        </p>
      </div>

      {/* WhatsApp & Email Notification Confirmation Badges */}
      <div className="space-y-2">
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-right">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                נשלחה הודעת WhatsApp עם פרטי הכניסה והקבלה!
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                למספר: {provisionedTenant.ownerPhone || 'הטלפון שהוזן'}
              </span>
            </div>
          </div>

          {lastDispatchResult?.whatsappDirectUrl && (
            <a
              href={lastDispatchResult.whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-white dark:bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 shadow-sm transition"
            >
              פתח ב-WhatsApp Web 💬
            </a>
          )}
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between gap-2.5 text-xs text-right">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500 text-white rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-blue-900 dark:text-blue-200 block">
                קבלה רשמית ופרטי גישה נשלחו לאימייל
              </span>
              <span className="text-[11px] text-blue-700 dark:text-blue-300">
                לכתובת: {provisionedTenant.ownerEmail}
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-bold">
            נשלח ✅
          </span>
        </div>
      </div>

      {/* Main Credentials & Access Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-5 text-right">
        
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>פרטי הכניסה והניהול של המערכת שלך:</span>
        </h3>

        {/* Credentials Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 block">שם משתמש (אימייל / טלפון):</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{username}</span>
            </div>
            <User className="w-4 h-4 text-gray-400" />
          </div>

          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 block">סיסמה ראשונית:</span>
              <span className="font-mono font-bold text-amber-500 dark:text-amber-400">{tempPassword}</span>
            </div>
            <button
              onClick={copyPassword}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 transition"
              title="העתק סיסמה"
            >
              {copiedPass ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <a
            href={adminUrl}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-indigo-500/25 transition transform active:scale-98"
          >
            <Lock className="w-4 h-4" />
            <span>🔐 כניסה ללוח הניהול ועריכת האתר שלך</span>
            <ArrowLeft className="w-4 h-4" />
          </a>

          <a
            href={subdomainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs py-3 rounded-2xl border border-gray-200 dark:border-gray-700 transition"
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>צפייה באתר עבור מבקרים ({provisionedTenant.fullDomain})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={resetStorefront}
            className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 py-1.5 transition"
          >
            חזרה לחנות kosun.pro
          </button>
        </div>

      </div>

    </div>
  );
};
