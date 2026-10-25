import React, { useState } from 'react';
import {
  Plus,
  Layers,
  Trash2,
  ArrowUpRight,
  Sparkles,
  X,
  CornerDownLeft,
  Inbox
} from 'lucide-react';
import { InboxItem } from '../types';
import { sound } from '../services/soundService';
import { VoiceInputButton } from './VoiceInputButton';
import { KosunIconButton } from './KosunIconButton';

interface InboxScreenProps {
  items: InboxItem[];
  onAddItem: (title: string, note?: string) => void;
  onDeleteItem: (id: string) => void;
  onSelectForDecomposition: (item: InboxItem) => void;
  onPromoteToToday: (title: string) => void;
  onOpenBrainstorm?: () => void;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onSelectForDecomposition,
  onPromoteToToday,
  onOpenBrainstorm,
}) => {
  const [isInputMode, setIsInputMode] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem(newTitle.trim());
    setNewTitle('');
    setIsInputMode(false);
  };

  // ===== ZEN FOCUS INPUT MODE (ADHD Zero-Clutter Mode) =====
  // Strictly ONLY the input field and submit/cancel appear!
  if (isInputMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070913] flex flex-col justify-center items-center p-6 text-[#F0F4FF] animate-in fade-in duration-200">
        <div className="w-full max-w-lg space-y-6">
          <div className="flex justify-end">
            <KosunIconButton
              icon={X}
              label="ביטול"
              variant="ghost"
              onClick={() => {
                setIsInputMode(false);
                setNewTitle('');
              }}
            />
          </div>

          <form onSubmit={handleAdd} className="space-y-6">
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="רעיון חדש..."
              className="w-full px-7 py-4.5 bg-[#0D0E1F] border-2 border-[#00F0FF] rounded-full text-lg sm:text-xl font-bold text-white placeholder:text-[#F0F4FF]/30 focus:outline-none shadow-[0_0_25px_rgba(0,240,255,0.35)] text-center transition-all"
            />

            <div className="flex items-center justify-center gap-4">
              <VoiceInputButton
                onTranscribed={(spokenText) => {
                  setNewTitle((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
                }}
                className="border-2 border-[#00F0FF]/50 bg-[#12162B] text-[#00F0FF] hover:bg-[#00F0FF]/20 p-4 rounded-full min-h-[48px] min-w-[48px]"
              />

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="min-h-[48px] px-8 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 disabled:opacity-30 text-[#070913] font-black rounded-full text-base flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
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
      {/* Top Bar with Add and AI Icons */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Inbox className="w-6 h-6 text-[#00F0FF]" />
          <span className="text-xs font-mono font-bold text-[#00F0FF] bg-[#00F0FF]/15 px-2.5 py-0.5 rounded-full border border-[#00F0FF]/30">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBrainstorm && (
            <KosunIconButton
              icon={Sparkles}
              label="בוט AI"
              variant="cyan"
              onClick={onOpenBrainstorm}
            />
          )}

          <KosunIconButton
            icon={Plus}
            label="הוסף לתיק"
            variant="primary"
            onClick={() => {
              sound.playPop();
              setIsInputMode(true);
            }}
          />
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center opacity-40">
            <Inbox className="w-12 h-12 text-[#1A2B4C] mb-2 stroke-[1.5]" />
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#0D0E1F] rounded-3xl border border-[#1A2B4C] hover:border-[#00F0FF]/40 transition-all flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-base font-bold text-white leading-snug break-words">
                  {item.title}
                </p>
                {item.decomposed && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00F0FF] mt-1">
                    <Layers className="w-3 h-3" />
                    <span>פורק</span>
                  </span>
                )}
              </div>

              {/* Action Icons: 1st click shows tooltip, 2nd click executes */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Promote to Today */}
                <KosunIconButton
                  icon={ArrowUpRight}
                  label="העבר להיום"
                  variant="cyan"
                  onClick={() => {
                    sound.playPop();
                    onPromoteToToday(item.title);
                    onDeleteItem(item.id);
                  }}
                />

                {/* Decompose in Lab */}
                <KosunIconButton
                  icon={Layers}
                  label="פרק במעבדה"
                  variant="secondary"
                  onClick={() => {
                    sound.playPop();
                    onSelectForDecomposition(item);
                  }}
                />

                {/* Delete */}
                <KosunIconButton
                  icon={Trash2}
                  label="מחק"
                  variant="ghost"
                  onClick={() => {
                    sound.playPop();
                    onDeleteItem(item.id);
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
