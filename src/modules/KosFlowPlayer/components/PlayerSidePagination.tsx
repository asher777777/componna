import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Video,
  Mic,
  Layers,
  ArrowRightCircle,
  Sliders,
  Sparkles,
  ListOrdered,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { FlowNodeState } from '../types';

export const PlayerSidePagination: React.FC<{
  onOpenStudio?: (nodeId?: string) => void;
  className?: string;
}> = ({ onOpenStudio, className = '' }) => {
  const { campaign, currentNodeId, jumpToNode, playerMode } = usePlayerMachine();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // In live mode, side pagination is hidden completely
  if (playerMode === 'live') {
    return null;
  }

  const nodes = Object.values(campaign?.states || {});
  const currentIndex = nodes.findIndex((n) => n.id === currentNodeId);
  const currentNode = campaign?.states?.[currentNodeId];

  const handlePrevStep = () => {
    if (currentIndex > 0) {
      jumpToNode(nodes[currentIndex - 1].id);
    }
  };

  const handleNextStep = () => {
    if (currentIndex < nodes.length - 1) {
      jumpToNode(nodes[currentIndex + 1].id);
    }
  };

  return (
    <div
      className={`transition-all duration-300 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-yellow-500/40 rounded-3xl shadow-2xl overflow-hidden select-none text-slate-200 ${
        isExpanded ? 'w-full lg:w-72 max-h-[85vh]' : 'w-full lg:w-14'
      } ${className}`}
      dir="rtl"
    >
      {/* Header Bar */}
      <div className="p-3.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse truncate">
          <div className="w-7 h-7 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 flex-shrink-0">
            <ListOrdered className="w-4 h-4" />
          </div>
          {isExpanded && (
            <div className="truncate">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>פגינציית עריכה</span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.2 rounded border border-yellow-500/30">
                  {currentIndex + 1}/{nodes.length}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">קפיצה מהירה ובדיקת צמתים</div>
            </div>
          )}
        </div>

        {/* Expand / Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors flex-shrink-0 cursor-pointer"
          title={isExpanded ? 'כווץ סרגל' : 'הרחב סרגל'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Stepper Quick Navigation Buttons */}
      {isExpanded && (
        <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-1.5">
          <button
            onClick={handlePrevStep}
            disabled={currentIndex <= 0}
            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-center space-x-1 rtl:space-x-reverse transition-all cursor-pointer font-medium"
            title="קפוץ לצומת הקודם"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>הקודם</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentIndex >= nodes.length - 1}
            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-center space-x-1 rtl:space-x-reverse transition-all cursor-pointer font-medium"
            title="קפוץ לצומת הבא"
          >
            <span>הבא</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {onOpenStudio && (
            <button
              onClick={() => onOpenStudio(currentNodeId)}
              className="p-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/40 text-xs transition-all cursor-pointer"
              title="פתח צומת נוכחי לעריכה בסטודיו"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Nodes / Scenes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {nodes.map((node: FlowNodeState, idx: number) => {
          const isActive = node.id === currentNodeId;
          const hasVideo = !!node.videoUrl;
          const hasMic = (node.micPosition || 'center') !== 'hidden';
          const hasCards = (node.overlays?.length || 0) > 0;
          const hasAutoTransition = !!node.autoTransitionTarget;

          if (!isExpanded) {
            return (
              <button
                key={node.id}
                onClick={() => jumpToNode(node.id)}
                className={`w-10 h-10 mx-auto rounded-2xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105 ring-2 ring-yellow-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
                title={`${idx + 1}. ${node.name}`}
              >
                {idx + 1}
              </button>
            );
          }

          return (
            <div
              key={node.id}
              onClick={() => jumpToNode(node.id)}
              className={`p-2.5 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/80 text-white shadow-lg shadow-yellow-500/10'
                  : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse truncate">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black flex-shrink-0 ${
                      isActive
                        ? 'bg-yellow-500 text-black ring-2 ring-yellow-300 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-xs truncate">{node.name}</span>
                </div>

                {isActive && (
                  <span className="text-[9px] bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-black" />
                    <span>פעיל</span>
                  </span>
                )}
              </div>

              {/* Node Indicators Badge Row */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] ${
                      hasVideo
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                        : 'bg-red-950/80 text-red-400 border border-red-800/40'
                    }`}
                    title={hasVideo ? 'וידאו מחובר' : 'חסר וידאו'}
                  >
                    <Video className="w-2.5 h-2.5" />
                    <span>{hasVideo ? 'וידאו' : 'אין וידאו'}</span>
                  </span>

                  {hasMic && (
                    <span
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/40"
                      title="מיקרופון/טריגר קולי מוגדר"
                    >
                      <Mic className="w-2.5 h-2.5" />
                      <span>מיק</span>
                    </span>
                  )}

                  {hasCards && (
                    <span
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-purple-950/80 text-purple-300 border border-purple-800/40"
                      title="כרטיסיות / קרוסלה"
                    >
                      <Layers className="w-2.5 h-2.5" />
                      <span>כרטיסים</span>
                    </span>
                  )}

                  {hasAutoTransition && (
                    <span
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-950/80 text-amber-300 border border-amber-800/40"
                      title="מעבר אוטומטי מוגדר"
                    >
                      <ArrowRightCircle className="w-2.5 h-2.5" />
                      <span>אוטומטי</span>
                    </span>
                  )}
                </div>

                {onOpenStudio && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenStudio(node.id);
                    }}
                    className="p-1 text-slate-400 hover:text-yellow-400 hover:bg-yellow-950/40 rounded transition-colors"
                    title="ערוך צומת זה בסטודיו"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Quick Add Node */}
      {isExpanded && onOpenStudio && (
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onOpenStudio()}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 text-xs font-bold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border border-yellow-500/30 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ניהול סרטונים וצמתים בסטודיו</span>
          </button>
        </div>
      )}
    </div>
  );
};
