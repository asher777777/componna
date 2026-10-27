import { FirebaseApp } from 'firebase/app';
import { User } from 'firebase/auth';

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  userId?: string;
  status: 'active' | 'completed' | 'archived';
  aiSummary?: string;
}

export interface TemplateCollectionsConfig {
  items?: string;
  logs?: string;
}

export interface TemplateModuleConfig {
  firebaseApp?: FirebaseApp;
  collectionPrefix?: string;
  customCollections?: TemplateCollectionsConfig;
  currentUser?: User | null;
  functionsBaseUrl?: string;
  onNavigate?: (path: string) => void;
}

export interface AIPromptPayload {
  itemId: string;
  content: string;
  promptType?: 'summarize' | 'analyze' | 'generate_tasks';
}

export interface AIPromptResponse {
  success: boolean;
  result: string;
  error?: string;
}
