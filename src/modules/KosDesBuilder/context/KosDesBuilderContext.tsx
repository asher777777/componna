import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Firestore } from 'firebase/firestore';
import {
  DashboardPageDocument,
  DashboardSection,
  DashboardSectionType,
  BuilderPreviewDevice,
} from '../types';
import { INITIAL_DASHBOARD, DEFAULT_DASHBOARD_SECTIONS } from '../config';
import { dashboardFirestore } from '../services/dashboardFirestore';

interface KosDesBuilderContextType {
  currentDashboard: DashboardPageDocument;
  savedDashboards: DashboardPageDocument[];
  selectedSectionId: string | null;
  previewDevice: BuilderPreviewDevice;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setSelectedSectionId: (id: string | null) => void;
  setPreviewDevice: (device: BuilderPreviewDevice) => void;
  updateDashboardTitle: (title: string, description?: string) => void;
  addSection: (type: DashboardSectionType, customTitle?: string) => void;
  updateSection: (sectionId: string, updates: Partial<DashboardSection>) => void;
  removeSection: (sectionId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  toggleSectionMobileHidden: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  saveCurrentDashboard: () => Promise<boolean>;
  selectDashboard: (dashboardId: string) => void;
  createNewDashboard: () => void;
}

const KosDesBuilderContext = createContext<KosDesBuilderContextType | undefined>(undefined);

export interface KosDesBuilderProviderProps {
  children: React.ReactNode;
  db?: Firestore | null;
  tenantId?: string;
}

export const KosDesBuilderProvider: React.FC<KosDesBuilderProviderProps> = ({
  children,
  db,
  tenantId = '_master',
}) => {
  const [currentDashboard, setCurrentDashboard] = useState<DashboardPageDocument>(INITIAL_DASHBOARD);
  const [savedDashboards, setSavedDashboards] = useState<DashboardPageDocument[]>([INITIAL_DASHBOARD]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<BuilderPreviewDevice>('desktop');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboards on mount or tenantId change
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const list = await dashboardFirestore.getDashboards(db, tenantId);
        if (isMounted) {
          setSavedDashboards(list);
          if (list.length > 0) {
            setCurrentDashboard(list[0]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[KosDesBuilderContext] Failed loading dashboards:', err);
          setError('שגיאה בטעינת לוחות הבקרה. נטענו נתוני ברירת מחדל.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [db, tenantId]);

  const updateDashboardTitle = useCallback((title: string, description?: string) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      title,
      description: description !== undefined ? description : prev.description,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addSection = useCallback((type: DashboardSectionType, customTitle?: string) => {
    const id = `sec-${type}-${Date.now().toString(36)}`;
    let initialConfig: any = {};

    switch (type) {
      case 'header':
        initialConfig = {
          greetingPrefix: 'שלום וברוך הבא',
          showDateRange: true,
          showTenantBadge: true,
          primaryActionText: 'פעולה חדשה',
          subtitle: 'לוח בקרה מעודכן',
        };
        break;
      case 'stats':
        initialConfig = {
          columns: 4,
          stats: [
            { id: 'st-1', label: 'פניות חדשות', value: '24', change: '+5%', isPositive: true, icon: 'Users', color: 'indigo' },
            { id: 'st-2', label: 'הכנסות', value: '₪12,400', change: '+10%', isPositive: true, icon: 'TrendingUp', color: 'emerald' },
          ],
        };
        break;
      case 'table':
        initialConfig = {
          title: customTitle || 'טבלת נתונים',
          subtitle: 'רשומות מעודכנות',
          collectionName: 'contacts',
          sourceModule: 'crm-analytics',
          pageSize: 5,
          showSearch: true,
          showExport: true,
          emptyStateText: 'אין נתונים להצגה',
          columns: [
            { key: 'name', label: 'שם', sortable: true, type: 'text' },
            { key: 'phone', label: 'טלפון', sortable: false, type: 'text' },
            { key: 'status', label: 'סטטוס', sortable: true, type: 'badge' },
          ],
        };
        break;
      case 'quickActions':
        initialConfig = {
          title: 'פעולות מהירות',
          layout: 'row',
          buttons: [
            { id: 'btn-1', label: 'איש קשר חדש', icon: 'UserPlus', variant: 'primary', actionType: 'navigate', target: '/contacts' },
            { id: 'btn-2', label: 'שליחת הודעה', icon: 'Send', variant: 'outline', actionType: 'navigate', target: '/whatsapp-hub' },
          ],
        };
        break;
      case 'floatingDock':
        initialConfig = {
          dockPosition: 'bottom',
          showLabels: true,
          items: [
            { id: 'd-1', label: 'ראשי', icon: 'LayoutDashboard', targetUrl: '/dashboard' },
            { id: 'd-2', label: 'לקוחות', icon: 'Users', targetUrl: '/contacts' },
          ],
        };
        break;
      case 'commandMatrix':
        initialConfig = {
          title: 'מרכז שליטה ורכיבי מערכת',
          subtitle: 'גישה ישירה ומודולרית',
          columns: 3,
          items: [
            { id: 'cm-1', title: 'אנליטיקה ו-CRM', subtitle: 'ניהול לידים וכרטיסי לקוח', icon: 'Users', moduleId: 'crm-analytics', targetUrl: '/crm-analytics', badge: 'פעיל' },
            { id: 'cm-2', title: 'סליקה וחיובים', subtitle: 'עסקאות אשראי והוראות קבע', icon: 'CreditCard', moduleId: 'kesher-payments-hub', targetUrl: '/kesher-payments', badge: 'פעיל' },
          ],
        };
        break;
      case 'slotWidget':
        initialConfig = {
          slotName: 'dashboard-custom-widget',
          title: 'ווידג׳ט מוטמע',
          props: {},
        };
        break;
    }

    const newSection: DashboardSection = {
      id,
      type,
      title: customTitle || `אזור ${type}`,
      visible: true,
      mobileHidden: false,
      gridCols: 4,
      config: initialConfig,
    };

    setCurrentDashboard((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedSectionId(id);
  }, []);

  const updateSection = useCallback((sectionId: string, updates: Partial<DashboardSection>) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === sectionId ? { ...sec, ...updates } : sec)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.filter((sec) => sec.id !== sectionId),
      updatedAt: new Date().toISOString(),
    }));
    setSelectedSectionId((prev) => (prev === sectionId ? null : prev));
  }, []);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const toggleSectionMobileHidden = useCallback((sectionId: string) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, mobileHidden: !sec.mobileHidden } : sec
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setCurrentDashboard((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.sections.length - 1) return prev;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const newSections = [...prev.sections];
      const [moved] = newSections.splice(idx, 1);
      newSections.splice(targetIdx, 0, moved);

      return {
        ...prev,
        sections: newSections,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const saveCurrentDashboard = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await dashboardFirestore.saveDashboard(db, tenantId, currentDashboard);
      setSavedDashboards((prev) => {
        const exists = prev.some((d) => d.id === saved.id);
        return exists ? prev.map((d) => (d.id === saved.id ? saved : d)) : [...prev, saved];
      });
      return true;
    } catch (err) {
      console.warn('[KosDesBuilderContext] Save failed:', err);
      setError('שגיאה בשמירת לוח הבקרה.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [db, tenantId, currentDashboard]);

  const selectDashboard = useCallback(
    (dashboardId: string) => {
      const target = savedDashboards.find((d) => d.id === dashboardId);
      if (target) {
        setCurrentDashboard(target);
        setSelectedSectionId(null);
      }
    },
    [savedDashboards]
  );

  const createNewDashboard = useCallback(() => {
    const newId = `dash-${Date.now().toString(36)}`;
    const newDash: DashboardPageDocument = {
      id: newId,
      title: 'לוח בקרה חדש',
      slug: newId,
      description: 'לוח בקרה מותאם אישית',
      isDefault: false,
      theme: 'modern',
      sections: DEFAULT_DASHBOARD_SECTIONS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentDashboard(newDash);
    setSelectedSectionId(null);
  }, []);

  return (
    <KosDesBuilderContext.Provider
      value={{
        currentDashboard,
        savedDashboards,
        selectedSectionId,
        previewDevice,
        isLoading,
        isSaving,
        error,
        setSelectedSectionId,
        setPreviewDevice,
        updateDashboardTitle,
        addSection,
        updateSection,
        removeSection,
        toggleSectionVisibility,
        toggleSectionMobileHidden,
        moveSection,
        saveCurrentDashboard,
        selectDashboard,
        createNewDashboard,
      }}
    >
      {children}
    </KosDesBuilderContext.Provider>
  );
};

export const useKosDesBuilder = (): KosDesBuilderContextType => {
  const context = useContext(KosDesBuilderContext);
  if (!context) {
    throw new Error('useKosDesBuilder must be used within a KosDesBuilderProvider');
  }
  return context;
};
