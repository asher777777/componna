import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { useFlowPlayerModule } from '../context/ModuleContext';
import { FunctionsApi } from '../api/functionsApi';
import { PremiumVectorIcon } from '../utils/premiumIcons';

export const VoiceRecorderInteraction: React.FC = () => {
  const {
    currentNode,
    campaign,
    transitionTo,
    isVoiceListening,
    setIsVoiceListening,
    isProcessingIntent,
    setIsProcessingIntent,
    setLastIntentResult,
    logEvent,
  } = usePlayerMachine();

  const { geminiApiKey, functionsBaseUrl } = useFlowPlayerModule();

  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const hasOverlays = !!(currentNode?.overlays && currentNode.overlays.length > 0);
  
  const isScreenCenterTrigger = currentNode?.micPosition === 'screen_center_trigger';
  // When text input is open OR overlays are present (except when explicitly screen_center_trigger), force bottom position
  const isCenter = !showTextInput && (isScreenCenterTrigger || (!hasOverlays && currentNode?.micPosition === 'center'));
  const isHidden = currentNode?.micPosition === 'hidden';

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = campaign.settings?.language || 'he-IL';

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setInterimTranscript('');
        logEvent({ type: 'voice_start', details: { lang: recognition.lang } });
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInterimTranscript(transcript);

        if (event.results[0]?.isFinal) {
          handleProcessInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[VoiceRecorder] Speech error:', event.error);
        setIsVoiceListening(false);
        logEvent({ type: 'error', details: { speechError: event.error } });
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
        logEvent({ type: 'voice_end' });
      };

      recognitionRef.current = recognition;
    }
  }, [campaign.settings?.language, setIsVoiceListening, logEvent]);

  // Handle Mic / Screen Trigger Click
  const handleMicClick = () => {
    // 1. Direct navigation to target node
    if (isScreenCenterTrigger || currentNode?.micActionType === 'navigate_to_node') {
      const targetId = currentNode?.clickMicTargetNodeId || Object.keys(campaign.states).find((k) => k !== currentNode?.id);
      if (targetId) {
        transitionTo(targetId, 'node_transition', { trigger: 'screen_center_trigger_click' });
      }
      return;
    }

    // 2. Otherwise open text input box at bottom & toggle voice recognition
    setShowTextInput((prev) => !prev);

    if (recognitionRef.current) {
      if (isVoiceListening) {
        recognitionRef.current.stop();
        setIsVoiceListening(false);
      } else {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('[VoiceRecorder] Start recognition error:', err);
        }
      }
    }
  };

  // Process user transcript via Gemini AI or Cloud Function
  const handleProcessInput = async (transcriptText: string) => {
    if (!transcriptText.trim() || !currentNode) return;

    setIsProcessingIntent(true);
    logEvent({
      type: 'voice_transcript',
      transcript: transcriptText,
      from: currentNode.id,
    });

    try {
      const result = await FunctionsApi.processVoiceIntent(
        functionsBaseUrl,
        {
          campaignId: campaign.id,
          currentNodeId: currentNode.id,
          userText: transcriptText,
          allowedIntents: currentNode.allowedIntents || {},
          currentNodeInfo: currentNode.description || currentNode.name,
          apiKey: geminiApiKey,
        }
      );

      setLastIntentResult(result);
      logEvent({
        type: 'intent_detected',
        intent: result.intent,
        to: result.nextNodeId,
        details: { confidence: result.confidence, explanation: result.explanation },
      });

      if (result.success && result.nextNodeId && campaign.states[result.nextNodeId]) {
        setTimeout(() => {
          transitionTo(result.nextNodeId, 'intent_detected', {
            intent: result.intent,
            userText: transcriptText,
          });
          setShowTextInput(false);
          setTextInput('');
        }, 800);
      }
    } catch (err) {
      console.warn('[VoiceRecorder] Error processing intent:', err);
      logEvent({ type: 'error', details: { intentError: String(err) } });
    } finally {
      setIsProcessingIntent(false);
      setIsVoiceListening(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleProcessInput(textInput);
  };

  if (isHidden) return null;

  return (
    <div
      className={`absolute inset-x-0 pointer-events-none z-20 flex flex-col items-center justify-end transition-all duration-500 ease-in-out ${
        isCenter ? 'inset-y-0 justify-center' : 'bottom-6 justify-end px-4'
      }`}
    >
      {/* Live AI Processing or Transcript Bubble */}
      {(isVoiceListening || isProcessingIntent || (interimTranscript && showTextInput)) && (
        <div className="pointer-events-auto mb-3 bg-black/85 backdrop-blur-xl border border-yellow-500/50 text-yellow-300 px-4 py-2 rounded-2xl text-xs flex items-center space-x-2 rtl:space-x-reverse shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-pulse max-w-[85%] text-center">
          {isProcessingIntent ? (
            <>
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin flex-shrink-0" />
              <span className="font-semibold">מפענח כוונה עם Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="truncate">"{interimTranscript}"</span>
            </>
          )}
        </div>
      )}

      {/* ד. תיבת טקסט שחרחרה בשקיפות עם פלייסהולדר 'דבר אני שומע...' - תמיד מעל המיקרופון */}
      {showTextInput && (
        <form
          onSubmit={handleTextSubmit}
          className="pointer-events-auto w-full max-w-sm flex items-center gap-2 mb-2 bg-black/85 backdrop-blur-2xl p-2 rounded-2xl border-2 border-yellow-500/70 shadow-[0_0_25px_rgba(234,179,8,0.4)] animate-fade-in"
        >
          <input
            type="text"
            placeholder="דבר אני שומע..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isProcessingIntent}
            autoFocus
            className="flex-1 bg-transparent px-3 py-1 text-xs sm:text-sm text-yellow-100 placeholder-yellow-500/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isProcessingIntent || !textInput.trim()}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-40 text-black font-black flex items-center justify-center shadow-lg transition-all active:scale-90 flex-shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 transform -rotate-90 rtl:rotate-90" />
          </button>
        </form>
      )}

      {/* כפתור מיקרופון עגול מלוטש שחור-זהב */}
      <div className="pointer-events-auto relative flex flex-col items-center group mb-2">
        {/* Pulsing Aura Rings */}
        <span className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/20 animate-ping pointer-events-none" />
        <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-yellow-500/15 animate-pulse pointer-events-none" />

        <button
          type="button"
          onClick={handleMicClick}
          disabled={isProcessingIntent}
          title={isScreenCenterTrigger || currentNode?.micActionType === 'navigate_to_node' ? 'לחץ למעבר לצומת הבא' : 'לחץ לדיבור או הקלדה'}
          className={`relative rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer shadow-[0_0_25px_rgba(251,191,36,0.4)] border-2 border-amber-400 ${
            isCenter ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-14 h-14 sm:w-16 sm:h-16'
          } ${
            isVoiceListening
              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/60'
              : 'bg-black/90 text-amber-400 hover:bg-black hover:border-amber-300 hover:shadow-[0_0_35px_rgba(251,191,36,0.7)]'
          }`}
        >
          {isVoiceListening ? (
            <MicOff className={`${isCenter ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-6 h-6 sm:w-7 sm:h-7'} animate-pulse text-red-900`} />
          ) : (
            <PremiumVectorIcon
              iconKey={currentNode?.micIcon || 'mic'}
              className={isCenter ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-7 h-7 sm:w-8 sm:h-8'}
              isGold={true}
            />
          )}
        </button>
      </div>
    </div>
  );
};