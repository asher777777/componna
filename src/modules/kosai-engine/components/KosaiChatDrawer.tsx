import React, { useState, useRef, useEffect } from 'react';
import { useKosai } from '../context/KosaiContext';
import { 
  X, Send, Bot, User, Image as ImageIcon, Loader2, Sparkles, 
  Trash2, Maximize2, Minimize2, Settings, History, Plus, MessageSquare,
  Mic, MicOff
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { subscribeToAuth, AuthState } from '../../../services/firebaseAuth';
import { KosaiSettingsBackoffice } from './KosaiSettingsBackoffice';

export const KosaiChatDrawer: React.FC = () => {
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    sendMessage, 
    clearChat, 
    currentRule, 
    triggerMediaGallery,
    activeConversationId,
    conversations,
    loadConversation,
    deleteConversation,
    startNewConversation,
    refreshRules,
    isLoggedIn
  } = useKosai();
  
  const { firebaseApp } = useSystemConnection();

  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state: AuthState) => {
      const allowed = state.isAuthenticated && (state.role === 'admin' || state.role === 'editor');
      setCanEdit(allowed);
    });
    return () => unsub();
  }, [firebaseApp]);

  useEffect(() => {
    if (messagesEndRef.current && !showHistory) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, showHistory]);

  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef('');

  const autoCorrectText = (text: string) => {
    if (!text) return text;
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.:?!])/g, '$1')
      .replace(/([,.:?!])(?=[^\s\d])/g, '$1 ')
      .trim();
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('דפדפן זה אינו תומך בזיהוי קולי (Web Speech API). אנא השתמש ב-Chrome או דפדפן מבוסס Chromium.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'he-IL';

      baseTextRef.current = inputText ? (inputText.trim() + ' ') : '';
      isListeningRef.current = true;
      setIsListening(true);

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece;
          } else {
            interimTranscript += piece;
          }
        }

        if (finalTranscript) {
          baseTextRef.current += finalTranscript + ' ';
        }

        const combined = baseTextRef.current + interimTranscript;
        setInputText(autoCorrectText(combined));
      };

      recognition.onerror = (event: any) => {
        console.warn('[Kosai Voice Dictation] Recognition error:', event?.error);
        if (event?.error === 'not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
          alert('אנא אשר גישה למיקרופון כדי להשתמש בהקראה קולית.');
        }
      };

      recognition.onend = () => {
        // Stop ONLY when user clicks Send (or intentionally toggles off)
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            // Already restarted
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('[Kosai Voice Dictation] Failed to start:', err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopVoiceDictation = () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const toggleVoiceDictation = () => {
    if (isListening) {
      stopVoiceDictation();
    } else {
      startVoiceDictation();
    }
  };

  useEffect(() => {
    return () => {
      stopVoiceDictation();
    };
  }, []);

  const handleSend = () => {
    // Dictation stops ONLY when Send is clicked!
    if (isListeningRef.current) {
      stopVoiceDictation();
    }
    const cleanText = autoCorrectText(inputText);
    if (!cleanText.trim()) return;
    sendMessage(cleanText.trim());
    setInputText('');
    baseTextRef.current = '';
  };

  // Keyboard Escape key handler (מקש היציאה)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isListeningRef.current) {
          stopVoiceDictation();
        }
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleConfirmClear = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לזרוק את השיחה הנוכחית לפח ולהתחיל מחדש?')) {
      await clearChat();
      setShowHistory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={clsx(
          "fixed top-[72px] bottom-4 left-4 z-[90] bg-[#0A0A0B] border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 flex flex-col transition-all duration-300 rounded-3xl overflow-hidden",
          isExpanded ? "w-[650px]" : "w-[380px]"
        )}
        dir="rtl"
        style={{ fontFamily: 'Heebo, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-indigo-500/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img
                src="/images/kosun-symbol.svg"
                alt="Kosun AI"
                className="w-7 h-7 object-contain drop-shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-white text-sm">קושאן AI</h3>
                <span className={clsx(
                  "px-1.5 py-0.5 rounded text-[10px] border",
                  isLoggedIn 
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                )}>
                  {isLoggedIn ? 'מעצב האתר והמערכת' : 'שירות ומכירות'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                {isLoggedIn ? 'שותף עיצוב ופיתוח חכם (2026)' : 'שירות לקוחות והכוונה דיגיטלית'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            {/* Point ד: Settings Button (Only for authorized editors) */}
            {canEdit && (
              <button 
                onClick={() => setShowSettings(true)} 
                title="הגדרות סוכן" 
                className="p-1.5 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Point ג: History Button */}
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              title="היסטוריית שיחות" 
              className={clsx(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                showHistory ? "text-indigo-400 bg-indigo-500/20" : "hover:text-white hover:bg-slate-800/80"
              )}
            >
              <History className="w-4 h-4" />
            </button>

            {/* Point ג: Trash / Clear Chat */}
            <button 
              onClick={handleConfirmClear} 
              title="זרוק שיחה לפח והתחל חדשה" 
              className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-1.5 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isListeningRef.current) {
                  stopVoiceDictation();
                }
                setIsOpen(false);
              }} 
              className="p-1.5 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="סגירת חלון (Esc)"
              aria-label="סגירת צ'אט"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area: Either History List or Chat Messages */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                שיחות קודמות
              </span>
              <button
                onClick={() => {
                  startNewConversation();
                  setShowHistory(false);
                }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>שיחה חדשה</span>
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs gap-2">
                <MessageSquare className="w-8 h-8 text-slate-700" />
                <span>אין עדיין שיחות שמורות במאגר.</span>
              </div>
            ) : (
              conversations.map(conv => {
                const isActive = conv.id === activeConversationId;
                const formattedDate = new Date(conv.updatedAt || conv.createdAt).toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      loadConversation(conv.id);
                      setShowHistory(false);
                    }}
                    className={clsx(
                      "p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 group",
                      isActive
                        ? "bg-indigo-950/40 border-indigo-500/50 text-white shadow-sm"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs truncate text-white">
                          {conv.title || 'שיחה ללא כותרת'}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-[9px] text-white font-bold">
                            פעילה
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>{formattedDate}</span>
                        <span>{conv.messages?.length || 0} הודעות</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('למחוק שיחה זו מההיסטוריה?')) {
                          deleteConversation(conv.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition opacity-60 group-hover:opacity-100"
                      title="מחק שיחה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.map(msg => (
              <div key={msg.id} className={clsx("flex gap-3 max-w-[90%]", msg.role === 'user' ? "self-end flex-row-reverse" : "self-start")}>
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-1 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="relative w-8 h-8 flex items-center justify-center shrink-0 mt-1">
                    <img
                      src="/images/kosun-symbol.svg"
                      alt="K"
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
                      }}
                    />
                    <Sparkles className="w-2.5 h-2.5 text-indigo-400 absolute -top-0.5 -right-0.5 animate-pulse" />
                  </div>
                )}
                <div className={clsx("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={clsx("p-3.5 rounded-2xl text-sm leading-relaxed", msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-sm")}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Attached" className="w-48 rounded-lg mb-2 border border-slate-700/50" />
                    )}
                    {msg.content}
                    {msg.isLoading && (
                      <div className="mt-3 flex items-center gap-2 text-indigo-400 text-xs font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        קושאן מעבד ומבצע...
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-slate-800 bg-slate-900/50">
          {isListening && (
            <div className="px-3.5 py-1.5 bg-rose-950/40 border-b border-rose-500/20 flex items-center justify-between text-[11px] text-rose-300">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                הקראה קולית פעילה (Google Web Speech)
              </span>
              <span className="text-[10px] text-slate-400">ייעצר בלחיצה על שליחה</span>
            </div>
          )}

          <div className="p-3.5">
            <div className="flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <button 
                onClick={triggerMediaGallery} 
                className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
                title="בחר תמונה מספריית המדיה"
              >
                <ImageIcon className="w-4 h-4" />
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
                placeholder={isListening ? "מקשיב ומקליד ברצף... לחץ שליחה לעצירה וביצוע" : "איך קושאן יכול לעזור בעיצוב האתר?"}
                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 text-white text-xs resize-none py-2.5 px-2 placeholder-slate-500"
                rows={1}
              />

              {/* Continuous Voice Dictation Mic Button (Google AI Web Speech) */}
              <button
                type="button"
                onClick={toggleVoiceDictation}
                className={clsx(
                  "p-2.5 rounded-xl transition-all shrink-0 cursor-pointer relative",
                  isListening
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse"
                    : "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                )}
                title={isListening ? "מקשיב ברציפות... לחץ שליחה לעצירה ושליחה" : "הקראה קולית ברצף (Web Speech AI)"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
                  </>
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors shrink-0 shadow-lg shadow-indigo-500/20 disabled:shadow-none cursor-pointer"
                title="שליחה וסיום הקראה"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Point ד: Settings Modal from Chat Component */}
      {showSettings && (
        <KosaiSettingsBackoffice
          initialRuleId={currentRule?.id}
          isModal={true}
          onClose={() => {
            setShowSettings(false);
            refreshRules();
          }}
        />
      )}
    </>
  );
};

