import React from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { BorderRadiusStyle, ButtonStyleType, TenantStylePreset } from '../types/brandDna';
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
    id: 'standard',
    title: 'סטנדרטי ומאוזן (Standard)',
    subtitle: 'נקי, יציב, מודרני וניטרלי',
    description: 'מבנה קלאסי ומאוזן, פינות מעוגלות רגילות, קריאות מקסימלית והתאמה מושלמת לכל עסק ושירות.',
    badge: 'מומלץ לעסקים כלליים',
    icon: Layers,
    accentColor: '#6366f1',
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
    id: 'masculine',
    title: 'גברי ועוצמתי (Masculine)',
    subtitle: 'חד, עמוק, מסגרות מודגשות וחוזק',
    description: 'גווני כחול נייבי עמוקים, ניגודיות גבוהה, צורות מגן (Shield), קווים ישרים ומשקל טיפוגרפי כבד.',
    badge: 'מתאים לכושר, אבטחה, פיננסים ונדל״ן',
    icon: Shield,
    accentColor: '#2563eb',
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
];

export const DesignTokensSection: React.FC = () => {
  const { brandDna, updateDesignTokens } = useBrandDna();
  const tokens = brandDna.designTokens;

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

      {/* 1. Palette Presets */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">פלטת צבעים גלובלית (Brand Palette)</h3>
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

      {/* 2. Typography & Font Family */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">טיפוגרפיה וגופן ראשי</h3>
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

      {/* 3. Shape, Border Radius & Button Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Border Radius */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            <span>רדיוס פינות (Border Radius)</span>
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
            <span>סגנון כפתורי פעולה (CTA Style)</span>
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

      {/* 4. Tenant Default Style Preset */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">סגנון ברירת מחדל לטננט (Default Style Preset)</h3>
              <p className="text-xs text-slate-400">בחר את שפת העיצוב שתוגדר כברירת המחדל של כל האזורים, דפי הנחיתה והטפסים במותג</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            סנכרון גלובלי
          </span>
        </div>

        <div className="flex flex-col space-y-2.5">
          {TENANT_STYLE_OPTIONS.map((style) => {
            const Icon = style.icon;
            const isSelected = (tokens.defaultStylePreset || 'standard') === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => updateDesignTokens({ defaultStylePreset: style.id })}
                className={`w-full p-4 rounded-2xl border text-right transition-all flex items-start justify-between cursor-pointer group ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
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
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
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
      </div>
    </div>
  );
};
