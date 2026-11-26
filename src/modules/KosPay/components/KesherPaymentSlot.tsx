import React, { useState } from 'react';
import { useKesherPaymentsContext } from '../context/KesherPaymentsContext';
import { kesherService } from '../services/kesherService';
import { CreditCard, CheckCircle2, Loader2, ShieldCheck, Smartphone, Lock, Calendar } from 'lucide-react';

export interface KesherPaymentSlotProps {
  amount?: number;
  clientName?: string;
  phone?: string;
  email?: string;
  description?: string;
  documentType?: number | string;
  requireId?: boolean;
  isRecurring?: boolean;
  installments?: number;
  onSuccess?: (result: { transactionId: string; amount: number; receiptUrl?: string }) => void;
  onCancel?: () => void;
}

export const KesherPaymentSlot: React.FC<KesherPaymentSlotProps> = ({
  amount = 100,
  clientName = '',
  phone = '',
  email = '',
  description = 'תשלום שאלון KSF',
  documentType = 320,
  requireId = false,
  isRecurring = false,
  installments,
  onSuccess,
}) => {
  const { isConfigured, processCreditCardPayment, processBitPayment } = useKesherPaymentsContext();

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bit'>('credit_card');
  const [bitPhone, setBitPhone] = useState(phone || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [tz, setTz] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (!isRecurring && paymentMethod === 'bit') {
        const cleanBitPhone = (bitPhone || phone || '').replace(/\D/g, '');
        if (cleanBitPhone.length < 9) {
          setErrorMsg('נא להזין מספר טלפון נייד תקין לתשלום ב-Bit');
          setIsProcessing(false);
          return;
        }
        const res = await processBitPayment({
          clientName: clientName || 'לקוח KSF',
          phoneNumber: cleanBitPhone,
          amount,
          description,
          documentType: (Number(documentType) || 320) as any,
        });

        const isOk =
          res.Status === true ||
          res.Success === true ||
          res.success === true ||
          res.status === 'Approved' ||
          res.status === 'Success';

        if (isOk) {
          const tid = res.TransactionId || res.BitTransactionId || res.transactionId || `bit_${Date.now()}`;
          const receiptUrl = res.DocUrl || (res as any)?.docUrl || (res as any)?.pdfLink || '';
          setTransactionId(tid);
          setIsApproved(true);
          onSuccess?.({ transactionId: tid, amount, receiptUrl });
        } else {
          setErrorMsg(res.errorMessage || res.Description || res.Message || 'התשלום ב-Bit לא אושר');
        }
      } else {
        // Validate credit card inputs (length + Luhn check)
        const cleanCard = cardNumber.replace(/\s+/g, '');
        const luhnCheck = kesherService.validateCreditCard(cleanCard);
        if (cleanCard.length < 12 || !/^\d+$/.test(cleanCard) || !luhnCheck.isValid) {
          setErrorMsg('מספר כרטיס האשראי אינו תקין. נא לבדוק את הספרות ולנסות שנית.');
          setIsProcessing(false);
          return;
        }
        if (!expiryMonth || !expiryYear) {
          setErrorMsg('נא לבחור תוקף כרטיס (חודש ושנה)');
          setIsProcessing(false);
          return;
        }
        if (!cvv || cvv.length < 3) {
          setErrorMsg('נא להזין קוד אבטחה (CVV) תקין');
          setIsProcessing(false);
          return;
        }
        if (requireId && (!tz || tz.length < 5)) {
          setErrorMsg('נא להזין מספר תעודת זהות תקין');
          setIsProcessing(false);
          return;
        }

        const formattedExpiry = `${expiryMonth.padStart(2, '0')}${expiryYear.padStart(2, '0')}`;
        const docTypeNum = Number(documentType) || 320;

        const res = await processCreditCardPayment({
          cardNumber: cleanCard,
          expiry: formattedExpiry,
          cvv,
          tz: tz || undefined,
          amount,
          creditType: isRecurring ? 10 : 1,
          installments: isRecurring ? (installments && installments > 0 ? installments : 9999) : 1,
          clientName: clientName || 'לקוח KSF',
          phone,
          email,
          comment: description,
          documentType: docTypeNum as any,
        });

        const isOk =
          res.Status === true ||
          res.Success === true ||
          res.success === true ||
          res.status === 'Approved' ||
          res.status === 'Success';

        if (isOk && (res.TransactionId || res.transactionId)) {
          const tid = res.TransactionId || res.transactionId || '';
          const receiptUrl = res.DocUrl || (res as any)?.docUrl || (res as any)?.pdfLink || '';
          setTransactionId(tid);
          setIsApproved(true);
          onSuccess?.({ transactionId: tid, amount, receiptUrl });
        } else {
          setErrorMsg(res.errorMessage || res.Description || res.Message || 'התשלום לא אושר במסוף קשר');
        }
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'שגיאה בעת ביצוע התשלום במסוף');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isApproved) {
    return (
      <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-2 animate-fadeIn" dir="rtl">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h4 className="font-black text-emerald-900 dark:text-emerald-200 text-base">
          התשלום אושר בהצלחה!
        </h4>
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
          מספר אסמכתא: {transactionId}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm text-right" dir="rtl">
      {/* Payment Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
            {isRecurring ? 'הוראת קבע מאובטחת (קשר)' : 'מסוף סליקה מאובטח (קשר)'}
          </span>
        </div>
        <div className="text-left font-black text-slate-900 dark:text-white text-lg font-mono">
          ₪{amount}{isRecurring ? ' / חודש' : ''}
        </div>
      </div>

      {/* Payment Method Selector (Bit is only for one-time payments) */}
      {!isRecurring && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('credit_card')}
            className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
              paymentMethod === 'credit_card'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs">כרטיס אשראי</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('bit')}
            className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
              paymentMethod === 'bit'
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-xs">תשלום ב-Bit</span>
          </button>
        </div>
      )}

      {!isRecurring && paymentMethod === 'bit' && (
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            מספר טלפון נייד לתשלום ב-Bit *
          </label>
          <input
            type="tel"
            dir="ltr"
            value={bitPhone}
            onChange={(e) => setBitPhone(e.target.value.replace(/[^\d-]/g, ''))}
            placeholder="050-1234567"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm font-mono text-left focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
      )}

      {(isRecurring || paymentMethod === 'credit_card') && (
        <div className="space-y-2.5 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">מספר כרטיס אשראי *</label>
              <span className="text-[10px] text-slate-400">תומך במילוי אוטומטי וסריקת כרטיס מהנייד</span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="cardnumber"
                autoComplete="cc-number"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, ''))}
                placeholder="4580 0000 0000 0000"
                maxLength={19}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pr-4 pl-10 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500"
                dir="ltr"
                required
              />
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">חודש</label>
              <select
                name="ccmonth"
                autoComplete="cc-exp-month"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-2 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500"
                dir="ltr"
                required
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">שנה</label>
              <select
                name="ccyear"
                autoComplete="cc-exp-year"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-2 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500"
                dir="ltr"
                required
              >
                <option value="">YY</option>
                {Array.from({ length: 12 }, (_, i) => String(26 + i)).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CVV *</label>
              <div className="relative">
                <input
                  type="password"
                  name="cvc"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pr-3 pl-8 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {requireId && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">מספר תעודת זהות (ת.ז) *</label>
              <input
                type="text"
                value={tz}
                onChange={(e) => setTz(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="012345678"
                maxLength={9}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500"
                dir="ltr"
                required
              />
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold text-center">
          {errorMsg}
        </div>
      )}

      {/* Action Pay Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>מעבד תשלום מאובטח במסוף...</span>
          </>
        ) : (
          <span>
            {isRecurring
              ? `אשר והקם הוראת קבע (₪${amount} / חודש)`
              : `אשר ובצע תשלום (₪${amount})`}
          </span>
        )}
      </button>
    </form>
  );
};

export default KesherPaymentSlot;
