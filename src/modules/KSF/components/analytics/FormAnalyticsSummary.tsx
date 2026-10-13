import React from 'react';
import { FormAnalyticsStats } from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { Eye, Play, Send, TrendingUp, Clock } from 'lucide-react';

export interface FormAnalyticsSummaryProps {
  stats: FormAnalyticsStats | null;
}

export const FormAnalyticsSummary: React.FC<FormAnalyticsSummaryProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* Views */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold">סך צפיות</span>
          <Eye className="w-4 h-4 text-slate-500" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {stats.totalViews.toLocaleString('he-IL')}
        </div>
      </div>

      {/* Starts */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between text-amber-500">
          <span className="text-xs font-semibold text-slate-400">התחילו מילוי</span>
          <Play className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {stats.totalStarts.toLocaleString('he-IL')}
        </div>
      </div>

      {/* Submissions */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between text-emerald-500">
          <span className="text-xs font-semibold text-slate-400">הגשות שהושלמו</span>
          <Send className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {stats.totalSubmissions.toLocaleString('he-IL')}
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between text-amber-500">
          <span className="text-xs font-semibold text-slate-400">שיעור המרה</span>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
          {stats.completionRate}%
        </div>
      </div>

      {/* Avg Duration */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold">זמן מילוי ממוצע</span>
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {stats.averageCompletionSeconds > 0 ? `${stats.averageCompletionSeconds} שנ'` : '-'}
        </div>
      </div>
    </div>
  );
};
