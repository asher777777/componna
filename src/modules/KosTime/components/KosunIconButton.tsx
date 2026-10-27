import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LucideIcon } from 'lucide-react';
import { sound } from '../services/soundService';

interface KosunIconButtonProps {
  icon: LucideIcon | React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyan';
  className?: string;
  iconSize?: number;
  badge?: number | string;
  disabled?: boolean;
}

interface TooltipCoords {
  x: number;
  y: number;
  isBelow: boolean;
}

/**
 * ADHD-friendly Iconic Action Button:
 * - 1st click / tap: Reveals the tooltip explanation (no accidental execution, zero cognitive strain).
 * - 2nd click / tap: Executes the button's action!
 * - Smart Viewport-Clamped Tooltip: Rendered via Portal directly in document.body,
 *   never clipped by overflow, and dynamically placed above/below to stay 100% on-screen!
 * - Auto-dismisses tooltip after 3 seconds or on outside click.
 */
export const KosunIconButton: React.FC<KosunIconButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  className = '',
  iconSize = 20,
  badge,
  disabled = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateCoordinates = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    // Determine whether to place above or below
    // If button is in the top 75px of the screen (e.g. Navbar or top header), place BELOW
    const isBelow = rect.top < 75;

    // Center horizontally on the button, but clamp so tooltip stays inside viewport
    const buttonCenterX = rect.left + rect.width / 2;
    // Estimated tooltip width ~180px, half width = 90px
    const minX = 90;
    const maxX = window.innerWidth - 90;
    const clampedX = Math.max(minX, Math.min(maxX, buttonCenterX));

    const y = isBelow ? rect.bottom + 10 : rect.top - 10;

    setCoords({ x: clampedX, y, isBelow });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    const handleScrollOrResize = () => {
      if (showTooltip) {
        updateCoordinates();
      }
    };

    if (showTooltip) {
      updateCoordinates();
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowTooltip(false), 3000);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showTooltip]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    if (!showTooltip) {
      // 1st click: Open tooltip
      sound.playPop();
      updateCoordinates();
      setShowTooltip(true);
    } else {
      // 2nd click: Execute action
      setShowTooltip(false);
      onClick(e);
    }
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)] border border-[#00F0FF]',
    cyan:
      'bg-[#0D1F38] text-[#00F0FF] hover:bg-[#00F0FF]/20 border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]',
    secondary:
      'bg-[#12162B] text-[#F0F4FF] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 border border-[#1A2B4C]',
    ghost:
      'bg-transparent text-[#F0F4FF]/70 hover:text-[#00F0FF] hover:bg-[#1A2B4C]/50 border border-transparent',
    danger:
      'bg-[#1A121A] text-rose-400 hover:bg-rose-500/20 border border-rose-500/30',
  }[variant];

  return (
    <div className="relative inline-flex items-center justify-center">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className={`relative min-h-[44px] min-w-[44px] p-2.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${variantStyles} ${
          showTooltip ? 'ring-2 ring-[#00F0FF] scale-105 shadow-[0_0_20px_rgba(0,240,255,0.6)]' : ''
        } ${className}`}
        aria-label={label}
        title={label}
      >
        <Icon size={iconSize} />

        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-[#00F0FF] text-[#070913] text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_#00F0FF]">
            {badge}
          </span>
        )}
      </button>

      {/* Viewport-Safe Floating Tooltip rendered directly into document.body */}
      {showTooltip &&
        coords &&
        createPortal(
          <div
            className="fixed z-[99999] pointer-events-none transition-transform duration-150 select-none animate-in fade-in zoom-in-95"
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: coords.isBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            }}
          >
            {/* Arrow */}
            {coords.isBelow && (
              <div className="w-2.5 h-2.5 bg-[#0B0E1A] border-t border-l border-[#00F0FF] rotate-45 mx-auto -mb-1 shadow-sm" />
            )}

            <div className="kosun-tooltip-content bg-[#0B0E1A] text-[#00F0FF] text-xs font-bold px-3.5 py-1.5 rounded-xl border border-[#00F0FF] shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_20px_rgba(0,240,255,0.4)] whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
              <span className="tracking-wide">{label}</span>
              <span className="text-[10px] text-[#F0F4FF]/75 font-normal">
                (לחץ שוב להפעלה)
              </span>
            </div>

            {!coords.isBelow && (
              <div className="w-2.5 h-2.5 bg-[#0B0E1A] border-b border-r border-[#00F0FF] rotate-45 mx-auto -mt-1 shadow-sm" />
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
