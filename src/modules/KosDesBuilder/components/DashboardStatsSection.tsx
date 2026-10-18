import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  MessageSquare,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { DashboardStatsConfig, DashboardStatItem } from '../types';

export interface DashboardStatsSectionProps {
  config: DashboardStatsConfig;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  MessageSquare,
  Activity,
  CheckCircle2,
  DollarSign,
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
  emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  rose: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  blue: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  purple: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
};

export const DashboardStatsSection: React.FC<DashboardStatsSectionProps> = ({ config }) => {
  const cols = config.columns || 4;
  const gridClass =
    cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : cols === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-4 sm:gap-6`} dir="rtl">
      {config.stats.map((stat: DashboardStatItem) => {
        const IconComponent = (stat.icon && ICON_MAP[stat.icon]) || Activity;
        const color = COLOR_CLASSES[stat.color || 'indigo'] || COLOR_CLASSES.indigo;

        return (
          <div
            key={stat.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
              </div>

              <div className={`p-3 rounded-2xl ${color.bg} ${color.text} border ${color.border} shrink-0 transition-transform group-hover:scale-105`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {stat.change && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    stat.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {stat.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.change}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">לעומת חודש קודם</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
