import React, { useState } from 'react';
import { Sparkles, RefreshCw, Send } from 'lucide-react';
import { Contact } from '../../types';
import { 
  generateContactAISummary, 
  generateSmartMessageDraft, 
  AISummaryResult, 
  AIDraftMessageResult 
} from '../../services/aiCrmService';

interface Props {
  formData: Contact;
  onAddTag: (tag: string) => void;
}

export const ContactAiCopilotTab: React.FC<Props> = ({ formData, onAddTag }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<AISummaryResult | null>(null);
  const [aiDraftChannel, setAiDraftChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [aiDraftGoal, setAiDraftGoal] = useState<'warm_intro' | 'campaign_invite' | 'payment_reminder'>('warm_intro');
  const [aiDraftResult, setAiDraftResult] = useState<AIDraftMessageResult | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);

  const cleanPhone = formData.conta_phone?.replace(/\D/g, '') || '';
  const waUrl = cleanPhone.startsWith('972') 
    ? `https://wa.me/${cleanPhone}` 
    : cleanPhone.startsWith('0') 
      ? `https://wa.me/972${cleanPhone.slice(1)}` 
      : `https://wa.me/${cleanPhone}`;

  const handleRunAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await generateContactAISummary(formData);
      setAiSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    setDraftLoading(true);
    try {
      const res = await generateSmartMessageDraft(formData, aiDraftChannel, aiDraftGoal);
      setAiDraftResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setDraftLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Trigger AI Button */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-900 rounded-xl">
        <div>
          <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>ניתוח פרופיל חכם (AI CRM Copilot)</span>
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            ניתוח היסטוריית פעילות, זיהוי כוונת רכישה, והמלצה על הצעד הבא
          </p>
        </div>
        <button
          onClick={handleRunAiSummary}
          disabled={aiLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-1.5 transition shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
          <span>{aiLoading ? 'מנתח...' : 'הפעל ניתוח AI'}</span>
        </button>
      </div>

      {aiSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 p-4 bg-white dark:bg-gray-800 border rounded-xl space-y-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">תקציר AI 360:</span>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{aiSummary.summary}</p>
            <div className="pt-2 border-t flex items-center gap-2">
              <span className="font-medium text-gray-500">הצעד הבא המומלץ:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{aiSummary.nextBestAction}</span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border rounded-xl space-y-3 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">טמפרטורת ליד:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                aiSummary.leadTemperature === 'hot' ? 'bg-rose-100 text-rose-700' :
                aiSummary.leadTemperature === 'warm' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {aiSummary.leadTemperature === 'hot' ? '🔥 חם מאוד' :
                 aiSummary.leadTemperature === 'warm' ? '⚡ חמים' : '❄️ קר'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">תגיות מומלצות:</span>
              <div className="flex flex-wrap gap-1">
                {aiSummary.recommendedTags.map(t => (
                  <button
                    key={t}
                    onClick={() => onAddTag(t)}
                    className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium transition"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Composer Draft */}
      <div className="p-4 bg-white dark:bg-gray-800 border rounded-xl space-y-3">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-1.5">
          <Send className="w-4 h-4 text-emerald-600" />
          <span>מחולל הודעות חכם (WhatsApp / Email)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-gray-500 mb-1">ערוץ שליחה</label>
            <select
              value={aiDraftChannel}
              onChange={(e: any) => setAiDraftChannel(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">אימייל</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-gray-500 mb-1">מטרת ההודעה</label>
            <div className="flex gap-2">
              <select
                value={aiDraftGoal}
                onChange={(e: any) => setAiDraftGoal(e.target.value)}
                className="flex-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
              >
                <option value="warm_intro">פנייה ראשונית / שיחת היכרות</option>
                <option value="campaign_invite">הזמנה להצטרפות לקמפיין</option>
                <option value="payment_reminder">תזכורת תשלום / קבלה</option>
              </select>
              <button
                onClick={handleGenerateDraft}
                disabled={draftLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shrink-0 transition"
              >
                {draftLoading ? 'יוצר...' : 'נסח הודעה'}
              </button>
            </div>
          </div>
        </div>

        {aiDraftResult && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/80 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
            {aiDraftResult.subject && (
              <div className="font-semibold text-indigo-600 text-xs">
                נושא: {aiDraftResult.subject}
              </div>
            )}
            <textarea
              rows={4}
              value={aiDraftResult.messageText}
              onChange={(e) => setAiDraftResult({ ...aiDraftResult, messageText: e.target.value })}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiDraftResult.messageText);
                  alert('ההודעה הועתקה ללוח!');
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300"
              >
                העתק טקסט
              </button>
              {aiDraftChannel === 'whatsapp' && cleanPhone && (
                <a
                  href={`${waUrl}?text=${encodeURIComponent(aiDraftResult.messageText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>שלח ב-WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
