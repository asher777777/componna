import React, { useState } from 'react';
import { Lock, Globe, KeyRound, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { TenantRecord } from '../contracts';
import { TenantAuthService } from '../../modules/KosTenantProvisioner/services/tenantAuthService';
import { useSystemConnection } from '../connection/SystemConnectionContext';

export interface TenantAdminLoginViewProps {
  tenantRecord: TenantRecord;
  onLoginSuccess: () => void;
  onBackToPublic: () => void;
}

export const TenantAdminLoginView: React.FC<TenantAdminLoginViewProps> = ({
  tenantRecord,
  onLoginSuccess,
  onBackToPublic,
}) => {
  const { db } = useSystemConnection();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('נא למלא שם משתמש וסיסמה');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await TenantAuthService.verifyTenantLogin(
        db,
        tenantRecord.subdomain,
        username,
        password
      );

      if (res.success) {
        onLoginSuccess();
        const url = new URL(window.location.href);
        url.pathname = '/brand-dna';
        url.searchParams.set('admin', 'true');
        window.location.href = url.toString();
      } else {
        setError(res.error || 'שם משתמש או סיסמה שגויים');
      }
    } catch (err: any) {
      setError('אירעה שגיאה באימות הפרטים. אנא נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand / Logo Top */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">
            כניסה ללוח הניהול
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-bold text-slate-300">
              {tenantRecord.clientName}
            </span>
            <span className="font-mono text-xs text-indigo-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800" dir="ltr">
              {tenantRecord.fullDomain}
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                שם משתמש / אימייל:
              </label>
              <input
                type="text"
                required
                placeholder="הזן שם משתמש"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                סיסמה:
              </label>
              <input
                type="password"
                required
                placeholder="הזן סיסמת ניהול"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-left"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>מאמת פרטים...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>כניסה למערכת</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={onBackToPublic}
              className="text-xs text-slate-400 hover:text-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>חזרה לאתר הציבורי של {tenantRecord.clientName}</span>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-[11px] text-slate-500">
          🔒 סביבת ניהול מאובטחת ומבודדת טננט בסטנדרט KOSUN26
        </p>

      </div>
    </div>
  );
};
