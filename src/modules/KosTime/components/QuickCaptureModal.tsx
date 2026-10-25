import React, { useState, useEffect, useRef } from 'react';
import { X, CornerDownLeft } from 'lucide-react';
import { sound } from '../services/soundService';
import { VoiceInputButton } from './VoiceInputButton';
import { KosunIconButton } from './KosunIconButton';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToInbox: (title: string, note?: string) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onSaveToInbox,
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    sound.playPop();
    onSaveToInbox(cleanTitle);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070913]/95 backdrop-blur-lg flex flex-col justify-center items-center p-6 text-[#F0F4FF] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Cancel Icon */}
        <div className="flex justify-end">
          <KosunIconButton
            icon={X}
            label="סגור"
            variant="ghost"
            onClick={onClose}
          />
        </div>

        {/* Pure Single-Field Input (Zero Distractions for ADHD) */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="כתוב או הקלט..."
              className="w-full px-7 py-4.5 bg-[#0D0E1F] border-2 border-[#00F0FF] rounded-full text-lg sm:text-xl font-bold text-white placeholder:text-[#F0F4FF]/30 focus:outline-none shadow-[0_0_30px_rgba(0,240,255,0.4)] text-center transition-all"
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            {/* Integrated Voice Input Button */}
            <VoiceInputButton
              onTranscribed={(spokenText) => {
                setTitle((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
              }}
              className="border-2 border-[#00F0FF]/50 bg-[#12162B] text-[#00F0FF] hover:bg-[#00F0FF]/20 p-4 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.3)] min-h-[48px] min-w-[48px]"
            />

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!title.trim()}
              className="min-h-[48px] px-8 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 disabled:opacity-30 text-[#070913] rounded-full text-base font-black flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
            >
              <span>שמור</span>
              <CornerDownLeft className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
