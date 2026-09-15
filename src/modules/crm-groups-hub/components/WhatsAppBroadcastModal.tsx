import React, { useState } from 'react';
import { X, MessageCircle, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { sendWhatsAppMessage } from '../services/whatsappService';

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
  const { contacts, filteredContacts, activeGroup, greenApiConfig } = useCrmGroups();

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);

  if (!isOpen) return null;

  // Determine recipients
  const targetContacts = targetContactIds && targetContactIds.length > 0
    ? contacts.filter((c) => targetContactIds.includes(c.id) && c.conta_phone)
    : filteredContacts.filter((c) => c.conta_phone);

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      alert('נא להזין תוכן להודעה');
      return;
    }
    if (targetContacts.length === 0) {
      alert('אין אנשי קשר בעלי מספר טלפון תקין ברשימה');
      return;
    }

    setSending(true);
    setProgress({ sent: 0, total: targetContacts.length });

    let successCount = 0;
    for (let i = 0; i < targetContacts.length; i++) {
      const contact = targetContacts[i];
      const personalized = message
        .replace(/{{conta_name}}/g, contact.conta_name || 'ידידי')
        .replace(/{{community_name}}/g, activeGroup.name || '');

      const ok = await sendWhatsAppMessage(contact.conta_phone!, personalized, greenApiConfig);
      if (ok) successCount++;
      setProgress({ sent: i + 1, total: targetContacts.length });
    }

    setSending(false);
    alert(`שליחת ההודעות הסתיימה: ${successCount} מתוך ${targetContacts.length} נשלחו בהצלחה.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900">
              שליחת הודעת וואטסאפ ל{activeGroup.name}
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

        <div className="p-6 space-y-4 text-xs">
          <div className="bg-emerald-50 text-emerald-900 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <span>
              סה"כ נמענים עם טלפון: <strong className="font-mono">{targetContacts.length}</strong>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md">
              Green API Direct
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">תוכן ההודעה:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="שלום {{conta_name}}, שמחים לעדכן אותך בפעילות קהילת {{community_name}}..."
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              תגיות זמינות להחלפה אישית: <code>{"{{conta_name}}"}</code>, <code>{"{{community_name}}"}</code>
            </span>
          </div>

          {progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>סטטוס שליחה</span>
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
            <span>{sending ? 'שולח...' : `שלח ל-${targetContacts.length} נמענים`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
