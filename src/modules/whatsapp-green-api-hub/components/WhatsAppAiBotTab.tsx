import React, { useState } from 'react';
import {
  Bot, Sparkles, Plus, Trash2, Edit3, Check, Play, MessageSquare,
  ShieldCheck, Send, KeyRound, ExternalLink, RefreshCw, Smartphone,
  Radio, Zap, HelpCircle, Layers, CheckCircle2, Sliders
} from 'lucide-react';
import {
  WhatsAppAiBotConfig,
  WhatsAppBotButton,
  WhatsAppAiBotService,
  DEFAULT_AI_BOTS
} from '../services/whatsappAiBotService';

interface Props {
  googleAiApiKey?: string;
  onOpenSettings: () => void;
  isDark: boolean;
}

export const WhatsAppAiBotTab: React.FC<Props> = ({
  googleAiApiKey,
  onOpenSettings,
  isDark,
}) => {
  const [bots, setBots] = useState<WhatsAppAiBotConfig[]>(() => WhatsAppAiBotService.getStoredBots());
  const [selectedBotId, setSelectedBotId] = useState<string>(bots[0]?.id || 'bot_customer_service');

  const activeBot = bots.find((b) => b.id === selectedBotId) || bots[0];

  // Simulator State
  const [simChat, setSimChat] = useState<{ role: 'user' | 'model'; text: string; buttons?: { buttonId: string; buttonText: string }[] }[]>([
    {
      role: 'model',
      text: 'שלום! 👋 כאן נציג השירות הדיגיטלי החכם של Comona. במה אוכל לעזור לך היום?',
      buttons: activeBot?.interactiveButtons?.map((b) => ({ buttonId: b.buttonId, buttonText: b.buttonText })) || [],
    },
  ]);
  const [simInput, setSimInput] = useState('');
  const [isSimLoading, setIsSimLoading] = useState(false);

  const saveBotChanges = (updatedBot: WhatsAppAiBotConfig) => {
    const updated = bots.map((b) => (b.id === updatedBot.id ? updatedBot : b));
    setBots(updated);
    WhatsAppAiBotService.saveBots(updated);
  };

  const handleCreateNewBot = () => {
    const newBot: WhatsAppAiBotConfig = {
      id: `bot_${Date.now()}`,
      name: 'בוט אוטומציה חדש',
      role: 'נציג AI מותאם אישית',
      avatarIcon: 'Bot',
      isActive: false,
      triggerType: 'all',
      triggerKeywords: ['שלום', 'עזרה'],
      systemPrompt: 'אתה בוט שירות חכם ויעיל בוואטסאפ. ענה בעברית ברורה ותמציתית.',
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      interactiveButtons: [
        { buttonId: 'btn_1', buttonText: 'ℹ️ מידע נוסף', actionType: 'prompt', actionValue: 'פרט עוד' },
        { buttonId: 'btn_2', buttonText: '📞 פנה לנציג', actionType: 'message', actionValue: 'נציג יחזור אליך' },
      ],
      autoGenerateButtons: true,
      createdAt: Date.now(),
    };
    const updated = [...bots, newBot];
    setBots(updated);
    setSelectedBotId(newBot.id);
    WhatsAppAiBotService.saveBots(updated);
  };

  const handleDeleteBot = (id: string) => {
    if (bots.length <= 1) {
      alert('חייב להישאר לפחות בוט אחד במערכת');
      return;
    }
    if (confirm('האם למחוק בוט זה?')) {
      const updated = bots.filter((b) => b.id !== id);
      setBots(updated);
      setSelectedBotId(updated[0].id);
      WhatsAppAiBotService.saveBots(updated);
    }
  };

  const handleSimSend = async (userMsgText: string) => {
    if (!userMsgText.trim() || isSimLoading) return;

    const newHistory = [...simChat, { role: 'user' as const, text: userMsgText }];
    setSimChat(newHistory);
    setSimInput('');
    setIsSimLoading(true);

    try {
      const res = await WhatsAppAiBotService.generateAiResponse({
        apiKey: googleAiApiKey || '',
        botConfig: activeBot,
        userMessage: userMsgText,
        chatHistory: newHistory.map((h) => ({ role: h.role, text: h.text })),
      });

      setSimChat((prev) => [
        ...prev,
        {
          role: 'model',
          text: res.replyText,
          buttons: res.buttons,
        },
      ]);
    } catch (err) {
      setSimChat((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'אירעה שגיאה בעיבוד התשובה על ידי מנוע ה-AI.',
        },
      ]);
    } finally {
      setIsSimLoading(false);
    }
  };

  const handleApplyPresetPrompt = (presetKey: string) => {
    if (!activeBot) return;
    let newPrompt = '';
    let newButtons: WhatsAppBotButton[] = [];

    if (presetKey === 'sales') {
      newPrompt = `אתה נציג מכירות ולידים מוביל של Comona. תפקידך להציג את היתרונות של המערכת, לאסוף פרטי התקשרות (שם, מייל, סוג עסק) ולהניע לפעולה לקביעת פגישת הדגמה.`;
      newButtons = [
        { buttonId: 'b_demo', buttonText: '📅 קביעת הדגמה', actionType: 'prompt', actionValue: 'אני מעוניין לתאם הדגמה' },
        { buttonId: 'b_price', buttonText: '💰 מחירון חבילות', actionType: 'prompt', actionValue: 'מהן חבילות המחיר?' },
        { buttonId: 'b_human', buttonText: '👤 שיחה עם איש מכירות', actionType: 'message', actionValue: 'איש מכירות ייצור עמך קשר תוך דקות' },
      ];
    } else if (presetKey === 'support') {
      newPrompt = `אתה מהנדס תמיכה טכנית בכיר. עזור למשתמשים לפתור תקלות טכניות, סנכרון והגדרות בוואטסאפ בצורה שלב-אחר-שלב ברורה ופשוטה.`;
      newButtons = [
        { buttonId: 'b_restart', buttonText: '🔄 אתחול מופע', actionType: 'prompt', actionValue: 'איך מאתחלים את המופע?' },
        { buttonId: 'b_status', buttonText: '📊 בדיקת תקינות', actionType: 'prompt', actionValue: 'בדוק לי את החיבור' },
      ];
    } else if (presetKey === 'scheduler') {
      newPrompt = `אתה בוט לזימון תורים ופגישות. שאל את הלקוח לאיזה תאריך ושעה נוח לו, ואשר את הפרטים בצורה מסודרת.`;
      newButtons = [
        { buttonId: 'b_morning', buttonText: '☀️ תור בבוקר (09:00-12:00)', actionType: 'prompt', actionValue: 'מתאים לי בבוקר' },
        { buttonId: 'b_afternoon', buttonText: '🌆 תור אחה"צ (14:00-18:00)', actionType: 'prompt', actionValue: 'מתאים לי אחה"צ' },
      ];
    }

    if (newPrompt) {
      saveBotChanges({
        ...activeBot,
        systemPrompt: newPrompt,
        interactiveButtons: newButtons,
      });
    }
  };

  const isKeyConfigured = Boolean(googleAiApiKey && googleAiApiKey.trim().length > 5);

  return (
    <div className="space-y-6 text-xs" dir="rtl">
      {/* AI Key Header Status */}
      {!isKeyConfigured ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-500">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">מפתח Google AI (Gemini) אינו מוגדר</p>
              <p className="text-xs opacity-90">כדי שהבוטים יוכלו לייצר תשובות AI חכמות ואוטומטיות, יש להזין את המפתח ברכיב הסנכרון וההגדרות.</p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-md"
          >
            <KeyRound className="w-4 h-4" />
            <span>הגדר מפתח AI בסנכרון</span>
          </button>
        </div>
      ) : (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
          isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="font-bold">מנוע Google AI (Gemini) מחובר ופעיל בהצלחה</span>
          </div>
          <span className="text-[11px] font-mono opacity-80">מופעל מפתח מרכזי</span>
        </div>
      )}

      {/* Main Bot Workspace: Left Builder & Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Bots List & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Bots Selection Bar */}
          <div className={`p-4 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-800/30">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-sm">הבוטים המוגדרים שלך ({bots.length})</span>
              </div>
              <button
                onClick={handleCreateNewBot}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>בוט חדש</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bots.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBotId(b.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                    selectedBotId === b.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-md'
                      : isDark
                      ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="truncate pr-1">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold truncate">{b.name}</span>
                    </div>
                    <span className="text-[10px] opacity-75 truncate block">{b.role}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${b.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBot(b.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="מחק בוט"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Bot Configuration Editor */}
          {activeBot && (
            <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
              <div className="flex flex-wrap items-center justify-between border-b pb-3 border-slate-800/30 gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-sm">הגדרת בוט: {activeBot.name}</span>
                </div>

                {/* Active Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="font-medium text-xs">בוט פעיל למענה:</span>
                  <input
                    type="checkbox"
                    checked={activeBot.isActive}
                    onChange={(e) => saveBotChanges({ ...activeBot, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeBot.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {activeBot.isActive ? 'פעיל' : 'מושהה'}
                  </span>
                </label>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>שם הבוט</label>
                  <input
                    type="text"
                    value={activeBot.name}
                    onChange={(e) => saveBotChanges({ ...activeBot, name: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>תפקיד / כותרת</label>
                  <input
                    type="text"
                    value={activeBot.role}
                    onChange={(e) => saveBotChanges({ ...activeBot, role: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>

              {/* Trigger Types */}
              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>מתי הבוט יגיב בוואטסאפ?</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'כל הודעה נכנסת' },
                    { id: 'keyword', label: 'רק לפי מילות מפתח' },
                    { id: 'welcome', label: 'רק כהודעת פתיחה' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => saveBotChanges({ ...activeBot, triggerType: t.id as any })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        activeBot.triggerType === t.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Prompt & Quick Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>הוראות AI ואישיות (System Prompt)</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetPrompt('sales')}
                      className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[10px]"
                    >
                      תבנית מכירות
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetPrompt('support')}
                      className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[10px]"
                    >
                      תבנית תמיכה
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetPrompt('scheduler')}
                      className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[10px]"
                    >
                      זימון תורים
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={activeBot.systemPrompt}
                  onChange={(e) => saveBotChanges({ ...activeBot, systemPrompt: e.target.value })}
                  placeholder="הגדר כיצד הבוט יתנהג, יענה וישרת את הלקוחות..."
                  className={`w-full p-3 rounded-2xl border text-xs focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Interactive Buttons Designer (כפתורים אינטראקטיביים) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold">כפתורי מענה מהיר אינטראקטיביים (עד 3 כפתורים בוואטסאפ)</span>
                  </div>
                  {activeBot.interactiveButtons.length < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newBtn: WhatsAppBotButton = {
                          buttonId: `btn_${Date.now()}`,
                          buttonText: `כפתור ${activeBot.interactiveButtons.length + 1}`,
                          actionType: 'prompt',
                          actionValue: 'המשך טיפול',
                        };
                        saveBotChanges({
                          ...activeBot,
                          interactiveButtons: [...activeBot.interactiveButtons, newBtn],
                        });
                      }}
                      className="text-indigo-400 hover:underline text-xs cursor-pointer font-semibold"
                    >
                      + הוסף כפתור
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {activeBot.interactiveButtons.map((btn, idx) => (
                    <div
                      key={btn.buttonId || idx}
                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <input
                        type="text"
                        value={btn.buttonText}
                        onChange={(e) => {
                          const updated = [...activeBot.interactiveButtons];
                          updated[idx].buttonText = e.target.value;
                          saveBotChanges({ ...activeBot, interactiveButtons: updated });
                        }}
                        placeholder="טקסט כפתור (למשל: 📞 פנה לנציג)"
                        className={`flex-1 p-2 rounded-lg border text-xs ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />

                      <select
                        value={btn.actionType}
                        onChange={(e) => {
                          const updated = [...activeBot.interactiveButtons];
                          updated[idx].actionType = e.target.value as any;
                          saveBotChanges({ ...activeBot, interactiveButtons: updated });
                        }}
                        className={`p-2 rounded-lg border text-xs ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="prompt">שאילתת AI המשך</option>
                        <option value="message">הודעה קבועה</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = activeBot.interactiveButtons.filter((_, i) => i !== idx);
                          saveBotChanges({ ...activeBot, interactiveButtons: updated });
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Interactive Real-Time WhatsApp Phone Simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className={`p-4 rounded-3xl border flex-1 flex flex-col ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            
            {/* Phone Header */}
            <div className={`p-3 rounded-2xl flex items-center justify-between border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  🤖
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>{activeBot?.name || 'בוט WhatsApp AI'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    סימולטור בדיקה חי
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSimChat([
                    {
                      role: 'model',
                      text: 'שלום! 👋 כאן נציג השירות הדיגיטלי החכם. במה אוכל לעזור לך?',
                      buttons: activeBot?.interactiveButtons?.map((b) => ({ buttonId: b.buttonId, buttonText: b.buttonText })) || [],
                    },
                  ]);
                }}
                className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                title="אפס שיחה"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Phone Chat Stream */}
            <div className="flex-1 my-3 p-3 rounded-2xl overflow-y-auto space-y-3 min-h-[360px] max-h-[460px] bg-slate-950/40 border border-slate-800/40">
              {simChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`space-y-1.5 max-w-[88%] text-xs ${
                    msg.role === 'user' ? 'mr-auto text-left' : 'ml-auto text-right'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl border shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white border-indigo-500 rounded-bl-sm'
                        : isDark
                        ? 'bg-slate-800 text-slate-100 border-slate-700 rounded-br-sm'
                        : 'bg-white text-slate-900 border-slate-200 rounded-br-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] opacity-60 text-left mt-1">
                      {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Interactive Buttons underneath bot message */}
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className="space-y-1 pt-1 pr-1">
                      {msg.buttons.map((b) => (
                        <button
                          key={b.buttonId}
                          onClick={() => handleSimSend(b.buttonText)}
                          className="w-full py-1.5 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-medium text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <span>{b.buttonText}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isSimLoading && (
                <div className="ml-auto p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>ה-AI מנסח תשובה...</span>
                </div>
              )}
            </div>

            {/* Phone Message Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimSend(simInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="הקלד הודעת בדיקה לבוט..."
                className={`flex-1 p-2.5 rounded-xl border text-xs focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="submit"
                disabled={!simInput.trim() || isSimLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
