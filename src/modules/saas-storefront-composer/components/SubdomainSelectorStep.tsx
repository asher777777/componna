import React, { useState, useEffect } from 'react';
import { 
  Globe, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, 
  ArrowRight, ShieldCheck, Sparkles, Server, Zap
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';
import { StorefrontService } from '../services/storefrontService';

export const SubdomainSelectorStep: React.FC = () => {
  const { 
    selectedSubdomain, 
    setSelectedSubdomain, 
    settings, 
    customerInfo,
    cart,
    totalMonthly,
    billingPlan,
    setViewMode,
    completeCheckoutAndProvision,
    isProcessing 
  } = useStorefront();

  const [inputVal, setInputVal] = useState(selectedSubdomain || '');
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    available: boolean;
    cleanSubdomain: string;
    reason?: string;
  } | null>(null);

  // Auto check availability upon typing with debounce
  useEffect(() => {
    if (!inputVal.trim()) {
      setValidationResult(null);
      setSelectedSubdomain('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const res = await StorefrontService.checkSubdomainAvailability(inputVal);
      setValidationResult(res);
      if (res.available) {
        setSelectedSubdomain(res.cleanSubdomain);
      } else {
        setSelectedSubdomain('');
      }
      setIsChecking(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [inputVal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow english letters, numbers and dashes
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setInputVal(val);
  };

  const handleLaunch = async () => {
    if (!validationResult?.available) return;
    await completeCheckoutAndProvision();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm">
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
          בחר את כתובת הסאב-דומיין שלך
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          הקלד את המילה הראשונה בלבד. הסיומת הקבועה{' '}
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
            .{settings.baseDomain}
          </span>{' '}
          תוצמד אוטומטית.
        </p>
      </div>

      {/* Subdomain Input Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            כתובת האתר שלך (סאב-דומיין):
          </label>

          {/* Subdomain Input with locked extension */}
          <div className="relative flex items-center rounded-2xl border-2 transition-all overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700">
            
            <div className="p-3 text-gray-400 border-l border-gray-200 dark:border-gray-700">
              <Globe className="w-5 h-5 text-indigo-500" />
            </div>

            {/* Prefix Input (The first word only) */}
            <input
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              placeholder="my-business"
              className="flex-1 bg-transparent p-3.5 text-base font-bold font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-left"
              dir="ltr"
              autoFocus
            />

            {/* Fixed Domain Extension Badge (Locked) */}
            <div className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs sm:text-sm px-4 py-4 border-r border-indigo-100 dark:border-indigo-900 select-none flex items-center gap-1">
              <span>.{settings.baseDomain}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-gray-400">אותיות באנגלית באותיות קטנות (a-z), מספרים ומקפים בלבד</span>
            {isChecking && (
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                בודק זמינות...
              </span>
            )}
          </div>
        </div>

        {/* Validation Live Status Alert */}
        {validationResult && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-start gap-3 transition ${
              validationResult.available
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {validationResult.available ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">
                    מעולה! הכתובת {validationResult.cleanSubdomain}.{settings.baseDomain} פנויה!
                  </p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    הקולקציות במסד הנתונים יישמרו תחת הקידומת:{' '}
                    <span className="font-mono font-bold">tenant_{validationResult.cleanSubdomain}_mod_</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">הסאב-דומיין אינו זמין</p>
                  <p className="text-[11px] opacity-90 mt-0.5">{validationResult.reason}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* DNS & Security Information Badge */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-indigo-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4" />
              חיבור DNS אוטומטי ({settings.dnsProvider === 'hostinger' ? 'Hostinger' : 'GoDaddy / DNS'})
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
              Wildcard DNS מוכן
            </span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            הסאב-דומיין יחובר מיד ללא צורך בהמתנה להפצת DNS. כל {cart.length} הרכיבים שרכשת יוטמעו עבורך בסביבה מבודדת ומאובטחת.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <button
            onClick={() => setViewMode('checkout')}
            disabled={isProcessing}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה לתשלום ופרטים</span>
          </button>

          <button
            onClick={handleLaunch}
            disabled={!validationResult?.available || isProcessing}
            className={`flex items-center gap-2 text-xs font-bold px-8 py-3 rounded-2xl shadow-xl transition transform active:scale-95 ${
              validationResult?.available && !isProcessing
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>מייצר את ה-UI והקולקציות...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>צור את המערכת שלי ושגר לסאב-דומיין!</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
