import React, { useState } from 'react';
import { 
  TrendingUp, BarChart2, Filter, RefreshCw, Layers, Plus, Database 
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
  } = useCrmAnalyticsContext();

  const [mainTab, setMainTab] = useState<'contacts' | 'forms'>('contacts');
  const [smartForms, setSmartForms] = useState<SmartFormDefinition[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [showCharts, setShowCharts] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

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
            תובנות ביצועים, פרופיל לקוח 360 AI, פילוח קהילות, וחיבור למסדי נתונים
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Tab Switcher: Contacts CRM vs Smart Forms */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl gap-1">
        <button
          onClick={() => setMainTab('contacts')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
            mainTab === 'contacts'
              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>אנשי קשר ולידים ({data?.contacts?.length || 0})</span>
        </button>
        <button
          onClick={() => setMainTab('forms')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
            mainTab === 'forms'
              ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>טבלאות טפסים חכמים ({smartForms.length})</span>
        </button>
      </div>

      {mainTab === 'contacts' ? (
        <>
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
            onSelectContact={handleOpenContact}
            loading={loading}
          />
        </>
      ) : (
        /* Smart Form Submissions Dedicated View */
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">בחר טופס לצפייה בטבלת ההגשות:</span>
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
            <div className="p-12 text-center text-gray-400">
              בחר טופס מהתפריט למעלה לצפייה בטבלת ההגשות והאנליטיקה שלו.
            </div>
          )}
        </div>
      )}


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
