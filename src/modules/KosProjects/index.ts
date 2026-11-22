import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { KosProjectsStandaloneView } from './StandaloneView';

// רישום רשמי ל-Capability Slot
registerCapabilityUI('kos-projects-view', KosProjectsStandaloneView);

export { KosProjectsStandaloneView } from './StandaloneView';
export { KosProjectsView } from './views/KosProjectsView';
export { KosProjectsProvider } from './context/KosProjectsContext';
export { useProjects } from './hooks/useProjects';
export type {
  ProjectRecord,
  ProjectTask,
  ProjectBlueprint,
  ProjectRoleAssignment,
  ProjectMarketingConfig,
  KosProjectsContract,
} from './types';
