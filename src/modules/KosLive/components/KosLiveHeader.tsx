import React from 'react';
import { 
  Sparkles, FolderKanban, Wand2, Layers, Play, Share2, Plus, Save, CheckCircle2, Film
} from 'lucide-react';
import { useKosLive, KosLiveStudioTab } from '../context/KosLiveContext';

export const KosLiveHeader: React.FC = () => {
  const { tab, setTab, activeProject, saveCurrentProject, createNewProject } = useKosLive();
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSave = async () => {
    await saveCurrentProject();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <header className="px-4 sm:px-6 py-3.5 bg-slate-900 border-b border-slate-800 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 shadow-md select-none font-sans" dir="rtl">
      
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
          <Film className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              קושאן LivePage
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              LIVING PAGES PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            הפיכת עמודים, תוכן ומוצרים לעמודים חיים עם פרזנטורים אינטראקטיביים
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setTab('projects')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
            tab === 'projects' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>פרויקטים</span>
        </button>

        <button
          onClick={() => setTab('converter')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
            tab === 'converter' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>המרת עמוד לחי</span>
        </button>

        <button
          onClick={() => setTab('timeline')}
          disabled={!activeProject}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 ${
            tab === 'timeline' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>עורך סצנות</span>
        </button>

        <button
          onClick={() => setTab('preview')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
            tab === 'preview' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>נגן אינטראקטיבי</span>
        </button>

        <button
          onClick={() => setTab('embed')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
            tab === 'embed' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>הפצה והטמעה</span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => createNewProject()}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">פרויקט חדש</span>
        </button>

        {activeProject && (
          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
          >
            {savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'נשמר בהצלחה!' : 'שמור שינויים'}</span>
          </button>
        )}
      </div>

    </header>
  );
};
