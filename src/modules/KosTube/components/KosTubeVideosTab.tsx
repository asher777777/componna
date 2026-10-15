import React, { useState } from 'react';
import { 
  Youtube, 
  Sparkles, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ThumbsUp, 
  Globe, 
  RefreshCw,
  Plus 
} from 'lucide-react';
import { useKosTube } from '../context/KosTubeContext';
import { useKosTubeData } from '../hooks/useKosTubeData';
import { KosTubeVideo } from '../types';

export const KosTubeVideosTab: React.FC = () => {
  const { 
    generateSeoPage, 
    openGenerationModal,
    batchGenerateSeoPages, 
    isGenerating, 
    generatingVideoId, 
    setSelectedVideo, 
    setSelectedPage, 
    seoPages, 
    setIsModalOpen, 
    setModalMode 
  } = useKosTube();

  const { videos, filter, setFilter, stats } = useKosTubeData();

  const handleOpenPagePreview = (video: KosTubeVideo) => {
    const page = seoPages.find((p) => p.id === video.seoPageId || p.videoId === video.id);
    if (page) {
      setSelectedPage(page);
      setModalMode('page_preview');
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="חפש לפי כותרת או מילות מפתח..."
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pr-10 pl-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
          </div>

          <select
            value={filter.status || 'all'}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
            className="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="pending">ממתינים לעיבוד</option>
            <option value="processed">עמוד SEO מוכן</option>
          </select>

          <select
            value={filter.sortBy || 'date_desc'}
            onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
            className="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <option value="date_desc">חדשים ביותר</option>
            <option value="date_asc">ישנים ביותר</option>
            <option value="views_desc">הכי נצפים</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setModalMode('add_video');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-red-500" />
            <span>הוסף סרטון בקישור</span>
          </button>

          <button
            type="button"
            onClick={() => batchGenerateSeoPages()}
            disabled={isGenerating || stats.pendingVideos === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium shadow-md text-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>עבד {stats.pendingVideos} סרטונים ממתינים</span>
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <Youtube className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">לא נמצאו סרטונים</h4>
          <p className="text-xs text-slate-500 mt-1">נסה לשנות את מילות החיפוש או סנכרן את הערוץ מחדש</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const hasPage = Boolean(video.seoPageId);
            const isProcessingThis = isGenerating && generatingVideoId === video.id;

            return (
              <div
                key={video.id}
                className="group flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-red-500/30 transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {video.duration && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono">
                      {video.duration}
                    </span>
                  )}

                  <span
                    className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm ${
                      hasPage
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-black/60 text-slate-200'
                    }`}
                  >
                    {hasPage ? 'עמוד SEO מוכן' : 'ממתין לעיבוד'}
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {video.description || 'ללא תיאור מקורי'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      {video.viewCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{video.viewCount.toLocaleString()}</span>
                        </span>
                      )}
                      <span>{new Date(video.publishedAt).toLocaleDateString('he-IL')}</span>
                    </div>

                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-red-500 transition"
                      title="פתח ביוטיוב"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    {hasPage ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPagePreview(video)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold hover:bg-emerald-100 transition"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>צפה בעמוד ה-SEO</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openGenerationModal(video)}
                          disabled={isProcessingThis || isGenerating}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="ייצר מחדש בעזרת AI"
                        >
                          <RefreshCw className={`w-4 h-4 ${isProcessingThis ? 'animate-spin text-red-500' : ''}`} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openGenerationModal(video)}
                        disabled={isProcessingThis || isGenerating}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isProcessingThis ? 'animate-spin' : ''}`} />
                        <span>{isProcessingThis ? 'מפיק מאמר SEO ב-AI...' : 'צור עמוד SEO עכשיו'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
