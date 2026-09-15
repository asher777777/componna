import React from 'react';
import { Users, DollarSign, Target, Globe, FileSpreadsheet } from 'lucide-react';
import { CRMAnalyticsData } from '../types';

interface Props {
  data: CRMAnalyticsData | null;
  loading: boolean;
  onMetricClick?: (metric: string) => void;
  activeMetric?: string | null;
  formsCountOverride?: number;
}

export const AnalyticsSummaryCards: React.FC<Props> = ({
  data,
  loading,
  onMetricClick,
  activeMetric,
  formsCountOverride,
}) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    );
  }

  const formsTotal = formsCountOverride !== undefined 
    ? formsCountOverride 
    : Math.max(Object.keys(data.formsCount).length, 0);

  const cards = [
    {
      id: 'contacts',
      label: 'סה"כ אנשי קשר ולידים',
      value: data.totalContacts.toLocaleString('he-IL'),
      subtext: `${data.totalContactsOnly || 0} אנשי קשר • ${data.totalLeads || 0} לידים`,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      borderActive: 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/40 dark:bg-blue-950/30',
    },
    {
      id: 'revenue',
      label: 'סה"כ הכנסות (₪)',
      value: `₪${data.totalSpent.toLocaleString('he-IL')}`,
      subtext: 'רכישות ועסקאות',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/30',
    },
    {
      id: 'campaigns',
      label: 'גיוס בקמפיינים',
      value: `₪${data.totalCampaignAmount.toLocaleString('he-IL')}`,
      subtext: 'תרומות ושגרירים',
      icon: Target,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/40 dark:bg-amber-950/30',
    },
    {
      id: 'communities',
      label: 'קהילות / קבוצות',
      value: Object.keys(data.communitiesCount).length.toString(),
      subtext: 'קבוצות פעילות',
      icon: Globe,
      color: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      borderActive: 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-50/40 dark:bg-purple-950/30',
    },
    {
      id: 'forms',
      label: 'טפסים פעילים',
      value: formsTotal.toLocaleString('he-IL'),
      subtext: `${formsTotal} טפסים במערכת`,
      icon: FileSpreadsheet,
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgLight: 'bg-rose-50 dark:bg-rose-900/20',
      borderActive: 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/40 dark:bg-rose-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map(c => {
        const Icon = c.icon;
        const isActive = activeMetric === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onMetricClick?.(c.id)}
            className={`flex flex-col justify-between p-3.5 rounded-xl border text-right transition-all duration-200 cursor-pointer text-right group select-none relative overflow-hidden ${
              isActive 
                ? c.borderActive + ' shadow-md scale-[1.01]' 
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:-translate-y-0.5'
            }`}
            title={`לחץ לסינון נתונים לפי ${c.label}`}
          >
            {/* Top row: Label + Icon */}
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">{c.label}</p>
                <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">{c.value}</p>
              </div>
              <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 flex-shrink-0 ${c.bgLight}`}>
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${c.textColor}`} />
              </div>
            </div>

            {/* Bottom Row: Subtext / Interactive hint */}
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between w-full text-[11px]">
              <span className="text-gray-400 dark:text-gray-500 truncate">{c.subtext}</span>
              <span className={`font-bold transition ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-400 group-hover:text-indigo-500 opacity-80 group-hover:opacity-100'
              }`}>
                {isActive ? 'פעיל ✓' : 'לסינון 👆'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
