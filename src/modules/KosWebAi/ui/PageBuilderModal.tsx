import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const PageBuilderModal: React.FC<PageBuilderModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#09090b] text-white flex flex-col animate-in fade-in duration-200" dir="rtl">
      {/* 100% Full-Screen Header with prominent close button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-md group cursor-pointer"
          title="סגור חלון"
        >
          <span className="text-xs font-bold">סגור</span>
          <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 max-w-7xl mx-auto w-full">
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0c0c0e] flex items-center justify-end gap-3 max-w-7xl mx-auto w-full">
          {footer}
        </div>
      )}
    </div>
  );
};
