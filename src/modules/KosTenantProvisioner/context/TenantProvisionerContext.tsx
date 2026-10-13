import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { TenantAccount, TenantProvisionFormState, TenantStats } from '../types';
import { TenantProvisionerService, AVAILABLE_MODULES_CATALOG } from '../services/tenantProvisionerService';

interface TenantProvisionerContextValue {
  tenants: TenantAccount[];
  filteredTenants: TenantAccount[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedModuleFilter: string;
  setSelectedModuleFilter: (m: string) => void;
  stats: TenantStats;
  createTenant: (form: TenantProvisionFormState) => Promise<TenantAccount>;
  updateModules: (subdomain: string, modules: string[]) => Promise<void>;
  updateCredentials: (subdomain: string, credentials: { username: string; password: string }) => Promise<void>;
  deleteTenant: (subdomain: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantAccount | null>(null);
  const [viewingCredentialsTenant, setViewingCredentialsTenant] = useState<TenantAccount | null>(null);

  const refreshTenants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await TenantProvisionerService.getAllTenants(db);
      setTenants(data);
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
    },
    [db]
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

  const deleteTenant = useCallback(
    async (subdomain: string): Promise<void> => {
      await TenantProvisionerService.deleteTenant(db, subdomain);
      setTenants((prev) => prev.filter((t) => t.subdomain !== subdomain));
    },
    [db]
  );

  // Compute stats
  const stats = useMemo<TenantStats>(() => {
    const total = tenants.length;
    const active = tenants.filter((t) => t.status === 'active').length;
    const totalModules = tenants.reduce((acc, t) => acc + (t.activeModules?.length || 0), 0);
    const avg = total > 0 ? Math.round((totalModules / total) * 10) / 10 : 0;

    const moduleFreq: Record<string, number> = {};
    tenants.forEach((t) => {
      (t.activeModules || []).forEach((m) => {
        moduleFreq[m] = (moduleFreq[m] || 0) + 1;
      });
    });

    let topModId = 'KosWebAi';
    let topModCount = 0;
    Object.entries(moduleFreq).forEach(([modId, count]) => {
      if (count > topModCount) {
        topModCount = count;
        topModId = modId;
      }
    });

    const matchedMod = AVAILABLE_MODULES_CATALOG.find((m) => m.id === topModId);
    const mostPopular = matchedMod ? matchedMod.name : topModId;

    return {
      totalTenants: total,
      activeTenants: active,
      avgModulesPerTenant: avg,
      mostPopularModule: mostPopular,
    };
  }, [tenants]);

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch =
        !searchTerm.trim() ||
        t.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.adminUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.ownerPhone && t.ownerPhone.includes(searchTerm));

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
      loading,
      searchTerm,
      setSearchTerm,
      selectedModuleFilter,
      setSelectedModuleFilter,
      stats,
      createTenant,
      updateModules,
      updateCredentials,
      deleteTenant,
      refreshTenants,
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
      loading,
      searchTerm,
      selectedModuleFilter,
      stats,
      createTenant,
      updateModules,
      updateCredentials,
      deleteTenant,
      refreshTenants,
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
