import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { LivingProject, LivingCampaignContract } from '../types';
import { DEFAULT_LIVING_CAMPAIGN } from '../config';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { LivingStorageService } from '../services/livingStorageService';

export type KosLiveStudioTab = 'projects' | 'converter' | 'wizard' | 'timeline' | 'preview' | 'embed';

interface KosLiveContextValue {
  tab: KosLiveStudioTab;
  setTab: (tab: KosLiveStudioTab) => void;
  projects: LivingProject[];
  activeProject: LivingProject | null;
  setActiveProject: (project: LivingProject | null) => void;
  activeCampaign: LivingCampaignContract;
  setActiveCampaign: (campaign: LivingCampaignContract) => void;
  isLoading: boolean;
  loadProjects: () => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  createNewProject: (title?: string) => LivingProject;
  deleteProject: (id: string) => Promise<void>;
}

const KosLiveContext = createContext<KosLiveContextValue | null>(null);

export const KosLiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [tab, setTab] = useState<KosLiveStudioTab>('projects');
  const [projects, setProjects] = useState<LivingProject[]>([]);
  const [activeProject, setActiveProject] = useState<LivingProject | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<LivingCampaignContract>(DEFAULT_LIVING_CAMPAIGN);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await LivingStorageService.listProjects(db as any, tenantId);
      setProjects(list);
      if (list.length > 0 && !activeProject) {
        setActiveProject(list[0]);
      }
    } catch (e) {
      console.warn('[KosLiveContext] Failed to load projects:', e);
    } finally {
      setIsLoading(false);
    }
  }, [db, tenantId, activeProject]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createNewProject = useCallback((title: string = 'פרויקט עמוד חי חדש'): LivingProject => {
    const id = `live_proj_${Date.now()}`;
    const newProj: LivingProject = {
      id,
      title,
      description: 'הפיכת תוכן ומוצרים לעמוד חי אינטראקטיבי',
      aspectRatio: '9:16',
      scenes: [],
      displayMode: 'full_page',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActiveProject(newProj);
    setTab('timeline');
    return newProj;
  }, []);

  const saveCurrentProject = useCallback(async () => {
    if (!activeProject) return;
    await LivingStorageService.saveProject(db as any, tenantId, activeProject);
    await loadProjects();
  }, [activeProject, db, tenantId, loadProjects]);

  const deleteProject = useCallback(async (id: string) => {
    await LivingStorageService.deleteProject(db as any, tenantId, id);
    if (activeProject?.id === id) {
      setActiveProject(null);
      setTab('projects');
    }
    await loadProjects();
  }, [activeProject, db, tenantId, loadProjects]);

  const value = useMemo(() => ({
    tab,
    setTab,
    projects,
    activeProject,
    setActiveProject,
    activeCampaign,
    setActiveCampaign,
    isLoading,
    loadProjects,
    saveCurrentProject,
    createNewProject,
    deleteProject
  }), [
    tab,
    setTab,
    projects,
    activeProject,
    setActiveProject,
    activeCampaign,
    setActiveCampaign,
    isLoading,
    loadProjects,
    saveCurrentProject,
    createNewProject,
    deleteProject
  ]);

  return (
    <KosLiveContext.Provider value={value}>
      {children}
    </KosLiveContext.Provider>
  );
};

export const useKosLive = () => {
  const ctx = useContext(KosLiveContext);
  if (!ctx) {
    throw new Error('useKosLive must be used within a KosLiveProvider');
  }
  return ctx;
};
