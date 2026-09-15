import React, { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, CheckCircle, AlertCircle, X, Smartphone, ShieldCheck, Clock } from 'lucide-react';
import { GreenApiService } from '../services/greenApiService';
import { GreenApiState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: GreenApiService;
  onAuthorized: () => void;
}

export const WhatsAppQrAuthModal: React.FC<Props> = ({ isOpen, onClose, service, onAuthorized }) => {
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20);
  const [currentState, setCurrentState] = useState<GreenApiState>('notAuthorized');
  const pollTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  const fetchQr = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await service.getQrCode();
      if (res && res.message) {
        setQrBase64(res.message);
        setCountdown(20);
      } else {
        throw new Error('לא התקבלה תמונת QR מהשרת');
      }
    } catch (e: any) {
      setError(e.message || 'שגיאה בטעינת קוד ה-QR');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      clearInterval(pollTimerRef.current);
      clearInterval(countdownTimerRef.current);
      return;
    }

    fetchQr();

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQr();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    pollTimerRef.current = setInterval(async () => {
      const stateRes = await service.getStateInstance();
      setCurrentState(stateRes.stateInstance);
      if (stateRes.stateInstance === 'authorized') {
        clearInterval(pollTimerRef.current);
        clearInterval(countdownTimerRef.current);
        onAuthorized();
        setTimeout(onClose, 1200);
      }
    }, 3000);

    return () => {
      clearInterval(pollTimerRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-right text-slate-100 animate-fade-in">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">התחברות לוואטסאפ באמצעות QR קוד</h3>
              <p className="text-[11px] text-slate-400">סרוק מהנייד לחיבור מיידי ומאובטח ל-Green-API</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center justify-center space-y-4 text-center">
          {!service.isConfigured() && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-xs flex items-center gap-2.5 w-full text-right">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">פרטי מופע GREEN-API אינם מוגדרים!</span>
                <span className="text-[11px] opacity-90">נא להגדיר Instance ID ו-API Token ברכיב הסנכרון וההגדרות.</span>
              </div>
            </div>
          )}

          {currentState === 'authorized' ? (
            <div className="py-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-white">החיבור הושלם בהצלחה!</h4>
              <p className="text-xs text-slate-400">החשבון מחובר, מסונכרן ומוכן לשימוש.</p>
            </div>
          ) : (
            <>
              <div className="relative p-3 bg-white rounded-2xl shadow-xl border border-slate-700 w-64 h-64 flex items-center justify-center">
                {isLoading && !qrBase64 ? (
                  <div className="flex flex-col items-center gap-2 text-slate-700 text-xs font-semibold">
                    <RefreshCw className="w-7 h-7 animate-spin text-emerald-600" />
                    <span>מייצר קוד QR חי...</span>
                  </div>
                ) : qrBase64 ? (
                  <img
                    src={`data:image/png;base64,${qrBase64}`}
                    alt="WhatsApp QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-xs text-rose-500 p-2">{error || 'לא נטען קוד'}</div>
                )}
                {isLoading && qrBase64 && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>רענון אוטומטי בעוד: <b className="text-amber-400 font-mono">{countdown} שניות</b></span>
                <button
                  onClick={fetchQr}
                  disabled={isLoading}
                  className="mr-2 text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>רענן עכשיו</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-right w-full space-y-1.5 text-xs text-slate-300">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>הוראות סריקה בנייד:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 pr-1 leading-relaxed">
                  <li>פתח את אפליקציית WhatsApp בטלפון שלך.</li>
                  <li>לחץ על תפריט (3 נקודות או הגדרות) ובחר <b>"מכשירים מקושרים" (Linked Devices)</b>.</li>
                  <li>לחץ על <b>"קישור מכשיר" (Link a Device)</b>.</li>
                  <li>כוון את מצלמת הטלפון לסריקת קוד ה-QR המוצג לעיל.</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
