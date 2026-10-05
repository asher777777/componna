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
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { FormBuilderContract, FormItemSummary } from '../../../core/contracts';
import { syncSmartFormSubmissionsToContacts } from '../services/smartFormCrmSyncService';
import { getFirestore, collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { FileText, Users, AlertCircle, Camera } from 'lucide-react';
import { MobileQuickActionsFab } from './MobileQuickActionsFab';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { BusinessCardScannerModal } from './BusinessCardScannerModal';
import { CrmWhatsAppBulkSenderModal } from './CrmWhatsAppBulkSenderModal';

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
    createContact,
    firebaseApp,
    ownerId,
  } = useCrmAnalyticsContext();

  const { getCapability, hasCapability } = useHostCapabilities();
  const formCapability = getCapability<FormBuilderContract>('form-builder');
  const hasFormModule = hasCapability('form-builder');

  const [smartForms, setSmartForms] = useState<FormItemSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [showCharts, setShowCharts] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [isSyncingForms, setIsSyncingForms] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Subscribe to forms: first try HostCapabilities, or Firestore fallback
  React.useEffect(() => {
    let unsub = () => {};

    if (formCapability?.getForms) {
      formCapability.getForms().then((formsList) => {
        setSmartForms(formsList);
        if (formsList.length > 0 && !selectedFormId) {
          setSelectedFormId(formsList[0].id);
        }
      }).catch(err => console.warn('Error fetching forms via capability:', err));
    } else if (firebaseApp) {
      try {
        const db = getFirestore(firebaseApp);
        const formsColl = collection(db, 'mod_forms');
        const q = ownerId 
          ? query(formsColl, where('ownerId', '==', ownerId)) 
          : query(formsColl, orderBy('updatedAt', 'desc'));

        unsub = onSnapshot(q, (snap) => {
          const list: FormItemSummary[] = snap.docs.map(d => ({
            id: d.id,
            title: d.data().title || d.id,
            submissionsCount: d.data().submissionsCount || 0,
          }));
          setSmartForms(list);
          if (list.length > 0 && !selectedFormId) {
            setSelectedFormId(list[0].id);
          }
        }, (err) => console.warn('Forms Firestore fallback snapshot err:', err));
      } catch (err) {
        console.warn('Could not set up Firestore forms subscription:', err);
      }
    }

    return () => unsub();
  }, [formCapability, firebaseApp, ownerId]);

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
  const [isCardScannerOpen, setIsCardScannerOpen] = useState(false);
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false);
  const [mobileActiveNavTab, setMobileActiveNavTab] = useState<'all' | 'leads' | 'charts' | 'filters'>('all');

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
      for (const key of Object.keys(updated)) {
        if (key !== 'id') {
          await updateField(updated.id, key, (updated as any)[key]);
        }
      }
    } else {
      await createContact(updated);
    }
    setIsContactModalOpen(false);
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

          {/* Scan Business Card Button */}
          <button
            onClick={() => setIsCardScannerOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            title="סרוק כרטיס ביקור במצלמה וחלוץ נתונים אוטומטית ב-AI"
          >
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">סריקת כרטיס ביקור (AI)</span>
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
                      {sf.title} {sf.submissionsCount !== undefined ? `(${sf.submissionsCount} הגשות)` : ''}
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

          {selectedFormId ? (
            formCapability?.renderSubmissionsTable ? (
              formCapability.renderSubmissionsTable(selectedFormId, smartForms.find(f => f.id === selectedFormId)?.title)
            ) : (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  טופס נבחר: {smartForms.find(f => f.id === selectedFormId)?.title || selectedFormId}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  רכיב תצוגת הטפסים המלאה (smart-form-builder) אינו מוטמע בחבילה זו או לא נטען. כל ההגשות והלידים מסונכרנים ומנוהלים אוטומטית בטבלת אנשי הקשר הראשית למטה.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleSyncAllFormsToCrm}
                    disabled={isSyncingForms}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingForms ? 'animate-spin' : ''}`} />
                    <span>סנכרן הגשות טופס זה ל-CRM עכשיו</span>
                  </button>
                </div>
              </div>
            )
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

      {/* Business Card AI Vision Scanner Modal */}
      <BusinessCardScannerModal
        isOpen={isCardScannerOpen}
        onClose={() => setIsCardScannerOpen(false)}
        onSaveContact={async (cardContact) => {
          await createContact(cardContact);
          refresh();
        }}
      />

      {/* Bulk WhatsApp Sender Modal */}
      <CrmWhatsAppBulkSenderModal
        isOpen={isBulkWhatsAppOpen}
        onClose={() => setIsBulkWhatsAppOpen(false)}
        selectedContacts={data?.contacts || []}
      />

      {/* Mobile-First: Quick Actions Floating Action Button (FAB) */}
      <MobileQuickActionsFab
        onNewContact={handleOpenNewContact}
        onOpenBulkWhatsApp={() => setIsBulkWhatsAppOpen(true)}
        onOpenCardScanner={() => setIsCardScannerOpen(true)}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        selectedCount={0}
      />

      {/* Mobile-First: Thumb-Friendly Bottom Navigation Bar */}
      <MobileBottomNavigation
        activeTab={mobileActiveNavTab}
        onChangeTab={(tab) => {
          setMobileActiveNavTab(tab);
          if (tab === 'all') {
            setFilter(prev => ({ ...prev, status: 'active', metricFilter: undefined }));
            setActiveMetric(null);
          } else if (tab === 'leads') {
            setFilter(prev => ({ ...prev, metricFilter: undefined }));
            setActiveMetric(null);
          } else if (tab === 'charts') {
            setShowCharts(true);
            window.scrollTo({ top: 300, behavior: 'smooth' });
          } else if (tab === 'filters') {
            setShowFilters(true);
          }
        }}
        leadsCount={data?.totalLeads || 0}
        totalCount={data?.totalContacts || 0}
      />
    </div>
  );
};
