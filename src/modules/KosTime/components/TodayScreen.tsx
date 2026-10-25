import React, { useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Clock,
  Layers,
  Inbox,
  Moon,
  X,
  CornerDownLeft
} from 'lucide-react';
import { Task, MicroTask } from '../types';
import { sound } from '../services/soundService';
import { KosunIconButton } from './KosunIconButton';

interface TodayScreenProps {
  tasks: Task[];
  availableMicroTasks: MicroTask[];
  onToggleComplete: (task: Task) => void;
  onAddTask: (title: string, estimatedMinutes?: number) => void;
  onDeleteTask: (taskId: string) => void;
  onPromoteMicroTask: (microTask: MicroTask) => void;
  onOpenEveningRitual: () => void;
  onGoToInbox: () => void;
  onGoToDecompose: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  tasks,
  availableMicroTasks,
  onToggleComplete,
  onAddTask,
  onDeleteTask,
  onPromoteMicroTask,
  onOpenEveningRitual,
  onGoToInbox,
  onGoToDecompose,
}) => {
  const [activeSlotInput, setActiveSlotInput] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), estimatedMinutes);
    setNewTitle('');
    setActiveSlotInput(null);
  };

  const slots = [1, 2, 3];

  // ===== ZEN FOCUS INPUT MODE (ADHD Zero-Clutter Mode) =====
  // When an input slot is active, strictly ONLY the input field and submit/cancel appear!
  if (activeSlotInput !== null) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070913] flex flex-col justify-center items-center p-6 text-[#F0F4FF] animate-in fade-in duration-200">
        <div className="w-full max-w-lg space-y-6">
          {/* Top Cancel */}
          <div className="flex justify-between items-center">
            <span className="font-['Orbitron',sans-serif] text-sm font-bold text-[#00F0FF] tracking-wider">
              0{activeSlotInput}
            </span>
            <KosunIconButton
              icon={X}
              label="ביטול"
              variant="ghost"
              onClick={() => {
                setActiveSlotInput(null);
                setNewTitle('');
              }}
            />
          </div>

          {/* Pure Isolated Capsule Input Field */}
          <form onSubmit={handleCreateTask} className="space-y-6">
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="הקלד כאן..."
              className="w-full px-6 py-4 bg-[#0D0E1F] border-2 border-[#00F0FF] rounded-full text-lg sm:text-xl font-bold text-white focus:outline-none shadow-[0_0_25px_rgba(0,240,255,0.35)] placeholder:text-[#F0F4FF]/30 text-center"
            />

            {/* Time Selector Pills */}
            <div className="flex items-center justify-center gap-3">
              {[15, 25, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setEstimatedMinutes(mins)}
                  className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                    estimatedMinutes === mins
                      ? 'bg-[#00F0FF] text-[#070913] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'bg-[#12162B] text-[#F0F4FF]/70 hover:text-white border border-[#1A2B4C]'
                  }`}
                >
                  {mins} דק׳
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="min-h-[50px] px-8 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 disabled:opacity-30 text-[#070913] font-black rounded-full text-base flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              >
                <span>שמור</span>
                <CornerDownLeft className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ===== STANDARD VIEW (ADHD Zero-Clutter & Icon-Based) =====
  return (
    <div className="space-y-5 pb-24 text-[#F0F4FF]">
      {/* Top Bar: Pure Minimal Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-['Orbitron',sans-serif] text-lg font-black text-white">
            TOP 3
          </span>
          <span className="text-xs font-mono font-bold text-[#00F0FF] bg-[#00F0FF]/15 px-2.5 py-0.5 rounded-full border border-[#00F0FF]/30">
            {completedCount}/{tasks.length}
          </span>
        </div>

        {/* Action Icons with 1st-click Tooltip, 2nd-click Execute */}
        <div className="flex items-center gap-2">
          <KosunIconButton
            icon={Inbox}
            label="תיק נכסים"
            variant="secondary"
            onClick={onGoToInbox}
          />

          <KosunIconButton
            icon={Layers}
            label="מעבדת פירוק"
            variant="secondary"
            onClick={onGoToDecompose}
          />

          <KosunIconButton
            icon={Moon}
            label="טקס ערב"
            variant="primary"
            onClick={onOpenEveningRitual}
          />
        </div>
      </div>

      {/* The 3 Slots (Pure Focus, No Distractions) */}
      <div className="space-y-3.5">
        {slots.map((slotNum) => {
          const task = tasks[slotNum - 1];

          if (task) {
            return (
              <div
                key={task.id}
                className={`group relative rounded-3xl p-5 border transition-all duration-300 ${
                  task.completed
                    ? 'bg-[#0A0D1B]/80 border-[#1A2B4C] text-[#F0F4FF]/40'
                    : 'bg-[#0D0E1F] border-[#1A2B4C] hover:border-[#00F0FF]/50 shadow-[0_4px_16px_rgba(0,0,0,0.4)] text-[#F0F4FF]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Large Check Trigger */}
                  <button
                    onClick={() => onToggleComplete(task)}
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-[#00F0FF] border-[#00F0FF] text-[#070913] shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                        : 'border-[#1A2B4C] hover:border-[#00F0FF] bg-[#12162B] text-transparent'
                    }`}
                    aria-label="סמן כהושלם"
                  >
                    <Check className="w-5 h-5 stroke-[3.5]" />
                  </button>

                  {/* Rank Badge */}
                  <div className="w-8 h-8 rounded-xl bg-[#1A2B4C] text-[#00F0FF] font-bold text-sm flex items-center justify-center shrink-0 font-['Orbitron',sans-serif]">
                    0{slotNum}
                  </div>

                  {/* Task Title */}
                  <div className="flex-1 min-w-0 pr-1">
                    <p
                      className={`text-base sm:text-lg font-bold leading-relaxed break-words ${
                        task.completed ? 'line-through text-[#F0F4FF]/40' : 'text-[#F0F4FF]'
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.estimatedMinutes && (
                      <span className="flex items-center gap-1.5 text-xs text-[#F0F4FF]/50 mt-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>{task.estimatedMinutes} דק׳</span>
                      </span>
                    )}
                  </div>

                  {/* Delete Icon (1st click tooltip, 2nd click delete) */}
                  <KosunIconButton
                    icon={Trash2}
                    label="מחק משימה"
                    variant="ghost"
                    onClick={() => {
                      sound.playPop();
                      onDeleteTask(task.id);
                    }}
                  />
                </div>
              </div>
            );
          }

          // Empty Slot (Zero clutter: No "ריקה" text, just 01/02/03 and Add Icon Button)
          return (
            <div
              key={`empty-slot-${slotNum}`}
              className="rounded-3xl border border-dashed border-[#1A2B4C] bg-[#0A0D1B]/40 p-4.5 flex items-center justify-between"
            >
              <div className="w-8 h-8 rounded-xl bg-[#1A2B4C] text-[#F0F4FF]/40 font-bold text-xs flex items-center justify-center font-['Orbitron',sans-serif]">
                0{slotNum}
              </div>

              {/* Add Task Icon Button (1st click tooltip, 2nd click opens isolated input) */}
              <KosunIconButton
                icon={Plus}
                label="הוסף משימה"
                variant="cyan"
                onClick={() => {
                  sound.playPop();
                  setActiveSlotInput(slotNum);
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Available Micro-tasks pool (No filler titles, only clean items) */}
      {availableMicroTasks.length > 0 && tasks.length < 3 && (
        <div className="p-3 bg-[#0D0E1F] rounded-3xl border border-[#1A2B4C] space-y-2">
          <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-[#00F0FF]">
            <Layers className="w-4 h-4" />
          </div>

          <div className="space-y-2">
            {availableMicroTasks.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#12162B] border border-[#1A2B4C]"
              >
                <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                  {m.title}
                </span>

                <KosunIconButton
                  icon={Plus}
                  label="שבץ להיום"
                  variant="primary"
                  onClick={() => onPromoteMicroTask(m)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
