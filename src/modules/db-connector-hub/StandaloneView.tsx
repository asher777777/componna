import React from 'react';
import { Database, ShieldCheck, Sparkles, Server, HardDrive, RefreshCw, Layers } from 'lucide-react';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { DatabaseConnectorModal } from './components/DatabaseConnectorModal';

export const DbConnectorHubStandaloneView: React.FC = () => {
  const { config, collections, isConnected, isTesting, lastPingLatency, openConnectorModal, testConnection } = useSystemConnection();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)]">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h1 className="text-xl sm:text-2xl font-black text-white">מרכז חיבור וסנכרון מסדי נתונים (DB Connector Hub)</h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                  Universal Core
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ניהול וסנכרון מרכזי של פרויקט Firebase, מסד הנתונים Firestore ו-Storage Bucket עבור כל מודולי המערכת
              </p>
            </div>
          </div>

          <button
            onClick={openConnectorModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>הגדר / החלף מסד נתונים</span>
          </button>
        </div>

        {/* Live Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-medium">סטטוס חיבור פעיל</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span className="text-sm font-bold text-white">
                  {isConnected ? 'מחובר ומסונכרן' : 'לא מחובר'}
                </span>
              </div>
              {lastPingLatency !== undefined && (
                <span className="text-xs font-mono text-emerald-400">{lastPingLatency}ms</span>
              )}
            </div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-medium">פרויקט Firebase פעיל</span>
            <div className="font-mono text-sm font-bold text-indigo-400 truncate">
              {config.projectId || 'לא הוגדר'}
            </div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-medium">Storage Bucket (גלריה ומדיה)</span>
            <div className="font-mono text-xs font-bold text-slate-200 truncate">
              {config.storageBucket || 'לא הוגדר'}
            </div>
          </div>
        </div>

        {/* Mapped Collections Summary */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>קולקציות מסונכרנות במערכת</span>
            </div>
            <button
              onClick={() => testConnection()}
              disabled={isTesting}
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
              <span>בדיקת פינג</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">גלריית מדיה:</span>
              <span className="font-mono font-bold text-indigo-300">{collections.mediaItems}</span>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">נגן אינטראקטיבי:</span>
              <span className="font-mono font-bold text-indigo-300">{collections.playerCampaigns}</span>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">CRM אנשי קשר ולידים:</span>
              <span className="font-mono font-bold text-indigo-300">{collections.contacts}</span>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">פורטל משתמשים:</span>
              <span className="font-mono font-bold text-indigo-300">{collections.users}</span>
            </div>
          </div>
        </div>

        <DatabaseConnectorModal />
      </div>
    </div>
  );
};

export default DbConnectorHubStandaloneView;
