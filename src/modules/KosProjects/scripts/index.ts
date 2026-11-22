/**
 * KosProjects - Blueprint Seeding & Validation Utilities
 */

import { Firestore } from 'firebase/firestore';
import { BUILT_IN_BLUEPRINTS } from '../config';
import { ProjectBlueprint, ProjectTaskDraft } from '../types';
import {
  listBlueprints,
  saveBlueprint,
  ScopedPathResolver,
} from '../services/projectsFirestoreService';

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

function addDays(baseIso: string, days: number): string {
  const dt = new Date(baseIso);
  if (Number.isNaN(dt.getTime())) return baseIso;
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().split('T')[0];
}

/**
 * Shift a blueprint's sample tasks relative to a new project's start date
 */
export function cloneBlueprintTasksForStartDate(
  blueprint: ProjectBlueprint,
  projectStartDate: string
): ProjectTaskDraft[] {
  const tasks = blueprint.sampleTasks || [];
  if (tasks.length === 0) return [];

  const earliestDate = tasks.reduce(
    (min, t) => (t.startDate && t.startDate < min ? t.startDate : min),
    tasks[0].startDate || projectStartDate
  );

  return tasks.map((task, idx) => {
    const startOffset = Math.max(0, daysBetween(earliestDate, task.startDate));
    const duration = Math.max(0, daysBetween(task.startDate, task.endDate));
    const shiftedStart = addDays(projectStartDate, startOffset);
    const shiftedEnd = addDays(shiftedStart, duration);

    return {
      ...task,
      startDate: shiftedStart,
      endDate: shiftedEnd,
      progress: 0,
      status: 'pending',
      order: task.order ?? idx + 1,
    };
  });
}

/**
 * Validate a blueprint structure before saving to Firestore
 */
export function validateProjectBlueprint(blueprint: Partial<ProjectBlueprint>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!blueprint.name || !blueprint.name.trim()) {
    errors.push('שם התבנית הוא שדה חובה.');
  }
  if (!Array.isArray(blueprint.sampleTasks) || blueprint.sampleTasks.length === 0) {
    errors.push('התבנית חייבת לכלול לפחות משימה אחת.');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Seed built-in blueprints into a tenant's Firestore collection if none exist yet
 */
export async function seedDefaultBlueprints(
  db: Firestore,
  getScopedCollectionPath: ScopedPathResolver
): Promise<ProjectBlueprint[]> {
  const existing = await listBlueprints(db, getScopedCollectionPath);
  if (existing.length > 0) return existing;

  const seeded: ProjectBlueprint[] = [];
  for (const bp of BUILT_IN_BLUEPRINTS) {
    const saved = await saveBlueprint(db, getScopedCollectionPath, bp);
    seeded.push(saved);
  }
  return seeded;
}
