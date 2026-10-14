import React, { useState } from 'react';
import { UploadCloud, Video, Lock, Globe, MessageSquare, Sliders } from 'lucide-react';
import { KosTikTokFullscreenModal } from './KosTikTokFullscreenModal';
import { useTikTok } from '../context/TikTokContext';
import { KosTikTokPublishParams } from '../types';

export const KosTikTokPublishModal: React.FC = () => {
  const { isModalOpen, modalMode, setIsModalOpen, publishVideo, isPublishing, activeAccount } = useTikTok();

  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'>('PUBLIC_TO_EVERYONE');
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);

  if (!isModalOpen || modalMode !== 'publish-video') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl || !title) return;

    const params: KosTikTokPublishParams = {
      videoUrl: videoUrl.trim(),
      title: title.trim(),
      privacyLevel,
      disableComment,
      disableDuet,
      disableStitch,
    };

    await publishVideo(params);
  };

  return (
    <KosTikTokFullscreenModal
      isOpen={isModalOpen && modalMode === 'publish-video'}
      onClose={() => setIsModalOpen(false)}
      title="פרסום סרטון חדש ל-TikTok"
      subtitle={`מפרסם לחשבון: ${activeAccount?.displayName || 'יוצר'} (${activeAccount?.username || ''})`}
      icon={<UploadCloud className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        {/* Video URL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-slate-400" />
            קישור לקובץ הווידאו (MP4 / H.264)
          </label>
          <input
            type="url"
            required
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://storage.googleapis.com/.../video.mp4"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>

        {/* Video Title / Caption */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              כותרת הסרטון ותיאור (כולל האשטאגים)
            </label>
            <span className="text-[11px] text-slate-400">{title.length}/2200</span>
          </div>
          <textarea
            required
            rows={4}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כתוב תיאור מושך לסרטון הטיקטוק שלך... #fyp #marketing"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none"
          />
        </div>

        {/* Privacy Setting */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            רמת פרטיות לפרסום
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPrivacyLevel('PUBLIC_TO_EVERYONE')}
              className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3 ${
                privacyLevel === 'PUBLIC_TO_EVERYONE'
                  ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 font-bold'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">ציבורי לכולם</div>
                <div className="text-[11px] text-slate-500 font-normal">גלוי לכל משתמשי טיקטוק</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPrivacyLevel('MUTUAL_FOLLOW_FRIENDS')}
              className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3 ${
                privacyLevel === 'MUTUAL_FOLLOW_FRIENDS'
                  ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 font-bold'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">חברים בלבד</div>
                <div className="text-[11px] text-slate-500 font-normal">רק עוקבים הדדיים</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPrivacyLevel('SELF_ONLY')}
              className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3 ${
                privacyLevel === 'SELF_ONLY'
                  ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 font-bold'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">פרטי בלבד</div>
                <div className="text-[11px] text-slate-500 font-normal">גלוי אך ורק ליוצר</div>
              </div>
            </button>
          </div>
        </div>

        {/* Interaction toggles */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white">הגדרות אינטראקציה של הקהל</div>
          
          <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>חסום תגובות לסרטון זה</span>
            <input
              type="checkbox"
              checked={disableComment}
              onChange={(e) => setDisableComment(e.target.checked)}
              className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>חסום דואטים (Duet)</span>
            <input
              type="checkbox"
              checked={disableDuet}
              onChange={(e) => setDisableDuet(e.target.checked)}
              className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>חסום סטיץ' (Stitch)</span>
            <input
              type="checkbox"
              checked={disableStitch}
              onChange={(e) => setDisableStitch(e.target.checked)}
              className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
            />
          </label>
        </div>

        {/* Submit Buttons */}
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
            disabled={isPublishing || !videoUrl || !title}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isPublishing ? 'שולח ומפרסם ב-TikTok...' : 'פרסם סרטון ל-TikTok'}
          </button>
        </div>
      </form>
    </KosTikTokFullscreenModal>
  );
};
