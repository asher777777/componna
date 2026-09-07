import React from 'react';
import { Users, DollarSign, Target, Globe, FileSpreadsheet } from 'lucide-react';
import { CRMAnalyticsData } from '../types';

interface Props {
  data: CRMAnalyticsData | null;
  loading: boolean;
  onMetricClick?: (metric: string) => void;
  activeMetric?: string | null;
}

export const AnalyticsSummaryCards: React.FC<Props> = ({
  data,
  loading,
  onMetricClick,
  activeMetric,
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

  const cards = [
    {
      id: 'contacts',
      label: 'סה"כ אנשי קשר',
      value: data.totalContacts.toLocaleString('he-IL'),
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'revenue',
      label: 'סה"כ הכנסות (₪)',
      value: `₪${data.totalSpent.toLocaleString('he-IL')}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      id: 'campaigns',
      label: 'גיוס בקמפיינים',
      value: `₪${data.totalCampaignAmount.toLocaleString('he-IL')}`,
      icon: Target,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      id: 'communities',
      label: 'קהילות / קבוצות',
      value: Object.keys(data.communitiesCount).length.toString(),
      icon: Globe,
      color: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: 'forms',
      label: 'טפסים פעילים',
      value: Object.keys(data.formsCount).length.toString(),
      icon: FileSpreadsheet,
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgLight: 'bg-rose-50 dark:bg-rose-900/20',
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
            onClick={() => onMetricClick?.(c.id)}
            className={`flex items-center justify-between p-4 rounded-xl border text-right transition-all duration-200 ${
              isActive 
                ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' 
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md'
            }`}
          >
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{c.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{c.value}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${c.bgLight}`}>
              <Icon className={`w-5 h-5 ${c.textColor}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
};
