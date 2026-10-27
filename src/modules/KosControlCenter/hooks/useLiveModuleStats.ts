import { useState, useEffect, useCallback } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { LiveSystemMetrics } from '../types';
import { fetchLiveSystemMetrics, getLiveCollectionCount } from '../services/controlCenterFirestore';
import { MODULE_CATALOG } from '../config';

export function useLiveModuleStats() {
  const { db, isConnected, apiKeys } = useSystemConnection();
  const { getScopedCollectionName } = useTenantScope();

  const [metrics, setMetrics] = useState<LiveSystemMetrics>({
    totalLeadsCount: 0,
    totalPagesCount: 0,
    totalFormsCount: 0,
    totalTransactionsCount: 0,
    totalMediaCount: 0,
    totalGroupsCount: 0,
    activeModulesCount: MODULE_CATALOG.length,
    isLoading: true,
    lastSyncTime: null,
  });

  const [moduleDocCounts, setModuleDocCounts] = useState<Record<string, number>>({});

  const refreshStats = useCallback(async () => {
    setMetrics(prev => ({ ...prev, isLoading: true }));
    try {
      const live = await fetchLiveSystemMetrics(db, getScopedCollectionName);
      setMetrics(live);

      // Fetch per-module document count for modules that have collections
      if (db) {
        const counts: Record<string, number> = {};
        await Promise.all(
          MODULE_CATALOG.map(async (mod) => {
            if (mod.collectionName) {
              const scopedName = getScopedCollectionName(mod.collectionName);
              const count = await getLiveCollectionCount(db, scopedName);
              counts[mod.id] = count;
            }
          })
        );
        setModuleDocCounts(counts);
      }
    } catch (err) {
      console.warn('[useLiveModuleStats] Refresh error:', err);
      setMetrics(prev => ({ ...prev, isLoading: false }));
    }
  }, [db, getScopedCollectionName]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    metrics,
    moduleDocCounts,
    isConnected,
    apiKeys,
    refreshStats,
  };
}
