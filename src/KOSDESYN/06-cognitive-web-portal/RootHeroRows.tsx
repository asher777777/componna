import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { CognitiveNodeModel, TenantThemeColors } from './types';
import { KOSUN_STYLE_PRESETS, StylePresetDefinition, resolveDiscoveryLayoutMode } from '../../../factory/areaCollectionManager';

interface RootHeroRowsProps {
  nodes: CognitiveNodeModel[];
  onNodeClick: (node: CognitiveNodeModel) => void;
  tenantTheme: TenantThemeColors;
  stylePresetId?: string;
  layoutBudget?: string;
}

export const defaultHeroCardConfigs: Record<string, { bgImage: string; badge: string; ctaText: string; gradient: string; icon: string }> = {
  node_root_treatments: {
    bgImage: '/cloudstore/beauty_glow.webp',
    badge: 'תפריט טיפולים',
    ctaText: 'לכל הטיפולים ◀',
    gradient: 'from-pink-950/90 via-slate-900/80 to-transparent',
    icon: 'Sparkles'
  },
  node_root_diagnosis: {
    bgImage: '/cloudstore/beauty_laser.webp',
    badge: 'אבחון עור מקצועי',
    ctaText: 'התחל אבחון ◀',
    gradient: 'from-rose-950/90 via-slate-900/80 to-transparent',
    icon: 'Scan'
  },
  node_root_events: {
    bgImage: '/cloudstore/community_event.webp',
    badge: 'לוח אירועים וסדנאות',
    ctaText: 'לכל האירועים ◀',
    gradient: 'from-emerald-950/90 via-slate-900/80 to-transparent',
    icon: 'Calendar'
  },
  node_root_classes: {
    bgImage: '/cloudstore/community_hero.webp',
    badge: 'מערכת שיעורים',
    ctaText: 'ללוח השיעורים ◀',
    gradient: 'from-purple-950/90 via-slate-900/80 to-transparent',
    icon: 'Users'
  },
  node_root_products: {
    bgImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    badge: 'חבילות ומודולים',
    ctaText: 'לכל החבילות ◀',
    gradient: 'from-cyan-950/90 via-slate-900/80 to-transparent',
    icon: 'Layers'
  },
  node_root_methodology: {
    bgImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    badge: 'שיטת The Big 3',
    ctaText: 'למד את השיטה ◀',
    gradient: 'from-blue-950/90 via-slate-900/80 to-transparent',
    icon: 'Target'
  },
  node_root_decompose: {
    bgImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    badge: 'פירוק משימות AI',
    ctaText: 'הפעל מנוע ◀',
    gradient: 'from-indigo-950/90 via-slate-900/80 to-transparent',
    icon: 'Cpu'
  },
  node_root_ritual: {
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    badge: 'נעילת יום ושקט',
    ctaText: 'טקס ערב ◀',
    gradient: 'from-teal-950/90 via-slate-900/80 to-transparent',
    icon: 'Moon'
  },
  node_root_cars: {
    bgImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    badge: 'מלאי מיידי',
    ctaText: 'לכל הרכבים ◀',
    gradient: 'from-blue-950/90 via-slate-900/80 to-transparent',
    icon: 'Car'
  },
  node_root_testdrive: {
    bgImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    badge: '45 דקות נהיגה',
    ctaText: 'תאם מועד ◀',
    gradient: 'from-amber-950/90 via-slate-900/80 to-transparent',
    icon: 'Key'
  },
  node_root_location: {
    bgImage: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80',
    badge: '3 סניפים ארציים',
    ctaText: 'הצג סניפים ◀',
    gradient: 'from-sky-950/90 via-slate-900/80 to-transparent',
    icon: 'MapPin'
  },
  node_root_contact: {
    bgImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
    badge: 'מענה מיידי',
    ctaText: 'פתח צ׳אט ◀',
    gradient: 'from-emerald-950/90 via-slate-900/80 to-transparent',
    icon: 'MessageCircle'
  }
};

export const RootHeroRows: React.FC<RootHeroRowsProps> = ({
  nodes,
  onNodeClick,
  tenantTheme,
  stylePresetId,
  layoutBudget
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const isDay = tenantTheme.colorMode === 'day';
  const activePresetKey = stylePresetId || tenantTheme.stylePresetId || 'cyber_neon';
  const styleContract: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[activePresetKey] || KOSUN_STYLE_PRESETS.cyber_neon;

  const modeColors = isDay ? styleContract.day : styleContract.night;
  const brandPrimary = tenantTheme.primary || modeColors.primaryColor || '#00F0FF';
  const discoveryMode = resolveDiscoveryLayoutMode(layoutBudget, styleContract.discovery.mode);
  const cardRadius = styleContract.geometry.cardRadius;

  const items = nodes.slice(0, 4).map((node, idx) => {
    const cfg = defaultHeroCardConfigs[node.id] || {
      bgImage: (node as any).imageUrl || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
      badge: 'שירות פרימיום',
      ctaText: 'כניסה ◀',
      gradient: 'from-blue-950/90 via-slate-900/80 to-transparent',
      icon: 'Sparkles'
    };
    return {
      node,
      cfg,
      indexBadge: node.indexBadge || `0${idx + 1}`,
      IconComp: (Icons as any)[node.primaryIcon || cfg.icon] || Icons.Sparkles
    };
  });

  if (items.length === 0) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  // מנגנון גילוי 1: ACCORDION MORPH (התרחבות אקורדיון חכמה - 4 שורות דינמיות)
  // ═══════════════════════════════════════════════════════════════════════════
  if (discoveryMode === 'accordion_morph') {
    return (
      <div className={`w-full h-full flex flex-col justify-between gap-1.5 py-0.5 ${styleContract.fontFamily}`}>
        {items.map(({ node, cfg, indexBadge, IconComp }, idx) => {
          const isExpanded = activeIndex === idx;
          return (
            <div
              key={node.id}
              onClick={() => {
                if (isExpanded) {
                  onNodeClick(node);
                } else {
                  setActiveIndex(idx);
                }
              }}
              className={`relative w-full overflow-hidden border transition-all duration-300 cursor-pointer group flex flex-col justify-between p-2.5 ${
                isExpanded ? 'flex-[2.3] shadow-xl' : 'flex-1 opacity-90 hover:opacity-100'
              }`}
              style={{
                borderRadius: cardRadius,
                borderColor: isExpanded ? brandPrimary : modeColors.borderColor,
                boxShadow: isExpanded ? `0 6px 24px -6px ${modeColors.glowColor}` : 'none',
                background: modeColors.cardBg
              }}
            >
              <img
                src={cfg.bgImage}
                alt={node.questionText}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ${
                  isExpanded ? 'scale-105 opacity-35' : 'opacity-20 group-hover:scale-105'
                }`}
              />
              <div
                className="absolute inset-0 transition-opacity"
                style={{
                  background: isDay
                    ? 'linear-gradient(to left, rgba(255,255,255,0.95), rgba(240,249,255,0.82))'
                    : 'linear-gradient(to left, rgba(4,7,17,0.94), rgba(15,23,42,0.75))'
                }}
              />

              {/* שורה עליונה: אינדקס + כותרת + תגית */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all"
                    style={{
                      backgroundColor: isExpanded ? brandPrimary : `${brandPrimary}20`,
                      borderColor: brandPrimary,
                      color: isExpanded ? '#000000' : brandPrimary
                    }}
                  >
                    <IconComp size={14} />
                  </div>
                  <h2
                    className="text-xs sm:text-[13px] font-black truncate"
                    style={{ color: modeColors.textColor }}
                  >
                    {node.questionText}
                  </h2>
                </div>

                <span
                  className="px-2 py-0.5 rounded-full border text-[9px] font-black shrink-0"
                  style={{
                    backgroundColor: isDay ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)',
                    borderColor: `${brandPrimary}50`,
                    color: brandPrimary
                  }}
                >
                  {indexBadge} • {cfg.badge}
                </span>
              </div>

              {/* תוכן מורחב שמתגלה באקורדיון */}
              {isExpanded && (
                <div className="relative z-10 flex items-end justify-between gap-2 pt-1 animate-fadeIn">
                  <p
                    className="text-[11px] leading-snug line-clamp-2 flex-1"
                    style={{ color: modeColors.secondaryText }}
                  >
                    {node.shortAnswer}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeClick(node);
                    }}
                    className="px-3 py-1.5 rounded-xl text-black font-black text-[10px] shrink-0 shadow-md active:scale-95 transition-all"
                    style={{ backgroundColor: brandPrimary }}
                  >
                    {cfg.ctaText}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // מנגנון גילוי 2: SPOTLIGHT STAGE (במת זרקור: 1 ראשי 58% + 3 קפסולות 38%)
  // ═══════════════════════════════════════════════════════════════════════════
  if (discoveryMode === 'spotlight_stage') {
    const spotlightItem = items[activeIndex] || items[0];
    const SpotlightIcon = spotlightItem.IconComp;

    return (
      <div className={`w-full h-full flex flex-col justify-between gap-2 py-0.5 ${styleContract.fontFamily}`}>
        {/* במת הזרקור המרכזית */}
        <div
          onClick={() => onNodeClick(spotlightItem.node)}
          className="relative w-full h-[58%] overflow-hidden border-2 cursor-pointer group flex flex-col justify-between p-3.5 shadow-2xl transition-all duration-300"
          style={{
            borderRadius: cardRadius,
            borderColor: brandPrimary,
            boxShadow: `0 10px 30px -8px ${modeColors.glowColor}`
          }}
        >
          <img
            src={spotlightItem.cfg.bgImage}
            alt={spotlightItem.node.questionText}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDay
                ? 'linear-gradient(to top, rgba(255,255,255,0.96) 15%, rgba(254,252,232,0.78) 65%, rgba(0,0,0,0.15) 100%)'
                : 'linear-gradient(to top, rgba(12,10,9,0.96) 15%, rgba(28,25,23,0.75) 65%, rgba(0,0,0,0.25) 100%)'
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-black border backdrop-blur-md flex items-center gap-1.5"
              style={{
                backgroundColor: isDay ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)',
                borderColor: brandPrimary,
                color: brandPrimary
              }}
            >
              <SpotlightIcon size={12} />
              <span>זרקור פעיל • {spotlightItem.cfg.badge}</span>
            </span>

            <span
              className="text-lg font-black opacity-60 font-serif"
              style={{ color: brandPrimary }}
            >
              #{spotlightItem.indexBadge}
            </span>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="flex-1 text-right">
              <h2
                className="text-sm sm:text-base font-black leading-tight"
                style={{ color: modeColors.textColor }}
              >
                {spotlightItem.node.questionText}
              </h2>
              <p
                className="text-[11px] mt-1 line-clamp-2 leading-relaxed"
                style={{ color: modeColors.secondaryText }}
              >
                {spotlightItem.node.shortAnswer}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(spotlightItem.node);
              }}
              className="px-3.5 py-2 rounded-xl text-black font-black text-xs shrink-0 shadow-lg group-hover:scale-105 transition-all"
              style={{ backgroundColor: brandPrimary }}
            >
              {spotlightItem.cfg.ctaText}
            </button>
          </div>
        </div>

        {/* 3 קפסולות הבחירה התחתונות שמעלות פריט לזרקור בלחיצה */}
        <div className="w-full h-[39%] grid grid-cols-4 gap-1.5">
          {items.map((item, idx) => {
            const isCurrent = idx === activeIndex;
            const ItemIcon = item.IconComp;
            return (
              <div
                key={item.node.id}
                onClick={() => setActiveIndex(idx)}
                className={`p-2 border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                  isCurrent ? 'scale-[1.02] shadow-md' : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  borderRadius: cardRadius,
                  background: modeColors.cardBg,
                  borderColor: isCurrent ? brandPrimary : modeColors.borderColor
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: isCurrent ? brandPrimary : `${brandPrimary}20`,
                      color: isCurrent ? '#000' : brandPrimary
                    }}
                  >
                    <ItemIcon size={12} />
                  </div>
                  <span className="text-[9px] font-mono font-bold" style={{ color: modeColors.secondaryText }}>
                    {item.indexBadge}
                  </span>
                </div>

                <span
                  className="text-[10px] font-bold leading-tight line-clamp-2 text-right my-auto"
                  style={{ color: modeColors.textColor }}
                >
                  {item.node.questionText}
                </span>

                <div className="flex items-center justify-between text-[8px] pt-0.5 border-t border-white/10">
                  <span style={{ color: isCurrent ? brandPrimary : modeColors.secondaryText }}>
                    {isCurrent ? 'בזרקור ▲' : 'הצג בזרקור'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // מנגנון גילוי 3: GLASS FLIP OVERLAY (רשת 2x2 עם וילון זכוכית צף בנגיעה)
  // ═══════════════════════════════════════════════════════════════════════════
  if (discoveryMode === 'glass_flip_overlay') {
    return (
      <div className={`w-full h-full grid grid-cols-2 grid-rows-2 gap-2 py-0.5 ${styleContract.fontFamily}`}>
        {items.map(({ node, cfg, indexBadge, IconComp }) => {
          const isFlipped = flippedCardId === node.id;

          return (
            <div
              key={node.id}
              onClick={() => {
                if (isFlipped) {
                  onNodeClick(node);
                } else {
                  setFlippedCardId(node.id);
                }
              }}
              className="relative w-full h-full overflow-hidden border cursor-pointer group flex flex-col justify-between p-2.5 shadow-lg transition-all duration-300"
              style={{
                borderRadius: cardRadius,
                borderColor: isFlipped ? brandPrimary : modeColors.borderColor,
                background: modeColors.cardBg
              }}
            >
              <img
                src={cfg.bgImage}
                alt={node.questionText}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: isDay
                    ? 'linear-gradient(to top, rgba(255,255,255,0.95) 20%, rgba(241,245,249,0.55) 100%)'
                    : 'linear-gradient(to top, rgba(11,17,32,0.95) 20%, rgba(15,23,42,0.45) 100%)'
                }}
              />

              {/* מצב חזית: תגית + כותרת נקייה */}
              <div className="relative z-10 flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded-lg text-[9px] font-bold border backdrop-blur-md"
                  style={{
                    backgroundColor: isDay ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.8)',
                    borderColor: `${brandPrimary}50`,
                    color: brandPrimary
                  }}
                >
                  {indexBadge} • {cfg.badge}
                </span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md"
                  style={{
                    backgroundColor: `${brandPrimary}25`,
                    color: brandPrimary
                  }}
                >
                  <IconComp size={12} />
                </div>
              </div>

              <div className="relative z-10 text-right mt-auto">
                <h3
                  className="text-xs font-black leading-snug line-clamp-2"
                  style={{ color: modeColors.textColor }}
                >
                  {node.questionText}
                </h3>
                <span
                  className="text-[9px] font-mono mt-1 inline-flex items-center gap-1"
                  style={{ color: brandPrimary }}
                >
                  <span>נגיעה לחשיפת מפרט</span>
                  <Icons.Layers size={10} />
                </span>
              </div>

              {/* וילון הזכוכית הצף שעולה בנגיעה (Glass Flip Overlay) */}
              {isFlipped && (
                <div
                  className="absolute inset-0 z-20 p-2.5 flex flex-col justify-between backdrop-blur-xl animate-fadeIn"
                  style={{
                    backgroundColor: isDay ? 'rgba(255,255,255,0.94)' : 'rgba(11,17,32,0.94)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black" style={{ color: brandPrimary }}>
                      {cfg.badge}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlippedCardId(null);
                      }}
                      className="p-0.5 rounded-md hover:bg-white/10"
                      style={{ color: modeColors.secondaryText }}
                    >
                      <Icons.X size={12} />
                    </button>
                  </div>

                  <p
                    className="text-[10.5px] leading-snug line-clamp-3 my-auto font-medium"
                    style={{ color: modeColors.textColor }}
                  >
                    {node.shortAnswer}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeClick(node);
                    }}
                    className="w-full py-1.5 rounded-xl text-black font-black text-[10px] shadow-md flex items-center justify-center gap-1"
                    style={{ backgroundColor: brandPrimary }}
                  >
                    <span>{cfg.ctaText}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // מנגנון גילוי 4: BENTO ASYMMETRIC (פסיפס בנטו אסימטרי מונחה-משקל: 1 + 2 + 1)
  // ═══════════════════════════════════════════════════════════════════════════
  if (discoveryMode === 'bento_asymmetric') {
    const heroItem = items[0];
    const midItems = items.slice(1, 3);
    const bottomItem = items[3] || items[0];
    const HeroIcon = heroItem.IconComp;
    const BottomIcon = bottomItem.IconComp;

    return (
      <div className={`w-full h-full flex flex-col justify-between gap-2 py-0.5 ${styleContract.fontFamily}`}>
        {/* קומה 1: כרטיס גיבור בנטו רחב (42%) */}
        <div
          onClick={() => onNodeClick(heroItem.node)}
          className="relative w-full h-[42%] p-3 border cursor-pointer group flex items-center justify-between gap-3 overflow-hidden shadow-lg"
          style={{
            borderRadius: cardRadius,
            background: modeColors.cardBg,
            borderColor: brandPrimary
          }}
        >
          <div className="flex-1 h-full flex flex-col justify-between z-10 text-right">
            <div className="flex items-center gap-1.5">
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-black"
                style={{ backgroundColor: `${brandPrimary}25`, color: brandPrimary }}
              >
                {heroItem.indexBadge} • מוקד הפוקוס
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black leading-tight" style={{ color: modeColors.textColor }}>
                {heroItem.node.questionText}
              </h2>
              <p className="text-[10px] line-clamp-2 mt-0.5" style={{ color: modeColors.secondaryText }}>
                {heroItem.node.shortAnswer}
              </p>
            </div>
            <span className="text-[10px] font-black inline-flex items-center gap-1" style={{ color: brandPrimary }}>
              {heroItem.cfg.ctaText}
            </span>
          </div>

          <div className="w-24 h-full rounded-2xl overflow-hidden relative shrink-0 border border-white/10">
            <img src={heroItem.cfg.bgImage} alt={heroItem.node.questionText} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-black/60 text-white">
              <HeroIcon size={12} />
            </div>
          </div>
        </div>

        {/* קומה 2: זוג קוביות בנטו סימטריות (34%) */}
        <div className="w-full h-[34%] grid grid-cols-2 gap-2">
          {midItems.map(({ node, cfg, indexBadge, IconComp }) => (
            <div
              key={node.id}
              onClick={() => onNodeClick(node)}
              className="p-2.5 border cursor-pointer group flex flex-col justify-between relative overflow-hidden shadow-md hover:scale-[1.01] transition-all"
              style={{
                borderRadius: cardRadius,
                background: modeColors.cardBg,
                borderColor: modeColors.borderColor
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                >
                  <IconComp size={14} />
                </div>
                <span className="text-[9px] font-mono font-bold" style={{ color: modeColors.secondaryText }}>
                  {indexBadge} • {cfg.badge}
                </span>
              </div>

              <div className="text-right my-auto">
                <h3 className="text-[11px] font-black leading-snug line-clamp-2" style={{ color: modeColors.textColor }}>
                  {node.questionText}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[9px] pt-1 border-t border-white/10">
                <span className="truncate" style={{ color: modeColors.secondaryText }}>{cfg.ctaText}</span>
                <Icons.ArrowLeft size={11} style={{ color: brandPrimary }} />
              </div>
            </div>
          ))}
        </div>

        {/* קומה 3: רצועת בנטו תחתונה להנעה לפעולה (20%) */}
        <div
          onClick={() => onNodeClick(bottomItem.node)}
          className="w-full h-[20%] px-3 py-2 border cursor-pointer group flex items-center justify-between gap-2 shadow-md"
          style={{
            borderRadius: cardRadius,
            background: modeColors.cardBg,
            borderColor: modeColors.borderColor
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: brandPrimary, color: '#000000' }}
            >
              <BottomIcon size={15} />
            </div>
            <div className="min-w-0 text-right">
              <h4 className="text-xs font-black truncate" style={{ color: modeColors.textColor }}>
                {bottomItem.node.questionText}
              </h4>
              <p className="text-[10px] truncate" style={{ color: modeColors.secondaryText }}>
                {bottomItem.node.shortAnswer}
              </p>
            </div>
          </div>

          <span
            className="px-2.5 py-1 rounded-xl text-[10px] font-black text-black shrink-0"
            style={{ backgroundColor: brandPrimary }}
          >
            {bottomItem.cfg.ctaText}
          </span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // מנגנון גילוי 5: SWIPE ACTION DECK (חפיסת כרטיסים 3D אינטראקטיבית)
  // ═══════════════════════════════════════════════════════════════════════════
  const deckItem = items[activeIndex] || items[0];
  const DeckIcon = deckItem.IconComp;

  return (
    <div className={`w-full h-full flex flex-col justify-between gap-2 py-0.5 ${styleContract.fontFamily}`}>
      {/* חפיסת הכרטיסים בעומק תלת-ממדי */}
      <div className="relative w-full h-[78%] flex items-center justify-center">
        {/* כרטיס אחורי מדומה לעומק החפיסה */}
        <div
          className="absolute inset-x-4 -bottom-1.5 h-full opacity-40 border pointer-events-none transition-all"
          style={{
            borderRadius: cardRadius,
            background: modeColors.cardBg,
            borderColor: brandPrimary,
            transform: 'scale(0.95) translateY(6px)'
          }}
        />

        {/* הכרטיס הפעיל בחזית החפיסה */}
        <div
          onClick={() => onNodeClick(deckItem.node)}
          className="relative w-full h-full overflow-hidden border-2 cursor-pointer group flex flex-col justify-between p-4 shadow-2xl transition-all duration-300"
          style={{
            borderRadius: cardRadius,
            background: modeColors.cardBg,
            borderColor: brandPrimary,
            boxShadow: `0 12px 32px -8px ${modeColors.glowColor}`
          }}
        >
          {/* באנר מדיה עליון בתוך הכרטיס */}
          <div className="relative w-full h-[46%] rounded-2xl overflow-hidden border border-white/10">
            <img
              src={deckItem.cfg.bgImage}
              alt={deckItem.node.questionText}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span
              className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[9px] font-black text-black"
              style={{ backgroundColor: brandPrimary }}
            >
              כרטיס {activeIndex + 1} מתוך {items.length} • {deckItem.cfg.badge}
            </span>
          </div>

          {/* סימן מים ענק של האייקון ברקע */}
          <div
            className="absolute bottom-2 left-2 opacity-10 pointer-events-none"
            style={{ color: brandPrimary }}
          >
            <DeckIcon size={84} />
          </div>

          {/* גוף הכרטיס בחפיסה */}
          <div className="relative z-10 my-auto text-right">
            <h2 className="text-sm sm:text-base font-black leading-tight" style={{ color: modeColors.textColor }}>
              {deckItem.node.questionText}
            </h2>
            <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: modeColors.secondaryText }}>
              {deckItem.node.shortAnswer}
            </p>
          </div>

          {/* כפתורי החלטה וניווט בחפיסה */}
          <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev + 1) % items.length);
              }}
              className="px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 hover:bg-white/10 transition-all"
              style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
            >
              <Icons.Layers size={13} style={{ color: brandPrimary }} />
              <span>הבא בחפיסה ({((activeIndex + 1) % items.length) + 1}/{items.length})</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(deckItem.node);
              }}
              className="px-4 py-1.5 rounded-xl text-black font-black text-xs shadow-lg flex items-center gap-1"
              style={{ backgroundColor: brandPrimary }}
            >
              <span>{deckItem.cfg.ctaText}</span>
            </button>
          </div>
        </div>
      </div>

      {/* בורר חפיסה תחתון (19%) */}
      <div className="w-full h-[18%] grid grid-cols-4 gap-1.5 pt-1">
        {items.map((item, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <button
              key={item.node.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`px-2 py-1 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-1 truncate ${
                isCurrent ? 'text-black font-black shadow-md' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isCurrent ? brandPrimary : 'transparent',
                borderColor: isCurrent ? brandPrimary : modeColors.borderColor,
                color: isCurrent ? '#000000' : modeColors.textColor
              }}
            >
              <span>{item.indexBadge}</span>
              <span className="truncate">{item.cfg.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
