import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  Monitor,
  Video,
  Share2,
  Sliders,
  Eye,
  Edit3,
  Globe,
  Maximize2,
  Minimize2,
  Square,
  Sparkles,
  Save,
  Check,
  Plus,
  FolderKanban,
  Loader2,
} from 'lucide-react';
import { VideoLayer } from './VideoLayer';
import { UiOverlayManager } from './UiOverlayManager';
import { VoiceRecorderInteraction } from './VoiceRecorderInteraction';
import { TelemetryDebugger } from './TelemetryDebugger';
import { CampaignStudioModal } from './CampaignStudioModal';
import { PublishCampaignModal } from './PublishCampaignModal';
import { PlayerSidePagination } from './PlayerSidePagination';
import { NewProjectModal } from './NewProjectModal';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { useFlowPlayerModule } from '../context/ModuleContext';
import { FirestoreService } from '../services/firestoreService';
import { AspectRatioType, CampaignConfig } from '../types';

export const PlayerContainer: React.FC<{
  className?: string;
  onOpenProjectsTab?: () => void;
  onNewProjectCreated?: (campaign: CampaignConfig) => void;
}> = ({ className = '', onOpenProjectsTab, onNewProjectCreated }) => {
  const { db, collections } = useFlowPlayerModule();
  const {
    campaign,
    isPlaying,
    isMuted,
    playerMode,
    setPlayerMode,
    togglePlay,
    toggleMute,
    resetSession,
    updateCampaign,
  } = usePlayerMachine();

  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(
    campaign.settings?.defaultAspectRatio || '9:16'
  );
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [studioTargetNodeId, setStudioTargetNodeId] = useState<string | undefined>();
  const [isPublishOpen, setIsPublishOpen] = useState<boolean>(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSavingProject, setIsSavingProject] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const isLive = playerMode === 'live';

  const handleSaveProject = async () => {
    setIsSavingProject(true);
    try {
      await FirestoreService.saveCampaignConfig(db as any, collections, campaign);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.warn('[PlayerContainer] Save project warning:', err);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleOpenStudio = (nodeId?: string) => {
    setStudioTargetNodeId(nodeId);
    setIsStudioOpen(true);
  };

  const getContainerStyle = () => {
    if (isFullscreen) {
      return 'w-full h-full rounded-none border-0 shadow-none';
    }

    switch (aspectRatio) {
      case '9:16':
        return 'w-full max-w-[400px] sm:max-w-[420px] aspect-[9/16] shadow-2xl rounded-3xl border-4 border-slate-800';
      case '16:9':
        return 'w-full max-w-4xl aspect-[16/9] shadow-2xl rounded-2xl border-4 border-slate-800';
      case '1:1':
        return 'w-full max-w-[480px] aspect-square shadow-2xl rounded-2xl border-4 border-slate-800';
      case 'auto':
      default:
        return 'w-full h-[85vh] rounded-2xl border-4 border-slate-800';
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 sm:p-4 w-full select-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black p-0' : ''
      } ${className}`}
      dir="rtl"
    >
      {/* Top Header Controls Bar (Visible only in Edit Mode) */}
      {!isLive && (
        <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2.5 mb-3 px-2 text-slate-300 text-xs">
          {/* Left Side: Campaign Info & Mode Switcher */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse flex-wrap gap-2">
            {/* Live Status Indicator & Name */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse font-semibold text-white truncate bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="truncate max-w-[160px] sm:max-w-xs">{campaign.name}</span>
              {campaign.slug && (
                <span className="hidden md:inline text-[10px] text-yellow-300/80 font-mono bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                  /{campaign.slug}
                </span>
              )}
            </div>

            {/* Mode Switcher: Edit Mode vs. Live Mode */}
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-full p-0.5 shadow-inner">
              <button
                onClick={() => setPlayerMode('edit')}
                className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow transition-all cursor-pointer"
                title="מצב עריכה: הצגת פגינציית צעדים, עורך סטודיו ודיבאגר"
              >
                <Edit3 className="w-3 h-3" />
                <span>מצב עריכה</span>
              </button>

              <button
                onClick={() => setPlayerMode('live')}
                className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                title="מצב ריצה בלייב: חוויית משתמש קצה חלקה ומלאה"
              >
                <Eye className="w-3 h-3" />
                <span>מצב לייב</span>
              </button>
            </div>
          </div>

          {/* Right Side: Action Controls & Publish Button */}
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-slate-900/95 border border-slate-800 rounded-full px-2.5 py-1 shadow-lg flex-wrap">
            {/* Save Current Project Button */}
            <button
              onClick={handleSaveProject}
              disabled={isSavingProject}
              className={`flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1 rounded-full text-xs font-bold transition-all shadow cursor-pointer active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white border border-emerald-500/40'
              }`}
              title="שמור פרויקט וסנכרן ל-Firestore ול-LocalStorage"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>נשמר!</span>
                </>
              ) : isSavingProject ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>שומר...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>שמור פרויקט</span>
                </>
              )}
            </button>

            {/* New Project Button */}
            <button
              onClick={() => setIsNewProjectOpen(true)}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
              title="הקם פרויקט אינטראקטיבי חדש"
            >
              <Plus className="w-3.5 h-3.5 text-yellow-400" />
              <span>פרויקט חדש</span>
            </button>

            {/* Open Projects Hub Button */}
            {onOpenProjectsTab && (
              <button
                onClick={onOpenProjectsTab}
                className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
                title="עבור למרכז הפרויקטים שלי"
              >
                <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">כל הפרויקטים</span>
              </button>
            )}

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            {/* Publish Campaign Button */}
            <button
              onClick={() => setIsPublishOpen(true)}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-500/30 hover:from-yellow-500/50 hover:to-amber-500/50 text-yellow-300 hover:text-white border border-yellow-500/50 text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
              title="פרסם תהליך והגדר Slug ייחודי"
            >
              <Globe className="w-3.5 h-3.5 text-yellow-400" />
              <span>פרסם תהליך</span>
            </button>

            {/* Studio Video Upload Modal Button */}
            <button
              onClick={() => handleOpenStudio()}
              title="סטודיו סרטונים וניהול זרימה"
              className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-yellow-300 hover:text-white border border-slate-700 text-[11px] transition-all font-medium cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden md:inline">סטודיו</span>
            </button>

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            {/* Aspect Ratio Switcher */}
            {!isFullscreen && (
              <button
                onClick={() => {
                  if (aspectRatio === '9:16') setAspectRatio('16:9');
                  else if (aspectRatio === '16:9') setAspectRatio('1:1');
                  else setAspectRatio('9:16');
                }}
                title={`יחס תצוגה נוכחי: ${aspectRatio}. לחץ להחלפה`}
                className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                {aspectRatio === '9:16' ? (
                  <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                ) : aspectRatio === '16:9' ? (
                  <Monitor className="w-3.5 h-3.5 text-yellow-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-yellow-400" />
                )}
              </button>
            )}

            {/* Sound Mute Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'הפעל שמע' : 'השתק שמע'}
              className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              title={isPlaying ? 'השהה סרטון' : 'הפעל סרטון'}
              className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-slate-300" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {/* Reset Flow */}
            <button
              onClick={resetSession}
              title="התחל תהליך מחדש מתחילתו"
              className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'צא ממסך מלא' : 'מסך מלא'}
              className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Subtle Bar in Live Mode */}
      {isLive && (
        <div className="absolute top-3 right-3 z-40 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-2.5 py-1 text-xs text-slate-300 shadow-xl">
          <button
            onClick={toggleMute}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'הפעל שמע' : 'השתק'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
          <button
            onClick={resetSession}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="התחל מחדש"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPlayerMode('edit')}
            className="p-1 text-slate-400 hover:text-yellow-400 transition-colors border-r border-slate-700 pr-1.5"
            title="חזרה למצב עריכה"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Interactive Stage Area */}
      <div
        className={`w-full max-w-6xl flex flex-col ${
          !isLive ? 'lg:flex-row' : ''
        } items-center justify-center gap-4`}
      >
        {/* In Edit Mode: Side Stepper Pagination */}
        {!isLive && !isFullscreen && (
          <div className="w-full lg:w-auto flex-shrink-0 flex justify-center order-2 lg:order-1">
            <PlayerSidePagination onOpenStudio={handleOpenStudio} />
          </div>
        )}

        {/* Viewport Box (The Smart Player) */}
        <div
          className={`relative overflow-hidden bg-slate-950 transition-all duration-300 order-1 lg:order-2 flex-shrink-0 ${getContainerStyle()}`}
        >
          {/* Z-0: Video Engine with Zero Black Screen Handshake */}
          <VideoLayer />

          {/* Z-10: Interactive UI Overlays (Cards, Products, Quick Replies, Forms) */}
          <UiOverlayManager />

          {/* Z-20: Voice Interaction, Listening Waveform & Golden Mic */}
          <VoiceRecorderInteraction />
        </div>
      </div>

      {/* Development Debugger (Visible only in Edit Mode) */}
      {!isLive && !isFullscreen && <TelemetryDebugger />}

      {/* Video Upload & Campaign Studio Modal */}
      <CampaignStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        initialNodeId={studioTargetNodeId}
      />

      {/* Publish Flow & Custom Slug Modal */}
      <PublishCampaignModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onProjectCreated={(newCamp) => {
          updateCampaign(newCamp);
          if (onNewProjectCreated) {
            onNewProjectCreated(newCamp);
          }
        }}
      />
    </div>
  );
};