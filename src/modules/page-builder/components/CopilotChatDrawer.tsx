import React, { useState, useRef, useEffect } from 'react';
import { useBuilderCopilot } from '../context/BuilderCopilotContext';
import { X, Send, Bot, User, Image as ImageIcon, Loader2, Sparkles, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';

export const CopilotChatDrawer: React.FC = () => {
  const { isOpen, setIsOpen, messages, sendMessage, clearChat } = useBuilderCopilot();
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;
    sendMessage(inputText.trim(), selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          // Keep only the base64 string, remove data:image/png;base64,
          const base64Part = result.split(',')[1] || result;
          // But actually we might need the mime type for Gemini, so we store the full data URI
          setSelectedImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={clsx(
        "fixed top-[72px] bottom-4 left-4 z-[90] bg-[#0A0A0B] border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 flex flex-col transition-all duration-300 rounded-3xl overflow-hidden",
        isExpanded ? "w-[600px]" : "w-[380px]"
      )}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-indigo-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white text-base">Copilot</h3>
            <p className="text-xs text-indigo-400">שותף ליצירת העמוד</p>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map(msg => (
          <div key={msg.id} className={clsx("flex gap-3 max-w-[90%]", msg.role === 'user' ? "self-end flex-row-reverse" : "self-start")}>
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1", msg.role === 'user' ? "bg-slate-800" : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30")}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={clsx("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
              <div className={clsx("p-3.5 rounded-2xl text-sm leading-relaxed", msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-sm")}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attached screenshot" className="w-48 rounded-lg mb-2 border border-slate-700/50" />
                )}
                {msg.content}
                {msg.isLoading && (
                  <div className="mt-3 flex items-center gap-2 text-indigo-400 text-xs font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    מייצר אזור...
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500">{msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-16 rounded-lg border border-indigo-500/30 shadow-md" />
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="צרף צילום מסך או השראה"
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
            placeholder="תאר איזה אזור היית רוצה להוסיף..."
            className="flex-1 max-h-32 min-h-[48px] bg-transparent border-none focus:ring-0 text-white text-sm resize-none py-3 px-2 placeholder-slate-500"
            rows={1}
          />
          
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() && !selectedImage}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors shrink-0 shadow-lg shadow-indigo-500/20 disabled:shadow-none"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-3 flex justify-center items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          ה-AI יודע לנתח סקרינשוטים ולבנות מהם אזורי קוד דינמיים!
        </p>
      </div>
    </div>
  );
};
