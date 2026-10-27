import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface KosunAiAvatarButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  tooltipText?: string;
}

export const KosunAiAvatarButton: React.FC<KosunAiAvatarButtonProps> = ({
  onClick,
  className = '',
  size = 'md',
  showLabel = false,
  tooltipText = 'עוזר AI חכם וחיפוש פעולות',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [clickedOnce, setClickedOnce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
        setClickedOnce(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 2-click cognitive discipline on first interaction if tooltip desired, or direct launch with tooltip feedback
    if (!clickedOnce) {
      sound.playPop();
      setShowTooltip(true);
      setClickedOnce(true);
      // Auto-execute if user clicks or after brief recognition, or allow immediate second click
      onClick();
      setTimeout(() => setShowTooltip(false), 2400);
    } else {
      sound.playTaskComplete();
      setShowTooltip(false);
      setClickedOnce(false);
      onClick();
    }
  };

  const dimensionClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  }[size];

  const imageDimensionClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Floating Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#0D0E1F]/95 text-[#F0F4FF] border border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.4)] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF] animate-pulse" />
            <span>{tooltipText}</span>
          </div>
        </div>
      )}

      {/* Button with Avatar */}
      <button
        onClick={handleClick}
        title={tooltipText}
        className={`group relative ${dimensionClasses} rounded-2xl flex items-center justify-center p-1 transition-all duration-300 cursor-pointer active:scale-95 bg-gradient-to-br from-[#12162B] to-[#1A2B4C] border border-[#00F0FF]/60 hover:border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_28px_rgba(0,240,255,0.6)]`}
      >
        {/* Subtle Ambient Pulse behind head */}
        <div className="absolute inset-0 rounded-2xl bg-[#00F0FF]/20 blur-sm group-hover:bg-[#00F0FF]/35 transition-colors" />

        {/* User's custom AI Avatar with Animated Head Motion */}
        <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
          <img
            src="/kosun-user.webp"
            alt="KOSUN AI Assistant"
            className={`${imageDimensionClasses} object-contain animate-kosun-head select-none pointer-events-none`}
            onError={(e) => {
              // Graceful fallback to sparkles icon if webp fails to render
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
              if (fallback) (fallback as HTMLElement).style.display = 'flex';
            }}
          />
          <div className="avatar-fallback hidden w-full h-full items-center justify-center text-[#00F0FF]">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Mini Active Online Indicator */}
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00F0FF] border-2 border-[#070913] shadow-[0_0_8px_#00F0FF]" />
      </button>

      {showLabel && (
        <span className="mr-2 text-xs font-bold text-inherit opacity-90 hidden sm:inline">
          עוזר AI
        </span>
      )}
    </div>
  );
};
