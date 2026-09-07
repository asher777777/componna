import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FirebaseApp } from 'firebase/app';
import { 
  Contact, 
  CRMAnalyticsFilter, 
  CRMAnalyticsData, 
  CustomField, 
  DynamicColumn, 
  SavedAnalyticsView 
} from '../types';
import { 
  DEFAULT_COLLECTIONS, 
  CORE_COLUMNS, 
  DEFAULT_SELECTED_COLUMNS 
} from '../config';
import { 
  fetchLiveCrmAnalytics, 
  updateContactField 
} from '../services/crmAnalyticsService';

interface CrmAnalyticsContextValue {
  data: CRMAnalyticsData | null;
  loading: boolean;
  filter: CRMAnalyticsFilter;
  setFilter: React.Dispatch<React.SetStateAction<CRMAnalyticsFilter>>;
  selectedColumns: string[];
  setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>;
  availableColumns: DynamicColumn[];
  savedViews: SavedAnalyticsView[];
  activeViewId: string | null;
  saveCurrentView: (name: string) => void;
  loadView: (view: SavedAnalyticsView) => void;
  deleteView: (viewId: string) => void;
  refresh: () => Promise<void>;
  updateField: (contactId: string, field: string, value: any) => Promise<boolean>;
  firebaseApp?: FirebaseApp;
}

const CrmAnalyticsContext = createContext<CrmAnalyticsContextValue | null>(null);

export interface CrmAnalyticsProviderProps {
  children: React.ReactNode;
  firebaseApp?: FirebaseApp;
  ownerId?: string;
  customCollections?: typeof DEFAULT_COLLECTIONS;
  initialFilter?: CRMAnalyticsFilter;
}

export const CrmAnalyticsProvider: React.FC<CrmAnalyticsProviderProps> = ({
  children,
  firebaseApp,
  ownerId,
  customCollections = DEFAULT_COLLECTIONS,
  initialFilter = { status: 'active' },
}) => {
  const [data, setData] = useState<CRMAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CRMAnalyticsFilter>(initialFilter);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_SELECTED_COLUMNS);
  const [savedViews, setSavedViews] = useState<SavedAnalyticsView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLiveCrmAnalytics(firebaseApp, ownerId, filter, customCollections);
      setData(res);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, [firebaseApp, ownerId, filter, customCollections]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Merge core columns with custom fields from dataset
  const availableColumns: DynamicColumn[] = React.useMemo(() => {
    const cols = [...CORE_COLUMNS];
    if (data?.customFields) {
      data.customFields.forEach(cf => {
        if (!cols.some(c => c.id === cf.id)) {
          cols.push({
            id: cf.id,
            label: cf.label || cf.id,
            category: 'custom',
            isNumeric: cf.type === 'number',
            isDate: cf.type === 'date',
          });
        }
      });
    }
    return cols;
  }, [data?.customFields]);

  const updateField = async (contactId: string, field: string, value: any) => {
    const ok = await updateContactField(firebaseApp, contactId, field, value, customCollections);
    if (ok) {
      setData(prev => {
        if (!prev) return null;
        const updated = prev.contacts.map(c => c.id === contactId ? { ...c, [field]: value } : c);
        return { ...prev, contacts: updated };
      });
    }
    return ok;
  };

  const saveCurrentView = (name: string) => {
    const newView: SavedAnalyticsView = {
      id: `view_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      selectedColumns,
      filters: {
        startDate: filter.startDate,
        endDate: filter.endDate,
        dataSource: 'contacts',
        status: filter.status || 'active',
        tags: filter.tag ? [filter.tag] : [],
        community: filter.community,
        leadSource: filter.source,
        formName: filter.form,
      }
    };
    setSavedViews(prev => [...prev, newView]);
    setActiveViewId(newView.id);
  };

  const loadView = (view: SavedAnalyticsView) => {
    setSelectedColumns(view.selectedColumns);
    setFilter({
      startDate: view.filters.startDate,
      endDate: view.filters.endDate,
      status: view.filters.status,
      tag: view.filters.tags?.[0],
      community: view.filters.community,
      source: view.filters.leadSource,
      form: view.filters.formName,
    });
    setActiveViewId(view.id);
  };

  const deleteView = (viewId: string) => {
    setSavedViews(prev => prev.filter(v => v.id !== viewId));
    if (activeViewId === viewId) setActiveViewId(null);
  };

  return (
    <CrmAnalyticsContext.Provider
      value={{
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
      }}
    >
      {children}
    </CrmAnalyticsContext.Provider>
  );
};

export const useCrmAnalyticsContext = () => {
  const ctx = useContext(CrmAnalyticsContext);
  if (!ctx) {
    throw new Error('useCrmAnalyticsContext must be used within a CrmAnalyticsProvider');
  }
  return ctx;
};
