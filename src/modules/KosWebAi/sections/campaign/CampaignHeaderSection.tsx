import React from 'react';
import { CampaignHeaderSectionConfig } from '../../types/sectionConfigs';
import { Target, TrendingUp, Users, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const CampaignHeaderSection: React.FC<{ config: CampaignHeaderSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title,
    subtitle,
    targetGoal = 100000,
    totalRaised = 64500,
    donorsCount = 184,
    daysLeft = 14,
    backgroundColor = 'transparent',
    accentColor = '#4f46e5',
  } = config;

  const percentage = Math.min(Math.round((totalRaised / (targetGoal || 1)) * 100), 100);

  return (
    <section
      id={anchorId || 'campaignHeader'}
      className="w-full py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="text-center max-w-2xl mx-auto mb-8 flex flex-col items-center gap-2">
          {subtitle && (
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {subtitle}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
        </div>

        {/* Progress Display */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-baseline justify-between text-slate-900 dark:text-white">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400">
                ₪{totalRaised.toLocaleString()}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">שגויסו עד כה</span>
            </div>
            <div className="text-left">
              <span className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">
                יעד: ₪{targetGoal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>{percentage}% הושלמו מהיעד</span>
            <span>נותרו ₪{Math.max(0, targetGoal - totalRaised).toLocaleString()} לסיום הקמפיין</span>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50">
            <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-1" />
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{donorsCount}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">תורמים שהצטרפו</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50">
            <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400 mb-1" />
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{daysLeft}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">ימים לסיום</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50">
            <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mb-1" />
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{percentage}%</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">אחוז הצלחה</span>
          </div>
        </div>
      </div>
    </section>
  );
};
