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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" dir="rtl">
      
      {/* Studio Top Navigation Bar */}
      <header className="px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left/Title side */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                SDO Video Producer & AI Avatar Studio
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                v1.0 HeyGen v3
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              הפקת וידאו חכמה, אווטארים מדברים ותסריטי AI מסונכרנים לגלריית המדיה
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setTab('wizard')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              tab === 'wizard'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>אשף תסריט (AI Wizard)</span>
          </button>

          <button
            onClick={() => setTab('editor')}
            disabled={!activeProject}
            className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 ${
              tab === 'editor'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>עורך ציר זמן (Studio)</span>
          </button>

          <button
            onClick={() => setTab('projects')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              tab === 'projects'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>פרויקטים שמורים</span>
          </button>
        </div>

        {/* Status Indicators & Connector Trigger */}
        <div className="flex items-center gap-2">
          {/* HeyGen Key Status */}
          <button
            onClick={openConnectorModal}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
              isHeyGenConfigured
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
            title="הגדרות מפתחות API וחיבור DB"
          >
            <Key className="w-3 h-3" />
            <span>HeyGen: {isHeyGenConfigured ? 'מחובר' : 'לא הוגדר'}</span>
          </button>

          {/* Gemini Key Status */}
          <button
            onClick={openConnectorModal}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
              isGeminiConfigured
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
            }`}
            title="הגדרות מפתחות API וחיבור DB"
          >
            <Sparkles className="w-3 h-3" />
            <span>Gemini: {isGeminiConfigured ? 'פעיל' : 'חסר'}</span>
          </button>
        </div>

      </header>

      {/* Last Cost Report Badge (if available) */}
      {lastCostReport && (
        <div className="px-6 py-2 bg-purple-950/40 border-b border-purple-500/20 text-xs text-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{lastCostReport.formattedSummary}</span>
          </div>
          <span className="text-[10px] text-purple-400 font-mono">
            {lastCostReport.promptTokens + lastCostReport.candidatesTokens} טוקנים סה"כ
          </span>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1">
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
