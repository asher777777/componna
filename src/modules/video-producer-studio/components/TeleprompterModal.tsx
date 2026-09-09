import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Mic, MicOff, Volume2 } from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';

export const TeleprompterModal: React.FC = () => {
  const {
    isTeleprompterOpen,
    closeTeleprompter,
    modalTargetSceneId,
    activeProject,
    updateCurrentScene
  } = useVideoStudio();

  if (!isTeleprompterOpen || !modalTargetSceneId || !activeProject) return null;

  const targetScene = activeProject.scenes.find(s => s.id === modalTargetSceneId);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(targetScene?.renderedAudioUrl || null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scrolling loop
  useEffect(() => {
    let animationFrame: number;
    const scrollStep = () => {
      if (isScrolling && scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed * 0.5;
      }
      animationFrame = requestAnimationFrame(scrollStep);
    };

    if (isScrolling) {
      animationFrame = requestAnimationFrame(scrollStep);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isScrolling, scrollSpeed]);

  const handleResetScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setIsScrolling(false);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        updateCurrentScene(modalTargetSceneId, { renderedAudioUrl: url });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsScrolling(true);
    } catch (err) {
      alert('לא ניתן לגשת למיקרופון: ' + err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsScrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-lg" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-3xl h-[85vh] overflow-hidden flex flex-col text-right text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-white">
              טלפרומפטר והקלטת קול - {targetScene?.title}
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              <span>מהירות:</span>
              <input
                type="range"
                min="1"
                max="5"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="w-16 accent-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              <span>גודל גופן:</span>
              <button
                onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
                className="px-1.5 py-0.5 bg-slate-800 rounded font-bold hover:text-white"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
                className="px-1.5 py-0.5 bg-slate-800 rounded font-bold hover:text-white"
              >
                A+
              </button>
            </div>

            <button
              onClick={closeTeleprompter}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Teleprompter Scrolling Body */}
        <div
          ref={scrollRef}
          className="flex-1 p-8 sm:p-12 overflow-y-auto bg-black flex flex-col items-center justify-start text-center space-y-6 select-none"
        >
          <div className="h-16" />
          <p
            style={{ fontSize: `${fontSize}px` }}
            className="text-white font-bold leading-relaxed max-w-2xl text-center"
          >
            {targetScene?.dialogueScript || 'אין טקסט קריינות בסצנה זו.'}
          </p>
          <div className="h-48" />
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScrolling(!isScrolling)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {isScrolling ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{isScrolling ? 'השהה גלילה' : 'הפעל גלילה'}</span>
            </button>

            <button
              onClick={handleResetScroll}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="חזור להתחלה"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {recordedAudioUrl && (
              <audio src={recordedAudioUrl} controls className="h-8 max-w-[200px]" />
            )}

            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>התחל הקלטה קולית</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-5 py-2 bg-slate-800 border border-rose-500 text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <MicOff className="w-4 h-4" />
                <span>עצור ושמור הקלטה</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
