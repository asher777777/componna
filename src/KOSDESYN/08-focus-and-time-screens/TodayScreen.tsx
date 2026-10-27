import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Clock,
  Layers,
  Inbox,
  Moon,
  X,
  CornerDownLeft,
  Sparkles,
} from 'lucide-react';
import { Task, MicroTask } from '../types';
import { sound } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
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

const SLOT_DYNAMIC_PLACEHOLDERS: Record<number, string[]> = {
  1: [
    'נכס זמן ראשי: המשימה הכי חשובה להיום...',
    'מהו המהלך האחד שיעשה את היום למנצח?',
    'סגירת עסקה, פיתוח תוצר או התקדמות קריטית...',
    'הדבר שהכי מקדם אותך אבל הכי נדחה...',
    'הגדרת מיקוד עליון (Deep Work)...',
  ],
  2: [
    'נכס זמן משני: משימת מומנטום שניה...',
    'פגישה קריטית, סגירת פער או מסירה...',
    'התקדמות ביעד אסטרטגי שני...',
    'פירוק משימה מורכבת לצעד ממוקד...',
    'משימת מפתח לחיזוק ההישג היומי...',
  ],
  3: [
    'נכס זמן משלים: צעד מדויק לסגירת היום...',
    'סגירת קצוות, סידור נכסים או בדיקה...',
    'משימה קצרה וממוקדת שמביאה שלווה...',
    'ניקוי שולחן והכנת קרקע למחר...',
    'תחזוקה מהירה שתסגור יום מושלם...',
  ],
};

const DynamicSlotPlaceholder: React.FC<{ slotNum: number; isDark: boolean }> = ({
  slotNum,
  isDark,
}) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const placeholders = SLOT_DYNAMIC_PLACEHOLDERS[slotNum] || SLOT_DYNAMIC_PLACEHOLDERS[1];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % placeholders.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <span
      className={`text-sm sm:text-base font-medium truncate select-none transition-opacity duration-300 ${
        fade ? 'opacity-65' : 'opacity-0'
      } ${isDark ? 'text-[#F0F4FF]/70' : 'text-[#0A0D18]/70'}`}
    >
      {placeholders[index]}
    </span>
  );
};

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
  const { isDark } = useTheme();
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
    const slotPlaceholders =
      SLOT_DYNAMIC_PLACEHOLDERS[activeSlotInput] || SLOT_DYNAMIC_PLACEHOLDERS[1];
    const currentPlaceholder = slotPlaceholders[0];

    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col justify-center items-center p-6 transition-colors duration-200 animate-in fade-in ${
          isDark ? 'bg-[#070913] text-[#F0F4FF]' : 'bg-[#F4F6FB] text-[#0A0D18]'
        }`}
      >
        <div className="w-full max-w-lg space-y-6">
          {/* Top Cancel */}
          <div className="flex justify-between items-center">
            <span className="font-['Orbitron',sans-serif] text-sm font-bold text-[#00F0FF] tracking-wider">
              0{activeSlotInput} · KOSTIME
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
            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={currentPlaceholder}
                className={`w-full px-6 py-4 border-2 rounded-full text-lg sm:text-xl font-bold focus:outline-none transition-all text-center ${
                  isDark
                    ? 'bg-[#0D0E1F] border-[#00F0FF] text-white shadow-[0_0_25px_rgba(0,240,255,0.35)] placeholder:text-[#F0F4FF]/35'
                    : 'bg-white border-[#00B4D8] text-[#0A0D18] shadow-[0_0_20px_rgba(0,180,216,0.25)] placeholder:text-[#0A0D18]/40'
                }`}
              />

              {/* Dynamic suggestion chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {slotPlaceholders.slice(1, 4).map((hint, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewTitle(hint.replace(/\.\.\.$/, ''))}
                    className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-[#12162B] border-[#1A2B4C] text-[#F0F4FF]/60 hover:text-[#00F0FF] hover:border-[#00F0FF]/50'
                        : 'bg-white border-[#CBD5E1] text-[#0A0D18]/70 hover:text-[#007A8A] hover:border-[#00B4D8]'
                    }`}
                  >
                    {hint.length > 30 ? hint.slice(0, 30) + '...' : hint}
                  </button>
                ))}
              </div>
            </div>

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
                      : isDark
                      ? 'bg-[#12162B] text-[#F0F4FF]/70 hover:text-white border border-[#1A2B4C]'
                      : 'bg-white text-[#0A0D18]/70 hover:text-black border border-[#CBD5E1]'
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
    <div
      className={`space-y-5 pb-24 transition-colors duration-200 ${
        isDark ? 'text-[#F0F4FF]' : 'text-[#0A0D18]'
      }`}
    >
      {/* Top Bar: Pure Minimal Header - KOSTIME instead of TOP 3 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className={`font-['Orbitron',sans-serif] text-lg font-black tracking-wider ${
              isDark ? 'text-white' : 'text-[#0A0D18]'
            }`}
          >
            KOSTIME
          </span>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
              isDark
                ? 'text-[#00F0FF] bg-[#00F0FF]/15 border-[#00F0FF]/30'
                : 'text-[#007A8A] bg-[#00F0FF]/20 border-[#00F0FF]/50'
            }`}
          >
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
                    ? isDark
                      ? 'bg-[#0A0D1B]/80 border-[#1A2B4C] text-[#F0F4FF]/40'
                      : 'bg-stone-100 border-[#CBD5E1] text-stone-400'
                    : isDark
                    ? 'bg-[#0D0E1F] border-[#1A2B4C] hover:border-[#00F0FF]/50 shadow-[0_4px_16px_rgba(0,0,0,0.4)] text-[#F0F4FF]'
                    : 'bg-white border-[#CBD5E1] hover:border-[#00B4D8] shadow-xs text-[#0A0D18]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Large Check Trigger */}
                  <button
                    onClick={() => onToggleComplete(task)}
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-[#00F0FF] border-[#00F0FF] text-[#070913] shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                        : isDark
                        ? 'border-[#1A2B4C] hover:border-[#00F0FF] bg-[#12162B] text-transparent'
                        : 'border-[#CBD5E1] hover:border-[#00B4D8] bg-[#F1F5F9] text-transparent'
                    }`}
                    aria-label="סמן כהושלם"
                  >
                    <Check className="w-5 h-5 stroke-[3.5]" />
                  </button>

                  {/* Rank Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 font-['Orbitron',sans-serif] ${
                      isDark
                        ? 'bg-[#1A2B4C] text-[#00F0FF]'
                        : 'bg-[#E0F7FA] text-[#007A8A]'
                    }`}
                  >
                    0{slotNum}
                  </div>

                  {/* Task Title */}
                  <div className="flex-1 min-w-0 pr-1">
                    <p
                      className={`text-base sm:text-lg font-bold leading-relaxed break-words ${
                        task.completed
                          ? isDark
                            ? 'line-through text-[#F0F4FF]/40'
                            : 'line-through text-stone-400'
                          : isDark
                          ? 'text-[#F0F4FF]'
                          : 'text-[#0A0D18]'
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.estimatedMinutes && (
                      <span
                        className={`flex items-center gap-1.5 text-xs mt-1 font-mono ${
                          isDark ? 'text-[#F0F4FF]/50' : 'text-[#0A0D18]/50'
                        }`}
                      >
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

          // Empty Slot: Clickable card with Dynamic Placeholders!
          return (
            <div
              key={`empty-slot-${slotNum}`}
              onClick={() => {
                sound.playPop();
                setActiveSlotInput(slotNum);
              }}
              className={`group rounded-3xl border border-dashed p-4.5 flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 ${
                isDark
                  ? 'border-[#1A2B4C] bg-[#0A0D1B]/40 hover:border-[#00F0FF]/60 hover:bg-[#0D1F38]/30 shadow-inner'
                  : 'border-[#CBD5E1] bg-white/60 hover:border-[#00B4D8] hover:bg-white shadow-xs'
              }`}
            >
              {/* Right side in RTL: Slot number badge + Dynamic Placeholder prompt */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 font-['Orbitron',sans-serif] transition-colors ${
                    isDark
                      ? 'bg-[#1A2B4C] text-[#F0F4FF]/50 group-hover:text-[#00F0FF] group-hover:border group-hover:border-[#00F0FF]/40'
                      : 'bg-[#E2E8F0] text-stone-600 group-hover:text-[#007A8A]'
                  }`}
                >
                  0{slotNum}
                </div>

                {/* Dynamic cycling placeholder text */}
                <DynamicSlotPlaceholder slotNum={slotNum} isDark={isDark} />
              </div>

              {/* Left side in RTL: Add Task Icon Button */}
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
        <div
          className={`p-3 rounded-3xl border space-y-2 ${
            isDark
              ? 'bg-[#0D0E1F] border-[#1A2B4C]'
              : 'bg-white border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-[#00F0FF]">
            <Layers className="w-4 h-4" />
          </div>

          <div className="space-y-2">
            {availableMicroTasks.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className={`flex items-center justify-between p-3 rounded-2xl border ${
                  isDark
                    ? 'bg-[#12162B] border-[#1A2B4C]'
                    : 'bg-[#F8FAFC] border-[#CBD5E1]'
                }`}
              >
                <span
                  className={`text-sm font-semibold truncate max-w-[200px] ${
                    isDark ? 'text-white' : 'text-[#0A0D18]'
                  }`}
                >
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
