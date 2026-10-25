import React, { useState } from 'react';
import { AlertCircle, ArrowLeftRight, CalendarClock, Inbox, X, Check } from 'lucide-react';
import { Task } from '../types';
import { sound } from '../services/soundService';

interface RuleOf3WarningModalProps {
  attemptedTask: {
    title: string;
    estimatedMinutes?: number;
    originInboxId?: string;
  } | null;
  currentTasks: Task[];
  onClose: () => void;
  onReplaceTask: (oldTaskId: string, newTitle: string, estimatedMinutes?: number) => void;
  onPostponeToTomorrow: (title: string, estimatedMinutes?: number) => void;
  onSaveToInbox: (title: string) => void;
}

export const RuleOf3WarningModal: React.FC<RuleOf3WarningModalProps> = ({
  attemptedTask,
  currentTasks,
  onClose,
  onReplaceTask,
  onPostponeToTomorrow,
  onSaveToInbox,
}) => {
  const [selectedTaskToReplace, setSelectedTaskToReplace] = useState<string | null>(null);

  if (!attemptedTask) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070913]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 text-[#F0F4FF]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0D0E1F] rounded-3xl p-6 shadow-2xl border border-[#BD00FF]/50 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-[#F0F4FF]/50 hover:text-white hover:bg-[#1A2B4C] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#BD00FF]/20 text-[#BD00FF] border border-[#BD00FF]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(189,0,255,0.3)]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white leading-tight font-['Orbitron',sans-serif]">
              חוק ה-3 הקדוש: אין מקום לנכס 4!
            </h3>
            <p className="text-xs text-[#F0F4FF]/70 mt-0.5">
              המיקוד היומי מוגבל ל-3 נכסי מפתח בלבד כדי להבטיח ביצוע מושלם.
            </p>
          </div>
        </div>

        {/* Attempted task display */}
        <div className="p-3.5 bg-[#12162B] border border-[#1A2B4C] rounded-2xl mb-5">
          <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider block mb-1">
            המשימה שניסית להוסיף:
          </span>
          <p className="text-base font-bold text-white">
            "{attemptedTask.title}"
          </p>
        </div>

        <div className="space-y-4">
          {/* Action 1: Replace existing task */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-[#00F0FF]" />
              <span>אפשרות א': החלף אחד מ-3 הנכסים הקיימים (הישן יחזור לתיק)</span>
            </label>

            <div className="space-y-2">
              {currentTasks.map((t) => {
                const isSelected = selectedTaskToReplace === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      sound.playPop();
                      setSelectedTaskToReplace(t.id);
                    }}
                    className={`w-full text-right p-3 rounded-2xl text-sm flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-white font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                        : 'border-[#1A2B4C] hover:border-[#1A2B4C]/80 bg-[#070913] text-[#F0F4FF]/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-6 h-6 rounded-lg bg-[#1A2B4C] text-[#00F0FF] font-bold flex items-center justify-center text-xs shrink-0 font-['Orbitron',sans-serif]">
                        0{t.priorityIndex}
                      </span>
                      <span className="truncate">{t.title}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#00F0FF] shrink-0 mr-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedTaskToReplace && (
              <button
                onClick={() => {
                  onReplaceTask(
                    selectedTaskToReplace,
                    attemptedTask.title,
                    attemptedTask.estimatedMinutes
                  );
                }}
                className="w-full min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] rounded-full text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)]"
              >
                <span>החלף עכשיו והעבר את המוחלף לתיק</span>
              </button>
            )}
          </div>

          <div className="border-t border-[#1A2B4C] pt-3.5 space-y-2.5">
            <span className="text-xs font-bold text-[#F0F4FF]/50 block">
              או בחר פתרון חלופי:
            </span>

            {/* Action 2: Postpone to tomorrow */}
            <button
              onClick={() => {
                sound.playPop();
                onPostponeToTomorrow(
                  attemptedTask.title,
                  attemptedTask.estimatedMinutes
                );
                onClose();
              }}
              className="w-full text-right p-3.5 rounded-2xl border border-[#1A2B4C] hover:border-[#00F0FF]/40 bg-[#070913] flex items-center gap-3 text-xs sm:text-sm text-[#F0F4FF]/80 transition-all cursor-pointer"
            >
              <CalendarClock className="w-5 h-5 text-[#00F0FF] shrink-0" />
              <div>
                <span className="font-bold block text-white">
                  דחה למחר
                </span>
                <span className="text-xs text-[#F0F4FF]/60">
                  נשבץ אותו בטקס נעילת הערב כחלק מ-3 הנכסים של מחר
                </span>
              </div>
            </button>

            {/* Action 3: Save to Inbox */}
            <button
              onClick={() => {
                sound.playPop();
                onSaveToInbox(attemptedTask.title);
                onClose();
              }}
              className="w-full text-right p-3.5 rounded-2xl border border-[#1A2B4C] hover:border-[#00F0FF]/40 bg-[#070913] flex items-center gap-3 text-xs sm:text-sm text-[#F0F4FF]/80 transition-all cursor-pointer"
            >
              <Inbox className="w-5 h-5 text-[#00F0FF] shrink-0" />
              <div>
                <span className="font-bold block text-white">
                  שמור בתיק הנכסים
                </span>
                <span className="text-xs text-[#F0F4FF]/60">
                  שמור כרעיון גולמי ונפרק אותו בהמשך במעבדה
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
