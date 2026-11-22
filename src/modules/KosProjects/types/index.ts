/**
 * KosProjects - Core Module Types (מבני נתונים לניהול פרויקטים, גאנט, שיווק וקהילה)
 */

export type ProjectStatus = 'planning' | 'active' | 'at_risk' | 'completed' | 'archived';

export type TaskStatus = 'pending' | 'in_progress' | 'at_risk' | 'completed';

export type ProjectViewTab = 'overview' | 'gantt' | 'marketing' | 'community' | 'ai';

export interface ProjectRoleAssignment {
  contactId?: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  isSupplier?: boolean;
  costEstimate?: number;
}

export interface ProjectMarketingConfig {
  landingPageId?: string;
  landingPageSlug?: string;
  landingPageUrl?: string;
  formId?: string;
  formTitle?: string;
  registrationCount: number;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  coverImageUrl?: string;
  syncedToCommunity?: boolean;
}

export interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  clientContactId?: string;
  clientName: string;
  status: ProjectStatus;
  startDate: string; // ISO YYYY-MM-DD
  targetEndDate: string; // ISO YYYY-MM-DD
  budget?: number;
  communityGroupId?: string;
  communityGroupName?: string;
  marketing: ProjectMarketingConfig;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  phase: string;
  title: string;
  description?: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  progress: number; // 0-100
  status: TaskStatus;
  ownerName: string;
  ownerRole: string;
  ownerContactId?: string;
  suppliers: ProjectRoleAssignment[];
  dependsOnTaskIds: string[];
  isMilestone?: boolean;
  estimatedCost?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectTaskDraft = Omit<ProjectTask, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>;

export interface ProjectBlueprint {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultPhases: string[];
  sampleTasks: ProjectTaskDraft[];
  marketingTemplate?: Partial<ProjectMarketingConfig>;
  createdAt: string;
}

export interface AiWorkplanMarketingSuggestion {
  headline: string;
  subheadline: string;
  ctaText: string;
  formFields: Array<{
    label: string;
    type: 'text' | 'tel' | 'email' | 'textarea' | 'select';
    required: boolean;
    map_to?: string;
    options?: string;
  }>;
}

export interface AiWorkplanTaskSuggestion {
  phase: string;
  title: string;
  description?: string;
  durationDays: number;
  offsetDays: number;
  ownerRole: string;
  supplierRole?: string;
  isMilestone?: boolean;
  estimatedCost?: number;
}

export interface AiWorkplanSuggestion {
  marketing: AiWorkplanMarketingSuggestion;
  tasks: AiWorkplanTaskSuggestion[];
  summary?: string;
}

export interface AiRiskItem {
  taskId?: string;
  taskTitle?: string;
  severity: 'high' | 'medium' | 'low';
  issue: string;
  recommendation: string;
}

export interface AiRiskReport {
  overallHealth: 'healthy' | 'attention' | 'critical';
  summary: string;
  risks: AiRiskItem[];
  nextActions: string[];
  generatedAt: string;
}

export interface ProjectImportResult {
  tasks: ProjectTaskDraft[];
  detectedPhases: string[];
  rowCount: number;
  warnings: string[];
}

export interface KosProjectsContract {
  listProjects: () => Promise<ProjectRecord[]>;
  getProjectById: (projectId: string) => ProjectRecord | null;
  getProjectTasks: (projectId: string) => ProjectTask[];
  selectProject: (projectId: string) => void;
  createProject: (data: Partial<ProjectRecord> & { title: string }) => Promise<ProjectRecord>;
}
