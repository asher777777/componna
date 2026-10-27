import React, { useState, useEffect } from 'react';

export interface KosunPageTransitionAnimationMiniProps {
  className?: string;
  onClick?: () => void;
  title?: string;
}

/**
 * KosunPageTransitionAnimationMini
 * Signature KOSUN luxury brand reveal emblem & lockup.
 * Features:
 * - Glowing pulsing 'K' emblem with sparkle
 * - Full, crystal-clear "KOSUN" wordmark in bright cyan (#38bdf8 / #00F0FF) that is ALWAYS visible and readable
 * - High-end subtle typing shine effect on the wordmark so it never disappears or appears truncated as "SUN"
 * - Slogan: "אינטראקציה שהיא נכס"
 * - Thick vertical separator with logo gradient
 */
export const KosunPageTransitionAnimationMini: React.FC<KosunPageTransitionAnimationMiniProps> = ({
  className = '',
  onClick,
  title = 'KOSUN • אינטראקציה שהיא נכס',
}) => {
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlowing((prev) => !prev);
    }, 2800);
    return () => clearInterval(interval);
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
      className={`inline-flex items-center gap-2 sm:gap-2.5 select-none group transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:opacity-95' : ''
      } ${className}`}
    >
      <style>{`
        @keyframes miniKosunGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.5)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.8)); transform: scale(1.05); }
        }
        @keyframes miniKosunShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .mini-kosun-k {
          animation: miniKosunGlow 2.4s ease-in-out infinite;
        }
        .mini-kosun-text-shimmer {
          background: linear-gradient(90deg, #38bdf8 0%, #ffffff 50%, #38bdf8 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: miniKosunShimmer 3.5s linear infinite;
        }
      `}</style>

      {/* 1. Slogan (Right side in RTL): "אינטראקציה שהיא נכס" */}
      <span
        dir="rtl"
        className="text-[10.5px] sm:text-[11.5px] font-semibold tracking-wide bg-gradient-to-r from-indigo-300 via-purple-300 to-sky-300 bg-clip-text text-transparent shrink-0"
      >
        אינטראקציה שהיא נכס
      </span>

      {/* 2. Thick vertical separator with brand logo gradient */}
      <span
        aria-hidden="true"
        className="w-[2.5px] h-3.5 sm:h-4.5 rounded-full bg-gradient-to-b from-[#4f46e5] via-[#8b5cf6] to-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.6)] shrink-0"
      />

      {/* 3. Kosun Brand Lockup (Left side in RTL) - Forced LTR */}
      <div className="flex items-center gap-1.5 shrink-0" style={{ direction: 'ltr' }}>
        {/* K Emblem Mark */}
        <div className="mini-kosun-k w-5 h-5 sm:w-6 sm:h-6 shrink-0 flex items-center justify-center">
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

        {/* Wordmark KOSUN - Fully and continuously visible with signature shimmer */}
        <div className="flex items-baseline font-black text-sm sm:text-base tracking-wider leading-none font-mono">
          <span 
            className="mini-kosun-text-shimmer"
            style={{ textShadow: '0 0 14px rgba(56, 189, 248, 0.7)' }}
          >
            KOSUN
          </span>
        </div>
      </div>
    </div>
  );
};
