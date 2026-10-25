import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Inbox,
  Target,
  RotateCcw,
  User as UserIcon,
  Loader2,
  Check
} from 'lucide-react';
import { BrainstormMessage, Task, InboxItem } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { sound } from '../services/soundService';
import { KosTimeAiService } from '../services/kosTimeAiService';
import { useKosTimeTenant } from '../hooks/useKosTimeTenant';
import { KosunVectorIcon } from './KosunLogo';
import { KosunIconButton } from './KosunIconButton';

interface BrainstormScreenProps {
  onAddToInbox: (title: string, note?: string) => void;
  onAddToToday: (title: string) => void;
  onSendToDecompose: (title: string) => void;
  todayTasks: Task[];
  inboxItems: InboxItem[];
}

export const BrainstormScreen: React.FC<BrainstormScreenProps> = ({
  onAddToInbox,
  onAddToToday,
  todayTasks,
  inboxItems,
}) => {
  const { tenantId } = useKosTimeTenant();
  const [messages, setMessages] = useState<BrainstormMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '׳׳” ׳”׳¨׳¢׳™׳•׳ ׳׳• ׳”׳׳—׳©׳‘׳” ׳©׳ ׳¨׳¦׳” ׳׳”׳׳™׳¨ ׳׳ ׳›׳¡ ׳׳¢׳©׳™?',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedTasksMap, setAddedTasksMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    '׳׳ ׳₪׳•׳× ׳¢׳•׳׳¡',
    '׳₪׳™׳¨׳•׳§ ׳₪׳¨׳•׳™׳§׳˜ ׳’׳“׳•׳',
    '3 ׳ ׳›׳¡׳™׳ ׳׳”׳™׳•׳',
  ];

  const extractTasksFromContent = (content: string): string[] => {
    const lines = content.split('\n');
    const tasks: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('[׳׳©׳™׳׳”]') ||
        trimmed.startsWith('- [׳׳©׳™׳׳”]') ||
        trimmed.startsWith('ג€¢ [׳׳©׳™׳׳”]')
      ) {
        tasks.push(trimmed.replace(/^[-ג€¢*]\s*\[׳׳©׳™׳׳”\]\s*/, '').replace(/^\[׳׳©׳™׳׳”\]\s*/, ''));
      } else if (trimmed.startsWith('[TASK:]') || trimmed.startsWith('- [TASK:]')) {
        tasks.push(trimmed.replace(/^[-ג€¢*]\s*\[TASK:\]\s*/, '').replace(/^\[TASK:\]\s*/, ''));
      }
    });

    return tasks.filter((t) => t.length > 2);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    sound.playPop();
    const userMsg: BrainstormMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const contextSummary = `נכסי היום: ${todayTasks.map((t) => t.title).join(", ") || "אין עדיין"}. תיק נכסים: ${inboxItems.length} פריטים.`;
      const aiReply = await KosTimeAiService.brainstormChat(
        newHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        contextSummary,
        tenantId
      );
      const extracted = extractTasksFromContent(aiReply);

      const aiMsg: BrainstormMessage = {
        id: 'ai_' + Date.now(),
        role: 'assistant',
        content: aiReply,
        createdAt: new Date().toISOString(),
        extractedTasks: extracted.length > 0 ? extracted : undefined,
      };

      setMessages([...newHistory, aiMsg]);
      sound.playTaskComplete();
    } catch (err) {
      console.error(err);
      const errorMsg: BrainstormMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: '׳‘׳¢׳™׳™׳× ׳×׳§׳©׳•׳¨׳×. ׳ ׳¡׳” ׳©׳•׳‘.',
        createdAt: new Date().toISOString(),
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('׳׳׳₪׳¡ ׳׳× ׳”׳©׳™׳—׳”?')) {
      setMessages([
        {
          id: 'welcome_new',
          role: 'assistant',
          content: '׳׳” ׳”׳¨׳¢׳™׳•׳ ׳”׳‘׳ ׳©׳ ׳¨׳¦׳” ׳׳”׳׳™׳¨ ׳׳ ׳›׳¡?',
          createdAt: new Date().toISOString(),
        },
      ]);
      setAddedTasksMap({});
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[820px] pb-16 text-[#F0F4FF]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1A2B4C]">
        <div className="flex items-center gap-2">
          <KosunVectorIcon size={30} />
          <span className="font-['Orbitron',sans-serif] text-base font-black text-white">
            AI
          </span>
        </div>

        <KosunIconButton
          icon={RotateCcw}
          label="׳׳™׳₪׳•׳¡ ׳©׳™׳—׳”"
          variant="ghost"
          onClick={handleClearChat}
        />
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const tasks = m.extractedTasks || extractTasksFromContent(m.content);

          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#1A2B4C] text-[#F0F4FF]'
                    : 'bg-[#0D1F38] text-[#00F0FF] border border-[#00F0FF]/40'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <KosunVectorIcon size={20} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-sm sm:text-base leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-[#12162B] border border-[#1A2B4C] text-[#F0F4FF]'
                    : 'bg-[#0D0E1F] border border-[#1A2B4C] text-[#F0F4FF]'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{m.content}</div>

                {/* If AI suggested actionable tasks */}
                {!isUser && tasks.length > 0 && (
                  <div className="pt-3 border-t border-[#1A2B4C] space-y-2">
                    {tasks.map((taskText, idx) => {
                      const key = `${m.id}_task_${idx}`;
                      const isAdded = addedTasksMap[key];

                      return (
                        <div
                          key={key}
                          className="p-3 bg-[#12162B] border border-[#1A2B4C] rounded-2xl flex items-center justify-between gap-3"
                        >
                          <span className="text-sm font-semibold text-white truncate">
                            {taskText}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {isAdded ? (
                              <span className="text-xs text-[#00F0FF] font-bold flex items-center gap-1 px-2.5 py-1 bg-[#00F0FF]/15 border border-[#00F0FF]/30 rounded-full">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <>
                                <KosunIconButton
                                  icon={Inbox}
                                  label="׳׳×׳™׳§"
                                  variant="cyan"
                                  onClick={() => {
                                    sound.playPop();
                                    onAddToInbox(taskText, '׳ ׳•׳¦׳¨ ׳׳‘׳•׳˜ ׳©׳™׳—׳”');
                                    setAddedTasksMap({ ...addedTasksMap, [key]: true });
                                  }}
                                />

                                <KosunIconButton
                                  icon={Target}
                                  label="׳׳”׳™׳•׳"
                                  variant="primary"
                                  onClick={() => {
                                    sound.playPop();
                                    onAddToToday(taskText);
                                    setAddedTasksMap({ ...addedTasksMap, [key]: true });
                                  }}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-2xl bg-[#0D1F38] text-[#00F0FF] border border-[#00F0FF]/40 flex items-center justify-center shrink-0">
              <KosunVectorIcon size={20} />
            </div>
            <div className="bg-[#0D0E1F] border border-[#1A2B4C] rounded-3xl p-3 shadow-md flex items-center gap-2 text-sm text-[#00F0FF]">
              <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs whitespace-nowrap px-4 py-2 bg-[#0D0E1F] hover:bg-[#1A2B4C] border border-[#1A2B4C] hover:border-[#00F0FF]/40 rounded-full text-[#F0F4FF]/80 hover:text-white transition-all cursor-pointer shrink-0"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Capsule Input Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative bg-[#0D0E1F] border border-[#1A2B4C] focus-within:border-[#00F0FF] rounded-full shadow-lg p-2 flex items-center gap-2 transition-all"
        >
          <VoiceInputButton
            onTranscribed={(transcribedText) => {
              setInputText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
            }}
            className="border-[#1A2B4C] bg-[#12162B] text-[#00F0FF] hover:bg-[#00F0FF]/20 p-2.5 rounded-full"
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="׳”׳§׳׳“ ׳›׳׳..."
            className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-white focus:outline-none placeholder:text-[#F0F4FF]/40 text-center"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 disabled:opacity-30 text-[#070913] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
