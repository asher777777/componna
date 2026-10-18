/**
 * KoSeoPowerEngin - Context & Provider
 * KOSUN26 Modular Layer: Context
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import {
  DomainGoogleIntegrationsConfig,
  SearchConsoleQueryMetric,
  TrafficSourceMetric,
  SubdomainCoverageItem,
  SeoPowerTelemetry,
  SeoPowerTestStatus,
} from '../types';
import {
  seoPowerStorageService,
  extractGscVerificationToken,
} from '../services/seoPowerStorageService';
import { DEFAULT_SEARCH_QUERIES, DEFAULT_TRAFFIC_SOURCES } from '../config';

export type KoSeoTab = 'hub' | 'keys' | 'telemetry' | 'subdomains';

interface KoSeoPowerContextValue {
  config: DomainGoogleIntegrationsConfig;
  updateConfig: (patch: Partial<DomainGoogleIntegrationsConfig>) => void;
  saveConfig: () => Promise<boolean>;
  isSaving: boolean;
  saveSuccess: boolean;
  testStatus: SeoPowerTestStatus | null;
  clearTestStatus: () => void;
  runInspectorTest: () => void;
  sendTestPing: () => boolean;
  pingSent: boolean;
  searchQueries: SearchConsoleQueryMetric[];
  trafficSources: TrafficSourceMetric[];
  subdomainsCoverage: SubdomainCoverageItem[];
  totals: SeoPowerTelemetry;
  activeTab: KoSeoTab;
  setActiveTab: (tab: KoSeoTab) => void;
}

const KoSeoPowerContext = createContext<KoSeoPowerContextValue | undefined>(undefined);

export const KoSeoPowerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [config, setConfig] = useState<DomainGoogleIntegrationsConfig>(() =>
    seoPowerStorageService.getDomainConfigSync(tenantId)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<SeoPowerTestStatus | null>(null);
  const [pingSent, setPingSent] = useState(false);
  const [activeTab, setActiveTab] = useState<KoSeoTab>('hub');

  const [subdomainsCoverage, setSubdomainsCoverage] = useState<SubdomainCoverageItem[]>([]);
  const [totals, setTotals] = useState<SeoPowerTelemetry>({
    views: 0,
    uniqueVisitors: 0,
    interactions: 0,
    leads: 0,
    searchImpressions: 0,
    searchClicks: 0,
    searchCtr: 0,
    averagePosition: 0,
  });
  const [searchQueries, setSearchQueries] = useState<SearchConsoleQueryMetric[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSourceMetric[]>(DEFAULT_TRAFFIC_SOURCES);

  // Load latest settings & real subdomains from the Subdomain Manager collection on mount
  useEffect(() => {
    let isMounted = true;
    seoPowerStorageService.getDomainConfig(db, tenantId).then((fetched) => {
      if (isMounted && fetched) {
        setConfig(fetched);
      }
    });

    seoPowerStorageService
      .fetchRealSubdomainsAndMetrics(db, config.masterDomain, config)
      .then((realData) => {
        if (isMounted) {
          setSubdomainsCoverage(realData.subdomains);
          setTotals(realData.totals);
          setSearchQueries(realData.queries);
          setTrafficSources(realData.sources);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [db, tenantId, config.masterDomain, config.googleAnalyticsId, config.googleSearchConsoleVerification]);

  const updateConfig = useCallback((patch: Partial<DomainGoogleIntegrationsConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const saveConfig = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const ok = await seoPowerStorageService.saveDomainConfig(config, db, tenantId);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
      return ok;
    } catch (err) {
      console.error('[KoSeoPowerEngin] Save error:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config, db, tenantId]);

  const runInspectorTest = useCallback(() => {
    const res = seoPowerStorageService.runBrowserDomVerification(config);
    setTestStatus(res);
  }, [config]);

  const sendTestPing = useCallback((): boolean => {
    const ok = seoPowerStorageService.sendRealTimeTestPing(config);
    setPingSent(true);
    setTimeout(() => setPingSent(false), 3000);
    return ok;
  }, [config]);

  const clearTestStatus = useCallback(() => {
    setTestStatus(null);
  }, []);

  const value: KoSeoPowerContextValue = {
    config,
    updateConfig,
    saveConfig,
    isSaving,
    saveSuccess,
    testStatus,
    clearTestStatus,
    runInspectorTest,
    sendTestPing,
    pingSent,
    searchQueries,
    trafficSources,
    subdomainsCoverage,
    totals,
    activeTab,
    setActiveTab,
  };

  return <KoSeoPowerContext.Provider value={value}>{children}</KoSeoPowerContext.Provider>;
};

export const useKoSeoPowerContext = (): KoSeoPowerContextValue => {
  const ctx = useContext(KoSeoPowerContext);
  if (!ctx) {
    throw new Error('useKoSeoPowerContext must be used within a KoSeoPowerProvider');
  }
  return ctx;
};
