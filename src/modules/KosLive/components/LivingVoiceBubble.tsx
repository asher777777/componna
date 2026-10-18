import React, { useState, useEffect, useRef } from 'react';
import { MicOff, Send, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { useLivingPlayer } from '../context/LivingPlayerContext';
import { matchUserIntent } from '../api/voiceIntentApi';
import { PremiumVectorIcon } from '../utils/premiumIcons';

export const LivingVoiceBubble: React.FC = () => {
  const { currentScene, transitionTo, logTelemetry } = useLivingPlayer();
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
      recognition.lang = currentScene?.ttsLanguageCode || 'he-IL';

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
    logTelemetry('voice_intent', `קלט משתמש: "${text}"`);

    try {
      const allowed = currentScene?.allowedIntents || {};
      const result = await matchUserIntent(text, allowed, {
        sceneTitle: currentScene?.title || '',
        sceneScript: currentScene?.dialogueScript || ''
      });

      if (result.targetSceneId) {
        setFeedbackMessage('מעביר אותך לסצנה המתאימה...');
        setTimeout(() => {
          transitionTo(result.targetSceneId!, 'voice_intent');
          setFeedbackMessage(null);
          setTranscript('');
          setTextInput('');
          setShowTextInput(false);
        }, 700);
      } else if (currentScene?.micTargetSceneId) {
        transitionTo(currentScene.micTargetSceneId, 'voice_fallback');
      } else {
        setFeedbackMessage('בחרו אחת מהאפשרויות או הכרטיסים על המסך להמשך');
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch {
      setFeedbackMessage(null);
    } finally {
      setIsThinking(false);
    }
  };

  const handleTriggerClick = () => {
    if (currentScene?.micTargetAction === 'navigate_to_node' && currentScene?.micTargetSceneId) {
      transitionTo(currentScene.micTargetSceneId, 'mic_direct_trigger');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        } else {
          setShowTextInput(prev => !prev);
        }
      } catch {
        setShowTextInput(true);
      }
    }
  };

  if (currentScene?.enableVoiceTrigger === false || currentScene?.micPosition === 'hidden') {
    return null;
  }

  const isCenterPosition =
    currentScene?.micPosition === 'center' || currentScene?.micPosition === 'screen_center_trigger';

  return (
    <div
      className={`absolute z-30 flex flex-col gap-2 select-none ${
        isCenterPosition
          ? 'bottom-24 left-1/2 -translate-x-1/2 items-center'
          : 'bottom-20 left-4 items-start'
      }`}
      dir="rtl"
    >
      {/* Feedback banner */}
      {(feedbackMessage || transcript) && (
        <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/40 rounded-2xl px-3.5 py-1.5 text-xs text-amber-200 shadow-xl max-w-xs animate-fade-in flex items-center gap-2">
          {isThinking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{transcript || feedbackMessage}</span>
        </div>
      )}

      {/* Text input drawer if open */}
      {showTextInput && (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleProcessIntent(textInput);
          }}
          className="flex items-center gap-1.5 bg-slate-900/95 border border-amber-500/40 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md animate-scale-up"
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
            className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Mic / Luxury Trigger & Text Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleTriggerClick}
          disabled={isThinking}
          title={currentScene?.micPromptText || (isListening ? 'עצור האזנה' : 'דברו עם הפרזנטור')}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/40'
              : 'bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
          }`}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <PremiumVectorIcon
              iconKey={currentScene?.micIcon || 'mic'}
              className="w-5 h-5"
              isGold={false}
            />
          )}
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
