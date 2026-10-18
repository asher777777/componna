import React from 'react';
import { Calendar, Sparkles, ArrowUpRight } from 'lucide-react';
import { DashboardHeaderConfig } from '../types';

export interface DashboardHeaderSectionProps {
  config: DashboardHeaderConfig;
  tenantName?: string;
}

export const DashboardHeaderSection: React.FC<DashboardHeaderSectionProps> = ({
  config,
  tenantName = 'דייר מערכת',
}) => {
  const today = new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs" dir="rtl">
      {/* Background glow */}
      <div className="absolute top-0 -left-10 w-56 h-56 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {config.showTenantBadge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                {tenantName}
              </span>
            )}
            {config.showDateRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {today}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {config.greetingPrefix || 'שלום'}, {tenantName} 👋
          </h2>

          {config.subtitle && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {(config.primaryActionText || config.secondaryActionText) && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {config.secondaryActionText && (
              <a
                href={config.secondaryActionUrl || '#'}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 transition shadow-xs"
              >
                {config.secondaryActionText}
              </a>
            )}
            {config.primaryActionText && (
              <a
                href={config.primaryActionUrl || '#'}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black shadow-md shadow-indigo-600/20 transition group"
              >
                <span>{config.primaryActionText}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
