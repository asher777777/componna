/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 1: TypeScript Interfaces & Types
 */

export interface TargetAudience {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  recommendedModuleIds: string[];
  businessGoals: string[];
  defaultTone: string;
}

export interface ModuleActionDescriptor {
  id: string;
  label: string;
  description: string;
  iconName: string;
  targetRoute: string;
  actionType: 'navigate' | 'modal' | 'command';
  badge?: string;
}

export interface ModuleKpiDescriptor {
  id: string;
  label: string;
  collectionName: string;
  calculationType: 'count' | 'sum' | 'active_count' | 'latest_status';
  fieldToSum?: string;
  iconName: string;
  suffix?: string;
  prefix?: string;
  description: string;
}

export interface DynamicModuleCapability {
  moduleId: string;
  moduleName: string;
  description: string;
  route: string;
  collectionPrefix: string;
  iconName: string;
  category: 'marketing' | 'sales' | 'communication' | 'content' | 'operations' | 'system';
  primaryCollections: string[];
  actions: ModuleActionDescriptor[];
  kpis: ModuleKpiDescriptor[];
}

export type BentoWidgetSize = 'sm' | 'md' | 'lg' | 'full';

export interface DashboardWidget {
  id: string;
  type: 'kpi_metric' | 'quick_actions' | 'data_stream' | 'ai_advisor' | 'module_launcher';
  title: string;
  subtitle?: string;
  size: BentoWidgetSize;
  sourceModuleId?: string;
  iconName?: string;
  config: {
    collectionName?: string;
    calculation?: 'count' | 'sum' | 'active_count' | 'latest';
    field?: string;
    actions?: ModuleActionDescriptor[];
    statSuffix?: string;
    statPrefix?: string;
    aiRecommendation?: string;
    accentColor?: string;
    [key: string]: any;
  };
}

export interface GeneratedCustomDashboard {
  id: string;
  title: string;
  subtitle: string;
  targetAudienceId: string;
  targetAudienceName: string;
  tenantId: string;
  pairedSubdomain?: string;
  selectedModuleIds: string[];
  widgets: DashboardWidget[];
  aiAdvisor: {
    greeting: string;
    executiveSummary: string;
    recommendedActions: string[];
    audienceStrategy: string;
  };
  createdAt: string;
  updatedAt: string;
  isDefaultSubdomainDashboard?: boolean;
}

export interface GenerateDashboardAiRequest {
  audience: TargetAudience;
  selectedModules: DynamicModuleCapability[];
  customPrompt?: string;
  tenantId: string;
  model?: 'gemini-2.5-flash' | 'gemini-3.8-flash' | 'gemini-2.5-pro';
}

export interface SubdomainPairingRecord {
  subdomain: string;
  fullDomain: string;
  dashboardId: string;
  dashboardTitle: string;
  clientName: string;
  updatedAt: string;
}
