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
  updateContactField,
  createContact as createContactService,
  computeAnalyticsMetrics
} from '../services/crmAnalyticsService';
import { eventBus } from '../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { LeadCaptureContract, LeadPayload, SYSTEM_COLLECTIONS } from '../../../core/contracts';
import { useTenantScope } from '../../../core/tenant';

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
  createContact: (contact: Partial<Contact>) => Promise<Contact>;
  firebaseApp?: FirebaseApp;
  ownerId?: string;
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
  customCollections,
  initialFilter = { status: 'active' },
}) => {
  const { tenantId, getScopedCollectionPath } = useTenantScope();

  const resolvedCollections = React.useMemo(() => ({
    contacts: customCollections?.contacts || getScopedCollectionPath(SYSTEM_COLLECTIONS.CONTACTS),
    leads: customCollections?.leads || getScopedCollectionPath('mod_crm_leads'),
    groups: customCollections?.groups || getScopedCollectionPath(SYSTEM_COLLECTIONS.GROUPS),
    customFields: customCollections?.customFields || getScopedCollectionPath('crm_custom_fields'),
    savedViews: customCollections?.savedViews || getScopedCollectionPath('crm_analytics_saved_views'),
    forms: customCollections?.forms || getScopedCollectionPath(SYSTEM_COLLECTIONS.SMART_FORMS),
    formSubmissionsSubcollection: customCollections?.formSubmissionsSubcollection || 'submissions',
  }), [customCollections, getScopedCollectionPath]);

  const [data, setData] = useState<CRMAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CRMAnalyticsFilter>(initialFilter);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_SELECTED_COLUMNS);
  const [savedViews, setSavedViews] = useState<SavedAnalyticsView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLiveCrmAnalytics(firebaseApp, ownerId, filter, resolvedCollections);
      setData(res);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, [firebaseApp, ownerId, filter, resolvedCollections]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen to Global EventBus for leads captured across other modules (e.g. PageBuilder, FlowPlayer)
  useEffect(() => {
    const unsubLead = eventBus.subscribe('crm:lead:created', (payload: LeadPayload) => {
      console.log('[CRM] Received lead from EventBus:', payload);
      setData(prev => {
        if (!prev) return null;
        const meta = payload.metadata || {};
        const isPayingCustomer = Boolean(meta.monthlyTotal || meta.annualTotal || meta.transactionId);
        const spent = Number(meta.annualTotal || meta.monthlyTotal || meta.total_spent || 0);

        const newContact: Contact = {
          id: `contact_${Date.now()}`,
          status: 'active',
          is_lead: !isPayingCustomer,
          contact_type: isPayingCustomer ? 'contact' : 'lead',
          conta_name: payload.conta_name,
          conta_phone: payload.conta_phone,
          email: payload.email,
          company_name: meta.businessName || meta.companyName || '',
          lead_source: payload.source || 'רכישת מערכת / אירוע חיצוני',
          tags: payload.tags || ['לקוח חדש'],
          community: payload.community || 'דיירי מערכת SaaS',
          total_spent: spent,
          order_count: isPayingCustomer ? 1 : 0,
          campaign_title: meta.billingPlan ? (meta.billingPlan === 'annual' ? 'מנוי שנתי (SaaS)' : 'מנוי חודשי (SaaS)') : undefined,
          campaign_amount: Number(meta.monthlyTotal || 0),
          last_form_name: meta.subdomain ? `רכישת סאב-דומיין (${meta.subdomain})` : undefined,
          last_form_submission_date: meta.purchasedAt || new Date().toISOString(),
          createdAt: meta.purchasedAt || new Date().toISOString(),
        };

        return {
          ...prev,
          totalContacts: prev.totalContacts + 1,
          totalContactsOnly: isPayingCustomer ? (prev.totalContactsOnly || 0) + 1 : (prev.totalContactsOnly || 0),
          totalLeads: !isPayingCustomer ? (prev.totalLeads || 0) + 1 : (prev.totalLeads || 0),
          totalSpent: (prev.totalSpent || 0) + spent,
          contacts: [newContact, ...prev.contacts],
        };
      });
    });

    const unsubForm = eventBus.subscribe('form:submitted', (payload) => {
      console.log('[CRM] Received form submission from EventBus:', payload);
      refresh();
    });

    const unsubSmartForm = eventBus.subscribe('smart_form:submitted', (payload) => {
      console.log('[CRM] Received smart form submission from EventBus:', payload);
      refresh();
    });

    const unsubDonation = eventBus.subscribe('campaign:donation:completed', (payload) => {
      console.log('[CRM Analytics] Received donation completed from EventBus:', payload);
      refresh();
    });

    return () => {
      unsubLead();
      unsubForm();
      unsubSmartForm();
      unsubDonation();
    };
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
    const ok = await updateContactField(firebaseApp, contactId, field, value, resolvedCollections);
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

  const createContact = async (contactData: Partial<Contact>) => {
    const newContact = await createContactService(firebaseApp, contactData, ownerId, resolvedCollections);
    setData(prev => {
      if (!prev) return computeAnalyticsMetrics([newContact], [], filter);
      const updatedContacts = [newContact, ...prev.contacts];
      return computeAnalyticsMetrics(updatedContacts, prev.customFields, filter);
    });
    return newContact;
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
        createContact,
        firebaseApp,
        ownerId,
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
