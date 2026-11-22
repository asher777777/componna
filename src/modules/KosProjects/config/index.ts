/**
 * KosProjects - Module Configuration, Labels & Built-in 20-Project Blueprints Catalog
 */

import { ProjectStatus, TaskStatus } from '../types';
import { BLUEPRINT_SECTORS, PROJECTS_20_BLUEPRINTS } from './blueprintsCatalog';

export const MODULE_ID = 'KosProjects';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'בתכנון',
  active: 'פעיל',
  at_risk: 'בסיכון',
  completed: 'הושלם',
  archived: 'בארכיון',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'ממתין',
  in_progress: 'בביצוע',
  at_risk: 'עיכוב / סיכון',
  completed: 'הושלם',
};

export const DEFAULT_PHASES: string[] = [
  'ייזום ותכנון',
  'הפקה וספקים',
  'השקה ושיווק',
  'ביצוע ובקרה',
];

export { BLUEPRINT_SECTORS, PROJECTS_20_BLUEPRINTS };
export const BUILT_IN_BLUEPRINTS = PROJECTS_20_BLUEPRINTS;
