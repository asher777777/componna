import React, { useState, useEffect } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Bot, User, Trash2, Clock, Phone, RotateCcw, MessageSquare } from 'lucide-react';

export const WhatsAppAiBotChatsTab: React.FC = () => {
  const system = useSystemConnection();
  const { getScopedCollectionPath } = useTenantScope();
  const db = system?.db;
  const isDark = Boolean((system as any)?.isDark);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  const chatsCollectionPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.KOS_WHATSUP_BOT_CHATS);

  useEffect(() => {
    if (!db) return;
    
    const q = query(
      collection(db, chatsCollectionPath),
      orderBy('lastUpdatedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(results);
      if (results.length > 0 && !selectedChat) {
        setSelectedChat(results[0]);
      } else if (selectedChat) {
        const updated = results.find(r => r.id === selectedChat.id);
        setSelectedChat(updated || null);
      }
    });

    return () => unsub();
  }, [db, chatsCollectionPath]);

  const handleDelete = async (id: string) => {
    if (!db || !confirm('האם למחוק שיחה זו?')) return;
    await deleteDoc(doc(db, chatsCollectionPath, id));
  };

  return (
    <div className={`h-[720px] flex rounded-3xl border shadow-xs overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'}`} dir="rtl" style={{ textAlign: 'right' }}>
      
      {/* Sidebar List */}
      <div className={`w-80 flex flex-col border-l shrink-0 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200/80 bg-slate-50/70'}`}>
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-500" />
            <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>שיחות AI חיות</h2>
          </div>
          <p className="text-[11px] text-slate-500">מעקב אחר שיחות שהבוטים מנהלים בזמן אמת</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {chats.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Bot className="w-8 h-8 mx-auto opacity-40 text-indigo-500" />
              <p>עדיין אין שיחות בוט מתועדות</p>
            </div>
          )}

          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-3 rounded-2xl cursor-pointer transition flex flex-col gap-1.5 ${
                selectedChat?.id === chat.id
                  ? isDark
                    ? 'bg-indigo-950/50 border border-indigo-700/60 text-white shadow-xs'
                    : 'bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-xs'
                  : isDark
                  ? 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  : 'hover:bg-white border border-transparent text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs truncate">{chat.contactName || chat.phone}</span>
                {chat.lastUpdatedAt && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(chat.lastUpdatedAt?.toDate ? chat.lastUpdatedAt.toDate() : chat.lastUpdatedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <Bot className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">{chat.botName || 'בוט'}</span>
                </span>
                <span className="text-[10px] bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono shrink-0">
                  {chat.messages?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat View */}
      <div className={`flex-1 flex flex-col h-full min-w-0 ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/40'}`}>
        {selectedChat ? (
          <>
            <div className={`p-3.5 px-5 border-b flex items-center justify-between shadow-2xs ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h3 className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedChat.contactName}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span>{selectedChat.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    if (!db || !selectedChat) return;
                    if (!confirm('האם לאפס את המטמון וההקשר של שיחה זו כדי להתחיל בדיקה נקייה?')) return;
                    const chatDocRef = doc(db, chatsCollectionPath, selectedChat.id);
                    await deleteDoc(chatDocRef);
                    setSelectedChat(null);
                  }}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
                  title="נקה מטמון והתחל שיחה חדשה"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">איפוס</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleDelete(selectedChat.id)}
                  className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                  title="מחק שיחה"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedChat.messages?.map((msg: any, i: number) => {
                const isBot = msg.role === 'model';
                return (
                  <div key={i} className={`flex flex-col max-w-[80%] sm:max-w-[70%] space-y-1 ${isBot ? 'ml-auto items-start' : 'mr-auto items-end'}`}>
                    <div className={`p-3 rounded-2xl shadow-2xs text-xs ${
                      isBot 
                        ? isDark 
                          ? 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-br-xs' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-br-xs'
                        : isDark
                          ? 'bg-emerald-950/70 border border-emerald-700/50 text-emerald-100 rounded-bl-xs'
                          : 'bg-emerald-100/90 border border-emerald-300 text-emerald-950 rounded-bl-xs'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                      <div className={`text-[9px] mt-1.5 flex justify-end font-mono opacity-60`}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs space-y-2">
            <MessageSquare className="w-10 h-10 opacity-30 text-indigo-500" />
            <p className="font-bold text-slate-600 dark:text-slate-300">בחר שיחה מהרשימה להצגת מהלך ההודעות</p>
          </div>
        )}
      </div>
    </div>
  );
};
