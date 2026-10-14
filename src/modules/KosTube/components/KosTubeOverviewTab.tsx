import React from 'react';
import { 
  Youtube, 
  Sparkles, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Sliders, 
  Layers, 
  Globe 
} from 'lucide-react';
import { useKosTube } from '../context/KosTubeContext';
import { useKosTubeData } from '../hooks/useKosTubeData';

export const KosTubeOverviewTab: React.FC = () => {
  const { 
    channel, 
    syncChannel, 
    isSyncing, 
    batchGenerateSeoPages, 
    isGenerating, 
    generatingVideoId,
    generateSeoPage,
    setSelectedPage,
    setIsModalOpen,
    setModalMode,
    setActiveTab
  } = useKosTube();

  const { stats, videos, seoPages } = useKosTubeData();

  return (
    <div className="space-y-8 animate-fadeIn" dir="rtl">
      {/* Hero Channel Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-6 md:p-8 text-white shadow-xl border border-red-500/20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              {channel?.thumbnailUrl ? (
                <img 
                  src={channel.thumbnailUrl} 
                  alt={channel.title} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500/50 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-red-600/30 flex items-center justify-center border-2 border-red-500/40">
                  <Youtube className="w-10 h-10 text-red-500" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900">
                <Youtube className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">
                  {channel?.title || 'טרם חובר ערוץ יוטיוב'}
                </h2>
                {channel?.customUrl && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                    {channel.customUrl}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-slate-300 max-w-2xl line-clamp-2">
                {channel?.description || 'חבר את ערוץ היוטיוב שלך כדי לסנכרן אוטומטית סרטונים ולהפיק לכל אחד עמוד תוכן מקודם ב-SEO עם מנוע ה-AI של קושאן.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setModalMode('add_video');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition shadow-sm text-sm font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span>הוסף סרטון בקישור</span>
            </button>

            {channel ? (
              <>
                <button
                  type="button"
                  onClick={() => channel.customUrl && syncChannel(channel.customUrl)}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm text-sm font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-red-400' : ''}`} />
                  <span>סנכרן ערוץ</span>
                </button>

                <button
                  type="button"
                  onClick={() => batchGenerateSeoPages()}
                  disabled={isGenerating || stats.pendingVideos === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium shadow-md transition text-sm disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ייצר עמודי SEO לכל הסרטונים</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setModalMode('channel_connect');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg hover:shadow-red-600/30 transition text-sm cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
                <span>חבר ערוץ יוטיוב</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>סך סרטונים בערוץ</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Youtube className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalVideos}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {channel?.videoCount ? `מתוך ${channel.videoCount} סרטונים קיימים` : 'מסונכרנים במערכת'}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>עמודי SEO פעילים</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalSeoPages}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            {stats.totalVideos > 0
              ? `${Math.round((stats.totalSeoPages / stats.totalVideos) * 100)}% כיסוי תוכן`
              : 'מוכנים לסריקת גוגל'}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>ציון SEO ממוצע</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.averageSeoScore || 85}
            <span className="text-sm font-normal text-slate-400 mr-1">/100</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            סכמת JSON-LD, מטא-דאטה ומאמרי עומק
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>ממתינים לעיבוד AI</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.pendingVideos}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            סרטונים הזמינים ליצירת עמוד SEO מיידי
          </p>
        </div>
      </div>

      {/* Main Content Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Videos waiting for SEO / processed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <span>סרטונים אחרונים מהערוץ</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
            >
              לכל הסרטונים ({videos.length})
            </button>
          </div>

          <div className="space-y-3">
            {videos.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <Youtube className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  טרם נוספו סרטונים למערכת
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  באפשרותך להדביק קישור ישיר לכל סרטון יוטיוב אמיתי וליצור עבורו עמוד SEO מקודם מיידית, או להגדיר מפתח YouTube API בטאב הגדרות לסנכרון מלא.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('add_video');
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף סרטון ראשון בקישור</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    <span>הגדרות ערוץ ומפתח API</span>
                  </button>
                </div>
              </div>
            ) : (
              videos.slice(0, 4).map((video) => {
                const isProcessingThis = isGenerating && generatingVideoId === video.id;
                const hasPage = Boolean(video.seoPageId);

                return (
                  <div
                    key={video.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-red-500/30 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-24 h-16 rounded-lg object-cover flex-shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {video.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {video.description || 'ללא תיאור'}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span>{new Date(video.publishedAt).toLocaleDateString('he-IL')}</span>
                          {video.duration && <span>אורך: {video.duration}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
                      {hasPage ? (
                        <button
                          type="button"
                          onClick={() => {
                            const p = seoPages.find((page) => page.id === video.seoPageId);
                            if (p) {
                              setSelectedPage(p);
                              setModalMode('page_preview');
                              setIsModalOpen(true);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium hover:bg-emerald-100 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>עמוד SEO מוכן</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => generateSeoPage(video)}
                          disabled={isProcessingThis || isGenerating}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition shadow-sm disabled:opacity-50"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isProcessingThis ? 'animate-spin' : ''}`} />
                          <span>{isProcessingThis ? 'מעבד מאמר...' : 'צור עמוד SEO'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SEO Quality & Insights Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>יתרונות הקידום ב-KosTube</span>
          </h3>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-5 border border-slate-200 dark:border-slate-800 space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">מאמרי עומק מלאים</strong>
                הבינה המלאכותית מחלצת את תוכן הוידאו וכותבת מאמר מקצועי עשיר בכותרות ותוכן איכותי.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">סכמת נתונים JSON-LD של Google</strong>
                הטמעה מלאה של VideoObject, Article ו-FAQPage המעניקה תוצאות עשירות במנועי החיפוש.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">אינטגרציה לטפסי לידים ו-WhatsApp</strong>
                כל עמוד כולל שקע להשארת פרטים ישירות למערכת ה-CRM ושיתוף בלחיצה.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
