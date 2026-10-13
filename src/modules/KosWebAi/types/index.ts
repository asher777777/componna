export * from './pageBuilder.types';
export * from './sectionConfigs';

export type KesherDocumentType = 320 | 400 | 405 | number;

export interface MarketingIdea {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  targetObjective?: string;
  badge?: string;
}

export interface PageTemplateBlueprint {
  id: string;
  title: string;
  category: 'sales' | 'geo' | 'authority' | 'community' | 'campaign';
  description: string;
  badge: string;
  icon: string;
  sectionTypes: string[];
  config: import('./pageBuilder.types').PageBuilderConfig;
}

export interface GenerationStep {
  stepIndex: number;
  totalSteps: number;
  sectionType: import('./pageBuilder.types').SectionType;
  stepTitle: string;
  statusText: string;
  progressPercent: number;
}
