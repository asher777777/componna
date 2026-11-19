import React from 'react';
import { ChevronLeft, LucideIcon } from 'lucide-react';

export interface ActionChip {
  label: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number }>;
  onClick: () => void;
  title?: string;
}

export interface KosunRowActionProps {
  icon: LucideIcon | React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  subtitle?: string;
  badge?: string;
  tooltipText?: string;
  onExecute: () => void;
  disabled?: boolean;
  variant?: 'cyan' | 'magenta' | 'cobalt' | 'default';
  className?: string;
  actions?: ActionChip[];
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
  actions = [],
}) => {
  const handleRowClick = () => {
    if (disabled) return;
    onExecute();
  };

  const variantStyles = {
    cyan: {
      border: 'border-[#1A2B4C] hover:border-[#00F0FF]/70 hover:shadow-[0_0_25px_rgba(0,240,255,0.25)]',
      iconBox: 'bg-[#0D1F38] text-[#00F0FF] border-[#00F0FF]/40',
      badgeBg: 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30',
      chevron: 'text-[#00F0FF]',
      actionBtn: 'bg-[#00F0FF]/10 hover:bg-[#00F0FF]/25 text-[#00F0FF] border-[#00F0FF]/30',
    },
    magenta: {
      border: 'border-[#1A2B4C] hover:border-[#BD00FF]/70 hover:shadow-[0_0_25px_rgba(189,0,255,0.25)]',
      iconBox: 'bg-[#1F0D2E] text-[#BD00FF] border-[#BD00FF]/40',
      badgeBg: 'bg-[#BD00FF]/15 text-[#BD00FF] border-[#BD00FF]/30',
      chevron: 'text-[#BD00FF]',
      actionBtn: 'bg-[#BD00FF]/10 hover:bg-[#BD00FF]/25 text-[#BD00FF] border-[#BD00FF]/30',
    },
    cobalt: {
      border: 'border-[#1A2B4C] hover:border-[#00A3FF]/70 hover:shadow-[0_0_25px_rgba(0,163,255,0.25)]',
      iconBox: 'bg-[#101D36] text-[#00A3FF] border-[#00A3FF]/40',
      badgeBg: 'bg-[#00A3FF]/15 text-[#00A3FF] border-[#00A3FF]/30',
      chevron: 'text-[#00A3FF]',
      actionBtn: 'bg-[#00A3FF]/10 hover:bg-[#00A3FF]/25 text-[#00A3FF] border-[#00A3FF]/30',
    },
    default: {
      border: 'border-[#1A2B4C] hover:border-[#00F0FF]/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]',
      iconBox: 'bg-[#12162B] text-[#F0F4FF] border-[#1A2B4C]',
      badgeBg: 'bg-[#1A2B4C] text-[#F0F4FF]/80 border-[#1A2B4C]',
      chevron: 'text-[#F0F4FF]/70',
      actionBtn: 'bg-[#1A2B4C] hover:bg-[#1A2B4C]/80 text-[#F0F4FF] border-[#1A2B4C]',
    },
  }[variant];

  return (
    <div className="relative w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleRowClick}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleRowClick();
          }
        }}
        dir="rtl"
        title={tooltipText}
        className={`w-full group relative flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-2xl bg-[#0D0E1F]/90 backdrop-blur-md transition-all duration-200 border cursor-pointer select-none text-right active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles.border} ${className}`}
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

        {/* Left side: Action Chips + Badge + Chevron Indicator */}
        <div className="flex items-center gap-2 shrink-0 pl-1">
          {/* Quick Action Chips (if provided) */}
          {actions.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {actions.map((act, idx) => {
                const ActIcon = act.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    title={act.title || act.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      act.onClick();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${variantStyles.actionBtn}`}
                  >
                    {ActIcon && <ActIcon size={12} />}
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Status Badge */}
          {badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-tight ${variantStyles.badgeBg}`}
            >
              {badge}
            </span>
          )}

          {/* Navigation Chevron (in RTL, left is forward) */}
          <div className="flex items-center justify-center w-6 h-6 rounded-lg text-[#F0F4FF]/40 group-hover:text-[#00F0FF] transition-colors">
            <ChevronLeft size={18} className="transform transition-transform duration-200 group-hover:-translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
