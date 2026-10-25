import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Layers
} from 'lucide-react';
import { InboxItem } from '../types';
import { sound } from '../services/soundService';
import { KosTimeAiService } from '../services/kosTimeAiService';
import { useKosTimeTenant } from '../hooks/useKosTimeTenant';
import { KosunIconButton } from './KosunIconButton';

interface SubstepDraft {
  id: string;
  title: string;
  estimatedMinutes: number;
}

interface DecomposeScreenProps {
  selectedItem: InboxItem | null;
  inboxItems: InboxItem[];
  onSelectAnotherItem: (item: InboxItem) => void;
  onSaveSubtasks: (
    inboxId: string,
    subtasks: { title: string; estimatedMinutes: number }[]
  ) => void;
  onGoToToday: () => void;
}

export const DecomposeScreen: React.FC<DecomposeScreenProps> = ({
  selectedItem,
  inboxItems,
  onSelectAnotherItem,
  onSaveSubtasks,
  onGoToToday,
}) => {
  const { tenantId } = useKosTimeTenant();
  const [taskTitle, setTaskTitle] = useState('');
  const [substeps, setSubsteps] = useState<SubstepDraft[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setTaskTitle(selectedItem.title);
      if (selectedItem.microTasks && selectedItem.microTasks.length > 0) {
        setSubsteps(
          selectedItem.microTasks.map((m, idx) => ({
            id: `sub_${idx}_${Date.now()}`,
            title: m.title,
            estimatedMinutes: m.estimatedMinutes,
          }))
        );
      } else {
        setSubsteps([
          { id: '1', title: '׳”׳’׳“׳¨׳× ׳×׳•׳¦׳¨ ׳¨׳¦׳•׳™', estimatedMinutes: 15 },
          { id: '2', title: '׳‘׳™׳¦׳•׳¢ ׳”׳©׳׳‘ ׳”׳׳¢׳©׳™', estimatedMinutes: 30 },
        ]);
      }
      setSavedSuccess(false);
    } else if (inboxItems.length > 0 && !taskTitle) {
      const firstPending = inboxItems.find((i) => !i.decomposed) || inboxItems[0];
      if (firstPending) {
        onSelectAnotherItem(firstPending);
      }
    }
  }, [selectedItem]);

  const handleAiBreakdown = async () => {
    if (!taskTitle.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    sound.playPop();

    try {
      const subtasksList = await KosTimeAiService.decomposeTask(taskTitle, taskContext, tenantId);
      const data = { subtasks: subtasksList };
      if (data.subtasks && Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        setSubsteps(
          data.subtasks.map((s: any, idx: number) => ({
            id: `ai_${idx}_${Date.now()}`,
            title: s.title,
            estimatedMinutes: Number(s.estimatedMinutes) || 20,
          }))
        );
        sound.playTaskComplete();
      } else {
        throw new Error('׳׳ ׳”׳×׳§׳‘׳׳• ׳¦׳¢׳“׳™׳ ׳׳”-AI');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('׳׳ ׳”׳¦׳׳—׳ ׳• ׳׳”׳©׳׳™׳ ׳׳× ׳”׳₪׳™׳¨׳•׳§ ׳”׳׳•׳˜׳•׳׳˜׳™.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const addCustomSubstep = () => {
    if (substeps.length >= 5) return;
    sound.playPop();
    setSubsteps([
      ...substeps,
      {
        id: `custom_${Date.now()}`,
        title: '',
        estimatedMinutes: 20,
      },
    ]);
  };

  const removeSubstep = (id: string) => {
    if (substeps.length <= 2) return;
    sound.playPop();
    setSubsteps(substeps.filter((s) => s.id !== id));
  };

  const updateSubstep = (
    id: string,
    field: 'title' | 'estimatedMinutes',
    value: any
  ) => {
    setSubsteps(
      substeps.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = () => {
    const validSteps = substeps.filter((s) => s.title.trim().length > 0);
    if (validSteps.length < 2) {
      alert('׳ ׳ ׳׳”׳–׳™׳ ׳׳₪׳—׳•׳× 2 ׳¦׳¢׳“׳™׳');
      return;
    }

    const inboxId = selectedItem ? selectedItem.id : 'manual_' + Date.now();
    onSaveSubtasks(
      inboxId,
      validSteps.map((s) => ({
        title: s.title.trim(),
        estimatedMinutes: s.estimatedMinutes,
      }))
    );

    setSavedSuccess(true);
    sound.playFanfare();
  };

  return (
    <div className="space-y-4 pb-24 text-[#F0F4FF]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#00F0FF]" />
        </div>

        <div className="flex items-center gap-2">
          <KosunIconButton
            icon={isAiLoading ? Loader2 : Sparkles}
            label="׳₪׳™׳¨׳•׳§ ׳‘-AI"
            variant="primary"
            disabled={!taskTitle.trim() || isAiLoading}
            onClick={handleAiBreakdown}
          />
        </div>
      </div>

      {/* Item selector if multiple */}
      {inboxItems.length > 1 && (
        <div className="p-2.5 bg-[#0D0E1F] rounded-2xl border border-[#1A2B4C] flex items-center justify-between">
          <select
            value={selectedItem?.id || ''}
            onChange={(e) => {
              const found = inboxItems.find((i) => i.id === e.target.value);
              if (found) onSelectAnotherItem(found);
            }}
            className="w-full bg-[#12162B] border border-[#1A2B4C] focus:border-[#00F0FF] rounded-xl px-3 py-2 text-white font-bold"
          >
            {inboxItems.map((item) => (
              <option key={item.id} value={item.id} className="bg-[#0D0E1F] text-white">
                {item.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Target Task Title */}
      <div className="p-3 bg-[#0D0E1F] rounded-3xl border border-[#1A2B4C] shadow-lg">
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="׳›׳•׳×׳¨׳×..."
          className="w-full px-5 py-3 bg-[#070913] border border-[#1A2B4C] focus:border-[#00F0FF] rounded-full text-base font-bold text-white focus:outline-none transition-all placeholder:text-[#F0F4FF]/30 text-center"
        />

        {aiError && (
          <div className="mt-2 p-2 bg-rose-950/40 border border-rose-900 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {/* Substeps Builder */}
      <div className="space-y-2.5">
        {substeps.map((sub, index) => (
          <div
            key={sub.id}
            className="p-3 bg-[#0D0E1F] rounded-2xl border border-[#1A2B4C] shadow-md flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-xl bg-[#1A2B4C] text-[#00F0FF] font-bold text-xs flex items-center justify-center shrink-0 font-['Orbitron',sans-serif]">
              0{index + 1}
            </div>

            <input
              type="text"
              value={sub.title}
              onChange={(e) => updateSubstep(sub.id, 'title', e.target.value)}
              placeholder="׳¦׳¢׳“..."
              className="flex-1 text-base text-white bg-transparent focus:outline-none"
            />

            {/* Time Toggle */}
            <div className="flex items-center gap-1 bg-[#12162B] p-1 rounded-full shrink-0 border border-[#1A2B4C]">
              {[15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => updateSubstep(sub.id, 'estimatedMinutes', mins)}
                  className={`px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    sub.estimatedMinutes === mins
                      ? 'bg-[#00F0FF] text-[#070913]'
                      : 'text-[#F0F4FF]/50 hover:text-white'
                  }`}
                >
                  {mins}׳“׳³
                </button>
              ))}
            </div>

            {/* Delete step */}
            {substeps.length > 2 && (
              <KosunIconButton
                icon={Trash2}
                label="׳׳—׳§"
                variant="ghost"
                onClick={() => removeSubstep(sub.id)}
              />
            )}
          </div>
        ))}

        {substeps.length < 5 && (
          <div className="flex justify-center pt-1">
            <KosunIconButton
              icon={Plus}
              label="׳”׳•׳¡׳£ ׳¦׳¢׳“"
              variant="secondary"
              onClick={addCustomSubstep}
            />
          </div>
        )}
      </div>

      {/* Save Action */}
      <div className="pt-2">
        {savedSuccess ? (
          <div className="p-3 bg-[#0D1F38] border border-[#00F0FF]/40 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#00F0FF] text-sm font-bold">
              <Check className="w-5 h-5 text-[#00F0FF]" />
              <span>׳ ׳©׳׳¨!</span>
            </div>
            <KosunIconButton
              icon={ArrowRight}
              label="׳”׳™׳•׳"
              variant="primary"
              onClick={onGoToToday}
            />
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={substeps.filter((s) => s.title.trim()).length < 2}
            className="w-full min-h-[48px] bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 disabled:opacity-30 text-[#070913] font-black rounded-full text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            <span>׳©׳׳•׳¨</span>
            <Check className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
