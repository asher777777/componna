import React, { useState } from 'react';
import { Sparkles, Zap, Shield, FileText, Youtube, Check } from 'lucide-react';
import { KosTubeFullscreenModal } from './KosTubeFullscreenModal';
import { useKosTube } from '../context/KosTubeContext';
import { KosTubeAiMode } from '../../kosai-engine/modelsAiService';

export const KosTubeGenerationModal: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedVideo,
    generateSeoPage,
    isGenerating,
  } = useKosTube();

  const [mode, setMode] = useState<KosTubeAiMode>('eco');
  const [includeBrand, setIncludeBrand] = useState<boolean>(true);
  const [sourceType, setSourceType] = useState<'youtube' | 'custom_text'>('youtube');
  const [customText, setCustomText] = useState<string>('');

  if (!isModalOpen || modalMode !== 'generate_options' || !selectedVideo) {
    return null;
  }

  const handleStartGeneration = async () => {
    setIsModalOpen(false);
    await generateSeoPage(selectedVideo, {
      mode,
      includeBrand,
      customText: sourceType === 'custom_text' ? customText : undefined,
    });
  };

  return (
    <KosTubeFullscreenModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="הגדרות הפקת עמוד SEO ב-AI"
      subtitle="בחר את מצב העלות, שילוב המיתוג ומקור התוכן לעמוד ה-Kosvidio שלך"
    >
      <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-7" dir="rtl">
        {/* Selected Video Preview Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <img
            src={selectedVideo.thumbnailUrl}
            alt={selectedVideo.title}
            className="w-24 aspect-video rounded-xl object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">סרטון נבחר</span>
            <h4 className="text-sm font-bold text-white truncate mt-0.5">{selectedVideo.title}</h4>
            <p className="text-xs text-slate-400 truncate mt-1">מזהה: {selectedVideo.youtubeVideoId}</p>
          </div>
        </div>

        {/* 1. Mode Selector (Eco / Balanced / Deep) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>מצב הפקה וצמצום עלויות טוקנים</span>
            </label>
            <span className="text-xs text-slate-400">ברירת מחדל חסכונית</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Eco Mode (Default) */}
            <button
              type="button"
              onClick={() => setMode('eco')}
              className={`p-4 rounded-2xl border text-right transition cursor-pointer relative ${
                mode === 'eco'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  מומלץ וחסכוני
                </span>
                {mode === 'eco' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <h5 className="text-sm font-bold text-white">⚡ חסכוני (Lite)</h5>
              <p className="text-xs text-slate-400 mt-1">
                Gemini 3.8 Flash Lite. עד 300 מילים. עלות אפסית (~$0.002).
              </p>
            </button>

            {/* Balanced Mode */}
            <button
              type="button"
              onClick={() => setMode('balanced')}
              className={`p-4 rounded-2xl border text-right transition cursor-pointer relative ${
                mode === 'balanced'
                  ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400">
                  סטנדרטי
                </span>
                {mode === 'balanced' && <Check className="w-4 h-4 text-sky-400" />}
              </div>
              <h5 className="text-sm font-bold text-white">⚖️ בינוני (Flash)</h5>
              <p className="text-xs text-slate-400 mt-1">
                Gemini 3.8 Flash. מאמר מאוזן של כ-450 מילים ועושר תוכן.
              </p>
            </button>

            {/* Deep Mode */}
            <button
              type="button"
              onClick={() => setMode('deep')}
              className={`p-4 rounded-2xl border text-right transition cursor-pointer relative ${
                mode === 'deep'
                  ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">
                  מחקר מעמיק
                </span>
                {mode === 'deep' && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <h5 className="text-sm font-bold text-white">🚀 עומק (Pro)</h5>
              <p className="text-xs text-slate-400 mt-1">
                Gemini 3.8 Pro. ניתוח עומק מקיף ומדעי של 700+ מילים.
              </p>

            </button>
          </div>
        </div>

        {/* 2. Tenant Brand Connection Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBrand}
              onChange={(e) => setIncludeBrand(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-red-600 focus:ring-red-500/30"
            />
            <div className="flex-1">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                <span>חבר מיתוג טננט מלא (ברירת מחדל של KOSUN26)</span>
              </span>
              <p className="text-xs text-slate-400 mt-1">
                {includeBrand
                  ? 'העמוד ייכתב בקול המותג, יחבר את שירותי העסק וה-CTA שלו, תוך מתן קרדיט מכבד ליוצר הוידאו.'
                  : 'העמוד ייכתב כמאמר ניטרלי המתמקד ביוצר ובתוכן הוידאו ללא אזכור שירותי המותג של הטננט.'}
              </p>
            </div>
          </label>
        </div>

        {/* 3. Source Selection: Scan YouTube vs Direct Paste */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>מקור התוכן לניתוח ה-AI</span>
          </label>

          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setSourceType('youtube')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                sourceType === 'youtube'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>סריקת כותרת ותיאור הוידאו</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType('custom_text')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                sourceType === 'custom_text'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>הדבקת תמלול / תוכן טקסט ישיר</span>
            </button>
          </div>

          {sourceType === 'custom_text' && (
            <div className="space-y-1.5 animate-fade-in">
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="הדבק כאן תמלול של הסרטון, נקודות מפתח או טקסט תוכן חלופי..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
              <p className="text-[11px] text-slate-500">
                ה-AI ינתח את הטקסט המודבק במקום לסרוק את יוטיוב, ויבנה לפיו את עמוד ה-Kosvidio.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={isGenerating || (sourceType === 'custom_text' && !customText.trim())}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>הפק עמוד Kosvidio עכשיו ב-AI</span>
          </button>
        </div>
      </div>
    </KosTubeFullscreenModal>
  );
};
