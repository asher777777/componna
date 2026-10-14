import React from 'react';
import {
  Video,
  UploadCloud,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useTikTok } from '../context/TikTokContext';

export const KosTikTokVideosTab: React.FC = () => {
  const { videos, activeAccount, refreshVideos, isLoading, setIsModalOpen, setModalMode } = useTikTok();

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">סרטוני ערוץ TikTok</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ניהול, צפייה ופרסום סרטונים ישירות לחשבון {activeAccount?.username || ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshVideos()}
            disabled={isLoading || !activeAccount}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            רענן סרטונים
          </button>
          <button
            onClick={() => {
              setModalMode('publish-video');
              setIsModalOpen(true);
            }}
            disabled={!activeAccount}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            פרסם סרטון ל-TikTok
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">אין עדיין סרטונים מסונכרנים</h3>
            <p className="text-xs text-slate-500">לחצו על רענן סרטונים או פרסמו את הסרטון הראשון שלכם לטיקטוק.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              {/* Cover Image & Duration */}
              <div className="relative aspect-[9/16] max-h-72 w-full bg-slate-950 overflow-hidden">
                <img
                  src={vid.coverImageUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                
                <span className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono text-white">
                  0:{vid.duration < 10 ? `0${vid.duration}` : vid.duration}
                </span>

                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-pink-600/90 backdrop-blur-md text-[10px] font-bold text-white">
                  {vid.privacyLevel === 'SELF_ONLY' ? 'פרטי' : 'ציבורי'}
                </span>

                {vid.shareUrl && (
                  <a
                    href={vid.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 left-3 p-2 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-white transition-colors"
                    title="פתח ב-TikTok"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Title & Metrics */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {vid.title}
                </h4>

                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{(vid.viewCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>{(vid.likeCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                    <span>{(vid.commentCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{(vid.shareCount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
