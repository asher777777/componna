import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { sound } from '../utils/audio';
import { getTerminology } from '../../KOSUN2026/factory/pageTerminologyDictionary';

interface PureFocusInputModalProps {
  isOpen: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  multiline?: boolean;
  onSave: (value: string) => void;
  onClose: () => void;
  archetypeId?: string;
}

/**
 * ADHD Pure Focus Modal:
 * "כאשר יש מסך קלט רק השדה קלט מופיע וכל שאר הדברים לא מופעים"
 * When this modal is open, everything in the background is darkened and hidden,
 * leaving ONLY the clean input field and minimal save/cancel controls.
 */
export const PureFocusInputModal: React.FC<PureFocusInputModalProps> = ({
  isOpen,
  title,
  initialValue,
  placeholder,
  multiline = false,
  onSave,
  onClose,
  archetypeId = 'saas',
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!value.trim()) return;
    sound.playTaskComplete();
    onSave(value.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070913]/96 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="w-full max-w-lg flex flex-col items-center space-y-6">
        {/* Minimal Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#F0F4FF] tracking-wide text-center">
          {title}
        </h2>

        {/* The Isolated Pure Input Field */}
        <div className="w-full relative">
          {multiline ? (
            <textarea
              ref={inputRef as any}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || getTerminology('pure_focus_placeholder', archetypeId)}
              rows={5}
              className="w-full p-5 rounded-3xl bg-[#0D0E1F] border-2 border-[#00F0FF]/60 focus:border-[#00F0FF] text-lg sm:text-xl font-medium text-[#F0F4FF] placeholder-[#F0F4FF]/30 outline-none shadow-[0_0_25px_rgba(0,240,255,0.2)] resize-none transition-all"
            />
          ) : (
            <input
              ref={inputRef as any}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || getTerminology('pure_focus_placeholder', archetypeId)}
              className="w-full min-h-[64px] px-6 rounded-full bg-[#0D0E1F] border-2 border-[#00F0FF]/60 focus:border-[#00F0FF] text-xl font-semibold text-[#F0F4FF] placeholder-[#F0F4FF]/30 outline-none shadow-[0_0_25px_rgba(0,240,255,0.2)] transition-all"
            />
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-[#1A2B4C]/60 hover:bg-[#1A2B4C] border border-[#1A2B4C] text-[#F0F4FF]/70 hover:text-[#F0F4FF] flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title={getTerminology('pure_focus_cancel_tooltip', archetypeId)}
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!value.trim()}
            className="h-14 px-8 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#0077E6] text-[#070913] font-bold text-lg flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] disabled:opacity-40 transition-all cursor-pointer active:scale-95"
            title={getTerminology('pure_focus_save_btn', archetypeId)}
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>{getTerminology('pure_focus_save_btn', archetypeId)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
