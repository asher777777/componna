import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ListFilter,
  Layers,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { sendWhatsAppMessage, sendWhatsAppPoll } from '../services/whatsappService';
import { addCommunityInteractionRecord } from '../services/firestoreService';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetContactIds?: string[];
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  targetContactIds,
}) => {
  const { db, contacts, filteredContacts, activeGroup, greenApiConfig } = useCrmGroups();

  const [mode, setMode] = useState<'text' | 'poll'>('text');

  // Text Broadcast State
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);

  // Poll Broadcast State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>([
    'כן, אשמח להגיע!',
    'לא אוכל הפעם',
    'מעוניין במידע נוסף',
  ]);
  const [multipleAnswers, setMultipleAnswers] = useState(false);

  if (!isOpen) return null;

  // Determine recipients
  const targetContacts = targetContactIds && targetContactIds.length > 0
    ? contacts.filter((c) => targetContactIds.includes(c.id) && c.conta_phone)
    : filteredContacts.filter((c) => c.conta_phone);

  const handleAddPollOption = () => {
    if (pollOptions.length < 12) {
      setPollOptions([...pollOptions, `אפשרות ${pollOptions.length + 1}`]);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleUpdatePollOption = (idx: number, val: string) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handleSendBroadcast = async () => {
    if (mode === 'text' && !message.trim()) {
      alert('נא להזין תוכן להודעה');
      return;
    }
    if (mode === 'poll' && !pollQuestion.trim()) {
      alert('נא להזין את שאלת הסקר');
      return;
    }
    if (targetContacts.length === 0) {
      alert('אין אנשי קשר בעלי מספר טלפון תקין ברשימה');
      return;
    }

    setSending(true);
    setProgress({ sent: 0, total: targetContacts.length });

    let successCount = 0;
    const personalPageUrl = activeGroup.pageUrl
      ? `${window.location.origin}${activeGroup.pageUrl}`
      : `${window.location.origin}/c/${activeGroup.pageSlug || activeGroup.id}`;

    for (let i = 0; i < targetContacts.length; i++) {
      const contact = targetContacts[i];

      if (mode === 'text') {
        // Tag replacement: {{שם}}, {{קהילה}}, {{סכום_שנתרם}}, {{קישור_אישי}}
        const donationAmount = Number(contact.total_spent || contact.campaign_amount || 0);
        const personalized = message
          .replace(/{{שם}}|{{conta_name}}/g, contact.conta_name || 'ידידי')
          .replace(/{{קהילה}}|{{community_name}}/g, activeGroup.name || '')
          .replace(/{{סכום_שנתרם}}/g, donationAmount > 0 ? `₪${donationAmount.toLocaleString()}` : '₪0')
          .replace(/{{קישור_אישי}}/g, personalPageUrl);

        const ok = await sendWhatsAppMessage(contact.conta_phone!, personalized, greenApiConfig);
        if (ok) {
          successCount++;
          // Record interaction
          await addCommunityInteractionRecord(db, {
            contactId: contact.id,
            contactName: contact.conta_name,
            contactPhone: contact.conta_phone,
            type: 'whatsapp',
            title: `שידור וואטסאפ: ${activeGroup.name}`,
            content: personalized,
            groupName: activeGroup.name,
            date: new Date().toISOString(),
            status: 'completed',
          });
        }
      } else {
        // Send WhatsApp Poll
        const cleanOptions = pollOptions.filter((o) => o.trim().length > 0);
        const ok = await sendWhatsAppPoll(
          contact.conta_phone!,
          pollQuestion,
          cleanOptions,
          multipleAnswers,
          greenApiConfig
        );
        if (ok) {
          successCount++;
          // Record interaction
          await addCommunityInteractionRecord(db, {
            contactId: contact.id,
            contactName: contact.conta_name,
            contactPhone: contact.conta_phone,
            type: 'whatsapp',
            title: `סקר וואטסאפ: ${pollQuestion}`,
            content: `שאלת סקר: "${pollQuestion}"\nאפשרויות: ${cleanOptions.join(', ')}`,
            groupName: activeGroup.name,
            date: new Date().toISOString(),
            status: 'completed',
            metadata: { isPoll: true, pollQuestion, options: cleanOptions },
          });
        }
      }

      setProgress({ sent: i + 1, total: targetContacts.length });
    }

    setSending(false);
    alert(
      mode === 'text'
        ? `שידור ההודעות הסתיים: ${successCount} מתוך ${targetContacts.length} נשלחו בהצלחה.`
        : `שידור הסקר הסתיים: ${successCount} מתוך ${targetContacts.length} נשלחו בהצלחה.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900">
              מרכז תקשורת ישיר לחברי {activeGroup.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher: Text Broadcast vs Poll */}
        <div className="flex items-center px-6 pt-3 bg-white border-b border-slate-100 gap-2">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              mode === 'text'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>הודעה מותאמת אישית</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('poll')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              mode === 'poll'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>סקר וואטסאפ אינטראקטיבי</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">חדש</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs max-h-[60vh] overflow-y-auto">
          <div className="bg-emerald-50 text-emerald-900 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <span>
              סה"כ נמענים עם טלפון: <strong className="font-mono">{targetContacts.length}</strong>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md">
              Green API Direct
            </span>
          </div>

          {mode === 'text' ? (
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">תוכן ההודעה:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="שלום {{שם}}, שמחים לעדכן אותך שבקהילת {{קהילה}} גייסנו כבר {{סכום_שנתרם}}! לעמוד הקהילה: {{קישור_אישי}}"
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none"
              />

              {/* Tag Quick Buttons */}
              <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 block">
                  לחץ להוספת תגית דינמית:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { tag: '{{שם}}', label: 'שם הנמען' },
                    { tag: '{{קהילה}}', label: 'שם הקהילה' },
                    { tag: '{{סכום_שנתרם}}', label: 'סכום תרומה' },
                    { tag: '{{קישור_אישי}}', label: 'קישור לעמוד הקהילה' },
                  ].map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => setMessage((prev) => `${prev} ${t.tag} `)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {t.tag} ({t.label})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">שאלת הסקר:</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="האם תרצה להצטרף למפגש השגרירים הקרוב?"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">אפשרויות תשובה:</label>
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>הוסף אפשרות</span>
                  </button>
                </div>

                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono text-slate-400 font-bold">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleUpdatePollOption(idx, e.target.value)}
                      placeholder={`אפשרות ${idx + 1}...`}
                      className="flex-1 h-8.5 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="multiAnswers"
                  checked={multipleAnswers}
                  onChange={(e) => setMultipleAnswers(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                />
                <label htmlFor="multiAnswers" className="text-xs text-slate-700 font-bold cursor-pointer">
                  אפשר בחירת תשובות מרובות (Multiple Answers)
                </label>
              </div>
            </div>
          )}

          {progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>סטטוס שידור</span>
                <span>{progress.sent} / {progress.total}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleSendBroadcast}
            disabled={sending || targetContacts.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {sending
                ? 'משדר...'
                : mode === 'text'
                ? `שלח הודעה ל-${targetContacts.length} נמענים`
                : `שלח סקר ל-${targetContacts.length} נמענים`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
