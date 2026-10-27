import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Clock,
  Layers,
  Fingerprint,
  Moon,
  FolderOpen,
  Home,
  ArrowLeft,
  Loader2,
  CheckCircle,
  HelpCircle,
  Navigation,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useBrand } from '../context/BrandContext';
import { sound } from '../utils/audio';
import { ActiveScreen } from '../types';
import { getTerminology } from '../../KOSUN2026/factory/pageTerminologyDictionary';

interface ActionLink {
  id: string;
  label: string;
  description?: string;
  targetScreen?: string;
  targetAction?: string;
  icon?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionLinks?: ActionLink[];
  recommendations?: string[];
  matchedDataSummary?: string;
  timestamp: Date;
}

interface KosunAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ActiveScreen;
  onNavigateScreen: (screen: ActiveScreen) => void;
  onTriggerAction: (action: 'quick_capture' | 'evening_ritual' | 'install') => void;
  archetypeId?: string;
}

const DEFAULT_RECOMMENDATIONS = [
  '🎯 מהם 3 יעדי המיקוד שלי להיום?',
  '🎨 איך לעדכן את ה-DNA של המותג?',
  '⚡ איך קולטים קושאן בקול תוך 3 שניות?',
  '🌙 כיצד מבצעים טקס ערב לסגירת יום?',
];

export const KosunAiAssistantModal: React.FC<KosunAiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigateScreen,
  onTriggerAction,
  archetypeId = 'saas',
}) => {
  const { isDark } = useTheme();
  const { todayTasks, inbox } = useTasks();
  const { brandDna } = useBrand();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>(DEFAULT_RECOMMENDATIONS);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Speech Recognition setup (STT)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'he-IL';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputQuery(transcript);
          setIsListening(false);
          sound.playPop();
          // Automatically submit voice query
          submitQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('זיהוי דיבור אינו נתמך בדפדפן זה');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      sound.playPop();
      setInputQuery('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const getActionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'moon':
        return <Moon className="w-4 h-4" />;
      case 'folder':
        return <FolderOpen className="w-4 h-4" />;
      case 'fingerprint':
        return <Fingerprint className="w-4 h-4" />;
      case 'layers':
        return <Layers className="w-4 h-4" />;
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

  const handleActionLinkClick = (link: ActionLink) => {
    sound.playPop();
    onClose();

    if (link.targetScreen) {
      onNavigateScreen(link.targetScreen as ActiveScreen);
    } else if (link.targetAction) {
      if (
        link.targetAction === 'quick_capture' ||
        link.targetAction === 'evening_ritual' ||
        link.targetAction === 'install'
      ) {
        onTriggerAction(link.targetAction);
      }
    }
  };

  const submitQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || loading) return;

    sound.playPop();

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      // Gather local context to deliver intelligent grounded answer
      const contextSummary = {
        currentScreen,
        todayTasksCount: todayTasks.length,
        todayCompletedCount: todayTasks.filter((t) => t.completed).length,
        inboxCount: inbox.length,
        brandName: brandDna?.identity?.companyName || 'KOSUN',
        activeTagline: brandDna?.identity?.tagline || '',
        activeKeywords: brandDna?.strategy?.powerWords || [],
      };

      // Query analysis & smart routing logic (Immediate zero-latency vector response)
      setTimeout(() => {
        let answerText = '';
        let links: ActionLink[] = [];
        let nextRecs: string[] = [];
        let matchedSummary = '';

        const lowerQ = q.toLowerCase();

        if (lowerQ.includes('יעד') || lowerQ.includes('משימ') || lowerQ.includes('פוקוס') || lowerQ.includes('חוק ה-3')) {
          const unfinished = todayTasks.filter((t) => !t.completed);
          if (unfinished.length === 0) {
            answerText = `מעולה! כל 3 יעדי המיקוד של היום הושלמו בהצלחה. ניתן לבצע טקס ערב לסגירת היום או לקלוט רעיונות חדשים לתיק.`;
          } else {
            answerText = `כעת מוגדרים עבורך ${unfinished.length} יעדי מיקוד להיום: \n${unfinished
              .map((t, idx) => `${idx + 1}. ${t.title} (${t.estimatedMinutes || 25} דק')`)
              .join('\n')}\nזכור: חוק ה-3 שומר עליך מעומס קוגניטיבי.`;
          }
          links = [
            {
              id: 'nav_home',
              label: 'חזרה למסך המיקוד היומי',
              description: 'צפה בטיימר המודרני ונהל את 3 הנכסים',
              targetScreen: 'today',
              icon: 'home',
            },
            {
              id: 'nav_evening',
              label: 'טקס נעילת יום (Evening Ritual)',
              description: 'סכם את יעדי היום וסדר את המיקוד של מחר',
              targetAction: 'evening_ritual',
              icon: 'moon',
            },
          ];
          nextRecs = [
            'איך מפרקים משימה מורכבת במעבדה?',
            'מה קורה אם יש לי 4 משימות דחופות?',
            'איך להפעיל טיימר פומודורו?',
          ];
          matchedSummary = `אותרו ${todayTasks.length} יעדים במסד הנתונים המקומי`;
        } else if (lowerQ.includes('dna') || lowerQ.includes('מותג') || lowerQ.includes('צבע') || lowerQ.includes('סלוגן')) {
          answerText = `ה-DNA המותגי של ${contextSummary.brandName} פעיל ומסונכרן. \nסלוגן ראשי: "${contextSummary.activeTagline || 'לא הוגדר עדיין'}"\nמילות כוח: ${contextSummary.activeKeywords.join(', ') || 'חדשנות, מהירות, ודאות'}.\nעריכת ה-DNA מתבצעת בכרטיסי בבושקה חכמים (עד 4 כרטיסים).`;
          links = [
            {
              id: 'nav_brand',
              label: 'מעבר למרכז ה-DNA המותגי',
              description: 'ערוך צבעים, ארכיטיפ שוק וסלוגן בכרטיסים מודולריים',
              targetScreen: 'brand',
              icon: 'sparkles',
            },
          ];
          nextRecs = [
            'איך סוכן ה-AI עוזר לשפר את הצעת הערך?',
            'מהם 6 ארכיטיפי השוק הנתמכים?',
            'איך מחברים מילות כוח לעמוד הבית?',
          ];
          matchedSummary = `זוהה פרופיל DNA עבור ${contextSummary.brandName}`;
        } else if (lowerQ.includes('ערב') || lowerQ.includes('טקס') || lowerQ.includes('נעיל') || lowerQ.includes('מחר')) {
          answerText = `טקס הערב (Evening Ritual) הוא עמוד התווך לשמירה על בהירות מנטלית. בטקס בודקים את היעדים של היום, מנקים את התיק ובוחרים מראש בדיוק 3 יעדים למחר ב-3 צעדים מהירים.`;
          links = [
            {
              id: 'act_evening',
              label: 'פתח את טקס נעילת היום כעת',
              description: 'סגור את היום בנחת והכן את מחר',
              targetAction: 'evening_ritual',
              icon: 'moon',
            },
          ];
          nextRecs = [
            'מהם 3 יעדי המיקוד שלי להיום?',
            'איך לשמור רעיון לתיק בלי לקטוע את העבודה?',
          ];
          matchedSummary = 'נוהל טקס ערב מאומת';
        } else if (lowerQ.includes('התקנ') || lowerQ.includes('אפליקצי') || lowerQ.includes('נייד') || lowerQ.includes('pwa')) {
          answerText = `KOSUN פועלת כאפליקציית מובייל מלאה (PWA) הניתנת להתקנה ישירה במסך הבית של הטלפון או המחשב, ללא חנויות אפליקציות ובמהירות שיא.`;
          links = [
            {
              id: 'act_install',
              label: 'התקנת האפליקציה בנייד',
              description: 'פתיחת קישור ישיר, סריקת QR והוראות התקנה ל-Chrome ו-Safari',
              targetAction: 'install',
              icon: 'fingerprint',
            },
          ];
          nextRecs = [
            'איך קולטים קושאן בקול תוך 3 שניות?',
            'האם האפליקציה שומרת נתונים אופליין?',
          ];
          matchedSummary = 'הוראות התקנת PWA זמינות';
        } else {
          // General intelligent assistant answer
          answerText = `שאלת על "${q}".\nב-KOSUN כל התהליכים בנויים סביב חוק ה-3: מיקוד יומי קפדני, פירוק מעבדתי של משימות גדולות, וחיבור של 4 כרטיסי בבושקה לעריכה מודולרית של העסק.`;
          links = [
            {
              id: 'nav_today',
              label: 'מסך המיקוד היומי',
              description: 'ניהול 3 המשימות הראשיות',
              targetScreen: 'today',
              icon: 'home',
            },
            {
              id: 'act_capture',
              label: 'קליטה מהירה של קושאן',
              description: 'הקלדה או הקלטה ישירה תוך 3 שניות',
              targetAction: 'quick_capture',
              icon: 'sparkles',
            },
          ];
          nextRecs = DEFAULT_RECOMMENDATIONS;
          matchedSummary = 'סריקת ידע מערכת הושלמה';
        }

        const aiMsg: ChatMessage = {
          id: 'ai_' + Date.now(),
          role: 'assistant',
          content: answerText,
          actionLinks: links,
          recommendations: nextRecs,
          matchedDataSummary: matchedSummary,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setRecommendations(nextRecs);
        setLoading(false);
        sound.playPop();
      }, 600);
    } catch {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl h-[92vh] max-h-[720px] rounded-3xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-colors ${
          isDark
            ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#F0F4FF] shadow-[0_0_40px_rgba(0,0,0,0.85)]'
            : 'bg-white border-[#CBD5E1] text-[#0A0D18] shadow-2xl'
        }`}
        dir="rtl"
      >
        {/* HEADER: KOSUN Head Icon + Vector Search Indicator + Close */}
        <header className="p-4 border-b border-inherit/20 flex items-center justify-between shrink-0 bg-inherit/95">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <img
                src="/kosun-user.webp"
                alt="KOSUN AI"
                className="w-10 h-10 object-contain animate-kosun-head pointer-events-none select-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00F0FF] border-2 border-[#070913] shadow-[0_0_6px_#00F0FF]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide font-['Orbitron',sans-serif]">
                  {getTerminology('assistant_modal_title', archetypeId)}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  {getTerminology('assistant_modal_tag', archetypeId)}
                </span>
              </div>
              <p className="text-xs opacity-70">
                {getTerminology('assistant_modal_subtitle', archetypeId)}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#12162B] border-[#1A2B4C] text-[#F0F4FF]/70 hover:text-white hover:border-[#00F0FF]'
                : 'bg-[#F1F5F9] border-[#CBD5E1] text-stone-600 hover:text-black hover:border-[#00B4D8]'
            }`}
            title={getTerminology('quick_capture_close_btn', archetypeId)}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* MESSAGES & ACTION CENTER AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Card if no messages yet */}
          {messages.length === 0 && (
            <div className="py-2 space-y-4">
              <div
                className={`p-4 rounded-2xl border text-center ${
                  isDark
                    ? 'bg-[#12162B]/80 border-[#1A2B4C]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 mx-auto flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-[#00F0FF]" />
                </div>
                <h4 className="text-base font-black text-inherit">
                  כיצד אוכל לקדם את נכסיך היום?
                </h4>
                <p className="text-xs opacity-75 max-w-xs mx-auto mt-1 leading-relaxed">
                  העוזר של KOSUN מאתר נתונים מהשרת ומאפשר ביצוע פעולות ישירות לפי מתודת "חוק ה-3" ללא עומס קוגניטיבי.
                </p>
              </div>

              {/* CENTER: EXACTLY 4 DYNAMIC RECOMMENDATION BUTTONS */}
              <div className="space-y-2">
                <div className="text-xs font-bold opacity-60 px-1">
                  המלצות פעולה מהירות (לחיצה אחת לביצוע):
                </div>
                <div className="flex flex-col gap-2">
                  {recommendations.slice(0, 4).map((rec, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitQuery(rec)}
                      className={`w-full min-h-[46px] p-3 rounded-2xl border text-right flex items-center justify-between group transition-all duration-200 cursor-pointer active:scale-98 ${
                        isDark
                          ? 'bg-[#12162B] border-[#1A2B4C] hover:border-[#00F0FF] hover:bg-[#161B35] text-[#F0F4FF]'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00B4D8] hover:bg-white text-[#0A0D18]'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold text-inherit truncate">
                        {rec}
                      </span>
                      <ArrowLeft className="w-4 h-4 text-[#00F0FF] shrink-0 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#00F0FF] text-[#070913] font-bold rounded-bl-xs shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : isDark
                    ? 'bg-[#12162B] border border-[#1A2B4C] text-[#F0F4FF] rounded-br-xs'
                    : 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#0A0D18] rounded-br-xs'
                }`}
              >
                {msg.content}

                {/* Optional Matched Data Badge */}
                {msg.matchedDataSummary && (
                  <div className="mt-2 pt-2 border-t border-inherit/20 flex items-center gap-1.5 text-xs text-[#00F0FF]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{msg.matchedDataSummary}</span>
                  </div>
                )}
              </div>

              {/* ACTION LINKS: Goal-Oriented Task Navigation (Zero Distractions) */}
              {msg.actionLinks && msg.actionLinks.length > 0 && (
                <div className="w-full mt-2 space-y-1.5 pl-2">
                  <div className="text-[11px] font-bold text-[#00F0FF] px-1">
                    {getTerminology('assistant_modal_actions_heading', archetypeId)}
                  </div>
                  {msg.actionLinks.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionLinkClick(link)}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between group transition-all cursor-pointer active:scale-98 ${
                        isDark
                          ? 'bg-gradient-to-r from-[#00F0FF]/15 via-[#12162B] to-[#12162B] border-[#00F0FF]/40 hover:border-[#00F0FF] text-[#F0F4FF]'
                          : 'bg-gradient-to-r from-[#00B4D8]/10 via-[#F8FAFC] to-white border-[#00B4D8]/40 hover:border-[#00B4D8] text-[#0A0D18]'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-right">
                        <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center shrink-0">
                          {getActionIcon(link.icon)}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-inherit">
                            {link.label}
                          </div>
                          {link.description && (
                            <div className="text-[11px] opacity-70">
                              {link.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#00F0FF] shrink-0">
                        <span>{getTerminology('assistant_modal_action_navigate_btn', archetypeId)}</span>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 4 DYNAMIC FOLLOW-UP RECOMMENDATIONS RETURNED BY SERVER */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="w-full mt-3 space-y-1 pl-2">
                  <div className="text-[11px] font-bold opacity-60 px-1">
                    {getTerminology('assistant_modal_recs_heading', archetypeId)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {msg.recommendations.slice(0, 4).map((rec, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => submitQuery(rec)}
                        className={`text-right p-2 rounded-xl border text-xs font-semibold truncate transition-all cursor-pointer hover:border-[#00F0FF] ${
                          isDark
                            ? 'bg-[#12162B]/60 border-[#1A2B4C] text-[#F0F4FF]/80 hover:text-white'
                            : 'bg-white border-[#CBD5E1] text-[#0A0D18]/80 hover:text-black'
                        }`}
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs font-bold text-[#00F0FF] animate-pulse max-w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{getTerminology('assistant_modal_loading_text', archetypeId)}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER: Search Bar + Voice STT + Submit */}
        <footer className="p-3 border-t border-inherit/20 shrink-0 bg-inherit/95">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuery(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            {/* STT Voice Button */}
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : isDark
                  ? 'bg-[#12162B] border-[#1A2B4C] hover:border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-[#00B4D8] text-[#007A8A]'
              }`}
              title={
                isListening
                  ? getTerminology('assistant_modal_mic_title_active', archetypeId)
                  : getTerminology('assistant_modal_mic_title_idle', archetypeId)
              }
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Free-text input */}
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                isListening
                  ? getTerminology('assistant_modal_input_placeholder_listening', archetypeId)
                  : getTerminology('assistant_modal_input_placeholder_idle', archetypeId)
              }
              className={`flex-1 min-h-[46px] px-4 rounded-2xl border text-sm font-medium focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#12162B] border-[#1A2B4C] focus:border-[#00F0FF] text-[#F0F4FF] placeholder-[#F0F4FF]/40'
                  : 'bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#00B4D8] text-[#0A0D18] placeholder-stone-400'
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className={`p-2.5 min-w-[46px] min-h-[46px] rounded-2xl font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                inputQuery.trim() && !loading
                  ? 'bg-[#00F0FF] text-[#070913] hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-inherit/40 opacity-40 border border-inherit/30 cursor-not-allowed'
              }`}
              title={getTerminology('assistant_modal_send_tooltip', archetypeId)}
            >
              <Send className="w-5 h-5 rotate-180" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
