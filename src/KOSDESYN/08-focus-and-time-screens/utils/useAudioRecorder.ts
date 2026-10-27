import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isTranscribing: boolean;
  recordingDuration: number;
  error: string | null;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('הדפדפן שלך אינו תומך בהקלטת קול ישירה');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Determine mimeType
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('גישה למיקרופון נדחתה. נא לאשר הרשאת מיקרופון בדפדפן.');
      } else {
        setError('לא ניתן להפעיל את המיקרופון: ' + (err.message || 'שגיאה לא ידועה'));
      }
      setIsRecording(false);
    }
  }, []);

  const stopRecordingAndTranscribe = useCallback(async (): Promise<string | null> => {
    if (!mediaRecorderRef.current) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);

        // Stop all audio tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        try {
          const mimeType = recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          if (audioBlob.size < 100) {
            throw new Error('ההקלטה קצרה מדי');
          }

          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            // Strip data:audio/*;base64, prefix
            const base64Audio = base64data.split(',')[1];

            try {
              const res = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType,
                }),
              });

              if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.message || 'שגיאה בתמלול ההקלטה');
              }

              const data = await res.json();
              setIsTranscribing(false);
              resolve(data.transcription || '');
            } catch (transcribeErr: any) {
              console.error('Transcription API error:', transcribeErr);
              setError(transcribeErr.message || 'שגיאה בתמלול ההקלטה');
              setIsTranscribing(false);
              resolve(null);
            }
          };
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'שגיאה בעיבוד ההקלטה');
          setIsTranscribing(false);
          resolve(null);
        }
      };

      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setIsTranscribing(false);
    setRecordingDuration(0);
  }, []);

  return {
    isRecording,
    isTranscribing,
    recordingDuration,
    error,
    startRecording,
    stopRecordingAndTranscribe,
    cancelRecording,
  };
}
