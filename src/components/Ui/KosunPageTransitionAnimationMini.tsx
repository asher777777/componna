import React, { useState, useEffect } from 'react';

export interface KosunPageTransitionAnimationMiniProps {
  className?: string;
  onClick?: () => void;
  title?: string;
}

/**
 * KosunPageTransitionAnimationMini
 * Compact looping replica of the signature KOSUN luxury reveal / page transition animation.
 * Features:
 * - Glowing pulsing 'K' vector emblem with sparkle
 * - Typing loop of "OSUN" in light cyan with blinking cursor
 * - Slogan fade "אינטראקציה שהיא נכס"
 * - Compact height suitable for footer strips / dock widgets
 */
export const KosunPageTransitionAnimationMini: React.FC<KosunPageTransitionAnimationMiniProps> = ({
  className = '',
  onClick,
  title = 'מעבר לעמוד הראשי של Kosun',
}) => {
  const [typedText, setTypedText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let timer: NodeJS.Timeout;
    const textToType = 'OSUN';

    const runLoop = () => {
      if (isCancelled) return;
      setTypedText('');
      setShowSlogan(false);

      let idx = 0;
      const typeInterval = setInterval(() => {
        if (isCancelled) {
          clearInterval(typeInterval);
          return;
        }
        if (idx < textToType.length) {
          setTypedText((prev) => prev + textToType.charAt(idx));
          idx++;
        } else {
          clearInterval(typeInterval);
          setShowSlogan(true);
          // Hold full logo + slogan for 2.2s, then loop again
          timer = setTimeout(() => {
            if (!isCancelled) runLoop();
          }, 2200);
        }
      }, 160);
    };

    runLoop();

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title={title}
      aria-label={title}
      className={`inline-flex items-center gap-2 select-none group transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:opacity-95' : ''
      } ${className}`}
    >
      <style>{`
        @keyframes miniKosunGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.4)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.7)); transform: scale(1.04); }
        }
        @keyframes miniKosunBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .mini-kosun-k {
          animation: miniKosunGlow 2.4s ease-in-out infinite;
        }
        .mini-kosun-cursor {
          animation: miniKosunBlink 0.7s infinite;
        }
      `}</style>

      {/* Brand Typographic Lockup (LTR) */}
      <div className="flex items-center gap-1.5" style={{ direction: 'ltr' }}>
        {/* K Emblem Mark */}
        <div className="mini-kosun-k w-6 h-6 shrink-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
            <defs>
              <linearGradient id="miniKGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="miniAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="miniSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0e7ff" />
              </linearGradient>
            </defs>
            <rect x="10" y="10" width="100" height="100" rx="28" fill="url(#miniKGrad)" />
            <rect x="11" y="11" width="98" height="98" rx="27" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <rect x="34" y="30" width="13" height="60" rx="6.5" fill="url(#miniSparkleGrad)" />
            <path d="M47 56 L69 34 C71.5 31.5 76 33.2 76 36.8 L76 43 C76 44.8 75.2 46.5 73.8 47.7 L57 63 Z" fill="url(#miniSparkleGrad)" opacity="0.95" />
            <path d="M52 57 L77 82 C78.5 83.5 77.8 86 75.7 86 L67 86 C65 86 63.2 85.1 61.9 83.7 L45 66 Z" fill="url(#miniAccentGrad)" />
            <path d="M85 24 Q85 32 93 32 Q85 32 85 40 Q85 32 77 32 Q85 32 85 24 Z" fill="#ffffff" opacity="0.95" />
          </svg>
        </div>

        {/* Typed OSUN */}
        <div className="flex items-baseline font-black text-xs sm:text-sm tracking-wider leading-none text-[#38bdf8]">
          <span style={{ textShadow: '0 0 10px rgba(56, 189, 248, 0.65)' }}>{typedText}</span>
          {typedText.length < 4 && (
            <span className="mini-kosun-cursor text-[#38bdf8] font-light ml-0.5 text-[11px]">|</span>
          )}
        </div>
      </div>

      {/* Slogan */}
      <span
        dir="rtl"
        className={`hidden md:inline-block text-[10px] font-medium tracking-wide transition-all duration-500 bg-gradient-to-r from-indigo-300 via-purple-300 to-sky-300 bg-clip-text text-transparent ${
          showSlogan ? 'opacity-90 translate-x-0' : 'opacity-0 translate-x-1'
        }`}
      >
        אינטראקציה שהיא נכס
      </span>
    </div>
  );
};
