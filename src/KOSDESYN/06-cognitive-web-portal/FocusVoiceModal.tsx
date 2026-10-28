import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { TenantThemeColors, CognitiveNodeModel, TenantProfile } from './types';
import { KOSUN_STYLE_PRESETS, StylePresetDefinition } from '../01-core-engine/areaCollectionManager';
import { KosunUserAvatar } from './KosunUserAvatar';
import { KOS_CRM_FUNCTIONS_COLLECTION, CrmFunctionItem } from '../../modules/KosCrm/services/crmFunctionsCollection';

interface FocusVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRecording?: boolean;
  toggleRecording?: () => void;
  voiceTranscript?: string;
  voiceQuery?: string;
  setVoiceQuery?: (val: string) => void;
  setVoiceTranscript?: (val: string) => void;
  isAiThinking?: boolean;
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
  isRecording: externalIsRecording,
  toggleRecording: externalToggleRecording,
  voiceTranscript: externalVoiceTranscript,
  voiceQuery: externalVoiceQuery,
  setVoiceQuery: externalSetVoiceQuery,
  setVoiceTranscript: externalSetVoiceTranscript,
  isAiThinking = false,
  dispatchSubmittedQuery,
  tenantTheme,
  tenantProfile,
  stylePresetId,
  nodes,
  onExecuteCardAction,
}) => {
  if (!isOpen) return null;

  // מצבי קלט מקומיים (עם תמיכה ב-Props חיצוניים אם קיימים)
  const [localQuery, setLocalQuery] = useState(externalVoiceQuery || externalVoiceTranscript || '');
  const [internalRecording, setInternalRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  const isRecording = externalIsRecording !== undefined ? externalIsRecording : internalRecording;
  const currentQuery = externalVoiceQuery !== undefined ? externalVoiceQuery : localQuery;

  const handleQueryChange = (val: string) => {
    setLocalQuery(val);
    if (externalSetVoiceQuery) externalSetVoiceQuery(val);
    if (externalSetVoiceTranscript) externalSetVoiceTranscript(val);
  };

  // אסימוני עיצוב מתוך קולקציית KOSDESYN
  const isDay = tenantTheme.colorMode === 'day';
  const activePresetKey = stylePresetId || tenantTheme.stylePresetId || 'cyber_neon';
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[activePresetKey] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleDef.day : styleDef.night;
  const brandPrimary = tenantTheme.primary || modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleDef.geometry.cardRadius || '24px';

  // זיהוי דיבור משופר בעברית (Web Speech API עם interimResults ו-continuous)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SpeechRec();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'he-IL';

      recog.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (finalStr) {
          setLocalQuery((prev) => {
            const next = prev ? `${prev} ${finalStr.trim()}` : finalStr.trim();
            if (externalSetVoiceQuery) externalSetVoiceQuery(next);
            if (externalSetVoiceTranscript) externalSetVoiceTranscript(next);
            return next;
          });
          setInterimText('');
        } else {
          setInterimText(interimStr);
        }
      };

      recog.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setInternalRecording(false);
      };

      recog.onend = () => {
        setInternalRecording(false);
      };

      recognitionRef.current = recog;
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    };
  }, []);

  // הפעלה / עצירה של המיקרופון (לא שולח לשרת! רק מתמלל לתוך התיבה)
  const handleToggleMic = () => {
    if (externalToggleRecording) {
      externalToggleRecording();
      return;
    }

    if (!recognitionRef.current) {
      alert('זיהוי דיבור אינו נתמך בדפדפן זה.');
      return;
    }

    if (internalRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setInternalRecording(false);
    } else {
      setInterimText('');
      try {
        recognitionRef.current.start();
        setInternalRecording(true);
      } catch (e) {
        setInternalRecording(false);
      }
    }
  };

  // שליחה לשרת: מופעל אך ורק בלחיצה על אייקון הרמקול (Speaker / Volume2)!
  const handleSendToServerViaSpeaker = () => {
    const textToSend = (currentQuery || interimText).trim();
    if (!textToSend || isAiThinking) return;

    // עצירת ההקלטה במידה ופעילה
    if (isRecording) {
      if (externalToggleRecording) externalToggleRecording();
      else {
        try {
          recognitionRef.current?.stop();
        } catch (e) {}
        setInternalRecording(false);
      }
    }

    if (onExecuteCardAction) {
      onExecuteCardAction(textToSend);
    } else {
      dispatchSubmittedQuery(textToSend);
    }
    onClose();
  };

  // שליפת המלצות פעולה מהירות מתוך קולקציית crmFunctionsCollection
  const quickSuggestions: CrmFunctionItem[] = KOS_CRM_FUNCTIONS_COLLECTION.slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-md animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}
      dir="rtl"
    >
      <div
        className="w-full max-w-lg overflow-hidden border-2 shadow-2xl relative flex flex-col p-4 sm:p-5 transition-all duration-300"
        style={{
          borderRadius: cardRadius,
          backgroundColor: isDay ? '#FFFFFF' : modeColors.cardBg,
          borderColor: brandPrimary,
          boxShadow: `0 0 50px ${modeColors.glowColor}`,
          color: modeColors.textColor,
          fontFamily: styleDef.fontFamily,
        }}
      >
        {/* כותרת מודאל + כפתור סגירה */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm"
              style={{
                backgroundColor: `${brandPrimary}18`,
                borderColor: brandPrimary,
                color: brandPrimary,
              }}
            >
              <KosunUserAvatar color={brandPrimary} size={18} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black" style={{ color: modeColors.textColor }}>
                יועץ קולי ושאילתות חכמות • {tenantProfile?.name || 'KOSCRM'}
              </h3>
              <p className="text-[10px] font-medium" style={{ color: modeColors.secondaryText }}>
                הקלט באמצעות המיקרופון, ולחץ על הרמקול לשליחת הפקודה לשרת
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: modeColors.secondaryText }}
            title="סגור"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* גוף המודאל: תיבת טקסט מעוצבת + מיקרופון להקראה + רמקול לשליחה לשרת */}
        <div className="my-3 flex flex-col gap-2.5">
          <div
            className="w-full border p-3 shadow-inner relative flex flex-col transition-all"
            style={{
              borderRadius: '18px',
              backgroundColor: isDay ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.45)',
              borderColor: isRecording ? '#EF4444' : `${brandPrimary}55`,
              boxShadow: isRecording ? '0 0 16px rgba(239,68,68,0.4)' : `0 0 16px ${modeColors.glowColor}`,
            }}
          >
            <textarea
              rows={3}
              value={currentQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="לחץ על המיקרופון לזיהוי דיבור משופר, או הקלד שאילתא כאן..."
              className="w-full bg-transparent resize-none outline-none text-xs sm:text-sm font-bold leading-relaxed placeholder:font-normal"
              style={{ color: modeColors.textColor }}
              dir="rtl"
            />

            {/* טקסט ביניים חי בזמן זיהוי דיבור */}
            {interimText && (
              <div className="text-[11px] font-medium italic mt-1 px-1 text-emerald-400 animate-pulse">
                מקשיב: "{interimText}"
              </div>
            )}

            {/* סרגל כפתורי הפעולה בתחתית התיבה */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/10">
              {/* כפתור המיקרופון: מזהה הקראה משופר (לא שולח לשרת) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md ${
                    isRecording ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: isRecording ? '#DC2626' : `${brandPrimary}22`,
                    border: `1.5px solid ${isRecording ? '#EF4444' : brandPrimary}`,
                    color: isRecording ? '#FFFFFF' : brandPrimary,
                  }}
                  title={isRecording ? 'הפסק הקלטה' : 'הפעל מיקרופון להקראה'}
                >
                  <Icons.Mic size={14} className={isRecording ? 'animate-bounce' : ''} />
                  <span>{isRecording ? 'מקשיב... לחץ לסיום' : 'מיקרופון (הקראה)'}</span>
                </button>

                {currentQuery && (
                  <button
                    type="button"
                    onClick={() => handleQueryChange('')}
                    className="text-[10px] underline px-1 transition-colors hover:text-red-400"
                    style={{ color: modeColors.secondaryText }}
                  >
                    נקה
                  </button>
                )}
              </div>

              {/* כפתור הרמקול: רק כאשר לוחצים עליו נשלחת השאילתא לשרת! */}
              <button
                type="button"
                onClick={handleSendToServerViaSpeaker}
                disabled={(!currentQuery.trim() && !interimText.trim()) || isAiThinking}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg disabled:opacity-40"
                style={{
                  backgroundColor: brandPrimary,
                  color: '#000000',
                  boxShadow: `0 2px 14px ${modeColors.glowColor}`,
                }}
                title="שליחת השאילתא לשרת (טריגר הרמקול)"
              >
                {isAiThinking ? (
                  <>
                    <Icons.Loader2 size={15} className="animate-spin text-black" />
                    <span>שולח...</span>
                  </>
                ) : (
                  <>
                    <Icons.Volume2 size={16} className="text-black" />
                    <span>שלח שאילתא (רמקול) ◀</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* הצעות מהירות מתוך קולקציית crmFunctionsCollection */}
        <div className="shrink-0 mb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black" style={{ color: brandPrimary }}>
              💡 פעולות מובילות מתוך הקולקציה (לחץ להזנה):
            </span>
            <span className="text-[9px] font-bold" style={{ color: modeColors.secondaryText }}>
              crmFunctionsCollection ({KOS_CRM_FUNCTIONS_COLLECTION.length} פונקציות)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {quickSuggestions.map((item) => {
              const ItemIcon = (Icons as any)[item.icon] || Icons.Sparkles;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleQueryChange(item.title)}
                  className="p-2 rounded-xl border text-right transition-all flex flex-col justify-between hover:scale-[1.02] active:scale-95 group text-[10px]"
                  style={{
                    backgroundColor: isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                    borderColor: modeColors.borderColor,
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <ItemIcon size={12} style={{ color: brandPrimary }} />
                    <span
                      className="text-[8px] font-mono px-1 rounded"
                      style={{ backgroundColor: `${brandPrimary}15`, color: brandPrimary }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <span className="font-bold line-clamp-1" style={{ color: modeColors.textColor }}>
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* פוטר קומפקטי */}
        <div className="text-center text-[9px] pt-2 border-t border-white/10 shrink-0 font-medium" style={{ color: modeColors.secondaryText }}>
          מערכת מזהה קולית משופרת • שאילתא נשלחת אך ורק בלחיצה על כפתור הרמקול
        </div>
      </div>
    </div>
  );
};
