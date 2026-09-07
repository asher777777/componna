import React, { useState } from 'react';
import { 
  TrendingUp, BarChart2, Filter, RefreshCw, Layers 
} from 'lucide-react';
import { useCrmAnalyticsContext } from '../context/CrmAnalyticsContext';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { AnalyticsChartsView } from './AnalyticsChartsView';
import { DynamicAnalyticsTable } from './DynamicAnalyticsTable';
import { AdvancedFilterDrawer } from './AdvancedFilterDrawer';
import { SavedViewsBar } from './SavedViewsBar';

export const CrmAnalyticsMainView: React.FC = () => {
  const {
    data,
    loading,
    filter,
    setFilter,
    selectedColumns,
    setSelectedColumns,
    availableColumns,
    savedViews,
    activeViewId,
    saveCurrentView,
    loadView,
    deleteView,
    refresh,
    updateField,
  } = useCrmAnalyticsContext();

  const [showCharts, setShowCharts] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const toggleColumn = (colId: string) => {
    setSelectedColumns(prev => 
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const handleResetFilters = () => {
    setFilter({ status: 'active' });
    setActiveMetric(null);
  };

  const handleTagClick = (tag: string) => {
    setFilter(prev => ({ ...prev, tag: prev.tag === tag ? undefined : tag }));
  };

  const handleCommunityClick = (comm: string) => {
    setFilter(prev => ({ ...prev, community: prev.community === comm ? undefined : comm }));
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 max-w-7xl mx-auto w-full text-right" dir="rtl">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>לוח אנליטיקה ודוחות CRM</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            תובנות ביצועים, פילוח קהילות, מעקב הכנסות וטבלה דינמית מבוססת Firestore
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Charts */}
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`px-3 py-1.5 text-xs font-medium border rounded-lg flex items-center gap-1.5 transition ${
              showCharts 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>גרפים</span>
          </button>

          {/* Toggle Filter Panel */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-xs font-medium border rounded-lg flex items-center gap-1.5 transition ${
              showFilters 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>מסננים</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
            title="רענן נתונים"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Saved Views Bar */}
      <SavedViewsBar
        views={savedViews}
        activeViewId={activeViewId}
        onSelectView={loadView}
        onSaveView={saveCurrentView}
        onDeleteView={deleteView}
      />

      {/* Advanced Filter Drawer */}
      {showFilters && (
        <AdvancedFilterDrawer
          filter={filter}
          onChangeFilter={setFilter}
          data={data}
          onReset={handleResetFilters}
        />
      )}

      {/* KPI Cards */}
      <AnalyticsSummaryCards
        data={data}
        loading={loading}
        onMetricClick={setActiveMetric}
        activeMetric={activeMetric}
      />

      {/* Visual Charts */}
      {showCharts && data && (
        <AnalyticsChartsView
          data={data}
          onTagClick={handleTagClick}
          onCommunityClick={handleCommunityClick}
        />
      )}

      {/* Dynamic Data Table */}
      <DynamicAnalyticsTable
        contacts={data?.contacts || []}
        columns={availableColumns}
        selectedColumnIds={selectedColumns}
        onToggleColumn={toggleColumn}
        onUpdateField={updateField}
        loading={loading}
      />
    </div>
  );
};
