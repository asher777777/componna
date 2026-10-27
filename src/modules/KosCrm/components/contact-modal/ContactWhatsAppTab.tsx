import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant/TenantScopeContext';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  Bot, 
  MessageCircle, 
  Clock, 
  Send, 
  RefreshCw, 
  FileText, 
  User, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { Contact } from '../../types';
import { getCrmWhatsAppService, buildWaMeUrl } from '../../services/crmWhatsAppService';

interface Props {
  formData: Contact;
}

interface ChatMessageItem {
  role: 'user' | 'model' | 'assistant';
  text: string;
  timestamp: number;
  source?: 'ksf_form' | 'crm_manual' | 'bot' | 'user' | string;
  formTitle?: string;
  formId?: string;
  ruleName?: string;
}

interface ConversationThread {
  id: string;
  title: string;
  lastUpdatedAt: number;
  messages: ChatMessageItem[];
  source: string;
}

export const ContactWhatsAppTab: React.FC<Props> = ({ formData }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [allMessages, setAllMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [outboundText, setOutboundText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract phone in various canonical formats
  const rawPhone = 
    formData.kosun_crm_phone || 
    formData.conta_phone || 
    formData.phone || 
    formData.mobile || 
    formData.phoneNumber || 
    '';

  const cleanDigits = rawPhone.replace(/\D/g, '');
  const normPhone = cleanDigits.startsWith('972') 
    ? '0' + cleanDigits.slice(3) 
    : cleanDigits;
  const intlPhone = cleanDigits.startsWith('0') 
    ? '972' + cleanDigits.slice(1) 
    : cleanDigits;
  const targetChatId = `${intlPhone}@c.us`;

  const fetchConversations = useCallback(async () => {
    if (!db || (!normPhone && !formData.id)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const loadedThreads: ConversationThread[] = [];
    const collectedMessages: ChatMessageItem[] = [];

    try {
      // 1. Fetch from contact's subcollection: contacts/{contactId}/conversations
      const contactDocId = formData.id;
      if (contactDocId) {
        const pathsToCheck = [
          `contacts/${contactDocId}/conversations`,
          tenantId && tenantId !== '_master' 
            ? `tenants/${tenantId}/contacts/${contactDocId}/conversations` 
            : null
        ].filter(Boolean) as string[];

        for (const subPath of pathsToCheck) {
          try {
            const subSnap = await getDocs(collection(db, subPath));
            subSnap.forEach((docSnap) => {
              const data = docSnap.data();
              const msgs: ChatMessageItem[] = Array.isArray(data.messages) ? data.messages : [];
              if (msgs.length > 0) {
                loadedThreads.push({
                  id: docSnap.id,
                  title: data.botName || data.title || 'שיחות כרטיס לקוח',
                  lastUpdatedAt: data.lastUpdatedAt || Date.now(),
                  messages: msgs,
                  source: 'contact_subcollection',
                });
                collectedMessages.push(...msgs);
              }
            });
          } catch (e) {
            console.warn('[ContactWhatsAppTab] subcollection query error:', e);
          }
        }
      }

      // 2. Fetch from wa_bot_chats by phone or normalized phone
      const botChatPaths = [
        'wa_bot_chats',
        'kos_whatsup_bot_chats',
        tenantId && tenantId !== '_master' 
          ? `tenants/${tenantId}/kos_whatsup_bot_chats` 
          : null
      ].filter(Boolean) as string[];

      for (const colPath of botChatPaths) {
        try {
          const colRef = collection(db, colPath);
          
          // Try targetChatId direct lookup
          if (targetChatId) {
            try {
              const docSnap = await getDocs(query(colRef, where('phone', 'in', [normPhone, intlPhone, cleanDigits])));
              docSnap.forEach((d) => {
                const data = d.data();
                const msgs: ChatMessageItem[] = Array.isArray(data.messages) ? data.messages : [];
                if (msgs.length > 0 && !loadedThreads.some(t => t.id === d.id)) {
                  loadedThreads.push({
                    id: d.id,
                    title: data.botName || 'בוט וואטסאפ',
                    lastUpdatedAt: data.lastUpdatedAt?.toMillis ? data.lastUpdatedAt.toMillis() : (data.lastUpdatedAt || Date.now()),
                    messages: msgs,
                    source: colPath,
                  });
                  collectedMessages.push(...msgs);
                }
              });
            } catch {
              // Fallback query if 'in' operator fails
              const snap = await getDocs(query(colRef, where('phone', '==', normPhone)));
              snap.forEach((d) => {
                const data = d.data();
                const msgs: ChatMessageItem[] = Array.isArray(data.messages) ? data.messages : [];
                if (msgs.length > 0 && !loadedThreads.some(t => t.id === d.id)) {
                  loadedThreads.push({
                    id: d.id,
                    title: data.botName || 'בוט וואטסאפ',
                    lastUpdatedAt: data.lastUpdatedAt?.toMillis ? data.lastUpdatedAt.toMillis() : (data.lastUpdatedAt || Date.now()),
                    messages: msgs,
                    source: colPath,
                  });
                  collectedMessages.push(...msgs);
                }
              });
            }
          }
        } catch (e) {
          console.warn('[ContactWhatsAppTab] bot chat query error:', e);
        }
      }

      // 3. Deduplicate and chronologically sort all messages
      const seenKey = new Set<string>();
      const deduped: ChatMessageItem[] = [];

      for (const msg of collectedMessages) {
        const textKey = `${msg.role}_${msg.text.trim()}_${Math.floor((msg.timestamp || 0) / 1000)}`;
        if (!seenKey.has(textKey)) {
          seenKey.add(textKey);
          deduped.push(msg);
        }
      }

      deduped.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      setThreads(loadedThreads);
      setAllMessages(deduped);
    } catch (err) {
      console.error('[ContactWhatsAppTab] Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  }, [db, formData.id, normPhone, intlPhone, cleanDigits, targetChatId, tenantId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSendMessage = async () => {
    if (!outboundText.trim() || !intlPhone || isSending) return;

    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    const senderService = getCrmWhatsAppService();
    if (!senderService) {
      setSendError('שירות Green-API אינו מוגדר. יש להגדיר Instance ID ו-API Token בהגדרות המערכת.');
      setIsSending(false);
      return;
    }

    try {
      const now = Date.now();
      const sendRes = await senderService.sendMessage({
        chatId: targetChatId,
        message: outboundText.trim(),
      });

      if (sendRes.error) {
        setSendError(sendRes.error);
        setIsSending(false);
        return;
      }

      const newMsg: ChatMessageItem = {
        role: 'assistant',
        text: outboundText.trim(),
        timestamp: now,
        source: 'crm_manual',
      };

      // 1. Append to local state immediately
      setAllMessages(prev => [...prev, newMsg]);
      setOutboundText('');
      setSendSuccess('ההודעה נשלחה בהצלחה ונשמרה בלוג השיחות!');
      setTimeout(() => setSendSuccess(null), 3000);

      // 2. Persist to Firestore: contact's subcollection
      if (db && formData.id) {
        const convId = `conv_${normPhone}`;
        const contactSubPath = tenantId && tenantId !== '_master'
          ? `tenants/${tenantId}/contacts/${formData.id}/conversations`
          : `contacts/${formData.id}/conversations`;

        const existingUpdated = [...allMessages, newMsg];

        try {
          await setDoc(
            doc(db, contactSubPath, convId),
            {
              id: convId,
              contactId: formData.id,
              channel: 'whatsapp',
              lastUpdatedAt: now,
              messages: existingUpdated,
            },
            { merge: true }
          );

          // Update contact document with last_message
          const contactDocPath = tenantId && tenantId !== '_master'
            ? `tenants/${tenantId}/contacts/${formData.id}`
            : `contacts/${formData.id}`;

          await updateDoc(doc(db, contactDocPath), {
            last_message: outboundText.trim(),
            last_channel: 'whatsapp',
            last_conversation_date: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('[ContactWhatsAppTab] Could not persist message to contact subcollection:', dbErr);
        }

        // 3. Persist to wa_bot_chats
        try {
          const chatDocRef = doc(db, 'wa_bot_chats', targetChatId);
          await setDoc(
            chatDocRef,
            {
              id: targetChatId,
              phone: normPhone,
              contactName: formData.kosun_crm_name || formData.conta_name || normPhone,
              contactId: formData.id,
              lastUpdatedAt: now,
              messages: existingUpdated,
            },
            { merge: true }
          );
        } catch (waErr) {
          console.warn('[ContactWhatsAppTab] Could not persist to wa_bot_chats:', waErr);
        }
      }
    } catch (err: any) {
      setSendError(err?.message || 'שגיאה בשליחת הודעת וואטסאפ');
    } finally {
      setIsSending(false);
    }
  };

  const contactName = formData.kosun_crm_name || formData.conta_name || 'איש קשר';

  return (
    <div className="space-y-3" dir="rtl">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-xs">
              היסטוריית שיחות ואינטראקציות WhatsApp
            </h4>
            <p className="text-[11px] text-gray-400">
              כולל הודעות לקוח, מענה בוט AI, הודעות אוטומטיות מטפסי KSF ושליחה ישירה
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchConversations}
            disabled={loading}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition disabled:opacity-50"
            title="רענן היסטוריית שיחות"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Conversation Feed */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50 p-3 flex flex-col h-[340px] overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-400 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            <span>טוען היסטוריית שיחות WhatsApp...</span>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-gray-400 space-y-2">
            <MessageCircle className="w-10 h-10 opacity-30 text-emerald-500" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              עדיין לא תועדו שיחות עם איש קשר זה
            </p>
            <p className="text-[11px] max-w-sm text-gray-400">
              כאשר איש הקשר שולח הודעה לוואטסאפ, כשהבוט עונה לו, או כאשר נשלחת הודעת אוטומציה מטופס KSF – כל השיחות יתועדו כאן ברצף כרונולוגי.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2.5 p-1 pr-2">
            {allMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isKsfForm = msg.source === 'ksf_form';
              const isCrmManual = msg.source === 'crm_manual';

              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-2.5 shadow-xs text-xs space-y-1 ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tl-none'
                        : isKsfForm
                          ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 rounded-tr-none'
                          : isCrmManual
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 rounded-tr-none'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tr-none'
                    }`}
                  >
                    {/* Badge / Origin Header */}
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-80">
                      {isUser ? (
                        <>
                          <User className="w-3 h-3" />
                          <span>{contactName}</span>
                        </>
                      ) : isKsfForm ? (
                        <>
                          <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>טופס KSF{msg.formTitle ? `: ${msg.formTitle}` : ''}</span>
                        </>
                      ) : isCrmManual ? (
                        <>
                          <Send className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>נציג / שליחה מהמערכת</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>מענה בוט AI</span>
                        </>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                      {msg.text}
                    </div>

                    {/* Timestamp & Status */}
                    <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 pt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                      {isUser && <CheckCheck className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Status Messages */}
        {sendError && (
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5 mt-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{sendError}</span>
          </div>
        )}

        {sendSuccess && (
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5 mt-2">
            <CheckCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{sendSuccess}</span>
          </div>
        )}

        {/* Outbound Quick Send Bar */}
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <input
            type="text"
            value={outboundText}
            onChange={(e) => setOutboundText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={!cleanDigits || isSending}
            placeholder={
              cleanDigits
                ? `כתוב הודעת וואטסאפ ל-${contactName}...`
                : 'לא הוגדר מספר טלפון תקין לאיש קשר זה'
            }
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!cleanDigits || !outboundText.trim() || isSending}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">שלח</span>
          </button>
        </div>
      </div>
    </div>
  );
};
