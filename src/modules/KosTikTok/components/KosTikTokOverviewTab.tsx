import React from 'react';
import {
  Users,
  Heart,
  Video,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Plus,
  TrendingUp,
  Target,
  Activity,
  Layers,
} from 'lucide-react';
import { useTikTok } from '../context/TikTokContext';

export const KosTikTokOverviewTab: React.FC = () => {
  const {
    activeAccount,
    accounts,
    videos,
    leads,
    refreshVideos,
    isLoading,
    setIsModalOpen,
    setModalMode,
    setActiveTab,
  } = useTikTok();

  if (!activeAccount) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 mx-auto flex items-center justify-center">
          <Video className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">טרם חובר חשבון TikTok לטננט זה</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            חברו את חשבון הטיקטוק שלכם כדי להתחיל לפרסם סרטונים, למשוך נתוני צפיות ולקלוט לידים מקמפיינים ממומנים.
          </p>
        </div>
        <button
          onClick={() => {
            setModalMode('connect-account');
            setIsModalOpen(true);
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-sm shadow-md hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          התחבר לחשבון TikTok
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={activeAccount.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={activeAccount.displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-500 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black">{activeAccount.displayName}</h2>
                {activeAccount.isVerified && (
                  <span title="חשבון מאומת">
                    <CheckCircle2 className="w-5 h-5 text-sky-400" />
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{activeAccount.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  מחובר ומסונכרן
                </span>
                <span className="text-xs text-slate-500">
                  טננט מבודד | {accounts.length} חשבונות רשומים
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refreshVideos()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              סנכרן נתונים
            </button>
            <button
              onClick={() => {
                setModalMode('publish-video');
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              פרסם סרטון חדש
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Users className="w-4 h-4 text-pink-400" />
              עוקבים
            </div>
            <div className="text-2xl font-black text-white">
              {activeAccount.followerCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Heart className="w-4 h-4 text-rose-400" />
              לייקים
            </div>
            <div className="text-2xl font-black text-white">
              {activeAccount.likesCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Video className="w-4 h-4 text-sky-400" />
              סרטונים
            </div>
            <div className="text-2xl font-black text-white">
              {activeAccount.videoCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Target className="w-4 h-4 text-emerald-400" />
              לידים שנקלטו
            </div>
            <div className="text-2xl font-black text-white">
              {leads.length.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Videos Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">סרטונים ופרסום ישיר</h3>
                <p className="text-xs text-slate-500">{videos.length} סרטונים שמורים במערכת</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('videos')}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
            >
              לכל הסרטונים
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            העלאת וידאו אוטומטית ישירות לפרופיל היוצר או העברה לטיוטות באפליקציית TikTok ללא שלבי ביניים.
          </p>
        </div>

        {/* Leads Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">לידים מקמפיינים (Lead Ads)</h3>
                <p className="text-xs text-slate-500">{leads.length} לידים נקלטו</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              צפה בלידים
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            קליטת לידים בזמן אמת מטופסי טיקטוק (Instant Forms) היישר ל-CRM המבודד של הטננט.
          </p>
        </div>

        {/* Events API Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Events API (Conversions)</h3>
                <p className="text-xs text-slate-500">שרת-לשרת v1.3</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('events')}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
            >
              מעקב המרות
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            דיווח המרות רכישה, הרשמה וטפסים עם מזהי PII מוצפנים ב-SHA-256 לשיפור ביצועי ה-ROAS.
          </p>
        </div>
      </div>
    </div>
  );
};
