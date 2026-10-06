import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  moduleName?: string;
}

export const ModuleLoadingFallback: React.FC<Props> = ({ moduleName }) => {
  return (
    <div className="min-h-[300px] h-full w-full flex flex-col items-center justify-center p-6 bg-slate-950/40 text-slate-300" dir="rtl">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-sm font-semibold text-slate-300">
          טוען רכיב {moduleName ? `"${moduleName}"` : ''}...
        </span>
      </div>
    </div>
  );
};
