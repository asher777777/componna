import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useKosai } from '../context/KosaiContext';
import { 
  X, Send, User, Image as ImageIcon, Loader2, Sparkles, 
  Trash2, Settings, History, Plus, MessageSquare,
  Mic, MicOff, Save, Check, FileText, CreditCard, Wand2,
  Minimize2, Maximize2
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { FormBuilderContract, DefaultFormsStatus } from '../../../core/contracts';
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
    activeModule,
    openMediaPicker,
    saveCurrentConversation,
    activeConversationId,
    conversations,
    loadConversation,
    deleteConversation,
    startNewConversation,
    refreshRules,
    isLoggedIn,
    activeRoleMode
  } = useKosai();
  
  const { firebaseApp } = useSystemConnection();

  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // Strict Day Mode default per KOSUN26 constitution
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kosun_theme');
    if (saved === 'dark') return 'dark';
    if (saved === 'light') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const next = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTheme(next);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [inputText, setInputText] = useState('');
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // KSF FormBuilder capability integration
  const { getCapability } = useHostCapabilities();
  const formBuilder = getCapability<FormBuilderContract>('form-builder');
  const [defaultFormsStatus, setDefaultFormsStatus] = useState<DefaultFormsStatus | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  useEffect(() => {
    if (isOpen && formBuilder?.checkDefaultFormsStatus) {
      formBuilder.checkDefaultFormsStatus().then((status) => {
        setDefaultFormsStatus(status);
      }).catch(() => {});
    }
  }, [isOpen, formBuilder]);

  const handleCreateDefaultForm = async (type: 'leads' | 'payment' | 'whatsapp') => {
    if (!formBuilder?.createDefaultForm) return;
    setIsCreatingForm(true);
    try {
      const res = await formBuilder.createDefaultForm(type);
      if (formBuilder.checkDefaultFormsStatus) {
        const updated = await formBuilder.checkDefaultFormsStatus();
        setDefaultFormsStatus(updated);
      }
      sendMessage(`יצרתי עבורך בהצלחה את "${res.title}". הטופס הוטען בסטודיו KSF ומוכן לעריכה ולפרסום.`);
    } catch (e: any) {
      alert('שגיאה ביצירת הטופס');
    } finally {
      setIsCreatingForm(false);
    }
  };

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
    if (isListeningRef.current) {
      stopVoiceDictation();
    }
    const cleanText = autoCorrectText(inputText);
    if (!cleanText.trim() && !attachedImageUrl) return;
    
    sendMessage(cleanText.trim() || 'הוספתי תמונה זו מספריית המדיה:', attachedImageUrl || undefined);
    setInputText('');
    setAttachedImageUrl(null);
    baseTextRef.current = '';
  };

  // Keyboard Escape key handler
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

  useEffect(() => {
    const handleOpenSettingsEvent = (e: any) => {
      setShowSettings(true);
    };
    window.addEventListener('kosun_open_agents_backoffice', handleOpenSettingsEvent);
    window.addEventListener('kosun_open_kosai_settings', handleOpenSettingsEvent);
    return () => {
      window.removeEventListener('kosun_open_agents_backoffice', handleOpenSettingsEvent);
      window.removeEventListener('kosun_open_kosai_settings', handleOpenSettingsEvent);
    };
  }, []);

  const handleConfirmClear = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לזרוק את השיחה הנוכחית לפח ולהתחיל מחדש?')) {
      await clearChat();
      setShowHistory(false);
    }
  };

  const handleSaveConversation = async () => {
    const success = await saveCurrentConversation();
    if (success) {
      setSaveStatus('השיחה נשמרה בהצלחה במאגר השיחות!');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus('שגיאה בשמירת השיחה');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleSelectMedia = async () => {
    try {
      const url = await openMediaPicker();
      if (url) {
        setAttachedImageUrl(url);
      }
    } catch (err) {
      console.warn('[KosaiChatDrawer] Failed opening media picker:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={clsx(
          "fixed top-4 sm:top-6 bottom-4 z-[90] flex flex-col transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl",
          // Theme container styling - Clean White Day Mode as default
          theme === 'dark' 
            ? "bg-slate-900 border border-indigo-500/30 shadow-indigo-500/10 text-slate-100" 
            : "bg-white border border-slate-200 shadow-xl shadow-slate-900/10 text-slate-900",
          // Layout: 100% on mobile (inset-x-2 or left-2 right-2), 50% on desktop home, else max-w-md / 400px
          isHomePage
            ? "left-2 right-2 sm:left-4 sm:right-auto sm:w-1/2"
            : "left-2 right-2 sm:left-4 sm:right-auto sm:w-[420px]"
        )}
        dir="rtl"
        style={{ fontFamily: 'Heebo, sans-serif' }}
      >
        {/* Header: Right has [K] only blinking, close icon on left */}
        <div className={clsx(
          "flex items-center justify-between p-3.5 border-b",
          theme === 'dark' 
            ? "border-slate-800 bg-indigo-500/5 text-white" 
            : "border-slate-200 bg-slate-50 text-slate-900"
        )}>
          {/* Right side: Blinking K logo & Agent Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <img
                src="/images/kosun-symbol.svg"
                alt="K"
                className="w-7 h-7 object-contain drop-shadow animate-pulse"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
                }}
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping pointer-events-none" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={clsx(
                "text-xs font-black truncate leading-tight",
                theme === 'dark' ? "text-white" : "text-slate-900"
              )}>
                {activeModule.moduleId === 'public-site' ? 'סוכן שירות לקוחות' : activeModule.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate leading-tight">
                {activeModule.moduleId === 'public-site' ? 'מענה לפניות, שאלות ומידע' : activeModule.roleBadge}
              </span>
            </div>
          </div>

          {/* Action buttons with Close on left */}
          <div className="flex items-center gap-1 shrink-0">
            {/* New Conversation Button */}
            <button
              type="button"
              onClick={() => {
                startNewConversation();
                setShowHistory(false);
              }}
              title="שיחה חדשה"
              className={clsx(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-slate-800/80" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/80"
              )}
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Save Conversation Button */}
            <button
              type="button"
              onClick={handleSaveConversation}
              title="שמירת שיחה"
              className={clsx(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                saveStatus 
                  ? "text-emerald-400 bg-emerald-500/20" 
                  : theme === 'dark' 
                  ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80" 
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200/80"
              )}
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Settings Button (Only for authorized editors) */}
            {canEdit && (
              <button 
                type="button"
                onClick={() => setShowSettings(true)} 
                title={`הגדרות ${activeModule.name}`}
                className={clsx(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-slate-800/80" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/80"
                )}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* History Button */}
            <button 
              type="button"
              onClick={() => setShowHistory(!showHistory)} 
              title="היסטוריית שיחות" 
              className={clsx(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                showHistory 
                  ? "text-indigo-500 bg-indigo-500/20" 
                  : theme === 'dark' 
                  ? "text-slate-400 hover:text-white hover:bg-slate-800/80" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/80"
              )}
            >
              <History className="w-4 h-4" />
            </button>

            {/* Trash / Clear Chat */}
            <button 
              type="button"
              onClick={handleConfirmClear} 
              title="זרוק שיחה לפח והתחל חדשה" 
              className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-slate-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Button on left */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isListeningRef.current) {
                  stopVoiceDictation();
                }
                setIsOpen(false);
              }} 
              className={clsx(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-slate-800/80" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/80"
              )}
              title="סגירת חלון (Esc)"
              aria-label="סגירת צ'אט"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Status Banner */}
        {saveStatus && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-[11px] px-3.5 py-1.5 flex items-center justify-between animate-fadeIn">
            <span className="font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              {saveStatus}
            </span>
          </div>
        )}

        {/* Content Area: Either History List or Chat Messages */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <div className={clsx(
              "flex items-center justify-between pb-2 border-b",
              theme === 'dark' ? "border-slate-800" : "border-slate-200"
            )}>
              <span className={clsx(
                "text-xs font-bold flex items-center gap-1.5",
                theme === 'dark' ? "text-slate-300" : "text-slate-700"
              )}>
                <History className="w-3.5 h-3.5 text-indigo-500" />
                שיחות קודמות ({activeModule.name})
              </span>
              <button
                type="button"
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
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs gap-2">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <span>אין עדיין שיחות שמורות במאגר עבור רכיב זה.</span>
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
                        ? theme === 'dark'
                          ? "bg-indigo-950/40 border-indigo-500/50 text-white shadow-sm"
                          : "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs"
                        : theme === 'dark'
                        ? "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx(
                          "font-bold text-xs truncate",
                          theme === 'dark' ? "text-white" : "text-slate-900"
                        )}>
                          {conv.title || 'שיחה ללא כותרת'}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-[9px] text-white font-bold">
                            פעילה
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
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
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {/* Quick Action Suggestions for Forms (KSF) - Only rendered in KSF module */}
            {activeModule.moduleId === 'KSF' && (
              <div className={clsx(
                "p-3.5 border rounded-2xl space-y-2.5 text-right shadow-sm shrink-0",
                theme === 'dark' ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center justify-between">
                  <span className={clsx(
                    "text-[11px] font-black flex items-center gap-1.5",
                    theme === 'dark' ? "text-indigo-400" : "text-indigo-600"
                  )}>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                    <span>הצעות מהירות ליצירת טפסי ברירת מחדל (KSF)</span>
                  </span>
                  {isCreatingForm && (
                    <span className={clsx(
                      "text-[10px] flex items-center gap-1 font-bold",
                      theme === 'dark' ? "text-indigo-300" : "text-indigo-700"
                    )}>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      יוצר טופס...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* 1. Lead capture form */}
                  <button
                    type="button"
                    onClick={() => handleCreateDefaultForm('leads')}
                    disabled={isCreatingForm}
                    className={clsx(
                      "p-2.5 rounded-xl border text-right transition flex items-center justify-between gap-2 text-xs font-bold cursor-pointer",
                      defaultFormsStatus?.hasLeadForm
                        ? theme === 'dark' 
                          ? "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800" 
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        : theme === 'dark' 
                          ? "bg-indigo-950/40 border-indigo-500/50 text-white hover:bg-indigo-900/60 shadow-sm"
                          : "bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100 shadow-xs"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">טופס רישום לידים רגיל</span>
                    </div>
                    {defaultFormsStatus?.hasLeadForm ? (
                      <span className="text-[10px] text-emerald-500 font-bold shrink-0">קיים ✓</span>
                    ) : (
                      <span className="text-[10px] text-indigo-500 font-black shrink-0">+ צור</span>
                    )}
                  </button>

                  {/* 2. Kesher payment form */}
                  <button
                    type="button"
                    onClick={() => handleCreateDefaultForm('payment')}
                    disabled={isCreatingForm}
                    className={clsx(
                      "p-2.5 rounded-xl border text-right transition flex items-center justify-between gap-2 text-xs font-bold cursor-pointer",
                      defaultFormsStatus?.hasPaymentForm
                        ? theme === 'dark' 
                          ? "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800" 
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        : theme === 'dark' 
                          ? "bg-emerald-950/40 border-emerald-500/50 text-white hover:bg-emerald-900/60 shadow-sm"
                          : "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100 shadow-xs"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">טופס תשלום וסליקה (קשר)</span>
                    </div>
                    {defaultFormsStatus?.hasPaymentForm ? (
                      <span className="text-[10px] text-emerald-500 font-bold shrink-0">קיים ✓</span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-black shrink-0">+ צור</span>
                    )}
                  </button>

                  {/* 3. WhatsApp trigger form */}
                  <button
                    type="button"
                    onClick={() => handleCreateDefaultForm('whatsapp')}
                    disabled={isCreatingForm}
                    className={clsx(
                      "p-2.5 rounded-xl border text-right transition flex items-center justify-between gap-2 text-xs font-bold cursor-pointer",
                      defaultFormsStatus?.hasWhatsAppForm
                        ? theme === 'dark' 
                          ? "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800" 
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        : theme === 'dark' 
                          ? "bg-emerald-950/40 border-emerald-500/50 text-white hover:bg-emerald-900/60 shadow-sm"
                          : "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100 shadow-xs"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">טופס עם טריגר וואטסאפ</span>
                    </div>
                    {defaultFormsStatus?.hasWhatsAppForm ? (
                      <span className="text-[10px] text-emerald-500 font-bold shrink-0">קיים ✓</span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-black shrink-0">+ צור</span>
                    )}
                  </button>

                  {/* 4. AI Custom Brainstorm Wizard */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (formBuilder?.openBrainstormModal) {
                        formBuilder.openBrainstormModal();
                      } else {
                        window.dispatchEvent(new CustomEvent('ksf_open_ai_brainstorm'));
                      }
                    }}
                    className={clsx(
                      "p-2.5 rounded-xl border transition flex items-center justify-between gap-2 text-xs font-bold cursor-pointer",
                      theme === 'dark' 
                        ? "border-indigo-500/30 bg-slate-800/60 hover:bg-slate-800 text-white" 
                        : "border-indigo-200 bg-white hover:bg-indigo-50/50 text-indigo-900 shadow-xs"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Wand2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">סיעור מוחות AI מותאם</span>
                    </div>
                    <span className="text-[10px] text-indigo-500 font-black shrink-0">פתח אשף ←</span>
                  </button>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={clsx("flex gap-3 max-w-[90%]", msg.role === 'user' ? "self-end flex-row-reverse" : "self-start")}>
                {msg.role === 'user' ? (
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    theme === 'dark' ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"
                  )}>
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="relative w-8 h-8 flex items-center justify-center shrink-0 mt-1">
                    <img
                      src="/images/kosun-symbol.svg"
                      alt="K"
                      className="w-6 h-6 object-contain drop-shadow animate-pulse"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
                      }}
                    />
                    <Sparkles className="w-2.5 h-2.5 text-indigo-400 absolute -top-0.5 -right-0.5 animate-pulse" />
                  </div>
                )}
                <div className={clsx("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={clsx(
                    "p-3.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-sm shadow-sm" 
                      : theme === 'dark'
                      ? "bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-sm shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-xs"
                  )}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Attached" className="w-48 rounded-lg mb-2 border border-slate-300 dark:border-slate-700/50" />
                    )}
                    {msg.content}
                    {msg.isLoading && (
                      <div className="mt-3 flex items-center gap-2 text-indigo-500 text-xs font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        קושאן מעבד ומבצע...
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Bar */}
        <div className={clsx(
          "border-t p-3.5",
          theme === 'dark' ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50/80"
        )}>
          {isListening && (
            <div className="mb-2 px-3.5 py-1.5 bg-rose-950/40 border border-rose-500/20 rounded-xl flex items-center justify-between text-[11px] text-rose-400">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                הקראה קולית פעילה (Google Web Speech)
              </span>
              <span className="text-[10px] text-slate-400">ייעצר בלחיצה על שליחה</span>
            </div>
          )}

          <div>
            {attachedImageUrl && (
              <div className="mb-2.5 relative inline-block">
                <img 
                  src={attachedImageUrl} 
                  alt="תמונה מצורפת" 
                  className="w-16 h-16 object-cover rounded-xl border border-indigo-500/50 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setAttachedImageUrl(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center transition shadow cursor-pointer"
                  title="הסר תמונה"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className={clsx(
              "flex items-end gap-2 border rounded-2xl p-2 transition-all focus-within:ring-1 focus-within:ring-indigo-500",
              theme === 'dark' 
                ? "bg-slate-900 border-slate-700 text-white" 
                : "bg-white border-slate-300 text-slate-900 shadow-xs"
            )}>
              <button 
                type="button"
                onClick={handleSelectMedia} 
                className={clsx(
                  "p-2.5 rounded-xl transition-colors shrink-0 cursor-pointer",
                  theme === 'dark' ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800" : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                )}
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
                placeholder={isListening ? "מקשיב ומקליד ברצף... לחץ שליחה לעצירה וביצוע" : activeModule.inputPlaceholder}
                className={clsx(
                  "flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 text-xs resize-none py-2.5 px-2 outline-none",
                  theme === 'dark' ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                )}
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
                    : theme === 'dark' 
                    ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
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
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() && !attachedImageUrl}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl transition-colors shrink-0 shadow-lg shadow-indigo-500/20 disabled:shadow-none cursor-pointer"
                title="שליחה וסיום הקראה"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal: Opens 100% full screen modal dedicated to the specific agent */}
      {showSettings && (
        <KosaiSettingsBackoffice
          initialRuleId={currentRule?.id}
          moduleId={activeModule.moduleId}
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
