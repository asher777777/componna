/**
 * DonationDrawer: 4-Step Crowdfunding Donation Drawer
 * Supports one-time and recurring standing orders, anonymous gifts, dedications,
 * pending lead logging, and instant WhatsApp receipt confirmation.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  CreditCard,
  Lock,
  Check,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { DonationTier, Ambassador } from '../types';
import { DEFAULT_TIERS } from '../config';

interface DonationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ambassador?: Ambassador | null;
  initialTier?: DonationTier | null;
}

export const DonationDrawer: React.FC<DonationDrawerProps> = ({
  isOpen,
  onClose,
  ambassador,
  initialTier,
}) => {
  const {
    campaign,
    recordPendingDonation,
    completeDonation,
  } = useCampaignModule();

  const tiers = campaign?.campaignTiers?.tiers || DEFAULT_TIERS;

  const [step, setStep] = useState<'amount' | 'details' | 'payment' | 'success'>('amount');
  const [donationMode, setDonationMode] = useState<'recurring' | 'one_time'>('recurring');
  const [selectedTierId, setSelectedTierId] = useState<string>(initialTier?.id || tiers[1]?.id || tiers[0]?.id);
  const [amount, setAmount] = useState<number>(initialTier?.amount || tiers[1]?.amount || 360);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [months, setMonths] = useState<number>(12);

  // Donor Details
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dedication, setDedication] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bit'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardIdNumber, setCardIdNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingDonationId, setPendingDonationId] = useState<string>('');
  const [completedTxnId, setCompletedTxnId] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');

  useEffect(() => {
    if (initialTier) {
      setSelectedTierId(initialTier.id);
      setAmount(initialTier.amount);
    }
  }, [initialTier]);

  if (!isOpen) return null;

  const handleSelectTier = (tier: DonationTier) => {
    setSelectedTierId(tier.id);
    setAmount(tier.amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    setSelectedTierId('');
    if (val && Number(val) > 0) {
      setAmount(Number(val));
    }
  };

  const handleProceedToDetails = () => {
    if (!amount || amount <= 0) {
      setError('אנא בחר או הזן סכום תרומה תקין');
      return;
    }
    setError('');
    setStep('details');
  };

  const handleProceedToPayment = async () => {
    if (!donorName && !isAnonymous) {
      setError('אנא הזן שם תורם או סמן תרומה אנונימית');
      return;
    }
    if (!phone) {
      setError('אנא הזן מספר טלפון לשליחת קבלה בוואטסאפ');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1. Record pending donation
      const campId = campaign?.id || 'campaign-golden-2026';
      const pendingRes = await recordPendingDonation({
        campaignId: campId,
        donorName: isAnonymous ? 'אנונימי' : donorName,
        amount: Number(amount),
        monthlyAmount: donationMode === 'recurring' ? Number(amount) : undefined,
        recurringMonths: donationMode === 'recurring' ? months : undefined,
        isRecurring: donationMode === 'recurring',
        dedication,
        isAnonymous,
        ambassadorId: ambassador?.id || null,
        ambassadorName: ambassador?.name || null,
        phone,
        email,
      });

      if (pendingRes.success) {
        setPendingDonationId(pendingRes.donationId);
        setStep('payment');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בשמירת פרטים');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const campId = campaign?.id || 'campaign-golden-2026';
      const txnId = `TXN-${Date.now().toString().slice(-6)}`;
      const simulatedReceipt = `https://comona.io/receipt/REC-${Date.now().toString().slice(-4)}`;

      // Complete donation
      const res = await completeDonation({
        campaignId: campId,
        donationId: pendingDonationId || `don-${Date.now()}`,
        amount: Number(amount),
        monthlyAmount: donationMode === 'recurring' ? Number(amount) : undefined,
        recurringMonths: donationMode === 'recurring' ? months : undefined,
        isRecurring: donationMode === 'recurring',
        dedication,
        isAnonymous,
        ambassadorId: ambassador?.id || null,
        ambassadorName: ambassador?.name || null,
        donorName: isAnonymous ? 'אנונימי' : donorName,
        phone,
        email,
        paymentMethod,
        transactionId: txnId,
        receiptUrl: simulatedReceipt,
      });

      if (res.success) {
        setCompletedTxnId(txnId);
        setReceiptUrl(simulatedReceipt);
        setStep('success');
      } else {
        setError(res.error || 'התשלום נדחה על ידי חברת האשראי');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בביצוע התשלום');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('amount');
    setDonorName('');
    setPhone('');
    setEmail('');
    setDedication('');
    setIsAnonymous(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardIdNumber('');
    setError('');
    onClose();
  };

  const totalCalculated = donationMode === 'recurring' ? amount * months : amount;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 dir-rtl transition-all">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 flex flex-col gap-5 max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Amount Selection */}
        {step === 'amount' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-100 shadow-sm">
                <Heart className="w-6 h-6 fill-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">בחר סכום תרומה</h3>
              {ambassador ? (
                <p className="text-xs sm:text-sm text-indigo-700 font-semibold">
                  תרומה עבור קהילת {ambassador.name}
                </p>
              ) : (
                <p className="text-xs text-slate-500">כל שותפות מקרבת אותנו להשגת היעד</p>
              )}
            </div>

            {/* Recurring vs One-time toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDonationMode('recurring')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  donationMode === 'recurring'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                הוראת קבע חודשית (12 חודשים)
              </button>
              <button
                type="button"
                onClick={() => setDonationMode('one_time')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  donationMode === 'one_time'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                תרומה חד פעמית
              </button>
            </div>

            {/* Tiers Grid */}
            <div className="grid grid-cols-2 gap-3">
              {tiers.map((t) => {
                const isSelected = selectedTierId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTier(t)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-600">{t.name}</span>
                      {t.popular && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-bold">
                          נבחר
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-black text-indigo-950">₪{t.amount.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{t.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">או סכום אחר לבחירתך:</label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₪</span>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="הזן סכום"
                  className="w-full pr-8 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-bold text-indigo-950"
                />
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500">סה"כ לתרומה:</span>
              <span className="font-black text-indigo-950 text-base">
                ₪{totalCalculated.toLocaleString()}{' '}
                {donationMode === 'recurring' && <span className="text-xs font-normal text-slate-500">(₪{amount} × {months} חודשים)</span>}
              </span>
            </div>

            {error && (
              <div className="text-rose-600 bg-rose-50 border border-rose-200 text-xs p-3 rounded-xl font-semibold text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleProceedToDetails}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              המשך לפרטי תורם
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Donor Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => setStep('amount')}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                חזור לבחירת סכום
              </button>
              <span className="text-xs font-bold text-slate-400">שלב 2 מתוך 3</span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">פרטי התורם והקדשה</h3>
              <p className="text-xs text-slate-500">הפרטים ישמשו להפקת קבלה מוכרת ולשליחה לוואטסאפ</p>
            </div>

            {error && (
              <div className="text-rose-600 bg-rose-50 border border-rose-200 text-xs p-3 rounded-xl font-semibold text-center">
                {error}
              </div>
            )}

            <div className="space-y-3 text-slate-700 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">שם מלא לקבלה *</label>
                <input
                  type="text"
                  disabled={isAnonymous}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="שם פרטי ומשפחה"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="anonymousCheck" className="text-xs text-slate-600 cursor-pointer font-medium">
                  הצג תרומה זו כאנונימית ברשימת התורמים הציבורית
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">טלפון נייד (לקבלה ב-WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">כתובת אימייל</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">הקדשה או ברכה (תוצג בלוח התורמים)</label>
                <textarea
                  rows={2}
                  value={dedication}
                  onChange={(e) => setDedication(e.target.value)}
                  placeholder="לרפואת, להצלחת, לעילוי נשמת..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  המשך לביצוע תשלום
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <form onSubmit={handleCompletePayment} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                חזור לפרטי תורם
              </button>
              <span className="text-xs font-bold text-slate-400">שלב 3 מתוך 3</span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">ביצוע סליקה מאובטחת</h3>
              <p className="text-xs text-slate-500">
                סכום לחיוב: <strong className="text-indigo-900 font-extrabold text-sm">₪{totalCalculated.toLocaleString()}</strong>
              </p>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                כרטיס אשראי
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bit')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  paymentMethod === 'bit'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                אפליקציית Bit
              </button>
            </div>

            {error && (
              <div className="text-rose-600 bg-rose-50 border border-rose-200 text-xs p-3 rounded-xl font-semibold text-center">
                {error}
              </div>
            )}

            {paymentMethod === 'credit_card' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">מספר כרטיס אשראי</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4580 0000 0000 0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono dir-ltr"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">תוקף (MM/YY)</label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono text-center dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono text-center dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ת.ז. בעל הכרטיס</label>
                    <input
                      type="text"
                      required
                      placeholder="ת.ז."
                      value={cardIdNumber}
                      onChange={(e) => setCardIdNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-2">
                <Smartphone className="w-8 h-8 text-blue-600 mx-auto" />
                <h4 className="text-sm font-bold text-blue-950">תשלום באמצעות Bit</h4>
                <p className="text-xs text-blue-700">
                  בלחיצה על אישור תועבר לאפליקציית Bit לביצוע תשלום של ₪{totalCalculated.toLocaleString()}
                </p>
              </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>תקשורת מאובטחת בהצפנת SSL ובתקן PCI-DSS המחמיר</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  אשר תשלום של ₪{totalCalculated.toLocaleString()}
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 4: Success Screen */}
        {step === 'success' && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">תודה רבה על תרומתך!</h3>
              <p className="text-sm text-slate-500">
                התרומה בסך <strong className="text-indigo-950 font-bold">₪{totalCalculated.toLocaleString()}</strong> נקלטה בהצלחה.
              </p>
              {ambassador && (
                <div className="inline-block mt-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  שוייך לקהילת {ambassador.name}
                </div>
              )}
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">מספר אישור עסקה:</span>
                <span className="font-mono font-bold text-slate-700">{completedTxnId}</span>
              </div>
              {receiptUrl && (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-indigo-600 font-bold transition-all shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  צפה בקבלה
                </a>
              )}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800">
              הודעת אישור וקישור לקבלה נשלחו בהצלחה לוואטסאפ שלכם ({phone}).
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
            >
              סיום וחזרה לקמפיין
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
