import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowLeft, Film, Clock, Users, Target, Volume2 } from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';

export const BrainstormWizardView: React.FC = () => {
  const { createProjectFromWizard, isGeneratingScript } = useVideoStudio();

  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('בעלי עסקים ויזמים');
  const [marketingHook, setMarketingHook] = useState('להגדיל את המכירות ב-30% בעזרת סרטוני וידאו מותאמים אישית');
  const [sceneCount, setSceneCount] = useState<number>(4);
  const [tone, setTone] = useState<'professional' | 'energetic' | 'conversational' | 'dramatic'>('energetic');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg('נא להזין נושא או רעיון לסרטון.');
      return;
    }
    setErrorMsg(null);
    try {
      await createProjectFromWizard({
        topic,
        targetAudience,
        marketingHook,
        sceneCount,
        tone,
        aspectRatio
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'שגיאה ביצירת התסריט');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/60 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Gemini AI Video Storyboard Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              אשף יצירת תסריט והפקת וידאו חכמה
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              הזן את הרעיון או המוצר שלך, והבינה המלאכותית תיצור עבורך סטוריבורד מפורט עם סצנות, טקסט קריינות לאווטאר, ופרומפטים לוידאו.
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10">
            <Film className="w-8 h-8" />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Wizard Form */}
      <form onSubmit={handleGenerate} className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            💡 על מה הסרטון? (נושא, מוצר, שירות או רעיון שיווקי) *
          </label>
          <textarea
            rows={3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="למשל: השקת מוצר חדש לניהול משימות שחוסך 5 שעות עבודה בשבוע..."
            className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none transition"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>קהל יעד</span>
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="בעלי עסקים, סטודנטים, הורים..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>מטרת הסרטון / הוק שיווקי</span>
            </label>
            <input
              type="text"
              value={marketingHook}
              onChange={(e) => setMarketingHook(e.target.value)}
              placeholder="להניע להרשמה לוובינר בחינם..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>מספר סצנות</span>
            </label>
            <select
              value={sceneCount}
              onChange={(e) => setSceneCount(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500"
            >
              <option value={3}>3 סצנות (סרטון קצר - כ-15 שניות)</option>
              <option value={4}>4 סצנות (סרטון סטנדרטי - כ-20 שניות)</option>
              <option value={5}>5 סצנות (סרטון מפורט - כ-30 שניות)</option>
              <option value={6}>6 סצנות (הסבר מעמיק - כ-40 שניות)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>טון הקריינות</span>
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500"
            >
              <option value="energetic">אנרגטי וסוחף (מומלץ לרשתות)</option>
              <option value="professional">עסקי וסמכותי (B2B)</option>
              <option value="conversational">חברי ואישי (Storytelling)</option>
              <option value="dramatic">דרמטי ומעורר רגש</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-pink-400" />
              <span>יחס תצוגה (Aspect Ratio)</span>
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500"
            >
              <option value="16:9">16:9 (לרוחב - YouTube, אתר)</option>
              <option value="9:16">9:16 (לאורך - Reels, TikTok, Shorts)</option>
              <option value="1:1">1:1 (ריבוע - פיד אינסטגרם/פייסבוק)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={isGeneratingScript}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 ${isGeneratingScript ? 'animate-spin' : ''}`} />
            <span>{isGeneratingScript ? 'מייצר סטוריבורד ותסריט עם Gemini...' : 'צור סטוריבורד ותסריט AI עכשיו'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
