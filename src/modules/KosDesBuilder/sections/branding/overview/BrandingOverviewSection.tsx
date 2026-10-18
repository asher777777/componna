import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, ChevronDown, ChevronUp, Layers, Wand2 } from 'lucide-react';
import { useBrandingActionRunner } from '../common/useBrandingActionRunner';
import { BrandingActionType } from '../common/types';

export interface BrandingOverviewConfig {
  title?: string;
  completenessScore?: number;
  statusText?: string;
  recommendations?: string[];
  primaryButtonText?: string;
  primaryButtonAction?: BrandingActionType;
  primaryButtonPayload?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: BrandingActionType;
  secondaryButtonPayload?: string;
}

export const BrandingOverviewSection: React.FC<{ config: BrandingOverviewConfig }> = ({ config }) => {
  const { runAction } = useBrandingActionRunner();
  const [isExpanded, setIsExpanded] = useState(false);

  const title = config.title || 'מבט-על: שלמות אפיון המותג והמלצות AI';
  const score = config.completenessScore ?? 85;
  const isComplete = score >= 80;
  const status = config.statusText || (isComplete ? 'אפיון המותג מוכן לשיגור פעילות מלאה' : 'נדרשת השלמת פרטי מותג ליבה');
  const recommendations = config.recommendations || [
    'הגדר את פלטת הצבעים המדויקת של המותג',
    'הוסף 2 מוצרי דגל עם תמחור מוגדר',
    'חבר את מספר הח.פ והכתובת המשפטית לתחתית העמודים',
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-right relative overflow-hidden" dir="rtl">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Primary Action */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ציון שלמות ה-Brand DNA, חוסרים מזוהים והפעלת כלי בינה מלאכותית
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
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{config.primaryButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Score & Progress Bar - Rule 7 */}
      <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{score}%</span>
            <span className="text-xs font-bold text-slate-500">ציון שלמות</span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isComplete ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}`}>
            {status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>

      {/* Quick Navigation Chips to Sections */}
      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { id: 'identity', label: 'זהות עסקית' },
          { id: 'voice', label: 'שפת מותג וטון' },
          { id: 'audience', label: 'קהלי יעד ובידול' },
          { id: 'ecosystem', label: 'מבנה שירותים' },
          { id: 'design', label: 'שפה חזותית' },
          { id: 'trust', label: 'אמינות וסליקה' },
          { id: 'market', label: 'מחקר שוק AI' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => runAction('switch_tab', tab.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition cursor-pointer flex items-center gap-1"
          >
            <span>{tab.label}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />
          </button>
        ))}
      </div>

      {/* Rule 7: Expandable Recommendations */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isExpanded ? 'הסתר המלצות להשלמה' : `הצג ${recommendations.length} המלצות להשלמת ציון המותג`}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-2 animate-in fade-in duration-200">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
