/**
 * KosProjects - Tenant-Scoped Firestore CRUD Service
 * Enforces strict multi-tenant isolation via getScopedCollectionPath(SYSTEM_COLLECTIONS.*).
 */

import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import {
  ProjectBlueprint,
  ProjectRecord,
  ProjectTask,
  ProjectTaskDraft,
} from '../types';

export type ScopedPathResolver = (collectionName: string) => string;

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = stripUndefined(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// ============================================================================
// Projects CRUD
// ============================================================================

export async function listProjects(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver
): Promise<ProjectRecord[]> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECTS);
  const snapshot = await getDocs(collection(db, colPath));
  const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectRecord, 'id'>) }));
  return items.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
}

export async function createProject(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  data: Partial<ProjectRecord> & { title: string }
): Promise<ProjectRecord> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECTS);
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const id = data.id || generateId('proj');
  const record: ProjectRecord = {
    id,
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
    marketing: {
      registrationCount: 0,
      syncedToCommunity: Boolean(data.communityGroupId),
      ...data.marketing,
    },
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdAt: data.createdAt || now,
    updatedAt: now,
  };

  await setDoc(doc(db, colPath, id), stripUndefined(record));
  return record;
}

export async function updateProject(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  projectId: string,
  updates: Partial<ProjectRecord>
): Promise<void> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECTS);
  const payload = stripUndefined({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(doc(db, colPath, projectId), payload);
}

export async function deleteProject(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  projectId: string
): Promise<void> {
  const projectsPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECTS);
  const tasksPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECT_TASKS);

  // Delete all tasks associated with this project first
  const tasksQuery = query(collection(db, tasksPath), where('projectId', '==', projectId));
  const tasksSnap = await getDocs(tasksQuery);

  const batch = writeBatch(db);
  tasksSnap.docs.forEach((taskDoc) => {
    batch.delete(taskDoc.ref);
  });
  batch.delete(doc(db, projectsPath, projectId));
  await batch.commit();
}

// ============================================================================
// Project Tasks CRUD
// ============================================================================

export async function listProjectTasks(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  projectId: string
): Promise<ProjectTask[]> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECT_TASKS);
  const q = query(collection(db, colPath), where('projectId', '==', projectId));
  const snapshot = await getDocs(q);
  const tasks = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectTask, 'id'>) }));
  return tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.startDate.localeCompare(b.startDate));
}

export async function createProjectTask(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  projectId: string,
  task: Partial<ProjectTaskDraft> & { title: string }
): Promise<ProjectTask> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECT_TASKS);
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const id = generateId('task');

  const record: ProjectTask = {
    id,
    projectId,
    phase: task.phase || 'ייזום ותכנון',
    title: task.title.trim(),
    description: task.description || '',
    startDate: task.startDate || today,
    endDate: task.endDate || task.startDate || today,
    progress: typeof task.progress === 'number' ? Math.max(0, Math.min(100, task.progress)) : 0,
    status: task.status || 'pending',
    ownerName: task.ownerName || '',
    ownerRole: task.ownerRole || '',
    ownerContactId: task.ownerContactId,
    suppliers: Array.isArray(task.suppliers) ? task.suppliers : [],
    dependsOnTaskIds: Array.isArray(task.dependsOnTaskIds) ? task.dependsOnTaskIds : [],
    isMilestone: Boolean(task.isMilestone),
    estimatedCost: task.estimatedCost,
    order: typeof task.order === 'number' ? task.order : Date.now(),
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, colPath, id), stripUndefined(record));
  return record;
}

export async function updateProjectTask(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  taskId: string,
  updates: Partial<ProjectTask>
): Promise<void> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECT_TASKS);
  const payload = stripUndefined({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(doc(db, colPath, taskId), payload);
}

export async function deleteProjectTask(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  taskId: string
): Promise<void> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECT_TASKS);
  await deleteDoc(doc(db, colPath, taskId));
}

export async function batchCreateTasks(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  projectId: string,
  tasks: ProjectTaskDraft[]
): Promise<ProjectTask[]> {
  if (tasks.length === 0) return [];
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECT_TASKS);
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const batch = writeBatch(db);
  const created: ProjectTask[] = [];

  tasks.forEach((task, index) => {
    const id = generateId(`task_${index}`);
    const record: ProjectTask = {
      id,
      projectId,
      phase: task.phase || 'ייזום ותכנון',
      title: (task.title || `משימה ${index + 1}`).trim(),
      description: task.description || '',
      startDate: task.startDate || today,
      endDate: task.endDate || task.startDate || today,
      progress: typeof task.progress === 'number' ? Math.max(0, Math.min(100, task.progress)) : 0,
      status: task.status || 'pending',
      ownerName: task.ownerName || '',
      ownerRole: task.ownerRole || '',
      ownerContactId: task.ownerContactId,
      suppliers: Array.isArray(task.suppliers) ? task.suppliers : [],
      dependsOnTaskIds: Array.isArray(task.dependsOnTaskIds) ? task.dependsOnTaskIds : [],
      isMilestone: Boolean(task.isMilestone),
      estimatedCost: task.estimatedCost,
      order: typeof task.order === 'number' ? task.order : index + 1,
      createdAt: now,
      updatedAt: now,
    };

    created.push(record);
    batch.set(doc(db, colPath, id), stripUndefined(record));
  });

  await batch.commit();
  return created;
}

// ============================================================================
// Project Blueprints CRUD
// ============================================================================

export async function listBlueprints(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver
): Promise<ProjectBlueprint[]> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECT_BLUEPRINTS);
  const snapshot = await getDocs(collection(db, colPath));
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectBlueprint, 'id'>) }));
}

export async function saveBlueprint(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver,
  blueprint: Partial<ProjectBlueprint> & { name: string }
): Promise<ProjectBlueprint> {
  const colPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.PROJECT_BLUEPRINTS);
  const id = blueprint.id || generateId('bp');
  const record: ProjectBlueprint = {
    id,
    name: blueprint.name.trim(),
    description: blueprint.description || '',
    category: blueprint.category || 'כללי',
    defaultPhases: Array.isArray(blueprint.defaultPhases) ? blueprint.defaultPhases : [],
    sampleTasks: Array.isArray(blueprint.sampleTasks) ? blueprint.sampleTasks : [],
    marketingTemplate: blueprint.marketingTemplate,
    createdAt: blueprint.createdAt || new Date().toISOString(),
  };

  await setDoc(doc(db, colPath, id), stripUndefined(record), { merge: true });
  return record;
}
