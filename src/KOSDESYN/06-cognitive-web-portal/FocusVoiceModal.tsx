import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { TenantThemeColors, CognitiveNodeModel, TenantProfile } from './types';
import { KOSUN_STYLE_PRESETS, StylePresetDefinition } from '../01-core-engine/areaCollectionManager';
import { getTerminology } from '../01-core-engine/pageTerminologyDictionary';
import { KosunUserAvatar } from './KosunUserAvatar';

interface FocusVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
  voiceTranscript: string;
  voiceQuery: string;
  setVoiceQuery: (val: string) => void;
  setVoiceTranscript: (val: string) => void;
  isAiThinking: boolean;
  dispatchSubmittedQuery: (queryText: string) => void;
  tenantTheme: TenantThemeColors;
  tenantProfile?: TenantProfile | null;
  stylePresetId?: string;
  nodes?: CognitiveNodeModel[];
  onExecuteCardAction?: (query: string) => void;
}

export const FocusVoiceModal: React.FC<FocusVoiceModalProps> = ({
  isOpen,
  onClose,
  isRecording,
  toggleRecording,
  voiceTranscript,
  voiceQuery,
  setVoiceQuery,
  setVoiceTranscript,
  isAiThinking,
  dispatchSubmittedQuery,
  tenantTheme,
  tenantProfile,
  stylePresetId,
  nodes
}) => {
  if (!isOpen) return null;

  // 1. מצב תצוגה מונחה-מיקוד: prompt (אייקון ענק + שאלות) מול answering (שיחה מוקלדת חיה)
  const [viewMode, setViewMode] = useState<'prompt' | 'answering'>('prompt');
  const [activeConversation, setActiveConversation] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const [displayedChars, setDisplayedChars] = useState(0);
  const typingTimerRef = useRef<any>(null);

  const isDay = tenantTheme.colorMode === 'day';
  const activePresetKey = stylePresetId || tenantTheme.stylePresetId || 'cyber_neon';
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[activePresetKey] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleDef.day : styleDef.night;
  const brandPrimary = tenantTheme.primary || modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleDef.geometry.cardRadius;
  const marketArchetype = tenantProfile?.marketArchetype || 'saas';

  // 2. ארבע שאלות המלצה מונחות-מיקוד
  const defaultPrompts = [
    { id: 'p1', text: 'הצג לי לקוחות שקנו מעל 1,000 ₪', icon: 'CreditCard', badge: 'הכנסות' },
    { id: 'p2', text: 'סנן לידים פעילים שממתינים לטיפול', icon: 'Flame', badge: 'לידים' },
    { id: 'p3', text: 'הצע לי פריסת נתונים מותאמת (רשת או זרקור)', icon: 'LayoutList', badge: 'פריסה' },
    { id: 'p4', text: 'ייבוא אנשי קשר מאקסל או סריקת כרטיס ביקור', icon: 'FileSpreadsheet', badge: 'פעולות' }
  ];

  const recommendationItems = (nodes && nodes.length >= 4 ? nodes.slice(0, 4) : defaultPrompts).map(
    (n, idx) => {
      const promptObj = defaultPrompts[idx] || defaultPrompts[0];
      return {
        id: (n as any).id || promptObj.id,
        text: (n as any).questionText || (n as any).title || promptObj.text,
        icon: (n as any).primaryIcon || (n as any).icon || promptObj.icon,
        badge: (n as any).indexBadge ? `0${idx + 1} • ${promptObj.badge}` : (n as any).badge || promptObj.badge
      };
    }
  );

  // 3. מאגר ידע חכם להפקת תשובת שיחה מדויקת לפי שאלה וטננט
  const resolveAnswerForQuestion = (qText: string): string => {
    // א. בדיקת מענה מתוך רשימת ה-nodes
    const matchedNode = (nodes || []).find(
      (n) =>
        n.questionText?.toLowerCase().includes(qText.toLowerCase()) ||
        qText.toLowerCase().includes(n.questionText?.toLowerCase() || '') ||
        (n as any).title?.toLowerCase().includes(qText.toLowerCase())
    );
    if (matchedNode?.shortAnswer) {
      return matchedNode.shortAnswer;
    }

    // ב. מאגר ידע עשיר לפי תוכן השאלה
    if (qText.includes('Big 3') || qText.includes('עומס מחשבתי')) {
      return 'שיטת The Big 3 מתמקדת בבחירת 3 תוצאות מפתח קריטיות ביום בלבד. כל משימה מתפרקת לתת-שלבים של עד 15 דקות ביצוע בטכנולוגיית AI Decompose. המוח משתחרר מרשימות עמוסות ומשיג פוקוס שיא ושקט נפשי מתמשך.';
    }
    if (qText.includes('קוליות') || qText.includes('עברית') || qText.includes('דיבור')) {
      return 'המערכת פועלת עם מנוע שפתי קולי המותאם במיוחד לעברית מדוברת ודיאלוגים מורכבים. אתה פשוט מדבר בקולך החופשי, והסוכן מנתח את הכוונות, מבודד את משימות המפתח ומנווט מיידית לפתרון המדויק.';
    }
    if (qText.includes('Solo') || qText.includes('Executive') || qText.includes('מסלול')) {
      return 'מסלול Solo Focus מיועד לעבודה אישית ממוקדת של מומחה יחיד. מסלול Executive מיועד למנהלים וצוותים, וכולל סנכרון רב-משתמשים, דשבורד מנהלים שקוף, התראות קוליות חכמות וניתוח מעמיק של שיחות לקוחות.';
    }
    if (qText.includes('אבחון') || qText.includes('פגישת') || qText.includes('סוכן')) {
      return 'פגישת האבחון אורכת כ-20 דקות שבהן הסוכן ממפה את צווארי הבקבוק בעסק שלך ובונה תוכנית פעולה ומיקוד מותאמת אישית. ניתן לתאם מועד ישירות מול היומן או להשאיר פרטים והסוכן יחזור אליך מיד.';
    }

    return `ניתחתי את שאלתך: "${qText}". מערכת KOSUN 2026 מפיקה ערך ישיר על ידי זיקוק מטרות, פירוק משימות מורכבות והמרת כל אינטראקציה לנכס דיגיטלי מניב.`;
  };

  // 4. התחלת שיחה והפעלת אפקט הקלדה חי
  const triggerQuestionConversation = (questionText: string) => {
    const clean = questionText.trim();
    if (!clean) return;

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    const answer = resolveAnswerForQuestion(clean);
    setActiveConversation({
      question: clean,
      answer
    });
    setDisplayedChars(0);
    setViewMode('answering');
  };

  // אפקט ההקלדה (Typewriter Effect)
  useEffect(() => {
    if (viewMode === 'answering' && activeConversation) {
      setDisplayedChars(0);
      const totalLen = activeConversation.answer.length;
      let curr = 0;

      typingTimerRef.current = setInterval(() => {
        curr += 1;
        setDisplayedChars(curr);
        if (curr >= totalLen) {
          clearInterval(typingTimerRef.current);
        }
      }, 16);

      return () => {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      };
    }
  }, [viewMode, activeConversation]);

  // עקרון הפוקוס: חזרת האייקון הענק והעלמת התשובה בשאלה נוספת
  const handleAskAnotherQuestion = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setViewMode('prompt');
    setActiveConversation(null);
    setDisplayedChars(0);
    setVoiceQuery('');
    setVoiceTranscript('');
  };

  // אישור מעבר לפעולה
  const handleConfirmAction = () => {
    if (activeConversation) {
      dispatchSubmittedQuery(activeConversation.question);
    }
    onClose();
  };

  // שליפת שאלת ההמשך מקולקציית המיני-קופי של הטננט
  const followupQuestion = getTerminology(
    'voice_modal_followup_suffix',
    marketArchetype,
    tenantProfile?.customDictionary
  );

  const anotherQuestionLabel = getTerminology(
    'voice_modal_another_question',
    marketArchetype,
    tenantProfile?.customDictionary
  );

  const confirmActionLabel = getTerminology(
    'voice_modal_action_confirm',
    marketArchetype,
    tenantProfile?.customDictionary
  );

  const modalBadgeLabel = getTerminology(
    viewMode === 'answering' ? 'voice_modal_badge_answering' : 'voice_modal_badge_prompt',
    marketArchetype,
    tenantProfile?.customDictionary
  );

  const footerLabel = getTerminology(
    'voice_modal_footer_label',
    marketArchetype,
    tenantProfile?.customDictionary
  );

  const isTypingDone = activeConversation
    ? displayedChars >= activeConversation.answer.length
    : false;

  return (
    <div
      className="absolute inset-0 z-50 backdrop-blur-2xl flex flex-col justify-between p-3.5 sm:p-4 select-none animate-fadeIn transition-colors duration-300"
      dir="rtl"
      style={{
        backgroundColor: isDay ? 'rgba(240, 249, 255, 0.97)' : 'rgba(4, 7, 17, 0.97)',
        color: modeColors.textColor,
        fontFamily: "'Heebo', sans-serif"
      }}
    >
      {/* הילת רקע זוהרת מותאמת לסגנון */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 rounded-full blur-[90px] pointer-events-none opacity-25"
        style={{ backgroundColor: brandPrimary }}
      />

      {/* 1. סרגל עליון קבוע: חזרה למסך + אינדיקטור מיתוג */}
      <div className="flex items-center justify-between z-20 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
          style={{
            borderRadius: cardRadius,
            backgroundColor: isDay ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
            borderColor: modeColors.borderColor,
            color: modeColors.textColor
          }}
        >
          <Icons.ArrowRight size={14} style={{ color: brandPrimary }} />
          <span>חזרה למסך</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: brandPrimary }} />
          <span
            className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border"
            style={{
              borderColor: modeColors.borderColor,
              backgroundColor: isDay ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              color: brandPrimary
            }}
          >
            {styleDef.shortLabel} • {modalBadgeLabel}
          </span>
        </div>
      </div>

      {/* 2. מצב תצוגה A: שאלת משתמש ושיחה חיה עם אפקט הקלדה (MODE: ANSWERING) */}
      {viewMode === 'answering' && activeConversation && (
        <div className="flex-1 flex flex-col justify-between my-auto py-2 z-20 animate-fadeIn">
          {/* כותרת השאלה הנבחרת בבועת משתמש נקייה */}
          <div
            className="p-3 border shadow-md shrink-0 mb-2 flex items-center gap-2.5"
            style={{
              borderRadius: cardRadius,
              backgroundColor: isDay ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.04)',
              borderColor: modeColors.borderColor
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${brandPrimary}25`, color: brandPrimary }}
            >
              <Icons.HelpCircle size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9.5px] font-mono block opacity-60">השאלה שלך:</span>
              <h3 className="text-xs sm:text-sm font-bold truncate leading-tight" style={{ color: modeColors.textColor }}>
                {activeConversation.question}
              </h3>
            </div>
          </div>

          {/* תיבת התשובה החיה עם אפקט ההקלדה */}
          <div
            className="flex-1 border p-3.5 sm:p-4 shadow-xl relative overflow-hidden flex flex-col justify-between my-1"
            style={{
              borderRadius: cardRadius,
              backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.9)',
              borderColor: modeColors.borderColor,
              boxShadow: `0 8px 30px -8px ${modeColors.glowColor}`
            }}
          >
            <div className="overflow-y-auto pr-1">
              {/* סרגל כותרת פנימי של הסוכן */}
              <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
                <KosunUserAvatar color={brandPrimary} glowColor={modeColors.glowColor} size={20} />
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: brandPrimary }}>
                  מענה סוכן ה-AI בשיחה חיה
                </span>
                {!isTypingDone && (
                  <span className="text-[9px] font-mono animate-pulse mr-auto" style={{ color: brandPrimary }}>
                    מקליד בזמן אמת...
                  </span>
                )}
              </div>

              {/* טקסט התשובה מוקלד תו אחר תו */}
              <p className="text-xs sm:text-[13px] leading-relaxed font-normal whitespace-pre-line" style={{ color: modeColors.textColor }}>
                {activeConversation.answer.slice(0, displayedChars)}
                {!isTypingDone && (
                  <span
                    className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse"
                    style={{ backgroundColor: brandPrimary }}
                  />
                )}
              </p>

              {/* תוספת סוף התשובה מקולקציית המיני-קופי של הטננט */}
              {isTypingDone && (
                <div
                  className="mt-3.5 pt-2.5 border-t border-dashed animate-fadeIn flex items-center gap-2"
                  style={{ borderColor: `${brandPrimary}40` }}
                >
                  <Icons.MessageSquareQuote size={14} style={{ color: brandPrimary }} className="shrink-0" />
                  <p className="text-xs font-bold leading-tight" style={{ color: brandPrimary }}>
                    {followupQuestion}
                  </p>
                </div>
              )}
            </div>

            {/* כפתורי פעולה עפ"י חוק המיקוד: שאלה נוספת (החזרת האייקון) מול המשך לפעולה */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 mt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={handleAskAnotherQuestion}
                className="w-full sm:flex-1 py-2 px-3 border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm hover:scale-[1.01]"
                style={{
                  borderRadius: cardRadius,
                  borderColor: modeColors.borderColor,
                  backgroundColor: isDay ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.06)',
                  color: modeColors.textColor
                }}
              >
                <Icons.RotateCcw size={13} style={{ color: brandPrimary }} />
                <span>{anotherQuestionLabel}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                className="w-full sm:flex-1 py-2 px-3 text-xs font-black text-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                style={{
                  borderRadius: cardRadius,
                  backgroundColor: brandPrimary,
                  boxShadow: `0 4px 16px ${modeColors.glowColor}`
                }}
              >
                <Icons.CheckCircle2 size={13} />
                <span>{confirmActionLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. מצב תצוגה B: מצב שאלות ומיקוד מלא (MODE: PROMPT) */}
      {viewMode === 'prompt' && (
        <>
          {/* מתחם המיקרופון המרכזי והסטטוס (Zero Scroll) */}
          <div className="flex flex-col items-center justify-center my-auto py-1 z-20 text-center shrink-0 animate-fadeIn">
            <div className="relative mb-2">
              <div
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl active:scale-95 ${
                  isRecording ? 'scale-110 shadow-rose-600/50' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: isRecording ? '#E11D48' : brandPrimary,
                  boxShadow: isRecording
                    ? '0 0 30px rgba(225, 29, 72, 0.6)'
                    : `0 0 30px ${modeColors.glowColor}`
                }}
                title={isRecording ? 'לחץ לעצירה ושליחה' : 'לחץ להקלטה'}
              >
                <Icons.Mic
                  size={32}
                  className={isRecording ? 'animate-bounce text-white' : 'text-black drop-shadow'}
                />
              </div>
              {isRecording && (
                <div className="absolute -inset-2.5 rounded-full border-2 border-rose-500/60 animate-ping pointer-events-none" />
              )}
            </div>

            <h3 className="text-sm sm:text-base font-black leading-tight" style={{ color: modeColors.textColor }}>
              {isRecording ? 'מקשיב לך עכשיו בעברית טבעית...' : 'על מה תרצה שנתמקד היום?'}
            </h3>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: modeColors.secondaryText }}>
              {isRecording ? 'הסוכן מתמלל ומעבד בזמן אמת...' : 'לחץ להקלטה קולית או בחר המלצה מול העיניים'}
            </p>
          </div>

          {/* שדה הקלדה / תמלול ישיר בעיצוב הסגנון */}
          <div
            className="w-full border p-2.5 shadow-lg relative z-20 shrink-0 my-1 flex flex-col justify-between animate-fadeIn"
            style={{
              borderRadius: cardRadius,
              backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.85)',
              borderColor: modeColors.borderColor,
              boxShadow: `0 4px 18px -4px ${modeColors.glowColor}`
            }}
          >
            <textarea
              rows={2}
              value={voiceQuery || voiceTranscript}
              onChange={(e) => {
                setVoiceQuery(e.target.value);
                setVoiceTranscript(e.target.value);
              }}
              placeholder="דבר במיקרופון או הקלד שאלה ישירה לסוכן..."
              className="w-full bg-transparent resize-none outline-none text-xs font-normal"
              style={{ color: modeColors.textColor }}
              dir="rtl"
            />

            <div className="flex items-center justify-between pt-1.5 border-t border-white/10 mt-1">
              <div className="flex items-center gap-1.5">
                <KosunUserAvatar color={brandPrimary} size={15} />
                <span className="text-[9.5px] font-mono" style={{ color: modeColors.secondaryText }}>
                  {tenantProfile?.name || 'KOSUN'} Voice Engine
                </span>
              </div>

              <button
                type="button"
                onClick={() => triggerQuestionConversation(voiceQuery || voiceTranscript)}
                disabled={!(voiceQuery || voiceTranscript) || isAiThinking}
                className="px-3.5 py-1 rounded-xl text-black font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: brandPrimary }}
              >
                {isAiThinking ? (
                  <>
                    <Icons.Sparkles size={12} className="animate-spin" />
                    <span>מעבד...</span>
                  </>
                ) : (
                  <>
                    <Icons.Send size={12} />
                    <span>שאל סוכן ◀</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* חוק המיקוד: 4 המלצות פרוסות ישירות מול העיניים (Hero Prompts Showcase) */}
          <div className="w-full z-20 shrink-0 my-1 animate-fadeIn">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[10px] font-black" style={{ color: brandPrimary }}>
                💡 הצעות דינמיות לשאילתות ופילטור (לחץ לפריסה):
              </span>
              <span className="text-[9px] font-mono" style={{ color: modeColors.secondaryText }}>
                יועץ CRM פעיל
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {recommendationItems.map((item) => {
                const PromptIcon = (Icons as any)[item.icon] || Icons.HelpCircle;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (onExecuteCardAction) {
                        onExecuteCardAction(item.text);
                        onClose();
                      } else {
                        triggerQuestionConversation(item.text);
                      }
                    }}
                    className="p-2 border text-right transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.02] active:scale-95 relative overflow-hidden shadow-sm"
                    style={{
                      borderRadius: cardRadius,
                      backgroundColor: isDay ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: modeColors.borderColor
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                      >
                        <PromptIcon size={11} />
                      </div>
                      <span
                        className="text-[8px] font-mono px-1 py-0.2 rounded"
                        style={{ backgroundColor: `${brandPrimary}15`, color: brandPrimary }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <p
                      className="text-[10px] font-bold leading-tight line-clamp-2 my-auto"
                      style={{ color: modeColors.textColor }}
                    >
                      {item.text}
                    </p>

                    <div className="flex items-center justify-between text-[8px] pt-1 mt-1 border-t border-white/10 w-full">
                      <span style={{ color: modeColors.secondaryText }}>פרוש כרטיסים ◀</span>
                      <Icons.ArrowLeft size={10} style={{ color: brandPrimary }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* פוטר מודל השיחה מתוך קולקציית המיני-קופי */}
      <div
        className="text-center text-[9.5px] font-mono pt-1 border-t border-white/10 z-20 shrink-0"
        style={{ color: modeColors.secondaryText }}
      >
        {footerLabel} • {tenantProfile?.name || 'KOSUN 2026'}
      </div>
    </div>
  );
};
