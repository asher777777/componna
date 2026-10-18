import React, { useState } from 'react';
import { Target, Users, HelpCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { useBrandingActionRunner } from '../common/useBrandingActionRunner';
import { BrandingActionType } from '../common/types';

export interface PersonaSummary {
  name: string;
  role?: string;
  painPoints?: string;
  aspirations?: string;
}

export interface ObjectionSummary {
  objection: string;
  rebuttal: string;
}

export interface BrandingAudienceConfig {
  title?: string;
  mainUvp?: string;
  targetAudiences?: string[];
  personas?: PersonaSummary[];
  commonObjections?: ObjectionSummary[];
  primaryButtonText?: string;
  primaryButtonAction?: BrandingActionType;
  primaryButtonPayload?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: BrandingActionType;
  secondaryButtonPayload?: string;
}

export const BrandingAudienceSection: React.FC<{ config: BrandingAudienceConfig }> = ({ config }) => {
  const { runAction } = useBrandingActionRunner();
  const [isExpanded, setIsExpanded] = useState(false);

  const title = config.title || 'קהלי יעד, פרסונות ובידול (UVP)';
  const mainUvp = config.mainUvp || 'הצעת ערך ייחודית המבדלת את המותג מול המתחרים';
  const targetAudiences = config.targetAudiences || ['בעלי עסקים קטנים', 'מנהלי שיווק', 'יועצים עצמאיים'];
  const personas = config.personas || [
    { name: 'יוסי כהן', role: 'מנכ״ל עסק משפחתי', painPoints: 'חוסר זמן לניהול לידים', aspirations: 'אוטומציה מלאה' },
  ];
  const objections = config.commonObjections || [
    { objection: 'זה יקר לי מדי', rebuttal: 'החזר ההשקעה מושג כבר בחודש הראשון מתוך חיסכון בשעות עבודה' },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-right relative overflow-hidden" dir="rtl">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Primary Action */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              מיקוד קהל היעד, ניתוח נקודות כאב והצעת הערך הבלתי ניתנת לסירוב
            </p>
          </div>
        </div>

        {/* Action Buttons */}
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
              onClick={() => runAction(config.primaryButtonAction || 'open_ai_wizard', config.primaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.primaryButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main UVP Card - Rule 7 */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          הצעת ערך ייחודית (UVP)
        </span>
        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
          {mainUvp}
        </p>
      </div>

      {/* Target Audiences Chips */}
      <div className="mt-5 space-y-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-500" />
          קהלי יעד מוגדרים ({targetAudiences.length}):
        </span>
        <div className="flex flex-wrap gap-2">
          {targetAudiences.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Rule 7: Expandable Secondary Details Button */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isExpanded ? 'הסתר פירוט פרסונות והתנגדויות' : `הצג ${personas.length} פרסונות מאופיינות ו-${objections.length} מענים להתנגדויות`}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-5 animate-in fade-in duration-200">
            {/* Personas List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" />
                פרסונות מפתח
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personas.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{p.name}</span>
                      {p.role && <span className="text-[10px] text-slate-500">{p.role}</span>}
                    </div>
                    {p.painPoints && (
                      <p className="text-[11px] text-red-600 dark:text-red-400">
                        <strong className="text-slate-600 dark:text-slate-400">כאב מרכזי: </strong>{p.painPoints}
                      </p>
                    )}
                    {p.aspirations && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        <strong className="text-slate-600 dark:text-slate-400">שאיפה: </strong>{p.aspirations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Objections List */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                התנגדויות נפוצות ומענה מנצח
              </h4>
              <div className="space-y-2">
                {objections.map((obj, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <span>שאלה/התנגדות:</span>
                      <span className="text-slate-800 dark:text-slate-200">"{obj.objection}"</span>
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                      <span>{obj.rebuttal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
