import React, { useState } from 'react';
import { Search, Mic, MicOff, Sparkles, ArrowRight } from 'lucide-react';

interface KosunTopNavHelperProps {
  score: number;
  isAiProcessing?: boolean;
  onCommand?: (command: string) => void;
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const KosunTopNavHelper: React.FC<KosunTopNavHelperProps> = ({
  score,
  isAiProcessing = false,
  onCommand,
  title = 'מרכז שליטה Brand DNA',
  onBack,
  showBack = false,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onCommand) {
      onCommand(query.trim());
      setQuery('');
    }
  };

  const toggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('דפדפן זה אינו תומך בזיהוי קולי (STT)');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'he-IL';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        if (onCommand) {
          onCommand(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // SVG circular gauge calculation (radius = 16, circumference = 2 * PI * 16 ~ 100.53)
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div
      dir="rtl"
      className="w-full bg-[#0D0E1F]/95 backdrop-blur-xl border border-[#1A2B4C] rounded-2xl px-3.5 py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex items-center justify-between gap-3"
    >
      {/* Right side: Back button (if inside sub-window) + Title & Circular Score */}
      <div className="flex items-center gap-2.5 shrink-0">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-[#12162B] hover:bg-[#1A2B4C] text-[#00F0FF] border border-[#1A2B4C] flex items-center justify-center cursor-pointer transition active:scale-95"
            title="חזרה לחלון הראשי"
          >
            <ArrowRight size={18} />
          </button>
        )}

        {/* Circular Progress Gauge with pulsing loading animation */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r={radius}
              className="text-[#1A2B4C]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              className={`text-[#00F0FF] transition-all duration-700 ease-out ${
                isAiProcessing ? 'animate-pulse' : ''
              }`}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black text-[#F0F4FF] tracking-tighter">
              {score}%
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#F0F4FF] tracking-wide flex items-center gap-1.5">
            {title}
            {isAiProcessing && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]" />
              </span>
            )}
          </span>
          <span className="text-[10px] text-[#00F0FF] font-medium tracking-tight">
            שלמות DNA מותג
          </span>
        </div>
      </div>

      {/* Center & Left: Universal Text & Voice Input Helper */}
      <form onSubmit={handleSubmit} className="relative flex-1 max-w-sm">
        <div className="relative flex items-center">
          <Search className="absolute right-3 w-4 h-4 text-[#F0F4FF]/40 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש מהיר או פקודת AI..."
            className="w-full bg-[#070913]/90 text-[#F0F4FF] placeholder-[#F0F4FF]/40 text-xs py-2 pr-9 pl-9 rounded-xl border border-[#1A2B4C] focus:border-[#00F0FF] focus:outline-none focus:ring-1 focus:ring-[#00F0FF] transition-all"
          />
          <button
            type="button"
            onClick={toggleMic}
            className={`absolute left-1.5 p-1.5 rounded-lg cursor-pointer transition ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_10px_#f43f5e]'
                : 'text-[#00F0FF] hover:bg-[#00F0FF]/15'
            }`}
            title={isListening ? 'הקשבה פעילה (לחץ לעצירה)' : 'הפעלה קולית (STT)'}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        </div>
      </form>
    </div>
  );
};
