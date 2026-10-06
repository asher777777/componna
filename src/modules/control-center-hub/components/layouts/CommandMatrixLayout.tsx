import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  ChevronLeft,
  Database,
  Key,
  ShieldCheck,
  CheckCircle2,
  Info,
  Terminal,
  Activity
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { ControlCenterModuleItem } from '../../types';

export const CommandMatrixLayout: React.FC = () => {
  const { filteredModules, moduleDocCounts, setSelectedModule, apiKeys } = useControlCenter();
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
      
      {/* Table Header Strip */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            מטריצת שליטה וקולקציות (System Matrix Registry)
          </h2>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          סך הכל מוצגים: {filteredModules.length} רכיבים
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/30 text-slate-400 font-medium">
              <th className="py-3 px-4">רכיב / מודול</th>
              <th className="py-3 px-4">קטגוריה</th>
              <th className="py-3 px-4">שלב תהליכי</th>
              <th className="py-3 px-4">קולקציית Firestore</th>
              <th className="py-3 px-4 text-center">מסמכים חיים</th>
              <th className="py-3 px-4 text-center">פעולות ישירות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredModules.map((mod: ControlCenterModuleItem) => {
              const docCount = mod.collectionName ? moduleDocCounts[mod.id] : undefined;

              return (
                <tr
                  key={mod.id}
                  className="hover:bg-slate-800/30 transition group"
                >
                  {/* Module ID & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${mod.colorScheme.from} ${mod.colorScheme.to} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-indigo-300 transition">
                          {mod.shortTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {mod.route}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60 text-[11px]">
                      {mod.categoryTitle}
                    </span>
                  </td>

                  {/* Stage */}
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {mod.pipelineStageTitle}
                  </td>

                  {/* Collection */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                    {mod.collectionName ? (
                      <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                        {mod.collectionName}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  {/* Live Documents Count */}
                  <td className="py-3.5 px-4 text-center font-mono text-sm">
                    {docCount !== undefined ? (
                      <span className={`font-bold ${docCount > 0 ? 'text-white' : 'text-slate-500'}`}>
                        {docCount}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedModule(mod)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition"
                        title="צפה בפרטים טכניים"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => navigate(mod.route)}
                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1.5 rounded-lg transition text-xs shadow-sm cursor-pointer"
                        title="כניסה נקייה ללא סיידבר"
                      >
                        <span>הפעל</span>
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
