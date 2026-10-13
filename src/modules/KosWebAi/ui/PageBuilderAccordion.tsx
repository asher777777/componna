import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PageBuilderAccordionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
  actionNode?: React.ReactNode;
  className?: string;
}

export const PageBuilderAccordion: React.FC<PageBuilderAccordionProps> = ({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
  badge,
  actionNode,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={twMerge(
        clsx(
          'border border-slate-800 bg-slate-900/40 rounded-2xl overflow-hidden transition-all duration-200',
          isOpen && 'border-slate-700 bg-slate-900/80 shadow-lg',
          className
        )
      )}
      dir="rtl"
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-slate-400">{icon}</span>}
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{title}</span>
              {badge}
            </div>
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {actionNode}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-white transition-transform"
          >
            <ChevronDown className={clsx('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180 text-indigo-400')} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 py-3.5 border-t border-slate-800/80 bg-slate-950/40 flex flex-col gap-3.5 animate-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
};
