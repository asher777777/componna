import React, { useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Key,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { useAuthPortal } from '../context/AuthPortalContext';

export const ProfileView: React.FC = () => {
  const {
    authState,
    userProfile,
    handleLogout,
    isLoading,
    successMsg,
  } = useAuthPortal();

  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 1500);
  };

  const user = authState.user;
  if (!user) return null;

  return (
    <div className="space-y-4" dir="rtl">
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* User Card */}
      <div className="flex items-center gap-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
          {authState.displayName
            ? authState.displayName[0].toUpperCase()
            : authState.email
            ? authState.email[0].toUpperCase()
            : 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-white truncate">
            {authState.displayName || (authState.isAnonymous ? 'אורח אנונימי' : 'משתמש מחובר')}
          </div>
          <div className="text-xs text-slate-400 truncate font-mono mt-0.5">
            {authState.email || (authState.isAnonymous ? 'סשן אנונימי זמני' : 'ללא כתובת אימייל')}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
              authState.isAnonymous
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}>
              {authState.isAnonymous ? '⚡ מצב אנונימי (Anonymous Auth)' : '🔐 חשבון מאומת ומאובטח'}
            </span>
          </div>
        </div>
      </div>

      {/* UID & Details */}
      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            מזהה Firebase UID:
          </span>
          <button
            type="button"
            onClick={() => handleCopyUid(authState.uid || '')}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUid ? 'הועתק!' : 'העתק'}</span>
          </button>
        </div>
        <div className="font-mono text-[11px] text-indigo-300 bg-slate-900 p-2.5 rounded-xl break-all select-all border border-slate-800">
          {authState.uid}
        </div>

        {userProfile && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div>
              <span>תפקיד: </span>
              <span className="text-slate-200 font-semibold">{userProfile.role}</span>
            </div>
            <div>
              <span>כניסה אחרונה: </span>
              <span className="text-slate-200 font-mono">{new Date(userProfile.lastLoginAt).toLocaleTimeString('he-IL')}</span>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
        <span>{isLoading ? 'מתנתק...' : 'התנתק מהחשבון'}</span>
      </button>
    </div>
  );
};
