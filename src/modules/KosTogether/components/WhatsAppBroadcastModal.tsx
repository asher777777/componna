import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Paperclip,
  Pause,
  Play,
  Square,
  Eye,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import {
  checkWhatsAppConnectionStatus,
  extractFileNameFromUrl,
  sendWhatsAppFileByUrl,
  sendWhatsAppMessageDetailed,
  sendWhatsAppPollDetailed,
  setGreenApiBulkDelay,
} from '../services/whatsappService';
import { addCommunityInteractionRecord } from '../services/firestoreService';
import { draftCommunityBroadcastMessage } from '../services/togetherCopilotService';
import { normalizePhoneNumber } from '../services/groupsUtils';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { useTenantScope } from '../../../core/tenant';
import { ContactRecord, SmartGroup } from '../types';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetContactIds?: string[];
}

type ProtectionPresetKey = 'safe' | 'cautious' | 'fast';

interface ProtectionPreset {
  key: ProtectionPresetKey;
  label: string;
  desc: string;
  minMs: number;
  maxMs: number;
  coolingEvery: number;
  coolingMs: number;
}

const PROTECTION_PRESETS: Record<ProtectionPresetKey, ProtectionPreset> = {
  safe: {
    key: 'safe',
    label: 'בטוח מומלץ (6–12 שנ׳)',
    desc: 'השהיה אקראית + הפסקת צינון כל 20 הודעות (מומלץ ע״י Green-API)',
    minMs: 6000,
    maxMs: 12000,
    coolingEvery: 20,
    coolingMs: 30000,
  },
  cautious: {
    key: 'cautious',
    label: 'זהיר מאוד (12–20 שנ׳)',
    desc: 'מתאים למספרים חדשים בתהליך חימום או רשימות גדולות',
    minMs: 12000,
    maxMs: 20000,
    coolingEvery: 15,
    coolingMs: 45000,
  },
  fast: {
    key: 'fast',
    label: 'מהיר (3–5 שנ׳)',
    desc: 'סיכון מוגבר לחסימה — מומלץ רק לרשימות קצרות ומאושרות',
    minMs: 3000,
    maxMs: 5000,
    coolingEvery: 25,
    coolingMs: 20000,
  },
};

const DAILY_RECOMMENDED_LIMIT = 200;

/**
 * Pure tag-replacement helper: guarantees dynamic tags ({{שם}}, {{קהילה}}, etc.)
 * are always replaced with the contact's actual values (or clean fallbacks), never raw tags.
 */
export function personalizeBroadcastText(
  template: string,
  contact: ContactRecord,
  activeGroup: SmartGroup,
  personalPageUrl: string
): string {
  if (!template) return '';
  const contactName =
    (contact.conta_name || contact.kosun_crm_name || contact.name || '').trim() || 'ידידי';
  const communityName = (activeGroup?.name || contact.community || '').trim();
  const donationAmount = Number(contact.total_spent || contact.campaign_amount || 0);
  const formattedDonation = donationAmount > 0 ? `₪${donationAmount.toLocaleString()}` : '₪0';
  const contactPhone = (contact.conta_phone || '').trim();
  const contactCity = (contact.mh_crm_city || contact.city || '').trim();

  return template
    .replace(/\{\{\s*(?:שם|conta_name|name)\s*\}\}|\{\s*(?:שם|conta_name|name)\s*\}/g, contactName)
    .replace(/\{\{\s*(?:קהילה|community_name)\s*\}\}|\{\s*(?:קהילה|community_name)\s*\}/g, communityName)
    .replace(/\{\{\s*סכום_שנתרם\s*\}\}|\{\s*סכום_שנתרם\s*\}/g, formattedDonation)
    .replace(/\{\{\s*קישור_אישי\s*\}\}|\{\s*קישור_אישי\s*\}/g, personalPageUrl)
    .replace(/\{\{\s*(?:טלפון|phone)\s*\}\}|\{\s*(?:טלפון|phone)\s*\}/g, contactPhone)
    .replace(/\{\{\s*(?:עיר|city)\s*\}\}|\{\s*(?:עיר|city)\s*\}/g, contactCity);
}

function getDailyQuotaStorageKey(tenantId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `kosun_${tenantId || 'default'}_wa_daily_sent_${today}`;
}

function readDailySentCount(tenantId: string): number {
  try {
    const val = localStorage.getItem(getDailyQuotaStorageKey(tenantId));
    return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

function incrementDailySentCount(tenantId: string, delta: number): number {
  try {
    const next = readDailySentCount(tenantId) + delta;
    localStorage.setItem(getDailyQuotaStorageKey(tenantId), String(next));
    return next;
  } catch {
    return delta;
  }
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url);
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  targetContactIds,
}) => {
  const { db, contacts, filteredContacts, activeGroup, greenApiConfig } = useCrmGroups();
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();
  const mediaPicker =
    getCapability<MediaPickerContract>('media-picker') ||
    getCapability<MediaPickerContract>('KosCloudStore');

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [mode, setMode] = useState<'text' | 'poll'>('text');

  // Text & Attachment State
  const [message, setMessage] = useState('');
  const [attachedFileUrl, setAttachedFileUrl] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [showManualFileUrl, setShowManualFileUrl] = useState(false);

  // Poll Broadcast State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>([
    'כן, אשמח להגיע!',
    'לא אוכל הפעם',
    'מעוניין במידע נוסף',
  ]);
  const [multipleAnswers, setMultipleAnswers] = useState(false);
  const [isDraftingWithAi, setIsDraftingWithAi] = useState(false);

  // Anti-Ban Protection & Sending State
  const [presetKey, setPresetKey] = useState<ProtectionPresetKey>('safe');
  const [confirmLargeBatch, setConfirmLargeBatch] = useState(false);
  const [dailySentCount, setDailySentCount] = useState(() => readDailySentCount(tenantId));
  const [sending, setSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    sent: number;
    success: number;
    failed: number;
    total: number;
  } | null>(null);

  const isCancelledRef = useRef(false);
  const isPausedRef = useRef(false);

  // Sync native <dialog> open/close state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      setDailySentCount(readDailySentCount(tenantId));
      setErrorBanner(null);
      setStatusMessage(null);
      setConfirmLargeBatch(false);
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, tenantId]);

  // Prevent Esc dismissal while actively sending
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      if (sending) {
        e.preventDefault();
      } else {
        onClose();
      }
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [sending, onClose]);

  // Deduplicate recipients by normalized phone number
  const { uniqueRecipients, duplicatesRemoved } = useMemo(() => {
    const baseList =
      targetContactIds && targetContactIds.length > 0
        ? contacts.filter((c) => targetContactIds.includes(c.id) && c.conta_phone)
        : filteredContacts.filter((c) => c.conta_phone);

    const seenPhones = new Set<string>();
    const deduped: ContactRecord[] = [];
    let dupCount = 0;

    for (const c of baseList) {
      const norm = normalizePhoneNumber(c.conta_phone || '');
      if (!norm || norm.length < 8) continue;
      if (seenPhones.has(norm)) {
        dupCount++;
        continue;
      }
      seenPhones.add(norm);
      deduped.push(c);
    }

    return { uniqueRecipients: deduped, duplicatesRemoved: dupCount };
  }, [contacts, filteredContacts, targetContactIds]);

  const personalPageUrl = useMemo(() => {
    return activeGroup.pageUrl
      ? `${window.location.origin}${activeGroup.pageUrl}`
      : `${window.location.origin}/c/${activeGroup.pageSlug || activeGroup.id}`;
  }, [activeGroup]);

  // Live preview for first recipient so user verifies tags resolve to real values
  const previewData = useMemo(() => {
    const sampleContact: ContactRecord = uniqueRecipients[0] || {
      id: 'sample',
      conta_name: 'ישראל ישראלי',
      conta_phone: '0501234567',
      total_spent: 500,
      mh_crm_city: 'תל אביב',
    };
    const raw = mode === 'text' ? message : pollQuestion;
    return {
      contactName: sampleContact.conta_name || 'ידידי',
      contactPhone: sampleContact.conta_phone || '',
      resolvedText: personalizeBroadcastText(raw, sampleContact, activeGroup, personalPageUrl),
    };
  }, [uniqueRecipients, mode, message, pollQuestion, activeGroup, personalPageUrl]);

  const hasPersonalizationTag = useMemo(() => {
    const raw = mode === 'text' ? message : pollQuestion;
    return /\{\{?\s*(?:שם|conta_name|name|קהילה|community_name|סכום_שנתרם|קישור_אישי|טלפון|עיר)\s*\}?\}/.test(
      raw
    );
  }, [mode, message, pollQuestion]);

  const projectedDailyTotal = dailySentCount + uniqueRecipients.length;
  const requiresSafetyConfirmation =
    uniqueRecipients.length > 30 || projectedDailyTotal > DAILY_RECOMMENDED_LIMIT;

  const handleOpenBrandingMediaPicker = async () => {
    if (!mediaPicker?.openPicker) {
      setShowManualFileUrl(true);
      return;
    }
    try {
      const selected = await mediaPicker.openPicker({
        accept: '*/*',
        multiple: false,
        initialTab: 'gallery',
      });
      if (selected) {
        const rawUrl = Array.isArray(selected)
          ? selected[0]
          : typeof selected === 'string'
          ? selected
          : (selected as any)?.url;
        if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim()) {
          const cleanUrl = rawUrl.trim();
          setAttachedFileUrl(cleanUrl);
          setAttachedFileName(extractFileNameFromUrl(cleanUrl));
          setShowManualFileUrl(false);
        }
      }
    } catch (err) {
      console.warn('[WhatsAppBroadcastModal] Branding media picker error:', err);
      setShowManualFileUrl(true);
    }
  };

  const handleDraftWithAi = async () => {
    try {
      setIsDraftingWithAi(true);
      const res = await draftCommunityBroadcastMessage({
        groupName: activeGroup.name || 'קהילת קושאן',
        topic:
          mode === 'poll'
            ? pollQuestion.trim() || 'פעילות הקהילה'
            : message.trim() || 'עדכון קהילתי',
        isPoll: mode === 'poll',
      });
      if (mode === 'text' && res.messageText) {
        setMessage(res.messageText);
      } else if (mode === 'poll') {
        if (res.pollQuestion) setPollQuestion(res.pollQuestion);
        if (res.pollOptions && res.pollOptions.length > 0) setPollOptions(res.pollOptions);
      }
    } catch (err) {
      console.error('Failed to draft broadcast with KOSAI:', err);
    } finally {
      setIsDraftingWithAi(false);
    }
  };

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

  const sleepWithAbort = async (ms: number) => {
    const step = 250;
    let elapsed = 0;
    while (elapsed < ms) {
      if (isCancelledRef.current) return;
      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 300));
        if (isCancelledRef.current) return;
      }
      await new Promise((r) => setTimeout(r, Math.min(step, ms - elapsed)));
      elapsed += step;
    }
  };

  const handleTogglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
    setStatusMessage(
      isPausedRef.current ? 'השידור מושהה — לחץ על "המשך" כדי להמשיך בבטחה' : 'ממשיך בשידור...'
    );
  };

  const handleStopBroadcast = () => {
    isCancelledRef.current = true;
    isPausedRef.current = false;
    setIsPaused(false);
    setStatusMessage('השידור הופסק על ידי המשתמש.');
  };

  const handleSendBroadcast = async () => {
    setErrorBanner(null);
    setStatusMessage(null);

    if (mode === 'text' && !message.trim() && !attachedFileUrl.trim()) {
      setErrorBanner('נא להזין תוכן להודעה או לצרף קובץ מרכיב המיתוג');
      return;
    }
    if (mode === 'poll' && !pollQuestion.trim()) {
      setErrorBanner('נא להזין את שאלת הסקר');
      return;
    }
    if (uniqueRecipients.length === 0) {
      setErrorBanner('אין אנשי קשר בעלי מספר טלפון תקין ברשימה');
      return;
    }
    if (requiresSafetyConfirmation && !confirmLargeBatch) {
      setErrorBanner('יש לאשר את הצהרת ההגנה לפני שליחה לכמות גדולה של נמענים');
      return;
    }

    // Pre-flight Green-API instance check
    setSending(true);
    setStatusMessage('בודק חיבור מול Green-API ומסנכרן מנגנון הגנה...');
    const conn = await checkWhatsAppConnectionStatus(greenApiConfig);
    if (conn.status !== 'authorized') {
      setSending(false);
      setStatusMessage(null);
      setErrorBanner(conn.error || 'חיבור ה-WhatsApp אינו מורשה. בדוק הגדרות Green-API.');
      return;
    }

    const preset = PROTECTION_PRESETS[presetKey];
    // Sync server-side FIFO queue delay in Green-API (best-effort)
    await setGreenApiBulkDelay(preset.minMs, greenApiConfig);

    setIsPaused(false);
    isCancelledRef.current = false;
    isPausedRef.current = false;
    setProgress({ sent: 0, success: 0, failed: 0, total: uniqueRecipients.length });

    let successCount = 0;
    let failedCount = 0;
    let consecutiveErrors = 0;

    for (let i = 0; i < uniqueRecipients.length; i++) {
      if (isCancelledRef.current) break;
      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 300));
        if (isCancelledRef.current) break;
      }
      if (isCancelledRef.current) break;

      const contact = uniqueRecipients[i];
      setStatusMessage(
        `שולח אל ${contact.conta_name || contact.conta_phone} (${i + 1}/${uniqueRecipients.length})...`
      );

      if (mode === 'text') {
        const personalized = personalizeBroadcastText(
          message,
          contact,
          activeGroup,
          personalPageUrl
        );

        const res = attachedFileUrl.trim()
          ? await sendWhatsAppFileByUrl(
              {
                phone: contact.conta_phone!,
                urlFile: attachedFileUrl.trim(),
                fileName: attachedFileName.trim() || extractFileNameFromUrl(attachedFileUrl),
                caption: personalized,
              },
              greenApiConfig
            )
          : await sendWhatsAppMessageDetailed(contact.conta_phone!, personalized, greenApiConfig);

        if (res.ok) {
          successCount++;
          consecutiveErrors = 0;
          const updatedDaily = incrementDailySentCount(tenantId, 1);
          setDailySentCount(updatedDaily);

          await addCommunityInteractionRecord(db, {
            contactId: contact.id,
            contactName: contact.conta_name,
            contactPhone: contact.conta_phone,
            type: 'whatsapp',
            title: `שידור וואטסאפ: ${activeGroup.name}`,
            content: attachedFileUrl.trim()
              ? `${personalized}\n[קובץ מצורף: ${attachedFileName || attachedFileUrl}]`
              : personalized,
            groupName: activeGroup.name,
            date: new Date().toISOString(),
            status: 'completed',
          });
        } else {
          failedCount++;
          consecutiveErrors++;
        }
      } else {
        const cleanOptions = pollOptions.filter((o) => o.trim().length > 0);
        const personalizedQuestion = personalizeBroadcastText(
          pollQuestion,
          contact,
          activeGroup,
          personalPageUrl
        );
        const res = await sendWhatsAppPollDetailed(
          contact.conta_phone!,
          personalizedQuestion,
          cleanOptions,
          multipleAnswers,
          greenApiConfig
        );
        if (res.ok) {
          successCount++;
          consecutiveErrors = 0;
          const updatedDaily = incrementDailySentCount(tenantId, 1);
          setDailySentCount(updatedDaily);

          await addCommunityInteractionRecord(db, {
            contactId: contact.id,
            contactName: contact.conta_name,
            contactPhone: contact.conta_phone,
            type: 'whatsapp',
            title: `סקר וואטסאפ: ${personalizedQuestion}`,
            content: `שאלת סקר: "${personalizedQuestion}"\nאפשרויות: ${cleanOptions.join(', ')}`,
            groupName: activeGroup.name,
            date: new Date().toISOString(),
            status: 'completed',
            metadata: { isPoll: true, pollQuestion: personalizedQuestion, options: cleanOptions },
          });
        } else {
          failedCount++;
          consecutiveErrors++;
        }
      }

      setProgress({
        sent: i + 1,
        success: successCount,
        failed: failedCount,
        total: uniqueRecipients.length,
      });

      // Circuit Breaker: auto-pause after 3 consecutive errors
      if (consecutiveErrors >= 3 && i < uniqueRecipients.length - 1) {
        isPausedRef.current = true;
        setIsPaused(true);
        setErrorBanner(
          'מנגנון ההגנה השהה את השידור אוטומטית עקב 3 שגיאות רצופות. בדוק את חיבור ה-WhatsApp לפני המשך.'
        );
      }

      // Human-like pacing + automatic cooling break between sends
      if (i < uniqueRecipients.length - 1 && !isCancelledRef.current) {
        const sentSoFar = i + 1;
        if (sentSoFar % preset.coolingEvery === 0) {
          const coolSec = Math.round(preset.coolingMs / 1000);
          setStatusMessage(
            `הפסקת צינון אוטומטית (${coolSec} שניות) למניעת חסימת חשבון...`
          );
          await sleepWithAbort(preset.coolingMs);
        } else {
          const jitterMs = Math.round(
            preset.minMs + Math.random() * (preset.maxMs - preset.minMs)
          );
          setStatusMessage(
            `המתנה בטוחה (${(jitterMs / 1000).toFixed(1)} שנ׳) לפני הנמען הבא...`
          );
          await sleepWithAbort(jitterMs);
        }
      }
    }

    setSending(false);
    setIsPaused(false);
    setStatusMessage(
      isCancelledRef.current
        ? `השידור נעצר: ${successCount} נשלחו בהצלחה, ${failedCount} נכשלו.`
        : `השידור הסתיים בהצלחה: ${successCount} מתוך ${uniqueRecipients.length} נשלחו.`
    );
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="wa-broadcast-title"
      {...({ closedby: sending ? 'none' : 'closerequest' } as any)}
      className="m-auto p-0 bg-transparent backdrop:bg-slate-900/80 backdrop:backdrop-blur-md max-w-2xl w-[calc(100%-1.5rem)] rounded-3xl sm:rounded-[2rem] shadow-2xl overflow-visible open:flex flex-col"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-right flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/kosun-symbol.svg"
              onError={(e: any) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/kosun-official-logo.png';
              }}
              alt="KOSUN"
              className="w-6 h-6 object-contain"
            />
            <div>
              <h1
                id="wa-broadcast-title"
                className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white"
              >
                KosTogether • שידור WhatsApp מוגן
              </h1>
              <p className="text-[10px] text-slate-500">
                העלאה מרכיב המיתוג • תגיות דינמיות • מנגנון Anti-Ban לפי Green-API
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !sending && onClose()}
            disabled={sending}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer disabled:opacity-40"
            title="סגור"
            aria-label="סגור חלון שידור וואטסאפ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center px-6 pt-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 gap-4">
          <button
            type="button"
            onClick={() => setMode('text')}
            disabled={sending}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              mode === 'text'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>הודעה + קובץ ממותג</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('poll')}
            disabled={sending}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              mode === 'poll'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>סקר וואטסאפ אינטראקטיבי</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Recipients & Daily Quota Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="block font-bold">
                  נמענים ייחודיים: <strong className="font-mono">{uniqueRecipients.length}</strong>
                </span>
                {duplicatesRemoved > 0 && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    נוקו {duplicatesRemoved} כפילויות טלפון
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md">
                Green API
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                projectedDailyTotal > DAILY_RECOMMENDED_LIMIT
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <div>
                <span className="block font-bold">מכסה יומית בטוחה</span>
                <span className="text-[10px] opacity-80">מומלץ עד {DAILY_RECOMMENDED_LIMIT} ליום</span>
              </div>
              <span className="font-mono font-extrabold text-xs">
                {dailySentCount} / {DAILY_RECOMMENDED_LIMIT}
              </span>
            </div>
          </div>

          {errorBanner && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorBanner}</span>
            </div>
          )}

          {mode === 'text' ? (
            <div className="space-y-3">
              {/* Message Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block">
                    תוכן ההודעה (או כיתוב לקובץ):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setMessage((prev) =>
                          prev.includes('הסר')
                            ? prev
                            : `${prev.trimEnd()}\n\nלהסרה מרשימת התפוצה השב "הסר"`
                        )
                      }
                      disabled={sending}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                    >
                      + אפשרות הסרה
                    </button>
                    <button
                      type="button"
                      onClick={handleDraftWithAi}
                      disabled={isDraftingWithAi || sending}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold flex items-center gap-1 border border-emerald-200 transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3 h-3 ${isDraftingWithAi ? 'animate-spin' : ''}`} />
                      <span>{isDraftingWithAi ? 'KOSAI מנסח...' : 'נסח עם KOSAI'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  rows={4}
                  placeholder="שלום {{שם}}, שמחים לעדכן אותך שבקהילת {{קהילה}} גייסנו כבר {{סכום_שנתרם}}! לעמוד הקהילה: {{קישור_אישי}}"
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none"
                />

                {/* Tag Quick Buttons */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 p-2.5 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    לחץ להוספת תגית דינמית (יוחלף אוטומטית בערך האישי של כל נמען):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { tag: '{{שם}}', label: 'שם הנמען' },
                      { tag: '{{קהילה}}', label: 'שם הקהילה' },
                      { tag: '{{סכום_שנתרם}}', label: 'סכום תרומה' },
                      { tag: '{{קישור_אישי}}', label: 'קישור לעמוד הקהילה' },
                      { tag: '{{טלפון}}', label: 'טלפון' },
                      { tag: '{{עיר}}', label: 'עיר' },
                    ].map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        disabled={sending}
                        onClick={() => setMessage((prev) => `${prev} ${t.tag} `)}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:border-emerald-300 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        {t.tag} ({t.label})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Branding / Media Picker Attachment Section */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      צירוף קובץ מרכיב המיתוג והמדיה (תמונה / PDF / וידאו)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleOpenBrandingMediaPicker}
                      disabled={sending}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition disabled:opacity-50"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>בחר / העלה מרכיב המיתוג</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualFileUrl((v) => !v)}
                      disabled={sending}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
                    >
                      קישור URL
                    </button>
                  </div>
                </div>

                {showManualFileUrl && (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      dir="ltr"
                      value={attachedFileUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttachedFileUrl(val);
                        if (val.trim() && !attachedFileName) {
                          setAttachedFileName(extractFileNameFromUrl(val));
                        }
                      }}
                      placeholder="https://example.com/flyer.pdf"
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                )}

                {attachedFileUrl.trim() && (
                  <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl p-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {isImageUrl(attachedFileUrl) ? (
                        <img
                          src={attachedFileUrl}
                          alt={attachedFileName || 'תצוגת קובץ'}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          type="text"
                          value={attachedFileName}
                          onChange={(e) => setAttachedFileName(e.target.value)}
                          disabled={sending}
                          placeholder="שם הקובץ לשליחה..."
                          className="w-full h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold"
                        />
                        <p className="text-[10px] text-slate-400 truncate" dir="ltr">
                          {attachedFileUrl}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => {
                        setAttachedFileUrl('');
                        setAttachedFileName('');
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                      title="הסר קובץ מצורף"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Poll Mode */
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block">
                    שאלת הסקר:
                  </label>
                  <button
                    type="button"
                    onClick={handleDraftWithAi}
                    disabled={isDraftingWithAi || sending}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold flex items-center gap-1 border border-emerald-200 transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isDraftingWithAi ? 'animate-spin' : ''}`} />
                    <span>{isDraftingWithAi ? 'KOSAI מנסח סקר...' : 'נסח סקר עם KOSAI'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  disabled={sending}
                  placeholder="היי {{שם}}, האם תרצה להצטרף למפגש השגרירים הקרוב?"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block">
                    אפשרויות תשובה:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    disabled={sending}
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>הוסף אפשרות</span>
                  </button>
                </div>

                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleUpdatePollOption(idx, e.target.value)}
                      disabled={sending}
                      placeholder={`אפשרות ${idx + 1}...`}
                      className="flex-1 h-8.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs focus:outline-none"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(idx)}
                        disabled={sending}
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
                  disabled={sending}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                />
                <label
                  htmlFor="multiAnswers"
                  className="text-xs text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                >
                  אפשר בחירת תשובות מרובות (Multiple Answers)
                </label>
              </div>
            </div>
          )}

          {/* Live Personalized Tag Preview */}
          {(mode === 'text' ? message.trim() : pollQuestion.trim()) && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>תצוגה מקדימה לנמען: {previewData.contactName}</span>
                </span>
                <span className="font-mono text-[10px] opacity-75" dir="ltr">
                  {previewData.contactPhone}
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900 whitespace-pre-wrap leading-relaxed">
                {previewData.resolvedText}
              </p>
            </div>
          )}

          {/* Anti-Ban Protection Mechanism Panel */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>מנגנון הגנה נגד חסימות (Green-API Anti-Ban)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                פעיל
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.values(PROTECTION_PRESETS) as ProtectionPreset[]).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  disabled={sending}
                  onClick={() => setPresetKey(p.key)}
                  className={`p-2.5 rounded-xl border text-right transition cursor-pointer ${
                    presetKey === p.key
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="font-bold text-[11px]">{p.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 leading-snug ${
                      presetKey === p.key ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>

            {uniqueRecipients.length > 5 && !hasPersonalizationTag && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  המלצת Green-API: שלב תגית דינמית כמו{' '}
                  <code className="font-mono font-bold">{'{{שם}}'}</code> כדי שכל הודעה תהיה ייחודית
                  ותמנע זיהוי ספאם.
                </span>
              </div>
            )}

            {requiresSafetyConfirmation && (
              <label className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmLargeBatch}
                  onChange={(e) => setConfirmLargeBatch(e.target.checked)}
                  disabled={sending}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600"
                />
                <span>
                  אני מאשר שנבחרו <strong>{uniqueRecipients.length}</strong> נמענים שהסכימו לקבל
                  עדכונים, ומבין ש-Green-API ממליצה על תקרה של עד {DAILY_RECOMMENDED_LIMIT} הודעות
                  ביום למספר.
                </span>
              </label>
            )}
          </div>

          {/* Live Status & Progress */}
          {(statusMessage || progress) && (
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2">
              {statusMessage && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
                  {sending ? (
                    <Clock className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{statusMessage}</span>
                </div>
              )}
              {progress && (
                <>
                  <div className="flex justify-between text-[11px] font-bold text-slate-300">
                    <span>
                      התקדמות: {progress.sent} / {progress.total} (הצליחו: {progress.success}
                      {progress.failed > 0 ? `, נכשלו: ${progress.failed}` : ''})
                    </span>
                    <span>{Math.round((progress.sent / progress.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer disabled:opacity-40"
          >
            {progress && !sending ? 'סגור' : 'ביטול'}
          </button>

          <div className="flex items-center gap-2">
            {sending && (
              <>
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'המשך' : 'השהה'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleStopBroadcast}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>עצור</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleSendBroadcast}
              disabled={sending || uniqueRecipients.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {sending
                  ? 'משדר בהגנה...'
                  : mode === 'text'
                  ? `שלח הודעה ל-${uniqueRecipients.length} נמענים`
                  : `שלח סקר ל-${uniqueRecipients.length} נמענים`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
