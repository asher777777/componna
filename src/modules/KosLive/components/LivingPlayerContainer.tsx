import React, { useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Minimize2,
  Smartphone,
  Monitor,
  Square,
  Subtitles,
  Activity,
  Video,
  Sliders,
  Edit3,
  Eye,
  Save,
  Check,
  Plus,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Mic,
  Layers,
  ArrowRightCircle,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useLivingPlayer, LivingPlayerProvider } from '../context/LivingPlayerContext';
import { LivingVideoLayer } from './LivingVideoLayer';
import { LivingOverlayManager } from './LivingOverlayManager';
import { LivingVoiceBubble } from './LivingVoiceBubble';
import { InteractiveSceneStudioModal } from './InteractiveSceneStudioModal';
import { AspectRatioType, LivingCampaignContract, LivingSceneContract } from '../types';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { LivingStorageService } from '../services/livingStorageService';

interface LivingPlayerContainerProps {
  campaignId?: string;
  initialCampaign?: LivingCampaignContract;
  aspectRatio?: AspectRatioType;
  className?: string;
  embedMode?: boolean;
  onCampaignUpdated?: (updatedCampaign: LivingCampaignContract) => void;
}

const LivingPlayerInner: React.FC<{
  initialAspectRatio?: AspectRatioType;
  className?: string;
  embedMode?: boolean;
}> = ({ initialAspectRatio = '9:16', className = '', embedMode = false }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const {
    campaign,
    currentScene,
    currentSceneId,
    isPlaying,
    isMuted,
    playerMode,
    telemetryEvents,
    togglePlay,
    toggleMute,
    setPlayerMode,
    transitionTo,
    resetSession,
    updateCampaign
  } = useLivingPlayer();

  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(
    initialAspectRatio || campaign.aspectRatio || '9:16'
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);
  const [isPaginationExpanded, setIsPaginationExpanded] = useState<boolean>(true);

  // Interactive Scene Studio Modal state
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [studioTargetSceneId, setStudioTargetSceneId] = useState<string | undefined>(undefined);
  const [isSavingCampaign, setIsSavingCampaign] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const isLive = embedMode || playerMode === 'live';
  const sceneList = Object.values(campaign.scenes || {});
  const currentIndex = sceneList.findIndex(s => s.id === currentSceneId || s.id === currentScene?.id);

  const handleOpenStudio = (sceneId?: string) => {
    setStudioTargetSceneId(sceneId || currentSceneId);
    setIsStudioOpen(true);
  };

  const handleSaveCampaignToCloud = async () => {
    setIsSavingCampaign(true);
    try {
      await LivingStorageService.saveCampaign(db as any, tenantId, campaign);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.warn('[LivingPlayerContainer] Save campaign warning:', err);
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const handlePrevStep = () => {
    if (currentIndex > 0) {
      transitionTo(sceneList[currentIndex - 1].id, 'side_stepper_prev');
    }
  };

  const handleNextStep = () => {
    if (currentIndex < sceneList.length - 1) {
      transitionTo(sceneList[currentIndex + 1].id, 'side_stepper_next');
    }
  };

  const getAspectClass = () => {
    if (isFullscreen) return 'w-full h-full rounded-none border-0';
    switch (aspectRatio) {
      case '16:9':
        return 'w-full max-w-4xl aspect-video rounded-3xl border-4 border-slate-800';
      case '1:1':
        return 'w-full max-w-[480px] aspect-square rounded-3xl border-4 border-slate-800';
      case '9:16':
      default:
        return 'w-full max-w-[410px] aspect-[9/16] rounded-3xl border-4 border-slate-800';
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full select-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black p-0' : className
      }`}
      dir="rtl"
    >
      {/* Top Studio Header Bar (Visible in Edit Mode) */}
      {!isLive && !isFullscreen && (
        <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2.5 mb-3 px-2 text-slate-300 text-xs">
          {/* Right Side: Campaign Info & Edit/Live Mode Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 font-bold text-white truncate bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="truncate max-w-[180px] sm:max-w-xs">{campaign.name}</span>
              {campaign.slug && (
                <span
                  className="hidden md:inline text-[10px] text-amber-300/80 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                  dir="ltr"
                >
                  /{campaign.slug}
                </span>
              )}
            </div>

            {/* Mode Switcher: מצב עריכה vs מצב לייב */}
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-full p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => setPlayerMode('edit')}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow transition cursor-pointer"
                title="מצב עריכה: הצגת פגינציית סצנות, סטודיו סרטונים ותמונות ודיבאגר"
              >
                <Edit3 className="w-3 h-3" />
                <span>מצב עריכה</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerMode('live')}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="מצב לייב: חוויית משתמש קצה חלקה ומלאה"
              >
                <Eye className="w-3 h-3" />
                <span>מצב לייב</span>
              </button>
            </div>
          </div>

          {/* Left Side: Studio Scene & Media Builder Button + Save + Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900/95 border border-slate-800 rounded-full px-2.5 py-1 shadow-lg flex-wrap">
            {/* Prominent Studio Video & Images Modal Button */}
            <button
              type="button"
              onClick={() => handleOpenStudio(currentSceneId)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow transition cursor-pointer active:scale-95"
              title="פתח סטודיו יצירת סצנות, העלאת וידאו ותמונות מהגלריה והגדרת כרטיסים"
            >
              <Video className="w-3.5 h-3.5" />
              <span>סטודיו סצנות, וידאו ותמונות</span>
            </button>

            {/* Save Campaign Button */}
            <button
              type="button"
              onClick={handleSaveCampaignToCloud}
              disabled={isSavingCampaign}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition shadow cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>נשמר!</span>
                </>
              ) : isSavingCampaign ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>שומר...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>שמור שינויים</span>
                </>
              )}
            </button>

            <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

            {/* Aspect Ratio Switcher */}
            <button
              type="button"
              onClick={() => {
                if (aspectRatio === '9:16') setAspectRatio('16:9');
                else if (aspectRatio === '16:9') setAspectRatio('1:1');
                else setAspectRatio('9:16');
              }}
              title={`יחס תצוגה: ${aspectRatio} (לחץ להחלפה)`}
              className="p-1.5 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
            >
              {aspectRatio === '9:16' ? (
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              ) : aspectRatio === '16:9' ? (
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Mute / Unmute */}
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'הפעל שמע' : 'השתק שמע'}
              className="p-1.5 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? 'השהה' : 'נגן'}
              className="p-1.5 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {/* Reset Flow */}
            <button
              type="button"
              onClick={resetSession}
              title="התחל תהליך מחדש"
              className="p-1.5 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Subtle Bar in Live Mode */}
      {isLive && !embedMode && !isFullscreen && (
        <div className="mb-2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1 text-xs text-slate-300 shadow-xl">
          <button
            type="button"
            onClick={() => setPlayerMode('edit')}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>חזרה למצב עריכה וסטודיו סצנות</span>
          </button>
        </div>
      )}

      {/* Main Stage Area: Side Stepper Pagination + Smart Interactive Player */}
      <div
        className={`w-full max-w-6xl flex flex-col ${
          !isLive && !isFullscreen ? 'lg:flex-row' : ''
        } items-center justify-center gap-4`}
      >
        {/* In Edit Mode: Full Side Stepper Pagination (PlayerSidePagination from flow-player-engine) */}
        {!isLive && !isFullscreen && (
          <div className="w-full lg:w-auto flex-shrink-0 flex justify-center order-2 lg:order-1">
            <div
              className={`transition-all duration-300 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden select-none text-slate-200 ${
                isPaginationExpanded ? 'w-full lg:w-72 max-h-[82vh]' : 'w-full lg:w-14'
              }`}
              dir="rtl"
            >
              {/* Side Pagination Header */}
              <div className="p-3.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <ListOrdered className="w-4 h-4" />
                  </div>
                  {isPaginationExpanded && (
                    <div className="truncate">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>פגינציית סצנות</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                          {Math.max(1, currentIndex + 1)}/{sceneList.length}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">קפיצה מהירה ועריכת וידאו ותמונות</div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPaginationExpanded(!isPaginationExpanded)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition cursor-pointer shrink-0"
                  title={isPaginationExpanded ? 'כווץ סרגל' : 'הרחב סרגל'}
                >
                  {isPaginationExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Prev / Next / Open Studio Quick Bar */}
              {isPaginationExpanded && (
                <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentIndex <= 0}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>הקודם</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={currentIndex >= sceneList.length - 1}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer font-medium"
                  >
                    <span>הבא</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenStudio(currentSceneId)}
                    className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs transition cursor-pointer"
                    title="פתח סצנה נוכחית לעריכת וידאו, תמונות וכרטיסיות בסטודיו"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Scenes List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[420px]">
                {sceneList.map((scene: LivingSceneContract, idx: number) => {
                  const isActive = scene.id === currentSceneId || scene.id === currentScene?.id;
                  const hasVideo = !!scene.videoUrl;
                  const hasImage = !!scene.fallbackImageUrl;
                  const hasMic =
                    scene.enableVoiceTrigger !== false &&
                    (scene.micPosition || 'center') !== 'hidden';
                  const hasCards =
                    (scene.overlays?.find(o => o.type === 'carousel')?.cards?.length ||
                      scene.overlays?.find(o => o.type === 'carousel')?.carouselItems?.length ||
                      0) > 0;
                  const hasAutoTransition = !!scene.autoTransitionTargetSceneId;

                  if (!isPaginationExpanded) {
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => transitionTo(scene.id, 'side_stepper')}
                        className={`w-10 h-10 mx-auto rounded-2xl flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-300'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                        title={`${idx + 1}. ${scene.title}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  }

                  return (
                    <div
                      key={scene.id}
                      onClick={() => transitionTo(scene.id, 'side_stepper')}
                      className={`p-2.5 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/80 text-white shadow-lg'
                          : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black shrink-0 ${
                              isActive
                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs truncate">{scene.title}</span>
                        </div>

                        {isActive && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>פעיל</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/50">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] ${
                              hasVideo
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
                            }`}
                          >
                            <Video className="w-2.5 h-2.5" />
                            <span>{hasVideo ? 'וידאו' : 'אין וידאו'}</span>
                          </span>

                          {hasImage && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-sky-950/80 text-sky-300 border border-sky-800/40">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>תמונה</span>
                            </span>
                          )}

                          {hasMic && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                              <Mic className="w-2.5 h-2.5" />
                              <span>מיק</span>
                            </span>
                          )}

                          {hasCards && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-purple-950/80 text-purple-300 border border-purple-800/40">
                              <Layers className="w-2.5 h-2.5" />
                              <span>כרטיסים</span>
                            </span>
                          )}

                          {hasAutoTransition && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-950/80 text-amber-300 border border-amber-800/40">
                              <ArrowRightCircle className="w-2.5 h-2.5" />
                              <span>אוטומטי</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenStudio(scene.id);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-400 hover:bg-amber-950/40 rounded transition cursor-pointer"
                          title="ערוך סצנה זו בסטודיו (וידאו, תמונות וכרטיסיות)"
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer: Open Full Scene & Video Studio */}
              {isPaginationExpanded && (
                <div className="p-2.5 bg-slate-950/80 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenStudio(currentSceneId)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 border border-amber-500/40 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ניהול סרטונים, תמונות וצמתים בסטודיו</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Smart Interactive Player Frame */}
        <div
          className={`relative overflow-hidden shadow-2xl bg-black transition-all duration-300 order-1 lg:order-2 flex-shrink-0 ${getAspectClass()}`}
        >
          {/* Video & Subtitles Playback Layer */}
          <LivingVideoLayer showSubtitles={showSubtitles} />

          {/* Interactive Overlays Layer (Capsule Carousel, Forms, Quick Replies) */}
          <LivingOverlayManager />

          {/* Voice AI Conversational Bubble */}
          <LivingVoiceBubble />

          {/* Top Floating Controls Bar inside Player */}
          <div className="absolute top-3.5 left-3.5 right-3.5 z-30 flex items-center justify-between pointer-events-auto">
            <div className="bg-black/65 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] text-white max-w-[55%]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold truncate">
                {currentScene?.title || campaign.name || 'עמוד חי'}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-black/65 backdrop-blur-md border border-white/15 rounded-full p-1 text-white">
              {!embedMode && (
                <button
                  type="button"
                  onClick={() => handleOpenStudio(currentSceneId)}
                  className="px-2.5 h-7 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 transition cursor-pointer"
                  title="ערוך סצנה, וידאו, תמונות וכרטיסים בסטודיו"
                >
                  <Sliders className="w-3 h-3" />
                  <span>ערוך סצנה</span>
                </button>
              )}

              <button
                onClick={togglePlay}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                title={isPlaying ? 'השהה' : 'נגן'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={toggleMute}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                title={isMuted ? 'בטל השתקה' : 'השתק'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer ${
                  showSubtitles ? 'text-amber-400' : 'text-slate-400'
                }`}
                title="כתוביות (CC)"
              >
                <Subtitles className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={resetSession}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                title="התחל מחדש"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {!embedMode && (
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                  title={isFullscreen ? 'צא ממסך מלא' : 'מסך מלא'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Aspect Ratio Switcher & Telemetry Inspector (Studio Mode) */}
      {!embedMode && !isFullscreen && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-3 mt-3">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl text-xs text-slate-400">
            <span className="text-[11px] font-bold">תצוגה:</span>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                aspectRatio === '9:16' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>מובייל (9:16)</span>
            </button>
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                aspectRatio === '16:9' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>מחשב (16:9)</span>
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                aspectRatio === '1:1' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              <Square className="w-3 h-3" />
              <span>ריבוע (1:1)</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                showTelemetry ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>טלמטריה ואירועים ({telemetryEvents.length})</span>
            </button>
          </div>

          {showTelemetry && (
            <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3 text-right max-h-44 overflow-y-auto space-y-1.5">
              <div className="text-[11px] font-black text-amber-400 mb-1">
                יומן אירועים חי (מעברי סצנות, הקלקות כרטיסים, כוונות קול וטפסים):
              </div>
              {telemetryEvents.length === 0 ? (
                <p className="text-[11px] text-slate-500">טרם נרשמו אינטראקציות בסשן הנוכחי.</p>
              ) : (
                telemetryEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between text-[11px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800/80"
                  >
                    <span className="text-slate-200 font-medium">{ev.detail}</span>
                    <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                      {ev.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Scene, Video, Images & Cards Studio Modal */}
      {!embedMode && (
        <InteractiveSceneStudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          campaign={campaign}
          currentSceneId={currentSceneId}
          initialSceneId={studioTargetSceneId}
          onApplyCampaign={(updatedCamp, targetId) => {
            updateCampaign(updatedCamp, targetId);
          }}
        />
      )}
    </div>
  );
};

export const LivingPlayerContainer: React.FC<LivingPlayerContainerProps> = ({
  campaignId,
  initialCampaign,
  aspectRatio,
  className = '',
  embedMode = false,
  onCampaignUpdated
}) => {
  return (
    <LivingPlayerProvider
      initialCampaign={initialCampaign}
      campaignIdOrSlug={campaignId}
      onCampaignUpdated={onCampaignUpdated}
    >
      <LivingPlayerInner
        initialAspectRatio={aspectRatio}
        className={className}
        embedMode={embedMode}
      />
    </LivingPlayerProvider>
  );
};
