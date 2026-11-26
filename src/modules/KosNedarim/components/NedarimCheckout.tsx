import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { nedarimService } from '../services/nedarimService';

export interface NedarimCheckoutProps {
  amount: number;
  clientName: string;
  phone: string;
  mail: string;
  receiptType?: string;
  isRecurring?: boolean;
  installments?: number;
  tenantId?: string;
  onMethodSelected?: (method: 'credit' | 'bit' | null) => void;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const NedarimCheckout: React.FC<NedarimCheckoutProps> = ({
  amount,
  clientName,
  phone,
  mail,
  receiptType,
  isRecurring,
  installments,
  tenantId,
  onMethodSelected,
  onSuccess,
  onCancel,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'bit' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [bitCheckCount, setBitCheckCount] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.Name === 'Height') {
        const frame = document.getElementById('NedarimFrame') as HTMLIFrameElement | null;
        if (frame) frame.style.height = parseInt(event.data.Value, 10) + 80 + 'px';
      } else if (event.data?.Name === 'TransactionResponse') {
        if (event.data.Value?.Status === 'Error') {
          setError(event.data.Value.Message || 'שגיאה בתשלום');
          setLoading(false);
        } else {
          onSuccess();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  useEffect(() => {
    if (paymentMethod === 'bit' && transactionData?.PreTransactionId) {
      const interval = setInterval(async () => {
        try {
          const res = await nedarimService.checkBitTransaction(transactionData.PreTransactionId, tenantId);
          setBitCheckCount((c) => c + 1);
          if (res.Status === 'OK') {
            clearInterval(interval);
            onSuccess();
          } else if (res.Status === 'Error' && res.Message === 'העסקה לא אושרה') {
            clearInterval(interval);
            setError('פג תוקף העסקה');
          }
        } catch {
          // Ignore polling transient errors
        }
      }, 6000);

      if (bitCheckCount >= 20) {
        clearInterval(interval);
      }

      return () => clearInterval(interval);
    }
    return undefined;
  }, [paymentMethod, transactionData, bitCheckCount, onSuccess, tenantId]);

  const initTransaction = async (type: 'credit' | 'bit') => {
    setLoading(true);
    setError('');
    setPaymentMethod(type);
    onMethodSelected?.(type);

    try {
      const data = await nedarimService.createTransaction(
        {
          amount,
          paymentType: type,
          clientName,
          phone,
          mail,
          receiptType,
          isRecurring,
          installments,
        },
        tenantId
      );

      if (data.Status === 'Error' || data.Result === 'Error' || data.success === false) {
        setError(data.Message || data.error || 'שגיאה ביצירת עסקה בנדרים פלוס');
        setLoading(false);
        return;
      }

      const resolvedIframe =
        data?.IframeUrl ||
        data?.iframeUrl ||
        data?.Url ||
        (data?.PreTransactionId
          ? `https://www.matara.pro/nedarimplus/v6/Files/WebServices/DebitIframe.aspx?Action=ShowIframe&PreTransactionId=${data.PreTransactionId}`
          : '');

      if (type === 'credit' && !resolvedIframe) {
        setError(data?.Message || data?.error || 'לא התקבל קישור למסוף נדרים פלוס. בדוק את הגדרות המוסד ונסה שוב.');
        setLoading(false);
        return;
      }

      if (type === 'bit' && !data?.BitUrl && !data?.PreTransactionId) {
        setError(data?.Message || data?.error || 'לא התקבל קישור לתשלום ב-Bit מנדרים פלוס.');
        setLoading(false);
        return;
      }

      setTransactionData(data);
      setLoading(false);
    } catch (e: any) {
      setError(e?.message || 'תקלה בתקשורת עם נדרים פלוס');
      setLoading(false);
    }
  };

  const iframeUrl =
    transactionData?.IframeUrl ||
    transactionData?.iframeUrl ||
    transactionData?.Url ||
    (transactionData?.PreTransactionId && paymentMethod === 'credit'
      ? `https://www.matara.pro/nedarimplus/v6/Files/WebServices/DebitIframe.aspx?Action=ShowIframe&PreTransactionId=${transactionData.PreTransactionId}`
      : '');

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {!paymentMethod && (
        <div className={`grid ${isRecurring ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
          <button
            type="button"
            onClick={() => initTransaction('credit')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isRecurring ? 'כרטיס אשראי — הוראת קבע (נדרים)' : 'כרטיס אשראי (נדרים)'}</span>
          </button>
          {!isRecurring && (
            <button
              type="button"
              onClick={() => initTransaction('bit')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0B132B] hover:bg-slate-900 text-[#00D2D2] font-bold text-sm cursor-pointer transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>תשלום ב-Bit</span>
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span>מתחבר למסוף נדרים פלוס...</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPaymentMethod(null);
              setError('');
              setTransactionData(null);
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold shrink-0 cursor-pointer"
          >
            נסה שוב
          </button>
        </div>
      )}

      {iframeUrl && paymentMethod === 'credit' && (
        <iframe
          id="NedarimFrame"
          src={iframeUrl}
          className="w-full min-h-[420px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
          title="Nedarim Plus Payment"
        />
      )}

      {paymentMethod === 'bit' && transactionData?.BitUrl && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-white">השלם את התשלום באפליקציית Bit</p>
          <a
            href={transactionData.BitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#0B132B] text-[#00D2D2] font-bold text-sm"
          >
            פתח תשלום ב-Bit
          </a>
        </div>
      )}

      {onCancel && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
          >
            ביטול
          </button>
        </div>
      )}
    </div>
  );
};
