import React, { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  Film,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Plus,
  Minus,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  fetchLiveExchangeRate,
  getGoogleUnitCostBreakdown,
  ExchangeRateInfo,
  AiUnitCostBreakdown,
  addTokensToTenant
} from '../pricingService';
import { getEffectiveFirestore } from '../tenantTokenTracker';
import { collection, getDocs } from 'firebase/firestore';

export const TokenPricingCalculatorCard: React.FC = () => {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateInfo | null>(null);
  const [unitCosts, setUnitCosts] = useState<AiUnitCostBreakdown | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Simulation Sliders / Inputs
  const [inputTokensK, setInputTokensK] = useState(100);       // e.g. 100K input tokens
  const [outputTokensK, setOutputTokensK] = useState(50);      // e.g. 50K output tokens
  const [useCaching, setUseCaching] = useState(true);          // Context Caching enabled?
  const [imageCount, setImageCount] = useState(10);            // 10 AI images
  const [videoSeconds, setVideoSeconds] = useState(15);        // 15 seconds of AI video

  // Retail Pricing Config (What Admin Charges)
  const [retailMarkupMultiplier, setRetailMarkupMultiplier] = useState(3.5); // 3.5x markup default

  // Admin Manual Top-up State
  const [tenantsList, setTenantsList] = useState<string[]>([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [tokensToGrant, setTokensToGrant] = useState(500_000);
  const [isGranting, setIsGranting] = useState(false);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState<string | null>(null);
  const [grantErrorMsg, setGrantErrorMsg] = useState<string | null>(null);

  const loadRates = async () => {
    setIsLoadingRate(true);
    try {
      const rate = await fetchLiveExchangeRate();
      setExchangeRate(rate);
      const costs = getGoogleUnitCostBreakdown('gemini-3.8-flash', rate.highRateUSDToILS);
      setUnitCosts(costs);
    } finally {
      setIsLoadingRate(false);
    }
  };

  useEffect(() => {
    loadRates();

    // Load available tenants for top-up picker
    const db = getEffectiveFirestore();
    if (db) {
      getDocs(collection(db, 'tenants')).then((snap) => {
        const ids = snap.docs.map((d) => d.id).filter((id) => id !== '_master' && id !== 'admin');
        setTenantsList(ids);
        if (ids.length > 0 && !selectedTenant) {
          setSelectedTenant(ids[0]);
        }
      }).catch(() => {});
    }
  }, []);

  // Compute Production Cost to Google
  const effectiveIlsRate = exchangeRate?.highRateUSDToILS || 3.82;
  const inputRatePerMillionUSD = useCaching 
    ? (unitCosts?.cachedInputPerMillionUSD || 0.075) 
    : (unitCosts?.inputPerMillionUSD || 0.75);
  const outputRatePerMillionUSD = unitCosts?.outputPerMillionUSD || 3.75;
  const imageRateUSD = unitCosts?.imageCostUSD || 0.035;
  const videoRateUSD = unitCosts?.videoSecondUSD || 0.10;

  const costTextInputUSD = (inputTokensK * 1000 * inputRatePerMillionUSD) / 1_000_000;
  const costTextOutputUSD = (outputTokensK * 1000 * outputRatePerMillionUSD) / 1_000_000;
  const costImagesUSD = imageCount * imageRateUSD;
  const costVideoUSD = videoSeconds * videoRateUSD;

  const totalCostUSD = costTextInputUSD + costTextOutputUSD + costImagesUSD + costVideoUSD;
  const totalCostILS = totalCostUSD * effectiveIlsRate;

  // Compute Retail Value Charged to Client (Always based on standard market price, without giving away caching discount!)
  const standardInputUSD = (inputTokensK * 1000 * 0.75) / 1_000_000;
  const retailValueUSD = (standardInputUSD + costTextOutputUSD + costImagesUSD + costVideoUSD) * (retailMarkupMultiplier / 2);
  const retailValueILS = retailValueUSD * effectiveIlsRate;

  const profitUSD = Math.max(0, retailValueUSD - totalCostUSD);
  const profitILS = profitUSD * effectiveIlsRate;
  const marginPercent = retailValueUSD > 0 ? ((profitUSD / retailValueUSD) * 100).toFixed(1) : '85.0';

  const handleGrantTokens = async () => {
    if (!selectedTenant.trim()) {
      setGrantErrorMsg('נא לבחור טננט');
      return;
    }
    if (tokensToGrant <= 0) {
      setGrantErrorMsg('נא להזין כמות טוקנים חיובית');
      return;
    }

    setIsGranting(true);
    setGrantErrorMsg(null);
    setGrantSuccessMsg(null);

    try {
      const res = await addTokensToTenant({
        tenantId: selectedTenant.trim(),
        tokensToAdd: tokensToGrant,
        reason: 'admin_grant',
      });

      if (res.success) {
        setGrantSuccessMsg(`הוטענו בהצלחה ${tokensToGrant.toLocaleString()} טוקנים לטננט "${selectedTenant}"! סה"כ מכסה מעודכנת: ${res.newQuota.toLocaleString()}`);
      } else {
        setGrantErrorMsg(res.error || 'שגיאה בעדכון הטוקנים');
      }
    } catch (err: any) {
      setGrantErrorMsg(err?.message || 'שגיאה בלתי צפויה');
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>מחשבון תמחור ורווחיות טוקנים (KOSUN Token & Margin Calculator)</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                API חי בזמן אמת
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              המרת שער הדולר הגבוה של היום, עלויות גוגל הרשמיות, הדמיית מרווחי רווח והקצאת טוקנים ידנית לטננטים
            </p>
          </div>
        </div>

        {/* Live Currency & Rate Refresh */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-4 py-2 text-right">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-500" />
              <span>שער דולר/שקל גבוה (מגן +3%):</span>
            </div>
            <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₪ {effectiveIlsRate.toFixed(3)}
              <span className="text-[10px] font-normal text-slate-400 mr-1.5 font-sans">
                (בסיס: ₪{exchangeRate?.rateUSDToILS.toFixed(3) || '3.70'})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={loadRates}
            disabled={isLoadingRate}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            title="רענן שערי המרה ומחירי API"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingRate ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: Google Live API Pricing Table & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Simulation & Live Google Rates */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Live Official Rates from Google */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                מחירון Google API רשמי (gemini-3.8-flash)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                עודכן: {exchangeRate?.lastUpdated || 'חי'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">קלט רגיל (1M)</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">$0.75</span>
                <span className="text-[9px] text-slate-400 block font-sans">₪{(0.75 * effectiveIlsRate).toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800/50">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-sans font-bold">קלט במטמון (1M)</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">$0.075 (-90%)</span>
                <span className="text-[9px] text-emerald-500 block font-sans">₪{(0.075 * effectiveIlsRate).toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">פלט תוכן (1M)</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">$3.75</span>
                <span className="text-[9px] text-slate-400 block font-sans">₪{(3.75 * effectiveIlsRate).toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">תמונה / שניית וידאו</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">$0.035 / $0.10</span>
                <span className="text-[9px] text-slate-400 block font-sans">₪0.13 / ₪0.38</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              הדמיית צריכת משאבים עבור טננט בחודש:
            </h3>

            {/* Input Tokens Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">טוקנים של קלט (Input Prompts):</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {inputTokensK.toLocaleString()}K טוקנים
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                step="10"
                value={inputTokensK}
                onChange={(e) => setInputTokensK(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Output Tokens Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">טוקנים של פלט (Generated Output):</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  {outputTokensK.toLocaleString()}K טוקנים
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="1000"
                step="5"
                value={outputTokensK}
                onChange={(e) => setOutputTokensK(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Media Row: Images & Video */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    תמונות סטודיו AI:
                  </span>
                  <span className="font-mono font-bold">{imageCount} תמונות</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={imageCount}
                  onChange={(e) => setImageCount(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <Film className="w-3.5 h-3.5 text-rose-500" />
                    וידאו / אווטאר (שניות):
                  </span>
                  <span className="font-mono font-bold">{videoSeconds} שניות</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={videoSeconds}
                  onChange={(e) => setVideoSeconds(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Context Caching Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                    שימוש במטמון Gemini 3.8 Context Caching (הנחת 90% על קלט)
                  </span>
                  <span className="text-[10px] text-indigo-800/70 dark:text-indigo-300/70">
                    מופעל אוטומטית בהגדרת מיתוג, פרומפטים סטטיים ושאילתות קהילה
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCaching}
                  onChange={(e) => setUseCaching(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Financial Summary & Admin Allocator */}
        <div className="space-y-5">
          
          {/* Real-time Profit Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                רווח גולמי משוער לקושאן:
              </span>
              <span className="text-xs font-black font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {marginPercent}% Margin
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400">
                ₪ {profitILS.toFixed(2)}
              </div>
              <div className="text-xs text-indigo-200 font-mono">
                ${profitUSD.toFixed(3)} USD רווח נקי
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>מחיר מדף מלא ללקוח:</span>
                <span className="font-mono font-bold text-white">₪ {retailValueILS.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>עלות ייצור בפועל לגוגל:</span>
                <span className="font-mono text-amber-400 font-bold">₪ {totalCostILS.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Admin Manual Grant Panel */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
              <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>הקצאת טוקנים ידנית על ידי המנהל</span>
            </div>

            {/* Tenant Select */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                בחר טננט / סאב-דומיין:
              </label>
              {tenantsList.length > 0 ? (
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                >
                  {tenantsList.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="הזן מזהה טננט..."
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              )}
            </div>

            {/* Token Amount Input */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                כמות טוקנים להוספה:
              </label>
              <div className="flex items-center gap-1.5">
                {[250_000, 500_000, 1_000_000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTokensToGrant(amt)}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-mono transition cursor-pointer ${
                      tokensToGrant === amt
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {amt >= 1_000_000 ? `${amt / 1_000_000}M` : `${amt / 1_000}K`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="50000"
                value={tokensToGrant}
                onChange={(e) => setTokensToGrant(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono mt-1"
              />
            </div>

            {/* Grant Button */}
            <button
              type="button"
              onClick={handleGrantTokens}
              disabled={isGranting}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGranting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>מעדכן מכסת טוקנים...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>הטען {tokensToGrant.toLocaleString()} טוקנים לטננט</span>
                </>
              )}
            </button>

            {grantSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{grantSuccessMsg}</span>
              </div>
            )}

            {grantErrorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{grantErrorMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPricingCalculatorCard;
