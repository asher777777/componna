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
} from '../../../core/ai/pricingService';
import { getEffectiveFirestore } from '../../../core/ai/tenantTokenTracker';
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
              <span>מחשבון טוקנים, תמחור API והמרת מט"ח בזמן אמת</span>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              שליטה על תמחור טוקנים, תמונות ווידאו, חישוב עלויות Google רשמיות ושער דולר גבוה להגנה מהפסדים
            </p>
          </div>
        </div>

        {/* Live Exchange Rate Pill */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-slate-500 dark:text-slate-400">שער יציג:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            ₪{exchangeRate?.rateUSDToILS.toFixed(3) || '3.70'}
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold" title="שער גבוה מוגן בתוספת מרווח ביטחון ליום זה">
            שער גבוה להמרה: <strong className="font-mono">₪{exchangeRate?.highRateUSDToILS.toFixed(3) || '3.82'}</strong>
          </span>
          <button
            onClick={loadRates}
            disabled={isLoadingRate}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition mr-1"
            title="רענן שערי API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRate ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: 3 Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Official Google Gemini Rates Table */}
        <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>מחירון Google API רשמי</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">2026 Paid Tier</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">קלט טקסט רגיל (Input)</span>
                <span className="text-[10px] text-slate-400">למיליון טוקנים</span>
              </div>
              <div className="text-left font-mono font-bold">
                <span className="text-slate-900 dark:text-white">$0.75</span>
                <span className="text-[10px] text-slate-400 block">₪{(0.75 * effectiveIlsRate).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <span>קלט במטמון (Context Cache)</span>
                  <span className="text-[9px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-1.5 rounded-full font-bold">90% הנחה!</span>
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">למיליון טוקנים</span>
              </div>
              <div className="text-left font-mono font-bold text-emerald-700 dark:text-emerald-300">
                <span>$0.075</span>
                <span className="text-[10px] opacity-75 block">₪{(0.075 * effectiveIlsRate).toFixed(3)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">פלט טקסט (Output + חשיבה)</span>
                <span className="text-[10px] text-slate-400">למיליון טוקנים</span>
              </div>
              <div className="text-left font-mono font-bold">
                <span className="text-slate-900 dark:text-white">$3.75</span>
                <span className="text-[10px] text-slate-400 block">₪{(3.75 * effectiveIlsRate).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>גנרציית תמונות AI</span>
                </span>
                <span className="text-[10px] text-slate-400">לכל תמונה (Nano Banana / Imagen)</span>
              </div>
              <div className="text-left font-mono font-bold">
                <span className="text-slate-900 dark:text-white">$0.035</span>
                <span className="text-[10px] text-slate-400 block">₪{(0.035 * effectiveIlsRate).toFixed(3)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-purple-500" />
                  <span>גנרציית וידאו AI (Veo / HeyGen)</span>
                </span>
                <span className="text-[10px] text-slate-400">לכל שניית וידאו</span>
              </div>
              <div className="text-left font-mono font-bold">
                <span className="text-slate-900 dark:text-white">$0.100</span>
                <span className="text-[10px] text-slate-400 block">₪{(0.100 * effectiveIlsRate).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Interactive Cost & Profit Simulator */}
        <div className="space-y-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>סימולטור עלות מול רווח לטננט</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              מרווח: {marginPercent}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Input tokens */}
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                <span>טוקני קלט (Input):</span>
                <span className="font-mono font-bold">{inputTokensK.toLocaleString()}K טוקנים</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={inputTokensK}
                onChange={(e) => setInputTokensK(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Output tokens */}
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                <span>טוקני פלט (Output):</span>
                <span className="font-mono font-bold">{outputTokensK.toLocaleString()}K טוקנים</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={outputTokensK}
                onChange={(e) => setOutputTokensK(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Images */}
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                <span>תמונות AI:</span>
                <span className="font-mono font-bold">{imageCount} תמונות</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={imageCount}
                onChange={(e) => setImageCount(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Video Seconds */}
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                <span>שניות וידאו AI:</span>
                <span className="font-mono font-bold">{videoSeconds} שניות</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={videoSeconds}
                onChange={(e) => setVideoSeconds(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Caching Toggle */}
            <div className="pt-2">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="font-medium text-slate-700 dark:text-slate-300">הפעל Context Caching לקלט:</span>
                <input
                  type="checkbox"
                  checked={useCaching}
                  onChange={(e) => setUseCaching(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                />
              </label>
            </div>

            {/* Financial Result Summary */}
            <div className="mt-3 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">עלות ייצור גוגל:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200 text-sm">
                  ₪{totalCostILS.toFixed(2)} (${totalCostUSD.toFixed(3)})
                </span>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">רווח קושאן:</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  +₪{profitILS.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Admin Manual Quota Allocator */}
        <div className="space-y-4 bg-slate-50/70 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>הקצאת טוקנים ידנית לטננט (Admin)</span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {grantSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{grantSuccessMsg}</span>
                </div>
              )}
              {grantErrorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{grantErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">בחר סאב-דומיין / טננט:</label>
                {tenantsList.length > 0 ? (
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white outline-none font-mono"
                  >
                    {tenantsList.map((t) => (
                      <option key={t} value={t}>
                        {t}.kosun.pro
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    placeholder="למשל: store1"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white outline-none font-mono"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">כמות טוקנים להוספה:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="50000"
                    value={tokensToGrant}
                    onChange={(e) => setTokensToGrant(Number(e.target.value))}
                    className="w-full font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white outline-none font-bold"
                  />
                  <span className="text-slate-400 font-mono shrink-0">Tokens</span>
                </div>

                {/* Quick Add Pills */}
                <div className="flex gap-1.5 mt-2">
                  {[100_000, 250_000, 500_000, 1_000_000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTokensToGrant(num)}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 text-slate-700 dark:text-slate-300 font-mono transition"
                    >
                      +{num >= 1_000_000 ? `${num / 1_000_000}M` : `${num / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGrantTokens}
            disabled={isGranting}
            className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isGranting ? 'מעדכן מכסה...' : 'הטען טוקנים לטננט כעת'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
