import React, { useState } from 'react';
import { Globe, TrendingUp, Lightbulb, ChevronDown, ChevronUp, Sparkles, Wand2, CheckCircle2 } from 'lucide-react';
import { useBrandingActionRunner } from '../common/useBrandingActionRunner';
import { BrandingActionType } from '../common/types';

export interface MarketOpportunity {
  title: string;
  impact: string;
  recommendation: string;
}

export interface BrandingMarketConfig {
  title?: string;
  competitors?: string[];
  opportunities?: MarketOpportunity[];
  topInsight?: string;
  lastResearchDate?: string;
  primaryButtonText?: string;
  primaryButtonAction?: BrandingActionType;
  primaryButtonPayload?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: BrandingActionType;
  secondaryButtonPayload?: string;
}

export const BrandingMarketSection: React.FC<{ config: BrandingMarketConfig }> = ({ config }) => {
  const { runAction } = useBrandingActionRunner();
  const [isExpanded, setIsExpanded] = useState(false);

  const title = config.title || 'סוכן מחקר שוק, מתחרים ובידול (AI)';
  const topInsight = config.topInsight || 'זוהתה הזדמנות בידול במענה ממוקד לעסקים בינוניים הדורשים אוטומציה היברידית';
  const competitors = config.competitors || ['מתחרה א׳ בע״מ', 'חברת פתרונות דיגיטליים ב׳', 'סוכנות שיווק ג׳'];
  const opportunities = config.opportunities || [
    { title: 'חבילת מנוי חודשי', impact: 'גבוה (MRR יציב)', recommendation: 'להשיק חבילת ריטיינר קבועה' },
    { title: 'שירות תמיכה 24/7', impact: 'בינוני', recommendation: 'שילוב בוט מענה אוטומטי ללידים בלילה' },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-right relative overflow-hidden" dir="rtl">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Primary Action */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              סוכן אוטונומי המנתח מגמות שוק, תמחור מתחרים ומזהה הזדמנויות צמיחה
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
              onClick={() => runAction(config.primaryButtonAction || 'run_market_agent', config.primaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{config.primaryButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Top Insight Card - Rule 7 */}
      <div className="mt-6 p-4.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
            תובנת שוק מרכזית של ה-AI
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {topInsight}
          </p>
        </div>
      </div>

      {/* Competitors Tags */}
      <div className="mt-5 space-y-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          מתחרים מרכזיים במעקב ({competitors.length}):
        </span>
        <div className="flex flex-wrap gap-2">
          {competitors.map((comp, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {comp}
            </span>
          ))}
        </div>
      </div>

      {/* Rule 7: Expandable Opportunities */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isExpanded ? 'הסתר פירוט הזדמנויות' : `הצג ${opportunities.length} הזדמנויות צמיחה והמלצות פעולה`}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3 animate-in fade-in duration-200">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{opp.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                      אימפקט: {opp.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {opp.recommendation}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
