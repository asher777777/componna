import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Video,
  Phone,
  PhoneOff,
  Users,
  Smile,
  Download,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Maximize2,
  Minimize2,
  Shield,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { SmartGroup, ContactRecord, CommunityChatMessage, CommunityVideoCallRoom } from '../types';
import { useCrmGroups } from '../context/CrmGroupsContext';
import {
  fetchCommunityChatMessages,
  sendCommunityChatMessage,
  createOrGetCommunityVideoRoom,
} from '../services/firestoreService';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract, NotificationContract } from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';

interface CommunityChatRoomViewProps {
  community: SmartGroup;
  contacts?: ContactRecord[];
  onBack?: () => void;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export const CommunityChatRoomView: React.FC<CommunityChatRoomViewProps> = ({
  community,
  contacts = [],
  onBack,
  currentUser = {
    id: 'user_admin',
    name: community.leaderName || 'מנהל הקהילה',
  },
}) => {
  const { db, customCollections, recordInteraction } = useCrmGroups() as any;
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const notifyService = getCapability<NotificationContract>('notification');

  const [messages, setMessages] = useState<CommunityChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Video call state
  const [activeVideoRoom, setActiveVideoRoom] = useState<CommunityVideoCallRoom | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages
  useEffect(() => {
    let isMounted = true;
    const loadMessages = async () => {
      setLoading(true);
      try {
        const list = await fetchCommunityChatMessages(db, community.id || community.name, customCollections);
        if (isMounted) {
          setMessages(list);
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [db, community.id, community.name, customCollections]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Send Text Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      const newMsg = await sendCommunityChatMessage(
        db,
        {
          communityId: community.id || community.name,
          communityName: community.name,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          content: textToSend,
          type: 'text',
        },
        customCollections
      );

      setMessages((prev) => [...prev, newMsg]);

      // Record smart CRM interaction for the community
      if (recordInteraction) {
        await recordInteraction({
          contactId: currentUser.id,
          contactName: currentUser.name,
          type: 'note',
          title: `הודעה בצ'אט הפנימי של קהילת ${community.name}`,
          content: textToSend,
          groupName: community.name,
          metadata: { messageId: newMsg.id, channel: 'community_internal_chat' },
        });
      }

      eventBus.publish('crm:contact:updated', {
        id: currentUser.id,
        community: community.name,
        lastChatText: textToSend,
      });
    } catch (err: any) {
      console.error('Error sending message:', err);
      if (notifyService) notifyService.notify('שגיאה בשליחת הודעה', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Handle File Upload from native input
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const msgType = isImage ? 'image' : isVideo ? 'video' : 'file';

    const reader = new FileReader();
    reader.onload = async () => {
      const fileDataUrl = reader.result as string;
      const fileSizeFormatted =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      try {
        const newMsg = await sendCommunityChatMessage(
          db,
          {
            communityId: community.id || community.name,
            communityName: community.name,
            senderId: currentUser.id,
            senderName: currentUser.name,
            content: isImage
              ? `תמונה: ${file.name}`
              : isVideo
              ? `סרטון: ${file.name}`
              : `קובץ מצורף: ${file.name}`,
            type: msgType,
            fileUrl: fileDataUrl,
            fileName: file.name,
            fileSize: fileSizeFormatted,
          },
          customCollections
        );

        setMessages((prev) => [...prev, newMsg]);

        if (recordInteraction) {
          await recordInteraction({
            contactId: currentUser.id,
            contactName: currentUser.name,
            type: 'note',
            title: `שיתוף קובץ בצ'אט קהילת ${community.name}`,
            content: `שיתף קובץ: ${file.name} (${fileSizeFormatted})`,
            groupName: community.name,
            metadata: { fileName: file.name, fileSize: fileSizeFormatted, type: msgType },
          });
        }

        if (notifyService) {
          notifyService.notify(`הקובץ "${file.name}" שותף בהצלחה בצ'אט`, 'success');
        }
      } catch (err: any) {
        console.error('Failed to upload file message:', err);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Media Picker from Host Capability if available
  const handleOpenMediaPicker = async () => {
    if (mediaPicker && typeof mediaPicker.openPicker === 'function') {
      try {
        const result = await mediaPicker.openPicker({
          accept: '*/*',
          multiple: false,
        });
        if (result) {
          const url = Array.isArray(result) ? result[0] : result;
          if (url) {
            const fileName = url.split('/').pop() || 'קובץ משותף';
            const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
            const isVideo = /\.(mp4|webm|mov)$/i.test(url);
            const newMsg = await sendCommunityChatMessage(
              db,
              {
                communityId: community.id || community.name,
                communityName: community.name,
                senderId: currentUser.id,
                senderName: currentUser.name,
                content: fileName,
                type: isImage ? 'image' : isVideo ? 'video' : 'file',
                fileUrl: url,
                fileName,
              },
              customCollections
            );
            setMessages((prev) => [...prev, newMsg]);
            return;
          }
        }
      } catch (err) {
        console.warn('Host media picker fallback to native file input:', err);
      }
    }
    // Fallback: trigger hidden input
    fileInputRef.current?.click();
  };

  // Start or Join Community Video Call
  const handleStartVideoCall = async () => {
    try {
      const room = await createOrGetCommunityVideoRoom(
        db,
        community,
        currentUser.name,
        customCollections
      );
      setActiveVideoRoom(room);
      setIsVideoCallOpen(true);

      // Post invite message in chat if not already active
      const callMsg = await sendCommunityChatMessage(
        db,
        {
          communityId: community.id || community.name,
          communityName: community.name,
          senderId: currentUser.id,
          senderName: currentUser.name,
          content: `שיחת וידאו קהילתית החלה כעת! חברי הקהילה מוזמנים להצטרף לחדר המפגש.`,
          type: 'call_invite',
          fileUrl: room.jitsiUrl,
        },
        customCollections
      );

      setMessages((prev) => [...prev, callMsg]);

      // Record interaction
      if (recordInteraction) {
        await recordInteraction({
          contactId: currentUser.id,
          contactName: currentUser.name,
          type: 'call',
          title: `פתיחת שיחת וידאו קהילתית - ${community.name}`,
          content: `נפתח חדר ועידה קהילתי מקוון עבור חברי ${community.name}`,
          groupName: community.name,
          metadata: { jitsiUrl: room.jitsiUrl, roomId: room.id },
        });
      }

      if (notifyService) {
        notifyService.notify(`חדר שיחת הווידאו של קהילת ${community.name} פתוח!`, 'success');
      }
    } catch (err: any) {
      console.error('Error starting video call:', err);
      alert('שגיאה ביצירת שיחת וידאו: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-slate-50/70 rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-right font-sans" dir="rtl">
      {/* Top Header Bar */}
      <div className="bg-white px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="חזור"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          )}

          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
            style={{ backgroundColor: community.color || '#4f46e5' }}
          >
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">{community.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                צ'אט פנימי לחברים
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{contacts.length} חברים רשומים</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                חדר מאובטח ופעיל
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls: Video Call & Members */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartVideoCall}
            className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            title="התחל שיחת וידאו קהילתית"
          >
            <Video className="w-4 h-4" />
            <span>שיחת וידאו קהילתית</span>
          </button>
        </div>
      </div>

      {/* Main Chat Body: Video Container (if active) + Messages List */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Active Embedded Video Call Panel */}
        {isVideoCallOpen && activeVideoRoom && (
          <div
            className={`transition-all bg-slate-900 border-b border-slate-800 flex flex-col ${
              isVideoFullscreen
                ? 'absolute inset-0 z-50 rounded-none'
                : 'h-80 md:h-96 w-full shrink-0 relative'
            }`}
          >
            {/* Video Call Controls Bar */}
            <div className="bg-slate-950/90 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">{activeVideoRoom.roomName}</span>
                <span className="text-slate-400 font-mono text-[11px]">(Jitsi Conference)</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeVideoRoom.jitsiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1"
                  title="פתח בחלון נפרד"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>חלון חיצוני</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsVideoFullscreen(!isVideoFullscreen)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title={isVideoFullscreen ? 'מזער מסך' : 'מסך מלא'}
                >
                  {isVideoFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoCallOpen(false)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>סיים שיחה</span>
                </button>
              </div>
            </div>

            {/* Video Iframe */}
            <div className="flex-1 w-full h-full bg-black relative">
              <iframe
                src={activeVideoRoom.jitsiUrl}
                allow="camera; microphone; display-capture; autoplay; clipboard-write"
                className="w-full h-full border-0"
                title="שיחת וידאו קהילתית"
              />
            </div>
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">טוען הודעות קהילה...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
              <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-700">אין עדיין הודעות בצ'אט</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                היה הראשון לפתוח בשיחה, לשתף קבצים או להזמין את החברים למפגש וידאו מקוון!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit',
              });

              if (msg.type === 'call_invite') {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 rounded-3xl p-4 max-w-md w-full text-center space-y-3 shadow-xs">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
                        <Video className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-indigo-950">מפגש וידאו קהילתי פתוח!</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">{msg.content}</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeVideoRoom) {
                              setIsVideoCallOpen(true);
                            } else {
                              handleStartVideoCall();
                            }
                          }}
                          className="h-8 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>הצטרף למפגש</span>
                        </button>
                        {msg.fileUrl && (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-3 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>פתח בטאב חדש</span>
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{formattedTime}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black ${
                      isMine ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {msg.senderAvatar ? (
                      <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (msg.senderName || 'ח')[0]
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[78%] sm:max-w-md rounded-2xl px-4 py-2.5 space-y-1.5 shadow-2xs ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {/* Header info */}
                    {!isMine && (
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-black text-indigo-600">{msg.senderName}</span>
                        {msg.senderPhone && (
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            {msg.senderPhone}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Image Attachment Preview */}
                    {msg.type === 'image' && msg.fileUrl && (
                      <div className="rounded-xl overflow-hidden my-1 bg-slate-900/5 max-h-60 flex items-center justify-center">
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName || 'תמונה'}
                          className="max-h-60 w-auto object-contain rounded-xl hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    {/* Video Attachment Preview */}
                    {msg.type === 'video' && msg.fileUrl && (
                      <div className="rounded-xl overflow-hidden my-1 max-h-60 bg-black">
                        <video src={msg.fileUrl} controls className="w-full max-h-60" />
                      </div>
                    )}

                    {/* Generic File Attachment */}
                    {msg.type === 'file' && msg.fileUrl && (
                      <div
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-3 border ${
                          isMine
                            ? 'bg-indigo-700/60 border-indigo-500/50 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-5 h-5 shrink-0 opacity-80" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate">{msg.fileName || 'קובץ להורדה'}</p>
                            {msg.fileSize && <span className="text-[10px] opacity-75">{msg.fileSize}</span>}
                          </div>
                        </div>
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName || 'download'}
                          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                            isMine
                              ? 'hover:bg-indigo-600 text-white'
                              : 'hover:bg-slate-200 text-slate-700'
                          }`}
                          title="הורד קובץ"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {/* Text Content */}
                    {msg.content && (
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
                        {msg.content}
                      </p>
                    )}

                    {/* Timestamp & Status */}
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] pt-0.5 ${
                        isMine ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      <span className="font-mono">{formattedTime}</span>
                      {isMine && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
        />

        {/* Input Composer Bar */}
        <div className="bg-white p-3 md:p-4 border-t border-slate-200 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Media Attachment Action */}
            <button
              type="button"
              onClick={handleOpenMediaPicker}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="צרף קובץ או תמונה"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Quick Video Call Action */}
            <button
              type="button"
              onClick={handleStartVideoCall}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer hidden sm:block"
              title="פתח שיחת וידאו קהילתית"
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`כתוב הודעה לקהילת ${community.name}...`}
              className="flex-1 h-11 px-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="h-11 px-4.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span className="hidden sm:inline">שלח</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
