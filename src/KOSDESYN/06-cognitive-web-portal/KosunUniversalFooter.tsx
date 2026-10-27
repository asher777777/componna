import React from 'react';
import { TenantProfile } from './types';
import { KosunPageTransitionAnimationMini } from './KosunPageTransitionAnimationMini';
import * as Icons from 'lucide-react';

interface KosunUniversalFooterProps {
  tenantProfile: TenantProfile | null;
  onHomeClick: () => void;
  onOpenSecretOwner?: () => void;
}

/**
 * 👑 KosunUniversalFooter
 * סרגל תחתון אחיד, יוקרתי, מאוזן ונקי לכל עמודי המערכת:
 * - צד ימין: תיבת קפסולה מרובעת עם לוגו הטננט וכפתור ניווט לבית
 * - מרכז: אנימציית KOSUN המלאה והמקורית עם הסלוגן ("אינטראקציה שהיא נכס") וטקסט KOSUN שלם וקבוע
 * - צד שמאל: חותמת שנתון דיסקרטית ומאוזנת (© 2026) המאפשרת גישה סודית למנהל
 * (הוסר לחלוטין כל אייקון או כיתוב של סניפים לפי דרישת המשתמש)
 */
export const KosunUniversalFooter: React.FC<KosunUniversalFooterProps> = ({
  tenantProfile,
  onHomeClick,
  onOpenSecretOwner,
}) => {
  return (
    <footer className="w-full flex items-center justify-between pt-2 px-1 border-t border-white/5 text-[10px] text-slate-400 font-bold z-20 shrink-0 select-none" dir="rtl">
      {/* 1. צד ימין: תיבת קפסולה מרובעת עם לוגו הטננט וכפתור בית */}
      <button
        onClick={onHomeClick}
        type="button"
        title="חזרה למסך הבית"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer group active:scale-95 shadow-sm"
      >
        <div className="w-5 h-5 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-cyan-400/50">
          {tenantProfile?.logoUrl ? (
            <img src={tenantProfile.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
          ) : (
            <Icons.Home className="w-3 h-3 text-cyan-400" />
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-300 group-hover:text-cyan-300">
          בית ◀
        </span>
      </button>

      {/* 2. מרכז: אנימציית המעבר המקורית של KOSUN עם שלמות האותיות KOSUN */}
      <div className="flex items-center justify-center">
        <KosunPageTransitionAnimationMini
          className="scale-90 sm:scale-95"
          onClick={onHomeClick}
        />
      </div>

      {/* 3. צד שמאל: קרדיט שנתון עדין ודיסקרטי בלבד ללא שום אייקון סניפים */}
      <div className="flex items-center justify-end min-w-[55px]">
        <button
          type="button"
          onClick={onOpenSecretOwner}
          title="כניסת מנהל מערכת"
          className="hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg text-slate-500 font-mono text-[10px] tracking-wider"
        >
          © 2026
        </button>
      </div>
    </footer>
  );
};
