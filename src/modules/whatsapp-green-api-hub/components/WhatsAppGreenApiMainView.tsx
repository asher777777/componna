import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MessageSquare, Send, QrCode, Smartphone, Globe, RefreshCw, CheckCircle,
  AlertCircle, Server, Users, Image, BarChart2,
  ListFilter, ShieldCheck, Power, KeyRound, ExternalLink, Sun, Moon,
  Trash2, ArrowUpRight, Bot, Sparkles, Sliders, FolderOpen, UserCheck, Database, Search, Crown
} from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { GreenApiService } from '../services/greenApiService';
import {
  GreenApiState,
  GreenApiDeviceInfo,
  GreenApiChatMessage,
  GreenApiChat,
  GreenApiQueueItem,
} from '../types';
import { WhatsAppQrAuthModal } from './WhatsAppQrAuthModal';
import { WhatsAppPhoneAuthModal } from './WhatsAppPhoneAuthModal';
import { WhatsAppWebhookConfigModal } from './WhatsAppWebhookConfigModal';
import { WhatsAppInstanceModal } from './WhatsAppInstanceModal';
import { WhatsAppBulkSenderModal } from './WhatsAppBulkSenderModal';
import { WhatsAppWebChatView } from './WhatsAppWebChatView';
import { WhatsAppAiBotTab } from './WhatsAppAiBotTab';
import { WhatsAppStatusesTab } from './WhatsAppStatusesTab';
import { MediaPickerModal } from '../../media-gallery-hub/components/MediaPickerModal';
import { GeminiImageStudioModal } from '../../media-gallery-hub/components/GeminiImageStudioModal';

export const WhatsAppGreenApiMainView: React.FC = () => {
  const { apiKeys, openConnectorModal, db, collections, firebaseApp } = useSystemConnection();

  // Day / Night Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('comona_whatsapp_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('comona_whatsapp_theme', nextTheme);
    } catch {}
  };

  const isDark = theme === 'dark';

  // Active Tab - WhatsApp Web is default landing tab
  const [activeTab, setActiveTab] = useState<'webchat' | 'statuses' | 'aibots' | 'sender' | 'groups' | 'service'>('webchat');

  // Instance credentials pulled directly from central system connection
  const instanceId = apiKeys.greenApiInstanceId || '';
  const token = apiKeys.greenApiToken || '';
  const apiUrl = 'https://api.green-api.com';

  const greenApiService = useMemo(() => {
    return new GreenApiService({
      idInstance: instanceId,
      apiTokenInstance: token,
      apiUrl,
    });
  }, [instanceId, token, apiUrl]);

  // Instance Live State
  const [stateInstance, setStateInstance] = useState<GreenApiState>('unknown');
  const [deviceInfo, setDeviceInfo] = useState<GreenApiDeviceInfo | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Friendly display name for connected account (name/phone, never raw instance id)
  const connectedAccountDisplayName = useMemo(() => {
    if (deviceInfo?.pushName && deviceInfo?.phone) {
      return `${deviceInfo.pushName} (${deviceInfo.phone})`;
    }
    if (deviceInfo?.pushName) {
      return deviceInfo.pushName;
    }
    if (deviceInfo?.phone) {
      return `וואטסאפ (${deviceInfo.phone})`;
    }
    if ((apiKeys as any)?.whatsappAccountName) {
      return (apiKeys as any).whatsappAccountName;
    }
    return 'חשבון WhatsApp מחובר';
  }, [deviceInfo, apiKeys]);

  // Modals
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isAiImageStudioOpen, setIsAiImageStudioOpen] = useState(false);

  // Chats State
  const [chats, setChats] = useState<GreenApiChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Sender State
  const [sendType, setSendType] = useState<'text' | 'file_url' | 'poll' | 'buttons' | 'contact'>('text');
  const [targetChat, setTargetChat] = useState('');
  const [textMsg, setTextMsg] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('document.pdf');
  const [fileCaption, setFileCaption] = useState('');
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState(['אפשרות 1', 'אפשרות 2']);
  const [buttonsList, setButtonsList] = useState([
    { buttonId: 'btn_1', buttonText: 'אישור והמשך' },
    { buttonId: 'btn_2', buttonText: 'פנה לנציג' },
  ]);

  // Contact Sender State
  const [contactPhone, setContactPhone] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [crmContactsList, setCrmContactsList] = useState<Array<{ id: string; name: string; phone: string; company?: string }>>([]);
  const [isCrmPickerOpen, setIsCrmPickerOpen] = useState(false);
  const [crmContactSearch, setCrmContactSearch] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Groups State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPhones, setNewGroupPhones] = useState('');
  const [newParticipantPhone, setNewParticipantPhone] = useState('');

  // Service Tools State
  const [checkPhone, setCheckPhone] = useState('');
  const [checkResult, setCheckResult] = useState<{ checked: boolean; exists: boolean } | null>(null);
  const [queueItems, setQueueItems] = useState<GreenApiQueueItem[]>([]);

  // Auto-refresh state
  const refreshStatus = useCallback(async () => {
    if (!greenApiService.isConfigured()) return;
    setIsCheckingStatus(true);
    try {
      const res = await greenApiService.getStateInstance();
      setStateInstance(res.stateInstance);
      if (res.stateInstance === 'authorized') {
        const [info, chatList] = await Promise.all([
          greenApiService.getDeviceInfo(),
          greenApiService.getChats(),
        ]);
        setDeviceInfo(info);
        if (chatList && chatList.length > 0) {
          setChats(chatList);
          setSelectedChatId((prev) => {
            if (prev && chatList.some((c) => c.id === prev)) return prev;
            const firstContact = chatList.find((c) => !c.isGroup);
            return firstContact ? firstContact.id : chatList[0].id;
          });
        }
      }
    } catch {
      setStateInstance('unknown');
    } finally {
      setIsCheckingStatus(false);
    }
  }, [greenApiService]);

  useEffect(() => {
    if (greenApiService.isConfigured()) {
      refreshStatus();
    } else {
      setStateInstance('unknown');
      setDeviceInfo(null);
    }
  }, [greenApiService, refreshStatus]);

  // Handle bulk recipient sent: create/update chat room in chats list
  const handleBulkRecipientSent = (chatId: string, messageText: string, phone: string) => {
    setChats((prev) => {
      const index = prev.findIndex((c) => c.id === chatId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          lastMessage: messageText,
          timestamp: Date.now(),
        };
        return updated;
      } else {
        const newChat: GreenApiChat = {
          id: chatId,
          name: phone,
          isGroup: false,
          lastMessage: messageText,
          timestamp: Date.now(),
        };
        return [newChat, ...prev];
      }
    });
    setSelectedChatId(chatId);
  };

  const loadCrmContacts = async () => {
    if (!db) return;
    try {
      const coll = collection(db, collections?.contacts || 'contacts');
      const snap = await getDocs(query(coll));
      const items: Array<{ id: string; name: string; phone: string; company?: string }> = [];
      snap.forEach((d) => {
        const data = d.data();
        const phone = data.phone || data.phoneNumber || data.mobile || '';
        const name =
          data.name ||
          data.fullName ||
          data.contactName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
          'איש קשר';
        if (phone) {
          items.push({
            id: d.id,
            name,
            phone,
            company: data.company || data.businessName || data.organization || '',
          });
        }
      });
      setCrmContactsList(items);
    } catch (err) {
      console.warn('Failed to load CRM contacts:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!targetChat.trim()) {
      alert('נא להזין מספר טלפון או מזהה קבוצה');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    let res: any = null;
    try {
      if (sendType === 'text') {
        res = await greenApiService.sendMessage({ chatId: targetChat, message: textMsg });
      } else if (sendType === 'file_url') {
        res = await greenApiService.sendFileByUrl({
          chatId: targetChat,
          urlFile: fileUrl,
          fileName,
          caption: fileCaption,
        });
      } else if (sendType === 'poll') {
        res = await greenApiService.sendPoll({
          chatId: targetChat,
          message: pollTitle,
          options: pollOptions.map((o) => ({ optionName: o })),
        });
      } else if (sendType === 'buttons') {
        res = await greenApiService.sendButtons({
          chatId: targetChat,
          message: textMsg,
          buttons: buttonsList,
        });
      } else if (sendType === 'contact') {
        if (!contactPhone.trim()) {
          throw new Error('נא להזין מספר טלפון של איש הקשר');
        }
        res = await greenApiService.sendContact({
          chatId: targetChat,
          contact: {
            phoneContact: contactPhone.trim(),
            firstName: contactFirstName.trim() || 'איש קשר',
            lastName: contactLastName.trim(),
            company: contactCompany.trim(),
          },
        });
      }

      if (res && res.idMessage) {
        setSendResult({
          success: true,
          msg: `ההודעה שוגרה בהצלחה! מזהה: ${res.idMessage}`,
        });
        const summary =
          sendType === 'contact'
            ? `כרטיס איש קשר: ${contactFirstName} ${contactLastName}`
            : textMsg || fileName || pollTitle;
        handleBulkRecipientSent(targetChat, summary, targetChat.split('@')[0]);
        if (sendType === 'text') setTextMsg('');
        if (sendType === 'contact') {
          setContactPhone('');
          setContactFirstName('');
          setContactLastName('');
          setContactCompany('');
        }
      } else {
        throw new Error(res?.error || 'שגיאה בשליחת הודעה');
      }
    } catch (e: any) {
      setSendResult({
        success: false,
        msg: e.message || 'שגיאה בשיגור',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckNumber = async () => {
    if (!checkPhone.trim()) return;
    const res = await greenApiService.checkWhatsapp(checkPhone);
    setCheckResult({ checked: true, exists: res.existsWhatsapp });
  };

  // Dynamic theme classes
  const themeClasses = {
    container: isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    card: isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    headerCard: isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    subCard: isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200',
    input: isDark ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
    navBg: isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-200/80 border-slate-300',
    tabInactive: isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    textTitle: isDark ? 'text-white' : 'text-slate-900',
    border: isDark ? 'border-slate-800' : 'border-slate-200',
  };

  return (
    <div className={`min-h-screen ${themeClasses.container} p-3 sm:p-6 font-sans transition-colors duration-200`} dir="rtl">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Unconfigured Alert Banner */}
        {!greenApiService.isConfigured() && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-500">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">מופע WhatsApp (GREEN-API) עדיין אינו מוגדר במערכת</p>
                <p className="text-xs opacity-90">ההגדרות והמפתחות מנוהלים בצורה מרכזית ברכיב הסנכרון וההגדרות של המערכת.</p>
              </div>
            </div>
            <button
              onClick={() => openConnectorModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              <span>הגדר מפתחות מופע ו-Webhook</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Hub Header */}
        <div className={`${themeClasses.headerCard} border p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="flex items-center space-x-3.5 rtl:space-x-reverse">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`text-lg sm:text-xl font-black ${themeClasses.textTitle}`}>Comona WhatsApp & AI Automation</h1>
                
                {/* Instance Modal Opener Badge */}
                <button
                  onClick={() => setIsInstanceModalOpen(true)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 transition cursor-pointer ${
                    stateInstance === 'authorized'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20'
                  }`}
                  title="לחץ לפתיחת ניהול וסטטוס מופע"
                >
                  <span className={`w-2 h-2 rounded-full ${stateInstance === 'authorized' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{stateInstance === 'authorized' ? '● מחובר' : '○ לא מחובר'}</span>
                  <span className="text-[10px] opacity-70">({instanceId ? `#${instanceId}` : 'אין מופע'}) ⚙️</span>
                </button>
              </div>
              <p className={`text-xs ${themeClasses.textMuted} mt-0.5`}>
                צ'אט חי בסגנון WhatsApp Web, שליחה מרובה, בוטים חכמים מבוססי AI, וניהול מלא
              </p>
            </div>
          </div>

          {/* Quick Header Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Day / Night Mode Switch */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'מעבר לתצוגת יום' : 'מעבר לתצוגת לילה'}
              className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-700'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span>{isDark ? 'יום' : 'לילה'}</span>
            </button>

            {/* Quick Bulk Sender Button */}
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>שליחה מרובה</span>
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>חיבור QR</span>
            </button>

            <button
              onClick={() => setIsPhoneModalOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>קוד לטלפון</span>
            </button>

            <button
              onClick={() => setIsWebhookModalOpen(true)}
              className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-400 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Webhook</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border ${themeClasses.navBg} rounded-2xl p-1 text-xs gap-1 overflow-x-auto`}>
          <button
            onClick={() => setActiveTab('webchat')}
            className={`py-2.5 px-4 font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'webchat' ? 'bg-emerald-600 text-white shadow-md' : themeClasses.tabInactive
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 שיחות וצ'אט חי (WhatsApp Web)</span>
          </button>

          <button
            onClick={() => setActiveTab('statuses')}
            className={`py-2.5 px-4 font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'statuses' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : themeClasses.tabInactive
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-300" />
            <span>📱 סטטוסים ו-Stories</span>
          </button>

          <button
            onClick={() => setActiveTab('aibots')}
            className={`py-2.5 px-4 font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'aibots' ? 'bg-indigo-600 text-white shadow-md' : themeClasses.tabInactive
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>🤖 בוטים מבוססי AI וכפתורים</span>
          </button>

          <button
            onClick={() => setActiveTab('sender')}
            className={`py-2.5 px-4 font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'sender' ? 'bg-indigo-600 text-white shadow-md' : themeClasses.tabInactive
            }`}
          >
            <Send className="w-4 h-4" />
            <span>🚀 שיגור מתקדם (Omni-Sender)</span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`py-2.5 px-4 font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'groups' ? 'bg-indigo-600 text-white shadow-md' : themeClasses.tabInactive
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 ניהול קבוצות</span>
          </button>

          <button
            onClick={() => setActiveTab('service')}
            className={`py-2.5 px-4 font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'service' ? 'bg-indigo-600 text-white shadow-md' : themeClasses.tabInactive
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>🛡️ כלי שירות ותורים</span>
          </button>
        </div>

        {/* TAB 1: WHATSAPP WEB CHAT VIEW (PRIMARY LANDING TAB) */}
        {activeTab === 'webchat' && (
          <WhatsAppWebChatView
            service={greenApiService}
            isDark={isDark}
            onOpenBulkModal={() => setIsBulkModalOpen(true)}
            chats={chats}
            setChats={setChats}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            db={db}
            firebaseApp={firebaseApp}
            contactsCollectionName={collections?.contacts || 'contacts'}
            groupsCollectionName={collections?.groups || 'crm_groups'}
            connectedAccountName={connectedAccountDisplayName}
          />
        )}

        {/* TAB 2: WHATSAPP STATUSES & STORIES STUDIO & ARCHIVE */}
        {activeTab === 'statuses' && (
          <WhatsAppStatusesTab
            service={greenApiService}
            db={db}
            collectionName={collections?.whatsappStatuses || 'whatsapp_statuses'}
            isDark={isDark}
            connectedAccountName={connectedAccountDisplayName}
            googleAiApiKey={apiKeys.googleAiApiKey}
          />
        )}

        {/* TAB 3: AI BOTS & INTERACTIVE BUTTONS BUILDER */}
        {activeTab === 'aibots' && (
          <WhatsAppAiBotTab
            googleAiApiKey={apiKeys.googleAiApiKey}
            onOpenSettings={() => openConnectorModal()}
            isDark={isDark}
          />
        )}

        {/* TAB 3: SENDER */}
        {activeTab === 'sender' && (
          <div className={`p-5 ${themeClasses.card} border rounded-3xl space-y-4 text-xs`}>
            <h3 className={`font-bold ${themeClasses.textTitle} text-sm flex items-center gap-2`}>
              <Send className="w-4 h-4 text-indigo-500" />
              <span>מרכז שיגור הודעות ותכנים (Omni-Sender)</span>
            </h3>

            {/* Type selector */}
            <div className={`flex flex-wrap gap-2 border-b ${themeClasses.border} pb-3`}>
              {[
                { id: 'text', label: 'הודעת טקסט', icon: MessageSquare },
                { id: 'file_url', label: 'מדיה / קובץ לפי URL', icon: Image },
                { id: 'contact', label: 'כרטיס איש קשר (vCard)', icon: UserCheck },
                { id: 'poll', label: 'סקר וואטסאפ', icon: BarChart2 },
                { id: 'buttons', label: 'כפתורי מענה מהיר', icon: ListFilter },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSendType(t.id as any);
                      if (t.id === 'contact' && crmContactsList.length === 0) {
                        loadCrmContacts();
                      }
                    }}
                    className={`px-3 py-2 rounded-xl flex items-center gap-1.5 font-medium transition cursor-pointer ${
                      sendType === t.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : `${themeClasses.subCard} ${themeClasses.textMuted} hover:text-indigo-500`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Destination Chat */}
            <div>
              <label className={`block ${themeClasses.textTitle} font-semibold mb-1`}>
                יעד (מספר טלפון בינלאומי לדוגמה 972501234567 או מזהה קבוצה 123@g.us) *
              </label>
              <input
                type="text"
                value={targetChat}
                onChange={(e) => setTargetChat(e.target.value)}
                placeholder="972501234567 או 1203630...@g.us"
                className={`w-full p-2.5 rounded-xl border ${themeClasses.input} font-mono text-xs focus:border-indigo-500`}
                dir="ltr"
              />
            </div>

            {/* Content Fields based on type */}
            {sendType === 'text' && (
              <div>
                <label className={`block ${themeClasses.textTitle} font-semibold mb-1`}>תוכן ההודעה</label>
                <textarea
                  rows={4}
                  value={textMsg}
                  onChange={(e) => setTextMsg(e.target.value)}
                  placeholder="הקלד כאן את תוכן ההודעה..."
                  className={`w-full p-3 rounded-xl border ${themeClasses.input} text-xs focus:border-indigo-500`}
                />
              </div>
            )}

            {sendType === 'contact' && (
              <div className="space-y-3">
                {/* CRM quick picker */}
                <div className={`p-3 rounded-2xl border space-y-2 ${themeClasses.subCard}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      <span>בחירה מהירה ממאגר ה-CRM</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCrmPickerOpen(!isCrmPickerOpen);
                        if (!crmContactsList.length) loadCrmContacts();
                      }}
                      className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold cursor-pointer transition"
                    >
                      {isCrmPickerOpen ? 'סגור רשימה' : `בחר מ-CRM (${crmContactsList.length || 'טען'})`}
                    </button>
                  </div>

                  {isCrmPickerOpen && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/40">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={crmContactSearch}
                          onChange={(e) => setCrmContactSearch(e.target.value)}
                          placeholder="חפש לפי שם או טלפון ב-CRM..."
                          className={`w-full pr-8 pl-3 py-1.5 rounded-xl border text-xs ${themeClasses.input}`}
                        />
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1">
                        {crmContactsList.length === 0 ? (
                          <p className="text-center py-2 text-slate-500 text-[11px]">לא נמצאו אנשי קשר ב-CRM</p>
                        ) : (
                          crmContactsList
                            .filter(
                              (c) =>
                                c.name.toLowerCase().includes(crmContactSearch.toLowerCase()) ||
                                c.phone.includes(crmContactSearch) ||
                                (c.company && c.company.toLowerCase().includes(crmContactSearch.toLowerCase()))
                            )
                            .slice(0, 15)
                            .map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  const parts = c.name.split(' ');
                                  setContactFirstName(parts[0] || c.name);
                                  setContactLastName(parts.slice(1).join(' ') || '');
                                  setContactPhone(c.phone);
                                  setContactCompany(c.company || '');
                                  setIsCrmPickerOpen(false);
                                }}
                                className={`w-full text-right p-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                                  isDark ? 'hover:bg-slate-800 bg-slate-900/50' : 'hover:bg-slate-100 bg-white'
                                }`}
                              >
                                <div>
                                  <span className="font-bold block">{c.name}</span>
                                  {c.company && <span className="text-[10px] text-slate-400 block">{c.company}</span>}
                                </div>
                                <span className="font-mono text-[11px] text-emerald-400" dir="ltr">{c.phone}</span>
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block ${themeClasses.textTitle} font-semibold mb-1`}>שם פרטי / מלא *</label>
                    <input
                      type="text"
                      value={contactFirstName}
                      onChange={(e) => setContactFirstName(e.target.value)}
                      placeholder="ישראל"
                      className={`w-full p-2.5 rounded-xl border ${themeClasses.input} text-xs`}
                    />
                  </div>
                  <div>
                    <label className={`block ${themeClasses.textMuted} font-medium mb-1`}>שם משפחה</label>
                    <input
                      type="text"
                      value={contactLastName}
                      onChange={(e) => setContactLastName(e.target.value)}
                      placeholder="ישראלי"
                      className={`w-full p-2.5 rounded-xl border ${themeClasses.input} text-xs`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block ${themeClasses.textTitle} font-semibold mb-1`}>טלפון של איש הקשר (בינלאומי) *</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="972501234567 או 0501234567"
                      className={`w-full p-2.5 rounded-xl border ${themeClasses.input} font-mono text-xs`}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={`block ${themeClasses.textMuted} font-medium mb-1`}>חברה / ארגון (אופציונלי)</label>
                    <input
                      type="text"
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      placeholder="קומונה בע״מ"
                      className={`w-full p-2.5 rounded-xl border ${themeClasses.input} text-xs`}
                    />
                  </div>
                </div>
              </div>
            )}

            {sendType === 'file_url' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block ${themeClasses.textTitle} font-semibold`}>קישור ישיר לקובץ / מדיה (URL)</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>📂 גלריה</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAiImageStudioOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black rounded-lg text-xs font-black transition shadow-sm cursor-pointer"
                        title="מחולל תמונות ופרומפטים ב-AI (פונקציית PRO למנויים משודרגים)"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
                        <span>✨ צור תמונה עם AI (PRO)</span>
                      </button>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg או https://...firebasestorage..."
                    className={`w-full p-2.5 rounded-xl border ${themeClasses.input} font-mono text-xs focus:border-indigo-500`}
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block ${themeClasses.textMuted} font-medium mb-1`}>שם הקובץ (כולל סיומת)</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="image.png / document.pdf"
                      className={`w-full p-2 rounded-xl border ${themeClasses.input} font-mono text-xs`}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={`block ${themeClasses.textMuted} font-medium mb-1`}>כתובית למדיה (Caption)</label>
                    <input
                      type="text"
                      value={fileCaption}
                      onChange={(e) => setFileCaption(e.target.value)}
                      placeholder="כתובית שתוצג מתחת לתמונה/וידאו"
                      className={`w-full p-2 rounded-xl border ${themeClasses.input} text-xs`}
                    />
                  </div>
                </div>
              </div>
            )}

            {sendType === 'poll' && (
              <div className="space-y-3">
                <div>
                  <label className={`block ${themeClasses.textTitle} font-semibold mb-1`}>שאלת הסקר</label>
                  <input
                    type="text"
                    value={pollTitle}
                    onChange={(e) => setPollTitle(e.target.value)}
                    placeholder="מה דעתך על השירות שלנו?"
                    className={`w-full p-2.5 rounded-xl border ${themeClasses.input} text-xs`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${themeClasses.textMuted} font-medium`}>אפשרויות בחירה בסקר:</label>
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        className={`flex-1 p-2 rounded-xl border ${themeClasses.input} text-xs`}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-600 p-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, `אפשרות ${pollOptions.length + 1}`])}
                    className="text-indigo-500 hover:underline text-xs font-semibold cursor-pointer"
                  >
                    + הוסף אפשרות לסקר
                  </button>
                </div>
              </div>
            )}

            {sendType === 'buttons' && (
              <div className="space-y-3">
                <div>
                  <label className={`block ${themeClasses.textTitle} font-semibold mb-1`}>תוכן ההודעה מעל הכפתורים</label>
                  <textarea
                    rows={3}
                    value={textMsg}
                    onChange={(e) => setTextMsg(e.target.value)}
                    placeholder="אנא בחר אחת מהאפשרויות הבאות:"
                    className={`w-full p-2.5 rounded-xl border ${themeClasses.input} text-xs`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${themeClasses.textMuted} font-medium`}>כפתורי בחירה:</label>
                  {buttonsList.map((btn, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={btn.buttonText}
                        onChange={(e) => {
                          const updated = [...buttonsList];
                          updated[idx].buttonText = e.target.value;
                          setButtonsList(updated);
                        }}
                        placeholder="טקסט כפתור"
                        className={`flex-1 p-2 rounded-xl border ${themeClasses.input} text-xs`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Button & Status */}
            <div className={`pt-2 flex flex-wrap items-center justify-between gap-3 border-t ${themeClasses.border}`}>
              <button
                onClick={handleSendMessage}
                disabled={isSending}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
                <span>{isSending ? 'משגר הודעה...' : 'שגר עכשיו'}</span>
              </button>

              {sendResult && (
                <div className={`flex items-center gap-1.5 text-xs font-medium ${
                  sendResult.success ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {sendResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{sendResult.msg}</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: GROUPS */}
        {activeTab === 'groups' && (
          <div className={`p-5 ${themeClasses.card} border rounded-3xl space-y-4 text-xs`}>
            <h3 className={`font-bold ${themeClasses.textTitle} text-sm flex items-center gap-2`}>
              <Users className="w-4 h-4 text-indigo-500" />
              <span>יצירה וניהול קבוצות WhatsApp</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Create Group Box */}
              <div className={`p-4 ${themeClasses.subCard} rounded-2xl border space-y-3`}>
                <h4 className={`font-bold ${themeClasses.textTitle}`}>יצירת קבוצה חדשה</h4>
                <div>
                  <label className={`block ${themeClasses.textMuted} mb-1`}>שם הקבוצה</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="שם הקבוצה החדשה"
                    className={`w-full p-2 rounded-xl border ${themeClasses.input} text-xs`}
                  />
                </div>
                <div>
                  <label className={`block ${themeClasses.textMuted} mb-1`}>מספרי טלפון של משתתפים (מופרדים בפסיק)</label>
                  <input
                    type="text"
                    value={newGroupPhones}
                    onChange={(e) => setNewGroupPhones(e.target.value)}
                    placeholder="972501234567, 972521234567"
                    className={`w-full p-2 rounded-xl border ${themeClasses.input} font-mono text-xs`}
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!newGroupName.trim()) return;
                    const phones = newGroupPhones
                      .split(',')
                      .map((p) => `${p.trim().replace(/\D/g, '')}@c.us`)
                      .filter((p) => p.length > 5);
                    const res = await greenApiService.createGroup(newGroupName, phones);
                    if (res && res.chatId) {
                      alert(`קבוצה נוצרה בהצלחה! מזהה: ${res.chatId}`);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  צור קבוצה עכשיו
                </button>
              </div>

              {/* Group Participant Management */}
              <div className={`p-4 ${themeClasses.subCard} rounded-2xl border space-y-3`}>
                <h4 className={`font-bold ${themeClasses.textTitle}`}>הוספת משתתף לקבוצה קיימת</h4>
                <div>
                  <label className={`block ${themeClasses.textMuted} mb-1`}>מזהה הקבוצה (Group ID)</label>
                  <input
                    type="text"
                    value={targetChat}
                    onChange={(e) => setTargetChat(e.target.value)}
                    placeholder="1203630...@g.us"
                    className={`w-full p-2 rounded-xl border ${themeClasses.input} font-mono text-xs`}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className={`block ${themeClasses.textMuted} mb-1`}>מספר טלפון להוספה</label>
                  <input
                    type="text"
                    value={newParticipantPhone}
                    onChange={(e) => setNewParticipantPhone(e.target.value)}
                    placeholder="972501234567"
                    className={`w-full p-2 rounded-xl border ${themeClasses.input} font-mono text-xs`}
                    dir="ltr"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!targetChat || !newParticipantPhone) return;
                      await greenApiService.addGroupParticipant(
                        targetChat,
                        `${newParticipantPhone.replace(/\D/g, '')}@c.us`
                      );
                      alert('משתתף נוסף בהצלחה!');
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    הוסף לקבוצה
                  </button>
                  <button
                    onClick={async () => {
                      if (!targetChat || !newParticipantPhone) return;
                      await greenApiService.setGroupAdmin(
                        targetChat,
                        `${newParticipantPhone.replace(/\D/g, '')}@c.us`
                      );
                      alert('הוגדר כמנהל קבוצה!');
                    }}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    מנה כמנהל
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SERVICE TOOLS & QUEUES */}
        {activeTab === 'service' && (
          <div className={`p-5 ${themeClasses.card} border rounded-3xl space-y-4 text-xs`}>
            <h3 className={`font-bold ${themeClasses.textTitle} text-sm flex items-center gap-2`}>
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>כלי שירות, בדיקת מספרי וואטסאפ וניהול תורים</span>
            </h3>

            {/* Check Number */}
            <div className={`p-4 ${themeClasses.subCard} rounded-2xl border space-y-3`}>
              <h4 className={`font-bold ${themeClasses.textTitle}`}>אימות מספר טלפון ב-WhatsApp (Check WhatsApp)</h4>
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={checkPhone}
                  onChange={(e) => setCheckPhone(e.target.value)}
                  placeholder="972501234567"
                  className={`flex-1 p-2.5 rounded-xl border ${themeClasses.input} font-mono text-xs`}
                  dir="ltr"
                />
                <button
                  onClick={handleCheckNumber}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer shrink-0"
                >
                  בדוק קיום
                </button>
              </div>

              {checkResult && (
                <div className={`p-2.5 rounded-xl text-xs font-bold ${
                  checkResult.exists
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                }`}>
                  {checkResult.exists ? '✓ המספר רשום ופעיל ב-WhatsApp' : '✗ המספר אינו רשום ב-WhatsApp'}
                </div>
              )}
            </div>

            {/* Queue Management */}
            <div className={`p-4 ${themeClasses.subCard} rounded-2xl border space-y-3`}>
              <div className={`flex items-center justify-between border-b ${themeClasses.border} pb-2`}>
                <h4 className={`font-bold ${themeClasses.textTitle}`}>תור הודעות יוצאות (Queue)</h4>
                <button
                  onClick={async () => {
                    await greenApiService.clearMessagesQueue();
                    alert('התור רוקן!');
                    greenApiService.showMessagesQueue().then(setQueueItems);
                  }}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>רוקן תור הודעות</span>
                </button>
              </div>

              {queueItems.length === 0 ? (
                <p className={themeClasses.textMuted}>תור ההודעות ריק כעת.</p>
              ) : (
                <div className="space-y-1.5">
                  {queueItems.map((q) => (
                    <div key={q.idMessage} className={`p-2 ${themeClasses.card} border rounded-lg flex justify-between`}>
                      <span className="font-mono">{q.chatId}</span>
                      <span className={themeClasses.textMuted}>{q.statusMessage}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 1. Instance Settings & Status Modal */}
        <WhatsAppInstanceModal
          isOpen={isInstanceModalOpen}
          onClose={() => setIsInstanceModalOpen(false)}
          service={greenApiService}
          instanceId={instanceId}
          token={token}
          webhookUrl={apiKeys.customWebhookUrl}
          stateInstance={stateInstance}
          deviceInfo={deviceInfo}
          isCheckingStatus={isCheckingStatus}
          onRefresh={refreshStatus}
          onOpenSettings={() => openConnectorModal()}
          isDark={isDark}
        />

        {/* 2. Bulk Broadcast Campaign Modal (Auto-creates chat rooms) */}
        <WhatsAppBulkSenderModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          service={greenApiService}
          db={db}
          isDark={isDark}
          onRecipientSent={handleBulkRecipientSent}
        />

        {/* 3. QR Auth Modal */}
        <WhatsAppQrAuthModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          service={greenApiService}
          onAuthorized={refreshStatus}
        />

        {/* 4. Phone OTP Auth Modal */}
        <WhatsAppPhoneAuthModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          service={greenApiService}
          onAuthorized={refreshStatus}
        />

        {/* 5. Webhook Config Modal */}
        <WhatsAppWebhookConfigModal
          isOpen={isWebhookModalOpen}
          onClose={() => setIsWebhookModalOpen(false)}
          service={greenApiService}
          currentWebhookUrl={apiKeys.customWebhookUrl}
          onSaved={() => {
            refreshStatus();
          }}
        />

        {/* 6. Media Gallery Picker for Sender Tab */}
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelectMedia={(items) => {
            if (items && items.length > 0) {
              setFileUrl(items[0].url);
              setFileName(items[0].name || 'file.pdf');
              if (items[0].name && !fileCaption) {
                setFileCaption(items[0].name);
              }
            }
            setIsMediaPickerOpen(false);
          }}
          allowedTypes={['image', 'video', 'document', 'audio']}
          title="בחר מדיה לשליחה בוואטסאפ"
        />

        {/* 7. Gemini AI Image & Prompt Studio Modal (PRO Feature) */}
        <GeminiImageStudioModal
          isOpen={isAiImageStudioOpen}
          onClose={() => setIsAiImageStudioOpen(false)}
          title="סטודיו יצירת תמונות AI ל-WhatsApp"
          subtitle="מחולל תמונות ופרומפטים מתקדם עם Gemini AI (פונקציה בלעדית למנויים משודרגים)"
          useButtonLabel="שבץ תמונה זו לשיגור"
          defaultAspectRatio="1:1"
          onUseImage={(imageUrl, meta) => {
            setSendType('file_url');
            setFileUrl(imageUrl);
            setFileName(`${(meta.title || 'ai_image').replace(/[^\w\u0590-\u05FF]/g, '_')}.png`);
            setFileCaption(meta.title || meta.prompt || 'נוצר באמצעות AI Studio');
          }}
        />

      </div>
    </div>
  );
};
