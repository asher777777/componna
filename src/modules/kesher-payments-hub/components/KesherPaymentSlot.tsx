import React, { useState } from 'react';
import { useKesherPaymentsContext } from '../context/KesherPaymentsContext';
import { CreditCard, CheckCircle2, Loader2, ShieldCheck, Smartphone } from 'lucide-react';

export interface KesherPaymentSlotProps {
  amount?: number;
  clientName?: string;
  phone?: string;
  email?: string;
  description?: string;
  onSuccess?: (result: { transactionId: string; amount: number }) => void;
  onCancel?: () => void;
}

export const KesherPaymentSlot: React.FC<KesherPaymentSlotProps> = ({
  amount = 100,
  clientName = '',
  phone = '',
  email = '',
  description = 'תשלום שאלון KSF',
  onSuccess,
}) => {
  const { isConfigured, processCreditCardPayment, processBitPayment } = useKesherPaymentsContext();

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bit'>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      if (paymentMethod === 'bit') {
        const res = await processBitPayment({
          clientName: clientName || 'לקוח KSF',
          phoneNumber: phone || '',
          amount,
          description,
          documentType: 320,
        });

        if (res.status === 'Approved' || res.status === 'Success' || !isConfigured) {
          const tid = res.transactionId || `bit_${Date.now()}`;
          setTransactionId(tid);
          setIsApproved(true);
          onSuccess?.({ transactionId: tid, amount });
        } else {
          setErrorMsg(res.errorMessage || 'התשלום ב-Bit לא אושר');
        }
      } else {
        const res = await processCreditCardPayment({
          cardNumber: '',
          expiry: '',
          cvv: '',
          amount,
          clientName: clientName || 'לקוח KSF',
          phone,
          email,
          comment: description,
          documentType: 320,
        });

        if (res.status === 'Approved' || res.status === 'Success' || !isConfigured) {
          const tid = res.transactionId || `kesher_${Date.now()}`;
          setTransactionId(tid);
          setIsApproved(true);
          onSuccess?.({ transactionId: tid, amount });
        } else {
          setErrorMsg(res.errorMessage || 'התשלום לא אושר במסוף קשר');
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
      <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-2 animate-fadeIn">
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
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm text-right">
      {/* Payment Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
            מסוף סליקה מאובטח (קשר)
          </span>
        </div>
        <div className="text-left font-black text-slate-900 dark:text-white text-lg font-mono">
          ₪{amount}
        </div>
      </div>

      {/* Payment Method Selector */}
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

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold text-center">
          {errorMsg}
        </div>
      )}

      {/* Action Pay Button */}
      <button
        type="button"
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>מעבד תשלום במסוף...</span>
          </>
        ) : (
          <span>אשר ובצע תשלום (₪{amount})</span>
        )}
      </button>
    </div>
  );
};

export default KesherPaymentSlot;
