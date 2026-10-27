import React from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useAudioRecorder } from '../utils/useAudioRecorder';
import { sound } from '../utils/audio';

interface VoiceInputButtonProps {
  onTranscribed: (text: string) => void;
  className?: string;
  buttonLabel?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscribed,
  className = '',
  buttonLabel,
}) => {
  const {
    isRecording,
    isTranscribing,
    recordingDuration,
    error,
    startRecording,
    stopRecordingAndTranscribe,
    cancelRecording,
  } = useAudioRecorder();

  const handleToggle = async () => {
    sound.playPop();
    if (!isRecording) {
      await startRecording();
    } else {
      const text = await stopRecordingAndTranscribe();
      if (text && text.trim()) {
        sound.playTaskComplete();
        onTranscribed(text.trim());
      }
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative inline-flex items-center">
      {isRecording ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl animate-pulse">
          <button
            type="button"
            onClick={handleToggle}
            className="flex items-center gap-1.5 text-rose-700 text-xs font-bold cursor-pointer"
            title="עצור ותמלל"
          >
            <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
            <span>סיום ({formatDuration(recordingDuration)})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              cancelRecording();
            }}
            className="text-[10px] text-stone-400 hover:text-stone-700 underline cursor-pointer mr-1"
          >
            ביטול
          </button>
        </div>
      ) : isTranscribing ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
          <span>מתמלל בקול...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          title="הקלטת קול ותמלול אוטומטי"
          className={`p-2 rounded-xl text-stone-500 hover:text-amber-700 hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${className}`}
        >
          <Mic className="w-4 h-4" />
          {buttonLabel && <span className="text-xs font-medium">{buttonLabel}</span>}
        </button>
      )}

      {error && (
        <div className="absolute top-full mt-1 right-0 z-50 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 p-2 rounded-lg shadow-md whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};
