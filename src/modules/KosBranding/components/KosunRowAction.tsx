import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';

export interface KosunRowActionProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  subtitle?: string;
  badge?: string;
  tooltipText: string;
  onExecute: () => void;
  disabled?: boolean;
  variant?: 'cyan' | 'magenta' | 'cobalt' | 'default';
  className?: string;
}

export const KosunRowAction: React.FC<KosunRowActionProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  tooltipText,
  onExecute,
  disabled = false,
  variant = 'cyan',
  className = '',
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number; isBelow: boolean } | null>(null);
  const rowRef = useRef<HTMLButtonElement>(null);

  const updateCoordinates = () => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    const isBelow = rect.top < 120;
    const centerX = rect.left + rect.width / 2;
    const minX = 140;
    const maxX = window.innerWidth - 140;
    const clampedX = Math.max(minX, Math.min(maxX, centerX));
    const y = isBelow ? rect.bottom + 10 : rect.top - 10;
    setCoords({ x: clampedX, y, isBelow });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      updateCoordinates();
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      window.addEventListener('resize', updateCoordinates);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('resize', updateCoordinates);
    };
  }, [showPopover]);

  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!showPopover) {
      updateCoordinates();
      setShowPopover(true);
    } else {
      setShowPopover(false);
      onExecute();
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopover(false);
    onExecute();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopover(false);
  };

  const variantStyles = {
    cyan: {
      border: 'border-[#1A2B4C] hover:border-[#00F0FF]/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]',
      iconBox: 'bg-[#0D1F38] text-[#00F0FF] border-[#00F0FF]/40',
      activeBorder: 'border-[#00F0FF] shadow-[0_0_25px_rgba(0,240,255,0.35)]',
    },
    magenta: {
      border: 'border-[#1A2B4C] hover:border-[#BD00FF]/60 hover:shadow-[0_0_20px_rgba(189,0,255,0.25)]',
      iconBox: 'bg-[#1F0D2E] text-[#BD00FF] border-[#BD00FF]/40',
      activeBorder: 'border-[#BD00FF] shadow-[0_0_25px_rgba(189,0,255,0.35)]',
    },
    cobalt: {
      border: 'border-[#1A2B4C] hover:border-[#00A3FF]/60 hover:shadow-[0_0_20px_rgba(0,163,255,0.25)]',
      iconBox: 'bg-[#101D36] text-[#00A3FF] border-[#00A3FF]/40',
      activeBorder: 'border-[#00A3FF] shadow-[0_0_25px_rgba(0,163,255,0.35)]',
    },
    default: {
      border: 'border-[#1A2B4C] hover:border-[#00F0FF]/40',
      iconBox: 'bg-[#12162B] text-[#F0F4FF] border-[#1A2B4C]',
      activeBorder: 'border-[#00F0FF]',
    },
  }[variant];

  return (
    <div className="relative w-full">
      <button
        ref={rowRef}
        type="button"
        disabled={disabled}
        onClick={handleRowClick}
        dir="rtl"
        className={`w-full group relative flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-2xl bg-[#0D0E1F]/90 backdrop-blur-md transition-all duration-200 border cursor-pointer select-none text-right disabled:opacity-40 disabled:cursor-not-allowed ${
          showPopover ? variantStyles.activeBorder : variantStyles.border
        } ${className}`}
      >
        {/* Right side: Icon + Title & Subtitle */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 shadow-inner ${variantStyles.iconBox}`}
          >
            <Icon size={22} />
          </div>
          <div className="flex flex-col min-w-0 truncate">
            <span className="text-sm font-bold text-[#F0F4FF] tracking-wide truncate group-hover:text-[#00F0FF] transition-colors">
              {title}
            </span>
            {subtitle && (
              <span className="text-[11px] text-[#F0F4FF]/60 truncate font-normal">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Left side: Badge & Indicator */}
        <div className="flex items-center gap-2.5 shrink-0 pl-1">
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 tracking-tight">
              {badge}
            </span>
          )}
          <div className="w-2 h-2 rounded-full bg-[#1A2B4C] group-hover:bg-[#00F0FF] group-hover:shadow-[0_0_8px_#00F0FF] transition-all" />
        </div>
      </button>

      {/* Floating Modal Tooltip Popover */}
      {showPopover &&
        coords &&
        createPortal(
          <div
            className="fixed z-[99999] transition-all duration-150 select-none animate-in fade-in zoom-in-95"
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: coords.isBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            }}
          >
            {/* Popover Arrow */}
            {coords.isBelow && (
              <div className="w-3 h-3 bg-[#0B0E1A] border-t border-r border-[#00F0FF]/60 rotate-45 mx-auto -mb-1.5 shadow-md" />
            )}

            <div
              dir="rtl"
              className="w-72 sm:w-80 p-3.5 rounded-2xl bg-[#0B0E1A]/98 border border-[#00F0FF]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(0,240,255,0.35)] backdrop-blur-xl text-right"
            >
              <div className="text-xs font-bold text-[#00F0FF] mb-1 flex items-center gap-1.5">
                <Icon size={14} />
                <span>{title}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#F0F4FF]/80 mb-3">
                {tooltipText}
              </p>

              {/* Exact two bottom icons: Checkmark (✓) and Cancel (X) */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1A2B4C]/80">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12162B] hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer transition active:scale-95"
                  title="ביטול"
                >
                  <X size={15} />
                  <span>ביטול</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 transition active:scale-95"
                  title="אישור והמשך"
                >
                  <Check size={15} className="stroke-[3]" />
                  <span>אישור</span>
                </button>
              </div>
            </div>

            {!coords.isBelow && (
              <div className="w-3 h-3 bg-[#0B0E1A] border-b border-l border-[#00F0FF]/60 rotate-45 mx-auto -mt-1.5 shadow-md" />
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
