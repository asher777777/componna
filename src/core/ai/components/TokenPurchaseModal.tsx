import React, { useState } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  CreditCard,
  Lock,
  Loader2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Image,
  Film,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { DEFAULT_TOKEN_PACKAGES, TokenTopupPackage, addTokensToTenant } from '../pricingService';
import { TenantTokenUsage } from '../tenantTokenTracker';
import { resolveCurrentTenantId } from '../../tenant/tenantResolver';
import { useHostCapabilities } from '../../bridge/HostCapabilitiesContext';
import { eventBus } from '../../bridge/EventBus';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenUsage: TenantTokenUsage | null;
  onTopupSuccess?: (newQuota: number) => void;
}

export const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({
  isOpen,
  onClose,
  tokenUsage,
  onTopupSuccess,
}) => {
  const { getCapability } = useHostCapabilities();
  const [selectedPackage, setSelectedPackage] = useState<TokenTopupPackage>(DEFAULT_TOKEN_PACKAGES[1]); // Default to Pro
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ newQuota: number; tokensAdded: number } | null>(null);

  if (!isOpen) return null;

  const currentQuota = tokenUsage?.monthlyQuota || 1_000_000;
  const usedTokens = tokenUsage?.totalTokens || 0;
  const remainingTokens = Math.max(0, currentQuota - usedTokens);
  const percentRemaining = Math.min(100, Math.max(0, Math.round((remainingTokens / currentQuota) * 100)));

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientName.trim()) {
      setErrorMessage('נא להזין שם מלא');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      setErrorMessage('נא להזין מספר טלפון תקין');
      return;
    }

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) {
      setErrorMessage('נא להזין כרטיס אשראי תקין (15-16 ספרות)');
      return;
    }
    if (!expiry.trim() || expiry.replace(/\D/g, '').length < 4) {
      setErrorMessage('נא להזין תוקף כרטיס (MM/YY)');
      return;
    }
    if (cvv.trim().length < 3) {
      setErrorMessage('נא להזין קוד CVV בגב הכרטיס');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Process via Kesher Payment Terminal if available
      const paymentTerminal = getCapability<any>('kesher-terminal') || getCapability<any>('payment-service');
      const trxId = `AI_TOPUP_${Date.now()}`;

      if (paymentTerminal && typeof paymentTerminal.charge === 'function') {
        await paymentTerminal.charge({
          amount: selectedPackage.priceILS,
          clientName,
          phone,
          email,
          cardNumber: cleanCard,
          expiry,
          cvv,
          description: `הטענת ${selectedPackage.name} - ${selectedPackage.tokens.toLocaleString()} טוקנים`,
        });
      }

      // 2. Add tokens to the active tenant in Firestore
      const tenantId = resolveCurrentTenantId();
      const topupRes = await addTokensToTenant({
        tenantId,
        tokensToAdd: selectedPackage.tokens,
        reason: 'customer_purchase',
        paymentDetails: {
          transactionId: trxId,
          amountPaidILS: selectedPackage.priceILS,
          paymentMethod: 'credit_card',
        },
      });

      if (!topupRes.success) {
        throw new Error(topupRes.error || 'שגיאה בעדכון יתרת הטוקנים');
      }

      // 3. Emit payment:completed on EventBus
      eventBus.publish('payment:completed', {
        transactionId: trxId,
        amount: selectedPackage.priceILS,
        clientName,
        phone,
        email,
        paymentMethod: 'credit',
        documentType: 320,
        timestamp: new Date().toISOString(),
      });

      setSuccessData({
        newQuota: topupRes.newQuota,
        tokensAdded: selectedPackage.tokens,
      });

      onTopupSuccess?.(topupRes.newQuota);
    } catch (err: any) {
      setErrorMessage(err?.message || 'חלה שגיאה בעיבוד התשלום, אנא נסה שוב.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-right">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>טעינת חבילת טוקנים AI (Gemini 3.8)</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  חידוש מיידי
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                הגדל את מכסת השימוש לבוט הווטסאפ, מחולל האתרים וסטודיו התמונות והווידאו
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {successData ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                הטוקנים הוטענו בהצלחה!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                נוספו לחשבונך <strong className="text-emerald-600 font-mono">{successData.tokensAdded.toLocaleString()}</strong> טוקנים חדשים. המכסה הכוללת עודכנה ל-<strong>{successData.newQuota.toLocaleString()}</strong>.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md transition"
                >
                  המשך לעבוד
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Current Token Status Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">יתרת טוקנים נוכחית:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {remainingTokens.toLocaleString()} / {currentQuota.toLocaleString()} ({percentRemaining}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percentRemaining > 30 ? 'bg-emerald-500' : percentRemaining > 10 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentRemaining}%` }}
                  />
                </div>
              </div>

              {/* Package Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                  בחר חבילת טעינה:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DEFAULT_TOKEN_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            מומלץ ביותר
                          </span>
                        )}
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                            {pkg.name}
                          </div>
                          <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            ₪{pkg.priceILS}
                          </div>
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
                            {pkg.tokens.toLocaleString()} טוקנים
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          {pkg.features.map((f, i) => (
                            <div key={i} className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePay} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>פרטי תשלום מאובטח (סליקת קשר)</span>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">שם מלא:</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="ישראל ישראלי"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">טלפון נייד:</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="050-0000000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">מספר כרטיס אשראי:</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      placeholder="0000 0000 0000 0000"
                      className="w-full font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">תוקף (MM/YY):</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 2) setExpiry(val);
                          else setExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                        }}
                        placeholder="MM/YY"
                        className="w-full font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">קוד CVV (3 ספרות):</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>מעבד תשלום מאובטח...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>שלם ₪{selectedPackage.priceILS} והטען {selectedPackage.tokens.toLocaleString()} טוקנים</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
