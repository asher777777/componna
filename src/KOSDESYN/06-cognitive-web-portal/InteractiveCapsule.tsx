import React from 'react';
import * as Icons from 'lucide-react';
import { TenantThemeColors, CognitiveNodeModel, TenantProfile } from './types';
import { getTerminology } from '../01-core-engine/pageTerminologyDictionary';
import { KOSUN_STYLE_PRESETS, StylePresetDefinition } from '../01-core-engine/areaCollectionManager';
import { KosunUserAvatar } from './KosunUserAvatar';

interface InteractiveCapsuleProps {
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  activeQuestionNode?: CognitiveNodeModel | null;
  isCatalogActive?: boolean;
  stylePresetId?: string;
  onAvatarPlayClick: () => void;
  onQuestionClick: () => void;
  onMicClick: () => void;
}

export const InteractiveCapsule: React.FC<InteractiveCapsuleProps> = ({
  tenantProfile,
  tenantTheme,
  activeQuestionNode,
  isCatalogActive,
  stylePresetId,
  onAvatarPlayClick,
  onQuestionClick,
  onMicClick,
}) => {
  const currentArchetype = tenantProfile?.category || tenantProfile?.archetypeId || 'saas';
  const customDictionary = (tenantProfile as any)?.customDictionary;

  const hintText = isCatalogActive
    ? getTerminology('capsule_catalog_hint', currentArchetype, customDictionary)
    : getTerminology('capsule_prompt_hint', currentArchetype, customDictionary);

  const micTooltip = getTerminology('capsule_mic_tooltip', currentArchetype, customDictionary);

  const isDay = tenantTheme.colorMode === 'day';
  const activePresetKey = stylePresetId || tenantTheme.stylePresetId || 'cyber_neon';
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[activePresetKey] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleDef.day : styleDef.night;
  const brandPrimary = tenantTheme.primary || modeColors.primaryColor || '#00F0FF';
  const capsuleVariant = styleDef.capsule?.variant || 'neon_floating_dock';
  const capsuleRadius = styleDef.capsule?.radius || '20px';
  const showSoundwave = styleDef.capsule?.showSoundwave ?? true;

  const questionText = activeQuestionNode
    ? activeQuestionNode.questionText
    : isCatalogActive
    ? 'איך מתחילים?'
    : 'איך שיטת The Big 3 עובדת?';

  // ═══════════════════════════════════════════════════════════════════════════
  // סגנון 2: STEALTH GOLD MINIMAL (יוקרה שקטה - מסגרת זהב ואייקון KOSUN צבוע בזהב)
  // ═══════════════════════════════════════════════════════════════════════════
  if (capsuleVariant === 'stealth_gold_minimal') {
    return (
      <div className={`relative z-20 w-full my-1 ${styleDef.fontFamily}`} data-area-id="area_top_ai_capsule">
        <div
          className="w-full h-14 p-1.5 flex items-center justify-between gap-2.5 border-2 transition-all duration-300 relative overflow-hidden shadow-2xl"
          style={{
            borderRadius: capsuleRadius,
            backgroundColor: modeColors.cardBg,
            borderColor: brandPrimary,
            boxShadow: `0 8px 24px -6px ${modeColors.glowColor}`
          }}
        >
          {/* אייקון ה-3D הרשמי של KOSUN בצביעה דינמית זהב */}
          <div
            onClick={onAvatarPlayClick}
            title="שיחה ישירה עם הסוכן"
            className="relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer group border-2 p-0.5 hover:scale-105 active:scale-95 transition-all shadow-md"
            style={{
              borderColor: brandPrimary,
              backgroundColor: `${brandPrimary}15`,
              boxShadow: `0 0 16px ${modeColors.glowColor}`
            }}
          >
            <KosunUserAvatar color={brandPrimary} glowColor={modeColors.glowColor} size={25} />
            <div
              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: brandPrimary }}
            >
              <Icons.Play size={7} className="text-black fill-black ml-0.2" />
            </div>
          </div>

          {/* תוכן נקי ללא תוויות עודפות */}
          <div
            onClick={onQuestionClick}
            className="flex-1 text-right cursor-pointer px-1 overflow-hidden flex flex-col justify-center"
          >
            <span className="text-[9.5px] truncate mb-0.5 font-medium" style={{ color: modeColors.secondaryText }}>
              {hintText}
            </span>
            <div className="text-xs font-black truncate" style={{ color: modeColors.textColor }}>
              {questionText}
            </div>
          </div>

          {/* מיקרופון אלגנטי זהב */}
          <button
            type="button"
            onClick={onMicClick}
            title={micTooltip}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer relative transition-transform active:scale-95 shadow-md border"
            style={{
              backgroundColor: `${brandPrimary}18`,
              borderColor: brandPrimary,
              color: brandPrimary
            }}
          >
            <Icons.Mic size={19} className="drop-shadow" />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // סגנון 3: EXECUTIVE COMMAND BAR (סרגל פיקוד מנהלי - אייקון KOSUN כחול מנהלי)
  // ═══════════════════════════════════════════════════════════════════════════
  if (capsuleVariant === 'executive_command_bar') {
    return (
      <div className={`relative z-20 w-full my-1 ${styleDef.fontFamily}`} data-area-id="area_top_ai_capsule">
        <div
          className="w-full h-14 p-1.5 flex items-center justify-between gap-2 border backdrop-blur-2xl transition-all duration-300 relative overflow-hidden shadow-xl"
          style={{
            borderRadius: capsuleRadius,
            backgroundColor: isDay ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.94)',
            borderColor: modeColors.borderColor,
            boxShadow: `0 6px 20px -6px ${modeColors.glowColor}`
          }}
        >
          {/* אייקון KOSUN 3D מנהלי */}
          <div
            onClick={onAvatarPlayClick}
            title="פתח הודעת מנהל"
            className="relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer group border hover:scale-105 active:scale-95 transition-all shadow-sm"
            style={{
              borderColor: modeColors.borderColor,
              backgroundColor: isDay ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.12)'
            }}
          >
            <KosunUserAvatar color={brandPrimary} glowColor={modeColors.glowColor} size={25} />
            <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
          </div>

          {/* גוף סרגל פקודות נקי ללא תוויות */}
          <div
            onClick={onQuestionClick}
            className="flex-1 text-right cursor-pointer px-1.5 overflow-hidden flex flex-col justify-center"
          >
            <span className="text-[9.5px] truncate mb-0.5 font-medium" style={{ color: modeColors.secondaryText }}>
              {hintText}
            </span>
            <div className="text-xs font-black truncate" style={{ color: modeColors.textColor }}>
              {questionText}
            </div>
          </div>

          {/* מיקרופון פקודה מנהלי */}
          <button
            type="button"
            onClick={onMicClick}
            title={micTooltip}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer relative border transition-transform active:scale-95 shadow-md"
            style={{
              backgroundColor: isDay ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
              borderColor: modeColors.borderColor,
              color: brandPrimary
            }}
          >
            <Icons.Mic size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // סגנון 4: ORGANIC SOFT PILL (קפסולת גלולה שלווה - אייקון KOSUN ירוק אמרלד)
  // ═══════════════════════════════════════════════════════════════════════════
  if (capsuleVariant === 'organic_soft_pill') {
    return (
      <div className={`relative z-20 w-full my-1 ${styleDef.fontFamily}`} data-area-id="area_top_ai_capsule">
        <div
          className="w-full h-14 px-2 py-1 flex items-center justify-between gap-2.5 border transition-all duration-300 relative overflow-hidden shadow-lg rounded-full"
          style={{
            backgroundColor: modeColors.cardBg,
            borderColor: modeColors.borderColor,
            boxShadow: `0 4px 18px -4px ${modeColors.glowColor}`
          }}
        >
          {/* אייקון KOSUN עגול רך עם הילה בוטנית */}
          <div
            onClick={onAvatarPlayClick}
            title="האזן לסוכן"
            className="relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer group border hover:scale-105 active:scale-95 transition-all shadow-sm"
            style={{
              borderColor: `${brandPrimary}60`,
              backgroundColor: `${brandPrimary}15`
            }}
          >
            <KosunUserAvatar color={brandPrimary} glowColor={modeColors.glowColor} size={25} />
            <div
              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: brandPrimary }}
            >
              <Icons.Play size={7} className="text-black fill-black ml-0.2" />
            </div>
          </div>

          {/* תוכן רגוע וטבעי ללא תוויות עודפות */}
          <div
            onClick={onQuestionClick}
            className="flex-1 text-right cursor-pointer px-1 overflow-hidden flex flex-col justify-center"
          >
            <span className="text-[9.5px] truncate font-medium mb-0.5" style={{ color: modeColors.secondaryText }}>
              {hintText}
            </span>
            <div className="text-xs font-bold truncate" style={{ color: modeColors.textColor }}>
              {questionText}
            </div>
          </div>

          {/* מיקרופון רך ועגול */}
          <button
            type="button"
            onClick={onMicClick}
            title={micTooltip}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer relative transition-transform active:scale-95 shadow-md"
            style={{
              backgroundColor: `${brandPrimary}25`,
              color: brandPrimary
            }}
          >
            <Icons.Mic size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // סגנון 5: KINETIC SPLIT CAPSULE (קפסולה מפוצלת קינטית - אייקון KOSUN ורוד/מג'נטה)
  // ═══════════════════════════════════════════════════════════════════════════
  if (capsuleVariant === 'kinetic_split_capsule') {
    return (
      <div className={`relative z-20 w-full my-1 flex items-center gap-2 ${styleDef.fontFamily}`} data-area-id="area_top_ai_capsule">
        {/* קפסולה 1: אייקון KOSUN 3D קינטי זוהר נפרד */}
        <div
          onClick={onAvatarPlayClick}
          title="הפעל סוכן חי"
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer group border-2 p-0.5 shadow-xl hover:scale-105 active:scale-95 transition-transform"
          style={{
            borderColor: brandPrimary,
            background: modeColors.cardBg,
            boxShadow: `0 0 16px ${modeColors.glowColor}`
          }}
        >
          <KosunUserAvatar color={brandPrimary} glowColor={modeColors.glowColor} size={32} pulse />
          <span
            className="absolute bottom-0 inset-x-0 py-0.2 text-[7.5px] font-black text-black text-center rounded-b-xl"
            style={{ backgroundColor: brandPrimary }}
          >
            AI
          </span>
        </div>

        {/* קפסולה 2: סרגל דיבור קינטי נקי ללא תוויות עודפות */}
        <div
          className="flex-1 h-14 p-1.5 flex items-center justify-between gap-2 border-2 transition-all duration-300 relative overflow-hidden shadow-xl"
          style={{
            borderRadius: capsuleRadius,
            backgroundColor: modeColors.cardBg,
            borderColor: modeColors.borderColor,
            boxShadow: `0 6px 20px -6px ${modeColors.glowColor}`
          }}
        >
          <div
            onClick={onQuestionClick}
            className="flex-1 text-right cursor-pointer px-1 overflow-hidden flex flex-col justify-center"
          >
            <span className="text-[9.5px] truncate mb-0.5 font-medium" style={{ color: modeColors.secondaryText }}>
              {hintText}
            </span>
            <div className="text-xs font-black truncate" style={{ color: modeColors.textColor }}>
              {questionText}
            </div>
          </div>

          <button
            type="button"
            onClick={onMicClick}
            title={micTooltip}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer relative transition-transform active:scale-95 shadow-md text-black"
            style={{ backgroundColor: brandPrimary }}
          >
            <Icons.Mic size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // סגנון 1 (ברירת מחדל): NEON FLOATING DOCK (קושאן סייבר ניאון עם אייקון KOSUN ציאן)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`relative z-20 w-full my-1 ${styleDef.fontFamily}`} data-area-id="area_top_ai_capsule">
      <div
        className="w-full h-14 rounded-2xl p-1.5 flex items-center justify-between gap-2 border-2 shadow-2xl transition-all duration-300 relative overflow-hidden"
        style={{
          borderRadius: capsuleRadius,
          backgroundColor: modeColors.cardBg,
          borderColor: brandPrimary,
          boxShadow: `0 0 24px ${modeColors.glowColor}`
        }}
      >
        {/* 1. אייקון KOSUN 3D בטבעת ניאון עם כפתור Play עדין */}
        <div
          onClick={onAvatarPlayClick}
          title="שמע את הסוכן"
          className="relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer group border-2 hover:scale-105 active:scale-95 transition-all shadow-md"
          style={{
            borderColor: brandPrimary,
            backgroundColor: `${brandPrimary}15`,
            boxShadow: `0 0 16px ${modeColors.glowColor}`
          }}
        >
          <KosunUserAvatar color={brandPrimary} glowColor={modeColors.glowColor} size={25} />
          <div
            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: brandPrimary }}
          >
            <Icons.Play size={7} className="text-black fill-black ml-0.2" />
          </div>
        </div>

        {/* 2. ניסוח אנושי + גלי קול חיים (Soundwave) ללא תווית טקסט עודפת */}
        <div
          onClick={onQuestionClick}
          className="flex-1 text-right cursor-pointer px-1.5 overflow-hidden group flex flex-col justify-center"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {showSoundwave && (
              <div className="flex items-center gap-0.5 h-2">
                <span className="w-0.5 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandPrimary }} />
                <span className="w-0.5 h-3 rounded-full animate-pulse delay-75" style={{ backgroundColor: brandPrimary }} />
                <span className="w-0.5 h-1.5 rounded-full animate-pulse delay-150" style={{ backgroundColor: brandPrimary }} />
              </div>
            )}
            <span className="text-[9.5px] truncate font-medium" style={{ color: modeColors.secondaryText }}>
              {hintText}
            </span>
          </div>

          <div className="text-xs font-black truncate transition-colors" style={{ color: brandPrimary }}>
            {questionText}
          </div>
        </div>

        {/* 3. מיקרופון מתנענע דינמי */}
        <button
          type="button"
          onClick={onMicClick}
          title={micTooltip}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer relative group transition-transform active:scale-95 shadow-md"
          style={{
            backgroundColor: `${brandPrimary}22`,
            border: `1.5px solid ${brandPrimary}`
          }}
        >
          <div
            className="absolute -inset-1 rounded-xl animate-ping opacity-30 pointer-events-none"
            style={{ backgroundColor: brandPrimary }}
          />
          <div className="animate-[wiggle_1.2s_ease-in-out_infinite]">
            <Icons.Mic size={20} style={{ color: brandPrimary }} className="drop-shadow-md" />
          </div>
        </button>
      </div>
    </div>
  );
};
