import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { TenantProfile, TenantThemeColors } from './types';

export interface AboutBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  onMicClick?: () => void;
  onQuestionClick?: () => void;
  onAction?: (actionText: string) => void;
}

export const AboutBrandModal: React.FC<AboutBrandModalProps> = ({
  isOpen,
  onClose,
  tenantProfile,
  tenantTheme,
  onMicClick,
  onQuestionClick,
  onAction
}) => {
  const [activeStoryTab, setActiveStoryTab] = useState<'vision' | 'legacy' | 'numbers'>('vision');

  if (!isOpen) return null;

  const brandColor = tenantTheme.micColor || tenantTheme.primary || '#F59E0B';
  const brandGlow = tenantTheme.micGlow || 'rgba(245, 158, 11, 0.3)';

  // נתונים דינמיים מתוך הקולקציה של הטננט עם ערכי מחדל עשירים ברוח המותג
  const story = tenantProfile?.aboutStory || {};
  const companyName = tenantProfile?.name || 'טורבו מוטורס יבוא מקביל ורכבי קצה';
  const shortName = companyName.split('-')[0].trim();
  const tagline = tenantProfile?.tagline || 'סטנדרט בינלאומי של יוקרה, שירות ומצוינות מוטורית ללא פשרות';

  // 3 עמודי התווך / ערכי הליבה
  const pillars = story.pillars && story.pillars.length > 0 ? story.pillars : [
    {
      title: 'אמינות ושקיפות אבסולוטית',
      desc: 'כל רכב עובר בדיקת מעבדה מקיפה של 150 נקודות, תיעוד היסטורי מקיף ואחריות מלאה מהיבואן.',
      icon: 'ShieldCheck'
    },
    {
      title: 'התאמה אישית ואקסקלוסיביות',
      desc: 'יבוא אישי של מפרטי קצה, שילוב צבעים ייחודיים ומהדורות מוגבלות ישירות מפס הייצור האירופי.',
      icon: 'Crown'
    },
    {
      title: 'מעטפת שירות VIP וליווי 360°',
      desc: 'טרייד-אין הוגן, מימון מותאם, טיפולים ושינוע עד פתח הבית ע״י נהג פרטי ומנהל תיק אישי.',
      icon: 'Sparkles'
    }
  ];

  // נתוני מספרים והישגים
  const stats = story.stats && story.stats.length > 0 ? story.stats : [
    { label: 'שנות מוניטין ומצוינות', value: '18+', icon: 'Award' },
    { label: 'רכבי קצה שנמסרו', value: '2,400+', icon: 'Car' },
    { label: 'שביעות רצון לקוחות', value: '99.4%', icon: 'ThumbsUp' },
    { label: 'סניפי בוטיק ופריסה', value: '3', icon: 'MapPin' }
  ];

  // פסקאות סיפור המותג
  const paragraphs = story.paragraphs && story.paragraphs.length > 0 ? story.paragraphs : [
    `${shortName} הוקמה מתוך תשוקה בוערת להנדסת רכב עילאית, ביצועים יוצאי דופן וחוויית רכישה ברמה של מחלקה ראשונה.`,
    `אנו מביאים אליכם את יצירות המופת הנחשקות ביותר של עולם הרכב - מסטיישנים עוצמתיים ועד מכוניות על טהורות, תוך שמירה על רף שירות שאינו מתפשר על אף פרט קטן כגדול.`,
    `אצלנו הרכב הוא לא רק כלי תחבורה, אלא הצהרה אישית של סגנון, אופי ועוצמה. הצוות שלנו עומד לרשותכם מהרגע הראשון ועד למסירה החגיגית.`
  ];

  return (
    <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl z-40 p-2.5 sm:p-3 flex flex-col justify-start font-sans select-none overflow-hidden animate-fadeIn">
      
      {/* 🌟 1. מודל העוזר (קפסולת AI) בראש העמוד - קבוע וזהה בכל חלונות המערכת */}
      <div className="w-full shrink-0 mb-1">
        <div 
          className="w-full h-13 rounded-2xl p-1.5 flex items-center justify-between gap-2 border-2 shadow-2xl transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundColor: tenantTheme.capsuleBg || '#090d16',
            borderColor: tenantTheme.capsuleBorder || brandColor,
            boxShadow: `0 0 16px ${brandGlow}`
          }}
        >
          {/* אווטאר הסוכן */}
          <div 
            onClick={() => onAction ? onAction(`ספר לי על החזון של ${shortName}`) : null}
            className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer group border-2 border-white/20 hover:scale-105 transition-transform"
          >
            <img 
              src={tenantProfile?.agentAvatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=128&q=80"} 
              alt="Agent Avatar" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
              <Icons.Play size={13} className="text-white fill-white drop-shadow" />
            </div>
          </div>

          {/* הצעת שאילתא ייעודית למותג */}
          <div 
            onClick={() => onQuestionClick ? onQuestionClick() : onAction ? onAction(`מה הערכים המובילים והחזון של ${shortName}?`) : null}
            className="flex-1 text-right cursor-pointer px-1 overflow-hidden group"
            title="לחץ לקבלת מענה קולי/חכם אודות המותג"
          >
            <span className="text-[8px] text-slate-400 block leading-none mb-0.5">
              שאלות על המותג • לחץ למענה:
            </span>
            <div className="text-xs font-black text-sky-300 group-hover:text-white transition-colors truncate">
              מה הערכים המובילים והחזון של {shortName}?
            </div>
          </div>

          {/* מיקרופון אינטראקטיבי */}
          <button
            type="button"
            onClick={onMicClick}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer relative group transition-transform active:scale-95"
            style={{
              backgroundColor: `${brandColor}18`,
              border: `1.5px solid ${brandColor}`
            }}
            title="לחץ לדיבור והקראה חכמה"
          >
            <div 
              className="absolute -inset-1 rounded-xl animate-ping opacity-30 pointer-events-none" 
              style={{ backgroundColor: brandColor }}
            />
            <div className="animate-[wiggle_1.2s_ease-in-out_infinite]">
              <Icons.Mic 
                size={18} 
                style={{ color: brandColor }}
                className="drop-shadow-md"
              />
            </div>
          </button>
        </div>
      </div>

      {/* 2. שורת ניווט עליונה: תגית מותג יוקרתית וכפתור סגירה */}
      <div className="flex items-center justify-between px-0.5 py-0.5 shrink-0" dir="rtl">
        <div className="flex items-center gap-1.5">
          <span 
            className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold"
            style={{
              color: brandColor,
              backgroundColor: `${brandColor}20`,
              borderColor: `${brandColor}40`
            }}
          >
            {story.badge || 'מורשת ומצוינות'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            מאז 2008
          </span>
        </div>

        <button 
          onClick={onClose} 
          className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-[10px] px-2.5 active:scale-95"
        >
          <span>סגור</span>
          <Icons.X size={14} />
        </button>
      </div>

      {/* 🎯 3. מרכז התוכן המסוגנן - ללא גלילה (Zero Scroll) ופרוס בעיצוב מודרני מרהיב */}
      <div className="flex-1 flex flex-col justify-start items-center w-full pt-1 pb-0.5 overflow-hidden">
        
        {/* כותרת מותג ראשית וסלוגן */}
        <div className="w-full text-center px-1 mb-1.5 shrink-0" dir="rtl">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <Icons.Building2 size={16} style={{ color: brandColor }} />
            <h2 className="text-sm sm:text-base font-black text-white leading-tight">
              {story.title || `אודות ${shortName}`}
            </h2>
          </div>
          <p className="text-[10px] text-slate-300 font-medium line-clamp-1">
            {tagline}
          </p>
        </div>

        {/* 📑 מתג לשוניות תוכן מעוצב: חזון ומורשת / עמודי התווך / הישגים במספרים */}
        <div className="flex items-center justify-between p-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 mb-1.5 w-full shrink-0">
          <button
            type="button"
            onClick={() => setActiveStoryTab('vision')}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeStoryTab === 'vision'
                ? 'text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              backgroundColor: activeStoryTab === 'vision' ? brandColor : 'transparent',
              boxShadow: activeStoryTab === 'vision' ? `0 4px 14px ${brandGlow}` : 'none'
            }}
          >
            <Icons.Compass size={12} />
            <span>החזון והסיפור</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStoryTab('legacy')}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeStoryTab === 'legacy'
                ? 'text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              backgroundColor: activeStoryTab === 'legacy' ? brandColor : 'transparent',
              boxShadow: activeStoryTab === 'legacy' ? `0 4px 14px ${brandGlow}` : 'none'
            }}
          >
            <Icons.ShieldCheck size={12} />
            <span>ערכי הליבה</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStoryTab('numbers')}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeStoryTab === 'numbers'
                ? 'text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              backgroundColor: activeStoryTab === 'numbers' ? brandColor : 'transparent',
              boxShadow: activeStoryTab === 'numbers' ? `0 4px 14px ${brandGlow}` : 'none'
            }}
          >
            <Icons.TrendingUp size={12} />
            <span>במספרים</span>
          </button>
        </div>

        {/* תוכן הלשונית הפעילה (קומפקטי ומותאם בדיוק ליחס 9:16 ללא גלילה) */}
        {activeStoryTab === 'vision' && (
          <div className="w-full flex flex-col justify-between flex-1 max-h-[260px] p-2.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-black/95 border border-white/10 shadow-2xl text-right overflow-hidden" dir="rtl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1 border-b border-white/10 pb-1">
                <Icons.Quote size={14} style={{ color: brandColor }} />
                <span className="text-[11px] font-bold text-slate-200">
                  {story.quote || '״מצוינות מוטורית אינה יעד - היא דרך חיים יומיומית.״'}
                </span>
              </div>
              {paragraphs.map((p, idx) => (
                <p key={idx} className="text-[10px] text-slate-300 leading-relaxed font-normal">
                  {p}
                </p>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
              <span className="font-semibold">{story.signature || 'הנהלת החברה וצוות המומחים'}</span>
              <span className="text-amber-400 font-bold">KOSUN VERIFIED 2026</span>
            </div>
          </div>
        )}

        {activeStoryTab === 'legacy' && (
          <div className="w-full flex flex-col justify-between flex-1 max-h-[260px] gap-1.5" dir="rtl">
            {pillars.map((pillar, idx) => {
              const IconCmp = (Icons as any)[pillar.icon || 'Sparkles'] || Icons.Sparkles;
              return (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 flex items-start gap-2.5 transition-all shadow-md flex-1"
                >
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${brandColor}20`,
                      color: brandColor,
                      border: `1px solid ${brandColor}40`
                    }}
                  >
                    <IconCmp size={14} />
                  </div>
                  <div className="flex flex-col text-right overflow-hidden">
                    <span className="text-[11px] font-black text-white leading-tight">
                      {pillar.title}
                    </span>
                    <span className="text-[9.5px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                      {pillar.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeStoryTab === 'numbers' && (
          <div className="w-full grid grid-cols-2 gap-2 flex-1 max-h-[260px]" dir="rtl">
            {stats.map((stat, idx) => {
              const IconCmp = (Icons as any)[stat.icon || 'Award'] || Icons.Award;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/10 flex flex-col justify-between items-center text-center shadow-lg hover:border-amber-500/50 transition-all group"
                >
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: `${brandColor}20`,
                      color: brandColor
                    }}
                  >
                    <IconCmp size={16} />
                  </div>
                  <div>
                    <span 
                      className="text-lg sm:text-xl font-black block tracking-tight group-hover:scale-105 transition-transform"
                      style={{ color: brandColor }}
                    >
                      {stat.value}
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5 leading-tight">
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🔻 4. כפתורי הפעולה והחזרה - מוצמדים ישירות לתוכן ברווח קטן ללא חלל מת */}
        <div className="w-full mt-2 pt-2 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-1 border border-white/10 transition-all active:scale-95"
          >
            <span>חזרה לעמוד הראשי</span>
          </button>
          
          <button
            onClick={() => {
              onClose();
              if (onAction) {
                onAction(`שלום, קראתי אודות ${shortName} ואשמח לשוחח עם מנהל לקוחות אישי.`);
              }
            }}
            className="flex-1 py-2 px-3.5 rounded-xl text-black font-extrabold text-xs flex items-center justify-center gap-1 transition-all shadow-lg hover:scale-105 active:scale-95"
            style={{
              backgroundColor: brandColor,
              boxShadow: `0 4px 16px ${brandGlow}`
            }}
          >
            <Icons.PhoneCall size={13} /> 
            <span>יצירת קשר עם מנהל תיק</span>
          </button>
        </div>

      </div>
    </div>
  );
};
