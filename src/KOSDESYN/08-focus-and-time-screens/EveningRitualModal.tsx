import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Inbox,
  Trash2,
  ArrowLeft,
  X,
  Layers,
  ArrowUp,
  ArrowDown,
  Check
} from 'lucide-react';
import { Task, InboxItem, MicroTask } from '../types';
import { sound } from '../utils/audio';
import { KosunVectorIcon } from './KosunLogo';
import { KosunIconButton } from './KosunIconButton';
import { getTerminology } from '../../KOSUN2026/factory/pageTerminologyDictionary';

interface EveningRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayTasks: Task[];
  inboxItems: InboxItem[];
  availableMicroTasks: MicroTask[];
  onToggleCompleteTodayTask: (task: Task) => void;
  onPostponeTaskToTomorrow: (task: Task) => void;
  onSendTaskToInbox: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onApplyTomorrowBig3: (selectedMicroTasks: MicroTask[]) => void;
  onOpenDecomposeForInboxItem: (item: InboxItem) => void;
  archetypeId?: string;
}

export const EveningRitualModal: React.FC<EveningRitualModalProps> = ({
  isOpen,
  onClose,
  todayTasks,
  inboxItems,
  availableMicroTasks,
  onToggleCompleteTodayTask,
  onPostponeTaskToTomorrow,
  onSendTaskToInbox,
  onDeleteTask,
  onApplyTomorrowBig3,
  onOpenDecomposeForInboxItem,
  archetypeId = 'saas',
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedTomorrow, setSelectedTomorrow] = useState<MicroTask[]>([]);
  const [customTomorrowInput, setCustomTomorrowInput] = useState('');
  const [ritualCompleted, setRitualCompleted] = useState(false);

  if (!isOpen) return null;

  const completedToday = todayTasks.filter((t) => t.completed);
  const unfinishedToday = todayTasks.filter((t) => !t.completed);

  const toggleSelectTomorrow = (m: MicroTask) => {
    sound.playPop();
    const exists = selectedTomorrow.some((item) => item.id === m.id);
    if (exists) {
      setSelectedTomorrow(selectedTomorrow.filter((item) => item.id !== m.id));
    } else {
      if (selectedTomorrow.length >= 3) {
        sound.playWarning();
        return;
      }
      setSelectedTomorrow([...selectedTomorrow, m]);
    }
  };

  const addCustomTomorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTomorrowInput.trim() || selectedTomorrow.length >= 3) return;
    const newMicro: MicroTask = {
      id: 'custom_tmrw_' + Date.now(),
      title: customTomorrowInput.trim(),
      estimatedMinutes: 25,
      scheduledFor: 'tomorrow',
      createdAt: new Date().toISOString(),
    };
    setSelectedTomorrow([...selectedTomorrow, newMicro]);
    setCustomTomorrowInput('');
    sound.playPop();
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedTomorrow.length) return;
    sound.playPop();
    const list = [...selectedTomorrow];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;
    setSelectedTomorrow(list);
  };

  const finishRitual = () => {
    onApplyTomorrowBig3(selectedTomorrow);
    setRitualCompleted(true);
    sound.playFanfare();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 text-[#F0F4FF]">
      <div className="bg-[#0D0E1F] border border-[#1A2B4C] text-[#F0F4FF] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1A2B4C] pb-3">
          <div className="flex items-center gap-3">
            <KosunVectorIcon size={32} />
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] font-mono font-bold border border-[#00F0FF]/30">
              0{currentStep}/03
            </span>
          </div>

          <KosunIconButton
            icon={X}
            label={getTerminology('quick_capture_close_btn', archetypeId)}
            variant="ghost"
            onClick={onClose}
          />
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as const).map((stepNum) => (
            <div
              key={stepNum}
              className={`text-center py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                currentStep === stepNum
                  ? 'bg-[#00F0FF] text-[#070913] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : currentStep > stepNum
                  ? 'bg-[#1A2B4C] text-[#00F0FF]'
                  : 'bg-[#070913] text-[#F0F4FF]/30 border border-[#1A2B4C]'
              }`}
            >
              0{stepNum}
            </div>
          ))}
        </div>

        {/* ================= STEP 1: REVIEW TODAY ================= */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#F0F4FF]/40">
                0/0
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {/* Completed ones */}
                {completedToday.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-[#0D1F38]/50 rounded-2xl border border-[#00F0FF]/20 flex items-center justify-between text-sm"
                  >
                    <span className="line-through text-[#F0F4FF]/50 truncate max-w-[240px]">
                      {t.title}
                    </span>
                    <Check className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  </div>
                ))}

                {/* Unfinished ones */}
                {unfinishedToday.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 bg-[#070913] rounded-2xl border border-[#1A2B4C] flex items-center justify-between gap-3"
                  >
                    <p className="text-sm font-bold text-white truncate flex-1">
                      {t.title}
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      <KosunIconButton
                        icon={Check}
                        label={getTerminology('evening_action_complete', archetypeId)}
                        variant="cyan"
                        onClick={() => {
                          sound.playPop();
                          onToggleCompleteTodayTask(t);
                        }}
                      />

                      <KosunIconButton
                        icon={Calendar}
                        label={getTerminology('evening_action_tomorrow', archetypeId)}
                        variant="secondary"
                        onClick={() => {
                          sound.playPop();
                          onPostponeTaskToTomorrow(t);
                        }}
                      />

                      <KosunIconButton
                        icon={Inbox}
                        label={getTerminology('evening_action_inbox', archetypeId)}
                        variant="secondary"
                        onClick={() => {
                          sound.playPop();
                          onSendTaskToInbox(t);
                        }}
                      />

                      <KosunIconButton
                        icon={Trash2}
                        label={getTerminology('evening_action_delete', archetypeId)}
                        variant="ghost"
                        onClick={() => {
                          sound.playPop();
                          onDeleteTask(t.id);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  sound.playPop();
                  setCurrentStep(2);
                }}
                className="min-h-[44px] px-6 py-2 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] font-black rounded-full text-sm flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)]"
              >
                <span>{getTerminology('evening_btn_next', archetypeId)}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: INBOX CLEANING ================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {inboxItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#F0F4FF]/40">
                0/0
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {inboxItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#070913] rounded-2xl border border-[#1A2B4C] flex items-center justify-between gap-3 text-sm"
                  >
                    <p className="font-bold text-white truncate flex-1">
                      {item.title}
                    </p>

                    <KosunIconButton
                      icon={Layers}
                      label={item.decomposed ? getTerminology('evening_action_edit_decompose', archetypeId) : getTerminology('evening_action_decompose', archetypeId)}
                      variant="cyan"
                      onClick={() => {
                        onClose();
                        onOpenDecomposeForInboxItem(item);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-[#1A2B4C] hover:bg-[#1A2B4C]/80 text-[#F0F4FF] rounded-full text-xs font-semibold cursor-pointer"
              >
                {getTerminology('evening_btn_back', archetypeId)}
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setCurrentStep(3);
                }}
                className="min-h-[44px] px-6 py-2 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] font-black rounded-full text-sm flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)]"
              >
                <span>{getTerminology('evening_btn_next', archetypeId)}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PICK TOMORROW'S BIG 3 ================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {ritualCompleted ? (
              <div className="p-6 text-center space-y-4 bg-[#0D1F38] border border-[#00F0FF]/40 rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-[#00F0FF] text-[#070913] flex items-center justify-center mx-auto font-black text-lg shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                  ✓
                </div>
                <button
                  onClick={onClose}
                  className="min-h-[44px] px-8 py-2.5 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] font-black rounded-full text-sm cursor-pointer shadow-md"
                >
                  {getTerminology('evening_success_close', archetypeId)}
                </button>
              </div>
            ) : (
              <>
                {/* Selected 3 preview */}
                <div className="space-y-2 p-3 bg-[#070913] rounded-3xl border border-[#1A2B4C]">
                  {[0, 1, 2].map((idx) => {
                    const item = selectedTomorrow[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-sm transition-all ${
                          item
                            ? 'bg-[#0D0E1F] border-[#00F0FF]/50 text-white'
                            : 'bg-[#0A0D1B]/40 border-dashed border-[#1A2B4C] text-[#F0F4FF]/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-[#1A2B4C] text-[#00F0FF] font-bold text-xs flex items-center justify-center shrink-0 font-['Orbitron',sans-serif]">
                            0{idx + 1}
                          </span>
                          <span className="truncate font-semibold">
                            {item ? item.title : '---'}
                          </span>
                        </div>

                        {item && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => movePriority(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-[#F0F4FF]/50 hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => movePriority(idx, 'down')}
                              disabled={idx === selectedTomorrow.length - 1}
                              className="p-1.5 text-[#F0F4FF]/50 hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleSelectTomorrow(item)}
                              className="p-1.5 text-[#F0F4FF]/50 hover:text-rose-400 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quick custom task for tomorrow */}
                <form onSubmit={addCustomTomorrow} className="flex gap-2">
                  <input
                    type="text"
                    value={customTomorrowInput}
                    onChange={(e) => setCustomTomorrowInput(e.target.value)}
                    placeholder={getTerminology('evening_task_placeholder', archetypeId)}
                    className="flex-1 px-4 py-2 bg-[#070913] border border-[#1A2B4C] rounded-full text-sm text-white placeholder:text-[#F0F4FF]/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!customTomorrowInput.trim() || selectedTomorrow.length >= 3}
                    className="px-5 py-2 bg-[#1A2B4C] hover:bg-[#1A2B4C]/80 disabled:opacity-30 text-white rounded-full text-xs font-bold cursor-pointer"
                  >
                    {getTerminology('evening_btn_add', archetypeId)}
                  </button>
                </form>

                {/* Available decomposed microtasks */}
                {availableMicroTasks.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableMicroTasks.map((m) => {
                      const isPicked = selectedTomorrow.some((it) => it.id === m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => toggleSelectTomorrow(m)}
                          className={`w-full p-2.5 rounded-2xl text-right text-xs flex items-center justify-between border transition-all cursor-pointer ${
                            isPicked
                              ? 'bg-[#0D1F38] border-[#00F0FF] text-[#00F0FF] font-bold'
                              : 'bg-[#070913] border-[#1A2B4C] text-[#F0F4FF]/80 hover:border-[#00F0FF]/40'
                          }`}
                        >
                          <span className="truncate">{m.title}</span>
                          <span className="text-[11px] text-[#00F0FF] shrink-0 font-mono">
                            {m.estimatedMinutes}ד׳
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 bg-[#1A2B4C] hover:bg-[#1A2B4C]/80 text-[#F0F4FF] rounded-full text-xs font-semibold cursor-pointer"
                  >
                    {getTerminology('evening_btn_back', archetypeId)}
                  </button>

                  <button
                    onClick={finishRitual}
                    disabled={selectedTomorrow.length === 0}
                    className="min-h-[44px] px-6 py-2 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 disabled:opacity-30 text-[#070913] font-black rounded-full text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                  >
                    <Sparkles className="w-4 h-4 text-[#070913]" />
                    <span>{getTerminology('evening_btn_finish', archetypeId)}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
