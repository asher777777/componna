import React, { useState } from 'react';
import { 
  TrendingUp, BarChart2, Filter, RefreshCw, Layers, Plus, Database, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useCrmAnalyticsContext } from '../context/CrmAnalyticsContext';
import { Contact, DatabaseConnectionProfile } from '../types';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { AnalyticsChartsView } from './AnalyticsChartsView';
import { DynamicAnalyticsTable } from './DynamicAnalyticsTable';
import { AdvancedFilterDrawer } from './AdvancedFilterDrawer';
import { SavedViewsBar } from './SavedViewsBar';
import { Contact360Modal } from './Contact360Modal';
import { DatabaseConnectorModal } from './DatabaseConnectorModal';
import { FormSubmissionsTable } from '../../smart-form-builder/components/analytics/FormSubmissionsTable';
import { subscribeSmartForms } from '../../smart-form-builder/services/formStorageService';
import { SmartFormDefinition } from '../../smart-form-builder/types';
import { syncSmartFormSubmissionsToContacts } from '../services/smartFormCrmSyncService';
import { FileText, Users } from 'lucide-react';

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
    firebaseApp,
  } = useCrmAnalyticsContext();

  const [smartForms, setSmartForms] = useState<SmartFormDefinition[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [showCharts, setShowCharts] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [isSyncingForms, setIsSyncingForms] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Subscribe to smart forms
  React.useEffect(() => {
    const unsub = subscribeSmartForms((formsList) => {
      setSmartForms(formsList);
      if (formsList.length > 0 && !selectedFormId) {
        setSelectedFormId(formsList[0].id);
      }
    });
    return () => unsub();
  }, []);

  const handleSyncAllFormsToCrm = async () => {
    setIsSyncingForms(true);
    setSyncFeedback(null);
    try {
      const res = await syncSmartFormSubmissionsToContacts(firebaseApp);
      setSyncFeedback(`סנכרון חכם הושלם! ${res.totalProcessed} הגשות נסרקו (${res.createdCount} נוצרו כלידים, ${res.updatedCount} עודכנו).`);
      await refresh();
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: any) {
      setSyncFeedback('שגיאה במהלך הסנכרון');
    } finally {
      setIsSyncingForms(false);
    }
  };

  // Modal states
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [activeDbProfile, setActiveDbProfile] = useState<DatabaseConnectionProfile | null>(null);

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

  const handleOpenNewContact = () => {
    setSelectedContact({
      status: 'active',
      conta_name: '',
      conta_phone: '',
      email: '',
      tags: [],
    });
    setIsContactModalOpen(true);
  };

  const handleOpenContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (updated: Contact) => {
    if (updated.id) {
      Object.keys(updated).forEach(async key => {
        if (key !== 'id') {
          await updateField(updated.id!, key, (updated as any)[key]);
        }
      });
    }
    return true;
  };

  const handleApplyDbProfile = (profile: DatabaseConnectionProfile) => {
    setActiveDbProfile(profile);
    refresh();
  };

  const handleMetricClick = (metricId: string) => {
    if (activeMetric === metricId) {
      setActiveMetric(null);
      setFilter(prev => ({ ...prev, metricFilter: undefined }));
    } else {
      setActiveMetric(metricId);
      setFilter(prev => ({ ...prev, metricFilter: metricId }));
    }
  };

  const metricLabels: Record<string, string> = {
    contacts: 'כל אנשי הקשר והלידים',
    revenue: 'לקוחות משלמים (הכנסות)',
    campaigns: 'משתתפי קמפיינים ותרומות',
    communities: 'חברי קהילות וקבוצות',
    forms: 'הגשות טפסים חכמים',
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 max-w-7xl mx-auto w-full text-right" dir="rtl">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>לוח אנליטיקה ו-CRM</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            ניהול אנשי קשר ולידים, פילוח קהילות, מעקב הכנסות, וסנכרון טפסים
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Smart Sync Forms to CRM Button */}
          <button
            onClick={handleSyncAllFormsToCrm}
            disabled={isSyncingForms}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            title="סנכרן את כל הגשות הטפסים החכמים ישירות למאגר אנשי הקשר והלידים"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingForms ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
            <span>{isSyncingForms ? 'מסנכרן טפסים...' : 'סנכרון טפסים ל-CRM'}</span>
          </button>

          {/* Add Contact Button */}
          <button
            onClick={handleOpenNewContact}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>איש קשר חדש</span>
          </button>

          {/* Database Connector Hub */}
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>חיבור מסד נתונים (DB)</span>
          </button>

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

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncFeedback}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Summary Metric Cards (Interactive click filters) */}
      <AnalyticsSummaryCards
        data={data}
        loading={loading}
        onMetricClick={handleMetricClick}
        activeMetric={activeMetric}
        formsCountOverride={smartForms.length}
      />

      {/* Active Metric Filter Bar */}
      {activeMetric && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold">סינון פעיל:</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-200/60 dark:bg-indigo-900 font-semibold text-indigo-800 dark:text-indigo-200">
              {metricLabels[activeMetric] || activeMetric}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              (נמצאו {data?.contacts?.length || 0} תוצאות)
            </span>
          </div>
          <button
            onClick={() => handleMetricClick(activeMetric)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            ביטול סינון (הצג הכל)
          </button>
        </div>
      )}

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

      {/* If activeMetric is 'forms', show dedicated Smart Form Submissions inspector */}
      {activeMetric === 'forms' && (
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">טבלאות טפסים חכמים והגשות:</span>
              <select
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white"
              >
                {smartForms.length === 0 ? (
                  <option value="">לא נמצאו טפסים במערכת</option>
                ) : (
                  smartForms.map((sf) => (
                    <option key={sf.id} value={sf.id}>
                      {sf.title} ({sf.steps?.length || 0} שאלות)
                    </option>
                  ))
                )}
              </select>
            </div>
            {selectedFormId && (
              <span className="text-xs text-gray-400 font-mono">
                קולקציה: `mod_forms/{selectedFormId}/submissions`
              </span>
            )}
          </div>

          {smartForms.find((f) => f.id === selectedFormId) ? (
            <FormSubmissionsTable form={smartForms.find((f) => f.id === selectedFormId)!} />
          ) : (
            <div className="p-6 text-center text-xs text-gray-400">
              בחר טופס מהתפריט למעלה לצפייה בטבלת ההגשות.
            </div>
          )}
        </div>
      )}

      {/* Visual Charts */}
      {showCharts && data && (
        <AnalyticsChartsView
          data={data}
          onTagClick={handleTagClick}
          onCommunityClick={handleCommunityClick}
        />
      )}

      {/* Dynamic Data Table (Unified Contacts & Leads) */}
      <DynamicAnalyticsTable
        contacts={data?.contacts || []}
        columns={availableColumns}
        selectedColumnIds={selectedColumns}
        onToggleColumn={toggleColumn}
        onUpdateField={updateField}
        onSelectContact={handleOpenContact}
        loading={loading}
      />


      {/* Contact 360 & AI Copilot Modal */}
      <Contact360Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contact={selectedContact}
        onSave={handleSaveContact}
        customFields={data?.customFields || []}
      />

      {/* Database Connector Hub Modal */}
      <DatabaseConnectorModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onApplyProfile={handleApplyDbProfile}
      />
    </div>
  );
};
