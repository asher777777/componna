import React from 'react';
import * as Icons from 'lucide-react';
import { BranchInfo, TenantProfile, TenantThemeColors } from './types';

interface BranchesViewProps {
  branches: BranchInfo[];
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  highlightedBranchId?: string | null;
  highlightCategory?: 'proximity' | 'charging' | 'friday' | null;
  highlightBannerText?: string | null;
  onClearHighlight?: () => void;
  onBackHome: () => void;
  onSelectBranchQuery: (query: string) => void;
}

export const BranchesView: React.FC<BranchesViewProps> = ({
  branches,
  tenantProfile,
  tenantTheme,
  highlightedBranchId,
  highlightCategory,
  highlightBannerText,
  onClearHighlight,
  onBackHome,
  onSelectBranchQuery,
}) => {
  const brandColor = tenantTheme.micColor || tenantTheme.primary || '#F59E0B';

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden animate-fadeIn font-sans select-none relative">
      
      {/* כותרת גדולה, דינמית ומותאמת מיתוג וסגנון החברה */}
      <div className="w-full flex flex-col items-center text-center px-1 pt-0.5 pb-1 shrink-0" dir="rtl">
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-xl flex items-center justify-center shadow-lg border"
            style={{ 
              backgroundColor: `${brandColor}20`,
              borderColor: brandColor,
              color: brandColor
            }}
          >
            <Icons.MapPin size={15} />
          </div>
          <h2 className="text-base font-black text-white tracking-wide">
            {tenantProfile?.name ? `סניפי ונקודות השירות של ${tenantProfile.name.split('-')[0].trim()}` : 'סניפי ואולמות התצוגה'}
          </h2>
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          {tenantProfile?.tagline || `3 סניפים בפריסה ארצית • חניה פרטית לאורחים • עמדות טעינה מהירות`}
        </p>
      </div>

      {/* באנר תוצאת שאילתת לקוח אינטראקטיבית אם הופעלה שאילתא */}
      {highlightBannerText && (
        <div 
          className="mx-1 mb-1 p-2 rounded-xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-between text-right animate-fadeIn"
          dir="rtl"
        >
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
            <Icons.Sparkles size={14} className="text-amber-400 shrink-0 animate-spin" />
            <span>{highlightBannerText}</span>
          </div>
          {onClearHighlight && (
            <button 
              onClick={onClearHighlight} 
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
            >
              <Icons.X size={12} />
            </button>
          )}
        </div>
      )}

      {/* 3 כרטיסיות נתונים קומפקטיות, ממורכזות ללא שום גלילה (Zero Scroll ב-9:16) */}
      <div className="flex-1 flex flex-col justify-center gap-2 my-auto px-0.5 overflow-hidden">
        {branches.slice(0, 3).map((b) => {
          const isHighlighted = highlightedBranchId === b.id || (
            highlightCategory === 'charging' && b.parking?.includes('300kW')
          ) || (
            highlightCategory === 'proximity' && b.id === 'branch_herzliya'
          );

          return (
            <div
              key={b.id}
              onClick={() => onSelectBranchQuery(`ספר לי עוד על סניף ${b.name}`)}
              className={`p-2.5 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between group ${
                isHighlighted
                  ? 'bg-slate-900 border-2 border-amber-400 ring-2 ring-amber-400/30 scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700'
              }`}
              dir="rtl"
            >
              {/* שורה עליונה: שם סניף + תגית חניה/טעינה */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 truncate">
                  {isHighlighted && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                  )}
                  <span className={`text-xs font-black transition-colors truncate ${
                    isHighlighted ? 'text-amber-300' : 'text-white group-hover:text-amber-300'
                  }`}>
                    {b.name}
                  </span>
                </div>
                {b.parking && (
                  <span 
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                      highlightCategory === 'charging' && b.parking.includes('300kW')
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 animate-pulse font-extrabold'
                        : ''
                    }`}
                    style={
                      highlightCategory === 'charging' && b.parking.includes('300kW')
                        ? {}
                        : {
                            backgroundColor: `${brandColor}15`,
                            borderColor: `${brandColor}40`,
                            color: brandColor
                          }
                    }
                  >
                    {b.parking.includes('300kW') ? '⚡ עמדת טעינה 300kW' : b.parking.includes('שמורה') ? 'חניה שמורה' : 'חניה חופשית'}
                  </span>
                )}
              </div>

              {/* שורת כתובת */}
              <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                {b.address}
              </div>

              {/* שורת נתונים תחתונה: שעות פתיחה + חיוג + Waze */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400 mt-1">
                <span className={`flex items-center gap-1 text-[10px] ${
                  highlightCategory === 'friday' ? 'text-sky-300 font-bold bg-sky-500/10 px-1 rounded' : ''
                }`}>
                  <Icons.Clock size={11} className={highlightCategory === 'friday' ? 'text-sky-400' : 'text-slate-500'} />
                  <span>{b.hours || '09:00 - 19:00'}</span>
                </span>
                <div className="flex items-center gap-2">
                  {b.phone && (
                    <a
                      href={`tel:${b.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-emerald-400 font-bold hover:underline"
                    >
                      <Icons.PhoneCall size={11} />
                      <span>{b.phone}</span>
                    </a>
                  )}
                  {b.wazeQuery && (
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(b.wazeQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`flex items-center gap-0.5 font-black hover:underline px-2 py-0.5 rounded-lg transition-transform ${
                        highlightCategory === 'proximity' && b.id === 'branch_herzliya'
                          ? 'bg-amber-400 text-black font-extrabold animate-bounce'
                          : 'text-sky-400 bg-sky-500/15 border border-sky-500/30'
                      }`}
                    >
                      <Icons.Navigation size={10} />
                      <span>{highlightCategory === 'proximity' && b.id === 'branch_herzliya' ? 'נווט עכשיו' : 'Waze'}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🏠 כפתור חזרה הביתה קבוע וממורכז בתחתית */}
      <div className="w-full flex justify-center pt-1 pb-0.5 shrink-0">
        <button
          type="button"
          onClick={onBackHome}
          className="w-full max-w-[190px] py-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(14,165,233,0.35)] transition-all active:scale-95"
        >
          <span>חזרה הביתה</span>
        </button>
      </div>
    </div>
  );
};
