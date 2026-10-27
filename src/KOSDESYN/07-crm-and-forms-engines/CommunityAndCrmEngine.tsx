import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { TenantProfile, TenantThemeColors } from '../06-cognitive-web-portal/types';
import { KOSUN_STYLE_PRESETS, StylePresetDefinition, resolveDiscoveryLayoutMode } from '../01-core-engine/areaCollectionManager';

export interface CommunityCrmCardItem {
  id: string;
  type: string;
  author: string;
  title: string;
  summary: string;
  badge: string;
  metric: string;
  avatar: string;
  cta: string;
  icon: string;
}

interface CommunityAndCrmEngineProps {
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  stylePresetId?: string;
  layoutBudget?: string;
  items?: CommunityCrmCardItem[];
  onActionClick?: (itemTitle: string, item?: CommunityCrmCardItem) => void;
  onBackHome: () => void;
}

const COMMUNITY_CRM_ITEMS = [
  {
    id: 'feed_1',
    type: 'community_event',
    author: 'קהילת המייסדים • KosTogether',
    title: 'מפגש לייב: הטמעת סוכני AI וצמצום עומס קוגניטיבי',
    summary: 'הצטרפו ל-142 חברי קהילה שכבר נרשמו לשידור הקרוב עם הדגמה חיה של The Big 3.',
    badge: 'שידור חי בחמישי',
    metric: '142 משתתפים',
    avatar: '/cloudstore/community_event.webp',
    cta: 'שריין מקום בלייב ◀',
    icon: 'Radio'
  },
  {
    id: 'feed_2',
    type: 'crm_lead',
    author: 'ליד חם מ-CRM • התאמה 96%',
    title: 'דניאל כהן מתעניין במסלול Executive Co-Pilot',
    summary: 'ביקר בעמוד החבילות ושאל את הסוכן הקולי על חיבור ליומן הארגוני.',
    badge: 'עדיפות גבוהה',
    metric: 'לפני 4 דקות',
    avatar: '/cloudstore/kosun_hero.webp',
    cta: 'חייג / שלח וואטסאפ ◀',
    icon: 'Flame'
  },
  {
    id: 'feed_3',
    type: 'member_story',
    author: 'שיתוף הצלחה • חבר מועדון VIP',
    title: '״תוך שבועיים ירדנו מ-30 משימות פתוחות ל-3 מטרות יומיות״',
    summary: 'סיפור מקרה מלא מתוך קהילת המנהלים של קושאן על הכפלת קצב הסגירות.',
    badge: 'סיפור לקוח',
    metric: '48 לייקים ♥',
    avatar: '/cloudstore/community_hero.webp',
    cta: 'קרא והגב בקהילה ◀',
    icon: 'Heart'
  },
  {
    id: 'feed_4',
    type: 'campaign_goal',
    author: 'יעד משותף • מועדון הלקוחות',
    title: 'פתיחת מעבדת האוטומציות החדשה לחברי המועדון',
    summary: 'הגענו ל-88% מיעד ההרשמה המוקדמת לפתיחת הסדנה המעשית.',
    badge: '88% הושלם',
    metric: 'נותרו 6 מקומות',
    avatar: '/cloudstore/beauty_glow.webp',
    cta: 'הצטרף לקמפיין ◀',
    icon: 'Award'
  }
];

export const CommunityAndCrmEngine: React.FC<CommunityAndCrmEngineProps> = ({
  tenantProfile,
  tenantTheme,
  stylePresetId,
  layoutBudget,
  items,
  onActionClick,
  onBackHome
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const activeItems = items && items.length > 0 ? items : COMMUNITY_CRM_ITEMS;

  const isDay = tenantTheme.colorMode === 'day';
  const activePresetKey = stylePresetId || tenantTheme.stylePresetId || 'cyber_neon';
  const styleContract: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[activePresetKey] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleContract.day : styleContract.night;
  const brandPrimary = tenantTheme.primary || modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleContract.geometry.cardRadius;
  const discoveryMode = resolveDiscoveryLayoutMode(layoutBudget, styleContract.discovery.mode);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // במצב חפיסת כרטיסים (Swipe Deck) או במת זרקור (Spotlight Stage)
  if (discoveryMode === 'swipe_action_deck' || discoveryMode === 'spotlight_stage') {
    const activeItem = activeItems[activeIndex] || activeItems[0];
    const ActiveIcon = (Icons as any)[activeItem.icon] || Icons.Users;

    return (
      <div className={`w-full h-full flex flex-col justify-between gap-2 py-0.5 animate-fadeIn ${styleContract.fontFamily}`}>
        {/* כרטיס הזרקור / החפיסה הראשי */}
        <div
          onClick={() => onActionClick && onActionClick(activeItem.title, activeItem)}
          className="relative w-full h-[64%] p-3.5 border-2 flex flex-col justify-between overflow-hidden shadow-2xl cursor-pointer group"
          style={{
            borderRadius: cardRadius,
            background: modeColors.cardBg,
            borderColor: brandPrimary,
            boxShadow: `0 10px 30px -8px ${modeColors.glowColor}`
          }}
        >
          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <img
                src={activeItem.avatar}
                alt={activeItem.author}
                className="w-8 h-8 rounded-full object-cover border"
                style={{ borderColor: brandPrimary }}
              />
              <div className="text-right">
                <span className="text-[10px] font-black block" style={{ color: brandPrimary }}>
                  {activeItem.author}
                </span>
                <span className="text-[9px] font-mono" style={{ color: modeColors.secondaryText }}>
                  {activeItem.metric}
                </span>
              </div>
            </div>

            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-black text-black"
              style={{ backgroundColor: brandPrimary }}
            >
              {activeItem.badge}
            </span>
          </div>

          <div className="my-auto text-right z-10">
            <h2 className="text-xs sm:text-sm font-black leading-snug" style={{ color: modeColors.textColor }}>
              {activeItem.title}
            </h2>
            <p className="text-[11px] mt-1 leading-relaxed line-clamp-2" style={{ color: modeColors.secondaryText }}>
              {activeItem.summary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => toggleLike(activeItem.id, e)}
                className="px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1"
                style={{
                  borderColor: likedIds[activeItem.id] ? brandPrimary : modeColors.borderColor,
                  color: likedIds[activeItem.id] ? brandPrimary : modeColors.textColor
                }}
              >
                <Icons.Heart size={11} className={likedIds[activeItem.id] ? 'fill-current' : ''} />
                <span>{likedIds[activeItem.id] ? 'אהבתי!' : 'פרגן'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev + 1) % activeItems.length);
                }}
                className="px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1"
                style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
              >
                <Icons.RefreshCw size={11} style={{ color: brandPrimary }} />
                <span>הכרטיס הבא</span>
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onActionClick) onActionClick(activeItem.title, activeItem);
              }}
              className="px-3 py-1.5 rounded-xl text-black font-black text-[10px] shadow-md"
              style={{ backgroundColor: brandPrimary }}
            >
              {activeItem.cta}
            </button>
          </div>

          <div className="absolute -bottom-3 -left-3 opacity-10 pointer-events-none" style={{ color: brandPrimary }}>
            <ActiveIcon size={76} />
          </div>
        </div>

        {/* רצועת מעבר מהירה בין 4 כרטיסי הקהילה/CRM */}
        <div className="w-full h-[32%] grid grid-cols-4 gap-1.5">
          {activeItems.map((item, idx) => {
            const isCurr = idx === activeIndex;
            const ItemIcon = (Icons as any)[item.icon] || Icons.Users;
            return (
              <div
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`p-2 border cursor-pointer transition-all flex flex-col justify-between ${
                  isCurr ? 'scale-[1.02] shadow-md' : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  borderRadius: cardRadius,
                  background: modeColors.cardBg,
                  borderColor: isCurr ? brandPrimary : modeColors.borderColor
                }}
              >
                <div className="flex items-center justify-between">
                  <ItemIcon size={12} style={{ color: brandPrimary }} />
                  <span className="text-[8px] font-mono" style={{ color: modeColors.secondaryText }}>
                    0{idx + 1}
                  </span>
                </div>
                <span className="text-[9.5px] font-bold line-clamp-2 text-right leading-tight" style={{ color: modeColors.textColor }}>
                  {item.title}
                </span>
                <span className="text-[8px] font-bold truncate" style={{ color: brandPrimary }}>
                  {item.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // תצוגת אקורדיון / בנטו / רשת זכוכית עבור קהילה ו-CRM
  return (
    <div className={`w-full h-full flex flex-col justify-between gap-1.5 py-0.5 animate-fadeIn ${styleContract.fontFamily}`}>
      {activeItems.map((item, idx) => {
        const isExpanded = activeIndex === idx;
        const ItemIcon = (Icons as any)[item.icon] || Icons.Users;

        return (
          <div
            key={item.id}
            onClick={() => setActiveIndex(idx)}
            className={`w-full px-3 py-2 border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
              isExpanded ? 'flex-[2.2] shadow-lg' : 'flex-1 opacity-90 hover:opacity-100'
            }`}
            style={{
              borderRadius: cardRadius,
              background: modeColors.cardBg,
              borderColor: isExpanded ? brandPrimary : modeColors.borderColor
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isExpanded ? brandPrimary : `${brandPrimary}20`,
                    color: isExpanded ? '#000' : brandPrimary
                  }}
                >
                  <ItemIcon size={13} />
                </div>
                <span className="text-xs font-black truncate" style={{ color: modeColors.textColor }}>
                  {item.title}
                </span>
              </div>

              <span
                className="px-2 py-0.5 rounded-full text-[8.5px] font-black shrink-0"
                style={{
                  backgroundColor: `${brandPrimary}20`,
                  color: brandPrimary
                }}
              >
                {item.badge}
              </span>
            </div>

            {isExpanded && (
              <div className="flex items-end justify-between gap-2 pt-1 animate-fadeIn">
                <div className="flex-1 text-right">
                  <span className="text-[9.5px] font-bold block" style={{ color: brandPrimary }}>
                    {item.author} • {item.metric}
                  </span>
                  <p className="text-[10.5px] line-clamp-2 mt-0.5" style={{ color: modeColors.secondaryText }}>
                    {item.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onActionClick) onActionClick(item.title, item);
                  }}
                  className="px-3 py-1 rounded-xl text-black font-black text-[10px] shrink-0 shadow-md"
                  style={{ backgroundColor: brandPrimary }}
                >
                  {item.cta}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
