import React from 'react';
import { Database, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export const DatabaseConnectionBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { config, isConnected, isTesting, lastPingLatency, openConnectorModal } = useSystemConnection();

  return (
    <button
      onClick={openConnectorModal}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
        isConnected
          ? 'bg-slate-900/90 border-slate-700/80 hover:border-indigo-500/80 text-slate-200 hover:bg-slate-800'
          : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
      } ${className}`}
      title="לחץ להגדרת חיבור וסנכרון מסד נתונים"
    >
      <div className="relative flex items-center justify-center">
        {isTesting ? (
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
        ) : isConnected ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
          </>
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-rose-400" />
        )}
      </div>

      <div className="flex items-center gap-1.5 truncate">
        <span className="font-semibold text-white truncate max-w-[120px]">
          {config.projectId || 'אין חיבור'}
        </span>
        {lastPingLatency !== undefined && (
          <span className="text-[10px] text-emerald-400 font-mono">
            {lastPingLatency}ms
          </span>
        )}
      </div>
    </button>
  );
};
