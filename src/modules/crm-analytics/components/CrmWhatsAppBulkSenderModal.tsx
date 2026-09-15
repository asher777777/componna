import React, { useState, useRef, useMemo } from 'react';
import { 
  X, Send, Users, Sparkles, CheckCircle2, AlertCircle, Clock, 
  Paperclip, Pause, Play, RefreshCw, MessageSquare, Check, ChevronDown, CheckSquare, Square
} from 'lucide-react';
import { Contact } from '../types';
import { getGreenApiService } from '../../smart-form-builder/services/formWhatsAppService';

export interface CrmWhatsAppRecipient {
  contact: Contact;
  phone: string;
  selected: boolean;
  status: 'pending' | 'sending' | 'success' | 'failed';
  error?: string;
  messageId?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Contact[];
}

const DEFAULT_TEMPLATES = [
  {
    title: 'הודעת היכרות / מעקב',
    text: 'שלום {{שם}}, שמחים ליצור איתך קשר! האם תרצה לשמוע עוד פרטים?',
  },
  {
    title: 'עדכון והצעה מיוחדת',
    text: 'היי {{שם}}, יש לנו עדכון מיוחד שמתאים בדיוק עבורך! צור איתנו קשר לפרטים נוספים.',
  },
  {
    title: 'מענה לפנייה מטופס',
    text: 'שלום {{שם}}, קיבלנו את פנייתך בטופס {{טופס}} ונשמח לתת לך שירות בהקדם.',
  },
  {
    title: 'תזכורת לפגישה / שיחה',
    text: 'שלום {{שם}}, תזכורת קצרה לגבי הפגישה שקבענו. במידה ויש שינוי, נשמח לעדכון.',
  }
];

export const CrmWhatsAppBulkSenderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedContacts,
}) => {
  if (!isOpen) return null;

  // Initialize recipients with clean phone numbers
  const [recipients, setRecipients] = useState<CrmWhatsAppRecipient[]>(() => {
    return selectedContacts.map(c => {
      const clean = (c.conta_phone || '').replace(/\D/g, '');
      const waPhone = clean.startsWith('0') ? `972${clean.slice(1)}` : clean;
      return {
        contact: c,
        phone: waPhone,
        selected: waPhone.length >= 8,
        status: 'pending' as const,
      };
    });
  });

  const [messageTemplate, setMessageTemplate] = useState('שלום {{שם}}, שמחים ליצור איתך קשר!');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [delaySec, setDelaySec] = useState(2);
  const [isSending, setIsSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const isCancelledRef = useRef(false);
  const isPausedRef = useRef(false);

  const activeRecipients = useMemo(() => recipients.filter(r => r.selected), [recipients]);
  const validPhoneCount = useMemo(() => recipients.filter(r => r.phone.length >= 8).length, [recipients]);

  const toggleSelect = (index: number) => {
    setRecipients(prev => prev.map((r, i) => i === index ? { ...r, selected: !r.selected } : r));
  };

  const toggleSelectAll = () => {
    const allSelected = recipients.every(r => r.selected);
    setRecipients(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  const insertVariable = (varName: string) => {
    setMessageTemplate(prev => `${prev} {{${varName}}}`);
  };

  const renderPersonalized = (template: string, contact: Contact) => {
    return template
      .replace(/{{שם}}|{{name}}/g, contact.conta_name || 'ידיד/ה')
      .replace(/{{טלפון}}|{{phone}}/g, contact.conta_phone || '')
      .replace(/{{חברה}}|{{company}}/g, contact.company_name || '')
      .replace(/{{מקור}}|{{source}}/g, contact.lead_source || '')
      .replace(/{{טופס}}|{{form}}/g, contact.last_form_name || 'הטופס הדיגיטלי')
      .replace(/{{קהילה}}|{{community}}/g, contact.community || '');
  };

  // Preview message for the first selected contact
  const previewMessage = useMemo(() => {
    const first = activeRecipients[0]?.contact || selectedContacts[0];
    if (!first) return messageTemplate;
    return renderPersonalized(messageTemplate, first);
  }, [messageTemplate, activeRecipients, selectedContacts]);

  const handleStartSending = async () => {
    setErrorBanner(null);
    const targets = recipients.filter(r => r.selected && r.phone.length >= 8);
    if (targets.length === 0) {
      setErrorBanner('לא נבחרו אנשי קשר עם מספר טלפון תקין');
      return;
    }

    const greenService = getGreenApiService();
    if (!greenService || !greenService.isConfigured()) {
      setErrorBanner('שירות Green-API אינו מוגדר או חסרים פרטי התחברות (Instance ID / Token)');
      return;
    }

    setIsSending(true);
    setIsPaused(false);
    isCancelledRef.current = false;
    isPausedRef.current = false;

    // Reset status for selected
    setRecipients(prev => prev.map(r => r.selected ? { ...r, status: 'pending', error: undefined } : r));

    for (let i = 0; i < recipients.length; i++) {
      if (isCancelledRef.current) break;
      while (isPausedRef.current) {
        await new Promise(res => setTimeout(res, 500));
        if (isCancelledRef.current) break;
      }

      const item = recipients[i];
      if (!item.selected || item.phone.length < 8) continue;

      // Update state to sending
      setRecipients(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'sending' } : r));

      const messageText = renderPersonalized(messageTemplate, item.contact);
      const chatId = `${item.phone}@c.us`;

      try {
        let res: any;
        if (fileUrl.trim()) {
          res = await greenService.sendFileByUrl({
            chatId,
            urlFile: fileUrl.trim(),
            fileName: fileName.trim() || 'document.pdf',
            caption: messageText,
          });
        } else {
          res = await greenService.sendMessage({
            chatId,
            message: messageText,
          });
        }

        if (res && res.idMessage) {
          setRecipients(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'success', messageId: res.idMessage } : r));
        } else {
          setRecipients(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'failed', error: res?.error || 'שגיאה בשליחה' } : r));
        }
      } catch (err: any) {
        setRecipients(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'failed', error: err.message || 'נכשל' } : r));
      }

      // Delay between sends
      if (i < recipients.length - 1 && delaySec > 0) {
        await new Promise(res => setTimeout(res, delaySec * 1000));
      }
    }

    setIsSending(false);
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    setIsSending(false);
  };

  const handleTogglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  const sentCount = recipients.filter(r => r.status === 'success').length;
  const failedCount = recipients.filter(r => r.status === 'failed').length;
  const progressPercent = activeRecipients.length > 0 
    ? Math.round(((sentCount + failedCount) / activeRecipients.length) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-right">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>שליחת הודעת WhatsApp מרוכזת (Green-API)</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {activeRecipients.length} נבחרים
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                שליחה מותאמת אישית עם תגיות דינמיות ומניעת חסימות
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorBanner && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Message Editor & Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                בחר תבנית מהירה:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageTemplate(tmpl.text)}
                    className="p-2 text-right border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-xl bg-gray-50/70 dark:bg-gray-800/60 hover:bg-emerald-50/30 transition text-xs group"
                  >
                    <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 block truncate">
                      {tmpl.title}
                    </span>
                    <span className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                      {tmpl.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Tags Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>תוכן ההודעה והטמעת משתנים:</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { id: 'שם', label: '{{שם מלא}}' },
                  { id: 'חברה', label: '{{חברה}}' },
                  { id: 'מקור', label: '{{מקור הגעה}}' },
                  { id: 'טופס', label: '{{שם טופס}}' },
                  { id: 'קהילה', label: '{{קהילה}}' },
                ].map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => insertVariable(v.id)}
                    className="px-2 py-1 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg transition"
                  >
                    +{v.label}
                  </button>
                ))}
              </div>

              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={5}
                disabled={isSending}
                placeholder="הקלד כאן את תוכן ההודעה..."
                className="w-full p-3 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Message Preview */}
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-[11px]">
                <span>תצוגה מקדימה לרשומה הראשונה:</span>
              </span>
              <p className="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-emerald-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans text-xs shadow-sm">
                {previewMessage}
              </p>
            </div>

            {/* Optional Attachment & Delay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  השהייה בין הודעות (שניות):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={0.5}
                    value={delaySec}
                    onChange={(e) => setDelaySec(Number(e.target.value))}
                    disabled={isSending}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <span className="text-[10px] text-gray-400 shrink-0">מונע חסימות</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  קישור לקובץ / תמונה (אופציונלי):
                </label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  disabled={isSending}
                  placeholder="https://.../file.pdf"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Recipients List & Live Sending Status (5 cols) */}
          <div className="lg:col-span-5 flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 overflow-hidden">
            
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  disabled={isSending}
                  className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 font-semibold flex items-center gap-1"
                >
                  {recipients.every(r => r.selected) ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  <span>בחר הכל ({recipients.length})</span>
                </button>
              </div>
              <span className="text-gray-400 font-mono text-[11px]">
                {validPhoneCount} עם טלפון תקין
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-80 divide-y divide-gray-100 dark:divide-gray-800 p-1">
              {recipients.map((item, idx) => (
                <div
                  key={item.contact.id || idx}
                  className={`p-2.5 rounded-lg flex items-center justify-between text-xs transition ${
                    item.status === 'sending'
                      ? 'bg-amber-50 dark:bg-amber-950/30'
                      : item.status === 'success'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                      : item.status === 'failed'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20'
                      : 'hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(idx)}
                      disabled={isSending}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="truncate">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {item.contact.conta_name || 'ללא שם'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono" dir="ltr">
                        {item.phone || 'אין טלפון'}
                      </p>
                    </div>
                  </label>

                  <div>
                    {item.status === 'sending' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>שולח...</span>
                      </span>
                    )}
                    {item.status === 'success' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>נשלח</span>
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400" title={item.error}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>נכשל</span>
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-[10px] text-gray-400">ממתין</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Progress Bar */}
            {isSending && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>התקדמות: {sentCount + failedCount} מתוך {activeRecipients.length}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {sentCount > 0 && (
              <span className="text-emerald-600 font-bold">✓ נשלחו: {sentCount}</span>
            )}
            {failedCount > 0 && (
              <span className="text-rose-600 font-bold">❌ נכשלו: {failedCount}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSending ? (
              <>
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-gray-100"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'המשך שליחה' : 'השהה'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
                >
                  ביטול שליחה
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-xs font-medium"
                >
                  סגור
                </button>
                <button
                  type="button"
                  onClick={handleStartSending}
                  disabled={activeRecipients.length === 0 || !messageTemplate.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>התחל שליחה ל-{activeRecipients.length} נמענים</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
