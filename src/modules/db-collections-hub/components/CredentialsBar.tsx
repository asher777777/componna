import React from 'react';
import {
  Key,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Plus,
  Radio,
  Database,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useDbContext } from '../context/DbContext';

export const CredentialsBar: React.FC = () => {
  const {
    credentials,
    connectionStatus,
    connectionLatency,
    connectionError,
    authState,
    refreshDocuments,
    loadingDocs,
    realtimeSync,
    setRealtimeSync,
    setCredentialsModalOpen,
    setEditingDoc,
    switchDatabase,
    seedAllProjectData,
    seeding,
  } = useDbContext();

  const currentDbId = credentials.databaseId || 'aioffice';

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 backdrop-blur">
      
      {/* Left: Project, Database & Auth Info */}
      <div className="flex items-center gap-3 flex-wrap">
        
        {/* Project ID Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <div className="w-2 h-2 rounded-full animate-pulse bg-indigo-500" />
          <span className="text-slate-400 font-normal">פרויקט:</span>
          <span className="font-mono text-white font-semibold">
            {credentials.projectId || 'לא הוגדר'}
          </span>
        </div>

        {/* Database ID Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
            <Database className="w-3 h-3 text-amber-400" />
            DB:
          </span>
          <button
            onClick={() => switchDatabase('(default)')}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold transition ${
              currentDbId === '(default)'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="מסד נתונים ראשי (default)"
          >
            (default)
          </button>
          <button
            onClick={() => switchDatabase('aioffice')}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold transition ${
              currentDbId === 'aioffice'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="מסד נתונים aioffice"
          >
            aioffice
          </button>
        </div>

        {/* Auth Status Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border ${
          authState.isAuthenticated
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-slate-900 text-slate-400 border-slate-800'
        }`} title={authState.uid ? `User UID: ${authState.uid}` : 'טוען אימות משתמש...'}>
          <ShieldCheck className={`w-3.5 h-3.5 ${authState.isAuthenticated ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>
            {authState.isAuthenticated
              ? `מאומת (${authState.uid?.slice(0, 6)}...)`
              : authState.loading
              ? 'מתחבר Auth...'
              : 'ללא Auth'}
          </span>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
          connectionStatus === 'connected'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : connectionStatus === 'connecting'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {connectionStatus === 'connected' && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>מחובר {connectionLatency ? `(${connectionLatency}ms)` : ''}</span>
            </>
          )}
          {connectionStatus === 'connecting' && (
            <>
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>מתחבר...</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span title={connectionError || ''}>שגיאת חיבור</span>
            </>
          )}
          {connectionStatus === 'unconfigured' && (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>חסרים מפתחות</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2.5">
        
        {/* Seed All Project Data Button */}
        <button
          onClick={() => {
            if (window.confirm('האם להזין את כל נתוני ברירת המחדל של הפרויקט ישירות ל-Firestore (Flow Player, מדיה וגלריה, פרזנטורים)?')) {
              seedAllProjectData();
            }
          }}
          disabled={seeding}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          title="ייבא את כל נתוני הפרויקט ל-Firestore"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'מזין נתונים...' : 'הזנת נתוני פרויקט ל-Firestore'}</span>
        </button>

        {/* Real-time Toggle */}
        <button
          onClick={() => setRealtimeSync(!realtimeSync)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
            realtimeSync
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
          }`}
          title="האזנה לשינויים במסד הנתונים בזמן אמת"
        >
          <Radio className={`w-3.5 h-3.5 ${realtimeSync ? 'animate-pulse text-emerald-400' : ''}`} />
          <span>Live {realtimeSync ? 'פעיל' : 'כבוי'}</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={() => refreshDocuments()}
          disabled={loadingDocs}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium transition disabled:opacity-50"
          title="רענן מסמכים מקולקציה זו"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loadingDocs ? 'animate-spin' : ''}`} />
          <span>רענן</span>
        </button>

        {/* Edit Credentials / API Keys */}
        <button
          onClick={() => setCredentialsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold shadow-sm hover:border-amber-500/50 transition"
        >
          <Key className="w-3.5 h-3.5" />
          <span>מפתחות פיירבייס</span>
        </button>

        {/* New Document Button */}
        <button
          onClick={() => setEditingDoc('new')}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ מסמך חדש</span>
        </button>

      </div>
    </div>
  );
};
