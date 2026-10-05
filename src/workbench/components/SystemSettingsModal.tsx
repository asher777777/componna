import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Database, User, ShieldCheck, Sparkles } from 'lucide-react';
import { DatabaseConnectionBadge } from '../../modules/db-connector-hub';
import { UserMenuButton } from '../../components/Auth';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">ניהול והגדרות מערכת</h2>
              <p className="text-xs text-slate-400">ריכוז טריגרים לחיבורי מסדי נתונים ואימות משתמש</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Database Connection Trigger Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">חיבור וסנכרון מסד נתונים</div>
                <div className="text-xs text-slate-400">סטטוס חיבור Firebase, סנכרון ענן ו-Firestore</div>
              </div>
            </div>
            <div className="shrink-0">
              <DatabaseConnectionBadge />
            </div>
          </div>

          {/* User Auth Trigger Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">משתמש והרשאות</div>
                <div className="text-xs text-slate-400">התחברות למערכת, ניהול פרופיל והרשאות תפקיד</div>
              </div>
            </div>
            <div className="shrink-0">
              <UserMenuButton />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-indigo-400/90 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>סביבת פיתוח Workbench</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            סגור
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
