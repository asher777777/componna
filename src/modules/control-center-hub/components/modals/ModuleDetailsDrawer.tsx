import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';

export const ModuleDetailsDrawer: React.FC = () => {
  const { selectedModule, setSelectedModule, moduleDocCounts } = useControlCenter();
  const navigate = useNavigate();

  if (!selectedModule) return null;

  const docCount = selectedModule.collectionName ? moduleDocCounts[selectedModule.id] : undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative text-right">
          
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${selectedModule.colorScheme.from} ${selectedModule.colorScheme.to} flex items-center justify-center text-white shadow-lg`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">
                    {selectedModule.name}
                  </h3>
                  <span className="text-[11px] font-mono text-indigo-400">
                    {selectedModule.route}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedModule(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-5">
              
              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">תיאור ומטרת הרכיב</label>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  {selectedModule.description}
                </p>
              </div>

              {/* Categorization & Stage */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">תחום עסקי</span>
                  <span className="font-semibold text-white">{selectedModule.categoryTitle}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">שלב צינור עבודה</span>
                  <span className="font-semibold text-white">{selectedModule.pipelineStageTitle}</span>
                </div>
              </div>

              {/* Firestore Collection Data */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>קולקציית Firestore:</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {selectedModule.collectionName || 'ללא קולקציה ייעודית'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">מסמכים פעילים (אמת):</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {docCount !== undefined ? docCount : 'לא רלוונטי'}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>יכולות מפתח של המודול</span>
                </label>
                <ul className="space-y-1.5">
                  {selectedModule.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Bottom Launch Bar */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setSelectedModule(null);
                navigate(selectedModule.route);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <span>כניסה ישירה לרכיב (ללא סיידבר)</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
