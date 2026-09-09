import React from 'react';
import { Film, Plus, Trash2, Calendar, Layout, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';
import { VideoProject } from '../types';

export const ProjectListView: React.FC = () => {
  const { projects, setActiveProject, setActiveSceneId, setTab, deleteCurrentProject } = useVideoStudio();

  const handleOpenProject = (project: VideoProject) => {
    setActiveProject(project);
    setActiveSceneId(project.scenes[0]?.id || null);
    setTab('editor');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-purple-400" />
            <span>פרויקטי וידאו ואווטאר (SDO Projects)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            כלל הפרויקטים, הסטוריבורדים והפקות ה-AI השמורות במערכת
          </p>
        </div>

        <button
          onClick={() => setTab('wizard')}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>פרויקט וידאו חדש (AI Wizard)</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-3">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">עדיין אין פרויקטי וידאו</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            צור את פרויקט הוידאו הראשון שלך באמצעות אשף ה-AI, בחר אווטאר והפק סרטון מרהיב.
          </p>
          <button
            onClick={() => setTab('wizard')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>התחל באשף ה-AI</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const completedScenes = proj.scenes.filter(s => s.renderedVideoUrl).length;
            return (
              <div
                key={proj.id}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-3xl transition flex flex-col justify-between space-y-4 group shadow-lg shadow-slate-950/50"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {proj.aspectRatio || '16:9'}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(proj.updatedAt || proj.createdAt).toLocaleDateString('he-IL')}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {proj.description || proj.marketingHook || 'ללא תיאור'}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {completedScenes}/{proj.scenes.length} סצנות רונדרו
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => deleteCurrentProject(proj.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                      title="מחק פרויקט"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenProject(proj)}
                      className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold rounded-xl flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>פתח עורך</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
