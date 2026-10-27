import React from 'react';
import { TenantProfile, TenantThemeColors } from './types';

interface WelcomeExperienceProps {
  experience?: any;
  tenantProfile?: TenantProfile | null;
  tenantTheme?: TenantThemeColors;
  brandColor?: string;
  onStart?: () => void;
  onEnter?: () => void;
  onOpenVoice?: () => void;
}

export const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({
  experience,
  tenantProfile,
  tenantTheme,
  brandColor = '#00F0FF',
  onStart,
  onEnter,
  onOpenVoice,
}) => {
  const exp = experience || tenantProfile?.welcomeExperience;
  const primary = brandColor || tenantTheme?.primaryColor || tenantTheme?.micColor || '#00F0FF';
  const handleProceed = onStart || onEnter || (() => {});

  return (
    <div className="absolute inset-0 z-40 bg-black flex flex-col justify-between p-6 animate-fadeIn overflow-hidden" dir="rtl">
      {/* רקע המדיה: סרטון וידאו רץ או תמונת חוויה */}
      <div className="absolute inset-0 overflow-hidden">
        {exp?.type === 'video' && exp.mediaUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
            poster={exp.fallbackImageUrl}
          >
            <source src={exp.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src={exp?.fallbackImageUrl || '/cloudstore/kosun_hero.webp'}
            alt="Welcome Experience"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
      </div>

      {/* חלק עליון של מסך הכניסה: תגית מותג יוקרתית */}
      <div className="relative z-10 flex items-center justify-between">
        <span 
          className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg"
          style={{
            backgroundColor: `${primary}25`,
            borderColor: primary,
            color: primary
          }}
        >
          {exp?.badgeText || 'KOSUN 2026 AI'}
        </span>

        {/* כפתור פתיחת מצב חיפוש / דיבור ישיר מהשער */}
        {onOpenVoice && (
          <button
            onClick={onOpenVoice}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20"
            title="שאל שאלה בקולך"
          >
            <span className="text-xs">🎙️</span>
          </button>
        )}
      </div>

      {/* חלק מרכזי ותחתון: כותרות המותג וכפתור ה-CTA המרכזי */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4 pb-4">
        <div className="space-y-1.5 px-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-2xl leading-tight">
            {exp?.title || 'הופכים אינטראקציות לנכסים מניבים'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-200 drop-shadow line-clamp-2">
            {exp?.subtitle || 'מערכת אפס-עומס קוגניטיבי • מיקוד ב-3 משימות מפתח לכל יום'}
          </p>
        </div>

        {/* כפתור ה-CTA המרכזי המעביר ל-4 הכרטיסיות */}
        <button
          type="button"
          onClick={handleProceed}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl font-black text-sm text-black shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 cursor-pointer z-50"
          style={{
            backgroundColor: primary,
            boxShadow: `0 8px 30px ${primary}60`
          }}
        >
          <span>{exp?.ctaText || 'כניסה למערכת KOSUN ◀'}</span>
        </button>
      </div>
    </div>
  );
};
