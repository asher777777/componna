import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  lang?: string;
  continuous?: boolean;
}

// Map spoken Hebrew numbers to digits
const HEBREW_NUMBERS_MAP: Record<string, string> = {
  'אפס': '0',
  'אחת': '1',
  'אחד': '1',
  'שתיים': '2',
  'שניים': '2',
  'שלוש': '3',
  'שלושה': '3',
  'ארבע': '4',
  'ארבעה': '4',
  'חמש': '5',
  'חמישה': '5',
  'שש': '6',
  'שישה': '6',
  'שבע': '7',
  'שבעה': '7',
  'שמונה': '8',
  'שמונהה': '8',
  'תשע': '9',
  'תשעה': '9',
  'עשר': '10',
};

export function convertHebrewSpokenNumbers(text: string): string {
  if (!text) return text;
  let result = text;
  
  // Replace spoken number words with digits
  Object.entries(HEBREW_NUMBERS_MAP).forEach(([word, digit]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, digit);
  });

  // If result looks mostly like separated digits (e.g. "0 5 2 6 8..."), join them cleanly
  const tokens = result.split(/\s+/);
  const isMostlyDigits = tokens.filter((t) => /^\d+$/.test(t)).length >= 3;
  if (isMostlyDigits) {
    result = tokens
      .map((t) => t.trim())
      .filter(Boolean)
      .join('');
  }

  return result;
}

export function useSpeechRecognition({
  onResult,
  lang = 'he-IL',
  continuous = true,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldListenRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const rawText = finalTranscript || interimTranscript;
        if (rawText) {
          const converted = convertHebrewSpokenNumbers(rawText);
          accumulatedTranscriptRef.current = converted;
          if (onResult) {
            onResult(converted);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
        // Don't kill listening on minor no-speech pause
        if (event.error === 'network' || event.error === 'not-allowed') {
          setError(`שגיאת מיקרופון: ${event.error}`);
          shouldListenRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user has not explicitly stopped it
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [lang, onResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = true;
    accumulatedTranscriptRef.current = '';
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Recognition start caught error:', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {}
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
