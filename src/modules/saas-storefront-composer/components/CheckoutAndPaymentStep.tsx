import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, 
  Lock, Sparkles, Building, Mail, Phone, User, ShoppingBag
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';

export const CheckoutAndPaymentStep: React.FC = () => {
  const { 
    cart, 
    customerInfo, 
    setCustomerInfo, 
    totalMonthly, 
    totalAnnualSavings, 
    billingPlan, 
    settings, 
    setViewMode 
  } = useStorefront();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bit'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerInfo.fullName || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNextToSubdomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.fullName.trim() || !customerInfo.email.trim() || !customerInfo.businessName.trim()) {
      setErrorMsg('נא למלא את כל שדות החובה המסומנים בכוכבית (*)');
      return;
    }

    setErrorMsg('');
    setIsProcessingPayment(true);

    // Simulate payment authorization
    setTimeout(() => {
      setIsProcessingPayment(false);
      setViewMode('subdomain_picker');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewMode('catalog')}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לחנות הרכיבים</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-4 h-4" />
          <span>קופה מאובטחת בתקן PCI-DSS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Checkout & Payment Form (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <form onSubmit={handleNextToSubdomain} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            
            {/* 1. Customer & Business Details */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <User className="w-4 h-4 text-indigo-600" />
                <span>1. פרטי הלקוח והעסק</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">שם מלא *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.fullName}
                    onChange={e => {
                      setCustomerInfo({ ...customerInfo, fullName: e.target.value });
                      setCardHolder(e.target.value);
                    }}
                    placeholder="ישראל ישראלי"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">שם העסק / המותג *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.businessName}
                    onChange={e => setCustomerInfo({ ...customerInfo, businessName: e.target.value })}
                    placeholder="שם החברה או העסק"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">כתובת אימייל (לחשבונית) *</label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="you@company.com"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">טלפון / נייד</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="050-1234567"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>2. אמצעי תשלום וסליקה (קשר Hub)</span>
              </h2>

              {/* Payment selector */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>כרטיס אשראי</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bit')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition ${
                    paymentMethod === 'bit'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-black text-indigo-600">bit</span>
                  <span>תשלום ב-Bit</span>
                </button>
              </div>

              {/* Card Inputs */}
              {paymentMethod === 'card' ? (
                <div className="space-y-3 text-xs bg-gray-50/50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">מספר כרטיס אשראי</label>
                    <input
                      type="text"
                      placeholder="4580 •••• •••• 1234"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 font-mono text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">תוקף (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExp}
                        onChange={e => setCardExp(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 font-mono text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">CVV (3 ספרות)</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 font-mono text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl text-center space-y-2 text-xs">
                  <p className="font-bold text-indigo-900 dark:text-indigo-200">סריקת תשלום מאובטח ב-Bit</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">בלחיצה על אישור תועבר לאפליקציית Bit לביצוע התשלום</p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessingPayment}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition transform active:scale-98"
            >
              {isProcessingPayment ? (
                <span>מאמת תשלום ופרטים...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>אשר תשלום ועבור לבחירת סאב-דומיין</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-lg space-y-5">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>סיכום הזמנה ({cart.length} רכיבים)</span>
            </h3>

            {/* List of chosen modules */}
            <div className="space-y-2.5 divide-y divide-gray-100 dark:divide-gray-800">
              {cart.map(item => (
                <div key={item.moduleId} className="pt-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {billingPlan === 'annual' ? item.annualMonthlyPrice : item.monthlyPrice} {settings.currencySymbol} / חודש
                  </span>
                </div>
              ))}
            </div>

            {/* Billing Summary Box */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl space-y-2 text-xs border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>מסלול חיוב:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {billingPlan === 'annual' ? 'שנתי בהנחה (20%)' : 'חודשי ללא התחייבות'}
                </span>
              </div>

              {billingPlan === 'annual' && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>חיסכון שנתי כולל:</span>
                  <span>{totalAnnualSavings} {settings.currencySymbol}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                <span className="font-bold text-sm text-gray-900 dark:text-white">סך הכל לתשלום:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {totalMonthly} {settings.currencySymbol}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-normal">לחודש</span>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>הסאב-דומיין יופק מיידית עם סיום ההזמנה ללא כל דמי הקמה נוספים</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
