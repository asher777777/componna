import React, { useEffect, useState } from 'react';
import { Flame, CheckCircle2, XCircle } from 'lucide-react';

export const FirebaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'configured' | 'missing'>('missing');
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  useEffect(() => {
    if (import.meta.env.VITE_FIREBASE_API_KEY && projectId) {
      setStatus('configured');
    } else {
      setStatus('missing');
    }
  }, [projectId]);

  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-slate-200">חיבור Firebase</div>
          <div className="text-slate-400 text-[11px] truncate max-w-[140px]">
            {projectId ? projectId : 'לא הוגדר .env'}
          </div>
        </div>
      </div>

      <div>
        {status === 'configured' ? (
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
            <CheckCircle2 className="w-3 h-3" />
            מחובר
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full text-[11px]">
            <XCircle className="w-3 h-3 text-slate-500" />
            ללא .env
          </span>
        )}
      </div>
    </div>
  );
};
