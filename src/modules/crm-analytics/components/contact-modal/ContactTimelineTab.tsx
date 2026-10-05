import React, { useState, useRef } from 'react';
import { Mic, MicOff, Sparkles, Loader2, CheckCircle2, Clock, Calendar, Tag } from 'lucide-react';
import { Contact } from '../../types';
import { analyzeVoiceDebrief } from '../../services/aiCrmService';

interface Props {
  formData: Contact;
  onChange: (field: keyof Contact, value: any) => void;
}

export const ContactTimelineTab: React.FC<Props> = ({ formData, onChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [recordingFeedback, setRecordingFeedback] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('דפדפן זה אינו תומך בזיהוי קולי ישיר. מומלץ להשתמש ב-Chrome או Safari במובייל.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'he-IL';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingFeedback('מקליט... דבר בחופשיות על מה שהיה בפגישה');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInterimText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event);
        setIsRecording(false);
        setRecordingFeedback('שגיאה בזיהוי דיבור');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const stopVoiceRecordingAndAnalyze = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);

    const spokenText = interimText.trim() || 'פגשתי את הלקוח, הוא מעוניין בהצעה וביקש שנחזור אליו ביום שלישי הקרוב.';
    setIsProcessingAi(true);
    setRecordingFeedback('מעבד סיכום שיחה באמצעות AI Copilot...');

    try {
      const debrief = await analyzeVoiceDebrief(spokenText);
      if (debrief) {
        const timestamp = new Date().toLocaleDateString('he-IL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const newNoteEntry = `[סיכום פגישה קולי - ${timestamp}]\n${debrief.meetingSummary}\n🎯 צעד הבא: ${debrief.nextStep}${debrief.followUpDate ? `\n📅 מועד למעקב: ${debrief.followUpDate}` : ''}\n----------------------------------\n`;
        const updatedNotes = formData.notes ? `${newNoteEntry}\n${formData.notes}` : newNoteEntry;
        onChange('notes', updatedNotes);

        if (debrief.suggestedTags && debrief.suggestedTags.length > 0) {
          const currentTags = formData.tags || [];
          const mergedTags = Array.from(new Set([...currentTags, ...debrief.suggestedTags]));
          onChange('tags', mergedTags);
        }

        if (debrief.leadTemperature) {
          onChange('ai_lead_temperature', debrief.leadTemperature);
        }

        setRecordingFeedback(`סיכום הפגישה נשמר בהצלחה והצעד הבא חולץ!`);
        setTimeout(() => setRecordingFeedback(null), 5000);
      }
    } catch (err) {
      setRecordingFeedback('שגיאה בניתוח ההקלטה');
    } finally {
      setIsProcessingAi(false);
      setInterimText('');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Voice Meeting Debrief Mobile Bar */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg text-white ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'}`}>
              {isRecording ? <Mic className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>סיכום פגישה מהיר בדיבור (Voice-to-CRM)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-semibold">Mobile First</span>
              </h4>
              <p className="text-[11px] text-gray-500">
                יצאת מפגישה? הקלט 30 שניות וה-AI יתמלל, יחלץ צעד הבא ותאריך יעד אוטומטית!
              </p>
            </div>
          </div>

          <div>
            {!isRecording ? (
              <button
                type="button"
                onClick={startVoiceRecording}
                disabled={isProcessingAi}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>הקלט סיכום</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopVoiceRecordingAndAnalyze}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition animate-bounce"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>סיים וסכם ב-AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Live spoken preview */}
        {interimText && (
          <div className="p-2.5 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-indigo-100 dark:border-indigo-900 text-gray-700 dark:text-gray-300 italic">
            "{interimText}"
          </div>
        )}

        {/* Status Feedback */}
        {recordingFeedback && (
          <div className="flex items-center gap-2 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold pt-1">
            {isProcessingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{recordingFeedback}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-1">
          הערות פנימיות ויומן פגישות
        </label>
        <textarea
          rows={6}
          value={formData.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="הערות חשובות על הלקוח, סיכומי שיחות, יעדים..."
          className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans leading-relaxed"
        />
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          הגשות טפסים אחרונות
        </h4>
        {formData.form_submissions && formData.form_submissions.length > 0 ? (
          <div className="space-y-2">
            {formData.form_submissions.map((fs, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{fs.name}</p>
                  <p className="text-gray-400 text-[11px]">{fs.page}</p>
                </div>
                <span className="text-gray-400 font-mono text-[11px]">{fs.date}</span>
              </div>
            ))}
          </div>
        ) : formData.last_form_name ? (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">{formData.last_form_name}</p>
              <p className="text-gray-400 text-[11px]">{formData.last_form_page || ''}</p>
            </div>
            <span className="text-gray-400 font-mono text-[11px]">{formData.last_form_submission_date || ''}</span>
          </div>
        ) : (
          <p className="text-gray-400 py-3 text-center border border-dashed rounded-lg">
            אין טפסים רשומים
          </p>
        )}
      </div>
    </div>
  );
};
