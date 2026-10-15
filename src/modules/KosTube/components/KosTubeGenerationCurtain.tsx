import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { KosTubeAiMode } from '../../kosai-engine/modelsAiService';

interface KosTubeGenerationCurtainProps {
  isGenerating: boolean;
  mode?: KosTubeAiMode;
  includeBrand?: boolean;
  videoTitle?: string;
  onFinish?: () => void;
}

const GENERATION_FACTS = [
  '🔍 סורק מילות מפתח ומחלץ כוונות חיפוש אותנטיות של גולשים...',
  '💡 מעבד תובנות ומבנה מאמר SEO תמציתי ומדויק (עד 300 מילים) לפי תקן KOSAI...',
  '❓ מנסח בדיוק 5 שאלות ותשובות נפוצות (FAQ) להעשרת תוצאות החיפוש ב-Google ו-AI...',
  '⚡ מחשב ציון איכות SEO והתאמה למנועי חיפוש מבוססי AI (Perplexity, ChatGPT, SGE)...',
  '🛡️ מאמת את חוקי המונופול ומלביש את התוכן ישירות בתוך בונה העמודים KWB...',
  '✨ מעצב נגן וידאו מובנה, תגיות מעודנות ומעטפת שיתוף אורגנית...',
];

export const KosTubeGenerationCurtain: React.FC<KosTubeGenerationCurtainProps> = ({
  isGenerating,
  mode = 'eco',
  includeBrand = true,
  videoTitle,
}) => {
  const [typedText, setTypedText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [isMovedUp, setIsMovedUp] = useState(false);
  const [activeFactIndex, setActiveFactIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Trigger curtain appearance
  useEffect(() => {
    if (isGenerating) {
      setVisible(true);
      setCompleted(false);
      setTypedText('');
      setShowSlogan(false);
      setIsMovedUp(false);
      setActiveFactIndex(0);

      // 1. Typing OSUN
      const textToType = 'OSUN';
      let idx = 0;
      const typeTimer = setTimeout(() => {
        const interval = setInterval(() => {
          if (idx < textToType.length) {
            setTypedText((prev) => prev + textToType.charAt(idx));
            idx++;
          } else {
            clearInterval(interval);
            setShowSlogan(true);
            // 2. Move logo & slogan to top after 700ms
            setTimeout(() => {
              setIsMovedUp(true);
            }, 700);
          }
        }, 120);
      }, 150);

      return () => clearTimeout(typeTimer);
    } else if (visible) {
      // Finished
      setCompleted(true);
      const dismissTimer = setTimeout(() => {
        setVisible(false);
      }, 800);
      return () => clearTimeout(dismissTimer);
    }
  }, [isGenerating]);

  // Dynamic facts cycling every 2.4s while generating
  useEffect(() => {
    if (!isGenerating || !isMovedUp) return;
    const interval = setInterval(() => {
      setActiveFactIndex((prev) => (prev + 1) % GENERATION_FACTS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isGenerating, isMovedUp]);

  if (!visible) return null;

  const modeBadge =
    mode === 'eco'
      ? { label: '⚡ מצב חסכוני (Gemini 3.8 Flash Lite)', desc: 'חיסכון מרבי בעלויות טוקנים' }
      : mode === 'balanced'
      ? { label: '⚖️ מצב מאוזן (Gemini 3.8 Flash)', desc: 'כיסוי מורחב ואיזון אופטימלי' }
      : { label: '🚀 מצב עומק (Gemini 3.8 Pro)', desc: 'ניתוח עומק מקיף וסמכותי' };

  return (
    <div
      dir="rtl"
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center select-none transition-all duration-700 ease-out ${
        completed ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #0b0f19 0%, #000000 85%)',
      }}
    >
      <style>{`
        @keyframes kosunCurtainPulse {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(99, 102, 241, 0.45)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 32px rgba(56, 189, 248, 0.75)); transform: scale(1.03); }
        }
        @keyframes kosunBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .kosun-curtain-k {
          animation: kosunCurtainPulse 2.4s ease-in-out infinite;
        }
        .kosun-curtain-cursor {
          animation: kosunBlink 0.7s infinite;
        }
      `}</style>

      {/* Main Container smoothly moving up */}
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-out ${
          isMovedUp ? '-translate-y-20 sm:-translate-y-24' : 'translate-y-0'
        }`}
      >
        {/* Brand Mark & Typographic Lockup (LTR) */}
        <div className="flex items-center gap-3.5 direction-ltr" style={{ direction: 'ltr' }}>
          {/* K SVG Mark */}
          <div className="kosun-curtain-k w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
              <defs>
                <linearGradient id="curtainBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="curtainAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="curtainSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0e7ff" />
                </linearGradient>
                <filter id="curtainGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#4f46e5" floodOpacity="0.5" />
                </filter>
              </defs>
              <rect x="10" y="10" width="100" height="100" rx="28" fill="url(#curtainBgGrad)" filter="url(#curtainGlow)" />
              <rect x="11" y="11" width="98" height="98" rx="27" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <rect x="34" y="30" width="13" height="60" rx="6.5" fill="url(#curtainSparkleGrad)" />
              <path d="M47 56 L69 34 C71.5 31.5 76 33.2 76 36.8 L76 43 C76 44.8 75.2 46.5 73.8 47.7 L57 63 Z" fill="url(#curtainSparkleGrad)" opacity="0.95" />
              <path d="M52 57 L77 82 C78.5 83.5 77.8 86 75.7 86 L67 86 C65 86 63.2 85.1 61.9 83.7 L45 66 Z" fill="url(#curtainAccentGrad)" />
              <path d="M85 24 Q85 32 93 32 Q85 32 85 40 Q85 32 77 32 Q85 32 85 24 Z" fill="#ffffff" opacity="0.9" />
            </svg>
          </div>

          {/* Typed OSUN Wordmark */}
          <div className="flex items-baseline font-black text-3xl sm:text-5xl tracking-widest leading-none text-sky-400">
            <span style={{ textShadow: '0 0 24px rgba(56, 189, 248, 0.6)' }}>{typedText}</span>
            {typedText.length < 4 && (
              <span className="kosun-curtain-cursor text-sky-300 font-light ml-0.5">|</span>
            )}
          </div>
        </div>

        {/* Slogan */}
        <div
          className={`mt-3.5 text-base sm:text-lg font-bold tracking-wider transition-all duration-700 ease-out ${
            showSlogan ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
          style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #a855f7 60%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          אינטראקציה שהיא נכס
        </div>
      </div>

      {/* Dynamic Cycling Facts & Progress Details - Appear under slogan when moved up */}
      <div
        className={`mt-4 sm:mt-6 w-full max-w-lg px-6 flex flex-col items-center text-center transition-all duration-700 delay-100 ${
          isMovedUp ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        {/* Mode & Cost Efficiency Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner mb-4">
          <span className="text-xs font-semibold text-sky-400">{modeBadge.label}</span>
          <span className="text-[11px] text-slate-400 border-r border-slate-700 pr-2">
            {modeBadge.desc}
          </span>
        </div>

        {/* Dynamic Step / Fact Container */}
        <div className="min-h-[58px] flex items-center justify-center">
          <p
            key={activeFactIndex}
            className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed animate-fade-in transition-all duration-500"
          >
            {GENERATION_FACTS[activeFactIndex]}
          </p>
        </div>

        {/* Subtle Video Title reference */}
        {videoTitle && (
          <p className="text-xs text-slate-500 truncate max-w-sm mt-1">
            עבור: {videoTitle}
          </p>
        )}

        {/* Progress Bar */}
        <div className="w-64 sm:w-80 h-1.5 rounded-full bg-slate-800/80 overflow-hidden mt-5 border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 rounded-full animate-pulse w-full" />
        </div>

        {/* Completed State */}
        {completed && (
          <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>העמוד הופק בהצלחה! פותח תצוגה מקדימה...</span>
          </div>
        )}
      </div>
    </div>
  );
};
