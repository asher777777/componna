import React, { useState, useEffect } from 'react';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { Bot, MessageCircle, Clock, ChevronLeft } from 'lucide-react';
import { Contact } from '../../types';


interface Props {
  formData: Contact;
}

export const ContactWhatsAppTab: React.FC<Props> = ({ formData }) => {
  const { db, isDark } = useSystemConnection();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!db || !formData.phone) return;
      try {
        let phone = formData.phone.replace(/\D/g, '');
        if (phone.startsWith('05')) {
          phone = '972' + phone.substring(1);
        }

        const q = query(
          collection(db, 'wa_bot_chats'),
          where('phone', '==', phone)
        );
        
        const snap = await getDocs(q);
        const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually because inequality/orderBy might require composite index
        results.sort((a: any, b: any) => (b.lastUpdatedAt?.toMillis() || 0) - (a.lastUpdatedAt?.toMillis() || 0));
        
        setChats(results);
      } catch (err) {
        console.error('Error fetching WA chats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [db, formData.phone]);

  if (selectedChat) {
    return (
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <button 
          onClick={() => setSelectedChat(null)}
          className={`flex items-center gap-1 text-sm font-medium mb-4 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
        >
          <ChevronLeft className="w-4 h-4" /> חזרה לרשימת שיחות
        </button>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedChat.botName || 'בוט AI'}</h4>
            <span className="text-xs text-slate-500">
              {selectedChat.lastUpdatedAt ? new Date(selectedChat.lastUpdatedAt.toDate()).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }) : ''}
            </span>
          </div>
        </div>

        <div className={`space-y-3 p-4 rounded-lg overflow-y-auto max-h-[400px] ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
          {selectedChat.messages?.map((msg: any, i: number) => {
            const isBot = msg.role === 'model';
            return (
              <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                  isBot 
                    ? (isDark ? 'bg-slate-800 text-slate-200 rounded-tr-none' : 'bg-white text-slate-700 rounded-tr-none') 
                    : (isDark ? 'bg-emerald-600/90 text-white rounded-tl-none' : 'bg-emerald-500 text-white rounded-tl-none')
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className={`text-[10px] mt-1.5 flex justify-end ${isBot ? 'opacity-50' : 'opacity-80'}`}>
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <MessageCircle className="w-5 h-5 text-emerald-500" />
          אינטראקציות בוואטסאפ
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">טוען שיחות...</div>
      ) : chats.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">
          <Bot className="w-8 h-8 mx-auto opacity-50 mb-2" />
          לא נמצאו שיחות עם בוט AI ללקוח זה
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col gap-2 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80' 
                  : 'bg-white border-slate-200 hover:border-indigo-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-500">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {chat.botName || 'בוט'}
                  </span>
                </div>
                {chat.lastUpdatedAt && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(chat.lastUpdatedAt.toDate()).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-between">
                <span>{chat.messages?.length || 0} הודעות בשיחה</span>
                <span className="text-indigo-500 font-medium">צפה בשיחה &larr;</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
