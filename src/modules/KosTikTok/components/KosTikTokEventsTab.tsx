import React, { useState } from 'react';
import { Activity, Send, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useTikTok } from '../context/TikTokContext';
import { KosTikTokEventPayload } from '../types';

export const KosTikTokEventsTab: React.FC = () => {
  const { sendConversionEvent, isLoading } = useTikTok();

  const [eventName, setEventName] = useState<string>('CompletePayment');
  const [eventValue, setEventValue] = useState<number>(149);
  const [email, setEmail] = useState<string>('customer@example.com');
  const [sendSuccess, setSendSuccess] = useState<boolean | null>(null);

  const handleTestEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendSuccess(null);

    const payload: KosTikTokEventPayload = {
      event: eventName,
      eventId: `test_${Date.now()}`,
      eventTime: Math.floor(Date.now() / 1000),
      user: {
        email,
      },
      properties: {
        currency: 'ILS',
        value: Number(eventValue),
      },
      page: {
        url: window.location.href,
      },
    };

    const res = await sendConversionEvent(payload);
    setSendSuccess(res.success);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">אירועי המרה - TikTok Events API v1.3</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          שליחת המרות צד-שרת (Server-to-Server) לטיוב קמפיינים ודיווח עסקאות עם מזהי PII מוצפנים ב-SHA-256
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Dispatcher Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">בדיקת שליחת אירוע המרה (Test Event)</h3>
          </div>

          <form onSubmit={handleTestEvent} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">שם האירוע (Standard Event)</label>
              <select
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
              >
                <option value="CompletePayment">רכישה הושלמה (CompletePayment)</option>
                <option value="Lead">ליד חדש (Lead)</option>
                <option value="AddToCart">הוספה לסל (AddToCart)</option>
                <option value="InitiateCheckout">התחלת תשלום (InitiateCheckout)</option>
                <option value="ViewContent">צפייה בתוכן (ViewContent)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">שווי העסקה (ILS)</label>
              <input
                type="number"
                value={eventValue}
                onChange={(e) => setEventValue(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">אימייל לקוח (מוצפן SHA-256 בשליחה)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              שלח אירוע המרה ל-TikTok
            </button>
          </form>

          {sendSuccess !== null && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              sendSuccess
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {sendSuccess ? 'אירוע ההמרה נשלח ותועד בהצלחה!' : 'שליחת האירוע נכשלה.'}
            </div>
          )}
        </div>

        {/* Info & Architecture Card */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">אבטחה ו-Deduplication</h3>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>
              • <strong>מניעת כפילויות (Deduplication):</strong> כל אירוע כולל `event_id` ייחודי הזהה לזה שמועבר בפיקסל ה-Web בדפדפן, כך שטיקטוק מאחדת את הדיווחים ללא ספירה כפולה.
            </p>
            <p>
              • <strong>הצפנת פרטיות:</strong> שדות רגישים (אימייל, טלפון) מומרים ל-lowercase, מנוקים מרווחים ומוצפנים ב-SHA-256 לפני שהם עוזבים את השרת.
            </p>
            <p>
              • <strong>בידוד טננט:</strong> יומן האירועים נשמר בנתיב המבודד של הטננט הנוכחי תחת `mod_kos_tiktok_events`.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
