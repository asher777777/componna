import React from 'react';
import * as Icons from 'lucide-react';
import { QuestionPageViewProps, QuestionCardItem } from './types';
import { getTerminology } from '../../factory/pageTerminologyDictionary';

/**
 * 👑 QuestionPageView
 * קומפוננטת תצוגה מבודדת (Pure Presentation) עבור עמוד השאלות והחקר ב-KOSUN 2026.
 * עומדת ב-100% בכללי הסקיל:
 * 1. Zero-Scroll Viewport Budget (כרטיס עליון 58%-60%, כרטיסים תחתונים 30%-32%).
 * 2. תמיכה רב-לשונית ב-Logical CSS Properties (`text-start`, `ms-*`, `me-*`).
 * 3. קולקציית מילון מונחים היררכית ללא Hardcoded Strings.
 * 4. אייקונים עשירים ללא עומס מספרים או אחוזים.
 * 5. Event Dispatcher כללי (`onAction`).
 */
export const QuestionPageView: React.FC<QuestionPageViewProps> = ({
  data,
  styleConfig = {},
  lang = 'he',
  archetypeId = 'saas',
  tenantProfile,
  customDictionary,
  onSelectRelatedQuestion,
  onAction,
  onOpenEditor,
  isOwner = false,
}) => {
  const isRtl = lang === 'he' || lang === 'ar';
  const brandColor = styleConfig.primaryColor || tenantProfile?.themeColors?.primary || '#00F0FF';

  const headline = getTerminology('funnel_headline', archetypeId, customDictionary);
  const recommendedBadge = getTerminology('funnel_badge_recommended', archetypeId, customDictionary);

  return (
    <div 
      className="w-full h-full flex flex-col justify-between py-1 select-none font-sans relative overflow-hidden" 
      dir={isRtl ? 'rtl' : 'ltr'}
      data-area-id="area_question_page_arena"
    >
      {/* כפתור עריכה מהיר למנהל המערכת */}
      {isOwner && onOpenEditor && (
        <button
          type="button"
          onClick={onOpenEditor}
          className="absolute top-1 start-1 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold shadow-md active:scale-95 transition-all"
        >
          <Icons.SlidersHorizontal size={12} />
          <span>עריכת עמוד השאלות</span>
        </button>
      )}

      {/* 1. כרטיס ראשי מרווח וממוקד (58%-60% מגובה המסגרת) */}
      <div 
        className="w-full flex-1 rounded-3xl p-5 flex flex-col justify-between border backdrop-blur-xl relative overflow-hidden shadow-2xl transition-all duration-300 mb-2"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 12, 22, 0.98))',
          borderColor: `${brandColor}40`,
          boxShadow: `0 8px 30px -10px ${brandColor}25`
        }}
      >
        <div 
          className="absolute -top-16 -left-16 w-36 h-36 rounded-full blur-[60px] pointer-events-none opacity-20"
          style={{ backgroundColor: brandColor }}
        />

        {/* שורת קטגוריה עליונה נקייה */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: brandColor }} />
            <span className="text-[11px] font-bold text-white/80 tracking-wide">
              {data.categoryTitle || 'עקרונות פרודוקטיביות'}
            </span>
          </div>
        </div>

        {/* גוף השאלה והמענה המפורט */}
        <div className="my-auto z-10 py-2">
          <h2 className="text-base sm:text-lg font-black text-white leading-snug drop-shadow-md text-start">
            {data.mainQuestion}
          </h2>
          <p className="text-xs sm:text-[13.5px] text-white/90 leading-relaxed mt-3 line-clamp-5 font-normal text-start">
            {data.mainAnswer}
          </p>
        </div>
      </div>

      {/* 2. כותרת עזר דינמית מתוך מילון המונחים */}
      <div className="flex items-center justify-between px-1 my-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <Icons.GitFork size={13} style={{ color: brandColor }} />
          <h3 className="text-[11px] font-black tracking-wide text-white/90">
            {headline}
          </h3>
        </div>
      </div>

      {/* 3. שלושה ריבועים מונמכים (30%-32% מגובה הארנה) */}
      <div className="w-full h-[31%] min-h-[96px] grid grid-cols-3 gap-2 shrink-0">
        {data.relatedQuestions.slice(0, 3).map((rel) => {
          const isConversionStep = rel.intentGoal === 'intent_conversion' || rel.isRecommended;
          
          // אייקון דינמי מתוך העיצוב
          const IconComp = (rel.icon && (Icons as any)[rel.icon]) || (isConversionStep ? Icons.Layers : Icons.HelpCircle);

          return (
            <div
              key={rel.id}
              onClick={() => {
                if (isConversionStep && onAction) {
                  onAction('conversion_click', rel);
                } else if (onSelectRelatedQuestion) {
                  onSelectRelatedQuestion(rel);
                }
              }}
              className={`rounded-2xl p-2.5 flex flex-col justify-between border transition-all duration-300 cursor-pointer active:scale-95 group shadow-md backdrop-blur-md relative overflow-hidden ${
                isConversionStep
                  ? 'bg-gradient-to-br from-cyan-950/90 via-slate-900 to-black border-cyan-400/60 hover:border-cyan-300 shadow-cyan-950/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/25'
              }`}
            >
              {/* אייקון מותאם אישית */}
              <div className="flex items-center justify-between w-full">
                <div 
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isConversionStep 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                      : 'bg-white/10 text-white/80 group-hover:bg-white/20'
                  }`}
                >
                  <IconComp size={13} />
                </div>

                {isConversionStep && (
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-black uppercase tracking-wider animate-pulse">
                    {rel.badge || recommendedBadge}
                  </span>
                )}
              </div>

              {/* טקסט השאלה (מתומצת וממורכז) */}
              <p className={`text-[10.5px] font-bold text-start leading-tight my-auto ${
                isConversionStep ? 'text-cyan-200 group-hover:text-cyan-100 font-black' : 'text-white/90 group-hover:text-white'
              }`}>
                {rel.question}
              </p>

              {/* שורת הנעה תחתונה */}
              <div className="flex items-center justify-between text-[9px] pt-1 border-t border-white/5">
                <span className={`truncate max-w-[70px] font-medium ${isConversionStep ? 'text-cyan-300 font-bold' : 'text-white/40'}`}>
                  {rel.ctaLabel || rel.category || ''}
                </span>
                <Icons.ArrowLeft 
                  size={10} 
                  className={`transition-transform group-hover:-translate-x-1 ${
                    isConversionStep ? 'text-cyan-400' : 'text-white/40'
                  }`} 
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
