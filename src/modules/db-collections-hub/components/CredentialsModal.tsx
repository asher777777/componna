import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Server,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useDbContext } from '../context/DbContext';
import { FirebaseCredentialsConfig } from '../types';

export const CredentialsModal: React.FC = () => {
  const {
    credentials,
    isCustomCredentials,
    saveCredentials,
    resetCredentialsToEnv,
    credentialsModalOpen,
    setCredentialsModalOpen,
    connectionStatus,
    connectionError,
    connectionLatency,
    testConnection,
  } = useDbContext();

  const [formData, setFormData] = useState<FirebaseCredentialsConfig>(credentials);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setFormData(credentials);
  }, [credentials, credentialsModalOpen]);

  if (!credentialsModalOpen) return null;

  const handleChange = (field: keyof FirebaseCredentialsConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveCredentials(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      testConnection();
    }, 800);
  };

  const handleReset = () => {
    if (window.confirm('האם לאפס את כל המפתחות להגדרות ברירת המחדל מתוך קובץ ה-.env?')) {
      resetCredentialsToEnv();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 800);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    await testConnection();
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                הגדרות ומפתחות חיבור ל-Firebase
                {isCustomCredentials && (
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    שמירה מקומית פעילה
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                עריכה ושמירת מפתחות הפרויקט, מסד הנתונים והרשאות API בזמן אמת
              </p>
            </div>
          </div>
          <button
            onClick={() => setCredentialsModalOpen(false)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            connectionStatus === 'connected'
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              : connectionStatus === 'connecting'
              ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
              : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {connectionStatus === 'connected' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : connectionStatus === 'connecting' ? (
                <Activity className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="font-bold">
                  {connectionStatus === 'connected' && `מחובר בהצלחה לפרויקט (${connectionLatency || 0}ms)`}
                  {connectionStatus === 'connecting' && 'בודק חיבור למסד הנתונים...'}
                  {connectionStatus === 'error' && (connectionError || 'שגיאת חיבור למסד הנתונים')}
                  {connectionStatus === 'unconfigured' && 'מפתחות לא מוגדרים'}
                </div>
                <div className="text-[11px] opacity-80">
                  Project: <span className="font-mono">{formData.projectId || 'ללא'}</span> | Database ID: <span className="font-mono">{formData.databaseId || '(default)'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleTest}
              disabled={testing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700 disabled:opacity-50"
            >
              {testing ? 'בודק...' : 'בדוק חיבור'}
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Project ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                Project ID (מזהה פרויקט)
              </label>
              <input
                type="text"
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                placeholder="e.g. aioffice-1426f"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Database ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Firestore Database ID (שם מסד נתונים)
              </label>
              <input
                type="text"
                value={formData.databaseId || ''}
                onChange={(e) => handleChange('databaseId', e.target.value)}
                placeholder="e.g. aioffice or (default)"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* API Key */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Firebase API Key
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Auth Domain */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Auth Domain
              </label>
              <input
                type="text"
                value={formData.authDomain}
                onChange={(e) => handleChange('authDomain', e.target.value)}
                placeholder="aioffice-1426f.firebaseapp.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Storage Bucket */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Storage Bucket
              </label>
              <input
                type="text"
                value={formData.storageBucket}
                onChange={(e) => handleChange('storageBucket', e.target.value)}
                placeholder="aioffice-1426f.firebasestorage.app"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* App ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Firebase App ID
              </label>
              <input
                type="text"
                value={formData.appId}
                onChange={(e) => handleChange('appId', e.target.value)}
                placeholder="1:485069254738:web:..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Messaging Sender ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Messaging Sender ID
              </label>
              <input
                type="text"
                value={formData.messagingSenderId}
                onChange={(e) => handleChange('messagingSenderId', e.target.value)}
                placeholder="485069254738"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span>המפתחות נשמרים בדפדפן באופן מאובטח ב-LocalStorage ומשמשים לתקשורת API ישירה בלבד מול שרתי Google Firebase/Firestore ללא שמירה בשרת חיצוני.</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition"
            title="אפס להגדרות המקוריות מ-.env"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>איפוס לברירת מחדל (.env)</span>
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium animate-pulse flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                נשמר בהצלחה!
              </span>
            )}
            <button
              onClick={() => setCredentialsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              סגור
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition"
            >
              <Save className="w-4 h-4" />
              <span>שמור מפתחות ב-UI</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
