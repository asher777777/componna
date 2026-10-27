import React, { useState } from 'react';
import { Mail, Send, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthPortal } from '../context/AuthPortalContext';

export const ForgotPasswordView: React.FC = () => {
  const {
    handleResetPassword,
    setCurrentView,
    isLoading,
    errorMsg,
    successMsg,
    clearMessages,
  } = useAuthPortal();

  const [email, setEmail] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await handleResetPassword(email);
    } catch {}
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="text-xs text-slate-400 space-y-1">
        <p className="font-bold text-white text-sm">איפוס סיסמת משתמש</p>
        <p>הזן את כתובת האימייל שלך ונשלח אליך קישור מאובטח לאיפוס הסיסמה.</p>
      </div>

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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'שולח קישור...' : 'שלח קישור לאיפוס סיסמה'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            clearMessages();
            setCurrentView('login');
          }}
          className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>חזרה למסך התחברות</span>
        </button>
      </form>
    </div>
  );
};
