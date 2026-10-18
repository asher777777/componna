import React from 'react';
import { 
  Plus, Play, Edit3, Trash2, Film, Sparkles, Wand2, Globe, Clock, CheckCircle2 
} from 'lucide-react';
import { useKosLive } from '../context/KosLiveContext';
import { LivingProject } from '../types';

export const ProjectsListView: React.FC = () => {
  const { projects, setActiveProject, setTab, createNewProject, deleteProject, isLoading } = useKosLive();

  const handleEdit = (project: LivingProject) => {
    setActiveProject(project);
    setTab('timeline');
  };

  const handlePreview = (project: LivingProject) => {
    setActiveProject(project);
    setTab('preview');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 font-sans select-none" dir="rtl">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white">פרויקטי עמודים חיים</h2>
          <p className="text-xs text-slate-400">ניהול עמודי וידאו אינטראקטיביים והפקות אווטארים</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('converter')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>המרת עמוד קיים לחי</span>
          </button>

          <button
            onClick={() => createNewProject()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>פרויקט חדש מאפס</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-xs">טוען פרויקטים...</div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 max-w-md mx-auto space-y-4">
          <Film className="w-12 h-12 mx-auto text-amber-500/60" />
          <h3 className="text-base font-bold text-white">אין פרויקטים שמורים עדיין</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            תוכלו להפיח חיים בכל עמוד שכבר בניתם ב-KosWebAi בלחיצת כפתור אחת, או ליצור סרטון אווטאר אינטראקטיבי חדש.
          </p>
          <button
            onClick={() => setTab('converter')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>המרת עמוד ראשון לעמוד חי</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const scenesCount = project.scenes?.length || 0;
            return (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all text-right flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {scenesCount} סצנות חיות
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(project.updatedAt).toLocaleDateString('he-IL')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{project.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || 'ללא תיאור'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePreview(project)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>נגן</span>
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>ערוך</span>
                    </button>
                  </div>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                    title="מחק פרויקט"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
