import React from 'react';
import { Filter, Calendar, Tag, Globe, RefreshCw, X } from 'lucide-react';
import { CRMAnalyticsFilter, CRMAnalyticsData } from '../types';

interface Props {
  filter: CRMAnalyticsFilter;
  onChangeFilter: (newFilter: CRMAnalyticsFilter) => void;
  data: CRMAnalyticsData | null;
  onReset: () => void;
}

export const AdvancedFilterDrawer: React.FC<Props> = ({
  filter,
  onChangeFilter,
  data,
  onReset,
}) => {
  const tags = data ? Object.keys(data.tagsCount) : [];
  const communities = data ? Object.keys(data.communitiesCount) : [];
  const sources = data ? Object.keys(data.leadSourcesCount) : [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs">
      <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
          <Filter className="w-4 h-4 text-indigo-500" />
          <span>מסננים מתקדמים</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-gray-500 hover:text-rose-500 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>איפוס מסננים</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Date Range Start */}
        <div>
          <label className="block text-gray-500 mb-1">מתאריך</label>
          <input
            type="date"
            value={filter.startDate || ''}
            onChange={(e) => onChangeFilter({ ...filter, startDate: e.target.value })}
            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="block text-gray-500 mb-1">עד תאריך</label>
          <input
            type="date"
            value={filter.endDate || ''}
            onChange={(e) => onChangeFilter({ ...filter, endDate: e.target.value })}
            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Tag Filter */}
        <div>
          <label className="block text-gray-500 mb-1">תגית</label>
          <select
            value={filter.tag || ''}
            onChange={(e) => onChangeFilter({ ...filter, tag: e.target.value || undefined })}
            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">כל התגיות</option>
            {tags.map(t => (
              <option key={t} value={t}>{t} ({data?.tagsCount[t]})</option>
            ))}
          </select>
        </div>

        {/* Community Filter */}
        <div>
          <label className="block text-gray-500 mb-1">קבוצה / קהילה</label>
          <select
            value={filter.community || ''}
            onChange={(e) => onChangeFilter({ ...filter, community: e.target.value || undefined })}
            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">כל הקהילות</option>
            {communities.map(c => (
              <option key={c} value={c}>{c} ({data?.communitiesCount[c]})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
