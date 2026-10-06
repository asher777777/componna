import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Info,
  Workflow
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { ControlCenterModuleItem, PipelineStage } from '../../types';

export const WorkflowPipelineLayout: React.FC = () => {
  const { filteredModules, moduleDocCounts, setSelectedModule, theme } = useControlCenter();
  const navigate = useNavigate();
  const isLight = theme === 'light';

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
      color: isLight ? 'border-blue-200 bg-blue-50/40' : 'border-blue-500/30 bg-blue-950/10',
      headerColor: isLight ? 'text-blue-700 bg-blue-100/80 border-blue-200' : 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'engage',
      number: '02',
      title: 'אינטראקציה וקשר',
      subtitle: 'קהילות, לידים ואוטומציית וואטסאפ',
      color: isLight ? 'border-emerald-200 bg-emerald-50/40' : 'border-emerald-500/30 bg-emerald-950/10',
      headerColor: isLight ? 'text-emerald-700 bg-emerald-100/80 border-emerald-200' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'monetize',
      number: '03',
      title: 'סליקה והכנסות',
      subtitle: 'תשלומים, הוראות קבע וחשבוניות',
      color: isLight ? 'border-indigo-200 bg-indigo-50/40' : 'border-indigo-500/30 bg-indigo-950/10',
      headerColor: isLight ? 'text-indigo-700 bg-indigo-100/80 border-indigo-200' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'produce',
      number: '04',
      title: 'הפקת תוכן ומדיה',
      subtitle: 'וידאו AI, גלריית אחסון ונגן חכם',
      color: isLight ? 'border-pink-200 bg-pink-50/40' : 'border-pink-500/30 bg-pink-950/10',
      headerColor: isLight ? 'text-pink-700 bg-pink-100/80 border-pink-200' : 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
    {
      id: 'foundation',
      number: '05',
      title: 'תשתיות ו-DNA',
      subtitle: 'זהות מותג, מחבר מסד ואימות משתמשים',
      color: isLight ? 'border-purple-200 bg-purple-50/40' : 'border-purple-500/30 bg-purple-950/10',
      headerColor: isLight ? 'text-purple-700 bg-purple-100/80 border-purple-200' : 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className={`border rounded-2xl p-4 flex items-center justify-between transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/40 border-slate-800/80'
      }`}>
        <div className="flex items-center gap-2.5">
          <Workflow className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              צינור זרימת העבודה המערכתי (Business Lifecycle Pipeline)
            </h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              התקדמות לוגית משלב החשיפה והמרת הליד ועד לסליקה, תוכן ותשתיות
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-mono px-2.5 py-1 rounded-xl border ${
          isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-indigo-300 border-slate-800'
        }`}>
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
              className={`rounded-3xl border ${stage.color} p-4 flex flex-col justify-between backdrop-blur-md transition-colors`}
            >
              <div>
                {/* Stage Header */}
                <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
                  isLight ? 'border-slate-200/80' : 'border-slate-800/80'
                }`}>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${stage.headerColor}`}>
                    שלב {stage.number}
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {stageModules.length} רכיבים
                  </span>
                </div>

                <h4 className={`font-bold text-sm mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {stage.title}
                </h4>
                <p className={`text-[11px] leading-tight mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {stage.subtitle}
                </p>

                {/* Modules in this Stage */}
                <div className="space-y-2.5">
                  {stageModules.map((mod: ControlCenterModuleItem) => {
                    const docCount = mod.collectionName ? moduleDocCounts[mod.id] : undefined;

                    return (
                      <div
                        key={mod.id}
                        className={`p-3.5 rounded-2xl transition group hover:shadow-md border ${
                          isLight
                            ? 'bg-white border-slate-200 hover:border-indigo-300'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className={`font-bold text-xs transition ${
                            isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-300'
                          }`}>
                            {mod.shortTitle}
                          </h5>
                          <button
                            onClick={() => setSelectedModule(mod)}
                            className={`transition ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'}`}
                            title="מידע"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className={`text-[10px] leading-relaxed line-clamp-2 mb-3 ${
                          isLight ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {mod.description}
                        </p>

                        <div className={`flex items-center justify-between pt-2 border-t ${
                          isLight ? 'border-slate-100' : 'border-slate-800/60'
                        }`}>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {docCount !== undefined ? `${docCount} מסמכים` : 'מוכן'}
                          </span>
                          <button
                            onClick={() => navigate(mod.route)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                          >
                            <span>הפעל</span>
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {stageModules.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">
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
