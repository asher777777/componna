import React, { useState } from 'react';
import { Youtube, Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { KosTubeFullscreenModal } from './KosTubeFullscreenModal';
import { useKosTube } from '../context/KosTubeContext';

export const KosTubeChannelModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, modalMode, setModalMode, syncChannel, isSyncing, error, isRootTenant } = useKosTube();
  const [channelQuery, setChannelQuery] = useState('');
  const [apiKey, setApiKey] = useState('');

  if (!isModalOpen || modalMode !== 'channel_connect') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelQuery.trim()) return;
    await syncChannel(channelQuery, isRootTenant ? apiKey : undefined);
  };

  return (
    <KosTubeFullscreenModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="חיבור וסנכרון ערוץ יוטיוב"
    >
      <div className="max-w-2xl mx-auto p-6 md:p-12 space-y-8 animate-fadeIn" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-red-600/10 text-red-600 mx-auto flex items-center justify-center border border-red-500/20">
            <Youtube className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            חיבור ערוץ יוטיוב ל-KosTube
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            הזן את כתובת הערוץ, Handle או מזהה ערוץ כדי למשוך את הסרטונים ולהפיק עבורם עמודי תוכן מקודמים ב-SEO.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              כתובת הערוץ או Handle (לדוגמה: @channelName)
            </label>
            <div className="relative">
              <Youtube className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              <input
                type="text"
                placeholder="https://youtube.com/@channelName או @MyChannel"
                value={channelQuery}
                onChange={(e) => setChannelQuery(e.target.value)}
                required
                className="w-full pr-12 pl-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>
          </div>

          {!isRootTenant ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                  סנכרון ערוץ אוטומטי מבוסס Master Key
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                  מפתח ה-API מסופק ומאומת אוטומטית ברמת שרת המערכת הראשית. אין צורך בהזנת מפתח API בסאב-דומיין.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  מפתח YouTube Data API v3 (הגדרת מפתח Master לכלל הטננטים)
                </label>
                <button
                  type="button"
                  onClick={() => setModalMode('add_video')}
                  className="text-xs text-red-500 hover:underline font-semibold cursor-pointer"
                >
                  רוצה להוסיף סרטון בקישור ללא מפתח? לחץ כאן
                </button>
              </div>
              <input
                type="password"
                placeholder="AIzaSy... (הזן כאן מפתח Master ראשי)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
              <p className="text-[11px] text-slate-400">
                המפתח יישמר ברמת ה-Master וישמש אוטומטית את כל הסאב-דומיינים במערכת.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSyncing || !channelQuery.trim()}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg hover:shadow-red-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>מסנכרן את נתוני הערוץ והסרטונים...</span>
              </>
            ) : (
              <span>סנכרן וחבר ערוץ</span>
            )}
          </button>
        </form>
      </div>
    </KosTubeFullscreenModal>
  );
};
