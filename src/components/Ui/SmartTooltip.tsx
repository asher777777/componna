import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface SmartTooltipProps {
  text: string;
  title?: string;
  className?: string;
}

/**
 * Cashwan 2026 SmartTooltip (Rule 3 in cashwan-branding)
 * - Delicate (i) icon button
 * - Opens focused explanation on click
 * - Closes on click outside or via inner close (X) button
 * - Clean high-contrast card supporting Day & Night mode
 */
export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  text,
  title = 'מידע נוסף',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-flex items-center align-middle mx-1 z-30 ${className}`} ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer shrink-0"
        title={title}
        aria-label={title}
      >
        i
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs rounded-2xl shadow-2xl z-50 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150 text-right"
          dir="rtl"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">{title}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="סגור"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="leading-relaxed font-normal text-slate-600 dark:text-slate-300 text-[11px] select-text">
            {text}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export default SmartTooltip;
