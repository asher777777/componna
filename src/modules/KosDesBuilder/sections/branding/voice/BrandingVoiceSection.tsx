import React, { useState } from 'react';
import { Sliders, Sparkles, MessageSquareQuote, ChevronDown, ChevronUp, Flame, ShieldAlert, Moon, CheckCircle2 } from 'lucide-react';
import { useBrandingActionRunner } from '../common/useBrandingActionRunner';
import { BrandingActionType } from '../common/types';

export interface BrandingVoiceConfig {
  title?: string;
  genderAddressing?: string;
  sectorCompliance?: string;
  shabbatObservant?: boolean;
  powerWords?: string[];
  forbiddenWords?: string[];
  formality?: number;
  warmth?: number;
  humor?: number;
  energy?: number;
  empathy?: number;
  primaryButtonText?: string;
  primaryButtonAction?: BrandingActionType;
  primaryButtonPayload?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: BrandingActionType;
  secondaryButtonPayload?: string;
}

const GENDER_LABELS: Record<string, string> = {
  plural: 'לשון רבים (מזמינים אתכם)',
  direct: 'פנייה ישירה חדה',
  male: 'זכר יחיד (אתה מוזמן)',
  female: 'נקבה יחיד (את מוזמנת)',
  neutral: 'נייטרלי / פסיבי (ניתן לבצע)',
};

const SECTOR_LABELS: Record<string, string> = {
  general: 'כללי ומודרני',
  business: 'עסקי ותכליתי (B2B)',
  religious: 'דתי / מסורתי',
  ultra_orthodox: 'חרדי ושמור (ללא סלנג)',
};

export const BrandingVoiceSection: React.FC<{ config: BrandingVoiceConfig }> = ({ config }) => {
  const { runAction } = useBrandingActionRunner();
  const [isExpanded, setIsExpanded] = useState(false);

  const title = config.title || 'שפת מותג, טון דיבור וערכים';
  const genderLabel = GENDER_LABELS[config.genderAddressing || 'plural'] || config.genderAddressing || 'לשון רבים';
  const sectorLabel = SECTOR_LABELS[config.sectorCompliance || 'business'] || config.sectorCompliance || 'עסקי ותכליתי';
  const powerWords = config.powerWords || ['צמיחה', 'תוצאות', 'דיגיטל', 'חדשנות'];
  const forbiddenWords = config.forbiddenWords || ['זול', 'אולי', 'בלתי אפשרי'];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-right relative overflow-hidden" dir="rtl">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Primary Badges */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              טמפרמנט הניסוח, חוקי פנייה ומשמעת שפה המונחים עבור מנועי ה-AI
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {config.secondaryButtonText && (
            <button
              type="button"
              onClick={() => runAction(config.secondaryButtonAction || 'open_scraper', config.secondaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              {config.secondaryButtonText}
            </button>
          )}

          {config.primaryButtonText && (
            <button
              type="button"
              onClick={() => runAction(config.primaryButtonAction || 'open_strategy', config.primaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-md shadow-amber-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.primaryButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main summary cards - Rule 7: Clean minimalist cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        {/* Gender addressing card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400">אופן פנייה ללקוח</span>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-amber-500" />
            <span>{genderLabel}</span>
          </div>
        </div>

        {/* Sector compliance */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400">תאימות מגזר ושפה</span>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{sectorLabel}</span>
          </div>
        </div>

        {/* Shabbat observance */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400">שמירת שבת ומסחר</span>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>{config.shabbatObservant ? 'שומר שבת (השבתת מסחר)' : 'פעילות רציפה 24/7'}</span>
          </div>
        </div>
      </div>

      {/* Power words showcase */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-500" /> מילות כוח מומלצות:
        </span>
        {powerWords.map((word, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60"
          >
            {word}
          </span>
        ))}
      </div>

      {/* Rule 7: Expandable Secondary Details Button */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isExpanded ? 'הסתר מטריצת אישיות ומילים אסורות' : 'הצג מטריצת אישיות מפורטת, סרגלי טמפרמנט ומילים אסורות'}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-5 animate-in fade-in duration-200">
            {/* Personality Matrix Bars */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                מטריצת טמפרמנט ואישיות (סולמות 1 עד 5)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'רשמיות מול קלילות', val: config.formality ?? 3, min: 'קליל', max: 'רשמי' },
                  { label: 'חמימות וקרבה', val: config.warmth ?? 4, min: 'ענייני', max: 'משפחתי' },
                  { label: 'הומור ושנינות', val: config.humor ?? 2, min: 'רציני', max: 'שנון' },
                  { label: 'אנרגיה ודחיפות', val: config.energy ?? 3, min: 'רגוע', max: 'נמרץ' },
                  { label: 'אמפתיה והקשבה', val: config.empathy ?? 4, min: 'תכליתי', max: 'מכיל' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{item.label}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px]">{item.val} / 5</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${(item.val / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{item.min}</span>
                      <span>{item.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forbidden words list */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> מילים וביטויים אסורים לשימוש:
              </span>
              <div className="flex flex-wrap gap-2">
                {forbiddenWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60"
                  >
                    ✕ {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
