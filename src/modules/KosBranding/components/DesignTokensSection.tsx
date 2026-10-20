import React from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { BorderRadiusStyle, ButtonStyleType, TenantStylePreset } from '../types/brandDna';
import { useTenantScope } from '../../../core/tenant';
import { eventBus } from '../../../core/bridge/EventBus';
import {
  Palette,
  Type,
  Maximize2,
  Sparkles,
  Info,
  Check,
  Heart,
  Shield,
  Flower2,
  Compass,
  Cpu,
  Layers,
  Wand2,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const FONT_OPTIONS = [
  { id: 'Heebo, sans-serif', name: 'Heebo (מודרני, נקי וחד)' },
  { id: 'Assistant, sans-serif', name: 'Assistant (נעים, עגול וקריא)' },
  { id: 'Rubik, sans-serif', name: 'Rubik (דינמי, בולט וידידותי)' },
  { id: '"Frank Ruhl Libre", serif', name: 'Frank Ruhl (מסורתי, יוקרתי, רשמי)' },
  { id: 'Alef, sans-serif', name: 'Alef (אלגנטי ומאוזן)' },
  { id: '"Secular One", sans-serif', name: 'Secular One (כותרות מסיביות וחזקות)' },
];

const PRESET_PALETTES = [
  {
    name: 'הייטק ואינדיגו',
    primary: '#6366f1',
    secondary: '#0ea5e9',
    background: '#0f172a',
    buttonBg: '#6366f1',
  },
  {
    name: 'צמיחה וירוק אמרלד',
    primary: '#10b981',
    secondary: '#14b8a6',
    background: '#064e3b',
    buttonBg: '#10b981',
  },
  {
    name: 'יוקרה וזהב מלכותי',
    primary: '#f59e0b',
    secondary: '#d97706',
    background: '#1c1917',
    buttonBg: '#f59e0b',
  },
  {
    name: 'פוקסיה ורוד מודרני',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    background: '#18181b',
    buttonBg: '#ec4899',
  },
  {
    name: 'כחול עמוק קלאסי',
    primary: '#2563eb',
    secondary: '#38bdf8',
    background: '#0f172a',
    buttonBg: '#2563eb',
  },
];

const RADIUS_OPTIONS: Array<{ id: BorderRadiusStyle; label: string; preview: string }> = [
  { id: 'none', label: 'חד (0px)', preview: 'rounded-none' },
  { id: 'sm', label: 'עדין (4px)', preview: 'rounded-sm' },
  { id: 'md', label: 'מודרני (8px)', preview: 'rounded-lg' },
  { id: 'lg', label: 'רך ועגול (16px)', preview: 'rounded-2xl' },
  { id: 'full', label: 'קפסולה (Pill)', preview: 'rounded-full' },
];

const BUTTON_STYLES: Array<{ id: ButtonStyleType; label: string }> = [
  { id: 'solid', label: 'מלא (Solid)' },
  { id: 'gradient', label: 'גרדיאנט (Gradient)' },
  { id: 'outline', label: 'מסגרת (Outline)' },
  { id: 'glass', label: 'זכוכית (Glassmorphism)' },
];

export const STYLE_PRESET_TOKEN_DEFAULTS: Record<
  TenantStylePreset,
  {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
    borderRadius: BorderRadiusStyle;
    buttonStyle: ButtonStyleType;
  }
> = {
  masculine: {
    primaryColor: '#2563eb',
    secondaryColor: '#0284c7',
    backgroundColor: '#0f172a',
    buttonBgColor: '#2563eb',
    buttonTextColor: '#ffffff',
    borderRadius: 'md',
    buttonStyle: 'solid',
  },
  feminine: {
    primaryColor: '#ec4899',
    secondaryColor: '#f43f5e',
    backgroundColor: '#18181b',
    buttonBgColor: '#ec4899',
    buttonTextColor: '#ffffff',
    borderRadius: 'full',
    buttonStyle: 'gradient',
  },
  spiritual: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#d946ef',
    backgroundColor: '#18181b',
    buttonBgColor: '#8b5cf6',
    buttonTextColor: '#ffffff',
    borderRadius: 'lg',
    buttonStyle: 'glass',
  },
  sharp: {
    primaryColor: '#06b6d4',
    secondaryColor: '#0891b2',
    backgroundColor: '#0f172a',
    buttonBgColor: '#06b6d4',
    buttonTextColor: '#ffffff',
    borderRadius: 'none',
    buttonStyle: 'outline',
  },
  analytical: {
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    backgroundColor: '#064e3b',
    buttonBgColor: '#10b981',
    buttonTextColor: '#ffffff',
    borderRadius: 'sm',
    buttonStyle: 'solid',
  },
  standard: {
    primaryColor: '#6366f1',
    secondaryColor: '#0ea5e9',
    backgroundColor: '#0f172a',
    buttonBgColor: '#6366f1',
    buttonTextColor: '#ffffff',
    borderRadius: 'md',
    buttonStyle: 'gradient',
  },
};

const TENANT_STYLE_OPTIONS: Array<{
  id: TenantStylePreset;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}> = [
  {
    id: 'masculine',
    title: 'גברי ועוצמתי (Masculine)',
    subtitle: 'חד, עמוק, מסגרות מודגשות וחוזק',
    description: 'גווני כחול נייבי עמוקים, ניגודיות גבוהה, צורות מגן (Shield), קווים ישרים ומשקל טיפוגרפי כבד.',
    badge: 'מתאים לכושר, אבטחה, פיננסים ונדל״ן',
    icon: Shield,
    accentColor: '#2563eb',
  },
  {
    id: 'feminine',
    title: 'נשי ורך (Feminine)',
    subtitle: 'עדינות, עגלגלות, רכות ופרחוניות',
    description: 'פלטות פסטל ורודות, פינות פיל מעוגלות מלאות, צורות לב ופרח, צלליות מפוזרות ואסתטיקה אלגנטית.',
    badge: 'מתאים לביוטי, טיפוח, נשים וסדנאות',
    icon: Heart,
    accentColor: '#ec4899',
  },
  {
    id: 'spiritual',
    title: 'רוחני ועדין (Spiritual)',
    subtitle: 'שלווה, רוגע, לוטוס והשראה',
    description: 'גווני סגול ולבנדר מרגיעים, הילות רכות, צורות לוטוס (Lotus), עומק מדיטטיבי ואווירה פיוטית.',
    badge: 'מתאים ליוגה, טיפול, רוחניות וקהילות',
    icon: Flower2,
    accentColor: '#8b5cf6',
  },
  {
    id: 'sharp',
    title: 'חד וטכנולוגי (Sharp)',
    subtitle: 'מינימליזם הייטקיסטי, זוויות 90 מעלות ודיוק',
    description: 'ללא רדיוס פינות (0px), גרידים גיאומטריים חדים, זוויות ישרות, הדגשות טורקיז/ציאן וקווים חתוכים.',
    badge: 'מתאים לתוכנה, סטארט-אפים, סייבר וטכנולוגיה',
    icon: Compass,
    accentColor: '#06b6d4',
  },
  {
    id: 'analytical',
    title: 'אנליטי ומדעי (Analytical)',
    subtitle: 'נתונים, מדדים, ממשק HUD וגרפים',
    description: 'מסגרות טכנולוגיות עם פינות חתוכות (HUD), הדגשות ירוק אמרלד, מוניטורים חיים והצגת מידע ברורה.',
    badge: 'מתאים לדאטה, אנליטיקה, רפואה ומחקר',
    icon: Cpu,
    accentColor: '#10b981',
  },
  {
    id: 'standard',
    title: 'סטנדרטי ומאוזן (Standard)',
    subtitle: 'נקי, יציב, מודרני וניטרלי',
    description: 'מבנה קלאסי ומאוזן, פינות מעוגלות רגילות, קריאות מקסימלית והתאמה מושלמת לכל עסק ושירות.',
    badge: 'מומלץ לעסקים כלליים',
    icon: Layers,
    accentColor: '#6366f1',
  },
];

export const DesignTokensSection: React.FC = () => {
  const { brandDna, updateDesignTokens, saveNow, isSaving } = useBrandDna();
  const { tenantId } = useTenantScope();
  const tokens = brandDna.designTokens;

  const [isApplying, setIsApplying] = React.useState(false);
  const [actionFeedback, setActionFeedback] = React.useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const handleSelectPreset = async (presetId: TenantStylePreset) => {
    const defaults = STYLE_PRESET_TOKEN_DEFAULTS[presetId];
    updateDesignTokens({
      defaultStylePreset: presetId,
      borderRadius: defaults.borderRadius,
      buttonStyle: defaults.buttonStyle,
    });
    // Immediately persist and sync with Firestore cloud
    setTimeout(async () => {
      await saveNow();
    }, 100);
    setActionFeedback({
      type: 'success',
      text: `סגנון ${TENANT_STYLE_OPTIONS.find((s) => s.id === presetId)?.title || presetId} נשמר בהצלחה בענן וב-Firestore!`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleApplyPresetColors = async (presetId: TenantStylePreset) => {
    const defaults = STYLE_PRESET_TOKEN_DEFAULTS[presetId];
    updateDesignTokens({
      primaryColor: defaults.primaryColor,
      secondaryColor: defaults.secondaryColor,
      backgroundColor: defaults.backgroundColor,
      buttonBgColor: defaults.buttonBgColor,
      buttonTextColor: defaults.buttonTextColor,
    });
    setTimeout(async () => {
      await saveNow();
    }, 100);
    setActionFeedback({
      type: 'success',
      text: `פלטת הצבעים עודכנה ונשמרה בהצלחה בענן בהתאם לסגנון ${TENANT_STYLE_OPTIONS.find((s) => s.id === presetId)?.title || presetId}!`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleApplyToAllPages = () => {
    const currentPreset = tokens.defaultStylePreset || 'standard';
    setIsApplying(true);
    try {
      eventBus.publish('brand:apply_style_to_all_pages', {
        tenantId: tenantId || 'default',
        preset: currentPreset,
      });
      window.dispatchEvent(
        new CustomEvent('kos_brand_apply_all_pages', {
          detail: { tenantId: tenantId || 'default', preset: currentPreset },
        })
      );
      setActionFeedback({
        type: 'success',
        text: 'הסגנון הוחל בהצלחה על כל עמודי האתר! גרסאות קודמות נשמרו אוטומטית בהיסטוריית העמודים.',
      });
      setTimeout(() => setActionFeedback(null), 5000);
    } finally {
      setIsApplying(false);
    }
  };

  const handleResetAllPages = () => {
    if (!window.confirm('האם אתה בטוח שברצונך לאפס את כל עמודי האתר לשפת המיתוג הראשונית? גרסה של העיצוב הקיים תישמר אוטומטית כגיבוי.')) {
      return;
    }
    setIsApplying(true);
    try {
      eventBus.publish('brand:reset_all_pages', {
        tenantId: tenantId || 'default',
        brandDna,
      });
      window.dispatchEvent(
        new CustomEvent('kos_brand_reset_all_pages', {
          detail: { tenantId: tenantId || 'default', brandDna },
        })
      );
      setActionFeedback({
        type: 'info',
        text: 'כל עמודי האתר אופסו בהצלחה לשפת המיתוג הראשונית! גרסאות קודמות נשמרו בגיבוי.',
      });
      setTimeout(() => setActionFeedback(null), 5000);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope Alert Notice */}
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3 text-indigo-300 text-xs leading-relaxed">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">הפרדת תחומי עיצוב (Design Tokens):</strong>
          הצבעים והגופנים שמוגדרים כאן חלים אך ורק על <strong>עמודי תוכן, דפי נחיתה, טפסים חכמים ודפי סליקה חיצוניים</strong> שייווצרו במערכת. הם אינם משנים את ערכת הנושא של ממשק הניהול.
        </div>
      </div>

      {/* 1. Tenant Default Style Preset - Front & Center */}
      <div className="bg-slate-800/80 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">1. שפת הסגנון המובילה לכל עמודי האתר (Tenant Style Preset)</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  קבוע לכל עמודי KWB
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                בחר אחד מ-6 הסגנונות הקבועים (גברי, נשי, רוחני, חד, אנליטי או סטנדרטי) שישמשו כסגנון ברירת מחדל אחיד לכל עמודי האתר, דפי הנחיתה והטפסים.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 shrink-0 self-start sm:self-center">
            שפת מותג פעילה: <strong className="text-amber-400">{TENANT_STYLE_OPTIONS.find(s => s.id === (tokens.defaultStylePreset || 'standard'))?.title}</strong>
          </span>
        </div>

        {/* 6 Style Cards Grid - 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TENANT_STYLE_OPTIONS.map((style) => {
            const Icon = style.icon;
            const isSelected = (tokens.defaultStylePreset || 'standard') === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectPreset(style.id)}
                className={`w-full p-4 rounded-2xl border text-right transition-all flex items-start justify-between cursor-pointer group ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-900/90 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${style.accentColor}18`,
                      borderColor: `${style.accentColor}40`,
                      color: style.accentColor,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {style.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {style.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-300">
                      {style.subtitle}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {style.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 mr-3 mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400 text-black shadow-sm shadow-amber-400/30'
                        : 'border-slate-600 bg-slate-800 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Preview Box */}
        {(() => {
          const currentPreset = tokens.defaultStylePreset || 'standard';
          const presetObj = TENANT_STYLE_OPTIONS.find((s) => s.id === currentPreset) || TENANT_STYLE_OPTIONS[0];
          const radiusClass =
            tokens.borderRadius === 'none'
              ? 'rounded-none'
              : tokens.borderRadius === 'sm'
              ? 'rounded-md'
              : tokens.borderRadius === 'lg'
              ? 'rounded-2xl'
              : tokens.borderRadius === 'full'
              ? 'rounded-full'
              : 'rounded-xl';

          const buttonRadiusClass =
            tokens.borderRadius === 'none'
              ? 'rounded-none'
              : tokens.borderRadius === 'sm'
              ? 'rounded'
              : tokens.borderRadius === 'lg'
              ? 'rounded-xl'
              : tokens.borderRadius === 'full'
              ? 'rounded-full'
              : 'rounded-lg';

          return (
            <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  תצוגה מקדימה חיה של רכיב KWB בסגנון {presetObj.title}:
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  יוחל אוטומטית על כל דף חדש ב-KWB
                </span>
              </div>

              <div
                className={`p-4 sm:p-5 border transition-all ${radiusClass}`}
                style={{
                  backgroundColor: tokens.backgroundColor || '#0f172a',
                  borderColor: `${tokens.primaryColor || '#6366f1'}40`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
                        style={{
                          backgroundColor: `${tokens.primaryColor || '#6366f1'}20`,
                          borderColor: tokens.primaryColor || '#6366f1',
                          color: tokens.primaryColor || '#6366f1',
                        }}
                      >
                        {presetObj.badge}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/p/demo-kwb-page</span>
                    </div>

                    <h4
                      className="text-sm sm:text-base font-black text-white"
                      style={{
                        color: tokens.textColorH1 || '#ffffff',
                        fontFamily: tokens.fontFamily || 'Heebo, sans-serif',
                      }}
                    >
                      כותרת עמוד נחיתה / מוצר לדוגמה בסגנון {presetObj.subtitle}
                    </h4>

                    <p className="text-xs text-slate-400 max-w-md">
                      טפסים, ספירה לאחור, כרטיסי תמחור ורשימות עמודים יאמצו את סגנון {presetObj.title} באופן קבוע.
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2 items-start sm:items-end">
                    <button
                      type="button"
                      className={`px-5 py-2.5 font-black text-xs transition-all shadow-md ${buttonRadiusClass}`}
                      style={{
                        backgroundColor:
                          tokens.buttonStyle === 'outline'
                            ? 'transparent'
                            : tokens.buttonStyle === 'glass'
                            ? `${tokens.buttonBgColor || '#6366f1'}30`
                            : tokens.buttonBgColor || '#6366f1',
                        color: tokens.buttonTextColor || '#ffffff',
                        border:
                          tokens.buttonStyle === 'outline'
                            ? `2px solid ${tokens.buttonBgColor || '#6366f1'}`
                            : tokens.buttonStyle === 'glass'
                            ? `1px solid ${tokens.buttonBgColor || '#6366f1'}60`
                            : 'none',
                        backdropFilter: tokens.buttonStyle === 'glass' ? 'blur(8px)' : undefined,
                      }}
                    >
                      כפתור פעולה לדוגמה
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetColors(currentPreset)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold transition-colors cursor-pointer"
                    >
                      החל פלטת צבעים מומלצת של סגנון זה
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Action Banner & Multi-Page Sync Buttons */}
        <div className="pt-4 border-t border-slate-700/60 space-y-3">
          <div className="p-3.5 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs space-y-1.5 text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>שמירת גרסאות אוטומטית וברירת מחדל לכל עמוד עתידי</span>
            </div>
            <p className="text-[11px] text-slate-400">
              כל עמוד חדש שייווצר יתחיל בסגנון ובפריסה שנבחרו כאן. בלחיצה על הכפתורים מטה, תוכל להחיל את הסגנון על כל העמודים הקיימים באתר או לאפס אותם לשפת המותג. בכל פעולה נוצרת אוטומטית גרסת שחזור בהיסטוריית העמודים.
            </p>
          </div>

          {actionFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold text-center animate-fadeIn ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              }`}
            >
              {actionFeedback.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isApplying}
              onClick={handleApplyToAllPages}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>החל סגנון מותג זה על כל עמודי האתר</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={async () => {
                await saveNow();
                setActionFeedback({
                  type: 'success',
                  text: 'כל הגדרות העיצוב והשפה החזותית נשמרו בהצלחה בענן!',
                });
                setTimeout(() => setActionFeedback(null), 4000);
              }}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>שמור הגדרות עיצוב אלו בענן כעת</span>
            </button>

            <button
              type="button"
              disabled={isApplying}
              onClick={handleResetAllPages}
              className="col-span-1 sm:col-span-2 py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>אפס את כל העמודים למצב ראשוני</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Palette Presets */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">2. פלטת צבעים גלובלית (Brand Palette)</h3>
            <p className="text-xs text-slate-400">בחר ערכת צבעים מוכנה או התאם ידנית כל צבע</p>
          </div>
        </div>

        {/* Preset buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">ערכות מיתוג מוכנות בלחיצה:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PRESET_PALETTES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() =>
                  updateDesignTokens({
                    primaryColor: preset.primary,
                    secondaryColor: preset.secondary,
                    backgroundColor: preset.background,
                    buttonBgColor: preset.buttonBg,
                  })
                }
                className="p-3 bg-slate-900/70 hover:bg-slate-900 border border-slate-700/70 hover:border-slate-500 rounded-xl text-right transition-all group flex flex-col justify-between h-20"
              >
                <span className="text-[11px] font-bold text-slate-200 group-hover:text-white block truncate">
                  {preset.name}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.background }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Color pickers grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-700/60">
          {/* Primary Color */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold text-slate-200">צבע מותג ראשי</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tokens.primaryColor}
                onChange={(e) => updateDesignTokens({ primaryColor: e.target.value })}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-white uppercase"
                dir="ltr"
              />
              <input
                type="color"
                value={tokens.primaryColor}
                onChange={(e) => updateDesignTokens({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold text-slate-200">צבע מותג משני</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tokens.secondaryColor}
                onChange={(e) => updateDesignTokens({ secondaryColor: e.target.value })}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-white uppercase"
                dir="ltr"
              />
              <input
                type="color"
                value={tokens.secondaryColor}
                onChange={(e) => updateDesignTokens({ secondaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold text-slate-200">צבע רקע לדפים</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tokens.backgroundColor}
                onChange={(e) => updateDesignTokens({ backgroundColor: e.target.value })}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-white uppercase"
                dir="ltr"
              />
              <input
                type="color"
                value={tokens.backgroundColor}
                onChange={(e) => updateDesignTokens({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
              />
            </div>
          </div>

          {/* Button Bg Color */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold text-slate-200">רקע כפתור ראשי</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tokens.buttonBgColor}
                onChange={(e) => updateDesignTokens({ buttonBgColor: e.target.value })}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-white uppercase"
                dir="ltr"
              />
              <input
                type="color"
                value={tokens.buttonBgColor}
                onChange={(e) => updateDesignTokens({ buttonBgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
              />
            </div>
          </div>

          {/* Button Text Color */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold text-slate-200">טקסט כפתור</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tokens.buttonTextColor}
                onChange={(e) => updateDesignTokens({ buttonTextColor: e.target.value })}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-white uppercase"
                dir="ltr"
              />
              <input
                type="color"
                value={tokens.buttonTextColor}
                onChange={(e) => updateDesignTokens({ buttonTextColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
              />
            </div>
          </div>

          {/* Text H1 Color */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold text-slate-200">צבע כותרות ראשיות</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tokens.textColorH1}
                onChange={(e) => updateDesignTokens({ textColorH1: e.target.value })}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-white uppercase"
                dir="ltr"
              />
              <input
                type="color"
                value={tokens.textColorH1}
                onChange={(e) => updateDesignTokens({ textColorH1: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Typography & Font Family */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">3. טיפוגרפיה וגופן ראשי</h3>
            <p className="text-xs text-slate-400">בחר את הגופן העברי שיוחל על דפי הנחיתה, הטפסים ודפי הסליקה</p>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => updateDesignTokens({ fontFamily: f.id })}
              className={`w-full p-3.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                tokens.fontFamily === f.id
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200 shadow-sm'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              <div>
                <span className="text-xs font-bold block" style={{ fontFamily: f.id }}>
                  {f.name}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block" style={{ fontFamily: f.id }}>
                  דוגמת טקסט מיתוג בעברית
                </span>
              </div>
              {tokens.fontFamily === f.id && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Shape, Border Radius & Button Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Border Radius */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            <span>4.1 רדיוס פינות (Border Radius)</span>
          </div>
          <div className="flex flex-col space-y-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => updateDesignTokens({ borderRadius: r.id })}
                className={`w-full p-3 border text-right transition-all flex items-center justify-between ${r.preview} ${
                  tokens.borderRadius === r.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold block">{r.label}</span>
                {tokens.borderRadius === r.id && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Button Style */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>4.2 סגנון כפתורי פעולה (CTA Style)</span>
          </div>
          <div className="flex flex-col space-y-2">
            {BUTTON_STYLES.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => updateDesignTokens({ buttonStyle: btn.id })}
                className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  tokens.buttonStyle === btn.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold block">{btn.label}</span>
                {tokens.buttonStyle === btn.id && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>

          </div>
  );
};
