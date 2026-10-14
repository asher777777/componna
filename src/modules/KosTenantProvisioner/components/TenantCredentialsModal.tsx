import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, Eye, EyeOff, Save, Lock, ExternalLink, RefreshCw } from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { buildTenantAdminUrl } from '../../../core/tenant';

export const TenantCredentialsModal: React.FC = () => {
  const { viewingCredentialsTenant, setViewingCredentialsTenant, updateCredentials } = useTenantProvisioner();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (viewingCredentialsTenant) {
      setUsername(viewingCredentialsTenant.adminUsername || '');
      setPassword(viewingCredentialsTenant.adminPassword || 'Ks@1234');
      setIsEditing(false);
    }
  }, [viewingCredentialsTenant]);

  if (!viewingCredentialsTenant) return null;

  const adminUrl = buildTenantAdminUrl(viewingCredentialsTenant.subdomain, viewingCredentialsTenant.fullDomain);

  const handleSaveCredentials = async () => {
    setSaving(true);
    try {
      await updateCredentials(viewingCredentialsTenant.subdomain, { username, password });
      setIsEditing(false);
    } catch (e) {
      console.warn('Error saving credentials:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                פרטי כניסה וניהול סאב-דומיין
              </h3>
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400" dir="ltr">
                {viewingCredentialsTenant.fullDomain}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setViewingCredentialsTenant(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Subdomain Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">שם העסק:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {viewingCredentialsTenant.clientName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">קישור לוח ניהול:</span>
              <div className="flex items-center gap-2">
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  פתח לוח בקרה
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(adminUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                  title="העתק קישור"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                שם משתמש:
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono text-left outline-none disabled:opacity-75"
                dir="ltr"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  סיסמה:
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'הסתר' : 'הצג סיסמה'}</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword || isEditing ? 'text' : 'password'}
                  disabled={!isEditing}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono text-left outline-none disabled:opacity-75 pr-10"
                  dir="ltr"
                />
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(password);
                      setCopiedPass(true);
                      setTimeout(() => setCopiedPass(false), 2000);
                    }}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="העתק סיסמה"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              ערוך שם משתמש וסיסמה
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:underline cursor-pointer"
            >
              בטל עריכה
            </button>
          )}

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleSaveCredentials}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>שמור פרטים</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewingCredentialsTenant(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
            >
              סגור
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
