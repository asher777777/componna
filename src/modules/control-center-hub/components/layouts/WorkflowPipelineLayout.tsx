import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ArrowLeft,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Workflow
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { ControlCenterModuleItem, PipelineStage } from '../../types';

export const WorkflowPipelineLayout: React.FC = () => {
  const { filteredModules, moduleDocCounts, setSelectedModule } = useControlCenter();
  const navigate = useNavigate();

  const stages: Array<{
    id: PipelineStage;
    number: string;
    title: string;
    subtitle: string;
    color: string;
    headerColor: string;
  }> = [
    {
      id: 'attract',
      number: '01',
      title: 'משיכה ושיווק',
      subtitle: 'דפי נחיתה, טפסים ומכירות SaaS',
      color: 'border-blue-500/30 bg-blue-950/10',
      headerColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'engage',
      number: '02',
      title: 'אינטראקציה וקשר',
      subtitle: 'קהילות, לידים ואוטומציית וואטסאפ',
      color: 'border-emerald-500/30 bg-emerald-950/10',
      headerColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'monetize',
      number: '03',
      title: 'סליקה והכנסות',
      subtitle: 'תשלומים, הוראות קבע וחשבוניות',
      color: 'border-indigo-500/30 bg-indigo-950/10',
      headerColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'produce',
      number: '04',
      title: 'הפקת תוכן ומדיה',
      subtitle: 'וידאו AI, גלריית אחסון ונגן חכם',
      color: 'border-pink-500/30 bg-pink-950/10',
      headerColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
    {
      id: 'foundation',
      number: '05',
      title: 'תשתיות ו-DNA',
      subtitle: 'זהות מותג, מחבר מסד ואימות משתמשים',
      color: 'border-purple-500/30 bg-purple-950/10',
      headerColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Workflow className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-xs font-bold text-white">צינור זרימת העבודה המערכתי (Business Lifecycle Pipeline)</h3>
            <p className="text-[11px] text-slate-400">התקדמות לוגית משלב החשיפה והמרת הליד ועד לסליקה, תוכן ותשתיות</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-indigo-300 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
          5 שלבים עוקבים
        </span>
      </div>

      {/* 5 Vertical/Horizontal Pipeline Lanes */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageModules = filteredModules.filter((m) => m.pipelineStage === stage.id);

          return (
            <div
              key={stage.id}
              className={`rounded-3xl border ${stage.color} p-4 flex flex-col justify-between backdrop-blur-md`}
            >
              <div>
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${stage.headerColor}`}>
                    שלב {stage.number}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {stageModules.length} רכיבים
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white mb-0.5">{stage.title}</h4>
                <p className="text-[11px] text-slate-400 leading-tight mb-4">{stage.subtitle}</p>

                {/* Modules in this Stage */}
                <div className="space-y-2.5">
                  {stageModules.map((mod: ControlCenterModuleItem) => {
                    const docCount = mod.collectionName ? moduleDocCounts[mod.id] : undefined;

                    return (
                      <div
                        key={mod.id}
                        className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl transition group hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
                            {mod.shortTitle}
                          </h5>
                          <button
                            onClick={() => setSelectedModule(mod)}
                            className="text-slate-500 hover:text-white transition"
                            title="מידע"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 mb-3">
                          {mod.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                          <span className="text-[10px] font-mono text-slate-400">
                            {docCount !== undefined ? `${docCount} מסמכים` : 'מוכן'}
                          </span>
                          <button
                            onClick={() => navigate(mod.route)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-white transition cursor-pointer"
                          >
                            <span>הפעל</span>
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {stageModules.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      אין רכיבים מתאימים בסינון
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
