import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Play, ShoppingCart, ArrowLeft, 
  Layers, Shield, Zap, TrendingUp, Layout, Sliders, Image, 
  Film, MessageSquare, CreditCard, Users, Star, Flame,
  Settings, Check
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';
import { ModulePricingConfig } from '../types';

export const MarketplaceCatalogView: React.FC = () => {
  const { 
    catalog, 
    settings, 
    cart, 
    toggleCartItem, 
    isInCart, 
    billingPlan, 
    setBillingPlan, 
    startTrial, 
    totalMonthly, 
    totalAnnualSavings,
    setViewMode 
  } = useStorefront();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const publishedModules = catalog.filter(m => m.isPublished);

  const filteredModules = selectedCategory === 'all'
    ? publishedModules
    : publishedModules.filter(m => {
        if (selectedCategory === 'sales') return m.category === 'sales';
        if (selectedCategory === 'marketing') return m.category === 'marketing';
        if (selectedCategory === 'media') return m.category === 'media';
        if (selectedCategory === 'automation') return m.category === 'communication' || m.category === 'automation';
        return true;
      });

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return TrendingUp;
      case 'Layout': return Layout;
      case 'Sliders': return Sliders;
      case 'Image': return Image;
      case 'Film': return Film;
      case 'MessageSquare': return MessageSquare;
      case 'CreditCard': return CreditCard;
      case 'Users': return Users;
      case 'PlayCircle': return Play;
      default: return Layers;
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 md:p-12 shadow-2xl border border-indigo-800/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>הרכב את פלטפורמת העסק שלך – תשלום לפי רכיבים בלבד</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            בחר את הרכיבים לעסק שלך, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              וקבל סאב-דומיין מוכן תוך דקה!
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl">
            בחר מתוך מגוון מודולים עוצמתיים: CRM, דפי נחיתה, טפסים חכמים, סטודיו וידאו, סליקה ועוד.
            התנסה בכל רכיב בחינם, ושלם רק על מה שהעסק שלך באמת צריך.
          </p>

          {/* Billing Interval Switcher */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <div className="bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 flex items-center shadow-inner">
              <button
                onClick={() => setBillingPlan('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  billingPlan === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                תשלום חודשי
              </button>

              <button
                onClick={() => setBillingPlan('annual')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  billingPlan === 'annual'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>תשלום שנתי</span>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  חסוך 20% 💰
                </span>
              </button>
            </div>

            <button
              onClick={() => setViewMode('admin_pricing')}
              className="text-xs text-gray-400 hover:text-indigo-300 flex items-center gap-1.5 transition underline-offset-4 hover:underline"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>כניסה לניהול תמחור ומודולים (Admin)</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Categories */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
        {[
          { id: 'all', label: 'כל הרכיבים' },
          { id: 'sales', label: 'מכירות ו-CRM' },
          { id: 'marketing', label: 'שיווק ודפי נחיתה' },
          { id: 'media', label: 'מדיה ו-AI וידאו' },
          { id: 'automation', label: 'אוטומציה ותקשורת' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map(mod => {
          const Icon = getModuleIcon(mod.iconName);
          const inCart = isInCart(mod.id);
          const price = billingPlan === 'annual' ? mod.annualMonthlyPrice : mod.monthlyPrice;

          return (
            <div
              key={mod.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative group hover:shadow-xl ${
                inCart
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
                  : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              {/* Top Card Section */}
              <div className="p-6 space-y-4">
                
                {/* Header with Icon & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                    <Icon className="w-6 h-6" />
                  </div>

                  {mod.badgeText && (
                    <span className="text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                      {mod.badgeText}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {mod.featuresList.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Section (Pricing & Actions) */}
              <div className="p-6 pt-4 bg-gray-50/50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 space-y-3">
                
                {/* Price Display */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      {price}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      {settings.currencySymbol} / חודש
                    </span>
                  </div>

                  {billingPlan === 'annual' && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      בחיוב שנתי (חיסכון של {(mod.monthlyPrice - mod.annualMonthlyPrice) * 12} {settings.currencySymbol})
                    </span>
                  )}
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Live Trial Sandbox Button */}
                  {mod.trialAllowed && (
                    <button
                      onClick={() => startTrial(mod)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-indigo-600" />
                      <span>התנסות חיה</span>
                    </button>
                  )}

                  {/* Add to Cart Toggle */}
                  <button
                    onClick={() => toggleCartItem(mod)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition shadow-sm ${
                      inCart
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>נבחר בסל</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>הוסף לרכישה</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Sticky Cart Summary Bar (כשנבחרו רכיבים) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-1/2 md:translate-x-1/2 md:w-[700px] z-40 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow">
              {cart.length}
            </div>
            <div>
              <p className="font-bold text-sm">
                נבחרו {cart.length} רכיבים לפלטפורמה שלך
              </p>
              <p className="text-xs text-indigo-300">
                סה״כ: <span className="font-bold text-white text-sm">{totalMonthly} {settings.currencySymbol}</span> / חודש
                {billingPlan === 'annual' && ` (חיסכון שנתי של ${totalAnnualSavings} ${settings.currencySymbol})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('sales_proposal')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/30 transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>המשך להפקת הצעה והזמנת סאב-דומיין</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
