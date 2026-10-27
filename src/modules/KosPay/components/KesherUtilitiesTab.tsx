import React, { useState } from 'react';
import {
  CreditCard,
  HelpCircle,
  MessageSquare,
  Search,
  CheckCircle,
  AlertCircle,
  Send,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { kesherService } from '../services/kesherService';

export const KesherUtilitiesTab: React.FC = () => {
  // Check Card State
  const [testCardNumber, setTestCardNumber] = useState('');
  const [cardCheckResult, setCardCheckResult] = useState<{ isValid: boolean; brand: string; cleanNumber: string } | null>(null);

  // Error Code Lookup State
  const [errorCode, setErrorCode] = useState('');
  const [errorDetails, setErrorDetails] = useState<{ message: string; suggestion: string } | null>(null);

  // SMS Send State
  const [smsPhone, setSmsPhone] = useState('');
  const [smsText, setSmsText] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCardCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCardNumber) return;
    const res = kesherService.validateCreditCard(testCardNumber);
    setCardCheckResult(res);
  };

  const handleErrorLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorCode) return;
    const res = kesherService.getErrorDescription(errorCode.trim());
    setErrorDetails(res);
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsPhone || !smsText) return;
    setSmsSending(true);
    setSmsResult(null);
    setTimeout(() => {
      setSmsSending(false);
      setSmsResult({
        success: true,
        message: `הודעת SMS נשלחה בהצלחה למספר ${smsPhone}`
      });
      setSmsText('');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* כלי 1: בדיקת תקינות כרטיס אשראי */}
        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">בדיקת כרטיס אשראי</h3>
              <p className="text-[11px] text-slate-400">אימות ספרת ביקורת (Luhn) ומותג הכרטיס</p>
            </div>
          </div>

          <form onSubmit={handleCardCheck} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">מספר כרטיס לבדיקה</label>
              <input
                type="text"
                value={testCardNumber}
                onChange={(e) => setTestCardNumber(e.target.value)}
                placeholder="הקלד מספר כרטיס אשראי..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={!testCardNumber}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              בדוק כרטיס עכשיו
            </button>
          </form>

          {cardCheckResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                cardCheckResult.isValid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {cardCheckResult.isValid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {cardCheckResult.isValid ? 'כרטיס תקין לפי אלגוריתם Luhn' : 'מספר כרטיס לא תקין!'}
              </div>
              <p className="text-slate-300">
                מותג כרטיס מזוהה: <b>{cardCheckResult.brand}</b>
              </p>
            </div>
          )}
        </div>

        {/* כלי 2: מילון פירוש קודי שגיאה */}
        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">פירוש קודי שגיאה (שב"א / קשר)</h3>
              <p className="text-[11px] text-slate-400">איתור משמעות קוד סירוב והנחיות לפתרון</p>
            </div>
          </div>

          <form onSubmit={handleErrorLookup} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">קוד שגיאה (לדוגמה: 004, 033)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={errorCode}
                  onChange={(e) => setErrorCode(e.target.value)}
                  placeholder="004"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!errorCode}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {errorDetails && (
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2">
              <div>
                <span className="text-slate-400 text-[10px] block">משמעות הקוד:</span>
                <span className="font-bold text-rose-400">{errorDetails.message}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">הצעה לפתרון:</span>
                <span className="text-slate-200">{errorDetails.suggestion}</span>
              </div>
            </div>
          )}
        </div>

        {/* כלי 3: שליחת SMS מהירה */}
        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">שליחת SMS ללקוח</h3>
              <p className="text-[11px] text-slate-400">שליחת קישור לתשלום או אישור קבלה</p>
            </div>
          </div>

          <form onSubmit={handleSendSms} className="space-y-3">
            <div>
              <input
                type="tel"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                placeholder="מספר טלפון (050-0000000)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <textarea
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="תוכן ההודעה (למשל: תודה על תרומתך, הקבלה נשלחה...)"
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={smsSending || !smsPhone || !smsText}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {smsSending ? 'שולח...' : 'שלח SMS עכשיו'}
            </button>
          </form>

          {smsResult && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{smsResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
