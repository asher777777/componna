import React, { useState } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { GenderAddressing, SectorCompliance } from '../types/brandDna';
import {
  MessageSquareQuote,
  Sliders,
  ShieldAlert,
  Flame,
  Plus,
  X,
  Sparkles,
  Users,
  Moon,
} from 'lucide-react';

const GENDER_OPTIONS: Array<{ id: GenderAddressing; label: string; sub: string }> = [
  { id: 'plural', label: 'לשון רבים (מומלץ)', sub: '"אנחנו מזמינים אתכם"' },
  { id: 'direct', label: 'פנייה ישירה חדה', sub: '"בוא לקבל תוצאות"' },
  { id: 'male', label: 'זכר יחיד', sub: '"אתה מוזמן להצטרף"' },
  { id: 'female', label: 'נקבה יחיד', sub: '"את מוזמנת להצטרף"' },
  { id: 'neutral', label: 'נייטרלי / פסיבי', sub: '"ניתן לבצע רישום"' },
];

const SECTOR_OPTIONS: Array<{ id: SectorCompliance; label: string; desc: string }> = [
  { id: 'general', label: 'כללי ומודרני', desc: 'עברית ישראלית טבעית ויומיומית' },
  { id: 'business', label: 'עסקי ותכליתי (B2B)', desc: 'שפה מקצועית ממוקדת ROI וצמיחה' },
  { id: 'religious', label: 'דתי / מסורתי', desc: 'שפה מכבדת עם ערכים ולשון נקייה' },
  { id: 'ultra_orthodox', label: 'חרדי ושמור', desc: 'צניעות מוקפדת, ללא סלנג, שפה כשרה' },
];

export const BrandVoiceSection: React.FC = () => {
  const { brandDna, updateVoice } = useBrandDna();

  const [newPowerWord, setNewPowerWord] = useState('');
  const [newForbiddenWord, setNewForbiddenWord] = useState('');

  const personality = brandDna.voice.personality;

  const handlePersonalityChange = (field: keyof typeof personality, value: number) => {
    updateVoice({
      personality: {
        ...personality,
        [field]: value,
      },
    });
  };

  const handleAddPowerWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newPowerWord.trim();
    if (word && !brandDna.voice.powerWords.includes(word)) {
      updateVoice({ powerWords: [...brandDna.voice.powerWords, word] });
      setNewPowerWord('');
    }
  };

  const handleRemovePowerWord = (word: string) => {
    updateVoice({ powerWords: brandDna.voice.powerWords.filter((w) => w !== word) });
  };

  const handleAddForbiddenWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newForbiddenWord.trim();
    if (word && !brandDna.voice.forbiddenWords.includes(word)) {
      updateVoice({ forbiddenWords: [...brandDna.voice.forbiddenWords, word] });
      setNewForbiddenWord('');
    }
  };

  const handleRemoveForbiddenWord = (word: string) => {
    updateVoice({ forbiddenWords: brandDna.voice.forbiddenWords.filter((w) => w !== word) });
  };

  return (
    <div className="space-y-6">
      {/* 1. Voice & Personality Matrix (Sliders) */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">מטריצת אישיות וטון הדיבור</h3>
            <p className="text-xs text-slate-400">הגדר את הטמפרמנט ואופי הניסוח ש-Gemini ישתמש בהם</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Formality */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-200">
              <span>רשמיות מול קלילות</span>
              <span className="text-indigo-400">
                {personality.formality >= 4 ? 'רשמי ומוקפד' : personality.formality <= 2 ? 'קליל וחברי' : 'מאוזן ונגיש'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={personality.formality}
              onChange={(e) => handlePersonalityChange('formality', parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 - סחבקי וחופשי</span>
              <span>5 - רשמי וממלכתי</span>
            </div>
          </div>

          {/* Warmth */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-200">
              <span>חמימות וקרבה</span>
              <span className="text-amber-400">
                {personality.warmth >= 4 ? 'חם ומשפחתי' : personality.warmth <= 2 ? 'ענייני ותכליתי' : 'נעים ומזמין'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={personality.warmth}
              onChange={(e) => handlePersonalityChange('warmth', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 - תכליתי וענייני</span>
              <span>5 - חם, אמפתי ואישי</span>
            </div>
          </div>

          {/* Luxury */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-200">
              <span>רמת יוקרה (Luxury)</span>
              <span className="text-emerald-400">
                {personality.luxury >= 4 ? 'פרימיום ויוקרתי' : personality.luxury <= 2 ? 'עממי ונגיש' : 'איכותי ואמין'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={personality.luxury}
              onChange={(e) => handlePersonalityChange('luxury', parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 - עממי וזול</span>
              <span>5 - פרימיום ובלעדי</span>
            </div>
          </div>

          {/* Energy */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-200">
              <span>אנרגיה והנעה לפעולה</span>
              <span className="text-pink-400">
                {personality.energy >= 4 ? 'אנרגטי וסוחף' : personality.energy <= 2 ? 'רגוע ושלו' : 'דינמי וממוקד'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={personality.energy}
              onChange={(e) => handlePersonalityChange('energy', parseInt(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 - שליו ומאופק</span>
              <span>5 - מלא התלהבות ותנופה</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Gender Addressing & Sector Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Addressing */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>לשון פנייה ראשית</span>
          </div>
          <div className="space-y-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateVoice({ genderAddressing: opt.id })}
                className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  brandDna.voice.genderAddressing === opt.id
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[11px] text-slate-500">{opt.sub}</span>
                </div>
                {brandDna.voice.genderAddressing === opt.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sector & Cultural Compliance */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-white font-bold text-sm">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
              <span>התאמה מגזרית ותרבותית</span>
            </div>
          </div>

          <div className="space-y-2">
            {SECTOR_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateVoice({ sectorCompliance: opt.id })}
                className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  brandDna.voice.sectorCompliance === opt.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[11px] text-slate-500">{opt.desc}</span>
                </div>
                {brandDna.voice.sectorCompliance === opt.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>

          {/* Shabbat Observance Toggle */}
          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-bold text-white block">שמירת שבת</span>
                <span className="text-[10px] text-slate-400">הנחיה ל-AI לא לקדם פעילות מסחרית בשבת</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateVoice({ shabbatObservant: !brandDna.voice.shabbatObservant })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                brandDna.voice.shabbatObservant ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  brandDna.voice.shabbatObservant ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Power Words & Negative Guardrails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Power Words */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">מילות כוח מומלצות (Power Words)</span>
          </div>
          <p className="text-[11px] text-slate-400">מילים ש-Gemini ישאף לשלב באופן טבעי במסרי השיווק</p>

          <form onSubmit={handleAddPowerWord} className="flex gap-2">
            <input
              type="text"
              value={newPowerWord}
              onChange={(e) => setNewPowerWord(e.target.value)}
              placeholder="הוסף מילה (למשל: מהפכני, שקט נפשי)..."
              className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              הוסף
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
            {brandDna.voice.powerWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
              >
                {word}
                <button
                  type="button"
                  onClick={() => handleRemovePowerWord(word)}
                  className="hover:text-red-400 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Negative Guardrails (Forbidden Words) */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-white">מילים וביטויים אסורים (Guardrails)</span>
          </div>
          <p className="text-[11px] text-slate-400">ביטויים ש-Gemini יקפיד שלעולם לא יופיעו בשום תוכן או טופס</p>

          <form onSubmit={handleAddForbiddenWord} className="flex gap-2">
            <input
              type="text"
              value={newForbiddenWord}
              onChange={(e) => setNewForbiddenWord(e.target.value)}
              placeholder="הוסף מילה אסורה (למשל: זול, חלטורה)..."
              className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              הוסף
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
            {brandDna.voice.forbiddenWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium"
              >
                {word}
                <button
                  type="button"
                  onClick={() => handleRemoveForbiddenWord(word)}
                  className="hover:text-white transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
