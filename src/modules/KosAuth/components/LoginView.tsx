import React, { useState } from 'react';
import { Mail, Lock, LogIn, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthPortal } from '../context/AuthPortalContext';

export const LoginView: React.FC = () => {
  const {
    handleEmailLogin,
    handleGoogleLogin,
    handleAnonymousLogin,
    setCurrentView,
    isLoading,
    errorMsg,
    successMsg,
    clearMessages,
  } = useAuthPortal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await handleEmailLogin(email, password);
    } catch {}
  };

  return (
    <div className="space-y-4" dir="rtl">
      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            כתובת אימייל
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              סיסמה
            </label>
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setCurrentView('forgot');
              }}
              className="text-[11px] text-amber-400 hover:underline"
            >
              שכחת סיסמה?
            </button>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{isLoading ? 'מתחבר למערכת...' : 'התחבר עכשיו'}</span>
        </button>
      </form>

      {/* Social and Fast Auth */}
      <div className="pt-3 border-t border-slate-800 space-y-2.5">
        <span className="block text-center text-[11px] text-slate-400 font-medium">או התחבר באמצעות:</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleAnonymousLogin}
            disabled={isLoading}
            className="py-2.5 px-3 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/60 rounded-xl text-xs font-semibold text-indigo-300 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="כניסה מהירה במצב אנונימי"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>כניסה מהירה</span>
          </button>
        </div>
      </div>
    </div>
  );
};
