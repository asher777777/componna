import React, { useState } from 'react';
import { Share2, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { KosTikTokFullscreenModal } from './KosTikTokFullscreenModal';
import { useTikTok } from '../context/TikTokContext';

export const KosTikTokAccountModal: React.FC = () => {
  const { isModalOpen, modalMode, setIsModalOpen, connectAccount, isLoading } = useTikTok();
  const [clientKey, setClientKey] = useState('');

  if (!isModalOpen || modalMode !== 'connect-account') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await connectAccount(clientKey.trim());
  };

  return (
    <KosTikTokFullscreenModal
      isOpen={isModalOpen && modalMode === 'connect-account'}
      onClose={() => setIsModalOpen(false)}
      title="חיבור חשבון TikTok חדש"
      subtitle="הזדהות OAuth 2.0 מאובטחת לסנכרון פרופיל, העלאת סרטונים וקליטת לידים"
      icon={<Share2 className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-pink-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">אימות מאובטח (OAuth 2.0 PKCE)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                החיבור מתבצע ישירות מול פורטל המפתחים של טיקטוק. הטוקנים נשמרים תחת נתיב הטננט המבודד שלכם ואינם חשופים לשום צד שלישי.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              מפתח לקוח TikTok (Client Key) - אופציונלי לבדיקות Staging
            </label>
            <input
              type="text"
              value={clientKey}
              onChange={(e) => setClientKey(e.target.value)}
              placeholder="הזן Client Key או לחץ על חיבור מהיר"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">הרשאות שיתבקשו מהמשתמש</h4>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              צפייה בפרטי פרופיל וסטטיסטיקות עוקבים (`user.info.basic`, `user.info.stats`)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              קריאת רשימת סרטונים ציבוריים (`video.list`)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              פרסום ישיר של סרטונים ותמונות לחשבון (`video.publish`, `video.upload`)
            </li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isLoading ? 'מתחבר לטיקטוק...' : 'התחבר לחשבון TikTok'}
          </button>
        </div>
      </form>
    </KosTikTokFullscreenModal>
  );
};
