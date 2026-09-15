import React from 'react';
import { CommunitySectionConfig } from '../../types/sectionConfigs';
import { MessageCircle, Heart, Users, Sparkles, CheckCheck } from 'lucide-react';

export const CommunitySection: React.FC<{ config: CommunitySectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'הצטרפו לקהילת ה-VIP שלנו',
    subtitle = 'קהילה חמה, מקצועית ומחוברת',
    description = 'קבוצת הוואטסאפ של הקהילה היא המקום להתעדכן בזמן אמת, לקבל טיפים בלעדיים, לשאול שאלות ולקחת חלק פעיל.',
    quote = '״הכוח של הקהילה הוא הערבות ההדדית, הידע המשותף והחיבור בין כולם״',
    imageSrc,
    badgeTitle = '5,000+ חברים',
    badgeSubtitle = 'בכל רחבי הארץ',
    buttonText = 'הצטרפות מהירה לקבוצת הוואטסאפ',
    whatsappNumber = '972545947701',
    showLiveChatPreview = true,
    chatBubbleMessage = 'שלום לכולם! שמחים לעדכן שההדרכה המיוחדת של השבוע עלתה כעת לקהילה 🎉',
    backgroundColor = 'transparent',
    buttonVisible = true,
    badgeVisible = true,
  } = config;

  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('שלום, אשמח להצטרף לקהילה!')}`;

  return (
    <section
      id={anchorId || 'community'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 text-right">
            {subtitle && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold w-fit">
                <Users className="w-3.5 h-3.5" />
                <span>{subtitle}</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
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
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  <span>{buttonText}</span>
                </a>
              </div>
            )}
          </div>

          {/* Interactive Chat Simulation Frame */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-sm rounded-3xl bg-[#0b141a] border border-slate-800 p-4 shadow-2xl flex flex-col gap-3">
              {/* WhatsApp Header Mock */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">קהילת הוואטסאפ הרשמית</span>
                    <span className="text-[10px] text-emerald-400">🟢 148 חברים מחוברים כעת</span>
                  </div>
                </div>
              </div>

              {/* Chat Bubble Message */}
              <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed self-start max-w-[90%] shadow-md">
                <p>{chatBubbleMessage}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/70 mt-1">
                  <span>10:42</span>
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>
            </div>

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
