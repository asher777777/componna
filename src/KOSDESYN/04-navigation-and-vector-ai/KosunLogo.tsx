import React, { useState } from 'react';

interface KosunLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'image';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Custom 40-degree geometric "K" capsule emblem
 * Designed specifically for KOSUN swipe handles, toggles, and brand badges.
 */
export const KosunKHandle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Vertical capsule spine */}
      <rect x="8" y="6" width="9" height="36" rx="4.5" fill="#F0F4FF" />
      {/* Upper diagonal arm (40-degree slash) */}
      <rect
        x="15"
        y="12"
        width="8"
        height="22"
        rx="4"
        transform="rotate(-40 15 12)"
        fill="#00F0FF"
      />
      {/* Lower diagonal leg */}
      <rect
        x="20"
        y="22"
        width="8"
        height="24"
        rx="4"
        transform="rotate(40 20 22)"
        fill="#00F0FF"
      />
    </svg>
  );
};

/**
 * Vector KOSUN Icon:
 * Interlocking double-bubble (connection nodes) + 3D isometric asset diamond/cube in center.
 */
export const KosunVectorIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 44,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#00A3FF" />
        </linearGradient>
        <linearGradient id="whiteGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00F0FF" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Primary chat bubble / node envelope */}
      <path
        d="M60 10C35 10 15 28 15 52C15 64 21 75 30 82L24 102L48 94C52 95 56 96 60 96C85 96 105 78 105 52C105 28 85 10 60 10Z"
        fill="rgba(13, 22, 45, 0.75)"
        stroke="url(#cyanGrad)"
        strokeWidth="3.5"
        filter="url(#glow)"
      />

      {/* 40-degree rounded diagonal capsule segments */}
      <rect
        x="32"
        y="42"
        width="11"
        height="38"
        rx="5.5"
        transform="rotate(-40 32 42)"
        fill="url(#whiteGlow)"
      />
      <rect
        x="66"
        y="26"
        width="11"
        height="40"
        rx="5.5"
        transform="rotate(40 66 26)"
        fill="url(#cyanGrad)"
      />
      <rect
        x="48"
        y="64"
        width="11"
        height="32"
        rx="5.5"
        transform="rotate(40 48 64)"
        fill="url(#cyanGrad)"
      />

      {/* Isometric 3D Asset Cube in the center */}
      <g transform="translate(60, 52)">
        {/* Top face */}
        <polygon points="0,-12 11,-6 0,0 -11,-6" fill="#F0F4FF" />
        {/* Left face */}
        <polygon points="-11,-6 0,0 0,13 -11,7" fill="#8AA8CF" />
        {/* Right face */}
        <polygon points="0,0 11,-6 11,7 0,13" fill="#00F0FF" />
      </g>
    </svg>
  );
};

/**
 * Flagship KOSUN Wordmark & Brand Visual
 * Uses the user's authentic image asset with fallback.
 */
export const KosunLogo: React.FC<KosunLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-13',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-28',
  }[size];

  if (variant === 'mark') {
    return <KosunVectorIcon size={size === 'sm' ? 32 : size === 'lg' ? 56 : 42} className={className} />;
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {!imageError ? (
        <img
          src="/assets/aistudio/1792872624676_73b85ec5.jpg"
          alt="KOSUN - Interactions Into Assets"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className={`${heightClasses} w-auto object-contain drop-shadow-[0_0_20px_rgba(0,240,255,0.4)] select-none pointer-events-none`}
        />
      ) : (
        /* Vector fallback matching the exact brand wordmark geometry */
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <KosunVectorIcon size={46} />
            <div className="flex items-center font-black tracking-tight text-white font-['Orbitron',sans-serif]">
              <span className="text-3xl text-[#F0F4FF]">K</span>
              <span className="text-3xl text-[#00F0FF]">O</span>
              <span className="text-3xl text-[#F0F4FF]">S</span>
              <span className="text-3xl text-[#00F0FF]">U</span>
              <span className="text-3xl text-[#F0F4FF]">N</span>
            </div>
          </div>
          <span className="text-[10px] tracking-[0.35em] text-[#00F0FF] font-['Montserrat',sans-serif] uppercase font-semibold mt-1">
            INTERACTIONS INTO ASSETS
          </span>
        </div>
      )}
    </div>
  );
};
