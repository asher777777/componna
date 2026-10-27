import React from 'react';
import { X, Lock, KeyRound } from 'lucide-react';
import { TenantThemeColors } from './types';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginPasscode: string;
  setLoginPasscode: (val: string) => void;
  loginError: string;
  onLoginSubmit: (e: React.FormEvent) => void;
  tenantTheme: TenantThemeColors;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  loginPasscode,
  setLoginPasscode,
  loginError,
  onLoginSubmit,
  tenantTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-white mb-1">כניסת מנהל מערכת</h3>
        <p className="text-xs text-zinc-400 mb-6 font-medium">
          הזן קוד גישה לניהול הקולקציות, המחירים וההגדרות
        </p>

        <form onSubmit={onLoginSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={loginPasscode}
              onChange={(e) => setLoginPasscode(e.target.value)}
              placeholder="הזן קוד סודי (2026)"
              autoFocus
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg text-white font-mono tracking-widest outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
          </div>

          {loginError && (
            <p className="text-xs text-rose-500 font-bold bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-500/20">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
            style={{
              backgroundColor: tenantTheme.primaryColor || '#f59e0b',
              color: '#000'
            }}
          >
            <KeyRound className="w-4 h-4" />
            <span>התחבר למרכז הניהול</span>
          </button>
        </form>
      </div>
    </div>
  );
};
