import React from 'react';
import { CommunitySectionConfig } from '../../types/sectionConfigs';
import { MessageCircle, Heart, Users, Sparkles } from 'lucide-react';

export const CommunitySection: React.FC<{ config: CommunitySectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'הצטרפו לקהילה שלנו',
    subtitle = 'קהילה חמה, תומכת ומחוברת',
    description = 'קבוצת הוואטסאפ של הקהילה היא המקום להתעדכן בזמן אמת, לשאול שאלות ולקחת חלק פעיל.',
    quote = '״הכוח של הקהילה הוא הערבות ההדדית והחיבור בין כולם״',
    imageSrc,
    badgeTitle = '5,000+ חברים',
    badgeSubtitle = 'בכל רחבי הארץ',
    buttonText = 'הצטרפות לקבוצת הוואטסאפ',
    whatsappNumber = '972545947701',
    backgroundColor = 'transparent',
    buttonVisible = true,
    badgeVisible = true,
  } = config;

  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('שלום, אשמח להצטרף לקהילה!')}`;

  return (
    <section
      id={anchorId || 'community'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 text-right">
            {subtitle && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
                <Users className="w-3.5 h-3.5" />
                <span>{subtitle}</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h2>

            {description && (
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {description}
              </p>
            )}

            {quote && (
              <div className="border-r-4 border-indigo-500 pr-4 py-1 text-sm sm:text-base text-indigo-300 italic">
                {quote}
              </div>
            )}

            {buttonVisible && (
              <div className="mt-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  <span>{buttonText}</span>
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {imageSrc ? (
              <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl max-w-sm w-full aspect-square relative">
                <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square max-w-sm w-full rounded-3xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Users className="w-12 h-12 text-slate-700" />
                <span className="text-xs">קהילה מחוברת</span>
              </div>
            )}

            {badgeVisible && (
              <div className="absolute -bottom-4 right-4 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex items-center gap-3 backdrop-blur-xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white block">{badgeTitle}</span>
                  <span className="text-[11px] text-slate-400">{badgeSubtitle}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
