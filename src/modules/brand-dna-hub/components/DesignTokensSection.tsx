import React from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { BorderRadiusStyle, ButtonStyleType } from '../types/brandDna';
import {
  Palette,
  Type,
  Maximize2,
  Sparkles,
  Info,
  Check,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => updateDesignTokens({ fontFamily: f.id })}
              className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between ${
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => updateDesignTokens({ borderRadius: r.id })}
                className={`p-3 border text-center transition-all ${r.preview} ${
                  tokens.borderRadius === r.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold block">{r.label}</span>
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
          <div className="grid grid-cols-2 gap-2">
            {BUTTON_STYLES.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => updateDesignTokens({ buttonStyle: btn.id })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  tokens.buttonStyle === btn.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold block">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
