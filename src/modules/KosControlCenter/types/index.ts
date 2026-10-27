export type ControlCenterLayoutType =
  | 'bento'
  | 'matrix'
  | 'kpi'
  | 'pipeline'
  | 'mobile';

export type ModuleCategory =
  | 'marketing'   // שיווק, דפי נחיתה, טפסים, סטורפרונט
  | 'crm'         // קהילות, אנליטיקה, וואטסאפ
  | 'finance'     // סליקה, קשר, איזיקאונט
  | 'media'       // וידאו, גלריית מדיה, נגן זרימה
  | 'core';       // מיתוג DNA, מחבר DB, אימות, תבנית

export type PipelineStage =
  | 'attract'     // משיכה ושיווק
  | 'engage'      // שיחה וקהילה
  | 'monetize'    // סליקה ורכישה
  | 'produce'     // יצירת תוכן ומדיה
  | 'foundation'; // תשתיות והגדרות

export interface ModuleLiveStats {
  documentCount?: number;
  lastUpdated?: string;
  hasApiKey?: boolean;
  apiKeyName?: string;
  status: 'active' | 'ready' | 'needs_setup';
}

export interface ControlCenterModuleItem {
  id: string;
  name: string;
  shortTitle: string;
  description: string;
  route: string;
  category: ModuleCategory;
  categoryTitle: string;
  pipelineStage: PipelineStage;
  pipelineStageTitle: string;
  collectionName?: string;
  iconName: string;
  badge?: string;
  colorScheme: {
    from: string;
    to: string;
    border: string;
    text: string;
    glow: string;
    bgHover: string;
  };
  features: string[];
  capabilitiesNeeded?: string[];
  actionLabel?: string;
}

export interface LiveSystemMetrics {
  totalLeadsCount: number;
  totalPagesCount: number;
  totalFormsCount: number;
  totalTransactionsCount: number;
  totalMediaCount: number;
  totalGroupsCount: number;
  activeModulesCount: number;
  isLoading: boolean;
  lastSyncTime: string | null;
}
