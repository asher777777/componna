import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export interface TooltipProps {
  content: string;
  className?: string;
}

/**
 * Intelligent Minimal Tooltip complying strictly with Cashwan Branding Rule 3:
 * - Tiny delicate (i) icon
 * - Dismissed on click outside or clicking the close icon
 * - Zero emoji, Heebo font, high contrast
 */
export const Tooltip: React.FC<TooltipProps> = ({ content, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-slate-400 hover:text-indigo-400 transition p-0.5 rounded-full hover:bg-slate-800/60 focus:outline-none"
        aria-label="מידע נוסף"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          dir="rtl"
          className="absolute z-50 bottom-full mb-1.5 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-56 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xl text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-start justify-between gap-1.5">
            <span className="leading-relaxed">{content}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded transition cursor-pointer"
              aria-label="סגור הסבר"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="absolute top-full right-3 sm:left-1/2 sm:-translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-700/80" />
        </div>
      )}
    </div>
  );
};
