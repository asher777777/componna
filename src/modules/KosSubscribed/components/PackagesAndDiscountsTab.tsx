import React from 'react';
import {
  Package,
  Plus,
  Tag,
  Globe,
  Edit3,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Copy,
  FileCheck2,
  Percent,
} from 'lucide-react';
import { useKosSubscribed } from '../hooks/useKosSubscribed';

export const PackagesAndDiscountsTab: React.FC = () => {
  const {
    packages,
    coupons,
    setEditingPackage,
    setEditingCoupon,
    setModalMode,
    deletePackage,
    deleteCoupon,
    generatePaymentPage,
    notify,
    isBusy,
  } = useKosSubscribed();

  const handleCopyText = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      notify(`${label} הועתק ללוח`);
    } catch {
      notify(text);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Section 1: Subscription Packages */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              חבילות תוכן חודשיות ושנתיות
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              הגדר חבילות מנוי, קבע מחירים והנחות, וייצר לכל חבילה עמוד תשלום ייעודי בלחיצת כפתור
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingPackage(null);
              setModalMode('edit-package');
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            <span>יצירת חבילה חדשה</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl bg-white dark:bg-slate-900 border p-5 flex flex-col justify-between space-y-5 shadow-sm transition ${
                pkg.isPopular
                  ? 'border-indigo-500 ring-1 ring-indigo-500/30'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {pkg.badgeText && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 mb-1.5">
                        {pkg.badgeText}
                      </span>
                    )}
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {pkg.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPackage(pkg);
                        setModalMode('edit-package');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="ערוך חבילה"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePackage(pkg.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="מחק חבילה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Price & Discount Display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    ₪{pkg.price}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    / {pkg.billingCycle === 'monthly' ? 'לחודש' : pkg.billingCycle === 'annual' ? 'לשנה' : 'חד פעמי'}
                  </span>
                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <span className="text-xs text-slate-400 line-through font-mono">
                      ₪{pkg.originalPrice}
                    </span>
                  )}
                  {pkg.discountPercent && pkg.discountPercent > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      {pkg.discountPercent}% הנחה
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Linked Quiz Info */}
                {pkg.linkedQuizFormTitle && (
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 shrink-0" />
                    <span>
                      מבחן משויך: <strong>{pkg.linkedQuizFormTitle}</strong> (ציון מעבר: {pkg.passingScorePercent || 75}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Page Generation & Links */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {pkg.linkedPaymentPageUrl ? (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60">
                    <div className="truncate text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      עמוד תשלום מוכן
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyText(pkg.linkedPaymentPageUrl!, 'קישור עמוד התשלום')}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs cursor-pointer"
                        title="העתק קישור"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={pkg.linkedPaymentPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <span>פתח עמוד</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => generatePaymentPage(pkg)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>צור עמוד תשלום לחבילה (KosWebAi)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Discount Coupons */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              קופונים והנחות למנויים
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              הגדר קודי קופון באחוזים או בסכום קבוע לשילוב בעמודי התשלום או בשידוך ישיר לאיש קשר
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingCoupon(null);
              setModalMode('edit-coupon');
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            <span>יצירת קופון הנחה</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((cpn) => (
            <div
              key={cpn.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-black text-xs">
                    {cpn.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <Percent className="w-3 h-3" />
                    {cpn.discountType === 'percentage'
                      ? `${cpn.discountValue}% הנחה`
                      : `₪${cpn.discountValue} הנחה`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cpn.description}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  נוצל: {cpn.usedCount} פעמים {cpn.maxUses ? `/ מתוך ${cpn.maxUses}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyText(cpn.code, 'קוד הקופון')}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="העתק קוד"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCoupon(cpn.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="מחק קופון"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
