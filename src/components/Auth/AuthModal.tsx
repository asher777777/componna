import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  Zap,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  KeyRound,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';
import { FirebaseApp } from 'firebase/app';
import {
  AuthState,
  UserRole,
  updateUserRole,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginAnonymously,
  logoutUser,
  resetUserPassword,
  formatAuthError,
  subscribeToAuth,
} from '../../services/firebaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseApp?: FirebaseApp;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  firebaseApp,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot' | 'profile'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    role: 'viewer',
    isAuthenticated: false,
    isAnonymous: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
      if (state.isAuthenticated && !state.isAnonymous && tab !== 'profile') {
        // If logged in with permanent account, switch to profile view
      }
    });
    return () => unsub();
  }, [firebaseApp, tab]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (authState.isAuthenticated && !authState.isAnonymous) {
        setTab('profile');
      } else {
        setTab('login');
      }
    }
  }, [isOpen, authState.isAuthenticated, authState.isAnonymous]);

  if (!isOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('נא למלא אימייל וסיסמה');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await loginWithEmail(email, password, firebaseApp);
      setSuccessMsg('התחברת בהצלחה למערכת!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('נא למלא את כל השדות');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await registerWithEmail(email, password, displayName, firebaseApp);
      setSuccessMsg('נרשמת בהצלחה והתחברת למערכת!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await loginWithGoogle(firebaseApp);
      setSuccessMsg('התחברת בהצלחה באמצעות Google!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await loginAnonymously(firebaseApp);
      setSuccessMsg('התחברת בהצלחה במצב מהיר (אנונימי)!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('נא להזין כתובת אימייל לאיפוס סיסמה');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await resetUserPassword(email, firebaseApp);
      setSuccessMsg('קישור לאיפוס סיסמה נשלח לתיבת האימייל שלך!');
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser(firebaseApp);
      setSuccessMsg('התנתקת בהצלחה מהמערכת.');
      setTab('login');
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 1500);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-750 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">אימות והתחברות למערכת</h2>
              <p className="text-xs text-slate-400">גישה מאובטחת ל-Firebase, Firestore ו-Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (If not on forgot password) */}
        {tab !== 'forgot' && (
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1 text-xs">
            {authState.isAuthenticated && !authState.isAnonymous && (
              <button
                type="button"
                onClick={() => setTab('profile')}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  tab === 'profile'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>הפרופיל שלי</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                tab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>כניסה למערכת</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                tab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>הרשמה חדשה</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
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
                      setTab('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
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
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'מתחבר למערכת...' : 'התחבר עכשיו'}</span>
              </button>

              {/* Alternative Quick Auth Options */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <span className="block text-center text-[11px] text-slate-400 font-medium">או התחבר באמצעות:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
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
                    disabled={loading}
                    className="py-2.5 px-3 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 rounded-xl text-xs font-semibold text-indigo-300 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="כניסה מהירה במצב אנונימי"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>כניסה מהירה</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  שם מלא / כינוי
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

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
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  סיסמה (לפחות 6 תווים)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  אימות סיסמה
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'יוצר חשבון...' : 'צור חשבון והתחבר'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-xs text-slate-400 space-y-1">
                <p className="font-bold text-white">איפוס סיסמה למשתמש</p>
                <p>הזן את כתובת האימייל שאיתה נרשמת, ונשלח אליך קישור ישיר לאיפוס הסיסמה.</p>
              </div>

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
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'שולח קישור...' : 'שלח קישור לאיפוס סיסמה'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition flex items-center justify-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>חזרה למסך התחברות</span>
              </button>
            </form>
          )}

          {/* TAB 4: PROFILE VIEW */}
          {tab === 'profile' && authState.user && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
                  {authState.displayName ? authState.displayName[0].toUpperCase() : (authState.email ? authState.email[0].toUpperCase() : 'U')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">
                    {authState.displayName || 'משתמש מחובר'}
                  </div>
                  <div className="text-xs text-slate-400 truncate font-mono">
                    {authState.email || (authState.isAnonymous ? 'חיבור אנונימי מהיר' : 'ללא אימייל')}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      {authState.isAnonymous ? '⚡ אנונימי (Anonymous Auth)' : '🔐 חשבון מאומת'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User UID info box */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>מזהה משתמש ב-Firebase (UID):</span>
                  <button
                    type="button"
                    onClick={() => handleCopyUid(authState.uid || '')}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUid ? 'הועתק!' : 'העתק UID'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-indigo-300 bg-slate-900 p-2 rounded-lg break-all">
                  {authState.uid}
                </div>
              </div>

              {/* Role Selection & Permissions (מנהל / משתמש / צופה) */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    הרשאת משתמש במערכת (Role)
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">
                    {authState.role === 'admin' ? '👑 מנהל (Admin)' : authState.role === 'editor' ? '✍️ משתמש (User)' : '👁️ צופה (Viewer)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (authState.uid) {
                        await updateUserRole(authState.uid, 'admin', firebaseApp);
                        setAuthState((prev) => ({ ...prev, role: 'admin' }));
                        setSuccessMsg('הרשאת המשתמש עודכנה ל: מנהל (Admin)');
                      }
                    }}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      authState.role === 'admin'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">👑</span>
                    <span className="text-xs font-bold">מנהל</span>
                    <span className="text-[9px] text-slate-400">שליטה מלאה</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (authState.uid) {
                        await updateUserRole(authState.uid, 'editor', firebaseApp);
                        setAuthState((prev) => ({ ...prev, role: 'editor' }));
                        setSuccessMsg('הרשאת המשתמש עודכנה ל: משתמש / עורך (User)');
                      }
                    }}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      authState.role === 'editor'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">✍️</span>
                    <span className="text-xs font-bold">משתמש</span>
                    <span className="text-[9px] text-slate-400">יצירה ועריכה</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (authState.uid) {
                        await updateUserRole(authState.uid, 'viewer', firebaseApp);
                        setAuthState((prev) => ({ ...prev, role: 'viewer' }));
                        setSuccessMsg('הרשאת המשתמש עודכנה ל: צופה (Viewer)');
                      }
                    }}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      authState.role === 'viewer'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">👁️</span>
                    <span className="text-xs font-bold">צופה</span>
                    <span className="text-[9px] text-slate-400">צפייה בלבד</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>התנתק מהחשבון</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>אימות מאובטח מול Firebase Auth</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition"
          >
            סגור
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
