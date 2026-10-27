import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { QuestionExplorationViewProps } from './types';
import { getTerminology } from '../../../factory/pageTerminologyDictionary';
import {
  KOSUN_STYLE_PRESETS,
  StylePresetDefinition,
  resolveDiscoveryLayoutMode
} from '../../../factory/areaCollectionManager';

export interface QuestionAffinityItem {
  id: string;
  question: string;
  affinityScore: number;
  intentGoal?: 'deep_dive' | 'differentiation' | 'intent_conversion';
  category?: string;
  ctaLabel?: string;
  icon?: string;
}

export interface QuestionPageVisualConfig {
  layoutBudget?: string;
  atmosphereTheme?: string;
  languageStyle?: string;
  intentGoal?: string;
  colorMode?: 'day' | 'night' | string;
}

export const QuestionExplorationView: React.FC<
  QuestionExplorationViewProps & {
    visualConfig?: QuestionPageVisualConfig;
  }
> = ({
  mainQuestion,
  mainAnswer,
  category = 'פרודוקטיביות ו-The Big 3',
  affinityScore = 98,
  relatedQuestions,
  tenantProfile,
  visualConfig,
  onSelectRelatedQuestion,
  onBack,
  onAskAiDirectly,
  onActionTrigger
}) => {
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // 1. שליפת הסגנון והפריסה המסונכרנים מקולקציית KOSUN_STYLE_PRESETS
  const selectedThemeKey = visualConfig?.atmosphereTheme || 'cyber_neon';
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[selectedThemeKey] || KOSUN_STYLE_PRESETS.cyber_neon;
  const isDayMode = visualConfig?.colorMode === 'day';
  const activeColorSet = isDayMode ? styleDef.day : styleDef.night;

  const brandColor =
    activeColorSet.primaryColor || tenantProfile?.themeColors?.primary || '#00F0FF';
  const cardRadius = styleDef.geometry.cardRadius;

  // סנכרון מלא: אם נבחרה פריסה בעורך או בסגנון, מתרגמים אותה לאחד מ-5 מנגנוני הגילוי!
  const discoveryMode = resolveDiscoveryLayoutMode(
    visualConfig?.layoutBudget,
    styleDef.discovery.mode
  );

  const fontSizes = {
    title:
      styleDef.fontSizeScale === 'large'
        ? 'text-sm'
        : styleDef.fontSizeScale === 'compact'
        ? 'text-[11px]'
        : 'text-xs',
    question:
      styleDef.fontSizeScale === 'large'
        ? 'text-xs'
        : styleDef.fontSizeScale === 'compact'
        ? 'text-[10px]'
        : 'text-[11px]',
    body:
      styleDef.fontSizeScale === 'large'
        ? 'text-xs'
        : styleDef.fontSizeScale === 'compact'
        ? 'text-[10px]'
        : 'text-[11.5px]'
  };

  const currentArchetype =
    tenantProfile?.category || tenantProfile?.archetypeId || 'saas';
  const customDictionary = (tenantProfile as any)?.customDictionary;
  const recommendedBadge = getTerminology(
    'funnel_badge_recommended',
    currentArchetype,
    customDictionary
  );

  const defaultAnswerText =
    mainAnswer ||
    'שיטת The Big 3 מבוססת על עקרון הפחתת העומס הקוגניטיבי: בחירה מודעת של עד 3 משימות קריטיות בכל יום, ופירוקן לשלבים קצרים של 15 דקות. כל שאר המשימות מופקדות בבנק ה-Inbox כדי לא להעמיס על הזיכרון הפעיל.';

  const getAnswerForQuestion = (qText: string, fallbackCategory?: string) => {
    const q = (qText || '').toLowerCase();
    if (q.includes('חבילות') || q.includes('מסלול')) {
      return 'אקוסיסטם KOSUN 2026 מציע 3 מסלולים מודולריים: מסלול Solo Focus (180 ₪/חודש), חבילת Executive Co-Pilot (490 ₪/חודש), ומערך Enterprise ארגוני מלא בסנכרון Firestore רב-טננטי.';
    }
    if (q.includes('דחופ') || q.includes('באמצע היום')) {
      return 'פרוטוקול הסחת הדעת של קושאן מאפשר רישום קולי מיידי ל-Quick Capture Inbox. אם המשימה קריטית היא מחליפה את אחת מ-3 המשימות הקיימות, ובכך נשמר שקט נפשי מלא.';
    }
    if (q.includes('תמלול') || q.includes('קולי')) {
      return 'המערכת כוללת מנוע AI קולי ייעודי לעברית, המזהה דיבור טבעי ומפרק אותו מיידית למיקרו-משימות ממוקדות של 15 דקות ללא צורך בהקלדה.';
    }
    if (q.includes('the big 3') || q.includes('שקט נפשי') || q.includes('עקרונות')) {
      return defaultAnswerText;
    }
    return fallbackCategory && fallbackCategory.length > 10
      ? fallbackCategory
      : `הסבר מעמיק עבור "${qText}": מיקוד קוגניטיבי מבוקר מאפשר שחרור עומסים, שיפור של 100% בביצוע היומי ושליטה מוחלטת בלוחות הזמנים.`;
  };

  const bgImages = [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'
  ];

  const fourItems = [
    {
      id: 'row_main',
      indexBadge: '01',
      badge: category,
      question: mainQuestion,
      answer: defaultAnswerText,
      isMain: true,
      isConversion: false,
      icon: 'Sparkles',
      bgImage: bgImages[0],
      ctaText: 'שאל את הסוכן ◀'
    },
    ...relatedQuestions.slice(0, 3).map((r, i) => {
      const isConv = r.affinityScore <= 35 || r.intentGoal === 'intent_conversion';
      return {
        id: r.id || 'row_' + i,
        indexBadge: `0${i + 2}`,
        badge: r.category || (isConv ? recommendedBadge : 'העמקה בשיטה'),
        question: r.question,
        answer: getAnswerForQuestion(r.question, r.category),
        isMain: false,
        isConversion: isConv,
        icon: r.icon || (i === 2 ? 'Layers' : i === 0 ? 'AlertTriangle' : 'Mic'),
        bgImage: bgImages[(i + 1) % bgImages.length],
        ctaText: isConv ? 'לכל החבילות ◀' : 'חקור שאלה זו ◀'
      };
    })
  ];

  const triggerItemAction = (item: (typeof fourItems)[0]) => {
    if (item.isConversion && onActionTrigger) {
      onActionTrigger('catalog');
    } else if (item.isMain) {
      onAskAiDirectly(item.question);
    } else {
      onSelectRelatedQuestion(item.question);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // פריסה 1: ACCORDION MORPH (אקורדיון חי 4 שורות מתרחבות)
  // ═══════════════════════════════════════════════════════════════════════════
  if (discoveryMode === 'accordion_morph') {
    return (
      <div
        className={`w-full h-full flex flex-col justify-between gap-1.5 py-0.5 animate-fadeIn select-none ${styleDef.fontFamily}`}
        dir="rtl"
        data-area-id="area_funnel_exploration"
      >
        {fourItems.map((item, idx) => {
          const isExpanded = activeRowIndex === idx;
          const IconComp = (Icons as any)[item.icon] || Icons.HelpCircle;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isExpanded) {
                  triggerItemAction(item);
                } else {
                  setActiveRowIndex(idx);
                }
              }}
              className={`relative w-full overflow-hidden border transition-all duration-300 cursor-pointer group flex flex-col justify-between p-2.5 ${
                isExpanded
                  ? 'flex-[2.4] shadow-xl'
                  : 'flex-1 opacity-90 hover:opacity-100'
              }`}
              style={{
                borderRadius: cardRadius,
                borderColor: isExpanded ? brandColor : activeColorSet.borderColor,
                boxShadow: isExpanded
                  ? `0 6px 24px -6px ${activeColorSet.glowColor}`
                  : 'none',
                background: activeColorSet.cardBg
              }}
            >
              <img
                src={item.bgImage}
                alt={item.question}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ${
                  isExpanded ? 'scale-105 opacity-25' : 'opacity-15 group-hover:scale-105'
                }`}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: isDayMode
                    ? 'linear-gradient(to left, rgba(255,255,255,0.96), rgba(240,249,255,0.86))'
                    : 'linear-gradient(to left, rgba(4,7,17,0.95), rgba(15,23,42,0.82))'
                }}
              />

              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all"
                    style={{
                      backgroundColor: isExpanded ? brandColor : `${brandColor}20`,
                      borderColor: brandColor,
                      color: isExpanded ? '#000000' : brandColor
                    }}
                  >
                    <IconComp size={14} />
                  </div>
                  <h2
                    className={`${fontSizes.question} ${styleDef.titleFontWeight} truncate`}
                    style={{ color: activeColorSet.textColor }}
                  >
                    {item.question}
                  </h2>
                </div>

                <span
                  className="px-2 py-0.5 rounded-full border text-[9px] font-black shrink-0"
                  style={{
                    backgroundColor: isDayMode
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(0,0,0,0.6)',
                    borderColor: `${brandColor}50`,
                    color: brandColor
                  }}
                >
                  {item.indexBadge} • {item.badge}
                </span>
              </div>

              {isExpanded && (
                <div className="relative z-10 flex items-end justify-between gap-2 pt-1 animate-fadeIn">
                  <p
                    className={`${fontSizes.body} leading-snug line-clamp-3 flex-1`}
                    style={{ color: activeColorSet.secondaryText }}
                  >
                    {item.answer}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerItemAction(item);
                    }}
                    className="px-3 py-1.5 rounded-xl text-black font-black text-[10px] shrink-0 shadow-md active:scale-95 transition-all"
                    style={{ backgroundColor: brandColor }}
                  >
                    {item.ctaText}
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
  // פריסה 2: SPOTLIGHT STAGE (במת זרקור: 1 ראשי 58% + 3 קפסולות תחתונות 39%)
  // ═══════════════════════════════════════════════════════════════════════════
  if (discoveryMode === 'spotlight_stage') {
    const spotlightItem = fourItems[activeRowIndex] || fourItems[0];
    const SpotlightIcon = (Icons as any)[spotlightItem.icon] || Icons.Sparkles;

    return (
      <div
        className={`w-full h-full flex flex-col justify-between gap-2 py-0.5 animate-fadeIn select-none ${styleDef.fontFamily}`}
        dir="rtl"
        data-area-id="area_funnel_exploration"
      >
        <div
          onClick={() => triggerItemAction(spotlightItem)}
          className="relative w-full h-[58%] overflow-hidden border-2 cursor-pointer group flex flex-col justify-between p-3.5 shadow-2xl transition-all duration-300"
          style={{
            borderRadius: cardRadius,
            borderColor: brandColor,
            boxShadow: `0 10px 30px -8px ${activeColorSet.glowColor}`
          }}
        >
          <img
            src={spotlightItem.bgImage}
            alt={spotlightItem.question}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDayMode
                ? 'linear-gradient(to top, rgba(255,255,255,0.97) 25%, rgba(254,252,232,0.85) 70%, rgba(255,255,255,0.4) 100%)'
                : 'linear-gradient(to top, rgba(12,10,9,0.97) 25%, rgba(28,25,23,0.82) 70%, rgba(0,0,0,0.4) 100%)'
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-black border backdrop-blur-md flex items-center gap-1.5"
              style={{
                backgroundColor: isDayMode
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(0,0,0,0.75)',
                borderColor: brandColor,
                color: brandColor
              }}
            >
              <SpotlightIcon size={12} />
              <span>במת זרקור • {spotlightItem.badge}</span>
            </span>

            <span
              className="text-lg font-black opacity-60 font-serif"
              style={{ color: brandColor }}
            >
              #{spotlightItem.indexBadge}
            </span>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="flex-1 text-right">
              <h2
                className={`${fontSizes.title} ${styleDef.titleFontWeight} leading-tight`}
                style={{ color: activeColorSet.textColor }}
              >
                {spotlightItem.question}
              </h2>
              <p
                className={`${fontSizes.body} mt-1 line-clamp-3 leading-relaxed`}
                style={{ color: activeColorSet.secondaryText }}
              >
                {spotlightItem.answer}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerItemAction(spotlightItem);
              }}
              className="px-3.5 py-2 rounded-xl text-black font-black text-xs shrink-0 shadow-lg group-hover:scale-105 transition-all"
              style={{ backgroundColor: brandColor }}
            >
              {spotlightItem.ctaText}
            </button>
          </div>
        </div>

        <div className="w-full h-[39%] grid grid-cols-4 gap-1.5">
          {fourItems.map((item, idx) => {
            const isCurrent = idx === activeRowIndex;
            const ItemIcon = (Icons as any)[item.icon] || Icons.HelpCircle;
            return (
              <div
                key={item.id}
                onClick={() => setActiveRowIndex(idx)}
                className={`p-2 border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                  isCurrent ? 'scale-[1.02] shadow-md' : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  borderRadius: cardRadius,
                  background: activeColorSet.cardBg,
                  borderColor: isCurrent ? brandColor : activeColorSet.borderColor
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: isCurrent ? brandColor : `${brandColor}20`,
                      color: isCurrent ? '#000' : brandColor
                    }}
                  >
                    <ItemIcon size={12} />
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold"
                    style={{ color: activeColorSet.secondaryText }}
                  >
                    {item.indexBadge}
                  </span>
                </div>

                <span
                  className="text-[10px] font-bold leading-tight line-clamp-2 text-right my-auto"
                  style={{ color: activeColorSet.textColor }}
                >
                  {item.question}
                </span>

                <div className="flex items-center justify-between text-[8px] pt-0.5 border-t border-white/10">
                  <span
                    style={{
                      color: isCurrent ? brandColor : activeColorSet.secondaryText
                    }}
                  >
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
  // פריסה 3: GLASS FLIP OVERLAY (רשת 2x2 עם וילון זכוכית צף בנגיעה)
  // ═══════════════════════════════════════════════════════════════════════════
  if (discoveryMode === 'glass_flip_overlay') {
    return (
      <div
        className={`w-full h-full grid grid-cols-2 grid-rows-2 gap-2 py-0.5 animate-fadeIn select-none ${styleDef.fontFamily}`}
        dir="rtl"
        data-area-id="area_funnel_exploration"
      >
        {fourItems.map((item) => {
          const isFlipped = flippedCardId === item.id;
          const IconComp = (Icons as any)[item.icon] || Icons.HelpCircle;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isFlipped) {
                  triggerItemAction(item);
                } else {
                  setFlippedCardId(item.id);
                }
              }}
              className="relative w-full h-full overflow-hidden border cursor-pointer group flex flex-col justify-between p-2.5 shadow-lg transition-all duration-300"
              style={{
                borderRadius: cardRadius,
                borderColor: isFlipped ? brandColor : activeColorSet.borderColor,
                background: activeColorSet.cardBg
              }}
            >
              <img
                src={item.bgImage}
                alt={item.question}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-35"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: isDayMode
                    ? 'linear-gradient(to top, rgba(255,255,255,0.95) 20%, rgba(241,245,249,0.65) 100%)'
                    : 'linear-gradient(to top, rgba(11,17,32,0.95) 20%, rgba(15,23,42,0.55) 100%)'
                }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded-lg text-[9px] font-bold border backdrop-blur-md truncate max-w-[115px]"
                  style={{
                    backgroundColor: isDayMode
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.8)',
                    borderColor: `${brandColor}50`,
                    color: brandColor
                  }}
                >
                  {item.indexBadge} • {item.badge}
                </span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md shrink-0"
                  style={{
                    backgroundColor: `${brandColor}25`,
                    color: brandColor
                  }}
                >
                  <IconComp size={12} />
                </div>
              </div>

              <div className="relative z-10 text-right mt-auto">
                <h3
                  className={`${fontSizes.question} ${styleDef.titleFontWeight} leading-snug line-clamp-2`}
                  style={{ color: activeColorSet.textColor }}
                >
                  {item.question}
                </h3>
                <span
                  className="text-[9px] font-mono mt-1 inline-flex items-center gap-1"
                  style={{ color: brandColor }}
                >
                  <span>נגיעה לחשיפת התשובה</span>
                  <Icons.Layers size={10} />
                </span>
              </div>

              {isFlipped && (
                <div
                  className="absolute inset-0 z-20 p-2.5 flex flex-col justify-between backdrop-blur-xl animate-fadeIn"
                  style={{
                    backgroundColor: isDayMode
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(11,17,32,0.95)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black" style={{ color: brandColor }}>
                      תשובת מומחה • {item.indexBadge}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlippedCardId(null);
                      }}
                      className="p-0.5 rounded-md hover:bg-white/10"
                      style={{ color: activeColorSet.secondaryText }}
                    >
                      <Icons.X size={12} />
                    </button>
                  </div>

                  <p
                    className="text-[10px] leading-snug line-clamp-3 my-auto font-medium"
                    style={{ color: activeColorSet.textColor }}
                  >
                    {item.answer}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerItemAction(item);
                    }}
                    className="w-full py-1.5 rounded-xl text-black font-black text-[10px] shadow-md flex items-center justify-center gap-1"
                    style={{ backgroundColor: brandColor }}
                  >
                    <span>{item.ctaText}</span>
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
  // פריסה 4: BENTO ASYMMETRIC (פסיפס בנטו אסימטרי מונחה-משקל: 1 + 2 + 1)
  // ═══════════════════════════════════════════════════════════════════════════
  if (discoveryMode === 'bento_asymmetric') {
    const heroItem = fourItems[0];
    const midItems = fourItems.slice(1, 3);
    const bottomItem = fourItems[3] || fourItems[0];
    const HeroIcon = (Icons as any)[heroItem.icon] || Icons.Sparkles;
    const BottomIcon = (Icons as any)[bottomItem.icon] || Icons.Layers;

    return (
      <div
        className={`w-full h-full flex flex-col justify-between gap-2 py-0.5 animate-fadeIn select-none ${styleDef.fontFamily}`}
        dir="rtl"
        data-area-id="area_funnel_exploration"
      >
        {/* קומה 1: כרטיס גיבור בנטו רחב (43%) */}
        <div
          onClick={() => triggerItemAction(heroItem)}
          className="relative w-full h-[43%] p-3 border cursor-pointer group flex items-center justify-between gap-3 overflow-hidden shadow-lg"
          style={{
            borderRadius: cardRadius,
            background: activeColorSet.cardBg,
            borderColor: brandColor
          }}
        >
          <div className="flex-1 h-full flex flex-col justify-between z-10 text-right">
            <div className="flex items-center gap-1.5">
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-black"
                style={{ backgroundColor: `${brandColor}25`, color: brandColor }}
              >
                {heroItem.indexBadge} • {heroItem.badge}
              </span>
            </div>
            <div>
              <h2
                className={`${fontSizes.title} ${styleDef.titleFontWeight} leading-tight`}
                style={{ color: activeColorSet.textColor }}
              >
                {heroItem.question}
              </h2>
              <p
                className="text-[10px] line-clamp-2 mt-0.5"
                style={{ color: activeColorSet.secondaryText }}
              >
                {heroItem.answer}
              </p>
            </div>
            <span
              className="text-[10px] font-black inline-flex items-center gap-1"
              style={{ color: brandColor }}
            >
              {heroItem.ctaText}
            </span>
          </div>

          <div className="w-24 h-full rounded-2xl overflow-hidden relative shrink-0 border border-white/10">
            <img
              src={heroItem.bgImage}
              alt={heroItem.question}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-black/60 text-white">
              <HeroIcon size={12} />
            </div>
          </div>
        </div>

        {/* קומה 2: זוג קוביות בנטו סימטריות (34%) */}
        <div className="w-full h-[34%] grid grid-cols-2 gap-2">
          {midItems.map((item) => {
            const IconComp = (Icons as any)[item.icon] || Icons.HelpCircle;
            return (
              <div
                key={item.id}
                onClick={() => triggerItemAction(item)}
                className="p-2.5 border cursor-pointer group flex flex-col justify-between relative overflow-hidden shadow-md hover:scale-[1.01] transition-all"
                style={{
                  borderRadius: cardRadius,
                  background: activeColorSet.cardBg,
                  borderColor: activeColorSet.borderColor
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-6 h-6 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                  >
                    <IconComp size={13} />
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold truncate max-w-[90px]"
                    style={{ color: activeColorSet.secondaryText }}
                  >
                    {item.indexBadge} • {item.badge}
                  </span>
                </div>

                <div className="text-right my-auto">
                  <h3
                    className="text-[11px] font-black leading-snug line-clamp-2"
                    style={{ color: activeColorSet.textColor }}
                  >
                    {item.question}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[9px] pt-1 border-t border-white/10">
                  <span
                    className="truncate"
                    style={{ color: activeColorSet.secondaryText }}
                  >
                    {item.ctaText}
                  </span>
                  <Icons.ArrowLeft size={11} style={{ color: brandColor }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* קומה 3: רצועת בנטו תחתונה להנעה לפעולה (19%) */}
        <div
          onClick={() => triggerItemAction(bottomItem)}
          className="w-full h-[19%] px-3 py-2 border cursor-pointer group flex items-center justify-between gap-2 shadow-md"
          style={{
            borderRadius: cardRadius,
            background: activeColorSet.cardBg,
            borderColor: activeColorSet.borderColor
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: brandColor, color: '#000000' }}
            >
              <BottomIcon size={15} />
            </div>
            <div className="min-w-0 text-right">
              <h4
                className="text-xs font-black truncate"
                style={{ color: activeColorSet.textColor }}
              >
                {bottomItem.question}
              </h4>
              <p
                className="text-[10px] truncate"
                style={{ color: activeColorSet.secondaryText }}
              >
                {bottomItem.answer}
              </p>
            </div>
          </div>

          <span
            className="px-2.5 py-1 rounded-xl text-[10px] font-black text-black shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {bottomItem.ctaText}
          </span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // פריסה 5: SWIPE ACTION DECK (חפיסת כרטיסים 3D אינטראקטיבית)
  // ═══════════════════════════════════════════════════════════════════════════
  const deckItem = fourItems[activeRowIndex] || fourItems[0];
  const DeckIcon = (Icons as any)[deckItem.icon] || Icons.Sparkles;

  return (
    <div
      className={`w-full h-full flex flex-col justify-between gap-2 py-0.5 animate-fadeIn select-none ${styleDef.fontFamily}`}
      dir="rtl"
      data-area-id="area_funnel_exploration"
    >
      <div className="relative w-full h-[78%] flex items-center justify-center">
        <div
          className="absolute inset-x-4 -bottom-1.5 h-full opacity-40 border pointer-events-none transition-all"
          style={{
            borderRadius: cardRadius,
            background: activeColorSet.cardBg,
            borderColor: brandColor,
            transform: 'scale(0.95) translateY(6px)'
          }}
        />

        <div
          onClick={() => triggerItemAction(deckItem)}
          className="relative w-full h-full overflow-hidden border-2 cursor-pointer group flex flex-col justify-between p-4 shadow-2xl transition-all duration-300"
          style={{
            borderRadius: cardRadius,
            background: activeColorSet.cardBg,
            borderColor: brandColor,
            boxShadow: `0 12px 32px -8px ${activeColorSet.glowColor}`
          }}
        >
          <div className="relative w-full h-[42%] rounded-2xl overflow-hidden border border-white/10">
            <img
              src={deckItem.bgImage}
              alt={deckItem.question}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span
              className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[9px] font-black text-black"
              style={{ backgroundColor: brandColor }}
            >
              כרטיס {activeRowIndex + 1} מתוך {fourItems.length} • {deckItem.badge}
            </span>
          </div>

          <div
            className="absolute bottom-2 left-2 opacity-10 pointer-events-none"
            style={{ color: brandColor }}
          >
            <DeckIcon size={84} />
          </div>

          <div className="relative z-10 my-auto text-right">
            <h2
              className={`${fontSizes.title} ${styleDef.titleFontWeight} leading-tight`}
              style={{ color: activeColorSet.textColor }}
            >
              {deckItem.question}
            </h2>
            <p
              className={`${fontSizes.body} mt-1.5 leading-relaxed line-clamp-3`}
              style={{ color: activeColorSet.secondaryText }}
            >
              {deckItem.answer}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveRowIndex((prev) => (prev + 1) % fourItems.length);
              }}
              className="px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 hover:bg-white/10 transition-all"
              style={{
                borderColor: activeColorSet.borderColor,
                color: activeColorSet.textColor
              }}
            >
              <Icons.Layers size={13} style={{ color: brandColor }} />
              <span>
                הבא בחפיסה ({((activeRowIndex + 1) % fourItems.length) + 1}/
                {fourItems.length})
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerItemAction(deckItem);
              }}
              className="px-4 py-1.5 rounded-xl text-black font-black text-xs shadow-lg flex items-center gap-1"
              style={{ backgroundColor: brandColor }}
            >
              <span>{deckItem.ctaText}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full h-[18%] grid grid-cols-4 gap-1.5 pt-1">
        {fourItems.map((item, idx) => {
          const isCurrent = idx === activeRowIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveRowIndex(idx)}
              className={`px-2 py-1 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-1 truncate ${
                isCurrent
                  ? 'text-black font-black shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isCurrent ? brandColor : 'transparent',
                borderColor: isCurrent ? brandColor : activeColorSet.borderColor,
                color: isCurrent ? '#000000' : activeColorSet.textColor
              }}
            >
              <span>{item.indexBadge}</span>
              <span className="truncate">{item.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
