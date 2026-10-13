import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';

export interface KosunInputWithVoiceProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onVoiceResult?: (text: string) => void;
}

/**
 * KosunInputWithVoice: Input field with speech-to-text dictation.
 * Enforces strict KOSUN rule:
 * Stopping ONLY by manual click on the icon (never auto-stopping on silence/pause).
 */
export const KosunInputWithVoice: React.FC<KosunInputWithVoiceProps> = ({
  label,
  value,
  onChange,
  onVoiceResult,
  placeholder,
  className = '',
  ...props
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  const stopRecording = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Speech recognition stop error:', err);
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('זיהוי דיבור בדפדפן אינו נתמך במכשיר זה ישירות.');
      return;
    }

    isManuallyStoppedRef.current = false;
    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.continuous = true; // Never stop on silence!
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript && onChange) {
        const syntheticEvent = {
          target: { value: finalTranscript },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      if (finalTranscript && onVoiceResult) {
        onVoiceResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[KosunInputWithVoice] speech error:', event.error);
      if (event.error === 'not-allowed') {
        alert('יש לאפשר גישה למיקרופון עבור הקראה קולית');
        stopRecording();
      }
    };

    recognition.onend = () => {
      // RULE: Stop ONLY when user explicitly clicked the button!
      // If recognition ended naturally due to pause/silence, restart it automatically!
      if (!isManuallyStoppedRef.current) {
        try {
          recognition.start();
        } catch {
          setIsRecording(false);
        }
      } else {
        setIsRecording(false);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  }, [onChange, onVoiceResult, stopRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        isManuallyStoppedRef.current = true;
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-3.5 pl-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-sm transition ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={toggleRecording}
          className={`absolute left-2.5 p-2 rounded-lg transition flex items-center justify-center cursor-pointer ${
            isRecording
              ? 'text-red-500 bg-red-50 dark:bg-red-950/40 animate-pulse'
              : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={
            isRecording
              ? 'עצור הקראה קולית (עצירה ידנית בלבד)'
              : 'הקראה קולית (לחץ להתחלת הקראה)'
          }
          aria-label="Voice dictation toggle"
        >
          {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default KosunInputWithVoice;
