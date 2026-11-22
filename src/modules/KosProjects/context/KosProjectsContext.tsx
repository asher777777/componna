/**
 * KosProjects - Main Module Context & EventBus / Capability Orchestrator
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { eventBus } from '../../../core/bridge/EventBus';
import type {
  AiTextAssistantContract,
  CrmContactSummary,
  CrmGroupSummary,
} from '../../../core/contracts';
import { BUILT_IN_BLUEPRINTS } from '../config';
import {
  AiRiskReport,
  AiWorkplanSuggestion,
  KosProjectsContract,
  ProjectBlueprint,
  ProjectImportResult,
  ProjectRecord,
  ProjectRoleAssignment,
  ProjectTask,
  ProjectTaskDraft,
  ProjectViewTab,
} from '../types';
import {
  batchCreateTasks as fsBatchCreateTasks,
  createProject as fsCreateProject,
  createProjectTask as fsCreateProjectTask,
  deleteProject as fsDeleteProject,
  deleteProjectTask as fsDeleteProjectTask,
  listBlueprints as fsListBlueprints,
  listProjects as fsListProjects,
  listProjectTasks as fsListProjectTasks,
  saveBlueprint as fsSaveBlueprint,
  updateProject as fsUpdateProject,
  updateProjectTask as fsUpdateProjectTask,
} from '../services/projectsFirestoreService';
import {
  exportProjectGanttToExcel,
  parseProjectTasksFromFile,
} from '../services/projectImportService';
import {
  assignRegistrantToProjectCommunity,
  CreateProjectMarketingOptions,
  CreateProjectMarketingResult,
  createProjectMarketingAssets,
  fetchCommunities,
  fetchCrmContactsAndSuppliers,
  sendVendorReminder as syncSendVendorReminder,
  syncSupplierOrLeadToCrm,
  VendorReminderResult,
} from '../services/projectSyncService';
import {
  analyzeGanttRisks,
  draftVendorBrief,
  generateWorkplanFromBrief,
} from '../api/projectAiApi';
import { cloneBlueprintTasksForStartDate } from '../scripts';

export interface KosProjectsProviderProps {
  firebaseApp?: FirebaseApp;
  children: React.ReactNode;
}

export interface KosProjectsContextValue {
  // Core state
  projects: ProjectRecord[];
  selectedProjectId: string | null;
  selectedProject: ProjectRecord | null;
  setSelectedProjectId: (id: string | null) => void;
  activeTab: ProjectViewTab;
  setActiveTab: (tab: ProjectViewTab) => void;
  tasks: ProjectTask[];
  blueprints: ProjectBlueprint[];
  crmContacts: CrmContactSummary[];
  communities: CrmGroupSummary[];

  // Loading & error states
  loading: boolean;
  tasksLoading: boolean;
  aiLoading: boolean;
  syncLoading: boolean;
  error: string | null;
  clearError: () => void;

  // AI results state
  aiWorkplanSuggestion: AiWorkplanSuggestion | null;
  aiRiskReport: AiRiskReport | null;
  clearAiWorkplanSuggestion: () => void;

  // Data refresh
  refreshProjects: () => Promise<void>;
  refreshTasks: (projectId?: string) => Promise<void>;
  refreshExternalData: () => Promise<void>;

  // Project CRUD
  createProject: (data: Partial<ProjectRecord> & { title: string }) => Promise<ProjectRecord>;
  updateProject: (projectId: string, updates: Partial<ProjectRecord>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;

  // Task CRUD
  createTask: (
    task: Partial<ProjectTaskDraft> & { title: string },
    projectId?: string
  ) => Promise<ProjectTask | null>;
  updateTask: (taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  batchCreateTasks: (tasks: ProjectTaskDraft[], projectId?: string) => Promise<ProjectTask[]>;

  // Blueprints
  cloneFromBlueprint: (
    blueprintId: string,
    overrides?: { title?: string; clientName?: string; startDate?: string; budget?: number }
  ) => Promise<ProjectRecord | null>;
  saveCurrentProjectAsBlueprint: (
    name: string,
    description?: string,
    category?: string
  ) => Promise<ProjectBlueprint | null>;

  // Excel Import / Export
  importTasksFromExcel: (file: File, projectId?: string) => Promise<ProjectImportResult>;
  exportGanttToExcel: (projectId?: string) => void;

  // Cross-module Sync
  syncMarketingAssets: (
    projectId?: string,
    options?: CreateProjectMarketingOptions
  ) => Promise<CreateProjectMarketingResult>;
  syncSupplierToCrm: (
    supplier: ProjectRoleAssignment,
    projectTitle?: string
  ) => Promise<{ success: boolean; contactId?: string }>;
  linkCommunity: (projectId: string, groupId: string, groupName: string) => Promise<void>;
  sendVendorReminder: (params: {
    phone?: string;
    email?: string;
    message: string;
    subject?: string;
  }) => Promise<VendorReminderResult>;

  // User-triggered AI actions
  runAiWorkplan: (
    brief: string,
    projectTitle?: string,
    startDate?: string
  ) => Promise<{ suggestion?: AiWorkplanSuggestion; error?: string }>;
  applyAiWorkplan: (
    suggestion: AiWorkplanSuggestion,
    projectId?: string
  ) => Promise<ProjectTask[]>;
  runAiRiskAnalysis: (
    projectId?: string
  ) => Promise<{ report?: AiRiskReport; error?: string }>;
  runAiVendorBrief: (
    task: ProjectTask,
    supplierName: string,
    projectId?: string
  ) => Promise<{ briefText?: string; error?: string }>;
}

const KosProjectsContext = createContext<KosProjectsContextValue | null>(null);

function addDaysIso(baseDate: string, days: number): string {
  const dt = new Date(baseDate);
  if (Number.isNaN(dt.getTime())) return baseDate;
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().split('T')[0];
}

export const KosProjectsProvider: React.FC<KosProjectsProviderProps> = ({
  firebaseApp,
  children,
}) => {
  const systemConn = useSystemConnection();
  const db: Firestore | null = useMemo(
    () => (firebaseApp ? getFirestore(firebaseApp) : systemConn?.db || null),
    [firebaseApp, systemConn?.db]
  );

  const { getScopedCollectionPath } = useTenantScope();
  const { registerCapability, unregisterCapability, getCapability } = useHostCapabilities();

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectViewTab>('overview');
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [customBlueprints, setCustomBlueprints] = useState<ProjectBlueprint[]>([]);
  const [crmContacts, setCrmContacts] = useState<CrmContactSummary[]>([]);
  const [communities, setCommunities] = useState<CrmGroupSummary[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [aiWorkplanSuggestion, setAiWorkplanSuggestion] = useState<AiWorkplanSuggestion | null>(null);
  const [aiRiskReport, setAiRiskReport] = useState<AiRiskReport | null>(null);

  const projectsRef = useRef<ProjectRecord[]>(projects);
  projectsRef.current = projects;
  const tasksRef = useRef<ProjectTask[]>(tasks);
  tasksRef.current = tasks;

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const blueprints = useMemo(() => {
    const customIds = new Set(customBlueprints.map((b) => b.id));
    return [...customBlueprints, ...BUILT_IN_BLUEPRINTS.filter((b) => !customIds.has(b.id))];
  }, [customBlueprints]);

  const clearError = useCallback(() => setError(null), []);
  const clearAiWorkplanSuggestion = useCallback(() => setAiWorkplanSuggestion(null), []);

  // ============================================================================
  // Data Loading
  // ============================================================================

  const refreshProjects = useCallback(async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [loadedProjects, loadedBlueprints] = await Promise.all([
        fsListProjects(db, getScopedCollectionPath),
        fsListBlueprints(db, getScopedCollectionPath),
      ]);
      setProjects(loadedProjects);
      setCustomBlueprints(loadedBlueprints);
      setSelectedProjectId((prev) => {
        if (prev && loadedProjects.some((p) => p.id === prev)) return prev;
        return loadedProjects[0]?.id || null;
      });
    } catch (err: any) {
      console.error('[KosProjects] Failed to load projects:', err);
      setError(err?.message || 'שגיאה בטעינת הפרויקטים');
    } finally {
      setLoading(false);
    }
  }, [db, getScopedCollectionPath]);

  const refreshTasks = useCallback(
    async (projectId?: string) => {
      const targetId = projectId ?? selectedProjectId;
      if (!targetId) {
        setTasks([]);
        return;
      }
      if (!db) return;
      try {
        setTasksLoading(true);
        const loadedTasks = await fsListProjectTasks(db, getScopedCollectionPath, targetId);
        setTasks(loadedTasks);
      } catch (err: any) {
        console.error('[KosProjects] Failed to load tasks:', err);
        setError(err?.message || 'שגיאה בטעינת משימות הפרויקט');
      } finally {
        setTasksLoading(false);
      }
    },
    [db, getScopedCollectionPath, selectedProjectId]
  );

  const refreshExternalData = useCallback(async () => {
    const [contactsRes, communitiesRes] = await Promise.all([
      fetchCrmContactsAndSuppliers(getCapability),
      fetchCommunities(getCapability),
    ]);
    setCrmContacts(contactsRes);
    setCommunities(communitiesRes);
  }, [getCapability]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    refreshExternalData();
  }, [refreshExternalData]);

  useEffect(() => {
    if (selectedProjectId) {
      refreshTasks(selectedProjectId);
      setAiRiskReport(null);
    } else {
      setTasks([]);
    }
  }, [selectedProjectId, refreshTasks]);

  // ============================================================================
  // Project CRUD
  // ============================================================================

  const createProject = useCallback(
    async (data: Partial<ProjectRecord> & { title: string }): Promise<ProjectRecord> => {
      const now = new Date().toISOString();
      const today = now.split('T')[0];
      const defaultEnd = addDaysIso(today, 30);

      let created: ProjectRecord;
      if (db) {
        created = await fsCreateProject(db, getScopedCollectionPath, data);
      } else {
        created = {
          id: data.id || `proj_${Date.now()}`,
          title: data.title.trim(),
          description: data.description || '',
          clientContactId: data.clientContactId,
          clientName: data.clientName || '',
          status: data.status || 'planning',
          startDate: data.startDate || today,
          targetEndDate: data.targetEndDate || defaultEnd,
          budget: data.budget,
          communityGroupId: data.communityGroupId,
          communityGroupName: data.communityGroupName,
          marketing: { registrationCount: 0, ...data.marketing },
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: now,
          updatedAt: now,
        };
      }

      setProjects((prev) => [created, ...prev]);
      setSelectedProjectId(created.id);
      setTasks([]);
      return created;
    },
    [db, getScopedCollectionPath]
  );

  const updateProject = useCallback(
    async (projectId: string, updates: Partial<ProjectRecord>): Promise<void> => {
      const updatedAt = new Date().toISOString();
      if (db) {
        await fsUpdateProject(db, getScopedCollectionPath, projectId, updates);
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updates, updatedAt } : p))
      );
    },
    [db, getScopedCollectionPath]
  );

  const deleteProject = useCallback(
    async (projectId: string): Promise<void> => {
      if (db) {
        await fsDeleteProject(db, getScopedCollectionPath, projectId);
      }
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== projectId);
        if (selectedProjectId === projectId) {
          setSelectedProjectId(next[0]?.id || null);
        }
        return next;
      });
      if (selectedProjectId === projectId) {
        setTasks([]);
      }
    },
    [db, getScopedCollectionPath, selectedProjectId]
  );

  // ============================================================================
  // Task CRUD
  // ============================================================================

  const createTask = useCallback(
    async (
      task: Partial<ProjectTaskDraft> & { title: string },
      projectId?: string
    ): Promise<ProjectTask | null> => {
      const targetProjectId = projectId ?? selectedProjectId;
      if (!targetProjectId) return null;

      let created: ProjectTask;
      if (db) {
        created = await fsCreateProjectTask(db, getScopedCollectionPath, targetProjectId, {
          order: tasksRef.current.length + 1,
          ...task,
        });
      } else {
        const now = new Date().toISOString();
        const today = now.split('T')[0];
        created = {
          id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          projectId: targetProjectId,
          phase: task.phase || 'ייזום ותכנון',
          title: task.title.trim(),
          description: task.description || '',
          startDate: task.startDate || today,
          endDate: task.endDate || task.startDate || today,
          progress: task.progress ?? 0,
          status: task.status || 'pending',
          ownerName: task.ownerName || '',
          ownerRole: task.ownerRole || '',
          ownerContactId: task.ownerContactId,
          suppliers: task.suppliers || [],
          dependsOnTaskIds: task.dependsOnTaskIds || [],
          isMilestone: Boolean(task.isMilestone),
          estimatedCost: task.estimatedCost,
          order: task.order ?? tasksRef.current.length + 1,
          createdAt: now,
          updatedAt: now,
        };
      }

      if (targetProjectId === selectedProjectId) {
        setTasks((prev) => [...prev, created]);
      }
      return created;
    },
    [db, getScopedCollectionPath, selectedProjectId]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<ProjectTask>): Promise<void> => {
      const updatedAt = new Date().toISOString();
      if (db) {
        await fsUpdateProjectTask(db, getScopedCollectionPath, taskId, updates);
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt } : t))
      );
    },
    [db, getScopedCollectionPath]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      if (db) {
        await fsDeleteProjectTask(db, getScopedCollectionPath, taskId);
      }
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
    [db, getScopedCollectionPath]
  );

  const batchCreateTasks = useCallback(
    async (drafts: ProjectTaskDraft[], projectId?: string): Promise<ProjectTask[]> => {
      const targetProjectId = projectId ?? selectedProjectId;
      if (!targetProjectId || drafts.length === 0) return [];

      let created: ProjectTask[];
      if (db) {
        created = await fsBatchCreateTasks(db, getScopedCollectionPath, targetProjectId, drafts);
      } else {
        const now = new Date().toISOString();
        created = drafts.map((d, idx) => ({
          ...d,
          id: `task_${Date.now()}_${idx}`,
          projectId: targetProjectId,
          createdAt: now,
          updatedAt: now,
        }));
      }

      if (targetProjectId === selectedProjectId) {
        setTasks((prev) => [...prev, ...created]);
      }
      return created;
    },
    [db, getScopedCollectionPath, selectedProjectId]
  );

  // ============================================================================
  // Blueprints
  // ============================================================================

  const cloneFromBlueprint = useCallback(
    async (
      blueprintId: string,
      overrides?: { title?: string; clientName?: string; startDate?: string; budget?: number }
    ): Promise<ProjectRecord | null> => {
      const bp = blueprints.find((b) => b.id === blueprintId);
      if (!bp) return null;

      const startDate = overrides?.startDate || new Date().toISOString().split('T')[0];
      const shiftedTasks = cloneBlueprintTasksForStartDate(bp, startDate);
      const maxEndDate = shiftedTasks.reduce(
        (max, t) => (t.endDate > max ? t.endDate : max),
        addDaysIso(startDate, 21)
      );

      const project = await createProject({
        title: overrides?.title || bp.name,
        description: bp.description,
        clientName: overrides?.clientName || '',
        status: 'planning',
        startDate,
        targetEndDate: maxEndDate,
        budget: overrides?.budget,
        marketing: {
          registrationCount: 0,
          ...bp.marketingTemplate,
        },
        tags: [bp.category],
      });

      const createdTasks = await batchCreateTasks(shiftedTasks, project.id);
      setTasks(createdTasks);
      return project;
    },
    [blueprints, createProject, batchCreateTasks]
  );

  const saveCurrentProjectAsBlueprint = useCallback(
    async (
      name: string,
      description?: string,
      category?: string
    ): Promise<ProjectBlueprint | null> => {
      if (!selectedProject) return null;
      const sampleTasks: ProjectTaskDraft[] = tasks.map((t, idx) => ({
        phase: t.phase,
        title: t.title,
        description: t.description,
        startDate: t.startDate,
        endDate: t.endDate,
        progress: 0,
        status: 'pending',
        ownerName: t.ownerName,
        ownerRole: t.ownerRole,
        ownerContactId: t.ownerContactId,
        suppliers: t.suppliers || [],
        dependsOnTaskIds: [],
        isMilestone: t.isMilestone,
        estimatedCost: t.estimatedCost,
        order: idx + 1,
      }));

      const phases = Array.from(new Set(sampleTasks.map((t) => t.phase)));
      const bpData: Partial<ProjectBlueprint> & { name: string } = {
        name,
        description: description || selectedProject.description,
        category: category || selectedProject.tags?.[0] || 'תבנית מותאמת',
        defaultPhases: phases,
        sampleTasks,
        marketingTemplate: {
          headline: selectedProject.marketing?.headline,
          subheadline: selectedProject.marketing?.subheadline,
          ctaText: selectedProject.marketing?.ctaText,
        },
      };

      let saved: ProjectBlueprint;
      if (db) {
        saved = await fsSaveBlueprint(db, getScopedCollectionPath, bpData);
      } else {
        saved = {
          id: `bp_${Date.now()}`,
          name: bpData.name,
          description: bpData.description || '',
          category: bpData.category || 'תבנית מותאמת',
          defaultPhases: phases,
          sampleTasks,
          marketingTemplate: bpData.marketingTemplate,
          createdAt: new Date().toISOString(),
        };
      }

      setCustomBlueprints((prev) => [saved, ...prev]);
      return saved;
    },
    [db, getScopedCollectionPath, selectedProject, tasks]
  );

  // ============================================================================
  // Excel Import / Export
  // ============================================================================

  const importTasksFromExcel = useCallback(
    async (file: File, projectId?: string): Promise<ProjectImportResult> => {
      const targetProjectId = projectId ?? selectedProjectId;
      const targetProject = projectsRef.current.find((p) => p.id === targetProjectId);
      const parsed = await parseProjectTasksFromFile(file, targetProject?.startDate);

      if (targetProjectId && parsed.tasks.length > 0) {
        await batchCreateTasks(parsed.tasks, targetProjectId);
      }

      return parsed;
    },
    [selectedProjectId, batchCreateTasks]
  );

  const exportGanttToExcel = useCallback(
    (projectId?: string) => {
      const targetProject =
        projectsRef.current.find((p) => p.id === (projectId ?? selectedProjectId)) || selectedProject;
      if (!targetProject) return;
      exportProjectGanttToExcel(targetProject, tasksRef.current);
    },
    [selectedProjectId, selectedProject]
  );

  // ============================================================================
  // Cross-Module Sync
  // ============================================================================

  const syncMarketingAssets = useCallback(
    async (
      projectId?: string,
      options?: CreateProjectMarketingOptions
    ): Promise<CreateProjectMarketingResult> => {
      const targetProject =
        projectsRef.current.find((p) => p.id === (projectId ?? selectedProjectId)) || selectedProject;
      if (!targetProject) {
        return { success: false, warnings: ['לא נבחר פרויקט פעיל.'] };
      }

      try {
        setSyncLoading(true);
        const res = await createProjectMarketingAssets(getCapability, targetProject, options);
        if (res.success) {
          await updateProject(targetProject.id, {
            marketing: {
              ...targetProject.marketing,
              headline: options?.headline ?? targetProject.marketing?.headline,
              subheadline: options?.subheadline ?? targetProject.marketing?.subheadline,
              ctaText: options?.ctaText ?? targetProject.marketing?.ctaText,
              coverImageUrl: options?.coverImageUrl ?? targetProject.marketing?.coverImageUrl,
              formId: res.formId ?? targetProject.marketing?.formId,
              formTitle: res.formTitle ?? targetProject.marketing?.formTitle,
              landingPageId: res.landingPageId ?? targetProject.marketing?.landingPageId,
              landingPageSlug: res.landingPageSlug ?? targetProject.marketing?.landingPageSlug,
              landingPageUrl: res.landingPageUrl ?? targetProject.marketing?.landingPageUrl,
            },
          });
        }
        return res;
      } finally {
        setSyncLoading(false);
      }
    },
    [getCapability, selectedProjectId, selectedProject, updateProject]
  );

  const syncSupplierToCrm = useCallback(
    async (supplier: ProjectRoleAssignment, projectTitle?: string) => {
      return syncSupplierOrLeadToCrm(getCapability, {
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        role: supplier.role,
        isSupplier: supplier.isSupplier ?? true,
        projectTitle: projectTitle || selectedProject?.title,
      });
    },
    [getCapability, selectedProject?.title]
  );

  const linkCommunity = useCallback(
    async (projectId: string, groupId: string, groupName: string) => {
      const target = projectsRef.current.find((p) => p.id === projectId);
      await updateProject(projectId, {
        communityGroupId: groupId,
        communityGroupName: groupName,
        marketing: {
          registrationCount: target?.marketing?.registrationCount || 0,
          ...target?.marketing,
          syncedToCommunity: Boolean(groupId),
        },
      });
    },
    [updateProject]
  );

  const sendVendorReminder = useCallback(
    async (params: { phone?: string; email?: string; message: string; subject?: string }) => {
      return syncSendVendorReminder(getCapability, params);
    },
    [getCapability]
  );

  // ============================================================================
  // User-Triggered AI Actions
  // ============================================================================

  const runAiWorkplan = useCallback(
    async (brief: string, projectTitle?: string, startDate?: string) => {
      const title = projectTitle || selectedProject?.title || 'פרויקט חדש';
      const start = startDate || selectedProject?.startDate || new Date().toISOString().split('T')[0];
      const aiCap = getCapability<AiTextAssistantContract>('ai-assistant');

      try {
        setAiLoading(true);
        const res = await generateWorkplanFromBrief(brief, title, start, aiCap);
        if (res.suggestion) {
          setAiWorkplanSuggestion(res.suggestion);
        } else if (res.error) {
          setError(res.error);
        }
        return res;
      } finally {
        setAiLoading(false);
      }
    },
    [getCapability, selectedProject?.title, selectedProject?.startDate]
  );

  const applyAiWorkplan = useCallback(
    async (suggestion: AiWorkplanSuggestion, projectId?: string): Promise<ProjectTask[]> => {
      const targetId = projectId ?? selectedProjectId;
      const targetProject = projectsRef.current.find((p) => p.id === targetId);
      if (!targetId || !targetProject) return [];

      const baseStart = targetProject.startDate || new Date().toISOString().split('T')[0];
      const drafts: ProjectTaskDraft[] = (suggestion.tasks || []).map((t, idx) => {
        const start = addDaysIso(baseStart, Math.max(0, Number(t.offsetDays) || 0));
        const end = addDaysIso(start, Math.max(1, Number(t.durationDays) || 1));
        return {
          phase: t.phase || 'ייזום ותכנון',
          title: t.title,
          description: t.description || '',
          startDate: start,
          endDate: end,
          progress: 0,
          status: 'pending',
          ownerName: '',
          ownerRole: t.ownerRole || 'מנהל פרויקט',
          suppliers: t.supplierRole
            ? [{ name: t.supplierRole, role: t.supplierRole, isSupplier: true }]
            : [],
          dependsOnTaskIds: [],
          isMilestone: Boolean(t.isMilestone),
          estimatedCost: t.estimatedCost,
          order: tasksRef.current.length + idx + 1,
        };
      });

      const created = await batchCreateTasks(drafts, targetId);

      if (suggestion.marketing) {
        await updateProject(targetId, {
          marketing: {
            ...targetProject.marketing,
            registrationCount: targetProject.marketing?.registrationCount || 0,
            headline: suggestion.marketing.headline || targetProject.marketing?.headline,
            subheadline: suggestion.marketing.subheadline || targetProject.marketing?.subheadline,
            ctaText: suggestion.marketing.ctaText || targetProject.marketing?.ctaText,
          },
        });
      }

      return created;
    },
    [selectedProjectId, batchCreateTasks, updateProject]
  );

  const runAiRiskAnalysis = useCallback(
    async (projectId?: string) => {
      const targetProject =
        projectsRef.current.find((p) => p.id === (projectId ?? selectedProjectId)) || selectedProject;
      if (!targetProject) {
        return { error: 'לא נבחר פרויקט לניתוח סיכונים.' };
      }

      const aiCap = getCapability<AiTextAssistantContract>('ai-assistant');
      try {
        setAiLoading(true);
        const res = await analyzeGanttRisks(targetProject, tasksRef.current, aiCap);
        if (res.report) {
          setAiRiskReport(res.report);
        } else if (res.error) {
          setError(res.error);
        }
        return res;
      } finally {
        setAiLoading(false);
      }
    },
    [getCapability, selectedProjectId, selectedProject]
  );

  const runAiVendorBrief = useCallback(
    async (task: ProjectTask, supplierName: string, projectId?: string) => {
      const targetProject =
        projectsRef.current.find((p) => p.id === (projectId ?? selectedProjectId)) || selectedProject;
      if (!targetProject) {
        return { error: 'לא נבחר פרויקט פעיל.' };
      }

      const aiCap = getCapability<AiTextAssistantContract>('ai-assistant');
      try {
        setAiLoading(true);
        const res = await draftVendorBrief(targetProject, task, supplierName, aiCap);
        if (res.error) setError(res.error);
        return res;
      } finally {
        setAiLoading(false);
      }
    },
    [getCapability, selectedProjectId, selectedProject]
  );

  // ============================================================================
  // Register 'kos-projects' Capability
  // ============================================================================

  useEffect(() => {
    const contract: KosProjectsContract = {
      listProjects: async () => projectsRef.current,
      getProjectById: (id: string) => projectsRef.current.find((p) => p.id === id) || null,
      getProjectTasks: (projectId: string) =>
        tasksRef.current.filter((t) => t.projectId === projectId),
      selectProject: (projectId: string) => setSelectedProjectId(projectId),
      createProject,
    };

    registerCapability('kos-projects', contract);
    return () => {
      unregisterCapability('kos-projects');
    };
  }, [registerCapability, unregisterCapability, createProject]);

  // ============================================================================
  // EventBus Subscriptions: Form Submissions & KosAi Actions
  // ============================================================================

  useEffect(() => {
    const handleFormSubmission = async (payload: {
      formId?: string;
      data?: Record<string, any>;
      leadPayload?: any;
    }) => {
      const formId = payload?.formId;
      if (!formId) return;

      const matchedProject = projectsRef.current.find((p) => p.marketing?.formId === formId);
      if (!matchedProject) return;

      const nextCount = (matchedProject.marketing?.registrationCount || 0) + 1;
      await updateProject(matchedProject.id, {
        marketing: {
          ...matchedProject.marketing,
          registrationCount: nextCount,
        },
      });

      const leadData = payload.leadPayload || payload.data || {};
      const name = leadData.kosun_crm_name || leadData.conta_name || leadData.name || 'נרשם חדש';
      const phone = leadData.kosun_crm_phone || leadData.conta_phone || leadData.phone || '';
      const email = leadData.kosun_crm_email || leadData.email || '';

      const crmRes = await syncSupplierOrLeadToCrm(getCapability, {
        name,
        phone,
        email,
        isSupplier: false,
        projectTitle: matchedProject.title,
        communityName: matchedProject.communityGroupName,
        tags: ['נרשם פרויקט', matchedProject.title],
      });

      if (matchedProject.communityGroupId && crmRes.contactId) {
        await assignRegistrantToProjectCommunity(
          getCapability,
          crmRes.contactId,
          matchedProject.communityGroupId
        );
      }
    };

    const unsubSmartForm = eventBus.subscribe('smart_form:submitted', (evt) => {
      handleFormSubmission({
        formId: evt?.formId,
        data: evt?.data,
        leadPayload: evt?.leadPayload,
      });
    });

    const unsubForm = eventBus.subscribe('form:submitted', (evt) => {
      handleFormSubmission({
        formId: evt?.formId,
        data: evt?.data,
      });
    });

    const unsubKosai = eventBus.subscribe('kosai:action', async (evt: any) => {
      const action = evt?.action;
      if (
        action !== 'GENERATE_PROJECT_WORKPLAN' &&
        action !== 'GENERATE_MARKETING_BRIEF' &&
        action !== 'ANALYZE_GANTT_RISKS' &&
        action !== 'DRAFT_VENDOR_BRIEF'
      ) {
        return;
      }

      eventBus.publish('kosai:action_result', {
        action,
        success: true,
        message: 'מבצע פעולה במודול הפרויקטים...',
        pending: true,
      });

      try {
        if (action === 'GENERATE_PROJECT_WORKPLAN' || action === 'GENERATE_MARKETING_BRIEF') {
          const brief = evt?.payload?.brief || selectedProject?.description || 'תוכנית עבודה לפרויקט';
          const title = evt?.payload?.projectTitle || selectedProject?.title || 'פרויקט חדש';
          const startDate = evt?.payload?.startDate || selectedProject?.startDate;
          const res = await runAiWorkplan(brief, title, startDate);

          if (res.suggestion) {
            eventBus.publish('kosai:action_result', {
              action,
              success: true,
              affectedCount: res.suggestion.tasks.length,
              message: `נוצרה הצעת תוכנית עבודה עם ${res.suggestion.tasks.length} משימות ומסר שיווקי מוכן ליישום.`,
            });
          } else {
            eventBus.publish('kosai:action_result', {
              action,
              success: false,
              message: res.error || 'לא ניתן היה להפיק תוכנית עבודה.',
            });
          }
          return;
        }

        if (action === 'ANALYZE_GANTT_RISKS') {
          const res = await runAiRiskAnalysis(evt?.payload?.projectId);
          if (res.report) {
            eventBus.publish('kosai:action_result', {
              action,
              success: true,
              affectedCount: res.report.risks.length,
              message: `${res.report.summary} (זוהו ${res.report.risks.length} סיכונים).`,
            });
          } else {
            eventBus.publish('kosai:action_result', {
              action,
              success: false,
              message: res.error || 'ניתוח הסיכונים נכשל.',
            });
          }
          return;
        }

        if (action === 'DRAFT_VENDOR_BRIEF') {
          const taskId = evt?.payload?.taskId;
          const task = tasksRef.current.find((t) => t.id === taskId) || tasksRef.current[0];
          const supplierName =
            evt?.payload?.supplierName || task?.suppliers?.[0]?.name || 'ספק הפרויקט';

          if (!task) {
            eventBus.publish('kosai:action_result', {
              action,
              success: false,
              message: 'לא נמצאה משימה פעילה לניסוח בריף לספק.',
            });
            return;
          }

          const res = await runAiVendorBrief(task, supplierName, evt?.payload?.projectId);
          eventBus.publish('kosai:action_result', {
            action,
            success: Boolean(res.briefText),
            message: res.briefText || res.error || 'ניסוח הבריף לספק נכשל.',
          });
        }
      } catch (err: any) {
        eventBus.publish('kosai:action_result', {
          action,
          success: false,
          message: err?.message || 'אירעה שגיאה בביצוע הפעולה.',
        });
      }
    });

    return () => {
      unsubSmartForm();
      unsubForm();
      unsubKosai();
    };
  }, [
    getCapability,
    updateProject,
    selectedProject,
    runAiWorkplan,
    runAiRiskAnalysis,
    runAiVendorBrief,
  ]);

  const value: KosProjectsContextValue = {
    projects,
    selectedProjectId,
    selectedProject,
    setSelectedProjectId,
    activeTab,
    setActiveTab,
    tasks,
    blueprints,
    crmContacts,
    communities,
    loading,
    tasksLoading,
    aiLoading,
    syncLoading,
    error,
    clearError,
    aiWorkplanSuggestion,
    aiRiskReport,
    clearAiWorkplanSuggestion,
    refreshProjects,
    refreshTasks,
    refreshExternalData,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    batchCreateTasks,
    cloneFromBlueprint,
    saveCurrentProjectAsBlueprint,
    importTasksFromExcel,
    exportGanttToExcel,
    syncMarketingAssets,
    syncSupplierToCrm,
    linkCommunity,
    sendVendorReminder,
    runAiWorkplan,
    applyAiWorkplan,
    runAiRiskAnalysis,
    runAiVendorBrief,
  };

  return (
    <KosProjectsContext.Provider value={value}>
      {children}
    </KosProjectsContext.Provider>
  );
};

export function useKosProjectsContext(): KosProjectsContextValue {
  const ctx = useContext(KosProjectsContext);
  if (!ctx) {
    throw new Error('useKosProjectsContext must be used within a KosProjectsProvider');
  }
  return ctx;
}
