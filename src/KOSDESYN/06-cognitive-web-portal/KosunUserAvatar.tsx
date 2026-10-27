import React from 'react';

export interface KosunUserAvatarProps {
  color?: string;
  size?: number | string;
  glowColor?: string;
  className?: string;
  showGlow?: boolean;
  pulse?: boolean;
  onClick?: () => void;
  title?: string;
}

/**
 * 🤖 KosunUserAvatar
 * מציג את אייקון ה-3D הרשמי של KOSUN (kosun-user.webp)
 * צבוע ומותאם דינמית לפי צבע המיתוג והסגנון (brandPrimary / theme color)
 * באמצעות שכבת מיסוך חכמה (CSS mask + mix-blend-mode: color/hue)
 * המשמרת את כל הצללות התלת-ממד, ההשתקפויות והעומק של האייקון המקורי.
 */
export const KosunUserAvatar: React.FC<KosunUserAvatarProps> = ({
  color = '#00F0FF',
  size = 28,
  glowColor,
  className = '',
  showGlow = true,
  pulse = false,
  onClick,
  title
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  const effectiveGlow = glowColor || `${color}55`;

  return (
    <div
      onClick={onClick}
      title={title}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      } ${pulse ? 'animate-pulse' : ''} ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize
      }}
    >
      {/* הילת עומק זוהרת מאחורי האייקון */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-[6px] opacity-60 pointer-events-none transition-all duration-300"
          style={{ backgroundColor: color }}
        />
      )}

      {/* תמונת ה-3D המקורית באיכות גבוהה */}
      <img
        src="/mediaassets/kosun-user.webp"
        alt="KOSUN AI User Avatar"
        className="relative z-10 w-full h-full object-contain pointer-events-none"
        style={{
          filter: showGlow ? `drop-shadow(0 2px 6px ${effectiveGlow})` : undefined
        }}
        loading="eager"
      />

      {/* שכבת צביעה דינמית חכמה (Tint Overlay) החלה אך ורק על הפיקסלים של האייקון */}
      <div
        className="absolute inset-0 z-20 pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: color,
          mixBlendMode: 'color',
          WebkitMaskImage: 'url(/mediaassets/kosun-user.webp)',
          maskImage: 'url(/mediaassets/kosun-user.webp)',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          opacity: 0.88
        }}
      />

      {/* שכבת הדגשה שנייה לחידוד הגוון (Hue Adjustment) */}
      <div
        className="absolute inset-0 z-30 pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: color,
          mixBlendMode: 'hue',
          WebkitMaskImage: 'url(/mediaassets/kosun-user.webp)',
          maskImage: 'url(/mediaassets/kosun-user.webp)',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          opacity: 0.6
        }}
      />
    </div>
  );
};
