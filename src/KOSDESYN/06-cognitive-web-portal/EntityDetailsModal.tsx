import React from 'react';
import * as Icons from 'lucide-react';
import { EntityProduct, TenantProfile, TenantThemeColors } from './types';

interface EntityDetailsModalProps {
  item: EntityProduct | null;
  onClose: () => void;
  onAction: (actionText: string) => void;
  activeTab: 'specs' | 'details';
  setActiveTab: (tab: 'specs' | 'details') => void;
  tenantTheme: TenantThemeColors;
  tenantProfile?: TenantProfile | null;
  onMicClick?: () => void;
  onQuestionClick?: () => void;
}

export const EntityDetailsModal: React.FC<EntityDetailsModalProps> = ({
  item,
  onClose,
  onAction,
  activeTab,
  setActiveTab,
  tenantTheme,
  tenantProfile,
  onMicClick,
  onQuestionClick
}) => {
  if (!item) return null;

  // שליפת צבעי מיתוג דינמיים מהפריט או מהטננט
  const uiTheme = item.uiConfig?.themeColors || {};
  const accent = uiTheme.accent || tenantTheme.micColor || '#00F0FF';
  const accentGlow = uiTheme.accentGlow || 'rgba(0, 240, 255, 0.25)';
  const cardBg = uiTheme.cardBg || '#131c2e';
  const cardBorder = uiTheme.cardBorder || '#1e293b';

  // מפרט טכני מלא מהקולקציה
  const specs = (item.specsGrid && item.specsGrid.length > 0) ? item.specsGrid : [
    { id: 'mileage', label: 'קילומטראז׳', value: item.mileage ? `${item.mileage.toLocaleString()} ק״מ` : '0 ק״מ', icon: 'Gauge' },
    { id: 'engine', label: 'מנוע והספק', value: item.engine || 'V10 5.2L 620HP', icon: 'Zap' },
    { id: 'acceleration', label: 'תאוצה 0-100', value: '3.1 שניות', icon: 'Flame' },
    { id: 'gearbox', label: 'תיבת הילוכים', value: item.gearbox || 'S-Tronic 7', icon: 'Settings2' }
  ];

  // כרטיסיות הרחבה ומידע מלאות מהקולקציה
  const detailsCards = (item.detailsCards && item.detailsCards.length > 0) ? item.detailsCards : [
    {
      id: 'perf',
      title: 'חבילת ביצועים וקצה Performance',
      subtitle: 'מערכת פליטה ספורטיבית, בלמים קרמיים, דיפרנציאל מוגבל החלקה ומתלים אדפטיביים',
      icon: 'Flame',
      badge: 'Performance',
      highlightColor: '#00F0FF'
    },
    {
      id: 'interior',
      title: 'תא נוסעים וגימור Carbon Fibre',
      subtitle: 'מושבי ספורט עור נאפה, הגה ספורט משולב אלקנטרה, לוח שעונים וירטואלי מלא',
      icon: 'Sparkles',
      badge: 'Luxury',
      highlightColor: '#F59E0B'
    },
    {
      id: 'safety',
      title: 'בטיחות ומערכות סיוע אוטונומיות',
      subtitle: 'בקרת שיוט אדפטיבית, בלימה אוטונומית, חיישנים היקפיים ומצלמות 360°',
      icon: 'ShieldCheck',
      badge: 'SafeDrive',
      highlightColor: '#10B981'
    },
    {
      id: 'warranty',
      title: 'אחריות מקיפה ובדיקת מעבדה',
      subtitle: 'עבר בדיקת 150 נקודות מחמירה, ספר טיפולים מלא ואחריות מלאה מהסוכנות',
      icon: 'CheckCircle2',
      badge: 'Certified',
      highlightColor: '#8B5CF6'
    }
  ];

  // שאילתות מותאמות דינמית לפריט מהקולקציה
  const itemQuestions = (item as any)?.suggestedQuestions || [];
  const defaultItemQuestion = itemQuestions.length > 0 
    ? itemQuestions[0] 
    : (tenantProfile?.category === 'saas_productivity' || item.category?.includes('מנוי') || item.category?.includes('סדנאות'))
      ? `איך פועלת חבילת ${item.title.split(' ')[0]} והתאמתה לצוות?`
      : `מה אפשרויות המימון והטרייד-אין עבור ${item.title.split(' ')[0]}?`;

  return (
    <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl z-40 p-3 sm:p-3.5 flex flex-col justify-between font-sans select-none overflow-hidden animate-fadeIn">
      
      {/* 🌟 1. מודל העוזר (קפסולת AI) בראש עמוד המוצר - קבוע ועקבי כמו בכל המסכים! */}
      <div className="w-full shrink-0 mb-1">
        <div 
          className="w-full h-13 rounded-2xl p-1.5 flex items-center justify-between gap-2 border-2 shadow-2xl transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundColor: tenantTheme.capsuleBg || '#090d16',
            borderColor: tenantTheme.capsuleBorder || tenantTheme.micColor,
            boxShadow: `0 0 16px ${tenantTheme.micGlow}`
          }}
        >
          {/* אווטאר הסוכן כעיגול וידאו / תמונה */}
          <div 
            onClick={() => onAction(`ספר לי עוד על ${item.title}`)}
            className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer group border-2 border-white/20 hover:scale-105 transition-transform"
          >
            <img 
              src={tenantProfile?.agentAvatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=128&q=80"} 
              alt="Agent Play" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
              <Icons.Play size={13} className="text-white fill-white drop-shadow" />
            </div>
          </div>

          {/* הצעת שאילתא ייעודית לפריט הנוכחי ישירות מהקולקציה */}
          <div 
            onClick={() => onQuestionClick ? onQuestionClick() : onAction(defaultItemQuestion)}
            className="flex-1 text-right cursor-pointer px-1 overflow-hidden group"
            title="לחץ לשאילתא מהירה לגבי פריט זה"
          >
            <span className="text-[8px] text-slate-400 block leading-none mb-0.5">
              שאלות על {item.title.split(' ')[0]} • לחץ למענה:
            </span>
            <div className="text-xs font-black text-sky-300 group-hover:text-white transition-colors truncate">
              {defaultItemQuestion}
            </div>
          </div>

          {/* מיקרופון מתנענע דינמי */}
          <button
            type="button"
            onClick={onMicClick}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer relative group transition-transform active:scale-95"
            style={{
              backgroundColor: `${tenantTheme.micColor}18`,
              border: `1.5px solid ${tenantTheme.micColor}`
            }}
            title="לחץ לדיבור והקראה חכמה"
          >
            <div 
              className="absolute -inset-1 rounded-xl animate-ping opacity-30 pointer-events-none" 
              style={{ backgroundColor: tenantTheme.micColor }}
            />
            <div className="animate-[wiggle_1.2s_ease-in-out_infinite]">
              <Icons.Mic 
                size={18} 
                style={{ color: tenantTheme.micColor }}
                className="drop-shadow-md"
              />
            </div>
          </button>
        </div>
      </div>

      {/* 2. שורת ניווט תגית קטגוריה וכפתור סגירה מהיר */}
      <div className="flex items-center justify-between px-0.5 py-0.5 shrink-0">
        <span 
          className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
          style={{
            color: accent,
            backgroundColor: `${accent}20`,
            borderColor: `${accent}40`
          }}
        >
          {item.category || 'ספורט ויוקרה'}
        </span>
        <button 
          onClick={onClose} 
          className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-[10px] px-2"
        >
          <span>סגור</span>
          <Icons.X size={14} />
        </button>
      </div>

      {/* 🎯 3. החלק המרכזי: כותרת ומחיר מעל התמונה, תמונה, לשוניות מעבר וכרטיסיות נתונים (Zero Scroll) */}
      <div className="flex-1 flex flex-col justify-center items-center my-auto w-full py-0.5 overflow-hidden">
        
        {/* כותרת מלאה ומחיר מעל התמונה בשורה מיושרת */}
        <div className="w-full flex items-center justify-between gap-2 px-1 mb-1.5 shrink-0" dir="rtl">
          <div className="text-right overflow-hidden flex-1">
            <h2 className="text-sm sm:text-base font-black text-white leading-tight truncate">
              {item.title}
            </h2>
            <p className="text-[10px] text-slate-300 truncate mt-0.5 font-medium">
              {item.subtitle || (item.engine ? `${item.engine} • אספקה מיידית` : 'חוויית נהיגה וביצועים ללא פשרות')}
            </p>
          </div>
          <div className="text-left shrink-0">
            <span className="text-[9px] text-slate-400 block font-medium">מחיר מיוחד</span>
            <span 
              className="text-base font-black tracking-wide"
              style={{ color: tenantTheme.micColor || accent }}
            >
              ₪{item.price ? item.price.toLocaleString() : 'מחיר בסניף'}
            </span>
          </div>
        </div>

        {/* תמונת הרכב / הפריט עם תגית זמינות */}
        <div className="w-full mb-1.5 shrink-0">
          <div className="relative w-full h-28 sm:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-black text-white border border-white/20">
              {item.badgeText || (item.year ? `${item.year}` : 'זמין במלאי')}
            </div>
          </div>
        </div>

        {/* 📑 מתג לשוניות: 'מפרט טכני' מול 'מידע והרחבות' */}
        <div className="flex items-center justify-between p-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 mb-1.5 w-full shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'specs'
                ? 'text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              backgroundColor: activeTab === 'specs' ? accent : 'transparent',
              boxShadow: activeTab === 'specs' ? `0 4px 14px ${accentGlow}` : 'none'
            }}
          >
            <Icons.Gauge size={13} />
            <span>מפרט ופרטים טכניים</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'details'
                ? 'text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              backgroundColor: activeTab === 'details' ? accent : 'transparent',
              boxShadow: activeTab === 'details' ? `0 4px 14px ${accentGlow}` : 'none'
            }}
          >
            <Icons.Sparkles size={13} />
            <span>מידע והרחבות</span>
          </button>
        </div>

        {/* תוכן הלשונית: כרטיסיות נתונים מרהיבות (גריד 2x2) ללא שום גלילה */}
        {activeTab === 'specs' ? (
          /* 1. כרטיסיות מפרט טכני (גריד 2x2 חי מה-JSON) */
          <div className="grid grid-cols-2 gap-1.5 w-full" dir="rtl">
            {specs.map((s: any, idx: number) => {
              const IconCmp = (Icons as any)[s.icon] || Icons.Gauge;
              // שאילתות מותאמות דינמית לפריט מהקולקציה
  const itemQuestions = (item as any)?.suggestedQuestions || [];
  const defaultItemQuestion = itemQuestions.length > 0 
    ? itemQuestions[0] 
    : (tenantProfile?.category === 'saas_productivity' || item.category?.includes('מנוי') || item.category?.includes('סדנאות'))
      ? `איך פועלת חבילת ${item.title.split(' ')[0]} והתאמתה לצוות?`
      : `מה אפשרויות המימון והטרייד-אין עבור ${item.title.split(' ')[0]}?`;

  return (
                <div 
                  key={s.id || idx}
                  className="p-2 rounded-xl border flex flex-col justify-between transition-all"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: cardBorder
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-slate-400 text-[9px] font-bold">{s.label}</span>
                    <IconCmp size={12} style={{ color: accent }} />
                  </div>
                  <span className="font-black text-[11px] text-white truncate block">{s.value || s.val}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. לשונית 'מידע והרחבות' - 4 כרטיסיות מרהיבות של חבילות, בטיחות ואחריות */
          <div className="grid grid-cols-2 gap-1.5 w-full" dir="rtl">
            {detailsCards.map((card: any, idx: number) => {
              const IconCmp = (Icons as any)[card.icon] || Icons.Sparkles;
              // שאילתות מותאמות דינמית לפריט מהקולקציה
  const itemQuestions = (item as any)?.suggestedQuestions || [];
  const defaultItemQuestion = itemQuestions.length > 0 
    ? itemQuestions[0] 
    : (tenantProfile?.category === 'saas_productivity' || item.category?.includes('מנוי') || item.category?.includes('סדנאות'))
      ? `איך פועלת חבילת ${item.title.split(' ')[0]} והתאמתה לצוות?`
      : `מה אפשרויות המימון והטרייד-אין עבור ${item.title.split(' ')[0]}?`;

  return (
                <div
                  key={card.id || idx}
                  className="p-2 rounded-xl border flex flex-col justify-between transition-all"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: cardBorder
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span 
                      className="px-1.5 py-0.2 rounded text-[7px] font-black uppercase tracking-wider"
                      style={{
                        color: card.highlightColor || accent,
                        backgroundColor: `${card.highlightColor || accent}20`
                      }}
                    >
                      {card.badge}
                    </span>
                    <IconCmp size={12} style={{ color: card.highlightColor || accent }} />
                  </div>
                  <h4 className="font-extrabold text-[10px] text-white leading-tight line-clamp-1">
                    {card.title}
                  </h4>
                  <p className="text-[8px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {card.subtitle || card.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* 🔻 4. כפתורי הפעולה והחזרה - מוצמדים ישירות לנתונים ברווח קטן ללא חלל מת */}
        <div className="w-full mt-2 pt-2 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-1 border border-white/10 transition-all active:scale-95"
          >
            <span>חזרה לקטלוג</span>
          </button>
          
          <button
            onClick={() => onAction(`מעוניין בתיאום בדיקה / נסיעת מבחן עבור ${item.title}`)}
            className="flex-1 py-2 px-3.5 rounded-xl text-black font-extrabold text-xs flex items-center justify-center gap-1 transition-all shadow-lg hover:scale-105 active:scale-95"
            style={{
              backgroundColor: tenantTheme.micColor || accent,
              boxShadow: `0 4px 16px ${tenantTheme.micGlow || accentGlow}`
            }}
          >
            <Icons.Calendar size={13} /> 
            <span>תיאום התנסות</span>
          </button>
        </div>

      </div>
    </div>
  );
};
