import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { TenantAccount, TenantProvisionFormState, TenantStats } from '../types';
import { TenantProvisionerService, AVAILABLE_MODULES_CATALOG } from '../services/tenantProvisionerService';

interface TenantProvisionerContextValue {
  tenants: TenantAccount[];
  filteredTenants: TenantAccount[];
  masterTenant: TenantAccount | null;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedModuleFilter: string;
  setSelectedModuleFilter: (m: string) => void;
  stats: TenantStats;
  createTenant: (form: TenantProvisionFormState) => Promise<TenantAccount>;
  updateModules: (subdomain: string, modules: string[]) => Promise<void>;
  updateCredentials: (subdomain: string, credentials: { username: string; password: string }) => Promise<void>;
  updateTenantAccount: (subdomain: string, updates: Partial<TenantAccount>) => Promise<void>;
  updateTenantKeys: (subdomain: string, keys: Record<string, any>) => Promise<void>;
  getTenantKeys: (subdomain: string) => Promise<Record<string, any>>;
  deleteTenant: (subdomain: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
  refreshMasterTenant: () => Promise<void>;
  // Modals state
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  editingTenant: TenantAccount | null;
  setEditingTenant: (tenant: TenantAccount | null) => void;
  viewingCredentialsTenant: TenantAccount | null;
  setViewingCredentialsTenant: (tenant: TenantAccount | null) => void;
}

const TenantProvisionerContext = createContext<TenantProvisionerContextValue | null>(null);

export const TenantProvisionerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useSystemConnection();
  const [tenants, setTenants] = useState<TenantAccount[]>([]);
  const [masterTenant, setMasterTenant] = useState<TenantAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantAccount | null>(null);
  const [viewingCredentialsTenant, setViewingCredentialsTenant] = useState<TenantAccount | null>(null);

  const refreshMasterTenant = useCallback(async () => {
    try {
      const master = await TenantProvisionerService.getMasterTenant(db);
      setMasterTenant(master);
    } catch (err) {
      console.warn('[TenantProvisionerContext] Error fetching master tenant:', err);
    }
  }, [db]);

  const refreshTenants = useCallback(async () => {
    setLoading(true);
    try {
      const [data, master] = await Promise.all([
        TenantProvisionerService.getAllTenants(db),
        TenantProvisionerService.getMasterTenant(db),
      ]);
      setTenants(data);
      setMasterTenant(master);
    } catch (e) {
      console.warn('[TenantProvisionerContext] Error fetching tenants:', e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refreshTenants();
  }, [refreshTenants]);

  const createTenant = useCallback(
    async (form: TenantProvisionFormState): Promise<TenantAccount> => {
      const created = await TenantProvisionerService.createTenant(db, form);
      setTenants((prev) => [created, ...prev.filter((t) => t.subdomain !== created.subdomain)]);
      return created;
    },
    [db]
  );

  const updateModules = useCallback(
    async (subdomain: string, modules: string[]): Promise<void> => {
      await TenantProvisionerService.updateTenantModules(db, subdomain, modules);
      setTenants((prev) =>
        prev.map((t) =>
          t.subdomain === subdomain ? { ...t, activeModules: modules, updatedAt: new Date().toISOString() } : t
        )
      );
      if (editingTenant && editingTenant.subdomain === subdomain) {
        setEditingTenant((prev) => (prev ? { ...prev, activeModules: modules } : null));
      }
    },
    [db, editingTenant]
  );

  const updateCredentials = useCallback(
    async (subdomain: string, credentials: { username: string; password: string }): Promise<void> => {
      await TenantProvisionerService.updateTenantCredentials(db, subdomain, credentials);
      setTenants((prev) =>
        prev.map((t) =>
          t.subdomain === subdomain
            ? {
                ...t,
                adminUsername: credentials.username,
                adminPassword: credentials.password,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    },
    [db]
  );

  const updateTenantAccount = useCallback(
    async (subdomain: string, updates: Partial<TenantAccount>): Promise<void> => {
      await TenantProvisionerService.updateTenantFullDetails(db, subdomain, updates);
      setTenants((prev) =>
        prev.map((t) =>
          t.subdomain === subdomain
            ? {
                ...t,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      if (editingTenant && editingTenant.subdomain === subdomain) {
        setEditingTenant((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [db, editingTenant]
  );

  const updateTenantKeys = useCallback(
    async (subdomain: string, keys: Record<string, any>): Promise<void> => {
      await TenantProvisionerService.updateTenantKeys(db, subdomain, keys);
      if (subdomain === '_master') {
        refreshMasterTenant();
      }
    },
    [db, refreshMasterTenant]
  );

  const getTenantKeys = useCallback(
    async (subdomain: string): Promise<Record<string, any>> => {
      return TenantProvisionerService.getTenantKeys(db, subdomain);
    },
    [db]
  );

  const deleteTenant = useCallback(
    async (subdomain: string): Promise<void> => {
      await TenantProvisionerService.deleteTenant(db, subdomain);
      setTenants((prev) => prev.filter((t) => t.subdomain !== subdomain));
    },
    [db]
  );

  // Computed KPIs
  const stats: TenantStats = useMemo(() => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.status === 'active').length;

    let totalModulesCount = 0;
    const moduleUsageMap: Record<string, number> = {};

    tenants.forEach((t) => {
      const mods = t.activeModules || [];
      totalModulesCount += mods.length;
      mods.forEach((m) => {
        moduleUsageMap[m] = (moduleUsageMap[m] || 0) + 1;
      });
    });

    const avgModulesPerTenant = totalTenants > 0 ? Number((totalModulesCount / totalTenants).toFixed(1)) : 0;

    let topModId = '';
    let topModCount = -1;
    Object.entries(moduleUsageMap).forEach(([modId, count]) => {
      if (count > topModCount) {
        topModCount = count;
        topModId = modId;
      }
    });

    const topModuleMeta = AVAILABLE_MODULES_CATALOG.find((m) => m.id === topModId);
    const mostPopularModule = topModuleMeta ? topModuleMeta.name : 'טרם הוגדר';

    return {
      totalTenants,
      activeTenants,
      avgModulesPerTenant,
      mostPopularModule,
    };
  }, [tenants]);

  // Filtered tenants by search and module
  const filteredTenants = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();

    return tenants.filter((t) => {
      const matchSearch =
        !cleanSearch ||
        t.subdomain.toLowerCase().includes(cleanSearch) ||
        t.clientName.toLowerCase().includes(cleanSearch) ||
        t.adminUsername.toLowerCase().includes(cleanSearch) ||
        (t.ownerEmail && t.ownerEmail.toLowerCase().includes(cleanSearch));

      const matchModule =
        selectedModuleFilter === 'all' ||
        (t.activeModules && t.activeModules.includes(selectedModuleFilter));

      return matchSearch && matchModule;
    });
  }, [tenants, searchTerm, selectedModuleFilter]);

  const value = useMemo(
    () => ({
      tenants,
      filteredTenants,
      masterTenant,
      loading,
      searchTerm,
      setSearchTerm,
      selectedModuleFilter,
      setSelectedModuleFilter,
      stats,
      createTenant,
      updateModules,
      updateCredentials,
      updateTenantAccount,
      updateTenantKeys,
      getTenantKeys,
      deleteTenant,
      refreshTenants,
      refreshMasterTenant,
      isCreateModalOpen,
      setIsCreateModalOpen,
      editingTenant,
      setEditingTenant,
      viewingCredentialsTenant,
      setViewingCredentialsTenant,
    }),
    [
      tenants,
      filteredTenants,
      masterTenant,
      loading,
      searchTerm,
      selectedModuleFilter,
      stats,
      createTenant,
      updateModules,
      updateCredentials,
      updateTenantAccount,
      updateTenantKeys,
      getTenantKeys,
      deleteTenant,
      refreshTenants,
      refreshMasterTenant,
      isCreateModalOpen,
      editingTenant,
      viewingCredentialsTenant,
    ]
  );

  return <TenantProvisionerContext.Provider value={value}>{children}</TenantProvisionerContext.Provider>;
};

export function useTenantProvisionerContext(): TenantProvisionerContextValue {
  const ctx = useContext(TenantProvisionerContext);
  if (!ctx) {
    throw new Error('useTenantProvisionerContext must be used within TenantProvisionerProvider');
  }
  return ctx;
}
