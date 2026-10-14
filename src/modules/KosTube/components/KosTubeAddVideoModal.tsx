import React, { useState } from 'react';
import { Youtube, Plus, AlertCircle, RefreshCw, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { KosTubeFullscreenModal } from './KosTubeFullscreenModal';
import { useKosTube } from '../context/KosTubeContext';

export const KosTubeAddVideoModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, modalMode, addVideoByUrl, error, clearError } = useKosTube();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isModalOpen || modalMode !== 'add_video') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setLoading(true);
    clearError();
    try {
      const added = await addVideoByUrl(videoUrl.trim());
      if (added) {
        setVideoUrl('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KosTubeFullscreenModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="הוספת סרטון יוטיוב ישירות (בקישור)"
      subtitle="הזן קישור ישיר לכל סרטון יוטיוב אמיתי כדי למשוך את פרטיו ולהפיק עבורו עמוד SEO מקודם"
    >
      <div className="max-w-xl mx-auto p-4 sm:p-8 space-y-6" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-600 mx-auto flex items-center justify-center border border-red-500/20">
            <Youtube className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">הוספת סרטון אמיתי מיוטיוב</h3>
          <p className="text-xs text-slate-400">
            אין צורך במפתח API מיוחד להוספת סרטונים בודדים! המערכת תמשוך ישירות את הכותרת, התמונה והפרטים המקוריים של הסרטון.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              קישור לסרטון יוטיוב (YouTube URL)
            </label>
            <div className="relative">
              <LinkIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=... או https://youtu.be/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
                className="w-full pr-11 pl-4 py-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              הדבק את כתובת ה-URL של הסרטון משורת הכתובות בדפדפן או מכפתור ה-"שיתוף" ביוטיוב.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !videoUrl.trim()}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg hover:shadow-red-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>שולף נתוני סרטון אמיתיים...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>משוך סרטון והוסף למערכת</span>
              </>
            )}
          </button>
        </form>
      </div>
    </KosTubeFullscreenModal>
  );
};
