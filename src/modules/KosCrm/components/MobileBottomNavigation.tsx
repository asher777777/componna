import React from 'react';
import { Users, Flame, BarChart2, Filter, Layers } from 'lucide-react';

interface Props {
  activeTab: 'all' | 'leads' | 'charts' | 'filters';
  onChangeTab: (tab: 'all' | 'leads' | 'charts' | 'filters') => void;
  leadsCount: number;
  totalCount: number;
}

export const MobileBottomNavigation: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  leadsCount,
  totalCount,
}) => {
  return (
    <div 
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-3 py-1 flex items-center justify-around shadow-lg"
      dir="rtl"
    >
      {/* 1. All Customers */}
      <button
        onClick={() => onChangeTab('all')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
          activeTab === 'all'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">הלקוחות</span>
      </button>

      {/* 2. Hot Leads */}
      <button
        onClick={() => onChangeTab('leads')}
        className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
          activeTab === 'leads'
            ? 'text-amber-600 dark:text-amber-400 font-bold'
            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        <Flame className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">לידים חמים</span>
        {leadsCount > 0 && (
          <span className="absolute top-1 right-2 px-1 py-0.2 rounded-full text-[9px] bg-amber-500 text-white font-extrabold">
            {leadsCount}
          </span>
        )}
      </button>

      {/* 3. Quick Reports / Charts */}
      <button
        onClick={() => onChangeTab('charts')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
          activeTab === 'charts'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        <BarChart2 className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">דוחות</span>
      </button>

      {/* 4. Search and Filters */}
      <button
        onClick={() => onChangeTab('filters')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
          activeTab === 'filters'
            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        <Filter className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">סינון</span>
      </button>
    </div>
  );
};
