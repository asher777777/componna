import React, { useState, useEffect } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Bot, User, Trash2, Clock, Phone, AlertCircle } from 'lucide-react';


export const WhatsAppAiBotChatsTab: React.FC = () => {
  const system = useSystemConnection();
  const db = system?.db;
  const isDark = Boolean((system as any)?.isDark);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  useEffect(() => {
    if (!db) return;
    
    const q = query(
      collection(db, 'wa_bot_chats'),
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
  }, [db]);

  const handleDelete = async (id: string) => {
    if (!db || !confirm('האם למחוק שיחה זו?')) return;
    await deleteDoc(doc(db, 'wa_bot_chats', id));
  };

  return (
    <div className={`h-[800px] flex rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}>
      
      {/* Sidebar List */}
      <div className={`w-80 flex flex-col border-l shrink-0 ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="p-4 border-b border-slate-800/20">
          <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>שיחות AI חיות</h2>
          <p className="text-xs text-slate-500 mt-1">מעקב 24/7 אחרי שיחות שהבוט מנהל מול הלקוחות</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              <Bot className="w-8 h-8 mx-auto opacity-50 mb-2" />
              עדיין אין שיחות בוט
            </div>
          )}

          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-3 rounded-xl cursor-pointer transition ${
                selectedChat?.id === chat.id
                  ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-400 shadow-sm'
                  : isDark ? 'hover:bg-slate-800/60 border border-transparent text-slate-300' : 'hover:bg-white border border-transparent text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm truncate">{chat.contactName || chat.phone}</span>
                {chat.lastUpdatedAt && (
                  <span className="text-[10px] opacity-70 font-mono">
                    {new Date(chat.lastUpdatedAt?.toDate ? chat.lastUpdatedAt.toDate() : chat.lastUpdatedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-80 flex items-center gap-1">
                  <Bot className="w-3 h-3" /> {chat.botName || 'בוט'}
                </span>
                <span className="text-[10px] bg-slate-500/20 px-2 py-0.5 rounded-full">
                  {chat.messages?.length || 0} הודעות
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col h-full bg-[url('https://i.ibb.co/30B3j22/wa-bg-dark.png')] bg-repeat opacity-95">
        {selectedChat ? (
          <>
            <div className={`p-4 border-b flex items-center justify-between backdrop-blur-md ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedChat.contactName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {selectedChat.phone}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(selectedChat.id)}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition"
                title="מחק שיחה"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages?.map((msg: any, i: number) => {
                const isBot = msg.role === 'model';
                return (
                  <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                      isBot 
                        ? (isDark ? 'bg-slate-800 text-slate-200 rounded-tr-none' : 'bg-white text-slate-700 rounded-tr-none') 
                        : (isDark ? 'bg-emerald-600/90 text-white rounded-tl-none' : 'bg-emerald-500 text-white rounded-tl-none')
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                      <div className={`text-[10px] mt-1.5 flex justify-end font-mono ${isBot ? 'opacity-50' : 'opacity-80'}`}>
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Bot className="w-12 h-12 mb-3 opacity-30" />
            <p>בחר שיחה כדי לצפות בה</p>
          </div>
        )}
      </div>

    </div>
  );
};
