import React, { useState, useRef, useEffect } from 'react';
import {
  X, Send, Users, Sparkles, CheckCircle, AlertCircle, Clock,
  ListFilter, Image, FileText, MessageSquare, Play, Pause, RefreshCw,
  FolderOpen, Tag, CheckSquare, Square
} from 'lucide-react';
import { Firestore, collection, getDocs } from 'firebase/firestore';
import { GreenApiService } from '../services/greenApiService';
import { MediaPickerModal } from '../../media-gallery-hub/components/MediaPickerModal';
import { normalizePhone } from '../services/whatsappCrmSyncService';

export interface BulkSendItemResult {
  phone: string;
  chatId: string;
  status: 'pending' | 'sending' | 'success' | 'failed';
  error?: string;
  messageId?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: GreenApiService;
  db?: Firestore;
  isDark: boolean;
  onRecipientSent?: (chatId: string, messageText: string, phone: string) => void;
}

export const WhatsAppBulkSenderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  service,
  db,
  isDark,
  onRecipientSent,
}) => {
  if (!isOpen) return null;

  const [phoneListRaw, setPhoneListRaw] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('שלום {phone}, ברכות ממערכת Comona!');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [delaySec, setDelaySec] = useState(1.5);
  const [isSending, setIsSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<BulkSendItemResult[]>([]);
  const isCancelledRef = useRef(false);

  // Media Picker & CRM Groups state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [crmGroups, setCrmGroups] = useState<{ id: string; name: string; memberCount?: number }[]>([]);
  const [selectedCrmGroup, setSelectedCrmGroup] = useState('');
  const [isLoadingCrm, setIsLoadingCrm] = useState(false);

  // Load CRM Groups on open
  useEffect(() => {
    if (!db) return;
    let isMounted = true;
    setIsLoadingCrm(true);

    const loadGroups = async () => {
      try {
        const groupsSnap = await getDocs(collection(db, 'crm_groups')).catch(() => null);
        const list: { id: string; name: string; memberCount?: number }[] = [];
        if (groupsSnap) {
          groupsSnap.forEach((d) => {
            const data = d.data();
            list.push({ id: d.id, name: data.name || d.id, memberCount: data.memberCount });
          });
        }
        if (isMounted) setCrmGroups(list);
      } catch (e) {
        console.warn('Error loading CRM groups for bulk modal:', e);
      } finally {
        if (isMounted) setIsLoadingCrm(false);
      }
    };

    loadGroups();
    return () => {
      isMounted = false;
    };
  }, [db]);

  // Load contacts from chosen CRM group
  const handleLoadCrmGroup = async (groupName: string) => {
    if (!db || !groupName) return;
    try {
      const contactsSnap = await getDocs(collection(db, 'contacts'));
      const groupPhones: string[] = [];
      contactsSnap.forEach((d) => {
        const data = d.data();
        const g = data.group || data.community || data.sourceGroupName || '';
        if (g.toLowerCase().trim() === groupName.toLowerCase().trim()) {
          const raw = data.phone || data.conta_phone || data.mobile || data.phoneNumber || '';
          const norm = normalizePhone(String(raw));
          if (norm) {
            const full = norm.startsWith('972') ? norm : `972${norm}`;
            groupPhones.push(full);
          }
        }
      });

      if (groupPhones.length > 0) {
        const existing = phoneListRaw.trim() ? phoneListRaw.split('\n') : [];
        const combined = Array.from(new Set([...existing, ...groupPhones]));
        setPhoneListRaw(combined.join('\n'));
        alert(`נטענו ${groupPhones.length} אנשי קשר מקבוצת "${groupName}" בהצלחה!`);
      } else {
        alert(`לא נמצאו אנשי קשר עם טלפון תקין בקבוצת "${groupName}"`);
      }
    } catch (err: any) {
      alert(`שגיאה בטעינת אנשי קשר מה-CRM: ${err.message}`);
    }
  };

  // Parse phone numbers
  const parsePhones = (): string[] => {
    const lines = phoneListRaw.split(/[\n,;]+/).map((s) => s.trim().replace(/\D/g, ''));
    return Array.from(new Set(lines.filter((p) => p.length >= 7)));
  };

  const phones = parsePhones();

  const handleStartBroadcast = async () => {
    if (phones.length === 0) {
      alert('נא להזין לפחות מספר טלפון אחד בפורמט בינלאומי מלא (לדוגמה 972501234567)');
      return;
    }
    if (!messageTemplate.trim() && !fileUrl.trim()) {
      alert('נא להזין תוכן הודעה או קישור לקובץ');
      return;
    }

    setIsSending(true);
    setIsPaused(false);
    isCancelledRef.current = false;

    const initialResults: BulkSendItemResult[] = phones.map((p) => ({
      phone: p,
      chatId: `${p}@c.us`,
      status: 'pending',
    }));
    setResults(initialResults);

    for (let i = 0; i < initialResults.length; i++) {
      if (isCancelledRef.current) break;

      const item = initialResults[i];
      item.status = 'sending';
      setResults([...initialResults]);

      const personalizedText = messageTemplate
        .replace(/{phone}/g, item.phone)
        .replace(/{date}/g, new Date().toLocaleDateString('he-IL'));

      try {
        let res: any;
        if (fileUrl.trim()) {
          res = await service.sendFileByUrl({
            chatId: item.chatId,
            urlFile: fileUrl.trim(),
            fileName: fileName.trim() || 'file.pdf',
            caption: personalizedText,
          });
        } else {
          res = await service.sendMessage({
            chatId: item.chatId,
            message: personalizedText,
          });
        }

        if (res && res.idMessage) {
          item.status = 'success';
          item.messageId = res.idMessage;
          // Notify parent to create/update chat room for this recipient
          onRecipientSent?.(item.chatId, personalizedText, item.phone);
        } else {
          item.status = 'failed';
          item.error = res?.error || 'שגיאה בשליחה';
        }
      } catch (err: any) {
        item.status = 'failed';
        item.error = err?.message || 'שגיאה בחיבור';
      }

      setResults([...initialResults]);

      // Throttle delay between sends
      if (i < initialResults.length - 1 && !isCancelledRef.current) {
        await new Promise((r) => setTimeout(r, delaySec * 1000));
      }
    }

    setIsSending(false);
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    setIsSending(false);
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <span>מרכז שיגור הודעות מרובות (Bulk Campaign)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  פתיחת חדרי צ'אט אוטומטית
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                שידור הודעות אישיות לרשימת תפוצה ופתיחת חדר שיחה ייעודי לכל נמען
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* CRM Group Quick Loader */}
          {crmGroups.length > 0 && (
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              isDark ? 'bg-indigo-950/30 border-indigo-800/40' : 'bg-indigo-50 border-indigo-200'
            }`}>
              <Users className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-bold text-[11px] text-indigo-300">טען נמענים מקבוצת CRM:</span>
              <select
                value={selectedCrmGroup}
                onChange={(e) => {
                  setSelectedCrmGroup(e.target.value);
                  if (e.target.value) handleLoadCrmGroup(e.target.value);
                }}
                className={`p-1.5 rounded-xl border text-xs flex-1 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">-- בחר קהילת / קבוצת CRM --</option>
                {crmGroups.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Numbers list input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>רשימת מספרי טלפון נמענים (שורה לכל מספר או מופרדים בפסיק)</span>
              </label>
              <span className={`text-[11px] font-bold ${phones.length > 0 ? 'text-indigo-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                זוהו {phones.length} נמענים תקינים
              </span>
            </div>
            <textarea
              rows={3}
              disabled={isSending}
              value={phoneListRaw}
              onChange={(e) => setPhoneListRaw(e.target.value)}
              placeholder="972501234567&#10;972529876543&#10;972545554433"
              className={`w-full p-3 rounded-2xl border font-mono text-xs focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              dir="ltr"
            />
          </div>

          {/* Message Template */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>תוכן ההודעה (תבנית אישית)</span>
              </label>
              <div className="flex gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setMessageTemplate((prev) => prev + ' {phone}')}
                  className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer"
                >
                  + מספר טלפון
                </button>
                <button
                  type="button"
                  onClick={() => setMessageTemplate((prev) => prev + ' {date}')}
                  className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer"
                >
                  + תאריך
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              disabled={isSending}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="הקלד את תוכן ההודעה לשליחה..."
              className={`w-full p-3 rounded-2xl border text-xs focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Optional Media URL & Throttle Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  קישור ישיר למדיה / קובץ (אופציונלי)
                </label>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-[10px] flex items-center gap-1 shadow cursor-pointer transition"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>בחר מגלריה</span>
                </button>
              </div>
              <input
                type="url"
                disabled={isSending}
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/promo.png"
                className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                dir="ltr"
              />
            </div>
            <div>
              <label className={`block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                השהייה בין הודעות (בשניות - למניעת חסימות)
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

          {/* Real-time Progress & Results */}
          {results.length > 0 && (
            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between font-bold">
                <span>התקדמות שיגור קמפיין:</span>
                <span className="font-mono text-indigo-500">
                  {successCount + failedCount} מתוך {results.length} (
                  {Math.round(((successCount + failedCount) / results.length) * 100)}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${((successCount + failedCount) / results.length) * 100}%` }}
                />
              </div>

              {/* Status List */}
              <div className="max-h-40 overflow-y-auto space-y-1 pt-1 font-mono text-[11px]">
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg flex items-center justify-between border ${
                      r.status === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : r.status === 'failed'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : r.status === 'sending'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 animate-pulse'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{r.phone}</span>
                    <span className="font-sans font-semibold text-[10px]">
                      {r.status === 'success' && '✓ נשלח ונפתח חדר שיחה'}
                      {r.status === 'failed' && `✗ נכשל: ${r.error}`}
                      {r.status === 'sending' && 'משגר...'}
                      {r.status === 'pending' && 'ממתין לתור'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-[11px] text-slate-400">
            {isSending ? 'שיגור מתבצע ברקע...' : 'כל נמען שיישלח יתווסף אוטומטית לרשימת השיחות הפעילות'}
          </div>

          <div className="flex items-center gap-2">
            {isSending ? (
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>עצור שיגור</span>
              </button>
            ) : (
              <button
                onClick={handleStartBroadcast}
                disabled={phones.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>שגר קמפיין עכשיו ({phones.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Media Gallery Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setIsMediaPickerOpen(false)}
          title="בחר מדיה לקמפיין תפוצה מתוך הגלריה האישית"
          allowedTypes={['image', 'video', 'document', 'audio']}
          maxSelectCount={1}
          onSelectMedia={(items) => {
            if (items && items.length > 0) {
              setFileUrl(items[0].url);
              setFileName(items[0].name || 'file.pdf');
              setIsMediaPickerOpen(false);
            }
          }}
          db={db}
        />
      )}
    </div>
  );
};
