import React, { useState, useEffect } from 'react';

export interface KosunPageTransitionAnimationMiniProps {
  className?: string;
  onClick?: () => void;
  title?: string;
}

/**
 * KosunPageTransitionAnimationMini
 * Compact looping replica of the signature KOSUN luxury reveal / page transition animation.
 * Design specs:
 * - Direction RTL:
 *   [אינטראקציה שהיא נכס]  | (divider)  [K SUN (with typed loop)]
 * - Thick vertical separator with logo gradient (indigo -> purple -> cyan)
 * - Clickable to navigate to main domain (kosun.pro)
 */
export const KosunPageTransitionAnimationMini: React.FC<KosunPageTransitionAnimationMiniProps> = ({
  className = '',
  onClick,
  title = 'מעבר לנתיב הראשי kosun.pro',
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
          // Hold full logo + slogan for 2.4s, then loop again
          timer = setTimeout(() => {
            if (!isCancelled) runLoop();
          }, 2400);
        }
      }, 150);
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
      dir="rtl"
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:opacity-95' : ''
      } ${className}`}
    >
      <style>{`
        @keyframes miniKosunGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.45)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.75)); transform: scale(1.04); }
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

      {/* 1. Slogan (Right side in RTL): "אינטראקציה שהיא נכס" */}
      <span
        dir="rtl"
        className={`text-[11px] sm:text-xs font-semibold tracking-wide transition-all duration-500 bg-gradient-to-r from-indigo-300 via-purple-300 to-sky-300 bg-clip-text text-transparent shrink-0 ${
          showSlogan ? 'opacity-100 translate-x-0' : 'opacity-30'
        }`}
      >
        אינטראקציה שהיא נכס
      </span>

      {/* 2. Thick vertical separator with brand logo gradient */}
      <span
        aria-hidden="true"
        className="w-[3px] h-4 sm:h-5 rounded-full bg-gradient-to-b from-[#4f46e5] via-[#8b5cf6] to-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.5)] shrink-0"
      />

      {/* 3. Kosun Brand Lockup (Left side in RTL) */}
      <div className="flex items-center gap-1.5 shrink-0" style={{ direction: 'ltr' }}>
        {/* K Emblem Mark */}
        <div className="mini-kosun-k w-6 h-6 sm:w-7 sm:h-7 shrink-0 flex items-center justify-center">
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

        {/* Typed OSUN wordmark */}
        <div className="flex items-baseline font-black text-sm sm:text-base tracking-wider leading-none text-[#38bdf8]">
          <span style={{ textShadow: '0 0 12px rgba(56, 189, 248, 0.7)' }}>{typedText}</span>
          {typedText.length < 4 && (
            <span className="mini-kosun-cursor text-[#38bdf8] font-light ml-0.5 text-xs sm:text-sm">|</span>
          )}
        </div>
      </div>
    </div>
  );
};
