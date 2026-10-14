import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface KosTubeFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const KosTubeFullscreenModal: React.FC<KosTubeFullscreenModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
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

  return (
    <div
      className="fixed inset-0 z-50 w-screen h-screen bg-slate-950/98 backdrop-blur-2xl text-white flex flex-col animate-in fade-in duration-200"
      dir="rtl"
    >
      {/* 100% Full-Screen Header with prominent close button */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
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

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
        {children}
      </div>

      {footer && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end gap-3 max-w-7xl mx-auto w-full">
          {footer}
        </div>
      )}
    </div>
  );
};
