import React, { useState, useRef } from 'react';
import {
  X, Send, Users, Sparkles, CheckCircle, AlertCircle, Clock,
  Image, Paperclip, MessageSquare, Pause
} from 'lucide-react';
import { GreenApiService } from '../services/greenApiService';
import { GreenApiChat } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: GreenApiChat[];
  service: GreenApiService;
  connectedAccountName?: string;
  sourceGroupName?: string;
  isDark: boolean;
  onRecipientSent?: (chatId: string, messageText: string, phone: string) => void;
}

export const WhatsAppDynamicBroadcastModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedContacts,
  service,
  connectedAccountName = '',
  sourceGroupName = '',
  isDark,
  onRecipientSent,
}) => {
  if (!isOpen) return null;

  const [messageTemplate, setMessageTemplate] = useState('שלום {firstName}, תודה שפנית אלינו!');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('document.pdf');
  const [delaySec, setDelaySec] = useState(1.5);
  const [isSending, setIsSending] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [sendLogs, setSendLogs] = useState<{ id: string; name: string; status: string }[]>([]);
  const isCancelledRef = useRef(false);

  const individualContacts = selectedContacts.filter((c) => !c.isGroup);

  const insertTag = (tag: string) => {
    setMessageTemplate((prev) => `${prev} ${tag}`);
  };

  const handleStartBroadcast = async () => {
    if (individualContacts.length === 0) {
      alert('אין אנשי קשר נבחרים לשליחה');
      return;
    }
    if (!messageTemplate.trim() && !fileUrl.trim()) {
      alert('נא להזין תוכן הודעה או קישור למדיה');
      return;
    }

    setIsSending(true);
    isCancelledRef.current = false;
    setProgressIndex(0);
    const logs: { id: string; name: string; status: string }[] = [];

    for (let i = 0; i < individualContacts.length; i++) {
      if (isCancelledRef.current) break;

      const c = individualContacts[i];
      setProgressIndex(i + 1);

      const rawPhone = c.id.replace('@c.us', '');
      const firstName = (c.name || '').split(' ')[0] || rawPhone;
      const fullName = c.name || rawPhone;

      const renderedText = messageTemplate
        .replace(/{name}/g, fullName)
        .replace(/{firstName}/g, firstName)
        .replace(/{phone}/g, rawPhone)
        .replace(/{accountName}/g, connectedAccountName)
        .replace(/{groupName}/g, sourceGroupName || 'הקבוצה')
        .replace(/{date}/g, new Date().toLocaleDateString('he-IL'));

      try {
        let res: any;
        if (fileUrl.trim()) {
          res = await service.sendFileByUrl({
            chatId: c.id,
            urlFile: fileUrl.trim(),
            fileName: fileName.trim() || 'file.pdf',
            caption: renderedText,
          });
        } else {
          res = await service.sendMessage({
            chatId: c.id,
            message: renderedText,
          });
        }

        if (res && res.idMessage) {
          logs.push({ id: c.id, name: fullName, status: '✓ נשלח בהצלחה' });
          onRecipientSent?.(c.id, renderedText, rawPhone);
        } else {
          logs.push({ id: c.id, name: fullName, status: `✗ שגיאה: ${res?.error || 'נכשל'}` });
        }
      } catch (err: any) {
        logs.push({ id: c.id, name: fullName, status: `✗ ${err.message || 'שגיאה'}` });
      }

      setSendLogs([...logs]);

      if (i < individualContacts.length - 1 && !isCancelledRef.current) {
        await new Promise((r) => setTimeout(r, delaySec * 1000));
      }
    }

    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <span>שידור הודעה אישית עם תגיות דינמיות</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {individualContacts.length} נמענים
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                הודעות אישיות המותאמות אוטומטית לכל איש קשר לפי שמו ומספרו
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSending}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Tag insertion buttons */}
          <div className="space-y-1.5">
            <label className={`block font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              הוסף תגיות דינמיות להודעה:
            </label>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => insertTag('{firstName}')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium cursor-pointer"
              >
                + שם פרטי ({'{firstName}'})
              </button>
              <button
                type="button"
                onClick={() => insertTag('{name}')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium cursor-pointer"
              >
                + שם מלא ({'{name}'})
              </button>
              <button
                type="button"
                onClick={() => insertTag('{phone}')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium cursor-pointer"
              >
                + מספר טלפון ({'{phone}'})
              </button>
              <button
                type="button"
                onClick={() => insertTag('{date}')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium cursor-pointer"
              >
                + תאריך ({'{date}'})
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <label className={`block font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              תוכן ההודעה (תבנית אישית)
            </label>
            <textarea
              rows={4}
              disabled={isSending}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="הקלד את תוכן ההודעה עם התגיות..."
              className={`w-full p-3 rounded-2xl border text-xs focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Media URL & Delay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                קישור ישיר לתמונה / קובץ (אופציונלי)
              </label>
              <input
                type="url"
                disabled={isSending}
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/brochure.pdf"
                className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                dir="ltr"
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                השהייה בין הודעות (שניות)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                disabled={isSending}
                value={delaySec}
                onChange={(e) => setDelaySec(parseFloat(e.target.value) || 1)}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Progress & Logs */}
          {isSending && (
            <div className="space-y-2 p-3 bg-indigo-950/20 border border-indigo-800/30 rounded-2xl">
              <div className="flex items-center justify-between font-bold text-xs">
                <span>משגר כעת...</span>
                <span>
                  {progressIndex} מתוך {individualContacts.length}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(progressIndex / individualContacts.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {sendLogs.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono">
              {sendLogs.map((l, idx) => (
                <div key={idx} className="flex justify-between items-center py-0.5">
                  <span className="truncate max-w-[220px]">{l.name}</span>
                  <span className={l.status.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
          <span className="text-[11px] text-slate-400">
            {isSending ? 'שיגור מתבצע ברקע...' : `מוכן לשיגור אישי ל-${individualContacts.length} נמענים`}
          </span>

          <div className="flex items-center gap-2">
            {isSending ? (
              <button
                onClick={() => (isCancelledRef.current = true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>עצור</span>
              </button>
            ) : (
              <button
                onClick={handleStartBroadcast}
                disabled={individualContacts.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>שגר הודעה אישית ({individualContacts.length})</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
