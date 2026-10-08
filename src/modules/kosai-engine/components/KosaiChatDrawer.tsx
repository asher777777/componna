import React, { useState, useRef, useEffect } from 'react';
import { useKosai } from '../context/KosaiContext';
import { X, Send, Bot, User, Image as ImageIcon, Loader2, Sparkles, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';

export const KosaiChatDrawer: React.FC = () => {
  const { isOpen, setIsOpen, messages, sendMessage, clearChat, currentRule, triggerMediaGallery } = useKosai();
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div 
      className={clsx(
        "fixed top-[72px] bottom-4 left-4 z-[90] bg-[#0A0A0B] border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 flex flex-col transition-all duration-300 rounded-3xl overflow-hidden",
        isExpanded ? "w-[600px]" : "w-[380px]"
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-indigo-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white text-base">KOSAI Engine</h3>
            {currentRule && <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] border border-indigo-500/30">Brand DNA Connected</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearChat} title="נקה שיחה" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map(msg => (
          <div key={msg.id} className={clsx("flex gap-3 max-w-[90%]", msg.role === 'user' ? "self-end flex-row-reverse" : "self-start")}>
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1", msg.role === 'user' ? "bg-slate-800" : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30")}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={clsx("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
              <div className={clsx("p-3.5 rounded-2xl text-sm leading-relaxed", msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-sm")}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attached" className="w-48 rounded-lg mb-2 border border-slate-700/50" />
                )}
                {msg.content}
                {msg.isLoading && (
                  <div className="mt-3 flex items-center gap-2 text-indigo-400 text-xs font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    KOSAI חושב...
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500">{msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <button 
            onClick={triggerMediaGallery} 
            className="p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="בחר תמונה מספריית המדיה"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="איך KOSAI יכול לעזור?"
            className="flex-1 max-h-32 min-h-[48px] bg-transparent border-none focus:ring-0 text-white text-sm resize-none py-3 px-2 placeholder-slate-500"
            rows={1}
          />
          
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors shrink-0 shadow-lg shadow-indigo-500/20 disabled:shadow-none"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
