import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { useLivingPlayer } from '../context/LivingPlayerContext';
import { matchUserIntent } from '../api/voiceIntentApi';

export const LivingVoiceBubble: React.FC = () => {
  const { currentScene, transitionTo } = useLivingPlayer();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'he-IL';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setFeedbackMessage('מקשיב לך...');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (event.results[0]?.isFinal) {
          handleProcessIntent(currentText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setFeedbackMessage(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentScene]);

  const handleProcessIntent = async (text: string) => {
    if (!text.trim() || isThinking) return;
    setIsThinking(true);
    setFeedbackMessage('מנתח את בקשתך...');

    try {
      const allowed = currentScene?.allowedIntents || {};
      const result = await matchUserIntent(text, allowed, {
        sceneTitle: currentScene?.title || '',
        sceneScript: currentScene?.dialogueScript || ''
      });

      if (result.targetSceneId) {
        setFeedbackMessage(`מעביר אותך לסצנה המתאימה...`);
        setTimeout(() => {
          transitionTo(result.targetSceneId!, 'voice_intent');
          setFeedbackMessage(null);
          setTranscript('');
          setTextInput('');
          setShowTextInput(false);
        }, 800);
      } else {
        setFeedbackMessage('לא זיהינו כוונה מדויקת, נסו ללחוץ על אחת האפשרויות על המסך');
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (e) {
      setFeedbackMessage(null);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch {
        setShowTextInput(true);
      }
    }
  };

  if (currentScene?.enableVoiceTrigger === false) return null;

  return (
    <div className="absolute bottom-20 left-4 z-30 flex flex-col items-start gap-2 select-none" dir="rtl">
      
      {/* Feedback banner */}
      {(feedbackMessage || transcript) && (
        <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/40 rounded-2xl px-3.5 py-1.5 text-xs text-amber-200 shadow-xl max-w-xs animate-fade-in flex items-center gap-2">
          {isThinking ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
          <span>{transcript || feedbackMessage}</span>
        </div>
      )}

      {/* Text input drawer if open */}
      {showTextInput && (
        <form 
          onSubmit={e => { e.preventDefault(); handleProcessIntent(textInput); }}
          className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 rounded-2xl p-1.5 shadow-xl backdrop-blur-md animate-scale-up"
        >
          <input
            type="text"
            placeholder="שאלו את הפרזנטור משהו..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            className="px-3 py-1.5 text-xs bg-transparent text-white placeholder-slate-400 focus:outline-none w-48"
          />
          <button
            type="submit"
            disabled={isThinking || !textInput.trim()}
            className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Mic trigger & text toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMic}
          disabled={isThinking}
          title={isListening ? 'עצור האזנה' : 'דברו עם הפרזנטור'}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/40'
              : 'bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setShowTextInput(!showTextInput)}
          title="הקלדת שאלה בטקסט"
          className="w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-slate-300 flex items-center justify-center backdrop-blur-md text-xs cursor-pointer transition"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
