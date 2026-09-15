import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Send, Key, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { GreenApiService } from '../services/greenApiService';
import { GreenApiState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: GreenApiService;
  onAuthorized: () => void;
}

export const WhatsAppPhoneAuthModal: React.FC<Props> = ({ isOpen, onClose, service, onAuthorized }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [twoFaPassword, setTwoFaPassword] = useState('');
  const [needs2Fa, setNeeds2Fa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<GreenApiState>('notAuthorized');
  const pollTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      clearInterval(pollTimerRef.current);
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      const stateRes = await service.getStateInstance();
      setCurrentState(stateRes.stateInstance);
      if (stateRes.stateInstance === 'authorized') {
        clearInterval(pollTimerRef.current);
        onAuthorized();
        setTimeout(onClose, 1500);
      }
    }, 3500);

    return () => clearInterval(pollTimerRef.current);
  }, [isOpen]);

  const handleRequestAuthCode = async () => {
    if (!service.isConfigured()) {
      setError('פרטי מופע GREEN-API אינם מוגדרים במערכת. יש להזין Instance ID ו-Token ברכיב הסנכרון וההגדרות.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('נא להזין מספר טלפון בפורמט בינלאומי מלא (לדוגמה: 972501234567)');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setError('מספר הטלפון קצר מדי. ודא קידומת מדינה מלאה ללא מקפים (לדוגמה 972...)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMsg(null);

    try {
      const res = await service.getAuthorizationCode(cleanPhone);
      if (res && res.code) {
        setAuthCode(res.code);
        setStatusMsg('קוד האימות הופק בהצלחה! הזן אותו כעת באפליקציית WhatsApp.');
      } else {
        throw new Error(res.message || 'לא התקבל קוד אימות מהשרת. ייתכן שהמופע כבר מחובר או בעומס.');
      }
    } catch (e: any) {
      const msg = e.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('שגיאת תקשורת עם שרת GREEN-API. ודא שה-Instance ID וה-Token תקינים ושהמופע פעיל.');
      } else {
        setError(msg || 'שגיאה בבקשת קוד אימות');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend2FaPassword = async () => {
    if (!twoFaPassword.trim()) {
      setError('נא להזין סיסמת אימות דו-שלבי');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await service.sendAuthorizationPassword(twoFaPassword.trim());
      if (res.status) {
        setStatusMsg('סיסמת האימות הדו-שלבי נשלחה ומאומתת...');
      } else {
        throw new Error(res.message || 'אימות הסיסמה נכשל');
      }
    } catch (e: any) {
      setError(e.message || 'שגיאה באימות סיסמת 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-right text-slate-100 animate-fade-in">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">התחברות באמצעות קוד הודעה / מספר טלפון</h3>
              <p className="text-[11px] text-slate-400">קישור החשבון ישירות באמצעות הזנת קוד התאמה</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!service.isConfigured() && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">פרטי מופע GREEN-API אינם מוגדרים!</span>
                <span className="text-[11px] opacity-90">נא להגדיר Instance ID ו-API Token ברכיב הסנכרון וההגדרות של המערכת.</span>
              </div>
            </div>
          )}

          {currentState === 'authorized' ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">החיבור הושלם ומאושר!</h4>
              <p className="text-xs text-slate-400">החשבון מקושר ומסונכרן בהצלחה למערכת.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  מספר טלפון לקבלת קוד (פורמט בינלאומי, לדוגמה: 972501234567)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="972501234567"
                    className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                    dir="ltr"
                  />
                  <button
                    onClick={handleRequestAuthCode}
                    disabled={isLoading}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>בקש קוד</span>
                  </button>
                </div>
              </div>

              {authCode && (
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl text-center space-y-2 animate-fade-in">
                  <span className="text-[11px] text-indigo-300 font-semibold block">קוד הצימוד שהתקבל:</span>
                  <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-emerald-400 select-all bg-slate-950 p-2.5 rounded-xl border border-indigo-500/30">
                    {authCode}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    הקוד תקף לכ-3 דקות. הזן אותו כעת באפליקציית WhatsApp.
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1 text-[11px] text-slate-400">
                <p className="font-bold text-slate-200">איך מזינים את הקוד בוואטסאפ?</p>
                <ol className="list-decimal list-inside space-y-1 pr-1 leading-relaxed">
                  <li>פתח את WhatsApp בנייד ובחר <b>"מכשירים מקושרים"</b>.</li>
                  <li>לחץ <b>"קישור מכשיר"</b> ובחר בתחתית <b>"קשר באמצעות מספר טלפון במקום זאת"</b>.</li>
                  <li>הקלד את הקוד המוצג לעיל.</li>
                </ol>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNeeds2Fa(!needs2Fa)}
                  className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>{needs2Fa ? 'הסתר אימות דו-שלבי (2FA)' : 'מוגדרת לך סיסמת אימות דו-שלבי (2FA)? לחץ כאן'}</span>
                </button>

                {needs2Fa && (
                  <div className="mt-2 space-y-2 p-3 bg-slate-950 border border-amber-500/30 rounded-xl animate-fade-in">
                    <label className="block text-[11px] text-amber-300 font-medium">הזן סיסמת 2FA של החשבון:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={twoFaPassword}
                        onChange={(e) => setTwoFaPassword(e.target.value)}
                        placeholder="סיסמת 2FA"
                        className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500"
                        dir="ltr"
                      />
                      <button
                        onClick={handleSend2FaPassword}
                        disabled={isLoading}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        שלח
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {statusMsg && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
