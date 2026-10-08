import React from 'react';
import { 
  Film, Sparkles, Wand2, FolderKanban, Play, User, 
  Layers, Database, Settings2, Key, CheckCircle2, AlertCircle
} from 'lucide-react';
import { VideoStudioProvider, useVideoStudio } from './context/VideoStudioContext';
import { BrainstormWizardView } from './components/BrainstormWizardView';
import { SceneTimelineEditor } from './components/SceneTimelineEditor';
import { ProjectListView } from './components/ProjectListView';
import { HeyGenAvatarModal } from './components/HeyGenAvatarModal';
import { TeleprompterModal } from './components/TeleprompterModal';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';

const VideoStudioContent: React.FC = () => {
  const { tab, setTab, activeProject, lastCostReport } = useVideoStudio();
  const { apiKeys, openConnectorModal } = useSystemConnection();

  const isHeyGenConfigured = !!apiKeys.heygenApiKey;
  const isGeminiConfigured = !!apiKeys.googleAiApiKey;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" dir="rtl">
      
      {/* Studio Top Navigation Bar - Kosun 2026 Style */}
      <header className="px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Left/Title side */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                הסטודיו של קושאן
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              יצירת סרטונים ואווטארים חכמים, מהר ובקלות.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          <button
            onClick={() => setTab('projects')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              tab === 'projects'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>פרויקטים</span>
          </button>

          <button
            onClick={() => setTab('wizard')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              tab === 'wizard'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>אשף AI</span>
          </button>

          <button
            onClick={() => setTab('editor')}
            disabled={!activeProject}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 ${
              tab === 'editor'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>עורך וידאו</span>
          </button>
        </div>

        {/* Status Indicators & Connector Trigger */}
        <div className="flex items-center gap-2">
          {/* HeyGen Key Status */}
          <button
            onClick={openConnectorModal}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              isHeyGenConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title="חיבור HeyGen"
          >
            <Key className="w-3 h-3" />
            <span className="hidden sm:inline">{isHeyGenConfigured ? 'HeyGen מחובר' : 'HeyGen חסר'}</span>
          </button>

          {/* Gemini Key Status */}
          <button
            onClick={openConnectorModal}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              isGeminiConfigured
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title="חיבור AI"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">{isGeminiConfigured ? 'AI פעיל' : 'AI חסר'}</span>
          </button>
        </div>

      </header>

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col">
        {tab === 'wizard' && <BrainstormWizardView />}
        {tab === 'editor' && <SceneTimelineEditor />}
        {tab === 'projects' && <ProjectListView />}
      </main>

      {/* Global Modals */}
      <HeyGenAvatarModal />
      <TeleprompterModal />
    </div>
  );
};

export const VideoProducerStudioView: React.FC = () => {
  return (
    <VideoStudioProvider>
      <VideoStudioContent />
    </VideoStudioProvider>
  );
};

export default VideoProducerStudioView;
