/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 3: React Context & State Management
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSystemConnection } from '../../..//core/connection/SystemConnectionContext';
import { useTenantScope } from '../../..//core/tenant/TenantScopeContext';
import { REGISTERED_MODULES } from '../../..//workbench/moduleRegistry';
import {
  TargetAudience,
  DynamicModuleCapability,
  GeneratedCustomDashboard,
} from '../types';
import {
  TARGET_AUDIENCES,
  resolveDynamicModuleCapabilities,
} from '../config';
import { GeminiDashboardAiService } from '../services/geminiDashboardAiService';
import { DashboardFirestoreService } from '../services/dashboardFirestoreService';

export interface KosunBoardContextValue {
  audiences: TargetAudience[];
  selectedAudience: TargetAudience;
  setSelectedAudience: (aud: TargetAudience) => void;
  discoveredModules: DynamicModuleCapability[];
  selectedModuleIds: string[];
  setSelectedModuleIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleModuleSelection: (moduleId: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  selectedModel: 'gemini-2.5-flash' | 'gemini-3.8-flash' | 'gemini-2.5-pro';
  setSelectedModel: (model: 'gemini-2.5-flash' | 'gemini-3.8-flash' | 'gemini-2.5-pro') => void;
  isGenerating: boolean;
  generatedDashboard: GeneratedCustomDashboard | null;
  setGeneratedDashboard: (dash: GeneratedCustomDashboard | null) => void;
  savedDashboards: GeneratedCustomDashboard[];
  generateAiDashboard: () => Promise<GeneratedCustomDashboard>;
  saveCurrentDashboard: () => Promise<void>;
  pairDashboardToSubdomain: (subdomain: string, dashboard?: GeneratedCustomDashboard) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  hasApiKey: boolean;
  openApiKeysSettings: () => void;
  refreshSavedDashboards: () => Promise<void>;
}

const KosunBoardContext = createContext<KosunBoardContextValue | null>(null);

export const KosunBoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, apiKeys, openConnectorModal } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const audiences = TARGET_AUDIENCES;
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience>(audiences[0]);

  // Requirement ב: Dynamically inspect all registered modules whenever REGISTERED_MODULES changes!
  const discoveredModules = useMemo(() => {
    return resolveDynamicModuleCapabilities(REGISTERED_MODULES);
  }, []);

  // Initialize selected modules based on recommended modules for the audience
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>(() => {
    return audiences[0].recommendedModuleIds;
  });

  // When audience changes, update recommendations
  useEffect(() => {
    const recommended = selectedAudience.recommendedModuleIds.filter((id) =>
      discoveredModules.some((m) => m.moduleId === id)
    );
    if (recommended.length > 0) {
      setSelectedModuleIds(recommended);
    }
  }, [selectedAudience, discoveredModules]);

  const toggleModuleSelection = useCallback((moduleId: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  }, []);

  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash' | 'gemini-3.8-flash' | 'gemini-2.5-pro'>('gemini-2.5-flash');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDashboard, setGeneratedDashboard] = useState<GeneratedCustomDashboard | null>(null);
  const [savedDashboards, setSavedDashboards] = useState<GeneratedCustomDashboard[]>([]);

  const hasApiKey = Boolean(apiKeys.googleAiApiKey && apiKeys.googleAiApiKey.trim().length > 0);

  const openApiKeysSettings = useCallback(() => {
    openConnectorModal('apikeys');
  }, [openConnectorModal]);

  const refreshSavedDashboards = useCallback(async () => {
    try {
      const list = await DashboardFirestoreService.getDashboardsForTenant(db, tenantId);
      setSavedDashboards(list);
    } catch (e) {
      console.warn('[KosunBoardProvider] Failed to load dashboards:', e);
    }
  }, [db, tenantId]);

  useEffect(() => {
    refreshSavedDashboards();
  }, [refreshSavedDashboards]);

  // Generate AI Dashboard with Gemini
  const generateAiDashboard = useCallback(async (): Promise<GeneratedCustomDashboard> => {
    setIsGenerating(true);
    try {
      const activeModules = discoveredModules.filter((m) => selectedModuleIds.includes(m.moduleId));

      const result = await GeminiDashboardAiService.generateDashboard(apiKeys.googleAiApiKey || '', {
        audience: selectedAudience,
        selectedModules: activeModules.length > 0 ? activeModules : discoveredModules.slice(0, 3),
        customPrompt: customPrompt.trim() || undefined,
        tenantId,
        model: selectedModel,
      });

      setGeneratedDashboard(result);
      // Auto-save generated draft
      await DashboardFirestoreService.saveDashboard(db, tenantId, result);
      await refreshSavedDashboards();
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [
    discoveredModules,
    selectedModuleIds,
    apiKeys.googleAiApiKey,
    selectedAudience,
    customPrompt,
    tenantId,
    selectedModel,
    db,
    refreshSavedDashboards,
  ]);

  const saveCurrentDashboard = useCallback(async () => {
    if (!generatedDashboard) return;
    await DashboardFirestoreService.saveDashboard(db, tenantId, generatedDashboard);
    await refreshSavedDashboards();
  }, [db, tenantId, generatedDashboard, refreshSavedDashboards]);

  const pairDashboardToSubdomain = useCallback(
    async (subdomain: string, dashboard?: GeneratedCustomDashboard) => {
      const target = dashboard || generatedDashboard;
      if (!target) return;
      await DashboardFirestoreService.pairDashboardToSubdomain(db, subdomain, target);
      await refreshSavedDashboards();
    },
    [db, generatedDashboard, refreshSavedDashboards]
  );

  const deleteDashboard = useCallback(
    async (id: string) => {
      await DashboardFirestoreService.deleteDashboard(db, tenantId, id);
      if (generatedDashboard?.id === id) {
        setGeneratedDashboard(null);
      }
      await refreshSavedDashboards();
    },
    [db, tenantId, generatedDashboard, refreshSavedDashboards]
  );

  const value = useMemo<KosunBoardContextValue>(
    () => ({
      audiences,
      selectedAudience,
      setSelectedAudience,
      discoveredModules,
      selectedModuleIds,
      setSelectedModuleIds,
      toggleModuleSelection,
      customPrompt,
      setCustomPrompt,
      selectedModel,
      setSelectedModel,
      isGenerating,
      generatedDashboard,
      setGeneratedDashboard,
      savedDashboards,
      generateAiDashboard,
      saveCurrentDashboard,
      pairDashboardToSubdomain,
      deleteDashboard,
      hasApiKey,
      openApiKeysSettings,
      refreshSavedDashboards,
    }),
    [
      audiences,
      selectedAudience,
      discoveredModules,
      selectedModuleIds,
      toggleModuleSelection,
      customPrompt,
      selectedModel,
      isGenerating,
      generatedDashboard,
      savedDashboards,
      generateAiDashboard,
      saveCurrentDashboard,
      pairDashboardToSubdomain,
      deleteDashboard,
      hasApiKey,
      openApiKeysSettings,
      refreshSavedDashboards,
    ]
  );

  return <KosunBoardContext.Provider value={value}>{children}</KosunBoardContext.Provider>;
};

export function useKosunBoard(): KosunBoardContextValue {
  const ctx = useContext(KosunBoardContext);
  if (!ctx) {
    throw new Error('useKosunBoard must be used within a KosunBoardProvider');
  }
  return ctx;
}
