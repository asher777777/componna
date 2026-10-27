import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Info,
  Terminal,
  Activity
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { ControlCenterModuleItem } from '../../types';

export const CommandMatrixLayout: React.FC = () => {
  const { filteredModules, moduleDocCounts, setSelectedModule, theme } = useControlCenter();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  return (
    <div className={`rounded-3xl overflow-hidden backdrop-blur-xl shadow-md border transition-colors ${
      isLight ? 'bg-white/90 border-slate-200 shadow-slate-200/50' : 'bg-slate-900/60 border-slate-800'
    }`}>
      
      {/* Table Header Strip */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-500" />
          <h2 className={`text-xs font-bold uppercase tracking-wider font-mono ${
            isLight ? 'text-slate-800' : 'text-white'
          }`}>
            מטריצת שליטה וקולקציות (System Matrix Registry)
          </h2>
        </div>
        <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          סך הכל מוצגים: {filteredModules.length} רכיבים
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className={`border-b font-medium ${
              isLight ? 'border-slate-200 bg-slate-50/50 text-slate-600' : 'border-slate-800 bg-slate-950/30 text-slate-400'
            }`}>
              <th className="py-3 px-4">רכיב / מודול</th>
              <th className="py-3 px-4">קטגוריה</th>
              <th className="py-3 px-4">שלב תהליכי</th>
              <th className="py-3 px-4">קולקציית Firestore</th>
              <th className="py-3 px-4 text-center">מסמכים חיים</th>
              <th className="py-3 px-4 text-center">פעולות ישירות</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
            {filteredModules.map((mod: ControlCenterModuleItem) => {
              const docCount = mod.collectionName ? moduleDocCounts[mod.id] : undefined;

              return (
                <tr
                  key={mod.id}
                  className={`transition group ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/30'}`}
                >
                  {/* Module ID & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${mod.colorScheme.from} ${mod.colorScheme.to} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`font-bold transition ${
                          isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-300'
                        }`}>
                          {mod.shortTitle}
                        </div>
                        <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {mod.route}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-lg border text-[11px] ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                    }`}>
                      {mod.categoryTitle}
                    </span>
                  </td>

                  {/* Stage */}
                  <td className={`py-3.5 px-4 font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {mod.pipelineStageTitle}
                  </td>

                  {/* Collection */}
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {mod.collectionName ? (
                      <span className={`px-2 py-0.5 rounded border ${
                        isLight
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-emerald-400 bg-emerald-950/30 border-emerald-500/20'
                      }`}>
                        {mod.collectionName}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Live Documents Count */}
                  <td className="py-3.5 px-4 text-center font-mono text-sm">
                    {docCount !== undefined ? (
                      <span className={`font-bold ${
                        docCount > 0
                          ? isLight ? 'text-slate-900' : 'text-white'
                          : isLight ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {docCount}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedModule(mod)}
                        className={`p-1.5 rounded-lg transition ${
                          isLight
                            ? 'text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200'
                            : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700'
                        }`}
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
