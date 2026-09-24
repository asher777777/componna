import React from 'react';
import { 
  CheckCircle, Globe, ExternalLink, Sparkles, Shield, 
  Layers, ArrowLeft, Copy, Check, RefreshCw 
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';

export const LaunchSuccessScreen: React.FC = () => {
  const { provisionedTenant, resetStorefront, settings } = useStorefront();
  const [copied, setCopied] = React.useState(false);

  if (!provisionedTenant) return null;

  const subdomainUrl = `https://${provisionedTenant.fullDomain}`;
  // For local development preview:
  const localPreviewUrl = `${window.location.origin}/?tenant=${provisionedTenant.subdomain}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(subdomainUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center" dir="rtl">
      
      {/* Celebration Icon */}
      <div className="relative inline-block">
        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto shadow-emerald-500/30 animate-bounce">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="absolute -top-2 -right-2 p-2 bg-amber-400 text-slate-900 rounded-full shadow-lg">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* Main Success Title */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
          מזל טוב! המערכת שלך הוקמה ושוגרה בהצלחה 🎉
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          הסאב-דומיין שלך חובר לרשת, וכל {provisionedTenant.activeModules.length} הרכיבים שרכשת הוטמעו בהצלחה במסד הנתונים הייעודי שלך.
        </p>
      </div>

      {/* Domain Link Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 text-right">
        
        {/* Domain Address Box */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-left" dir="ltr">
              <span className="text-[10px] text-gray-400 block font-sans">כתובת האתר שלך:</span>
              <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                {provisionedTenant.fullDomain}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'הועתק!' : 'העתק כתובת'}</span>
            </button>
          </div>
        </div>

        {/* Provisioning Meta Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-gray-400 block text-[10px]">שם העסק:</span>
            <span className="font-bold text-gray-900 dark:text-white">{provisionedTenant.clientName}</span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-gray-400 block text-[10px]">רכיבים פעילים:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{provisionedTenant.activeModules.length} רכיבים</span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 col-span-2 sm:col-span-1">
            <span className="text-gray-400 block text-[10px]">קידומת קולקציות DB:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] truncate block">
              {provisionedTenant.collectionPrefix}
            </span>
          </div>
        </div>

        {/* Launch Buttons */}
        <div className="pt-2 space-y-3">
          <a
            href={subdomainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-indigo-500/25 transition transform active:scale-98"
          >
            <span>פתח את האתר בסאב-דומיין ({provisionedTenant.fullDomain})</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={resetStorefront}
            className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 py-2 transition"
          >
            חזרה לדף הראשי של החנות
          </button>
        </div>

      </div>

    </div>
  );
};
