import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare, Send, Search, Users, Phone, Video, MoreVertical,
  Paperclip, Smile, Check, CheckCheck, RefreshCw, Plus, Sparkles,
  ExternalLink, Image, FileText, ArrowRight, UserPlus, Filter,
  CheckSquare, Square, Database, UserCheck, Tag, DownloadCloud, X, FolderOpen
} from 'lucide-react';
import { Firestore } from 'firebase/firestore';
import { GreenApiService } from '../services/greenApiService';
import { GreenApiChat, GreenApiChatMessage } from '../types';
import { WhatsAppBulkSenderModal } from './WhatsAppBulkSenderModal';
import { WhatsAppCrmExportModal } from './WhatsAppCrmExportModal';
import { WhatsAppDynamicBroadcastModal } from './WhatsAppDynamicBroadcastModal';
import { MediaPickerModal } from '../../media-gallery-hub/components/MediaPickerModal';
import { MediaItem } from '../../media-gallery-hub/types';

interface Props {
  service: GreenApiService;
  isDark: boolean;
  onOpenBulkModal: () => void;
  chats: GreenApiChat[];
  setChats: React.Dispatch<React.SetStateAction<GreenApiChat[]>>;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  db?: Firestore;
  contactsCollectionName?: string;
  groupsCollectionName?: string;
  connectedAccountName?: string;
}

export const WhatsAppWebChatView: React.FC<Props> = ({
  service,
  isDark,
  onOpenBulkModal,
  chats,
  setChats,
  selectedChatId,
  setSelectedChatId,
  db,
  contactsCollectionName = 'contacts',
  groupsCollectionName = 'crm_groups',
  connectedAccountName = '',
}) => {
  const [messages, setMessages] = useState<GreenApiChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fast 120ms debounce on search term to ensure smooth 60fps input response
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 120);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  // Filter tabs: 'contacts' (default 1-on-1 chats), 'groups', 'selected'
  const [chatFilter, setChatFilter] = useState<'contacts' | 'groups' | 'selected'>('contacts');

  const handleTabChange = (newFilter: 'contacts' | 'groups' | 'selected') => {
    setChatFilter(newFilter);
    if (newFilter === 'contacts') {
      const current = chats.find((c) => c.id === selectedChatId);
      if (!current || current.isGroup) {
        const firstContact = chats.find((c) => !c.isGroup);
        if (firstContact) setSelectedChatId(firstContact.id);
      }
    } else if (newFilter === 'groups') {
      const current = chats.find((c) => c.id === selectedChatId);
      if (!current || !current.isGroup) {
        const firstGroup = chats.find((c) => c.isGroup);
        if (firstGroup) setSelectedChatId(firstGroup.id);
      }
    }
  };
  
  // Multi-selection state
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  // Modals for CRM export and Dynamic Broadcast
  const [isCrmExportModalOpen, setIsCrmExportModalOpen] = useState(false);
  const [isDynamicBroadcastOpen, setIsDynamicBroadcastOpen] = useState(false);
  const [exportSourceGroupName, setExportSourceGroupName] = useState('');
  const [customExportList, setCustomExportList] = useState<GreenApiChat[] | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // New Chat Input State
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatInitialMsg, setNewChatInitialMsg] = useState('');

  // Attach File Modal State
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isAttachMediaPickerOpen, setIsAttachMediaPickerOpen] = useState(false);
  const [attachUrl, setAttachUrl] = useState('');
  const [attachFileName, setAttachFileName] = useState('document.pdf');
  const [attachCaption, setAttachCaption] = useState('');

  const [isRefreshingChats, setIsRefreshingChats] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const refreshChats = async () => {
    if (!service.isConfigured()) return;
    setIsRefreshingChats(true);
    try {
      const list = await service.getChats();
      if (list && list.length > 0) {
        setChats(list);
        if (selectedChatId) {
          const current = list.find((c) => c.id === selectedChatId);
          if (!current || (chatFilter === 'groups' ? !current.isGroup : current.isGroup)) {
            const matching = list.find((c) => (chatFilter === 'groups' ? c.isGroup : !c.isGroup));
            if (matching) setSelectedChatId(matching.id);
          }
        } else {
          const matching = list.find((c) => (chatFilter === 'groups' ? c.isGroup : !c.isGroup));
          setSelectedChatId(matching ? matching.id : (list[0]?.id || null));
        }
      }
    } catch (e) {
      console.warn('Failed to refresh chats:', e);
    } finally {
      setIsRefreshingChats(false);
    }
  };

  // Load chats on mount
  useEffect(() => {
    refreshChats();
  }, [service]);

  // Load chat history when selectedChatId changes
  useEffect(() => {
    if (selectedChatId && service.isConfigured()) {
      setIsLoadingMessages(true);
      service.getChatHistory(selectedChatId, 50).then((msgs) => {
        setMessages(msgs || []);
        setIsLoadingMessages(false);
        setTimeout(scrollToBottom, 100);
      });
    } else {
      setMessages([]);
    }
  }, [selectedChatId, service]);

  const handleSendMessage = async () => {
    if (!selectedChatId || !inputMessage.trim() || isSending) return;

    const currentMsg = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await service.sendMessage({
        chatId: selectedChatId,
        message: currentMsg,
      });

      if (res && res.idMessage) {
        const optimisticMsg: GreenApiChatMessage = {
          idMessage: res.idMessage,
          timestamp: Math.floor(Date.now() / 1000),
          type: 'outgoing',
          chatId: selectedChatId,
          textMessage: currentMsg,
          statusMessage: 'sent',
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setTimeout(scrollToBottom, 50);

        setChats((prev) =>
          prev.map((c) =>
            c.id === selectedChatId
              ? { ...c, lastMessage: currentMsg, timestamp: Date.now() }
              : c
          )
        );
      }
    } catch (err: any) {
      alert(`שגיאה בשליחת הודעה: ${err.message || 'שגיאת חיבור'}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendAttachment = async () => {
    if (!selectedChatId || !attachUrl.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await service.sendFileByUrl({
        chatId: selectedChatId,
        urlFile: attachUrl.trim(),
        fileName: attachFileName.trim() || 'file.pdf',
        caption: attachCaption.trim(),
      });

      if (res && res.idMessage) {
        setIsAttachModalOpen(false);
        setAttachUrl('');
        setAttachCaption('');
        service.getChatHistory(selectedChatId, 50).then((msgs) => {
          setMessages(msgs || []);
          setTimeout(scrollToBottom, 100);
        });
      }
    } catch (err: any) {
      alert(`שגיאה בשיגור קובץ: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatPhone.trim()) return;
    const cleanPhone = newChatPhone.replace(/\D/g, '');
    const chatId = `${cleanPhone}@c.us`;

    const existing = chats.find((c) => c.id === chatId);
    if (!existing) {
      const newChat: GreenApiChat = {
        id: chatId,
        name: cleanPhone,
        isGroup: false,
        lastMessage: newChatInitialMsg.trim() || 'שיחה חדשה',
        timestamp: Date.now(),
      };
      setChats((prev) => [newChat, ...prev]);
    }

    setSelectedChatId(chatId);
    setIsNewChatModalOpen(false);

    if (newChatInitialMsg.trim()) {
      await service.sendMessage({ chatId, message: newChatInitialMsg.trim() });
      service.getChatHistory(chatId, 50).then(setMessages);
    }
    setNewChatPhone('');
    setNewChatInitialMsg('');
  };

  // Toggle single contact selection
  const toggleContactSelection = (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) {
        next.delete(chatId);
      } else {
        next.add(chatId);
      }
      return next;
    });
  };

  // Select all visible contacts in current filter
  const handleSelectAllVisible = () => {
    const visibleIds = filteredChats.map((c) => c.id);
    const allSelected = visibleIds.every((id) => selectedContactIds.has(id));
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Filtered and searched chats with high-performance memoization
  const filteredChats = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const queryDigits = debouncedSearch.replace(/\D/g, '');

    return chats.filter((c) => {
      // 1. Tab filter
      if (chatFilter === 'contacts' && c.isGroup) return false;
      if (chatFilter === 'groups' && !c.isGroup) return false;
      if (chatFilter === 'selected' && !selectedContactIds.has(c.id)) return false;

      // If search query is empty, match everything in this tab
      if (!query) return true;

      // 2. Search in Name
      if (c.name && c.name.toLowerCase().includes(query)) return true;

      // 3. Search in Contact Name / Phonebook Name
      if (c.contactName && c.contactName.toLowerCase().includes(query)) return true;

      // 4. Search in Last Message / Text snippet from conversation
      if (c.lastMessage && c.lastMessage.toLowerCase().includes(query)) return true;

      // 5. Search in Chat ID (raw)
      if (c.id && c.id.toLowerCase().includes(query)) return true;

      // 6. Search by Phone Digits (e.g. 052-696-8008, 972526968008, 526968008)
      if (queryDigits.length >= 2) {
        const idDigits = c.id.replace(/\D/g, '');
        if (idDigits.includes(queryDigits)) return true;

        const normalizedId = idDigits.startsWith('972') ? idDigits.slice(3) : idDigits.startsWith('0') ? idDigits.slice(1) : idDigits;
        const normalizedQuery = queryDigits.startsWith('972') ? queryDigits.slice(3) : queryDigits.startsWith('0') ? queryDigits.slice(1) : queryDigits;
        if (normalizedId && normalizedQuery && normalizedId.includes(normalizedQuery)) return true;
      }

      return false;
    });
  }, [chats, chatFilter, debouncedSearch, selectedContactIds]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  // Selected chat objects for CRM export / Broadcast
  const selectedChatObjects = chats.filter((c) => selectedContactIds.has(c.id));

  // Extract group participants and sync to CRM
  const handleExtractGroupToCrm = async (groupChat: GreenApiChat) => {
    try {
      const groupData = await service.getGroupData(groupChat.id);
      let participantChats: GreenApiChat[] = [];

      if (groupData && groupData.participants && groupData.participants.length > 0) {
        participantChats = groupData.participants.map((p) => ({
          id: p.id,
          name: p.id.split('@')[0],
          isGroup: false,
          timestamp: Date.now(),
        }));
      } else {
        // Fallback: extract sender IDs from recent group messages
        const recentMsgs = await service.getChatHistory(groupChat.id, 100);
        const uniqueSenders = new Map<string, string>();
        recentMsgs.forEach((m) => {
          if (m.senderId && m.senderId.includes('@c.us')) {
            uniqueSenders.set(m.senderId, m.senderName || m.senderId.split('@')[0]);
          }
        });
        participantChats = Array.from(uniqueSenders.entries()).map(([id, name]) => ({
          id,
          name,
          isGroup: false,
          timestamp: Date.now(),
        }));
      }

      if (participantChats.length === 0) {
        alert('לא אותרו משתתפים בקבוצה זו לסנכרון');
        return;
      }

      setExportSourceGroupName(groupChat.name || 'קבוצת וואטסאפ');
      setCustomExportList(participantChats);
      setIsCrmExportModalOpen(true);
    } catch (e: any) {
      alert(`שגיאה בשליפת משתתפי הקבוצה: ${e.message}`);
    }
  };

  return (
    <div
      className={`h-[680px] rounded-3xl border shadow-2xl flex overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
      dir="rtl"
    >
      {/* 1. Left Sidebar: Chat List & Selection Toolbar (380px wide) */}
      <div
        className={`w-80 sm:w-96 flex flex-col border-l shrink-0 ${
          isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'
        }`}
      >
        {/* Sidebar Header */}
        <div className={`p-4 border-b space-y-3 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span>שיחות WhatsApp</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Refresh Chats Button */}
              <button
                onClick={refreshChats}
                disabled={isRefreshingChats}
                className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="רענן שיחות מחשבון הוואטסאפ"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingChats ? 'animate-spin text-emerald-500' : ''}`} />
              </button>

              {/* Bulk Campaign Action Button */}
              <button
                onClick={onOpenBulkModal}
                className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-md cursor-pointer transition"
                title="שליחה מרובה לרשימת תפוצה"
              >
                <Users className="w-3.5 h-3.5" />
                <span>שליחה מרובה</span>
              </button>

              {/* New Chat Button */}
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow cursor-pointer transition"
                title="התחל שיחה חדשה לפי מספר"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className={`w-4 h-4 absolute right-3 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש לפי שם, טלפון, תוכן הודעה..."
              className={`w-full pr-9 pl-8 py-2 rounded-xl text-xs border focus:border-indigo-500 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-2.5 top-2.5 p-0.5 rounded-full hover:bg-slate-700/40 text-slate-400 hover:text-white transition cursor-pointer"
                title="נקה חיפוש"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills & Select All */}
          <div className="flex items-center justify-between gap-1 text-[11px] font-semibold pt-1">
            <div className="flex gap-1">
              <button
                key="contacts"
                onClick={() => handleTabChange('contacts')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  chatFilter === 'contacts'
                    ? 'bg-emerald-600 text-white shadow'
                    : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👤 אנשי קשר</span>
              </button>

              <button
                key="groups"
                onClick={() => handleTabChange('groups')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  chatFilter === 'groups'
                    ? 'bg-purple-600 text-white shadow'
                    : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👥 קבוצות</span>
              </button>

              {selectedContactIds.size > 0 && (
                <button
                  key="selected"
                  onClick={() => handleTabChange('selected')}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                    chatFilter === 'selected'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  <span>✓ נבחרו ({selectedContactIds.size})</span>
                </button>
              )}
            </div>

            {/* Select All in View Button */}
            {filteredChats.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                title="סמן או בטל סימון של כל המוצגים"
              >
                <CheckSquare className="w-3 h-3" />
                <span>בחר הכל</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat List Items with Checkboxes */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/20">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-5 text-center text-slate-500 text-xs space-y-3">
              <MessageSquare className="w-10 h-10 opacity-40 text-emerald-500" />
              <div>
                <p className="font-bold text-slate-300">
                  {isRefreshingChats ? 'טוען שיחות מחשבון ה-WhatsApp...' : 'לא נמצאו שיחות ברשימה זו'}
                </p>
                <p className="text-[11px] opacity-75 mt-0.5">לחץ לסנכרון השיחות ואנשי הקשר מהטלפון המחובר</p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[200px]">
                <button
                  onClick={refreshChats}
                  disabled={isRefreshingChats}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingChats ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingChats ? 'מסנכרן...' : 'סנכרן שיחות כעת'}</span>
                </button>

                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-3 py-1.5 text-indigo-400 font-semibold hover:underline text-xs"
                >
                  + פתח שיחה חדשה
                </button>
              </div>
            </div>
          ) : (
            filteredChats.map((c) => {
              const isSelected = selectedChatId === c.id;
              const isChecked = selectedContactIds.has(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedChatId(c.id)}
                  className={`p-3 transition cursor-pointer flex items-center gap-2.5 group ${
                    isSelected
                      ? isDark
                        ? 'bg-indigo-600/20 border-r-4 border-indigo-500 text-white'
                        : 'bg-indigo-50 border-r-4 border-indigo-600 text-indigo-950'
                      : isDark
                      ? 'hover:bg-slate-900/60 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div
                    onClick={(e) => toggleContactSelection(c.id, e)}
                    className="p-1 rounded-lg hover:bg-slate-800/40 text-slate-400 hover:text-indigo-400 transition shrink-0 cursor-pointer"
                    title={isChecked ? 'בטל בחירה' : 'סמן איש קשר'}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow ${
                        c.isGroup
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                          : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                      }`}
                    >
                      {c.isGroup ? <Users className="w-4 h-4" /> : (c.name?.slice(0, 2).toUpperCase() || '💬')}
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 absolute -bottom-0.5 -left-0.5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs truncate">{c.name || c.id}</h4>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {c.timestamp ? new Date(c.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {c.lastMessage || (c.isGroup ? 'קבוצת WhatsApp' : c.id)}
                      </p>
                      {c.isGroup && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-400 rounded font-medium shrink-0">
                          קבוצה
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Multi-Selection Docked Action Bar (Appears when >= 1 contacts are selected) */}
        {selectedContactIds.size > 0 && (
          <div className={`p-3 border-t shadow-lg flex flex-col gap-2 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } animate-fade-in`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                <span>נבחרו {selectedContactIds.size} אנשי קשר</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedContactIds(new Set())}
                className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
              >
                נקה בחירה
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Dynamic Broadcast Button */}
              <button
                onClick={() => setIsDynamicBroadcastOpen(true)}
                className="py-2 px-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shadow transition cursor-pointer"
                title="שידור הודעה אישית עם תגיות דינמיות"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>שידור דינמי</span>
              </button>

              {/* Export to CRM Button */}
              <button
                onClick={() => {
                  setCustomExportList(null);
                  setExportSourceGroupName('');
                  setIsCrmExportModalOpen(true);
                }}
                className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shadow transition cursor-pointer"
                title="שמירה וסנכרון חכם ל-CRM"
              >
                <Database className="w-3.5 h-3.5" />
                <span>ייצוא ל-CRM</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Right Panel: Active Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChatId ? (
          <>
            {/* Active Chat Header */}
            <div
              className={`p-3.5 px-5 border-b flex items-center justify-between shadow-sm z-10 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow text-white ${
                    selectedChat?.isGroup
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                  }`}
                >
                  {selectedChat?.isGroup ? <Users className="w-5 h-5" /> : (selectedChat?.name?.slice(0, 2).toUpperCase() || 'WA')}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{selectedChat?.name || selectedChatId}</h3>
                  <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{selectedChat?.isGroup ? 'קבוצת WhatsApp' : 'פעיל ב-WhatsApp'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Single Contact Save to CRM button */}
                {selectedChat && !selectedChat.isGroup && (
                  <button
                    onClick={() => {
                      setCustomExportList([selectedChat]);
                      setExportSourceGroupName('');
                      setIsCrmExportModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-medium rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                    title="שמור איש קשר זה ל-CRM"
                  >
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>שמור ל-CRM</span>
                  </button>
                )}

                {/* Group Extract to CRM button */}
                {selectedChat && selectedChat.isGroup && (
                  <button
                    onClick={() => handleExtractGroupToCrm(selectedChat)}
                    className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-medium rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                    title="חלץ את כל משתתפי הקבוצה וסנכרן ל-CRM"
                  >
                    <DownloadCloud className="w-3.5 h-3.5 text-purple-400" />
                    <span>סנכרן משתתפי קבוצה ל-CRM</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsLoadingMessages(true);
                    service.getChatHistory(selectedChatId, 50).then((msgs) => {
                      setMessages(msgs || []);
                      setIsLoadingMessages(false);
                    });
                  }}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition cursor-pointer ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                  title="רענן היסטוריית שיחה"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Messages Feed Area */}
            <div
              className={`flex-1 p-4 overflow-y-auto space-y-3 ${
                isDark ? 'bg-slate-950/60' : 'bg-slate-100/70'
              }`}
              style={{
                backgroundImage: isDark
                  ? 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)'
                  : 'radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                  <span>טוען היסטוריית שיחה...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-400">
                  <MessageSquare className="w-10 h-10 mb-2 opacity-30 text-emerald-500" />
                  <p className="font-bold">אין הודעות להצגה בשיחה זו</p>
                  <p className="text-[11px] opacity-75">הקלד הודעה מטה להתחלת שיחה</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isOutgoing = m.type === 'outgoing';
                  return (
                    <div
                      key={m.idMessage}
                      className={`flex flex-col max-w-[80%] sm:max-w-[70%] space-y-1 ${
                        isOutgoing ? 'mr-auto items-end' : 'ml-auto items-start'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-2xl shadow-sm text-xs ${
                          isOutgoing
                            ? isDark
                              ? 'bg-emerald-950/70 border border-emerald-700/50 text-emerald-100 rounded-bl-sm'
                              : 'bg-emerald-100/90 border border-emerald-300 text-emerald-950 rounded-bl-sm'
                            : isDark
                            ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-br-sm'
                        }`}
                      >
                        {m.senderName && !isOutgoing && (
                          <span className="block font-bold text-[10px] text-indigo-400 mb-1">
                            {m.senderName}
                          </span>
                        )}

                        <p className="whitespace-pre-wrap leading-relaxed">{m.textMessage}</p>

                        {m.downloadUrl && (
                          <a
                            href={m.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-500 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>פתח / הורד קובץ מצורף</span>
                          </a>
                        )}

                        <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 mt-1 font-mono">
                          <span>
                            {m.timestamp
                              ? new Date(m.timestamp * 1000).toLocaleTimeString('he-IL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                          {isOutgoing && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer Bar */}
            <div
              className={`p-3 border-t flex items-center gap-2 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(true)}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="צרף קובץ או תמונה מ-URL"
              >
                <Paperclip className="w-4 h-4 text-indigo-500" />
              </button>

              <textarea
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="הקלד הודעה... (לחץ Enter לשיגור)"
                className={`flex-1 p-2.5 rounded-xl border text-xs resize-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                title="שלח הודעה"
              >
                <Send className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </>
        ) : (
          /* Empty state when no chat selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 shadow-inner">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black mb-1">WhatsApp Web Connect</h3>
            <p className={`text-xs max-w-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              בחר איש קשר או קבוצה מהרשימה, סמן אנשי קשר לשידור דינמי או סנכרון ישיר ל-CRM.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>שיחה חדשה</span>
              </button>
              <button
                onClick={onOpenBulkModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
              >
                <Users className="w-4 h-4" />
                <span>שליחה מרובה</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Broadcast Modal */}
      <WhatsAppDynamicBroadcastModal
        isOpen={isDynamicBroadcastOpen}
        onClose={() => setIsDynamicBroadcastOpen(false)}
        selectedContacts={selectedChatObjects}
        service={service}
        connectedAccountName={connectedAccountName}
        sourceGroupName={exportSourceGroupName}
        isDark={isDark}
        onRecipientSent={(chatId, msg, phone) => {
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId ? { ...c, lastMessage: msg, timestamp: Date.now() } : c
            )
          );
        }}
      />

      {/* CRM Export & Smart Merge Modal */}
      <WhatsAppCrmExportModal
        isOpen={isCrmExportModalOpen}
        onClose={() => setIsCrmExportModalOpen(false)}
        contacts={customExportList || selectedChatObjects}
        db={db}
        contactsCollectionName={contactsCollectionName}
        groupsCollectionName={groupsCollectionName}
        connectedAccountName={connectedAccountName}
        defaultGroupName={exportSourceGroupName}
        isDark={isDark}
        onContactNameUpdated={(chatId, newName) => {
          setChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, name: newName, contactName: newName } : c))
          );
        }}
        onSynced={(res) => {
          alert(`הסנכרון ל-CRM הושלם! ${res.created} נוצרו חדשים, ${res.updated} עודכנו.`);
        }}
      />

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-800/40">
              <h3 className="font-black text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-500" />
                <span>פתיחת שיחת WhatsApp חדשה</span>
              </h3>
              <button onClick={() => setIsNewChatModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">מספר טלפון בינלאומי (לדוגמה 972501234567)</label>
                <input
                  type="text"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  placeholder="972501234567"
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">הודעת פתיחה ראשונית (אופציונלי)</label>
                <textarea
                  rows={3}
                  value={newChatInitialMsg}
                  onChange={(e) => setNewChatInitialMsg(e.target.value)}
                  placeholder="שלום, פונה אליך לגבי..."
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/40">
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                ביטול
              </button>
              <button
                onClick={handleStartNewChat}
                disabled={!newChatPhone.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow disabled:opacity-50 cursor-pointer"
              >
                פתח שיחה ושגר
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach File Modal */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-800/40">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-500" />
                <span>שליחת מדיה / קובץ לפי קישור</span>
              </h3>
              <button onClick={() => setIsAttachModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium">קישור ישיר לקובץ / תמונה (URL)</label>
                  <button
                    type="button"
                    onClick={() => setIsAttachMediaPickerOpen(true)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-[10px] flex items-center gap-1 shadow cursor-pointer transition"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>בחר מגלריית המדיה שלי</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={attachUrl}
                  onChange={(e) => setAttachUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">שם הקובץ עם סיומת</label>
                <input
                  type="text"
                  value={attachFileName}
                  onChange={(e) => setAttachFileName(e.target.value)}
                  placeholder="invoice.pdf"
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">כתובית (Caption)</label>
                <input
                  type="text"
                  value={attachCaption}
                  onChange={(e) => setAttachCaption(e.target.value)}
                  placeholder="מצורף הקובץ לבקשתך"
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/40">
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                ביטול
              </button>
              <button
                onClick={handleSendAttachment}
                disabled={!attachUrl.trim() || isSending}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow disabled:opacity-50 cursor-pointer"
              >
                שגר קובץ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal for Attachment */}
      {isAttachMediaPickerOpen && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setIsAttachMediaPickerOpen(false)}
          title="בחר מדיה לשליחה בצ'אט מתוך הגלריה האישית"
          allowedTypes={['image', 'video', 'document', 'audio']}
          maxSelectCount={1}
          onSelectMedia={(items) => {
            if (items && items.length > 0) {
              setAttachUrl(items[0].url);
              setAttachFileName(items[0].name || 'file.pdf');
              setIsAttachMediaPickerOpen(false);
            }
          }}
          db={db}
        />
      )}
    </div>
  );
};
